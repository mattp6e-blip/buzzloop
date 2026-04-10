'use client'
import { useState, useEffect, useRef } from 'react'

const ACCENT = '#e8470a'
const INK = '#1a1814'
const INK3 = '#7a766e'
const INK4 = '#b0aca4'
const BORDER = '#e8e5df'

const KEYWORDS = [
  { term: 'dentist near me', from: 9, to: 3, delay: 0 },
  { term: 'dental implants Barcelona', from: 7, to: 1, delay: 350 },
  { term: 'teeth whitening Barcelona', from: 13, to: 4, delay: 700 },
]

function rankStyle(rank: number) {
  if (rank <= 3) return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' }
  if (rank <= 7) return { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' }
  return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' }
}

function useAnimatedValue(from: number, to: number, duration: number, delay: number, started: boolean) {
  const [value, setValue] = useState(from)
  useEffect(() => {
    if (!started) { setValue(from); return }
    let rafId: number
    const startTs = performance.now() + delay
    const tick = (now: number) => {
      if (now < startTs) { rafId = requestAnimationFrame(tick); return }
      const p = Math.min((now - startTs) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(from - (from - to) * ease))
      if (p < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [started, from, to, duration, delay])
  return value
}

function KeywordRow({ term, from, to, delay, started }: typeof KEYWORDS[0] & { started: boolean }) {
  const rank = useAnimatedValue(from, to, 1600, delay, started)
  const s = rankStyle(rank)
  const done = rank === to && started

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: INK, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{term}</p>
      </div>
      <div style={{
        width: 40, height: 26, borderRadius: 7,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, flexShrink: 0,
        transition: 'background 0.3s, color 0.3s, border-color 0.3s',
      }}>
        #{rank}
      </div>
      <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {done && (
          <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 800, animation: 'fadeIn 0.4s ease' }}>
            ↑{from - to}
          </span>
        )}
      </div>
    </div>
  )
}

export function RankingDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Re-trigger animation every 6s
  useEffect(() => {
    if (!started) return
    const t = setInterval(() => { setStarted(false); setTimeout(() => setStarted(true), 60) }, 6500)
    return () => clearInterval(t)
  }, [started])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(3px) } to { opacity: 1; transform: none } }`}</style>

      {/* Competitor card behind, peeking out */}
      <div style={{
        position: 'absolute', bottom: -18, right: -28, width: 240,
        background: 'white', borderRadius: 14, padding: '12px 14px',
        boxShadow: '0 6px 28px rgba(0,0,0,0.18)',
        zIndex: 1, opacity: 0.9,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🏢</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: INK4, margin: '0 0 4px' }}>Nearest competitor</p>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ height: 5, width: 50, borderRadius: 3, background: '#fee2e2', opacity: 0.7 }} />
              <div style={{ height: 5, width: 32, borderRadius: 3, background: '#fee2e2', opacity: 0.5 }} />
            </div>
          </div>
          <div style={{ width: 32, height: 22, borderRadius: 6, background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
            #8
          </div>
        </div>
      </div>

      {/* Main card */}
      <div style={{
        background: 'white', borderRadius: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,0.32), 0 4px 16px rgba(0,0,0,0.16)',
        padding: '20px 22px', width: 318, position: 'relative', zIndex: 2,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: INK, margin: '0 0 2px', letterSpacing: '-0.01em' }}>Google Rankings</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s ease infinite' }} />
              <p style={{ fontSize: 10.5, color: INK4, margin: 0 }}>3 keywords tracked · updated today</p>
            </div>
          </div>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>↑</span>
          </div>
        </div>

        {/* Keyword rows */}
        {KEYWORDS.map(k => (
          <KeywordRow key={k.term} {...k} started={started} />
        ))}

        {/* Footer */}
        <div style={{ paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 11, color: INK4, margin: 0 }}>2 competitors monitored</p>
          <div style={{ display: 'flex', gap: 4 }}>
            {['#c9d4e0', '#dde6f0'].map((c, i) => (
              <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i > 0 ? -6 : 0 }} />
            ))}
          </div>
        </div>
      </div>

      {/* GBP health mini card — floats top left */}
      <div style={{
        position: 'absolute', top: -22, left: -32, width: 172,
        background: 'white', borderRadius: 14, padding: '10px 14px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
        zIndex: 3,
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: INK4, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Profile Health</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '82%', background: `linear-gradient(to right, ${ACCENT}, #ff6b35)`, borderRadius: 3, transition: 'width 1s ease' }} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 800, color: ACCENT, margin: 0 }}>82</p>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
    </div>
  )
}
