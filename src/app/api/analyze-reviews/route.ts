import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { Review, ReelTheme } from '@/types'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
  const { reviews, businessId }: { reviews: Review[]; businessId: string } = await req.json()

  if (!reviews?.length) {
    return NextResponse.json({ themes: [] })
  }

  // Score and pick top 40 most content-rich reviews to avoid token overflow
  function scoreReview(text: string, rating: number): number {
    const t = text.toLowerCase()
    let score = rating * 2 + Math.min(text.split(' ').length / 8, 10)
    const storyWords = ['scared', 'nervous', 'terrified', 'afraid', 'fear', 'complex', 'years', 'finally', 'changed', 'life', 'no longer']
    const emotionalWords = ['smile', 'incredible', 'amazing', 'blessed', 'grateful', 'delighted', 'thrilled', 'love']
    score += storyWords.filter(w => t.includes(w)).length * 3
    score += emotionalWords.filter(w => t.includes(w)).length * 2
    return score
  }

  const topReviews = [...reviews]
    .sort((a, b) => scoreReview(b.what_they_liked ?? '', b.star_rating) - scoreReview(a.what_they_liked ?? '', a.star_rating))
    .slice(0, 40)

  const reviewList = topReviews.map((r) =>
    `[ID: ${r.id}] ${r.star_rating}★ — "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}`
  ).join('\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `You are a world-class Instagram Reel director. Find 3–5 powerful Reel themes in these reviews. Each theme must be a SHARED EXPERIENCE across multiple reviews — not a detail from just one.

REVIEWS:
${reviewList}

HOW TO BUILD A GOOD THEME:

A theme is a shared emotional truth that multiple patients experienced. Group reviews by what they have in common at the EMOTIONAL level, not just keywords.

Step 1: Read all reviews. Find groups of 3+ that share the same core emotional experience.
Step 2: Ask: what is the ONE sentence that is true for ALL reviews in this group?
Step 3: That common truth becomes the hook territory.

THE BEST THEME TYPES (ranked by Reel potential):

1. FEAR → RELIEF: Multiple patients mention being scared/terrified/anxious, but had a great experience. The shared truth: "This is the dentist that cured my fear of dentists." Hook: "She cancelled every appointment for years. Then she found this clinic."

2. EXTREME LOYALTY: Multiple patients went out of their way — flew from another country, came from far away, bring the whole family, chose this over private insurance. The shared truth: worth any effort. Hook: "One flew from Norway. One came from Mallorca. Same reason."

3. COMPLEX MADE EASY: Multiple patients had implants, bone grafts, sedation, or major surgery and describe it as painless/easy/life-changing. The shared truth: scary procedures that weren't scary. Hook: "Major surgery. No pain. Back to normal in days."

4. SMILE TRANSFORMATION: Multiple patients describe getting their smile or confidence back after years. The shared truth: life changed because of their teeth. Hook: "She hid her smile for years. Not anymore."

5. STAFF MENTIONED BY NAME: Multiple reviews mention the same doctor(s) by name as exceptional. The shared truth: specific people make the difference. Hook: "Everyone keeps asking for the same doctor."

CRITICAL: Every review in reviewIds must genuinely share the theme. 3 tightly matched reviews beats 6 loose ones. The hook must be true for ALL the reviews, not just the best one.

Return ONLY a valid JSON array:
[
  {
    "id": "unique-slug",
    "title": "The shared truth across all these reviews as a scroll-stopping fact (under 10 words)",
    "hook": "5-7 word opener — must be true for ALL reviews in the group, not just one",
    "category": "dish|staff|service|emotion|outcome|general",
    "keyPhrase": "the shared emotional experience connecting all these reviews",
    "emoji": "single most relevant emoji",
    "reviewIds": ["id1", "id2", "id3"],
    "buzzScore": 85,
    "buzzReason": "One plain-English sentence (max 12 words) explaining why this will perform well on Instagram"
  }
]

BUZZ SCORE RULES (1-100):
- 80-100: Transformation arcs (fear→relief, anxiety→confidence), extreme loyalty (flew from abroad, drove hours), multiple reviews sharing the same surprising or emotional truth
- 60-79: Specific staff mentioned by name across reviews, clear before/after outcome, vivid personal stories with specific detail
- 40-59: Comfort, atmosphere, or value patterns that are positive but not emotionally charged
- Below 40: Generic praise with no emotional specificity or hook potential

BUZZ REASON examples:
- "3 customers share a fear→relief arc — stops the scroll immediately"
- "Customers flew from abroad just to come back — extreme loyalty hook"
- "Same staff member praised by 5 reviewers — personal and trustworthy"
- "Vivid transformation stories with before/after emotional arc"

Return 6–8 themes ranked by buzzScore descending, strongest first.`
    }],
  })

  let themes: ReelTheme[] = []
  try {
    const text = (message.content[0] as { text: string }).text
    const match = text.match(/\[[\s\S]*\]/)
    if (match) themes = JSON.parse(match[0])
  } catch {
    themes = []
  }

  // Cache in DB so we don't re-run on every page visit
  if (businessId && themes.length > 0) {
    const supabase = await createClient()
    await supabase.from('businesses').update({
      reel_themes: themes,
      reel_themes_review_count: reviews.length,
    }).eq('id', businessId)
  }

  return NextResponse.json({ themes })
  } catch (err) {
    console.error('[analyze-reviews]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
