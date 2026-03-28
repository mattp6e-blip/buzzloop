import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { Background } from '../components/Background'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import type { VisualStyleConfig } from '../types'
import { getBgColors } from '../styleConfigs'

interface CTASceneProps {
  headline?: string | null
  ctaText: string
  websiteUrl?: string | null
  businessName: string
  logoUrl: string | null
  visualStyle: VisualStyleConfig
  brandColor: string
  brandSecondaryColor: string
  industry: string
}

export function CTAScene({ headline, ctaText, websiteUrl, businessName, logoUrl, visualStyle, brandColor, brandSecondaryColor, industry }: CTASceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const colors = getBgColors(visualStyle.bg, brandColor, brandSecondaryColor, industry)
  const isLight = visualStyle.bg === 'light-minimal'
  const textColor = isLight ? '#1a1a2e' : '#ffffff'

  // CTA button spring
  const s = spring({ frame, fps, config: { stiffness: 100, damping: 14 } })
  const btnScale = interpolate(s, [0, 1], [0.85, 1])
  const btnOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })

  // URL fade in
  const urlOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' })
  const urlY = interpolate(frame, [20, 35], [20, 0], { extrapolateRight: 'clamp' })

  // Logo
  const logoOpacity = interpolate(frame, [5, 22], [0, 1], { extrapolateRight: 'clamp' })

  const cleanUrl = websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, '') ?? null

  return (
    <AbsoluteFill>
      <Background bgStyle={visualStyle.bg} top={colors.top} bottom={colors.bottom} accent={colors.accent} industry={industry} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 72px',
        textAlign: 'center',
        gap: 0,
      }}>
        {/* Logo / brand name */}
        <div style={{ opacity: logoOpacity, marginBottom: 52 }}>
          {visualStyle.logo !== 'none' && (
            <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color={colors.accent} delay={0} />
          )}
        </div>

        {/* Closing question / headline */}
        {headline && (
          <AnimatedText
            text={headline}
            anim="word-reveal"
            delay={8}
            style={{
              fontSize: 44,
              fontWeight: 600,
              color: textColor,
              opacity: 0.75,
              letterSpacing: '-0.015em',
              lineHeight: 1.25,
              marginBottom: 28,
            }}
          />
        )}

        {/* CTA text */}
        <AnimatedText
          text={ctaText}
          anim={visualStyle.textAnim}
          delay={18}
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            marginBottom: 52,
          }}
        />

        {/* CTA button pill */}
        <div style={{
          transform: `scale(${btnScale})`,
          opacity: btnOpacity,
          background: colors.accent,
          borderRadius: 100,
          padding: '28px 72px',
          fontSize: 36,
          fontWeight: 700,
          color: isLight ? '#ffffff' : '#000000',
          letterSpacing: '-0.01em',
          boxShadow: `0 20px 50px ${colors.accent}50`,
          marginBottom: 60,
        }}>
          {getCtaButtonLabel(industry)}
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function getCtaButtonLabel(industry: string): string {
  const labels: Record<string, string> = {
    dental: 'Book appointment →',
    clinic: 'Book appointment →',
    restaurant: 'Reserve a table →',
    gym: 'Start your trial →',
    salon: 'Book now →',
    spa: 'Book your session →',
    retail: 'Shop now →',
  }
  return labels[industry] ?? 'Get started →'
}
