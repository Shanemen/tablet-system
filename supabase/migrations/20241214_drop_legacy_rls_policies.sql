-- Drop Legacy RLS Policies (Single-Temple Era)
-- 
-- Purpose: Remove old "allow all authenticated users" policies that bypass temple isolation
-- 
-- Background:
-- - 20241117_rls_basic_policies.sql created policies with USING (true) for MVP single-temple
-- - 20241213_temple_rls_security.sql added proper temple isolation policies
-- - BUT: PostgreSQL RLS allows access if ANY policy permits
-- - Result: Old USING (true) policies were bypassing the new temple filters
--
-- This migration removes the legacy policies to ensure temple data isolation works correctly.

-- ============================================================================
-- CEREMONY TABLE - Drop legacy policies
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view ceremonies" ON ceremony;
DROP POLICY IF EXISTS "Authenticated users can insert ceremonies" ON ceremony;
DROP POLICY IF EXISTS "Authenticated users can update ceremonies" ON ceremony;

-- ============================================================================
-- APPLICATION TABLE - Drop legacy policies
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view applications" ON application;
DROP POLICY IF EXISTS "Authenticated users can insert applications" ON application;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON application;
DROP POLICY IF EXISTS "Authenticated users can delete applications" ON application;

-- ============================================================================
-- APPLICATION_NAME TABLE - Drop legacy policies
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view application names" ON application_name;
DROP POLICY IF EXISTS "Authenticated users can insert application names" ON application_name;
DROP POLICY IF EXISTS "Authenticated users can update application names" ON application_name;
DROP POLICY IF EXISTS "Authenticated users can delete application names" ON application_name;

-- ============================================================================
-- PLAQUE_JOB TABLE - Drop legacy policies (if exists)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view plaque jobs" ON plaque_job;
DROP POLICY IF EXISTS "Authenticated users can insert plaque jobs" ON plaque_job;
DROP POLICY IF EXISTS "Authenticated users can update plaque jobs" ON plaque_job;

-- ============================================================================
-- PLAQUE_CHUNK TABLE - Drop legacy policies (if exists)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view plaque chunks" ON plaque_chunk;
DROP POLICY IF EXISTS "Authenticated users can insert plaque chunks" ON plaque_chunk;
DROP POLICY IF EXISTS "Authenticated users can update plaque chunks" ON plaque_chunk;

-- ============================================================================
-- PLAQUE_TEMPLATE TABLE - Drop legacy policies (if exists)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view plaque templates" ON plaque_template;
DROP POLICY IF EXISTS "Authenticated users can insert plaque templates" ON plaque_template;
DROP POLICY IF EXISTS "Authenticated users can update plaque templates" ON plaque_template;

-- ============================================================================
-- PLAQUE_ASSET TABLE - Drop legacy policies (if exists)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view plaque assets" ON plaque_asset;
DROP POLICY IF EXISTS "Authenticated users can insert plaque assets" ON plaque_asset;

-- ============================================================================
-- AUDIT_LOG TABLE - Drop legacy policies (if exists)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON audit_log;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_log;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this migration, only the temple-specific policies from
-- 20241213_temple_rls_security.sql should remain active.
--
-- To verify, run in Supabase SQL Editor:
-- SELECT schemaname, tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

