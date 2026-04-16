import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ReelTheme, ReelScript, ReelSlide } from '@/types'
import type { ReelVariation, VisualTemplate } from '@/remotion/types'
import type { ReelMotif } from '@/remotion/motifs'
import { createClient } from '@/lib/supabase/server'
import { pickMusicUrl } from '@/lib/reel-music'

type Tone = 'story' | 'proof' | 'bold'
type BriefType = 'offer' | 'brand' | 'launch' | 'education' | 'seasonal' | 'social_proof'

const client = new Anthropic()

// ── Palette registry (replicated from ReelEditor.tsx) ────────────────────────

type PaletteKey =
  | 'dark_cinematic' | 'bold_energy' | 'magazine_light' | 'brand_forward'
  | 'neon_pulse' | 'pure_type' | 'cards_all_day' | 'editorial_mix'
  | 'cinematic_cards' | 'immersive_overlay'

interface PaletteSlots {
  hook: VisualTemplate; quote: VisualTemplate; proof: VisualTemplate
  insight: VisualTemplate; cta: VisualTemplate
}

interface PaletteEntry { key: PaletteKey; label: string; slots: PaletteSlots }

const PALETTE_REGISTRY: Record<PaletteKey, PaletteEntry> = {
  dark_cinematic:    { key: 'dark_cinematic',    label: 'Dark Cinematic',    slots: { hook: 'cinematic', quote: 'overlay',  proof: 'minimal', insight: 'gradient',  cta: 'brand'    }},
  bold_energy:       { key: 'bold_energy',        label: 'Bold Energy',       slots: { hook: 'bold',      quote: 'neon',     proof: 'gradient',insight: 'neon',      cta: 'brand'    }},
  magazine_light:    { key: 'magazine_light',     label: 'Magazine Light',    slots: { hook: 'headline',  quote: 'headline', proof: 'split',   insight: 'editorial', cta: 'bold'     }},
  brand_forward:     { key: 'brand_forward',      label: 'Brand Forward',     slots: { hook: 'gradient',  quote: 'cards',    proof: 'minimal', insight: 'gradient',  cta: 'brand'    }},
  neon_pulse:        { key: 'neon_pulse',         label: 'Neon Pulse',        slots: { hook: 'neon',      quote: 'neon',     proof: 'minimal', insight: 'neon',      cta: 'gradient' }},
  pure_type:         { key: 'pure_type',          label: 'Pure Type',         slots: { hook: 'minimal',   quote: 'minimal',  proof: 'minimal', insight: 'minimal',   cta: 'brand'    }},
  cards_all_day:     { key: 'cards_all_day',      label: 'Cards All Day',     slots: { hook: 'cards',     quote: 'cards',    proof: 'minimal', insight: 'cards',     cta: 'brand'    }},
  editorial_mix:     { key: 'editorial_mix',      label: 'Editorial Mix',     slots: { hook: 'editorial', quote: 'headline', proof: 'minimal', insight: 'editorial', cta: 'gradient' }},
  cinematic_cards:   { key: 'cinematic_cards',    label: 'Cinematic Cards',   slots: { hook: 'cinematic', quote: 'cards',    proof: 'minimal', insight: 'gradient',  cta: 'brand'    }},
  immersive_overlay: { key: 'immersive_overlay',  label: 'Immersive Overlay', slots: { hook: 'immersive', quote: 'overlay',  proof: 'minimal', insight: 'cinematic', cta: 'brand'    }},
}

function suggestPalettes(tone: string, hasPhotos: boolean): [PaletteKey, PaletteKey, PaletteKey] {
  if (hasPhotos) {
    if (tone === 'story') return ['dark_cinematic', 'immersive_overlay', 'cinematic_cards']
    if (tone === 'bold')  return ['bold_energy', 'cinematic_cards', 'cards_all_day']
    return ['brand_forward', 'cards_all_day', 'dark_cinematic']
  }
  if (tone === 'story') return ['editorial_mix', 'magazine_light', 'brand_forward']
  if (tone === 'bold')  return ['bold_energy', 'neon_pulse', 'pure_type']
  return ['pure_type', 'brand_forward', 'magazine_light']
}

function applyPaletteToScript(s: ReelScript, palette: PaletteEntry): ReelScript {
  return {
    ...s,
    slides: s.slides.map(slide => ({
      ...slide,
      content: {
        ...slide.content,
        template: palette.slots[slide.type as keyof PaletteSlots] ?? 'immersive',
      },
    })),
  }
}

// ── ISO week string ───────────────────────────────────────────────────────────

function currentWeekOf(): string {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`
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

function selectStudioMotif(industry: string, tone: Tone, hookHeadline: string): { motif: ReelMotif; motifValue?: number } {
  const numMatch = hookHeadline.match(/\d+/)
  const motifValue = numMatch ? parseInt(numMatch[0]) : undefined

  if (motifValue && motifValue > 5) return { motif: 'counter_up', motifValue }
  if (/fly|flies|flew|drive|drove|travel|abroad|country|countries|miles|km/i.test(hookHeadline)) return { motif: 'flight_path' }
  if (/year|month|every|always|since|back|streak/i.test(hookHeadline)) return { motif: 'streak_line' }
  if (/asleep|didn.t|never|impossible|wrong|truth|actually|but/i.test(hookHeadline)) return { motif: 'split_screen' }
  if (/best|top|perfect|★|star/i.test(hookHeadline)) return { motif: 'stars_fill' }
  if (tone === 'bold') return { motif: 'radial_burst' }
  return { motif: INDUSTRY_ICON[industry] ?? 'particles' }
}

// ── Brief classification ───────────────────────────────────────────────────────

function classifyBrief(prompt: string): BriefType {
  const p = prompt.toLowerCase()
  if (/\d+\s*%|\b(off|discount|deal|promo|sale|savings|free\s+\w|coupon|special offer)\b/.test(p)) return 'offer'
  if (/\b(black friday|cyber monday|christmas|new year|summer|spring|fall|autumn|holiday|valentines|halloween|thanksgiving|event|anniversary|grand opening|season)\b/.test(p)) return 'seasonal'
  if (/\b(launch|launching|introducing|just opened|now open|coming soon|now available|brand new|new service|new product|we now offer)\b/.test(p)) return 'launch'
  if (/\b(why|how to|tip|tips|fact|did you know|myth|truth|secret|mistake|mistakes|avoid|guide|learn|educate|explain)\b/.test(p)) return 'education'
  if (/\b(review|rating|stars|customers|testimonial|clients|feedback|trusted|recommended|google|5[- ]star)\b/.test(p)) return 'social_proof'
  return 'brand'
}

// ── Hook frameworks by brief type ─────────────────────────────────────────────

const BRIEF_TYPE_FRAMEWORKS: Record<BriefType, string> = {
  offer: `OFFER HOOKS — urgency and specificity. The offer details ARE the hook. Never abstract them into vague language.

FRAMEWORKS:
1. URGENCY ANCHOR: State the offer as a plain fact with a hard limit.
   Structure: "[Exact offer]. [Hard deadline or scarcity]."
   Example: "20% off Invisalign. 4 days only."
   Example: "6 Black Friday slots. Half already gone."

2. OFFER CONTRAST: Normal price/effort vs this moment.
   Structure: "[What it normally costs or takes]. [What it costs right now]."
   Example: "Invisalign usually takes 18 months to save for. Not this Friday."
   Example: "Full price tomorrow. 20% off today."

3. VALUE REFRAME: Restate the offer in terms of what it actually buys the customer.
   Structure: "[What the deal actually equals in real terms]."
   Example: "20% off Invisalign. That's hundreds back in your pocket."
   Example: "One Black Friday decision. Straight teeth for life."`,

  brand: `BRAND/POSITIONING HOOKS — bold claims, hard differentiation. No soft language.

FRAMEWORKS:
1. BOLD CLAIM: The most specific, confident version of what makes this business different.
   Structure: "[Specific claim most businesses wouldn't dare say]."
   Example: "Most gyms lose 60% of members by March. We don't."
   Example: "Austin has 47 dentists. One offers same-day Invisalign."

2. CONTRAST POSITIONING: What everyone in the industry does vs what you do instead.
   Structure: "[What most competitors do]. [What you do instead]."
   Example: "Most salons rebook you in 3 weeks. We open same-day slots."
   Example: "Most gyms sell memberships. We sell results."

3. CATEGORY CLAIM: Own the category outright.
   Structure: "[Category you own]. [Why]."
   Example: "Best Invisalign provider in the area. Not our words. 300+ Google reviews."`,

  launch: `LAUNCH HOOKS — excitement, specificity, FOMO. Make it feel like a real event.

FRAMEWORKS:
1. ARRIVAL STATEMENT: It's here. Full stop.
   Structure: "[What is launching]. [What it means for the reader right now]."
   Example: "Same-day Invisalign. Now available."
   Example: "We just added Sunday hours. No more waiting until Monday."

2. BEFORE/AFTER LAUNCH: The problem that existed before vs how it's solved now.
   Structure: "[The old problem]. [How it's now fixed]."
   Example: "You used to wait 3 weeks for an appointment. That changes now."
   Example: "No more driving 40 minutes for a specialist. We're here."

3. EARLY ACCESS HOOK: Scarcity at launch.
   Structure: "[What's new]. [Limited first-mover window]."
   Example: "New Invisalign financing. First 20 patients lock the lowest rate."`,

  education: `EDUCATION HOOKS — reframe, challenge assumptions, teach something genuinely surprising.

FRAMEWORKS:
1. MYTH BUST: Challenge a belief the viewer holds right now.
   Structure: "[What they think is true]. [What is actually true]."
   Example: "Invisalign isn't cosmetic. It's correcting how your jaw actually works."
   Example: "You're not joining a gym. You're buying back your energy."

2. SURPRISING FACT: A counterintuitive number or truth pulled directly from the brief.
   Structure: "[Fact that stops the scroll — ideally something the viewer didn't know]."
   Example: "Most people who want Invisalign never book. The price stops them."
   Example: "Straight teeth prevent jaw problems for life. Most people don't find out until too late."

3. QUESTION HOOK: Ask the question your ideal customer is already silently asking.
   Structure: "[Direct question they haven't answered yet]."
   Example: "Why does Invisalign cost so much less here than everywhere else?"
   Example: "What's actually stopping you from getting the smile you want?"`,

  seasonal: `SEASONAL/EVENT HOOKS — emotion + occasion. Make the moment feel real, time-limited, and unmissable.

FRAMEWORKS:
1. OCCASION ANCHOR: Name the moment. Make the offer inseparable from it.
   Structure: "[Occasion]. [What it unlocks that normally isn't available]."
   Example: "Black Friday hits different when it's 20% off straight teeth."
   Example: "New year. New smile. 20% off Invisalign in January."

2. CLOSING WINDOW: The moment is ending — and the offer goes with it.
   Structure: "[Occasion] ends [when]. [What disappears with it]."
   Example: "Black Friday ends Sunday. So does the 20% Invisalign discount."
   Example: "This offer disappears December 31st."

3. EMOTIONAL OCCASION: Frame the offer as something meaningful, not just a deal.
   Structure: "[Emotionally resonant framing tied to the occasion]."
   Example: "The best gift you'll give yourself this year isn't a gadget."
   Example: "One day a year straight teeth are actually affordable. Today."`,

  social_proof: `SOCIAL PROOF HOOKS — specific numbers, real outcomes. Never vague or approximate.

FRAMEWORKS:
1. NUMBER LANDING: Open with the most impressive specific number.
   Structure: "[Specific number]. [What it proves about trust or quality]."
   Example: "300 five-star reviews. All from real patients, all unprompted."
   Example: "47 new members this month. Most from a single referral."

2. OUTCOME STATEMENT: A specific result a customer type actually gets.
   Structure: "[Concrete outcome tied to the service]."
   Example: "They came in for a checkup. Left with an Invisalign plan they could afford."
   Example: "First session. Down 4kg. Back every week since."

3. TRUST PROOF: A fact that demonstrates trust without asking the viewer to trust you.
   Structure: "[Hard evidence of track record or authority]."
   Example: "Most reviewed dental clinic in the area. By a long way."
   Example: "#1 on Google Maps for 'gym near me'. Three years running."`,
}

// ── Studio reel prompt ────────────────────────────────────────────────────────

function getStudioReelPrompt(
  prompt: string,
  businessName: string,
  industry: string,
  reviewContext: string | null,
  variationIndex: number,
  briefType: BriefType,
  answers?: { question: string; answer: string }[],
  language = 'English',
): string {
  const tonesByIndex: Tone[] = ['story', 'proof', 'bold']
  const tone = tonesByIndex[variationIndex]

  const toneInstructions: Record<Tone, string> = {
    story: `TONE — Story (emotional arc, ~20s):
Build a narrative that makes the viewer feel something. The hook introduces a human moment or tension. Each insight deepens the story. The CTA closes the emotional loop and makes action feel natural.
Pacing: let moments breathe. Each slide is a beat in a story.`,
    proof: `TONE — Proof (evidence-led, ~20s):
Build a case. Each insight is a specific, verifiable fact or benefit. Together they prove an undeniable point.
Pacing: confident and deliberate. Each slide feels like evidence landing.`,
    bold: `TONE — Bold (pattern-interrupt, ~15s):
Move fast. Cut ruthlessly. Every word earns its place. The hook should pattern-interrupt. The insights are the sharpest, most counterintuitive version of the truth.
Pacing: punch. pause. punch. No filler.`,
  }

  const slideCountByTone: Record<Tone, number> = { story: 3, proof: 3, bold: 1 }
  const insightCount = slideCountByTone[tone]
  const slideDuration = tone === 'bold' ? 4 : 5
  const ctaDuration = tone === 'bold' ? 5 : 6
  const quoteDuration = reviewContext ? 6 : 0
  const totalDuration = slideDuration + (insightCount * slideDuration) + quoteDuration + ctaDuration

  const templateOptions: VisualTemplate[] = ['immersive', 'editorial', 'split', 'minimal', 'gradient', 'cinematic', 'neon', 'bold', 'cards', 'headline', 'overlay', 'brand']
  const motifNote = `ReelMotif options (pick the most visually fitting): flight_path, counter_up, streak_line, stars_fill, radial_burst, split_screen, steps_reveal, checklist, particles, light_rays, heartbeat, crowd_fill, progress_ring, pin_drop, neon_glow, confetti, ripple_waves, aurora, flame, waveform, bar_chart_rise, chat_bubbles, lightning_bolt, rocket_launch, shield_check, lightbulb_on, target_hit, growth_tree, none`

  const reviewBlock = reviewContext
    ? `\nREAL CUSTOMER REVIEWS — these are verbatim. The quote slide MUST use one of these exact reviews, word for word. Never paraphrase, never combine, never invent. If you use a review, copy it exactly:
${reviewContext}\n`
    : ''

  const variationGuidance = [
    `Variation 1 — Story: Lead with a human emotional angle. The hook should feel personal, even intimate. Draw the viewer in with warmth or curiosity.`,
    `Variation 2 — Proof: Lead with the most specific, verifiable claim. The hook should feel undeniable. The insights are facts that build a case.`,
    `Variation 3 — Bold: Lead with a pattern-interrupt. The hook is the bluntest, most surprising version of the truth. Short and punchy throughout.`,
  ][variationIndex]

  return `You are a creative director building an Instagram social clip for a local business. You write scripts that stop people mid-scroll and drive them to act.

LANGUAGE: Write ALL script content in ${language}. Every word of the output JSON must be in ${language}.

Business: ${businessName} (${industry})
Brief from the business owner: "${prompt}"
${answers && answers.length > 0 ? `\nADDITIONAL CONTEXT (from qualifying questions — treat these as facts, not suggestions):\n${answers.map(a => `- ${a.question} → ${a.answer}`).join('\n')}\n` : ''}
CRITICAL RULE — THE BRIEF IS SACRED:
Every specific detail in the brief MUST appear in the script. If the brief mentions a discount (e.g. "20% off"), that exact discount must be in the script. If it mentions a product or service (e.g. "Invisalign"), that exact word must appear. If it mentions an event or deadline (e.g. "Black Friday"), that must be prominent. Never abstract away the real offer into vague language.

${variationGuidance}

${toneInstructions[tone]}

BRIEF TYPE: ${briefType.toUpperCase()} — use the frameworks below. Every hook must reference real details from the brief. Never invent a person, a customer story, or a quote.

${BRIEF_TYPE_FRAMEWORKS[briefType]}
${reviewBlock}
---

SLIDE STRUCTURE (${totalDuration}s total):
- hook: ${slideDuration}s — sharp, specific. Use a hook framework to frame the brief's core offer in a way that stops the scroll. Max 10 words. Must reference the actual product/offer/event.
${insightCount === 1
  ? `- insight: ${slideDuration}s — the single most compelling reason to take the offer right now`
  : Array.from({ length: insightCount }, (_, i) => `- insight: ${slideDuration}s — ${['the core benefit or what makes this offer special', 'why now — the urgency or scarcity in plain language', 'the specific outcome the customer walks away with'][i]}`).join('\n')}
${reviewContext ? `- quote: 5s — verbatim excerpt from the most relevant review above` : ''}
- cta: ${ctaDuration}s — drives a specific action. Must name the exact offer from the brief.

INSIGHT RULES:
- Each insight is a plain statement of fact or benefit — not a tagline, not a slogan, not poetic
- Write in natural English word order. NEVER invert syntax to sound clever ("Confidence you keep" is wrong. "Confidence that lasts" is right.)
- Short and direct (max 8 words). No filler words.
- Must name the actual product, offer, or outcome — no vague generalisations
- highlightWords: the 1-2 words that carry the most weight (product name, % off, or key outcome)

QUOTE SLIDE:
- If review context is provided above, you MUST include a quote slide between the last insight and the CTA.
- Pick the review that most directly validates the brief's topic.
- The quote field MUST be copied word for word from one of the reviews above — no paraphrasing, no combining, no inventing.
- Trim to max 18 words by cutting from the end, but never change the words.
- If no review context is provided, omit the quote slide entirely.

CTA — two lines, both required:
Line 1 (ctaHeadline): Name the specific offer from the brief. Make it feel like the natural next step.
  Good: "20% off Invisalign. This Black Friday only."
  Good: "Your straight smile starts here. At 20% less."
  NEVER: "Book your appointment today" / "Visit us now" / anything that ignores the brief

Line 2 (ctaText): Friction reduction. Make acting feel easy.
  Good: "DM us 'FRIDAY' to claim your spot."
  Good: "Limited appointments. Message us now."
  NEVER: "Book now" / "Call us today"

TITLE: Generate a short, punchy title for this reel theme (3-5 words, no business name)
KEY PHRASE: A short phrase (2-4 words) summarising the core idea
EMOJI: One emoji that represents this reel
TEMPLATE: Choose the best overall VisualTemplate for this variation. Options: ${templateOptions.join(', ')}
MOTIF: ${motifNote}

Return ONLY valid JSON — no markdown, no explanation:
{
  "title": "Short punchy reel title",
  "keyPhrase": "Core idea in 2-4 words",
  "emoji": "🔥",
  "hookHeadline": "The hook (max 10 words)",
  "hookSubline": "Optional 6-word context line, or null",
  "ctaHeadline": "Topic callback — specific, not generic",
  "ctaText": "Friction reduction — makes next step feel small",
  "tone": "${tone}",
  "template": "immersive",
  "motif": "particles",
  "script": {
    "themeTitle": "Same as title above",
    "totalDuration": ${totalDuration},
    "slides": [
      { "type": "hook", "duration": ${slideDuration}, "content": { "headline": "The hook", "subline": null } },
      ${insightCount === 1
        ? `{ "type": "insight", "duration": ${slideDuration}, "content": { "headline": "Sharpest insight (max 8 words)", "highlightWords": ["word1"] } },`
        : Array.from({ length: insightCount }, (_, i) => `{ "type": "insight", "duration": ${slideDuration}, "content": { "headline": "${['First', 'Second', 'Third'][i]} insight (max 8 words)", "highlightWords": ["word1"] } },`).join('\n      ')}
      ${reviewContext ? `{ "type": "quote", "duration": 6, "content": { "quote": "Verbatim excerpt from the most relevant review", "author": "Reviewer name or null", "highlightWords": ["word1"] } },` : ''}
      { "type": "cta", "duration": ${ctaDuration}, "content": { "headline": "Topic callback headline", "cta": "Friction reduction action" } }
    ]
  }
}`
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { prompt, businessId, answers }: { prompt: string; businessId: string; answers?: { question: string; answer: string }[] } = await req.json()

  if (!prompt?.trim() || !businessId) {
    return NextResponse.json({ error: 'Missing prompt or businessId' }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch business info
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('name, industry, brand_color, website_url, reel_themes, plan, studio_generations_this_month, studio_generations_reset_at')
    .eq('id', businessId)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Check + reset monthly counter
  const now = new Date()
  const resetAt = business.studio_generations_reset_at ? new Date(business.studio_generations_reset_at) : null
  const needsReset = !resetAt || now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()

  let generationsThisMonth = needsReset ? 0 : (business.studio_generations_this_month ?? 0)

  if (needsReset) {
    await supabase.from('businesses').update({
      studio_generations_this_month: 0,
      studio_generations_reset_at: now.toISOString(),
    }).eq('id', businessId)
  }

  // Enforce free tier limit
  const isPro = business.plan === 'pro'
  const MONTHLY_LIMIT = isPro ? 100 : 3
  if (generationsThisMonth >= MONTHLY_LIMIT) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 403 })
  }

  // Fetch all reviews for topic-matched context
  const { data: reviews } = await supabase
    .from('reviews')
    .select('what_they_liked, customer_name, remarkability_score')
    .eq('business_id', businessId)
    .eq('posted_to_google', true)
    .order('remarkability_score', { ascending: false, nullsFirst: false })
    .limit(100)

  // Extract keywords from brief + answers for topic matching
  const briefWords = [prompt, ...(answers?.map(a => a.answer) ?? [])]
    .join(' ')
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3)

  function reviewRelevanceScore(text: string): number {
    const t = text.toLowerCase()
    return briefWords.reduce((score, word) => score + (t.includes(word) ? 1 : 0), 0)
  }

  let scoredReviews = (reviews ?? []).map(r => ({
    ...r,
    topicScore: reviewRelevanceScore(r.what_they_liked ?? ''),
  }))

  // Sort: topic-relevant first, then by remarkability score
  scoredReviews.sort((a, b) => {
    if (b.topicScore !== a.topicScore) return b.topicScore - a.topicScore
    return (b.remarkability_score ?? 0) - (a.remarkability_score ?? 0)
  })

  const reviewContext = scoredReviews.length > 0
    ? scoredReviews
        .slice(0, 6)
        .map((r, i) => `Review ${i + 1}: "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}`)
        .join('\n')
    : null

  // Detect target language from brief + answers
  // If the brief explicitly targets a different-language audience, use that language
  const allText = [prompt, ...(answers?.map(a => a.answer) ?? [])].join(' ').toLowerCase()
  function detectTargetLanguage(): string {
    if (/\b(uk|british|england|english.speaking|from the uk|attract.*uk|uk.*patient|british.*patient)\b/.test(allText)) return 'English'
    if (/\b(us|american|united states|from the us|us.*patient)\b/.test(allText)) return 'English'
    if (/\b(french|france|français)\b/.test(allText)) return 'French'
    if (/\b(german|germany|deutsch)\b/.test(allText)) return 'German'
    if (/\b(italian|italy|italiano)\b/.test(allText)) return 'Italian'
    if (/\b(dutch|netherlands|holland)\b/.test(allText)) return 'Dutch'
    return 'English' // default to English for broad reach
  }
  const targetLanguage = detectTargetLanguage()

  // Pick the best tone for this brief type — single generation
  const briefType = classifyBrief(prompt)
  const BEST_TONE_FOR_BRIEF: Record<BriefType, Tone> = {
    offer:        'bold',
    seasonal:     'bold',
    brand:        'story',
    launch:       'story',
    education:    'proof',
    social_proof: 'proof',
  }
  const tone = BEST_TONE_FOR_BRIEF[briefType]
  const toneIndex: Record<Tone, number> = { story: 0, proof: 1, bold: 2 }

  const toneLabels: Record<Tone, { label: string; description: string }> = {
    story: { label: 'Story',  description: 'Emotional arc · most shared' },
    proof: { label: 'Proof',  description: 'Evidence-led · most saved' },
    bold:  { label: 'Bold',   description: 'High energy · most reach' },
  }

  let parsed: {
    title: string; keyPhrase: string; emoji: string
    hookHeadline: string; hookSubline: string | null
    ctaHeadline: string; ctaText: string
    tone: Tone; template: VisualTemplate; motif: ReelMotif | 'none'
    script: ReelScript
  } | null = null

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: getStudioReelPrompt(prompt, business.name, business.industry, reviewContext, toneIndex[tone], briefType, answers, targetLanguage),
      }],
    })
    const text = (message.content[0] as { text: string }).text
    const match = text.match(/\{[\s\S]*\}/)
    if (match) parsed = JSON.parse(match[0])
  } catch (err) {
    console.error('Studio generation failed:', err)
  }

  if (!parsed) {
    return NextResponse.json({ error: 'Failed to generate reel' }, { status: 500 })
  }

  const [paletteKey] = suggestPalettes(tone, false)
  const palette = PALETTE_REGISTRY[paletteKey]
  const rawScript = parsed.script
  // Compute totalDuration from actual slide durations — AI hints are unreliable
  rawScript.totalDuration = rawScript.slides.reduce((sum: number, s: { duration: number }) => sum + s.duration, 0)
  const scriptWithPalette = applyPaletteToScript(rawScript, palette)
  const { motif, motifValue } = selectStudioMotif(business.industry, tone, parsed.hookHeadline)

  const variation: ReelVariation = {
    id: 1,
    label: toneLabels[tone].label,
    description: toneLabels[tone].description,
    tone,
    hookHeadline: parsed.hookHeadline,
    hookSubline: parsed.hookSubline ?? undefined,
    ctaHeadline: parsed.ctaHeadline,
    ctaText: parsed.ctaText,
    template: parsed.template,
    script: scriptWithPalette,
    motif,
    ...(motifValue !== undefined && { motifValue }),
    musicUrl: pickMusicUrl(tone, business.industry),
  }

  const variations = [variation]
  const first = parsed

  // Build theme
  const themeId = crypto.randomUUID()
  const newTheme: ReelTheme = {
    id: themeId,
    title: first.title,
    hook: first.hookHeadline,
    reelType: 'studio' as ReelTheme['reelType'],
    keyPhrase: first.keyPhrase,
    emoji: first.emoji,
    reviewIds: [],
    weekOf: currentWeekOf(),
    cachedScript: variations[0].script,
    cachedVariations: variations,
  }

  // Prepend to existing reel_themes
  const existingThemes: ReelTheme[] = Array.isArray(business.reel_themes) ? business.reel_themes : []
  const updatedThemes = [newTheme, ...existingThemes]

  await supabase
    .from('businesses')
    .update({
      reel_themes: updatedThemes,
      studio_generations_this_month: generationsThisMonth + 1,
      studio_generations_reset_at: needsReset ? now.toISOString() : business.studio_generations_reset_at,
    })
    .eq('id', businessId)

  return NextResponse.json({ themeId })
}
