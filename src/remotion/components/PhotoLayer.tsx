import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

interface PhotoLayerProps {
  url: string
  // Ken Burns direction
  direction?: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right'
  // Gradient overlay: 'bottom' darkens bottom (for text there), 'full' is even, 'top' darkens top
  overlay?: 'bottom' | 'full' | 'top'
  overlayStrength?: number  // 0-1, default 0.5
}

function hiResUrl(url: string): string {
  if (!url.includes('googleusercontent.com')) return url
  return url.replace(/=s\d+[^&]*$/, '') + '=s1600'
}

export function PhotoLayer({ url, direction = 'zoom-in', overlay = 'bottom', overlayStrength = 0.5 }: PhotoLayerProps) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  url = hiResUrl(url)

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  let transform = ''
  switch (direction) {
    case 'zoom-in':
      transform = `scale(${interpolate(progress, [0, 1], [1, 1.08])})`
      break
    case 'zoom-out':
      transform = `scale(${interpolate(progress, [0, 1], [1.08, 1])})`
      break
    case 'pan-left':
      transform = `scale(1.06) translateX(${interpolate(progress, [0, 1], [0, -4])}%)`
      break
    case 'pan-right':
      transform = `scale(1.06) translateX(${interpolate(progress, [0, 1], [0, 4])}%)`
      break
  }

  const s = overlayStrength
  const overlayGradient = overlay === 'bottom'
    ? `linear-gradient(to bottom, rgba(0,0,0,${s * 0.6}) 0%, rgba(0,0,0,${s * 0.3}) 40%, rgba(0,0,0,${s * 0.8}) 100%)`
    : overlay === 'top'
    ? `linear-gradient(to top, rgba(0,0,0,${s * 0.3}) 0%, rgba(0,0,0,${s * 0.8}) 100%)`
    : `rgba(0,0,0,${s})`

  return (
    <>
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <img
          src={url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: overlayGradient }} />
    </>
  )
}

// Collage layout: 2-4 photos staggered in
interface CollageLayerProps {
  photos: string[]  // 2-4 urls
}

export function CollageLayer({ photos }: CollageLayerProps) {
  const frame = useCurrentFrame()
  const count = Math.min(photos.length, 4)

  // Layout configs for different photo counts
  const layouts: Record<number, { left: string; top: string; width: string; height: string; rotate: number }[]> = {
    2: [
      { left: '4%',  top: '8%',  width: '54%', height: '42%', rotate: -2 },
      { left: '38%', top: '32%', width: '58%', height: '42%', rotate: 1.5 },
    ],
    3: [
      { left: '4%',  top: '6%',  width: '52%', height: '38%', rotate: -2 },
      { left: '40%', top: '18%', width: '56%', height: '38%', rotate: 1.5 },
      { left: '8%',  top: '48%', width: '50%', height: '36%', rotate: 1 },
    ],
    4: [
      { left: '4%',  top: '6%',  width: '50%', height: '36%', rotate: -2 },
      { left: '46%', top: '14%', width: '50%', height: '36%', rotate: 1.5 },
      { left: '6%',  top: '44%', width: '50%', height: '36%', rotate: 1 },
      { left: '44%', top: '52%', width: '50%', height: '36%', rotate: -1.5 },
    ],
  }

  const positions = layouts[count] ?? layouts[2]

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Dark background so photos don't float on nothing */}
      <AbsoluteFill style={{ background: '#0a0a0f' }} />

      {photos.slice(0, count).map((url, i) => {
        const pos = positions[i]
        // Stagger: each photo enters 8 frames after the previous
        const enterFrame = i * 8
        const progress = Math.max(0, Math.min(1, (frame - enterFrame) / 18))
        // Spring-ish easing: ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        const opacity = eased
        const scale = interpolate(eased, [0, 1], [0.88, 1])
        const translateY = interpolate(eased, [0, 1], [30, 0])

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              width: pos.width,
              height: pos.height,
              transform: `rotate(${pos.rotate}deg) scale(${scale}) translateY(${translateY}px)`,
              opacity,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            }}
          >
            <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )
      })}

      {/* Gradient overlay so text area is readable */}
      <AbsoluteFill style={{
        background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(0,0,0,0.85) 100%)',
      }} />
    </AbsoluteFill>
  )
}
