import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion'
import { AnimatedText, AnimatedStars } from './AnimatedText'
import type { VisualStyleConfig } from '../types'

interface ReviewCardProps {
  quote: string
  author?: string
  rating?: number
  highlightWords?: string[]
  cardStyle: VisualStyleConfig['card']
  textColor: string
  accentColor: string
  bgColor: string
  delay?: number
}

export function ReviewCard({ quote, author, rating = 5, highlightWords = [], cardStyle, textColor, accentColor, bgColor, delay = 0 }: ReviewCardProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const f = Math.max(0, frame - delay)

  if (cardStyle === 'floating') {
    return <FloatingCard quote={quote} author={author} rating={rating} highlightWords={highlightWords} textColor={textColor} accentColor={accentColor} f={f} fps={fps} />
  }
  if (cardStyle === 'fullscreen') {
    return <FullscreenCard quote={quote} author={author} rating={rating} highlightWords={highlightWords} textColor={textColor} accentColor={accentColor} f={f} fps={fps} />
  }
  if (cardStyle === 'chat-bubble') {
    return <ChatBubble quote={quote} author={author} rating={rating} highlightWords={highlightWords} textColor={textColor} accentColor={accentColor} bgColor={bgColor} f={f} fps={fps} />
  }
  if (cardStyle === 'overlay') {
    return <OverlayCard quote={quote} author={author} rating={rating} highlightWords={highlightWords} textColor={textColor} accentColor={accentColor} f={f} fps={fps} />
  }
  return null
}

function FloatingCard({ quote, author, rating, highlightWords, textColor, accentColor, f, fps }: CardInner) {
  const s = spring({ frame: f, fps, config: { stiffness: 80, damping: 16 } })
  const translateY = interpolate(s, [0, 1], [80, 0])
  const opacity = interpolate(f, [0, 15], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <div style={{
      transform: `translateY(${translateY}px)`,
      opacity,
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(20px)',
      border: `1px solid rgba(255,255,255,0.15)`,
      borderRadius: 28,
      padding: '48px 52px',
      boxShadow: `0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
    }}>
      {/* Large quote mark */}
      <div style={{ fontSize: 120, lineHeight: 0.6, color: accentColor, opacity: 0.4, fontFamily: 'Georgia, serif', marginBottom: 24 }}>&ldquo;</div>
      <AnimatedText
        text={quote}
        anim="fade-up"
        delay={8}
        highlightWords={highlightWords}
        highlightColor={accentColor}
        style={{ fontSize: 44, color: textColor, fontWeight: 500, lineHeight: 1.5, letterSpacing: '-0.01em' }}
      />
      <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <AnimatedStars rating={rating} delay={20} color={accentColor === '#ffffff' ? '#f59e0b' : accentColor} size={28} />
        {author && (
          <div style={{ fontSize: 30, color: textColor, opacity: 0.6, fontWeight: 500 }}>— {author}</div>
        )}
      </div>
    </div>
  )
}

function FullscreenCard({ quote, author, rating, highlightWords, textColor, accentColor, f, fps }: CardInner) {
  const opacity = interpolate(f, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const scale = interpolate(f, [0, 20], [1.04, 1], { extrapolateRight: 'clamp' })

  return (
    <div style={{ opacity, transform: `scale(${scale})`, padding: '60px 64px' }}>
      <div style={{
        width: 64,
        height: 6,
        background: accentColor,
        borderRadius: 3,
        marginBottom: 40,
      }} />
      <AnimatedText
        text={`"${quote}"`}
        anim="scale-in"
        delay={10}
        highlightWords={highlightWords}
        highlightColor={accentColor}
        style={{ fontSize: 52, color: textColor, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.02em' }}
      />
      <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 20 }}>
        <AnimatedStars rating={rating} delay={22} color={accentColor === '#ffffff' ? '#f59e0b' : accentColor} size={30} />
        {author && <div style={{ fontSize: 30, color: textColor, opacity: 0.7, fontWeight: 600 }}>{author}</div>}
      </div>
    </div>
  )
}

function ChatBubble({ quote, author, rating, highlightWords, textColor, accentColor, bgColor, f, fps }: CardInner & { bgColor: string }) {
  const s = spring({ frame: f, fps, config: { stiffness: 100, damping: 14 } })
  const scale = interpolate(s, [0, 1], [0.85, 1])
  const opacity = interpolate(f, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  // Bubble tail SVG path
  return (
    <div style={{ transform: `scale(${scale})`, opacity, transformOrigin: 'bottom left' }}>
      <div style={{
        background: accentColor,
        borderRadius: '24px 24px 24px 4px',
        padding: '44px 52px',
        position: 'relative',
        boxShadow: `0 24px 60px ${accentColor}40`,
      }}>
        <div style={{ fontSize: 42, color: textColor === '#1a1a2e' ? '#1a1a2e' : '#ffffff', fontWeight: 600, lineHeight: 1.45, letterSpacing: '-0.01em' }}>
          <HighlightText text={`"${quote}"`} words={highlightWords} color={textColor === '#1a1a2e' ? '#1a1a2e' : '#ffffff'} accentColor={accentColor} />
        </div>
      </div>
      {/* Bubble tail */}
      <div style={{ width: 32, height: 24, background: accentColor, clipPath: 'polygon(0 0, 100% 0, 0 100%)', marginLeft: 20 }} />
      <div style={{ marginTop: 16, marginLeft: 4, display: 'flex', alignItems: 'center', gap: 16 }}>
        <AnimatedStars rating={rating} delay={15} color="#f59e0b" size={26} />
        {author && <div style={{ fontSize: 28, color: textColor, opacity: 0.7, fontWeight: 500 }}>{author}</div>}
      </div>
    </div>
  )
}

function OverlayCard({ quote, author, rating, highlightWords, textColor, accentColor, f, fps }: CardInner) {
  const opacity = interpolate(f, [0, 18], [0, 1], { extrapolateRight: 'clamp' })
  const translateX = interpolate(f, [0, 20], [50, 0], { extrapolateRight: 'clamp' })

  return (
    <div style={{
      opacity, transform: `translateX(${translateX}px)`,
      borderLeft: `6px solid ${accentColor}`,
      paddingLeft: 48,
      paddingRight: 48,
    }}>
      <AnimatedText
        text={`"${quote}"`}
        anim="typewriter"
        delay={5}
        highlightWords={highlightWords}
        highlightColor={accentColor}
        style={{ fontSize: 48, color: textColor, fontWeight: 400, lineHeight: 1.45, fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", serif' }}
      />
      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 20 }}>
        <AnimatedStars rating={rating} delay={18} color={accentColor === '#ffffff' ? '#f59e0b' : accentColor} size={24} />
        {author && <div style={{ fontSize: 24, color: textColor, opacity: 0.55, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{author}</div>}
      </div>
    </div>
  )
}

function HighlightText({ text, words, color, accentColor }: { text: string; words: string[]; color: string; accentColor: string }) {
  if (!words.length) return <>{text}</>
  const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const parts = text.split(pattern)
  return (
    <>
      {parts.map((part, i) =>
        words.some(w => w.toLowerCase() === part.toLowerCase())
          ? <span key={i} style={{ fontWeight: 800, textDecoration: 'underline', textDecorationColor: accentColor + '80' }}>{part}</span>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

interface CardInner {
  quote: string
  author?: string
  rating: number
  highlightWords: string[]
  textColor: string
  accentColor: string
  f: number
  fps: number
}
