import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { Review, ReelTheme } from '@/types'

const client = new Anthropic()

// Which reel categories to analyse per industry
const CATEGORY_MAP: Record<string, ('social_proof' | 'educational' | 'faq')[]> = {
  restaurant: ['social_proof'],
  gym:        ['social_proof', 'educational', 'faq'],
  salon:      ['social_proof', 'educational', 'faq'],
  dental:     ['social_proof', 'educational', 'faq'],
  clinic:     ['social_proof', 'educational', 'faq'],
  spa:        ['social_proof', 'educational', 'faq'],
  retail:     ['social_proof'],
  other:      ['social_proof'],
}

function scoreReview(text: string, rating: number): number {
  const t = text.toLowerCase()
  let score = rating * 2 + Math.min(text.split(' ').length / 8, 10)
  const storyWords = ['scared', 'nervous', 'terrified', 'afraid', 'fear', 'complex', 'years', 'finally', 'changed', 'life', 'no longer']
  const emotionalWords = ['smile', 'incredible', 'amazing', 'blessed', 'grateful', 'delighted', 'thrilled', 'love']
  score += storyWords.filter(w => t.includes(w)).length * 3
  score += emotionalWords.filter(w => t.includes(w)).length * 2
  return score
}

function buildReviewList(reviews: Review[]): string {
  return reviews.map(r =>
    `[ID: ${r.id}] ${r.star_rating}★ — "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}`
  ).join('\n')
}

function getSocialProofPrompt(reviewList: string, industry: string, businessName: string): string {
  return `You are a world-class Instagram Reel director. Find powerful Social Proof Reel themes in these reviews for a ${industry} business called "${businessName}". Each theme must be a SHARED EXPERIENCE across multiple reviews — not a detail from just one.

REVIEWS:
${reviewList}

HOW TO BUILD A GOOD THEME:
A theme is a shared emotional truth that multiple customers experienced. Group reviews by what they have in common at the EMOTIONAL level, not just keywords.

Step 1: Read all reviews. Find groups of 3+ that share the same core emotional experience.
Step 2: Ask: what is the ONE sentence that is true for ALL reviews in this group?
Step 3: That common truth becomes the hook territory.

THE BEST SOCIAL PROOF THEME TYPES (ranked by Reel potential):
1. FEAR → RELIEF: Multiple customers mention being scared/nervous/anxious before, but had an amazing outcome. Hook: "She cancelled every appointment for years. Then she found this place."
2. EXTREME LOYALTY: Multiple customers went out of their way — travelled far, bring their whole family, return again and again. Hook: "He drives 90 minutes. Every time."
3. TRANSFORMATION: Multiple customers describe how the experience changed something meaningful for them. Hook: "She walked in one way. Left completely different."
4. STAFF EXCELLENCE: Multiple reviews praise the same person(s) by name. Hook: "Everyone keeps asking for the same person."
5. EXCEEDED EXPECTATIONS: Multiple customers say it was better than they expected in a very specific way. Hook: "She expected [X]. Got something she didn't expect."

CRITICAL: Every review in reviewIds must genuinely share the theme. 3 tightly matched reviews beats 6 loose ones.

Return ONLY a valid JSON array:
[
  {
    "id": "unique-slug",
    "title": "The shared truth across all these reviews as a scroll-stopping fact (under 10 words)",
    "hook": "5-7 word opener — must be true for ALL reviews in the group",
    "category": "emotion|outcome|staff|service|general",
    "reelCategory": "social_proof",
    "keyPhrase": "the shared emotional experience connecting all these reviews",
    "emoji": "exactly ONE emoji character — never more than one",
    "reviewIds": ["id1", "id2", "id3"],
    "buzzScore": 85,
    "buzzReason": "One plain-English sentence (max 12 words) explaining why this will perform well"
  }
]

BUZZ SCORE RULES (1-100):
- 80-100: Transformation arcs (fear→relief), extreme loyalty, multiple reviews sharing the same surprising emotional truth
- 60-79: Specific staff praised by name, clear before/after outcome, vivid personal stories
- 40-59: Comfort, atmosphere, or value patterns — positive but not emotionally charged
- Below 40: Generic praise with no emotional specificity or hook potential

Return 4–6 themes ranked by buzzScore descending. Return empty array [] if reviews lack clear patterns.`
}

function getEducationalPrompt(reviewList: string, industry: string, businessName: string): string {
  return `You are finding Educational Reel opportunities in these reviews for a ${industry} business called "${businessName}".

Educational reels teach viewers something they didn't know, while using real customer experiences as living proof. The reviews are evidence — not the main content.

REVIEWS:
${reviewList}

Look for signals in these reviews:
- Procedures, treatments, or services customers describe in detail
- Things customers say they "didn't know", "were surprised by", or "didn't expect"
- Implied knowledge gaps ("I thought X but actually Y")
- Outcomes most people outside this business's customers wouldn't know are possible
- Common misconceptions customers had before their visit that turned out to be wrong

Each theme must represent a topic where:
1. Multiple reviews touch on it (directly or indirectly)
2. Most people would NOT know this before visiting
3. Knowing it would make someone MORE likely to book

EDUCATIONAL REEL STRUCTURE: bold contrarian hook → key insight → customer voice (validation) → CTA

HOOKS THAT WORK FOR EDUCATIONAL REELS:
- "Most people don't know [specific fact] is even possible"
- "You've been avoiding [service] for the wrong reason"
- "What [professionals] wish everyone knew before their first visit"
- "[Specific outcome] is possible. Most people just don't know where to go."
- "The one thing causing [common problem most people have]"

Return ONLY a valid JSON array:
[
  {
    "id": "edu-unique-slug",
    "title": "Educational hook as a scroll-stopping statement (under 10 words)",
    "hook": "The contrarian educational claim (5-7 words)",
    "category": "service|outcome|general",
    "reelCategory": "educational",
    "keyPhrase": "the insight or topic that makes this educational",
    "emoji": "exactly ONE emoji character — never more than one",
    "reviewIds": ["id1", "id2"],
    "buzzScore": 78,
    "buzzReason": "One plain-English sentence (max 12 words) explaining why this educates AND converts"
  }
]

BUZZ SCORE RULES for educational (1-100):
- 80-100: Directly addresses a knowledge gap that stops people from booking. Would make a non-customer stop and think "I didn't know that."
- 60-79: Genuinely useful and specific to this business's expertise
- 40-59: Interesting but low booking intent
- Below 40: Too niche or too obvious

Return 1–3 themes. Return empty array [] if no genuine educational opportunities exist in these reviews. Do NOT force themes — quality over quantity.`
}

function getFaqPrompt(reviewList: string, industry: string, businessName: string): string {
  return `You are finding FAQ / Myth-busting Reel opportunities in these reviews for a ${industry} business called "${businessName}".

FAQ reels directly address the fears, concerns, and misconceptions that prevent people from booking. They are the most direct path from hesitation to action.

REVIEWS:
${reviewList}

Look for signals in these reviews:
- Words suggesting pre-visit anxiety: "scared", "nervous", "terrified", "worried", "thought", "expected", "dreaded", "avoided"
- Things customers say were "better than expected" or "not as bad as I thought"
- Common objections customers overcame: pain, cost, time, complexity, embarrassment
- Questions the reviews implicitly answer ("does it hurt?", "is it worth it?", "how long does it take?")
- Fears that turned out to be unfounded

Each theme must represent a genuine fear or misconception that multiple reviews directly or indirectly address.

FAQ REEL STRUCTURE: hook (the fear/myth stated boldly) → the real answer → customer validation → CTA

HOOKS THAT WORK FOR FAQ REELS:
- "Does [service] actually hurt?" (direct fear question)
- "Everyone thinks [myth about the service]. They're wrong."
- "The #1 reason people avoid [this type of business]"
- "I was [scared/skeptical]. Then this happened."
- "[Service] sounds [scary/expensive/complicated]. Here's the truth."

Return ONLY a valid JSON array:
[
  {
    "id": "faq-unique-slug",
    "title": "The myth or fear as a bold scroll-stopping question (under 10 words)",
    "hook": "The fear or myth stated directly (5-7 words)",
    "category": "emotion|service|general",
    "reelCategory": "faq",
    "keyPhrase": "the specific fear or misconception this reel busts",
    "emoji": "exactly ONE emoji character — never more than one",
    "reviewIds": ["id1", "id2", "id3"],
    "buzzScore": 82,
    "buzzReason": "One plain-English sentence (max 12 words) explaining why this fear is a real booking barrier"
  }
]

BUZZ SCORE RULES for FAQ (1-100):
- 80-100: Addresses a fear that actively stops people from booking. High emotional stakes. Would make a hesitant non-customer feel "ok, maybe I should try this."
- 60-79: Reduces hesitation meaningfully for a real segment of people
- 40-59: Answers a question but low purchase-barrier impact
- Below 40: FAQ with no meaningful effect on booking decision

Return 1–3 themes. Return empty array [] if no clear fear or misconception patterns exist. Do NOT invent fears that aren't in the reviews.`
}

async function runAnalysis(
  prompt: string,
  category: 'social_proof' | 'educational' | 'faq'
): Promise<ReelTheme[]> {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (message.content[0] as { text: string }).text
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return []
    const themes = JSON.parse(match[0]) as ReelTheme[]
    // Ensure reelCategory is set correctly regardless of what the AI returned
    return themes.map(t => ({ ...t, reelCategory: category }))
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reviews, businessId, industry = 'other', businessName = '' }: {
      reviews: Review[]
      businessId: string
      industry?: string
      businessName?: string
    } = await req.json()

    if (!reviews?.length) {
      return NextResponse.json({ themes: [] })
    }

    const topReviews = [...reviews]
      .sort((a, b) => scoreReview(b.what_they_liked ?? '', b.star_rating) - scoreReview(a.what_they_liked ?? '', a.star_rating))
      .slice(0, 40)

    const reviewList = buildReviewList(topReviews)
    const categories = CATEGORY_MAP[industry] ?? ['social_proof']

    // Run all applicable category analyses in parallel
    const results = await Promise.all(
      categories.map(cat => {
        if (cat === 'social_proof') return runAnalysis(getSocialProofPrompt(reviewList, industry, businessName), 'social_proof')
        if (cat === 'educational') return runAnalysis(getEducationalPrompt(reviewList, industry, businessName), 'educational')
        if (cat === 'faq')         return runAnalysis(getFaqPrompt(reviewList, industry, businessName), 'faq')
        return Promise.resolve([] as ReelTheme[])
      })
    )

    // Merge all themes and sort by buzzScore descending
    const allThemes = results.flat().sort((a, b) => (b.buzzScore ?? 0) - (a.buzzScore ?? 0))

    // Cache in DB
    if (businessId && allThemes.length > 0) {
      const supabase = await createClient()
      await supabase.from('businesses').update({
        reel_themes: allThemes,
        reel_themes_review_count: reviews.length,
      }).eq('id', businessId)
    }

    return NextResponse.json({ themes: allThemes })
  } catch (err) {
    console.error('[analyze-reviews]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
