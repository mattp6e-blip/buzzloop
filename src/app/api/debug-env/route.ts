import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({
    MAPS_KEY_SET: !!process.env.GOOGLE_MAPS_API_KEY,
    MAPS_KEY_LENGTH: process.env.GOOGLE_MAPS_API_KEY?.length ?? 0,
  })
}
