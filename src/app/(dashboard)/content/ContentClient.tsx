'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { exportReelVideo } from '../reels/canvasRenderer'
import type { ReelScript } from '@/types'
import type { ReelVariation, ReelCompositionProps } from '@/remotion/types'
import { REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from '@/remotion/ReelComposition'

const Player = dynamic(() => import('@remotion/player').then(m => m.Player), { ssr: false })
const ReelCompositionModule = dynamic(() => import('@/remotion/ReelComposition').then(m => ({ default: m.ReelComposition })), { ssr: false })

type PostWithReview = {
  id: string
  business_id: string
  review_id: string | null
  caption: string
  image_url: string | null
  status: 'draft' | 'scheduled' | 'published'
  scheduled_for: string | null
  post_type: 'post' | 'reel'
  reel_script: ReelScript | null
  reel_theme: string | null
  instagram_media_id: string | null
  created_at: string
  review: {
    customer_name: string | null
    star_rating: number
    what_they_liked: string
  } | null
}

type Filter = 'all' | 'draft' | 'scheduled' | 'published'

interface Props {
  posts: PostWithReview[]
  instagramConnected: boolean
  brandColor: string
  brandSecondaryColor: string
  brandFont: string
  brandLogoUrl: string | null
  businessName: string
  industry: string
}

// ── Reel preview modal ─────────────────────────────────────────

function ReelPreviewModal({ script, brandColor, brandSecondaryColor, brandLogoUrl, businessName, industry, onClose }: {
  script: ReelScript
  brandColor: string
  brandSecondaryColor: string
  brandLogoUrl: string | null
  businessName: string
  industry: string
  onClose: () => void
}) {
  // Reconstruct the variation from saved script data
  const hookSlide = script.slides.find(s => s.type === 'hook')
  const ctaSlide  = script.slides.find(s => s.type === 'cta')
  const variation: ReelVariation = {
    id: 1,
    label: '',
    description: '',
    tone: 'bold',
    hookHeadline: hookSlide?.content.headline ?? '',
    hookSubline:  hookSlide?.content.subline ?? undefined,
    ctaText:      ctaSlide?.content.cta ?? '',
    visualStyle:  (script.visualStyle as ReelVariation['visualStyle']) ?? 'cinematic',
    script,
  }

  const playerProps: ReelCompositionProps = {
    script,
    variation,
    brandColor,
    brandSecondaryColor: brandSecondaryColor || brandColor,
    logoUrl: brandLogoUrl,
    businessName,
    industry,
    websiteUrl: null,
  }

  const totalFrames = Math.round(script.totalDuration * REEL_FPS)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: 340, position: 'relative' }}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-sm font-semibold opacity-70 hover:opacity-100"
        >
          ✕ Close
        </button>
        <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
          <Player
            component={ReelCompositionModule as never}
            inputProps={playerProps}
            durationInFrames={totalFrames}
            compositionWidth={REEL_WIDTH}
            compositionHeight={REEL_HEIGHT}
            fps={REEL_FPS}
            style={{ width: '100%', height: '100%' }}
            controls
            loop
            autoPlay
          />
        </div>
      </div>
    </div>
  )
}

// ── Main client ────────────────────────────────────────────────

export function ContentClient({ posts: initialPosts, instagramConnected, brandColor, brandSecondaryColor, brandFont, brandLogoUrl, businessName, industry }: Props) {
  const [posts, setPosts] = useState(initialPosts)
  const [filter, setFilter] = useState<Filter>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [previewScript, setPreviewScript] = useState<ReelScript | null>(null)

  const counts = {
    all: posts.length,
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
  }

  const visible = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  async function handleDelete(id: string) {
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('social_posts').delete().eq('id', id)
    setPosts(p => p.filter(post => post.id !== id))
    setDeleting(null)
  }

  async function handleMarkPublished(id: string) {
    const supabase = createClient()
    await supabase.from('social_posts').update({ status: 'published' }).eq('id', id)
    setPosts(p => p.map(post => post.id === id ? { ...post, status: 'published' as const } : post))
  }

  function handleInstagramPosted(id: string, mediaId: string) {
    setPosts(p => p.map(post =>
      post.id === id ? { ...post, status: 'published' as const, instagram_media_id: mediaId } : post
    ))
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border)', background: 'white' }}>
        <div className="text-4xl mb-4">✦</div>
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>No content yet</h3>
        <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--ink3)' }}>
          Go to Reviews to create posts, or Reels to generate cinematic video content.
        </p>
      </div>
    )
  }

  return (
    <div>
      {previewScript && (
        <ReelPreviewModal
          script={previewScript}
          brandColor={brandColor}
          brandSecondaryColor={brandSecondaryColor}
          brandLogoUrl={brandLogoUrl}
          businessName={businessName}
          industry={industry}
          onClose={() => setPreviewScript(null)}
        />
      )}

      {/* Instagram connect banner */}
      {!instagramConnected && (
        <div className="rounded-2xl border p-4 mb-6 flex items-center justify-between gap-4" style={{ borderColor: '#c7d2fe', background: '#eef2ff' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📸</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#3730a3' }}>Connect Instagram to post directly</p>
              <p className="text-xs" style={{ color: '#6366f1' }}>Link your Instagram Business account to publish Reels with one click.</p>
            </div>
          </div>
          <a
            href="/api/auth/instagram"
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: '#6366f1' }}
          >
            Connect Instagram →
          </a>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-6">
        {(['all', 'draft', 'scheduled', 'published'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize"
            style={{
              background: filter === f ? 'var(--ink)' : 'white',
              color: filter === f ? 'white' : 'var(--ink3)',
              borderColor: filter === f ? 'var(--ink)' : 'var(--border)',
            }}
          >
            {f}
            <span
              className="px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: filter === f ? 'rgba(255,255,255,0.2)' : 'var(--bg)',
                color: filter === f ? 'white' : 'var(--ink4)',
              }}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--border)', background: 'white' }}>
          <p className="text-sm" style={{ color: 'var(--ink3)' }}>No {filter} posts yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map(post => (
            <PostCard
              key={post.id}
              post={post}
              instagramConnected={instagramConnected}
              brandColor={brandColor}
              brandFont={brandFont}
              businessName={businessName}
              onDelete={() => handleDelete(post.id)}
              onMarkPublished={() => handleMarkPublished(post.id)}
              onInstagramPosted={(mediaId) => handleInstagramPosted(post.id, mediaId)}
              onPreview={() => post.reel_script && setPreviewScript(post.reel_script)}
              deleting={deleting === post.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PostCard({ post, instagramConnected, brandColor, brandFont, businessName, onDelete, onMarkPublished, onInstagramPosted, onPreview, deleting }: {
  post: PostWithReview
  instagramConnected: boolean
  brandColor: string
  brandFont: string
  businessName: string
  onDelete: () => void
  onMarkPublished: () => void
  onInstagramPosted: (mediaId: string) => void
  onPreview: () => void
  deleting: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [posting, setPosting] = useState(false)
  const [postProgress, setPostProgress] = useState(0)
  const [postError, setPostError] = useState<string | null>(null)
  const [insights, setInsights] = useState<{ plays: number; reach: number; likes: number; comments: number; shares: number; saved: number } | null>(null)

  useEffect(() => {
    if (!post.instagram_media_id) return
    fetch(`/api/instagram/insights?mediaId=${post.instagram_media_id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && !data.error) setInsights(data) })
      .catch(() => {})
  }, [post.instagram_media_id])

  const date = new Date(post.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  async function handleCopy() {
    await navigator.clipboard.writeText(post.caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handlePostToInstagram() {
    if (!post.reel_script) return
    setPosting(true)
    setPostError(null)
    setPostProgress(0)

    try {
      await document.fonts.ready
      const blob = await exportReelVideo(
        post.reel_script.slides,
        post.reel_script.totalDuration,
        brandColor,
        businessName,
        brandFont,
        (pct) => setPostProgress(Math.round(pct * 80)),
        { industry: undefined }
      )

      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      setPostProgress(85)

      const res = await fetch('/api/instagram/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, videoBlob: base64, caption: post.caption, postType: 'reel' }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to post')

      setPostProgress(100)
      onInstagramPosted(data.mediaId)
    } catch (err: unknown) {
      setPostError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPosting(false)
    }
  }

  const statusStyles: Record<string, { bg: string; color: string; border: string; label: string }> = {
    draft:     { bg: 'var(--bg)',       color: 'var(--ink3)',  border: 'var(--border)',        label: 'Draft' },
    scheduled: { bg: '#fffbeb',         color: '#92400e',      border: '#fde68a',              label: 'Scheduled' },
    published: { bg: 'var(--green-bg)', color: 'var(--green)', border: 'var(--green-border)',  label: '✓ Published' },
  }
  const s = statusStyles[post.status]
  const isReel = post.post_type === 'reel' || !!post.reel_script

  return (
    <div className="bg-white rounded-2xl border transition-all hover:shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            {/* Status + badges + date */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                {s.label}
              </span>
              {isReel && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#0a0a0a', color: 'white' }}>
                  🎬 Reel
                </span>
              )}
              {post.instagram_media_id && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                  📸 On Instagram
                </span>
              )}
              <span className="text-xs" style={{ color: 'var(--ink4)' }}>{date}</span>
            </div>

            {/* Reel info */}
            {isReel && post.reel_script && (
              <div className="mb-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  {post.reel_theme ?? 'Reel'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ink4)' }}>
                  {post.reel_script.slides.length} slides · {post.reel_script.totalDuration}s
                </p>
              </div>
            )}

            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink2)' }}>
              {expanded ? post.caption : post.caption.slice(0, 140) + (post.caption.length > 140 ? '…' : '')}
            </p>
            {post.caption.length > 140 && (
              <button onClick={() => setExpanded(e => !e)}
                className="text-xs mt-1 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--accent)' }}>
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}

            {/* Instagram insights */}
            {post.instagram_media_id && insights && (
              <div className="flex items-center gap-4 mt-3 pt-3 border-t flex-wrap" style={{ borderColor: 'var(--border)' }}>
                {[
                  { icon: '▶', label: 'plays',    value: insights.plays },
                  { icon: '👥', label: 'reach',    value: insights.reach },
                  { icon: '❤️', label: 'likes',   value: insights.likes },
                  { icon: '💬', label: 'comments', value: insights.comments },
                  { icon: '↗',  label: 'shares',   value: insights.shares },
                  { icon: '🔖', label: 'saved',    value: insights.saved },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className="text-xs">{icon}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--ink2)' }}>{value.toLocaleString()}</span>
                    <span className="text-xs" style={{ color: 'var(--ink4)' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
            {post.instagram_media_id && !insights && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--ink4)' }}>Loading insights…</p>
              </div>
            )}

            {/* Source review */}
            {post.review && (
              <div className="flex items-start gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: '#f59e0b', fontSize: 11 }}>{'★'.repeat(post.review.star_rating)}</span>
                <p className="text-xs italic" style={{ color: 'var(--ink4)' }}>
                  &ldquo;{post.review.what_they_liked.slice(0, 90)}{post.review.what_they_liked.length > 90 ? '…' : ''}&rdquo;
                  {post.review.customer_name && (
                    <span style={{ fontStyle: 'normal', fontWeight: 600 }}> — {post.review.customer_name}</span>
                  )}
                </p>
              </div>
            )}

            {/* Instagram progress / error */}
            {posting && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--ink3)' }}>
                    {postProgress < 82 ? 'Rendering reel...' : postProgress < 90 ? 'Uploading...' : 'Publishing to Instagram...'}
                  </p>
                  <p className="text-xs font-bold" style={{ color: brandColor }}>{postProgress}%</p>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 4, background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${postProgress}%`, background: brandColor }} />
                </div>
              </div>
            )}
            {postError && (
              <p className="text-xs mt-2 px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#dc2626' }}>
                {postError}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Preview reel */}
            {isReel && post.reel_script && (
              <button
                onClick={onPreview}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:opacity-90"
                style={{ background: '#0a0a0a', color: 'white', borderColor: '#0a0a0a' }}
              >
                ▶ Preview
              </button>
            )}

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-gray-50"
              style={{ borderColor: 'var(--border)', color: 'var(--ink2)' }}
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>

            {isReel && instagramConnected && !post.instagram_media_id && post.status !== 'published' && (
              <button
                onClick={handlePostToInstagram}
                disabled={posting}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50"
                style={{ background: brandColor, color: 'white', borderColor: brandColor }}
              >
                {posting ? '…' : '📸 Post to IG'}
              </button>
            )}

            {isReel && !instagramConnected && (
              <a
                href="/api/auth/instagram"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all hover:opacity-80"
                style={{ borderColor: '#c7d2fe', color: '#6366f1', background: '#eef2ff' }}
              >
                Connect IG
              </a>
            )}

            {post.status === 'scheduled' && (
              <button
                onClick={onMarkPublished}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-gray-50"
                style={{ borderColor: 'var(--green-border)', color: 'var(--green)', background: 'var(--green-bg)' }}
              >
                ✓ Mark posted
              </button>
            )}

            {post.status === 'draft' && !isReel && (
              <button
                onClick={onMarkPublished}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-gray-50"
                style={{ borderColor: 'var(--border)', color: 'var(--ink3)' }}
              >
                Mark posted
              </button>
            )}

            <button
              onClick={onDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-red-50 disabled:opacity-40"
              style={{ borderColor: '#fecaca', color: '#dc2626' }}
            >
              {deleting ? '…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
