import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface ColorFlashProps {
  color?: string
  delay?: number
  duration?: number
}

// A brief color flash at scene start — adds punch and energy.
// Use white for impact cuts, brand color for thematic transitions.
export function ColorFlash({ color = '#ffffff', delay = 0, duration = 10 }: ColorFlashProps) {
  const frame = useCurrentFrame()
  const f = Math.max(0, frame - delay)
  const opacity = f <= duration
    ? interpolate(f, [0, Math.round(duration * 0.3), duration], [0.85, 0.5, 0], { extrapolateRight: 'clamp' })
    : 0
  return (
    <AbsoluteFill style={{
      background: color,
      opacity,
      pointerEvents: 'none',
      mixBlendMode: 'screen' as const,
    }} />
  )
}
