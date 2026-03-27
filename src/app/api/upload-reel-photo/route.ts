import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const businessId = formData.get('businessId') as string | null

  if (!file || !businessId) return NextResponse.json({ error: 'Missing file or businessId' }, { status: 400 })

  const supabase = createAdminClient()
  await supabase.storage.createBucket('reel-photos', { public: true }).catch(() => {})

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${businessId}/${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()

  const { error } = await supabase.storage.from('reel-photos').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('reel-photos').getPublicUrl(path)
  return NextResponse.json({ publicUrl })
}
