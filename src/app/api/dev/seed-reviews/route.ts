import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FAKE_REVIEWS = [
  {
    customer_name: 'María J.',
    star_rating: 5,
    what_they_liked: "We went from 18 reviews to over 200 in two months. Our Google ranking went from page 3 to position 1. The whole team has noticed the difference — new patients are actually mentioning they found us because of our reviews.",
    staff_name: null,
  },
  {
    customer_name: 'Carlos M.',
    star_rating: 5,
    what_they_liked: "Best gym I've been to. The coaches actually know your name and the facilities are spotless. I've tried four other gyms in the city and nothing comes close. The community here is what keeps me coming back every single day.",
    staff_name: 'David',
  },
  {
    customer_name: 'Laura P.',
    star_rating: 5,
    what_they_liked: "I came in not knowing what I wanted and left looking incredible. Sofia spent time understanding exactly what would suit my face shape and lifestyle. Will be back every six weeks without question. Best salon experience I've had.",
    staff_name: 'Sofia',
  },
  {
    customer_name: 'Rodrigo V.',
    star_rating: 5,
    what_they_liked: "The food was outstanding and the service even better. We celebrated our anniversary here and the chef sent out a surprise dessert. Every dish was perfectly executed. We'll definitely be recommending to everyone we know.",
    staff_name: null,
  },
  {
    customer_name: 'Ana S.',
    star_rating: 5,
    what_they_liked: "I was sceptical at first but new customer bookings are up 40% and I can point directly to where they came from. The team genuinely cares about your results. Three months in and I'm still seeing improvements every week.",
    staff_name: 'Marco',
  },
  {
    customer_name: 'Pedro A.',
    star_rating: 5,
    what_they_liked: "The treatment completely changed my confidence. I've struggled with this for years and nothing worked until I came here. The staff are professional, kind, and genuinely invested in your progress. Cannot recommend highly enough.",
    staff_name: null,
  },
  {
    customer_name: 'Sara B.',
    star_rating: 5,
    what_they_liked: "We used to struggle to get reviews. Now they come in every single day. The atmosphere here is unlike anything else — the moment you walk in you feel taken care of. My friends all ask where I go and I always send them here.",
    staff_name: 'Elena',
  },
  {
    customer_name: 'Diego R.',
    star_rating: 5,
    what_they_liked: "My competitors have no idea why I'm suddenly outranking them. The quality of work here is exceptional. Every single time I leave I feel like a new person. The attention to detail is something you rarely see anymore.",
    staff_name: null,
  },
]

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 })

  const toInsert = FAKE_REVIEWS.map(r => ({
    ...r,
    business_id: business.id,
    ai_draft: r.what_they_liked,
    posted_to_google: true,
  }))

  const { error } = await supabase.from('reviews').insert(toInsert)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ seeded: toInsert.length })
}
