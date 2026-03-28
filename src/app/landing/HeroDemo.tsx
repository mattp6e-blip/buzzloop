'use client'
import { useState, useEffect } from 'react'

const PHASES = [
  { type: 'hook', duration: 3000 },
  { type: 'quote', duration: 4000 },
  { type: 'proof', duration: 3000 },
  { type: 'cta', duration: 5000 },
]

export function HeroDemo() {
  const [step, setStep] = useState<'review' | 'reel'>('review')

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      {step === 'review' ? (
        <ReviewCard onConvert={() => setStep('reel')} />
      ) : (
        <ReelPreview onBack={() => setStep('review')} />
      )}
    </div>
  )
}

function ReviewCard({ onConvert }: { onConvert: () => void }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Try me annotation */}
      <div style={{
        position: 'absolute',
        bottom: -10,
        right: 28,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        zIndex: 10,
        animation: 'bounce 1.8s ease-in-out infinite',
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.01em' }}>try me</span>
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none" style={{ transform: 'rotate(15deg)' }}>
          <path d="M12 2 C12 2, 4 10, 4 18 C4 22, 8 26, 12 26 C16 26, 20 22, 20 18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M17 22 L20 18 L23 22" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }`}</style>

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
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <GoogleLogo />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.3 }}>Google Review</p>
            <p style={{ fontSize: 11, color: '#5f6368', margin: 0 }}>Pearl Dental Clinic</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: '#fbbc04', fontSize: 15 }}>★</span>
            ))}
          </div>
        </div>

        {/* Review text */}
        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#3c4043', margin: '0 0 18px' }}>
          "I was terrified of the dentist for years. Walked out actually smiling. Best decision I ever made."
        </p>

        {/* Reviewer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'white', fontWeight: 700, flexShrink: 0,
          }}>S</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Sarah M.</span>
          <span style={{ fontSize: 11, color: '#9aa0a6', marginLeft: 4 }}>2 weeks ago</span>
        </div>

        {/* CTA */}
        <button
          onClick={onConvert}
          style={{
            width: '100%',
            padding: '15px 20px',
            borderRadius: 14,
            border: 'none',
            background: 'linear-gradient(90deg, #833AB4 0%, #E1306C 50%, #F77737 100%)',
            color: 'white',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            letterSpacing: '-0.01em',
          }}
        >
          Turn this into a Reel →
        </button>
      </div>
    </div>
  )
}

function ReelPreview({ onBack }: { onBack: () => void }) {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        setPhaseIdx(i => (i + 1) % PHASES.length)
        setVisible(true)
      }, 300)
    }, PHASES[phaseIdx].duration)
    return () => clearTimeout(timer)
  }, [phaseIdx])

  const phase = PHASES[phaseIdx].type

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* Phone */}
      <div style={{
        width: 200,
        aspectRatio: '9/16',
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(160deg, #0a0a14 0%, #1a0a2e 100%)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 60, height: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 3, zIndex: 10,
        }} />

        {/* Accent bar */}
        <div style={{
          position: 'absolute', top: 28, left: 20, right: 20, height: 2, borderRadius: 1,
          background: 'linear-gradient(90deg, #833AB4, #E1306C)',
          opacity: phase === 'hook' ? 1 : 0.3,
          transition: 'opacity 0.4s',
        }} />

        {/* Content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px 32px',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}>
          {phase === 'hook' && <HookSlide />}
          {phase === 'quote' && <QuoteSlide />}
          {phase === 'proof' && <ProofSlide />}
          {phase === 'cta' && <CtaSlide />}
        </div>

        {/* Progress dots */}
        <div style={{
          position: 'absolute', bottom: 16, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 5,
        }}>
          {PHASES.map((_, i) => (
            <div key={i} style={{
              width: i === phaseIdx ? 18 : 5, height: 5, borderRadius: 3,
              background: i === phaseIdx ? '#E1306C' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Instagram Reels badge */}
        <div style={{
          position: 'absolute', top: 40, right: 12,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          borderRadius: 6, padding: '3px 7px',
          fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '0.05em',
        }}>▶ REEL</div>
      </div>

      {/* Side panel */}
      <div style={{ paddingTop: 8 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: '#f0fdf4', borderRadius: 8, padding: '4px 10px', marginBottom: 14,
        }}>
          <span style={{ fontSize: 11, color: '#16a34a' }}>✓</span>
          <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>Ready to post</span>
        </div>

        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>
          Your Reel
        </p>
        <p style={{ fontSize: 11, color: 'var(--ink3)', margin: '0 0 20px', lineHeight: 1.5 }}>
          Branded. 22 seconds.<br />Ready for Instagram.
        </p>

        <button
          onClick={onBack}
          style={{
            padding: '8px 13px', borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'white', fontSize: 11, fontWeight: 600,
            color: 'var(--ink3)', cursor: 'pointer',
          }}
        >
          ← Review
        </button>
      </div>
    </div>
  )
}

function HookSlide() {
  return (
    <>
      <p style={{ fontSize: 20, fontWeight: 900, color: 'white', lineHeight: 1.2, letterSpacing: '-0.025em', margin: 0 }}>
        She was terrified for years.
      </p>
      <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.2)', margin: '16px auto' }} />
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Pearl Dental Clinic</p>
    </>
  )
}

function QuoteSlide() {
  return (
    <>
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 16, padding: '20px 16px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'white', lineHeight: 1.6, margin: '0 0 12px', fontStyle: 'italic' }}>
          "Walked out actually{' '}
          <span style={{ color: '#E1306C', fontWeight: 800, fontStyle: 'normal' }}>smiling</span>.
          Best decision I ever made."
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: 'white', fontWeight: 700,
          }}>S</div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Sarah M.</span>
          <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
            {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 9, color: '#f59e0b' }}>★</span>)}
          </div>
        </div>
      </div>
    </>
  )
}

function ProofSlide() {
  return (
    <>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
        The pattern
      </p>
      <p style={{ fontSize: 22, fontWeight: 900, color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
        From terrified to:<br />
        <span style={{ color: '#E1306C' }}>"Can't wait to come back."</span>
      </p>
      <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 16 }}>
        {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 16 }}>★</span>)}
      </div>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: '8px 0 0' }}>4.9 · 47 Google reviews</p>
    </>
  )
}

function CtaSlide() {
  return (
    <>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 12px' }}>
        Still putting it off?
      </p>
      <p style={{ fontSize: 18, fontWeight: 900, color: 'white', lineHeight: 1.25, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
        Book your first visit. See what everyone's talking about.
      </p>
      <div style={{
        background: 'linear-gradient(90deg, #833AB4, #E1306C)',
        borderRadius: 50, padding: '12px 24px',
        fontSize: 13, fontWeight: 700, color: 'white',
      }}>
        Book appointment →
      </div>
    </>
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
