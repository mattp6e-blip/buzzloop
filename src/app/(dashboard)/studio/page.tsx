import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudioClient } from './StudioClient'

export default async function StudioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, industry, brand_color, brand_secondary_color, logo_url, website_url, plan')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  return <StudioClient business={business} />
}
