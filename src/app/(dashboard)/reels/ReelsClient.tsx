'use client'

import { useState, useEffect } from 'react'
import { ReelCreator } from './ReelCreator'
import type { Review, ReelTheme, ReelScript } from '@/types'
import type { ReelVariation } from '@/remotion/types'

interface Props {
  reviews: Review[]
  businessId: string
  businessName: string
  industry: string
  brandColor: string
  brandFont: string
  brandLogoUrl: string | null
  brandPersonality: string[]
  brandSecondaryColor: string
  websiteUrl: string | null
  brandExtracted: boolean
  cachedThemes: ReelTheme[] | null  // from DB (requires migration)
}

function localCacheKey(businessId: string, reviewCount: number) {
  return `reel_themes_${businessId}_${reviewCount}`
}

export function ReelsClient({ reviews, businessId, businessName, industry, brandColor, brandFont, brandLogoUrl, brandPersonality, brandSecondaryColor, websiteUrl, brandExtracted, cachedThemes }: Props) {
  const [themes, setThemes]               = useState<ReelTheme[] | null>(null)
  const [analyzing, setAnalyzing]         = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<ReelTheme | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [extractedBrand, setExtractedBrand] = useState<{
    logoUrl: string | null
    primaryColor: string | null
    personality: string[]
    customerWord?: string
    serviceWord?: string
    bookingWord?: string
  } | null>(null)
  const [extracting, setExtracting] = useState(false)

  useEffect(() => {
    if (brandExtracted || !websiteUrl) return
    setExtracting(true)
    fetch('/api/extract-brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, websiteUrl }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setExtractedBrand({
            logoUrl: data.logoUrl,
            primaryColor: data.primaryColor,
            personality: data.personality ?? [],
            customerWord: data.customerWord,
            serviceWord: data.serviceWord,
            bookingWord: data.bookingWord,
          })
        }
      })
      .finally(() => setExtracting(false))
  }, [])

  useEffect(() => {
    if (reviews.length < 2) return

    // 1. localStorage first — it has the most complete data (includes cachedScripts per theme)
    const key = localCacheKey(businessId, reviews.length)
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed: ReelTheme[] = JSON.parse(stored)
        if (parsed.length > 0) {
          setThemes(parsed)
          return
        }
      }
    } catch {}

    // 2. DB cache fallback (doesn't have cachedScripts but better than nothing)
    if (cachedThemes) {
      setThemes(cachedThemes)
      return
    }

    // 3. Nothing cached — run AI analysis
    analyze()
  }, [])

  async function analyze() {
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews, businessId }),
      })
      const data = await res.json()
      if (data.themes?.length) {
        setThemes(data.themes)
        // Save to localStorage so next visit is instant
        try {
          // Clear any older keys for this business
          Object.keys(localStorage)
            .filter(k => k.startsWith(`reel_themes_${businessId}_`))
            .forEach(k => localStorage.removeItem(k))
          localStorage.setItem(localCacheKey(businessId, reviews.length), JSON.stringify(data.themes))
        } catch {}
      } else {
        setError('No clear patterns found yet. Add more reviews to unlock Reel ideas.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setAnalyzing(false)
  }

  function handleScriptCached(themeId: string, script: ReelScript, variations: ReelVariation[]) {
    setThemes(prev => {
      if (!prev) return prev
      const updated = prev.map(t =>
        t.id === themeId ? { ...t, cachedScript: script, cachedVariations: variations } : t
      )
      // Persist updated themes (with cached scripts) to localStorage
      try {
        localStorage.setItem(localCacheKey(businessId, reviews.length), JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  function forceReanalyze() {
    // Clear local cache so fresh analysis runs
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(`reel_themes_${businessId}_`))
        .forEach(k => localStorage.removeItem(k))
    } catch {}
    setThemes(null)
    analyze()
  }

  const activeBrandColor = extractedBrand?.primaryColor ?? brandColor
  const activeBrandPersonality = extractedBrand?.personality.length ? extractedBrand.personality : brandPersonality
  const activeLogoUrl = extractedBrand?.logoUrl ?? brandLogoUrl

  if (selectedTheme) {
    // Always use the latest version of the theme from state (may have cachedScript after first generation)
    const liveTheme = themes?.find(t => t.id === selectedTheme.id) ?? selectedTheme
    return (
      <ReelCreator
        theme={liveTheme}
        reviews={reviews}
        businessName={businessName}
        industry={industry}
        brandColor={activeBrandColor}
        brandSecondaryColor={brandSecondaryColor}
        brandFont={brandFont}
        logoUrl={activeLogoUrl}
        websiteUrl={websiteUrl}
        brandPersonality={activeBrandPersonality}
        customerWord={extractedBrand?.customerWord}
        serviceWord={extractedBrand?.serviceWord}
        bookingWord={extractedBrand?.bookingWord}
        businessId={businessId}
        onBack={() => setSelectedTheme(null)}
        onScriptCached={handleScriptCached}
      />
    )
  }

  return (
    <div style={{ maxWidth: 760 }}>

      {extracting && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6" style={{ background: `${brandColor}15`, border: `1px solid ${brandColor}30` }}>
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: brandColor, borderTopColor: 'transparent' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Analyzing your brand identity...</p>
            <p className="text-xs" style={{ color: 'var(--ink3)' }}>Extracting colors, fonts, and logo from your website</p>
          </div>
        </div>
      )}

      {reviews.length < 2 && (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', background: 'white' }}>
          <div className="text-4xl mb-4">🎬</div>
          <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Not enough reviews yet</h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--ink3)' }}>
            We need at least 2 reviews to find patterns. Go to Reviews and load some test data to try this out.
          </p>
        </div>
      )}

      {reviews.length >= 2 && analyzing && (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', background: 'white' }}>
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-5" style={{ borderColor: brandColor, borderTopColor: 'transparent' }} />
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>Reading your reviews...</h3>
          <p className="text-sm" style={{ color: 'var(--ink3)' }}>
            Finding patterns across {reviews.length} reviews — this only runs once
          </p>
        </div>
      )}

      {error && !analyzing && (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--border)', background: 'white' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--ink3)' }}>{error}</p>
          <button onClick={forceReanalyze} className="text-xs font-semibold hover:opacity-70" style={{ color: 'var(--accent)' }}>
            Try again
          </button>
        </div>
      )}

      {themes && themes.length > 0 && !analyzing && (
        <div>
          <p className="text-sm mb-5" style={{ color: 'var(--ink3)' }}>
            Found <strong style={{ color: 'var(--ink)' }}>{themes.length} Reel ideas</strong> in your reviews. Pick one to build.
          </p>
          <div className="flex flex-col gap-3">
            {themes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                reviews={reviews}
                brandColor={brandColor}
                onClick={() => setSelectedTheme(theme)}
              />
            ))}
          </div>
          <button
            onClick={forceReanalyze}
            className="mt-4 text-xs hover:opacity-70 transition-opacity"
            style={{ color: 'var(--ink4)' }}
          >
            ↺ Force re-analyse (uses AI credits)
          </button>
        </div>
      )}
    </div>
  )
}

function ThemeCard({ theme, reviews, brandColor, onClick }: {
  theme: ReelTheme
  reviews: Review[]
  brandColor: string
  onClick: () => void
}) {
  const themeReviews = reviews.filter(r => theme.reviewIds.includes(r.id))
  const categoryLabel: Record<ReelTheme['category'], string> = {
    dish: 'Dish / product',
    staff: 'Team member',
    service: 'Service',
    emotion: 'Emotion',
    outcome: 'Outcome',
    general: 'Pattern',
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border p-5 transition-all hover:shadow-md group"
      style={{ borderColor: 'var(--border)', background: 'white' }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all group-hover:scale-110"
          style={{ background: `${brandColor}15` }}>
          {theme.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: `${brandColor}15`, color: brandColor }}>
              {categoryLabel[theme.category]}
            </span>
            <span className="text-xs" style={{ color: 'var(--ink4)' }}>
              {theme.reviewIds.length} reviews
            </span>
          </div>

          <h3 className="font-bold text-base mb-1 group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--ink)' }}>
            {theme.title}
          </h3>

          <p className="text-sm mb-3" style={{ color: 'var(--ink3)' }}>
            Hook: &ldquo;<span style={{ color: 'var(--ink2)', fontStyle: 'italic' }}>{theme.hook}</span>&rdquo;
          </p>

          <div className="flex flex-col gap-1.5">
            {themeReviews.slice(0, 2).map((r) => (
              <div key={r.id} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ink4)' }}>
                <span style={{ color: '#f59e0b' }}>★</span>
                <span className="truncate">&ldquo;{r.what_they_liked.slice(0, 80)}{r.what_they_liked.length > 80 ? '...' : ''}&rdquo;</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center self-center">
          <div className="px-4 py-2 rounded-xl text-sm font-bold transition-all group-hover:scale-105"
            style={{ background: brandColor, color: 'white' }}>
            Build Reel →
          </div>
        </div>
      </div>
    </button>
  )
}
