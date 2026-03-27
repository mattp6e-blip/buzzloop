import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import type { VisualStyleConfig } from '../types'

interface LogoMarkProps {
  logoUrl: string | null
  businessName: string
  placement: VisualStyleConfig['logo']
  color: string
  delay?: number
}

export function LogoMark({ logoUrl, businessName, placement, color, delay = 0 }: LogoMarkProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = Math.max(0, frame - delay)
  const opacity = interpolate(f, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  if (placement === 'none') return null

  if (placement === 'corner') {
    return (
      <div style={{
        position: 'absolute',
        top: 52,
        right: 52,
        opacity: opacity * 0.7,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={businessName} style={{ height: 52, width: 'auto', maxWidth: 160, objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }} />
        ) : (
          <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{businessName}</div>
        )}
      </div>
    )
  }

  if (placement === 'center') {
    const s = spring({ frame: f, fps, config: { stiffness: 100, damping: 16 } })
    const scale = interpolate(s, [0, 1], [0.7, 1])
    return (
      <div style={{
        opacity,
        transform: `scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={businessName} style={{ height: 80, width: 'auto', maxWidth: 220, objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }} />
        ) : (
          <div style={{
            background: color,
            borderRadius: 20,
            padding: '16px 32px',
            fontSize: 36,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}>{businessName}</div>
        )}
      </div>
    )
  }

  return null
}
