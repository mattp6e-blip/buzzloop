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
  return `You are a world-class Instagram Reel director. Find 4–6 powerful Reel themes in these reviews for ${businessName} (${industry}). Each theme must be a SHARED EXPERIENCE across multiple reviews — not a detail from just one.

REVIEWS:
${reviewList}

HOW TO BUILD A GOOD THEME:

A theme is a shared emotional truth that multiple customers experienced. Group reviews by what they have in common at the EMOTIONAL level, not just keywords.

Step 1: Read all reviews. Find groups of 3+ that share the same core emotional experience.
Step 2: Ask: what is the ONE sentence that is true for ALL reviews in this group?
Step 3: That common truth becomes the hook territory.

THE BEST THEME TYPES (ranked by Reel potential):

1. FEAR → RELIEF: Multiple customers mention being scared/terrified/anxious before, but had a great experience. The shared truth: this is the place that cured their fear. Hook: "She cancelled every appointment for years. Then she found this place."

2. EXTREME LOYALTY: Multiple customers went out of their way — travelled far, bring the whole family, return again and again despite having options closer. The shared truth: worth any effort. Hook: "He drives 90 minutes. Every time."

3. COMPLEX MADE EASY: Multiple customers had something they expected to be hard, painful, or complicated — and it wasn't. The shared truth: the thing they dreaded turned out to be nothing. Hook: "She expected the worst. Was back to normal that afternoon."

4. TRANSFORMATION: Multiple customers describe how the experience changed something meaningful — confidence, health, daily life, how they feel about themselves. Hook: "She hid it for years. Not anymore."

5. STAFF MENTIONED BY NAME: Multiple reviews mention the same person(s) as exceptional. The shared truth: specific people make all the difference. Hook: "Everyone keeps asking for the same person."

CRITICAL: Every review in reviewIds must genuinely share the theme. 3 tightly matched reviews beats 6 loose ones. The hook must be true for ALL the reviews in the group, not just the best one.

Return ONLY a valid JSON array:
[
  {
    "id": "unique-slug",
    "title": "The shared truth across all these reviews as a scroll-stopping fact (under 10 words)",
    "hook": "5-7 word opener — must be true for ALL reviews in the group, not just one",
    "category": "emotion|outcome|staff|service|general",
    "reelCategory": "social_proof",
    "keyPhrase": "the shared emotional experience connecting all these reviews",
    "emoji": "exactly ONE emoji character — never more than one",
    "reviewIds": ["id1", "id2", "id3"],
    "buzzScore": 85,
    "buzzReason": "One plain-English sentence (max 12 words) explaining why this will perform well on Instagram"
  }
]

BUZZ SCORE RULES (1-100):
- 80-100: Transformation arcs (fear→relief, anxiety→confidence), extreme loyalty (travelled far, came back repeatedly), multiple reviews sharing the same surprising or emotional truth
- 60-79: Specific staff mentioned by name across reviews, clear before/after outcome, vivid personal stories with specific detail
- 40-59: Comfort, atmosphere, or value patterns that are positive but not emotionally charged
- Below 40: Generic praise with no emotional specificity or hook potential

BUZZ REASON examples:
- "3 customers share a fear→relief arc — stops the scroll immediately"
- "Customers travelled far just to come back — extreme loyalty hook"
- "Same staff member praised by 5 reviewers — personal and trustworthy"
- "Vivid transformation stories with before/after emotional arc"

Return 4–6 themes ranked by buzzScore descending, strongest first.`
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
      model: 'claude-sonnet-4-6',
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
      .slice(0, 20)

    const reviewList = buildReviewList(topReviews)
    const baseCategories = CATEGORY_MAP[industry] ?? ['social_proof']
    // Gate educational + faq — need enough material to find real patterns
    const categories = topReviews.length >= 15
      ? baseCategories
      : baseCategories.filter(c => c === 'social_proof')

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
