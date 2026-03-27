'use client'

import { useState } from 'react'

interface Props {
  reviewUrl: string
  businessName: string
  brandColor: string
}

type TemplateId = 'counter' | 'tent' | 'receipt'

const TEMPLATES: { id: TemplateId; label: string; size: string; ideal: string }[] = [
  { id: 'counter',  label: 'Counter Card',   size: 'A6 landscape', ideal: 'Counter, reception desk, bar top' },
  { id: 'tent',     label: 'Table Tent',      size: 'A5 portrait',  ideal: 'Restaurant tables, waiting rooms' },
  { id: 'receipt',  label: 'Receipt Strip',   size: '100mm × 30mm', ideal: 'Printed receipts, invoice footer' },
]

async function getQRDataUrl(url: string, color: string, size: number): Promise<string> {
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:-9999px'
  document.body.appendChild(container)
  try {
    const QRCodeStyling = (await import('qr-code-styling')).default
    const qr = new QRCodeStyling({
      width: size, height: size, type: 'canvas', data: url,
      dotsOptions: { color, type: 'rounded' },
      cornersSquareOptions: { color, type: 'extra-rounded' },
      cornersDotOptions: { color },
      backgroundOptions: { color: '#ffffff' },
    })
    qr.append(container)
    await new Promise(r => setTimeout(r, 200))
    const canvas = container.querySelector('canvas') as HTMLCanvasElement
    return canvas?.toDataURL('image/png') ?? ''
  } finally {
    document.body.removeChild(container)
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function lighten(hex: string, amount = 0.92) {
  const { r, g, b } = hexToRgb(hex)
  return `rgb(${Math.round(r + (255 - r) * amount)}, ${Math.round(g + (255 - g) * amount)}, ${Math.round(b + (255 - b) * amount)})`
}

function stars(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color
  ctx.font = `${size}px serif`
  ctx.textAlign = 'left'
  ctx.fillText('★★★★★', x, y)
}

async function downloadCounterCard(businessName: string, brandColor: string, reviewUrl: string) {
  const W = 1200, H = 750
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Brand color left panel
  ctx.fillStyle = brandColor
  ctx.fillRect(0, 0, 420, H)

  // Subtle top strip on right
  ctx.fillStyle = lighten(brandColor, 0.94)
  ctx.fillRect(420, 0, W - 420, 8)

  // Left panel text
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = 'bold 13px system-ui'
  ctx.textAlign = 'left'
  ctx.letterSpacing = '4px'
  ctx.fillText('HOW WAS YOUR VISIT?', 54, 108)

  ctx.letterSpacing = '0px'
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 52px Georgia, serif'
  const nameLines = wrapText(ctx, businessName, 54, 180, 310, 62)
  let nameY = 180
  for (const line of nameLines) {
    ctx.fillText(line, 54, nameY)
    nameY += 62
  }

  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '22px system-ui'
  const tagY = Math.max(nameY + 28, 340)
  ctx.fillText('Scan to leave a Google review', 54, tagY)
  ctx.fillText("It takes less than 10 seconds.", 54, tagY + 34)

  // Stars
  stars(ctx, 54, tagY + 100, 30, 'rgba(255,255,255,0.9)')

  // ReviewSpark badge bottom left
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '13px system-ui'
  ctx.fillText('Powered by ReviewSpark', 54, H - 36)

  // QR code
  const qrSize = 380
  const qrDataUrl = await getQRDataUrl(reviewUrl, brandColor, qrSize)
  const qrImg = await loadImage(qrDataUrl)

  // QR white card
  const qrX = 490, qrY = (H - qrSize - 60) / 2
  roundRect(ctx, qrX - 24, qrY - 24, qrSize + 48, qrSize + 48 + 40, 20, '#f9f9f9')
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

  ctx.fillStyle = '#888'
  ctx.font = '16px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText('Scan with your phone camera', qrX + qrSize / 2, qrY + qrSize + 32)

  triggerDownload(canvas, `${businessName}-counter-card`)
}

async function downloadTableTent(businessName: string, brandColor: string, reviewUrl: string) {
  const W = 800, H = 1120
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Top brand strip
  ctx.fillStyle = brandColor
  ctx.fillRect(0, 0, W, 72)

  // Bottom brand strip
  ctx.fillStyle = brandColor
  ctx.fillRect(0, H - 52, W, 52)

  // Header text in strip
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = 'bold 15px system-ui'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '3px'
  ctx.fillText('HOW WAS YOUR VISIT?', W / 2, 44)
  ctx.letterSpacing = '0px'

  // Business name
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 58px Georgia, serif'
  ctx.textAlign = 'center'
  const nameLines2 = wrapText(ctx, businessName, 0, 0, W - 80, 66)
  let nameY2 = 158
  for (const line of nameLines2) {
    ctx.fillText(line, W / 2, nameY2)
    nameY2 += 66
  }

  // Subtitle
  ctx.fillStyle = '#666'
  ctx.font = '22px system-ui'
  ctx.fillText('Leave us a quick Google review', W / 2, nameY2 + 10)

  // QR code
  const qrSize = 460
  const qrY = nameY2 + 60
  const qrDataUrl = await getQRDataUrl(reviewUrl, brandColor, qrSize)
  const qrImg = await loadImage(qrDataUrl)

  roundRect(ctx, (W - qrSize) / 2 - 20, qrY - 20, qrSize + 40, qrSize + 40, 20, lighten(brandColor, 0.95))
  ctx.drawImage(qrImg, (W - qrSize) / 2, qrY, qrSize, qrSize)

  // Stars below QR
  ctx.font = '34px serif'
  ctx.fillStyle = '#f59e0b'
  ctx.textAlign = 'center'
  ctx.fillText('★★★★★', W / 2, qrY + qrSize + 70)

  ctx.fillStyle = '#999'
  ctx.font = '18px system-ui'
  ctx.fillText('Scan with your phone camera · takes under 10 seconds', W / 2, qrY + qrSize + 108)

  // Footer strip text
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = '14px system-ui'
  ctx.fillText('Powered by ReviewSpark', W / 2, H - 20)

  triggerDownload(canvas, `${businessName}-table-tent`)
}

async function downloadReceiptStrip(businessName: string, brandColor: string, reviewUrl: string) {
  const W = 1050, H = 300
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Left brand bar
  ctx.fillStyle = brandColor
  ctx.fillRect(0, 0, 10, H)

  // Dashed divider
  ctx.setLineDash([6, 4])
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(W, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, H)
  ctx.lineTo(W, H)
  ctx.stroke()
  ctx.setLineDash([])

  // QR code
  const qrSize = 220
  const qrDataUrl = await getQRDataUrl(reviewUrl, brandColor, qrSize)
  const qrImg = await loadImage(qrDataUrl)
  const qrY = (H - qrSize) / 2
  ctx.drawImage(qrImg, 34, qrY, qrSize, qrSize)

  // Vertical separator
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 3])
  ctx.beginPath()
  ctx.moveTo(280, 24)
  ctx.lineTo(280, H - 24)
  ctx.stroke()
  ctx.setLineDash([])

  // Text section
  const textX = 316
  ctx.fillStyle = '#666'
  ctx.font = '15px system-ui'
  ctx.textAlign = 'left'
  ctx.fillText('Enjoyed your visit at', textX, 80)

  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 32px Georgia, serif'
  const stripped = wrapText(ctx, businessName, textX, 0, 680, 38)
  let sy = 120
  for (const line of stripped) { ctx.fillText(line, textX, sy); sy += 38 }

  ctx.fillStyle = '#444'
  ctx.font = '20px system-ui'
  ctx.fillText('Leave us a quick Google review — it helps a lot!', textX, sy + 14)

  ctx.font = '26px serif'
  ctx.fillStyle = '#f59e0b'
  ctx.fillText('★★★★★', textX, sy + 54)

  ctx.fillStyle = '#bbb'
  ctx.font = '13px system-ui'
  ctx.fillText('Scan QR →     Powered by ReviewSpark', textX, H - 22)

  triggerDownload(canvas, `${businessName}-receipt-strip`)
}

// ── Helpers ────────────────────────────────────────────────────

function wrapText(ctx: CanvasRenderingContext2D, text: string, _x: number, _y: number, maxWidth: number, _lineH: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  ctx.fill()
}

function triggerDownload(canvas: HTMLCanvasElement, filename: string) {
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `${filename}.png`
  a.click()
}

// ── Component ──────────────────────────────────────────────────

export function PrintTemplates({ reviewUrl, businessName, brandColor }: Props) {
  const [active, setActive] = useState<TemplateId>('counter')
  const [downloading, setDownloading] = useState<TemplateId | null>(null)

  async function handleDownload(id: TemplateId) {
    setDownloading(id)
    try {
      if (id === 'counter')  await downloadCounterCard(businessName, brandColor, reviewUrl)
      if (id === 'tent')     await downloadTableTent(businessName, brandColor, reviewUrl)
      if (id === 'receipt')  await downloadReceiptStrip(businessName, brandColor, reviewUrl)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold" style={{ color: 'var(--ink)' }}>Print templates</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink3)' }}>Ready-to-print cards — take the PNG to any print shop</p>
        </div>
      </div>

      {/* Template selector */}
      <div className="flex gap-2 mb-5">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="flex-1 text-left px-3 py-3 rounded-xl border transition-all"
            style={{
              borderColor: active === t.id ? brandColor : 'var(--border)',
              background: active === t.id ? `${brandColor}10` : 'var(--bg)',
            }}
          >
            <p className="text-xs font-bold mb-0.5" style={{ color: active === t.id ? brandColor : 'var(--ink)' }}>
              {t.label}
            </p>
            <p className="text-xs" style={{ color: 'var(--ink4)' }}>{t.size}</p>
          </button>
        ))}
      </div>

      {/* Preview */}
      {active === 'counter' && (
        <CounterCardPreview businessName={businessName} brandColor={brandColor} />
      )}
      {active === 'tent' && (
        <TableTentPreview businessName={businessName} brandColor={brandColor} />
      )}
      {active === 'receipt' && (
        <ReceiptStripPreview businessName={businessName} brandColor={brandColor} />
      )}

      {/* Ideal use */}
      <p className="text-xs mt-3 mb-4" style={{ color: 'var(--ink4)' }}>
        <span className="font-semibold" style={{ color: 'var(--ink3)' }}>Best for:</span>{' '}
        {TEMPLATES.find(t => t.id === active)?.ideal}
      </p>

      <button
        onClick={() => handleDownload(active)}
        disabled={!!downloading}
        className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: brandColor, color: 'white' }}
      >
        {downloading === active ? 'Generating…' : 'Download PNG ↓'}
      </button>
    </div>
  )
}

// ── CSS Previews ───────────────────────────────────────────────

function QRPlaceholder({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, background: 'white', padding: 4, borderRadius: 4, flexShrink: 0 }}>
      <div style={{ width: '100%', height: '100%', background: `repeating-linear-gradient(45deg, ${color}22 0px, ${color}22 2px, transparent 2px, transparent 8px), repeating-linear-gradient(-45deg, ${color}22 0px, ${color}22 2px, transparent 2px, transparent 8px)`, borderRadius: 2, border: `2px solid ${color}` }} />
    </div>
  )
}

function CounterCardPreview({ businessName, brandColor }: { businessName: string; brandColor: string }) {
  return (
    <div className="rounded-xl overflow-hidden flex" style={{ height: 140, border: '1px solid var(--border)' }}>
      <div className="flex flex-col justify-center px-5 gap-1.5" style={{ background: brandColor, width: 160, flexShrink: 0 }}>
        <p className="text-white font-bold text-xs opacity-60 uppercase tracking-wider" style={{ fontSize: 8 }}>HOW WAS YOUR VISIT?</p>
        <p className="text-white font-bold leading-tight" style={{ fontSize: 13, fontFamily: 'Georgia, serif' }}>
          {businessName.length > 18 ? businessName.slice(0, 18) + '…' : businessName}
        </p>
        <p className="text-white opacity-80" style={{ fontSize: 9 }}>Scan to leave a Google review</p>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10 }}>★★★★★</p>
      </div>
      <div className="flex-1 flex items-center justify-center" style={{ background: 'white' }}>
        <div className="flex flex-col items-center gap-2">
          <QRPlaceholder color={brandColor} size={80} />
          <p style={{ fontSize: 8, color: '#999' }}>Scan with phone camera</p>
        </div>
      </div>
    </div>
  )
}

function TableTentPreview({ businessName, brandColor }: { businessName: string; brandColor: string }) {
  return (
    <div className="rounded-xl overflow-hidden flex flex-col items-center" style={{ height: 180, border: '1px solid var(--border)', background: 'white' }}>
      <div className="w-full flex items-center justify-center" style={{ background: brandColor, height: 22 }}>
        <p className="text-white font-bold uppercase tracking-widest" style={{ fontSize: 7 }}>HOW WAS YOUR VISIT?</p>
      </div>
      <div className="flex-1 flex items-center gap-4 px-5">
        <div className="flex flex-col gap-1">
          <p className="font-bold" style={{ fontSize: 13, fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
            {businessName.length > 20 ? businessName.slice(0, 20) + '…' : businessName}
          </p>
          <p style={{ fontSize: 8, color: '#666' }}>Leave us a quick Google review</p>
          <p style={{ fontSize: 12, color: '#f59e0b' }}>★★★★★</p>
          <p style={{ fontSize: 7, color: '#999' }}>Scan the QR code with your phone</p>
        </div>
        <QRPlaceholder color={brandColor} size={72} />
      </div>
      <div className="w-full flex items-center justify-center" style={{ background: brandColor, height: 14 }} />
    </div>
  )
}

function ReceiptStripPreview({ businessName, brandColor }: { businessName: string; brandColor: string }) {
  return (
    <div className="rounded-xl overflow-hidden flex items-center gap-3 px-4" style={{ height: 80, border: '1px solid var(--border)', background: 'white', borderLeft: `4px solid ${brandColor}` }}>
      <QRPlaceholder color={brandColor} size={52} />
      <div style={{ width: 1, height: 48, background: '#e5e7eb', flexShrink: 0 }} />
      <div className="flex flex-col gap-0.5">
        <p style={{ fontSize: 9, color: '#666' }}>Enjoyed your visit at</p>
        <p className="font-bold" style={{ fontSize: 12, fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
          {businessName.length > 24 ? businessName.slice(0, 24) + '…' : businessName}
        </p>
        <p style={{ fontSize: 9, color: '#444' }}>Leave us a Google review — it helps a lot!</p>
        <p style={{ fontSize: 11, color: '#f59e0b' }}>★★★★★</p>
      </div>
    </div>
  )
}
