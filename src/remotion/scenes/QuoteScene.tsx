import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { Background } from '../components/Background'
import { PhotoLayer } from '../components/PhotoLayer'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import { Grain } from '../components/Grain'
import { CinematicBars } from '../components/CinematicBars'
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
  photo?: string | null
}

export function QuoteScene({ quote, author, highlightWords = [], template, brandColor, logoUrl, businessName, industry, photo }: QuoteSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const config = TEMPLATE_CONFIGS[template]
  const hasPhoto = !!photo

  // Stars
  const starOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' })
  const starScale = spring({ frame, fps, config: { stiffness: 120, damping: 15 }, delay: 5 })

  // Quote entrance
  const cardProgress = spring({ frame, fps, config: { stiffness: 80, damping: 14 }, delay: 8 })
  const cardY = interpolate(cardProgress, [0, 1], [36, 0])
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1])

  // Author
  const authorOpacity = interpolate(frame, [26, 40], [0, 1], { extrapolateRight: 'clamp' })
  const authorX = interpolate(frame, [26, 40], [-16, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill>
      {hasPhoto ? (
        <PhotoLayer url={photo!} direction="zoom-out" overlay="full" overlayStrength={0.74} />
      ) : (
        <Background brandColor={brandColor} industry={industry} />
      )}

      <Grain opacity={0.045} />
      <CinematicBars height={68} />

      <LogoMark logoUrl={logoUrl} businessName={businessName} placement={config.logo} color={brandColor} delay={5} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '148px 72px 160px 72px',
      }}>
        {/* Stars */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 32,
          opacity: starOpacity,
          transform: `scale(${starScale})`,
          transformOrigin: 'left center',
        }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ fontSize: 34, color: brandColor }}>★</span>
          ))}
        </div>

        {/* Quote */}
        <div style={{ transform: `translateY(${cardY}px)`, opacity: cardOpacity }}>
          <QuoteText
            quote={quote}
            highlightWords={highlightWords}
            brandColor={brandColor}
            template={template}
            delay={12}
          />
        </div>

        {/* Author — brand bar + name, no em dash */}
        {author && (
          <div style={{
            marginTop: 40,
            opacity: authorOpacity,
            transform: `translateX(${authorX}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <div style={{
              width: 4,
              height: 32,
              borderRadius: 2,
              background: brandColor,
            }} />
            <span style={{
              fontSize: 30,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.62)',
              letterSpacing: '0.015em',
            }}>
              {author}
            </span>
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
  const stagger = 4

  const fontSize = template === 'editorial' ? 74 : 62
  const fontWeight = template === 'editorial' ? 900 : 700

  return (
    <div style={{
      fontSize,
      fontWeight,
      color: '#ffffff',
      letterSpacing: '-0.025em',
      lineHeight: 1.22,
      flexWrap: 'wrap',
      display: 'flex',
      alignItems: 'flex-start',
    }}>
      <span style={{
        color: brandColor,
        marginRight: 4,
        fontWeight: 900,
        fontSize: fontSize * 1.4,
        lineHeight: 0.8,
        verticalAlign: 'top',
        opacity: f > 0 ? 1 : 0,
      }}>&ldquo;</span>
      {words.map((word, i) => {
        const wf = Math.max(0, f - i * stagger)
        const opacity = interpolate(wf, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
        const translateY = interpolate(wf, [0, 8], [14, 0], { extrapolateRight: 'clamp' })
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
