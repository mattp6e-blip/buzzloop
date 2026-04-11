import { SupabaseClient } from '@supabase/supabase-js'

interface GBPReview {
  name: string  // full resource name e.g. "accounts/123/locations/456/reviews/abc"
  starRating: string
  comment?: string
  reviewer?: { displayName?: string }
  createTime?: string
  reviewReply?: { comment?: string }  // present if owner has replied
}

interface GBPMediaItem {
  mediaFormat?: string
  googleUrl?: string
  thumbnailUrl?: string
  dimensions?: { widthPixels?: number; heightPixels?: number }
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  return data.access_token ?? null
}

async function fetchGBPPhotos(
  locationName: string,
  accessToken: string,
): Promise<string[]> {
  try {
    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/${locationName}/media?pageSize=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const data = await res.json()
    const items: GBPMediaItem[] = data.mediaItems ?? []

    return items
      .filter(item =>
        item.mediaFormat === 'PHOTO' &&
        item.googleUrl &&
        // Only use photos with width >= 800px (quality filter)
        (item.dimensions?.widthPixels ?? 0) >= 800
      )
      .map(item => {
        // Append high-res size param to Google CDN URLs (serves full 1600px instead of thumbnail)
        const url = item.googleUrl!
        return url.includes('googleusercontent.com') ? url.replace(/=s\d+[^&]*$/, '') + '=s1600' : url
      })
      .slice(0, 20) // cap at 20 photos
  } catch {
    return []
  }
}

export async function syncGoogleReviews(
  supabase: SupabaseClient,
  businessId: string,
): Promise<{ imported: number; total: number }> {
  const { data: business } = await supabase
    .from('businesses')
    .select('id, google_access_token, google_refresh_token, google_token_expiry, google_connected, google_location_id')
    .eq('id', businessId)
    .single()

  if (!business?.google_connected || !business.google_access_token) {
    return { imported: 0, total: 0 }
  }

  let accessToken = business.google_access_token

  // Refresh token if expired
  const expiry = business.google_token_expiry ? new Date(business.google_token_expiry) : null
  if (expiry && expiry < new Date() && business.google_refresh_token) {
    const newToken = await refreshAccessToken(business.google_refresh_token)
    if (newToken) {
      accessToken = newToken
      await supabase.from('businesses').update({ google_access_token: newToken }).eq('id', businessId)
    }
  }

  // Resolve location ID (cached or fresh lookup)
  let locationName = business.google_location_id as string | null

  if (!locationName) {
    const accountsRes = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const accountsData = await accountsRes.json()
    if (!accountsData.accounts?.length) return { imported: 0, total: 0 }

    const locationsRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountsData.accounts[0].name}/locations?readMask=name,title,metadata`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const locationsData = await locationsRes.json()
    if (!locationsData.locations?.length) return { imported: 0, total: 0 }

    const location = locationsData.locations[0]
    locationName = location.name as string
    const newReviewUri = location.metadata?.newReviewUri ?? null
    await supabase.from('businesses').update({
      google_location_id: locationName,
      ...(newReviewUri ? { google_business_url: newReviewUri } : {}),
    }).eq('id', businessId)
  }

  // Fetch GBP photos and reviews in parallel
  const [photos, allReviews] = await Promise.all([
    fetchGBPPhotos(locationName!, accessToken),
    (async () => {
      const reviews: GBPReview[] = []
      let pageToken: string | undefined
      do {
        const url = new URL(`https://mybusiness.googleapis.com/v4/${locationName}/reviews`)
        url.searchParams.set('pageSize', '50')
        if (pageToken) url.searchParams.set('pageToken', pageToken)
        const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } })
        const data = await res.json()
        if (data.reviews?.length) reviews.push(...data.reviews)
        pageToken = data.nextPageToken
      } while (pageToken && reviews.length < 200)
      return reviews
    })(),
  ])

  // Store photos if we got any
  if (photos.length > 0) {
    await supabase.from('businesses').update({ gbp_photos: photos }).eq('id', businessId)
  }

  const starMap: Record<string, number> = {
    ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
  }

  // All reviews with any text content
  const qualifying = allReviews.filter(r => r.comment && r.comment.trim().length > 0)

  await supabase.from('businesses').update({ last_gbp_sync_at: new Date().toISOString() }).eq('id', businessId)

  if (!qualifying.length) return { imported: 0, total: 0 }

  // Fetch existing reviews by gbp_review_id for upsert logic
  const { data: existing } = await supabase
    .from('reviews')
    .select('id, gbp_review_id, what_they_liked')
    .eq('business_id', businessId)

  const existingByGbpId = new Map(
    (existing ?? [])
      .filter((r: { gbp_review_id: string | null }) => r.gbp_review_id)
      .map((r: { id: string; gbp_review_id: string }) => [r.gbp_review_id, r.id])
  )
  const existingByText = new Set(
    (existing ?? []).map((r: { what_they_liked: string }) => r.what_they_liked)
  )

  const toInsert: object[] = []
  const toUpdate: { id: string; has_owner_reply: boolean }[] = []

  for (const r of qualifying) {
    const hasReply = !!r.reviewReply?.comment
    const starRating = starMap[r.starRating] ?? 3

    if (existingByGbpId.has(r.name)) {
      // Update reply status on existing record
      toUpdate.push({ id: existingByGbpId.get(r.name)!, has_owner_reply: hasReply })
    } else if (!existingByText.has(r.comment!)) {
      // New review — insert
      toInsert.push({
        business_id: businessId,
        star_rating: starRating,
        what_they_liked: r.comment!,
        customer_name: r.reviewer?.displayName ?? null,
        ai_draft: r.comment!,
        posted_to_google: true,
        has_owner_reply: hasReply,
        gbp_review_id: r.name,
        created_at: r.createTime ?? new Date().toISOString(),
      })
    }
  }

  if (toInsert.length > 0) {
    await supabase.from('reviews').insert(toInsert)
  }

  // Update reply status for existing records in batches
  for (const { id, has_owner_reply } of toUpdate) {
    await supabase.from('reviews').update({ has_owner_reply }).eq('id', id)
  }

  // Trigger remarkability scoring for new reviews (fire-and-forget, internal = no user auth needed)
  if (toInsert.length > 0 && process.env.NEXT_PUBLIC_APP_URL) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/score-reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, internal: true }),
    }).catch(() => {})
  }

  return { imported: toInsert.length, total: qualifying.length }
}
