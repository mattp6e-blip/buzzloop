import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContentClient } from './ContentClient'

export default async function ContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  const { data: posts } = await supabase
    .from('social_posts')
    .select(`
      *,
      review:reviews(customer_name, star_rating, what_they_liked)
    `)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Content library</h1>
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>
          {posts?.length ?? 0} post{posts?.length !== 1 ? 's' : ''} saved
        </p>
      </div>
      <ContentClient
        posts={posts ?? []}
        instagramConnected={business.instagram_connected ?? false}
        brandColor={business.brand_color}
        brandSecondaryColor={business.brand_secondary_color ?? business.brand_color}
        brandFont={business.brand_font ?? 'Inter'}
        brandLogoUrl={business.brand_logo_url ?? null}
        businessName={business.name}
        industry={business.industry}
      />
    </div>
  )
}
