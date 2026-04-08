import http from 'http'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

let bundleCache = null

async function getBundle() {
  if (bundleCache) return bundleCache
  console.log('Bundling Remotion composition...')
  const entryPoint = path.join(__dirname, '..', 'src', 'remotion', 'index.tsx')
  bundleCache = await bundle({ entryPoint, webpackOverride: (c) => c })
  console.log('Bundle ready:', bundleCache)
  return bundleCache
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS)
    res.end()
    return
  }

  if (req.method !== 'POST' || req.url !== '/api/render-reel') {
    res.writeHead(404, CORS_HEADERS)
    res.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', async () => {
    try {
      const { script, variation, brandColor, brandSecondaryColor, logoUrl, businessName, industry, websiteUrl, gbpPhotos } = JSON.parse(body)

      const serveUrl = await getBundle()
      const totalFrames = Math.round(script.totalDuration * 30)

      const inputProps = {
        script,
        variation,
        brandColor,
        brandSecondaryColor: brandSecondaryColor || brandColor,
        logoUrl: logoUrl || null,
        businessName,
        industry,
        websiteUrl: websiteUrl || null,
        gbpPhotos: gbpPhotos || [],
      }

      const composition = await selectComposition({
        serveUrl,
        id: 'Reel',
        inputProps,
      })

      const finalComposition = { ...composition, durationInFrames: totalFrames }
      const outputPath = path.join(os.tmpdir(), `reel-${Date.now()}.mp4`)

      await renderMedia({
        composition: finalComposition,
        serveUrl,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps,
        chromiumOptions: { disableWebSecurity: true },
        timeoutInMilliseconds: 240000,
      })

      const buffer = fs.readFileSync(outputPath)
      fs.unlinkSync(outputPath)

      res.writeHead(200, {
        ...CORS_HEADERS,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="reel-${Date.now()}.mp4"`,
        'Content-Length': String(buffer.length),
      })
      res.end(buffer)
    } catch (err) {
      console.error('Render error:', err)
      res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: String(err) }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`Render server running on port ${PORT}`)
  // Pre-warm the bundle on startup
  getBundle().catch(console.error)
})
