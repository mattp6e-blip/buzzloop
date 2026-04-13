import { NextRequest, NextResponse } from 'next/server'

const FUNCTION_NAME = process.env.REMOTION_LAMBDA_FUNCTION_NAME!
const REGION        = (process.env.AWS_REGION ?? 'us-east-1') as 'us-east-1'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const renderId   = searchParams.get('renderId')
  const bucketName = searchParams.get('bucketName')

  if (!renderId || !bucketName) {
    return NextResponse.json({ error: 'Missing renderId or bucketName' }, { status: 400 })
  }

  try {
    const { getRenderProgress } = await import('@remotion/lambda/client')

    const progress = await getRenderProgress({
      renderId,
      bucketName,
      functionName: FUNCTION_NAME,
      region: REGION,
    })

    return NextResponse.json({
      done: progress.done,
      progress: progress.overallProgress,
      outputFile: progress.outputFile,
      fatalErrorEncountered: progress.fatalErrorEncountered,
      errors: progress.errors,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
