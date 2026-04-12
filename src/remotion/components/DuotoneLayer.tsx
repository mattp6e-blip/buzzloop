import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface DuotoneLayerProps {
  color: string
  opacity?: number
  delay?: number
}

// Overlays a brand-color tint over the entire frame using multiply blend mode.
// Instantly makes photos feel branded. Most impactful single visual change.
export function DuotoneLayer({ color, opacity = 0.40, delay = 0 }: DuotoneLayerProps) {
  const frame = useCurrentFrame()
  const f = Math.max(0, frame - delay)
  const alpha = interpolate(f, [0, 18], [0, opacity], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{
      background: color,
      mixBlendMode: 'multiply' as const,
      opacity: alpha,
      pointerEvents: 'none',
    }} />
  )
}
