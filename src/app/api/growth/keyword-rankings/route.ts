import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const FREE_TIER_LIMIT = 3
const RANK_SEARCH_LIMIT = 20 // how many Places results to scan for the business

interface KeywordRanking {
  keyword: string
  rank: number | null // null = not in top RANK_SEARCH_LIMIT
  checkedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generateKeywords(params: {
  name: string
  industry: string
  city: string | null
  businessContext: string | null
}): Promise<string[]> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const locationHint = params.city ? ` in ${params.city}` : ''

  const prompt = `You are a local SEO expert. Generate ${FREE_TIER_LIMIT} high-intent search keywords for a ${params.industry} business called "${params.name}"${locationHint}.

${params.businessContext ? `Business context: ${params.businessContext}` : ''}

Rules:
- Keywords must be in the language customers in this location would type into Google (infer from city and business name)
- Each keyword should be a realistic local search query (e.g. "dentist london", "clínica dental madrid", "zahnarzt berlin")
- Include location (city or neighbourhood) in each keyword
- Target transactional / high-intent searches
- 2-4 words each, no brand names

Return ONLY a JSON array of ${FREE_TIER_LIMIT} strings, no markdown:
["keyword one", "keyword two", "keyword three"]`

  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = res.content[0].type === 'text' ? res.content[0].text : '[]'
  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
    return Array.isArray(parsed) ? parsed.slice(0, FREE_TIER_LIMIT) : []
  } catch {
    return []
  }
}

async function checkRank(params: {
  keyword: string
  placeId: string
  lat: number
  lng: number
  apiKey: string
}): Promise<number | null> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': params.apiKey,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({
      textQuery: params.keyword,
      maxResultCount: RANK_SEARCH_LIMIT,
      locationBias: {
        circle: {
          center: { latitude: params.lat, longitude: params.lng },
          radius: 5000,
        },
      },
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  const places: Array<{ id?: string }> = data.places ?? []

  const idx = places.findIndex(p => {
    const id = p.id?.startsWith('places/') ? p.id.replace('places/', '') : p.id
    return id === params.placeId
  })

  return idx === -1 ? null : idx + 1
}

// ─── GET — return stored rankings (generate keywords if first time) ────────────

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, industry, city, business_context, google_place_id, google_place_location, keyword_rankings')
      .eq('user_id', user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    // Need a place ID to check rankings
    if (!business.google_place_id || !business.google_place_location) {
      return NextResponse.json({ error: 'setup_required' }, { status: 200 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY not set' }, { status: 503 })

    const stored: KeywordRanking[] = business.keyword_rankings ?? []

    // If no keywords yet — generate them and immediately check ranks
    if (stored.length === 0) {
      const keywords = await generateKeywords({
        name: business.name,
        industry: business.industry,
        city: business.city,
        businessContext: business.business_context,
      })

      if (keywords.length === 0) {
        return NextResponse.json({ error: 'Could not generate keywords' }, { status: 500 })
      }

      const loc = business.google_place_location as { lat: number; lng: number }
      const rankings: KeywordRanking[] = await Promise.all(
        keywords.map(async (keyword) => ({
          keyword,
          rank: await checkRank({ keyword, placeId: business.google_place_id!, lat: loc.lat, lng: loc.lng, apiKey }),
          checkedAt: new Date().toISOString(),
        }))
      )

      await supabase.from('businesses').update({ keyword_rankings: rankings }).eq('id', business.id)
      return NextResponse.json({ rankings })
    }

    return NextResponse.json({ rankings: stored })
  } catch (err) {
    console.error('keyword-rankings GET error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── POST — refresh ranks (re-check Places, keep same keywords) ───────────────

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, google_place_id, google_place_location, keyword_rankings')
      .eq('user_id', user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    if (!business.google_place_id || !business.google_place_location) {
      return NextResponse.json({ error: 'setup_required' }, { status: 200 })
    }

    const stored: KeywordRanking[] = business.keyword_rankings ?? []
    if (stored.length === 0) return NextResponse.json({ error: 'No keywords to refresh' }, { status: 400 })

    const apiKey = process.env.GOOGLE_MAPS_API_KEY!
    const loc = business.google_place_location as { lat: number; lng: number }

    const rankings: KeywordRanking[] = await Promise.all(
      stored.map(async (entry) => ({
        keyword: entry.keyword,
        rank: await checkRank({ keyword: entry.keyword, placeId: business.google_place_id!, lat: loc.lat, lng: loc.lng, apiKey }),
        checkedAt: new Date().toISOString(),
      }))
    )

    await supabase.from('businesses').update({ keyword_rankings: rankings }).eq('id', business.id)
    return NextResponse.json({ rankings })
  } catch (err) {
    console.error('keyword-rankings POST error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
