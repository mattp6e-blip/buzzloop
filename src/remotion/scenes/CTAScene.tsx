import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { Background } from '../components/Background'
import { PhotoLayer } from '../components/PhotoLayer'
import { AnimatedText } from '../components/AnimatedText'
import { LogoMark } from '../components/LogoMark'
import type { VisualTemplate } from '../types'
import { TEMPLATE_CONFIGS } from '../styleConfigs'

interface CTASceneProps {
  ctaHeadline?: string | null   // line 1: story callback
  ctaText: string               // line 2: friction reduction
  websiteUrl?: string | null
  businessName: string
  logoUrl: string | null
  template: VisualTemplate
  brandColor: string
  industry: string
  photo?: string | null
}

export function CTAScene({ ctaHeadline, ctaText, websiteUrl, businessName, logoUrl, template, brandColor, industry, photo }: CTASceneProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const config = TEMPLATE_CONFIGS[template]

  const btnSpring = spring({ frame, fps, config: { stiffness: 100, damping: 14 }, delay: 25 })
  const btnScale = interpolate(btnSpring, [0, 1], [0.85, 1])
  const btnOpacity = interpolate(frame, [25, 38], [0, 1], { extrapolateRight: 'clamp' })

  const urlOpacity = interpolate(frame, [35, 48], [0, 1], { extrapolateRight: 'clamp' })
  const cleanUrl = websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, '') ?? null

  return (
    <AbsoluteFill>
      {photo && (template === 'immersive' || template === 'collage') ? (
        <PhotoLayer url={photo} direction="pan-right" overlay="full" overlayStrength={0.6} />
      ) : (
        <Background brandColor={brandColor} industry={industry} />
      )}

      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 72px',
        textAlign: 'center',
        gap: 0,
      }}>
        {/* Logo */}
        {config.logo !== 'none' && (
          <div style={{
            opacity: interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' }),
            marginBottom: 48,
          }}>
            <LogoMark logoUrl={logoUrl} businessName={businessName} placement="center" color={brandColor} delay={0} />
          </div>
        )}

        {/* Line 1: Story callback */}
        {ctaHeadline && (
          <AnimatedText
            text={ctaHeadline}
            anim="word-reveal"
            delay={8}
            style={{
              fontSize: 46,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '-0.015em',
              lineHeight: 1.3,
              marginBottom: 20,
            }}
          />
        )}

        {/* Line 2: Friction reduction */}
        <AnimatedText
          text={ctaText}
          anim="fade-up"
          delay={18}
          style={{
            fontSize: 62,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            marginBottom: 52,
          }}
        />

        {/* CTA button */}
        <div style={{
          transform: `scale(${btnScale})`,
          opacity: btnOpacity,
          background: brandColor,
          borderRadius: 100,
          padding: '28px 72px',
          fontSize: 36,
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.01em',
          boxShadow: `0 20px 50px ${brandColor}50`,
          marginBottom: cleanUrl ? 40 : 0,
        }}>
          {getCtaButtonLabel(industry)}
        </div>

        {/* Website */}
        {cleanUrl && (
          <div style={{
            opacity: urlOpacity,
            fontSize: 28,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.02em',
          }}>
            {cleanUrl}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function getCtaButtonLabel(industry: string): string {
  const labels: Record<string, string> = {
    dental:        'Book appointment →',
    clinic:        'Book appointment →',
    restaurant:    'Reserve a table →',
    gym:           'Start your trial →',
    salon:         'Book now →',
    spa:           'Book your session →',
    hotel:         'Check availability →',
    bar:           'Reserve a table →',
    physiotherapy: 'Book appointment →',
    veterinary:    'Book appointment →',
  }
  return labels[industry] ?? 'Get started →'
}
