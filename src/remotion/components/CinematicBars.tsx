import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'

// Letterbox bars that slide in from top/bottom — cinematic feel
export function CinematicBars({ height = 72, delay = 0 }: { height?: number; delay?: number }) {
  const frame = useCurrentFrame()
  const barH = interpolate(frame, [delay, delay + 18], [0, height], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: barH, background: '#000' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: barH, background: '#000' }} />
    </AbsoluteFill>
  )
}
