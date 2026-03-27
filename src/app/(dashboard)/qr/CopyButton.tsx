'use client'

import { useState } from 'react'

export function CopyButton({ url, brandColor }: { url: string; brandColor: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90"
      style={{ background: copied ? '#16a34a' : brandColor, color: 'white' }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
