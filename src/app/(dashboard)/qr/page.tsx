import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QRDisplay } from './QRDisplay'
import { PrintTemplates } from './PrintTemplates'
import { CopyButton } from './CopyButton'
import { GoogleUrlBanner } from './GoogleUrlBanner'


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
    <div className="p-8" style={{ maxWidth: 1100 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Your QR Code</h1>
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>
          Print it, place it, and let customers do the rest.
        </p>
      </div>

      <GoogleUrlBanner
        businessId={business.id}
        googleConnected={!!business.google_connected}
        hasReviewUrl={!!business.google_business_url}
      />

      {/* Top section — QR + templates side by side */}
      <div className="grid grid-cols-2 gap-6 mb-8">
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

          {/* Review link */}
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

      {/* Where customers place it */}
      <div>
        <div className="mb-5">
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--ink)' }}>
            Where Buzzloop customers are placing their QR codes
          </h2>
          <p className="text-sm" style={{ color: 'var(--ink3)' }}>
            Real businesses, real placements. The more visible, the more reviews.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { src: '/placements/hotel-reception.png', label: 'Hotel reception desk' },
            { src: '/placements/restaurant-bathroom.png', label: 'Restaurant bathroom' },
            { src: '/placements/cocktail-bar.png', label: 'Cocktail bar' },
          ].map(p => (
            <div key={p.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.label} className="w-full block rounded-2xl" style={{ maxHeight: 260, objectFit: 'scale-down' }} />
              <p className="text-sm font-semibold mt-2 text-center" style={{ color: 'var(--ink)' }}>{p.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs mt-4 text-center" style={{ color: 'var(--ink4)' }}>
          Using Buzzloop in a creative spot? We&apos;d love to feature it —{' '}
          <a href="mailto:hello@buzzloop.co" className="underline hover:opacity-70" style={{ color: 'var(--ink3)' }}>
            send us a photo
          </a>
        </p>

        {/* Coming soon — SMS/WhatsApp */}
        <div
          className="mt-6 rounded-2xl border p-5 flex items-center gap-4"
          style={{ borderColor: `${brandColor}30`, background: `${brandColor}08` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${brandColor}15` }}
          >
            📱
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>Automated review requests via WhatsApp & SMS</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: brandColor, color: 'white' }}>
                Coming soon
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--ink3)' }}>
              Enter a customer&apos;s number and we&apos;ll send them a personalised message asking for a review — automatically after each visit.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

