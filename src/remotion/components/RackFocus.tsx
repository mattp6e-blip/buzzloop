import { useCurrentFrame, interpolate } from 'remotion'

interface RackFocusProps {
  children: React.ReactNode
  direction?: 'blur-to-sharp' | 'sharp-to-blur'
  maxBlur?: number
  delay?: number
  duration?: number
}

// Simulates a camera rack focus: blur transitions in/out over `duration` frames.
// Wrap any scene element to give it a cinematic focusing reveal.
export function RackFocus({ children, direction = 'blur-to-sharp', maxBlur = 10, delay = 0, duration = 28 }: RackFocusProps) {
  const frame = useCurrentFrame()
  const f = Math.max(0, frame - delay)

  const t = interpolate(f, [0, duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const blur = direction === 'blur-to-sharp'
    ? interpolate(t, [0, 1], [maxBlur, 0])
    : interpolate(t, [0, 1], [0, maxBlur])
  const brightness = direction === 'blur-to-sharp'
    ? interpolate(t, [0, 1], [0.6, 1])
    : interpolate(t, [0, 1], [1, 0.6])

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      filter: `blur(${blur.toFixed(2)}px) brightness(${brightness.toFixed(3)})`,
    }}>
      {children}
    </div>
  )
}
