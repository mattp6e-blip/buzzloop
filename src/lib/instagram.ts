import { SupabaseClient } from '@supabase/supabase-js'

const GQL = 'https://graph.facebook.com/v18.0'

export async function getValidInstagramToken(
  supabase: SupabaseClient,
  businessId: string,
): Promise<string | null> {
  const { data: business } = await supabase
    .from('businesses')
    .select('instagram_access_token, instagram_token_expiry, instagram_connected')
    .eq('id', businessId)
    .single()

  if (!business?.instagram_connected || !business.instagram_access_token) return null

  const expiry = business.instagram_token_expiry ? new Date(business.instagram_token_expiry) : null
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  // Refresh if expired or expiring within 7 days
  if (!expiry || expiry < sevenDaysFromNow) {
    const res = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${business.instagram_access_token}`
    )
    const data = await res.json()

    if (data.access_token) {
      const newExpiry = new Date(Date.now() + (data.expires_in ?? 60 * 24 * 60 * 60) * 1000).toISOString()
      await supabase
        .from('businesses')
        .update({ instagram_access_token: data.access_token, instagram_token_expiry: newExpiry })
        .eq('id', businessId)
      return data.access_token
    }
  }

  return business.instagram_access_token
}

export interface InstagramInsights {
  plays: number
  reach: number
  likes: number
  comments: number
  shares: number
  saved: number
}

export async function fetchReelInsights(
  mediaId: string,
  token: string,
): Promise<InstagramInsights | null> {
  try {
    // Fetch media-level counts (likes, comments) + insights (plays, reach, shares, saved)
    const [mediaRes, insightsRes] = await Promise.all([
      fetch(`${GQL}/${mediaId}?fields=like_count,comments_count&access_token=${token}`),
      fetch(`${GQL}/${mediaId}/insights?metric=plays,reach,shares,saved&access_token=${token}`),
    ])

    const [mediaData, insightsData] = await Promise.all([
      mediaRes.json(),
      insightsRes.json(),
    ])

    if (mediaData.error || insightsData.error) return null

    const metric = (name: string) =>
      insightsData.data?.find((d: { name: string; values?: { value: number }[] }) => d.name === name)?.values?.[0]?.value ?? 0

    return {
      plays:    metric('plays'),
      reach:    metric('reach'),
      shares:   metric('shares'),
      saved:    metric('saved'),
      likes:    mediaData.like_count ?? 0,
      comments: mediaData.comments_count ?? 0,
    }
  } catch {
    return null
  }
}
