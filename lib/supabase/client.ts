// Client-side Supabase client for browser usage
// Uses the anon key which is safe to expose in the browser
// Protected by Row Level Security (RLS) policies

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

