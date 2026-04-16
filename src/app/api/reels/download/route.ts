import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FREE_DOWNLOAD_LIMIT = 2

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: business } = await supabase
    .from('businesses')
    .select('id, plan, reel_downloads_this_month, reel_downloads_reset_at')
    .eq('user_id', user.id)
    .single()

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  const isPro = business.plan === 'pro'
  if (isPro) return NextResponse.json({ allowed: true })

  // Check if we need to reset monthly counter
  const now = new Date()
  const resetAt = business.reel_downloads_reset_at ? new Date(business.reel_downloads_reset_at) : null
  const needsReset = !resetAt || now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()

  const downloadsUsed = needsReset ? 0 : (business.reel_downloads_this_month ?? 0)

  if (downloadsUsed >= FREE_DOWNLOAD_LIMIT) {
    return NextResponse.json({ allowed: false, error: 'limit_reached', downloadsUsed, limit: FREE_DOWNLOAD_LIMIT })
  }

  // Increment
  await supabase
    .from('businesses')
    .update({
      reel_downloads_this_month: downloadsUsed + 1,
      reel_downloads_reset_at: needsReset ? now.toISOString() : business.reel_downloads_reset_at,
    })
    .eq('id', business.id)

  return NextResponse.json({ allowed: true, downloadsUsed: downloadsUsed + 1, limit: FREE_DOWNLOAD_LIMIT })
}
