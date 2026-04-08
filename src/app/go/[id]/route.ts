import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: msg } = await supabase
    .from('outreach_messages')
    .select('id, review_url, clicked_at')
    .eq('id', id)
    .single()

  if (!msg) {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL!))
  }

  // Record click (only first time)
  if (!msg.clicked_at) {
    await supabase
      .from('outreach_messages')
      .update({ clicked_at: new Date().toISOString() })
      .eq('id', id)
  }

  // Redirect to review flow with ref param for conversion tracking
  const dest = new URL(msg.review_url)
  dest.searchParams.set('ref', id)
  return NextResponse.redirect(dest.toString())
}
