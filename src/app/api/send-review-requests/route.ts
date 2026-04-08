import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import twilio from 'twilio'

function normalizeNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 7) return null
  return digits.startsWith('1') && digits.length === 11
    ? `+${digits}`
    : digits.length === 10
    ? `+1${digits}`
    : `+${digits}`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('name, slug')
      .eq('user_id', user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    const { numbers, channel } = await req.json() as { numbers: string[], channel: 'sms' | 'whatsapp' | 'both' }

    if (!numbers?.length) return NextResponse.json({ error: 'No numbers provided' }, { status: 400 })

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${business.slug}`
    const message = `Thanks for visiting ${business.name}! We'd love your honest review — it takes 30 seconds: ${reviewUrl}\n\nReply STOP to opt out.`

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const raw of numbers) {
      const number = normalizeNumber(raw.trim())
      if (!number) { failed++; continue }

      const sends: Promise<unknown>[] = []

      if (channel === 'sms' || channel === 'both') {
        sends.push(
          client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER!,
            to: number,
            body: message,
          })
        )
      }

      if (channel === 'whatsapp' || channel === 'both') {
        sends.push(
          client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER!,
            to: `whatsapp:${number}`,
            body: message,
          })
        )
      }

      try {
        await Promise.all(sends)
        sent++
      } catch (err) {
        failed++
        errors.push(`${number}: ${String(err)}`)
      }
    }

    return NextResponse.json({ sent, failed, errors })
  } catch (err) {
    console.error('Send error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
