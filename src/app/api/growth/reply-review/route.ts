import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { reviewId, post = false } = await req.json() as { reviewId: string; post?: boolean }
    if (!reviewId) return NextResponse.json({ error: 'reviewId required' }, { status: 400 })

    // Fetch review + business together
    const { data: review } = await supabase
      .from('reviews')
      .select('id, what_they_liked, star_rating, customer_name, gbp_review_id')
      .eq('id', reviewId)
      .single()

    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, industry, city, brand_personality, business_context, google_connected, google_access_token, google_refresh_token, google_token_expiry')
      .eq('user_id', user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    // ── Generate reply with Claude Sonnet ────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const personality = (() => {
      try {
        const p = business.brand_personality
        return Array.isArray(p) ? p.join(', ') : typeof p === 'string' ? p : null
      } catch { return null }
    })()

    const stars = review.star_rating
    const isNegative = stars <= 2
    const isMixed = stars === 3
    const customerName = review.customer_name ?? null

    const prompt = `You are writing a public Google review reply on behalf of "${business.name}", a ${business.industry} business${business.city ? ` in ${business.city}` : ''}.

${personality ? `Brand personality: ${personality}` : ''}
${business.business_context ? `About the business: ${business.business_context}` : ''}

REVIEW (${stars} stars) from ${customerName ?? 'a customer'}:
"${review.what_they_liked}"

Write a reply that:
- Is in the SAME LANGUAGE as the review above (critical — if the review is in Spanish, reply in Spanish)
- Sounds like the actual business owner wrote it — warm, genuine, never robotic or templated
- References something SPECIFIC from the review text (a detail, feeling, or outcome they mentioned)
- Is appropriately toned for ${stars} stars: ${isNegative ? 'empathetic and solution-oriented — acknowledge the issue, apologise sincerely, invite them to contact you directly to resolve it. Do NOT be defensive.' : isMixed ? 'appreciative but also gently addressing any concern mentioned' : 'warm and grateful, reinforcing what made their experience good'}
- ${customerName ? `Addresses the customer by first name (${customerName.split(' ')[0]})` : 'Does not invent a name'}
- Is 2-3 sentences MAX. Short and human. No hashtags. No emojis. No "Dear valued customer."
- Ends naturally — optionally with a warm invitation to return or to contact if needed

Return ONLY the reply text. No quotes, no explanation.`

    const aiRes = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    const reply = aiRes.content[0].type === 'text' ? aiRes.content[0].text.trim() : ''
    if (!reply) return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 })

    // ── Optionally post to GBP ───────────────────────────────────────────────
    let posted = false

    if (post && business.google_connected && review.gbp_review_id) {
      let accessToken = business.google_access_token
      const expiry = business.google_token_expiry ? new Date(business.google_token_expiry) : null
      if (expiry && expiry < new Date() && business.google_refresh_token) {
        const newToken = await refreshAccessToken(business.google_refresh_token)
        if (newToken) {
          accessToken = newToken
          await supabase.from('businesses').update({ google_access_token: newToken }).eq('id', business.id)
        }
      }

      const replyRes = await fetch(
        `https://mybusiness.googleapis.com/v4/${review.gbp_review_id}/reply`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment: reply }),
        }
      )

      if (replyRes.ok) {
        posted = true
        await supabase.from('reviews').update({ has_owner_reply: true }).eq('id', reviewId)
      } else {
        const err = await replyRes.text()
        console.error('GBP reply error:', err)
        return NextResponse.json({ error: 'Failed to post reply to Google', reply }, { status: 502 })
      }
    }

    return NextResponse.json({ reply, posted })
  } catch (err) {
    console.error('reply-review error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
