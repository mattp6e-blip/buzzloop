import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { Background } from '../components/Background'
import { PhotoLayer, CollageLayer } from '../components/PhotoLayer'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import { Grain } from '../components/Grain'
import { CinematicBars } from '../components/CinematicBars'
import { MotifLayer } from '../motifs'
import type { VisualTemplate } from '../types'
import type { ReelMotif } from '../motifs'
import { TEMPLATE_CONFIGS } from '../styleConfigs'

interface HookSceneProps {
  headline: string
  subline?: string
  template: VisualTemplate
  brandColor: string
  logoUrl: string | null
  businessName: string
  industry: string
  photo?: string | null
  motif?: ReelMotif
  motifValue?: number
}

export function HookScene({ headline, subline, template, brandColor, logoUrl, businessName, industry, photo, motif, motifValue }: HookSceneProps) {
  const frame = useCurrentFrame()
  const config = TEMPLATE_CONFIGS[template]

  const hasPhoto = !!photo

  // Accent bar — only for non-editorial
  const barWidth = interpolate(frame, [10, 35], [0, 100], { extrapolateRight: 'clamp' })

  const isEditorial = template === 'editorial'

  return (
    <AbsoluteFill>
      {/* Background layer */}
      {template === 'immersive' && hasPhoto ? (
        <PhotoLayer url={photo!} direction="zoom-in" overlay="bottom" overlayStrength={0.45} />
      ) : template === 'collage' && hasPhoto ? (
        <PhotoLayer url={photo!} direction="pan-right" overlay="full" overlayStrength={0.55} />
      ) : isEditorial ? (
        <EditorialBackground brandColor={brandColor} frame={frame} />
      ) : (
        <Background brandColor={brandColor} industry={industry} />
      )}

      <Grain opacity={0.045} />
      <CinematicBars height={68} />

      <LogoMark logoUrl={logoUrl} businessName={businessName} placement={config.logo} color={brandColor} delay={10} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isEditorial ? 'flex-start' : 'center',
        justifyContent: isEditorial ? 'flex-end' : 'center',
        padding: isEditorial ? '80px 72px 140px 80px' : '80px 72px 140px 72px',
        textAlign: isEditorial ? 'left' : 'center',
      }}>
        {!isEditorial && (
          <div style={{
            width: barWidth,
            height: 5,
            background: brandColor,
            borderRadius: 3,
            marginBottom: 32,
            alignSelf: 'center',
          }} />
        )}

        <AnimatedText
          text={headline}
          anim={config.textAnim}
          delay={15}
          style={{
            fontSize: isEditorial ? 96 : 84,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: isEditorial ? '-0.04em' : '-0.03em',
            lineHeight: 1.0,
          }}
        />

        {subline && (
          <AnimatedText
            text={subline}
            anim="fade-up"
            delay={30}
            style={{
              fontSize: 44,
              fontWeight: 400,
              color: '#ffffff',
              opacity: 0.65,
              marginTop: 24,
              letterSpacing: '-0.01em',
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function EditorialBackground({ brandColor, frame }: { brandColor: string; frame: number }) {
  const stripeH = interpolate(frame, [4, 28], [0, 1920], { extrapolateRight: 'clamp' })
  const ruleW   = interpolate(frame, [18, 42], [0, 920], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: '#08080d' }}>
      {/* Vertical brand stripe down left edge */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: 7, height: stripeH,
        background: brandColor,
      }} />
      {/* Horizontal rule above text area */}
      <div style={{
        position: 'absolute', left: 80, bottom: 300,
        width: ruleW, height: 1.5,
        background: `${brandColor}55`,
      }} />
    </AbsoluteFill>
  )
}
