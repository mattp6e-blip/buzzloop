import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function extractSearchQuery(input: string): string {
  try {
    const url = new URL(input)
    if (url.hostname.includes('google.com') || url.hostname.includes('maps.app.goo.gl')) {
      const match = url.pathname.match(/\/place\/([^/@]+)/)
      if (match) return decodeURIComponent(match[1].replace(/\+/g, ' '))
    }
  } catch { /* not a URL */ }
  return input
}

async function placesRequest(path: string, body: object, apiKey: string) {
  const res = await fetch(`https://places.googleapis.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.rating',
        'places.userRatingCount',
        'places.types',
        'places.primaryType',
        'places.photos',
        'places.reviews',
        'places.location',
        'places.websiteUri',
      ].join(','),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Places API error: ${await res.text()}`)
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, industry')
      .eq('user_id', user.id)
      .single()
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY_NOT_SET' }, { status: 503 })

    const { url } = await req.json() as { url: string }
    if (!url?.trim()) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    const searchQuery = extractSearchQuery(url.trim())

    // Step 1: Find the user's own business on Google Maps
    const selfSearch = await placesRequest('places:searchText', {
      textQuery: searchQuery,
      maxResultCount: 1,
    }, apiKey)

    const selfPlace = selfSearch.places?.[0]
    if (!selfPlace) {
      return NextResponse.json({ error: 'Could not find your business on Google Maps. Try a more specific name + city.' }, { status: 404 })
    }

    const placeId = selfPlace.id?.startsWith('places/') ? selfPlace.id.replace('places/', '') : selfPlace.id
    const location = selfPlace.location // { latitude, longitude }

    if (!location) {
      return NextResponse.json({ error: 'Could not determine your business location.' }, { status: 422 })
    }

    // Step 2: Save the user's Place ID + location + website (if not already set)
    const websiteFromPlaces = selfPlace.websiteUri ?? null
    const businessUpdate: Record<string, unknown> = {
      google_place_id: placeId,
      google_place_location: { lat: location.latitude, lng: location.longitude },
    }
    if (websiteFromPlaces) businessUpdate.website_url = websiteFromPlaces

    await supabase
      .from('businesses')
      .update(businessUpdate)
      .eq('id', business.id)

    // Kick off brand extraction if we got a website URL from Places
    if (websiteFromPlaces) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/extract-brand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, websiteUrl: websiteFromPlaces }),
      }).catch(() => { /* non-critical */ })
    }

    // Step 3: searchNearby to auto-discover local competitors (who's ranking near them)
    const primaryType = selfPlace.primaryType ?? selfPlace.types?.[0] ?? 'point_of_interest'

    const nearbySearch = await placesRequest('places:searchNearby', {
      includedTypes: [primaryType],
      maxResultCount: 10,
      rankPreference: 'POPULARITY',
      locationRestriction: {
        circle: {
          center: { latitude: location.latitude, longitude: location.longitude },
          radius: 3000,
        },
      },
    }, apiKey)

    const competitors = (nearbySearch.places ?? []).filter(
      (p: { id?: string }) => {
        const id = p.id?.startsWith('places/') ? p.id.replace('places/', '') : p.id
        return id !== placeId
      }
    )

    // Step 4: Replace competitors in DB
    await supabase.from('competitors').delete().eq('business_id', business.id)

    if (competitors.length > 0) {
      const rows = competitors.map((p: {
        id?: string
        displayName?: { text?: string }
        rating?: number
        userRatingCount?: number
        types?: string[]
        photos?: unknown[]
        reviews?: Array<{ text?: { text?: string } }>
      }) => {
        const id = p.id?.startsWith('places/') ? p.id.replace('places/', '') : (p.id ?? '')
        const reviewTexts = (p.reviews ?? [])
          .map(r => r.text?.text ?? '')
          .filter(Boolean)
        return {
          business_id: business.id,
          google_place_id: id,
          name: p.displayName?.text ?? 'Unknown',
          rating: p.rating ?? null,
          review_count: p.userRatingCount ?? 0,
          types: p.types ?? [],
          photo_count: p.photos?.length ?? 0,
          raw_data: { ...p, _review_texts: reviewTexts },
          last_synced_at: new Date().toISOString(),
        }
      })

      await supabase.from('competitors').insert(rows)
    }

    return NextResponse.json({
      success: true,
      self: {
        placeId,
        name: selfPlace.displayName?.text,
        rating: selfPlace.rating,
        reviewCount: selfPlace.userRatingCount,
        types: selfPlace.types,
      },
      competitorsFound: competitors.length,
    })
  } catch (err) {
    console.error('Growth setup error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
