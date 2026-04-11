import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { CounterText } from './CounterText'

interface GoogleCardProps {
  businessName: string
  rating: number          // e.g., 4.8
  reviewCount: number     // e.g., 127
  category?: string       // e.g., "Dental Clinic"
  delay?: number
}

// Signature feature: animates a Google Business Profile search result card.
// Stars fill one by one with gold glow, rating and review count count up.
// Use inside ProofScene or as a standalone scene background element.
export function GoogleCard({
  businessName,
  rating,
  reviewCount,
  category = 'Local Business',
  delay = 0,
}: GoogleCardProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = Math.max(0, frame - delay)

  // Card entrance
  const cardSpring = spring({ frame: f, fps, config: { stiffness: 68, damping: 16 } })
  const cardY = interpolate(cardSpring, [0, 1], [90, 0])
  const cardOpacity = interpolate(f, [0, 18], [0, 1], { extrapolateRight: 'clamp' })

  // Stars: each springs in with 7-frame stagger starting at frame 20
  const stars = Array.from({ length: 5 }, (_, i) => {
    const sf = Math.max(0, f - 20 - i * 7)
    const s = spring({ frame: sf, fps, config: { stiffness: 280, damping: 11 } })
    const filled = i < Math.floor(rating) || (i === Math.floor(rating) && rating % 1 >= 0.5)
    return {
      scale: interpolate(s, [0, 1], [0.15, 1]),
      filled,
      glow: filled && s > 0.55,
    }
  })

  // Verified badge
  const badgeOpacity = interpolate(f, [58, 72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      padding: 56,
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 32,
        padding: '52px 60px 48px',
        width: '100%',
        boxShadow: '0 52px 140px rgba(0,0,0,0.58), 0 14px 44px rgba(0,0,0,0.32)',
        transform: `translateY(${cardY}px)`,
        opacity: cardOpacity,
      }}>

        {/* Google wordmark */}
        <div style={{ display: 'flex', marginBottom: 26 }}>
          {([['G','#4285F4'],['o','#EA4335'],['o','#FBBC04'],['g','#4285F4'],['l','#34A853'],['e','#EA4335']] as [string,string][]).map(([letter, color], i) => (
            <span key={i} style={{ fontSize: 32, fontWeight: 700, color, fontFamily: 'system-ui, sans-serif', lineHeight: 1 }}>{letter}</span>
          ))}
        </div>

        {/* Business name */}
        <div style={{
          fontSize: 50,
          fontWeight: 800,
          color: '#111827',
          lineHeight: 1.15,
          marginBottom: 10,
          letterSpacing: '-0.025em',
        }}>
          {businessName}
        </div>

        {/* Category */}
        <div style={{
          fontSize: 28,
          color: '#6B7280',
          marginBottom: 36,
          fontWeight: 400,
        }}>
          {category}
        </div>

        {/* Rating row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          {/* Number */}
          <span style={{
            fontSize: 68,
            fontWeight: 900,
            color: '#111827',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            <CounterText value={rating} decimals={1} delay={delay + 22} duration={38} />
          </span>

          {/* Stars */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {stars.map((star, i) => (
              <div key={i} style={{ transform: `scale(${star.scale})`, transformOrigin: 'center', display: 'flex' }}>
                <svg width={46} height={46} viewBox="0 0 24 24">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={star.filled ? '#FBBC04' : '#E5E7EB'}
                    stroke={star.filled ? '#FBBC04' : '#E5E7EB'}
                    strokeWidth="0.3"
                    style={{ filter: star.glow ? 'drop-shadow(0 0 8px #FBBC04bb)' : 'none' }}
                  />
                </svg>
              </div>
            ))}
          </div>

          {/* Review count */}
          <span style={{ fontSize: 27, color: '#6B7280', fontWeight: 400 }}>
            (<CounterText value={reviewCount} delay={delay + 30} duration={36} /> reviews)
          </span>
        </div>

        {/* Verified badge */}
        <div style={{
          opacity: badgeOpacity,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 22px',
          background: '#EFF6FF',
          borderRadius: 14,
          width: 'fit-content',
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#4285F4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 22, color: '#4285F4', fontWeight: 600 }}>Verified on Google</span>
        </div>

      </div>
    </AbsoluteFill>
  )
}
