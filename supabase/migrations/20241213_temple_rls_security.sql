-- CRITICAL SECURITY FIX: Temple data isolation
-- Each temple can only see their own ceremonies and applications

-- ============================================================================
-- CEREMONY TABLE: Filter by user's temple_id
-- ============================================================================

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own temple ceremonies" ON ceremony;
DROP POLICY IF EXISTS "Users can insert own temple ceremonies" ON ceremony;
DROP POLICY IF EXISTS "Users can update own temple ceremonies" ON ceremony;
DROP POLICY IF EXISTS "Users can delete own temple ceremonies" ON ceremony;

-- Enable RLS on ceremony table
ALTER TABLE ceremony ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT ceremonies belonging to their temple
CREATE POLICY "Users can view own temple ceremonies"
  ON ceremony FOR SELECT
  TO authenticated
  USING (
    temple_id IN (
      SELECT temple_id FROM admin_user_temple 
      WHERE user_id = auth.uid()
    )
  );

-- Users can only INSERT ceremonies for their temple
CREATE POLICY "Users can insert own temple ceremonies"
  ON ceremony FOR INSERT
  TO authenticated
  WITH CHECK (
    temple_id IN (
      SELECT temple_id FROM admin_user_temple 
      WHERE user_id = auth.uid()
    )
  );

-- Users can only UPDATE their temple's ceremonies
CREATE POLICY "Users can update own temple ceremonies"
  ON ceremony FOR UPDATE
  TO authenticated
  USING (
    temple_id IN (
      SELECT temple_id FROM admin_user_temple 
      WHERE user_id = auth.uid()
    )
  );

-- Users can only DELETE their temple's ceremonies
CREATE POLICY "Users can delete own temple ceremonies"
  ON ceremony FOR DELETE
  TO authenticated
  USING (
    temple_id IN (
      SELECT temple_id FROM admin_user_temple 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- APPLICATION TABLE: Filter by ceremony's temple_id
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own temple applications" ON application;
DROP POLICY IF EXISTS "Users can update own temple applications" ON application;
DROP POLICY IF EXISTS "Users can delete own temple applications" ON application;
DROP POLICY IF EXISTS "Anyone can insert applications" ON application;

-- Enable RLS on application table
ALTER TABLE application ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT applications for their temple's ceremonies
CREATE POLICY "Users can view own temple applications"
  ON application FOR SELECT
  TO authenticated
  USING (
    ceremony_id IN (
      SELECT c.id FROM ceremony c
      JOIN admin_user_temple aut ON c.temple_id = aut.temple_id
      WHERE aut.user_id = auth.uid()
    )
  );

-- Anyone can INSERT applications (public form submission)
CREATE POLICY "Anyone can insert applications"
  ON application FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can only UPDATE applications for their temple
CREATE POLICY "Users can update own temple applications"
  ON application FOR UPDATE
  TO authenticated
  USING (
    ceremony_id IN (
      SELECT c.id FROM ceremony c
      JOIN admin_user_temple aut ON c.temple_id = aut.temple_id
      WHERE aut.user_id = auth.uid()
    )
  );

-- Users can only DELETE applications for their temple
CREATE POLICY "Users can delete own temple applications"
  ON application FOR DELETE
  TO authenticated
  USING (
    ceremony_id IN (
      SELECT c.id FROM ceremony c
      JOIN admin_user_temple aut ON c.temple_id = aut.temple_id
      WHERE aut.user_id = auth.uid()
    )
  );

-- ============================================================================
-- APPLICATION_NAME TABLE: Filter by application's ceremony's temple_id
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own temple application names" ON application_name;
DROP POLICY IF EXISTS "Anyone can insert application names" ON application_name;

-- Enable RLS on application_name table
ALTER TABLE application_name ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT application_names for their temple
CREATE POLICY "Users can view own temple application names"
  ON application_name FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT a.id FROM application a
      JOIN ceremony c ON a.ceremony_id = c.id
      JOIN admin_user_temple aut ON c.temple_id = aut.temple_id
      WHERE aut.user_id = auth.uid()
    )
  );

-- Anyone can INSERT application_names (public form submission)
CREATE POLICY "Anyone can insert application names"
  ON application_name FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- After running this migration:
-- - Temple 1 users can ONLY see Temple 1's ceremonies and applications
-- - Temple 2 users can ONLY see Temple 2's ceremonies and applications
-- - Public users can submit applications to any active ceremony
-- - NO cross-temple data access is possible

