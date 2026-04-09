import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function extractSearchQuery(input: string): string {
  try {
    const url = new URL(input)
    if (url.hostname.includes('google.com') || url.hostname.includes('maps.app.goo.gl')) {
      // Extract business name from /maps/place/NAME/...
      const match = url.pathname.match(/\/place\/([^/@]+)/)
      if (match) return decodeURIComponent(match[1].replace(/\+/g, ' '))
    }
  } catch { /* not a URL, treat as plain text */ }
  return input
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    const { query } = await req.json() as { query: string }
    if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY_NOT_SET' }, { status: 503 })

    const searchQuery = extractSearchQuery(query.trim())

    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.types,places.photos',
      },
      body: JSON.stringify({ textQuery: searchQuery, maxResultCount: 1 }),
    })

    if (!searchRes.ok) {
      const err = await searchRes.text()
      console.error('Places API error:', err)
      return NextResponse.json({ error: 'Places API error — check GOOGLE_MAPS_API_KEY' }, { status: 502 })
    }

    const searchData = await searchRes.json()
    const place = searchData.places?.[0]

    if (!place) return NextResponse.json({ error: 'No business found. Try a more specific name or location.' }, { status: 404 })

    // Places API v1 returns id as bare Place ID string
    const placeId = place.id?.startsWith('places/') ? place.id.replace('places/', '') : (place.id ?? searchQuery)

    const { data: competitor, error } = await supabase
      .from('competitors')
      .upsert({
        business_id: business.id,
        google_place_id: placeId,
        name: place.displayName?.text ?? searchQuery,
        rating: place.rating ?? null,
        review_count: place.userRatingCount ?? 0,
        types: place.types ?? [],
        photo_count: place.photos?.length ?? 0,
        raw_data: place,
        last_synced_at: new Date().toISOString(),
      }, { onConflict: 'business_id,google_place_id' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ competitor })
  } catch (err) {
    console.error('Add competitor error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
