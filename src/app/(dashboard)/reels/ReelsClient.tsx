'use client'

import { useState, useEffect } from 'react'
import { ReelCreator } from './ReelCreator'
import { createClient } from '@/lib/supabase/client'
import type { Review, ReelTheme, ReelScript } from '@/types'
import type { ReelVariation } from '@/remotion/types'

function detectLanguage(reviews: Review[]): string {
  const text = reviews.map(r => r.what_they_liked).join(' ').toLowerCase()
  const markers: [string, string[]][] = [
    ['English',    [' the ', ' and ', ' was ', ' they ', ' very ', ' great ', ' have ', ' this ', ' from ', ' with ']],
    ['Spanish',    [' que ', ' los ', ' las ', ' del ', ' muy ', ' fue ', ' también ', ' están ', ' porque ', ' años ']],
    ['French',     [' les ', ' des ', ' est ', ' dans ', ' sur ', ' très ', ' bien ', ' nous ', ' vous ', ' une ']],
    ['German',     [' und ', ' die ', ' der ', ' das ', ' ist ', ' ich ', ' auch ', ' hat ', ' war ', ' sehr ']],
    ['Italian',    [' che ', ' del ', ' sono ', ' nel ', ' dei ', ' tutto ', ' molto ', ' alla ', ' questo ']],
    ['Portuguese', [' que ', ' com ', ' uma ', ' não ', ' dos ', ' muito ', ' também ', ' está ', ' para ']],
  ]
  let best = 'English', bestScore = 0
  for (const [lang, words] of markers) {
    const score = words.filter(w => text.includes(w)).length
    if (score > bestScore) { bestScore = score; best = lang }
  }
  return best
}

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
  savedThemeTitles: string[]
  city: string | null
  googleConnected: boolean
  gbpPhotos: string[]
}

function localCacheKey(businessId: string, reviewCount: number) {
  return `reel_themes_${businessId}_${reviewCount}`
}

export function ReelsClient({ reviews, businessId, businessName, industry, brandColor, brandFont, brandLogoUrl, brandPersonality, brandSecondaryColor, websiteUrl, brandExtracted, cachedThemes, savedPostsCount, savedThemeTitles, city, googleConnected, gbpPhotos }: Props) {
  const [themes, setThemes]               = useState<ReelTheme[] | null>(null)
  const [analyzing, setAnalyzing]         = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<ReelTheme | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [seenThemes, setSeenThemes]       = useState<Set<string>>(new Set())
  const [reelLanguage, setReelLanguage]   = useState<string>('English')

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
    const key = `seen_themes_${businessId}`
    try {
      const stored = localStorage.getItem(key)
      if (stored) setSeenThemes(new Set(JSON.parse(stored)))
    } catch {}
  }, [])

  // Mark saved themes as seen immediately
  useEffect(() => {
    if (savedThemeTitles.length === 0) return
    const key = `seen_themes_${businessId}`
    setSeenThemes(prev => {
      const updated = new Set([...prev, ...savedThemeTitles])
      try { localStorage.setItem(key, JSON.stringify([...updated])) } catch {}
      return updated
    })
  }, [savedThemeTitles])

  // Write unseen count to localStorage so Sidebar can show the badge
  useEffect(() => {
    if (!themes) return
    const unseen = themes.filter(t => seenThemes.size > 0 && !seenThemes.has(t.title) && !savedThemeTitles.includes(t.title)).length
    try {
      localStorage.setItem('buzzloop_unseen_reels', String(unseen))
      window.dispatchEvent(new CustomEvent('unseen-reels-update', { detail: unseen }))
    } catch {}
  }, [themes, seenThemes, savedThemeTitles])

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
        if (parsed.length > 0 && parsed[0].buzzScore !== undefined && parsed[0].reelType !== undefined) {
          setThemes(parsed)
          return
        }
      }
    } catch {}

    // 2. DB cache fallback — same check
    if (cachedThemes && cachedThemes[0]?.buzzScore !== undefined && cachedThemes[0]?.reelType !== undefined) {
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
        body: JSON.stringify({ reviews, businessId, industry, businessName, language: detectLanguage(reviews) }),
      })
      const data = await res.json()
      if (data.themes?.length) {
        setThemes(data.themes)
        if (data.language) setReelLanguage(data.language)
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

  function markThemeSeen(title: string) {
    const key = `seen_themes_${businessId}`
    setSeenThemes(prev => {
      const updated = new Set([...prev, title])
      try { localStorage.setItem(key, JSON.stringify([...updated])) } catch {}
      return updated
    })
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
      // Persist to DB so other devices get the same variations
      const supabase = createClient()
      supabase.from('businesses').update({
        reel_themes: updated,
        reel_themes_review_count: reviews.length,
      }).eq('id', businessId).then(() => {})
      return updated
    })
  }

  async function forceReanalyze() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(`reel_themes_${businessId}_`))
        .forEach(k => localStorage.removeItem(k))
    } catch {}
    // Clear DB cache so it doesn't reload on next mount
    const supabase = createClient()
    await supabase.from('businesses').update({ reel_themes: null, reel_themes_review_count: 0 }).eq('id', businessId)
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
        gbpPhotos={gbpPhotos}
        language={reelLanguage}
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
          {googleConnected
            ? 'Once you have more reviews, the AI will find patterns and generate Reel ideas ranked by engagement potential — automatically.'
            : 'Connect your Google Business Profile so we can import your reviews and start generating Reel ideas.'}
        </p>
        {googleConnected ? (
          <a
            href="/qr"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: activeBrandColor }}
          >
            Get more reviews via QR →
          </a>
        ) : (
          <a
            href="/api/auth/google?returnTo=/reels"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: activeBrandColor }}
          >
            Connect Google Business Profile →
          </a>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Recommended Reels</h1>
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>
          Ranked by <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Buzz Score</span> — our prediction of how likely each Reel is to stop the scroll and bring in new customers.
        </p>
      </div>

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

          {/* Recommended — top 3 */}
          <div className="mb-8">
            <div className="flex flex-col gap-3">
              {themes.slice(0, 3).map((theme, i) => (
                <RecommendedCard
                  key={theme.id}
                  theme={theme}
                  brandColor={activeBrandColor}
                  rank={i + 1}
                  saved={savedThemeTitles.includes(theme.title)}
                  isNew={seenThemes.size > 0 && !seenThemes.has(theme.title)}
                  onClick={() => { markThemeSeen(theme.title); setSelectedTheme(theme) }}
                />
              ))}
            </div>
          </div>

          {/* More ideas */}
          {themes.length > 3 && (
            <div>
              <h2 className="font-bold text-base mb-4" style={{ color: 'var(--ink)' }}>More ideas</h2>
              <div className="flex flex-col gap-3">
                {themes.slice(3).map(theme => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    brandColor={activeBrandColor}
                    saved={savedThemeTitles.includes(theme.title)}
                    isNew={seenThemes.size > 0 && !seenThemes.has(theme.title)}
                    onClick={() => { markThemeSeen(theme.title); setSelectedTheme(theme) }}
                  />
                ))}
              </div>
            </div>
          )}

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
            className="mt-6 text-xs hover:opacity-70 transition-opacity"
            style={{ color: 'var(--ink4)' }}
          >
            ↺ Re-analyse (uses AI credits)
          </button>
        </div>
      )}
    </div>
  )
}

// ── Recommended card ───────────────────────────────────────────

function RecommendedCard({ theme, brandColor, rank, saved, isNew, onClick }: {
  theme: ReelTheme
  brandColor: string
  rank: number
  saved: boolean
  isNew: boolean
  onClick: () => void
}) {
  const score = theme.buzzScore
  const isTop = rank === 1

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-6 transition-all hover:shadow-md group"
      style={{
        background: isTop ? `${brandColor}10` : 'white',
        border: isTop ? `2px solid ${brandColor}` : '1px solid var(--border)',
      }}
    >
      <div className="flex items-start gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${brandColor}20`, color: brandColor }}
            >
              #{rank} pick
            </span>
            {score !== undefined && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#16a34a' }}>
                🔥 {score}
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--ink4)' }}>
              {theme.reviewIds.length} reviews
            </span>
            {isNew && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef9c3', color: '#854d0e' }}>
                New
              </span>
            )}
            {saved && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                ✓ In library
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg mb-1.5 leading-snug" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            {theme.title}
          </h3>
          {theme.buzzReason && (
            <p className="text-sm" style={{ color: 'var(--ink3)' }}>
              {theme.buzzReason}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center self-center ml-4">
          <div
            className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all group-hover:scale-105 whitespace-nowrap"
            style={{ background: brandColor, color: 'white' }}
          >
            {saved ? 'Create again →' : 'Create Reel →'}
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Content type badge ─────────────────────────────────────────

const CONTENT_TYPE_META: Record<string, { label: string; bg: string; color: string }> = {
  social_proof:   { label: 'Social Proof', bg: '#e0f2fe', color: '#0369a1' },
  educational:    { label: '📚 Educational', bg: '#ede9fe', color: '#6d28d9' },
  myth_bust:      { label: '💡 Myth Bust', bg: '#fef3c7', color: '#92400e' },
  experience:     { label: '✨ Experience', bg: '#fff7ed', color: '#c2410c' },
  local_guide:    { label: '📍 Local Guide', bg: '#f0fdf4', color: '#15803d' },
  behind_scenes:  { label: '🎬 Behind the Scenes', bg: '#fdf4ff', color: '#86198f' },
  trust:          { label: '⭐ Trust', bg: '#f8fafc', color: '#475569' },
}

function ContentTypeBadge({ theme }: { theme: ReelTheme }) {
  const ct = theme.contentType ?? 'social_proof'
  const meta = CONTENT_TYPE_META[ct]
  if (!meta) return null

  if (ct === 'social_proof') {
    // Keep existing story/pattern badges for social proof
    if (theme.reelType === 'story') {
      return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#e0f2fe', color: '#0369a1' }}>Story</span>
    }
    return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#fff7ed', color: '#c2410c' }}>Pattern</span>
  }

  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  )
}

// ── Theme card ─────────────────────────────────────────────────

function ThemeCard({ theme, brandColor, saved, isNew, onClick }: {
  theme: ReelTheme
  brandColor: string
  saved: boolean
  isNew: boolean
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
                🔥 {score}
              </span>
            )}
            <ContentTypeBadge theme={theme} />
            <span className="text-xs" style={{ color: 'var(--ink4)' }}>
              {theme.reviewIds.length} review{theme.reviewIds.length !== 1 ? 's' : ''}
            </span>
            {isNew && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef9c3', color: '#854d0e' }}>
                New
              </span>
            )}
            {saved && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                ✓ In library
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center self-center">
          <div
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all group-hover:scale-105"
            style={{ background: brandColor, color: 'white' }}
          >
            {saved ? 'Create again →' : 'Build Reel →'}
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
