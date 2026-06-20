import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Vitest config for Atlanta tablet evals.
// - Unit tests (lib/atlanta pure layout functions, D.2) run in node, no browser.
// - Visual regression tests (D.1) hit a live `next dev` server and decode PNGs;
//   they are tagged and skipped unless ATLANTA_VISUAL=1 so plain `npm test` stays fast.
export default defineConfig({
  test: {
    environment: 'node',
    // Run tests in forked child processes, not worker threads. The harfbuzz wasm used by
    // subset-font is flaky under vitest's default thread pool (occasional dropped glyphs);
    // plain node processes are stable (verified 520/520) and match the prod runtime.
    pool: 'forks',
    include: ['tests/**/*.test.ts'],
    // Real unit tests (lib/atlanta layout functions) land in Step 3; until then
    // `npm test` (which excludes the env-gated visual tests) has nothing to run.
    passWithNoTests: true,
    // Visual tests need a running dev server; gate them behind an env flag.
    exclude: process.env.ATLANTA_VISUAL === '1' ? [] : ['tests/visual/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
