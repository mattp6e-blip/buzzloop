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
        fill="none" stroke={color} strokeWidth="9"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="60" y="56" textAnchor="middle" dominantBaseline="middle"
        fontSize="26" fontWeight="700" fontFamily="Georgia, serif" fill={color}>
        {score}
      </text>
      <text x="60" y="76" textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fill="var(--ink3)" fontFamily="system-ui, sans-serif">
        / 100
      </text>
    </svg>
  )
}

function BreakdownBar({ label, earned, max, brandColor }: { label: string; earned: number; max: number; brandColor: string }) {
  const pct = Math.round((earned / max) * 100)
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: 'var(--ink3)' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)' }}>{earned}/{max}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 3,
          background: pct >= 70 ? brandColor : pct >= 40 ? '#f97316' : '#ef4444',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, up, down }: {
  label: string; value: string; sub: string; up?: boolean; down?: boolean
}) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink3)' }}>{label}</p>
      <p className="text-3xl font-bold mb-1" style={{ color: 'var(--ink)', fontFamily: 'Georgia, serif' }}>{value}</p>
      <p className="text-xs" style={{ color: up ? '#16a34a' : down ? '#dc2626' : 'var(--ink4)' }}>{sub}</p>
    </div>
  )
}

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
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

// ─── Local Search Setup ───────────────────────────────────────────────────────

function LocalSearchSetup({ onSetupComplete }: { onSetupComplete: (count: number) => void }) {
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
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try including the city name.')
      } else {
        onSetupComplete(data.competitorsFound ?? 0)
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border p-6" style={{ background: 'white', borderColor: 'var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          📍
        </div>
        <div style={{ flex: 1 }}>
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink)' }}>
            See who&apos;s ranking above you in local search
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--ink3)' }}>
            Paste your Google Maps URL or type your business name + city. We&apos;ll find your top local competitors automatically — no manual research needed.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSetup()}
              placeholder="e.g. Joe's Dental, Chicago  or  paste Google Maps URL"
              className="flex-1 px-3 py-2.5 rounded-xl text-sm"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
              disabled={loading}
            />
            <button
              onClick={handleSetup}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-40 whitespace-nowrap"
              style={{ background: 'var(--accent)', color: 'white', flexShrink: 0 }}
            >
              {loading ? 'Searching…' : 'Analyse →'}
            </button>
          </div>
          {error && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{error}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Competitors Panel ────────────────────────────────────────────────────────

const NOISE_TYPES = new Set([
  'establishment', 'point_of_interest', 'business', 'store', 'food',
  'premise', 'political', 'locality', 'sublocality',
])

function formatType(t: string) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function CompetitorsPanel({
  competitors,
  totalReviews,
  businessName,
  onRefresh,
}: {
  competitors: Competitor[]
  totalReviews: number
  businessName: string
  onRefresh: () => void
}) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink3)' }}>
            Local search rankings
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink4)' }}>How you rank vs nearby competitors on Google</p>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
          style={{ background: 'var(--surface)', color: 'var(--ink3)', border: '1px solid var(--border)' }}
        >
          Refresh
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Your business row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 10,
          background: '#f0fdf4', border: '1px solid #bbf7d0',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: '#16a34a', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white',
          }}>
            ★
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p className="text-xs font-semibold truncate" style={{ color: '#15803d' }}>{businessName}</p>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: 3, flexShrink: 0 }}>
                YOU
              </span>
            </div>
            <p style={{ fontSize: 10, color: '#16a34a', marginTop: 2 }}>{totalReviews} reviews</p>
          </div>
        </div>

        {/* Divider */}
        <p style={{ fontSize: 10, color: 'var(--ink4)', textAlign: 'center', padding: '2px 0' }}>
          — competitors ranked by Google popularity —
        </p>

        {competitors.slice(0, 6).map((c, i) => {
          const meaningfulTypes = c.types.filter(t => !NOISE_TYPES.has(t)).slice(0, 2)
          const gap = c.review_count - totalReviews
          return (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 10,
              background: i === 0 ? '#fef2f2' : 'var(--surface)',
              border: `1px solid ${i === 0 ? '#fecaca' : 'var(--border)'}`,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: i === 0 ? '#ef4444' : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: i === 0 ? 'white' : 'var(--ink3)',
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--ink)' }}>{c.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                  {c.rating !== null && (
                    <span style={{ fontSize: 10, color: 'var(--ink3)' }}>★ {c.rating}</span>
                  )}
                  <span style={{ fontSize: 10, color: 'var(--ink3)' }}>{c.review_count.toLocaleString()} reviews</span>
                  {meaningfulTypes.map(t => (
                    <span key={t} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'var(--border)', color: 'var(--ink4)' }}>
                      {formatType(t)}
                    </span>
                  ))}
                </div>
              </div>
              {gap > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', flexShrink: 0 }} title={`${c.name} has ${gap} more reviews than you`}>
                  +{gap.toLocaleString()}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Deeper Insights Upsell ───────────────────────────────────────────────────

function DeeperInsightsCard({ connected }: { connected: boolean }) {
  if (connected) return null

  return (
    <div className="rounded-2xl border p-5" style={{
      background: 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)',
      borderColor: '#c7d2fe',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: '#6366f115', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          🔓
        </div>
        <div style={{ flex: 1 }}>
          <p className="text-sm font-bold mb-0.5" style={{ color: '#1e1b4b' }}>Unlock deeper GBP insights</p>
          <p className="text-xs mb-3" style={{ color: '#4338ca' }}>
            Connect Google Business Profile to get AI-powered recommendations based on your actual GBP data
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
            {[
              'Business description keyword gaps vs competitors',
              'Missing services your competitors list',
              'Missing attributes (Free estimates, 24/7, Women-owned…)',
              'GBP post frequency vs top-ranking competitors',
              'Auto-sync new Google reviews into Buzzloop',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#6366f1', flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 11, color: '#3730a3' }}>{item}</span>
              </div>
            ))}
          </div>
          <a
            href="/api/auth/google"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
            style={{ background: '#6366f1', color: 'white' }}
          >
            Connect Google Business Profile →
          </a>
        </div>
      </div>
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
  competitors: initialCompetitors,
  reviewDates,
  velocityLabel,
  outreachThisWeek,
}: GrowthHubProps) {
  const [competitors, setCompetitors] = useState(initialCompetitors)
  const [isSetup, setIsSetup] = useState(!!business.google_place_id)

  const weekDelta = thisWeekCount - lastWeekCount
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const competitorGap = avgCompetitorReviews !== null ? avgCompetitorReviews - totalReviews : null

  function handleSetupComplete(count: number) {
    setIsSetup(true)
    // Page will show stale competitors until refresh — prompt a reload
    if (count > 0) window.location.reload()
  }

  async function handleRefreshCompetitors() {
    // Just reload to re-fetch from DB
    window.location.reload()
  }

  return (
    <div className="p-8" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Growth Hub</h1>
          <span style={{ fontSize: 12, color: 'var(--ink4)' }}>{today}</span>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--ink3)' }}>
          Your GBP growth system — {tasks.length > 0
            ? `${tasks.length} action${tasks.length > 1 ? 's' : ''} this week`
            : 'all caught up this week'}
        </p>
      </div>

      {/* Row 1 — Score + KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink3)' }}>GBP Score</p>
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

        <KpiCard
          label="Reviews this week"
          value={String(thisWeekCount)}
          sub={weekDelta === 0 ? `${totalReviews} total · same as last week`
            : weekDelta > 0 ? `↑ ${weekDelta} more than last week`
            : `↓ ${Math.abs(weekDelta)} fewer than last week`}
          up={weekDelta > 0}
          down={weekDelta < 0}
        />

        <KpiCard
          label="Competitor gap"
          value={competitorGap !== null
            ? (competitorGap > 0 ? `−${competitorGap.toLocaleString()}` : `+${Math.abs(competitorGap)}`)
            : '—'}
          sub={competitorGap === null ? 'Set up local search below'
            : competitorGap > 0 ? `Behind the local average by ${competitorGap} reviews`
            : 'Ahead of the local average'}
          down={competitorGap !== null && competitorGap > 0}
          up={competitorGap !== null && competitorGap <= 0}
        />

        <KpiCard
          label="Reels · Outreach"
          value={`${reelsCreated} · ${outreachThisWeek}`}
          sub="Reels created · Requests sent this week"
        />
      </div>

      {/* Row 2 — Tasks + Right panel */}
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
              <p className="text-xs" style={{ color: 'var(--ink4)' }}>No priority actions this week. Keep the momentum going.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!isSetup ? (
            <LocalSearchSetup onSetupComplete={handleSetupComplete} />
          ) : competitors.length > 0 ? (
            <CompetitorsPanel
              competitors={competitors}
              totalReviews={totalReviews}
              businessName={business.name}
              onRefresh={handleRefreshCompetitors}
            />
          ) : (
            <LocalSearchSetup onSetupComplete={handleSetupComplete} />
          )}

          <DeeperInsightsCard connected={business.google_connected ?? false} />
        </div>
      </div>

      {/* Row 3 — Review trend */}
      <div className="rounded-2xl border p-6" style={{ background: 'white', borderColor: 'var(--border)' }}>
        <ReviewTrendChart reviewDates={reviewDates} brandColor={brandColor} velocityLabel={velocityLabel} />
      </div>
    </div>
  )
}
