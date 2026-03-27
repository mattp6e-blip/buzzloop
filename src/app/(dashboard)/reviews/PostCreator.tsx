'use client'

import { useState, useRef, useEffect, forwardRef, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Review } from '@/types'

interface Props {
  review: Review
  reviews: Review[]
  businessName: string
  industry: string
  brandColor: string
  brandFont: string
  onBack: () => void
}

type Format = 'static' | 'carousel-single' | 'carousel-multi'
type Template = 'cinematic' | 'luxury' | 'impact' | 'glow'
type ScheduleMode = 'now' | 'later'

// ── Keyframes ──────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes prs-letterbox-in {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@keyframes prs-word-in {
  from { opacity:0; transform:translateY(14px); filter:blur(6px); }
  to   { opacity:1; transform:translateY(0);    filter:blur(0);   }
}
@keyframes prs-fade-in {
  from { opacity:0; }
  to   { opacity:1; }
}
@keyframes prs-slide-up {
  from { opacity:0; transform:translateY(28px); }
  to   { opacity:1; transform:translateY(0);    }
}
@keyframes prs-slide-right {
  from { opacity:0; transform:translateX(36px); }
  to   { opacity:1; transform:translateX(0);    }
}
@keyframes prs-star-in {
  0%   { opacity:0; transform:scale(0) rotate(-30deg); }
  60%  { transform:scale(1.4) rotate(5deg);  }
  100% { opacity:1; transform:scale(1) rotate(0deg);   }
}
@keyframes prs-slam-in {
  0%   { opacity:0; transform:translateY(-70px) scaleY(1.2); }
  55%  { transform:translateY(10px) scaleY(0.94); }
  75%  { transform:translateY(-5px) scaleY(1.02); }
  100% { opacity:1; transform:translateY(0) scaleY(1); }
}
@keyframes prs-line-draw {
  from { transform:scaleX(0); transform-origin:left; }
  to   { transform:scaleX(1); transform-origin:left; }
}
@keyframes prs-shimmer {
  0%   { transform:translateX(-180%) skewX(-20deg); }
  100% { transform:translateX(380%)  skewX(-20deg); }
}
@keyframes prs-float {
  0%,100% { transform:translateY(0px); }
  50%      { transform:translateY(-10px); }
}
@keyframes prs-glow-pulse {
  0%,100% { opacity:0.5; transform:scale(1);    }
  50%      { opacity:0.9; transform:scale(1.08); }
}
@keyframes prs-particle-drift {
  0%   { transform:translateY(0)    translateX(0);   opacity:0.7; }
  100% { transform:translateY(-90px) translateX(8px); opacity:0;   }
}
@keyframes prs-gradient-shift {
  0%   { background-position:0%   50%; }
  50%  { background-position:100% 50%; }
  100% { background-position:0%   50%; }
}
@keyframes prs-spin-in {
  from { opacity:0; transform:rotate(-200deg) scale(0); }
  to   { opacity:1; transform:rotate(0deg)    scale(1); }
}
@keyframes prs-glitch {
  0%,100% { transform:translateX(0);  clip-path:none; }
  20%      { transform:translateX(-4px); }
  40%      { transform:translateX(4px);  }
  60%      { transform:translateX(-3px); }
  80%      { transform:translateX(3px);  }
}
@keyframes prs-char-in {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0);   }
}
@keyframes prs-border-trace {
  0%   { box-shadow: 0 0 0 0px var(--prs-accent,#e8470a); }
  100% { box-shadow: 0 0 0 2px var(--prs-accent,#e8470a); }
}
`

function useAnimationStyles() {
  useEffect(() => {
    const id = 'prs-animation-keyframes'
    if (document.getElementById(id)) return
    const el = document.createElement('style')
    el.id = id
    el.textContent = KEYFRAMES
    document.head.appendChild(el)
  }, [])
}

// ── Helper: word-by-word animated text ────────────────────────

function WordReveal({ text, style, baseDelay = 0 }: {
  text: string
  style?: React.CSSProperties
  baseDelay?: number
}) {
  const words = text.split(' ')
  return (
    <div style={style}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: 'inline-block',
          marginRight: '0.28em',
          opacity: 0,
          animation: 'prs-word-in 0.55s cubic-bezier(0.2,0.8,0.4,1) forwards',
          animationDelay: `${baseDelay + i * 0.07}s`,
        }}>{w}</span>
      ))}
    </div>
  )
}

// ── Helper: animated stars ─────────────────────────────────────

function Stars({ count = 5, baseDelay = 0, color = '#f59e0b', size = 16 }: {
  count?: number; baseDelay?: number; color?: string; size?: number
}) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{
          display: 'inline-block',
          color,
          fontSize: size,
          opacity: 0,
          animation: 'prs-star-in 0.45s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
          animationDelay: `${baseDelay + i * 0.1}s`,
        }}>★</span>
      ))}
    </div>
  )
}

// ── TEMPLATE: Cinematic ────────────────────────────────────────

const PARTICLES = [
  { left: '12%', bottom: '22%', size: 2, delay: '0.2s',  dur: '4s'   },
  { left: '25%', bottom: '15%', size: 3, delay: '0.7s',  dur: '3.5s' },
  { left: '40%', bottom: '30%', size: 2, delay: '1.2s',  dur: '5s'   },
  { left: '55%', bottom: '10%', size: 2, delay: '0.4s',  dur: '4.5s' },
  { left: '68%', bottom: '25%', size: 3, delay: '0.9s',  dur: '3.8s' },
  { left: '80%', bottom: '18%', size: 2, delay: '0s',    dur: '4.2s' },
  { left: '88%', bottom: '35%', size: 2, delay: '1.5s',  dur: '3.6s' },
  { left: '20%', bottom: '40%', size: 2, delay: '0.6s',  dur: '4.8s' },
]

function CinematicSlide({ review, businessName, brandColor, brandFont, slideType }: {
  review: Review; businessName: string; brandColor: string; brandFont: string
  slideType: 'quote' | 'hook' | 'cta'
}) {
  const quote = review.what_they_liked.length > 115
    ? review.what_they_liked.slice(0, 112) + '...'
    : review.what_they_liked
  const wordCount = quote.split(' ').length
  const quoteEndDelay = 1.0 + wordCount * 0.07

  if (slideType === 'hook') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0a0a', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 28 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '9%', background: '#000', transformOrigin: 'top', animation: 'prs-letterbox-in 0.5s ease forwards' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '9%', background: '#000', transformOrigin: 'bottom', animation: 'prs-letterbox-in 0.5s ease forwards' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '70%', height: '45%', background: `radial-gradient(ellipse, ${brandColor}30 0%, transparent 70%)`, animation: 'prs-glow-pulse 3s ease-in-out infinite 1s' }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <Stars baseDelay={0.4} size={18} />
          <div style={{ height: 18 }} />
          <WordReveal
            text="What our customers are saying"
            baseDelay={0.9}
            style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: `${brandFont}, system-ui`, lineHeight: 1.2, marginBottom: 14, textAlign: 'center' }}
          />
          <div style={{ opacity: 0, animation: 'prs-fade-in 0.6s ease forwards 2.2s', fontSize: 11, color: `${brandColor}`, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            {businessName}
          </div>
        </div>
        {PARTICLES.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.left, bottom: p.bottom, width: p.size, height: p.size, borderRadius: '50%', background: brandColor, animation: `prs-particle-drift ${p.dur} ease-out infinite`, animationDelay: p.delay }} />
        ))}
      </div>
    )
  }

  if (slideType === 'cta') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0a0a', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 28 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '9%', background: '#000', transformOrigin: 'top', animation: 'prs-letterbox-in 0.5s ease forwards' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '9%', background: '#000', transformOrigin: 'bottom', animation: 'prs-letterbox-in 0.5s ease forwards' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '70%', height: '45%', background: `radial-gradient(ellipse, ${brandColor}30 0%, transparent 70%)`, animation: 'prs-glow-pulse 3s ease-in-out infinite 1s' }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <WordReveal text="Ready to experience it yourself?" baseDelay={0.4}
            style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: `${brandFont}, system-ui`, lineHeight: 1.25, marginBottom: 24, textAlign: 'center' }} />
          <div style={{ opacity: 0, animation: 'prs-slide-up 0.5s ease forwards 1.8s' }}>
            <div style={{ display: 'inline-block', background: brandColor, color: '#fff', padding: '13px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700 }}>Book now →</div>
          </div>
          <div style={{ marginTop: 20, opacity: 0, animation: 'prs-fade-in 0.5s ease forwards 2.3s', fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>{businessName}</div>
        </div>
        {PARTICLES.slice(0, 5).map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.left, bottom: p.bottom, width: p.size, height: p.size, borderRadius: '50%', background: brandColor, animation: `prs-particle-drift ${p.dur} ease-out infinite`, animationDelay: p.delay }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0a0a', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px 28px 28px 28px' }}>
      {/* Letterbox */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '9%', background: '#000', transformOrigin: 'top', animation: 'prs-letterbox-in 0.5s ease forwards' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '9%', background: '#000', transformOrigin: 'bottom', animation: 'prs-letterbox-in 0.5s ease forwards' }} />
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: '40%', background: `radial-gradient(ellipse, ${brandColor}22 0%, transparent 70%)`, animation: 'prs-glow-pulse 4s ease-in-out infinite 2s', pointerEvents: 'none' }} />
      {/* Stars */}
      <div style={{ zIndex: 1, paddingTop: '10%' }}>
        <Stars baseDelay={0.4} size={16} />
      </div>
      {/* Quote */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 56, lineHeight: 0.6, color: brandColor, opacity: 0, animation: 'prs-fade-in 0.7s ease forwards 0.7s', fontFamily: 'Georgia, serif', marginBottom: 8 }}>&ldquo;</div>
        <WordReveal
          text={quote}
          baseDelay={1.0}
          style={{ fontSize: 14, lineHeight: 1.8, color: '#fff', fontFamily: `${brandFont}, Georgia, serif`, fontStyle: 'italic', marginBottom: 18 }}
        />
        {review.customer_name && (
          <div style={{ fontSize: 10, fontWeight: 700, color: brandColor, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0, animation: 'prs-slide-up 0.5s ease forwards', animationDelay: `${quoteEndDelay + 0.2}s` }}>
            — {review.customer_name}
          </div>
        )}
      </div>
      {/* Brand line */}
      <div style={{ zIndex: 1, paddingBottom: '10%' }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${brandColor}, transparent)`, transform: 'scaleX(0)', transformOrigin: 'left', animation: 'prs-line-draw 0.9s ease forwards', animationDelay: `${quoteEndDelay + 0.5}s`, marginBottom: 10 }} />
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.16em', opacity: 0, animation: 'prs-fade-in 0.5s ease forwards', animationDelay: `${quoteEndDelay + 0.9}s` }}>
          {businessName}
        </div>
      </div>
      {/* Particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.left, bottom: p.bottom, width: p.size, height: p.size, borderRadius: '50%', background: brandColor, animation: `prs-particle-drift ${p.dur} ease-out infinite`, animationDelay: p.delay }} />
      ))}
    </div>
  )
}

// ── TEMPLATE: Luxury ──────────────────────────────────────────

function TypewriterText({ text, style, baseDelay = 0 }: {
  text: string; style?: React.CSSProperties; baseDelay?: number
}) {
  const chars = text.split('')
  return (
    <div style={{ ...style, display: 'block' }}>
      {chars.map((c, i) => (
        <span key={i} style={{
          display: 'inline-block',
          whiteSpace: c === ' ' ? 'pre' : undefined,
          opacity: 0,
          animation: 'prs-char-in 0.08s ease forwards',
          animationDelay: `${baseDelay + i * 0.03}s`,
        }}>{c}</span>
      ))}
    </div>
  )
}

function LuxurySlide({ review, businessName, brandColor, brandFont, slideType }: {
  review: Review; businessName: string; brandColor: string; brandFont: string
  slideType: 'quote' | 'hook' | 'cta'
}) {
  const quote = review.what_they_liked.length > 120
    ? review.what_they_liked.slice(0, 117) + '...'
    : review.what_they_liked
  const charDelay = 0.9 + quote.length * 0.028

  const bg = '#f5f0e8'
  const ink = '#1a1814'

  if (slideType === 'hook') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 28 }}>
        {/* Shimmer beam */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: '30%', background: `linear-gradient(90deg, transparent, ${brandColor}18, transparent)`, animation: 'prs-shimmer 1.5s ease forwards 0.3s', pointerEvents: 'none' }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 48, color: brandColor, opacity: 0.15, fontFamily: 'Georgia, serif', lineHeight: 0.8, marginBottom: 8 }}>&ldquo;</div>
          <Stars baseDelay={0.4} color={brandColor} size={16} />
          <div style={{ height: 16 }} />
          <WordReveal text="What our customers are saying"
            baseDelay={0.9}
            style={{ fontSize: 22, fontWeight: 700, color: ink, fontFamily: `${brandFont}, Georgia, serif`, textAlign: 'center', lineHeight: 1.2, marginBottom: 16 }} />
          <div style={{ width: 40, height: 2, background: brandColor, margin: '0 auto', opacity: 0, animation: 'prs-fade-in 0.5s ease forwards 2.2s' }} />
          <div style={{ marginTop: 12, opacity: 0, animation: 'prs-fade-in 0.5s ease forwards 2.6s', fontSize: 10, color: brandColor, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700 }}>{businessName}</div>
        </div>
      </div>
    )
  }

  if (slideType === 'cta') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 28 }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: '30%', background: `linear-gradient(90deg, transparent, ${brandColor}18, transparent)`, animation: 'prs-shimmer 1.5s ease forwards 0.3s', pointerEvents: 'none' }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <WordReveal text="Experience it yourself." baseDelay={0.4}
            style={{ fontSize: 24, fontWeight: 700, color: ink, fontFamily: `${brandFont}, Georgia, serif`, textAlign: 'center', marginBottom: 24 }} />
          <div style={{ opacity: 0, animation: 'prs-slide-up 0.5s ease forwards 1.8s' }}>
            <div style={{ display: 'inline-block', background: brandColor, color: '#fff', padding: '12px 32px', borderRadius: 6, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>Book now →</div>
          </div>
          <div style={{ marginTop: 24, opacity: 0, animation: 'prs-fade-in 0.5s ease forwards 2.3s', fontSize: 10, color: brandColor, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700 }}>{businessName}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 28 }}>
      {/* Shimmer sweep */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, width: '30%', background: `linear-gradient(90deg, transparent, ${brandColor}18, transparent)`, animation: 'prs-shimmer 1.4s ease forwards 0.2s', pointerEvents: 'none', zIndex: 2 }} />
      {/* Decorative quote */}
      <div style={{ fontSize: 80, color: brandColor, opacity: 0.08, fontFamily: 'Georgia, serif', lineHeight: 0.6, userSelect: 'none' }}>&ldquo;</div>
      {/* Stars */}
      <div style={{ position: 'absolute', top: 28, left: 28, zIndex: 1 }}>
        <Stars baseDelay={0.5} color={brandColor} size={14} />
      </div>
      {/* Quote */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
        <TypewriterText text={`"${quote}"`}
          baseDelay={0.8}
          style={{ fontSize: 14, lineHeight: 1.8, color: ink, fontFamily: `${brandFont}, Georgia, serif`, fontStyle: 'italic', marginBottom: 18 }} />
        {review.customer_name && (
          <div style={{ fontSize: 10, fontWeight: 700, color: brandColor, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0, animation: 'prs-slide-right 0.5s ease forwards', animationDelay: `${charDelay}s` }}>
            — {review.customer_name}
          </div>
        )}
      </div>
      {/* Brand */}
      <div style={{ zIndex: 1 }}>
        <div style={{ width: '100%', height: 1, background: `linear-gradient(90deg, ${brandColor}80, transparent)`, transform: 'scaleX(0)', transformOrigin: 'left', animation: 'prs-line-draw 0.8s ease forwards', animationDelay: `${charDelay + 0.3}s`, marginBottom: 10 }} />
        <div style={{ fontSize: 10, fontWeight: 700, color: brandColor, textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0, animation: 'prs-fade-in 0.5s ease forwards', animationDelay: `${charDelay + 0.7}s` }}>{businessName}</div>
      </div>
    </div>
  )
}

// ── TEMPLATE: Impact ──────────────────────────────────────────

function ImpactSlide({ review, businessName, brandColor, brandFont, slideType }: {
  review: Review; businessName: string; brandColor: string; brandFont: string
  slideType: 'quote' | 'hook' | 'cta'
}) {
  const quote = review.what_they_liked.length > 110
    ? review.what_they_liked.slice(0, 107) + '...'
    : review.what_they_liked

  if (slideType === 'hook') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: brandColor, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 28 }}>
        {/* Geometric accent */}
        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 140, height: 140, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', opacity: 0, animation: 'prs-spin-in 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards 0.2s' }} />
        <div style={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', opacity: 0, animation: 'prs-spin-in 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards 0.4s' }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 20, opacity: 0, animation: 'prs-slam-in 0.45s cubic-bezier(0.175,0.885,0.32,1.275) forwards 0.3s' }}>{businessName}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: `${brandFont}, system-ui`, lineHeight: 1.1, textTransform: 'uppercase', marginBottom: 20, opacity: 0, animation: 'prs-slam-in 0.45s cubic-bezier(0.175,0.885,0.32,1.275) forwards 0.6s' }}>
            Real talk from<br/>real customers
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Stars baseDelay={1.1} color="#fff" size={20} />
          </div>
        </div>
      </div>
    )
  }

  if (slideType === 'cta') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: brandColor, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 28 }}>
        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 140, height: 140, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', opacity: 0, animation: 'prs-spin-in 0.7s ease forwards 0.2s' }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', fontFamily: `${brandFont}, system-ui`, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 28, opacity: 0, animation: 'prs-slam-in 0.45s cubic-bezier(0.175,0.885,0.32,1.275) forwards 0.4s' }}>
            Don&apos;t just<br/>take our word<br/>for it.
          </div>
          <div style={{ opacity: 0, animation: 'prs-slide-up 0.4s ease forwards 1.2s' }}>
            <div style={{ display: 'inline-block', background: '#fff', color: brandColor, padding: '14px 36px', borderRadius: 8, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Book now →</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: brandColor, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 28 }}>
      {/* Corner geometry */}
      <div style={{ position: 'absolute', top: -30, left: -30, width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', opacity: 0, animation: 'prs-spin-in 0.7s ease forwards 0.1s' }} />
      {/* Stars */}
      <div style={{ zIndex: 1 }}>
        <Stars baseDelay={0.3} color="#fff" size={18} />
      </div>
      {/* Quote — slams in */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: `${brandFont}, system-ui`, lineHeight: 1.65, marginBottom: 20, opacity: 0, animation: 'prs-slam-in 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards 0.7s' }}>
          &ldquo;{quote}&rdquo;
        </div>
        {review.customer_name && (
          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0, animation: 'prs-fade-in 0.4s ease forwards 1.4s' }}>
            — {review.customer_name}
          </div>
        )}
      </div>
      {/* Brand */}
      <div style={{ zIndex: 1 }}>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.3)', transform: 'scaleX(0)', transformOrigin: 'left', animation: 'prs-line-draw 0.7s ease forwards 1.8s', marginBottom: 10 }} />
        <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0, animation: 'prs-fade-in 0.4s ease forwards 2.2s' }}>{businessName}</div>
      </div>
    </div>
  )
}

// ── TEMPLATE: Glow ────────────────────────────────────────────

function GlowSlide({ review, businessName, brandColor, brandFont, slideType }: {
  review: Review; businessName: string; brandColor: string; brandFont: string
  slideType: 'quote' | 'hook' | 'cta'
}) {
  const quote = review.what_they_liked.length > 115
    ? review.what_they_liked.slice(0, 112) + '...'
    : review.what_they_liked
  const wordCount = quote.split(' ').length
  const quoteEndDelay = 0.8 + wordCount * 0.07

  const bgGrad = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)'

  if (slideType === 'hook') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: bgGrad, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 28 }}>
        {/* Glow orb */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '80%', background: `radial-gradient(ellipse, ${brandColor}35 0%, transparent 70%)`, animation: 'prs-glow-pulse 3s ease-in-out infinite', borderRadius: '50%' }} />
        <div style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
          {/* Glowing brand mark */}
          <div style={{ width: 52, height: 52, borderRadius: 14, background: brandColor, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: `0 0 40px ${brandColor}80`, opacity: 0, animation: 'prs-scale-in 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards 0.3s' }}>⚡</div>
          <WordReveal text="Voices that matter."
            baseDelay={0.9}
            style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: `${brandFont}, system-ui`, textAlign: 'center', marginBottom: 12 }} />
          <div style={{ opacity: 0, animation: 'prs-fade-in 0.5s ease forwards 2s', fontSize: 11, color: `${brandColor}`, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 }}>{businessName}</div>
        </div>
        {PARTICLES.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.left, bottom: p.bottom, width: p.size, height: p.size, borderRadius: '50%', background: brandColor, boxShadow: `0 0 6px ${brandColor}`, animation: `prs-particle-drift ${p.dur} ease-out infinite`, animationDelay: p.delay }} />
        ))}
      </div>
    )
  }

  if (slideType === 'cta') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: bgGrad, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 28 }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '80%', background: `radial-gradient(ellipse, ${brandColor}35 0%, transparent 70%)`, animation: 'prs-glow-pulse 3s ease-in-out infinite', borderRadius: '50%' }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <WordReveal text="Come see what the buzz is about." baseDelay={0.4}
            style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: `${brandFont}, system-ui`, textAlign: 'center', marginBottom: 28 }} />
          <div style={{ opacity: 0, animation: 'prs-slide-up 0.5s ease forwards 2s' }}>
            <div style={{ display: 'inline-block', background: brandColor, color: '#fff', padding: '13px 34px', borderRadius: 10, fontSize: 14, fontWeight: 700, boxShadow: `0 0 30px ${brandColor}60` }}>Book now →</div>
          </div>
          <div style={{ marginTop: 22, opacity: 0, animation: 'prs-fade-in 0.5s ease forwards 2.5s', fontSize: 10, color: `${brandColor}`, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 }}>{businessName}</div>
        </div>
        {PARTICLES.slice(0, 5).map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.left, bottom: p.bottom, width: p.size, height: p.size, borderRadius: '50%', background: brandColor, boxShadow: `0 0 6px ${brandColor}`, animation: `prs-particle-drift ${p.dur} ease-out infinite`, animationDelay: p.delay }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: bgGrad, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 28 }}>
      {/* Glow orb behind content */}
      <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', height: '70%', background: `radial-gradient(ellipse, ${brandColor}28 0%, transparent 70%)`, animation: 'prs-glow-pulse 4s ease-in-out infinite', borderRadius: '50%', pointerEvents: 'none' }} />
      {/* Stars */}
      <div style={{ zIndex: 1 }}>
        <Stars baseDelay={0.4} color={brandColor} size={16} />
      </div>
      {/* Quote */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 52, lineHeight: 0.7, color: brandColor, opacity: 0, animation: 'prs-fade-in 0.7s ease forwards 0.6s', fontFamily: 'Georgia, serif', marginBottom: 10, textShadow: `0 0 30px ${brandColor}` }}>&ldquo;</div>
        <WordReveal
          text={quote}
          baseDelay={0.8}
          style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.92)', fontFamily: `${brandFont}, Georgia, serif`, fontStyle: 'italic', marginBottom: 18 }}
        />
        {review.customer_name && (
          <div style={{ fontSize: 10, fontWeight: 700, color: brandColor, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0, animation: 'prs-slide-up 0.5s ease forwards', animationDelay: `${quoteEndDelay + 0.2}s`, textShadow: `0 0 15px ${brandColor}80` }}>
            — {review.customer_name}
          </div>
        )}
      </div>
      {/* Brand */}
      <div style={{ zIndex: 1 }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${brandColor}, transparent)`, transform: 'scaleX(0)', transformOrigin: 'left', animation: 'prs-line-draw 0.8s ease forwards', animationDelay: `${quoteEndDelay + 0.5}s`, marginBottom: 10 }} />
        <div style={{ fontSize: 10, fontWeight: 700, color: `${brandColor}99`, textTransform: 'uppercase', letterSpacing: '0.16em', opacity: 0, animation: 'prs-fade-in 0.5s ease forwards', animationDelay: `${quoteEndDelay + 0.9}s` }}>{businessName}</div>
      </div>
      {/* Glowing particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.left, bottom: p.bottom, width: p.size, height: p.size, borderRadius: '50%', background: brandColor, boxShadow: `0 0 8px ${brandColor}`, animation: `prs-particle-drift ${p.dur} ease-out infinite`, animationDelay: p.delay }} />
      ))}
    </div>
  )
}

// ── Wall-of-love review card (multi-review slides) ────────────

function MultiReviewSlide({ r, businessName, brandColor, brandFont, template, index }: {
  r: Review; businessName: string; brandColor: string; brandFont: string; template: Template; index: number
}) {
  const quote = r.what_they_liked.length > 140 ? r.what_they_liked.slice(0, 137) + '...' : r.what_they_liked
  const isCinematic = template === 'cinematic'
  const isGlow = template === 'glow'
  const isImpact = template === 'impact'

  const bg = isCinematic ? '#0a0a0a' : isGlow ? 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' : isImpact ? brandColor : '#f5f0e8'
  const textColor = (isCinematic || isGlow || isImpact) ? '#fff' : '#1a1814'
  const subtextColor = (isCinematic || isGlow || isImpact) ? `${brandColor}` : brandColor

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 28 }}>
      {isGlow && (
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '60%', background: `radial-gradient(ellipse, ${brandColor}22 0%, transparent 70%)`, borderRadius: '50%', animation: 'prs-glow-pulse 4s ease-in-out infinite' }} />
      )}
      <div style={{ zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 2, marginBottom: 16, opacity: 0, animation: 'prs-fade-in 0.5s ease forwards 0.3s' }}>
          {Array.from({ length: r.star_rating }).map((_, i) => (
            <span key={i} style={{ color: '#f59e0b', fontSize: 14, display: 'inline-block', opacity: 0, animation: 'prs-star-in 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards', animationDelay: `${0.4 + i * 0.1}s` }}>★</span>
          ))}
        </div>
        <WordReveal text={`"${quote}"`} baseDelay={0.9}
          style={{ fontSize: 13, lineHeight: 1.8, color: textColor, fontFamily: `${brandFont}, Georgia, serif`, fontStyle: 'italic', marginBottom: 16 }} />
        {r.customer_name && (
          <div style={{ fontSize: 10, fontWeight: 700, color: subtextColor, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0, animation: 'prs-slide-up 0.5s ease forwards', animationDelay: `${0.9 + quote.split(' ').length * 0.07 + 0.2}s` }}>
            — {r.customer_name}
          </div>
        )}
      </div>
      <div style={{ zIndex: 1 }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${brandColor}, transparent)`, transform: 'scaleX(0)', transformOrigin: 'left', animation: 'prs-line-draw 0.7s ease forwards 2s', marginBottom: 10 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: `${subtextColor}90`, textTransform: 'uppercase', letterSpacing: '0.16em', opacity: 0, animation: 'prs-fade-in 0.4s ease forwards 2.3s' }}>{businessName}</div>
          <div style={{ fontSize: 9, color: `${subtextColor}70`, opacity: 0, animation: 'prs-fade-in 0.4s ease forwards 2.3s' }}>{index + 1} of many</div>
        </div>
      </div>
      {(isCinematic || isGlow) && PARTICLES.slice(0, 5).map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.left, bottom: p.bottom, width: p.size, height: p.size, borderRadius: '50%', background: brandColor, animation: `prs-particle-drift ${p.dur} ease-out infinite`, animationDelay: p.delay }} />
      ))}
    </div>
  )
}

// ── SlidePreview dispatcher ────────────────────────────────────

interface SlideProps {
  format: Format; template: Template; slide: number
  review: Review; carouselReviews: Review[]
  businessName: string; brandColor: string; brandFont: string
  animKey: number
}

const SlidePreview = forwardRef<HTMLDivElement, SlideProps>(
  ({ format, template, slide, review, carouselReviews, businessName, brandColor, brandFont, animKey }, ref) => {

    function getSlideType(): 'quote' | 'hook' | 'cta' {
      if (format === 'static') return 'quote'
      if (format === 'carousel-single') {
        return slide === 0 ? 'hook' : slide === 1 ? 'quote' : 'cta'
      }
      // carousel-multi: slide 0 = hook, last = cta, middle = reviews
      const total = carouselReviews.length + 1
      if (slide === 0) return 'hook'
      if (slide === total - 1) return 'cta'
      return 'quote'
    }

    const slideType = getSlideType()

    // For wall-of-love middle slides, render the multi-review card
    const isMultiReviewSlide = format === 'carousel-multi' && slideType === 'quote'
    const multiReview = isMultiReviewSlide ? carouselReviews[slide - 1] : null

    function renderSlide() {
      if (isMultiReviewSlide && multiReview) {
        return <MultiReviewSlide r={multiReview} businessName={businessName} brandColor={brandColor} brandFont={brandFont} template={template} index={slide - 1} />
      }
      const props = { review, businessName, brandColor, brandFont, slideType }
      switch (template) {
        case 'cinematic': return <CinematicSlide {...props} />
        case 'luxury':    return <LuxurySlide    {...props} />
        case 'impact':    return <ImpactSlide    {...props} />
        case 'glow':      return <GlowSlide      {...props} />
      }
    }

    return (
      <div ref={ref} key={animKey} style={{
        width: '100%', aspectRatio: '1/1', borderRadius: 16,
        overflow: 'hidden', position: 'relative',
        fontFamily: `${brandFont}, system-ui, sans-serif`,
      }}>
        {renderSlide()}
      </div>
    )
  }
)
SlidePreview.displayName = 'SlidePreview'

// ── Main PostCreator ──────────────────────────────────────────

export function PostCreator({ review, reviews, businessName, industry, brandColor, brandFont, onBack }: Props) {
  useAnimationStyles()

  const [format, setFormat]               = useState<Format>('static')
  const [template, setTemplate]           = useState<Template>('cinematic')
  const [caption, setCaption]             = useState('')
  const [generating, setGenerating]       = useState(false)
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [downloading, setDownloading]     = useState(false)
  const [scheduleMode, setScheduleMode]   = useState<ScheduleMode>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [currentSlide, setCurrentSlide]   = useState(0)
  const [animKey, setAnimKey]             = useState(0)
  const slideRef = useRef<HTMLDivElement>(null)

  const carouselReviews = format === 'carousel-multi'
    ? [review, ...reviews.filter(r => r.id !== review.id && r.star_rating === 5).slice(0, 4)]
    : [review]

  const totalSlides = format === 'carousel-single' ? 3 : format === 'carousel-multi' ? carouselReviews.length + 1 : 1

  // Auto-replay animations every 7s
  useEffect(() => {
    const t = setInterval(() => setAnimKey(k => k + 1), 7000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { generateCaption() }, [])
  useEffect(() => { setCurrentSlide(0); setAnimKey(k => k + 1) }, [format, template])

  async function generateCaption() {
    setGenerating(true)
    const res = await fetch('/api/generate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName, industry, reviewText: review.what_they_liked, brandColor }),
    })
    const data = await res.json()
    setCaption(data.caption)
    setGenerating(false)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const scheduledFor = scheduleMode === 'later' && scheduledDate
      ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      : null
    await supabase.from('social_posts').insert({
      business_id: review.business_id,
      review_id: review.id,
      caption,
      status: scheduleMode === 'later' && scheduledFor ? 'scheduled' : 'draft',
      scheduled_for: scheduledFor,
    })
    setSaved(true)
    setSaving(false)
  }

  async function handleDownloadSlide() {
    if (!slideRef.current) return
    setDownloading(true)
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(slideRef.current, { scale: 3, useCORS: true, backgroundColor: null })
    const link = document.createElement('a')
    link.download = `${businessName}-slide-${currentSlide + 1}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setDownloading(false)
  }

  async function handleDownloadAll() {
    if (!slideRef.current) return
    setDownloading(true)
    const html2canvas = (await import('html2canvas')).default
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    for (let i = 0; i < totalSlides; i++) {
      setCurrentSlide(i)
      setAnimKey(k => k + 1)
      await new Promise(r => setTimeout(r, 200))
      const canvas = await html2canvas(slideRef.current!, { scale: 3, useCORS: true, backgroundColor: null })
      const blob = await new Promise<Blob>(r => canvas.toBlob(b => r(b!), 'image/png'))
      zip.file(`${businessName}-slide-${i + 1}.png`, blob)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const link = document.createElement('a')
    link.download = `${businessName}-carousel.zip`
    link.href = URL.createObjectURL(zipBlob)
    link.click()
    setCurrentSlide(0)
    setDownloading(false)
  }

  const TEMPLATES: { id: Template; label: string; desc: string }[] = [
    { id: 'cinematic', label: 'Cinematic', desc: 'Dark · letterbox · word reveal' },
    { id: 'luxury',    label: 'Luxury',    desc: 'Cream · shimmer · typewriter'  },
    { id: 'impact',    label: 'Impact',    desc: 'Bold · slam · high energy'     },
    { id: 'glow',      label: 'Glow',      desc: 'Dark · orb · floating light'   },
  ]

  return (
    <div className="w-full">
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-opacity" style={{ color: 'var(--ink3)' }}>
        ← Back to reviews
      </button>

      <div className="grid grid-cols-2 gap-8">
        {/* LEFT: preview */}
        <div>
          {/* Format */}
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--ink3)' }}>Format</p>
          <div className="flex gap-2 mb-4">
            {([
              { id: 'static',          label: '1 Image' },
              { id: 'carousel-single', label: 'Story (3 slides)' },
              { id: 'carousel-multi',  label: 'Wall of love' },
            ] as { id: Format; label: string }[]).map(f => (
              <button key={f.id} onClick={() => setFormat(f.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                style={{
                  background: format === f.id ? 'var(--ink)' : 'white',
                  color: format === f.id ? 'white' : 'var(--ink3)',
                  borderColor: format === f.id ? 'var(--ink)' : 'var(--border)',
                }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Template */}
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--ink3)' }}>Animation style</p>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                className="px-3 py-2.5 rounded-xl text-xs border transition-all text-left"
                style={{
                  background: template === t.id ? brandColor : 'white',
                  color: template === t.id ? 'white' : 'var(--ink2)',
                  borderColor: template === t.id ? brandColor : 'var(--border)',
                }}>
                <div className="font-bold mb-0.5">{t.label}</div>
                <div style={{ fontSize: 9, opacity: 0.75, lineHeight: 1.3 }}>{t.desc}</div>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div style={{ position: 'relative' }}>
            <SlidePreview
              ref={slideRef}
              format={format}
              template={template}
              slide={currentSlide}
              review={review}
              carouselReviews={carouselReviews}
              businessName={businessName}
              brandColor={brandColor}
              brandFont={brandFont}
              animKey={animKey}
            />
            {/* Replay button */}
            <button
              onClick={() => setAnimKey(k => k + 1)}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(0,0,0,0.55)', color: 'white', backdropFilter: 'blur(8px)' }}
            >
              ↺ Replay
            </button>
          </div>

          {/* Slide nav */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => { setCurrentSlide(s => Math.max(0, s - 1)); setAnimKey(k => k + 1) }}
                disabled={currentSlide === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                style={{ borderColor: 'var(--border)', color: 'var(--ink2)' }}
              >
                ← Prev
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button key={i} onClick={() => { setCurrentSlide(i); setAnimKey(k => k + 1) }}
                    className="rounded-full transition-all"
                    style={{ width: currentSlide === i ? 20 : 8, height: 8, background: currentSlide === i ? brandColor : 'var(--border2)' }} />
                ))}
              </div>
              <button
                onClick={() => { setCurrentSlide(s => Math.min(totalSlides - 1, s + 1)); setAnimKey(k => k + 1) }}
                disabled={currentSlide === totalSlides - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                style={{ borderColor: 'var(--border)', color: 'var(--ink2)' }}
              >
                Next →
              </button>
            </div>
          )}

          {/* Download */}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleDownloadSlide} loading={downloading}>
              ↓ This slide
            </Button>
            {totalSlides > 1 && (
              <Button variant="outline" size="sm" className="flex-1" onClick={handleDownloadAll} loading={downloading}>
                ↓ All slides (ZIP)
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT: caption + schedule */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--ink3)' }}>Caption</p>
            {generating ? (
              <div className="flex items-center gap-3 py-6">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: brandColor, borderTopColor: 'transparent' }} />
                <p className="text-sm" style={{ color: 'var(--ink3)' }}>Writing caption...</p>
              </div>
            ) : (
              <>
                <textarea value={caption} onChange={e => setCaption(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink2)', background: 'white', minHeight: 180, lineHeight: 1.65 }}
                  onFocus={e => e.target.style.borderColor = brandColor}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button onClick={generateCaption} className="text-xs mt-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
                  ↺ Regenerate caption
                </button>
              </>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--ink3)' }}>When to post</p>
            <div className="flex gap-2 mb-3">
              {(['now', 'later'] as ScheduleMode[]).map(m => (
                <button key={m} onClick={() => setScheduleMode(m)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                  style={{
                    background: scheduleMode === m ? 'var(--ink)' : 'white',
                    color: scheduleMode === m ? 'white' : 'var(--ink3)',
                    borderColor: scheduleMode === m ? 'var(--ink)' : 'var(--border)',
                  }}>
                  {m === 'now' ? 'Post now' : 'Schedule for later'}
                </button>
              ))}
            </div>
            {scheduleMode === 'later' && (
              <div className="flex gap-2">
                <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink2)' }} />
                <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                  className="w-28 px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink2)' }} />
              </div>
            )}
          </div>

          <Button size="lg" onClick={handleSave} loading={saving} disabled={saved || !caption} className="w-full">
            {saved ? '✓ Saved!' : scheduleMode === 'now' ? '✦ Save to content library' : '🗓 Schedule post'}
          </Button>

          {saved && (
            <p className="text-xs text-center" style={{ color: 'var(--ink3)' }}>
              View all posts in the <a href="/content" style={{ color: 'var(--accent)' }}>Content tab →</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
