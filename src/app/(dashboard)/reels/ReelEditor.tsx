'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { ReelScript } from '@/types'
import type { ReelVariation, ReelCompositionProps, VisualTemplate } from '@/remotion/types'
import { REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from '@/remotion/ReelComposition'
import { computeReelFrames } from '@/lib/reel-frames'

const Player = dynamic(() => import('@remotion/player').then(m => m.Player), { ssr: false })
const ReelCompositionModule = dynamic(() => import('@/remotion/ReelCompositionV2').then(m => ({ default: m.ReelCompositionV2 })), { ssr: false })

// ── Palette registry ────────────────────────────────────────────

type PaletteKey =
  | 'dark_cinematic' | 'bold_energy' | 'magazine_light' | 'brand_forward'
  | 'neon_pulse' | 'pure_type' | 'cards_all_day' | 'editorial_mix'
  | 'cinematic_cards' | 'immersive_overlay'

interface PaletteSlots {
  hook: VisualTemplate; quote: VisualTemplate; proof: VisualTemplate
  insight: VisualTemplate; cta: VisualTemplate
}

interface PaletteEntry { key: PaletteKey; label: string; slots: PaletteSlots }

const PALETTE_REGISTRY: Record<PaletteKey, PaletteEntry> = {
  dark_cinematic:    { key: 'dark_cinematic',    label: 'Dark Cinematic',    slots: { hook: 'cinematic', quote: 'overlay',  proof: 'minimal', insight: 'gradient',  cta: 'brand'    }},
  bold_energy:       { key: 'bold_energy',        label: 'Bold Energy',       slots: { hook: 'bold',      quote: 'neon',     proof: 'gradient',insight: 'neon',      cta: 'brand'    }},
  magazine_light:    { key: 'magazine_light',     label: 'Magazine Light',    slots: { hook: 'headline',  quote: 'headline', proof: 'split',   insight: 'editorial', cta: 'bold'     }},
  brand_forward:     { key: 'brand_forward',      label: 'Brand Forward',     slots: { hook: 'gradient',  quote: 'cards',    proof: 'minimal', insight: 'gradient',  cta: 'brand'    }},
  neon_pulse:        { key: 'neon_pulse',         label: 'Neon Pulse',        slots: { hook: 'neon',      quote: 'neon',     proof: 'minimal', insight: 'neon',      cta: 'gradient' }},
  pure_type:         { key: 'pure_type',          label: 'Pure Type',         slots: { hook: 'minimal',   quote: 'minimal',  proof: 'minimal', insight: 'minimal',   cta: 'brand'    }},
  cards_all_day:     { key: 'cards_all_day',      label: 'Cards All Day',     slots: { hook: 'cards',     quote: 'cards',    proof: 'minimal', insight: 'cards',     cta: 'brand'    }},
  editorial_mix:     { key: 'editorial_mix',      label: 'Editorial Mix',     slots: { hook: 'editorial', quote: 'headline', proof: 'minimal', insight: 'editorial', cta: 'gradient' }},
  cinematic_cards:   { key: 'cinematic_cards',    label: 'Cinematic Cards',   slots: { hook: 'cinematic', quote: 'cards',    proof: 'minimal', insight: 'gradient',  cta: 'brand'    }},
  immersive_overlay: { key: 'immersive_overlay',  label: 'Immersive Overlay', slots: { hook: 'immersive', quote: 'overlay',  proof: 'minimal', insight: 'cinematic', cta: 'brand'    }},
}

function suggestPalettes(tone: string, hasPhotos: boolean): [PaletteKey, PaletteKey, PaletteKey] {
  if (hasPhotos) {
    if (tone === 'story') return ['dark_cinematic', 'immersive_overlay', 'cinematic_cards']
    if (tone === 'bold')  return ['bold_energy', 'cinematic_cards', 'cards_all_day']
    return ['brand_forward', 'cards_all_day', 'dark_cinematic']
  }
  if (tone === 'story') return ['editorial_mix', 'magazine_light', 'brand_forward']
  if (tone === 'bold')  return ['bold_energy', 'neon_pulse', 'pure_type']
  return ['pure_type', 'brand_forward', 'magazine_light']
}

function applyPaletteToScript(s: ReelScript, palette: PaletteEntry): ReelScript {
  return {
    ...s,
    slides: s.slides.map(slide => ({
      ...slide,
      content: {
        ...slide.content,
        template: palette.slots[slide.type as keyof PaletteSlots] ?? 'immersive',
      },
    })),
  }
}

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
  uploadedPhotos: string[]
  onSave: (script: ReelScript, variation: ReelVariation) => void
  onBack: () => void
  saving: boolean
  saved: boolean
  saveError: string | null
  isPro: boolean
  downloadsUsed: number
}

// ── Music options ──────────────────────────────────────────────

const AUDIO_BASE = 'https://rhggudgximifbtyygyyh.supabase.co/storage/v1/object/public/audio'

const MUSIC_OPTIONS: { label: string; url: string | null; emoji: string }[] = [
  { label: 'None',         url: null,                              emoji: '🔇' },
  { label: 'Cinematic',    url: `${AUDIO_BASE}/cinematic.mp3`,    emoji: '🎬' },
  { label: 'Upbeat',       url: `${AUDIO_BASE}/upbeat.mp3`,       emoji: '⚡' },
  { label: 'Motivational', url: `${AUDIO_BASE}/motivational.mp3`, emoji: '🔥' },
  { label: 'Acoustic',     url: `${AUDIO_BASE}/acoustic.mp3`,     emoji: '🎸' },
  { label: 'Chill',        url: `${AUDIO_BASE}/chill.mp3`,        emoji: '✨' },
  { label: 'Corporate',    url: `${AUDIO_BASE}/corporate.mp3`,    emoji: '💼' },
]

// ── Photo picker ───────────────────────────────────────────────

function PhotoPicker({ photos, selected, brandColor, onSelect }: {
  photos: string[]
  selected: string | null
  brandColor: string
  onSelect: (url: string | null) => void
}) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--ink3)' }}>
        Background photo <span style={{ fontWeight: 400 }}>(optional)</span>
      </label>
      {photos.length === 0 ? (
        <a
          href="/media"
          style={{ textDecoration: 'none', display: 'block', borderRadius: 12, border: `1.5px dashed ${brandColor}40`, padding: '12px 14px', background: `${brandColor}06` }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--ink2)' }}>Add photos to make this reel stand out</p>
          <p className="text-xs mb-2" style={{ color: 'var(--ink3)', lineHeight: 1.5 }}>Real photos stop the scroll. Best shots: your space, your team, your work.</p>
          <span className="text-xs font-bold" style={{ color: brandColor }}>Upload photos in Media →</span>
        </a>
      ) : (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {/* None */}
          <button
            onClick={() => onSelect(null)}
            style={{
              width: 64, height: 64, flexShrink: 0,
              borderRadius: 10,
              border: `2px solid ${!selected ? brandColor : 'var(--border)'}`,
              background: !selected ? `${brandColor}12` : 'var(--bg2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, cursor: 'pointer',
              color: !selected ? brandColor : 'var(--ink4)',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
          {photos.map(url => {
            const isSelected = selected === url
            return (
              <button
                key={url}
                onClick={() => onSelect(isSelected ? null : url)}
                style={{
                  width: 64, height: 64, flexShrink: 0,
                  borderRadius: 10,
                  border: `2px solid ${isSelected ? brandColor : 'transparent'}`,
                  padding: 0, cursor: 'pointer', overflow: 'hidden',
                  boxShadow: isSelected ? `0 0 0 3px ${brandColor}40` : 'none',
                  outline: 'none',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Slide labels ────────────────────────────────────────────────

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
  industry, websiteUrl, businessId, gbpPhotos, uploadedPhotos = [], caption, onCaptionChange, generatingCaption,
  onRegenerateCaption, cityMissing, savingCity, onCitySave, onSave, onBack, saving, saved, saveError,
  isPro, downloadsUsed,
}: Props) {
  const FREE_DOWNLOAD_LIMIT = 2
  const hasPhotos = uploadedPhotos.length > 0 || gbpPhotos.length > 0

  const [activeVariationIdx, setActiveVariationIdx] = useState(() =>
    Math.max(0, variations.findIndex(v => v.id === variation.id))
  )

  const initPalette = PALETTE_REGISTRY[suggestPalettes(variation.tone ?? 'story', hasPhotos)[0]]

  const [editedScript, setEditedScript] = useState<ReelScript>(() =>
    applyPaletteToScript(JSON.parse(JSON.stringify(script)), initPalette)
  )
  const [editedVariation, setEditedVariation] = useState<ReelVariation>(() => ({ ...variation }))
  const [activeSlide, setActiveSlide]         = useState(0)
  const [cityInput, setCityInput]             = useState('')
  const cityInputRef                          = useRef<HTMLInputElement>(null)
  const audioRef                              = useRef<HTMLAudioElement | null>(null)
  const [audioEnabled, setAudioEnabled]       = useState(false)
  const [downloading, setDownloading]         = useState(false)
  const [downloadStatus, setDownloadStatus]   = useState<string>('')
  const [renderProgress, setRenderProgress]   = useState<number>(0)
  const [downloadError, setDownloadError]     = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgrading, setUpgrading]             = useState(false)
  const [localDownloadsUsed, setLocalDownloadsUsed] = useState(downloadsUsed)

  // Sync photos from parent when they arrive after initial mount (async Supabase fetch)
  useEffect(() => {
    if (variation.hookPhoto || variation.ctaPhoto) {
      setEditedVariation(prev => ({
        ...prev,
        hookPhoto: prev.hookPhoto ?? variation.hookPhoto,
        ctaPhoto: prev.ctaPhoto ?? variation.ctaPhoto,
      }))
    }
  }, [variation.hookPhoto, variation.ctaPhoto])

  // Rebuild Audio instance whenever track or variation changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setAudioEnabled(false)
    if (editedVariation.musicUrl) {
      const a = new Audio(editedVariation.musicUrl)
      a.volume = 0.28
      a.loop = true
      audioRef.current = a
    }
  }, [editedVariation.musicUrl, activeVariationIdx])

  async function handleDownloadUpgrade() {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setUpgrading(false)
    }
  }

  async function handleDownload() {
    // Check download limit for free users
    if (!isPro) {
      if (localDownloadsUsed >= FREE_DOWNLOAD_LIMIT) {
        setShowUpgradeModal(true)
        return
      }
      // Pre-check with server
      const checkRes = await fetch('/api/reels/download', { method: 'POST' })
      const checkData = await checkRes.json()
      if (!checkData.allowed) {
        setShowUpgradeModal(true)
        return
      }
      setLocalDownloadsUsed(checkData.downloadsUsed)
    }

    setDownloading(true)
    setDownloadError(null)
    setRenderProgress(0)
    setDownloadStatus('Starting up...')
    try {
      const RENDER_URL = process.env.NEXT_PUBLIC_RENDER_SERVICE_URL || 'https://buzzloop-nwpv.onrender.com'

      // Start the Lambda render
      const startRes = await fetch(`${RENDER_URL}/api/render-reel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: editedScript,
          variation: editedVariation,
          brandColor,
          brandSecondaryColor: brandSecondaryColor || brandColor,
          logoUrl,
          businessName,
          industry,
          websiteUrl,
          gbpPhotos,
        }),
      })
      if (!startRes.ok) {
        const err = await startRes.json()
        throw new Error(err.error ?? 'Failed to start render')
      }
      const { renderId, bucketName } = await startRes.json()
      setDownloadStatus('Rendering...')

      // Poll until done
      // eslint-disable-next-line no-constant-condition
      while (true) {
        await new Promise(r => setTimeout(r, 3000))
        const statusRes = await fetch(`${RENDER_URL}/api/render-status?renderId=${renderId}&bucketName=${bucketName}`)
        const status = await statusRes.json()
        if (status.fatalErrorEncountered) {
          throw new Error(status.errors?.[0]?.message ?? 'Render failed')
        }
        if (typeof status.progress === 'number') {
          setRenderProgress(Math.round(status.progress * 100))
        }
        if (status.done && status.outputFile) {
          setDownloadStatus('Done!')
          const a = document.createElement('a')
          a.href = status.outputFile
          const slug = (editedScript.themeTitle ?? businessName).replace(/\s+/g, '-').toLowerCase()
          a.download = `${slug}.mp4`
          a.click()
          if (!saved && caption) onSave(editedScript, editedVariation)
          break
        }
      }
    } catch (err) {
      setDownloadError(String(err))
    }
    setDownloading(false)
    setDownloadStatus('')
    setRenderProgress(0)
  }

  function switchVariation(idx: number) {
    const v = variations[idx]
    if (!v) return
    setActiveVariationIdx(idx)
    const palette = PALETTE_REGISTRY[suggestPalettes(v.tone ?? 'story', hasPhotos)[0]]
    setEditedScript(applyPaletteToScript(JSON.parse(JSON.stringify(v.script)), palette))
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

  const totalFrames = computeReelFrames(editedScript.slides, REEL_FPS)

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
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Photo nudge banner ── */}
      {!hasPhotos && (
        <a
          href="/media"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, padding: '14px 20px',
            background: `${brandColor}12`,
            border: `1px solid ${brandColor}30`,
            borderRadius: 16, marginBottom: 28,
            textDecoration: 'none', cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>📸</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--ink1)', lineHeight: 1.3 }}>
                Reels with photos get 2× more views
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink3)', marginTop: 2 }}>
                Add photos of your space, team or work to make this reel stand out.
              </p>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: brandColor, whiteSpace: 'nowrap' }}>
            Add photos →
          </span>
        </a>
      )}

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
        <div style={{ position: 'relative', width: PREVIEW_W }}>
          <div
            className="rounded-[28px] overflow-hidden"
            style={{ width: PREVIEW_W, boxShadow: '0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.08)' }}
          >
            <Player
              key={`${activeVariationIdx}-${editedVariation.musicUrl ?? 'none'}`}
              component={ReelCompositionModule as never}
              inputProps={playerProps}
              durationInFrames={totalFrames}
              compositionWidth={REEL_WIDTH}
              compositionHeight={REEL_HEIGHT}
              fps={REEL_FPS}
              style={{ width: PREVIEW_W, height: PREVIEW_H }}
              numberOfSharedAudioTags={1}
              controls
              loop
              autoPlay
            />
          </div>
        </div>

        <p className="text-xs mt-2.5 text-center" style={{ color: 'var(--ink4)' }}>
          Live preview · exported video is full 1080p HD
        </p>
      </div>

      {/* ── Right: editor panel ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Slide selector, horizontal pill row */}
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
                <PhotoPicker
                  photos={uploadedPhotos}
                  selected={editedVariation.hookPhoto ?? null}
                  brandColor={brandColor}
                  onSelect={url => setEditedVariation(v => ({ ...v, hookPhoto: url }))}
                />
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
                <PhotoPicker
                  photos={uploadedPhotos}
                  selected={editedVariation.ctaPhoto ?? null}
                  brandColor={brandColor}
                  onSelect={url => setEditedVariation(v => ({ ...v, ctaPhoto: url }))}
                />
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

          {/* Music picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink4)' }}>Music</p>
              <button
                disabled={!editedVariation.musicUrl}
                onClick={() => {
                  if (audioEnabled) {
                    setAudioEnabled(false)
                    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
                  } else {
                    if (audioRef.current) {
                      audioRef.current.play().then(() => setAudioEnabled(true)).catch(() => {})
                    }
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: audioEnabled ? `${brandColor}18` : 'var(--bg2)',
                  border: `1.5px solid ${audioEnabled ? brandColor + '50' : 'var(--border)'}`,
                  color: audioEnabled ? brandColor : 'var(--ink3)',
                  opacity: editedVariation.musicUrl ? 1 : 0.4,
                  cursor: editedVariation.musicUrl ? 'pointer' : 'not-allowed',
                }}
              >
                {audioEnabled ? '■ Stop' : '▶ Preview'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MUSIC_OPTIONS.map(opt => {
                const isActive = (editedVariation.musicUrl ?? null) === opt.url
                return (
                  <button
                    key={opt.label}
                    onClick={() => setEditedVariation(v => ({ ...v, musicUrl: opt.url }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: isActive ? `${brandColor}15` : 'var(--bg2)',
                      border: `1.5px solid ${isActive ? brandColor + '50' : 'transparent'}`,
                      color: isActive ? brandColor : 'var(--ink3)',
                    }}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

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
            {saving ? 'Saving...' : saved ? '✓ Saved to Saved Reels' : '✦ Save to Saved Reels'}
          </button>

          {saved && (
            <p className="text-xs text-center" style={{ color: 'var(--ink3)' }}>
              View in <a href="/content" style={{ color: brandColor }}>Saved Reels →</a>
            </p>
          )}
          {saveError && (
            <p className="text-xs px-3 py-2 rounded-lg mb-4" style={{ background: '#fee2e2', color: '#dc2626' }}>
              Save failed: {saveError}
            </p>
          )}

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full rounded-xl text-sm font-bold transition-all overflow-hidden"
            style={{
              background: 'var(--bg2)',
              border: '1.5px solid var(--border)',
              cursor: downloading ? 'not-allowed' : 'pointer',
              position: 'relative',
            }}
          >
            {downloading && renderProgress > 0 && (
              <div style={{
                position: 'absolute', inset: 0, left: 0, top: 0,
                width: `${renderProgress}%`,
                background: 'var(--brand)',
                opacity: 0.15,
                transition: 'width 0.5s ease',
              }} />
            )}
            <div className="flex items-center justify-center gap-2 py-3" style={{ color: downloading ? 'var(--ink4)' : 'var(--ink2)', position: 'relative' }}>
              {downloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--ink3)', borderTopColor: 'transparent' }} />
                  {renderProgress > 0 ? `${downloadStatus} ${renderProgress}%` : downloadStatus}
                </>
              ) : '↓ Download MP4'}
            </div>
          </button>
          {downloadError && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#dc2626' }}>
              {downloadError}
            </p>
          )}
          {!isPro && (
            <p className="text-xs text-center" style={{ color: 'var(--ink4)' }}>
              {localDownloadsUsed >= FREE_DOWNLOAD_LIMIT
                ? 'Download limit reached'
                : `${FREE_DOWNLOAD_LIMIT - localDownloadsUsed} of ${FREE_DOWNLOAD_LIMIT} free downloads remaining`}
            </p>
          )}
        </div>
      </div>

    </div>
    </div>

    {/* Upgrade modal */}
    {showUpgradeModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={() => setShowUpgradeModal(false)}
      >
        <div
          className="rounded-2xl p-8 max-w-sm w-full text-center"
          style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #f59e0b22, #ef444422)', border: '1.5px solid #f59e0b44' }}>
            ↓
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>You've used your {FREE_DOWNLOAD_LIMIT} free downloads</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--ink3)' }}>Upgrade to Pro for unlimited downloads, 100 Studio credits/month, and more.</p>
          <button
            onClick={handleDownloadUpgrade}
            disabled={upgrading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
          >
            {upgrading ? 'Redirecting...' : 'Upgrade to Pro — $49/month'}
          </button>
          <button onClick={() => setShowUpgradeModal(false)} className="mt-3 text-xs w-full" style={{ color: 'var(--ink4)' }}>
            Maybe later
          </button>
        </div>
      </div>
    )}
    </>
  )
}
