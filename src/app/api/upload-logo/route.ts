import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  // Verify user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const businessId = formData.get('businessId') as string | null

  if (!file || !businessId) {
    return NextResponse.json({ error: 'Missing file or businessId' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Ensure bucket exists
  const { error: bucketErr } = await admin.storage.createBucket('logos', { public: true })
  // Ignore "already exists" errors
  if (bucketErr && !bucketErr.message.includes('already exists')) {
    console.error('Bucket error:', bucketErr)
  }

  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${businessId}/logo.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadErr } = await admin.storage
    .from('logos')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage.from('logos').getPublicUrl(path)

  return NextResponse.json({ publicUrl })
}
