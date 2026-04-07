import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

type TextAnim = 'fade-up' | 'scale-in' | 'slide-left' | 'typewriter' | 'word-reveal'

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

  if (anim === 'word-reveal') {
    const words = text.split(' ')
    const stagger = 5 // frames between each word (at 30fps ≈ 4–5 words/sec)
    return (
      <div style={baseStyle}>
        {words.map((word, i) => {
          const wf = Math.max(0, f - i * stagger)
          const opacity = interpolate(wf, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
          const translateY = interpolate(wf, [0, 8], [10, 0], { extrapolateRight: 'clamp' })
          const isHighlight = highlightWords.some(
            hw => hw.toLowerCase() === word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
          )
          return (
            <>
              <span key={i} style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                display: 'inline-block',
                color: isHighlight ? highlightColor : 'inherit',
                fontWeight: isHighlight ? 800 : 'inherit',
              }}>
                {word}
              </span>
              {i < words.length - 1 && ' '}
            </>
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
