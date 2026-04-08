import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QRDisplay } from './QRDisplay'
import { PrintTemplates } from './PrintTemplates'
import { CopyButton } from './CopyButton'
import { GoogleUrlBanner } from './GoogleUrlBanner'
import { CustomerJourney, QuestionsEditor } from './FlowPreview'
import { TabBar } from './TabBar'
import { OutreachClient } from '../outreach/OutreachClient'

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

          <div>
            <div className="mb-5">
              <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>What&apos;s working for other businesses</h2>
              <p className="text-sm" style={{ color: 'var(--ink3)' }}>Real tips from Buzzloop customers on getting more reviews.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { quote: "We taped the card to the back of the payment terminal. Every single customer sees it right as they're tapping their card.", author: 'Marco', business: 'Barbershop, Milan', emoji: '✂️' },
                { quote: "I tell staff to say 'it takes 10 seconds' when they hand the card over. That one line doubled our scan rate.", author: 'Priya', business: 'Dental clinic, London', emoji: '🦷' },
                { quote: "We put a tent card on every table. After a good meal, people are happy — that's exactly when to ask.", author: 'Sofia', business: 'Restaurant, Barcelona', emoji: '🍽️' },
                { quote: "I print the pocket cards and keep them by the till. When someone says they loved it, I hand one over and ask in person.", author: 'James', business: 'Gym, Dublin', emoji: '💪' },
                { quote: "Put it near the exit, not the entrance. Customers leaving happy are the ones who'll actually leave a review.", author: 'Leila', business: 'Spa, Amsterdam', emoji: '🌿' },
                { quote: "We share the link in our WhatsApp status after busy weekends. Regulars who loved the service always click it.", author: 'Carlos', business: 'Cocktail bar, Madrid', emoji: '🍸' },
              ].map((tip, i) => (
                <div key={i} className="rounded-2xl border p-5 flex flex-col gap-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                  <p className="text-xl">{tip.emoji}</p>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--ink2)' }}>
                    &ldquo;{tip.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{tip.author}</p>
                    <p className="text-xs" style={{ color: 'var(--ink4)' }}>{tip.business}</p>
                  </div>
                </div>
              ))}
            </div>
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
