import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { Review, ReelTheme } from '@/types'

const client = new Anthropic()

function buildReviewList(reviews: Review[]): string {
  return reviews.map(r => {
    const anchor = r.anchor_sentence ? ` [ANCHOR: "${r.anchor_sentence}"]` : ''
    return `[ID: ${r.id}] ${r.star_rating}★ — "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}${anchor}`
  }).join('\n')
}

function getAnalysisPrompt(reviewList: string, industry: string, businessName: string, reviewCount: number, language: string): string {
  return `You are the creative director and strategist behind the highest-performing local business Instagram Reels. Your job is to find the reel ideas that will genuinely stop someone's scroll and make them want to visit this business.

Business: ${businessName} (${industry})
Total qualifying reviews: ${reviewCount}

REVIEWS (sorted by remarkability — strongest raw material first):
${reviewList}

---

LANGUAGE: Write every field of your JSON in ${language}. Do not translate or change language.

---

YOUR TASK: Find the best reel ideas in these reviews. Each idea is one of two types:

## TYPE 1 — STORY REEL
Built around ONE extraordinary review. The anchor sentence is so specific and surprising that it can carry a full reel on its own.

What makes an anchor sentence extraordinary:
- Behavioral proof (flew from abroad, drove 2 hours, extended their stay, chose this over a free/closer option)
- Expectation violation (fell asleep in the dentist chair, fixed in 20 min what 3 others couldn't, didn't feel a thing)
- Specific number + context (37 years, every Friday for 6 years, 4 cancellations before finally coming)
- Unexpected advocate (child chose it, expert with all options chose this, skeptic converted)

The hook for a Story reel comes directly from the anchor sentence. Customer is the subject — never the business.
GOOD: "She flies from Norway. Free dentistry there."
BAD: "Our patients travel from around the world to see us."

## TYPE 2 — PATTERN REEL
Built around a SHARED SIGNAL across 3+ reviews. Multiple customers noticed the same specific thing.

What makes a strong pattern:
- Same staff member mentioned by name across reviews (not just "the staff was great")
- Same service/treatment mentioned with consistent detail
- Same unexpected behavior repeated (multiple people mentioning they came back after trying competitors)
- Same emotional journey that multiple reviewers describe with specific detail

The hook for a Pattern reel reveals the shared truth as a surprising fact.
GOOD: "Three different people. Same story. They all came back."
BAD: "Our customers love the experience."

---

BUZZ SCORE (1-100) — measures hook potential only:
90-100: The hook writes itself. Behavioral proof or expectation violation so strong a stranger stops scrolling.
75-89: Strong specific material. Needs light shaping but the raw content is there.
60-74: Good material but hook requires more work to land. Supporting evidence is solid.
Below 60: Interesting but no single hook moment.

---

IMPORTANT:
- Only include themes where you can write a hook that does NOT name the business or sound like an ad
- Story reels need one extraordinary anchor — do not include if anchor sentence is generic
- Pattern reels need 3+ reviews genuinely sharing the signal — do not force patterns
- Return 4-8 themes maximum, ranked by buzzScore descending
- Quality over quantity — 4 strong themes beats 8 mediocre ones

Return ONLY valid JSON with this exact shape:
{
  "language": "English",
  "themes": [
    {
      "id": "unique-slug",
      "title": "The reel idea as a scroll-stopping fact (under 10 words)",
      "hook": "The specific hook — customer as subject, no business name (max 8 words)",
      "reelType": "story | pattern",
      "keyPhrase": "the specific thing that makes this remarkable",
      "emoji": "ONE emoji",
      "reviewIds": ["id1", "id2"],
      "anchorReviewId": "id1",
      "buzzScore": 85,
      "buzzReason": "One sentence, max 12 words, explaining why this stops the scroll"
    }
  ]
}

For story reels: reviewIds contains the anchor + 1-2 supporting reviews. anchorReviewId is the primary.
For pattern reels: reviewIds contains all reviews sharing the pattern (min 3). anchorReviewId is null or omitted.`
}

export async function POST(req: NextRequest) {
  try {
    const { reviews: rawReviews, businessId, industry = 'other', businessName = '', language = 'English' }: {
      reviews: Review[]
      businessId: string
      industry?: string
      businessName?: string
      language?: string
    } = await req.json()

    if (!rawReviews?.length) {
      return NextResponse.json({ themes: [] })
    }

    // Use GBP reviews only
    const gbpReviews = rawReviews.filter(r => r.posted_to_google)
    if (!gbpReviews.length) return NextResponse.json({ themes: [] })

    // Sort by remarkability score (scored reviews first, then unscored by length as proxy)
    const sorted = [...gbpReviews].sort((a, b) => {
      const aScore = a.remarkability_score ?? (a.what_they_liked.length > 100 ? 30 : 10)
      const bScore = b.remarkability_score ?? (b.what_they_liked.length > 100 ? 30 : 10)
      return bScore - aScore
    })

    // Tiered input: feed top reviews based on total count
    const inputCap = sorted.length <= 10 ? sorted.length
      : sorted.length <= 30 ? Math.min(sorted.length, 20)
      : sorted.length <= 100 ? 40
      : 60

    const topReviews = sorted.slice(0, inputCap)
    const reviewList = buildReviewList(topReviews)

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 3000,
      system: `You must respond in ${language} only. Every word of your JSON output must be in ${language}. This is non-negotiable regardless of the business name or location.`,
      messages: [{ role: 'user', content: getAnalysisPrompt(reviewList, industry, businessName, gbpReviews.length, language) }],
    })

    const text = (message.content[0] as { text: string }).text
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ themes: [] })

    const parsed = JSON.parse(match[0])
    const themes: ReelTheme[] = parsed.themes ?? (Array.isArray(parsed) ? parsed : [])
    const sorted_themes = themes.sort((a, b) => (b.buzzScore ?? 0) - (a.buzzScore ?? 0))

    // Cache in DB
    if (businessId && sorted_themes.length > 0) {
      const supabase = await createClient()
      await supabase.from('businesses').update({
        reel_themes: sorted_themes,
        reel_themes_review_count: gbpReviews.length,
      }).eq('id', businessId)
    }

    return NextResponse.json({ themes: sorted_themes, language })
  } catch (err) {
    console.error('[analyze-reviews]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
