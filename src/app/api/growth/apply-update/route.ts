import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  return data.access_token ?? null
}

function toLocationPath(locationId: string): string {
  if (locationId.includes('locations/')) {
    return 'locations/' + locationId.split('locations/')[1]
  }
  return locationId
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, google_connected, google_access_token, google_refresh_token, google_token_expiry, google_location_id')
      .eq('user_id', user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    if (!business.google_connected) return NextResponse.json({ error: 'Google not connected' }, { status: 403 })
    if (!business.google_location_id) return NextResponse.json({ error: 'Location not linked' }, { status: 422 })

    // Refresh token if expired
    let accessToken = business.google_access_token
    const expiry = business.google_token_expiry ? new Date(business.google_token_expiry) : null
    if (expiry && expiry < new Date() && business.google_refresh_token) {
      const newToken = await refreshAccessToken(business.google_refresh_token)
      if (newToken) {
        accessToken = newToken
        await supabase.from('businesses').update({ google_access_token: newToken }).eq('id', business.id)
      }
    }

    const locationPath = toLocationPath(business.google_location_id)
    const baseUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${locationPath}`

    const { type, payload } = await req.json() as {
      type: 'description' | 'services'
      payload: Record<string, unknown>
    }

    if (type === 'description') {
      const { description } = payload as { description: string }
      if (!description?.trim()) return NextResponse.json({ error: 'Description required' }, { status: 400 })

      const res = await fetch(`${baseUrl}?updateMask=profile.description`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile: { description: description.trim() } }),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error('GBP description update error:', err)
        return NextResponse.json({ error: 'Failed to update description. You may need to reconnect Google.' }, { status: 502 })
      }

      return NextResponse.json({ success: true })
    }

    if (type === 'services') {
      const { services } = payload as { services: string[] }
      if (!services?.length) return NextResponse.json({ error: 'No services provided' }, { status: 400 })

      // First fetch existing services so we don't overwrite them
      const existingRes = await fetch(
        `${baseUrl}?readMask=serviceItems`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const existingData = await existingRes.json()
      const existingItems = existingData.serviceItems ?? []

      // Append new free-form services
      const newItems = services.map(name => ({
        freeFormServiceItem: {
          label: { displayName: name },
        },
        isOffered: true,
      }))

      const res = await fetch(`${baseUrl}?updateMask=serviceItems`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceItems: [...existingItems, ...newItems] }),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error('GBP services update error:', err)
        return NextResponse.json({ error: 'Failed to update services. You may need to reconnect Google.' }, { status: 502 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown update type' }, { status: 400 })
  } catch (err) {
    console.error('Apply update error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
