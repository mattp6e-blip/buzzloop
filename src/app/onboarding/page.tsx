'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { slugify } from '@/lib/utils'
import type { Industry } from '@/types'

const INDUSTRIES: { value: Industry; label: string; icon: string }[] = [
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'gym', label: 'Gym / Fitness', icon: '💪' },
  { value: 'salon', label: 'Hair Salon', icon: '✂️' },
  { value: 'dental', label: 'Dental Clinic', icon: '🦷' },
  { value: 'clinic', label: 'Medical Clinic', icon: '🏥' },
  { value: 'spa', label: 'Spa / Beauty', icon: '💆' },
  { value: 'retail', label: 'Retail Shop', icon: '🛍️' },
  { value: 'other', label: 'Other', icon: '🏢' },
]

const TOTAL_STEPS = 4

async function extractColorFromImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, 64, 64)
      const data = ctx.getImageData(0, 0, 64, 64).data
      const colorMap = new Map<string, number>()
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
        if (a < 128) continue
        const brightness = (r + g + b) / 3
        if (brightness > 230 || brightness < 20) continue
        // Quantize to reduce noise
        const rq = Math.round(r / 16) * 16
        const gq = Math.round(g / 16) * 16
        const bq = Math.round(b / 16) * 16
        const hex = '#' + [rq, gq, bq].map(v => v.toString(16).padStart(2, '0')).join('')
        colorMap.set(hex, (colorMap.get(hex) ?? 0) + 1)
      }
      const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1])
      URL.revokeObjectURL(objectUrl)
      resolve(sorted[0]?.[0] ?? '#6366f1')
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve('#6366f1') }
    img.src = objectUrl
  })
}

function OnboardingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState<Industry | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [colorExtracted, setColorExtracted] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [googleConnected, setGoogleConnected] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchParams.get('google_connected') === 'true') setGoogleConnected(true)
  }, [searchParams])

  async function handleLogoFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setLogoFile(file)
    const preview = URL.createObjectURL(file)
    setLogoPreview(preview)
    const color = await extractColorFromImage(file)
    setBrandColor(color)
    setColorExtracted(true)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleLogoFile(file)
  }

  function handleConnectGoogle() {
    window.location.href = '/api/auth/google?returnTo=/onboarding'
  }

  async function handleFinish() {
    if (!industry) return
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const slug = slugify(businessName) + '-' + Math.random().toString(36).slice(2, 7)

    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const payload: Record<string, unknown> = {
      name: businessName,
      industry,
      website_url: websiteUrl || null,
      brand_color: brandColor,
      slug,
    }

    let businessId: string | null = null

    if (existing) {
      await supabase.from('businesses').update(payload).eq('user_id', user.id)
      businessId = existing.id
    } else {
      const { data } = await supabase.from('businesses').insert({ ...payload, user_id: user.id }).select('id').single()
      businessId = data?.id ?? null
    }

    // Upload logo to Supabase Storage
    if (logoFile && businessId) {
      await supabase.storage.createBucket('logos', { public: true })
      const ext = logoFile.name.split('.').pop() ?? 'png'
      const path = `${businessId}/logo.${ext}`
      const { error: uploadErr } = await supabase.storage.from('logos').upload(path, logoFile, { upsert: true })
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
        await supabase.from('businesses').update({
          brand_logo_url: publicUrl,
          brand_extracted: true,
        }).eq('id', businessId)
      }
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: 'var(--accent)' }}>⚡</div>
            <span className="font-bold text-lg" style={{ color: 'var(--ink)' }}>Buzzloop</span>
          </Link>
          <button
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              await createClient().auth.signOut()
              window.location.href = '/login'
            }}
            className="text-xs hover:underline"
            style={{ color: 'var(--ink4)' }}
          >
            Sign out
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
            <div key={s} className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: s <= step ? 'var(--accent)' : 'var(--border)' }} />
          ))}
        </div>

        <div className="bg-white rounded-2xl border p-8" style={{ borderColor: 'var(--border)', boxShadow: '0 4px 24px rgba(26,24,20,0.06)' }}>

          {/* Step 1 — Business name */}
          {step === 1 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>Step 1 of {TOTAL_STEPS}</p>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>What&apos;s your business called?</h2>
              <p className="text-sm mb-7" style={{ color: 'var(--ink3)' }}>This is how it&apos;ll appear to your customers.</p>
              <Input id="name" label="Business name" placeholder="e.g. Harmonia Dental"
                value={businessName} onChange={e => setBusinessName(e.target.value)} autoFocus />
              <Button className="w-full mt-6" size="lg" disabled={!businessName.trim()} onClick={() => setStep(2)}>
                Continue →
              </Button>
            </div>
          )}

          {/* Step 2 — Industry */}
          {step === 2 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>Step 2 of {TOTAL_STEPS}</p>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>What type of business?</h2>
              <p className="text-sm mb-7" style={{ color: 'var(--ink3)' }}>We&apos;ll personalise your content for your industry.</p>
              <div className="grid grid-cols-2 gap-2.5">
                {INDUSTRIES.map(ind => (
                  <button key={ind.value} onClick={() => setIndustry(ind.value)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150"
                    style={{
                      borderColor: industry === ind.value ? 'var(--accent)' : 'var(--border)',
                      background: industry === ind.value ? 'var(--accent-bg)' : 'white',
                      color: 'var(--ink2)',
                    }}>
                    <span className="text-xl">{ind.icon}</span>
                    <span className="text-sm font-medium">{ind.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
                <Button size="lg" className="flex-1" disabled={!industry} onClick={() => setStep(3)}>Continue →</Button>
              </div>
            </div>
          )}

          {/* Step 3 — Brand identity */}
          {step === 3 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>Step 3 of {TOTAL_STEPS}</p>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Your brand identity</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--ink3)' }}>
                Upload your logo and we&apos;ll use your exact brand colors, fonts, and style in every Reel and social post we create for you. No generic templates.
              </p>

              {/* Logo upload */}
              <div className="mb-5">
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--ink2)' }}>Logo</label>
                <div
                  ref={dropRef}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 hover:border-[var(--accent)] flex items-center gap-4 px-5 py-4"
                  style={{ borderColor: logoPreview ? 'var(--accent)' : 'var(--border)', background: logoPreview ? 'var(--accent-bg)' : 'var(--bg)' }}
                >
                  {logoPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Logo preview" className="w-14 h-14 object-contain rounded-lg" style={{ background: 'white' }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--ink2)' }}>{logoFile?.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--ink4)' }}>Click to change</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center w-full py-2 text-center">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: 'var(--border)' }}>
                        <span className="text-xl">🖼️</span>
                      </div>
                      <p className="text-sm font-medium" style={{ color: 'var(--ink2)' }}>Drop your logo here, or click to browse</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--ink4)' }}>PNG, JPG or SVG — we&apos;ll extract your brand color automatically</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }} />
                </div>
              </div>

              {/* Brand color */}
              <div className="mb-1">
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--ink2)' }}>
                  Brand colour
                  {colorExtracted && (
                    <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
                      ✓ auto-detected from logo
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input type="color" value={brandColor} onChange={e => { setBrandColor(e.target.value); setColorExtracted(false) }}
                      className="w-12 h-12 rounded-xl border cursor-pointer"
                      style={{ borderColor: 'var(--border)', padding: '2px' }} />
                  </div>
                  <div>
                    <p className="text-sm font-mono font-semibold" style={{ color: 'var(--ink)' }}>{brandColor}</p>
                    <p className="text-xs" style={{ color: 'var(--ink4)' }}>Click to change manually</p>
                  </div>
                  {/* Live preview swatch */}
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg" style={{ background: brandColor }} />
                    <div className="w-8 h-8 rounded-lg" style={{ background: brandColor + '33' }} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-7">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)}>← Back</Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(4)}>Continue →</Button>
              </div>
            </div>
          )}

          {/* Step 4 — Connect accounts */}
          {step === 4 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>Step 4 of {TOTAL_STEPS}</p>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Connect your Google Business Profile to unlock all features</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--ink3)' }}>
                We&apos;ll sync your reviews, turn them into Instagram Reels and drive more customer reviews.
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <Input id="website" label="Your website URL" placeholder="https://yourwebsite.com"
                    value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} type="url" />
                  <p className="text-xs mt-1.5" style={{ color: 'var(--ink4)' }}>
                    Helps the AI understand your tone and services
                  </p>
                </div>

                {googleConnected ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                    style={{ background: 'var(--green-bg)', borderColor: 'var(--green-border)' }}>
                    <span style={{ color: 'var(--green)' }}>✓</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--green)' }}>Google Business connected</p>
                      <p className="text-xs" style={{ color: 'var(--green)' }}>Reviews will import automatically</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button onClick={handleConnectGoogle}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border font-semibold text-sm transition-all hover:bg-gray-50"
                      style={{ borderColor: 'var(--border2)', color: 'var(--ink2)', background: 'white' }}>
                      <GoogleIcon />
                      Connect Google Business Profile
                    </button>
                    <p className="text-xs mt-1.5 text-center" style={{ color: 'var(--ink4)' }}>
                      Read-only access — we never post or change anything on your behalf
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mt-4">{error}</div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(3)}>← Back</Button>
                <Button size="lg" className="flex-1" loading={loading} disabled={!googleConnected} onClick={handleFinish}>
                  Launch my account 🚀
                </Button>
              </div>

              {!googleConnected && (
                <p className="text-xs text-center mt-3" style={{ color: 'var(--ink4)' }}>
                  Connect Google Business above to continue
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  )
}

export default function OnboardingPage() {
  return <Suspense><OnboardingInner /></Suspense>
}
