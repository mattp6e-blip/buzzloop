import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncGoogleReviews } from '@/lib/sync-google-reviews'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const returnTo = req.nextUrl.searchParams.get('state') || '/onboarding'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (!code) {
    return NextResponse.redirect(`${appUrl}${returnTo}?google_error=no_code`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${appUrl}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()

  if (!tokens.access_token) {
    return NextResponse.redirect(`${appUrl}${returnTo}?google_error=token_failed`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`)
  }

  // Save tokens
  await supabase
    .from('businesses')
    .update({
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token ?? null,
      google_token_expiry: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      google_connected: true,
    })
    .eq('user_id', user.id)

  // Sync reviews immediately — runs in ~1-2s, reviews ready when dashboard loads
  try {
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (business?.id) {
      await syncGoogleReviews(supabase, business.id)
    }
  } catch {
    // Never block the OAuth redirect if sync fails
  }

  // If coming from onboarding, go straight to dashboard with reviews already loaded
  const destination = returnTo === '/onboarding' ? '/dashboard' : returnTo
  return NextResponse.redirect(`${appUrl}${destination}?google_connected=true`)
}
