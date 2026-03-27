'use client'

import { useState, useEffect } from 'react'

interface Props {
  businessName: string
  importedCount: number
  brandColor: string
}

export function WelcomeBanner({ businessName, importedCount, brandColor }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show only if arrived from OAuth and haven't dismissed before
    const params = new URLSearchParams(window.location.search)
    const justConnected = params.get('google_connected') === 'true'
    const dismissed = localStorage.getItem('welcome_banner_dismissed') === 'true'
    if (justConnected && !dismissed) setVisible(true)

    // Clean up the query param from the URL without reload
    if (justConnected) {
      const url = new URL(window.location.href)
      url.searchParams.delete('google_connected')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  function dismiss() {
    localStorage.setItem('welcome_banner_dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="rounded-2xl p-5 mb-6 flex items-start justify-between gap-4"
      style={{ background: `${brandColor}12`, border: `1px solid ${brandColor}30` }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
          style={{ background: brandColor }}
        >
          🎉
        </div>
        <div>
          <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--ink)' }}>
            Welcome to ReviewSpark, {businessName}!
          </p>
          {importedCount > 0 ? (
            <p className="text-sm" style={{ color: 'var(--ink3)' }}>
              We found and imported{' '}
              <strong style={{ color: 'var(--ink)' }}>{importedCount} reviews</strong>{' '}
              from your Google Business Profile. The AI has already analysed them —
              head to <strong style={{ color: 'var(--ink)' }}>Reels</strong> to turn them into content.
            </p>
          ) : (
            <p className="text-sm" style={{ color: 'var(--ink3)' }}>
              Google Business is connected. Start collecting reviews with your QR code —
              they&apos;ll appear here automatically.
            </p>
          )}
        </div>
      </div>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-sm opacity-40 hover:opacity-70 transition-opacity mt-0.5"
        style={{ color: 'var(--ink)' }}
      >
        ✕
      </button>
    </div>
  )
}
