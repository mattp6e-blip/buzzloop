'use client'
import { useState, useEffect } from 'react'

const ACCENT = '#e8470a'
const INK = '#1a1814'
const INK3 = '#7a766e'
const BORDER = '#e8e5df'

const REVIEW_TEXT = `The team here is exceptional. Dr. Chen took real time to explain my treatment and I felt completely at ease, first dentist I've genuinely looked forward to coming back to.`
const DURATIONS = [2600, 2800, 3400, 2600]
const STEP_LABELS = ['Branded review page', 'Rate your visit', 'AI writes your review', 'Post to Google']

function S0() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 24px 24px', background: 'white', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: ACCENT }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>HD</span>
        </div>
        <p style={{ fontWeight: 800, fontSize: 15, color: INK, margin: '0 0 3px', textAlign: 'center', letterSpacing: '-0.01em' }}>Harmonia Dental</p>
        <p style={{ fontSize: 11, color: INK3, margin: '0 0 24px', textAlign: 'center' }}>We&apos;d love to hear from you</p>
        <div style={{ display: 'flex', gap: 5, marginBottom: 28 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 26, color: '#e5e7eb', lineHeight: 1 }}>★</span>)}
        </div>
        <div style={{ width: '100%', background: ACCENT, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 13, margin: 0 }}>Rate your visit →</p>
        </div>
        <p style={{ fontSize: 10, color: INK3, margin: '10px 0 0', textAlign: 'center' }}>Takes under 10 seconds</p>
      </div>
    </div>
  )
}

function S1({ stars }: { stars: number }) {
  return (
    <div style={{ height: '100%', padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: ACCENT }} />
        <p style={{ fontSize: 10, color: INK3, margin: 0, fontWeight: 600, letterSpacing: '0.04em' }}>Step 1 of 2</p>
      </div>
      <p style={{ fontWeight: 800, fontSize: 15, color: INK, margin: '0 0 3px', letterSpacing: '-0.01em' }}>How was your visit?</p>
      <p style={{ fontSize: 11, color: INK3, margin: '0 0 16px' }}>Tap a star to rate</p>
      <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 20 }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{
            fontSize: 28,
            color: i <= stars ? '#f59e0b' : '#e5e7eb',
            transition: 'color 0.12s ease, transform 0.12s ease',
            transform: i === stars ? 'scale(1.28)' : 'scale(1)',
            display: 'inline-block', lineHeight: 1,
          }}>★</span>
        ))}
      </div>
      <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 7px' }}>What did you like most?</p>
      <div style={{ background: '#f5f3ef', borderRadius: 10, padding: '10px 12px', flex: 1, border: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 11, color: '#b0a89e', margin: 0, fontStyle: 'italic', lineHeight: 1.65 }}>The staff were so friendly and...</p>
      </div>
      <div style={{ background: ACCENT, borderRadius: 12, padding: '11px', textAlign: 'center', marginTop: 14 }}>
        <p style={{ color: 'white', fontWeight: 700, fontSize: 13, margin: 0 }}>Next →</p>
      </div>
    </div>
  )
}

function S2({ typed }: { typed: number }) {
  return (
    <div style={{ height: '100%', padding: '14px 20px 20px', background: '#fafaf8', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes blinkCursor { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: 'white' }}>✦</span>
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, margin: 0, letterSpacing: '-0.01em' }}>Writing your review</p>
          <p style={{ fontSize: 10, color: INK3, margin: 0 }}>Based on what you shared</p>
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: '14px', flex: 1, border: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 12, color: '#f59e0b' }}>★</span>)}
        </div>
        <p style={{ fontSize: 11.5, color: INK, lineHeight: 1.75, margin: 0 }}>
          {REVIEW_TEXT.slice(0, typed)}
          {typed < REVIEW_TEXT.length && (
            <span style={{ borderLeft: '2px solid ' + ACCENT, animation: 'blinkCursor 0.8s step-end infinite', marginLeft: 1 }}>&nbsp;</span>
          )}
        </p>
      </div>
    </div>
  )
}

function S3({ posted }: { posted: boolean }) {
  return (
    <div style={{ height: '100%', padding: '16px 20px 20px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`@keyframes popIn { 0% { transform: scale(0.7); opacity: 0 } 70% { transform: scale(1.1) } 100% { transform: scale(1); opacity: 1 } }`}</style>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: posted ? '#dcfce7' : '#f0fdf4',
        border: `2px solid ${posted ? '#86efac' : '#bbf7d0'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10, marginTop: 8,
        transition: 'all 0.4s ease',
        animation: posted ? 'popIn 0.5s ease forwards' : 'none',
      }}>
        <span style={{ fontSize: 20, color: '#16a34a', fontWeight: 700 }}>{posted ? '✓' : '·'}</span>
      </div>
      <p style={{ fontWeight: 800, fontSize: 14, color: INK, margin: '0 0 4px', textAlign: 'center', letterSpacing: '-0.01em' }}>
        {posted ? 'Review posted!' : 'Your review is ready'}
      </p>
      <p style={{ fontSize: 10, color: INK3, margin: '0 0 16px', textAlign: 'center', lineHeight: 1.55 }}>
        {posted ? 'Live on Google in a few seconds.' : 'Tap below to publish to Google'}
      </p>
      <div style={{ width: '100%', background: '#f5f3ef', borderRadius: 10, padding: '10px 12px', marginBottom: 14, border: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 10.5, color: INK3, lineHeight: 1.75, margin: 0, fontStyle: 'italic' }}>
          &ldquo;The team here is exceptional. Dr. Chen took real time to explain my treatment...&rdquo;
        </p>
      </div>
      <div style={{
        width: '100%',
        background: posted ? '#16a34a' : '#4285f4',
        borderRadius: 12, padding: '11px', textAlign: 'center',
        transition: 'background 0.5s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        {!posted && (
          <svg width="14" height="14" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 13 4 24s8.9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
        )}
        <p style={{ color: 'white', fontWeight: 700, fontSize: 13, margin: 0 }}>
          {posted ? '✓ Posted to Google' : 'Post to Google'}
        </p>
      </div>
    </div>
  )
}

export function ReviewFlowDemo() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const [stars, setStars] = useState(0)
  const [typed, setTyped] = useState(0)
  const [posted, setPosted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(() => { setStep(s => (s + 1) % 4); setVisible(true) }, 320)
    }, DURATIONS[step])
    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    setStars(0); setTyped(0); setPosted(false)
    if (step === 1) {
      let s = 0
      const t = setInterval(() => { setStars(++s); if (s >= 5) clearInterval(t) }, 170)
      return () => clearInterval(t)
    }
    if (step === 2) {
      let i = 0
      const t = setInterval(() => { i += 3; setTyped(Math.min(i, REVIEW_TEXT.length)); if (i >= REVIEW_TEXT.length) clearInterval(t) }, 22)
      return () => clearInterval(t)
    }
    if (step === 3) {
      const t = setTimeout(() => setPosted(true), 1100)
      return () => clearTimeout(t)
    }
  }, [step])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, userSelect: 'none' }}>
      <style>{`@keyframes phoneFloat { 0%, 100% { transform: translateY(0px) } 50% { transform: translateY(-10px) } }`}</style>

      {/* Phone chassis */}
      <div style={{
        width: 268, height: 544,
        borderRadius: 46,
        background: 'linear-gradient(160deg, #2e2b28 0%, #1a1714 100%)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.1), 0 40px 96px rgba(0,0,0,0.45), 0 12px 32px rgba(0,0,0,0.3)',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
        animation: 'phoneFloat 4.5s ease-in-out infinite',
      }}>
        {/* Side buttons */}
        <div style={{ position: 'absolute', right: -3, top: 100, width: 3, height: 48, background: '#2a2724', borderRadius: '0 2px 2px 0' }} />
        <div style={{ position: 'absolute', left: -3, top: 88, width: 3, height: 32, background: '#2a2724', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -3, top: 130, width: 3, height: 32, background: '#2a2724', borderRadius: '2px 0 0 2px' }} />

        {/* Dynamic island */}
        <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 88, height: 24, background: '#111', borderRadius: 12, zIndex: 30 }} />

        {/* Screen bezel */}
        <div style={{ position: 'absolute', inset: 5, borderRadius: 41, overflow: 'hidden', background: 'white' }}>
          {/* Status bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', zIndex: 20, background: 'white' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: INK, marginTop: 2 }}>9:41</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <svg width="13" height="9" viewBox="0 0 13 9" fill={INK}>
                <rect x="0" y="3.5" width="2" height="5.5" rx="0.5" opacity="0.3"/>
                <rect x="3.2" y="2" width="2" height="7" rx="0.5" opacity="0.5"/>
                <rect x="6.4" y="0.5" width="2" height="8.5" rx="0.5" opacity="0.7"/>
                <rect x="9.6" y="0" width="2" height="9" rx="0.5"/>
              </svg>
              <svg width="15" height="8" viewBox="0 0 15 8" fill="none">
                <rect x="0.5" y="0.5" width="12" height="7" rx="1.5" stroke={INK} strokeWidth="1" opacity="0.35"/>
                <rect x="12.5" y="2.5" width="2" height="3" rx="0.5" fill={INK} opacity="0.35"/>
                <rect x="1.5" y="1.5" width="9" height="5" rx="0.8" fill={INK}/>
              </svg>
            </div>
          </div>

          {/* Screen content */}
          <div style={{ position: 'absolute', inset: 0, paddingTop: 48, opacity: visible ? 1 : 0, transition: 'opacity 0.32s ease' }}>
            {step === 0 && <S0 />}
            {step === 1 && <S1 stars={stars} />}
            {step === 2 && <S2 typed={typed} />}
            {step === 3 && <S3 posted={posted} />}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {STEP_LABELS.map((_, i) => (
          <div key={i} style={{
            height: 5, borderRadius: 3,
            width: i === step ? 22 : 5,
            background: i === step ? ACCENT : 'rgba(0,0,0,0.1)',
            transition: 'all 0.35s ease',
          }} />
        ))}
      </div>
      <p style={{ fontSize: 12, color: INK3, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
        {STEP_LABELS[step]}
      </p>
    </div>
  )
}
