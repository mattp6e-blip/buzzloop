'use client'
import { useEffect, useRef, useState } from 'react'
import { HeroDemo } from './HeroDemo'
import { BusinessReels } from './BusinessReels'
import { ReviewFlowDemo } from './ReviewFlowDemo'
import { RankingDemo } from './RankingDemo'

const ACCENT = '#e8470a'
const INK = '#1a1814'
const INK3 = '#7a766e'
const INK4 = '#b0aca4'
const BORDER = '#e8e5df'

// ─── Animated stat counter ────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200, started = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!started) return
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * ease))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration])
  return value
}

function StatBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const v1 = useCountUp(3, 1000, started)
  const v2 = useCountUp(17, 1200, started)
  const v3 = useCountUp(225, 1400, started)
  const v4 = useCountUp(82, 1600, started)

  const stats = [
    { display: `${v1}×`, label: 'more Google reviews' },
    { display: `+${v2}%`, label: 'higher Google ranking' },
    { display: `${(v3 / 100).toFixed(2)}×`, label: 'more social reach' },
    { display: `+${v4}%`, label: 'more revenue' },
  ]

  return (
    <section className="py-12 border-y" style={{ borderColor: BORDER, background: 'white' }}>
      <style>{`.stat-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 28px 16px; } @media(min-width: 640px) { .stat-bar { display: flex; align-items: center; justify-content: space-around; } }`}</style>
      <div ref={ref} className="stat-bar max-w-4xl mx-auto px-8">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <p style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: ACCENT, marginBottom: 4, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.display}</p>
            <p className="text-sm" style={{ color: INK4 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Feature bullet ───────────────────────────────────────────────────────────

function Bullet({ title, body, dark }: { title: string; body: string; dark?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: dark ? 'rgba(232,71,10,0.18)' : `${ACCENT}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 2,
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: ACCENT }}>✓</span>
      </div>
      <div>
        <p style={{ fontWeight: 700, color: dark ? 'white' : INK, margin: '0 0 3px', fontSize: 14.5 }}>{title}</p>
        <p style={{ color: dark ? 'rgba(255,255,255,0.5)' : INK3, margin: 0, fontSize: 13, lineHeight: 1.65 }}>{body}</p>
      </div>
    </div>
  )
}

// ─── Section A: Get more reviews ─────────────────────────────────────────────

function SectionReviews() {
  return (
    <section style={{ background: 'white', padding: '100px 40px' }}>
      <style>{`
        .sec-reviews-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; max-width: 1100px; margin: 0 auto; }
        @media (max-width: 900px) { .sec-reviews-grid { grid-template-columns: 1fr; gap: 56px; } .sec-reviews-demo { order: -1; display: flex; justify-content: center; } }
      `}</style>
      <div className="sec-reviews-grid">
        {/* Copy */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Get more reviews</p>
          <h2 style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)', fontWeight: 900, color: INK, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            More 5-star reviews.<br />Without asking.
          </h2>
          <p style={{ fontSize: 16, color: INK3, lineHeight: 1.75, margin: '0 0 32px', maxWidth: 440 }}>
            Your branded QR code turns every happy customer into a Google reviewer in under 10 seconds. No staff awkwardness. No manual follow-up. Just reviews coming in.
          </p>
          <Bullet title="Branded QR code with your logo and colors" body="Print it, display it, embed it in receipts or follow-up messages." />
          <Bullet title="Customers answer 3 quick questions, we write their review" body="They don't have to think of what to write. Buzzloop drafts a polished review based on what they share." />
          <Bullet title="One tap to post on Google" body="No login, no copying text. Customers tap once and it's live." />
          <Bullet title="Track every review, reply in one click" body="All reviews in one place. We reply in your brand voice, in any language." />
          <a href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 14, fontWeight: 700, color: ACCENT, textDecoration: 'none' }}>
            Start collecting reviews free →
          </a>
        </div>

        {/* Demo */}
        <div className="sec-reviews-demo">
          <ReviewFlowDemo />
        </div>
      </div>
    </section>
  )
}

// ─── Section B: Google ranking ────────────────────────────────────────────────

function SectionRanking() {
  return (
    <section style={{ background: '#1c1814', padding: '100px 40px' }}>
      <style>{`
        .sec-rank-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; max-width: 1100px; margin: 0 auto; }
        @media (max-width: 900px) { .sec-rank-grid { grid-template-columns: 1fr; gap: 56px; } .sec-rank-demo { display: flex; justify-content: center; } }
      `}</style>
      <div className="sec-rank-grid">
        {/* Demo first on desktop */}
        <div className="sec-rank-demo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
          <RankingDemo />
        </div>

        {/* Copy */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Google ranking</p>
          <h2 style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)', fontWeight: 900, color: 'white', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            See exactly where<br />you rank, and climb.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: '0 0 32px', maxWidth: 440 }}>
            Track how you rank for the searches your customers actually use. See where you stand against nearby competitors. Buzzloop shows you what to fix and does the fixing for you.
          </p>
          <Bullet dark title="Track up to 10 local keywords" body="See your real Google Maps position for each search, updated daily." />
          <Bullet dark title="Monitor competitors side by side" body="Know instantly when you move above or below a nearby rival." />
          <Bullet dark title="GBP health score" body="Buzzloop scores your profile and flags exactly what's hurting your ranking." />
          <Bullet dark title="Profile optimizer" body="One click and Buzzloop rewrites your Google Business description to rank for more searches." />
          <a href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 14, fontWeight: 700, color: ACCENT, textDecoration: 'none' }}>
            Start tracking your ranking free →
          </a>
        </div>
      </div>
    </section>
  )
}


// ─── Main ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div style={{ background: '#fafaf8', color: INK }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid rgba(0,0,0,0.06)` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: ACCENT }}>⚡</div>
          <span className="font-bold text-sm" style={{ color: INK }}>Buzzloop</span>
        </div>
        <div className="flex items-center gap-2">
          <a href="/pricing" className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:opacity-70" style={{ color: INK3 }}>Pricing</a>
          <a href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:opacity-70" style={{ color: INK3 }}>Log in</a>
          <a href="/signup" className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90" style={{ background: INK }}>
            Start free →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-16 flex-wrap lg:flex-nowrap">

          {/* Copy */}
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
              style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }}>
              ⚡ The growth platform for local businesses
            </div>

            <h1 className="font-bold mb-5" style={{ letterSpacing: '-0.03em', lineHeight: 1.08 }}>
              <span style={{ display: 'block', fontSize: 'clamp(2rem, 3.2vw, 3.2rem)', color: INK, marginBottom: 6 } as React.CSSProperties}>
                More Google reviews.
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(2rem, 3.2vw, 3.2rem)', color: INK, marginBottom: 6 } as React.CSSProperties}>
                Higher ranking.
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(2rem, 3.2vw, 3.2rem)', color: ACCENT } as React.CSSProperties}>
                More customers.
              </span>
            </h1>

            <p className="text-lg leading-relaxed mb-10" style={{ color: INK3, maxWidth: 480 }}>
              Most local businesses are invisible online. Not enough reviews, a weak Google ranking, and no time for content. Buzzloop fixes all three, automatically.
            </p>

            <div className="flex items-center gap-3 flex-wrap mb-5">
              <a href="/signup"
                className="px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: ACCENT, boxShadow: '0 4px 24px rgba(232,71,10,0.35)' }}>
                Start for free today →
              </a>
              <a href="#reviews-section"
                className="px-8 py-4 rounded-2xl text-base font-semibold border transition-all hover:bg-white"
                style={{ borderColor: BORDER, color: INK3, background: 'transparent' }}>
                See how it works
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span style={{ color: '#f59e0b', fontSize: 14, letterSpacing: 1 }}>★★★★★</span>
                <span className="text-sm font-medium" style={{ color: INK3 }}>Loved by <strong style={{ color: '#3a3630' }}>4,000+</strong> local businesses</span>
              </div>
              <div className="flex items-center gap-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-harmonia.png" alt="Harmonia Dental" style={{ height: 64, opacity: 0.5, filter: 'grayscale(100%)', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-masvell.png" alt="Mas Vell" style={{ height: 36, opacity: 0.5, filter: 'grayscale(100%)', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-dermamedicum.webp" alt="DermaMedicum" style={{ height: 44, opacity: 0.4, filter: 'grayscale(100%)', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* Hero demo */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 460 }}>
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <StatBar />

      {/* Feature sections */}
      <div id="reviews-section">
        <SectionReviews />
      </div>
      <SectionRanking />
      <BusinessReels />

      {/* Testimonials */}
      <section className="py-24 px-6" style={{ background: '#fafaf8' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>What they say</p>
            <h2 className="font-bold" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.025em', color: INK }}>
              Why businesses choose <span style={{ color: ACCENT }}>Buzzloop</span>
            </h2>
          </div>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[
              {
                quote: "Reviews were our biggest frustration for years. Now they come in automatically. And the Social Clips are the kind of content we could never have made ourselves.",
                name: 'Laura', business: 'Harmonia Dental', industry: 'Dental clinic', initial: 'L',
                color: '#00b0e0', logo: '/logo-harmonia.png', logoHeight: 48, logoBg: false,
                stat: '70 to 200 reviews in 2 months',
              },
              {
                quote: "In 6 weeks we tripled our Google reviews and our Instagram started actually bringing people through the door. For a restaurant, that's everything.",
                name: 'Carlos', business: 'Mas Vell', industry: 'Restaurant', initial: 'C',
                color: '#c0392b', logo: '/logo-masvell.png', logoHeight: 22, logoBg: false,
                stat: '3x more Google reviews in 6 weeks',
              },
              {
                quote: "Between patients, there's no time for marketing. The educational content it creates actually brings in new patients who already trust us before they arrive.",
                name: 'Karla', business: 'DermaMedicum', industry: 'Dermatology clinic', initial: 'K',
                color: '#c2185b', logo: '/logo-dermamedicum.webp', logoHeight: 40, logoBg: true,
                stat: '2x more new patient bookings',
              },
            ].map(t => (
              <div key={t.name} style={{
                background: 'white', borderRadius: 20, padding: '28px 28px 24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.logo} alt={t.business} style={{ height: t.logoHeight, objectFit: 'contain', mixBlendMode: t.logoBg ? 'normal' : 'multiply', borderRadius: t.logoBg ? 8 : 0 }} />
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#fbbc04', fontSize: 13 }}>★</span>)}
                  </div>
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: '#3a3630', flex: 1, margin: 0 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: ACCENT, margin: 0 }}>↑ {t.stat}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4, borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white', fontWeight: 700 }}>
                    {t.initial}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: INK4, margin: 0 }}>{t.business} · {t.industry}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center" style={{ background: INK }}>
        <div className="max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl mx-auto mb-8" style={{ background: ACCENT }}>⚡</div>
          <h2 className="font-bold mb-4 text-white" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.025em' }}>
            Start growing your business today
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Free to start. No credit card. Set up in under 5 minutes.
          </p>
          <a href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: ACCENT, boxShadow: '0 4px 32px rgba(232,71,10,0.5)' }}>
            Get started for free →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 flex items-center justify-between border-t" style={{ borderColor: 'rgba(255,255,255,0.08)', background: INK }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs" style={{ background: ACCENT }}>⚡</div>
          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Buzzloop</span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} Buzzloop. All rights reserved.
        </p>
      </footer>

    </div>
  )
}
