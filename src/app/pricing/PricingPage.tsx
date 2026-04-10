'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "We went from #8 to #3 on Google Maps in six weeks. The QR code alone doubled our monthly reviews.",
    name: "James Whitfield",
    business: "CrossFit gym, Austin TX",
    stars: 5,
  },
  {
    quote: "The AI turns our patient reviews into actual premium content. Our Instagram engagement went up 3x.",
    name: "Dr. Sarah Chen",
    business: "Dental clinic, San Francisco CA",
    stars: 5,
  },
  {
    quote: "I used to spend hours on marketing. Now Buzzloop handles it. We're ranking #1 for our main keyword.",
    name: "Marco DeLuca",
    business: "Italian restaurant, Chicago IL",
    stars: 5,
  },
  {
    quote: "The reply tool saves me 20 minutes a day. Every review gets a thoughtful response, automatically.",
    name: "Priya Nair",
    business: "Med spa, Miami FL",
    stars: 5,
  },
  {
    quote: "Went from 47 to 190 Google reviews in 3 months. Our phone doesn't stop ringing.",
    name: "Carlos Mendez",
    business: "Law firm, Los Angeles CA",
    stars: 5,
  },
]

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrent(c => (c + 1) % TESTIMONIALS.length)
        setAnimating(false)
      }, 400)
    }, 3000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current])

  const t = TESTIMONIALS[current]

  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', maxWidth: 680, margin: '0 auto' }}>
      <div style={{
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ color: '#f59e0b', fontSize: 18 }}>★</span>
          ))}
        </div>

        {/* Quote */}
        <p style={{
          fontSize: 22, fontWeight: 500, lineHeight: 1.5,
          color: '#0f172a', marginBottom: 28, fontStyle: 'italic',
          letterSpacing: '-0.01em',
        }}>
          &ldquo;{t.quote}&rdquo;
        </p>

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {t.name[0]}
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{t.name}</p>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{t.business}</p>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 32 }}>
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setAnimating(false); setCurrent(i) }}
            style={{
              width: i === current ? 20 : 6,
              height: 6, borderRadius: 3,
              background: i === current ? '#6366f1' : '#e2e8f0',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Do I need technical knowledge to use Buzzloop?",
    a: "No. Setup takes under 5 minutes. You print a QR code, place it in your business, and Buzzloop does the rest. No coding, no complex setup.",
  },
  {
    q: "How does the QR review flow work?",
    a: "A customer scans your QR code, answers up to 3 quick questions on a branded mobile page, and Buzzloop drafts a polished Google review for them. They tap once to post it. The whole thing takes under 10 seconds.",
  },
  {
    q: "What social content does Buzzloop create?",
    a: "Buzzloop analyzes your Google reviews, finds the most compelling stories and patterns, and turns them into premium short-form video reels and social posts — branded to your colors and logo. No generic templates.",
  },
  {
    q: "Does it work for any type of local business?",
    a: "Yes. Buzzloop works for restaurants, dental clinics, gyms, salons, spas, law firms, hotels, and any business that serves local customers and wants more Google reviews.",
  },
  {
    q: "What's included in the free plan?",
    a: "The free plan includes your branded QR code and review landing page, the ability to see generated reels (without downloading), and keyword ranking tracking for 3 keywords.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, cancel anytime with no questions asked. You keep access until the end of your billing period.",
  },
  {
    q: "How does the AI review reply tool work?",
    a: "Buzzloop reads each Google review and generates a personalized, on-brand reply in the same language as the review. You can edit it before posting, or post directly to Google with one click.",
  },
  {
    q: "Will this actually improve my Google ranking?",
    a: "Google ranks local businesses based on review quantity, recency, responses, and GBP completeness. Buzzloop directly improves all of these signals. Most businesses see measurable ranking improvement within 4-8 weeks.",
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#6366f1', textTransform: 'uppercase', marginBottom: 12 }}>FAQ</p>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Frequently asked questions
        </h2>
        <p style={{ fontSize: 16, color: '#64748b', margin: 0 }}>Everything you need to know before getting started.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FAQS.map((faq, i) => (
          <div
            key={i}
            style={{
              borderRadius: 14,
              border: `1px solid ${open === i ? '#c7d2fe' : '#e2e8f0'}`,
              background: open === i ? '#fafafa' : 'white',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', textAlign: 'left', padding: '18px 22px',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>{faq.q}</span>
              <span style={{
                fontSize: 18, color: '#6366f1', flexShrink: 0, fontWeight: 300,
                transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease',
                display: 'inline-block',
              }}>+</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 22px 18px' }}>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feature row ──────────────────────────────────────────────────────────────

function Feature({ label, free, pro }: { label: string; free: boolean | string; pro: boolean | string }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 100px 100px',
      alignItems: 'center', padding: '13px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <span style={{ fontSize: 14, color: '#334155' }}>{label}</span>
      <div style={{ textAlign: 'center' }}>
        {typeof free === 'string'
          ? <span style={{ fontSize: 13, color: '#64748b' }}>{free}</span>
          : free
            ? <span style={{ color: '#16a34a', fontSize: 16 }}>✓</span>
            : <span style={{ color: '#cbd5e1', fontSize: 14 }}>—</span>
        }
      </div>
      <div style={{ textAlign: 'center' }}>
        {typeof pro === 'string'
          ? <span style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>{pro}</span>
          : pro
            ? <span style={{ color: '#16a34a', fontSize: 16 }}>✓</span>
            : <span style={{ color: '#cbd5e1', fontSize: 14 }}>—</span>
        }
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PricingPage() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#fafafa', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,250,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Buzzloop
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/login" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
          <Link
            href="/login"
            style={{
              fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none',
              background: '#6366f1', padding: '8px 18px', borderRadius: 10,
            }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '72px 24px 48px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#6366f1', textTransform: 'uppercase', marginBottom: 16 }}>
          Pricing
        </p>
        <h1 style={{
          fontSize: 52, fontWeight: 900, color: '#0f172a',
          margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          Simple, honest pricing
        </h1>
        <p style={{ fontSize: 18, color: '#64748b', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
          Everything your local business needs to dominate Google Maps and turn reviews into customers.
        </p>
      </div>

      {/* Pricing cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 20, maxWidth: 800, margin: '0 auto 80px', padding: '0 24px',
      }}>

        {/* Free */}
        <div style={{
          background: 'white', borderRadius: 20,
          border: '1px solid #e2e8f0', padding: '36px 32px',
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Free</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>$0</span>
            <span style={{ fontSize: 15, color: '#94a3b8' }}>/month</span>
          </div>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 28 }}>Forever free. No credit card.</p>
          <Link
            href="/login"
            style={{
              display: 'block', textAlign: 'center', padding: '13px',
              borderRadius: 12, border: '1.5px solid #e2e8f0',
              fontSize: 14, fontWeight: 700, color: '#334155',
              textDecoration: 'none', marginBottom: 28,
              transition: 'border-color 0.2s',
            }}
          >
            Get started free
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Branded QR code',
              'Custom review landing page',
              'See generated reels',
              '3 keyword rankings',
              'Competitor tracking',
              'GBP health score',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#16a34a', fontSize: 14, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: '#475569' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro */}
        <div style={{
          background: 'linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)',
          borderRadius: 20, padding: '36px 32px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
          }} />

          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Pro</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>$49</span>
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>/month</span>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>Cancel anytime.</p>
          <Link
            href="/login"
            style={{
              display: 'block', textAlign: 'center', padding: '13px',
              borderRadius: 12, background: 'white',
              fontSize: 14, fontWeight: 700, color: '#4f46e5',
              textDecoration: 'none', marginBottom: 28,
            }}
          >
            Start free trial →
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Everything in Free',
              'Download & share reels',
              'SMS review outreach',
              'AI review replies',
              'Post directly to Google',
              'Unlimited keywords',
              'GBP description optimizer',
              'Priority support',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature comparison table */}
      <div style={{ maxWidth: 720, margin: '0 auto 80px', padding: '0 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 32, letterSpacing: '-0.02em' }}>
          Compare plans
        </h2>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '8px 24px' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feature</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Free</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Pro</span>
          </div>
          <Feature label="Branded QR code" free={true} pro={true} />
          <Feature label="Review landing page" free={true} pro={true} />
          <Feature label="Competitor tracking" free={true} pro={true} />
          <Feature label="GBP health score" free={true} pro={true} />
          <Feature label="Keyword rankings" free="3 keywords" pro="Unlimited" />
          <Feature label="AI-generated reels" free="View only" pro="Download & share" />
          <Feature label="SMS review outreach" free={false} pro={true} />
          <Feature label="AI review replies" free={false} pro={true} />
          <Feature label="Post replies to Google" free={false} pro={true} />
          <Feature label="GBP description optimizer" free={false} pro={true} />
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ background: 'white', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: 80 }}>
        <TestimonialCarousel />
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 96 }}>
        <FAQ />
      </div>

      {/* Bottom CTA */}
      <div style={{
        textAlign: 'center', padding: '64px 24px 96px',
        background: 'linear-gradient(180deg, #fafafa 0%, #f1f5f9 100%)',
        borderTop: '1px solid #e2e8f0',
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Start climbing Google Maps today
        </h2>
        <p style={{ fontSize: 16, color: '#64748b', marginBottom: 28 }}>Free forever. No credit card required.</p>
        <Link
          href="/login"
          style={{
            display: 'inline-block', padding: '14px 32px', borderRadius: 14,
            background: '#6366f1', color: 'white', textDecoration: 'none',
            fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
          }}
        >
          Get started free →
        </Link>
      </div>

    </div>
  )
}
