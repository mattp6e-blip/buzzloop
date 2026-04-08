import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Outreach is now under /qr?tab=messages
export default async function OutreachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  redirect('/qr?tab=messages')
}
