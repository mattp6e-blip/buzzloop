'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import type { ReelScript } from '@/types'
import type { ReelVariation, ReelCompositionProps } from '@/remotion/types'
import { REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from '@/remotion/ReelComposition'

const Player = dynamic(() => import('@remotion/player').then(m => m.Player), { ssr: false })
const ReelCompositionModule = dynamic(() => import('@/remotion/ReelComposition').then(m => ({ default: m.ReelComposition })), { ssr: false })

interface VariationPickerProps {
  script: ReelScript
  variations: ReelVariation[]
  brandColor: string
  brandSecondaryColor: string
  logoUrl: string | null
  businessName: string
  industry: string
  websiteUrl: string | null
  onSelect: (variation: ReelVariation) => void
  onConfirm: () => void
  onRegenerate: () => void
  regenerating: boolean
}

export function VariationPicker({ script, variations, brandColor, brandSecondaryColor, logoUrl, businessName, industry, websiteUrl, onSelect, onConfirm, onRegenerate, regenerating }: VariationPickerProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [fullscreenVariation, setFullscreenVariation] = useState<ReelVariation | null>(null)

  const totalFrames = Math.round(script.totalDuration * REEL_FPS)

  // Auto-select first variation on load
  useEffect(() => {
    if (variations.length > 0 && selected === null) {
      setSelected(variations[0].id)
      onSelect(variations[0])
    }
  }, [variations])

  function handleSelect(variation: ReelVariation) {
    setSelected(variation.id)
    onSelect(variation)
  }

  const makeProps = (variation: ReelVariation): ReelCompositionProps => ({
    script,
    variation,
    brandColor,
    brandSecondaryColor: brandSecondaryColor || brandColor,
    logoUrl,
    businessName,
    industry,
    websiteUrl,
  })

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>
          Same content, two visual styles — pick the look you prefer.
        </p>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:bg-[var(--bg2)] disabled:opacity-50"
          style={{ borderColor: 'var(--border)', color: 'var(--ink2)' }}
        >
          {regenerating ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : '↺'}
          Regenerate
        </button>
      </div>

      {/* 2 side-by-side variations */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {variations.map(variation => {
          const isSelected = selected === variation.id

          return (
            <div key={variation.id} className="flex flex-col gap-2">
              {/* Video card */}
              <div
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  border: `3px solid ${isSelected ? brandColor : 'var(--border)'}`,
                  boxShadow: isSelected ? `0 0 0 4px ${brandColor}25` : 'none',
                }}
              >
                {/* Remotion Player */}
                <div className="relative" style={{ aspectRatio: '9/16', background: '#0a0a0a' }}>
                  <Player
                    component={ReelCompositionModule as never}
                    inputProps={makeProps(variation)}
                    durationInFrames={totalFrames}
                    compositionWidth={REEL_WIDTH}
                    compositionHeight={REEL_HEIGHT}
                    fps={REEL_FPS}
                    style={{ width: '100%', height: '100%' }}
                    controls={false}
                    loop
                    autoPlay
                    initialFrame={REEL_FPS * 2}
                  />

                  {/* Full preview button */}
                  <button
                    className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={e => { e.stopPropagation(); setFullscreenVariation(variation) }}
                  >
                    <div className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                      ▶ Full preview
                    </div>
                  </button>

                  {/* Selected badge */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-bold"
                      style={{ background: brandColor }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              </div>

              {/* Hook text */}
              <p className="text-xs leading-relaxed px-1" style={{ color: 'var(--ink3)' }}>
                &ldquo;{variation.hookHeadline}&rdquo;
              </p>

              {/* Select button */}
              <button
                onClick={() => handleSelect(variation)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={isSelected
                  ? { background: brandColor, color: 'white' }
                  : { background: 'var(--bg2)', color: 'var(--ink2)', border: '1.5px solid var(--border)' }
                }
              >
                {isSelected ? '✓ Selected' : 'Select'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Confirm selection */}
      {selected !== null && (
        <button
          onClick={onConfirm}
          className="w-full py-3 rounded-xl text-sm font-bold mb-6 transition-all hover:opacity-90"
          style={{ background: brandColor, color: 'white' }}
        >
          Edit & Save this version →
        </button>
      )}

      {/* Fullscreen modal */}
      {fullscreenVariation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setFullscreenVariation(null)}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: 360, position: 'relative' }}>
            <button
              onClick={() => setFullscreenVariation(null)}
              className="absolute -top-10 right-0 text-white text-sm font-semibold opacity-70 hover:opacity-100"
            >✕ Close</button>
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
              <Player
                component={ReelCompositionModule as never}
                inputProps={makeProps(fullscreenVariation)}
                durationInFrames={totalFrames}
                compositionWidth={REEL_WIDTH}
                compositionHeight={REEL_HEIGHT}
                fps={REEL_FPS}
                style={{ width: '100%', height: '100%' }}
                controls
                loop
                autoPlay
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
