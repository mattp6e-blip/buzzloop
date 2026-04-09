import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GrowthHub } from './GrowthHub'
import type { Competitor } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  icon: string
  title: string
  why: string
  action: { label: string; href: string }
}

export interface HealthBreakdown {
  reviews: { earned: number; max: number }
  velocity: { earned: number; max: number }
  content: { earned: number; max: number }
  profile: { earned: number; max: number }
  outreach: { earned: number; max: number }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NOISE_TYPES = new Set([
  'establishment', 'point_of_interest', 'business', 'store', 'food',
  'premise', 'political', 'locality', 'sublocality', 'country',
  'administrative_area_level_1', 'administrative_area_level_2',
])

function getMeaningfulTypes(types: string[]): string[] {
  return types.filter(t => !NOISE_TYPES.has(t))
}

function computeHealthScore(params: {
  totalReviews: number
  thisWeekCount: number
  lastWeekCount: number
  daysSinceLastReview: number | null
  reelsCreated: number
  reelsPostedThisWeek: number
  instagramConnected: boolean
  googleConnected: boolean
  photosCount: number
  city: string | null
  brandLogoUrl: string | null
  brandExtracted: boolean
  outreachThisWeek: number
  outreachThisMonth: number
}): { total: number; breakdown: HealthBreakdown } {
  const {
    totalReviews, thisWeekCount, lastWeekCount, daysSinceLastReview,
    reelsCreated, reelsPostedThisWeek, instagramConnected, googleConnected,
    photosCount, city, brandLogoUrl, brandExtracted,
    outreachThisWeek, outreachThisMonth,
  } = params

  // Reviews (max 30)
  let reviewPts = 0
  if (totalReviews >= 100) reviewPts = 30
  else if (totalReviews >= 50) reviewPts = 25
  else if (totalReviews >= 25) reviewPts = 20
  else if (totalReviews >= 10) reviewPts = 15
  else if (totalReviews >= 5) reviewPts = 10
  else reviewPts = Math.round((totalReviews / 5) * 10)

  // Velocity (max 20)
  let velocityPts = 0
  if (daysSinceLastReview !== null && daysSinceLastReview >= 14) velocityPts = 0
  else if (thisWeekCount > lastWeekCount) velocityPts = 20
  else if (thisWeekCount === lastWeekCount && thisWeekCount > 0) velocityPts = 12
  else if (thisWeekCount < lastWeekCount - 2) velocityPts = 5
  else velocityPts = 10

  // Content (max 25)
  let contentPts = 0
  contentPts += Math.min(reelsCreated * 5, 15)
  if (instagramConnected) contentPts += 5
  if (reelsPostedThisWeek > 0) contentPts += 5

  // Profile completeness (max 15)
  let profilePts = 0
  if (googleConnected) profilePts += 5
  if (city) profilePts += 3
  if (brandLogoUrl) profilePts += 3
  if (brandExtracted) profilePts += 2
  if (instagramConnected) profilePts += 2

  // Outreach (max 10)
  let outreachPts = 0
  if (outreachThisWeek >= 3) outreachPts = 10
  else if (outreachThisMonth >= 5) outreachPts = 5

  const total = Math.min(reviewPts + velocityPts + contentPts + profilePts + outreachPts, 100)

  return {
    total,
    breakdown: {
      reviews: { earned: reviewPts, max: 30 },
      velocity: { earned: velocityPts, max: 20 },
      content: { earned: contentPts, max: 25 },
      profile: { earned: profilePts, max: 15 },
      outreach: { earned: outreachPts, max: 10 },
    },
  }
}

function generateTasks(params: {
  totalReviews: number
  recentWeekCount: number  // only last 7 days, no import spikes
  daysSinceLastReview: number | null
  reelsCreated: number
  outreachThisWeek: number
  googleConnected: boolean
  googleBusinessUrl: string | null
  competitors: Competitor[]
}): Task[] {
  const {
    totalReviews, recentWeekCount, daysSinceLastReview,
    reelsCreated, outreachThisWeek, googleConnected,
    googleBusinessUrl, competitors,
  } = params

  const tasks: Task[] = []

  // 1. CRITICAL: behind top competitor by more than 20 reviews
  if (competitors.length > 0) {
    const top = competitors.reduce((a, b) => a.review_count > b.review_count ? a : b)
    const gap = top.review_count - totalReviews
    if (gap > 20) {
      tasks.push({
        id: 'competitor_gap',
        priority: gap > 100 ? 'critical' : 'high',
        icon: '🏆',
        title: `${top.name} leads by ${gap} reviews — close the gap`,
        why: `More reviews = higher local pack ranking. At your current rate, closing this gap requires consistent weekly outreach.`,
        action: { label: 'Send review requests', href: '/qr?tab=messages' },
      })
    }
  }

  // 2. CRITICAL: no new reviews in 14+ days
  if (daysSinceLastReview !== null && daysSinceLastReview >= 14) {
    tasks.push({
      id: 'review_drought',
      priority: 'critical',
      icon: '⚠️',
      title: `No new reviews in ${daysSinceLastReview} days — ranking likely slipping`,
      why: `Google weights review recency heavily. Profiles that go quiet for 3–4 weeks drop in local search placement.`,
      action: { label: 'Get your QR code', href: '/qr' },
    })
  }

  // 3. HIGH: no review requests sent this week
  if (outreachThisWeek === 0) {
    tasks.push({
      id: 'send_outreach',
      priority: 'high',
      icon: '📲',
      title: `Send review requests to this week's customers`,
      why: `Businesses that ask consistently get 2–3× more reviews. Even 3–5 personalised messages per week makes a measurable difference.`,
      action: { label: 'Send messages', href: '/qr?tab=messages' },
    })
  }

  // 4. HIGH: GBP profile not optimised (connected but may have gaps)
  if (googleConnected) {
    tasks.push({
      id: 'optimise_profile',
      priority: 'high',
      icon: '🔧',
      title: `Optimise your GBP profile to rank for more searches`,
      why: `Missing keywords in your description and unlisted services mean you're invisible for searches your competitors appear in.`,
      action: { label: 'View optimisations', href: '/dashboard#insights' },
    })
  }

  // 5. HIGH: has reviews but no reel — drives profile visits
  if (totalReviews >= 2 && reelsCreated === 0) {
    tasks.push({
      id: 'first_reel',
      priority: 'high',
      icon: '🎬',
      title: `Turn your best review into a Reel`,
      why: `Social proof content drives 40% more GBP profile visits. You have ${totalReviews} reviews ready to use right now.`,
      action: { label: 'Create a Reel', href: '/reels' },
    })
  }

  // 6. MEDIUM: add photos directly to GBP (link to their profile, not Buzzloop library)
  if (googleBusinessUrl) {
    tasks.push({
      id: 'add_gbp_photos',
      priority: 'medium',
      icon: '📸',
      title: `Add fresh photos to your Google Business Profile`,
      why: `GBP profiles updated with photos in the last 30 days rank higher in the local pack. Aim for 1–2 new photos per week.`,
      action: { label: 'Open GBP profile', href: googleBusinessUrl },
    })
  }

  // 7. MEDIUM: low recent reviews despite no drought (gentle nudge)
  if (recentWeekCount === 0 && (daysSinceLastReview === null || daysSinceLastReview < 14)) {
    tasks.push({
      id: 'no_reviews_this_week',
      priority: 'medium',
      icon: '⭐',
      title: `No new reviews this week — remind recent customers`,
      why: `A steady stream of reviews (even 1–2 per week) signals an active business to Google's ranking algorithm.`,
      action: { label: 'Send QR code link', href: '/qr' },
    })
  }

  const ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
  return tasks.sort((a, b) => ORDER[a.priority] - ORDER[b.priority]).slice(0, 5)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Parallel data fetch
  const [reviewsRes, postsRes, competitorsRes] = await Promise.all([
    supabase
      .from('reviews')
      .select('star_rating, created_at, posted_to_google, remarkability_score')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('social_posts')
      .select('post_type, instagram_media_id, status, created_at')
      .eq('business_id', business.id),
    supabase
      .from('competitors')
      .select('*')
      .eq('business_id', business.id)
      .order('review_count', { ascending: false })
      .then(r => r, () => ({ data: null })), // graceful if table doesn't exist
  ])

  const allReviews = reviewsRes.data ?? []
  const allPosts = postsRes.data ?? []
  const competitors = (competitorsRes.data ?? []) as Competitor[]

  // Outreach count (table may not exist)
  let outreachThisWeek = 0
  let outreachThisMonth = 0
  try {
    const [weekRes, monthRes] = await Promise.all([
      supabase
        .from('outreach_messages')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .gte('created_at', weekAgo.toISOString()),
      supabase
        .from('outreach_messages')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .gte('created_at', monthAgo.toISOString()),
    ])
    outreachThisWeek = weekRes.count ?? 0
    outreachThisMonth = monthRes.count ?? 0
  } catch { /* table not yet created */ }

  // Review stats
  const totalReviews = allReviews.length
  const thisWeekReviews = allReviews.filter(r => new Date(r.created_at) >= weekAgo)
  const thisWeekCount = thisWeekReviews.length
  const lastWeekCount = allReviews.filter(r => {
    const d = new Date(r.created_at)
    return d >= twoWeeksAgo && d < weekAgo
  }).length

  const daysSinceLastReview = allReviews.length > 0
    ? Math.floor((now.getTime() - new Date(allReviews[0].created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Velocity label for chart
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonthCount = allReviews.filter(r => new Date(r.created_at) >= thisMonthStart).length
  const lastMonthCount = allReviews.filter(r => {
    const d = new Date(r.created_at)
    return d >= lastMonthStart && d < thisMonthStart
  }).length

  let velocityLabel: string | null = null
  if (lastMonthCount > 0 && thisMonthCount > 0) {
    const ratio = thisMonthCount / lastMonthCount
    if (ratio >= 1.5) velocityLabel = `↑ ${ratio.toFixed(1)}× vs last month`
    else if (thisMonthCount > lastMonthCount) velocityLabel = `↑ ${thisMonthCount - lastMonthCount} more than last month`
    else if (thisMonthCount < lastMonthCount) velocityLabel = `↓ ${lastMonthCount - thisMonthCount} fewer than last month`
  }

  // Reel stats
  const reelsCreated = allPosts.filter(p => p.post_type === 'reel').length
  const reelsPostedThisWeek = allPosts.filter(p =>
    p.post_type === 'reel' && p.instagram_media_id && new Date(p.created_at) >= weekAgo
  ).length
  const draftReels = allPosts.filter(p => p.post_type === 'reel' && !p.instagram_media_id && p.status === 'draft').length

  // Photos
  const photosCount = (business.uploaded_photos?.length ?? 0) + (business.gbp_photos?.length ?? 0)

  // Competitor stats
  const avgCompetitorReviews = competitors.length > 0
    ? Math.round(competitors.reduce((s, c) => s + c.review_count, 0) / competitors.length)
    : null

  // Health score
  const { total: healthScore, breakdown: healthBreakdown } = computeHealthScore({
    totalReviews,
    thisWeekCount,
    lastWeekCount,
    daysSinceLastReview,
    reelsCreated,
    reelsPostedThisWeek,
    instagramConnected: business.instagram_connected ?? false,
    googleConnected: business.google_connected ?? false,
    photosCount,
    city: business.city ?? null,
    brandLogoUrl: business.brand_logo_url ?? null,
    brandExtracted: business.brand_extracted ?? false,
    outreachThisWeek,
    outreachThisMonth,
  })

  // Tasks — use recentWeekCount (organic only) to avoid import spike false triggers
  const recentWeekCount = allReviews.filter(r => new Date(r.created_at) >= weekAgo).length
  const googleBusinessUrl = business.google_place_id
    ? `https://search.google.com/local/writereview?placeid=${business.google_place_id}`
    : null

  const tasks = generateTasks({
    totalReviews,
    recentWeekCount,
    daysSinceLastReview,
    reelsCreated,
    outreachThisWeek,
    googleConnected: business.google_connected ?? false,
    googleBusinessUrl,
    competitors,
  })

  const brandColor = business.brand_color ?? '#6366f1'

  return (
    <GrowthHub
      business={business}
      brandColor={brandColor}
      healthScore={healthScore}
      healthBreakdown={healthBreakdown}
      tasks={tasks}
      totalReviews={totalReviews}
      thisWeekCount={thisWeekCount}
      lastWeekCount={lastWeekCount}
      reelsCreated={reelsCreated}
      reelsPostedThisWeek={reelsPostedThisWeek}
      avgCompetitorReviews={avgCompetitorReviews}
      competitors={competitors}
      reviewDates={allReviews.map(r => r.created_at)}
      velocityLabel={velocityLabel}
      outreachThisWeek={outreachThisWeek}
    />
  )
}
