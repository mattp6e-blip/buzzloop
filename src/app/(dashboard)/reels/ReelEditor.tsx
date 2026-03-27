'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { ReelScript } from '@/types'
import type { ReelVariation, ReelCompositionProps } from '@/remotion/types'
import { REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from '@/remotion/ReelComposition'

const Player = dynamic(() => import('@remotion/player').then(m => m.Player), { ssr: false })
const ReelCompositionModule = dynamic(() => import('@/remotion/ReelComposition').then(m => ({ default: m.ReelComposition })), { ssr: false })

interface Props {
  script: ReelScript
  variation: ReelVariation
  variations: ReelVariation[]
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
  onSave: (script: ReelScript, variation: ReelVariation) => void
  onBack: () => void
  onSwitchVariation: (v: ReelVariation) => void
  saving: boolean
  saved: boolean
  saveError: string | null
}

const SLIDE_LABELS: Record<string, string> = {
  hook:  'Opening hook',
  quote: 'Review quote',
  proof: 'Social proof',
  cta:   'Call to action',
}

const SLIDE_ICONS: Record<string, string> = {
  hook:  '✦',
  quote: '❝',
  proof: '★',
  cta:   '→',
}

export function ReelEditor({
  script, variation, variations, brandColor, brandSecondaryColor, logoUrl, businessName,
  industry, websiteUrl, businessId, caption, onCaptionChange, generatingCaption,
  onRegenerateCaption, onSave, onBack, onSwitchVariation, saving, saved, saveError,
}: Props) {
  const [editedScript, setEditedScript]     = useState<ReelScript>(() => JSON.parse(JSON.stringify(script)))
  const [editedVariation, setEditedVariation] = useState<ReelVariation>(() => ({ ...variation }))
  const [activeSlide, setActiveSlide]       = useState(0)
  const [uploadingSlot, setUploadingSlot]   = useState<number | null>(null)

  function updateSlide(index: number, patch: Partial<ReelScript['slides'][0]['content']>) {
    setEditedScript(prev => ({
      ...prev,
      slides: prev.slides.map((s, i) => i === index ? { ...s, content: { ...s.content, ...patch } } : s),
    }))
  }

  async function handlePhotoUpload(slideIndex: number, file: File) {
    setUploadingSlot(slideIndex)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('businessId', businessId)
    try {
      const res = await fetch('/api/upload-reel-photo', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.publicUrl) updateSlide(slideIndex, { photoUrl: data.publicUrl })
    } catch {}
    setUploadingSlot(null)
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
  }

  const totalFrames = Math.round(editedScript.totalDuration * REEL_FPS)

  // Build slide list labels (quote slides get numbered)
  let quoteCount = 0
  const slideListItems = editedScript.slides.map((slide, i) => {
    const isQuote = slide.type === 'quote'
    if (isQuote) quoteCount++
    const label = SLIDE_LABELS[slide.type] + (isQuote && quoteCount > 1 ? ` ${quoteCount}` : '')
    const preview = slide.type === 'hook'
      ? editedVariation.hookHeadline
      : slide.type === 'quote'
        ? (slide.content.quote ?? '')
        : slide.type === 'proof'
          ? (slide.content.stat ?? '')
          : editedVariation.ctaText
    return { label, preview, icon: SLIDE_ICONS[slide.type] ?? '·', index: i, type: slide.type }
  })

  const activeItem = slideListItems[activeSlide]
  const activeSlideData = editedScript.slides[activeSlide]
  const canHavePhoto = activeSlideData.type === 'hook' || activeSlideData.type === 'quote'

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 200px)', minHeight: 600 }}>

      {/* ── Left panel: slide list ── */}
      <div style={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        paddingRight: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-xs hover:opacity-70 transition-opacity flex items-center gap-1"
            style={{ color: 'var(--ink3)' }}
          >
            ← Style
          </button>
          {variations.length > 1 && (
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              {variations.map(v => (
                <button
                  key={v.id}
                  onClick={() => onSwitchVariation(v)}
                  className="px-2 py-1 rounded-md text-xs font-medium transition-all"
                  style={editedVariation.visualStyle === v.visualStyle
                    ? { background: 'white', color: 'var(--ink)', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }
                    : { color: 'var(--ink4)' }
                  }
                >
                  {v.visualStyle === 'cinematic' ? '🎬' : '☀'}
                </button>
              ))}
            </div>
          )}
        </div>

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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold w-4 text-center" style={{ color: activeSlide === item.index ? brandColor : 'var(--ink4)' }}>
                {item.icon}
              </span>
              <span className="text-sm font-semibold" style={{ color: activeSlide === item.index ? 'var(--ink)' : 'var(--ink3)' }}>
                {item.label}
              </span>
            </div>
            <p className="text-sm truncate pl-6" style={{ color: 'var(--ink4)' }}>
              {item.preview?.slice(0, 40) || '—'}
            </p>
          </button>
        ))}
      </div>

      {/* ── Centre: live preview ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
      }}>
        <div className="rounded-2xl overflow-hidden" style={{ width: 320, aspectRatio: '9/16', background: '#0a0a0a', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
          <Player
            component={ReelCompositionModule as never}
            inputProps={playerProps}
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
        <p className="text-xs mt-3" style={{ color: 'var(--ink4)' }}>Live preview · edits update in real time</p>
      </div>

      {/* ── Right panel: slide editor + caption ── */}
      <div style={{
        width: 460,
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

            {/* Background photo */}
            {canHavePhoto && (
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ink3)' }}>Background photo <span style={{ fontWeight: 400 }}>(optional)</span></label>
                {activeSlideData.content.photoUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                    <img src={activeSlideData.content.photoUrl} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: 'var(--ink2)' }}>Photo set</p>
                      <p className="text-xs" style={{ color: 'var(--ink4)' }}>Replaces gradient background</p>
                    </div>
                    <button
                      onClick={() => updateSlide(activeSlide, { photoUrl: undefined })}
                      className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0 hover:opacity-70"
                      style={{ color: 'var(--ink4)', background: 'var(--bg2)' }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && handlePhotoUpload(activeSlide, e.target.files[0])}
                    />
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium w-full justify-center transition-all hover:bg-[var(--bg2)]"
                      style={{
                        borderColor: uploadingSlot === activeSlide ? brandColor : 'var(--border)',
                        borderStyle: 'dashed',
                        color: uploadingSlot === activeSlide ? brandColor : 'var(--ink3)',
                      }}
                    >
                      {uploadingSlot === activeSlide ? (
                        <>
                          <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>📷 Add background photo</>
                      )}
                    </div>
                  </label>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Caption + save — fixed at bottom, never scrolls away */}
        <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink4)' }}>Instagram caption</label>
            {!generatingCaption && (
              <button onClick={onRegenerateCaption} className="text-xs hover:opacity-70 transition-opacity" style={{ color: brandColor }}>
                ↺ Regenerate
              </button>
            )}
          </div>

          {generatingCaption ? (
            <div className="flex items-center gap-2 py-4">
              <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: brandColor, borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: 'var(--ink3)' }}>Writing caption...</p>
            </div>
          ) : (
            <textarea
              value={caption}
              onChange={e => onCaptionChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
              style={{ borderColor: 'var(--border)', color: 'var(--ink2)', background: 'var(--bg)', minHeight: 140, lineHeight: 1.65 }}
              onFocus={e => e.target.style.borderColor = brandColor}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              placeholder="Caption will appear here..."
            />
          )}

          <button
            onClick={() => onSave(editedScript, editedVariation)}
            disabled={saving || saved || !caption || generatingCaption}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: saved ? '#16a34a' : brandColor,
              color: 'white',
              opacity: saving || !caption || generatingCaption ? 0.6 : 1,
              cursor: saving || saved || !caption || generatingCaption ? 'not-allowed' : 'pointer',
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
