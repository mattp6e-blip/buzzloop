import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { websiteUrl, businessId } = await req.json()

  if (!websiteUrl || !businessId) {
    return NextResponse.json({ error: 'Missing websiteUrl or businessId' }, { status: 400 })
  }

  // Fetch the website HTML
  let html = ''
  try {
    const res = await fetch(websiteUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ReviewSpark/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    html = await res.text()
  } catch {
    return NextResponse.json({ error: 'Could not fetch website. Please check the URL.' }, { status: 400 })
  }

  // Truncate HTML to avoid token limits — we only need head + first body section
  const truncated = html.slice(0, 12000)

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Analyze this website HTML and extract the brand identity.

HTML:
${truncated}

Extract and return ONLY a valid JSON object with these fields:
{
  "primary_color": "#hex — the main brand color (button color, accent, logo color)",
  "secondary_color": "#hex — secondary accent or background color (or null)",
  "primary_font": "exact font-family name from CSS — the heading/display font",
  "secondary_font": "exact font-family name from CSS — the body font (or null)",
  "logo_url": "absolute URL to the logo image if found (or null)"
}

Rules:
- primary_color must be a valid hex color
- primary_font must be a real Google Font name or system font name
- If you can't confidently detect something, use null
- Return ONLY the JSON object, no explanation`
    }],
  })

  let branding: {
    primary_color?: string
    secondary_color?: string
    primary_font?: string
    secondary_font?: string
    logo_url?: string
  } = {}

  try {
    const text = (message.content[0] as { text: string }).text
    const match = text.match(/\{[\s\S]*\}/)
    if (match) branding = JSON.parse(match[0])
  } catch {
    branding = {}
  }

  // Save to business record
  const supabase = await createClient()
  await supabase
    .from('businesses')
    .update({
      brand_color: branding.primary_color ?? '#e8470a',
      brand_secondary_color: branding.secondary_color ?? null,
      brand_font: branding.primary_font ?? 'Inter',
      brand_logo_url: branding.logo_url ?? null,
      brand_scraped: true,
    })
    .eq('id', businessId)

  return NextResponse.json({ branding })
}
