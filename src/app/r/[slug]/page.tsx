import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import { ReviewFlow } from './ReviewFlow'

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!business) notFound()

  return (
    <ReviewFlow
      businessId={business.id}
      businessName={business.name}
      industry={business.industry}
      brandColor={business.brand_color}
      googleBusinessUrl={business.google_business_url}
      staffMembers={business.staff_members ?? []}
    />
  )
}
