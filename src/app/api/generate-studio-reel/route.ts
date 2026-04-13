import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ReelTheme, ReelScript, ReelSlide } from '@/types'
import type { ReelVariation, VisualTemplate } from '@/remotion/types'
import type { ReelMotif } from '@/remotion/motifs'
import { createClient } from '@/lib/supabase/server'

type Tone = 'story' | 'proof' | 'bold'

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

// ── Hook frameworks (shared with generate-reel) ───────────────────────────────

const HOOK_FRAMEWORKS = `SIX PROVEN HOOK FRAMEWORKS — pick the best one for the prompt:

1. CONTRAST: Two things that shouldn't coexist, do.
   Structure: "[Surprising context]. [They chose this anyway]."
   Example: "Norway has free dentistry. She still flies here."

2. EXPECTATION VIOLATION: Outcome directly contradicts a universal assumption.
   Structure: "[What everyone believes]. [What actually happened]."
   Example: "I fell asleep in the dentist's chair."

3. RESISTANCE OVERCOME: Viewer recognises their own hesitation.
   Structure: "[How long/how many times they held back]. [What tipped them over]."
   Example: "She cancelled 4 times before coming."

4. LOYALTY PROOF: Repetition as proof of quality.
   Structure: "[Frequency or duration]. [The choice that proves it]."
   Example: "He drives 2 hours. Every time."

5. EXPERT COMPARATIVE: Someone with options chose this.
   Structure: "[Implies wide experience]. [Chose this]."
   Example: "I've stayed in 47 countries. This is my favourite."

6. SPECIFIC NUMBER ANCHOR: Precision that makes behavior undeniable.
   Structure: "[Number] [unit]. [What it means]."
   Example: "37 years. Finally found the right one."`

// ── Studio reel prompt ────────────────────────────────────────────────────────

function getStudioReelPrompt(
  prompt: string,
  businessName: string,
  industry: string,
  reviewContext: string | null,
  variationIndex: number,
  answers?: { question: string; answer: string }[],
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
  const ctaDuration = tone === 'bold' ? 5 : 6
  const totalDuration = 4 + (insightCount * 4) + ctaDuration

  const templateOptions: VisualTemplate[] = ['immersive', 'editorial', 'split', 'minimal', 'gradient', 'cinematic', 'neon', 'bold', 'cards', 'headline', 'overlay', 'brand']
  const motifNote = `ReelMotif options (pick the most visually fitting): flight_path, counter_up, streak_line, stars_fill, radial_burst, split_screen, steps_reveal, checklist, particles, light_rays, heartbeat, crowd_fill, progress_ring, pin_drop, neon_glow, confetti, ripple_waves, aurora, flame, waveform, bar_chart_rise, chat_bubbles, lightning_bolt, rocket_launch, shield_check, lightbulb_on, target_hit, growth_tree, none`

  const reviewBlock = reviewContext
    ? `\nREVIEW CONTEXT (for optional quote slide only — use a quote slide ONLY if a real review naturally fits the reel's theme; do not force it):
${reviewContext}\n`
    : ''

  const variationGuidance = [
    `Variation 1 — Story: Lead with a human emotional angle. The hook should feel personal, even intimate. Draw the viewer in with warmth or curiosity.`,
    `Variation 2 — Proof: Lead with the most specific, verifiable claim. The hook should feel undeniable. The insights are facts that build a case.`,
    `Variation 3 — Bold: Lead with a pattern-interrupt. The hook is the bluntest, most surprising version of the truth. Short and punchy throughout.`,
  ][variationIndex]

  return `You are a creative director building an Instagram social clip for a local business. You write scripts that stop people mid-scroll and drive them to act.

Business: ${businessName} (${industry})
Brief from the business owner: "${prompt}"
${answers && answers.length > 0 ? `\nADDITIONAL CONTEXT (from qualifying questions — treat these as facts, not suggestions):\n${answers.map(a => `- ${a.question} → ${a.answer}`).join('\n')}\n` : ''}
CRITICAL RULE — THE BRIEF IS SACRED:
Every specific detail in the brief MUST appear in the script. If the brief mentions a discount (e.g. "20% off"), that exact discount must be in the script. If it mentions a product or service (e.g. "Invisalign"), that exact word must appear. If it mentions an event or deadline (e.g. "Black Friday"), that must be prominent. Never abstract away the real offer into vague language.

${variationGuidance}

${toneInstructions[tone]}

${HOOK_FRAMEWORKS}

The hook frameworks above provide the ANGLE and STRUCTURE — but the hook must still reference the actual offer, product, or event from the brief. Use the framework to make the offer feel surprising or compelling, not to replace it.
${reviewBlock}
---

SLIDE STRUCTURE (${totalDuration}s total):
- hook: 4s — sharp, specific. Use a hook framework to frame the brief's core offer in a way that stops the scroll. Max 10 words. Must reference the actual product/offer/event.
${insightCount === 1
  ? `- insight: 4s — the single most compelling reason to take the offer right now`
  : Array.from({ length: insightCount }, (_, i) => `- insight: 4s — ${['the core benefit or what makes this offer special', 'why now / urgency or scarcity', 'what the viewer gets or feels after taking action'][i]}`).join('\n')}
- cta: ${ctaDuration}s — drives a specific action. Must name the exact offer from the brief.

INSIGHT RULES:
- Each insight is SHORT and punchy (max 10 words)
- Must be directly relevant to the brief — no generic filler
- highlightWords: the 1-2 words that carry the most weight (often the product name, % off, or event name)

QUOTE SLIDE (optional):
- Only include if a review genuinely validates the exact offer or product in the brief
- Verbatim excerpt, max 18 words. Add between last insight and CTA.

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
      { "type": "hook", "duration": 4, "content": { "headline": "The hook", "subline": null } },
      ${insightCount === 1
        ? `{ "type": "insight", "duration": 4, "content": { "headline": "Sharpest insight (max 10 words)", "highlightWords": ["word1"] } },`
        : Array.from({ length: insightCount }, (_, i) => `{ "type": "insight", "duration": 4, "content": { "headline": "${['First', 'Second', 'Third'][i]} insight (max 10 words)", "highlightWords": ["word1"] } },`).join('\n      ')}
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
  const FREE_LIMIT = 1
  if (!isPro && generationsThisMonth >= FREE_LIMIT) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 403 })
  }

  // Fetch up to 20 best reviews for optional context
  const { data: reviews } = await supabase
    .from('reviews')
    .select('what_they_liked, customer_name, remarkability_score')
    .eq('business_id', businessId)
    .eq('posted_to_google', true)
    .order('remarkability_score', { ascending: false, nullsFirst: false })
    .limit(20)

  const reviewContext = reviews && reviews.length > 0
    ? reviews
        .slice(0, 8)
        .map((r, i) => `Review ${i + 1}: "${r.what_they_liked}"${r.customer_name ? ` — ${r.customer_name}` : ''}`)
        .join('\n')
    : null

  // Generate 3 variations in parallel
  const variationPromises = [0, 1, 2].map(async (i) => {
    try {
      const message = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: getStudioReelPrompt(prompt, business.name, business.industry, reviewContext, i, answers),
        }],
      })

      const text = (message.content[0] as { text: string }).text
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) return null

      const parsed = JSON.parse(match[0]) as {
        title: string
        keyPhrase: string
        emoji: string
        hookHeadline: string
        hookSubline: string | null
        ctaHeadline: string
        ctaText: string
        tone: Tone
        template: VisualTemplate
        motif: ReelMotif | 'none'
        script: ReelScript
      }

      const tonesByIndex: Tone[] = ['story', 'proof', 'bold']
      const tone = tonesByIndex[i]

      const toneLabels: Record<Tone, { label: string; description: string }> = {
        story: { label: 'Story',  description: 'Emotional arc · most shared' },
        proof: { label: 'Proof',  description: 'Evidence-led · most saved' },
        bold:  { label: 'Bold',   description: 'High energy · most reach' },
      }

      // Apply palette system
      const [paletteKey] = suggestPalettes(tone, false)
      const palette = PALETTE_REGISTRY[paletteKey]
      const scriptWithPalette = applyPaletteToScript(parsed.script, palette)

      // Select motif
      const { motif, motifValue } = selectStudioMotif(
        business.industry,
        tone,
        parsed.hookHeadline,
      )

      const variation: ReelVariation = {
        id: i + 1,
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
      }

      return { variation, parsed }
    } catch (err) {
      console.error(`Studio variation ${i} failed:`, err)
      return null
    }
  })

  const results = await Promise.all(variationPromises)
  const validResults = results.filter(Boolean) as { variation: ReelVariation; parsed: { title: string; keyPhrase: string; emoji: string; hookHeadline: string } }[]

  if (validResults.length === 0) {
    return NextResponse.json({ error: 'Failed to generate reel variations' }, { status: 500 })
  }

  const variations = validResults.map(r => r.variation)
  const first = validResults[0].parsed

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
