// Verify tenant isolation for Temple 3 — proves RLS, doesn't assume it.
//
// Signs in AS the temple-3 admin using the public anon key (so RLS is enforced
// exactly like the real app), then checks that this session can see ONLY temple
// 3's rows — never temple 1 or temple 2 data. Read-only; creates nothing.
//
// Usage:
//   NEW_TEMPLE_PASSWORD='the-password' node scripts/verify-tenant-isolation.mjs

import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const password = process.env.NEW_TEMPLE_PASSWORD
if (!password) {
  console.error('ERROR: set NEW_TEMPLE_PASSWORD env var before running.')
  process.exit(1)
}
const EMAIL = 'amtbuse@gmail.com'
const TEMPLE_ID = 3

const env = {}
for (const line of fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

// service-role client = ground truth (bypasses RLS)
const svc = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
// anon client signed in as the temple-3 user = exactly what the real app sees
const app = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { error: signInErr } = await app.auth.signInWithPassword({ email: EMAIL, password })
if (signInErr) {
  console.error('Sign-in failed (check the password):', signInErr.message)
  process.exit(1)
}
console.log(`Signed in as ${EMAIL}\n`)

let pass = true
const check = (label, ok, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) pass = false
}

// Ground truth across ALL temples (service role)
const { count: totalCeremonies } = await svc.from('ceremony').select('*', { count: 'exact', head: true })
const { count: temple3Ceremonies } = await svc
  .from('ceremony').select('*', { count: 'exact', head: true }).eq('temple_id', TEMPLE_ID)
const otherCeremonies = (totalCeremonies ?? 0) - (temple3Ceremonies ?? 0)
console.log(`(ground truth: ${totalCeremonies} ceremonies total, ${temple3Ceremonies} for temple 3, ${otherCeremonies} for other temples)\n`)

// What the temple-3 session can actually see
const { data: visibleCeremonies, error: cErr } = await app.from('ceremony').select('id, temple_id')
if (cErr) { check('read ceremony as temple-3 user', false, cErr.message) }
else {
  const leaked = visibleCeremonies.filter((c) => c.temple_id !== TEMPLE_ID)
  check('temple-3 session sees ONLY temple-3 ceremonies', leaked.length === 0,
    `${visibleCeremonies.length} visible, ${leaked.length} leaked from other temples`)
  check('temple-3 session count matches its own ground-truth count',
    visibleCeremonies.length === (temple3Ceremonies ?? 0))
}

// Applications must also be invisible across temples
const { data: visibleApps, error: aErr } = await app.from('application').select('id, ceremony_id')
if (aErr) check('read application as temple-3 user', false, aErr.message)
else {
  const own = new Set((visibleCeremonies ?? []).map((c) => c.id))
  const leaked = visibleApps.filter((a) => !own.has(a.ceremony_id))
  check('temple-3 session sees ONLY its own applications', leaked.length === 0,
    `${visibleApps.length} visible, ${leaked.length} leaked`)
}

await app.auth.signOut()
console.log(`\n${pass ? '✅ ISOLATION VERIFIED' : '❌ ISOLATION FAILED — DO NOT GO LIVE'}`)
process.exit(pass ? 0 : 1)
