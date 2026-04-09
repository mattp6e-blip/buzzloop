import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QRDisplay } from './QRDisplay'
import { PrintTemplates } from './PrintTemplates'
import { CopyButton } from './CopyButton'
import { GoogleUrlBanner } from './GoogleUrlBanner'
import { CustomerJourney, QuestionsEditor } from './FlowPreview'
import { TabBar } from './TabBar'
import { OutreachClient } from '../outreach/OutreachClient'
import { ReviewTrendChart } from '../dashboard/ReviewTrendChart'

export default async function QRPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const activeTab = tab === 'messages' ? 'messages' : 'qr'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  const reviewUrl = `${(process.env.NEXT_PUBLIC_APP_URL ?? '').trim()}/r/${business.slug}`
  const brandColor = business.brand_color ?? '#6366f1'

  // Fetch reviews for trend chart
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('created_at, star_rating')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  const reviewDates = (reviewsData ?? []).map(r => r.created_at)
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonthCount = reviewDates.filter(d => new Date(d) >= thisMonthStart).length
  const lastMonthCount = reviewDates.filter(d => { const dt = new Date(d); return dt >= lastMonthStart && dt < thisMonthStart }).length
  let velocityLabel: string | null = null
  if (lastMonthCount > 0 && thisMonthCount > 0) {
    const ratio = thisMonthCount / lastMonthCount
    if (ratio >= 1.5) velocityLabel = `↑ ${ratio.toFixed(1)}× vs last month`
    else if (thisMonthCount > lastMonthCount) velocityLabel = `↑ ${thisMonthCount - lastMonthCount} more than last month`
    else if (thisMonthCount < lastMonthCount) velocityLabel = `↓ ${lastMonthCount - thisMonthCount} fewer than last month`
  }

  // Fetch outreach stats (table may not exist yet — handle gracefully)
  let outreachStats = { sent: 0, clicked: 0, converted: 0 }
  try {
    const [sentRes, clickedRes, convertedRes] = await Promise.all([
      supabase.from('outreach_messages').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('status', 'sent'),
      supabase.from('outreach_messages').select('*', { count: 'exact', head: true }).eq('business_id', business.id).not('clicked_at', 'is', null),
      supabase.from('outreach_messages').select('*', { count: 'exact', head: true }).eq('business_id', business.id).not('converted_at', 'is', null),
    ])
    outreachStats = {
      sent: sentRes.count ?? 0,
      clicked: clickedRes.count ?? 0,
      converted: convertedRes.count ?? 0,
    }
  } catch { /* table not yet created */ }

  return (
    <div className="p-8" style={{ maxWidth: 900 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Get Reviews</h1>
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>
          Share your QR code or send personalised messages to get more Google reviews.
        </p>
      </div>

      <TabBar active={activeTab} />

      {activeTab === 'qr' ? (
        <>
          <GoogleUrlBanner googleConnected={!!business.google_connected} />

          <div className="grid grid-cols-2 gap-6 mb-6">
            <QRDisplay
              reviewUrl={reviewUrl}
              businessName={business.name}
              brandColor={brandColor}
              slug={business.slug}
            />
            <div className="flex flex-col gap-4">
              <PrintTemplates
                reviewUrl={reviewUrl}
                businessName={business.name}
                brandColor={brandColor}
              />
              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink)' }}>Share the link directly</p>
                <p className="text-xs mb-3" style={{ color: 'var(--ink3)' }}>
                  Send via WhatsApp, SMS, or email — works without scanning
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-mono truncate"
                    style={{ background: 'var(--bg)', color: 'var(--ink3)', border: '1px solid var(--border)' }}
                  >
                    {reviewUrl}
                  </div>
                  <CopyButton url={reviewUrl} brandColor={brandColor} />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <CustomerJourney brandColor={brandColor} slug={business.slug} />
          </div>

          <div className="mb-8">
            <QuestionsEditor
              industry={business.industry}
              brandColor={brandColor}
              initialQuestions={business.custom_questions ?? null}
            />
          </div>

          <div className="rounded-2xl border p-6 mb-6" style={{ background: 'white', borderColor: 'var(--border)' }}>
            <ReviewTrendChart reviewDates={reviewDates} brandColor={brandColor} velocityLabel={velocityLabel} />
          </div>

        </>
      ) : (
        <OutreachClient
          businessName={business.name}
          reviewUrl={reviewUrl}
          stats={outreachStats}
        />
      )}
    </div>
  )
}
