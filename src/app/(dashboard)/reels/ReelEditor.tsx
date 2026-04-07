'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { ReelScript } from '@/types'
import type { ReelVariation, ReelCompositionProps } from '@/remotion/types'
import { REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from '@/remotion/ReelComposition'

const Player = dynamic(() => import('@remotion/player').then(m => m.Player), { ssr: false })
const ReelCompositionModule = dynamic(() => import('@/remotion/ReelComposition').then(m => ({ default: m.ReelComposition })), { ssr: false })

interface Props {
  variations: ReelVariation[]
  script: ReelScript
  variation: ReelVariation
  brandColor: string
  brandSecondaryColor: string
  logoUrl: string | null
  businessName: string
  industry: string
  websiteUrl: string | null
  businessId: string
  caption: string
  onCaptionChange: (v: string) => void
  generatingCaption: boolean
  onRegenerateCaption: () => void
  cityMissing: boolean
  savingCity: boolean
  onCitySave: (city: string) => void
  gbpPhotos: string[]
  onSave: (script: ReelScript, variation: ReelVariation) => void
  onBack: () => void
  saving: boolean
  saved: boolean
  saveError: string | null
}

const SLIDE_LABELS: Record<string, string> = {
  hook:    'Hook',
  quote:   'Quote',
  proof:   'Proof',
  insight: 'Insight',
  cta:     'CTA',
}

const SLIDE_ICONS: Record<string, string> = {
  hook:    '✦',
  quote:   '❝',
  proof:   '★',
  insight: '▸',
  cta:     '→',
}

const TONE_ICONS: Record<string, string> = {
  story: '❤',
  proof: '✦',
  bold:  '⚡',
}

const PREVIEW_W = 280
const PREVIEW_H = Math.round(PREVIEW_W * REEL_HEIGHT / REEL_WIDTH)

export function ReelEditor({
  variations, script, variation, brandColor, brandSecondaryColor, logoUrl, businessName,
  industry, websiteUrl, businessId, gbpPhotos, caption, onCaptionChange, generatingCaption,
  onRegenerateCaption, cityMissing, savingCity, onCitySave, onSave, onBack, saving, saved, saveError,
}: Props) {
  const [activeVariationIdx, setActiveVariationIdx] = useState(() =>
    Math.max(0, variations.findIndex(v => v.id === variation.id))
  )
  const [editedScript, setEditedScript]       = useState<ReelScript>(() => JSON.parse(JSON.stringify(script)))
  const [editedVariation, setEditedVariation] = useState<ReelVariation>(() => ({ ...variation }))
  const [activeSlide, setActiveSlide]         = useState(0)
  const [cityInput, setCityInput]             = useState('')
  const cityInputRef                          = useRef<HTMLInputElement>(null)

  function switchVariation(idx: number) {
    const v = variations[idx]
    if (!v) return
    setActiveVariationIdx(idx)
    setEditedScript(JSON.parse(JSON.stringify(v.script)))
    setEditedVariation({ ...v })
    setActiveSlide(0)
  }

  function updateSlide(index: number, patch: Partial<ReelScript['slides'][0]['content']>) {
    setEditedScript(prev => ({
      ...prev,
      slides: prev.slides.map((s, i) => i === index ? { ...s, content: { ...s.content, ...patch } } : s),
    }))
  }

  const playerProps: ReelCompositionProps = {
    script: editedScript,
    variation: editedVariation,
    brandColor,
    brandSecondaryColor: brandSecondaryColor || brandColor,
    logoUrl,
    businessName,
    industry,
    websiteUrl,
    gbpPhotos,
  }

  const totalFrames = Math.round(editedScript.totalDuration * REEL_FPS)

  let quoteCount = 0
  const slideListItems = editedScript.slides.map((slide, i) => {
    const isQuote = slide.type === 'quote'
    if (isQuote) quoteCount++
    const label = SLIDE_LABELS[slide.type] + (isQuote && quoteCount > 1 ? ` ${quoteCount}` : '')
    return { label, icon: SLIDE_ICONS[slide.type] ?? '·', index: i, type: slide.type }
  })

  const activeItem = slideListItems[activeSlide]
  const activeSlideData = editedScript.slides[activeSlide]

  return (
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>

      {/* ── Left: phone preview ── */}
      <div style={{ width: PREVIEW_W, flexShrink: 0 }}>

        {/* Tone tabs */}
        {variations.length > 1 && (
          <div className="flex gap-1.5 mb-4 p-1 rounded-2xl" style={{ background: 'var(--bg2)' }}>
            {variations.map((v, idx) => {
              const isActive = idx === activeVariationIdx
              return (
                <button
                  key={v.id}
                  onClick={() => switchVariation(idx)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all duration-150 flex-1 justify-center"
                  style={{
                    background: isActive ? 'var(--surface)' : 'transparent',
                    color: isActive ? brandColor : 'var(--ink3)',
                    boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <span>{TONE_ICONS[v.tone] ?? '·'}</span>
                  <span>{v.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Phone frame */}
        <div
          className="rounded-[28px] overflow-hidden"
          style={{ width: PREVIEW_W, boxShadow: '0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.08)' }}
        >
          <Player
            key={`${activeVariationIdx}`}
            component={ReelCompositionModule as never}
            inputProps={playerProps}
            durationInFrames={totalFrames}
            compositionWidth={REEL_WIDTH}
            compositionHeight={REEL_HEIGHT}
            fps={REEL_FPS}
            style={{ width: PREVIEW_W, height: PREVIEW_H }}
            controls
            loop
            autoPlay
          />
        </div>

        <p className="text-xs mt-2.5 text-center" style={{ color: 'var(--ink4)' }}>
          Live preview · exported video is full 1080p HD
        </p>
      </div>

      {/* ── Right: editor panel ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Slide selector — horizontal pill row */}
        <div style={{ marginBottom: 20 }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--ink4)' }}>Slides</p>
          <div className="flex flex-wrap gap-1.5">
            {slideListItems.map(item => {
              const isActive = activeSlide === item.index
              return (
                <button
                  key={item.index}
                  onClick={() => setActiveSlide(item.index)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: isActive ? `${brandColor}15` : 'var(--bg2)',
                    border: `1.5px solid ${isActive ? brandColor + '50' : 'transparent'}`,
                    color: isActive ? brandColor : 'var(--ink3)',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

        {/* Slide editor */}
        <div style={{ marginBottom: 20 }}>
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>
            Editing: {activeItem.label}
          </p>

          <div className="flex flex-col gap-3">

            {/* Hook */}
            {activeSlideData.type === 'hook' && (
              <>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Hook text</label>
                  <textarea
                    value={editedVariation.hookHeadline}
                    onChange={e => setEditedVariation(v => ({ ...v, hookHeadline: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--bg)', lineHeight: 1.55 }}
                    onFocus={e => e.target.style.borderColor = brandColor}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                {editedVariation.hookSubline !== null && editedVariation.hookSubline !== undefined && (
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Subline <span style={{ fontWeight: 400 }}>(optional)</span></label>
                    <input
                      value={editedVariation.hookSubline}
                      onChange={e => setEditedVariation(v => ({ ...v, hookSubline: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                      style={{ borderColor: 'var(--border)', color: 'var(--ink3)', background: 'var(--bg)' }}
                      onFocus={e => e.target.style.borderColor = brandColor}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                )}
              </>
            )}

            {/* Insight */}
            {activeSlideData.type === 'insight' && (
              <>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Insight</label>
                  <textarea
                    value={activeSlideData.content.headline ?? ''}
                    onChange={e => updateSlide(activeSlide, { headline: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--bg)', lineHeight: 1.55 }}
                    onFocus={e => e.target.style.borderColor = brandColor}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Supporting line <span style={{ fontWeight: 400 }}>(optional)</span></label>
                  <input
                    value={activeSlideData.content.subline ?? ''}
                    onChange={e => updateSlide(activeSlide, { subline: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink3)', background: 'var(--bg)' }}
                    onFocus={e => e.target.style.borderColor = brandColor}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </>
            )}

            {/* Quote */}
            {activeSlideData.type === 'quote' && (
              <>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Quote</label>
                  <textarea
                    value={activeSlideData.content.quote ?? ''}
                    onChange={e => updateSlide(activeSlide, { quote: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--bg)', lineHeight: 1.55 }}
                    onFocus={e => e.target.style.borderColor = brandColor}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Customer name <span style={{ fontWeight: 400 }}>(optional)</span></label>
                  <input
                    value={activeSlideData.content.author ?? ''}
                    onChange={e => updateSlide(activeSlide, { author: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink3)', background: 'var(--bg)' }}
                    onFocus={e => e.target.style.borderColor = brandColor}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </>
            )}

            {/* Proof */}
            {activeSlideData.type === 'proof' && (
              <>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Stat</label>
                  <input
                    value={activeSlideData.content.stat ?? ''}
                    onChange={e => updateSlide(activeSlide, { stat: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--bg)' }}
                    placeholder="e.g. 4.9★ · 127 reviews"
                    onFocus={e => e.target.style.borderColor = brandColor}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Supporting line</label>
                  <input
                    value={activeSlideData.content.subline ?? ''}
                    onChange={e => updateSlide(activeSlide, { subline: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink3)', background: 'var(--bg)' }}
                    onFocus={e => e.target.style.borderColor = brandColor}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </>
            )}

            {/* CTA */}
            {activeSlideData.type === 'cta' && (
              <>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Closing question</label>
                  <textarea
                    value={activeSlideData.content.headline ?? ''}
                    onChange={e => updateSlide(activeSlide, { headline: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--bg)', lineHeight: 1.55 }}
                    onFocus={e => e.target.style.borderColor = brandColor}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Call to action</label>
                  <textarea
                    value={editedVariation.ctaText}
                    onChange={e => setEditedVariation(v => ({ ...v, ctaText: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink3)', background: 'var(--bg)', lineHeight: 1.55 }}
                    onFocus={e => e.target.style.borderColor = brandColor}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </>
            )}


          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

        {/* Caption + save */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink4)' }}>Instagram caption</label>
            {!generatingCaption && !cityMissing && (
              <button onClick={onRegenerateCaption} className="text-xs hover:opacity-70 transition-opacity" style={{ color: brandColor }}>
                ↺ Regenerate
              </button>
            )}
          </div>

          {cityMissing ? (
            <div className="rounded-xl border p-4" style={{ borderColor: `${brandColor}40`, background: `${brandColor}08` }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Where is {businessName} based?</p>
              <p className="text-xs mb-3" style={{ color: 'var(--ink3)' }}>Used to generate location hashtags for your post</p>
              <div className="flex gap-2">
                <input
                  ref={cityInputRef}
                  value={cityInput}
                  onChange={e => setCityInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && cityInput.trim()) onCitySave(cityInput.trim()) }}
                  placeholder="e.g. London"
                  className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'white' }}
                  onFocus={e => e.target.style.borderColor = brandColor}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  autoFocus
                />
                <button
                  onClick={() => { if (cityInput.trim()) onCitySave(cityInput.trim()) }}
                  disabled={!cityInput.trim() || savingCity}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background: brandColor, color: 'white', opacity: !cityInput.trim() || savingCity ? 0.5 : 1 }}
                >
                  {savingCity ? '...' : 'Save'}
                </button>
              </div>
            </div>
          ) : generatingCaption ? (
            <div className="flex items-center gap-2 py-4">
              <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: brandColor, borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: 'var(--ink3)' }}>Writing caption...</p>
            </div>
          ) : (
            <textarea
              value={caption}
              onChange={e => onCaptionChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
              style={{ borderColor: 'var(--border)', color: 'var(--ink2)', background: 'var(--bg)', minHeight: 120, lineHeight: 1.65 }}
              onFocus={e => e.target.style.borderColor = brandColor}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              placeholder="Caption will appear here..."
            />
          )}

          {!cityMissing && !generatingCaption && caption && (
            <p className="text-xs px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: 'var(--bg2)', color: 'var(--ink3)' }}>
              <span>🎵</span>
              <span><strong style={{ color: 'var(--ink2)' }}>Tip:</strong> Add a trending audio track in Instagram before posting — reels with audio get significantly more reach.</span>
            </p>
          )}

          <button
            onClick={() => onSave(editedScript, editedVariation)}
            disabled={saving || saved || !caption || generatingCaption || cityMissing}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: saved ? '#16a34a' : brandColor,
              color: 'white',
              opacity: saving || !caption || generatingCaption || cityMissing ? 0.6 : 1,
              cursor: saving || saved || !caption || generatingCaption || cityMissing ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved to content library' : '✦ Save to content library'}
          </button>

          {saved && (
            <p className="text-xs text-center" style={{ color: 'var(--ink3)' }}>
              View in <a href="/content" style={{ color: brandColor }}>Content library →</a>
            </p>
          )}
          {saveError && (
            <p className="text-xs px-3 py-2 rounded-lg mb-4" style={{ background: '#fee2e2', color: '#dc2626' }}>
              Save failed: {saveError}
            </p>
          )}
        </div>
      </div>

    </div>
  )
}
