'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  gbpPhotos: string[]
  language?: string
  onBack: () => void
  onScriptCached: (themeId: string, script: ReelScript, variations: ReelVariation[]) => void
}


export function ReelCreator({ theme, reviews, businessName, industry, brandColor, brandFont, logoUrl, websiteUrl, brandPersonality, brandSecondaryColor, customerWord, serviceWord, bookingWord, businessId, city, gbpPhotos, language = 'English', onBack, onScriptCached }: Props) {
  const [variations, setVariations]               = useState<ReelVariation[]>([])
  const [generating, setGenerating]               = useState(true)
  const [caption, setCaption]                     = useState('')
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [saving, setSaving]                       = useState(false)
  const [saved, setSaved]                         = useState(false)
  const [saveError, setSaveError]                 = useState<string | null>(null)
  const [cityValue, setCityValue]                 = useState(city ?? '')
  const [cityMissing, setCityMissing]             = useState(false)
  const [savingCity, setSavingCity]               = useState(false)

  useEffect(() => {
    // Use cache only if it has motif data and no photos (photo-having caches predate removal)
    if (theme.cachedVariations?.length && theme.cachedVariations[0]?.script && theme.cachedVariations[0]?.motif && !theme.cachedVariations[0]?.hookPhoto) {
      setVariations(theme.cachedVariations)
      setGenerating(false)
      generateCaption(reviews.filter(r => theme.reviewIds.includes(r.id)))
      return
    }
    generateScript(reviews.filter(r => theme.reviewIds.includes(r.id)))
  }, [])

  async function generateScript(themeReviews: Review[]) {
    setGenerating(true)
    setSaved(false)
    const res = await fetch('/api/generate-reel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, reviews: themeReviews, businessName, industry, language, allPhotos: gbpPhotos }),
    })
    const data = await res.json()
    const newVariations: ReelVariation[] = data.variations ?? []
    setVariations(newVariations)
    setGenerating(false)
    if (newVariations.length > 0) {
      onScriptCached(theme.id, newVariations[0].script, newVariations)
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
        language,
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

    const finalScript: ReelScript = {
      ...editedScript,
      template: editedVariation.template,
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

      {/* Editor — shown as soon as variations are ready */}
      {!generating && variations.length > 0 && (
        <ReelEditor
          key={variations[0].id}
          variations={variations}
          script={variations[0].script}
          variation={variations[0]}
          brandColor={brandColor}
          brandSecondaryColor={brandSecondaryColor}
          logoUrl={logoUrl}
          businessName={businessName}
          industry={industry}
          websiteUrl={websiteUrl}
          businessId={businessId}
          gbpPhotos={gbpPhotos}
          caption={caption}
          onCaptionChange={v => { setCaption(v); setSaved(false) }}
          generatingCaption={generatingCaption}
          onRegenerateCaption={() => generateCaption()}
          cityMissing={cityMissing}
          savingCity={savingCity}
          onCitySave={handleCitySave}
          onSave={handleSave}
          onBack={onBack}
          saving={saving}
          saved={saved}
          saveError={saveError}
        />
      )}
    </div>
  )
}
