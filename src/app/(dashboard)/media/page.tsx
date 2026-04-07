import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MediaClient } from './MediaClient'

export default async function MediaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, gbp_photos, uploaded_photos')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  return (
    <MediaClient
      businessId={business.id}
      gbpPhotos={(business.gbp_photos as string[]) ?? []}
      uploadedPhotos={(business.uploaded_photos as string[]) ?? []}
    />
  )
}
