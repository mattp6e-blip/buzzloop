import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ReviewFlow } from './ReviewFlow'

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const [{ slug }, { ref }] = await Promise.all([params, searchParams])
  const supabase = await createClient()

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
      customQuestions={business.custom_questions ?? null}
      outreachRef={ref ?? null}
    />
  )
}
