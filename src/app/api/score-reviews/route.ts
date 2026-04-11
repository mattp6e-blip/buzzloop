import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { Review } from '@/types'

const client = new Anthropic()

// Service client for server-to-server calls (no user session)
function getDb(useService = false) {
  if (useService) {
    return createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return createClient()
}

const BATCH_SIZE = 20

function buildScoringPrompt(reviews: Review[], industry: string): string {
  const list = reviews.map((r, i) =>
    `[${i + 1}] "${r.what_they_liked}" — ${r.customer_name ?? 'Anonymous'}, ${r.star_rating}★`
  ).join('\n')

  return `You are scoring Google reviews for hook potential — how likely they are to contain raw material for a scroll-stopping social media reel for a ${industry} business.

THE TEST: Read one sentence to a stranger who knows nothing about this business. Would they raise an eyebrow? If yes — high score. If they'd expect it — low score.

REVIEWS:
${list}

HIGH-SCORE SIGNALS (any one = strong raw material):
- Behavioral proof: customer did something that implies extreme quality (drove far, came back repeatedly, chose this over a closer/cheaper option, extended their stay)
- Comparative choice: explicitly rejected alternatives ("tried 3 others", "could have gone closer but")
- Specific number or time: "37 years", "every week for 6 years", "20 minutes", "3 other plumbers couldn't fix it"
- Extreme circumstance: came despite real difficulty, called at unusual hour, went significantly out of their way
- Expectation violation: outcome directly contradicts a common assumption about this type of business
- Unexpected advocate: skeptic, expert, child, or someone with strong alternatives who chose this anyway

LOW-SCORE SIGNALS (these alone = no hook potential):
- Pure adjective stacking: "amazing, incredible, professional, wonderful"
- Generic superlatives: "best ever", "10/10 would recommend"
- Vague transformation without behavior: "changed my life", "gave me my confidence back"
- Only feelings described, no actions

SCORES:
80-100: One sentence in this review could anchor a reel hook with minimal editing.
50-79: Has some specificity — useful as supporting evidence, not an anchor.
20-49: Positive but generic.
0-19: No raw material.

Return ONLY a valid JSON array, one object per review in the same order:
[
  {
    "score": 0-100,
    "anchor_sentence": "the single best sentence from this review, or null if score < 50",
    "signal": "behavioral_proof | comparative_choice | specific_number | extreme_circumstance | expectation_violation | unexpected_advocate | none",
    "reason": "max 8 words explaining the score"
  }
]`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessId, internal } = body
    if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 })

    // Allow server-to-server internal calls (from syncGoogleReviews, cron jobs)
    // Otherwise require a logged-in user
    let supabase: Awaited<ReturnType<typeof createClient>>
    if (internal) {
      supabase = getDb(true) as unknown as Awaited<ReturnType<typeof createClient>>
    } else {
      supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only score GBP reviews (posted_to_google = true) that haven't been scored yet
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, what_they_liked, customer_name, star_rating')
      .eq('business_id', businessId)
      .eq('posted_to_google', true)
      .is('remarkability_score', null)

    if (error) throw error
    if (!reviews?.length) return NextResponse.json({ scored: 0 })

    // Fetch business industry for context
    const { data: business } = await supabase
      .from('businesses')
      .select('industry')
      .eq('id', businessId)
      .single()
    const industry = business?.industry ?? 'other'

    // Batch into groups of BATCH_SIZE, run in parallel
    const batches: Review[][] = []
    for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
      batches.push(reviews.slice(i, i + BATCH_SIZE) as Review[])
    }

    const batchResults = await Promise.all(
      batches.map(async (batch) => {
        try {
          const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2000,
            messages: [{ role: 'user', content: buildScoringPrompt(batch, industry) }],
          })
          const text = (message.content[0] as { text: string }).text
          const match = text.match(/\[[\s\S]*\]/)
          if (!match) return []
          const scores = JSON.parse(match[0]) as {
            score: number
            anchor_sentence: string | null
            signal: string
            reason: string
          }[]
          return batch.map((review, i) => ({
            id: review.id,
            remarkability_score: scores[i]?.score ?? 0,
            anchor_sentence: scores[i]?.anchor_sentence ?? null,
            remarkability_signal: scores[i]?.signal ?? 'none',
          }))
        } catch {
          return []
        }
      })
    )

    const updates = batchResults.flat()

    // Write scores back to DB
    await Promise.all(
      updates.map(({ id, remarkability_score, anchor_sentence, remarkability_signal }) =>
        supabase.from('reviews').update({
          remarkability_score,
          anchor_sentence,
          remarkability_signal,
        }).eq('id', id)
      )
    )

    return NextResponse.json({ scored: updates.length })
  } catch (err) {
    console.error('[score-reviews]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
