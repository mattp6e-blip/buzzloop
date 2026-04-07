import { AbsoluteFill, Sequence, useVideoConfig, interpolate, useCurrentFrame } from 'remotion'
import { HookScene } from './scenes/HookScene'
import { QuoteScene } from './scenes/QuoteScene'
import { ProofScene } from './scenes/ProofScene'
import { CTAScene } from './scenes/CTAScene'
import { InsightScene } from './scenes/InsightScene'
import type { ReelCompositionProps } from './types'

export const REEL_FPS = 30
export const REEL_WIDTH = 1080
export const REEL_HEIGHT = 1920

export function ReelComposition({
  script,
  variation,
  brandColor,
  brandSecondaryColor,
  logoUrl,
  businessName,
  industry,
  websiteUrl,
  gbpPhotos,
}: ReelCompositionProps) {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()
  const template = variation.template ?? 'immersive'
  const photos = gbpPhotos ?? []

  // Use assigned photos from variation, fall back to pool
  const hookPhoto = variation.hookPhoto ?? photos[0] ?? null
  const ctaPhoto = variation.ctaPhoto ?? photos[1] ?? photos[0] ?? null

  // Build scene timeline
  let cursor = 0
  const scenes: { from: number; dur: number; type: string; index: number }[] = []
  for (let i = 0; i < script.slides.length; i++) {
    const dur = Math.round(script.slides[i].duration * fps)
    scenes.push({ from: cursor, dur, type: script.slides[i].type, index: i })
    cursor += dur
  }

  function getSceneOpacity(from: number, dur: number): number {
    const fadeIn = interpolate(frame, [from, from + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const fadeOut = interpolate(frame, [from + dur - 10, from + dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return Math.min(fadeIn, fadeOut)
  }

  const commonProps = { template, brandColor, logoUrl, businessName, industry }

  return (
    <AbsoluteFill style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {scenes.map(({ from, dur, type, index }) => {
        const slide = script.slides[index]
        const opacity = getSceneOpacity(from, dur)

        return (
          <Sequence key={index} from={from} durationInFrames={dur}>
            <AbsoluteFill style={{ opacity }}>
              {type === 'hook' && (
                <HookScene
                  headline={variation.hookHeadline}
                  subline={variation.hookSubline}
                  photo={hookPhoto}
                  {...commonProps}
                />
              )}
              {type === 'quote' && (
                <QuoteScene
                  quote={slide.content.quote ?? ''}
                  author={slide.content.author}
                  highlightWords={slide.content.highlightWords ?? []}
                  {...commonProps}
                />
              )}
              {type === 'insight' && (
                <InsightScene
                  headline={slide.content.headline ?? ''}
                  subline={slide.content.subline}
                  brandColor={brandColor}
                  industry={industry}
                  gbpPhotos={photos}
                />
              )}
              {type === 'proof' && (
                <ProofScene
                  stat={slide.content.stat}
                  headline={slide.content.subline}
                  {...commonProps}
                />
              )}
              {type === 'cta' && (
                <CTAScene
                  ctaHeadline={slide.content.headline ?? variation.ctaHeadline}
                  ctaText={variation.ctaText}
                  websiteUrl={websiteUrl}
                  businessName={businessName}
                  logoUrl={logoUrl}
                  template={template}
                  brandColor={brandColor}
                  industry={industry}
                  photo={ctaPhoto}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}
