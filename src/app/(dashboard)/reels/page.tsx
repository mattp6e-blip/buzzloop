import { Suspense } from 'react'
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
    .select('id, name, industry, city, brand_color, brand_font, brand_logo_url, brand_secondary_color, brand_personality, brand_extracted, website_url, reel_themes, reel_themes_review_count, google_connected, gbp_photos, uploaded_photos, business_context, plan, reel_downloads_this_month, reel_downloads_reset_at')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  const [{ data: reviews }, { data: savedPosts }] = await Promise.all([
    supabase.from('reviews').select('*').eq('business_id', business.id).eq('posted_to_google', true),
    supabase.from('social_posts').select('reel_theme').eq('business_id', business.id),
  ])

  const savedPostsCount = savedPosts?.length ?? 0
  const savedThemeTitles = new Set((savedPosts ?? []).map(p => p.reel_theme).filter(Boolean))

  const currentReviews = reviews ?? []

  // Use cached themes if review count hasn't changed since last analysis
  const cachedThemes: ReelTheme[] | null =
    business.reel_themes &&
    business.reel_themes_review_count === currentReviews.length
      ? business.reel_themes
      : null

  const isPro = business.plan === 'pro'
  const now = new Date()
  const resetAt = business.reel_downloads_reset_at ? new Date(business.reel_downloads_reset_at) : null
  const needsReset = !resetAt || now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()
  const downloadsUsed = needsReset ? 0 : (business.reel_downloads_this_month ?? 0)

  return (
    <div className="p-8" style={{ maxWidth: 1100 }}>
      <Suspense>
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
          savedPostsCount={savedPostsCount}
          savedThemeTitles={[...savedThemeTitles] as string[]}
          city={business.city ?? null}
          googleConnected={business.google_connected ?? false}
          gbpPhotos={[
            ...((business.gbp_photos as string[] | null) ?? []),
            ...((business.uploaded_photos as string[] | null) ?? []),
          ]}
          uploadedPhotos={(business.uploaded_photos as string[] | null) ?? []}
          businessContext={business.business_context ?? null}
          isPro={isPro}
          downloadsUsed={downloadsUsed}
        />
      </Suspense>
    </div>
  )
}
