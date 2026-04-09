'use client'

import { useState } from 'react'
import { ReviewTrendChart } from './ReviewTrendChart'
import type { Business, Competitor } from '@/types'
import type { Task, HealthBreakdown } from './page'

// ─── Health Ring ──────────────────────────────────────────────────────────────

function HealthRing({ score, brandColor }: { score: number; brandColor: string }) {
  const r = 52
  const circumference = 2 * Math.PI * r
  const filled = (score / 100) * circumference

  const color = score >= 70 ? brandColor : score >= 40 ? '#f97316' : '#ef4444'

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: 'block' }}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="9" />
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text
        x="60" y="56"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="26"
        fontWeight="700"
        fontFamily="Georgia, serif"
        fill={color}
      >
        {score}
      </text>
      <text
        x="60" y="76"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="var(--ink3)"
        fontFamily="system-ui, sans-serif"
      >
        / 100
      </text>
    </svg>
  )
}

// ─── Breakdown Bar ────────────────────────────────────────────────────────────

function BreakdownBar({
  label, earned, max, brandColor,
}: { label: string; earned: number; max: number; brandColor: string }) {
  const pct = Math.round((earned / max) * 100)
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: 'var(--ink3)' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)' }}>{earned}/{max}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 3,
          background: pct >= 70 ? brandColor : pct >= 40 ? '#f97316' : '#ef4444',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, up, down,
}: {
  label: string
  value: string
  sub: string
  up?: boolean
  down?: boolean
}) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink3)' }}>
        {label}
      </p>
      <p className="text-3xl font-bold mb-1" style={{ color: 'var(--ink)', fontFamily: 'Georgia, serif' }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: up ? '#16a34a' : down ? '#dc2626' : 'var(--ink4)' }}>
        {sub}
      </p>
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────

const PRIORITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#6b7280',
}

const PRIORITY_LABELS = {
  critical: 'URGENT',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
}

function TaskCard({ task }: { task: Task }) {
  const color = PRIORITY_COLORS[task.priority]
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: `${color}15`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18,
        }}>
          {task.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
              color: color, background: `${color}15`,
              padding: '2px 6px', borderRadius: 4,
            }}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink)', lineHeight: 1.35 }}>
            {task.title}
          </p>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--ink3)' }}>
            {task.why}
          </p>
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
  'establishment', 'point_of_interest', 'business', 'store', 'food',
  'premise', 'political', 'locality', 'sublocality',
])

function formatType(t: string) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function CompetitorPanel({
  initial,
  totalReviews,
}: {
  initial: Competitor[]
  totalReviews: number
}) {
  const [competitors, setCompetitors] = useState<Competitor[]>(initial)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleAdd() {
    if (!input.trim()) return
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/competitors/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'GOOGLE_MAPS_API_KEY_NOT_SET') {
          setError('Maps API key not configured. Add GOOGLE_MAPS_API_KEY to environment variables.')
        } else {
          setError(data.error ?? 'Failed to add competitor')
        }
      } else {
        setCompetitors(prev => {
          // Avoid duplicates
          const exists = prev.find(c => c.id === data.competitor.id)
          if (exists) return prev.map(c => c.id === data.competitor.id ? data.competitor : c)
          return [...prev, data.competitor]
        })
        setInput('')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await fetch('/api/competitors/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setCompetitors(prev => prev.filter(c => c.id !== id))
    } catch { /* silent */ }
    setDeleting(null)
  }

  return (
    <div className="rounded-2xl border p-5 h-full" style={{ background: 'white', borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--ink3)' }}>
        Competitors
      </p>

      {/* Add competitor */}
      <div style={{ marginBottom: 16 }}>
        <p className="text-xs mb-2" style={{ color: 'var(--ink4)' }}>
          Paste a Google Maps URL or type a business name
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. Joe's Barber, Chicago"
            className="flex-1 px-3 py-2 rounded-lg text-xs"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--ink)',
              outline: 'none',
            }}
            disabled={adding}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !input.trim()}
            className="px-3 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'white', flexShrink: 0 }}
          >
            {adding ? '…' : 'Add'}
          </button>
        </div>
        {error && (
          <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{error}</p>
        )}
      </div>

      {/* Competitor list */}
      {competitors.length === 0 ? (
        <div style={{
          padding: '20px 0',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--ink4)' }}>
            Add competitors to benchmark your reviews, ratings, and categories
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {competitors.map(c => {
            const meaningfulTypes = c.types.filter(t => !NOISE_TYPES.has(t)).slice(0, 3)
            const gap = c.review_count - totalReviews
            return (
              <div key={c.id} style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{c.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      {c.rating !== null && (
                        <span style={{ fontSize: 11, color: 'var(--ink2)' }}>★ {c.rating}</span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--ink3)' }}>
                        {c.review_count.toLocaleString()} reviews
                      </span>
                      {gap > 0 && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: '#ef4444',
                          background: '#fef2f2', padding: '1px 5px', borderRadius: 4,
                        }}>
                          +{gap.toLocaleString()} ahead
                        </span>
                      )}
                    </div>
                    {meaningfulTypes.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                        {meaningfulTypes.map(t => (
                          <span key={t} style={{
                            fontSize: 10, padding: '2px 6px', borderRadius: 4,
                            background: 'var(--border)', color: 'var(--ink3)',
                          }}>
                            {formatType(t)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                    style={{
                      flexShrink: 0, fontSize: 16, lineHeight: 1, color: 'var(--ink4)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                    }}
                    title="Remove competitor"
                  >
                    {deleting === c.id ? '…' : '×'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
  reviewDates: string[]
  velocityLabel: string | null
  outreachThisWeek: number
}

export function GrowthHub({
  business,
  brandColor,
  healthScore,
  healthBreakdown,
  tasks,
  totalReviews,
  thisWeekCount,
  lastWeekCount,
  reelsCreated,
  reelsPostedThisWeek,
  avgCompetitorReviews,
  competitors,
  reviewDates,
  velocityLabel,
  outreachThisWeek,
}: GrowthHubProps) {
  const weekDelta = thisWeekCount - lastWeekCount
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const competitorGap = avgCompetitorReviews !== null ? avgCompetitorReviews - totalReviews : null

  return (
    <div className="p-8" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Growth Hub</h1>
          <span style={{ fontSize: 12, color: 'var(--ink4)' }}>{today}</span>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--ink3)' }}>
          Your GBP growth system — {tasks.length > 0 ? `${tasks.length} action${tasks.length > 1 ? 's' : ''} this week` : 'all caught up this week'}
        </p>
        {!business.google_connected && (
          <div className="mt-4 rounded-xl px-4 py-3 flex items-center gap-3" style={{
            background: '#fef3c7', border: '1px solid #fde68a',
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <p style={{ fontSize: 13, color: '#92400e' }}>
              <a href="/api/auth/google" style={{ fontWeight: 700, color: '#92400e', textDecoration: 'underline' }}>Connect Google Business Profile</a>
              {' '}to import reviews and unlock full analytics.
            </p>
          </div>
        )}
      </div>

      {/* Row 1 — Score + KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Health score card */}
        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink3)' }}>
            GBP Score
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HealthRing score={healthScore} brandColor={brandColor} />
            <div style={{ flex: 1 }}>
              <BreakdownBar label="Reviews" earned={healthBreakdown.reviews.earned} max={healthBreakdown.reviews.max} brandColor={brandColor} />
              <BreakdownBar label="Velocity" earned={healthBreakdown.velocity.earned} max={healthBreakdown.velocity.max} brandColor={brandColor} />
              <BreakdownBar label="Content" earned={healthBreakdown.content.earned} max={healthBreakdown.content.max} brandColor={brandColor} />
              <BreakdownBar label="Profile" earned={healthBreakdown.profile.earned} max={healthBreakdown.profile.max} brandColor={brandColor} />
              <BreakdownBar label="Outreach" earned={healthBreakdown.outreach.earned} max={healthBreakdown.outreach.max} brandColor={brandColor} />
            </div>
          </div>
        </div>

        {/* Reviews this week */}
        <KpiCard
          label="Reviews this week"
          value={String(thisWeekCount)}
          sub={weekDelta === 0
            ? `${totalReviews} total · same as last week`
            : weekDelta > 0
              ? `↑ ${weekDelta} more than last week`
              : `↓ ${Math.abs(weekDelta)} fewer than last week`}
          up={weekDelta > 0}
          down={weekDelta < 0}
        />

        {/* Competitor gap */}
        <KpiCard
          label="Avg competitor gap"
          value={competitorGap !== null ? (competitorGap > 0 ? `−${competitorGap.toLocaleString()}` : `+${Math.abs(competitorGap)}`) : '—'}
          sub={competitorGap === null
            ? 'Add competitors to benchmark'
            : competitorGap > 0
              ? `You need ${competitorGap} more reviews to match avg`
              : 'You\'re ahead of the average'}
          down={competitorGap !== null && competitorGap > 0}
          up={competitorGap !== null && competitorGap <= 0}
        />

        {/* Reels / Outreach */}
        <KpiCard
          label="Reels & outreach"
          value={`${reelsCreated} / ${outreachThisWeek}`}
          sub={`Reels created · Requests sent this week`}
        />
      </div>

      {/* Row 2 — Tasks + Competitors */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Tasks */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink3)' }}>
            This week&apos;s actions
          </p>
          {tasks.length === 0 ? (
            <div className="rounded-2xl border p-8 text-center" style={{ background: 'white', borderColor: 'var(--border)' }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>🎉</p>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink)' }}>All caught up</p>
              <p className="text-xs" style={{ color: 'var(--ink4)' }}>
                No priority actions this week. Keep the momentum going.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Competitors */}
        <CompetitorPanel initial={competitors} totalReviews={totalReviews} />
      </div>

      {/* Row 3 — Review trend */}
      <div className="rounded-2xl border p-6" style={{ background: 'white', borderColor: 'var(--border)' }}>
        <ReviewTrendChart
          reviewDates={reviewDates}
          brandColor={brandColor}
          velocityLabel={velocityLabel}
        />
      </div>
    </div>
  )
}
