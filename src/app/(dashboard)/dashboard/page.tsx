import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoogleConnectBanner } from './GoogleConnectBanner'
import { WelcomeBanner } from './WelcomeBanner'
import { ReviewTrendChart } from './ReviewTrendChart'

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
  const qrReviews = allReviews.filter(r => !r.posted_to_google)
  const gbpImported = allReviews.filter(r => r.posted_to_google).length

  // Social posts
  const { data: posts } = await supabase
    .from('social_posts')
    .select('status, post_type, instagram_media_id, created_at')
    .eq('business_id', business.id)

  const allPosts = posts ?? []

  // Stats
  const totalReviews = allReviews.length

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const thisWeekCount = allReviews.filter(r => new Date(r.created_at) >= weekAgo).length
  const lastWeekCount = allReviews.filter(r => {
    const d = new Date(r.created_at); return d >= twoWeeksAgo && d < weekAgo
  }).length
  const weekDelta = thisWeekCount - lastWeekCount

  // Monthly velocity
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonthCount = allReviews.filter(r => new Date(r.created_at) >= thisMonthStart).length
  const lastMonthCount = allReviews.filter(r => {
    const d = new Date(r.created_at); return d >= lastMonthStart && d < thisMonthStart
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
  const reelsPosted = allPosts.filter(p => p.post_type === 'reel' && p.instagram_media_id).length

  const brandColor = business.brand_color ?? '#e8470a'

  return (
    <div className="p-8 max-w-5xl">
      <WelcomeBanner businessName={business.name} importedCount={gbpImported} brandColor={brandColor} />
      {!business.google_connected && <GoogleConnectBanner />}

      {/* Row 1 — 3 stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total reviews"
          value={String(totalReviews)}
          sub={totalReviews === 0
            ? 'No reviews yet'
            : qrReviews.length > 0
              ? `${qrReviews.length} via QR · ${gbpImported} from Google`
              : `${gbpImported} imported from Google`}
          accent
          brandColor={brandColor}
        />
        <StatCard
          label="New this week"
          value={String(thisWeekCount)}
          sub={weekDelta === 0
            ? 'Same as last week'
            : weekDelta > 0
              ? `↑ ${weekDelta} more than last week`
              : `↓ ${Math.abs(weekDelta)} fewer than last week`}
          up={weekDelta > 0}
          down={weekDelta < 0}
          brandColor={brandColor}
        />
        <StatCard
          label="Via QR code"
          value={String(qrReviews.length)}
          sub={qrReviews.length === 0 ? 'Share your QR to get started' : `${Math.round((qrReviews.length / Math.max(totalReviews, 1)) * 100)}% of all reviews`}
          brandColor={brandColor}
        />
      </div>

      {/* Row 2 — Review trend chart full width */}
      <div className="rounded-2xl border p-6 mb-6" style={{ background: 'white', borderColor: 'var(--border)' }}>
        <ReviewTrendChart
          reviewDates={allReviews.map(r => r.created_at)}
          brandColor={brandColor}
          velocityLabel={velocityLabel}
        />
      </div>

      {/* Row 3 — Reel performance strip */}
      <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink3)' }}>Reel performance</p>
          {reelsCreated > 0 && <a href="/reels" className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>View all →</a>}
        </div>
        <div className="grid grid-cols-4 gap-4">
          <ReelStat label="Created" value={reelsCreated} />
          <ReelStat label="Posted" value={reelsPosted} />
          <ReelStat
            label="Views"
            value={business.instagram_connected ? '—' : null}
            empty={!business.instagram_connected}
          />
          <ReelStat
            label="Likes"
            value={business.instagram_connected ? '—' : null}
            empty={!business.instagram_connected}
          />
        </div>
        {!business.instagram_connected && (
          <p className="text-xs mt-4 pt-4 border-t flex items-center gap-1.5" style={{ color: 'var(--ink4)', borderColor: 'var(--border)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F77737"/>
                  <stop offset="50%" stopColor="#E1306C"/>
                  <stop offset="100%" stopColor="#833AB4"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad)"/>
              <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
              <circle cx="17" cy="7" r="1.2" fill="white"/>
            </svg>
            <a href="/api/auth/instagram" style={{ color: 'var(--accent)', fontWeight: 600 }}>Connect Instagram</a> to track views and likes on your Reels.
          </p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, accent, brandColor, up, down }: {
  label: string
  value: string
  sub: string
  brandColor: string
  accent?: boolean
  up?: boolean
  down?: boolean
}) {
  return (
    <div className="rounded-2xl border p-5" style={{
      background: accent ? `${brandColor}10` : 'white',
      borderColor: accent ? `${brandColor}40` : 'var(--border)',
    }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accent ? brandColor : 'var(--ink3)' }}>
        {label}
      </p>
      <p className="text-3xl font-bold mb-1" style={{ color: accent ? brandColor : 'var(--ink)', fontFamily: 'Georgia, serif' }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: up ? '#16a34a' : down ? '#dc2626' : 'var(--ink4)' }}>
        {sub}
      </p>
    </div>
  )
}

function ReelStat({ label, value, empty }: { label: string; value: number | string | null; empty?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: empty ? 'var(--ink4)' : 'var(--ink)', fontFamily: 'Georgia, serif' }}>
        {value ?? '—'}
      </p>
    </div>
  )
}
