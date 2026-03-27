'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface QRDisplayProps {
  reviewUrl: string
  businessName: string
  brandColor: string
  slug: string
}

export function QRDisplay({ reviewUrl, businessName, brandColor }: QRDisplayProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [qrInstance, setQrInstance] = useState<unknown>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let mounted = true

    async function buildQR() {
      const QRCodeStyling = (await import('qr-code-styling')).default

      const qr = new QRCodeStyling({
        width: 280,
        height: 280,
        type: 'canvas',
        data: reviewUrl,
        dotsOptions: {
          color: brandColor,
          type: 'rounded',
        },
        cornersSquareOptions: {
          color: brandColor,
          type: 'extra-rounded',
        },
        cornersDotOptions: {
          color: brandColor,
        },
        backgroundOptions: {
          color: '#ffffff',
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 6,
        },
      })

      if (mounted && canvasRef.current) {
        canvasRef.current.innerHTML = ''
        qr.append(canvasRef.current)
        setQrInstance(qr)
      }
    }

    buildQR()
    return () => { mounted = false }
  }, [reviewUrl, brandColor])

  async function handleDownload() {
    if (!qrInstance) return
    setDownloading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (qrInstance as any).download({ name: `${businessName}-review-qr`, extension: 'png' })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border p-8 flex flex-col items-center gap-6" style={{ borderColor: 'var(--border)' }}>
      {/* QR Card — printable */}
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-4 w-full"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
      >
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--ink3)' }}>
            Scan to leave a review
          </p>
          <p className="font-bold text-lg" style={{ color: 'var(--ink)' }}>{businessName}</p>
        </div>

        {/* QR code */}
        <div
          ref={canvasRef}
          className="rounded-xl overflow-hidden"
          style={{ width: 280, height: 280, background: 'white' }}
        />

        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <p className="text-xs text-center" style={{ color: 'var(--ink3)' }}>
            Takes less than 10 seconds
          </p>
          <span className="text-lg">⭐</span>
        </div>
      </div>

      <Button onClick={handleDownload} loading={downloading} className="w-full">
        Download QR Code (PNG) ↓
      </Button>
    </div>
  )
}
