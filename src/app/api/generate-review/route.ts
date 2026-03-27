import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const STYLE_VARIANTS = [
  'Open with a specific detail that stood out, then explain why it made the experience memorable.',
  'Start with how you felt when you left — lead with the outcome, then support it with what happened.',
  'Begin by mentioning the reason you came and how the experience met or exceeded your expectations.',
  'Lead with the most impressive aspect of the visit, then close with a clear recommendation.',
  'Describe the experience in a warm, genuine tone — specific and personal without being over the top.',
  'Open with what set this place apart from others — what made it worth coming back to.',
]

export async function POST(req: NextRequest) {
  const { businessName, industry, starRating, whatTheyLiked, staffName } = await req.json()

  const styleVariant = STYLE_VARIANTS[Math.floor(Math.random() * STYLE_VARIANTS.length)]

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
- Do NOT use the words "amazing" or "fantastic" — keep it authentic
- No hashtags, no emojis
- Vary the structure: ${styleVariant}

Return ONLY the review text, nothing else.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const draft = (message.content[0] as { type: string; text: string }).text.trim()

  return NextResponse.json({ draft })
}
