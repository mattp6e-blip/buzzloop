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
  hook:    'Opening hook',
  quote:   'Review quote',
  proof:   'Social proof',
  insight: 'Key insight',
  cta:     'Call to action',
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
  const [showPhotoPicker, setShowPhotoPicker] = useState<'hook' | 'cta' | null>(null)
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

  function setPhoto(slot: 'hook' | 'cta', url: string | null) {
    setEditedVariation(v => ({ ...v, [slot === 'hook' ? 'hookPhoto' : 'ctaPhoto']: url }))
    setShowPhotoPicker(null)
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
  const photoSlot = activeSlideData.type === 'hook' ? 'hook' : activeSlideData.type === 'cta' ? 'cta' : null
  const currentPhoto = photoSlot === 'hook' ? editedVariation.hookPhoto : photoSlot === 'cta' ? editedVariation.ctaPhoto : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: 600 }}>

      {/* ── Three-column editor ── */}
      <div style={{ display: 'flex', gap: 0, flex: 1, minHeight: 0 }}>

        {/* Left panel: slide list */}
        <div style={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          paddingRight: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>

          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--ink4)' }}>Slides</p>

          {slideListItems.map(item => (
            <button
              key={item.index}
              onClick={() => setActiveSlide(item.index)}
              className="w-full text-left rounded-xl px-3 py-3 transition-all"
              style={{
                background: activeSlide === item.index ? `${brandColor}12` : 'transparent',
                border: `1.5px solid ${activeSlide === item.index ? brandColor + '40' : 'transparent'}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold w-4 text-center" style={{ color: activeSlide === item.index ? brandColor : 'var(--ink4)' }}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold" style={{ color: activeSlide === item.index ? 'var(--ink)' : 'var(--ink3)' }}>
                  {item.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Centre: live preview */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
        }}>
          {/* Tone tabs — centered above phone */}
          {variations.length > 1 && (
            <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: 'var(--bg2)' }}>
              {variations.map((v, idx) => {
                const isActive = idx === activeVariationIdx
                return (
                  <button
                    key={v.id}
                    onClick={() => switchVariation(idx)}
                    className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-150"
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
          <div className="rounded-2xl overflow-hidden" style={{ width: 300, boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <Player
              key={`${activeVariationIdx}`}
              component={ReelCompositionModule as never}
              inputProps={playerProps}
              durationInFrames={totalFrames}
              compositionWidth={REEL_WIDTH}
              compositionHeight={REEL_HEIGHT}
              fps={REEL_FPS}
              style={{ width: 300, height: Math.round(300 * REEL_HEIGHT / REEL_WIDTH) }}
              controls
              loop
              autoPlay
            />
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--ink4)' }}>Live preview · edits update in real time</p>
        </div>

        {/* Right panel: slide editor + caption */}
        <div style={{
          width: 420,
          flexShrink: 0,
          borderLeft: '1px solid var(--border)',
          paddingLeft: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* Slide editor — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, minHeight: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1 mt-1" style={{ color: 'var(--ink4)' }}>Editing</p>
            <p className="text-base font-bold mb-4" style={{ color: 'var(--ink)' }}>{activeItem.label}</p>

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

              {/* Photo picker for hook + CTA slides */}
              {photoSlot && (
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Background photo</label>
                  {currentPhoto ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                      <img src={currentPhoto} className="rounded-lg object-cover flex-shrink-0" style={{ width: 52, height: 52 }} />
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => setShowPhotoPicker(photoSlot)}
                          className="text-xs font-semibold block hover:opacity-70"
                          style={{ color: brandColor }}
                        >Change photo</button>
                        <button
                          onClick={() => setPhoto(photoSlot, null)}
                          className="text-xs block mt-0.5 hover:opacity-70"
                          style={{ color: 'var(--ink4)' }}
                        >Remove</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPhotoPicker(photoSlot)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all hover:bg-[var(--bg2)]"
                      style={{ borderColor: 'var(--border)', borderStyle: 'dashed', color: 'var(--ink3)' }}
                    >
                      {gbpPhotos.length > 0 ? '⊞ Pick a photo from your library' : '⊞ Add photos in Media tab first'}
                    </button>
                  )}

                  {/* Photo picker modal */}
                  {showPhotoPicker === photoSlot && gbpPhotos.length > 0 && (
                    <div className="mt-2 p-3 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ink3)' }}>Your photos</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {gbpPhotos.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setPhoto(photoSlot, url)}
                            className="rounded-lg overflow-hidden hover:ring-2 transition-all"
                            style={{ aspectRatio: '1/1', outlineColor: brandColor }}
                          >
                            <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowPhotoPicker(null)}
                        className="text-xs mt-2 hover:opacity-70"
                        style={{ color: 'var(--ink4)' }}
                      >Cancel</button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Caption + save */}
          <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
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
    </div>
  )
}
