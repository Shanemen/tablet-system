-- Temple Template Variant Migration
-- Adds per-temple tablet layout variant. 'default' = the original shared 6 configs
-- (unchanged for every existing temple); 'atlanta' = the Atlanta Pure Land custom layout.
-- See ATLANTA_IMPLEMENTATION.md.

-- 1. Add template_variant to temples table (idempotent, mirrors theme_config pattern).
--    NOT NULL DEFAULT 'default' => every existing row (incl. 靈山美佛寺 id=2) stays 'default'.
ALTER TABLE temples ADD COLUMN IF NOT EXISTS template_variant TEXT NOT NULL DEFAULT 'default';

-- 2. Atlanta temple (亞特蘭大淨宗學會, id=1) opts into the new variant.
UPDATE temples SET template_variant = 'atlanta' WHERE id = 1;

COMMENT ON COLUMN temples.template_variant IS
  'Per-temple tablet layout variant: ''default'' (original shared configs) or ''atlanta'' (custom layout). Defaults to ''default'' so other temples are unaffected.';
