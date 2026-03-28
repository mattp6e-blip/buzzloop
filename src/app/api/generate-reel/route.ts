import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Review, ReelTheme, ReelScript } from '@/types'

const client = new Anthropic()

function getSocialProofPrompt(theme: ReelTheme, reviewTexts: string, businessName: string, industry: string, reviews: Review[]): string {
  return `You are the creative director behind award-winning commercial ad campaigns. You write copy that is SPECIFIC, LOGICAL, and EARNED — never generic, never formulaic.

Business: ${businessName} (${industry})
Reel theme: ${theme.title}
The remarkable fact in these reviews: "${theme.keyPhrase}"

Reviews:
${reviewTexts}

---

BEFORE YOU WRITE ANYTHING — do this analysis in your head:
1. Read ALL the reviews. What is the ONE thing they ALL share? Not just one review — all of them.
2. What is the common emotional experience? (e.g. all went in scared, all mention pain-free, all mention a specific person, all mention a transformation)
3. The hook, quotes, and CTA must ALL serve that single common truth. If a review doesn't fit the common thread, don't use it.
4. The hook must be something that ALL the reviews support — not a detail unique to one review.

HOOK — what stops them scrolling (max 8 words):
The best hooks are SPECIFIC FACTS stated in an unexpected way.
- "She flew from Norway. For this clinic." ✓  (specific, surprising, human)
- "20 teeth out. All implants in. 48 hours." ✓  (specific numbers, unexpected)
- "She used to cancel every single appointment." ✓  (relatable, creates curiosity)
- "She came in terrified. Left crying — happy tears." ✓  (before/after contrast)
- "Patients keep coming back" ✗  (vague, means nothing)
- "Amazing results" ✗  (says nothing specific)
The hook must be TRUE and directly connected to these real reviews.

QUOTE SLIDES — real words, cinematic trim (max 18 words each):
Pull the most powerful sentence from each review. Cut filler. Keep the emotional core.
- Good: "I'd rather travel two hours than go anywhere else." (raw, specific, unbelievable)
- Bad: "The service was very good and they are very professional." (no emotional weight)
highlightWords: the exact 1-3 words that carry the most weight in that sentence.

PROOF SLIDE — one undeniable fact that earns trust:
This must be LOGICAL and make complete sense to a viewer who just watched the previous slides.
Base it directly on what the reviews say. Examples by theme:
- If the theme is about fear/transformation: "From terrified to: can't wait to come back."
- If the theme is about travelling far: "4.9★ · ${reviews.length} reviews. Worth every mile."
- If the theme is about a fast/easy procedure: "Quick. Painless. Life-changing."
- If nothing specific fits: "4.9★ across ${reviews.length} Google reviews"
NEVER write something that doesn't logically follow from the story. "Customers flying. Same story." is meaningless — never do this.

CLOSING — the emotional payoff:
- headline: A short question or statement that connects the story to the viewer's own life. Make them picture themselves there.
  - "Still putting it off?" (speaks to procrastination)
  - "What are you waiting for?" (gentle challenge)
  - "When did you last actually look forward to this?" (reframes the experience)
  - "Your turn." (simple, direct)
- ctaText: One specific, warm invitation. Must logically follow from the story.
  - "Book your first visit. See what everyone's talking about." ✓
  - "The team that made her travel two hours is ready for you." ✓  (callbacks to specific hook)
  - "Book now." ✗  (generic, weak)
NEVER include any URL, domain, or website address anywhere.

Return ONLY valid JSON:
{
  "themeTitle": "${theme.title}",
  "totalDuration": 29,
  "hookHeadline": "The single best hook for this story — specific, surprising, true for ALL reviews (max 8 words)",
  "hookSubline": "Optional 5-word subline that adds context, or null",
  "ctaText": "Warm closing CTA that callbacks to something specific in the reviews",
  "slides": [
    { "type": "hook", "duration": 4, "content": { "headline": "Specific surprising hook (max 8 words)", "subline": null } },
    { "type": "quote", "duration": 5, "content": { "quote": "Most powerful sentence from review 1 (max 18 words)", "highlightWords": ["word1", "word2"], "author": "First name or null" } },
    { "type": "quote", "duration": 5, "content": { "quote": "Most powerful sentence from review 2 (max 18 words)", "highlightWords": ["word1"], "author": "First name or null" } },
    { "type": "proof", "duration": 5, "content": { "stat": "Logical fact that follows from this story (max 8 words)", "subline": "Short reinforcing line (max 5 words)" } },
    { "type": "cta", "duration": 10, "content": { "headline": "Short question or statement connecting story to viewer", "cta": "Specific warm invitation that callbacks to the story" } }
  ]
}`
}

function getEducationalPrompt(theme: ReelTheme, reviewTexts: string, businessName: string, industry: string): string {
  return `You are the creative director behind award-winning commercial ad campaigns. You write educational Instagram Reels that teach viewers something they didn't know, while using real customer experiences as proof.

Business: ${businessName} (${industry})
Educational topic: ${theme.title}
The insight these reviews reveal: "${theme.keyPhrase}"

Reviews (use as proof — do NOT make these the main story):
${reviewTexts}

---

STRUCTURE — follow exactly:
1. HOOK (4s): A bold, contrarian claim that makes the viewer stop. Must create a curiosity gap or challenge a belief. Max 8 words. NOT a question — a statement.
   ✓ "Most people wait years for something this simple"
   ✓ "You've been avoiding this for the wrong reason"
   ✗ "Did you know implants are painless?" (question format — weak)
   ✗ "Learn about our services" (promotional — dead)

2. INSIGHT (6s): The key thing they didn't know. State it directly and confidently. Max 10 words headline, max 8 words supporting line. This is the core of the reel — make it genuinely surprising or useful.
   ✓ Headline: "The whole thing takes less than an hour"
   ✓ Supporting: "Back to normal the same day"

3. QUOTE (5s): One real customer sentence that validates the insight. Should feel like proof, not promotion. Max 18 words. Pick the review that most directly validates the insight — not the most emotional one.
   ✓ "I was shocked — I was back at my desk by lunch"
   ✗ "It was so amazing, I love this place" (emotional but not proof)

4. CTA (10s): Connect the insight to the viewer's situation. Headline: make them picture themselves having this experience. CTA text: specific invitation.

NEVER include any URL, domain, or website address anywhere.

Return ONLY valid JSON:
{
  "themeTitle": "${theme.title}",
  "totalDuration": 25,
  "hookHeadline": "The bold contrarian hook statement (max 8 words)",
  "hookSubline": null,
  "ctaText": "Specific CTA that connects the insight to booking",
  "slides": [
    { "type": "hook", "duration": 4, "content": { "headline": "Bold contrarian hook (max 8 words)", "subline": null } },
    { "type": "insight", "duration": 6, "content": { "headline": "The key insight stated directly (max 10 words)", "subline": "Supporting context or fact (max 8 words)" } },
    { "type": "quote", "duration": 5, "content": { "quote": "Customer sentence that validates the insight (max 18 words)", "highlightWords": ["key", "words"], "author": "First name or null" } },
    { "type": "cta", "duration": 10, "content": { "headline": "Make them picture having this experience (max 10 words)", "cta": "Specific warm invitation to book" } }
  ]
}`
}

function getFaqPrompt(theme: ReelTheme, reviewTexts: string, businessName: string, industry: string): string {
  return `You are the creative director behind award-winning commercial ad campaigns. You write FAQ / myth-busting Instagram Reels that turn hesitation into action.

Business: ${businessName} (${industry})
Fear or myth to bust: ${theme.title}
The specific concern: "${theme.keyPhrase}"

Reviews (use as validation — customers who had the same fear and overcame it):
${reviewTexts}

---

STRUCTURE — follow exactly:
1. HOOK (4s): State the fear or myth directly and boldly. The viewer should immediately recognise their own hesitation. Max 8 words. Use tension — don't soften it.
   ✓ "Everyone thinks this is going to hurt"
   ✓ "You've been putting this off for years"
   ✓ "The #1 reason people avoid the dentist"
   ✗ "Are you scared of the dentist?" (question format — weaker)

2. INSIGHT (6s): The real answer. Direct, confident, no hedging. Max 10 words headline, max 8 words supporting line. This should feel like someone who actually knows, speaking plainly.
   ✓ Headline: "Most people feel nothing. Seriously."
   ✓ Supporting: "Modern techniques have completely changed this"
   ✗ "We pride ourselves on patient comfort" (corporate non-answer)

3. QUOTE (5s): One real customer who had exactly this fear and can speak to it. Their words validate the insight. Max 18 words.
   ✓ "I was terrified for two years. I wish I hadn't waited"
   ✓ "I actually fell asleep in the chair"

4. CTA (10s): Address the hesitant viewer directly. Headline: acknowledge they've probably been putting it off. CTA: make the next step feel small and safe.

NEVER include any URL, domain, or website address anywhere.

Return ONLY valid JSON:
{
  "themeTitle": "${theme.title}",
  "totalDuration": 25,
  "hookHeadline": "The fear or myth stated as a bold hook (max 8 words)",
  "hookSubline": null,
  "ctaText": "Low-friction CTA that makes the next step feel safe",
  "slides": [
    { "type": "hook", "duration": 4, "content": { "headline": "The fear stated boldly (max 8 words)", "subline": null } },
    { "type": "insight", "duration": 6, "content": { "headline": "The direct real answer (max 10 words)", "subline": "Supporting context (max 8 words)" } },
    { "type": "quote", "duration": 5, "content": { "quote": "Customer who had this fear and overcame it (max 18 words)", "highlightWords": ["key", "words"], "author": "First name or null" } },
    { "type": "cta", "duration": 10, "content": { "headline": "Acknowledge the hesitant viewer's situation (max 10 words)", "cta": "Make the next step feel small and safe" } }
  ]
}`
}

export async function POST(req: NextRequest) {
  const { theme, reviews, businessName, industry, brandPersonality, websiteUrl, customerWord, serviceWord, bookingWord }: {
    theme: ReelTheme
    reviews: Review[]
    businessName: string
    industry: string
    brandPersonality?: string[]
    websiteUrl?: string
    customerWord?: string
    serviceWord?: string
    bookingWord?: string
  } = await req.json()

  const reviewTexts = reviews.map((r, i) =>
    `Quote ${i + 1}: "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}`
  ).join('\n')

  const reelCategory = theme.reelCategory ?? 'social_proof'

  let prompt: string
  if (reelCategory === 'educational') {
    prompt = getEducationalPrompt(theme, reviewTexts, businessName, industry)
  } else if (reelCategory === 'faq') {
    prompt = getFaqPrompt(theme, reviewTexts, businessName, industry)
  } else {
    prompt = getSocialProofPrompt(theme, reviewTexts, businessName, industry, reviews)
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1800,
    messages: [{ role: 'user', content: prompt }],
  })

  let result: { script: ReelScript; variations: import('@/remotion/types').ReelVariation[] } | null = null
  try {
    const text = (message.content[0] as { text: string }).text
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      const hookHeadline: string = parsed.hookHeadline ?? ''
      const hookSubline: string | undefined = parsed.hookSubline ?? undefined
      const ctaText: string = parsed.ctaText ?? ''
      result = {
        script: {
          themeTitle: parsed.themeTitle,
          totalDuration: parsed.totalDuration,
          slides: parsed.slides,
        },
        variations: [
          { id: 1, label: '', description: '', hookHeadline, hookSubline, ctaText, visualStyle: 'cinematic' },
          { id: 2, label: '', description: '', hookHeadline, hookSubline, ctaText, visualStyle: 'clean' },
        ],
      }
    }
  } catch {
    result = null
  }

  if (!result) {
    return NextResponse.json({ error: 'Failed to generate reel script' }, { status: 500 })
  }

  return NextResponse.json(result)
}
