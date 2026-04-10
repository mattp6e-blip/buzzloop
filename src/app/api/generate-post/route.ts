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
  const { businessName, industry, reviewText, reelTheme, reelHook, buzzReason, serviceWord, bookingWord, websiteUrl, city, language } = await req.json()

  // Build CTA from extracted brand words if available, otherwise use industry default
  const ctaAction = bookingWord && serviceWord
    ? `${bookingWord.charAt(0).toUpperCase() + bookingWord.slice(1)} your ${serviceWord} — link in bio`
    : bookingWord
      ? `${bookingWord.charAt(0).toUpperCase() + bookingWord.slice(1)} — link in bio`
      : INDUSTRY_CTAS[industry as string] ?? INDUSTRY_CTAS.other

  const emotionalCore = buzzReason ?? reelHook ?? reelTheme

  const prompt = `You are writing an Instagram caption for a Reel that is already a powerful customer testimonial video.

LANGUAGE: Write the entire caption and hashtags in ${language ?? 'English'}.

Business: ${businessName}
Industry: ${industry}${websiteUrl ? `\nWebsite: ${websiteUrl}` : ''}
Reel theme: ${reelTheme}
The emotional core of this Reel: ${emotionalCore}
What customers said (context only — do NOT quote or repeat): ${reviewText}

The caption's job is NOT to retell what's in the video. The video already hooks attention. The caption hooks the INTENT to act.

CONTEXT: The business owner is posting this to their own Instagram. They are proud of what happened. They are speaking directly to their followers — potential customers in the area. They are NOT a marketer describing their own business from the outside.

STRUCTURE (follow exactly):
Line 1 — Hook (max 125 characters, must work as a standalone statement before "more" is tapped): One sharp line that puts the reader inside the moment. Write from the owner's perspective, speaking directly — as if saying it to a friend. NOT a detached narrator ("This one changed things for someone" is wrong — too far removed). NOT a question unless it's specific and personal. Never start with the business name or "We". Avoid "this one", "for someone", "this place" — language that distances the writer from the business.

Line 2–3 — One specific thing that makes ${businessName} worth visiting. Plain language, no clichés, no hype. Something a real person would say to a friend.

CTA line — Use this as a template, translated into the review language if needed: "${ctaAction}"

Hashtags — exactly 5, on a new line. Follow this mix:
1. High-intent local: city + service (e.g. #${city ? city.replace(/\s+/g, '') : 'London'}Dentist) — someone searching for this service nearby
2. Broader location: city or region only (e.g. #${city ? city.replace(/\s+/g, '') : 'London'}) — local discovery
3. Service-specific: the exact treatment or service this reel is about (e.g. #TeethWhitening, #Invisalign, #HairColour) — people researching options
4. Result/aspiration: the transformation or feeling (e.g. #SmileTransformation, #ConfidentSmile) — emotional resonance
5. Niche community: mid-size engaged audience in the industry (e.g. #DentalCare, #OralHealth, #HairCare)
Target tags with 50K–500K posts — large enough to have an audience, small enough to surface. Never use #instagood, #love, #photooftheday or any tag with over 5M posts.${city ? `\nThe business is in ${city} — use this exact city name in the local hashtags.` : ''}

RULES:
- Total caption (excluding hashtags): under 70 words
- No customer names
- No quotes from reviews
- Maximum 1 emoji in the entire caption
- Tone: warm, confident, human — written by the owner, not about the owner
- Do not start with the business name
- Do not use "we" more than once
- Never use distancing language: "this one", "for someone", "this place", "this business" — these make it sound like an ad written by someone else, not the owner
- Never narrate the reel ("In this video..." or "Watch as...") — the caption speaks directly, not about the video

Return ONLY the caption text and hashtags. Nothing else.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const caption = (message.content[0] as { type: string; text: string }).text.trim()

  return NextResponse.json({ caption })
}
