'use client'

import { useEffect, useState } from 'react'

export default function DevSeedPage() {
  const [status, setStatus] = useState('Seeding reviews...')

  useEffect(() => {
    fetch('/api/dev/seed-reviews', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.seeded) setStatus(`Done — ${data.seeded} reviews added. Go to /reels`)
        else setStatus(`Error: ${data.error}`)
      })
      .catch(() => setStatus('Request failed'))
  }, [])

  return (
    <div style={{ padding: 40, fontFamily: 'monospace' }}>
      <p>{status}</p>
      {status.includes('Done') && <a href="/reels" style={{ color: 'blue' }}>Go to Reels →</a>}
    </div>
  )
}
