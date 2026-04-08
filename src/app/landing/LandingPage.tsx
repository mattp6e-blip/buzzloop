'use client'
import { useEffect, useRef, useState } from 'react'
import { HeroDemo } from './HeroDemo'
import { BusinessReels } from './BusinessReels'

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
    { arrow: true },
    { display: `+${v2}%`, label: 'better Google ranking' },
    { arrow: true },
    { display: `${(v3 / 100).toFixed(2)}×`, label: 'more social reach' },
    { arrow: true },
    { display: `+${v4}%`, label: 'more revenue' },
  ]

  const statItems = stats.filter(s => !('arrow' in s))

  return (
    <section className="py-12 border-y" style={{ borderColor: 'var(--border)', background: 'white' }}>
      <style>{`.stat-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 16px; } @media(min-width: 640px) { .stat-bar { display: flex; align-items: center; justify-content: space-around; flex-wrap: nowrap; } .stat-arrow { display: flex !important; } }`}</style>
      <div ref={ref} className="stat-bar max-w-4xl mx-auto px-8">
        {statItems.map((s, i) => (
          <>
            <div key={s.label} className="text-center">
              <p style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, color: 'var(--accent)', marginBottom: 4, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.display}</p>
              <p className="text-sm" style={{ color: 'var(--ink4)' }}>{s.label}</p>
            </div>
            {i < statItems.length - 1 && (
              <span className="stat-arrow" key={`arrow-${i}`} style={{ display: 'none', color: 'var(--ink4)', fontSize: 18, fontWeight: 300 }}>→</span>
            )}
          </>
        ))}
      </div>
    </section>
  )
}

const HOW_STEPS = [
  {
    n: '01',
    title: 'Get reviews automatically — zero awkwardness',
    body: ['A branded QR code turns every happy customer into a 5-star Google review ', <strong key="k">in under 10 seconds.</strong>, ' No manual asking. No staff friction. Just reviews coming in.'],
    flywheel: false,
  },
  {
    n: '02',
    title: 'Rank higher on Google Maps',
    body: ['More recent reviews = ', <strong key="k">better Google ranking</strong>, ' = more customers finding you over competitors. Every new review is a direct signal to Google that your business is active and trusted.'],
    flywheel: false,
  },
  {
    n: '03',
    title: 'Turn your best reviews into Reels',
    body: ['AI reads your reviews, finds what makes people choose you, and turns it into ', <strong key="k">scroll-stopping video content</strong>, ' — branded, professional, ready to post.'],
    flywheel: false,
  },
  {
    n: '04',
    title: 'A growth loop that runs itself',
    body: ['More reviews improve your ranking. More ranking brings new customers. New customers leave reviews. Better content brings even more — ', <span key="bl" style={{ color: 'var(--accent)', fontWeight: 700 }}>Buzzloop</span>, ' keeps the loop spinning.'],
    flywheel: true,
  },
]

function HowItWorksStep({ step, index, total }: { step: typeof HOW_STEPS[0], index: number, total: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const isLast = index === total - 1

  return (
    <div ref={ref} style={{
      display: 'flex', gap: 32, paddingBottom: isLast ? 0 : 56,
      transition: 'opacity 0.4s ease',
      opacity: active ? 1 : 0.35,
    }}>
      {/* Stepper dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: active ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
          border: active ? 'none' : '1px solid rgba(255,255,255,0.12)',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800,
          boxShadow: active ? '0 4px 24px rgba(232,71,10,0.45)' : 'none',
          transition: 'all 0.4s ease',
        }}>{step.n}</div>
        {!isLast && (
          <div style={{
            width: 1, flex: 1, minHeight: 48, marginTop: 8,
            background: active ? 'linear-gradient(to bottom, var(--accent), rgba(255,255,255,0.08))' : 'rgba(255,255,255,0.08)',
            transition: 'background 0.4s ease',
          }} />
        )}
      </div>

      {/* Text */}
      <div style={{ paddingTop: 10 }}>
        <h3 style={{
          fontSize: '1.15rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em',
          color: active ? 'white' : 'rgba(255,255,255,0.5)',
          transition: 'color 0.4s ease',
        }}>
          {step.title}
        </h3>
        <p style={{
          fontSize: 14, lineHeight: 1.8,
          color: active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
          transition: 'color 0.4s ease',
        }}>
          {step.body}
        </p>
      </div>
    </div>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: '#1c1814' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>How it works</p>
        </div>
        <div>
          {HOW_STEPS.map((step, i) => (
            <HowItWorksStep key={step.n} step={step} index={i} total={HOW_STEPS.length} />
          ))}
        </div>
      </div>
    </section>
  )
}


export function LandingPage() {
  return (
    <div style={{ background: '#fafaf8', color: 'var(--ink)' }}>
      {/* ── Nav ─────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(250,250,248,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'var(--accent)' }}>⚡</div>
          <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>Buzzloop</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:opacity-70"
            style={{ color: 'var(--ink3)' }}>
            Log in
          </a>
          <a href="/signup" className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: 'var(--ink)' }}>
            Start free →
          </a>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────── */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-16 flex-wrap lg:flex-nowrap">

          {/* Left: copy */}
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
              ⚡ The review growth system for local businesses
            </div>

            <h1 className="font-bold mb-5" style={{ letterSpacing: '-0.03em', lineHeight: 1.08 }}>
              <span style={{ display: 'block', fontSize: 'clamp(2rem, 3.2vw, 3.2rem)', color: 'var(--ink)', marginBottom: 6, textWrap: 'balance' } as React.CSSProperties}>
                More Google reviews.
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(2rem, 3.2vw, 3.2rem)', color: 'var(--ink)', marginBottom: 6, textWrap: 'balance' } as React.CSSProperties}>
                Higher ranking.
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(2rem, 3.2vw, 3.2rem)', color: 'var(--accent)', textWrap: 'balance' } as React.CSSProperties}>
                More customers.
              </span>
            </h1>

            <p className="text-lg leading-relaxed mb-10"
              style={{ color: 'var(--ink3)', maxWidth: 480 }}>
              Most local businesses lose customers every day to competitors with more recent reviews — and never fix it because asking manually never sticks. Buzzloop makes it automatic.
            </p>

            <div className="flex items-center gap-3 flex-wrap mb-5">
              <a href="/signup"
                className="px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 24px rgba(232,71,10,0.35)' }}>
                Start for free today →
              </a>
              <a href="#how-it-works"
                className="px-8 py-4 rounded-2xl text-base font-semibold border transition-all hover:bg-white"
                style={{ borderColor: 'var(--border)', color: 'var(--ink3)', background: 'transparent' }}>
                See how it works
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span style={{ color: '#f59e0b', fontSize: 14, letterSpacing: 1 }}>★★★★★</span>
                <span className="text-sm font-medium" style={{ color: 'var(--ink3)' }}>Loved by <strong style={{ color: 'var(--ink2)' }}>4,000+</strong> local businesses</span>
              </div>
              <div className="flex items-center gap-6">
                <img src="/logo-harmonia.png" alt="Harmonia Dental" style={{ height: 64, opacity: 0.5, filter: 'grayscale(100%)', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                <img src="/logo-masvell.png" alt="Masvell" style={{ height: 36, opacity: 0.5, filter: 'grayscale(100%)', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                <img src="/logo-dermamedicum.webp" alt="DermaMedicum" style={{ height: 44, opacity: 0.4, filter: 'grayscale(100%)', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* Right: interactive demo */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 460 }}>
            <HeroDemo />
          </div>

        </div>
      </section>

      {/* ── Stats bar ───────────────────────────── */}
      <StatBar />

      {/* ── Urgency strip ───────────────────────── */}
      <section className="py-16 px-6" style={{ background: '#fafaf8' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-bold mb-6" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)', letterSpacing: '-0.025em', color: 'var(--ink)', lineHeight: 1.35 }}>
            87% of customers check Google before visiting a local business.{' '}
            <span style={{ color: 'var(--ink3)', fontWeight: 500 }}>45% only trust reviews from the last month.</span>
          </p>
          <p style={{ fontSize: 16, color: 'var(--ink3)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            Every week without a new review is a week your competitor — with fresher ones — is taking customers that should be yours.
          </p>
        </div>
      </section>

      <HowItWorks />

      <BusinessReels />

      {/* ── Testimonials ────────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#fafaf8' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>What they say</p>
            <h2 className="font-bold" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.025em', color: 'var(--ink)' }}>
              Why our customers love <span style={{ color: 'var(--accent)' }}>Buzzloop</span>
            </h2>
          </div>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[
              {
                quote: "Reviews were our biggest frustration for years. Now they come in automatically. And the Reels are the kind of content we could never have made ourselves.",
                name: 'Laura', business: 'Harmonia Dental', industry: 'Dental clinic', initial: 'L',
                color: '#00b0e0', logo: '/logo-harmonia.png', logoHeight: 48, logoBg: false,
                stat: '70 to 200 reviews in 2 months', offset: 0,
              },
              {
                quote: "In 6 weeks we tripled our Google reviews and our Instagram started actually bringing people through the door. For a restaurant, that's everything.",
                name: 'Carlos', business: 'Mas Vell', industry: 'Restaurant', initial: 'C',
                color: '#c0392b', logo: '/logo-masvell.png', logoHeight: 22, logoBg: false,
                stat: '3× more Google reviews in 6 weeks', offset: 0,
              },
              {
                quote: "Between patients, there's no time for marketing. We tried agencies but got average results. The educational content it creates actually brings in new patients.",
                name: 'Karla', business: 'DermaMedicum', industry: 'Dermatology clinic', initial: 'K',
                color: '#c2185b', logo: '/logo-dermamedicum.webp', logoHeight: 40, logoBg: true,
                stat: '2× more new patient bookings', offset: 0,
              },
            ].map(t => (
              <div key={t.name} style={{
                background: 'white', borderRadius: 20, padding: '28px 28px 24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column', gap: 20,
                transform: `translateY(${t.offset}px)`,
              }}>
                {/* Logo + stars row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <img
                    src={t.logo} alt={t.business}
                    style={{
                      height: t.logoHeight, objectFit: 'contain',
                      mixBlendMode: t.logoBg ? 'normal' : 'multiply',
                      borderRadius: t.logoBg ? 8 : 0,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#fbbc04', fontSize: 13 }}>★</span>)}
                  </div>
                </div>
                {/* Quote */}
                <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink2)', flex: 1, margin: 0 }}>
                  "{t.quote}"
                </p>
                {/* Stat */}
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', margin: 0 }}>↑ {t.stat}</p>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: t.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: 'white', fontWeight: 700,
                  }}>{t.initial}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--ink4)', margin: 0 }}>{t.business} · {t.industry}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────── */}
      <section className="py-24 px-6 text-center" style={{ background: 'var(--ink)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl mx-auto mb-8"
            style={{ background: 'var(--accent)' }}>⚡</div>
          <h2 className="font-bold mb-4 text-white"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.025em' }}>
            Start getting more Google reviews today
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Free to start. No credit card required. Set up in 5 minutes.
          </p>
          <a href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 32px rgba(232,71,10,0.5)' }}>
            Get started for free →
          </a>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="py-8 px-8 flex items-center justify-between border-t" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--ink)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
            style={{ background: 'var(--accent)' }}>⚡</div>
          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Buzzloop</span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} Buzzloop. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
