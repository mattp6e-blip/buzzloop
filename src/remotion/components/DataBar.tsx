import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { CounterText } from './CounterText'

interface DataBarProps {
  label: string
  value: number
  maxValue?: number
  unit?: string
  brandColor?: string
  delay?: number       // absolute frame delay
}

// Animated metric bar: label + counting number + filling progress bar.
// Use inside ProofScene or standalone for stats like "127 reviews", "4.8★", "97%".
export function DataBar({
  label,
  value,
  maxValue,
  unit = '',
  brandColor = '#4f8ef7',
  delay = 0,
}: DataBarProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = Math.max(0, frame - delay)

  const max = maxValue ?? Math.ceil(value * 1.35)
  const fillRatio = Math.min(1, value / max)

  // Entrance
  const entrySpring = spring({ frame: f, fps, config: { stiffness: 130, damping: 16 } })
  const entryY = interpolate(entrySpring, [0, 1], [30, 0])
  const entryOpacity = interpolate(f, [0, 12], [0, 1], { extrapolateRight: 'clamp' })

  // Bar fill (starts 8 frames after entrance)
  const barSpring = spring({ frame: Math.max(0, f - 8), fps, config: { stiffness: 36, damping: 15 } })
  const barWidth = interpolate(barSpring, [0, 1], [0, fillRatio * 100])

  return (
    <div style={{ transform: `translateY(${entryY}px)`, opacity: entryOpacity, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          fontSize: 30, fontWeight: 600,
          color: 'rgba(255,255,255,0.72)',
          letterSpacing: '-0.01em',
        }}>
          {label}
        </span>
        <span style={{ fontSize: 30, fontWeight: 800, color: '#ffffff' }}>
          <CounterText value={value} suffix={unit} delay={delay + 10} duration={40} />
        </span>
      </div>
      <div style={{
        height: 10,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 5,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${barWidth}%`,
          background: `linear-gradient(90deg, ${brandColor}bb, ${brandColor})`,
          borderRadius: 5,
          boxShadow: `0 0 18px ${brandColor}60`,
        }} />
      </div>
    </div>
  )
}
