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
  brandColor: string
  brandSecondaryColor: string
  brandFont: string
  brandLogoUrl: string | null
  businessName: string
  industry: string
  websiteUrl: string | null
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

export function ContentClient({ posts: initialPosts, brandColor, brandSecondaryColor, brandLogoUrl, businessName, industry, websiteUrl, brandFont }: Props) {
  const [posts, setPosts]                 = useState(initialPosts)
  const [previewScript, setPreviewScript] = useState<ReelScript | null>(null)
  const [deleting, setDeleting]           = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('social_posts').delete().eq('id', id)
    setPosts(p => p.filter(post => post.id !== id))
    setDeleting(null)
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

      <div className="flex flex-col gap-3">
        {posts.map(post => (
          <ReelCard
            key={post.id}
            post={post}
            brandColor={brandColor}
            brandSecondaryColor={brandSecondaryColor}
            brandLogoUrl={brandLogoUrl}
            businessName={businessName}
            industry={industry}
            websiteUrl={websiteUrl}
            onDelete={() => handleDelete(post.id)}
            onPreview={() => post.reel_script && setPreviewScript(post.reel_script)}
            deleting={deleting === post.id}
          />
        ))}
      </div>
    </div>
  )
}

function ReelCard({ post, brandColor, brandSecondaryColor, brandLogoUrl, businessName, industry, websiteUrl, onDelete, onPreview, deleting }: {
  post: PostWithReview
  brandColor: string
  brandSecondaryColor: string
  brandLogoUrl: string | null
  businessName: string
  industry: string
  websiteUrl: string | null
  onDelete: () => void
  onPreview: () => void
  deleting: boolean
}) {
  const [expanded, setExpanded]           = useState(false)
  const [downloading, setDownloading]     = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const date = new Date(post.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  async function handleDownload() {
    if (!post.reel_script) return
    setDownloading(true)
    setDownloadError(null)

    const script = post.reel_script
    const hookSlide = script.slides.find(s => s.type === 'hook')
    const ctaSlide  = script.slides.find(s => s.type === 'cta')
    const variation: ReelVariation = {
      id: 1,
      label: '',
      description: '',
      tone: 'bold',
      hookHeadline: hookSlide?.content.headline ?? '',
      hookSubline:  hookSlide?.content.subline ?? undefined,
      ctaHeadline:  ctaSlide?.content.headline ?? '',
      ctaText:      ctaSlide?.content.cta ?? '',
      template:     (script.template as ReelVariation['template']) ?? 'immersive',
      script,
    }

    try {
      const renderUrl = (process.env.NEXT_PUBLIC_RENDER_SERVICE_URL ?? '') + '/api/render-reel'
      const res = await fetch(renderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          variation,
          brandColor,
          brandSecondaryColor: brandSecondaryColor || brandColor,
          logoUrl: brandLogoUrl,
          businessName,
          industry,
          websiteUrl,
          gbpPhotos: [],
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Render failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const slug = (post.reel_theme ?? businessName).replace(/\s+/g, '-').toLowerCase()
      a.download = `${slug}-${Date.now()}.mp4`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setDownloadError(String(err))
    }
    setDownloading(false)
  }

  return (
    <div className="rounded-2xl border p-5 transition-all" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-1" style={{ color: 'var(--ink4)' }}>{date}</p>
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

          {post.reel_script && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: brandColor, color: 'white' }}
            >
              {downloading ? (
                <>
                  <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                  Rendering...
                </>
              ) : '↓ Download'}
            </button>
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

      {downloadError && (
        <p className="text-xs mt-2 px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#dc2626' }}>
          {downloadError}
        </p>
      )}
    </div>
  )
}
