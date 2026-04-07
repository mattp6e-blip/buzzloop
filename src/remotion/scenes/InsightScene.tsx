import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { Background } from '../components/Background'
import { AnimatedText } from '../components/AnimatedText'

interface InsightSceneProps {
  headline: string
  subline?: string
  brandColor: string
  industry: string
  gbpPhotos: string[]
}

export function InsightScene({ headline, subline, brandColor, industry }: InsightSceneProps) {
  const frame = useCurrentFrame()
  const lineWidth = interpolate(frame, [5, 35], [0, 100], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill>
      <Background brandColor={brandColor} industry={industry} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 72px',
        textAlign: 'center',
      }}>
        <div style={{
          width: lineWidth,
          height: 3,
          background: brandColor,
          borderRadius: 2,
          marginBottom: 52,
          opacity: 0.6,
        }} />

        <AnimatedText
          text={headline}
          anim="word-reveal"
          delay={12}
          style={{
            fontSize: 68,
            fontWeight: 900,
            color: '#ffffff',
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
              color: 'rgba(255,255,255,0.65)',
              marginTop: 36,
              letterSpacing: '-0.01em',
              lineHeight: 1.35,
            }}
          />
        )}

        <div style={{
          width: interpolate(frame, [30, 55], [0, 60], { extrapolateRight: 'clamp' }),
          height: 3,
          background: brandColor,
          borderRadius: 2,
          marginTop: 52,
          opacity: 0.3,
        }} />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
