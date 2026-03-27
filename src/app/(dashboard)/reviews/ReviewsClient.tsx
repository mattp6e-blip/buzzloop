'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PostCreator } from './PostCreator'
import type { Review } from '@/types'

interface Props {
  googleConnected: boolean
  initialReviews: Review[]
  businessName: string
  industry: string
  brandColor: string
  brandFont: string
}

export function ReviewsClient({ googleConnected, initialReviews, businessName, industry, brandColor, brandFont }: Props) {
  const [reviews] = useState<Review[]>(initialReviews)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

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

  if (selectedReview) {
    return (
      <PostCreator
        review={selectedReview}
        reviews={reviews}
        businessName={businessName}
        industry={industry}
        brandColor={brandColor}
        brandFont={brandFont}
        onBack={() => setSelectedReview(null)}
      />
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-3 mb-6">
        {syncResult && (
          <p className="text-sm" style={{ color: 'var(--ink3)' }}>{syncResult}</p>
        )}
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
              onCreatePost={() => setSelectedReview(review)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewCard({ review, onCreatePost }: { review: Review; onCreatePost: () => void }) {
  const date = new Date(review.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div
      className="bg-white rounded-2xl border p-5 transition-all hover:shadow-sm"
      style={{ borderColor: 'var(--border)' }}
    >
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

        <Button size="sm" onClick={onCreatePost} className="flex-shrink-0">
          ✦ Create post
        </Button>
      </div>
    </div>
  )
}
