-- Add DELETE policy for ceremony table
-- This is needed for the "clear all ceremonies" testing function

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can delete ceremonies" ON ceremony;

-- Create DELETE policy for ceremony table
CREATE POLICY "Authenticated users can delete ceremonies"
ON ceremony FOR DELETE
TO authenticated
USING (true);

COMMENT ON POLICY "Authenticated users can delete ceremonies" ON ceremony IS 
'MVP: Allow authenticated admin users to delete ceremonies (for testing and cleanup)';

