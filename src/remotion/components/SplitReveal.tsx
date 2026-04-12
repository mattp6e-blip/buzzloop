import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'

interface SplitRevealProps {
  text: string
  style?: React.CSSProperties
  delay?: number
}

// Cinematic text entrance: top half slides up, bottom half slides down,
// revealing the text from the center line outward.
export function SplitReveal({ text, style = {}, delay = 0 }: SplitRevealProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = Math.max(0, frame - delay)
  const sp = spring({ frame: f, fps, config: { stiffness: 88, damping: 14 } })
  const offset = interpolate(sp, [0, 1], [32, 0])
  const opacity = interpolate(f, [0, 6], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <div style={{ ...style, position: 'relative', overflow: 'hidden', opacity }}>
      {/* Top half slides up */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', overflow: 'hidden', transform: `translateY(${-offset}px)` }}>
        <div style={{ ...style, position: 'static', whiteSpace: 'nowrap' }}>{text}</div>
      </div>
      {/* Bottom half slides down */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '50%', overflow: 'hidden', transform: `translateY(${offset}px)` }}>
        <div style={{ ...style, position: 'relative', top: '-50%', whiteSpace: 'nowrap' }}>{text}</div>
      </div>
      {/* Spacer */}
      <div style={{ ...style, opacity: 0, pointerEvents: 'none' }}>{text}</div>
    </div>
  )
}
