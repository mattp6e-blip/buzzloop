import { useCurrentFrame, interpolate } from 'remotion'

interface GlowTextProps {
  children: React.ReactNode
  color: string
  intensity?: number
  radius?: number
  delay?: number
}

// Wraps any text/element with an ambient color glow behind it.
// Creates a premium backlit or neon text effect.
export function GlowText({ children, color, intensity = 0.55, radius = 90, delay = 0 }: GlowTextProps) {
  const frame = useCurrentFrame()
  const f = Math.max(0, frame - delay)
  const alpha = interpolate(f, [0, 22], [0, intensity], { extrapolateRight: 'clamp' })
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        position: 'absolute',
        inset: -radius,
        background: `radial-gradient(ellipse at center, ${color} 0%, transparent 65%)`,
        filter: `blur(${Math.round(radius * 0.55)}px)`,
        opacity: alpha,
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
