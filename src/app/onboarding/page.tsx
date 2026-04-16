'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { slugify } from '@/lib/utils'
import type { Industry } from '@/types'

// Popular industries shown as quick-pick tiles
const POPULAR_INDUSTRIES: { value: Industry; label: string; icon: string }[] = [
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'dental', label: 'Dental Clinic', icon: '🦷' },
  { value: 'salon', label: 'Hair Salon', icon: '✂️' },
  { value: 'gym', label: 'Gym / Fitness', icon: '💪' },
  { value: 'spa', label: 'Spa & Wellness', icon: '💆' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'bar', label: 'Bar / Pub', icon: '🍺' },
  { value: 'veterinary', label: 'Veterinary', icon: '🐾' },
]

// Full searchable list
const ALL_INDUSTRIES: { value: Industry; label: string; icon: string }[] = [
  // Dental & Oral
  { value: 'dental', label: 'Dental Clinic', icon: '🦷' },
  { value: 'orthodontist', label: 'Orthodontist', icon: '🦷' },
  { value: 'oral_surgeon', label: 'Oral Surgeon', icon: '🦷' },
  // Medical
  { value: 'gp', label: 'GP / Doctor', icon: '🩺' },
  { value: 'optician', label: 'Optician', icon: '👓' },
  { value: 'audiologist', label: 'Audiologist', icon: '👂' },
  { value: 'podiatrist', label: 'Podiatrist', icon: '🦶' },
  { value: 'paediatrician', label: 'Paediatrician', icon: '👶' },
  { value: 'sleep_clinic', label: 'Sleep Clinic', icon: '😴' },
  // Therapeutic
  { value: 'physiotherapy', label: 'Physiotherapy', icon: '🏃' },
  { value: 'chiropractor', label: 'Chiropractor', icon: '🦴' },
  { value: 'osteopath', label: 'Osteopath', icon: '🦴' },
  { value: 'sports_medicine', label: 'Sports Medicine', icon: '⚽' },
  // Mental Health
  { value: 'therapist', label: 'Therapist', icon: '🧠' },
  { value: 'psychologist', label: 'Psychologist', icon: '🧠' },
  { value: 'psychiatrist', label: 'Psychiatrist', icon: '🧠' },
  { value: 'counselling', label: 'Counselling', icon: '💬' },
  { value: 'fertility_clinic', label: 'Fertility Clinic', icon: '🌱' },
  // Cosmetic
  { value: 'cosmetic_clinic', label: 'Cosmetic Clinic', icon: '✨' },
  { value: 'aesthetics', label: 'Aesthetics', icon: '✨' },
  { value: 'dermatologist', label: 'Dermatologist', icon: '🧴' },
  { value: 'plastic_surgery', label: 'Plastic Surgery', icon: '✨' },
  { value: 'weight_loss_clinic', label: 'Weight Loss Clinic', icon: '⚖️' },
  // Hair
  { value: 'salon', label: 'Hair Salon', icon: '✂️' },
  { value: 'barbershop', label: 'Barbershop', icon: '💈' },
  { value: 'hair_extensions', label: 'Hair Extensions', icon: '✂️' },
  // Nails & Beauty
  { value: 'nail_salon', label: 'Nail Salon', icon: '💅' },
  { value: 'lash_brow', label: 'Lash & Brow', icon: '👁️' },
  { value: 'waxing', label: 'Waxing', icon: '🌸' },
  // Wellness
  { value: 'spa', label: 'Spa', icon: '💆' },
  { value: 'massage', label: 'Massage', icon: '💆' },
  { value: 'yoga', label: 'Yoga Studio', icon: '🧘' },
  { value: 'pilates', label: 'Pilates', icon: '🧘' },
  { value: 'meditation', label: 'Meditation', icon: '🧘' },
  { value: 'float_tank', label: 'Float Tank', icon: '💧' },
  // Fitness
  { value: 'gym', label: 'Gym', icon: '💪' },
  { value: 'personal_trainer', label: 'Personal Trainer', icon: '💪' },
  { value: 'crossfit', label: 'CrossFit', icon: '🏋️' },
  { value: 'boxing', label: 'Boxing', icon: '🥊' },
  { value: 'martial_arts', label: 'Martial Arts', icon: '🥋' },
  { value: 'cycling_studio', label: 'Cycling Studio', icon: '🚴' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' },
  // Tattoo
  { value: 'tattoo', label: 'Tattoo Studio', icon: '🎨' },
  { value: 'microblading', label: 'Microblading', icon: '✏️' },
  { value: 'permanent_makeup', label: 'Permanent Makeup', icon: '💄' },
  { value: 'piercing', label: 'Piercing', icon: '💎' },
  // Food & Drink
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'fine_dining', label: 'Fine Dining', icon: '🍷' },
  { value: 'casual_dining', label: 'Casual Dining', icon: '🍔' },
  { value: 'cafe', label: 'Cafe', icon: '☕' },
  { value: 'bakery', label: 'Bakery', icon: '🥐' },
  { value: 'dessert_shop', label: 'Dessert Shop', icon: '🍰' },
  { value: 'juice_bar', label: 'Juice Bar', icon: '🥤' },
  { value: 'bar', label: 'Bar', icon: '🍺' },
  { value: 'cocktail_bar', label: 'Cocktail Bar', icon: '🍸' },
  { value: 'pub', label: 'Pub', icon: '🍺' },
  { value: 'wine_bar', label: 'Wine Bar', icon: '🍷' },
  { value: 'nightclub', label: 'Nightclub', icon: '🎵' },
  // Hospitality
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'boutique_hotel', label: 'Boutique Hotel', icon: '🏨' },
  { value: 'bnb', label: 'B&B', icon: '🏡' },
  { value: 'vacation_rental', label: 'Vacation Rental', icon: '🏡' },
  { value: 'event_venue', label: 'Event Venue', icon: '🎉' },
  // Pets
  { value: 'veterinary', label: 'Veterinary', icon: '🐾' },
  { value: 'pet_grooming', label: 'Pet Grooming', icon: '🐶' },
  { value: 'pet_boarding', label: 'Pet Boarding', icon: '🐱' },
  { value: 'dog_training', label: 'Dog Training', icon: '🐕' },
  // Professional
  { value: 'lawyer', label: 'Law Firm', icon: '⚖️' },
  { value: 'accountant', label: 'Accountant', icon: '📊' },
  { value: 'financial_advisor', label: 'Financial Advisor', icon: '💰' },
  { value: 'mortgage_broker', label: 'Mortgage Broker', icon: '🏠' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
  // Automotive
  { value: 'mechanic', label: 'Mechanic', icon: '🔧' },
  { value: 'car_detailing', label: 'Car Detailing', icon: '🚗' },
  { value: 'tyre_shop', label: 'Tyre Shop', icon: '🛞' },
  { value: 'body_shop', label: 'Body Shop', icon: '🚗' },
  { value: 'car_dealership', label: 'Car Dealership', icon: '🚘' },
  // Education
  { value: 'tutoring', label: 'Tutoring', icon: '📚' },
  { value: 'language_school', label: 'Language School', icon: '🗣️' },
  { value: 'music_school', label: 'Music School', icon: '🎵' },
  { value: 'art_school', label: 'Art School', icon: '🎨' },
  { value: 'driving_school', label: 'Driving School', icon: '🚗' },
  { value: 'dance_studio', label: 'Dance Studio', icon: '💃' },
  // Events
  { value: 'photographer', label: 'Photographer', icon: '📸' },
  { value: 'florist', label: 'Florist', icon: '💐' },
  { value: 'catering', label: 'Catering', icon: '🍽️' },
  { value: 'wedding_planner', label: 'Wedding Planner', icon: '💒' },
  // Other
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
  const [step, setStep] = useState(() => searchParams.get('google_connected') === 'true' ? 4 : 1)
  const [businessName, setBusinessName] = useState('')

  const [industry, setIndustry] = useState<Industry | null>(null)
  const [industrySearch, setIndustrySearch] = useState('')
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

  async function handleConnectGoogle() {
    if (!industry) return
    // Save a stub business row so the OAuth callback can store tokens against it
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: existing } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
    const slug = slugify(businessName) + '-' + Math.random().toString(36).slice(2, 7)
    const cleanWebsite = websiteUrl.trim()
      ? (websiteUrl.trim().startsWith('http') ? websiteUrl.trim() : `https://${websiteUrl.trim()}`)
      : null

    if (!existing) {
      await supabase.from('businesses').insert({
        user_id: user.id,
        name: businessName,
        industry,
        brand_color: brandColor,
        website_url: cleanWebsite,
        slug,
      })
    }

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

    const cleanWebsite = websiteUrl.trim()
      ? (websiteUrl.trim().startsWith('http') ? websiteUrl.trim() : `https://${websiteUrl.trim()}`)
      : null

    const payload: Record<string, unknown> = {
      name: businessName,
      industry,
      website_url: cleanWebsite,
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

    // Kick off website brand extraction in the background (fire-and-forget)
    if (cleanWebsite && businessId) {
      fetch('/api/extract-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, websiteUrl: cleanWebsite }),
      }).catch(() => { /* non-critical */ })
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

          {/* Step 1, Business name */}
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

          {/* Step 2, Industry */}
          {step === 2 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>Step 2 of {TOTAL_STEPS}</p>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>What type of business?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--ink3)' }}>We&apos;ll personalise your content for your industry.</p>

              {/* Search */}
              <div className="relative mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink4)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search your business type..."
                  value={industrySearch}
                  onChange={e => setIndustrySearch(e.target.value)}
                  autoFocus
                  className="w-full py-3 rounded-xl text-sm"
                  style={{ paddingLeft: 40, paddingRight: 16, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
                />
              </div>

              {industrySearch.trim() ? (
                // Search results
                <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                  {ALL_INDUSTRIES.filter(ind =>
                    ind.label.toLowerCase().includes(industrySearch.toLowerCase())
                  ).map(ind => (
                    <button key={ind.value} onClick={() => { setIndustry(ind.value); setIndustrySearch('') }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 w-full"
                      style={{
                        borderColor: industry === ind.value ? 'var(--accent)' : 'var(--border)',
                        background: industry === ind.value ? 'var(--accent-bg)' : 'white',
                        color: 'var(--ink2)',
                      }}>
                      <span className="text-lg">{ind.icon}</span>
                      <span className="text-sm font-medium">{ind.label}</span>
                      {industry === ind.value && <span className="ml-auto text-xs font-semibold" style={{ color: 'var(--accent)' }}>Selected</span>}
                    </button>
                  ))}
                  {ALL_INDUSTRIES.filter(ind => ind.label.toLowerCase().includes(industrySearch.toLowerCase())).length === 0 && (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--ink4)' }}>No match. Try a different term or pick &quot;Other&quot;.</p>
                  )}
                </div>
              ) : (
                // Quick-pick tiles
                <div>
                  <p className="text-xs font-medium mb-2.5" style={{ color: 'var(--ink4)' }}>Popular</p>
                  <div className="grid grid-cols-2 gap-2">
                    {POPULAR_INDUSTRIES.map(ind => (
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
                  <p className="text-xs mt-3" style={{ color: 'var(--ink4)' }}>
                    Don&apos;t see yours? Type above to search 90+ business types.
                  </p>
                </div>
              )}

              {/* Selected state when not searching */}
              {industry && !industrySearch && !POPULAR_INDUSTRIES.find(i => i.value === industry) && (
                <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border" style={{ borderColor: 'var(--accent)', background: 'var(--accent-bg)' }}>
                  <span>{ALL_INDUSTRIES.find(i => i.value === industry)?.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--ink2)' }}>{ALL_INDUSTRIES.find(i => i.value === industry)?.label}</span>
                  <button onClick={() => setIndustry(null)} className="ml-auto text-xs" style={{ color: 'var(--ink4)', background: 'none', border: 'none', cursor: 'pointer' }}>Change</button>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button size="lg" className="flex-1" disabled={!industry} onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {/* Step 3, Brand identity */}
          {step === 3 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>Step 3 of {TOTAL_STEPS}</p>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Your brand identity</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--ink3)' }}>
                Upload your logo so we can use your exact brand colors, fonts, and style in every Social Clip we create for you.
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
                      <p className="text-xs mt-1" style={{ color: 'var(--ink4)' }}>PNG, JPG or SVG, we&apos;ll extract your brand color automatically</p>
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

              {/* Website URL */}
              <div className="mt-5">
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--ink2)' }}>
                  Website <span style={{ color: 'var(--ink4)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  placeholder="e.g. harmonia-dental.com"
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
                />
                <p className="text-xs mt-1.5" style={{ color: 'var(--ink4)' }}>
                  Buzzloop reads your website so Buzzloop knows exactly what you offer, making Social Clips and keyword suggestions far more accurate.
                </p>
              </div>

              <div className="flex gap-3 mt-7">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)}>← Back</Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(4)}>Continue →</Button>
              </div>
              <p className="text-xs text-center mt-3">
                <button onClick={() => setStep(4)} style={{ color: 'var(--ink4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Skip for now
                </button>
              </p>
            </div>
          )}

          {/* Step 4, Connect accounts */}
          {step === 4 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink3)' }}>Step 4 of {TOTAL_STEPS}</p>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--ink)' }}>One last step, connect Google</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--ink3)' }}>
                We need this to get you more reviews and turn your best ones into Social Clips that bring in new customers.
              </p>

              <div className="flex flex-col gap-4">
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
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink4)', flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <p className="text-xs" style={{ color: 'var(--ink4)' }}>
                        We can only read your reviews, we cannot post or change anything on your behalf
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mt-4">{error}</div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(3)}>← Back</Button>
                <Button size="lg" className="flex-1" loading={loading} onClick={handleFinish}>
                  Go to my dashboard →
                </Button>
              </div>

              {!googleConnected && (
                <p className="text-xs text-center mt-3" style={{ color: 'var(--ink4)' }}>
                  You can connect Google from your dashboard anytime
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
