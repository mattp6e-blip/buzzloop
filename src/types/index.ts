export type Industry =
  // Dental & Oral
  | 'dental' | 'orthodontist' | 'oral_surgeon'
  // Medical & Diagnostic
  | 'optician' | 'gp' | 'audiologist' | 'podiatrist' | 'paediatrician' | 'sleep_clinic'
  // Therapeutic & Recovery
  | 'physiotherapy' | 'chiropractor' | 'osteopath' | 'sports_medicine'
  // Mental & Emotional Health
  | 'therapist' | 'psychiatrist' | 'psychologist' | 'fertility_clinic' | 'counselling'
  // Cosmetic & Aesthetics
  | 'cosmetic_clinic' | 'dermatologist' | 'plastic_surgery' | 'weight_loss_clinic' | 'aesthetics'
  // Hair & Barbershop
  | 'salon' | 'barbershop' | 'hair_extensions'
  // Nails, Lash & Brow
  | 'nail_salon' | 'lash_brow' | 'waxing'
  // Body & Wellness
  | 'spa' | 'yoga' | 'pilates' | 'massage' | 'meditation' | 'float_tank'
  // Fitness & Performance
  | 'gym' | 'personal_trainer' | 'crossfit' | 'boxing' | 'martial_arts' | 'cycling_studio' | 'swimming'
  // Tattoo & Permanent Art
  | 'tattoo' | 'microblading' | 'permanent_makeup' | 'piercing'
  // Restaurant & Dining
  | 'restaurant' | 'fine_dining' | 'casual_dining'
  // Cafe, Bakery & Dessert
  | 'cafe' | 'bakery' | 'dessert_shop' | 'juice_bar'
  // Bar & Nightlife
  | 'bar' | 'cocktail_bar' | 'pub' | 'wine_bar' | 'nightclub'
  // Hospitality
  | 'hotel' | 'boutique_hotel' | 'bnb' | 'vacation_rental' | 'event_venue'
  // Veterinary & Paediatric
  | 'veterinary' | 'pet_grooming' | 'pet_boarding' | 'dog_training'
  // Professional & High Stakes
  | 'lawyer' | 'accountant' | 'financial_advisor' | 'mortgage_broker' | 'real_estate'
  // Automotive
  | 'mechanic' | 'car_detailing' | 'tyre_shop' | 'body_shop' | 'car_dealership'
  // Education & Skills
  | 'tutoring' | 'language_school' | 'music_school' | 'art_school' | 'driving_school' | 'dance_studio'
  // Event & Occasion
  | 'photographer' | 'florist' | 'catering' | 'wedding_planner'
  // Other
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
  business_context: string | null   // AI-generated summary: services, target audience, differentiators
  staff_members: string[]
  gbp_photos: string[]              // URLs of GBP media photos (800px+ only)
  uploaded_photos: string[]         // User-uploaded photos
  last_gbp_sync_at: string | null
  google_connected: boolean
  instagram_connected: boolean
  google_place_id: string | null    // Google Maps Place ID (from Places API, no OAuth needed)
  google_place_location: { lat: number; lng: number } | null
  keyword_rankings: Array<{ keyword: string; rank: number | null; checkedAt: string }> | null
}

export interface Competitor {
  id: string
  business_id: string
  google_place_id: string
  name: string
  url: string | null
  rating: number | null
  review_count: number
  types: string[]
  photo_count: number
  raw_data: Record<string, unknown> | null
  last_synced_at: string
  created_at: string
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
  has_owner_reply: boolean
  gbp_review_id: string | null
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
  weekOf?: string                   // ISO week string e.g. "2026-W15" — set when theme was generated
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
    template?: import('@/remotion/types').VisualTemplate
  }
}

export interface ReelScript {
  themeTitle: string
  totalDuration: number
  slides: ReelSlide[]
  template?: import('@/remotion/types').VisualTemplate
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
