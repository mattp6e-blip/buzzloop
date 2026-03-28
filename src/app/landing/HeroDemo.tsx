'use client'
import { useState } from 'react'

export function HeroDemo() {
  const [step, setStep] = useState<'review' | 'reel'>('review')

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {step === 'review' ? (
        <ReviewCard onConvert={() => setStep('reel')} />
      ) : (
        <ReelCard onBack={() => setStep('review')} />
      )}
    </div>
  )
}

function ReviewCard({ onConvert }: { onConvert: () => void }) {
  return (
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
      <p style={{
        fontSize: 15, lineHeight: 1.7, color: '#3c4043', margin: '0 0 18px',
      }}>
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
  )
}

function ReelCard({ onBack }: { onBack: () => void }) {
  return (
    <div>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'white', fontSize: 12, fontWeight: 600,
            color: 'var(--ink3)', cursor: 'pointer',
          }}
        >
          ← Review
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#f0fdf4', borderRadius: 8, padding: '5px 12px',
        }}>
          <span style={{ fontSize: 12 }}>✓</span>
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>3 variations ready</span>
        </div>
      </div>

      {/* Three phone frames */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        {VARIATIONS.map((v, i) => (
          <PhoneFrame key={i} variation={v} isMain={i === 1} />
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink4)', marginTop: 14 }}>
        Story · Bold · Authority — pick your tone
      </p>
    </div>
  )
}

const VARIATIONS = [
  {
    label: 'Story',
    hook: 'She was terrified for years.',
    quote: '"Walked out actually smiling."',
    bg: 'linear-gradient(160deg, #1a0a2e 0%, #2d1b4e 100%)',
    accent: '#a855f7',
  },
  {
    label: 'Bold',
    hook: 'Years of fear. Gone in one visit.',
    quote: '"Best decision I ever made."',
    bg: 'linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 100%)',
    accent: '#e1306c',
  },
  {
    label: 'Authority',
    hook: 'Every patient said the same thing.',
    quote: '"I wish I hadn\'t waited."',
    bg: 'linear-gradient(160deg, #0a1628 0%, #0d2240 100%)',
    accent: '#38bdf8',
  },
]

function PhoneFrame({ variation, isMain }: { variation: typeof VARIATIONS[0]; isMain: boolean }) {
  const scale = isMain ? 1 : 0.88
  return (
    <div style={{
      transform: `scale(${scale}) translateY(${isMain ? 0 : 10}px)`,
      transformOrigin: 'top center',
      width: 110,
      aspectRatio: '9/16',
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: isMain
        ? '0 20px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'
        : '0 8px 24px rgba(0,0,0,0.2)',
      flexShrink: 0,
    }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: variation.bg }} />

      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 14, left: 12, right: 12,
        height: 2, borderRadius: 1,
        background: variation.accent, opacity: 0.8,
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '16px 10px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 10, fontWeight: 900, color: 'white',
          lineHeight: 1.25, letterSpacing: '-0.02em', margin: '0 0 8px',
        }}>{variation.hook}</p>
        <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.25)', margin: '4px auto 8px' }} />
        <p style={{
          fontSize: 8, color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.5, margin: '0 0 10px', fontStyle: 'italic',
        }}>{variation.quote}</p>
        <div style={{ display: 'flex', gap: 2 }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ color: '#f59e0b', fontSize: 8 }}>★</span>
          ))}
        </div>
      </div>

      {/* Tone label badge */}
      <div style={{
        position: 'absolute', bottom: 10, left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        borderRadius: 5, padding: '2px 7px',
        fontSize: 8, color: 'rgba(255,255,255,0.8)', fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>{variation.label}</div>
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
