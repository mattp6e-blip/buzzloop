'use client'

import { useState } from 'react'
import { InsightCards } from './InsightCards'
import { KeywordRankings } from './KeywordRankings'
import type { Business, Competitor } from '@/types'
import type { Task, HealthBreakdown } from './page'

// ─── Task Card ────────────────────────────────────────────────────────────────

const PRIORITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#6b7280' }
const PRIORITY_LABELS = { critical: 'URGENT', high: 'HIGH', medium: 'MEDIUM', low: 'LOW' }

function TaskCard({ task }: { task: Task }) {
  const color = PRIORITY_COLORS[task.priority]
  return (
    <div className="rounded-2xl p-5" style={{
      background: 'white', border: '1px solid var(--border)', borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          {task.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color,
              background: `${color}15`, padding: '2px 6px', borderRadius: 4,
            }}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink)', lineHeight: 1.35 }}>{task.title}</p>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--ink3)' }}>{task.why}</p>
          <a
            href={task.action.href}
            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: color, color: 'white' }}
          >
            {task.action.label} →
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Competitor Panel ─────────────────────────────────────────────────────────

const NOISE_TYPES = new Set([
  'establishment', 'point_of_interest', 'business', 'store', 'food', 'premise', 'political', 'locality', 'sublocality',
])

function formatType(t: string) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function CompetitorPanel({
  competitors, totalReviews, businessName, lastSyncedAt,
}: {
  competitors: Competitor[]
  totalReviews: number
  businessName: string
  lastSyncedAt: string | null
}) {
  const syncedLabel = lastSyncedAt
    ? (() => {
        const days = Math.floor((Date.now() - new Date(lastSyncedAt).getTime()) / 86400000)
        return days === 0 ? 'Updated today' : days === 1 ? 'Updated yesterday' : `Updated ${days}d ago`
      })()
    : null

  return (
    <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
      <div style={{ marginBottom: 14 }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink3)' }}>
          Local search rankings
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--ink4)' }}>
          Sorted by Google popularity{syncedLabel ? ` · ${syncedLabel}` : ''}
        </p>
      </div>
      {(() => {
        const all = competitors // already sorted by review_count desc from server
        // Estimated rank = how many competitors have more reviews than us + 1
        const estimatedRank = all.filter(c => c.review_count > totalReviews).length + 1

        // Decide which competitors to show:
        // Always show the #1 competitor, then up to 4 directly above/around user, max 5 total
        const aboveUser = all.filter(c => c.review_count > totalReviews)
        const belowUser = all.filter(c => c.review_count <= totalReviews)

        // Show up to 4 above user, up to 3 below
        const showAbove = aboveUser.slice(0, 4)
        const showBelow = belowUser.slice(0, 3)

        // Gap = how many above-user competitors are hidden
        const hiddenCount = aboveUser.length - showAbove.length

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

            {/* Competitors above user */}
            {showAbove.map((c, i) => {
              const actualRank = i + 1 // rank 1 = most reviews
              const isTop = actualRank === 1
              const gap = c.review_count - totalReviews
              const types = c.types.filter(t => !NOISE_TYPES.has(t)).slice(0, 2)
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 10,
                  background: isTop ? '#fef2f2' : 'var(--surface)',
                  border: `1px solid ${isTop ? '#fecaca' : 'var(--border)'}`,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: isTop ? '#ef4444' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: isTop ? 'white' : 'var(--ink3)',
                  }}>#{actualRank}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--ink)' }}>{c.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap' }}>
                      {c.rating !== null && <span style={{ fontSize: 10, color: 'var(--ink3)' }}>★ {c.rating}</span>}
                      <span style={{ fontSize: 10, color: 'var(--ink3)' }}>{c.review_count.toLocaleString()} reviews</span>
                      {types.map(t => (
                        <span key={t} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'var(--border)', color: 'var(--ink4)' }}>
                          {formatType(t)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {gap > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', flexShrink: 0 }}>
                      +{gap.toLocaleString()}
                    </span>
                  )}
                </div>
              )
            })}

            {/* Ellipsis if competitors are hidden */}
            {hiddenCount > 0 && (
              <div style={{ textAlign: 'center', padding: '2px 0' }}>
                <span style={{ fontSize: 10, color: 'var(--ink4)' }}>· · · {hiddenCount} more above you · · ·</span>
              </div>
            )}

            {/* You */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 10,
              background: '#f0fdf4', border: '2px solid #86efac',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: 'white',
              }}>#{estimatedRank}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p className="text-xs font-semibold truncate" style={{ color: '#15803d' }}>{businessName}</p>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: 3, flexShrink: 0 }}>YOU</span>
                </div>
                <p style={{ fontSize: 10, color: '#16a34a', marginTop: 2 }}>{totalReviews} reviews</p>
              </div>
            </div>

            {/* 1 competitor below user if exists */}
            {showBelow.map(c => {
              const actualRank = estimatedRank + 1
              const types = c.types.filter(t => !NOISE_TYPES.has(t)).slice(0, 2)
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 10,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: 'var(--ink3)',
                  }}>#{actualRank}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--ink)' }}>{c.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap' }}>
                      {c.rating !== null && <span style={{ fontSize: 10, color: 'var(--ink3)' }}>★ {c.rating}</span>}
                      <span style={{ fontSize: 10, color: 'var(--ink3)' }}>{c.review_count.toLocaleString()} reviews</span>
                      {types.map(t => (
                        <span key={t} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'var(--border)', color: 'var(--ink4)' }}>
                          {formatType(t)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

          </div>
        )
      })()}
    </div>
  )
}

// ─── Setup prompt (no place ID yet) ──────────────────────────────────────────

function LocalSearchSetup({ onSetupComplete }: { onSetupComplete: () => void }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSetup() {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/growth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input.trim() }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Something went wrong. Try including the city name.')
      else { onSetupComplete(); window.location.reload() }
    } catch { setError('Network error. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>
        Local search rankings
      </p>
      <p className="text-xs mb-4" style={{ color: 'var(--ink4)' }}>
        Paste your Google Maps URL or type your business name + city to find your local competitors automatically.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSetup()}
          placeholder="e.g. Joe's Dental, Chicago"
          className="flex-1 px-3 py-2 rounded-xl text-xs"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
          disabled={loading}
        />
        <button
          onClick={handleSetup}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-80 disabled:opacity-40 whitespace-nowrap"
          style={{ background: 'var(--accent)', color: 'white', flexShrink: 0 }}
        >
          {loading ? '…' : 'Analyse →'}
        </button>
      </div>
      {error && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  )
}

// ─── Score ring (small, inline in header) ────────────────────────────────────

function ScoreRing({ score, brandColor }: { score: number; brandColor: string }) {
  const r = 16
  const circumference = 2 * Math.PI * r
  const filled = (score / 100) * circumference
  const color = score >= 70 ? brandColor : score >= 40 ? '#f97316' : '#ef4444'
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="20" cy="20" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round"
        transform="rotate(-90 20 20)" />
      <text x="20" y="20" textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fontWeight="700" fill={color} fontFamily="Georgia, serif">
        {score}
      </text>
    </svg>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface GrowthHubProps {
  business: Business
  brandColor: string
  healthScore: number
  healthBreakdown: HealthBreakdown
  tasks: Task[]
  totalReviews: number
  thisWeekCount: number
  lastWeekCount: number
  reelsCreated: number
  reelsPostedThisWeek: number
  avgCompetitorReviews: number | null
  competitors: Competitor[]
  outreachThisWeek: number
}

export function GrowthHub({
  business,
  brandColor,
  healthScore,
  healthBreakdown: _healthBreakdown,
  tasks,
  totalReviews,
  thisWeekCount,
  lastWeekCount,
  reelsCreated: _reelsCreated,
  reelsPostedThisWeek: _reelsPostedThisWeek,
  avgCompetitorReviews: _avgCompetitorReviews,
  competitors: initialCompetitors,
  outreachThisWeek: _outreachThisWeek,
}: GrowthHubProps) {
  const [competitors] = useState(initialCompetitors)
  const isSetup = !!business.google_place_id
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  // Cap delta to avoid showing import spike artifacts (bulk imports cause huge false negatives)
  const rawDelta = thisWeekCount - lastWeekCount
  const weekDelta = Math.abs(rawDelta) <= 15 ? rawDelta : 0

  return (
    <div className="p-8" style={{ maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Growth Hub</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--ink3)' }}>
              {tasks.length > 0
                ? `${tasks.length} action${tasks.length > 1 ? 's' : ''} this week`
                : 'All caught up this week'}
              {weekDelta !== 0 && (
                <span style={{ color: weekDelta > 0 ? '#16a34a' : '#dc2626', marginLeft: 8 }}>
                  · {weekDelta > 0 ? `↑ ${weekDelta}` : `↓ ${Math.abs(weekDelta)}`} reviews vs last week
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 12, background: 'white', border: '1px solid var(--border)' }}>
            <ScoreRing score={healthScore} brandColor={brandColor} />
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink4)', textTransform: 'uppercase' }}>GBP Score</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Georgia, serif' }}>{healthScore}/100</p>
            </div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--ink4)' }}>{today}</span>
      </div>

      {/* Row 1 — Tasks (left) + Competitors (right) */}
      <div className="grid gap-5 mb-6" style={{ gridTemplateColumns: '1fr 340px' }}>

        {/* Tasks + GBP optimisations */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink3)' }}>
            This week&apos;s actions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks.length === 0 ? (
              <div className="rounded-2xl border p-8 text-center" style={{ background: 'white', borderColor: 'var(--border)' }}>
                <p style={{ fontSize: 28, marginBottom: 6 }}>🎉</p>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink)' }}>All caught up</p>
                <p className="text-xs" style={{ color: 'var(--ink4)' }}>No priority actions this week. Keep the momentum going.</p>
              </div>
            ) : (
              tasks.map(task => <TaskCard key={task.id} task={task} />)
            )}
            <InsightCards
              googleConnected={business.google_connected ?? false}
              industry={business.industry}
            />
          </div>
        </div>

        {/* Competitors + Keyword Rankings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isSetup || competitors.length === 0 ? (
            <LocalSearchSetup onSetupComplete={() => {}} />
          ) : (
            <CompetitorPanel
              competitors={competitors}
              totalReviews={totalReviews}
              businessName={business.name}
              lastSyncedAt={competitors[0]?.last_synced_at ?? null}
            />
          )}
          <KeywordRankings isSetup={isSetup} />
        </div>
      </div>

    </div>
  )
}
