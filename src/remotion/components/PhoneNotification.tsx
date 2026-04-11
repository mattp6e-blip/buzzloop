import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

interface PhoneNotificationProps {
  reviewText: string
  reviewerName?: string
  rating?: number       // 1–5
  delay?: number
  holdFrames?: number   // frames to stay visible before sliding out
}

// iOS-style frosted-glass notification that slides down from the top.
// Shows a new 5-star Google review. Exits after `holdFrames` frames.
export function PhoneNotification({
  reviewText,
  reviewerName,
  rating = 5,
  delay = 0,
  holdFrames = 80,
}: PhoneNotificationProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = Math.max(0, frame - delay)

  // Entrance spring
  const enterSpring = spring({ frame: f, fps, config: { stiffness: 220, damping: 24 } })
  const enterY = interpolate(enterSpring, [0, 1], [-200, 0])

  // Exit spring
  const exitF = Math.max(0, f - holdFrames)
  const exitSpring = spring({ frame: exitF, fps, config: { stiffness: 320, damping: 28 } })
  const exitY = interpolate(exitSpring, [0, 1], [0, -200])

  const translateY = f > holdFrames ? exitY : enterY
  const opacity = f > holdFrames
    ? interpolate(exitSpring, [0.65, 1], [1, 0], { extrapolateRight: 'clamp' })
    : interpolate(f, [0, 6], [0, 1], { extrapolateRight: 'clamp' })

  const clipped = reviewText.length > 65 ? reviewText.slice(0, 62) + '...' : reviewText
  const stars = '★'.repeat(Math.max(1, Math.min(5, rating)))

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        top: 52,
        left: 44,
        right: 44,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}>
        <div style={{
          background: 'rgba(26, 26, 30, 0.88)',
          borderRadius: 28,
          padding: '22px 26px',
          boxShadow: '0 24px 70px rgba(0,0,0,0.48)',
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          {/* App icon */}
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 14,
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {/* Google G mini */}
            <svg width={36} height={36} viewBox="0 0 36 36">
              <path d="M18 14.4h8.4c.42 1.2.6 2.46.6 3.6a9 9 0 11-2.64-6.36l-2.52 2.52A5.4 5.4 0 1023.4 18H18v-3.6z" fill="#4285F4" />
              <path d="M18 14.4h8.4c.42 1.2.6 2.46.6 3.6 0 4.97-4.03 9-9 9a9 9 0 01-8.07-5.04l3.12-2.43A5.4 5.4 0 0023.4 18H18v-3.6z" fill="#34A853" />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <span style={{ fontSize: 23, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                Google Reviews
              </span>
              <span style={{ fontSize: 19, color: 'rgba(255,255,255,0.42)' }}>now</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#FBBC04', letterSpacing: '3px', marginBottom: 4 }}>
              {stars}
            </div>
            {reviewerName && (
              <div style={{ fontSize: 21, color: 'rgba(255,255,255,0.62)', marginBottom: 3, fontWeight: 500 }}>
                {reviewerName}
              </div>
            )}
            <div style={{ fontSize: 21, color: 'rgba(255,255,255,0.84)', lineHeight: 1.42 }}>
              {clipped}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
