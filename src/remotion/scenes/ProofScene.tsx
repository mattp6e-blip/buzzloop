import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { Background } from '../components/Background'
import { PhotoLayer } from '../components/PhotoLayer'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import type { VisualTemplate } from '../types'
import { TEMPLATE_CONFIGS } from '../styleConfigs'

interface ProofSceneProps {
  stat?: string
  headline?: string
  template: VisualTemplate
  brandColor: string
  logoUrl: string | null
  businessName: string
  industry: string
}

export function ProofScene({ stat, headline, template, brandColor, logoUrl, businessName, industry }: ProofSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const config = TEMPLATE_CONFIGS[template]

  const photo = null // Proof slides always dark

  const statSpring = spring({ frame, fps, config: { stiffness: 60, damping: 12 }, delay: 5 })
  const statScale = interpolate(statSpring, [0, 1], [0.7, 1])
  const statOpacity = interpolate(statSpring, [0, 0.3], [0, 1])
  const lineProgress = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill>
      {photo && template === 'immersive' ? (
        <PhotoLayer url={photo} direction="zoom-out" overlay="full" overlayStrength={0.65} />
      ) : (
        <Background brandColor={brandColor} industry={industry} />
      )}

      <LogoMark logoUrl={logoUrl} businessName={businessName} placement={config.logo} color={brandColor} delay={5} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 72px',
        textAlign: 'center',
      }}>
        <div style={{
          width: `${lineProgress * 80}px`,
          height: 4,
          background: brandColor,
          borderRadius: 2,
          marginBottom: 48,
        }} />

        {stat && (
          <div style={{
            transform: `scale(${statScale})`,
            opacity: statOpacity,
            fontSize: 88,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            marginBottom: 24,
          }}>
            {stat}
          </div>
        )}

        {headline && (
          <AnimatedText
            text={headline}
            anim="fade-up"
            delay={22}
            style={{
              fontSize: 40,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '-0.01em',
            }}
          />
        )}

        <div style={{
          width: `${lineProgress * 40}px`,
          height: 3,
          background: brandColor,
          opacity: 0.5,
          borderRadius: 2,
          marginTop: 48,
        }} />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
