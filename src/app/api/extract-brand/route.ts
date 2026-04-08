import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic()

function extractMeta(html: string, pattern: RegExp): string | null {
  return html.match(pattern)?.[1] ?? null
}

function extractTopColors(html: string): string[] {
  // Find hex colors in the head/style sections
  const headHtml = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html.slice(0, 8000)
  const styleBlocks = [...headHtml.matchAll(/<style[\s\S]*?<\/style>/gi)].map(m => m[0]).join(' ')
  const allHtml = headHtml + styleBlocks

  const hexMatches = [...allHtml.matchAll(/#([0-9a-fA-F]{6})\b/g)]
  const colorCounts = new Map<string, number>()

  for (const match of hexMatches) {
    const color = '#' + match[1].toLowerCase()
    const r = parseInt(match[1].slice(0, 2), 16)
    const g = parseInt(match[1].slice(2, 4), 16)
    const b = parseInt(match[1].slice(4, 6), 16)
    const brightness = (r + g + b) / 3
    const variance = Math.max(Math.abs(r - brightness), Math.abs(g - brightness), Math.abs(b - brightness))
    // Skip white, black, grays
    if (variance > 25 && brightness > 20 && brightness < 230) {
      colorCounts.set(color, (colorCounts.get(color) ?? 0) + 1)
    }
  }

  return [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c]) => c)
}

function extractGoogleFont(html: string): string | null {
  const match = html.match(/fonts\.googleapis\.com\/css2?\?family=([^:&"')\s]+)/i)
  if (!match) return null
  return decodeURIComponent(match[1].replace(/\+/g, ' ')).split(':')[0].split('|')[0].trim()
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, websiteUrl } = await req.json()
  if (!websiteUrl) return NextResponse.json({ error: 'No website URL' }, { status: 400 })

  // Normalise URL
  const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`

  let html = ''
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Buzzloop/1.0)' },
      signal: AbortSignal.timeout(12000),
    })
    html = await res.text()
  } catch (err) {
    return NextResponse.json({ error: `Could not fetch website: ${String(err)}` }, { status: 400 })
  }

  // Extract raw signals
  const themeColor = extractMeta(html, /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i)
    ?? extractMeta(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i)

  const ogImage = extractMeta(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    ?? extractMeta(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)

  const faviconRaw = extractMeta(html, /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i)
    ?? extractMeta(html, /<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["']/i)

  // Resolve logo URL to absolute
  let logoUrl: string | null = null
  if (ogImage) {
    logoUrl = ogImage.startsWith('http') ? ogImage : new URL(ogImage, url).href
  } else if (faviconRaw) {
    logoUrl = faviconRaw.startsWith('http') ? faviconRaw : new URL(faviconRaw, url).href
  }

  const description = extractMeta(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    ?? extractMeta(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)

  const title = extractMeta(html, /<title[^>]*>([^<]+)<\/title>/i)

  const googleFont = extractGoogleFont(html)
  const topColors = extractTopColors(html)

  // Body text for Claude — strip scripts/styles/tags, keep full content
  // Cap at 20 000 chars only as a sanity limit for very large sites (news, e-commerce)
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000)

  // Claude brand analysis
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `Analyze this business website and extract brand identity and context.

Website: ${url}
Title: ${title ?? 'unknown'}
Description: ${description ?? 'none'}
Theme color: ${themeColor ?? 'none'}
Extracted CSS colors: ${topColors.join(', ') || 'none'}
Page text excerpt: "${bodyText}"

Return ONLY valid JSON:
{
  "industry": "dental|restaurant|gym|salon|spa|retail|clinic|other",
  "businessType": "brief description e.g. 'dental clinic' or 'Italian restaurant'",
  "brandPersonality": ["adjective1", "adjective2", "adjective3"],
  "primaryColor": "#hex — best brand color (use theme-color or most prominent non-neutral extracted color, or a sensible default for this industry)",
  "secondaryColor": "#hex — secondary brand color",
  "contentTone": "one sentence describing how to write copy for this brand",
  "customerWord": "patient|guest|client|member|customer",
  "serviceWord": "treatment|experience|session|visit|service",
  "bookingWord": "book an appointment|reserve a table|sign up|get in touch|schedule a visit",
  "businessContext": "2-4 sentences: what specific services/treatments/products they offer, who their target audience is, and what makes them different. Be concrete — name actual services, not generic descriptions."
}`
    }]
  })

  let analysis: {
    industry: string
    businessType: string
    brandPersonality: string[]
    primaryColor: string
    secondaryColor: string
    contentTone: string
    customerWord: string
    serviceWord: string
    bookingWord: string
    businessContext: string
  } | null = null

  try {
    const text = (message.content[0] as { text: string }).text
    const match = text.match(/\{[\s\S]*\}/)
    if (match) analysis = JSON.parse(match[0])
  } catch { /* ignore */ }

  if (!analysis) {
    return NextResponse.json({ error: 'Brand analysis failed' }, { status: 500 })
  }

  // Validate theme-color: reject neon/extreme colors (e.g. #00ff00 from mobile browser chrome meta)
  function isReasonableBrandColor(hex: string): boolean {
    const m = hex.match(/^#([0-9a-f]{6})$/i)
    if (!m) return false
    const r = parseInt(m[1].slice(0, 2), 16)
    const g = parseInt(m[1].slice(2, 4), 16)
    const b = parseInt(m[1].slice(4, 6), 16)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    // Reject colors that are too neon (very high saturation + high brightness)
    const brightness = (r + g + b) / 3
    if (saturation > 0.85 && brightness > 100) return false
    // Reject pure white / near-white
    if (brightness > 240) return false
    return true
  }

  // Determine final primary color: theme-color (if reasonable) > claude suggestion
  const primaryColor = (themeColor && isReasonableBrandColor(themeColor))
    ? themeColor
    : analysis.primaryColor

  const personality = JSON.stringify(analysis.brandPersonality)

  // Save to businesses
  await supabase.from('businesses').update({
    brand_logo_url: logoUrl,
    brand_color: primaryColor,
    brand_secondary_color: analysis.secondaryColor,
    brand_font: googleFont ?? 'Inter',
    brand_personality: personality,
    brand_extracted: true,
    industry: analysis.industry as never,
    business_context: analysis.businessContext ?? null,
  }).eq('id', businessId)

  return NextResponse.json({
    success: true,
    logoUrl,
    primaryColor,
    secondaryColor: analysis.secondaryColor,
    font: googleFont,
    industry: analysis.industry,
    businessType: analysis.businessType,
    personality: analysis.brandPersonality,
    contentTone: analysis.contentTone,
    customerWord: analysis.customerWord,
    serviceWord: analysis.serviceWord,
    bookingWord: analysis.bookingWord,
    businessContext: analysis.businessContext,
  })
}
