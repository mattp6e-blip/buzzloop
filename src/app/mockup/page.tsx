import { createClient } from '@/lib/supabase/server'
import { MockupClient } from './MockupClient'
import type { ReelTheme } from '@/types'

export const dynamic = 'force-dynamic'

const BUSINESS_ID = 'fa85cd1e-59ba-4a90-a85f-9beb591ab0ce'

export default async function MockupPage() {
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('brand_color, brand_logo_url, brand_secondary_color, uploaded_photos, gbp_photos, reel_themes')
    .eq('id', BUSINESS_ID)
    .single()

  const allThemes: ReelTheme[] = business?.reel_themes ?? []

  const cachedThemes = allThemes.filter(
    (t) => t.cachedScript != null && t.cachedVariations != null && t.cachedVariations.length > 0
  )

  const firstTwo = cachedThemes.slice(0, 6)

  const brandColor: string = business?.brand_color ?? '#6366f1'
  const brandSecondaryColor: string = business?.brand_secondary_color ?? brandColor
  const logoUrl: string | null = business?.brand_logo_url ?? null
  const gbpPhotos: string[] = [
    ...((business?.gbp_photos as string[] | null) ?? []),
    ...((business?.uploaded_photos as string[] | null) ?? []),
  ]

  return (
    <MockupClient
      themes={firstTwo}
      brandColor={brandColor}
      brandSecondaryColor={brandSecondaryColor}
      logoUrl={logoUrl}
      gbpPhotos={gbpPhotos}
    />
  )
}
