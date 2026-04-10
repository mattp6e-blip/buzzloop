'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { Review } from '@/types'

// ─── Reply card ───────────────────────────────────────────────────────────────

function ReplyCard({ review, googleConnected }: { review: Review; googleConnected: boolean }) {
  const [reply, setReply] = useState('')
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting] = useState(false)
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const date = new Date(review.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    const res = await fetch('/api/growth/reply-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: review.id }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Failed to generate')
    else setReply(data.reply)
    setGenerating(false)
  }

  async function handlePost() {
    if (!reply.trim()) return
    setPosting(true)
    setError(null)
    const res = await fetch('/api/growth/reply-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: review.id, post: true }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Failed to post')
    else setDone(true)
    setPosting(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (done) return null

  return (
    <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
      {/* Review */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent-bg)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700,
        }}>
          {review.customer_name ? review.customer_name[0].toUpperCase() : '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--ink2)' }}>
              {review.customer_name ?? 'Anonymous'}
            </p>
            <div style={{ display: 'flex', gap: 1 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ fontSize: 11, color: i < review.star_rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--ink4)' }}>{date}</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink2)' }}>
            &ldquo;{review.what_they_liked}&rdquo;
          </p>
        </div>
      </div>

      {/* Reply area */}
      {reply ? (
        <>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={4}
            className="w-full text-sm rounded-xl p-3 resize-none"
            style={{
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--ink)', outline: 'none', lineHeight: 1.6, marginBottom: 10,
            }}
          />
          {error && <p className="text-xs mb-2" style={{ color: '#ef4444' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            {googleConnected ? (
              <button
                onClick={handlePost}
                disabled={posting || !reply.trim()}
                className="text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                {posting ? 'Posting…' : 'Post to Google →'}
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
                style={{ background: copied ? '#16a34a' : 'var(--accent)', color: 'white' }}
              >
                {copied ? '✓ Copied' : 'Copy reply'}
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-xs font-semibold px-3 py-2 rounded-xl transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{ background: 'var(--surface)', color: 'var(--ink3)', border: '1px solid var(--border)' }}
            >
              {generating ? '…' : 'Regenerate'}
            </button>
          </div>
          {!googleConnected && (
            <p className="text-xs mt-2" style={{ color: 'var(--ink4)' }}>
              Copy and paste into{' '}
              <a href="https://business.google.com/reviews" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                Google Business
              </a>
              {' '}· or{' '}
              <a href="/api/auth/google?returnTo=/reviews?tab=reply" style={{ color: 'var(--accent)' }}>
                connect Google
              </a>
              {' '}to post directly
            </p>
          )}
        </>
      ) : (
        <>
          {error && <p className="text-xs mb-2" style={{ color: '#ef4444' }}>{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {generating ? 'Generating…' : 'Generate reply →'}
          </button>
        </>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  googleConnected: boolean
  initialReviews: Review[]
  unrepliedReviews: Review[]
  businessName: string
  industry: string
  brandColor: string
  brandFont: string
}

export function ReviewsClient({
  googleConnected, initialReviews, unrepliedReviews,
  businessName, industry, brandColor, brandFont,
}: Props) {
  const [reviews] = useState<Review[]>(initialReviews)
  const [activeTab, setActiveTab] = useState<'content' | 'reply'>(
    unrepliedReviews.length > 0 ? 'reply' : 'content'
  )
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  async function handleSeedTestData() {
    setSyncing(true)
    const res = await fetch('/api/dev/seed-reviews', { method: 'POST' })
    const data = await res.json()
    if (data.seeded) window.location.reload()
    else setSyncResult(data.error)
    setSyncing(false)
  }

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    const res = await fetch('/api/google/reviews', { method: 'POST' })
    const data = await res.json()
    if (data.imported > 0) {
      setSyncResult(`Imported ${data.imported} new review${data.imported !== 1 ? 's' : ''}`)
      window.location.reload()
    } else {
      setSyncResult(data.message ?? data.error ?? 'No new reviews found')
    }
    setSyncing(false)
  }

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-6">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('reply')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: activeTab === 'reply' ? 'white' : 'transparent',
              color: activeTab === 'reply' ? 'var(--ink)' : 'var(--ink4)',
              boxShadow: activeTab === 'reply' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Reply {unrepliedReviews.length > 0 && (
              <span style={{
                marginLeft: 4, fontSize: 10, fontWeight: 700, padding: '1px 5px',
                borderRadius: 8, background: '#ef4444', color: 'white',
              }}>{unrepliedReviews.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: activeTab === 'content' ? 'white' : 'transparent',
              color: activeTab === 'content' ? 'var(--ink)' : 'var(--ink4)',
              boxShadow: activeTab === 'content' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Content
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {syncResult && <p className="text-sm" style={{ color: 'var(--ink3)' }}>{syncResult}</p>}
          <Button variant="outline" size="sm" loading={syncing} onClick={handleSeedTestData}>
            Load test reviews
          </Button>
          {googleConnected ? (
            <Button variant="outline" size="sm" loading={syncing} onClick={handleSync}>
              🔄 Sync Google reviews
            </Button>
          ) : (
            <a
              href="/api/auth/google?returnTo=/reviews"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
              style={{ borderColor: 'var(--border2)', color: 'var(--ink2)', background: 'white' }}
            >
              Connect Google →
            </a>
          )}
        </div>
      </div>

      {/* Reply tab */}
      {activeTab === 'reply' && (
        <div>
          {unrepliedReviews.length === 0 ? (
            <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', background: 'white' }}>
              <p style={{ fontSize: 28, marginBottom: 6 }}>✓</p>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink)' }}>All reviews replied to</p>
              <p className="text-xs" style={{ color: 'var(--ink4)' }}>
                Sync your Google reviews to check for new ones.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {unrepliedReviews.map(review => (
                <ReplyCard key={review.id} review={review} googleConnected={googleConnected} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content tab */}
      {activeTab === 'content' && (
        <div>
          {reviews.length === 0 ? (
            <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', background: 'white' }}>
              <div className="text-4xl mb-4">★</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>No reviews yet</h3>
              <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--ink3)' }}>
                Click &quot;Load test reviews&quot; to preview the experience, or display your QR code to start collecting real ones.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Content review card ──────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-white rounded-2xl border p-5 transition-all hover:shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
          >
            {review.customer_name ? review.customer_name[0].toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm" style={{ color: 'var(--ink2)' }}>
                {review.customer_name ?? 'Anonymous'}
              </p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-xs" style={{ color: i < review.star_rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--ink4)' }}>{date}</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink2)' }}>
              &ldquo;{review.what_they_liked}&rdquo;
            </p>
            {review.posted_to_google && (
              <span className="inline-flex items-center mt-2 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)' }}>
                ✓ Google review
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
