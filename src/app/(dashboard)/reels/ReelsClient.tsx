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
  cachedThemes: ReelTheme[] | null
  savedPostsCount: number
  city: string | null
}

function localCacheKey(businessId: string, reviewCount: number) {
  return `reel_themes_${businessId}_${reviewCount}`
}

export function ReelsClient({ reviews, businessId, businessName, industry, brandColor, brandFont, brandLogoUrl, brandPersonality, brandSecondaryColor, websiteUrl, brandExtracted, cachedThemes, savedPostsCount, city }: Props) {
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

    // 1. localStorage first — only use if themes have buzzScore (pre-score cache is stale)
    const key = localCacheKey(businessId, reviews.length)
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed: ReelTheme[] = JSON.parse(stored)
        if (parsed.length > 0 && parsed[0].buzzScore !== undefined && parsed[0].reelCategory !== undefined) {
          setThemes(parsed)
          return
        }
      }
    } catch {}

    // 2. DB cache fallback — same check
    if (cachedThemes && cachedThemes[0]?.buzzScore !== undefined && cachedThemes[0]?.reelCategory !== undefined) {
      setThemes(cachedThemes)
      return
    }

    // 3. Run AI analysis
    analyze()
  }, [])

  async function analyze() {
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews, businessId, industry, businessName }),
      })
      const data = await res.json()
      if (data.themes?.length) {
        setThemes(data.themes)
        try {
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
      try {
        localStorage.setItem(localCacheKey(businessId, reviews.length), JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  function forceReanalyze() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(`reel_themes_${businessId}_`))
        .forEach(k => localStorage.removeItem(k))
    } catch {}
    setThemes(null)
    analyze()
  }

  const activeBrandColor      = extractedBrand?.primaryColor ?? brandColor
  const activeBrandPersonality = extractedBrand?.personality.length ? extractedBrand.personality : brandPersonality
  const activeLogoUrl         = extractedBrand?.logoUrl ?? brandLogoUrl

  if (selectedTheme) {
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
        city={city}
        onBack={() => setSelectedTheme(null)}
        onScriptCached={handleScriptCached}
      />
    )
  }

  // ── Empty state (no reviews yet) ──────────────────────────────
  if (reviews.length < 2) {
    return (
      <div className="rounded-2xl border p-12 text-center" style={{ background: 'white', borderColor: 'var(--border)' }}>
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>No Reels yet</h3>
        <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: 'var(--ink3)' }}>
          Once you have reviews, the AI will find patterns and generate Reel ideas ranked by engagement potential — automatically.
        </p>
        <a
          href="/qr"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: activeBrandColor }}
        >
          Set up your QR code →
        </a>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760 }}>

      {extracting && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6" style={{ background: `${activeBrandColor}15`, border: `1px solid ${activeBrandColor}30` }}>
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: activeBrandColor, borderTopColor: 'transparent' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Analysing your brand identity...</p>
        </div>
      )}

      {/* Analysing state */}
      {analyzing && (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', background: 'white' }}>
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-5" style={{ borderColor: activeBrandColor, borderTopColor: 'transparent' }} />
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>Finding your best Reel ideas...</h3>
          <p className="text-sm" style={{ color: 'var(--ink3)' }}>
            Reading {reviews.length} reviews and scoring by engagement potential
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
            <strong style={{ color: 'var(--ink)' }}>{themes.length} Reel ideas</strong> ranked by Buzz Score — highest engagement potential first.
          </p>
          <div className="flex flex-col gap-3">
            {themes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                brandColor={activeBrandColor}
                onClick={() => setSelectedTheme(theme)}
              />
            ))}
          </div>

          {/* Saved posts link */}
          {savedPostsCount > 0 && (
            <a
              href="/content"
              className="mt-6 flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-sm"
              style={{ borderColor: 'var(--border)', background: 'white', display: 'flex' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  {savedPostsCount} saved post{savedPostsCount !== 1 ? 's' : ''}
                </p>
                <p className="text-xs" style={{ color: 'var(--ink3)' }}>Previously built reels and posts</p>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>View all →</span>
            </a>
          )}

          <button
            onClick={forceReanalyze}
            className="mt-4 text-xs hover:opacity-70 transition-opacity"
            style={{ color: 'var(--ink4)' }}
          >
            ↺ Re-analyse (uses AI credits)
          </button>
        </div>
      )}
    </div>
  )
}

// ── Theme card ─────────────────────────────────────────────────

function ThemeCard({ theme, brandColor, onClick }: {
  theme: ReelTheme
  brandColor: string
  onClick: () => void
}) {
  const score = theme.buzzScore
  const scoreColor = !score ? brandColor : score >= 80 ? '#16a34a' : score >= 60 ? brandColor : '#92400e'
  const scoreBg    = !score ? `${brandColor}15` : score >= 80 ? '#dcfce7' : score >= 60 ? `${brandColor}15` : '#fef3c7'

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border p-5 transition-all hover:shadow-md group"
      style={{ borderColor: 'var(--border)', background: 'white' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all group-hover:scale-110"
          style={{ background: `${brandColor}15` }}
        >
          {[...theme.emoji][0]}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-base mb-1.5 transition-colors"
            style={{ color: 'var(--ink)' }}
          >
            {theme.title}
          </h3>
          {theme.buzzReason && (
            <p className="text-sm mb-3" style={{ color: 'var(--ink3)' }}>
              {theme.buzzReason}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {score !== undefined && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: scoreBg, color: scoreColor }}
              >
                Buzz Score {score}
              </span>
            )}
            {theme.reelCategory === 'educational' && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                Educational
              </span>
            )}
            {theme.reelCategory === 'faq' && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#fff7ed', color: '#c2410c' }}>
                FAQ
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--ink4)' }}>
              {theme.reviewIds.length} review{theme.reviewIds.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center self-center">
          <div
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all group-hover:scale-105"
            style={{ background: brandColor, color: 'white' }}
          >
            Build Reel →
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Mock card for empty state ──────────────────────────────────

function MockCard({ brandColor, buzzScore, emoji, title, reason, reviewCount }: {
  brandColor: string
  buzzScore: number
  emoji: string
  title: string
  reason: string
  reviewCount: number
}) {
  return (
    <div
      className="w-full text-left rounded-2xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'white' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${brandColor}15` }}
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base mb-1.5" style={{ color: 'var(--ink)' }}>{title}</h3>
          <p className="text-sm mb-3" style={{ color: 'var(--ink3)' }}>{reason}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#dcfce7', color: '#16a34a' }}>
              Buzz Score {buzzScore}
            </span>
            <span className="text-xs" style={{ color: 'var(--ink4)' }}>{reviewCount} reviews</span>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center self-center">
          <div className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: brandColor, color: 'white' }}>
            Build Reel →
          </div>
        </div>
      </div>
    </div>
  )
}
