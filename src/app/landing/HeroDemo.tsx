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

// Real Harmonia Dental reel — pulled from account (ID: c166f0e6-75b2-48b8-bcb7-0aaeb3501aa7)
const HARMONIA_VARIATION: ReelVariation = {
  id: 1,
  label: 'Bold',
  description: 'High energy · most reach',
  tone: 'bold',
  hookHeadline: 'People take a plane to see this dentist.',
  hookSubline: "Here's what they say.",
  ctaText: "Book your first visit. Meet the team worth traveling for.",
  visualStyle: 'cinematic',
  script: {
    themeTitle: "Patients travel far just to return",
    totalDuration: 29,
    slides: [
      { type: 'hook', duration: 4, content: { headline: "People take a plane to see this dentist.", subline: "Here's what they say." } },
      { type: 'quote', duration: 5, content: { quote: "I'd rather fly from Norway than go to a dentist in Norway.", highlightWords: ['Norway', 'rather'], author: 'Taltunran' } },
      { type: 'quote', duration: 5, content: { quote: "I'm coming from Mallorca, and that says it all.", highlightWords: ['Mallorca'], author: 'Andreu' } },
      { type: 'quote', duration: 5, content: { quote: "They make you feel in good hands from the very first moment.", highlightWords: ['good', 'hands'], author: 'Jordi' } },
      { type: 'proof', duration: 5, content: { stat: "Patients fly internationally. They keep coming back.", subline: "That's not marketing. That's earned trust." } },
      { type: 'cta', duration: 5, content: { headline: "When did you last look forward to the dentist?", cta: "Book your first visit. Meet the team worth traveling for." } },
    ],
  },
}

const HARMONIA_PROPS: ReelCompositionProps = {
  script: HARMONIA_VARIATION.script,
  variation: HARMONIA_VARIATION,
  brandColor: '#00b0e0',
  brandSecondaryColor: '#f78da7',
  logoUrl: null,
  businessName: 'Harmonia Dental',
  industry: 'clinic',
  websiteUrl: 'harmoniadental.es',
}

const TOTAL_FRAMES = Math.round(HARMONIA_VARIATION.script.totalDuration * REEL_FPS)

export function HeroDemo() {
  const [step, setStep] = useState<'review' | 'reel'>('review')

  return (
    <div style={{ width: '100%', maxWidth: 380 }}>
      {step === 'review' ? (
        <ReviewCard onConvert={() => setStep('reel')} />
      ) : (
        <ReelPlayer onBack={() => setStep('review')} />
      )}
    </div>
  )
}

function ReviewCard({ onConvert }: { onConvert: () => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '28px 28px 24px',
        boxShadow: '0 12px 60px rgba(0,0,0,0.1), 0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        {/* Google header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#f8f9fa', border: '1px solid #e8eaed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <GoogleLogo />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.3 }}>Google Review</p>
            <p style={{ fontSize: 11, color: '#5f6368', margin: 0 }}>Harmonia Dental</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
            {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#fbbc04', fontSize: 15 }}>★</span>)}
          </div>
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#3c4043', margin: '0 0 18px' }}>
          "I'd rather fly from Norway than go to a dentist in Norway. That's how good they are."
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'white', fontWeight: 700, flexShrink: 0,
          }}>T</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Taltunran</span>
          <span style={{ fontSize: 11, color: '#9aa0a6', marginLeft: 4 }}>1 month ago</span>
        </div>

        <button
          onClick={onConvert}
          style={{
            width: '100%', padding: '15px 20px', borderRadius: 14,
            border: 'none',
            background: 'linear-gradient(90deg, #833AB4 0%, #E1306C 50%, #F77737 100%)',
            color: 'white', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            letterSpacing: '-0.01em',
          }}
        >
          Turn this into a Reel →
        </button>
      </div>

      {/* Try me — centred below the button */}
      <div style={{
        position: 'absolute', bottom: -56, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        animation: 'heroBounce 2s ease-in-out infinite', pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>
        <style>{`@keyframes heroBounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-5px)} }`}</style>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em' }}>try me</span>
        <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
          <path d="M10 30 L10 4" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M5 9 L10 3 L15 9" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

function ReelPlayer({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ width: 'fit-content' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'white',
            fontSize: 12, fontWeight: 600, color: 'var(--ink3)', cursor: 'pointer',
          }}
        >
          ← Review
        </button>
      </div>
      <div style={{
        width: 220,
        borderRadius: 22,
        overflow: 'hidden',
        aspectRatio: '9/16',
        background: '#0a0a0a',
        boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
      }}>
        <Player
          component={ReelCompositionModule as never}
          inputProps={HARMONIA_PROPS}
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
  )
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
