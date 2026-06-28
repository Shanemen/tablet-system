// Onboard Temple 3 — 美東淨宗學會 (Pure Land Buddhist Assoc. of Eastern America)
// Stratford, NJ 08084 → America/New_York (timezone wired in lib/utils/temple-timezone.ts)
//
// Writes to the PRODUCTION database via the service role key. Idempotent: safe to
// re-run — it reuses an existing auth user / temple row instead of duplicating.
//
// Usage:
//   NEW_TEMPLE_PASSWORD='the-password-you-give-me' node scripts/onboard-temple-3.mjs
//
// The password is read from the env var ONLY — it is never hard-coded or committed.

import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

// ---- config for this temple -------------------------------------------------
const TEMPLE = {
  id: 3,
  name_zh: '美東淨宗學會',
  name_en: null,                 // matches existing temples (both null)
  logo_url: null,                // TODO: drop logo into public/temples/ and set later
  image_style: 'bw',            // black & white, printed
  template_variant: 'default',  // same as 靈山美佛寺 (vertical EN/Vietnamese names)
  theme_config: { banner_bg: 'card', banner_text: 'foreground' }, // same as Atlanta
}
const ADMIN = {
  email: 'amtbuse@gmail.com',
  avatar: 'fairy-jar.png',
  display_name: '美東淨宗學會',
}
// -----------------------------------------------------------------------------

const password = process.env.NEW_TEMPLE_PASSWORD
if (!password) {
  console.error('ERROR: set NEW_TEMPLE_PASSWORD env var before running.')
  process.exit(1)
}

const env = {}
for (const line of fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// 1) Auth user (reuse if it already exists) -----------------------------------
let userId
{
  const { data: list, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw error
  const existing = list.users.find((u) => u.email?.toLowerCase() === ADMIN.email.toLowerCase())
  if (existing) {
    userId = existing.id
    console.log(`• auth user already exists, reusing: ${ADMIN.email} (${userId})`)
  } else {
    const { data, error: e2 } = await admin.auth.admin.createUser({
      email: ADMIN.email,
      password,
      email_confirm: true, // can log in immediately, no verification email
    })
    if (e2) throw e2
    userId = data.user.id
    console.log(`• created auth user: ${ADMIN.email} (${userId})`)
  }
}

// 2) temples row (id=3) -------------------------------------------------------
{
  const { data: existing } = await admin.from('temples').select('id').eq('id', TEMPLE.id).maybeSingle()
  if (existing) {
    console.log(`• temple ${TEMPLE.id} already exists — leaving it untouched`)
  } else {
    const { error } = await admin.from('temples').insert(TEMPLE)
    if (error) throw error
    console.log(`• inserted temple ${TEMPLE.id}: ${TEMPLE.name_zh}`)
  }
}

// 3) admin_user_temple link (user ↔ temple 3 ONLY) ----------------------------
{
  const { data: existing } = await admin
    .from('admin_user_temple')
    .select('temple_id')
    .eq('user_id', userId)
    .eq('temple_id', TEMPLE.id)
    .maybeSingle()
  if (existing) {
    console.log(`• link user→temple ${TEMPLE.id} already exists`)
  } else {
    const { error } = await admin.from('admin_user_temple').insert({
      user_id: userId,
      temple_id: TEMPLE.id,
      avatar: ADMIN.avatar,
      display_name: ADMIN.display_name,
    })
    if (error) throw error
    console.log(`• linked user → temple ${TEMPLE.id} (avatar=${ADMIN.avatar})`)
  }
}

// 4) safety check: this user must be linked to temple 3 and NOTHING else ------
{
  const { data: links } = await admin
    .from('admin_user_temple')
    .select('temple_id')
    .eq('user_id', userId)
  const ids = (links ?? []).map((l) => l.temple_id).sort()
  console.log(`• user is linked to temple_id(s): [${ids.join(', ')}]`)
  if (ids.length !== 1 || ids[0] !== TEMPLE.id) {
    console.warn('  ⚠️  WARNING: user is linked to more than just temple 3 — isolation risk!')
  } else {
    console.log('  ✓ user is scoped to temple 3 only')
  }
}

console.log('\nDone. Next: run scripts/verify-tenant-isolation.mjs to prove RLS isolation.')
