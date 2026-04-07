import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Review, ReelTheme, ReelScript } from '@/types'
import type { ReelVariation, VisualTemplate } from '@/remotion/types'
import type { ReelMotif } from '@/remotion/motifs'

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

// ── PASS 1: Hook generation — educational/variety themes ─────────────────────

function getVarietyHookPrompt(
  tone: Tone,
  theme: ReelTheme,
  businessName: string,
  industry: string,
  language: string,
): string {
  const toneInstructions: Record<Tone, string> = {
    story: `TONE — Story: Make the viewer feel something. Frame the topic as a human moment or journey. Draw in curiosity with warmth.`,
    proof: `TONE — Proof: Make the hook feel undeniable. Lead with a specific, verifiable fact or number. The viewer thinks "I didn't know that."`,
    bold: `TONE — Bold: Pattern-interrupt. The most surprising, counterintuitive, or blunt version of the truth. Short. No softening.`,
  }

  const hookByType: Record<string, string> = {
    educational:   `QUESTION or STEP: Ask the question the viewer secretly has, or promise a step-by-step reveal.\nGOOD: "What actually happens during an implant. Step by step." / "Nobody explains what Invisalign feels like. We will."`,
    myth_bust:     `FEAR ACKNOWLEDGMENT: Name the common fear or misconception, then pivot.\nGOOD: "Most people avoid implants because of this." / "You think it hurts. Here's the truth."`,
    experience:    `SENSORY MOMENT: Put the viewer inside the experience in one sentence.\nGOOD: "What our guests find on their pillow every morning." / "What a Friday night here actually looks like."`,
    local_guide:   `INSIDER REVEAL: Frame as local knowledge most visitors miss.\nGOOD: "The spot our guests ask about every single checkout." / "Three hidden gems. Only our guests know."`,
    behind_scenes: `CRAFT REVEAL: Make the process feel fascinating and unexpected.\nGOOD: "What goes into our signature dish. It's not what you think." / "How we actually mix this cocktail."`,
    trust:         `PROOF OF TIME: A number or fact that earns trust before the viewer asks.\nGOOD: "20 years. 2,000 patients. Here's what we've learned." / "The thing we've never changed in 15 years."`,
  }

  const typeGuide = hookByType[theme.contentType ?? 'educational'] ?? hookByType.educational

  return `You are writing the hook for an Instagram Reel. Your only job is to write ONE perfect hook.

LANGUAGE: Write in ${language}.

Business: ${businessName} (${industry})
Reel theme: ${theme.title}
Content type: ${theme.contentType}
Key topic: ${theme.keyPhrase}

${toneInstructions[tone]}

HOOK GUIDE FOR THIS CONTENT TYPE:
${typeGuide}

RULES:
1. Max 10 words
2. Never name the business or sound like an ad
3. The viewer should feel curious, surprised, or seen

Return ONLY valid JSON:
{
  "hookHeadline": "The hook (max 10 words)",
  "hookSubline": "Optional 6-word context line, or null"
}`
}

// ── PASS 2: Full reel — educational/variety themes ────────────────────────────

function getVarietyReelPrompt(
  tone: Tone,
  theme: ReelTheme,
  hookHeadline: string,
  hookSubline: string | null,
  closingReview: string,
  closingAuthor: string | null,
  businessName: string,
  industry: string,
  language: string,
): string {
  const durationSeconds = TONE_CONFIGS[tone].durationSeconds

  const toneInstructions: Record<Tone, string> = {
    story: `TONE — Story (${durationSeconds}s): Educational journey. Hook poses the question. Each insight builds understanding. The closing review is the emotional proof that it works. CTA feels like a natural next step.`,
    proof: `TONE — Proof (${durationSeconds}s): Evidence-led education. Each insight is a verifiable fact. The closing review confirms the theory with a real human. CTA is a confident invitation.`,
    bold: `TONE — Bold (${durationSeconds}s): Fast, punchy education. Cut to the most surprising insight. One closing quote. Move fast.`,
  }

  const insightCount = tone === 'bold' ? 1 : 2

  return `You are completing an Instagram Reel about ${theme.contentType?.replace('_', ' ')} content. The hook has been written. Build the educational content around it.

LANGUAGE: Write in ${language}.

Business: ${businessName} (${industry})
Reel theme: ${theme.title}
Content type: ${theme.contentType}
Key topic: ${theme.keyPhrase}

THE HOOK (do NOT change):
Headline: "${hookHeadline}"
${hookSubline ? `Subline: "${hookSubline}"` : ''}

${toneInstructions[tone]}

---

SLIDE STRUCTURE:
- hook: 3s — already written above
${tone === 'bold'
  ? `- insight: 4s — the single most surprising or counterintuitive fact about the topic`
  : `- insight: 4s — first key point (most surprising or counterintuitive)
- insight: 4s — second key point (deepens understanding or changes perception)`}
- quote: 4s — closing emotional proof (verbatim from the review below)
- cta: ${tone === 'bold' ? 5 : 6}s — call to action

CLOSING REVIEW (use verbatim for the quote slide — pick the best 18-word excerpt):
"${closingReview}"${closingAuthor ? ` — ${closingAuthor}` : ''}

---

INSIGHT SLIDES — rules:
- Each insight is a SHORT, punchy statement (max 10 words)
- Surprising, specific, or counterintuitive — something the viewer didn't know
- Never generic ("it's important to...") — always specific ("most people feel nothing after 20 minutes")
- highlightWords: the 1-2 words that carry the most weight

QUOTE SLIDE — rules:
- Verbatim excerpt from the closing review above — max 18 words
- Choose the excerpt that emotionally validates what the insights just taught
- highlightWords: the 1-2 words with the most weight

CTA — two lines:
Line 1 (ctaHeadline): Callback to the topic. Bridge from the education to taking action.
  - "Now you know what to expect. Come find out for yourself."
  - "The implant that took 45 minutes. See if you qualify."
  NEVER generic: "Book your appointment today"

Line 2 (ctaText): Friction reduction. Make the next step feel smaller than expected.
  - "One free consultation. No commitment."
  - "Message us your question. We reply same day."

Return ONLY valid JSON:
{
  "themeTitle": "${theme.title}",
  "totalDuration": ${durationSeconds},
  "ctaHeadline": "Topic callback — specific",
  "ctaText": "Friction reduction",
  "slides": [
    { "type": "hook", "duration": 3, "content": { "headline": "${hookHeadline}", "subline": ${hookSubline ? `"${hookSubline}"` : 'null'} } },
    ${insightCount === 2
      ? `{ "type": "insight", "duration": 4, "content": { "headline": "First insight (max 10 words)", "highlightWords": ["word1"] } },
    { "type": "insight", "duration": 4, "content": { "headline": "Second insight (max 10 words)", "highlightWords": ["word1"] } },`
      : `{ "type": "insight", "duration": 4, "content": { "headline": "The sharpest insight (max 10 words)", "highlightWords": ["word1"] } },`}
    { "type": "quote", "duration": 4, "content": { "quote": "Verbatim excerpt (max 18 words)", "highlightWords": ["word1"], "author": "${closingAuthor ?? 'null'}" } },
    { "type": "cta", "duration": ${tone === 'bold' ? 5 : 6}, "content": { "headline": "Topic callback", "cta": "Friction reduction" } }
  ]
}`
}

// ── PASS 1: Hook generation — social proof themes ────────────────────────────

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

// ── Motif selection ───────────────────────────────────────────────────────────

const INDUSTRY_ICON: Record<string, ReelMotif> = {
  dental:        'icon_tooth',
  gym:           'icon_dumbbell',
  restaurant:    'icon_fork_knife',
  bar:           'icon_cocktail',
  salon:         'icon_scissors',
  veterinary:    'icon_paw',
  lawyer:        'icon_scales',
  optician:      'icon_eye',
  hotel:         'icon_hotel_bed',
  tattoo:        'icon_needle',
  spa:           'light_rays',
  physiotherapy: 'heartbeat',
}

function selectMotif(theme: ReelTheme, industry: string, hookHeadline: string): { motif: ReelMotif; motifValue?: number } {
  const numMatch = hookHeadline.match(/\d+/)
  const motifValue = numMatch ? parseInt(numMatch[0]) : undefined
  const ct = theme.contentType ?? 'social_proof'

  if (ct !== 'social_proof') {
    switch (ct) {
      case 'educational':    return { motif: 'steps_reveal' }
      case 'myth_bust':      return { motif: 'split_screen' }
      case 'experience':     return { motif: INDUSTRY_ICON[industry] ?? 'particles' }
      case 'local_guide':    return { motif: 'pin_drop' }
      case 'behind_scenes':  return { motif: 'checklist' }
      case 'trust':          return { motif: 'years_timeline', motifValue }
      default:               return { motif: 'none' }
    }
  }

  // social_proof — pattern reels → crowd motif
  if (theme.reelType === 'pattern') return { motif: 'crowd_fill' }

  // story reels — detect framework from hook text
  if (motifValue) return { motif: 'counter_up', motifValue }
  if (/fly|flies|flew|drive|drove|travel|abroad|country|countries|miles|km/i.test(hookHeadline)) return { motif: 'flight_path' }
  if (/year|month|every|always|since|back|streak/i.test(hookHeadline)) return { motif: 'streak_line' }
  if (/asleep|didn.t|never|impossible|wrong|truth|actually|but/i.test(hookHeadline)) return { motif: 'split_screen' }
  if (/best|top|perfect|★|star/i.test(hookHeadline)) return { motif: 'stars_fill' }

  return { motif: INDUSTRY_ICON[industry] ?? 'radial_burst' }
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
  closingReview?: Review,
): Promise<ReelVariation | null> {
  try {
    const langSystem = `You must respond in ${language} only. Every word of your JSON output must be in ${language}. This is non-negotiable regardless of the business name or location.`
    const isVariety = theme.contentType && theme.contentType !== 'social_proof'

    let hookHeadline: string
    let hookSubline: string | null

    if (isVariety) {
      // Pass 1 — topic-based hook for educational/variety themes
      const hookMessage = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 300,
        system: langSystem,
        messages: [{ role: 'user', content: getVarietyHookPrompt(tone, theme, businessName, industry, language) }],
      })
      const hookText = (hookMessage.content[0] as { text: string }).text
      const hookMatch = hookText.match(/\{[\s\S]*\}/)
      if (!hookMatch) return null
      const hook = JSON.parse(hookMatch[0]) as { hookHeadline: string; hookSubline: string | null }
      hookHeadline = hook.hookHeadline
      hookSubline = hook.hookSubline ?? null
    } else {
      // Pass 1 — quote-based hook for social proof themes
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
      hookHeadline = hook.hookHeadline
      hookSubline = hook.hookSubline ?? null
    }

    // Pass 2 — full reel
    let parsed: Record<string, unknown>
    if (isVariety) {
      const closing = closingReview ?? reviews[0]
      const reelMessage = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1500,
        system: langSystem,
        messages: [{ role: 'user', content: getVarietyReelPrompt(
          tone, theme, hookHeadline, hookSubline,
          closing?.what_they_liked ?? theme.keyPhrase,
          closing?.customer_name ?? null,
          businessName, industry, language,
        ) }],
      })
      const reelText = (reelMessage.content[0] as { text: string }).text
      const reelMatch = reelText.match(/\{[\s\S]*\}/)
      if (!reelMatch) return null
      parsed = JSON.parse(reelMatch[0])
    } else {
      const reelMessage = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1500,
        system: langSystem,
        messages: [{ role: 'user', content: getReelPrompt(tone, theme, hookHeadline, hookSubline, reviewTexts, businessName, industry, reviews, language) }],
      })
      const reelText = (reelMessage.content[0] as { text: string }).text
      const reelMatch = reelText.match(/\{[\s\S]*\}/)
      if (!reelMatch) return null
      parsed = JSON.parse(reelMatch[0])
    }

    const config = TONE_CONFIGS[tone]
    const script: ReelScript = {
      themeTitle: parsed.themeTitle as string,
      totalDuration: parsed.totalDuration as number,
      slides: parsed.slides as ReelScript['slides'],
      template: config.template,
    }

    return {
      id: (['story', 'proof', 'bold'] as Tone[]).indexOf(tone) + 1,
      label: config.label,
      description: config.description,
      tone,
      hookHeadline,
      hookSubline: hookSubline ?? undefined,
      ctaHeadline: parsed.ctaHeadline as string ?? '',
      ctaText: parsed.ctaText as string ?? '',
      template: config.template,
      script,
    }
  } catch {
    return null
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { theme, reviews, businessName, industry, language, allPhotos }: {
    theme: ReelTheme
    reviews: Review[]
    businessName: string
    industry: string
    language?: string
    allPhotos?: string[]
  } = await req.json()

  const gbpReviews = reviews.filter(r => r.posted_to_google)
  if (!gbpReviews.length) {
    return NextResponse.json({ error: 'No GBP reviews available' }, { status: 400 })
  }

  const isVariety = theme.contentType && theme.contentType !== 'social_proof'
  const lang = language ?? 'English'

  // For variety themes: find the best closing review (topically relevant > highest score)
  const themeReviewIds = new Set(theme.reviewIds)
  const themeReviews = gbpReviews.filter(r => themeReviewIds.has(r.id))
  const closingReview = theme.anchorReviewId
    ? gbpReviews.find(r => r.id === theme.anchorReviewId)
    : themeReviews[0] ?? gbpReviews.sort((a, b) => (b.remarkability_score ?? 0) - (a.remarkability_score ?? 0))[0]

  // For social proof themes: find anchor + build review context
  const anchorReview = theme.anchorReviewId
    ? gbpReviews.find(r => r.id === theme.anchorReviewId)
    : gbpReviews.sort((a, b) => (b.remarkability_score ?? 0) - (a.remarkability_score ?? 0))[0]

  const anchorSentence = anchorReview?.anchor_sentence
    ?? anchorReview?.what_they_liked.slice(0, 150)
    ?? theme.keyPhrase

  const contextReviews = [
    ...(anchorReview ? [anchorReview] : []),
    ...gbpReviews.filter(r => themeReviewIds.has(r.id) && r.id !== anchorReview?.id),
  ].slice(0, 6)

  const reviewTexts = contextReviews.map((r, i) =>
    `Quote ${i + 1}: "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}`
  ).join('\n')

  // Generate all three tones in parallel (each tone runs 2 Opus calls internally)
  const tones: Tone[] = ['story', 'proof', 'bold']
  const variations = (await Promise.all(
    tones.map(tone => generateVariation(tone, theme, anchorSentence, reviewTexts, businessName, industry, gbpReviews, lang, isVariety ? closingReview : undefined))
  )).filter((v): v is ReelVariation => v !== null)

  // Assign motif based on theme + hook content
  variations.forEach(v => {
    const { motif, motifValue } = selectMotif(theme, industry, v.hookHeadline)
    v.motif = motif
    if (motifValue !== undefined) v.motifValue = motifValue
  })

  if (!variations.length) {
    return NextResponse.json({ error: 'Failed to generate reel variations' }, { status: 500 })
  }

  return NextResponse.json({ variations })
}
