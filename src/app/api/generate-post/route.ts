import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { businessName, industry, reviewText, brandColor } = await req.json()

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `You are a social media expert writing an Instagram caption for a local business.

Business: ${businessName}
Industry: ${industry}
Customer review: "${reviewText}"
Brand color: ${brandColor}

Write a premium Instagram caption that:
- Opens with a hook (not "We're thrilled" or "So grateful")
- Weaves in 1-2 specific details from the review naturally
- Feels human, warm, confident — not corporate
- Ends with a clear CTA (book, visit, try, experience)
- Includes 5-8 relevant hashtags on a new line
- Max 150 words total

Return ONLY the caption text + hashtags. Nothing else.`
    }],
  })

  const caption = (message.content[0] as { type: string; text: string }).text.trim()

  return NextResponse.json({ caption })
}
