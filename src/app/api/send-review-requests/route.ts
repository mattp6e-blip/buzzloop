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

function firstName(name?: string): string {
  return name?.trim().split(/\s+/)[0] ?? ''
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, slug')
      .eq('user_id', user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    const { contacts, channel } = await req.json() as {
      contacts: Array<{ number: string; name?: string }>,
      channel: 'sms' | 'whatsapp' | 'both'
    }

    if (!contacts?.length) return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim()
    const reviewUrl = `${appUrl}/r/${business.slug}`

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const contact of contacts) {
      const number = normalizeNumber(contact.number)
      if (!number) { failed++; continue }

      const fname = firstName(contact.name)
      const greeting = fname ? `Hi ${fname}! ` : ''

      const shortId = Math.random().toString(36).slice(2, 10)

      const { data: record } = await supabase
        .from('outreach_messages')
        .insert({
          business_id: business.id,
          recipient_number: number,
          recipient_name: contact.name ?? null,
          channel,
          status: 'sent',
          review_url: reviewUrl,
          short_id: shortId,
        })
        .select('id')
        .single()

      if (!record) { failed++; errors.push(`${number}: failed to save record (check DB migration)`); continue }

      const trackUrl = `${appUrl}/go/${shortId}`
      const message = greeting
        ? `${greeting}${business.name} - quick Google review? ${trackUrl}\n\nSTOP to opt out.`
        : `${business.name} - quick Google review? ${trackUrl}\n\nSTOP to opt out.`

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
        // Mark as failed in DB
        await supabase
          .from('outreach_messages')
          .update({ status: 'failed' })
          .eq('id', record.id)
        failed++
        const msg = String(err)
        const clean = msg.includes('Invalid') ? `${number}: invalid phone number` : `${number}: failed to send`
        errors.push(clean)
      }
    }

    return NextResponse.json({ sent, failed, errors })
  } catch (err) {
    console.error('Send error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
