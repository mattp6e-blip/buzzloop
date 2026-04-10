'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const ORANGE = '#e8470a'
const ORANGE2 = '#ff6b35'
const INK = '#1a1814'
const INK3 = '#7a766e'
const INK4 = '#b0aca4'
const BG = '#fafaf8'
const BORDER = '#e8e5df'

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "The QR code alone doubled our monthly reviews",
    full: "We went from #8 to #3 on Google Maps in six weeks. The QR code alone doubled our monthly reviews, without us asking a single customer manually.",
    name: "James Whitfield",
    role: "Owner, CrossFit gym · Austin TX",
    initials: "JW",
  },
  {
    quote: "new patient inquiries are up significantly",
    full: "The AI turns our patient reviews into actual premium content. Our Instagram engagement went up 3x and new patient inquiries are up significantly.",
    name: "Dr. Sarah Chen",
    role: "Principal dentist · San Francisco CA",
    initials: "SC",
  },
  {
    quote: "We're ranking #1 for our main keyword",
    full: "I used to spend hours every week on marketing. Now Buzzloop handles the content side completely. We're ranking #1 for our main keyword.",
    name: "Marco DeLuca",
    role: "Owner, Italian restaurant · Chicago IL",
    initials: "MD",
  },
  {
    quote: "Every Google review gets a thoughtful, on-brand response",
    full: "The reply tool saves me 20 minutes a day. Every Google review gets a thoughtful, on-brand response. Customers notice.",
    name: "Priya Nair",
    role: "Founder, Med spa · Miami FL",
    initials: "PN",
  },
  {
    quote: "Went from 47 to 190 Google reviews in 3 months",
    full: "Went from 47 to 190 Google reviews in 3 months. Our phone doesn't stop ringing with new clients.",
    name: "Carlos Mendez",
    role: "Managing partner, Law firm · Los Angeles CA",
    initials: "CM",
  },
]

function highlightQuote(full: string, highlight: string) {
  const idx = full.indexOf(highlight)
  if (idx === -1) return <>{full}</>
  return (
    <>
      {full.slice(0, idx)}
      <mark style={{ background: '#fef08a', color: 'inherit', borderRadius: 3, padding: '0 2px' }}>
        {full.slice(idx, idx + highlight.length)}
      </mark>
      {full.slice(idx + highlight.length)}
    </>
  )
}

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timer.current = setTimeout(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent(c => (c + 1) % TESTIMONIALS.length)
        setFading(false)
      }, 350)
    }, 3200)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [current])

  const t = TESTIMONIALS[current]

  return (
    <div style={{ padding: '40px 24px', maxWidth: 680, margin: '0 auto' }}>
      <div style={{
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(6px)' : 'translateY(0)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        display: 'flex', gap: 20, alignItems: 'flex-start',
      }}>
        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE2})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: '-0.01em',
        }}>
          {t.initials}
        </div>
        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ color: '#f59e0b', fontSize: 15 }}>★</span>
            ))}
          </div>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.65, color: INK, margin: '0 0 14px' }}>
            &ldquo;{highlightQuote(t.full, t.quote)}&rdquo;
          </p>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 2px' }}>{t.name}</p>
            <p style={{ fontSize: 12, color: INK3, margin: 0 }}>{t.role}</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 28, paddingLeft: 72 }}>
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => { setFading(false); setCurrent(i) }} style={{
            width: i === current ? 20 : 6, height: 6, borderRadius: 3,
            background: i === current ? ORANGE : BORDER,
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How quickly will I see more Google reviews?",
    a: "Most businesses see their first new reviews within 48 hours of placing their QR code. On average, Buzzloop users get 3x more reviews per month than before, because the process is so fast customers actually do it.",
  },
  {
    q: "Will this actually improve my Google Maps ranking?",
    a: "Yes. Google ranks local businesses on review quantity, recency, owner responses, and profile completeness. Buzzloop improves all four simultaneously. Most users see measurable ranking improvement within 4–8 weeks.",
  },
  {
    q: "How does the QR review flow work?",
    a: "A customer scans your QR code, answers up to 3 quick questions on a branded mobile page, and Buzzloop drafts a polished Google review for them. They tap once to post it. The whole thing takes under 10 seconds with no friction and no drop-off.",
  },
  {
    q: "What kind of social content does it create?",
    a: "Buzzloop reads your real Google reviews, finds the most compelling stories, and turns them into premium short-form Social Clips branded to your colors and logo. Not generic templates. Actual content built from what your customers say.",
  },
  {
    q: "Do I need to be a technical person to set this up?",
    a: "No. Setup takes under 5 minutes. You print a QR code, place it somewhere visible in your business, and Buzzloop does the rest. No coding. No integrations to configure.",
  },
  {
    q: "What's included in the free plan?",
    a: "The free plan includes your fully branded QR code, the customer review landing page, the ability to see your AI-generated Social Clips (without downloading), and keyword ranking tracking for 3 local search terms.",
  },
  {
    q: "How does the AI review reply tool work?",
    a: "Buzzloop reads each Google review and generates a short, personalized reply in the same language as the review, using your brand tone and business context. You can edit it before posting, or post directly to Google in one click.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel anytime, no questions asked. You keep access until the end of your billing period.",
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: ORANGE, textTransform: 'uppercase', marginBottom: 10 }}>FAQ</p>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: INK, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Frequently asked questions</h2>
        <p style={{ fontSize: 15, color: INK3, margin: 0 }}>Everything you need to know before getting started.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{
            borderRadius: 14, border: `1px solid ${open === i ? '#ffd4c2' : BORDER}`,
            background: open === i ? '#fff8f6' : 'white', overflow: 'hidden', transition: 'border-color 0.2s, background 0.2s',
          }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{
              width: '100%', textAlign: 'left', padding: '17px 20px',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: INK, lineHeight: 1.4 }}>{faq.q}</span>
              <span style={{
                fontSize: 20, color: ORANGE, flexShrink: 0, fontWeight: 300,
                transform: open === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s ease', display: 'inline-block',
              }}>+</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 20px 17px' }}>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feature row ──────────────────────────────────────────────────────────────

const FEATURES: { label: string; sublabel: string; free: boolean | string; pro: boolean | string }[] = [
  { label: 'Branded QR code', sublabel: 'Turns every customer into a potential reviewer', free: true, pro: true },
  { label: 'Custom review landing page', sublabel: 'Branded to your colors and logo', free: true, pro: true },
  { label: 'Competitor tracking', sublabel: 'See how you rank vs nearby businesses', free: true, pro: true },
  { label: 'GBP health score', sublabel: 'Know exactly what to fix to rank higher', free: true, pro: true },
  { label: 'Keyword rankings', sublabel: 'Track your position in local Google search', free: '3 keywords', pro: '10 keywords' },
  { label: 'AI-generated Social Clips', sublabel: 'Premium video content from your reviews', free: 'View only', pro: 'Download & share' },
  { label: 'SMS review outreach', sublabel: 'Text customers directly to get reviews', free: false, pro: true },
  { label: 'AI review replies', sublabel: 'Auto-draft replies in your tone, in any language', free: false, pro: true },
  { label: 'Post replies to Google', sublabel: 'One click to respond publicly', free: false, pro: true },
  { label: 'GBP description optimizer', sublabel: 'AI rewrites your profile to rank for more searches', free: false, pro: true },
]

function FeatureRow({ label, sublabel, free, pro }: typeof FEATURES[0]) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 110px 110px',
      alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${BG}`,
    }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: INK, margin: '0 0 2px' }}>{label}</p>
        <p style={{ fontSize: 12, color: INK4, margin: 0 }}>{sublabel}</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        {typeof free === 'string'
          ? <span style={{ fontSize: 12, fontWeight: 600, color: INK3, background: BG, padding: '3px 8px', borderRadius: 6 }}>{free}</span>
          : free ? <span style={{ color: '#16a34a', fontSize: 17 }}>✓</span>
          : <span style={{ color: '#d1d5db', fontSize: 14 }}>×</span>}
      </div>
      <div style={{ textAlign: 'center' }}>
        {typeof pro === 'string'
          ? <span style={{ fontSize: 12, fontWeight: 700, color: ORANGE, background: '#fff2ed', padding: '3px 8px', borderRadius: 6 }}>{pro}</span>
          : pro ? <span style={{ color: '#16a34a', fontSize: 17 }}>✓</span>
          : <span style={{ color: '#d1d5db', fontSize: 14 }}>×</span>}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PricingPage() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: BG, minHeight: '100vh', color: INK }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER}`,
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: ORANGE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: 'white',
          }}>⚡</div>
          <span style={{ fontSize: 15, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>Buzzloop</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/login" style={{ fontSize: 14, color: INK3, textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
          <Link href="/login" style={{
            fontSize: 13, fontWeight: 700, color: 'white', textDecoration: 'none',
            background: ORANGE, padding: '8px 18px', borderRadius: 10,
          }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '64px 24px 52px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: ORANGE, textTransform: 'uppercase', marginBottom: 14 }}>Pricing</p>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: INK, margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          One plan. Everything included.
        </h1>
        <p style={{ fontSize: 17, color: INK3, maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
          Start free. Upgrade when you want more reviews, better content, and a higher Google ranking.
        </p>
      </div>

      {/* Pricing cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 16, maxWidth: 780, margin: '0 auto 72px', padding: '0 24px',
      }}>

        {/* Free */}
        <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${BORDER}`, padding: '32px 28px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: INK4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Free</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
            <span style={{ fontSize: 46, fontWeight: 900, color: INK, letterSpacing: '-0.03em' }}>$0</span>
            <span style={{ fontSize: 14, color: INK4 }}>/month</span>
          </div>
          <p style={{ fontSize: 13, color: INK4, marginBottom: 24 }}>No credit card required.</p>
          <Link href="/login" style={{
            display: 'block', textAlign: 'center', padding: '12px',
            borderRadius: 11, border: `1.5px solid ${BORDER}`,
            fontSize: 13, fontWeight: 700, color: INK,
            textDecoration: 'none', marginBottom: 24,
          }}>
            Get started free
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Branded QR code that drives reviews on autopilot',
              'Custom review page, customers post in under 10 seconds',
              'See your AI-generated Social Clips (upgrade to download)',
              'Track 3 local keywords and your Google Maps position',
              'Competitor ranking tracker',
            ].map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#16a34a', flexShrink: 0, marginTop: 3 }}>✓</span>
                <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.45 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro */}
        <div style={{
          borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden',
          background: INK, border: `1px solid ${INK}`,
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            borderRadius: '50%', background: `${ORANGE}22`, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: -40, width: 150, height: 150,
            borderRadius: '50%', background: `${ORANGE}11`, pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Pro</p>
            <span style={{ fontSize: 11, fontWeight: 700, color: ORANGE, background: `${ORANGE}22`, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.04em' }}>
              MOST POPULAR
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
            <span style={{ fontSize: 46, fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>$49</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>/month</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Cancel anytime.</p>
          <Link href="/login" style={{
            display: 'block', textAlign: 'center', padding: '12px',
            borderRadius: 11, background: ORANGE,
            fontSize: 13, fontWeight: 700, color: 'white',
            textDecoration: 'none', marginBottom: 24,
          }}>
            Start free trial →
          </Link>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>
            Everything in Free, plus:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Download and share your Social Clips anywhere',
              'AI reply tool writes perfect responses to every Google review',
              'SMS outreach to text customers and get reviews automatically',
              'Track unlimited keywords and every search you rank for',
              'GBP optimizer rewrites your profile to rank for more searches',
              'Post replies directly to Google with one click',
            ].map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 11, color: ORANGE, flexShrink: 0, marginTop: 3 }}>✓</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials — right under plans */}
      <div style={{ background: 'white', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, marginBottom: 80 }}>
        <TestimonialCarousel />
      </div>

      {/* Feature comparison */}
      <div style={{ maxWidth: 700, margin: '0 auto 80px', padding: '0 24px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, textAlign: 'center', marginBottom: 24, letterSpacing: '-0.02em' }}>
          Compare plans
        </h2>
        <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${BORDER}`, padding: '8px 22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px', padding: '12px 0', borderBottom: `2px solid ${BG}` }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: INK4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feature</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: INK4, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Free</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Pro</span>
          </div>
          {FEATURES.map(f => <FeatureRow key={f.label} {...f} />)}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 96 }}>
        <FAQ />
      </div>

      {/* Bottom CTA */}
      <div style={{
        textAlign: 'center', padding: '64px 24px 88px',
        borderTop: `1px solid ${BORDER}`,
      }}>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: INK, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Start climbing Google Maps today
        </h2>
        <p style={{ fontSize: 15, color: INK3, marginBottom: 28 }}>Free forever. No credit card required.</p>
        <Link href="/login" style={{
          display: 'inline-block', padding: '14px 32px', borderRadius: 13,
          background: ORANGE, color: 'white', textDecoration: 'none',
          fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
        }}>
          Get started free →
        </Link>
      </div>

    </div>
  )
}
