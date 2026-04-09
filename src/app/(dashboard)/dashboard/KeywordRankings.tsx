'use client'

import { useEffect, useState } from 'react'

interface KeywordRanking {
  keyword: string
  rank: number | null
  checkedAt: string
}

function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) {
    return (
      <div style={{
        minWidth: 32, height: 22, borderRadius: 6, padding: '0 6px',
        background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color: '#94a3b8', flexShrink: 0,
      }}>
        20+
      </div>
    )
  }
  const color = rank === 1 ? '#16a34a' : rank <= 3 ? '#2563eb' : rank <= 10 ? '#f97316' : '#dc2626'
  const bg = rank === 1 ? '#dcfce7' : rank <= 3 ? '#dbeafe' : rank <= 10 ? '#fff7ed' : '#fee2e2'
  return (
    <div style={{
      minWidth: 32, height: 22, borderRadius: 6, padding: '0 6px',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700, color, flexShrink: 0,
    }}>
      #{rank}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div style={{ width: 32, height: 22, borderRadius: 6, background: 'var(--border)' }} />
      <div style={{ flex: 1, height: 11, borderRadius: 5, background: 'var(--border)', width: '65%' }} />
    </div>
  )
}

export function KeywordRankings({ isSetup }: { isSetup: boolean }) {
  const [rankings, setRankings] = useState<KeywordRanking[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSetup) return
    setLoading(true)
    fetch('/api/growth/keyword-rankings')
      .then(r => r.json())
      .then(data => {
        if (data.rankings) setRankings(data.rankings)
        else setError(data.error ?? 'Failed to load')
        setLoading(false)
      })
      .catch(() => { setError('Network error'); setLoading(false) })
  }, [isSetup])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch('/api/growth/keyword-rankings', { method: 'POST' })
      const data = await res.json()
      if (data.rankings) setRankings(data.rankings)
    } catch { /* silent */ }
    setRefreshing(false)
  }

  const checkedAt = rankings?.[0]?.checkedAt
  const syncedLabel = checkedAt
    ? (() => {
        const days = Math.floor((Date.now() - new Date(checkedAt).getTime()) / 86400000)
        return days === 0 ? 'Checked today' : days === 1 ? 'Checked yesterday' : `Checked ${days}d ago`
      })()
    : null

  return (
    <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink3)' }}>
            Keyword rankings
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink4)' }}>
            {syncedLabel ?? 'Estimated position in local Google search'}
          </p>
        </div>
        {rankings && rankings.length > 0 && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs font-semibold px-3 py-1 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-40"
            style={{ background: 'var(--surface)', color: 'var(--ink3)', border: '1px solid var(--border)' }}
          >
            {refreshing ? '…' : 'Refresh'}
          </button>
        )}
      </div>

      {!isSetup ? (
        <p className="text-xs" style={{ color: 'var(--ink4)' }}>
          Set up local search rankings above to unlock keyword tracking.
        </p>
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : error === 'setup_required' ? (
        <p className="text-xs" style={{ color: 'var(--ink4)' }}>
          Set up local search rankings to unlock keyword tracking.
        </p>
      ) : error ? (
        <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
      ) : rankings && rankings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rankings.map((r) => (
            <div key={r.keyword} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <RankBadge rank={r.rank} />
              <p className="text-xs font-medium" style={{ color: 'var(--ink)', flex: 1, minWidth: 0 }}>{r.keyword}</p>
            </div>
          ))}

          {/* Locked rows — paid tier upgrade CTA */}
          <div style={{ position: 'relative', marginTop: 4 }}>
            <div style={{ filter: 'blur(3px)', pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['more keywords…', 'more keywords…'].map((_, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 10,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <div style={{ width: 32, height: 22, borderRadius: 6, background: 'var(--border)' }} />
                  <div style={{ flex: 1, height: 11, borderRadius: 5, background: 'var(--border)', width: '55%' }} />
                </div>
              ))}
            </div>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink2)' }}>Track more keywords</p>
              <button
                className="text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Upgrade →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
