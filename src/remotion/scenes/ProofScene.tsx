import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { Background } from '../components/Background'
import { AnimatedText, AnimatedStars } from '../components/AnimatedText'
import type { VisualStyleConfig } from '../types'
import { getBgColors } from '../styleConfigs'

interface ProofSceneProps {
  stat?: string           // e.g. "4.9★ · 127 reviews"
  headline?: string       // e.g. "Patients keep coming back"
  visualStyle: VisualStyleConfig
  brandColor: string
  brandSecondaryColor: string
  industry: string
}

export function ProofScene({ stat, headline, visualStyle, brandColor, brandSecondaryColor, industry }: ProofSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const colors = getBgColors(visualStyle.bg, brandColor, brandSecondaryColor, industry)
  const isLight = visualStyle.bg === 'light-minimal'
  const textColor = isLight ? '#1a1a2e' : '#ffffff'

  // Animate number counter
  const countUp = interpolate(frame, [5, 40], [0, 1], { extrapolateRight: 'clamp' })
  const s = spring({ frame, fps, config: { stiffness: 80, damping: 14 } })
  const scale = interpolate(s, [0, 1], [0.8, 1])

  return (
    <AbsoluteFill>
      <Background bgStyle={visualStyle.bg} top={colors.top} bottom={colors.bottom} accent={colors.accent} industry={industry} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 36,
        padding: '80px 64px',
        textAlign: 'center',
      }}>
        {/* Stars */}
        <div style={{ transform: `scale(${scale})` }}>
          <AnimatedStars rating={5} delay={0} color={colors.accent === '#ffffff' ? '#f59e0b' : colors.accent} size={52} />
        </div>

        {/* Big stat */}
        {stat && (
          <div style={{
            opacity: interpolate(frame, [8, 25], [0, 1], { extrapolateRight: 'clamp' }),
            fontSize: 96,
            fontWeight: 900,
            color: textColor,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            {stat}
          </div>
        )}

        {/* Subheadline */}
        {headline && (
          <AnimatedText
            text={headline}
            anim="fade-up"
            delay={20}
            style={{
              fontSize: 44,
              fontWeight: 400,
              color: textColor,
              opacity: 0.7,
              letterSpacing: '-0.01em',
            }}
          />
        )}

        {/* Divider */}
        <div style={{
          width: interpolate(frame, [15, 45], [0, 180], { extrapolateRight: 'clamp' }),
          height: 3,
          background: colors.accent,
          borderRadius: 2,
          opacity: 0.6,
        }} />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
