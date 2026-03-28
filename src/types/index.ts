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
}

export interface ReelTheme {
  id: string
  title: string        // "7 customers can't stop talking about the truffle pasta"
  hook: string         // bold opening line for slide 1
  category: 'dish' | 'staff' | 'service' | 'emotion' | 'outcome' | 'general'
  reelCategory: 'social_proof' | 'educational' | 'faq'
  keyPhrase: string    // the recurring word/phrase found in reviews
  emoji: string        // representative emoji
  reviewIds: string[]
  buzzScore?: number   // 1-100 estimated Instagram engagement potential
  buzzReason?: string  // one-line plain-English explanation of the score
  // Cached after first generation so navigating away doesn't re-generate
  cachedScript?: ReelScript
  cachedVariations?: import('@/remotion/types').ReelVariation[]
}

export interface ReelSlide {
  type: 'hook' | 'quote' | 'proof' | 'cta' | 'insight'
  duration: number     // seconds
  content: {
    headline?: string
    subline?: string
    quote?: string
    highlightWords?: string[]  // words to emphasise in the quote
    author?: string
    stat?: string      // e.g. "4.9★ · 127 reviews"
    cta?: string
    photoUrl?: string  // optional background photo (user-uploaded)
  }
}

export interface ReelScript {
  themeTitle: string
  totalDuration: number
  slides: ReelSlide[]
  visualStyle?: string  // 'cinematic' | 'clean' — saved so library can replay correctly
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
