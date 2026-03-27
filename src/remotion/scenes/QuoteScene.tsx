import { AbsoluteFill } from 'remotion'
import { Background } from '../components/Background'
import { ReviewCard } from '../components/ReviewCard'
import { LogoMark } from '../components/LogoMark'
import type { VisualStyleConfig } from '../types'
import { getBgColors } from '../styleConfigs'

interface QuoteSceneProps {
  quote: string
  author?: string
  rating?: number
  highlightWords?: string[]
  photoUrl?: string
  visualStyle: VisualStyleConfig
  brandColor: string
  brandSecondaryColor: string
  logoUrl: string | null
  businessName: string
  industry: string
}

export function QuoteScene({ quote, author, rating = 5, highlightWords = [], photoUrl, visualStyle, brandColor, brandSecondaryColor, logoUrl, businessName, industry }: QuoteSceneProps) {
  const colors = getBgColors(visualStyle.bg, brandColor, brandSecondaryColor, industry)
  const isLight = !photoUrl && visualStyle.bg === 'light-minimal'
  const textColor = isLight ? '#1a1a2e' : '#ffffff'

  return (
    <AbsoluteFill>
      {photoUrl ? (
        <>
          <AbsoluteFill>
            <img src={photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)' }} />
        </>
      ) : (
        <Background bgStyle={visualStyle.bg} top={colors.top} bottom={colors.bottom} accent={colors.accent} industry={industry} />
      )}
      <LogoMark logoUrl={logoUrl} businessName={businessName} placement={visualStyle.logo} color={colors.accent} delay={5} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '120px 64px',
      }}>
        <ReviewCard
          quote={quote}
          author={author}
          rating={rating}
          highlightWords={highlightWords}
          cardStyle={visualStyle.card}
          textColor={textColor}
          accentColor={colors.accent}
          bgColor={colors.top}
          delay={8}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
