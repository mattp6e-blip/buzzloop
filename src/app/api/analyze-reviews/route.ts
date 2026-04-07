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

const CONTENT_VARIETY_BY_INDUSTRY: Record<string, string> = {
  dental:        'educational (what happens during a specific procedure e.g. implants, whitening, Invisalign), myth_bust (common fears about dental treatment e.g. pain, cost, needles)',
  clinic:        'educational (how a treatment or diagnostic process works), myth_bust (common misconceptions about the condition or treatment)',
  physiotherapy: 'educational (how a specific technique or recovery process works), myth_bust (why people avoid physio when they shouldn\'t)',
  veterinary:    'educational (what to expect at a specific visit type), myth_bust (common pet health misconceptions)',
  gym:           'educational (a specific training technique or nutrition principle), behind_scenes (how coaches build a training program)',
  salon:         'educational (how to maintain a specific style or treatment at home), behind_scenes (the craft behind a specific technique)',
  spa:           'educational (what a specific treatment actually does for your body), experience (what the signature experience feels like)',
  restaurant:    'behind_scenes (how a signature dish or ingredient is prepared), experience (what a specific occasion or atmosphere feels like)',
  bar:           'behind_scenes (how a signature cocktail is made), experience (what a Friday night or special event looks like)',
  hotel:         'local_guide (hidden local spots your guests always ask about), experience (what your signature guest moment looks like)',
  lawyer:        'educational (what to expect in a specific legal process), myth_bust (common misconceptions that stop people from getting help)',
  tattoo:        'educational (the healing process and aftercare), behind_scenes (how a specific style or design comes together)',
  optician:      'educational (how a specific eye condition or lens technology works), myth_bust (common misconceptions about eye health)',
  other:         'educational (something specific to your industry that most customers don\'t know), behind_scenes (how something distinctive about your service is done)',
}

function getAnalysisPrompt(reviewList: string, industry: string, businessName: string, reviewCount: number, language: string): string {
  const varietyGuide = CONTENT_VARIETY_BY_INDUSTRY[industry] ?? CONTENT_VARIETY_BY_INDUSTRY.other

  return `You are the creative director and strategist behind the highest-performing local business Instagram Reels. Your job is to build a full content plan — a mix of review-based social proof AND educational/experience content — that genuinely helps this business grow.

Business: ${businessName} (${industry})
Total qualifying reviews: ${reviewCount}

REVIEWS (sorted by remarkability — strongest raw material first):
${reviewList}

---

LANGUAGE: Write every field of your JSON in ${language}. Do not translate or change language.

---

## PART 1 — SOCIAL PROOF THEMES (2-3 themes, from reviews)

Find the best review-based reel ideas. Each is one of two types:

### TYPE: story
Built around ONE extraordinary review. The anchor sentence is so specific and surprising it can carry a full reel on its own.

What makes an anchor sentence extraordinary:
- Behavioral proof (flew from abroad, drove 2 hours, chose this over a free/closer option)
- Expectation violation (fell asleep in the dentist chair, fixed in 20 min what 3 others couldn't)
- Specific number + context (37 years, every Friday for 6 years, 4 cancellations before coming)
- Unexpected advocate (child chose it, expert with all options chose this, skeptic converted)

Hook: customer as subject, never the business.
GOOD: "She flies from Norway. Free dentistry there."
BAD: "Our patients travel from around the world."

### TYPE: pattern
Built around a SHARED SIGNAL across 3+ reviews. Multiple customers noticed the same specific thing.

Hook: reveals the shared truth as a surprising fact.
GOOD: "Three different people. Same story. They all came back."
BAD: "Our customers love the experience."

For social proof themes: set contentType to "social_proof".

---

## PART 2 — CONTENT VARIETY THEMES (2-3 themes, NOT from reviews)

These themes help the business grow beyond social proof. They educate, inspire, and differentiate.
For ${industry}, the best variety themes are: ${varietyGuide}

Rules for content variety themes:
- hook: A question, surprising fact, or common misconception — NOT a customer quote
- reviewIds: The 1-2 most topically relevant reviews (used as closing emotional proof, not the main story)
- anchorReviewId: The single most relevant review for this topic (the one whose quote best closes the reel)
- buzzScore: Omit or set to 72
- contentType: one of "educational" | "myth_bust" | "experience" | "local_guide" | "behind_scenes" | "trust"
- reelType: use "pattern" for variety themes

GOOD educational hook: "What actually happens during an implant. Step by step."
GOOD myth_bust hook: "Most people avoid implants because of this. Let's talk."
GOOD experience hook: "What our guests find on their pillow every morning."
BAD: "We offer the best dental care in the city."

---

BUZZ SCORE for social proof themes (1-100):
90-100: The hook writes itself. Behavioral proof or expectation violation so strong a stranger stops.
75-89: Strong specific material. Needs light shaping but the raw content is there.
60-74: Good material but hook requires more work to land.

---

IMPORTANT:
- Social proof: only include if the anchor or pattern is genuinely remarkable
- Content variety: always include 2-3 — they're guaranteed value even with few reviews
- Total themes: 5-7 (mix of both parts)
- List social proof themes first (highest buzz score), then content variety

Return ONLY valid JSON:
{
  "language": "English",
  "themes": [
    {
      "id": "unique-slug",
      "title": "The reel idea as a scroll-stopping fact (under 10 words)",
      "hook": "The specific hook (max 8 words)",
      "reelType": "story | pattern",
      "contentType": "social_proof | educational | myth_bust | experience | local_guide | behind_scenes | trust",
      "keyPhrase": "the core topic or remarkable thing",
      "emoji": "ONE emoji",
      "reviewIds": ["id1", "id2"],
      "anchorReviewId": "id1",
      "buzzScore": 85,
      "buzzReason": "One sentence, max 12 words, explaining the hook potential"
    }
  ]
}

For story reels: reviewIds contains anchor + 1-2 supporting. anchorReviewId is the primary.
For pattern reels: reviewIds contains all reviews sharing the pattern (min 3). anchorReviewId omitted.
For content variety: reviewIds contains 1-2 topically relevant reviews. anchorReviewId is the best closing quote.`
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
