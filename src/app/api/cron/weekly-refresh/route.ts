import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { buildReviewList, getAnalysisPrompt, getVarietyPrompt, getClusterConfig } from '@/app/api/analyze-reviews/route'
import type { Review, ReelTheme } from '@/types'

function currentWeekOf(): string {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

const anthropic = new Anthropic()

function detectLanguage(reviews: Review[]): string {
  const text = reviews.map(r => r.what_they_liked).join(' ').toLowerCase()
  const markers: [string, string[]][] = [
    ['English',    [' the ', ' and ', ' was ', ' they ', ' very ', ' great ']],
    ['Spanish',    [' que ', ' los ', ' las ', ' del ', ' muy ', ' fue ']],
    ['French',     [' les ', ' des ', ' est ', ' dans ', ' très ', ' bien ']],
    ['German',     [' und ', ' die ', ' der ', ' das ', ' ist ', ' sehr ']],
    ['Italian',    [' che ', ' del ', ' sono ', ' nel ', ' molto ', ' alla ']],
    ['Portuguese', [' que ', ' com ', ' uma ', ' não ', ' muito ', ' está ']],
  ]
  let best = 'English', bestScore = 0
  for (const [lang, words] of markers) {
    const score = words.filter(w => text.includes(w)).length
    if (score > bestScore) { bestScore = score; best = lang }
  }
  return best
}

function parseThemes(text: string): ReelTheme[] {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return []
  try {
    const parsed = JSON.parse(match[0])
    return parsed.themes ?? (Array.isArray(parsed) ? parsed : [])
  } catch { return [] }
}

async function refreshBusiness(businessId: string, businessName: string, industry: string, reviews: Review[], businessContext: string | null): Promise<number> {
  const gbpReviews = reviews.filter(r => r.posted_to_google)
  if (gbpReviews.length < 2) return 0

  const sorted = [...gbpReviews].sort((a, b) => {
    const aScore = a.remarkability_score ?? (a.what_they_liked.length > 100 ? 30 : 10)
    const bScore = b.remarkability_score ?? (b.what_they_liked.length > 100 ? 30 : 10)
    return bScore - aScore
  })

  const inputCap = sorted.length <= 10 ? sorted.length
    : sorted.length <= 30 ? Math.min(sorted.length, 20)
    : sorted.length <= 100 ? 40 : 60

  const topReviews = sorted.slice(0, inputCap)
  const reviewList = buildReviewList(topReviews)
  const language = detectLanguage(gbpReviews)
  const langSystem = `You must respond in ${language} only. Every word of your JSON output must be in ${language}.`

  const cluster = getClusterConfig(industry)

  const [proofMessage, varietyMessage] = await Promise.all([
    anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      system: langSystem,
      messages: [{ role: 'user', content: getAnalysisPrompt(reviewList, industry, businessName, gbpReviews.length, language, cluster.counts.socialProof) }],
    }),
    anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2500,
      system: langSystem,
      messages: [{ role: 'user', content: getVarietyPrompt(industry, businessName, reviewList, language, businessContext, cluster) }],
    }),
  ])

  const proofThemes   = parseThemes((proofMessage.content[0] as { text: string }).text)
  const varietyThemes = parseThemes((varietyMessage.content[0] as { text: string }).text)
  const proofSorted   = proofThemes.sort((a, b) => (b.buzzScore ?? 0) - (a.buzzScore ?? 0))
  const weekOf        = currentWeekOf()
  const newThemes     = [...proofSorted, ...varietyThemes].map(t => ({ ...t, weekOf }))

  if (newThemes.length === 0) return 0

  // Additive merge: fetch existing themes and append new ones
  const supabase = createServiceClient()
  const { data: biz } = await supabase
    .from('businesses')
    .select('reel_themes')
    .eq('id', businessId)
    .single()

  const existing: ReelTheme[] = biz?.reel_themes ?? []
  const existingIds = new Set(existing.map((t: ReelTheme) => t.id))
  const brandNew = newThemes.filter(t => !existingIds.has(t.id))

  // Merge: existing + new; if over 30, drop lowest-buzz from oldest week first
  const merged = [...existing, ...brandNew]
  const capped = merged.length > 30
    ? merged.sort((a, b) => {
        const weekDiff = (b.weekOf ?? '').localeCompare(a.weekOf ?? '')
        if (weekDiff !== 0) return weekDiff
        return (b.buzzScore ?? 0) - (a.buzzScore ?? 0)
      }).slice(0, 30)
    : merged

  await supabase.from('businesses').update({
    reel_themes: capped,
    reel_themes_review_count: gbpReviews.length,
  }).eq('id', businessId)

  return brandNew.length
}

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret (skipped in local dev where CRON_SECRET is unset)
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createServiceClient()

  // Fetch all businesses that have connected GBP (last_gbp_sync_at is set)
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, industry, business_context')
    .not('last_gbp_sync_at', 'is', null)

  if (error) {
    console.error('[weekly-refresh] Failed to fetch businesses:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!businesses?.length) {
    return NextResponse.json({ refreshed: 0, skipped: 0 })
  }

  const results = { refreshed: 0, skipped: 0, errors: 0 }

  for (const biz of businesses) {
    try {
      // Fetch this business's reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', biz.id)
        .eq('posted_to_google', true)

      if (!reviews?.length || reviews.length < 2) {
        results.skipped++
        continue
      }

      const count = await refreshBusiness(biz.id, biz.name, biz.industry, reviews as Review[], biz.business_context ?? null)
      if (count > 0) {
        results.refreshed++
        console.log(`[weekly-refresh] ${biz.name}: ${count} themes`)
      } else {
        results.skipped++
      }
    } catch (err) {
      results.errors++
      console.error(`[weekly-refresh] Error for ${biz.name}:`, err)
    }
  }

  console.log('[weekly-refresh] Done:', results)
  return NextResponse.json(results)
}
