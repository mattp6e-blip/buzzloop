import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, stripe_customer_id, plan')
    .eq('user_id', user.id)
    .single()

  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

  if (business.plan === 'pro') {
    return NextResponse.json({ error: 'Already on Pro' }, { status: 400 })
  }

  // Reuse existing Stripe customer or create a new one
  let customerId = business.stripe_customer_id as string | null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: business.name,
      metadata: { business_id: business.id, user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('businesses')
      .update({ stripe_customer_id: customerId })
      .eq('id', business.id)
  }

  const origin = req.headers.get('origin') ?? 'https://buzzloop.app'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: `${origin}/pricing`,
    metadata: { business_id: business.id },
  })

  return NextResponse.json({ url: session.url })
}
