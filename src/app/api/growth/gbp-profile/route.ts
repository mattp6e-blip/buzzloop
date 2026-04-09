import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  return data.access_token ?? null
}

function toLocationPath(locationId: string): string {
  // "accounts/123/locations/456" → "locations/456"
  if (locationId.includes('locations/')) {
    return 'locations/' + locationId.split('locations/')[1]
  }
  return locationId
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, industry, google_connected, google_access_token, google_refresh_token, google_token_expiry, google_location_id')
      .eq('user_id', user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    if (!business.google_connected) return NextResponse.json({ connected: false })

    if (!business.google_location_id) {
      return NextResponse.json({ error: 'Sync your reviews first to link your GBP location.' }, { status: 422 })
    }

    // Refresh token if expired
    let accessToken = business.google_access_token
    const expiry = business.google_token_expiry ? new Date(business.google_token_expiry) : null
    if (expiry && expiry < new Date() && business.google_refresh_token) {
      const newToken = await refreshAccessToken(business.google_refresh_token)
      if (newToken) {
        accessToken = newToken
        await supabase.from('businesses').update({ google_access_token: newToken }).eq('id', business.id)
      }
    }

    const locationPath = toLocationPath(business.google_location_id)

    // Fetch GBP profile: description, categories, services
    const profileRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${locationPath}?readMask=profile,categories,serviceItems`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const profileData = await profileRes.json()

    const currentDescription: string = profileData.profile?.description ?? ''

    const currentServices: string[] = (profileData.serviceItems ?? [])
      .map((s: Record<string, unknown>) => {
        const ff = s.freeFormServiceItem as Record<string, unknown> | undefined
        const label = ff?.label as Record<string, unknown> | undefined
        return (label?.displayName as string) ?? null
      })
      .filter(Boolean)

    // Get competitor data for benchmarking
    const { data: competitors } = await supabase
      .from('competitors')
      .select('name, types, review_count, raw_data')
      .eq('business_id', business.id)
      .order('review_count', { ascending: false })
      .limit(5)

    const competitorContext = (competitors ?? []).map(c => {
      const rawData = c.raw_data as Record<string, unknown> | null
      const reviewTexts = (rawData?._review_texts as string[] ?? []).slice(0, 3)
      const cleanTypes = (c.types ?? []).filter((t: string) =>
        !['establishment', 'point_of_interest', 'food', 'premise'].includes(t)
      )
      return `- ${c.name} (${c.review_count} reviews): categories=[${cleanTypes.join(', ')}]${reviewTexts.length ? `; customer mentions: "${reviewTexts.join('", "')}"` : ''}`
    }).join('\n')

    // Claude analysis
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const prompt = `You are a local SEO expert. Analyse this ${business.industry} business called "${business.name}" and suggest improvements.

CURRENT GBP DESCRIPTION:
"${currentDescription || '(no description set)'}"

CURRENT SERVICES LISTED ON GBP:
${currentServices.length > 0 ? currentServices.map(s => `- ${s}`).join('\n') : '(none listed)'}

TOP LOCAL COMPETITORS:
${competitorContext || '(no competitor data yet)'}

Return ONLY valid JSON, no markdown:
{
  "missingKeywords": ["keyword1", "keyword2"],
  "improvedDescription": "Full improved description text (150-200 words, natural tone, includes missing keywords)",
  "suggestedServices": [
    { "name": "Service Name", "reason": "Why this is relevant" }
  ]
}

Rules:
- missingKeywords: 3-6 high-intent local search terms missing from the current description. Only terms genuinely relevant to a ${business.industry}.
- improvedDescription: Sound natural and human. Include location context if inferable. Don't invent services — only mention what a ${business.industry} genuinely offers.
- suggestedServices: Max 6 services common for a ${business.industry}. These are SUGGESTIONS — the user will confirm which they actually offer. Base on competitor data and industry norms.`

    const aiRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const aiText = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '{}'
    let analysis: {
      missingKeywords: string[]
      improvedDescription: string
      suggestedServices: { name: string; reason: string }[]
    }
    try {
      analysis = JSON.parse(aiText.replace(/```json\n?|\n?```/g, '').trim())
    } catch {
      analysis = { missingKeywords: [], improvedDescription: currentDescription, suggestedServices: [] }
    }

    return NextResponse.json({
      connected: true,
      currentDescription,
      currentServices,
      analysis,
    })
  } catch (err) {
    console.error('GBP profile error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
