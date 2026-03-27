'use client'

import { useState, useMemo } from 'react'

type Period = 'week' | 'month' | 'year'

interface Bucket { label: string; start: Date; end: Date }

function weekBuckets(n: number): Bucket[] {
  const buckets: Bucket[] = []
  const now = new Date()
  // End of current week (Sun)
  const endOfThisWeek = new Date(now)
  endOfThisWeek.setDate(now.getDate() + (7 - now.getDay()) % 7)
  endOfThisWeek.setHours(23, 59, 59, 999)

  for (let i = n - 1; i >= 0; i--) {
    const end = new Date(endOfThisWeek)
    end.setDate(endOfThisWeek.getDate() - i * 7)
    const start = new Date(end)
    start.setDate(end.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    buckets.push({
      label: start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      start,
      end,
    })
  }
  return buckets
}

function monthBuckets(n: number): Bucket[] {
  const buckets: Bucket[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
    buckets.push({
      label: start.toLocaleDateString('en-GB', { month: 'short', year: i === 0 || start.getMonth() === 0 ? '2-digit' : undefined }),
      start,
      end,
    })
  }
  return buckets
}

function yearBuckets(firstDate: Date): Bucket[] {
  const buckets: Bucket[] = []
  const now = new Date()
  const startYear = firstDate.getFullYear()
  const endYear = now.getFullYear()
  for (let y = startYear; y <= endYear; y++) {
    buckets.push({
      label: String(y),
      start: new Date(y, 0, 1),
      end: new Date(y, 11, 31, 23, 59, 59, 999),
    })
  }
  return buckets
}

function buildSvg(buckets: Bucket[], counts: number[], brandColor: string) {
  const W = 420
  const H = 80
  const gap = buckets.length > 20 ? 3 : 6
  const barW = Math.max(4, Math.floor((W - (buckets.length - 1) * gap) / buckets.length))
  const max = Math.max(...counts, 1)

  const bars = counts.map((c, i) => {
    const barH = Math.max(c > 0 ? 4 : 2, Math.round((c / max) * H))
    const x = i * (barW + gap)
    const y = H - barH
    const isLast = i === counts.length - 1
    return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3"
      fill="${isLast ? brandColor : '#e5e7eb'}" opacity="${isLast ? 1 : 0.9}"/>`
  }).join('')

  // Only show every Nth label to avoid overlap
  const labelEvery = buckets.length > 18 ? 4 : buckets.length > 10 ? 2 : 1
  const labels = buckets.map((b, i) => {
    if (i % labelEvery !== 0 && i !== buckets.length - 1) return ''
    const x = i * (barW + gap) + barW / 2
    return `<text x="${x}" y="${H + 14}" text-anchor="middle" font-size="9" fill="#9ca3af" font-family="system-ui">${b.label}</text>`
  }).join('')

  return `<svg width="${W}" height="${H + 20}" xmlns="http://www.w3.org/2000/svg">${bars}${labels}</svg>`
}

interface Props {
  reviewDates: string[]  // ISO strings
  brandColor: string
}

export function ReviewTrendChart({ reviewDates, brandColor }: Props) {
  const [period, setPeriod] = useState<Period>('month')

  const dates = useMemo(() => reviewDates.map(d => new Date(d)), [reviewDates])

  const { buckets, counts, periodTotal } = useMemo(() => {
    const firstDate = dates.length > 0
      ? new Date(Math.min(...dates.map(d => d.getTime())))
      : new Date()

    let b: Bucket[]
    if (period === 'week') b = weekBuckets(12)
    else if (period === 'month') b = monthBuckets(12)
    else b = yearBuckets(firstDate)

    const c = b.map(bucket =>
      dates.filter(d => d >= bucket.start && d <= bucket.end).length
    )

    // "This period" = last bucket
    const last = c[c.length - 1] ?? 0
    return { buckets: b, counts: c, periodTotal: last }
  }, [dates, period])

  const periodLabel = period === 'week' ? 'this week' : period === 'month' ? 'this month' : 'this year'

  const svg = buildSvg(buckets, counts, brandColor)

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--ink3)' }}>
            Review trend
          </p>
          <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
            New reviews per {period}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period toggle */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            {(['week', 'month', 'year'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 text-xs font-semibold transition-all capitalize"
                style={period === p
                  ? { background: brandColor, color: 'white' }
                  : { background: 'white', color: 'var(--ink3)' }
                }
              >
                {p}
              </button>
            ))}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: brandColor, fontFamily: 'Georgia, serif' }}>
              {periodTotal}
            </p>
            <p className="text-xs" style={{ color: 'var(--ink4)' }}>{periodLabel}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {reviewDates.length === 0 ? (
        <div className="flex items-center justify-center h-[100px] rounded-xl" style={{ background: 'var(--bg)' }}>
          <p className="text-sm" style={{ color: 'var(--ink4)' }}>No reviews yet — share your QR code to get started</p>
        </div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      )}
    </div>
  )
}
