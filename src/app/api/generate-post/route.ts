import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const INDUSTRY_CTAS: Record<string, string> = {
  restaurant: 'Reserve your table — link in bio',
  dental:     'Book your consultation — link in bio',
  gym:        'Claim your free first class — link in bio',
  salon:      'Book your appointment — link in bio',
  spa:        'Book your treatment — link in bio',
  clinic:     'Book your consultation — link in bio',
  retail:     'Shop now — link in bio',
  other:      'Get in touch — link in bio',
}

export async function POST(req: NextRequest) {
  const { businessName, industry, reviewText, reelTheme, reelHook, buzzReason, serviceWord, bookingWord, websiteUrl, city } = await req.json()

  // Build CTA from extracted brand words if available, otherwise use industry default
  const ctaAction = bookingWord && serviceWord
    ? `${bookingWord.charAt(0).toUpperCase() + bookingWord.slice(1)} your ${serviceWord} — link in bio`
    : bookingWord
      ? `${bookingWord.charAt(0).toUpperCase() + bookingWord.slice(1)} — link in bio`
      : INDUSTRY_CTAS[industry as string] ?? INDUSTRY_CTAS.other

  const emotionalCore = buzzReason ?? reelHook ?? reelTheme

  const prompt = `You are writing an Instagram caption for a Reel that is already a powerful customer testimonial video.

Business: ${businessName}
Industry: ${industry}${websiteUrl ? `\nWebsite: ${websiteUrl}` : ''}
Reel theme: ${reelTheme}
The emotional core of this Reel: ${emotionalCore}
What customers said (context only — do NOT quote or repeat): ${reviewText}

The caption's job is NOT to retell what's in the video. The video already hooks attention. The caption hooks the INTENT to act.

STRUCTURE (follow exactly):
Line 1 — Hook (max 125 characters, must work as a standalone statement before "more" is tapped): A bold statement or sharp question that makes someone who just watched think "yes, that's me" or "I want that". Complements the video — does not summarise it.

Line 2–3 — One specific thing that makes ${businessName} worth visiting. Plain language, no clichés, no hype. Something a real person would say to a friend.

CTA line — Use this exactly: "${ctaAction}"

Hashtags — 3 to 5 only, on a new line. Mix of niche industry tags and location-specific tags using the actual city (e.g. #${city ? city.replace(/\s+/g, '') : 'London'}Dentist #SmileTransformation). Do not use generic tags like #instagood or #love.${city ? `\nThe business is located in ${city} — use this exact city name in at least one location hashtag.` : ''}

RULES:
- Total caption (excluding hashtags): under 70 words
- No customer names
- No quotes from reviews
- Maximum 1 emoji in the entire caption
- Tone: warm, confident, human — never corporate or salesy
- Do not start with the business name
- Do not use "we" more than once

Return ONLY the caption text and hashtags. Nothing else.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const caption = (message.content[0] as { type: string; text: string }).text.trim()

  return NextResponse.json({ caption })
}
