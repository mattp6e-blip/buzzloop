'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { ReelCompositionProps, ReelVariation } from '@/remotion/types'
import { REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from '@/remotion/ReelComposition'

const Player = dynamic(() => import('@remotion/player').then(m => m.Player), { ssr: false })
const ReelCompositionModule = dynamic(
  () => import('@/remotion/ReelComposition').then(m => ({ default: m.ReelComposition })),
  { ssr: false }
)

// ── Restaurant ────────────────────────────────────────────────────────────────
const RESTAURANT_VARIATION: ReelVariation = {
  id: 1, label: 'Bold', description: 'High energy · most reach', tone: 'bold',
  hookHeadline: 'People drive across the city just to eat here.',
  hookSubline: "Here's what keeps them coming back.",
  ctaHeadline: "Some restaurants you visit once.",
  ctaText: "This isn't one of them. Book your table tonight.",
  template: 'immersive',
  script: {
    themeTitle: "The restaurant worth the drive",
    totalDuration: 29,
    slides: [
      { type: 'hook', duration: 4, content: { headline: "People drive across the city just to eat here.", subline: "Here's what keeps them coming back." } },
      { type: 'quote', duration: 5, content: { quote: "Best pasta I've had outside of Italy.", highlightWords: ['Best', 'Italy'], author: 'Marco' } },
      { type: 'quote', duration: 5, content: { quote: "We've been coming every Friday for 3 years.", highlightWords: ['3 years'], author: 'Sarah' } },
      { type: 'quote', duration: 5, content: { quote: "The kind of place you keep to yourself so it doesn't get too busy.", highlightWords: ['keep', 'yourself'], author: 'James' } },
      { type: 'proof', duration: 5, content: { stat: "People don't just visit once. They make it a ritual.", subline: "That's not luck. That's exceptional food." } },
      { type: 'cta', duration: 5, content: { headline: "Some restaurants you visit once. This isn't one of them.", cta: "Book your table tonight." } },
    ],
  },
}

const RESTAURANT_PROPS: ReelCompositionProps = {
  script: RESTAURANT_VARIATION.script,
  variation: RESTAURANT_VARIATION,
  brandColor: '#c0392b',
  brandSecondaryColor: '#f39c12',
  logoUrl: null,
  businessName: 'Mas Vell',
  industry: 'restaurant',
  websiteUrl: 'masvell.com',
  gbpPhotos: [],
}

// ── Esthetics clinic ──────────────────────────────────────────────────────────
const ESTHETICS_VARIATION: ReelVariation = {
  id: 2, label: 'Story', description: 'Emotional arc · most shared', tone: 'story',
  hookHeadline: "Customers don't just come back. They bring their friends.",
  hookSubline: "Here's what they say.",
  ctaHeadline: "Your skin deserves this.",
  ctaText: "Book a consultation. 20 minutes. See for yourself.",
  template: 'editorial',
  script: {
    themeTitle: "The clinic everyone tells their friends about",
    totalDuration: 29,
    slides: [
      { type: 'hook', duration: 4, content: { headline: "Customers don't just come back. They bring their friends.", subline: "Here's what they say." } },
      { type: 'quote', duration: 5, content: { quote: "I've never felt so confident walking out of a clinic.", highlightWords: ['confident'], author: 'Sofia' } },
      { type: 'quote', duration: 5, content: { quote: "The results speak for themselves. My skin has never looked better.", highlightWords: ['results', 'never'], author: 'Camille' } },
      { type: 'quote', duration: 5, content: { quote: "Worth every penny. I won't go anywhere else.", highlightWords: ['Worth', 'anywhere'], author: 'Isabelle' } },
      { type: 'proof', duration: 5, content: { stat: "Clients who came once. Now they bring their friends.", subline: "Results you can see. Trust you can feel." } },
      { type: 'cta', duration: 5, content: { headline: "Your skin deserves this.", cta: "Book a consultation today." } },
    ],
  },
}

const ESTHETICS_PROPS: ReelCompositionProps = {
  script: ESTHETICS_VARIATION.script,
  variation: ESTHETICS_VARIATION,
  brandColor: '#c2185b',
  brandSecondaryColor: '#f8bbd0',
  logoUrl: null,
  businessName: 'Lumière Studio',
  industry: 'clinic',
  websiteUrl: 'lumierestudio.com',
  gbpPhotos: [],
}

// ── Gym ───────────────────────────────────────────────────────────────────────
const GYM_VARIATION: ReelVariation = {
  id: 3, label: 'Proof', description: 'Evidence-led · most saved', tone: 'proof',
  hookHeadline: 'This gym changed how I think about fitness.',
  hookSubline: "Here's what members say.",
  ctaHeadline: "Stop starting over.",
  ctaText: "Join the gym you'll actually stick with. First week free.",
  template: 'collage',
  script: {
    themeTitle: "The gym you actually stick with",
    totalDuration: 29,
    slides: [
      { type: 'hook', duration: 4, content: { headline: "This gym changed how I think about fitness.", subline: "Here's what members say." } },
      { type: 'quote', duration: 5, content: { quote: "I've tried 6 gyms. I'm never leaving this one.", highlightWords: ['6 gyms', 'never'], author: 'Tom' } },
      { type: 'quote', duration: 5, content: { quote: "The coaches actually remember your name and your goals.", highlightWords: ['remember', 'goals'], author: 'Priya' } },
      { type: 'quote', duration: 5, content: { quote: "Lost 12kg in 4 months. The community keeps you accountable.", highlightWords: ['12kg', 'accountable'], author: 'David' } },
      { type: 'proof', duration: 5, content: { stat: "Members who joined and never looked back.", subline: "Because results here are real." } },
      { type: 'cta', duration: 5, content: { headline: "Stop starting over.", cta: "Join the gym you'll actually stick with." } },
    ],
  },
}

const GYM_PROPS: ReelCompositionProps = {
  script: GYM_VARIATION.script,
  variation: GYM_VARIATION,
  brandColor: '#1565c0',
  brandSecondaryColor: '#f0c419',
  logoUrl: null,
  businessName: 'Iron & Co.',
  industry: 'gym',
  websiteUrl: 'ironandco.com',
  gbpPhotos: [],
}

const BUSINESSES = [
  {
    label: 'Restaurant', props: RESTAURANT_PROPS, variation: RESTAURANT_VARIATION,
    pullQuote: "Best pasta I've had outside of Italy.", pullAuthor: 'Marco',
  },
  {
    label: 'Esthetics clinic', props: ESTHETICS_PROPS, variation: ESTHETICS_VARIATION,
    pullQuote: "I've never felt so confident walking out of a clinic.", pullAuthor: 'Sofia',
  },
  {
    label: 'Gym', props: GYM_PROPS, variation: GYM_VARIATION,
    pullQuote: "I've tried 6 gyms. I'm never leaving this one.", pullAuthor: 'Tom',
  },
]

const TOTAL_FRAMES = Math.round(29 * REEL_FPS)

export function BusinessReels() {
  const [active, setActive] = useState(0)
  const current = BUSINESSES[active]

  return (
    <section className="py-24 px-6" style={{ background: '#f5f3ef' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header — feature copy + demo combined */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)', letterSpacing: '0.1em' }}>Social content</p>
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--ink)' }}>
            Your reviews are your best marketing asset.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink3)', lineHeight: 1.75, maxWidth: 540, margin: '0 auto 32px' }}>
            AI reads your Google reviews, finds the most compelling stories, and turns them into branded Social Clips — ready to post on Instagram, TikTok, or anywhere.
          </p>
          {/* Feature bullets in 2 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px 32px', textAlign: 'left', maxWidth: 640, margin: '0 auto 44px' }}>
            {[
              ['Branded Social Clips from real reviews', 'Not generic templates — actual content built from what your customers say.'],
              ['Download and post anywhere', 'Instagram, TikTok, WhatsApp, your website. One download, use everywhere.'],
              ['AI replies to every Google review', 'On-brand, in the right language, posted to Google in one click.'],
              ['Fresh content every week, automatically', 'As new reviews come in, Buzzloop generates new clip ideas automatically.'],
            ].map(([title, body]) => (
              <div key={title} style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(232,71,10,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)' }}>✓</span>
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--ink)', margin: '0 0 2px', fontSize: 13.5 }}>{title}</p>
                  <p style={{ color: 'var(--ink3)', margin: 0, fontSize: 12.5, lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 400, margin: '0 auto 36px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink4)', margin: 0, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.06em' }}>See it in action</p>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center items-center gap-2 mb-12 flex-wrap">
          {BUSINESSES.map((b, i) => (
            <button
              key={b.label}
              onClick={() => setActive(i)}
              style={{
                padding: '10px 22px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                border: '1px solid',
                borderColor: active === i ? 'var(--accent)' : 'var(--border)',
                background: active === i ? 'var(--accent)' : 'white',
                color: active === i ? 'white' : 'var(--ink3)',
                cursor: 'pointer', transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
            >
              {b.label}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 6px' }} />
          <a href="/signup" style={{
            fontSize: 14, fontWeight: 700, color: 'var(--accent)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
            whiteSpace: 'nowrap',
          }}>
            Your business? Start free →
          </a>
        </div>

        {/* Content */}
        <div className="flex gap-16 items-center flex-wrap justify-center">

          {/* Left: Google review card */}
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <h3 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 20 }}>
              {current.props.businessName}
            </h3>
            <div style={{
              background: 'white', borderRadius: 20, padding: '24px 24px 20px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}>
              {/* Google header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: 'white', fontWeight: 700, flexShrink: 0,
                }}>{current.pullAuthor[0]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{current.pullAuthor}</p>
                  <p style={{ fontSize: 11, color: '#9aa0a6', margin: 0 }}>1 month ago · Google review</p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#fbbc04', fontSize: 16 }}>★</span>)}
              </div>
              {/* Quote */}
              <p style={{ fontSize: 15, lineHeight: 1.7, color: '#3c4043', margin: 0 }}>
                "{current.pullQuote}"
              </p>
            </div>
          </div>

          {/* Right: Remotion Player in phone frame */}
          <div style={{
            width: 220, borderRadius: 28, overflow: 'hidden',
            aspectRatio: '9/16', background: '#0a0a0a',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
            flexShrink: 0,
          }}>
            <Player
              key={active}
              component={ReelCompositionModule as never}
              inputProps={current.props}
              durationInFrames={TOTAL_FRAMES}
              compositionWidth={REEL_WIDTH}
              compositionHeight={REEL_HEIGHT}
              fps={REEL_FPS}
              style={{ width: '100%', height: '100%' }}
              loop
              autoPlay
            />
          </div>
        </div>
      </div>
    </section>
  )
}
