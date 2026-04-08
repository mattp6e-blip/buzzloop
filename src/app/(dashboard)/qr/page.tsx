import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QRDisplay } from './QRDisplay'
import { PrintTemplates } from './PrintTemplates'
import { CopyButton } from './CopyButton'
import { GoogleUrlBanner } from './GoogleUrlBanner'
import { CustomerJourney, QuestionsEditor } from './FlowPreview'

export default async function QRPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${business.slug}`
  const brandColor = business.brand_color ?? '#6366f1'

  return (
    <div className="p-8" style={{ maxWidth: 900 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Get Reviews</h1>
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>
          Share your QR code — customers leave a review in under 10 seconds.
        </p>
      </div>

      <GoogleUrlBanner googleConnected={!!business.google_connected} />

      {/* QR code + print tools */}
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

      {/* What happens after they scan */}
      <div className="mb-6">
        <CustomerJourney brandColor={brandColor} slug={business.slug} />
      </div>

      {/* Real questions — editable */}
      <div className="mb-8">
        <QuestionsEditor
          industry={business.industry}
          brandColor={brandColor}
          initialQuestions={business.custom_questions ?? null}
        />
      </div>

      {/* Tips */}
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

        <div className="mt-6 rounded-2xl border p-5 flex items-start gap-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="flex-shrink-0 rounded-2xl flex items-center justify-center" style={{ width: 56, height: 56, background: 'var(--bg2)' }}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect x="6" y="2" width="24" height="32" rx="4" fill="#1a1a1a" />
              <rect x="8" y="6" width="20" height="22" rx="2" fill="#25d366" />
              <circle cx="18" cy="31" r="2" fill="#444" />
              <ellipse cx="18" cy="17" rx="7" ry="5" fill="white" opacity="0.9" />
              <path d="M13 20 L12 23 L15 21" fill="white" opacity="0.9" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>Automated review requests via WhatsApp &amp; SMS</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg2)', color: 'var(--ink3)', border: '1px solid var(--border)' }}>
                Coming soon
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--ink3)' }}>
              After each visit, we&apos;ll automatically send your customer a personalised message asking for a review. No manual effort — just more reviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
