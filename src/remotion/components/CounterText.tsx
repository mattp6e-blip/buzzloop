import { useCurrentFrame, interpolate, Easing } from 'remotion'

interface CounterTextProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  delay?: number       // absolute frame delay (from global frame 0)
  duration?: number    // frames to count over
  style?: React.CSSProperties
}

// A number that counts up from 0 to `value` with ease-out cubic pacing.
// Renders inline — wrap in a span or div as needed.
export function CounterText({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  delay = 0,
  duration = 45,
  style,
}: CounterTextProps) {
  const frame = useCurrentFrame()
  const f = Math.max(0, frame - delay)

  const progress = interpolate(f, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  const current = progress * value
  const display = decimals > 0
    ? current.toFixed(decimals)
    : Math.floor(current).toLocaleString()

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}{display}{suffix}
    </span>
  )
}
