import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Review, ReelTheme, ReelScript } from '@/types'
import type { ReelVariation, VisualTemplate } from '@/remotion/types'

type Tone = 'story' | 'proof' | 'bold'

const TONE_CONFIGS: Record<Tone, {
  label: string
  description: string
  template: VisualTemplate
  durationSeconds: number
}> = {
  story: {
    label: 'Story',
    description: 'Emotional arc · most shared',
    template: 'immersive',
    durationSeconds: 20,
  },
  proof: {
    label: 'Proof',
    description: 'Evidence-led · most saved',
    template: 'collage',
    durationSeconds: 20,
  },
  bold: {
    label: 'Bold',
    description: 'High energy · most reach',
    template: 'editorial',
    durationSeconds: 15,
  },
}

const HOOK_FRAMEWORKS = `SIX PROVEN HOOK FRAMEWORKS — match the anchor material to the best fitting one:

1. CONTRAST: Two things that shouldn't coexist, do.
   Structure: "[Surprising context]. [They chose this anyway]."
   Example: "Norway has free dentistry. She still flies here."
   Use when: customer made a choice that implies extreme quality

2. EXPECTATION VIOLATION: Outcome directly contradicts a universal assumption.
   Structure: "[What everyone believes]. [What actually happened]."
   Example: "I fell asleep in the dentist's chair."
   Use when: the experience defied what most people would assume

3. RESISTANCE OVERCOME: Viewer recognises their own hesitation in someone else.
   Structure: "[How long/how many times they held back]. [What tipped them over]."
   Example: "She cancelled 4 times before coming."
   Use when: customer overcame strong reluctance to book

4. LOYALTY PROOF: Repetition as proof of quality — no explanation needed.
   Structure: "[Frequency or duration]. [The choice that proves it]."
   Example: "He drives 2 hours. Every time."
   Use when: extreme repeat behavior is the signal

5. EXPERT COMPARATIVE: Someone with options chose this.
   Structure: "[Implies wide experience]. [Chose this]."
   Example: "I've stayed in 47 countries. This is my favourite."
   Use when: customer had strong alternatives and chose here anyway

6. SPECIFIC NUMBER ANCHOR: Precision that makes behavior undeniable.
   Structure: "[Number] [unit]. [What it means]."
   Example: "37 years. Finally found the right one."
   Use when: a specific number makes the story credible and surprising`

const client = new Anthropic()

// ── PASS 1: Hook generation ──────────────────────────────────────────────────

function getHookPrompt(
  tone: Tone,
  theme: ReelTheme,
  anchorSentence: string,
  reviewTexts: string,
  businessName: string,
  industry: string,
  language: string,
): string {
  const toneInstructions: Record<Tone, string> = {
    story: `TONE — Story: The hook should make the viewer feel something. Find the moment of transformation or the irrational behavior that proves quality. Lean into the human drama.`,
    proof: `TONE — Proof: The hook should feel undeniable. Find the most specific, verifiable detail — a number, a name, a comparison. The viewer should think "that's real."`,
    bold: `TONE — Bold: The hook should pattern-interrupt. The most surprising, counterintuitive, or blunt version of the truth. Short. No softening.`,
  }

  return `You are writing the hook for an Instagram Reel. Your only job in this step is to write ONE perfect hook — nothing else.

LANGUAGE: Write in ${language}.

Business: ${businessName} (${industry})
Reel theme: ${theme.title}

ANCHOR MATERIAL (the most remarkable sentence from the reviews):
"${anchorSentence}"

ALL REVIEWS FOR CONTEXT:
${reviewTexts}

${toneInstructions[tone]}

${HOOK_FRAMEWORKS}

---

YOUR RULES:
1. The subject of the hook is ALWAYS the customer — never the business
2. Use the customer's exact words where possible — do not invent
3. Never name the business or sound like an ad
4. If the anchor sentence fits a framework well enough to stand alone — use it with minimal editing
5. Max 10 words

PROCESS:
Step 1: Read the anchor sentence. Which of the 6 frameworks does it best fit?
Step 2: Apply that framework using the exact words from the anchor. Trim if needed.
Step 3: Test: would a stranger raise an eyebrow reading this? If yes — done. If not — try another framework.

Return ONLY valid JSON:
{
  "hookHeadline": "The hook (max 10 words)",
  "hookSubline": "Optional 6-word line that adds context, or null",
  "framework": "contrast | expectation_violation | resistance_overcome | loyalty_proof | expert_comparative | specific_number"
}`
}

// ── PASS 2: Full reel generation ─────────────────────────────────────────────

function getReelPrompt(
  tone: Tone,
  theme: ReelTheme,
  hookHeadline: string,
  hookSubline: string | null,
  reviewTexts: string,
  businessName: string,
  industry: string,
  reviews: Review[],
  language: string,
): string {
  const durationSeconds = TONE_CONFIGS[tone].durationSeconds

  const toneInstructions: Record<Tone, string> = {
    story: `TONE — Story (emotional transformation arc, ${durationSeconds}s):
Build a narrative. The hook introduces a human moment. Each quote deepens the story. The proof earns trust. The CTA closes the loop emotionally.
Quote selection: prioritise the most human, specific moments — not the most enthusiastic.
Pacing: let moments breathe. Don't pack too much in.`,

    proof: `TONE — Proof (evidence-led, ${durationSeconds}s):
Build a case. Each quote is a data point. Together they prove an undeniable pattern.
Quote selection: prioritise specificity over emotion. Numbers, names, comparisons.
Pacing: confident and deliberate. Each slide feels like another piece of evidence landing.`,

    bold: `TONE — Bold (pattern-interrupt, ${durationSeconds}s):
Move fast. Cut ruthlessly. Every word earns its place.
Quote selection: the single most surprising or specific line — nothing else.
Pacing: punch. pause. punch. No filler.`,
  }

  const slideStructure: Record<Tone, string> = {
    story: `SLIDES (total ~${durationSeconds}s):
- hook: 3s — the anchor moment
- quote: 4s — most human specific quote from reviews
- quote: 4s — second quote that deepens the story
- proof: 3s — one undeniable fact that earns trust
- cta: 6s — emotional close`,

    proof: `SLIDES (total ~${durationSeconds}s):
- hook: 3s — the most specific surprising fact
- quote: 4s — strongest evidence quote
- quote: 4s — second evidence quote
- proof: 3s — the pattern stated as fact
- cta: 6s — confident invitation`,

    bold: `SLIDES (total ~${durationSeconds}s):
- hook: 3s — the sharpest version of the truth
- quote: 4s — one quote, the most unexpected line only
- proof: 3s — one blunt undeniable fact
- cta: 5s — direct, minimal`,
  }

  return `You are the creative director completing an Instagram Reel. The hook has already been written. Your job is to build everything else around it.

LANGUAGE: Write in ${language}.

Business: ${businessName} (${industry})
Reel theme: ${theme.title}

THE HOOK (already written — do NOT change it):
Headline: "${hookHeadline}"
${hookSubline ? `Subline: "${hookSubline}"` : ''}

REVIEWS:
${reviewTexts}

${toneInstructions[tone]}

---

QUOTE SLIDES — rules:
- Extract verbatim from reviews — do not rephrase or combine
- Max 18 words per quote
- highlightWords: the exact 1-3 words that carry the most weight
- Pick the sentence with the most specific detail — a number, a name, an unexpected behavior
- Generic praise ("amazing", "incredible") never gets a quote slide

PROOF SLIDE — rules:
- Must reference ONLY what the hook and quote slides in THIS reel actually showed — nothing the viewer hasn't seen
- No new names, places, or facts that weren't in the quotes above
- Distil the pattern the viewer just witnessed into one undeniable sentence
- Examples: "3 people. Same story. They all came back." / "4.9★ across ${reviews.length} reviews. Every single one."

CTA — two lines, both required:
Line 1 (ctaHeadline): Callback to the specific story. Reference something from the hook or quotes.
  - "The team worth flying for is ready for you."
  - "Find out why they keep coming back every Friday."
  - "The dentist 3 people flew for. Book yours."
  NEVER: "Book your appointment today" / "Visit us now" / anything generic

Line 2 (ctaText): Friction reduction. Make the next step feel smaller than expected.
  - "Your first visit is 20 minutes. That's it."
  - "No commitment. Just come once and see."
  - "Message us your name. We'll find you a time."
  NEVER: "Book now" / "Call us today" / anything that sounds like effort

${slideStructure[tone]}

Return ONLY valid JSON:
{
  "themeTitle": "${theme.title}",
  "totalDuration": ${durationSeconds},
  "ctaHeadline": "Story callback — specific, not generic",
  "ctaText": "Friction reduction — makes next step feel small",
  "slides": [
    { "type": "hook", "duration": 3, "content": { "headline": "${hookHeadline}", "subline": ${hookSubline ? `"${hookSubline}"` : 'null'} } },
    { "type": "quote", "duration": 4, "content": { "quote": "Verbatim sentence from review (max 18 words)", "highlightWords": ["word1", "word2"], "author": "First name or null" } },
    { "type": "quote", "duration": 4, "content": { "quote": "Verbatim sentence from second review (max 18 words)", "highlightWords": ["word1"], "author": "First name or null" } },
    { "type": "proof", "duration": 3, "content": { "stat": "Logical fact from this specific story (max 8 words)", "subline": "Short reinforcing line (max 5 words)" } },
    { "type": "cta", "duration": 6, "content": { "headline": "Story callback headline", "cta": "Friction reduction action" } }
  ]
}`
}

// ── Generation ────────────────────────────────────────────────────────────────

async function generateVariation(
  tone: Tone,
  theme: ReelTheme,
  anchorSentence: string,
  reviewTexts: string,
  businessName: string,
  industry: string,
  reviews: Review[],
  language: string,
): Promise<ReelVariation | null> {
  try {
    const langSystem = `You must respond in ${language} only. Every word of your JSON output must be in ${language}. This is non-negotiable regardless of the business name or location.`

    // Pass 1 — hook only
    const hookMessage = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 300,
      system: langSystem,
      messages: [{ role: 'user', content: getHookPrompt(tone, theme, anchorSentence, reviewTexts, businessName, industry, language) }],
    })
    const hookText = (hookMessage.content[0] as { text: string }).text
    const hookMatch = hookText.match(/\{[\s\S]*\}/)
    if (!hookMatch) return null
    const hook = JSON.parse(hookMatch[0]) as { hookHeadline: string; hookSubline: string | null; framework: string }

    // Pass 2 — full reel anchored to hook
    const reelMessage = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      system: langSystem,
      messages: [{ role: 'user', content: getReelPrompt(tone, theme, hook.hookHeadline, hook.hookSubline ?? null, reviewTexts, businessName, industry, reviews, language) }],
    })
    const reelText = (reelMessage.content[0] as { text: string }).text
    const reelMatch = reelText.match(/\{[\s\S]*\}/)
    if (!reelMatch) return null
    const parsed = JSON.parse(reelMatch[0])

    const config = TONE_CONFIGS[tone]
    const script: ReelScript = {
      themeTitle: parsed.themeTitle,
      totalDuration: parsed.totalDuration,
      slides: parsed.slides,
      template: config.template,
    }

    return {
      id: (['story', 'proof', 'bold'] as Tone[]).indexOf(tone) + 1,
      label: config.label,
      description: config.description,
      tone,
      hookHeadline: hook.hookHeadline,
      hookSubline: hook.hookSubline ?? undefined,
      ctaHeadline: parsed.ctaHeadline ?? '',
      ctaText: parsed.ctaText ?? '',
      template: config.template,
      script,
    }
  } catch {
    return null
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { theme, reviews, businessName, industry, language }: {
    theme: ReelTheme
    reviews: Review[]
    businessName: string
    industry: string
    language?: string
  } = await req.json()

  const gbpReviews = reviews.filter(r => r.posted_to_google)
  if (!gbpReviews.length) {
    return NextResponse.json({ error: 'No GBP reviews available' }, { status: 400 })
  }

  // Find the anchor sentence — from anchor review if story type, else best available
  const anchorReview = theme.anchorReviewId
    ? gbpReviews.find(r => r.id === theme.anchorReviewId)
    : gbpReviews.sort((a, b) => (b.remarkability_score ?? 0) - (a.remarkability_score ?? 0))[0]

  const anchorSentence = anchorReview?.anchor_sentence
    ?? anchorReview?.what_they_liked.slice(0, 150)
    ?? theme.keyPhrase

  // Build review context — anchor first, then supporting reviews
  const supportingIds = new Set(theme.reviewIds)
  const contextReviews = [
    ...(anchorReview ? [anchorReview] : []),
    ...gbpReviews.filter(r => supportingIds.has(r.id) && r.id !== anchorReview?.id),
  ].slice(0, 6)

  const reviewTexts = contextReviews.map((r, i) =>
    `Quote ${i + 1}: "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}`
  ).join('\n')

  const lang = language ?? 'English'

  // Generate all three tones in parallel (each tone runs 2 Opus calls internally)
  const tones: Tone[] = ['story', 'proof', 'bold']
  const variations = (await Promise.all(
    tones.map(tone => generateVariation(tone, theme, anchorSentence, reviewTexts, businessName, industry, gbpReviews, lang))
  )).filter((v): v is ReelVariation => v !== null)

  if (!variations.length) {
    return NextResponse.json({ error: 'Failed to generate reel variations' }, { status: 500 })
  }

  return NextResponse.json({ variations })
}
