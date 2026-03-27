import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { Background } from '../components/Background'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import type { VisualStyleConfig } from '../types'
import { getBgColors } from '../styleConfigs'

interface HookSceneProps {
  headline: string
  subline?: string
  photoUrl?: string
  visualStyle: VisualStyleConfig
  brandColor: string
  brandSecondaryColor: string
  logoUrl: string | null
  businessName: string
  industry: string
}

export function HookScene({ headline, subline, photoUrl, visualStyle, brandColor, brandSecondaryColor, logoUrl, businessName, industry }: HookSceneProps) {
  const frame = useCurrentFrame()
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
          <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 100%)' }} />
        </>
      ) : (
        <Background bgStyle={visualStyle.bg} top={colors.top} bottom={colors.bottom} accent={colors.accent} industry={industry} />
      )}

      {/* Logo */}
      <LogoMark logoUrl={logoUrl} businessName={businessName} placement={visualStyle.logo} color={colors.accent} delay={10} />

      {/* Content — centred */}
      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 72px',
        textAlign: 'center',
      }}>
        {/* Accent bar */}
        <div style={{
          width: interpolate(frame, [10, 35], [0, 120], { extrapolateRight: 'clamp' }),
          height: 6,
          background: colors.accent,
          borderRadius: 3,
          marginBottom: 44,
        }} />

        <AnimatedText
          text={headline}
          anim={visualStyle.textAnim}
          delay={15}
          style={{
            fontSize: 76,
            fontWeight: 900,
            color: textColor,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        />

        {subline && (
          <AnimatedText
            text={subline}
            anim={visualStyle.textAnim}
            delay={30}
            style={{
              fontSize: 42,
              fontWeight: 400,
              color: textColor,
              opacity: 0.7,
              marginTop: 28,
              letterSpacing: '-0.01em',
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
