'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import type { ReelVariation, ReelCompositionProps } from '@/remotion/types'
import { REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from '@/remotion/ReelComposition'

const Player = dynamic(() => import('@remotion/player').then(m => m.Player), { ssr: false })
const ReelCompositionModule = dynamic(() => import('@/remotion/ReelComposition').then(m => ({ default: m.ReelComposition })), { ssr: false })

interface VariationPickerProps {
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
}

export function VariationPicker({ variations, brandColor, brandSecondaryColor, logoUrl, businessName, industry, websiteUrl, onSelect, onConfirm, onRegenerate }: VariationPickerProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [fullscreenVariation, setFullscreenVariation] = useState<ReelVariation | null>(null)
  const [regenerating, setRegenerating] = useState(false)

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

  async function handleRegenerate() {
    setRegenerating(true)
    setSelected(null)
    onRegenerate()
  }

  const makeProps = (variation: ReelVariation): ReelCompositionProps => ({
    script: variation.script,
    variation,
    brandColor,
    brandSecondaryColor: brandSecondaryColor || brandColor,
    logoUrl,
    businessName,
    industry,
    websiteUrl,
  })

  const TONE_ICONS: Record<string, string> = {
    story: '❤',
    bold: '⚡',
    authority: '✦',
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--ink2)' }}>Three versions of your reel — same story, different voice.</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink4)' }}>Pick the one that sounds most like you.</p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:bg-[var(--bg2)] disabled:opacity-50"
          style={{ borderColor: 'var(--border)', color: 'var(--ink2)' }}
        >
          {regenerating ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : '↺'}
          Regenerate
        </button>
      </div>

      {/* Variation cards */}
      <div className={`grid gap-4 mb-6`} style={{ gridTemplateColumns: `repeat(${variations.length}, 1fr)` }}>
        {variations.map(variation => {
          const isSelected = selected === variation.id
          const frames = Math.round(variation.script.totalDuration * REEL_FPS)

          return (
            <div key={variation.id} className="flex flex-col gap-2">
              {/* Variation name + description */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm">{TONE_ICONS[variation.tone] ?? '·'}</span>
                <div>
                  <p className="text-sm font-bold leading-tight" style={{ color: 'var(--ink)' }}>{variation.label}</p>
                  <p className="text-xs" style={{ color: 'var(--ink4)' }}>{variation.description}</p>
                </div>
              </div>

              {/* Video card */}
              <div
                className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
                style={{
                  border: `3px solid ${isSelected ? brandColor : 'var(--border)'}`,
                  boxShadow: isSelected ? `0 0 0 4px ${brandColor}25` : 'none',
                }}
                onClick={() => handleSelect(variation)}
              >
                <div className="relative" style={{ aspectRatio: '9/16', background: '#0a0a0a' }}>
                  <Player
                    component={ReelCompositionModule as never}
                    inputProps={makeProps(variation)}
                    durationInFrames={frames}
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

              {/* Hook preview */}
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

      {/* Confirm */}
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
                durationInFrames={Math.round(fullscreenVariation.script.totalDuration * REEL_FPS)}
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
