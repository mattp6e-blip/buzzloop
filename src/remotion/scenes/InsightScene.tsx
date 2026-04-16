import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { Background } from '../components/Background'
import { AnimatedText } from '../components/AnimatedText'
import { MotifLayer } from '../motifs'
import { Grain } from '../components/Grain'
import type { ReelMotif } from '../motifs'

interface InsightSceneProps {
  headline: string
  subline?: string
  brandColor: string
  industry: string
  gbpPhotos: string[]
  motif?: ReelMotif
  motifValue?: number
}

export function InsightScene({ headline, subline, brandColor, industry, gbpPhotos, motif, motifValue }: InsightSceneProps) {
  const frame = useCurrentFrame()
  const lineWidth = interpolate(frame, [5, 35], [0, 100], { extrapolateRight: 'clamp' })

  // Pick second photo for variety (quote slides use 0, 1, 2... we use the last one here)
  const bgPhoto = gbpPhotos.length > 0 ? gbpPhotos[gbpPhotos.length > 1 ? 1 : 0] : null

  // Slow Ken Burns on the blurred bg — matches photo slide feel
  const t = frame / 150
  const bgScale = 1.06 + Math.sin(t * Math.PI) * 0.04

  return (
    <AbsoluteFill>
      {bgPhoto ? (
        <>
          {/* Blurred photo background with slow drift */}
          <div style={{
            position: 'absolute', inset: -40,
            backgroundImage: `url(${bgPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(36px) brightness(0.22) saturate(0.6)',
            transform: `scale(${bgScale})`,
            transformOrigin: 'center',
          }} />
          {/* Brand color overlay for cohesion */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 30% 50%, ${brandColor}22 0%, transparent 60%)`,
          }} />
          <Grain opacity={0.05} />
        </>
      ) : (
        <Background brandColor={brandColor} industry={industry} />
      )}
      <MotifLayer motif={motif} brandColor={brandColor} value={motifValue} />

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
          anim="slam"
          delay={8}
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
