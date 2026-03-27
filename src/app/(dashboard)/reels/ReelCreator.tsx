'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VariationPicker } from './VariationPicker'
import { ReelEditor } from './ReelEditor'
import type { ReelTheme, ReelScript, Review } from '@/types'
import type { ReelVariation } from '@/remotion/types'

interface Props {
  theme: ReelTheme
  reviews: Review[]
  businessName: string
  industry: string
  brandColor: string
  brandFont: string
  logoUrl: string | null
  websiteUrl: string | null
  brandPersonality: string[]
  brandSecondaryColor: string
  customerWord?: string
  serviceWord?: string
  bookingWord?: string
  businessId: string
  city: string | null
  onBack: () => void
  onScriptCached: (themeId: string, script: ReelScript, variations: ReelVariation[]) => void
}

export function ReelCreator({ theme, reviews, businessName, industry, brandColor, brandFont, logoUrl, websiteUrl, brandPersonality, brandSecondaryColor, customerWord, serviceWord, bookingWord, businessId, city, onBack, onScriptCached }: Props) {
  const [script, setScript]               = useState<ReelScript | null>(null)
  const [variations, setVariations]       = useState<ReelVariation[]>([])
  const [selectedVariation, setSelectedVariation] = useState<ReelVariation | null>(null)
  const [editMode, setEditMode]           = useState(false)
  const [generating, setGenerating]       = useState(true)
  const [caption, setCaption]             = useState('')
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [saveError, setSaveError]         = useState<string | null>(null)
  const [cityValue, setCityValue]         = useState(city ?? '')
  const [cityMissing, setCityMissing]     = useState(false)
  const [savingCity, setSavingCity]       = useState(false)

  useEffect(() => {
    // Use cached script if available — no API call needed
    if (theme.cachedScript && theme.cachedVariations?.length) {
      setScript(theme.cachedScript)
      setVariations(theme.cachedVariations)
      setGenerating(false)
      generateCaption(reviews.filter(r => theme.reviewIds.includes(r.id)))
      return
    }
    const themeReviews = reviews.filter(r => theme.reviewIds.includes(r.id))
    generateScript(themeReviews)
  }, [])

  async function generateScript(themeReviews: Review[]) {
    setGenerating(true)
    setSelectedVariation(null)
    setSaved(false)
    const res = await fetch('/api/generate-reel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, reviews: themeReviews, businessName, industry, brandPersonality, websiteUrl, customerWord, serviceWord, bookingWord }),
    })
    const data = await res.json()
    const newScript = data.script ?? null
    const newVariations = data.variations ?? []
    setScript(newScript)
    setVariations(newVariations)
    setGenerating(false)
    if (newScript && newVariations.length > 0) {
      onScriptCached(theme.id, newScript, newVariations)
    }
    generateCaption(themeReviews)
  }

  async function generateCaption(themeReviews?: Review[], overrideCity?: string) {
    const activeCity = overrideCity ?? cityValue
    if (!activeCity.trim()) {
      setCityMissing(true)
      return
    }
    setCityMissing(false)
    setGeneratingCaption(true)
    const sourceReviews = themeReviews ?? reviews.filter(r => theme.reviewIds.includes(r.id))
    const reviewText = sourceReviews.map(r => r.what_they_liked).join(' ')
    const res = await fetch('/api/generate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName,
        industry,
        reviewText,
        reelTheme: theme.title,
        reelHook: theme.hook,
        buzzReason: theme.buzzReason,
        serviceWord,
        bookingWord,
        websiteUrl,
        city: activeCity,
      }),
    })
    const data = await res.json()
    setCaption(data.caption ?? '')
    setGeneratingCaption(false)
  }

  async function handleCitySave(newCity: string) {
    setSavingCity(true)
    const supabase = createClient()
    await supabase.from('businesses').update({ city: newCity }).eq('id', businessId)
    setCityValue(newCity)
    setSavingCity(false)
    generateCaption(undefined, newCity)
  }

  async function handleSave(editedScript: ReelScript, editedVariation: ReelVariation) {
    if (!caption) return
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()
    const themeReviews = reviews.filter(r => theme.reviewIds.includes(r.id))

    // Merge variation hook/CTA + visual style into the script for storage
    const finalScript: ReelScript = {
      ...editedScript,
      visualStyle: editedVariation.visualStyle,
      slides: editedScript.slides.map(slide => {
        if (slide.type === 'hook') return { ...slide, content: { ...slide.content, headline: editedVariation.hookHeadline, subline: editedVariation.hookSubline } }
        if (slide.type === 'cta') return { ...slide, content: { ...slide.content, cta: editedVariation.ctaText } }
        return slide
      }),
    }

    const { error } = await supabase.from('social_posts').insert({
      business_id: businessId,
      review_id: themeReviews[0]?.id ?? null,
      caption,
      status: 'draft',
      scheduled_for: null,
      post_type: 'reel',
      reel_script: finalScript,
      reel_theme: theme.title,
    })
    setSaving(false)
    if (error) { setSaveError(error.message); return }
    setSaved(true)
  }

  const themeReviews = reviews.filter(r => theme.reviewIds.includes(r.id))

  return (
    <div className="w-full">
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-opacity" style={{ color: 'var(--ink3)' }}>
        ← Back to Reel ideas
      </button>

      {/* Theme header */}
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>Reel theme</p>
        <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{theme.emoji} {theme.title}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--ink3)' }}>
          Based on {theme.reviewIds.length} reviews · key phrase: &ldquo;{theme.keyPhrase}&rdquo;
        </p>
      </div>

      {/* Generating state */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: brandColor, borderTopColor: 'transparent' }} />
            <div className="absolute inset-0 flex items-center justify-center text-lg">✦</div>
          </div>
          <div className="text-center">
            <p className="font-semibold" style={{ color: 'var(--ink)' }}>Generating your Reel...</p>
            <p className="text-sm mt-1" style={{ color: 'var(--ink3)' }}>Writing unique hooks, CTAs and visual styles</p>
          </div>
        </div>
      )}

      {/* Step 1 — Pick visual style */}
      {!generating && script && variations.length > 0 && !editMode && (
        <div className="mb-8">
          <VariationPicker
            script={script}
            variations={variations}
            brandColor={brandColor}
            brandSecondaryColor={brandSecondaryColor}
            logoUrl={logoUrl}
            businessName={businessName}
            industry={industry}
            websiteUrl={websiteUrl}
            onSelect={v => { setSelectedVariation(v); setSaved(false) }}
            onConfirm={() => setEditMode(true)}
            onRegenerate={() => { setEditMode(false); generateScript(themeReviews) }}
            regenerating={generating}
          />
        </div>
      )}

      {/* Step 2 — Edit & save */}
      {!generating && script && selectedVariation && editMode && (
        <ReelEditor
          key={selectedVariation.id}
          script={script}
          variation={selectedVariation}
          variations={variations}
          brandColor={brandColor}
          brandSecondaryColor={brandSecondaryColor}
          logoUrl={logoUrl}
          businessName={businessName}
          industry={industry}
          websiteUrl={websiteUrl}
          businessId={businessId}
          caption={caption}
          onCaptionChange={v => { setCaption(v); setSaved(false) }}
          generatingCaption={generatingCaption}
          onRegenerateCaption={() => generateCaption()}
          cityMissing={cityMissing}
          savingCity={savingCity}
          onCitySave={handleCitySave}
          onSave={handleSave}
          onBack={() => setEditMode(false)}
          onSwitchVariation={v => { setSelectedVariation(v); setSaved(false) }}
          saving={saving}
          saved={saved}
          saveError={saveError}
        />
      )}
    </div>
  )
}
