import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OutreachClient } from './OutreachClient'

export default async function OutreachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('name, slug')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${business.slug}`

  return <OutreachClient businessName={business.name} reviewUrl={reviewUrl} />
}
