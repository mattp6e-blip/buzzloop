import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidInstagramToken } from '@/lib/instagram'

const GQL = 'https://graph.facebook.com/v18.0'

async function pollContainer(containerId: string, token: string, attempts = 15): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const res = await fetch(`${GQL}/${containerId}?fields=status_code&access_token=${token}`)
    const data = await res.json()
    if (data.status_code === 'FINISHED') return true
    if (data.status_code === 'ERROR') return false
  }
  return false
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: business } = await supabase
    .from('businesses')
    .select('id, instagram_user_id, instagram_connected')
    .eq('user_id', user.id)
    .single()

  if (!business?.instagram_connected || !business.instagram_user_id) {
    return NextResponse.json({ error: 'Instagram not connected' }, { status: 400 })
  }

  const token = await getValidInstagramToken(supabase, business.id)
  if (!token) {
    return NextResponse.json({ error: 'Instagram token expired — please reconnect' }, { status: 401 })
  }

  const { postId, videoBlob, caption, postType } = await req.json()

  const igUserId = business.instagram_user_id

  if (postType === 'reel') {
    // videoBlob is a base64-encoded WebM
    if (!videoBlob) {
      return NextResponse.json({ error: 'No video provided' }, { status: 400 })
    }

    // Upload video to Supabase Storage (public bucket)
    const videoData = Buffer.from(videoBlob, 'base64')
    const fileName = `reel-${postId}-${Date.now()}.webm`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reels')
      .upload(fileName, videoData, { contentType: 'video/webm', upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('reels').getPublicUrl(fileName)

    // Step 1: Create media container
    const containerRes = await fetch(`${GQL}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: publicUrl,
        caption,
        share_to_feed: true,
        access_token: token,
      }),
    })
    const containerData = await containerRes.json()

    if (!containerData.id) {
      return NextResponse.json({ error: containerData.error?.message ?? 'Container creation failed' }, { status: 500 })
    }

    // Step 2: Poll until processing is done
    const ready = await pollContainer(containerData.id, token)
    if (!ready) {
      return NextResponse.json({ error: 'Video processing timed out. Try again.' }, { status: 500 })
    }

    // Step 3: Publish
    const publishRes = await fetch(`${GQL}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: containerData.id, access_token: token }),
    })
    const publishData = await publishRes.json()

    if (!publishData.id) {
      return NextResponse.json({ error: publishData.error?.message ?? 'Publish failed' }, { status: 500 })
    }

    // Mark post as published in DB
    await supabase.from('social_posts')
      .update({ status: 'published', instagram_media_id: publishData.id })
      .eq('id', postId)

    // Clean up storage file (Instagram has already downloaded it)
    await supabase.storage.from('reels').remove([fileName])

    return NextResponse.json({ success: true, mediaId: publishData.id })
  }

  return NextResponse.json({ error: 'Unsupported post type' }, { status: 400 })
}
