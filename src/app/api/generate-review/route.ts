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

Write a short, natural Google review. 2-3 sentences. Under 70 words.

Rules:
- Sound like a real person talking to a friend — conversational, not formal
- Use the specific details from what they liked. Don't generalise.
- ${staffName ? `Mention ${staffName} naturally` : 'Keep it personal and warm'}
- Correct spelling and grammar throughout — just informal in tone, not sloppy
- No "amazing", "fantastic", "truly", "incredibly", or any word that sounds like ad copy
- No hashtags, no emojis, no exclamation marks
- Do not start with "I" — vary the opening
- Style: ${styleVariant}

Return ONLY the review text. Nothing else.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    messages: [{ role: 'user', content: prompt }],
  })

  const draft = (message.content[0] as { type: string; text: string }).text.trim()

  return NextResponse.json({ draft })
}
