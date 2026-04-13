import { Fragment } from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

type TextAnim = 'fade-up' | 'scale-in' | 'slide-left' | 'typewriter' | 'word-reveal' | 'slam' | 'char-spring'

interface AnimatedTextProps {
  text: string
  style?: React.CSSProperties
  anim: TextAnim
  delay?: number           // frames to wait before animating
  highlightWords?: string[]
  highlightColor?: string
}

export function AnimatedText({ text, style, anim, delay = 0, highlightWords = [], highlightColor = '#ffffff' }: AnimatedTextProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = Math.max(0, frame - delay)

  const baseStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 1.2,
    ...style,
  }

  if (anim === 'fade-up') {
    const opacity = interpolate(f, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
    const translateY = interpolate(f, [0, 20], [40, 0], { extrapolateRight: 'clamp' })
    return (
      <div style={{ ...baseStyle, opacity, transform: `translateY(${translateY}px)` }}>
        <HighlightText text={text} words={highlightWords} color={highlightColor} />
      </div>
    )
  }

  if (anim === 'scale-in') {
    const s = spring({ frame: f, fps, config: { stiffness: 120, damping: 14 } })
    const scale = interpolate(s, [0, 1], [0.6, 1])
    const opacity = interpolate(f, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
    return (
      <div style={{ ...baseStyle, opacity, transform: `scale(${scale})`, transformOrigin: 'center' }}>
        <HighlightText text={text} words={highlightWords} color={highlightColor} />
      </div>
    )
  }

  if (anim === 'slide-left') {
    const opacity = interpolate(f, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
    const translateX = interpolate(f, [0, 18], [-60, 0], { extrapolateRight: 'clamp' })
    return (
      <div style={{ ...baseStyle, opacity, transform: `translateX(${translateX}px)` }}>
        <HighlightText text={text} words={highlightWords} color={highlightColor} />
      </div>
    )
  }

  if (anim === 'typewriter') {
    const charsToShow = Math.floor(interpolate(f, [0, 45], [0, text.length], { extrapolateRight: 'clamp' }))
    return (
      <div style={baseStyle}>
        <HighlightText text={text.slice(0, charsToShow)} words={highlightWords} color={highlightColor} />
        {charsToShow < text.length && (
          <span style={{ opacity: Math.round(f / 4) % 2 === 0 ? 1 : 0, color: highlightColor }}>|</span>
        )}
      </div>
    )
  }

  if (anim === 'word-reveal' || anim === 'slam') {
    // Slam: entire block hits at once — snappy spring from slight scale+translateY
    const s = spring({ frame: f, fps, config: { stiffness: 280, damping: 18 } })
    const scale = interpolate(s, [0, 1], [1.06, 1])
    const translateY = interpolate(s, [0, 1], [24, 0])
    const opacity = interpolate(f, [0, 5], [0, 1], { extrapolateRight: 'clamp' })
    return (
      <div style={{
        ...baseStyle,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: 'left center',
      }}>
        <HighlightText text={text} words={highlightWords} color={highlightColor} />
      </div>
    )
  }

  if (anim === 'char-spring') {
    // Each word springs in independently with staggered delay — true kinetic typography.
    const words = text.split(' ')
    const justifyContent = style?.textAlign === 'center' ? 'center'
      : style?.textAlign === 'right' ? 'flex-end'
      : 'flex-start'
    return (
      <div style={{ ...baseStyle, display: 'flex', flexWrap: 'wrap', columnGap: '0.25em', rowGap: '0.05em', justifyContent }}>
        {words.map((word, i) => {
          const wordF = Math.max(0, f - i * 4)
          const s = spring({ frame: wordF, fps, config: { stiffness: 360, damping: 15 } })
          const wordY = interpolate(s, [0, 1], [38, 0])
          const wordScale = interpolate(s, [0, 1], [0.72, 1])
          const wordOpacity = interpolate(wordF, [0, 7], [0, 1], { extrapolateRight: 'clamp' })
          const clean = word.replace(/[.,!?:;]/g, '').toLowerCase()
          const isHighlighted = highlightWords.some(w => w.toLowerCase() === clean)
          return (
            <Fragment key={i}>
              <span style={{
                display: 'inline-block',
                transform: `translateY(${wordY}px) scale(${wordScale})`,
                opacity: wordOpacity,
                transformOrigin: 'center bottom',
                color: isHighlighted ? highlightColor : 'inherit',
                fontWeight: isHighlighted ? 800 : undefined,
              }}>
                {word}
              </span>
            </Fragment>
          )
        })}
      </div>
    )
  }

  return <div style={baseStyle}>{text}</div>
}

function HighlightText({ text, words, color }: { text: string; words: string[]; color: string }) {
  if (!words.length) return <>{text}</>
  const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const parts = text.split(pattern)
  return (
    <>
      {parts.map((part, i) =>
        words.some(w => w.toLowerCase() === part.toLowerCase())
          ? <span key={i} style={{ color, fontWeight: 800 }}>{part}</span>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

// Animated star rating
export function AnimatedStars({ rating, delay = 0, color = '#f59e0b', size = 32 }: {
  rating: number; delay?: number; color?: string; size?: number
}) {
  const frame = useCurrentFrame()
  const f = Math.max(0, frame - delay)
  const { fps } = useVideoConfig()

  return (
    <div style={{ display: 'flex', gap: size * 0.2 }}>
      {Array.from({ length: 5 }, (_, i) => {
        const starDelay = i * 4
        const localF = Math.max(0, f - starDelay)
        const s = spring({ frame: localF, fps, config: { stiffness: 200, damping: 10 } })
        const scale = interpolate(s, [0, 1], [0, 1])
        const filled = i < rating
        return (
          <div key={i} style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
            <svg width={size} height={size} viewBox="0 0 24 24">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={filled ? color : 'transparent'}
                stroke={filled ? color : color + '60'}
                strokeWidth="1.5"
              />
            </svg>
          </div>
        )
      })}
    </div>
  )
}
