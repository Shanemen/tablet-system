-- Migration: Add tablet_type to application_name table
-- This allows one application to contain multiple types of tablets
-- Created: December 1, 2024

-- ============================================================================
-- 1. Add tablet_type column to application_name
-- ============================================================================

ALTER TABLE application_name 
ADD COLUMN tablet_type VARCHAR(50);

-- ============================================================================
-- 2. Add check constraint for tablet_type
-- ============================================================================

ALTER TABLE application_name 
ADD CONSTRAINT application_name_tablet_type_check 
  CHECK (tablet_type IN (
    'longevity',
    'deceased',
    'ancestors',
    'karmic-creditors',
    'aborted-spirits',
    'land-deity'
  ));

-- ============================================================================
-- 3. Backfill existing data
-- ============================================================================

-- Copy tablet_type from application to application_name for existing records
UPDATE application_name an
SET tablet_type = a.tablet_type
FROM application a
WHERE an.application_id = a.id
  AND an.tablet_type IS NULL;

-- ============================================================================
-- 4. Make tablet_type NOT NULL after backfill
-- ============================================================================

ALTER TABLE application_name 
ALTER COLUMN tablet_type SET NOT NULL;

-- ============================================================================
-- 5. Add index for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_application_name_tablet_type 
ON application_name(tablet_type);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_application_name_app_type 
ON application_name(application_id, tablet_type);

-- ============================================================================
-- 6. Update Comments
-- ============================================================================

COMMENT ON COLUMN application_name.tablet_type IS 'Type of tablet for this name (allows one application to have multiple tablet types)';

-- ============================================================================
-- 7. Note on application.tablet_type
-- ============================================================================

-- Note: We keep application.tablet_type for backward compatibility and as
-- a "primary" type indicator, but the actual tablet type for each name
-- is now stored in application_name.tablet_type

COMMENT ON COLUMN application.tablet_type IS 'Primary tablet type (kept for compatibility, actual types are in application_name.tablet_type)';

-- Verify the migration
DO $$
DECLARE
  name_count INTEGER;
  type_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO name_count FROM application_name WHERE tablet_type IS NOT NULL;
  SELECT COUNT(DISTINCT tablet_type) INTO type_count FROM application_name;
  
  RAISE NOTICE 'Migration completed: tablet_type added to application_name';
  RAISE NOTICE 'Total names with tablet_type: %', name_count;
  RAISE NOTICE 'Distinct tablet types: %', type_count;
END $$;

