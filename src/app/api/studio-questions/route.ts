import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { prompt, businessName, industry } = await req.json()

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `You are helping generate a social media clip for a local business.

Business: ${businessName} (${industry})
Brief: "${prompt}"

Generate exactly 2-3 smart qualifying questions that will help create a much better clip.
Each question should uncover something specific and useful that isn't already in the brief.
Each question must have exactly 4 short answer options (max 7 words each).
Options should be realistic, distinct, and cover the most likely scenarios.

Return ONLY valid JSON, no explanation:
[
  {
    "question": "Short, direct question?",
    "options": ["Option A", "Option B", "Option C", "Option D"]
  }
]`,
    }],
  })

  const text = (message.content[0] as { text: string }).text
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) {
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 })
  }

  const questions = JSON.parse(match[0])
  return NextResponse.json({ questions })
}
