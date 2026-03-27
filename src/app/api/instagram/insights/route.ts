import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidInstagramToken, fetchReelInsights } from '@/lib/instagram'

export async function GET(req: NextRequest) {
  const mediaId = req.nextUrl.searchParams.get('mediaId')
  if (!mediaId) return NextResponse.json({ error: 'Missing mediaId' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: business } = await supabase
    .from('businesses')
    .select('id, instagram_connected')
    .eq('user_id', user.id)
    .single()

  if (!business?.instagram_connected) {
    return NextResponse.json({ error: 'Instagram not connected' }, { status: 400 })
  }

  const token = await getValidInstagramToken(supabase, business.id)
  if (!token) return NextResponse.json({ error: 'Token expired' }, { status: 401 })

  const insights = await fetchReelInsights(mediaId, token)
  if (!insights) return NextResponse.json({ error: 'Could not fetch insights' }, { status: 500 })

  return NextResponse.json(insights)
}
