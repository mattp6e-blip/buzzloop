import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { businessName, industry, starRating, whatTheyLiked, staffName } = await req.json()

  const staffLine = staffName ? ` ${staffName} was especially great.` : ''

  const prompt = `You are writing a genuine Google review on behalf of a happy customer.

Business: ${businessName}
Type: ${industry}
Star rating: ${starRating}/5
What the customer liked: ${whatTheyLiked}${staffName ? `\nStaff member mentioned: ${staffName}` : ''}

Write a short, natural, conversational Google review (2-4 sentences).
- Sound like a real person, not a robot
- Mention specific details from what they liked
- ${staffName ? `Mention ${staffName} naturally` : 'Keep it personal and warm'}
- End with a recommendation or saying you will return
- Do NOT use the word "amazing" or "fantastic" — keep it authentic
- No hashtags, no emojis

Return ONLY the review text, nothing else.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const draft = (message.content[0] as { type: string; text: string }).text.trim()

  return NextResponse.json({ draft })
}
