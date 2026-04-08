import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import os from 'os'
import fs from 'fs'

export const maxDuration = 300 // 5 min — ignored on free Vercel, works on Railway

let bundleCache: string | null = null

async function getBundle(): Promise<string> {
  if (bundleCache) return bundleCache

  const { bundle } = await import('@remotion/bundler')
  const entryPoint = path.join(process.cwd(), 'src', 'remotion', 'index.tsx')

  bundleCache = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  })

  return bundleCache
}

export async function POST(req: NextRequest) {
  try {
    const { script, variation, brandColor, brandSecondaryColor, logoUrl, businessName, industry, websiteUrl, gbpPhotos } = await req.json()

    const { selectComposition, renderMedia } = await import('@remotion/renderer')

    const serveUrl = await getBundle()

    const totalFrames = Math.round(script.totalDuration * 30)

    const composition = await selectComposition({
      serveUrl,
      id: 'Reel',
      inputProps: { script, variation, brandColor, brandSecondaryColor, logoUrl, businessName, industry, websiteUrl, gbpPhotos: gbpPhotos ?? [] },
    })

    // Override duration with actual reel length
    const finalComposition = { ...composition, durationInFrames: totalFrames }

    const outputPath = path.join(os.tmpdir(), `reel-${Date.now()}.mp4`)

    await renderMedia({
      composition: finalComposition,
      serveUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { script, variation, brandColor, brandSecondaryColor, logoUrl, businessName, industry, websiteUrl, gbpPhotos: gbpPhotos ?? [] },
      chromiumOptions: { disableWebSecurity: true },
      timeoutInMilliseconds: 240000,
    })

    const buffer = fs.readFileSync(outputPath)
    fs.unlinkSync(outputPath)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="reel-${Date.now()}.mp4"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err) {
    console.error('Render error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
