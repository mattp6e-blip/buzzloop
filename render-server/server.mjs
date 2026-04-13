import http from 'http'
import { fileURLToPath } from 'url'
import path from 'path'
import { renderMediaOnLambda, getRenderProgress } from '@remotion/lambda'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001

const FUNCTION_NAME = process.env.REMOTION_LAMBDA_FUNCTION_NAME
const SERVE_URL     = process.env.REMOTION_SERVE_URL
const REGION        = process.env.AWS_REGION || 'us-east-1'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => { try { resolve(JSON.parse(body)) } catch (e) { reject(e) } })
    req.on('error', reject)
  })
}

function send(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data)
  res.writeHead(status, { ...CORS_HEADERS, ...extraHeaders, 'Content-Type': 'application/json' })
  res.end(body)
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS)
    res.end()
    return
  }

  // Health check
  if (req.url === '/health') {
    send(res, 200, { ok: true })
    return
  }

  // Start render
  if (req.method === 'POST' && req.url === '/api/render-reel') {
    try {
      const { script, variation, brandColor, brandSecondaryColor, logoUrl, businessName, industry, websiteUrl, gbpPhotos } = await readBody(req)

      const totalFrames = Math.round(script.totalDuration * 30)

      const { renderId, bucketName } = await renderMediaOnLambda({
        region: REGION,
        functionName: FUNCTION_NAME,
        serveUrl: SERVE_URL,
        composition: 'Reel',
        inputProps: {
          script, variation, brandColor,
          brandSecondaryColor: brandSecondaryColor || brandColor,
          logoUrl: logoUrl || null,
          businessName, industry,
          websiteUrl: websiteUrl || null,
          gbpPhotos: gbpPhotos || [],
        },
        codec: 'h264',
        framesPerLambda: 20,
        outName: `reel-${Date.now()}.mp4`,
        timeoutInMilliseconds: 240000,
        forceDurationInFrames: totalFrames,
        downloadBehavior: { type: 'download', fileName: 'reel.mp4' },
      })

      send(res, 200, { renderId, bucketName })
    } catch (err) {
      console.error('Render start error:', err)
      send(res, 500, { error: String(err) })
    }
    return
  }

  // Check render status
  if (req.method === 'GET' && req.url?.startsWith('/api/render-status')) {
    try {
      const url = new URL(req.url, `http://localhost`)
      const renderId   = url.searchParams.get('renderId')
      const bucketName = url.searchParams.get('bucketName')

      if (!renderId || !bucketName) {
        send(res, 400, { error: 'Missing renderId or bucketName' })
        return
      }

      const progress = await getRenderProgress({
        renderId,
        bucketName,
        functionName: FUNCTION_NAME,
        region: REGION,
      })

      send(res, 200, {
        done: progress.done,
        progress: progress.overallProgress,
        outputFile: progress.outputFile,
        fatalErrorEncountered: progress.fatalErrorEncountered,
        errors: progress.errors,
      })
    } catch (err) {
      send(res, 500, { error: String(err) })
    }
    return
  }

  send(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Render server running on port ${PORT}`)
  console.log(`Lambda function: ${FUNCTION_NAME}`)
  console.log(`Serve URL: ${SERVE_URL}`)
})
