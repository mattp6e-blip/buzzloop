import React, { useState, useEffect } from 'react'
import { AbsoluteFill, useVideoConfig, delayRender, continueRender, Audio } from 'remotion'
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { wipe } from '@remotion/transitions/wipe'
import { slide } from '@remotion/transitions/slide'
import { HookScene } from './scenes/HookScene'
import { QuoteScene } from './scenes/QuoteScene'
import { ProofScene } from './scenes/ProofScene'
import { CTAScene } from './scenes/CTAScene'
import { InsightScene } from './scenes/InsightScene'
import { LightLeak } from './components/LightLeak'
import type { ReelCompositionProps } from './types'

// Ken Burns directions — rotate per photo slide for visual variety
const KB_DIRECTIONS = ['zoom-in', 'pan-left', 'zoom-out', 'pan-right'] as const

// Load Inter from Google Fonts so the renderer uses a premium typeface
function useFontLoader() {
  const [handle] = useState(() => delayRender('Loading Inter font'))
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800;900&display=swap'
    document.head.appendChild(link)
    document.fonts.load('900 48px Inter').then(() => continueRender(handle)).catch(() => continueRender(handle))
    return () => { document.head.removeChild(link) }
  }, [handle])
}

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
  useFontLoader()
  const template = variation.template ?? 'immersive'
  const photos = gbpPhotos ?? []
  const hookPhoto = variation.hookPhoto ?? null
  const ctaPhoto = variation.ctaPhoto ?? null

  // Pre-assign photos + Ken Burns directions to photo slides
  const quotePhotos: Record<number, string | null> = {}
  const kbDirections: Record<number, typeof KB_DIRECTIONS[number]> = {}
  let photoSlideIdx = 0

  for (let i = 0; i < script.slides.length; i++) {
    const type = script.slides[i].type
    if (type === 'quote') {
      quotePhotos[i] = photos.length > 0 ? photos[photoSlideIdx % photos.length] : null
      kbDirections[i] = KB_DIRECTIONS[photoSlideIdx % KB_DIRECTIONS.length]
      photoSlideIdx++
    }
  }

  const commonProps = { template, brandColor, logoUrl, businessName, industry }

  // Build flat elements array for TransitionSeries
  const elements: React.ReactNode[] = []
  const totalSlides = script.slides.length

  script.slides.forEach((slideData, index) => {
    const dur = Math.round(slideData.duration * fps)
    const type = slideData.type
    const isLast = index === totalSlides - 1
    const isFirst = index === 0

    // Add transition before every slide except the first
    if (!isFirst) {
      const prevType = script.slides[index - 1].type

      let presentation: ReturnType<typeof fade> | ReturnType<typeof wipe> | ReturnType<typeof slide>
      let timing: ReturnType<typeof linearTiming> | ReturnType<typeof springTiming>

      if (type === 'cta') {
        // CTA entrance: long slow fade — feels like a finale
        presentation = fade()
        timing = linearTiming({ durationInFrames: 28 })
      } else if (prevType === 'hook' && type === 'quote') {
        // Hook → first quote: directional wipe — most cinematic moment
        presentation = wipe({ direction: 'from-right' })
        timing = springTiming({ config: { stiffness: 90, damping: 18 }, durationInFrames: 26 })
      } else if (type === 'insight') {
        // Into insight: slide up from bottom — editorial feel
        presentation = slide({ direction: 'from-bottom' })
        timing = springTiming({ config: { stiffness: 80, damping: 16 }, durationInFrames: 22 })
      } else if (type === 'proof') {
        // Into proof: wipe from left
        presentation = wipe({ direction: 'from-left' })
        timing = springTiming({ config: { stiffness: 85, damping: 16 }, durationInFrames: 22 })
      } else {
        // Default: smooth cross-dissolve
        presentation = fade()
        timing = linearTiming({ durationInFrames: 22 })
      }

      elements.push(
        <TransitionSeries.Transition
          key={`t${index}`}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          presentation={presentation as any}
          timing={timing}
        />
      )
    }

    const hasPhoto = type === 'quote' && !!quotePhotos[index]
    const kbDir = kbDirections[index] ?? 'zoom-in'

    elements.push(
      <TransitionSeries.Sequence key={`s${index}`} durationInFrames={dur}>
        <AbsoluteFill>
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
            <>
              <QuoteScene
                quote={slideData.content.quote ?? ''}
                author={slideData.content.author}
                highlightWords={slideData.content.highlightWords ?? []}
                photo={quotePhotos[index] ?? null}
                kbDirection={kbDir}
                {...commonProps}
              />
              {/* Light leak on every photo quote slide */}
              {hasPhoto && <LightLeak delay={18} intensity={0.10} />}
            </>
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
              gbpPhotos={photos}
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

  const musicUrl = variation.musicUrl ?? null

  return (
    <AbsoluteFill style={{ fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif', background: '#000' }}>
      {musicUrl && (
        <Audio src={musicUrl} volume={0.28} />
      )}
      <TransitionSeries>
        {elements}
      </TransitionSeries>
    </AbsoluteFill>
  )
}
