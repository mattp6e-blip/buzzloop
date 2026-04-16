import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { Background } from '../components/Background'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import { Grain } from '../components/Grain'
import { CinematicBars } from '../components/CinematicBars'
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
  gbpPhotos?: string[]
}

export function ProofScene({ stat, headline, template, brandColor, logoUrl, businessName, industry, gbpPhotos }: ProofSceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const config = TEMPLATE_CONFIGS[template]

  // Detect whether stat is a short metric (e.g. "4.9★", "97%") or a sentence
  const isSentence = (stat ?? '').length > 28

  const blockProgress = spring({ frame, fps, config: { stiffness: 70, damping: 14 }, delay: 5 })
  const blockY = interpolate(blockProgress, [0, 1], [30, 0])
  const blockOpacity = interpolate(blockProgress, [0, 1], [0, 1])

  const lineWidth = interpolate(frame, [18, 42], [0, 120], { extrapolateRight: 'clamp' })
  const subOpacity = interpolate(frame, [22, 38], [0, 1], { extrapolateRight: 'clamp' })

  const photos = gbpPhotos ?? []
  const bgPhoto = photos.length > 0 ? photos[Math.min(2, photos.length - 1)] : null

  // Subtle slow zoom on blurred bg
  const bgScale = interpolate(frame, [0, 150], [1.0, 1.08], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill>
      {bgPhoto ? (
        <>
          <div style={{
            position: 'absolute', inset: -40,
            backgroundImage: `url(${bgPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(32px) brightness(0.18) saturate(0.5)',
            transform: `scale(${bgScale})`,
            transformOrigin: 'center',
          }} />
          {/* Brand color veil */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 70% 40%, ${brandColor}1e 0%, transparent 55%)`,
          }} />
        </>
      ) : (
        <Background brandColor={brandColor} industry={industry} />
      )}
      <Grain opacity={0.05} />
      <CinematicBars height={68} />

      <LogoMark logoUrl={logoUrl} businessName={businessName} placement={config.logo} color={brandColor} delay={5} />

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '148px 72px 160px 72px',
      }}>
        {/* Accent line */}
        <div style={{
          width: lineWidth,
          height: 4,
          background: brandColor,
          borderRadius: 2,
          marginBottom: 44,
        }} />

        {/* Main proof text */}
        {stat && (
          <div style={{
            transform: `translateY(${blockY}px)`,
            opacity: blockOpacity,
          }}>
            <div style={{
              fontSize: isSentence ? 66 : 100,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: isSentence ? '-0.03em' : '-0.05em',
              lineHeight: isSentence ? 1.18 : 1.0,
              marginBottom: 28,
            }}>
              {stat}
            </div>
          </div>
        )}

        {/* Supporting line */}
        {headline && (
          <div style={{
            opacity: subOpacity,
            fontSize: 36,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '-0.01em',
            lineHeight: 1.4,
            maxWidth: 800,
          }}>
            {headline}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
