import { ReelDemos } from './ReelDemos'
import { HeroDemo } from './HeroDemo'

const QR_BUSINESSES = [
  {
    label: 'Restaurant',
    location: 'On the wall by the urinals',
    message: 'Leave us a review\nwhile you wait 😄',
    photo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80',
    color: '#e8470a',
    rotate: '-2deg',
  },
  {
    label: 'Gym',
    location: 'Next to the water fountain',
    message: 'Just crushed it?\nLeave us a review ⭐',
    photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    color: '#2563eb',
    rotate: '1.5deg',
  },
  {
    label: 'Dental clinic',
    location: 'On the ceiling above the chair',
    message: 'Since you\'re already\nstaring up here… ⭐',
    photo: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=600&q=80',
    color: '#0891b2',
    rotate: '-1deg',
  },
  {
    label: 'Salon',
    location: 'Taped to the mirror',
    message: 'Love your new look?\nTell the world 💇',
    photo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    color: '#7c3aed',
    rotate: '2deg',
  },
]

function QrSvg({ color, size = 56 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top-left finder */}
      <rect x="2" y="2" width="18" height="18" rx="3" fill={color} />
      <rect x="5" y="5" width="12" height="12" rx="2" fill="white" />
      <rect x="8" y="8" width="6" height="6" rx="1" fill={color} />
      {/* Top-right finder */}
      <rect x="32" y="2" width="18" height="18" rx="3" fill={color} />
      <rect x="35" y="5" width="12" height="12" rx="2" fill="white" />
      <rect x="38" y="8" width="6" height="6" rx="1" fill={color} />
      {/* Bottom-left finder */}
      <rect x="2" y="32" width="18" height="18" rx="3" fill={color} />
      <rect x="5" y="35" width="12" height="12" rx="2" fill="white" />
      <rect x="8" y="38" width="6" height="6" rx="1" fill={color} />
      {/* Data dots */}
      <rect x="32" y="32" width="5" height="5" rx="1" fill={color} />
      <rect x="39" y="32" width="5" height="5" rx="1" fill={color} />
      <rect x="46" y="32" width="5" height="5" rx="1" fill={color} />
      <rect x="32" y="39" width="5" height="5" rx="1" fill={color} />
      <rect x="46" y="39" width="5" height="5" rx="1" fill={color} />
      <rect x="39" y="46" width="5" height="5" rx="1" fill={color} />
      <rect x="46" y="46" width="5" height="5" rx="1" fill={color} />
      <rect x="32" y="46" width="5" height="5" rx="1" fill={color} />
    </svg>
  )
}

function ReviewSign({ message, color, rotate }: { message: string; color: string; rotate: string }) {
  const lines = message.split('\n')
  return (
    <div
      style={{
        transform: `rotate(${rotate})`,
        background: 'white',
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
        width: 160,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Message */}
      <div style={{ textAlign: 'center' }}>
        {lines.map((line, i) => (
          <p key={i} style={{ fontSize: 11, fontWeight: 700, color: '#1a1814', lineHeight: 1.4, margin: 0 }}>{line}</p>
        ))}
      </div>
      {/* QR code */}
      <QrSvg color={color} size={64} />
      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 7, color: 'white', fontWeight: 900 }}>⚡</span>
        </div>
        <p style={{ fontSize: 8, color: '#b0aca4', margin: 0, fontWeight: 600 }}>Scan to leave a review</p>
      </div>
    </div>
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
              ⚡ Turn local reviews into local customers
            </div>

            <h1 className="font-bold mb-5" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              <span style={{ display: 'block', fontSize: 'clamp(1.8rem, 2.8vw, 2.8rem)', color: 'var(--ink)', marginBottom: 8 }}>
                Your 5-star Google reviews are a goldmine.
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(1.2rem, 1.9vw, 1.9rem)', color: 'var(--ink)', fontWeight: 600, opacity: 0.85 }}>
                We turn them into{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #833AB4 0%, #E1306C 50%, #F77737 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 800,
                }}>Reels</span>
                {' '}that bring you more customers.
              </span>
            </h1>

            <p className="text-lg leading-relaxed mb-10"
              style={{ color: 'var(--ink3)', maxWidth: 480 }}>
              Your happiest customers already wrote your best ads. You're just not using them yet.
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
            <div className="flex items-center gap-2">
              <span style={{ color: '#f59e0b', fontSize: 14, letterSpacing: 1 }}>★★★★★</span>
              <span className="text-sm font-medium" style={{ color: 'var(--ink3)' }}>Loved by <strong style={{ color: 'var(--ink2)' }}>4,000+</strong> local businesses</span>
            </div>
          </div>

          {/* Right: interactive demo */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 460 }}>
            <HeroDemo />
          </div>

        </div>
      </section>

      {/* ── Stats bar ───────────────────────────── */}
      <section className="py-8 border-y" style={{ borderColor: 'var(--border)', background: 'white' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-around flex-wrap gap-6 px-8">
          {[
            { n: '< 10s', label: 'to leave a review' },
            { n: '4.8★', label: 'avg rating for customers' },
            { n: '3×', label: 'more reviews per month' },
            { n: '0', label: 'setup cost' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--ink)', fontFamily: 'Georgia, serif' }}>{s.n}</p>
              <p className="text-xs" style={{ color: 'var(--ink4)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── QR in the wild ──────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
              QR Code
            </p>
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.025em', color: 'var(--ink)' }}>
              Your QR code,<br />everywhere customers are
            </h2>
            <p className="text-base max-w-md mx-auto" style={{ color: 'var(--ink3)' }}>
              Place it on tables, counters, receipts, mirrors. Customers scan, review in under 10 seconds, and you get a 5-star Google review.
            </p>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {QR_BUSINESSES.map((b) => (
              <div key={b.label} className="flex flex-col gap-3">
                <div className="relative rounded-2xl overflow-hidden group" style={{ aspectRatio: '3/4' }}>
                  {/* Photo */}
                  <img
                    src={b.photo}
                    alt={b.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle dark overlay */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.4) 100%)' }} />
                  {/* Realistic sign in centre */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ReviewSign message={b.message} color={b.color} rotate={b.rotate} />
                  </div>
                </div>
                {/* Caption below photo */}
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{b.label}</p>
                  <p className="text-xs" style={{ color: 'var(--ink4)' }}>{b.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reels section ───────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#0a0a0a' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
              Instagram Reels
            </p>
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.025em', color: 'white' }}>
              Reviews that work<br />while you sleep
            </h2>
            <p className="text-base max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Our AI reads your reviews, finds the patterns, and builds cinematic 9:16 Reels — branded, ready to post, in seconds.
            </p>
          </div>

          <ReelDemos />

          <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
            These are live previews — the same Reels your customers will see on Instagram.
          </p>
        </div>
      </section>

      {/* ── How it works ────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
              How it works
            </p>
            <h2 className="font-bold" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.025em', color: 'var(--ink)' }}>
              Set up in 5 minutes.<br />Results from day one.
            </h2>
          </div>

          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              {
                step: '01',
                title: 'Get your QR code',
                body: 'We generate a branded QR code — your colors, your logo. Print it or display it anywhere.',
                icon: '▦',
              },
              {
                step: '02',
                title: 'Reviews come to you',
                body: 'Customers scan and leave a Google review in under 10 seconds. No friction, no app required.',
                icon: '★',
              },
              {
                step: '03',
                title: 'AI builds your content',
                body: 'Buzzloop reads your reviews, finds what customers love, and creates Reels ready to post.',
                icon: '▶',
              },
            ].map(s => (
              <div key={s.step} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ background: 'var(--ink)' }}>
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--ink4)' }}>{s.step}</span>
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink3)' }}>{s.body}</p>
              </div>
            ))}
          </div>

          {/* Arrow between steps */}
          <div className="flex justify-center gap-4 mt-12">
            {['More reviews', '→', 'Better ranking', '→', 'More customers', '→', 'More content', '→', 'Even more customers'].map((item, i) => (
              <span key={i} className="text-sm font-semibold"
                style={{ color: item === '→' ? 'var(--ink4)' : 'var(--accent)' }}>
                {item}
              </span>
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
            Start turning reviews<br />into customers today
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
