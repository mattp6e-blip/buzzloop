import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Review, ReelTheme, ReelScript } from '@/types'

const client = new Anthropic()

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

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1800,
    messages: [{
      role: 'user',
      content: `You are the creative director behind award-winning commercial ad campaigns. You write copy that is SPECIFIC, LOGICAL, and EARNED — never generic, never formulaic.

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
- "She flew from Norway. For this dentist." ✓  (specific, surprising, human)
- "20 teeth out. All implants in. 48 hours." ✓  (specific numbers, unexpected)
- "She used to cancel every dentist appointment." ✓  (relatable, creates curiosity)
- "She came in terrified. Left crying — happy tears." ✓  (before/after contrast)
- "Patients keep coming back" ✗  (vague, means nothing)
- "Amazing results" ✗  (says nothing specific)
The hook must be TRUE and directly connected to these real reviews.

QUOTE SLIDES — real words, cinematic trim (max 18 words each):
Pull the most powerful sentence from each review. Cut filler. Keep the emotional core.
- Good: "I'd rather fly from Norway than go to a dentist here." (raw, specific, unbelievable)
- Bad: "The service was very good and they are very professional." (no emotional weight)
highlightWords: the exact 1-3 words that carry the most weight in that sentence.

PROOF SLIDE — one undeniable fact that earns trust:
This must be LOGICAL and make complete sense to a viewer who just watched the previous slides.
Base it directly on what the reviews say. Examples by theme:
- If the theme is about fear/transformation: "From terrified to: can't wait to come back."
- If the theme is about flying/travelling: "4.9★ · ${reviews.length} reviews. Worth the flight."
- If the theme is about implants/procedures: "Quick. Painless. Life-changing."
- If nothing specific fits: "4.9★ across ${reviews.length} Google reviews"
NEVER write something that doesn't logically follow from the story. "Customers flying. Same story." is meaningless — never do this.

CLOSING — the emotional payoff:
- headline: A short question or statement that connects the story to the viewer's own life. Make them picture themselves there.
  - "Still putting off that appointment?" (speaks to procrastination)
  - "What are you waiting for?" (gentle challenge)
  - "Your smile deserves this." (aspiration)
  - "When did you last actually look forward to the dentist?" (reframes the experience)
- ctaText: One specific, warm invitation. Must logically follow from the story.
  - "Book your first visit. See what everyone's talking about." ✓
  - "The team that made her fly from Norway is ready for you." ✓  (callbacks to specific hook)
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
    }],
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
        // Both variations share the same hook and CTA — only visual style differs
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
