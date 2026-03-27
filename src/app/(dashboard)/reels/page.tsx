import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReelsClient } from './ReelsClient'
import type { ReelTheme } from '@/types'

export default async function ReelsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, industry, brand_color, brand_font, brand_logo_url, brand_secondary_color, brand_personality, brand_extracted, website_url, reel_themes, reel_themes_review_count')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', business.id)
    .gte('star_rating', 4)

  const currentReviews = reviews ?? []

  // Use cached themes if review count hasn't changed since last analysis
  const cachedThemes: ReelTheme[] | null =
    business.reel_themes &&
    business.reel_themes_review_count === currentReviews.length
      ? business.reel_themes
      : null

  return (
    <div className="p-8" style={{ maxWidth: 1400 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Reels</h1>
        <p className="text-sm" style={{ color: 'var(--ink3)' }}>
          AI finds patterns in your reviews and builds cinematic 9:16 Reels — ready to post on Instagram.
        </p>
      </div>

      <ReelsClient
        reviews={currentReviews}
        businessId={business.id}
        businessName={business.name}
        industry={business.industry}
        brandColor={business.brand_color}
        brandFont={business.brand_font ?? 'Inter'}
        brandLogoUrl={business.brand_logo_url ?? null}
        brandPersonality={business.brand_personality ? JSON.parse(business.brand_personality) : []}
        brandSecondaryColor={business.brand_secondary_color ?? business.brand_color}
        websiteUrl={business.website_url ?? null}
        brandExtracted={business.brand_extracted ?? false}
        cachedThemes={cachedThemes}
      />
    </div>
  )
}
