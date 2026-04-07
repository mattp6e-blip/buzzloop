import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { Background } from '../components/Background'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import type { VisualTemplate } from '../types'
import { TEMPLATE_CONFIGS } from '../styleConfigs'

interface QuoteSceneProps {
  quote: string
  author?: string
  highlightWords?: string[]
  template: VisualTemplate
  brandColor: string
  logoUrl: string | null
  businessName: string
  industry: string
}

export function QuoteScene({ quote, author, highlightWords = [], template, brandColor, logoUrl, businessName, industry }: QuoteSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const config = TEMPLATE_CONFIGS[template]

  const hasPhotos = false // Quote slides always dark — photos only on Hook + CTA

  // Star rating animation
  const starOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' })
  const starScale = spring({ frame, fps, config: { stiffness: 120, damping: 15 }, delay: 5 })

  // Quote card entrance
  const cardProgress = spring({ frame, fps, config: { stiffness: 80, damping: 14 }, delay: 8 })
  const cardY = interpolate(cardProgress, [0, 1], [40, 0])
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1])

  // Author fade
  const authorOpacity = interpolate(frame, [25, 38], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill>
      {/* Background — always dark for quote slides */}
      <Background brandColor={brandColor} industry={industry} />

      <LogoMark logoUrl={logoUrl} businessName={businessName} placement={config.logo} color={brandColor} delay={5} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: hasPhotos ? 'flex-end' : 'center',
        padding: '80px 64px 140px 64px',
      }}>
        {/* Stars */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 28,
          opacity: starOpacity,
          transform: `scale(${starScale})`,
          transformOrigin: 'left center',
        }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ fontSize: 32, color: brandColor }}>★</span>
          ))}
        </div>

        {/* Quote */}
        <div style={{
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
        }}>
          <QuoteText quote={quote} highlightWords={highlightWords} brandColor={brandColor} template={template} delay={12} />
        </div>

        {/* Author */}
        {author && (
          <div style={{
            marginTop: 28,
            opacity: authorOpacity,
            fontSize: 32,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.02em',
          }}>
            — {author}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function QuoteText({ quote, highlightWords, brandColor, template, delay = 0 }: {
  quote: string
  highlightWords: string[]
  brandColor: string
  template: VisualTemplate
  delay?: number
}) {
  const frame = useCurrentFrame()
  const highlighted = new Set(highlightWords.map(w => w.toLowerCase()))
  const words = quote.split(' ')
  const f = Math.max(0, frame - delay)
  const stagger = 4 // frames between each word

  const fontSize = template === 'editorial' ? 72 : 58
  const fontWeight = template === 'editorial' ? 900 : 700

  return (
    <div style={{
      fontSize,
      fontWeight,
      color: '#ffffff',
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
      flexWrap: 'wrap',
      display: 'flex',
      alignItems: 'flex-start',
    }}>
      {/* Opening quote mark */}
      <span style={{ color: brandColor, marginRight: 4, fontWeight: 900, fontSize: fontSize * 1.4, lineHeight: 0.8, verticalAlign: 'top', opacity: f > 0 ? 1 : 0 }}>&ldquo;</span>
      {words.map((word, i) => {
        const wf = Math.max(0, f - i * stagger)
        const opacity = interpolate(wf, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
        const translateY = interpolate(wf, [0, 8], [12, 0], { extrapolateRight: 'clamp' })
        const clean = word.toLowerCase().replace(/[^a-z]/g, '')
        const isHighlighted = highlighted.has(clean)
        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              display: 'inline-block',
              color: isHighlighted ? brandColor : '#ffffff',
              fontWeight: isHighlighted ? 900 : fontWeight,
              marginRight: '0.25em',
            }}
          >
            {word}
          </span>
        )
      })}
    </div>
  )
}
