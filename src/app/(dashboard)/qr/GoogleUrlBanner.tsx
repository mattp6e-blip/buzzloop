'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  businessId: string
  googleConnected: boolean
  hasReviewUrl: boolean
}

export function GoogleUrlBanner({ businessId, googleConnected, hasReviewUrl }: Props) {
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!url.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('businesses').update({ google_business_url: url.trim() }).eq('id', businessId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => window.location.reload(), 800)
  }

  if (!googleConnected) {
    return (
      <div className="mb-6 rounded-2xl border p-4 flex items-start gap-3" style={{ borderColor: '#f59e0b40', background: '#fefce8' }}>
        <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
        <div>
          <p className="text-sm font-bold mb-0.5" style={{ color: '#92400e' }}>Connect Google Business Profile before sharing this QR code</p>
          <p className="text-sm" style={{ color: '#a16207' }}>
            Without it, customers can write their review but won&apos;t be sent to Google to post it — the most important step.{' '}
            <a href="/onboarding" className="underline font-semibold hover:opacity-70">Connect now →</a>
          </p>
        </div>
      </div>
    )
  }

  if (!hasReviewUrl) {
    return (
      <div className="mb-6 rounded-2xl border p-4" style={{ borderColor: '#f59e0b40', background: '#fefce8' }}>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-bold mb-0.5" style={{ color: '#92400e' }}>Add your Google review link before sharing</p>
            <p className="text-sm" style={{ color: '#a16207' }}>
              This is where customers get sent to post their review. To get it: search your business on Google Maps → click &quot;Write a review&quot; → copy the URL.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://search.google.com/local/writereview?..."
            className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor: '#f59e0b80', background: 'white', color: '#1a1814' }}
          />
          <button
            onClick={handleSave}
            disabled={saving || saved || !url.trim()}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: saved ? '#16a34a' : '#f59e0b', color: 'white', opacity: !url.trim() ? 0.5 : 1 }}
          >
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  return null
}
