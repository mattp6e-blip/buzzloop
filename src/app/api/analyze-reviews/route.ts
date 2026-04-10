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

// ── Industry content mix ──────────────────────────────────────────────────────

function getIndustryConfig(industry: string): {
  contentFocus: string
  hookFrameworks: string
  avoidTypes: string
} {
  const configs: Record<string, { contentFocus: string; hookFrameworks: string; avoidTypes: string }> = {
    restaurant: {
      contentFocus: 'Sensory and emotional. Make people hungry, envious, or feel like they are missing out. Nobody wants to be educated about food — they want to feel something.',
      hookFrameworks: `PROVEN FRAMEWORKS FOR RESTAURANTS:
1. SENSORY REVEAL: "What [signature dish] looks like when it's done right." — triggers craving, FOMO
2. LOYALTY BEHAVIOR: "The table they book [X weeks] in advance. Every [day]." — behavioral proof from reviews
3. ATMOSPHERE MOMENT: "What a [Friday/Saturday] night here actually looks like." — puts viewer inside the experience
4. DRIVE-FOR-IT: "She drove [distance] for this. Came back [frequency]." — needs review evidence
5. BEHIND THE PASS: "What goes into [signature dish] that most people never see." — craft reveal, earns respect`,
      avoidTypes: 'educational, myth_bust — nobody wants a food science lesson',
    },
    bar: {
      contentFocus: 'Atmosphere, craft, FOMO. Make people feel like they are missing the best night out.',
      hookFrameworks: `PROVEN FRAMEWORKS FOR BARS:
1. ATMOSPHERE MOMENT: "What a [night/Friday] here actually looks like."
2. CRAFT REVEAL: "How we actually make [signature cocktail]. It's not what you think."
3. LOYALTY: "He's been here every [day] for [time]. Same order."
4. SENSORY: "What [signature drink/dish] looks like when it's done right."
5. HIDDEN GEM: "The [menu item] nobody orders. It's the best thing we make."`,
      avoidTypes: 'educational — nobody wants a cocktail chemistry lesson',
    },
    hotel: {
      contentFocus: 'Aspiration, experience, hidden details. Make people want to stay there.',
      hookFrameworks: `PROVEN FRAMEWORKS FOR HOTELS:
1. HIDDEN DETAIL: "The thing guests find in their room every morning."
2. LOYALTY: "She stays here every time she visits [city]. Her reason:"
3. LOCAL SECRET: "The spot our guests ask about every single checkout."
4. EXPERIENCE: "What checking in here actually feels like."
5. BEHIND THE SCENES: "What happens before you arrive that you never see."`,
      avoidTypes: 'myth_bust — hotel guests don\'t have misconceptions to bust',
    },
    gym: {
      contentFocus: 'Transformation, results, community. Show what\'s possible. Address the fear of starting.',
      hookFrameworks: `PROVEN FRAMEWORKS FOR GYMS:
1. TRANSFORMATION: "She came in [state/fear]. [Time] later: [result]." — needs review evidence
2. FEAR ADDRESSED: "The thing stopping most people from starting. It's not what you think."
3. MYTH BUST: "The [exercise/belief] everyone gets wrong. Here's why it matters."
4. COMMUNITY PROOF: "He hasn't missed [frequency] in [time]. His reason:" — needs review evidence
5. FIRST SESSION: "What the first [class/session] actually feels like. Nobody tells you this."`,
      avoidTypes: 'local_guide, trust — not relevant',
    },
    salon: {
      contentFocus: 'Transformation, aspiration, results. Show what\'s possible. The before/after is the story.',
      hookFrameworks: `PROVEN FRAMEWORKS FOR SALONS:
1. TRANSFORMATION: "[Hair/look problem] for [time]. Here's what changed."  — needs review evidence
2. FEAR OVERCOME: "She was nervous about [change]. Here's what happened."
3. PROCESS REVEAL: "What [service] actually looks like. From start to finish."
4. LOYALTY: "She's been coming every [frequency] for [time]. Same stylist every time." — review evidence
5. MYTH BUST: "The [service] most people are afraid to try. Here's why they shouldn't be."`,
      avoidTypes: 'educational, trust — not relevant for salons',
    },
    spa: {
      contentFocus: 'Sensory experience, transformation, escape. Make people feel relaxed just watching.',
      hookFrameworks: `PROVEN FRAMEWORKS FOR SPAS:
1. SENSORY: "What [signature treatment] actually feels like. From the first minute."
2. TRANSFORMATION: "She came in [stressed/state]. Left [feeling]. Her words:"  — review evidence
3. MYTH BUST: "Most people think [treatment] is [misconception]. Here's the truth."
4. PROCESS REVEAL: "What happens in the first 10 minutes of [treatment]. Nobody shows this."
5. LOYALTY: "She books every [frequency]. Has for [time]." — review evidence`,
      avoidTypes: 'educational — spa guests want to feel, not learn',
    },
    dental: {
      contentFocus: 'Address real fears. Teach things that change decisions. The viewer has unspoken anxiety — meet it directly.',
      hookFrameworks: `PROVEN FRAMEWORKS FOR DENTAL:
1. FEAR OVERCOME: "Most people avoid [treatment] because of [specific fear]. Here's what actually happens." — myth_bust
2. PROCESS REVEAL: "What actually happens in the first [X] minutes. Nobody explains this." — behind_scenes
3. COST OF WAITING: "The [symptom] most people ignore. What it becomes in [time]." — educational
4. EXPECTATION FLIP: "She expected [negative]. Instead: [positive surprise]." — needs review evidence
5. CAPABILITY PROOF: "[Treatment] in [surprisingly short time]. Most don't know this exists." — educational`,
      avoidTypes: 'experience, local_guide — not relevant',
    },
    physiotherapy: {
      contentFocus: 'Teach. Address fears about pain and recovery. Show results.',
      hookFrameworks: `PROVEN FRAMEWORKS FOR PHYSIO:
1. MYTH BUST: "Most people think [pain/problem] means [wrong conclusion]. It doesn't."
2. PROCESS: "What the first session actually involves. Most people are surprised."
3. COST OF IGNORING: "[Pain signal] that most people push through. Here's what it means."
4. TRANSFORMATION: "[Problem] for [time]. Fixed in [X sessions]." — needs review evidence
5. FEAR ADDRESSED: "You think you need surgery. You probably don't. Here's why."`,
      avoidTypes: 'experience, local_guide',
    },
    veterinary: {
      contentFocus: 'Reassure worried pet owners. Teach things that affect pet health. Show care.',
      hookFrameworks: `PROVEN FRAMEWORKS FOR VETS:
1. HIDDEN SIGN: "The [sign] in your dog/cat most owners miss. What it means."
2. FEAR ADDRESSED: "She was terrified to bring him in. Here's what happened."
3. MYTH BUST: "Most owners think [belief]. Vets disagree. Here's why."
4. PROCESS: "What a routine checkup actually involves. From your pet's perspective."
5. LOYALTY: "She's been bringing [pet] here for [time]. Her reason:" — review evidence`,
      avoidTypes: 'local_guide',
    },
    optician: {
      contentFocus: 'Teach. Correct assumptions. Address fears about eye health.',
      hookFrameworks: `PROVEN FRAMEWORKS FOR OPTICIANS:
1. COST OF WAITING: "The [symptom] most people ignore. What it means in [time]."
2. MYTH BUST: "Most people think [belief about eyes/glasses]. Opticians disagree."
3. PROCESS: "What actually happens during an eye test. Most people don't know."
4. FEAR: "She put it off for [time]. Here's what she found out."
5. TECH REVEAL: "The [equipment/test] that can detect [condition] before symptoms appear."`,
      avoidTypes: 'experience, local_guide',
    },
  }

  const healthIndustries = ['dental', 'physiotherapy', 'veterinary', 'optician']
  const isHealth = healthIndustries.includes(industry)

  return configs[industry] ?? {
    contentFocus: isHealth
      ? 'Teach, address fears, show results. The viewer has questions they haven\'t asked.'
      : 'Create emotional connection. Make people feel something about this business.',
    hookFrameworks: `PROVEN FRAMEWORKS:
1. UNEXPECTED BEHAVIOR: Specific customer action that implies quality without stating it.
2. FEAR ADDRESSED: The real hesitation most people have. Met directly.
3. PROCESS REVEAL: Something about how this works that most people would never guess.
4. TRANSFORMATION: Before → after. Specific, not generic.
5. LOYALTY PROOF: Frequency or sacrifice that proves quality.`,
    avoidTypes: 'nothing specific',
  }
}

// ── Top-down hook prompt ───────────────────────────────────────────────────────

export function getVarietyPrompt(industry: string, businessName: string, reviewList: string, language: string, businessContext?: string | null): string {
  const contextBlock = businessContext
    ? `\nBUSINESS CONTEXT (use this to make every idea specific to what they actually offer):\n${businessContext}\n`
    : ''

  const { contentFocus, hookFrameworks, avoidTypes } = getIndustryConfig(industry)

  return `You are a creative director who builds scroll-stopping Reels for local businesses. You start with a strong hook concept, then find the review evidence that makes it real.

Business: ${businessName} (${industry})
LANGUAGE: Write every field in ${language}.
${contextBlock}
CONTENT FOCUS FOR THIS INDUSTRY:
${contentFocus}

AVOID: ${avoidTypes}

---

${hookFrameworks}

---

YOUR PROCESS — two-direction thinking:

DIRECTION 1 — Hook first, then evidence:
Take each framework above. Ask: does this business have review material that fits? If yes, build the reel. If no, build it from industry knowledge alone (no fabrication — just what's true about this type of business).

DIRECTION 2 — Evidence first, then hook:
Scan the reviews for anything specific and surprising that doesn't fit the frameworks above. If you find it, build a hook around it.

RULES:
- Hook must work on a complete stranger with zero context about this business
- Never names the business. Never sounds like an ad.
- Max 8 words. Short. No filler words.
- If a framework needs review evidence — only use it if a review actually supports it. Mark reviewIds accordingly.
- If a framework works from industry knowledge alone — reviewIds can be empty, but anchorReviewId must be the single most relevant review for the closing quote.
- Generic is worthless. "Dental implants in one day" beats "something about dentistry."

GOOD hooks: "Most people wait too long. Here's the cost." / "What actually happens in the first 10 minutes." / "She drove 2 hours. Same order every time."
BAD hooks: "We offer a great experience." / "Come visit us today." / "Here's what we do."

---

REVIEWS — scan for evidence AND find the best closing quote per theme:
${reviewList}

---

Return ONLY valid JSON with exactly 5 themes:
{
  "themes": [
    {
      "id": "unique-slug",
      "title": "Reel idea as a scroll-stopping fact (under 10 words)",
      "hook": "The hook — max 8 words, no business name, no ad language",
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
