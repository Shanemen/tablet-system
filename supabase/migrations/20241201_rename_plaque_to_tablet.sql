-- Migration: Rename all "plaque" to "tablet" for consistency
-- Created: December 1, 2024

-- ============================================================================
-- 1. Rename Tables
-- ============================================================================

-- Rename plaque_job to tablet_job
ALTER TABLE IF EXISTS plaque_job RENAME TO tablet_job;

-- Rename plaque_chunk to tablet_chunk
ALTER TABLE IF EXISTS plaque_chunk RENAME TO tablet_chunk;

-- Rename plaque_template to tablet_template
ALTER TABLE IF EXISTS plaque_template RENAME TO tablet_template;

-- Rename plaque_asset to tablet_asset
ALTER TABLE IF EXISTS plaque_asset RENAME TO tablet_asset;

-- ============================================================================
-- 2. Rename Columns in application table
-- ============================================================================

-- Rename plaque_type to tablet_type
ALTER TABLE application RENAME COLUMN plaque_type TO tablet_type;

-- Update check constraint
ALTER TABLE application DROP CONSTRAINT IF EXISTS application_plaque_type_check;
ALTER TABLE application ADD CONSTRAINT application_tablet_type_check 
  CHECK (tablet_type IN (
    'longevity',
    'deceased',
    'ancestors',
    'karmic-creditors',
    'aborted-spirits',
    'land-deity'
  ));

-- ============================================================================
-- 3. Rename Columns in tablet_chunk table
-- ============================================================================

-- Rename plaque_type column in tablet_chunk
ALTER TABLE tablet_chunk RENAME COLUMN plaque_type TO tablet_type;

-- ============================================================================
-- 4. Rename Columns in tablet_template table
-- ============================================================================

-- Rename plaque_type column in tablet_template
ALTER TABLE tablet_template RENAME COLUMN plaque_type TO tablet_type;

-- ============================================================================
-- 5. Rename Columns in tablet_asset table
-- ============================================================================

-- Rename plaque_type column in tablet_asset
ALTER TABLE tablet_asset RENAME COLUMN plaque_type TO tablet_type;

-- ============================================================================
-- 6. Update Indexes (if they exist with old names)
-- ============================================================================

-- Rename indexes for tablet_job
ALTER INDEX IF EXISTS idx_plaque_job_ceremony RENAME TO idx_tablet_job_ceremony;

-- Rename indexes for tablet_chunk
ALTER INDEX IF EXISTS idx_plaque_chunk_job RENAME TO idx_tablet_chunk_job;
ALTER INDEX IF EXISTS idx_plaque_chunk_status RENAME TO idx_tablet_chunk_status;

-- Rename indexes for tablet_asset
ALTER INDEX IF EXISTS idx_plaque_asset_ceremony RENAME TO idx_tablet_asset_ceremony;

-- ============================================================================
-- 7. Update Comments
-- ============================================================================

COMMENT ON TABLE tablet_job IS 'Batch tablet generation jobs (tracks overall progress)';
COMMENT ON TABLE tablet_chunk IS 'Individual processing chunks for parallel execution';
COMMENT ON TABLE tablet_template IS 'Template metadata for different tablet types';
COMMENT ON TABLE tablet_asset IS 'Generated PDF files (6 types per ceremony)';
COMMENT ON COLUMN application.tablet_type IS 'Type of tablet (longevity, deceased, ancestors, karmic-creditors, aborted-spirits, land-deity)';
COMMENT ON COLUMN application.idempotency_key IS 'Hash of (ceremony_id + phone + tablet_type + main_name) to prevent accidental double-clicks';

-- ============================================================================
-- 8. Update Seed Data (in tablet_template)
-- ============================================================================

-- Update the column name reference in existing rows (the column is already renamed, but update any JSON if needed)
-- Note: No JSON fields reference the old column name, so no updates needed

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: All "plaque" references renamed to "tablet"';
  RAISE NOTICE 'Tables renamed: tablet_job, tablet_chunk, tablet_template, tablet_asset';
  RAISE NOTICE 'Columns renamed: application.tablet_type, tablet_chunk.tablet_type, tablet_template.tablet_type, tablet_asset.tablet_type';
END $$;

