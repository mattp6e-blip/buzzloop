import { AbsoluteFill, Sequence, useVideoConfig, interpolate, useCurrentFrame } from 'remotion'
import { HookScene } from './scenes/HookScene'
import { QuoteScene } from './scenes/QuoteScene'
import { ProofScene } from './scenes/ProofScene'
import { CTAScene } from './scenes/CTAScene'
import { VISUAL_STYLES } from './styleConfigs'
import type { ReelCompositionProps } from './types'

export const REEL_FPS = 30
export const REEL_WIDTH = 1080
export const REEL_HEIGHT = 1920

export function ReelComposition({ script, variation, brandColor, brandSecondaryColor, logoUrl, businessName, industry, websiteUrl }: ReelCompositionProps) {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()
  const visualStyle = VISUAL_STYLES[variation.visualStyle]

  // Build scene timeline from script slides
  let cursor = 0
  const scenes: { from: number; dur: number; type: string; index: number }[] = []

  for (let i = 0; i < script.slides.length; i++) {
    const slide = script.slides[i]
    const dur = Math.round(slide.duration * fps)
    scenes.push({ from: cursor, dur, type: slide.type, index: i })
    cursor += dur
  }

  // Crossfade transition between scenes
  function getSceneOpacity(from: number, dur: number): number {
    const fadeIn = interpolate(frame, [from, from + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const fadeOut = interpolate(frame, [from + dur - 12, from + dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return Math.min(fadeIn, fadeOut)
  }

  const quoteSlides = script.slides.filter(s => s.type === 'quote')
  const proofSlide = script.slides.find(s => s.type === 'proof')
  const ctaSlide = script.slides.find(s => s.type === 'cta')

  const commonProps = { visualStyle, brandColor, brandSecondaryColor: brandSecondaryColor || brandColor, logoUrl, businessName, industry }

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
                  photoUrl={slide.content.photoUrl}
                  {...commonProps}
                />
              )}
              {type === 'quote' && (
                <QuoteScene
                  quote={slide.content.quote ?? ''}
                  author={slide.content.author}
                  rating={5}
                  highlightWords={slide.content.highlightWords ?? []}
                  photoUrl={slide.content.photoUrl}
                  {...commonProps}
                />
              )}
              {type === 'proof' && (
                <ProofScene
                  stat={slide.content.stat}
                  headline={slide.content.subline}
                  visualStyle={visualStyle}
                  brandColor={brandColor}
                  brandSecondaryColor={brandSecondaryColor || brandColor}
                  industry={industry}
                />
              )}
              {type === 'cta' && (
                <CTAScene
                  headline={slide.content.headline}
                  ctaText={variation.ctaText}
                  websiteUrl={websiteUrl}
                  businessName={businessName}
                  logoUrl={logoUrl}
                  visualStyle={visualStyle}
                  brandColor={brandColor}
                  brandSecondaryColor={brandSecondaryColor || brandColor}
                  industry={industry}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}
