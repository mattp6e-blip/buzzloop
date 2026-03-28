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

const TONE_ICONS: Record<string, string> = {
  story: '❤',
  bold: '⚡',
  authority: '✦',
}

export function VariationPicker({ variations, brandColor, brandSecondaryColor, logoUrl, businessName, industry, websiteUrl, onSelect, onConfirm }: VariationPickerProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [fullscreenVariation, setFullscreenVariation] = useState<ReelVariation | null>(null)

  useEffect(() => {
    if (variations.length > 0 && selectedId === null) {
      setSelectedId(variations[0].id)
      onSelect(variations[0])
    }
  }, [variations])

  function handleSelect(variation: ReelVariation) {
    setSelectedId(variation.id)
    onSelect(variation)
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

  const activeVariation = variations.find(v => v.id === selectedId) ?? variations[0]
  if (!activeVariation) return null

  return (
    <div style={{ maxWidth: 320 }}>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: 'var(--bg2)' }}>
        {variations.map(variation => {
          const isActive = variation.id === selectedId
          return (
            <button
              key={variation.id}
              onClick={() => handleSelect(variation)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-150"
              style={{
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? brandColor : 'var(--ink3)',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <span className="text-base leading-none">{TONE_ICONS[variation.tone] ?? '·'}</span>
              <span>{variation.label}</span>
            </button>
          )
        })}
      </div>

      {/* Description */}
      <p className="text-xs text-center mb-4" style={{ color: 'var(--ink4)' }}>
        {activeVariation.description}
      </p>

      {/* Single phone preview — key forces remount (restarts reel) on tab switch */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          aspectRatio: '9/16',
          background: '#0a0a0a',
          border: `3px solid ${brandColor}`,
          boxShadow: `0 0 0 4px ${brandColor}25`,
        }}
      >
        <Player
          key={selectedId}
          component={ReelCompositionModule as never}
          inputProps={makeProps(activeVariation)}
          durationInFrames={Math.round(activeVariation.script.totalDuration * REEL_FPS)}
          compositionWidth={REEL_WIDTH}
          compositionHeight={REEL_HEIGHT}
          fps={REEL_FPS}
          style={{ width: '100%', height: '100%' }}
          controls={false}
          loop
          autoPlay
        />

        {/* Fullscreen icon */}
        <button
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg opacity-70 hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setFullscreenVariation(activeVariation)}
          title="Full preview"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>

      {/* Confirm */}
      <button
        onClick={onConfirm}
        className="w-full py-3 rounded-xl text-sm font-bold mt-5 transition-all hover:opacity-90"
        style={{ background: brandColor, color: 'white' }}
      >
        Edit & Save this version →
      </button>

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
