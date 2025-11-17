-- Basic RLS Policies for MVP (Single Temple)
-- Created: November 17, 2024
-- Purpose: Ensure only authenticated admin users can access data

-- ============================================================================
-- ENABLE RLS (already enabled in initial schema, but just to be safe)
-- ============================================================================

ALTER TABLE ceremony ENABLE ROW LEVEL SECURITY;
ALTER TABLE application ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaque_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaque_chunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaque_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaque_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BASIC POLICIES: Authenticated Users Can Access All Data
-- ============================================================================

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Authenticated users can view ceremonies" ON ceremony;
DROP POLICY IF EXISTS "Authenticated users can insert ceremonies" ON ceremony;
DROP POLICY IF EXISTS "Authenticated users can update ceremonies" ON ceremony;
DROP POLICY IF EXISTS "Authenticated users can view applications" ON application;
DROP POLICY IF EXISTS "Authenticated users can insert applications" ON application;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON application;
DROP POLICY IF EXISTS "Authenticated users can delete applications" ON application;
DROP POLICY IF EXISTS "Authenticated users can view application names" ON application_name;
DROP POLICY IF EXISTS "Authenticated users can insert application names" ON application_name;
DROP POLICY IF EXISTS "Authenticated users can update application names" ON application_name;
DROP POLICY IF EXISTS "Authenticated users can delete application names" ON application_name;
DROP POLICY IF EXISTS "Authenticated users can view plaque jobs" ON plaque_job;
DROP POLICY IF EXISTS "Authenticated users can insert plaque jobs" ON plaque_job;
DROP POLICY IF EXISTS "Authenticated users can update plaque jobs" ON plaque_job;
DROP POLICY IF EXISTS "Authenticated users can view plaque chunks" ON plaque_chunk;
DROP POLICY IF EXISTS "Authenticated users can insert plaque chunks" ON plaque_chunk;
DROP POLICY IF EXISTS "Authenticated users can update plaque chunks" ON plaque_chunk;
DROP POLICY IF EXISTS "Authenticated users can view plaque templates" ON plaque_template;
DROP POLICY IF EXISTS "Authenticated users can insert plaque templates" ON plaque_template;
DROP POLICY IF EXISTS "Authenticated users can update plaque templates" ON plaque_template;
DROP POLICY IF EXISTS "Authenticated users can view plaque assets" ON plaque_asset;
DROP POLICY IF EXISTS "Authenticated users can insert plaque assets" ON plaque_asset;
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON audit_log;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_log;

-- CEREMONY TABLE
CREATE POLICY "Authenticated users can view ceremonies"
ON ceremony FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert ceremonies"
ON ceremony FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update ceremonies"
ON ceremony FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- APPLICATION TABLE
CREATE POLICY "Authenticated users can view applications"
ON application FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert applications"
ON application FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update applications"
ON application FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete applications"
ON application FOR DELETE
TO authenticated
USING (true);

-- APPLICATION_NAME TABLE
CREATE POLICY "Authenticated users can view application names"
ON application_name FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert application names"
ON application_name FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update application names"
ON application_name FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete application names"
ON application_name FOR DELETE
TO authenticated
USING (true);

-- PLAQUE_JOB TABLE
CREATE POLICY "Authenticated users can view plaque jobs"
ON plaque_job FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert plaque jobs"
ON plaque_job FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update plaque jobs"
ON plaque_job FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- PLAQUE_CHUNK TABLE
CREATE POLICY "Authenticated users can view plaque chunks"
ON plaque_chunk FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert plaque chunks"
ON plaque_chunk FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update plaque chunks"
ON plaque_chunk FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- PLAQUE_TEMPLATE TABLE
CREATE POLICY "Authenticated users can view plaque templates"
ON plaque_template FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert plaque templates"
ON plaque_template FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update plaque templates"
ON plaque_template FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- PLAQUE_ASSET TABLE
CREATE POLICY "Authenticated users can view plaque assets"
ON plaque_asset FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert plaque assets"
ON plaque_asset FOR INSERT
TO authenticated
WITH CHECK (true);

-- AUDIT_LOG TABLE (Read-only for admins)
CREATE POLICY "Authenticated users can view audit logs"
ON audit_log FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert audit logs"
ON audit_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Authenticated users can view ceremonies" ON ceremony IS 
'MVP: All authenticated admin users can view all ceremonies (single temple)';

COMMENT ON POLICY "Authenticated users can view applications" ON application IS 
'MVP: All authenticated admin users can view all applications (single temple)';

COMMENT ON POLICY "Authenticated users can view application names" ON application_name IS 
'MVP: All authenticated admin users can view all application names (single temple)';

-- ============================================================================
-- NOTES
-- ============================================================================

-- For MVP (Single Temple):
-- - All authenticated users (Sally, Hank) belong to the same temple
-- - RLS ensures only logged-in users can access data
-- - No temple_id filtering needed yet
--
-- For Phase 2 (Multi-Temple):
-- - Will add admin_users table with temple_id
-- - Will replace these policies with temple-specific filtering
-- - Example: USING (ceremony.temple_id = get_user_temple_id())

