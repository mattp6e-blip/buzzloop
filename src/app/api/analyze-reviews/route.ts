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

// ── Social proof prompt (review-based) ───────────────────────────────────────

function getAnalysisPrompt(reviewList: string, industry: string, businessName: string, reviewCount: number, language: string): string {
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

// ── Content variety prompt (educational / experience / etc) ───────────────────

const VARIETY_BY_INDUSTRY: Record<string, { type: string; title: string; hook: string; keyPhrase: string; emoji: string }[]> = {
  dental: [
    { type: 'educational', title: 'What actually happens during an implant', hook: 'What actually happens during an implant.', keyPhrase: 'dental implant procedure step by step', emoji: '🦷' },
    { type: 'myth_bust',   title: 'The truth about dental pain in 2024',     hook: 'Most people avoid the dentist for this reason.',  keyPhrase: 'dental anxiety and pain myths', emoji: '💡' },
  ],
  clinic: [
    { type: 'educational', title: 'What to expect at your first appointment', hook: 'What actually happens at your first visit.', keyPhrase: 'first clinic visit what to expect', emoji: '🏥' },
    { type: 'myth_bust',   title: 'The most common health misconception',     hook: 'Most people get this completely wrong.',           keyPhrase: 'common health misconception', emoji: '💡' },
  ],
  physiotherapy: [
    { type: 'educational', title: 'How physiotherapy actually speeds recovery', hook: 'Why your body heals faster with this.',    keyPhrase: 'physiotherapy recovery mechanism', emoji: '💪' },
    { type: 'myth_bust',   title: 'Why you should not push through the pain',  hook: 'Stop telling yourself to push through it.',     keyPhrase: 'pain misconception in physio', emoji: '💡' },
  ],
  veterinary: [
    { type: 'educational', title: 'Signs your pet is hiding pain from you', hook: 'Your pet is hiding this from you.',          keyPhrase: 'pet pain signs owners miss', emoji: '🐾' },
    { type: 'myth_bust',   title: 'The biggest myth about pet dental health', hook: 'Most pet owners believe this. It is wrong.',     keyPhrase: 'pet dental health myths', emoji: '💡' },
  ],
  gym: [
    { type: 'educational', title: 'The training mistake most beginners make', hook: 'The mistake 90% of beginners make on week one.', keyPhrase: 'beginner training mistake', emoji: '🏋️' },
    { type: 'behind_scenes', title: 'How we build a training programme for you', hook: 'What goes into building your programme.',       keyPhrase: 'personalised training programme process', emoji: '📋' },
  ],
  salon: [
    { type: 'educational',   title: 'How to make your colour last twice as long', hook: 'Your colour is fading faster than it should.', keyPhrase: 'hair colour maintenance at home', emoji: '✂️' },
    { type: 'behind_scenes', title: 'What actually goes into a perfect balayage',  hook: 'What actually goes into a balayage.',          keyPhrase: 'balayage technique and craft', emoji: '🎨' },
  ],
  spa: [
    { type: 'educational', title: 'What your body actually needs after a massage', hook: 'What to do in the hour after your massage.',  keyPhrase: 'post-massage body care', emoji: '🧘' },
    { type: 'experience',  title: 'What our signature experience feels like',      hook: 'What the first five minutes feel like here.',  keyPhrase: 'signature spa experience', emoji: '✨' },
  ],
  restaurant: [
    { type: 'behind_scenes', title: 'How our signature dish is actually made',  hook: 'What goes into our most ordered dish.',         keyPhrase: 'signature dish preparation', emoji: '👨‍🍳' },
    { type: 'experience',    title: 'What a Friday night here actually looks like', hook: 'What a Friday night here actually looks like.', keyPhrase: 'restaurant atmosphere Friday night', emoji: '🍽️' },
  ],
  bar: [
    { type: 'behind_scenes', title: 'How our signature cocktail is made',    hook: 'Three ingredients. One reason people come back.', keyPhrase: 'signature cocktail process', emoji: '🍸' },
    { type: 'experience',    title: 'What our busiest night actually looks like', hook: 'What our Saturday night actually looks like.',  keyPhrase: 'bar atmosphere Saturday night', emoji: '🎉' },
  ],
  hotel: [
    { type: 'local_guide', title: 'The spot our guests ask about every checkout', hook: 'The spot every single guest asks us about.',   keyPhrase: 'local hidden gem near hotel', emoji: '📍' },
    { type: 'experience',  title: 'What our guests find every morning',           hook: 'What our guests wake up to every morning.',    keyPhrase: 'hotel morning guest experience', emoji: '🌅' },
  ],
  lawyer: [
    { type: 'educational', title: 'What actually happens at your first legal consultation', hook: 'What actually happens at your first consultation.', keyPhrase: 'first legal consultation process', emoji: '⚖️' },
    { type: 'myth_bust',   title: 'The biggest myth stopping people from getting help',     hook: 'Most people wait too long because of this.',       keyPhrase: 'legal help misconception', emoji: '💡' },
  ],
  tattoo: [
    { type: 'educational',   title: 'How to make your tattoo heal perfectly',  hook: 'Most people ruin their tattoo in the first week.', keyPhrase: 'tattoo aftercare healing', emoji: '🎨' },
    { type: 'behind_scenes', title: 'How a custom design actually comes together', hook: 'What goes into designing your tattoo.',           keyPhrase: 'custom tattoo design process', emoji: '✏️' },
  ],
  optician: [
    { type: 'educational', title: 'Signs your vision prescription has changed',    hook: 'Your prescription changed. You just did not notice.', keyPhrase: 'vision prescription change signs', emoji: '👁️' },
    { type: 'myth_bust',   title: 'The screen time myth your optician wants to bust', hook: 'Screens are not ruining your eyes. Here is what is.',  keyPhrase: 'screen time eye health myth', emoji: '💡' },
  ],
  other: [
    { type: 'educational',   title: 'What most people do not know about this service', hook: 'What most people never ask about this.', keyPhrase: 'industry knowledge most customers miss', emoji: '📚' },
    { type: 'behind_scenes', title: 'What goes into what we do',                       hook: 'What actually goes into this.',          keyPhrase: 'behind the scenes process', emoji: '🎬' },
  ],
}

function getVarietyPrompt(industry: string, businessName: string, reviewList: string, language: string): string {
  const templates = VARIETY_BY_INDUSTRY[industry] ?? VARIETY_BY_INDUSTRY.other

  return `You are a content strategist for ${businessName} (${industry}). Generate exactly ${templates.length} content variety themes — educational and experience content that helps this business grow beyond social proof.

LANGUAGE: Write every field in ${language}.

REVIEWS (use these to find the most relevant closing quote for each theme):
${reviewList}

---

Generate EXACTLY these ${templates.length} themes in this order:
${templates.map((t, i) => `
Theme ${i + 1}:
- contentType: "${t.type}"
- Suggested title: "${t.title}"
- Suggested hook: "${t.hook}"
- keyPhrase: "${t.keyPhrase}"
- emoji: "${t.emoji}"
- Adapt the title and hook to fit the specific business based on the reviews — keep the same angle but make it specific
- reviewIds: pick the 1-2 review IDs most topically relevant to this theme
- anchorReviewId: the single review whose quote would best close this reel emotionally`).join('\n')}

---

Return ONLY valid JSON:
{
  "themes": [
    {
      "id": "unique-slug",
      "title": "Adapted title (under 10 words)",
      "hook": "Adapted hook (max 10 words)",
      "reelType": "pattern",
      "contentType": "${templates[0]?.type ?? 'educational'}",
      "keyPhrase": "core topic",
      "emoji": "ONE emoji",
      "reviewIds": ["id1"],
      "anchorReviewId": "id1",
      "buzzReason": "One sentence explaining why this content helps this business grow"
    }
  ]
}`
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
        max_tokens: 1500,
        system: langSystem,
        messages: [{ role: 'user', content: getVarietyPrompt(industry, businessName, reviewList, language) }],
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
    const sorted_themes = [...proofSorted, ...varietyThemes]

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
