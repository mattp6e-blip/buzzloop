import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { Background } from '../components/Background'
import { PhotoLayer, CollageLayer } from '../components/PhotoLayer'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import type { VisualTemplate } from '../types'
import { TEMPLATE_CONFIGS } from '../styleConfigs'

interface HookSceneProps {
  headline: string
  subline?: string
  template: VisualTemplate
  brandColor: string
  logoUrl: string | null
  businessName: string
  industry: string
  gbpPhotos: string[]
}

export function HookScene({ headline, subline, template, brandColor, logoUrl, businessName, industry, gbpPhotos }: HookSceneProps) {
  const frame = useCurrentFrame()
  const config = TEMPLATE_CONFIGS[template]

  const hasPhotos = gbpPhotos.length > 0

  // Accent bar animation
  const barWidth = interpolate(frame, [10, 35], [0, 100], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill>
      {/* Background layer */}
      {template === 'immersive' && hasPhotos ? (
        <PhotoLayer url={gbpPhotos[0]} direction="zoom-in" overlay="bottom" overlayStrength={0.45} />
      ) : template === 'collage' && gbpPhotos.length >= 2 ? (
        <CollageLayer photos={gbpPhotos.slice(0, 4)} />
      ) : template === 'editorial' && hasPhotos ? (
        <EditorialSplit photo={gbpPhotos[0]} brandColor={brandColor} />
      ) : (
        <Background brandColor={brandColor} industry={industry} />
      )}

      <LogoMark logoUrl={logoUrl} businessName={businessName} placement={config.logo} color={brandColor} delay={10} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: template === 'editorial' ? 'flex-start' : 'center',
        justifyContent: hasPhotos ? 'flex-end' : 'center',
        padding: template === 'editorial' ? '80px 64px 120px 64px' : '80px 72px 140px 72px',
        textAlign: template === 'editorial' ? 'left' : 'center',
      }}>
        {/* Accent bar */}
        <div style={{
          width: barWidth,
          height: 5,
          background: brandColor,
          borderRadius: 3,
          marginBottom: 32,
          alignSelf: template === 'editorial' ? 'flex-start' : 'center',
        }} />

        <AnimatedText
          text={headline}
          anim={config.textAnim}
          delay={15}
          style={{
            fontSize: 84,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
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

function EditorialSplit({ photo, brandColor }: { photo: string; brandColor: string }) {
  return (
    <AbsoluteFill>
      {/* Left: photo */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '58%', height: '100%', overflow: 'hidden' }}>
        <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Fade edge to right */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, transparent 50%, rgba(0,0,0,0.95) 100%)',
        }} />
      </div>
      {/* Right: dark brand */}
      <div style={{
        position: 'absolute', right: 0, top: 0, width: '50%', height: '100%',
        background: '#0a0a0f',
        borderLeft: `4px solid ${brandColor}`,
      }} />
    </AbsoluteFill>
  )
}
