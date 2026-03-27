import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoogleConnectBanner } from './GoogleConnectBanner'
import { WelcomeBanner } from './WelcomeBanner'
import { ReviewTrendChart } from './ReviewTrendChart'
import { NextAction } from './NextAction'

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

  // All reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('star_rating, created_at, posted_to_google')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  const allReviews = reviews ?? []

  // Reviews collected via QR (not imported from GBP)
  const qrReviews = allReviews.filter(r => !r.posted_to_google)
  const gbpImported = allReviews.filter(r => r.posted_to_google).length

  // Social posts counts
  const { data: posts } = await supabase
    .from('social_posts')
    .select('status, post_type, instagram_media_id, created_at')
    .eq('business_id', business.id)

  const allPosts = posts ?? []

  // Compute stats
  const totalReviews = allReviews.length
  const avgRating = totalReviews
    ? (allReviews.reduce((s, r) => s + r.star_rating, 0) / totalReviews).toFixed(1)
    : '—'

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const thisWeekCount = allReviews.filter(r => new Date(r.created_at) >= weekAgo).length
  const lastWeekCount = allReviews.filter(r => {
    const d = new Date(r.created_at); return d >= twoWeeksAgo && d < weekAgo
  }).length
  const weekDelta = thisWeekCount - lastWeekCount

  // Rating distribution (1–5)
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    stars: n,
    count: allReviews.filter(r => r.star_rating === n).length,
  }))
  const maxDist = Math.max(...ratingDist.map(d => d.count), 1)

  // Content stats
  const totalContent = allPosts.length
  const publishedIG = allPosts.filter(p => p.instagram_media_id).length
  const reelsCreated = allPosts.filter(p => p.post_type === 'reel').length
  const drafts = allPosts.filter(p => p.status === 'draft').length

  const brandColor = business.brand_color ?? '#e8470a'

  const lastReview = allReviews[0]
  const daysSinceLastReview = lastReview
    ? Math.floor((Date.now() - new Date(lastReview.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
          {business.name}
        </h1>
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>
          Your growth loop at a glance
        </p>
      </div>

      <WelcomeBanner businessName={business.name} importedCount={gbpImported} brandColor={brandColor} />
      {!business.google_connected && <GoogleConnectBanner />}

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total reviews"
          value={String(totalReviews)}
          sub={qrReviews.length > 0 ? `${qrReviews.length} via QR · ${gbpImported} from Google` : gbpImported > 0 ? `${gbpImported} imported from Google` : 'No reviews yet'}
          icon="★"
          brandColor={brandColor}
          accent
        />
        <StatCard
          label="This week"
          value={String(thisWeekCount)}
          sub={weekDelta === 0
            ? 'same as last week'
            : weekDelta > 0
              ? `↑ ${weekDelta} more than last week`
              : `↓ ${Math.abs(weekDelta)} fewer than last week`}
          icon="📈"
          brandColor={brandColor}
          up={weekDelta > 0}
          down={weekDelta < 0}
        />
        <StatCard
          label="Avg rating"
          value={String(avgRating)}
          sub={totalReviews > 0 ? `★ out of 5.0` : 'No reviews yet'}
          icon="✦"
          brandColor={brandColor}
        />
        <StatCard
          label="Content created"
          value={String(totalContent)}
          sub={`${reelsCreated} reels · ${drafts} drafts`}
          icon="🎬"
          brandColor={brandColor}
        />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Review trend chart */}
        <div className="col-span-2 rounded-2xl border p-6" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <ReviewTrendChart
            reviewDates={allReviews.map(r => r.created_at)}
            brandColor={brandColor}
          />
        </div>

        {/* Rating distribution */}
        <div className="rounded-2xl border p-6" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--ink3)' }}>Rating breakdown</p>
          {totalReviews === 0 ? (
            <div className="flex items-center justify-center h-[80px]">
              <p className="text-sm" style={{ color: 'var(--ink4)' }}>No data yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {ratingDist.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs w-6 text-right font-bold" style={{ color: 'var(--ink3)' }}>{stars}★</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: 'var(--bg)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(count / maxDist) * 100}%`, background: stars >= 4 ? brandColor : stars === 3 ? '#f59e0b' : '#ef4444' }}
                    />
                  </div>
                  <span className="text-xs w-5" style={{ color: 'var(--ink4)' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
          {totalReviews > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <span className="text-2xl font-bold" style={{ color: brandColor, fontFamily: 'Georgia, serif' }}>{avgRating}</span>
              <div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ color: parseFloat(String(avgRating)) >= n ? '#f59e0b' : '#e5e7eb', fontSize: 12 }}>★</span>
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--ink4)' }}>avg from {totalReviews} reviews</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <NextAction
        totalReviews={totalReviews}
        reelsCreated={reelsCreated}
        drafts={drafts}
        instagramConnected={business.instagram_connected ?? false}
        daysSinceLastReview={daysSinceLastReview}
        brandColor={brandColor}
      />

      {/* Instagram connect + quick actions */}
      <div className="grid grid-cols-2 gap-4">
        {!business.instagram_connected && (
          <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ borderColor: '#c7d2fe', background: '#eef2ff' }}>
            <span className="text-3xl flex-shrink-0">📸</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold mb-0.5" style={{ color: '#3730a3' }}>Connect Instagram</p>
              <p className="text-xs" style={{ color: '#6366f1' }}>Post Reels directly from ReviewSpark with one click.</p>
            </div>
            <a href="/api/auth/instagram" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#6366f1' }}>
              Connect →
            </a>
          </div>
        )}
        {business.instagram_connected && (
          <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ borderColor: 'var(--green-border)', background: 'var(--green-bg)' }}>
            <span className="text-3xl flex-shrink-0">📸</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--green)' }}>Instagram connected</p>
              <p className="text-xs" style={{ color: 'var(--ink3)' }}>{publishedIG} reel{publishedIG !== 1 ? 's' : ''} published via ReviewSpark</p>
            </div>
            <a href="/content" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border" style={{ borderColor: 'var(--green-border)', color: 'var(--green)' }}>
              View content →
            </a>
          </div>
        )}
        <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ borderColor: 'var(--border)', background: 'white' }}>
          <span className="text-3xl flex-shrink-0">▶</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--ink)' }}>
              {reelsCreated === 0 ? 'Create your first Reel' : `${reelsCreated} reel${reelsCreated !== 1 ? 's' : ''} in library`}
            </p>
            <p className="text-xs" style={{ color: 'var(--ink3)' }}>AI turns your reviews into cinematic 9:16 video</p>
          </div>
          <a href="/reels" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: brandColor }}>
            {reelsCreated === 0 ? 'Create →' : 'View →'}
          </a>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, brandColor, accent, up, down }: {
  label: string
  value: string
  sub: string
  icon: string
  brandColor: string
  accent?: boolean
  up?: boolean
  down?: boolean
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: accent ? `${brandColor}10` : 'white',
        borderColor: accent ? `${brandColor}40` : 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent ? brandColor : 'var(--ink3)' }}>
          {label}
        </span>
        <span className="text-base">{icon}</span>
      </div>
      <div className="text-3xl font-bold mb-1" style={{ color: accent ? brandColor : 'var(--ink)', fontFamily: 'Georgia, serif' }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: up ? '#16a34a' : down ? '#dc2626' : 'var(--ink4)' }}>
        {sub}
      </div>
    </div>
  )
}
