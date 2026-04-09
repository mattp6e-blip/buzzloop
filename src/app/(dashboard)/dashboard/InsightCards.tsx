'use client'

import { useEffect, useState } from 'react'
import type { Industry } from '@/types'

// ─── Industry previews (shown blurred when not connected) ─────────────────────

const LOCKED_PREVIEW: Record<string, { keywords: string[]; services: string[] }> = {
  dental: {
    keywords: ['emergency dentist', 'same-day appointments', 'invisalign provider'],
    services: ['Teeth Whitening', 'Dental Implants', 'Invisalign', 'Emergency Care'],
  },
  restaurant: {
    keywords: ['outdoor seating', 'private dining', 'locally sourced ingredients'],
    services: ['Takeaway', 'Catering', 'Private Events', 'Sunday Brunch'],
  },
  gym: {
    keywords: ['personal training', 'group fitness classes', '24/7 gym access'],
    services: ['Personal Training', 'Group Classes', 'Nutrition Coaching', 'Online Coaching'],
  },
  salon: {
    keywords: ['balayage specialist', 'keratin treatment', 'walk-ins welcome'],
    services: ['Balayage', 'Keratin Treatment', 'Bridal Hair', 'Colour Correction'],
  },
  spa: {
    keywords: ['couples massage', 'hot stone therapy', 'relaxation packages'],
    services: ['Hot Stone Massage', 'Couples Packages', 'Facial Treatments', 'Body Wraps'],
  },
  physiotherapy: {
    keywords: ['sports injury rehab', 'dry needling', 'post-surgery recovery'],
    services: ['Sports Rehabilitation', 'Dry Needling', 'Manual Therapy', 'Pilates'],
  },
  bar: {
    keywords: ['craft cocktails', 'live music venue', 'private hire'],
    services: ['Private Hire', 'Cocktail Masterclass', 'Live Music', 'Birthday Packages'],
  },
  other: {
    keywords: ['free consultation', 'same-day service', 'certified professionals'],
    services: ['Free Consultation', 'Same-Day Service', 'Premium Package', 'Gift Vouchers'],
  },
}

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

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <p style={{
        fontSize: 10, fontWeight: 700, color: 'var(--ink4)',
        letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>{label}</p>
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

// ─── Locked action card ───────────────────────────────────────────────────────

function LockedCard({ icon, bg, children }: { icon: string; bg: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{
      background: 'white', border: '1px solid var(--border)', borderLeft: '4px solid #6366f1',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', gap: 12, filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.96) 58%)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 20px',
      }}>
        <a
          href="/api/auth/google"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-opacity"
          style={{ background: '#6366f1', color: 'white', textDecoration: 'none', flexShrink: 0 }}
        >
          🔒 Unlock — Connect Google →
        </a>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface InsightCardsProps {
  googleConnected: boolean
  industry: Industry
}

export function InsightCards({ googleConnected, industry }: InsightCardsProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [descText, setDescText] = useState('')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  useEffect(() => {
    if (!googleConnected) return
    setLoading(true)
    fetch('/api/growth/gbp-profile')
      .then(r => r.json())
      .then((data: ProfileData) => {
        setProfile(data)
        setDescText(data.analysis?.improvedDescription || data.currentDescription || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [googleConnected])

  const preview = LOCKED_PREVIEW[industry as string] ?? LOCKED_PREVIEW.other

  async function applyAll() {
    if (!profile?.analysis) return
    setApplying(true)
    setApplyError(null)
    try {
      if (descText.trim()) {
        const r = await fetch('/api/growth/apply-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'description', payload: { description: descText } }),
        })
        if (!r.ok) throw new Error('Description update failed')
      }
      const selectedServices = (profile.analysis?.suggestedServices ?? [])
        .filter(s => checked[s.name])
        .map(s => s.name)
      if (selectedServices.length > 0) {
        const r = await fetch('/api/growth/apply-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'services', payload: { services: selectedServices } }),
        })
        if (!r.ok) throw new Error('Services update failed')
      }
      setApplied(true)
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setApplying(false)
  }

  // ── Not connected ─────────────────────────────────────────────────────────

  if (!googleConnected) {
    return (
      <>
        <SectionDivider label="GBP optimisations" />
        <LockedCard icon="📝" bg="#fef9c3">
          <p className="text-sm font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Update your GBP description</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {preview.keywords.map(kw => (
              <span key={kw} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: '#fef9c3', color: '#854d0e' }}>+ {kw}</span>
            ))}
          </div>
        </LockedCard>
        <LockedCard icon="🛠" bg="#eff6ff">
          <p className="text-sm font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Add missing services</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {preview.services.map(s => (
              <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink3)' }}>{s}</span>
            ))}
          </div>
        </LockedCard>
      </>
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading || !profile) {
    return (
      <>
        <SectionDivider label="GBP optimisations" />
        <SkeletonCard />
        <SkeletonCard />
      </>
    )
  }

  // ── Error / not connected ─────────────────────────────────────────────────

  if (profile.error || !profile.connected) {
    return (
      <>
        <SectionDivider label="GBP optimisations" />
        <div className="rounded-2xl border p-4" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--ink3)' }}>
            {profile.error ?? 'Could not load GBP data. Try reconnecting your Google account.'}
          </p>
        </div>
      </>
    )
  }

  // ── Connected — real data ─────────────────────────────────────────────────

  const { missingKeywords = [], suggestedServices = [] } = profile.analysis ?? {}
  const currentSet = new Set((profile.currentServices ?? []).map(s => s.toLowerCase()))
  const newSuggestions = suggestedServices.filter(s => !currentSet.has(s.name.toLowerCase()))

  return (
    <>
      <SectionDivider label="GBP optimisations" />

      {/* Description card */}
      <div className="rounded-2xl p-5" style={{
        background: 'white', border: '1px solid var(--border)', borderLeft: '4px solid #f59e0b',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>📝</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#d97706', background: '#fef9c3', padding: '2px 6px', borderRadius: 4 }}>
                GBP UPDATE
              </span>
            </div>
            <p className="text-sm font-bold mb-2" style={{ color: 'var(--ink)', lineHeight: 1.35 }}>
              Add missing keywords to your description
            </p>
            {missingKeywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                {missingKeywords.map(kw => (
                  <span key={kw} style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 5,
                    background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a',
                  }}>+ {kw}</span>
                ))}
              </div>
            )}
            <button
              onClick={() => setDescExpanded(e => !e)}
              className="text-xs font-semibold transition-colors"
              style={{ color: 'var(--ink3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {descExpanded ? '▲ Hide' : '▼ View / edit AI-improved description'}
            </button>
            {descExpanded && (
              <textarea
                value={descText}
                onChange={e => { setDescText(e.target.value); setApplied(false) }}
                rows={5}
                className="w-full text-xs rounded-xl p-3 resize-none mt-2"
                style={{
                  border: '1px solid var(--border)', background: 'var(--bg)',
                  color: 'var(--ink)', outline: 'none', lineHeight: 1.6,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Services card */}
      {newSuggestions.length > 0 && (
        <div className="rounded-2xl p-5" style={{
          background: 'white', border: '1px solid var(--border)', borderLeft: '4px solid #3b82f6',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🛠</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 4 }}>
                  GBP UPDATE
                </span>
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink)', lineHeight: 1.35 }}>
                Add missing services your competitors list
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--ink3)' }}>Tick only the ones you actually offer</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {newSuggestions.map(s => (
                  <label key={s.name} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer',
                    padding: '6px 8px', borderRadius: 8,
                    background: checked[s.name] ? '#eff6ff' : 'var(--surface)',
                    border: `1px solid ${checked[s.name] ? '#bfdbfe' : 'var(--border)'}`,
                    transition: 'all 0.12s',
                  }}>
                    <input
                      type="checkbox"
                      checked={!!checked[s.name]}
                      onChange={e => { setChecked(p => ({ ...p, [s.name]: e.target.checked })); setApplied(false) }}
                      style={{ marginTop: 2, accentColor: '#3b82f6', flexShrink: 0 }}
                    />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{s.name}</p>
                      <p className="text-xs" style={{ color: 'var(--ink4)' }}>{s.reason}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply all */}
      {applyError && <p className="text-xs" style={{ color: '#ef4444' }}>{applyError}</p>}
      <button
        onClick={applyAll}
        disabled={applying || applied}
        className="w-full text-sm font-bold py-3.5 rounded-2xl transition-opacity hover:opacity-85 disabled:opacity-40"
        style={{ background: applied ? '#16a34a' : '#6366f1', color: 'white' }}
      >
        {applying
          ? 'Applying to Google Business Profile…'
          : applied
          ? '✓ Changes applied to your GBP'
          : 'Let Buzzloop apply all GBP changes →'}
      </button>
    </>
  )
}
