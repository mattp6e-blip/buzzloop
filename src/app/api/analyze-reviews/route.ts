import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { Review, ReelTheme } from '@/types'

function currentWeekOf(): string {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

const client = new Anthropic()

export function buildReviewList(reviews: Review[]): string {
  return reviews.map(r => {
    const anchor = r.anchor_sentence ? ` [ANCHOR: "${r.anchor_sentence}"]` : ''
    return `[ID: ${r.id}] ${r.star_rating}★ — "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}${anchor}`
  }).join('\n')
}

// ── Social proof prompt (review-based) ───────────────────────────────────────

export function getAnalysisPrompt(reviewList: string, industry: string, businessName: string, reviewCount: number, language: string): string {
  return `You are the creative director behind the highest-performing local business Instagram Reels. Find the reel ideas that will genuinely stop someone's scroll.

Business: ${businessName} (${industry})
Total qualifying reviews: ${reviewCount}

REVIEWS (sorted by remarkability — strongest raw material first):
${reviewList}

---

LANGUAGE: Write every field of your JSON in ${language}.

---

Find the best review-based reel ideas. Each is one of two types:

## TYPE: story
Built around ONE extraordinary review. The anchor sentence is so specific and surprising it can carry a full reel.

What makes an anchor sentence extraordinary:
- Behavioral proof (flew from abroad, drove 2 hours, chose this over a free/closer option)
- Expectation violation (fell asleep in the dentist chair, fixed in 20 min what 3 others couldn't)
- Specific number + context (37 years, every Friday for 6 years, 4 cancellations before coming)
- Unexpected advocate (child chose it, expert with all options chose this, skeptic converted)

Hook: customer as subject, never the business.
GOOD: "She flies from Norway. Free dentistry there."
BAD: "Our patients travel from around the world."

## TYPE: pattern
Built around a SHARED SIGNAL across 3+ reviews. Multiple customers noticed the same specific thing.

Hook: reveals the shared truth as a surprising fact.
GOOD: "Three different people. Same story. They all came back."
BAD: "Our customers love the experience."

---

BUZZ SCORE (1-100):
90-100: Hook writes itself. Behavioral proof or expectation violation so strong a stranger stops scrolling.
75-89: Strong specific material. Needs light shaping.
60-74: Good material but hook requires more work.
Below 60: Interesting but no single hook moment.

---

RULES:
- Only include themes where the hook does NOT name the business or sound like an ad
- Story reels need one extraordinary anchor — skip if anchor is generic
- Pattern reels need 3+ reviews genuinely sharing the signal
- Never generate two themes built around the same underlying story or behaviour (e.g. if one theme is about travelling from abroad, do not create a second theme also about travelling from abroad)
- Return 3-5 themes maximum, ranked by buzzScore descending
- Set contentType to "social_proof" for all themes

Return ONLY valid JSON:
{
  "themes": [
    {
      "id": "unique-slug",
      "title": "Reel idea as scroll-stopping fact (under 10 words)",
      "hook": "The hook — customer as subject, no business name (max 8 words)",
      "reelType": "story | pattern",
      "contentType": "social_proof",
      "keyPhrase": "the specific remarkable thing",
      "emoji": "ONE emoji",
      "reviewIds": ["id1", "id2"],
      "anchorReviewId": "id1",
      "buzzScore": 85,
      "buzzReason": "One sentence, max 12 words, explaining why this stops the scroll"
    }
  ]
}

For story reels: reviewIds = anchor + 1-2 supporting reviews. anchorReviewId = primary.
For pattern reels: reviewIds = all reviews sharing the pattern (min 3). anchorReviewId omitted.`
}

// ── Audience-first variety prompt ─────────────────────────────────────────────

export function getVarietyPrompt(industry: string, businessName: string, reviewList: string, language: string, businessContext?: string | null): string {
  const contextBlock = businessContext
    ? `\nBUSINESS CONTEXT (from their website — use this to make every reel idea specific to what they actually offer and who they serve):\n${businessContext}\n`
    : ''

  return `You are a content strategist who understands what makes strangers stop scrolling on Instagram and TikTok.

Business: ${businessName} (${industry})
LANGUAGE: Write every field in ${language}.
${contextBlock}
YOUR JOB: Generate 5 "Grow your audience" Reel ideas for this business. These are NOT review-based reels. They attract NEW potential customers who have never heard of this business.

Think like someone at 11pm on their phone who is:
- About to book their first visit but has an unspoken fear
- Googling questions they're embarrassed to ask
- Putting off a decision because of a myth or misconception
- Curious about what actually happens behind the scenes
- Would share this with a friend because it surprised them

Use the business context above to make each idea SPECIFIC — name the actual treatment, service, or process. Generic reel ideas are worthless. A reel about "dental implants in a single day" beats "something about dentistry."

CONTENT TYPES — use a variety, don't repeat the same type twice:
- educational: Step-by-step reveal of something most people misunderstand about a specific service this business offers
- myth_bust: A widespread belief that is wrong and holding people back from booking this specific service
- experience: What it actually feels like for a nervous first-timer at THIS type of business (sensory, specific)
- behind_scenes: A process most customers never see that would reassure or impress them
- trust: A number, credential, or fact about this specific business that earns trust before the viewer even asks

HOOK RULES:
- Must work on a complete stranger with zero context about this business
- Creates curiosity, names a fear, or states a surprising truth
- Never sounds like an ad. Never names the business.
- Max 8 words. Short sentences. No filler.

GOOD hooks: "Most people wait too long. Here's the cost." / "What actually happens in the first 10 minutes." / "You're not supposed to feel anything. Most do."
BAD hooks: "We offer a great experience." / "Come visit us today." / "Here's what we do."

---

REVIEWS — use these ONLY to find the best closing quote for each theme. Pick the 1 review whose quote emotionally validates what the reel teaches. Do NOT base the topic itself on the reviews.
${reviewList}

---

Return ONLY valid JSON with exactly 5 themes:
{
  "themes": [
    {
      "id": "unique-slug",
      "title": "Reel idea as a scroll-stopping fact (under 10 words)",
      "hook": "The hook — curiosity, fear, or surprising truth (max 8 words)",
      "reelType": "pattern",
      "contentType": "educational | myth_bust | experience | behind_scenes | trust",
      "keyPhrase": "the core topic in 4-6 words",
      "emoji": "ONE relevant emoji",
      "reviewIds": ["id1"],
      "anchorReviewId": "id1",
      "buzzReason": "One sentence: why would a stranger stop scrolling for this?"
    }
  ]
}`
}

export async function POST(req: NextRequest) {
  try {
    const { reviews: rawReviews, businessId, industry = 'other', businessName = '', language = 'English', businessContext }: {
      reviews: Review[]
      businessId: string
      industry?: string
      businessName?: string
      language?: string
      businessContext?: string | null
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
    const langSystem = `You must respond in ${language} only. Every word of your JSON output must be in ${language}. This is non-negotiable regardless of the business name or location.`

    // Run social proof analysis + content variety generation in parallel
    const [proofMessage, varietyMessage] = await Promise.all([
      client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        system: langSystem,
        messages: [{ role: 'user', content: getAnalysisPrompt(reviewList, industry, businessName, gbpReviews.length, language) }],
      }),
      client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2500,
        system: langSystem,
        messages: [{ role: 'user', content: getVarietyPrompt(industry, businessName, reviewList, language, businessContext) }],
      }),
    ])

    const parseThemes = (text: string): ReelTheme[] => {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) return []
      try {
        const parsed = JSON.parse(match[0])
        return parsed.themes ?? (Array.isArray(parsed) ? parsed : [])
      } catch { return [] }
    }

    const proofThemes = parseThemes((proofMessage.content[0] as { text: string }).text)
    const varietyThemes = parseThemes((varietyMessage.content[0] as { text: string }).text)

    // Social proof sorted by buzzScore, variety appended after
    const proofSorted = proofThemes.sort((a, b) => (b.buzzScore ?? 0) - (a.buzzScore ?? 0))
    const weekOf = currentWeekOf()
    const sorted_themes = [...proofSorted, ...varietyThemes].map(t => ({ ...t, weekOf }))

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
