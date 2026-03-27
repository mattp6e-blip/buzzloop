import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { Background } from '../components/Background'
import { AnimatedText } from '../components/AnimatedText'
import type { VisualStyleConfig } from '../types'
import { getBgColors } from '../styleConfigs'

interface InsightSceneProps {
  headline: string
  subline?: string
  visualStyle: VisualStyleConfig
  brandColor: string
  brandSecondaryColor: string
  industry: string
}

export function InsightScene({ headline, subline, visualStyle, brandColor, brandSecondaryColor, industry }: InsightSceneProps) {
  const frame = useCurrentFrame()
  const colors = getBgColors(visualStyle.bg, brandColor, brandSecondaryColor, industry)
  const isLight = visualStyle.bg === 'light-minimal'
  const textColor = isLight ? '#1a1a2e' : '#ffffff'

  const lineWidth = interpolate(frame, [5, 35], [0, 100], { extrapolateRight: 'clamp' })

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
      }}>
        {/* Top accent line — shorter than hook bar, feels like a "section break" */}
        <div style={{
          width: lineWidth,
          height: 3,
          background: colors.accent,
          borderRadius: 2,
          marginBottom: 52,
          opacity: 0.6,
        }} />

        <AnimatedText
          text={headline}
          anim={visualStyle.textAnim}
          delay={12}
          style={{
            fontSize: 68,
            fontWeight: 900,
            color: textColor,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        />

        {subline && (
          <AnimatedText
            text={subline}
            anim="fade-up"
            delay={28}
            style={{
              fontSize: 38,
              fontWeight: 400,
              color: textColor,
              opacity: 0.65,
              marginTop: 36,
              letterSpacing: '-0.01em',
              lineHeight: 1.35,
            }}
          />
        )}

        {/* Bottom accent line — mirrors top, creates a "framed" feel */}
        <div style={{
          width: interpolate(frame, [30, 55], [0, 60], { extrapolateRight: 'clamp' }),
          height: 3,
          background: colors.accent,
          borderRadius: 2,
          marginTop: 52,
          opacity: 0.3,
        }} />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
