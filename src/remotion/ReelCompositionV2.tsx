import { AbsoluteFill, useVideoConfig } from 'remotion'
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { HookScene } from './scenes/HookScene'
import { QuoteScene } from './scenes/QuoteScene'
import { ProofScene } from './scenes/ProofScene'
import { CTAScene } from './scenes/CTAScene'
import { InsightScene } from './scenes/InsightScene'
import { NoiseLayer } from './components/NoiseLayer'
import type { ReelCompositionProps } from './types'

export function ReelCompositionV2({
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
  const template = variation.template ?? 'immersive'
  const photos = gbpPhotos ?? []
  const hookPhoto = variation.hookPhoto ?? null
  const ctaPhoto = variation.ctaPhoto ?? null

  // Pre-assign photos to quote slides
  const quotePhotos: Record<number, string | null> = {}
  let qIdx = 0
  for (let i = 0; i < script.slides.length; i++) {
    if (script.slides[i].type === 'quote') {
      quotePhotos[i] = photos.length > 0 ? photos[qIdx % photos.length] : null
      qIdx++
    }
  }

  const commonProps = { template, brandColor, logoUrl, businessName, industry }

  // Build flat elements array for TransitionSeries
  const elements: React.ReactNode[] = []

  script.slides.forEach((slideData, index) => {
    const dur = Math.round(slideData.duration * fps)
    const type = slideData.type

    // Add transition before every slide except the first
    if (index > 0) {
      let presentation: ReturnType<typeof fade> | ReturnType<typeof slide>
      let timing: ReturnType<typeof linearTiming> | ReturnType<typeof springTiming>

      if (type === 'insight') {
        presentation = slide({ direction: 'from-right' })
        timing = springTiming({ config: { damping: 200 } })
      } else if (type === 'cta') {
        presentation = fade()
        timing = linearTiming({ durationInFrames: 18 })
      } else {
        presentation = fade()
        timing = linearTiming({ durationInFrames: 15 })
      }

      elements.push(
        <TransitionSeries.Transition
          key={`t${index}`}
          presentation={presentation}
          timing={timing}
        />
      )
    }

    elements.push(
      <TransitionSeries.Sequence key={`s${index}`} durationInFrames={dur}>
        <AbsoluteFill>
          <NoiseLayer brandColor={brandColor} />
          {type === 'hook' && (
            <HookScene
              headline={variation.hookHeadline}
              subline={variation.hookSubline}
              photo={hookPhoto}
              motif={variation.motif}
              motifValue={variation.motifValue}
              {...commonProps}
            />
          )}
          {type === 'quote' && (
            <QuoteScene
              quote={slideData.content.quote ?? ''}
              author={slideData.content.author}
              highlightWords={slideData.content.highlightWords ?? []}
              photo={quotePhotos[index] ?? null}
              {...commonProps}
            />
          )}
          {type === 'insight' && (
            <InsightScene
              headline={slideData.content.headline ?? ''}
              subline={slideData.content.subline}
              brandColor={brandColor}
              industry={industry}
              gbpPhotos={photos}
              motif={variation.motif}
              motifValue={variation.motifValue}
            />
          )}
          {type === 'proof' && (
            <ProofScene
              stat={slideData.content.stat}
              headline={slideData.content.subline}
              {...commonProps}
            />
          )}
          {type === 'cta' && (
            <CTAScene
              ctaHeadline={slideData.content.headline ?? variation.ctaHeadline}
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
      </TransitionSeries.Sequence>
    )
  })

  return (
    <AbsoluteFill style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <TransitionSeries>
        {elements}
      </TransitionSeries>
    </AbsoluteFill>
  )
}
