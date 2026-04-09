'use client'

import { useEffect, useState } from 'react'
import type { Industry } from '@/types'

// ─── Industry-specific locked preview data ────────────────────────────────────

const LOCKED_PREVIEW: Record<string, { keywords: string[]; services: string[] }> = {
  dental: {
    keywords: ['emergency dentist', 'same-day appointments', 'invisalign provider', 'sedation dentistry'],
    services: ['Teeth Whitening', 'Dental Implants', 'Invisalign', 'Emergency Care', 'Root Canal'],
  },
  restaurant: {
    keywords: ['outdoor seating', 'private dining', 'catering available', 'locally sourced ingredients'],
    services: ['Takeaway', 'Catering', 'Private Events', 'Sunday Brunch', 'Wine Pairing'],
  },
  gym: {
    keywords: ['personal training', 'group fitness classes', 'nutrition coaching', '24/7 gym access'],
    services: ['Personal Training', 'Group Classes', 'Nutrition Coaching', 'Body Composition', 'Online Coaching'],
  },
  salon: {
    keywords: ['balayage specialist', 'keratin treatment', 'bridal hair', 'walk-ins welcome'],
    services: ['Balayage', 'Keratin Treatment', 'Bridal Hair', 'Hair Extensions', 'Colour Correction'],
  },
  spa: {
    keywords: ['couples massage', 'hot stone therapy', 'facial treatments', 'relaxation packages'],
    services: ['Hot Stone Massage', 'Couples Packages', 'Facial Treatments', 'Body Wraps', 'Aromatherapy'],
  },
  physiotherapy: {
    keywords: ['sports injury rehabilitation', 'dry needling', 'post-surgery recovery', 'manual therapy'],
    services: ['Sports Rehabilitation', 'Dry Needling', 'Post-Surgery Recovery', 'Manual Therapy', 'Pilates'],
  },
  bar: {
    keywords: ['craft cocktails', 'live music venue', 'private hire', 'happy hour deals'],
    services: ['Private Hire', 'Cocktail Masterclass', 'Live Music', 'Birthday Packages', 'Catering'],
  },
  other: {
    keywords: ['free consultation', 'same-day service', 'certified professionals', 'customer satisfaction guarantee'],
    services: ['Free Consultation', 'Same-Day Service', 'Premium Package', 'Maintenance Plan', 'Gift Vouchers'],
  },
}

function getLockedPreview(industry: Industry) {
  return LOCKED_PREVIEW[industry] ?? LOCKED_PREVIEW.other
}

// ─── Locked card overlay ──────────────────────────────────────────────────────

function LockedCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border flex flex-col" style={{
      background: 'white', borderColor: 'var(--border)', overflow: 'hidden', flex: 1,
    }}>
      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{title}</p>
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#6366f1',
            background: '#eef2ff', padding: '2px 7px', borderRadius: 4,
          }}>LOCKED</span>
        </div>
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        {/* Blurred preview */}
        <div style={{ padding: '14px 18px', filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>
        {/* Gradient + CTA */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 20%, white 65%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 18px 18px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 20, marginBottom: 6 }}>🔒</p>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ink2)' }}>
              Connect Google Business Profile to unlock
            </p>
            <a
              href="/api/auth/google"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
              style={{ background: '#6366f1', color: 'white' }}
            >
              Connect Google →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Description card ─────────────────────────────────────────────────────────

function DescriptionCard({
  currentDescription,
  missingKeywords,
  improvedDescription,
}: {
  currentDescription: string
  missingKeywords: string[]
  improvedDescription: string
}) {
  const [text, setText] = useState(improvedDescription || currentDescription)
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
    <div className="rounded-2xl border flex flex-col" style={{ background: 'white', borderColor: 'var(--border)', flex: 1 }}>
      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📝</span>
          <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Description</p>
          {saved && (
            <span style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#16a34a',
              background: '#f0fdf4', padding: '2px 7px', borderRadius: 4,
            }}>✓ APPLIED</span>
          )}
        </div>
      </div>
      <div style={{ padding: '14px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {missingKeywords.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ink3)' }}>Missing keywords</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {missingKeywords.map(kw => (
                <span key={kw} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 6,
                  background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a',
                }}>
                  + {kw}
                </span>
              ))}
            </div>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ink3)' }}>
            {improvedDescription ? 'AI-improved description — edit before applying' : 'Your current description'}
          </p>
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setSaved(false) }}
            rows={6}
            className="w-full text-xs rounded-xl p-3 resize-none"
            style={{
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--ink)', outline: 'none', lineHeight: 1.6,
            }}
          />
        </div>
        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
        <button
          onClick={handleApply}
          disabled={saving || saved || !text.trim()}
          className="text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-40 self-end"
          style={{ background: saved ? '#16a34a' : 'var(--accent)', color: 'white' }}
        >
          {saving ? 'Applying…' : saved ? '✓ Applied to GBP' : 'Apply to GBP →'}
        </button>
      </div>
    </div>
  )
}

// ─── Services card ────────────────────────────────────────────────────────────

function ServicesCard({
  currentServices,
  suggestedServices,
}: {
  currentServices: string[]
  suggestedServices: { name: string; reason: string }[]
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter out services already on GBP
  const currentSet = new Set(currentServices.map(s => s.toLowerCase()))
  const newSuggestions = suggestedServices.filter(s => !currentSet.has(s.name.toLowerCase()))

  const selectedNames = newSuggestions.filter(s => checked[s.name]).map(s => s.name)

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
    <div className="rounded-2xl border flex flex-col" style={{ background: 'white', borderColor: 'var(--border)', flex: 1 }}>
      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🛠</span>
          <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Services</p>
          {saved && (
            <span style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#16a34a',
              background: '#f0fdf4', padding: '2px 7px', borderRadius: 4,
            }}>✓ APPLIED</span>
          )}
        </div>
      </div>
      <div style={{ padding: '14px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {currentServices.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ink3)' }}>Already on your GBP</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {currentServices.map(s => (
                <span key={s} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 6,
                  background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
                }}>✓ {s}</span>
              ))}
            </div>
          </div>
        )}

        {newSuggestions.length > 0 ? (
          <div style={{ flex: 1 }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ink3)' }}>
              Tick the ones you actually offer
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {newSuggestions.map(s => (
                <label key={s.name} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  cursor: 'pointer', padding: '6px 8px', borderRadius: 8,
                  background: checked[s.name] ? '#f0fdf4' : 'var(--surface)',
                  border: `1px solid ${checked[s.name] ? '#bbf7d0' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="checkbox"
                    checked={!!checked[s.name]}
                    onChange={e => {
                      setChecked(prev => ({ ...prev, [s.name]: e.target.checked }))
                      setSaved(false)
                    }}
                    style={{ marginTop: 1, accentColor: '#16a34a', flexShrink: 0 }}
                  />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: 'var(--ink4)' }}>{s.reason}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'var(--ink4)' }}>
            Your GBP services look complete — no gaps found vs competitors.
          </p>
        )}

        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

        {newSuggestions.length > 0 && (
          <button
            onClick={handleAdd}
            disabled={saving || saved || selectedNames.length === 0}
            className="text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-40 self-end"
            style={{ background: saved ? '#16a34a' : 'var(--accent)', color: 'white' }}
          >
            {saving ? 'Adding…' : saved ? '✓ Added to GBP' : `Add ${selectedNames.length > 0 ? selectedNames.length : ''} selected →`}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Coming Soon card ─────────────────────────────────────────────────────────

function ComingSoonCard({ title, icon, description }: { title: string; icon: string; description: string }) {
  return (
    <div className="rounded-2xl border flex flex-col" style={{
      background: 'white', borderColor: 'var(--border)', flex: 1, opacity: 0.7,
    }}>
      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{title}</p>
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: 'var(--ink4)',
            background: 'var(--border)', padding: '2px 7px', borderRadius: 4,
          }}>SOON</span>
        </div>
      </div>
      <div style={{ padding: '20px 18px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-xs text-center" style={{ color: 'var(--ink4)', lineHeight: 1.6 }}>{description}</p>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface InsightCardsProps {
  googleConnected: boolean
  industry: Industry
}

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

export function InsightCards({ googleConnected, industry }: InsightCardsProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!googleConnected) return
    setLoading(true)
    fetch('/api/growth/gbp-profile')
      .then(r => r.json())
      .then(data => { setProfile(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [googleConnected])

  const preview = getLockedPreview(industry)

  // Section header
  const header = (
    <div style={{ marginBottom: 16 }}>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink3)' }}>
        GBP Profile Analysis
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--ink4)' }}>
        {googleConnected
          ? 'AI-powered recommendations based on your actual GBP data and local competitors'
          : 'Connect Google Business Profile to get personalised optimisation recommendations'}
      </p>
    </div>
  )

  // Locked state
  if (!googleConnected) {
    return (
      <div>
        {header}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'stretch' }}>
          <LockedCard title="Description" icon="📝">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
              {preview.keywords.map(kw => (
                <span key={kw} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#fef9c3', color: '#854d0e' }}>
                  + {kw}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.6 }}>
              Welcome to our practice. We offer a range of dental services for the whole family. Our team is dedicated to your care.
            </p>
          </LockedCard>

          <LockedCard title="Services" icon="🛠">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {preview.services.map(s => (
                <div key={s} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <input type="checkbox" readOnly style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--ink)' }}>{s}</span>
                </div>
              ))}
            </div>
          </LockedCard>

          <LockedCard title="Attributes" icon="✅">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {['Accepts new patients', 'Online booking', 'Wheelchair accessible', 'Free parking', 'Credit cards accepted'].map(a => (
                <div key={a} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <input type="checkbox" readOnly style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--ink)' }}>{a}</span>
                </div>
              ))}
            </div>
          </LockedCard>

          <LockedCard title="Post frequency" icon="📅">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink3)' }}>
                <span>Top competitor</span><span style={{ fontWeight: 700 }}>3× / week</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink3)' }}>
                <span>You</span><span style={{ fontWeight: 700, color: '#ef4444' }}>0× / week</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--border)' }}>
                <div style={{ width: '10%', height: '100%', borderRadius: 3, background: '#ef4444' }} />
              </div>
            </div>
          </LockedCard>
        </div>
      </div>
    )
  }

  // Connected — loading state
  if (loading || !profile) {
    return (
      <div>
        {header}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {['📝', '🛠', '✅', '📅'].map(icon => (
            <div key={icon} className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)', height: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <div style={{ height: 12, borderRadius: 6, background: 'var(--border)', width: 80, animation: 'pulse 1.5s infinite' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[100, 75, 90, 60].map((w, i) => (
                  <div key={i} style={{ height: 10, borderRadius: 5, background: 'var(--border)', width: `${w}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Connected — error state
  if (profile.error) {
    return (
      <div>
        {header}
        <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: '#ef4444' }}>{profile.error}</p>
        </div>
      </div>
    )
  }

  // Connected — real data
  return (
    <div>
      {header}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'stretch' }}>
        <DescriptionCard
          currentDescription={profile.currentDescription ?? ''}
          missingKeywords={profile.analysis?.missingKeywords ?? []}
          improvedDescription={profile.analysis?.improvedDescription ?? ''}
        />
        <ServicesCard
          currentServices={profile.currentServices ?? []}
          suggestedServices={profile.analysis?.suggestedServices ?? []}
        />
        <ComingSoonCard
          title="Attributes"
          icon="✅"
          description="We're building attribute gap analysis — shows which business attributes competitors have that you're missing (e.g. Online booking, Free parking)."
        />
        <ComingSoonCard
          title="Post frequency"
          icon="📅"
          description="Track how often top competitors post on GBP vs you, with suggested post templates to close the gap."
        />
      </div>
    </div>
  )
}
