import { NextRequest, NextResponse } from 'next/server'

const FUNCTION_NAME = process.env.REMOTION_LAMBDA_FUNCTION_NAME!
const SERVE_URL     = process.env.REMOTION_SERVE_URL!
const REGION        = (process.env.AWS_REGION ?? 'us-east-1') as 'us-east-1'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  try {
    const { script, variation, brandColor, brandSecondaryColor, logoUrl, businessName, industry, websiteUrl, gbpPhotos } = await req.json()

    const { renderMediaOnLambda } = await import('@remotion/lambda/client')

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
      forceBucketName: undefined,
      outName: `reel-${Date.now()}.mp4`,
      // Override duration with actual reel length
      overrideWebpackConfig: undefined,
      timeoutInMilliseconds: 240000,
      durationInFrames: totalFrames,
      fps: 30,
      width: 1080,
      height: 1920,
      downloadBehavior: { type: 'download', fileName: 'reel.mp4' },
    })

    return NextResponse.json({ renderId, bucketName }, { headers: CORS_HEADERS })
  } catch (err) {
    console.error('Render start error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS_HEADERS })
  }
}
