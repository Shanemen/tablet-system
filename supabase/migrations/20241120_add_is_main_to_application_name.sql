-- Add is_main column to application_name table
-- This is used to identify the primary name for the tablet (e.g. the main deceased person or the main living person)

ALTER TABLE application_name
ADD COLUMN is_main BOOLEAN DEFAULT false;

COMMENT ON COLUMN application_name.is_main IS 'Whether this is the main name for the tablet (used for display and logic)';

