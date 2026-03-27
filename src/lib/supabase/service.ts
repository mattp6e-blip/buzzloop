import { createClient } from '@supabase/supabase-js'

// Bypasses RLS — only use server-side for public data reads (e.g. review flow)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
