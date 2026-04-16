import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { prompt, businessName, industry, websiteUrl } = await req.json()

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `You are helping a ${industry} business called "${businessName}" create a social media clip.
${websiteUrl ? `Their website: ${websiteUrl}` : ''}

Their brief: "${prompt}"

Your job: generate 2-3 qualifying questions whose answers will make the script meaningfully better.

STRICT RULES:
1. NEVER ask something already answered or clearly implied in the brief. If they say "attract UK patients", do NOT ask if they have UK patients — they want to attract new ones.
2. NEVER invent current state from intent. "I want X" means X does not exist yet.
3. Only ask questions where each possible answer would produce a DIFFERENT script. If the answer doesn't change the script, skip the question.
4. Questions must be about content strategy, not demographics or market research. Examples of GOOD questions:
   - What's the #1 reason a patient should choose you over local options?
   - What's the biggest objection you want the clip to overcome?
   - What specific outcome or transformation do you want to highlight?
5. Keep questions short and direct. Answer options must be concrete (max 6 words each).

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
