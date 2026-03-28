import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Review, ReelTheme, ReelScript } from '@/types'
import type { ReelVariation, VisualStyle } from '@/remotion/types'

type Tone = 'story' | 'bold' | 'authority'

const TONE_CONFIGS: Record<Tone, { label: string; description: string; visualStyle: VisualStyle; instruction: string }> = {
  story: {
    label: 'Story',
    description: 'Emotional arc · most shared',
    visualStyle: 'clean',
    instruction: `TONE — Story (emotional transformation arc):
Quote selection: prioritise quotes that show a journey — fear becoming relief, doubt becoming delight, before and after. The viewer should feel the transformation.
CTA: warm, inviting — makes the viewer picture themselves there. ("We can't wait to meet you." / "Your story starts here." / "Ready to feel this good?")`,
  },
  bold: {
    label: 'Bold',
    description: 'High energy · most reach',
    visualStyle: 'cinematic',
    instruction: `TONE — Bold (punchy, pattern-interrupt):
Quote selection: prioritise the most surprising or specific quotes — the ones that stop mid-scroll. Cut ruthlessly to the single most unexpected line.
CTA: direct, short — a challenge or simple declaration. ("Your turn." / "What are you waiting for?" / "Still putting it off?")`,
  },
  authority: {
    label: 'Authority',
    description: 'Insight-led · most saved',
    visualStyle: 'clean',
    instruction: `TONE — Authority (confident-casual insight):
Quote selection: prioritise quotes that together reveal a pattern — multiple people noticing the same thing. Frame them as evidence of a bigger shared truth.
CTA: curiosity-driven, save-oriented. ("Now you know what everyone's been talking about." / "See what they all have in common.")`,
  },
}

const CATEGORY_TONES: Record<string, Tone[]> = {
  social_proof: ['story', 'bold', 'authority'],
  educational:  ['bold', 'authority'],
  faq:          ['bold', 'story'],
}

const client = new Anthropic()

function getSocialProofPrompt(theme: ReelTheme, reviewTexts: string, businessName: string, industry: string, reviews: Review[], language: string, toneInstruction: string): string {
  return `You are the creative director behind award-winning commercial ad campaigns. You write copy that is SPECIFIC, LOGICAL, and EARNED — never generic, never formulaic.

LANGUAGE: Write every part of your response in ${language}.

${toneInstruction}

Business: ${businessName} (${industry})
Reel theme: ${theme.title}
The remarkable fact in these reviews: "${theme.keyPhrase}"

Reviews:
${reviewTexts}

---

BEFORE YOU WRITE ANYTHING — do this analysis in your head:
1. Read ALL reviews together. Find the single most unexpected or specific thing any customer said — one sentence, across all reviews, that a stranger would find surprising or hard to believe.
2. That sentence wins the hook. One winner. Not one hook per review.
3. The remaining reviews become quote slides — ranked by how specific and surprising they are.
4. Weak reviews (generic praise, vague adjectives) do not get quote slides — use them only to support the proof stat.

HOOK — the one line that stops the scroll (max 10 words):
Step 1: Find the most unexpected sentence in ANY of the reviews. Copy it exactly.
Step 2: Can you trim it to 10 words while keeping the contrast, wit, or specific detail that makes it surprising? If yes — trim it. Use the customer's exact words. Do not rephrase.
Step 3: If it genuinely cannot be trimmed and still work, minimally rephrase — but the core fact, contrast or behaviour must come directly from the review. Never invent.

The hook speaks to the VIEWER, not the patient. It makes someone who relates to this situation feel seen or surprised.
What works:
- A real behaviour that implies extraordinary quality ("Norway has free dentistry. She still flies here.")
- A contrast the viewer didn't expect ("Treatments that always hurt. She didn't notice a thing.")
- A specific detail that no other business could claim

What fails — never write these:
- Transformation arcs: "Came in terrified. Left smiling." — generic, applies to any clinic anywhere
- Statements that require knowing the patient to care about: "They gave me back my smile."
- Anything you constructed that isn't directly from a review
- Anything that could apply to 100 other businesses in this industry

QUOTE SLIDES — the most specific sentences from the remaining reviews (max 18 words each):
Find the sentence with the most specific detail — a real number, a real name, an unexpected contrast, or a behaviour that surprises. Cut adjectives. Keep nouns and verbs. The specificity is the emotion.
- Good: "I'd rather fly from Norway than see a dentist at home." (specific behaviour, unexpected contrast)
- Bad: "The service was very good and they are very professional." (adjectives, no specific detail)
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
  "totalDuration": 22,
  "hookHeadline": "The single best hook for this story — specific, surprising, true for ALL reviews (max 8 words)",
  "hookSubline": "Optional 5-word subline that adds context, or null",
  "ctaText": "Warm closing CTA that callbacks to something specific in the reviews",
  "slides": [
    { "type": "hook", "duration": 3, "content": { "headline": "Specific surprising hook (max 8 words)", "subline": null } },
    { "type": "quote", "duration": 4, "content": { "quote": "Most powerful sentence from review 1 (max 12 words)", "highlightWords": ["word1", "word2"], "author": "First name or null" } },
    { "type": "quote", "duration": 4, "content": { "quote": "Most powerful sentence from review 2 (max 12 words)", "highlightWords": ["word1"], "author": "First name or null" } },
    { "type": "proof", "duration": 3, "content": { "stat": "Logical fact that follows from this story (max 8 words)", "subline": "Short reinforcing line (max 5 words)" } },
    { "type": "cta", "duration": 8, "content": { "headline": "Short question or statement connecting story to viewer", "cta": "Specific warm invitation that callbacks to the story" } }
  ]
}`
}

function getEducationalPrompt(theme: ReelTheme, reviewTexts: string, businessName: string, industry: string, language: string, toneInstruction: string): string {
  return `You are the creative director behind award-winning commercial ad campaigns. You write educational Instagram Reels that teach viewers something they didn't know, while using real customer experiences as proof.

LANGUAGE: Write every part of your response in ${language}.

${toneInstruction}

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

function getFaqPrompt(theme: ReelTheme, reviewTexts: string, businessName: string, industry: string, language: string, toneInstruction: string): string {
  return `You are the creative director behind award-winning commercial ad campaigns. You write FAQ / myth-busting Instagram Reels that turn hesitation into action.

LANGUAGE: Write every part of your response in ${language}.

${toneInstruction}

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

async function generateVariation(
  tone: Tone,
  prompt: string,
): Promise<ReelVariation | null> {
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (message.content[0] as { text: string }).text
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    const config = TONE_CONFIGS[tone]
    const script: ReelScript = {
      themeTitle: parsed.themeTitle,
      totalDuration: parsed.totalDuration,
      slides: parsed.slides,
    }
    return {
      id: (['story', 'bold', 'authority'] as Tone[]).indexOf(tone) + 1,
      label: config.label,
      description: config.description,
      tone,
      hookHeadline: parsed.hookHeadline ?? '',
      hookSubline: parsed.hookSubline ?? undefined,
      ctaText: parsed.ctaText ?? '',
      visualStyle: config.visualStyle,
      script,
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const { theme, reviews, businessName, industry, language }: {
    theme: ReelTheme
    reviews: Review[]
    businessName: string
    industry: string
    language?: string
  } = await req.json()

  const reviewTexts = reviews.map((r, i) =>
    `Quote ${i + 1}: "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}`
  ).join('\n')

  const reelCategory = theme.reelCategory ?? 'social_proof'
  const lang = language ?? 'English'
  const tones = CATEGORY_TONES[reelCategory] ?? CATEGORY_TONES.social_proof

  const variations = (await Promise.all(
    tones.map(tone => {
      const toneInstruction = TONE_CONFIGS[tone].instruction
      let prompt: string
      if (reelCategory === 'educational') {
        prompt = getEducationalPrompt(theme, reviewTexts, businessName, industry, lang, toneInstruction)
      } else if (reelCategory === 'faq') {
        prompt = getFaqPrompt(theme, reviewTexts, businessName, industry, lang, toneInstruction)
      } else {
        prompt = getSocialProofPrompt(theme, reviewTexts, businessName, industry, reviews, lang, toneInstruction)
      }
      return generateVariation(tone, prompt)
    })
  )).filter((v): v is ReelVariation => v !== null)

  if (!variations.length) {
    return NextResponse.json({ error: 'Failed to generate reel variations' }, { status: 500 })
  }

  return NextResponse.json({ variations })
}
