'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Business {
  id: string
  name: string
  industry: string
  brand_color: string | null
  brand_secondary_color: string | null
  logo_url: string | null
  website_url: string | null
  plan: string | null
  studio_generations_this_month: number | null
  studio_generations_reset_at: string | null
}

const LOADING_STEPS = [
  'Reading your brief...',
  'Writing scripts...',
  'Applying visuals...',
]

export function StudioClient({ business }: { business: Business }) {
  const isPro = business.plan === 'pro'
  const now = new Date()
  const resetAt = business.studio_generations_reset_at ? new Date(business.studio_generations_reset_at) : null
  const needsReset = !resetAt || now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()
  const generationsUsed = needsReset ? 0 : (business.studio_generations_this_month ?? 0)
  const freeGenerationsLeft = Math.max(0, 1 - generationsUsed)
  const limitReached = !isPro && freeGenerationsLeft === 0
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (generating) {
      setLoadingStep(0)
      stepIntervalRef.current = setInterval(() => {
        setLoadingStep(prev => Math.min(prev + 1, LOADING_STEPS.length - 1))
      }, 3000)
    } else {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current)
        stepIntervalRef.current = null
      }
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current)
    }
  }, [generating])

  async function handleGenerate() {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-studio-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), businessId: business.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.themeId) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setGenerating(false)
        return
      }
      router.push(`/reels?open=${data.themeId}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setGenerating(false)
    }
  }

  // Limit reached gate
  if (limitReached) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #f59e0b22, #ef444422)', border: '1.5px solid #f59e0b44' }}>
            ✳
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--ink)' }}>You've used your free clip this month</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--ink3)' }}>
            Upgrade to Pro for unlimited Studio clips, plus review replies, SMS outreach, and more.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
          >
            Upgrade to Pro — $49/month
          </Link>
          <p className="text-xs mt-4" style={{ color: 'var(--ink4)' }}>Cancel anytime. Resets on the 1st of each month.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">✳</span>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Studio</h1>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white' }}>PRO</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>
          Describe the social clip you want. The AI will write the script and build it for you.
        </p>
        {!isPro && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg2)', color: 'var(--ink3)', border: '1px solid var(--border)' }}>
            <span style={{ color: freeGenerationsLeft > 0 ? '#22c55e' : '#ef4444' }}>●</span>
            {freeGenerationsLeft > 0 ? '1 free clip remaining this month' : 'No free clips remaining'}
          </div>
        )}
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--ink2)' }}>
          What should this reel be about?
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={`e.g. "A clip for our Valentine's Day special — 20% off all treatments this weekend only" or "Show why ${business.name} is the best ${business.industry} in the area"`}
          rows={4}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
          style={{
            background: 'var(--bg2)',
            border: '1.5px solid var(--border)',
            color: 'var(--ink)',
            lineHeight: 1.6,
          }}
        />

        {error && (
          <p className="mt-3 text-xs font-medium" style={{ color: '#ef4444' }}>{error}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs" style={{ color: 'var(--ink4)' }}>Be specific — mention offers, dates, emotions, or goals</p>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)' }}
          >
            {generating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
                {LOADING_STEPS[loadingStep]}
              </>
            ) : (
              <>✦ Generate Clip</>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-xl p-4 flex items-start gap-3" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--ink4)' }}>💡</span>
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--ink2)' }}>Tips for great results</p>
          <ul className="text-xs space-y-1" style={{ color: 'var(--ink4)' }}>
            <li>Mention your target audience ("for new moms", "for gym beginners")</li>
            <li>Include the emotion you want to create ("exciting", "reassuring", "bold")</li>
            <li>Add a specific offer or hook if you have one</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
