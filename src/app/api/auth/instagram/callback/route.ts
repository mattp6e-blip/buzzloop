import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const redirectUri = `${appUrl}/api/auth/instagram/callback`

  const code = req.nextUrl.searchParams.get('code')
  const returnTo = req.nextUrl.searchParams.get('state') ?? '/content'
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}${returnTo}?instagram_error=access_denied`)
  }

  // Exchange code for short-lived token
  const tokenRes = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: redirectUri,
      code,
    }),
  })
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${appUrl}${returnTo}?instagram_error=token_failed`)
  }

  // Exchange for long-lived token (60 days)
  const longRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
  )
  const longData = await longRes.json()
  const accessToken = longData.access_token ?? tokenData.access_token
  const expiresIn: number = longData.expires_in ?? 60 * 24 * 60 * 60 // default 60 days
  const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString()

  // Get Instagram Business Account ID linked to their Facebook Pages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
  )
  const pagesData = await pagesRes.json()

  const igAccountId = pagesData.data?.find(
    (p: { instagram_business_account?: { id: string } }) => p.instagram_business_account?.id
  )?.instagram_business_account?.id

  if (!igAccountId) {
    return NextResponse.redirect(`${appUrl}${returnTo}?instagram_error=no_business_account`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${appUrl}/login`)

  await supabase
    .from('businesses')
    .update({
      instagram_user_id: igAccountId,
      instagram_access_token: accessToken,
      instagram_token_expiry: tokenExpiry,
      instagram_connected: true,
    })
    .eq('user_id', user.id)

  return NextResponse.redirect(`${appUrl}${returnTo}?instagram_connected=true`)
}
