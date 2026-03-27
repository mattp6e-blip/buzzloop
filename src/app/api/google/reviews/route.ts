import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncGoogleReviews } from '@/lib/sync-google-reviews'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: business } = await supabase
    .from('businesses')
    .select('id, google_connected')
    .eq('user_id', user.id)
    .single()

  if (!business?.google_connected) {
    return NextResponse.json({ error: 'Google not connected' }, { status: 400 })
  }

  const result = await syncGoogleReviews(supabase, business.id)
  return NextResponse.json(result)
}
