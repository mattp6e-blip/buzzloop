'use client'

import { useState, useEffect } from 'react'
import { ReelCreator } from './ReelCreator'
import { createClient } from '@/lib/supabase/client'
import type { Review, ReelTheme, ReelScript, ReelContentType } from '@/types'
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

function currentWeekOf(): string {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`
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
  uploadedPhotos: string[]
  businessContext: string | null
}

function localCacheKey(businessId: string, reviewCount: number) {
  return `reel_themes_${businessId}_${reviewCount}`
}

export function ReelsClient({ reviews, businessId, businessName, industry, brandColor, brandFont, brandLogoUrl, brandPersonality, brandSecondaryColor, websiteUrl, brandExtracted, cachedThemes, savedPostsCount, savedThemeTitles, city, googleConnected, gbpPhotos, uploadedPhotos, businessContext }: Props) {
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
    businessContext?: string | null
  } | null>(null)
  const [extracting, setExtracting] = useState(false)

  useEffect(() => {
    const key = `seen_themes_${businessId}`
    try {
      const stored = localStorage.getItem(key)
      if (stored) setSeenThemes(new Set(JSON.parse(stored)))
    } catch {}
  }, [])

  useEffect(() => {
    if (savedThemeTitles.length === 0) return
    const key = `seen_themes_${businessId}`
    setSeenThemes(prev => {
      const updated = new Set([...prev, ...savedThemeTitles])
      try { localStorage.setItem(key, JSON.stringify([...updated])) } catch {}
      return updated
    })
  }, [savedThemeTitles])

  useEffect(() => {
    if (!themes) return
    const unseen = themes.filter(t => seenThemes.size > 0 && !seenThemes.has(t.title) && !savedThemeTitles.includes(t.title)).length
    try {
      localStorage.setItem('buzzloop_unseen_reels', String(unseen))
      window.dispatchEvent(new CustomEvent('unseen-reels-update', { detail: unseen }))
    } catch {}
  }, [themes, seenThemes, savedThemeTitles])

  // Mark all visible themes as seen after 3s, "new" badge only shows on first visit
  useEffect(() => {
    if (!themes || themes.length === 0) return
    const timer = setTimeout(() => {
      const key = `seen_themes_${businessId}`
      setSeenThemes(prev => {
        const updated = new Set([...prev, ...themes.map(t => t.title)])
        try { localStorage.setItem(key, JSON.stringify([...updated])) } catch {}
        return updated
      })
    }, 3000)
    return () => clearTimeout(timer)
  }, [themes, businessId])

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
            businessContext: data.businessContext ?? null,
          })
        }
      })
      .finally(() => setExtracting(false))
  }, [])

  useEffect(() => {
    if (reviews.length < 2) return

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

    if (cachedThemes && cachedThemes[0]?.buzzScore !== undefined && cachedThemes[0]?.reelType !== undefined) {
      setThemes(cachedThemes)
      return
    }

    analyze()
  }, [])

  async function analyze() {
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews, businessId, industry, businessName, language: detectLanguage(reviews), businessContext: activeBusinessContext }),
      })
      const data = await res.json()
      if (data.themes?.length) {
        setThemes(prev => {
          const existing = prev ?? []
          const newIds = new Set(data.themes.map((t: ReelTheme) => t.id))
          const kept = existing.filter(t => !newIds.has(t.id))
          const merged = [...data.themes, ...kept]
          const capped = merged.length > 30
            ? merged.sort((a, b) => {
                const wDiff = (b.weekOf ?? '').localeCompare(a.weekOf ?? '')
                return wDiff !== 0 ? wDiff : (b.buzzScore ?? 0) - (a.buzzScore ?? 0)
              }).slice(0, 30)
            : merged
          try {
            Object.keys(localStorage)
              .filter(k => k.startsWith(`reel_themes_${businessId}_`))
              .forEach(k => localStorage.removeItem(k))
            localStorage.setItem(localCacheKey(businessId, reviews.length), JSON.stringify(capped))
          } catch {}
          return capped
        })
        if (data.language) setReelLanguage(data.language)
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
    const supabase = createClient()
    await supabase.from('businesses').update({ reel_themes: null, reel_themes_review_count: 0 }).eq('id', businessId)
    setThemes(null)
    analyze()
  }

  const activeBrandColor       = extractedBrand?.primaryColor ?? brandColor
  const activeBrandPersonality = extractedBrand?.personality.length ? extractedBrand.personality : brandPersonality
  const activeLogoUrl          = extractedBrand?.logoUrl ?? brandLogoUrl
  const activeBusinessContext  = extractedBrand?.businessContext ?? businessContext

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
        uploadedPhotos={uploadedPhotos}
        language={reelLanguage}
        onBack={() => setSelectedTheme(null)}
        onScriptCached={handleScriptCached}
      />
    )
  }

  // ── Empty state ──────────────────────────────────────────────
  if (reviews.length < 2) {
    return (
      <div className="rounded-2xl border p-12 text-center" style={{ background: 'white', borderColor: 'var(--border)' }}>
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>No Reels yet</h3>
        <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: 'var(--ink3)' }}>
          {googleConnected
            ? 'Once you have more reviews, the AI will find patterns and generate Reel ideas ranked by engagement potential, automatically.'
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
    <div>

      {extracting && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6" style={{ background: `${activeBrandColor}15`, border: `1px solid ${activeBrandColor}30` }}>
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: activeBrandColor, borderTopColor: 'transparent' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Analysing your brand identity...</p>
        </div>
      )}

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
          <p className="text-sm" style={{ color: 'var(--ink3)' }}>{error}</p>
        </div>
      )}

      {themes && themes.length > 0 && !analyzing && (
        <ReelFeed
          themes={themes}
          brandColor={activeBrandColor}
          savedThemeTitles={savedThemeTitles}
          seenThemes={seenThemes}
          savedPostsCount={savedPostsCount}
          onSelect={(theme) => { markThemeSeen(theme.title); setSelectedTheme(theme) }}
          onReanalyze={forceReanalyze}
        />
      )}
    </div>
  )
}

// suppress TS errors for non-standard CSS props
type AnyStyle = React.CSSProperties & Record<string, unknown>

// ── Feed ───────────────────────────────────────────────────────

const VARIETY_ROW_THRESHOLD = 3 // show separate row per type only if it has this many themes

const VARIETY_META: Record<string, { label: string; subtitle: string }> = {
  educational:   { label: '📚 Educational',         subtitle: 'Teach something only a specialist in your field would know' },
  myth_bust:     { label: '💡 Myth Busting',        subtitle: 'Correct the misconceptions that are costing you customers' },
  behind_scenes: { label: '🎬 Behind the Scenes',   subtitle: 'Show the process most customers never see' },
  experience:    { label: '✨ Experience',           subtitle: 'What it actually feels like to be your customer' },
  trust:         { label: '🏆 Trust & Credibility', subtitle: 'Numbers, credentials, and facts that earn trust before a visit' },
  local_guide:   { label: '📍 Local Guide',          subtitle: 'Local recommendations your customers will share' },
}

function ReelFeed({ themes, brandColor, savedThemeTitles, seenThemes, savedPostsCount, onSelect, onReanalyze }: {
  themes: ReelTheme[]
  brandColor: string
  savedThemeTitles: string[]
  seenThemes: Set<string>
  savedPostsCount: number
  onSelect: (t: ReelTheme) => void
  onReanalyze: () => void
}) {
  const [weekOf, setWeekOf] = useState('')
  useEffect(() => { setWeekOf(currentWeekOf()) }, [])

  // "New this week": only meaningful when themes span multiple weeks
  const distinctWeeks = new Set(themes.map(t => t.weekOf).filter(Boolean))
  const newThisWeek = distinctWeeks.size > 1 ? themes.filter(t => t.weekOf === weekOf) : []

  const cardProps = (theme: ReelTheme) => ({
    theme,
    brandColor,
    saved: savedThemeTitles.includes(theme.title),
    isNew: seenThemes.size > 0 && !seenThemes.has(theme.title),
    onClick: () => onSelect(theme),
  })

  const proofThemes   = themes.filter(t => (t.contentType ?? 'social_proof') === 'social_proof')
  const varietyThemes = themes.filter(t => t.contentType && t.contentType !== 'social_proof')

  // Group variety by type; only give own row if ≥ threshold
  const varietyByType = new Map<string, ReelTheme[]>()
  varietyThemes.forEach(t => {
    const ct = t.contentType!
    if (!varietyByType.has(ct)) varietyByType.set(ct, [])
    varietyByType.get(ct)!.push(t)
  })

  const ownRowTypes   = [...varietyByType.entries()].filter(([, ts]) => ts.length >= VARIETY_ROW_THRESHOLD)
  const groupedRest   = varietyThemes.filter(t => {
    const bucket = varietyByType.get(t.contentType!)
    return !bucket || bucket.length < VARIETY_ROW_THRESHOLD
  })

  return (
    <div>
      {newThisWeek.length > 0 && (
        <ReelRow label="🆕 New this week" subtitle="Fresh ideas added since your last visit" themes={newThisWeek} cardProps={cardProps} />
      )}

      {proofThemes.length > 0 && (
        <ReelRow
          label="⭐ Social Proof"
          subtitle="Real customer stories ranked by scroll-stopping potential"
          themes={proofThemes}
          cardProps={cardProps}
        />
      )}

      {groupedRest.length > 0 && (
        <ReelRow
          label="🚀 Grow Your Audience"
          subtitle="Educational and experience content that attracts new customers"
          themes={groupedRest}
          cardProps={cardProps}
        />
      )}

      {ownRowTypes.map(([ct, ts]) => {
        const meta = VARIETY_META[ct]
        if (!meta) return null
        return <ReelRow key={ct} label={meta.label} subtitle={meta.subtitle} themes={ts} cardProps={cardProps} />
      })}

      {savedPostsCount > 0 && (
        <a
          href="/content"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 12, border: '1px solid var(--border)', background: 'white', textDecoration: 'none', marginTop: 8 }}
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

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button
          onClick={onReanalyze}
          style={{ fontSize: 13, color: 'var(--ink4)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Refresh reel ideas
        </button>
      </div>
    </div>
  )
}

// ── Horizontal scroll row ──────────────────────────────────────

function ReelRow({ label, subtitle, themes, cardProps }: {
  label: string
  subtitle: string
  themes: ReelTheme[]
  cardProps: (t: ReelTheme) => { theme: ReelTheme; brandColor: string; saved: boolean; isNew: boolean; onClick: () => void }
}) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', letterSpacing: '-0.01em', margin: 0 }}>
          {label}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 2, marginBottom: 0 }}>{subtitle}</p>
      </div>
      {/* position:relative wrapper so the fade overlay can be absolutely positioned */}
      <div style={{ position: 'relative' }}>
        <div style={{ overflowX: 'clip' } as AnyStyle}>
          <div
            style={{
              display: 'flex',
              gap: 16,
              paddingBottom: 8,
              paddingRight: 32,
              overflowX: 'auto',
              cursor: 'grab',
            }}
          >
            {themes.map(theme => (
              <ReelCard key={theme.id} {...cardProps(theme)} />
            ))}
          </div>
        </div>
        {/* Right-edge fade, signals more content */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 80,
            bottom: 8,
            background: 'linear-gradient(to right, transparent, var(--bg))',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}

// ── Compact reel card ──────────────────────────────────────────

const CONTENT_TYPE_META: Record<string, { label: string; bg: string; color: string }> = {
  social_proof:   { label: 'Social Proof',      bg: '#e0f2fe', color: '#0369a1' },
  educational:    { label: 'Educational',        bg: '#ede9fe', color: '#6d28d9' },
  myth_bust:      { label: 'Myth Bust',          bg: '#fef3c7', color: '#92400e' },
  experience:     { label: 'Experience',         bg: '#fff7ed', color: '#c2410c' },
  local_guide:    { label: 'Local Guide',        bg: '#f0fdf4', color: '#15803d' },
  behind_scenes:  { label: 'Behind the Scenes',  bg: '#fdf4ff', color: '#86198f' },
  trust:          { label: 'Trust',              bg: '#f8fafc', color: '#475569' },
}

function ReelCard({ theme, brandColor, saved, isNew, onClick, rank }: {
  theme: ReelTheme
  brandColor: string
  saved: boolean
  isNew: boolean
  onClick: () => void
  rank?: number
}) {
  const ct = theme.contentType ?? 'social_proof'
  const meta = CONTENT_TYPE_META[ct] ?? CONTENT_TYPE_META.social_proof
  const score = theme.buzzScore
  const scoreColor = !score ? brandColor : score >= 80 ? '#16a34a' : score >= 60 ? brandColor : '#92400e'
  const scoreBg    = !score ? `${brandColor}15` : score >= 80 ? '#dcfce7' : score >= 60 ? `${brandColor}15` : '#fef3c7'

  return (
    <button
      onClick={onClick}
      className="group flex-shrink-0 text-left rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-0.5"
      style={{
        width: 272,
        minWidth: 272,
        background: 'white',
        borderColor: 'var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        className="rounded-t-2xl px-4 pt-4 pb-3"
        style={{ background: `${brandColor}0d` }}
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ background: `${brandColor}20` }}
          >
            {[...theme.emoji][0]}
          </div>
          <div className="flex flex-col items-end gap-1">
            {rank !== undefined && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${brandColor}20`, color: brandColor }}>
                #{rank}
              </span>
            )}
            {isNew && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef9c3', color: '#854d0e' }}>
                New
              </span>
            )}
            {saved && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                ✓ Saved
              </span>
            )}
          </div>
        </div>

        <h3
          className="font-bold text-sm leading-snug mb-1"
          style={{
            color: 'var(--ink)',
            letterSpacing: '-0.01em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as never,
            overflow: 'hidden',
          }}
        >
          {theme.title}
        </h3>
      </div>

      {/* Hook */}
      <div className="px-4 py-3 flex-1">
        <p
          className="text-xs italic leading-relaxed"
          style={{
            color: 'var(--ink3)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical' as never,
            overflow: 'hidden',
          }}
        >
          "{theme.hook}"
        </p>
      </div>

      {/* Footer */}
      <div
        className="px-4 pb-4 flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
            {ct === 'social_proof'
              ? (theme.reelType === 'story' ? 'Story' : 'Pattern')
              : meta.label}
          </span>
          {score !== undefined && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: scoreBg, color: scoreColor }}>
              🔥 {score}
            </span>
          )}
        </div>
        <div
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all group-hover:scale-105"
          style={{ background: brandColor, color: 'white' }}
        >
          {saved ? 'Redo →' : 'Build →'}
        </div>
      </div>
    </button>
  )
}
