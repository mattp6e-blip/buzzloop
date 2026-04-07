export type Industry =
  | 'restaurant'
  | 'gym'
  | 'salon'
  | 'dental'
  | 'spa'
  | 'hotel'
  | 'bar'
  | 'physiotherapy'
  | 'veterinary'
  | 'lawyer'
  | 'tattoo'
  | 'optician'
  | 'other'

export interface Business {
  id: string
  user_id: string
  name: string
  industry: Industry
  city: string | null
  google_business_url: string | null
  logo_url: string | null
  brand_color: string
  slug: string
  created_at: string
  website_url: string | null
  brand_font: string | null
  brand_logo_url: string | null
  brand_secondary_color: string | null
  brand_personality: string | null  // JSON string: ["professional", "caring", "premium"]
  brand_extracted: boolean
  staff_members: string[]
  gbp_photos: string[]              // URLs of GBP media photos (800px+ only)
  last_gbp_sync_at: string | null
}

export interface Review {
  id: string
  business_id: string
  customer_name: string | null
  star_rating: number
  what_they_liked: string
  staff_name: string | null
  ai_draft: string
  posted_to_google: boolean
  created_at: string
  remarkability_score: number | null
  anchor_sentence: string | null
  remarkability_signal: string | null
}

export type ReelContentType =
  | 'social_proof'    // review-based (story or pattern)
  | 'educational'     // how a procedure/product/service works
  | 'myth_bust'       // address a common fear or misconception
  | 'experience'      // atmosphere, vibe, signature moment
  | 'local_guide'     // local recommendations (hotel/restaurant)
  | 'behind_scenes'   // how something is made or done
  | 'trust'           // credentials, years, expertise

export interface ReelTheme {
  id: string
  title: string
  hook: string
  reelType: 'story' | 'pattern'    // story = single anchor review; pattern = shared signal across 3+
  contentType?: ReelContentType     // defaults to 'social_proof' if absent
  keyPhrase: string
  emoji: string
  reviewIds: string[]
  anchorReviewId?: string           // for story reels: the primary review
  buzzScore?: number
  buzzReason?: string
  cachedScript?: ReelScript
  cachedVariations?: import('@/remotion/types').ReelVariation[]
}

export interface ReelSlide {
  type: 'hook' | 'quote' | 'proof' | 'cta' | 'insight'
  duration: number
  content: {
    headline?: string
    subline?: string
    quote?: string
    highlightWords?: string[]
    author?: string
    stat?: string
    cta?: string
    photoUrl?: string
  }
}

export interface ReelScript {
  themeTitle: string
  totalDuration: number
  slides: ReelSlide[]
  template?: 'immersive' | 'collage' | 'editorial'
}

export interface SocialPost {
  id: string
  business_id: string
  review_id: string | null
  caption: string
  image_url: string | null
  status: 'draft' | 'scheduled' | 'published'
  scheduled_for: string | null
  post_type: 'post' | 'reel'
  reel_script: ReelScript | null
  reel_theme: string | null
  instagram_media_id: string | null
  created_at: string
}
