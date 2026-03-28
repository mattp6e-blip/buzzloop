import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion'

const ease = Easing.bezier(0.16, 1, 0.3, 1)

// ── Step 1: QR scan → 5-star review ──────────────────────────────────────────
export function Step1Scene() {
  const frame = useCurrentFrame()

  const starDelay = 18
  const stars = [0, 1, 2, 3, 4].map(i => ({
    filled: frame > starDelay + i * 6,
    scale: interpolate(frame, [starDelay + i * 6, starDelay + i * 6 + 8], [0.4, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease }),
  }))

  const submitProgress = interpolate(frame, [52, 66], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
  const googleProgress = interpolate(frame, [68, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
  const fadeOut = interpolate(frame, [88, 96], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fadeOut }}>
      {/* Phone frame */}
      <div style={{
        width: 260, background: 'white', borderRadius: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
        padding: '28px 24px 32px',
      }}>
        {/* QR badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e8470a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" fill="white"/>
              <rect x="14" y="3" width="7" height="7" rx="1" fill="white"/>
              <rect x="3" y="14" width="7" height="7" rx="1" fill="white"/>
              <rect x="14" y="14" width="3" height="3" fill="white"/>
              <rect x="18" y="14" width="3" height="3" fill="white"/>
              <rect x="14" y="18" width="3" height="3" fill="white"/>
              <rect x="18" y="18" width="3" height="3" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a' }}>Harmonia Dental</div>
            <div style={{ fontSize: 10, color: '#888' }}>Rate your visit</div>
          </div>
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6, letterSpacing: '-0.02em' }}>
          How was your experience?
        </div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 20 }}>Takes under 10 seconds</div>

        {/* Stars */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {stars.map((s, i) => (
            <div key={i} style={{
              fontSize: 32, transform: `scale(${s.scale})`,
              color: s.filled ? '#fbbc04' : '#e0e0e0',
              transition: 'color 0.1s',
            }}>★</div>
          ))}
        </div>

        {/* Submit button */}
        <div style={{
          width: '100%', padding: '12px 0', borderRadius: 12, textAlign: 'center',
          background: submitProgress > 0
            ? `linear-gradient(90deg, #e8470a ${submitProgress * 100}%, #ff6b35 100%)`
            : '#f0f0f0',
          color: submitProgress > 0 ? 'white' : '#bbb',
          fontSize: 13, fontWeight: 700,
          transition: 'background 0.3s',
        }}>
          {submitProgress > 0.5 ? 'Submitting...' : 'Submit review'}
        </div>

        {/* Google redirect */}
        {googleProgress > 0 && (
          <div style={{ marginTop: 14, opacity: googleProgress, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Taking you to Google...</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

// ── Step 2: Review → Reel transformation ─────────────────────────────────────
export function Step2Scene() {
  const frame = useCurrentFrame()

  const cardX = interpolate(frame, [0, 18], [-320, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
  const cardOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const arrowScale = interpolate(frame, [30, 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
  const reelX = interpolate(frame, [44, 62], [320, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
  const reelOpacity = interpolate(frame, [44, 62], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      {/* Review card */}
      <div style={{
        transform: `translateX(${cardX}px)`, opacity: cardOpacity,
        background: 'white', borderRadius: 16, padding: '18px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)', width: 180,
      }}>
        <div style={{ display: 'flex', gap: 1, marginBottom: 10 }}>
          {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#fbbc04', fontSize: 13 }}>★</span>)}
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.6, color: '#3c4043', marginBottom: 12 }}>
          "I'd rather fly from Norway than go to a dentist in Norway."
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>T</div>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#1a1a1a' }}>Taltunran</span>
        </div>
      </div>

      {/* Arrow */}
      <div style={{ transform: `scale(${arrowScale})`, fontSize: 24, color: '#e8470a', fontWeight: 700, flexShrink: 0 }}>→</div>

      {/* Reel */}
      <div style={{
        transform: `translateX(${reelX}px)`, opacity: reelOpacity,
        width: 90, height: 160, borderRadius: 14,
        background: 'linear-gradient(160deg, #1a1a2e 0%, #0d0d1a 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 10, textAlign: 'center', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#833AB4,#E1306C,#F77737)' }} />
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Harmonia Dental</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'white', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
          "People take a plane to see this dentist."
        </div>
        <div style={{ marginTop: 10, width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid white', marginLeft: 2 }} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Step 3: Fresh reels cascading ─────────────────────────────────────────────
const REEL_TEXTS = [
  '"People take a plane to see this dentist."',
  '"I\'d rather fly from Norway than go elsewhere."',
  '"They make you feel in good hands."',
  '"Coming from Mallorca — that says it all."',
]

export function Step3Scene() {
  const frame = useCurrentFrame()

  const cards = REEL_TEXTS.map((text, i) => {
    const appearAt = i * 16
    const opacity = interpolate(frame, [appearAt, appearAt + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const y = interpolate(frame, [appearAt, appearAt + 14], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
    const rotate = [-6, -2, 2, 6][i]
    const x = [-36, -12, 12, 36][i]
    return { text, opacity, y, rotate, x }
  })

  return (
    <AbsoluteFill style={{ background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 260, height: 200 }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(calc(-50% + ${c.x}px), calc(-50% + ${c.y}px)) rotate(${c.rotate}deg)`,
            opacity: c.opacity,
            width: 90, height: 160, borderRadius: 14,
            background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 10, textAlign: 'center',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#833AB4,#E1306C,#F77737)' }} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Harmonia Dental</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'white', lineHeight: 1.4, letterSpacing: '-0.01em' }}>{c.text}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  )
}

// ── Step 4: Flywheel ──────────────────────────────────────────────────────────
const FLYWHEEL_NODES = ['More reviews', 'Better ranking', 'More reach', 'More customers']

export function Step4Scene() {
  const frame = useCurrentFrame()

  const rotation = interpolate(frame, [0, 120], [0, 360], { extrapolateRight: 'clamp' })
  const cx = 200, cy = 180, r = 110

  return (
    <AbsoluteFill style={{ background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="400" height="360" viewBox="0 0 400 360">
        {/* Spinning ring */}
        <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8470a" strokeWidth="2" strokeDasharray="18 12" strokeLinecap="round" opacity="0.35" />
          {/* Arrow heads at top and bottom of ring */}
          {[0, 180].map(deg => {
            const rad = (deg * Math.PI) / 180
            const x = cx + r * Math.sin(rad)
            const y = cy - r * Math.cos(rad)
            const tx = Math.cos(rad) * 10
            const ty = Math.sin(rad) * 10
            return (
              <polygon key={deg}
                points={`${x},${y} ${x - tx + ty * 0.5},${y - ty - tx * 0.5} ${x - tx - ty * 0.5},${y - ty + tx * 0.5}`}
                fill="#e8470a" opacity="0.7"
              />
            )
          })}
        </g>

        {/* Nodes */}
        {FLYWHEEL_NODES.map((label, i) => {
          const angle = (i / 4) * 2 * Math.PI - Math.PI / 2
          const x = cx + r * Math.cos(angle)
          const y = cy + r * Math.sin(angle)
          const pulse = interpolate(
            (frame + i * 30) % 120,
            [0, 20, 40],
            [1, 1.15, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease }
          )
          return (
            <g key={label}>
              <circle cx={x} cy={y} r={22 * pulse} fill="white" stroke="#e8470a" strokeWidth="1.5" filter="url(#shadow)" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#e8470a">{label.split(' ')[0]}</text>
              <text x={x} y={y + 15} textAnchor="middle" fontSize="9" fontWeight="700" fill="#e8470a">{label.split(' ').slice(1).join(' ')}</text>
            </g>
          )
        })}

        {/* Centre */}
        <circle cx={cx} cy={cy} r={32} fill="#e8470a" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fontWeight="800" fill="white">Buzz</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fontWeight="800" fill="white">loop</text>

        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" />
          </filter>
        </defs>
      </svg>
    </AbsoluteFill>
  )
}
