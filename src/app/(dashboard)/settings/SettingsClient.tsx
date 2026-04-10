'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Business } from '@/types'

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

export function SettingsClient({ business }: { business: Business }) {
  const [businessName, setBusinessName] = useState(business.name)
  const [city, setCity] = useState(business.city ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(business.website_url ?? '')
  const [googleUrl, setGoogleUrl] = useState(business.google_business_url ?? '')
  const [brandColor, setBrandColor] = useState(business.brand_color ?? '#6366f1')
  const [logoPreview, setLogoPreview] = useState<string | null>(business.brand_logo_url ?? null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [colorExtracted, setColorExtracted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [staffMembers, setStaffMembers] = useState<string[]>(business.staff_members ?? [])
  const [staffInput, setStaffInput] = useState('')

  function addStaff() {
    const name = staffInput.trim()
    if (!name || staffMembers.includes(name)) { setStaffInput(''); return }
    setStaffMembers(prev => [...prev, name])
    setStaffInput('')
  }

  function removeStaff(name: string) {
    setStaffMembers(prev => prev.filter(s => s !== name))
  }

  async function handleLogoFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    const color = await extractColorFromImage(file)
    setBrandColor(color)
    setColorExtracted(true)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleLogoFile(file)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    const supabase = createClient()

    let logoUrl = business.brand_logo_url ?? null

    if (logoFile) {
      const form = new FormData()
      form.append('file', logoFile)
      form.append('businessId', business.id)
      const res = await fetch('/api/upload-logo', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) {
        setError('Logo upload failed: ' + json.error)
        setSaving(false)
        return
      }
      logoUrl = json.publicUrl
    }

    const { error: updateErr } = await supabase.from('businesses').update({
      name: businessName,
      city: city.trim() || null,
      website_url: websiteUrl || null,
      google_business_url: googleUrl || null,
      brand_color: brandColor,
      brand_logo_url: logoUrl,
      brand_extracted: true,
      staff_members: staffMembers,
    }).eq('id', business.id)

    setSaving(false)
    if (updateErr) { setError(updateErr.message); return }

    // If website URL changed or was newly added, re-run brand extraction
    const cleanUrl = websiteUrl.trim()
      ? (websiteUrl.trim().startsWith('http') ? websiteUrl.trim() : `https://${websiteUrl.trim()}`)
      : null
    if (cleanUrl && cleanUrl !== business.website_url) {
      fetch('/api/extract-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, websiteUrl: cleanUrl }),
      }).catch(() => { /* non-critical */ })
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-[600px] mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Settings</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ink3)' }}>Manage your brand identity and account details.</p>

      {/* Brand Identity */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>✦</div>
          <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>Brand Identity</h2>
        </div>
        <p className="text-sm mb-5 p-4 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--ink2)', borderLeft: '3px solid var(--accent)' }}>
          Your logo and brand colour are used in every Reel and social post we create. Upload your logo once and all future content will match your exact branding, no generic templates.
        </p>

        {/* Logo upload */}
        <div className="mb-5">
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--ink2)' }}>Logo</label>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 hover:border-[var(--accent)] flex items-center gap-4 px-5 py-4"
            style={{ borderColor: logoPreview ? 'var(--accent)' : 'var(--border)', background: logoPreview ? 'var(--accent-bg)' : 'var(--bg)' }}
          >
            {logoPreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPreview} alt="Logo" className="w-14 h-14 object-contain rounded-lg" style={{ background: 'white' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink2)' }}>
                    {logoFile ? logoFile.name : 'Current logo'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink4)' }}>Click to replace</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center w-full py-2 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: 'var(--border)' }}>
                  <span className="text-xl">🖼️</span>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--ink2)' }}>Drop your logo here, or click to browse</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink4)' }}>PNG, JPG or SVG · We&apos;ll extract your brand colour automatically</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }} />
          </div>
        </div>

        {/* Brand color */}
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--ink2)' }}>
            Brand colour
            {colorExtracted && (
              <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
                ✓ auto-detected from logo
              </span>
            )}
          </label>
          <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'white' }}>
            <input type="color" value={brandColor}
              onChange={e => { setBrandColor(e.target.value); setColorExtracted(false) }}
              className="w-12 h-12 rounded-lg border cursor-pointer"
              style={{ borderColor: 'var(--border)', padding: '2px' }} />
            <div>
              <p className="text-sm font-bold font-mono" style={{ color: 'var(--ink)' }}>{brandColor}</p>
              <p className="text-xs" style={{ color: 'var(--ink4)' }}>Click to change manually</p>
            </div>
            <div className="ml-auto flex gap-2">
              <div className="w-8 h-8 rounded-lg" style={{ background: brandColor }} />
              <div className="w-8 h-8 rounded-lg" style={{ background: brandColor + '44' }} />
              <div className="w-8 h-8 rounded-lg border" style={{ background: 'white', borderColor: brandColor }}>
                <span className="text-xs font-bold flex h-full items-center justify-center" style={{ color: brandColor }}>Aa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Info */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>🏢</div>
          <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>Business Info</h2>
        </div>
        <div className="flex flex-col gap-4">
          <Input id="settings-name" label="Business name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
          <div>
            <Input id="settings-city" label="City" placeholder="e.g. London"
              value={city} onChange={e => setCity(e.target.value)} />
            <p className="text-xs mt-1.5" style={{ color: 'var(--ink4)' }}>Used to generate location-specific hashtags for your posts</p>
          </div>
          <div>
            <Input id="settings-website" label="Website URL" type="url" placeholder="https://yourwebsite.com"
              value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />
            <p className="text-xs mt-1.5" style={{ color: 'var(--ink4)' }}>Used to personalise your AI-generated content</p>
          </div>
          <div>
            <Input id="settings-google" label="Google Business Profile URL" type="url" placeholder="https://g.page/r/..."
              value={googleUrl} onChange={e => setGoogleUrl(e.target.value)} />
            <p className="text-xs mt-1.5" style={{ color: 'var(--ink4)' }}>Where your QR code sends customers to leave a review</p>
          </div>
        </div>
      </section>

      {/* Your Team */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>👥</div>
          <h2 className="text-base font-bold" style={{ color: 'var(--ink)' }}>Your Team</h2>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--ink3)' }}>
          Add your team members&apos; names so customers can tap to credit them in their review. Keeps the flow quick, no typing.
        </p>

        {/* Existing staff chips */}
        {staffMembers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {staffMembers.map(name => (
              <div
                key={name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent)20' }}
              >
                {name}
                <button
                  onClick={() => removeStaff(name)}
                  className="ml-0.5 text-xs opacity-60 hover:opacity-100 transition-opacity leading-none"
                  style={{ color: 'var(--accent)' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new staff */}
        <div className="flex gap-2">
          <input
            type="text"
            value={staffInput}
            onChange={e => setStaffInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStaff() } }}
            placeholder="Add team member name..."
            className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'white' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            onClick={addStaff}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Add
          </button>
        </div>
        {staffMembers.length === 0 && (
          <p className="text-xs mt-2" style={{ color: 'var(--ink4)' }}>No team members added yet</p>
        )}
      </section>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      <Button size="lg" className="w-full" loading={saving} onClick={handleSave}>
        {saved ? '✓ Saved!' : 'Save changes'}
      </Button>
    </div>
  )
}
