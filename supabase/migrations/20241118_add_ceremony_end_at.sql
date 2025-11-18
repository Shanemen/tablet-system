-- Add end_at column to ceremony table
-- This allows ceremonies to have a duration (start_at to end_at)

ALTER TABLE ceremony 
ADD COLUMN end_at TIMESTAMP;

-- Update existing ceremonies to have end_at = start_at (temporary default)
UPDATE ceremony 
SET end_at = start_at 
WHERE end_at IS NULL;

-- Make end_at NOT NULL after setting defaults
ALTER TABLE ceremony 
ALTER COLUMN end_at SET NOT NULL;

COMMENT ON COLUMN ceremony.end_at IS 'Ceremony end date and time (ceremonies can span multiple days)';

