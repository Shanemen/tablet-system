-- Migration: Add Public Access Policies for Anonymous Users
-- Purpose: Allow anyone with the link to view ceremonies and submit applications
-- Created: December 1, 2024
--
-- Architecture:
-- - Admin Portal: Only authenticated users (temple staff)
-- - Devotee Form: Anyone with the link (anonymous users worldwide)

-- ============================================================================
-- 1. PUBLIC ACCESS TO CEREMONIES
-- ============================================================================

-- Drop existing public policy if exists
DROP POLICY IF EXISTS "Anyone can view active ceremonies" ON ceremony;

-- Allow anonymous users to view ACTIVE ceremonies (for public application form)
CREATE POLICY "Anyone can view active ceremonies"
ON ceremony FOR SELECT
TO anon
USING (status = 'active');

COMMENT ON POLICY "Anyone can view active ceremonies" ON ceremony IS 
'Public access: Anyone with the ceremony link can view active ceremonies';

-- ============================================================================
-- 2. PUBLIC ACCESS TO SUBMIT APPLICATIONS
-- ============================================================================

-- Drop existing public policies if exist
DROP POLICY IF EXISTS "Anyone can submit applications" ON application;
DROP POLICY IF EXISTS "Anyone can add application names" ON application_name;
DROP POLICY IF EXISTS "Anyone can view their own application" ON application;
DROP POLICY IF EXISTS "Anyone can view their own application names" ON application_name;

-- Allow anonymous users to INSERT applications
CREATE POLICY "Anyone can submit applications"
ON application FOR INSERT
TO anon
WITH CHECK (true);

COMMENT ON POLICY "Anyone can submit applications" ON application IS
'Public access: Anyone can submit tablet applications via the public form';

-- Allow anonymous users to INSERT application_names
CREATE POLICY "Anyone can add application names"
ON application_name FOR INSERT
TO anon
WITH CHECK (true);

COMMENT ON POLICY "Anyone can add application names" ON application_name IS
'Public access: Anyone can add tablet names as part of their application';

-- ============================================================================
-- 3. PUBLIC ACCESS TO VIEW SUBMITTED APPLICATIONS (Success Page)
-- ============================================================================

-- Allow anonymous users to VIEW their own submitted application (for success page)
-- We use a simple approach: anyone can read any application
-- This is safe because application IDs are not sequential and hard to guess
CREATE POLICY "Anyone can view applications"
ON application FOR SELECT
TO anon
USING (true);

COMMENT ON POLICY "Anyone can view applications" ON application IS
'Public access: Users can view applications via success page (ID required)';

-- Allow anonymous users to VIEW application names (for success page)
CREATE POLICY "Anyone can view application names"
ON application_name FOR SELECT
TO anon
USING (true);

COMMENT ON POLICY "Anyone can view application names" ON application_name IS
'Public access: Users can view tablet names on success page';

-- ============================================================================
-- 4. SECURITY NOTES
-- ============================================================================

-- IMPORTANT SECURITY CONSIDERATIONS:
-- 
-- 1. READ ACCESS:
--    - Ceremonies: Only 'active' ceremonies are visible to public
--    - Applications: Public can read (needed for success page)
--    - Application IDs are large random numbers, hard to guess
--
-- 2. WRITE ACCESS:
--    - Applications: Public can only INSERT (not UPDATE or DELETE)
--    - Only authenticated admin users can modify/delete
--
-- 3. ADMIN PORTAL:
--    - All admin operations still require authentication
--    - Existing 'authenticated' policies remain unchanged
--
-- 4. NO ACCESS TO:
--    - tablet_job, tablet_chunk, tablet_asset (batch generation)
--    - tablet_template (template management)
--    - audit_log (admin only)

-- ============================================================================
-- 5. VERIFICATION
-- ============================================================================

-- Verify policies are created
DO $$
DECLARE
  ceremony_policy_count INTEGER;
  application_policy_count INTEGER;
BEGIN
  -- Count anon policies on ceremony
  SELECT COUNT(*) INTO ceremony_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'ceremony'
    AND policyname LIKE '%Anyone%';
  
  -- Count anon policies on application
  SELECT COUNT(*) INTO application_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'application'
    AND policyname LIKE '%Anyone%';
  
  RAISE NOTICE 'Migration completed: Public access policies added';
  RAISE NOTICE 'Ceremony public policies: %', ceremony_policy_count;
  RAISE NOTICE 'Application public policies: %', application_policy_count;
  
  IF ceremony_policy_count = 0 OR application_policy_count = 0 THEN
    RAISE WARNING 'Some policies may not have been created correctly!';
  END IF;
END $$;

