import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface LightLeakProps {
  delay?: number
  color?: string
  intensity?: number
}

// Cinematic warm light leak that sweeps diagonally across the frame.
// Use mixBlendMode 'screen' to blend naturally over photos/dark backgrounds.
export function LightLeak({ delay = 0, color = '#fff6e0', intensity = 0.13 }: LightLeakProps) {
  const frame = useCurrentFrame()
  const f = Math.max(0, frame - delay)

  // Main streak
  const x1 = interpolate(f, [0, 52], [-35, 135], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const o1 = interpolate(f, [0, 8, 40, 52], [0, intensity, intensity * 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Secondary streak (narrower, slightly delayed)
  const x2 = interpolate(f, [7, 56], [-35, 125], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const o2 = f < 7 ? 0 : interpolate(f, [7, 16, 44, 56], [0, intensity * 0.5, intensity * 0.3, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' as const, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        left: `${x1}%`,
        top: '-30%',
        width: '58%',
        height: '160%',
        background: `radial-gradient(ellipse 42% 100% at 50% 50%, ${color}, transparent 68%)`,
        opacity: o1,
        transform: 'rotate(-16deg)',
        transformOrigin: 'center',
      }} />
      <div style={{
        position: 'absolute',
        left: `${x2}%`,
        top: '-30%',
        width: '36%',
        height: '160%',
        background: `radial-gradient(ellipse 30% 100% at 50% 50%, ${color}, transparent 68%)`,
        opacity: o2,
        transform: 'rotate(-10deg)',
        transformOrigin: 'center',
      }} />
    </AbsoluteFill>
  )
}
