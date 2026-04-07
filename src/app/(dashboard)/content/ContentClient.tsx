'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
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

function InstagramLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function ReelPreviewModal({ script, brandColor, brandSecondaryColor, brandLogoUrl, businessName, industry, onClose }: {
  script: ReelScript
  brandColor: string
  brandSecondaryColor: string
  brandLogoUrl: string | null
  businessName: string
  industry: string
  onClose: () => void
}) {
  const hookSlide = script.slides.find(s => s.type === 'hook')
  const ctaSlide  = script.slides.find(s => s.type === 'cta')
  const variation: ReelVariation = {
    id: 1,
    label: '',
    description: '',
    tone: 'bold',
    hookHeadline:  hookSlide?.content.headline ?? '',
    hookSubline:   hookSlide?.content.subline ?? undefined,
    ctaHeadline:   ctaSlide?.content.headline ?? '',
    ctaText:       ctaSlide?.content.cta ?? '',
    template:      (script.template as ReelVariation['template']) ?? 'immersive',
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
    gbpPhotos: [],
  }

  const PREVIEW_W = 340
  const PREVIEW_H = Math.round(PREVIEW_W * REEL_HEIGHT / REEL_WIDTH)
  const totalFrames = Math.round(script.totalDuration * REEL_FPS)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-sm font-semibold opacity-70 hover:opacity-100"
        >
          ✕ Close
        </button>
        <div className="rounded-2xl overflow-hidden">
          <Player
            component={ReelCompositionModule as never}
            inputProps={playerProps}
            durationInFrames={totalFrames}
            compositionWidth={REEL_WIDTH}
            compositionHeight={REEL_HEIGHT}
            fps={REEL_FPS}
            style={{ width: PREVIEW_W, height: PREVIEW_H }}
            controls
            loop
            autoPlay
          />
        </div>
      </div>
    </div>
  )
}

type Filter = 'all' | 'draft' | 'posted'

export function ContentClient({ posts: initialPosts, instagramConnected, brandColor, brandSecondaryColor, brandLogoUrl, businessName, industry, brandFont }: Props) {
  const [posts, setPosts]                 = useState(initialPosts)
  const [previewScript, setPreviewScript] = useState<ReelScript | null>(null)
  const [deleting, setDeleting]           = useState<string | null>(null)
  const [filter, setFilter]               = useState<Filter>('all')

  async function handleDelete(id: string) {
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('social_posts').delete().eq('id', id)
    setPosts(p => p.filter(post => post.id !== id))
    setDeleting(null)
  }

  function handleInstagramPosted(id: string, mediaId: string) {
    setPosts(p => p.map(post =>
      post.id === id ? { ...post, status: 'published' as const, instagram_media_id: mediaId } : post
    ))
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border p-16 text-center" style={{ borderColor: 'var(--border)' }}>
        <div className="text-3xl mb-4">✦</div>
        <h3 className="font-bold text-base mb-2" style={{ color: 'var(--ink)' }}>No reels saved yet</h3>
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>
          Go to <a href="/reels" style={{ color: brandColor }}>Reel ideas →</a> to create your first reel.
        </p>
      </div>
    )
  }

  const isPosted = (p: PostWithReview) => !!p.instagram_media_id || p.status === 'published'
  const counts = {
    all:    posts.length,
    draft:  posts.filter(p => !isPosted(p)).length,
    posted: posts.filter(p => isPosted(p)).length,
  }
  const visible = filter === 'all' ? posts : filter === 'posted' ? posts.filter(isPosted) : posts.filter(p => !isPosted(p))

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

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 p-1 rounded-2xl self-start" style={{ background: 'var(--bg2)' }}>
        {(['all', 'draft', 'posted'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 capitalize"
            style={{
              background: filter === f ? 'var(--surface)' : 'transparent',
              color: filter === f ? 'var(--ink)' : 'var(--ink3)',
              boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {f}
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{
              background: filter === f ? brandColor + '18' : 'transparent',
              color: filter === f ? brandColor : 'var(--ink4)',
            }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {visible.map(post => (
          <ReelCard
            key={post.id}
            post={post as PostWithReview}
            instagramConnected={instagramConnected}
            brandColor={brandColor}
            brandFont={brandFont}
            businessName={businessName}
            onDelete={() => handleDelete(post.id)}
            onInstagramPosted={(mediaId) => handleInstagramPosted(post.id, mediaId)}
            onPreview={() => post.reel_script && setPreviewScript(post.reel_script)}
            deleting={deleting === post.id}
          />
        ))}
      </div>
    </div>
  )
}

function ReelCard({ post, instagramConnected, brandColor, brandFont, businessName, onDelete, onInstagramPosted, onPreview, deleting }: {
  post: PostWithReview
  instagramConnected: boolean
  brandColor: string
  brandFont: string
  businessName: string
  onDelete: () => void
  onInstagramPosted: (mediaId: string) => void
  onPreview: () => void
  deleting: boolean
}) {
  const [expanded, setExpanded]           = useState(false)
  const [posting, setPosting]             = useState(false)
  const [postProgress, setPostProgress]   = useState(0)
  const [postError, setPostError]         = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const date = new Date(post.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const isPublished = !!post.instagram_media_id || post.status === 'published'

  async function handlePostToInstagram() {
    if (!instagramConnected) {
      window.location.href = '/api/auth/instagram'
      return
    }
    if (!post.reel_script) return

    setPosting(true)
    setPostError(null)
    setPostProgress(0)

    try {
      const { exportReelVideo } = await import('../reels/canvasRenderer')
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

  return (
    <div className="rounded-2xl border p-5 transition-all" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs" style={{ color: 'var(--ink4)' }}>{date}</span>
            {isPublished && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#16a34a' }}>
                ✓ Posted
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
            {post.reel_theme ?? 'Reel'}
          </h3>
          {post.reel_script && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--ink4)' }}>
              {post.reel_script.slides.length} slides · {post.reel_script.totalDuration}s
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {post.reel_script && (
            <button
              onClick={onPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--ink2)', background: 'var(--bg)' }}
            >
              ▶ Preview
            </button>
          )}

          {!isPublished ? (
            <button
              onClick={handlePostToInstagram}
              disabled={posting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: brandColor, color: 'white' }}
            >
              <InstagramLogo size={12} />
              {posting ? `${postProgress}%` : 'Post'}
            </button>
          ) : (
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: '#dcfce7', color: '#16a34a' }}
            >
              <InstagramLogo size={12} />
              Posted
            </span>
          )}

          <button
            onClick={() => {
              if (confirmDelete) { onDelete() }
              else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) }
            }}
            disabled={deleting}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:bg-red-50 disabled:opacity-40"
            style={{
              borderColor: confirmDelete ? '#fecaca' : 'var(--border)',
              color: confirmDelete ? '#dc2626' : 'var(--ink4)',
            }}
          >
            {deleting ? '…' : confirmDelete ? 'Sure?' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Caption */}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink3)' }}>
        {expanded ? post.caption : post.caption.slice(0, 120) + (post.caption.length > 120 ? '…' : '')}
      </p>
      {post.caption.length > 120 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs mt-1 hover:opacity-70 transition-opacity"
          style={{ color: brandColor }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}


      {/* Post progress */}
      {posting && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs" style={{ color: 'var(--ink3)' }}>
              {postProgress < 82 ? 'Rendering reel...' : postProgress < 90 ? 'Uploading...' : 'Publishing...'}
            </p>
            <p className="text-xs font-bold" style={{ color: brandColor }}>{postProgress}%</p>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 3, background: 'var(--border)' }}>
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
  )
}
