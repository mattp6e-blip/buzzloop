import { NextRequest, NextResponse } from 'next/server'

const RENDER_SERVICE_URL = process.env.RENDER_SERVICE_URL || 'https://buzzloop-nwpv.onrender.com'

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
    const body = await req.json()

    const res = await fetch(`${RENDER_SERVICE_URL}/api/render-reel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status, headers: CORS_HEADERS })
  } catch (err) {
    console.error('Render proxy error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS_HEADERS })
  }
}
