'use client'

import { useEffect, useState } from 'react'
import type { Industry } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  connected: boolean
  currentDescription?: string
  currentServices?: string[]
  analysis?: {
    missingKeywords: string[]
    improvedDescription: string
    suggestedServices: { name: string; reason: string }[]
  }
  error?: string
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink4)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        GBP optimisations
      </p>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5" style={{
      background: 'white', border: '1px solid var(--border)', borderLeft: '4px solid var(--border)',
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--border)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 2 }}>
          <div style={{ height: 12, borderRadius: 6, background: 'var(--border)', width: '55%' }} />
          <div style={{ height: 10, borderRadius: 5, background: 'var(--border)', width: '85%' }} />
          <div style={{ height: 10, borderRadius: 5, background: 'var(--border)', width: '70%' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Description card ─────────────────────────────────────────────────────────

function DescriptionCard({ currentDescription, missingKeywords, improvedDescription }: {
  currentDescription: string
  missingKeywords: string[]
  improvedDescription: string
}) {
  const [text, setText] = useState(improvedDescription || currentDescription)
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleApply() {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/growth/apply-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'description', payload: { description: text } }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Failed to update')
    else setSaved(true)
    setSaving(false)
  }

  return (
    <div className="rounded-2xl p-5" style={{
      background: 'white', border: '1px solid var(--border)', borderLeft: '4px solid #f59e0b',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📝</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#d97706', background: '#fef9c3', padding: '2px 6px', borderRadius: 4 }}>GBP UPDATE</span>
          </div>
          <p className="text-sm font-bold mb-2" style={{ color: 'var(--ink)', lineHeight: 1.35 }}>Add missing keywords to your description</p>
          {missingKeywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
              {missingKeywords.map(kw => (
                <span key={kw} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a' }}>+ {kw}</span>
              ))}
            </div>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs font-semibold"
            style={{ color: 'var(--ink3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {expanded ? '▲ Hide' : '▼ View / edit AI-improved description'}
          </button>
          {expanded && (
            <>
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setSaved(false) }}
                rows={5}
                className="w-full text-xs rounded-xl p-3 resize-none mt-2"
                style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', outline: 'none', lineHeight: 1.6 }}
              />
              {error && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{error}</p>}
              <button
                onClick={handleApply}
                disabled={saving || saved || !text.trim()}
                className="text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-40 mt-2"
                style={{ background: saved ? '#16a34a' : 'var(--accent)', color: 'white' }}
              >
                {saving ? 'Applying…' : saved ? '✓ Applied to GBP' : 'Apply to GBP →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Services card ────────────────────────────────────────────────────────────

function ServicesCard({ currentServices, suggestedServices }: {
  currentServices: string[]
  suggestedServices: { name: string; reason: string }[]
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentSet = new Set(currentServices.map(s => s.toLowerCase()))
  const newSuggestions = suggestedServices.filter(s => !currentSet.has(s.name.toLowerCase()))
  const selectedNames = newSuggestions.filter(s => checked[s.name]).map(s => s.name)

  if (newSuggestions.length === 0) return null

  async function handleAdd() {
    if (!selectedNames.length) return
    setSaving(true)
    setError(null)
    const res = await fetch('/api/growth/apply-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'services', payload: { services: selectedNames } }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Failed to update')
    else setSaved(true)
    setSaving(false)
  }

  return (
    <div className="rounded-2xl p-5" style={{
      background: 'white', border: '1px solid var(--border)', borderLeft: '4px solid #3b82f6',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛠</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 4 }}>GBP UPDATE</span>
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink)', lineHeight: 1.35 }}>Services not yet listed on your GBP</p>
          <p className="text-xs mb-3" style={{ color: 'var(--ink3)' }}>Tick only the ones you actually offer, based on your current GBP data</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {newSuggestions.map(s => (
              <label key={s.name} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer',
                padding: '6px 8px', borderRadius: 8,
                background: checked[s.name] ? '#eff6ff' : 'var(--surface)',
                border: `1px solid ${checked[s.name] ? '#bfdbfe' : 'var(--border)'}`,
              }}>
                <input
                  type="checkbox"
                  checked={!!checked[s.name]}
                  onChange={e => { setChecked(p => ({ ...p, [s.name]: e.target.checked })); setSaved(false) }}
                  style={{ marginTop: 2, accentColor: '#3b82f6', flexShrink: 0 }}
                />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{s.name}</p>
                  <p className="text-xs" style={{ color: 'var(--ink4)' }}>{s.reason}</p>
                </div>
              </label>
            ))}
          </div>
          {error && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{error}</p>}
          <button
            onClick={handleAdd}
            disabled={saving || saved || selectedNames.length === 0}
            className="text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-40 mt-3"
            style={{ background: saved ? '#16a34a' : 'var(--accent)', color: 'white' }}
          >
            {saving ? 'Adding…' : saved ? '✓ Added to GBP' : `Add ${selectedNames.length || ''} selected →`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function InsightCards({ googleConnected, industry: _industry }: { googleConnected: boolean; industry: Industry }) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!googleConnected) return
    setLoading(true)
    fetch('/api/growth/gbp-profile')
      .then(r => r.json())
      .then((data: ProfileData) => { setProfile(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [googleConnected])

  // ── Not connected, single clean CTA, no fake data ────────────────────────
  if (!googleConnected) {
    return (
      <>
        <SectionDivider />
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔍</div>
            <div style={{ flex: 1 }}>
              <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--ink)' }}>Connect Google to unlock GBP analysis</p>
              <p className="text-xs" style={{ color: 'var(--ink3)' }}>
                We'll read your actual description, services, and categories, then show exactly what to fix based on your real data vs competitors.
              </p>
            </div>
            <a
              href="/api/auth/google"
              className="text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{ background: '#6366f1', color: 'white', textDecoration: 'none', flexShrink: 0 }}
            >
              Connect Google →
            </a>
          </div>
        </div>
      </>
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading || !profile) {
    return (
      <>
        <SectionDivider />
        <SkeletonCard />
        <SkeletonCard />
      </>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (profile.error || !profile.connected) {
    return (
      <>
        <SectionDivider />
        <div className="rounded-2xl border p-4" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--ink3)' }}>
            {profile.error ?? 'Could not load GBP data. Try reconnecting your Google account.'}
          </p>
        </div>
      </>
    )
  }

  // ── Connected, real data only ────────────────────────────────────────────
  return (
    <>
      <SectionDivider />
      <DescriptionCard
        currentDescription={profile.currentDescription ?? ''}
        missingKeywords={profile.analysis?.missingKeywords ?? []}
        improvedDescription={profile.analysis?.improvedDescription ?? ''}
      />
      <ServicesCard
        currentServices={profile.currentServices ?? []}
        suggestedServices={profile.analysis?.suggestedServices ?? []}
      />
    </>
  )
}
