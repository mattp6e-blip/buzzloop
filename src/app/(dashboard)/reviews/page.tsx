import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReviewsClient } from './ReviewsClient'

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  const { data: allReviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', business.id)
    .gte('star_rating', 4)

  // Score and sort by Instagrammable potential
  function scoreReview(text: string, rating: number): number {
    const t = text.toLowerCase()
    let score = rating * 2

    // Length bonus — more content = richer story
    score += Math.min(text.split(' ').length / 8, 10)

    // Transformation / before-after narrative
    const storyWords = ['scared', 'nervous', 'terrified', 'afraid', 'fear', 'complex', 'complicated', 'years', 'finally', 'changed', 'life', 'dream', 'no longer', 'anymore', 'used to']
    score += storyWords.filter(w => t.includes(w)).length * 3

    // Emotional payoff words
    const emotionalWords = ['smile', 'tears', 'cry', 'incredible', 'amazing', 'blessed', 'grateful', 'delighted', 'thrilled', 'love', 'happy', 'joy', 'wonderful']
    score += emotionalWords.filter(w => t.includes(w)).length * 2

    // Specific outcome (concrete result = credible social proof)
    const outcomeWords = ['implant', 'invisalign', 'whitening', 'result', 'surgery', 'treatment', 'sedation', 'smile', 'pain-free', 'painless', 'without pain']
    score += outcomeWords.filter(w => t.includes(w)).length * 1.5

    return score
  }

  const reviews = (allReviews ?? [])
    .map(r => ({ ...r, _score: scoreReview(r.what_they_liked ?? '', r.star_rating) }))
    .sort((a, b) => b._score - a._score)

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Reviews</h1>
          <p className="text-sm" style={{ color: 'var(--ink3)' }}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} · sorted by content potential
          </p>
        </div>
      </div>
      <ReviewsClient
        googleConnected={business.google_connected}
        initialReviews={reviews}
        businessName={business.name}
        industry={business.industry}
        brandColor={business.brand_color}
        brandFont={business.brand_font ?? 'Inter'}
      />
    </div>
  )
}
