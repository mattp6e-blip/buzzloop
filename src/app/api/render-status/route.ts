import { NextRequest, NextResponse } from 'next/server'

const RENDER_SERVICE_URL = process.env.RENDER_SERVICE_URL || 'https://buzzloop-nwpv.onrender.com'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const renderId   = searchParams.get('renderId')
  const bucketName = searchParams.get('bucketName')

  if (!renderId || !bucketName) {
    return NextResponse.json({ error: 'Missing renderId or bucketName' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${RENDER_SERVICE_URL}/api/render-status?renderId=${renderId}&bucketName=${bucketName}`
    )
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
