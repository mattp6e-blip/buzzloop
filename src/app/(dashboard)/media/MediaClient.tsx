'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  businessId: string
  gbpPhotos: string[]
  uploadedPhotos: string[]
}

export function MediaClient({ businessId, gbpPhotos, uploadedPhotos: initialUploaded }: Props) {
  const [uploaded, setUploaded] = useState<string[]>(initialUploaded)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalPhotos = gbpPhotos.length + uploaded.length

  async function handleFiles(files: FileList) {
    if (!files.length) return
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const ext = file.name.split('.').pop()
      const path = `${businessId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('business-media').upload(path, file)
      if (uploadError) { setError(uploadError.message); continue }
      const { data } = supabase.storage.from('business-media').getPublicUrl(path)
      newUrls.push(data.publicUrl)
    }

    if (newUrls.length) {
      const merged = [...uploaded, ...newUrls]
      await supabase.from('businesses').update({ uploaded_photos: merged }).eq('id', businessId)
      setUploaded(merged)
    }
    setUploading(false)
  }

  async function handleDelete(url: string) {
    const supabase = createClient()
    const merged = uploaded.filter(u => u !== url)
    await supabase.from('businesses').update({ uploaded_photos: merged }).eq('id', businessId)
    setUploaded(merged)
    // Delete from storage
    const path = url.split('/business-media/')[1]
    if (path) await supabase.storage.from('business-media').remove([path])
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>Media</h1>
        <p className="text-sm" style={{ color: 'var(--ink4)' }}>
          Photos used in your Reels. {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''} in your library.
        </p>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed rounded-2xl p-10 text-center mb-10 cursor-pointer transition-colors hover:border-[var(--accent)]"
        style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Uploading…</p>
        ) : (
          <>
            <div className="text-3xl mb-3">⊞</div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink2)' }}>Drop photos here or click to upload</p>
            <p className="text-xs" style={{ color: 'var(--ink4)' }}>JPG, PNG, WebP — these will be used in your Reels</p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mb-6">{error}</p>}

      {/* GBP Photos */}
      {gbpPhotos.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>From Google Business Profile</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--bg2)', color: 'var(--ink4)' }}>
              {gbpPhotos.length}
            </span>
            <span className="text-xs" style={{ color: 'var(--ink4)' }}>· auto-synced</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {gbpPhotos.map((url, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ aspectRatio: '1/1', background: 'var(--bg2)' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Photos */}
      {uploaded.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Uploaded by you</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--bg2)', color: 'var(--ink4)' }}>
              {uploaded.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {uploaded.map((url, i) => (
              <div key={i} className="rounded-xl overflow-hidden relative group" style={{ aspectRatio: '1/1', background: 'var(--bg2)' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => handleDelete(url)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {gbpPhotos.length === 0 && uploaded.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--ink4)' }}>
          <p className="text-sm">No photos yet. Upload some above or connect your Google Business Profile in Settings.</p>
        </div>
      )}
    </div>
  )
}
