-- Add notes column to application table for storing problem descriptions
ALTER TABLE application ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN application.notes IS 'Notes explaining why an application was marked as problematic';

