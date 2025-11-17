-- Initial Database Schema for Buddhist Temple Tablet Application System
-- Based on TDD: Technical Design Document
-- Created: November 17, 2024

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For full-text search with trigrams
CREATE EXTENSION IF NOT EXISTS pgmq; -- For Supabase Queues (if needed)

-- ============================================================================
-- 1. CEREMONY TABLE (法會)
-- ============================================================================
CREATE TABLE ceremony (
  id BIGSERIAL PRIMARY KEY,
  temple_id INTEGER NOT NULL DEFAULT 1, -- Multi-tenant ready
  name_zh VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  slug VARCHAR(100) UNIQUE NOT NULL, -- e.g., "2025-guanyin-ceremony"
  start_at TIMESTAMP NOT NULL,
  location VARCHAR(300),
  deadline_at TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  retention_policy JSONB, -- e.g., {"type": "permanent"} or {"type": "delete_after_days", "days": 90}
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ceremony_temple_status ON ceremony(temple_id, status);
CREATE INDEX IF NOT EXISTS idx_ceremony_deadline ON ceremony(deadline_at);

COMMENT ON TABLE ceremony IS 'Buddhist ceremonies where devotees can sponsor memorial tablets';
COMMENT ON COLUMN ceremony.slug IS 'Unique URL for sharing (e.g., tablets.temple.org/apply/2025-guanyin-ceremony)';
COMMENT ON COLUMN ceremony.deadline_at IS 'Auto-close form when NOW() > deadline_at';

-- ============================================================================
-- 2. APPLICATION TABLE (申請)
-- ============================================================================
CREATE TABLE application (
  id BIGSERIAL PRIMARY KEY,
  ceremony_id BIGINT NOT NULL REFERENCES ceremony(id) ON DELETE CASCADE,
  applicant_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(200),
  address TEXT,
  plaque_type VARCHAR(50) NOT NULL CHECK (plaque_type IN (
    'longevity', -- 長生祿位 (red paper)
    'deceased', -- 往生蓮位 (yellow paper)
    'ancestors', -- 歷代祖先 (yellow paper)
    'karmic_creditors', -- 冤親債主 (yellow paper)
    'aborted_spirits', -- 墮胎嬰靈 (yellow paper)
    'land_deity' -- 地基主 (yellow paper)
  )),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'reviewed', 'generated', 'problem'
  )),
  pinyin_key VARCHAR(200), -- Cached Pinyin for sorting
  idempotency_key VARCHAR(100) UNIQUE, -- Prevent duplicate submissions
  preferred_lang VARCHAR(10) DEFAULT 'zh',
  has_issue BOOLEAN DEFAULT FALSE,
  issue_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_application_ceremony ON application(ceremony_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_status ON application(status);
CREATE INDEX IF NOT EXISTS idx_application_pinyin ON application(pinyin_key);

-- Full-text search with trigrams
CREATE INDEX IF NOT EXISTS idx_application_name_trgm ON application USING GIN (applicant_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_application_phone_trgm ON application USING GIN (phone gin_trgm_ops);

-- Prevent duplicate submissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_application_idempotency ON application(ceremony_id, idempotency_key);

COMMENT ON TABLE application IS 'Devotee applications (one row per applicant per ceremony)';
COMMENT ON COLUMN application.idempotency_key IS 'Hash of (ceremony_id + phone + plaque_type + main_name) to prevent accidental double-clicks';
COMMENT ON COLUMN application.pinyin_key IS 'Pre-calculated Pinyin for fast sorting (updated on insert/update via trigger)';

-- ============================================================================
-- 3. APPLICATION_NAME TABLE (牌位名字)
-- ============================================================================
CREATE TABLE application_name (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES application(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL, -- Name to display on tablet
  pinyin_key VARCHAR(200), -- For sorting within application
  
  -- Image generation tracking (async queue-based generation)
  image_url TEXT, -- Full public URL from Supabase Storage: tablets/generated/{id}.png
  image_generation_status VARCHAR(20) DEFAULT 'pending' CHECK (image_generation_status IN (
    'pending', 'processing', 'generated', 'failed'
  )),
  image_generated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_name_app ON application_name(application_id);
CREATE INDEX IF NOT EXISTS idx_application_name_pinyin ON application_name(pinyin_key);
CREATE INDEX IF NOT EXISTS idx_application_name_trgm ON application_name USING GIN (display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_application_name_image_status ON application_name(image_generation_status) WHERE image_generation_status = 'pending';

COMMENT ON TABLE application_name IS 'Tablet names (one application can have multiple tablets)';
COMMENT ON COLUMN application_name.image_url IS 'Generated tablet image URL from Supabase Storage';

-- ============================================================================
-- 4. PLAQUE_JOB TABLE (批次生成任務)
-- ============================================================================
CREATE TABLE plaque_job (
  id BIGSERIAL PRIMARY KEY,
  ceremony_id BIGINT NOT NULL REFERENCES ceremony(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'succeeded', 'failed'
  )),
  total_chunks INTEGER NOT NULL,
  done_chunks INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0, -- 0-100
  result_manifest JSONB, -- e.g., {"longevity": "url1", "deceased": "url2", ...}
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plaque_job_ceremony ON plaque_job(ceremony_id, status);

COMMENT ON TABLE plaque_job IS 'Batch tablet generation jobs (tracks overall progress)';

-- ============================================================================
-- 5. PLAQUE_CHUNK TABLE (批次區塊)
-- ============================================================================
CREATE TABLE plaque_chunk (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES plaque_job(id) ON DELETE CASCADE,
  plaque_type VARCHAR(50) NOT NULL,
  range_start INTEGER NOT NULL, -- Offset in sorted application list
  range_end INTEGER NOT NULL, -- e.g., 0-499, 500-999
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'claimed', 'succeeded', 'failed'
  )),
  attempt INTEGER DEFAULT 0, -- Retry count
  checksum VARCHAR(64), -- Hash of input data for idempotency
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plaque_chunk_job ON plaque_chunk(job_id, status);
CREATE INDEX IF NOT EXISTS idx_plaque_chunk_status ON plaque_chunk(status) WHERE status IN ('pending', 'claimed');

COMMENT ON TABLE plaque_chunk IS 'Individual processing chunks for parallel execution';

-- ============================================================================
-- 6. PLAQUE_TEMPLATE TABLE (牌位模板)
-- ============================================================================
CREATE TABLE plaque_template (
  id BIGSERIAL PRIMARY KEY,
  plaque_type VARCHAR(50) UNIQUE NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  text_positions JSONB NOT NULL, -- e.g., {"name": {"x": 150, "y": 200}, "applicant": {"x": 280, "y": 450}}
  font_size INTEGER DEFAULT 24,
  font_family VARCHAR(50) DEFAULT 'KaiTi',
  paper_color VARCHAR(20) DEFAULT 'yellow', -- red or yellow
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE plaque_template IS 'Template metadata for different tablet types';

-- ============================================================================
-- 7. PLAQUE_ASSET TABLE (已生成PDF文件)
-- ============================================================================
CREATE TABLE plaque_asset (
  id BIGSERIAL PRIMARY KEY,
  ceremony_id BIGINT NOT NULL REFERENCES ceremony(id),
  plaque_type VARCHAR(50) NOT NULL,
  file_url VARCHAR(500) NOT NULL, -- Supabase Storage URL
  file_size_mb DECIMAL(10, 2),
  page_count INTEGER,
  tablet_count INTEGER, -- Number of tablets in this PDF
  generated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plaque_asset_ceremony ON plaque_asset(ceremony_id, plaque_type);

COMMENT ON TABLE plaque_asset IS 'Generated PDF files (6 types per ceremony)';

-- ============================================================================
-- 8. AUDIT_LOG TABLE (操作日誌)
-- ============================================================================
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID, -- Supabase auth user ID
  user_email VARCHAR(200),
  action VARCHAR(100) NOT NULL, -- e.g., "application_created", "pdf_exported", "application_flagged"
  resource_type VARCHAR(50), -- e.g., "application", "ceremony", "plaque_job"
  resource_id BIGINT,
  details JSONB, -- Additional context
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action, created_at DESC);

COMMENT ON TABLE audit_log IS 'Audit trail for all system actions (GDPR compliance, security, tracking)';

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_application_updated_at
  BEFORE UPDATE ON application
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_plaque_chunk_updated_at
  BEFORE UPDATE ON plaque_chunk
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_plaque_template_updated_at
  BEFORE UPDATE ON plaque_template
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Note: RLS policies will be added after Supabase Auth is configured
-- For now, tables are accessible only via service role key

-- Enable RLS on all tables (will be configured later)
ALTER TABLE ceremony ENABLE ROW LEVEL SECURITY;
ALTER TABLE application ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaque_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaque_chunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaque_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaque_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEED DATA (Initial Templates)
-- ============================================================================
INSERT INTO plaque_template (plaque_type, image_url, text_positions, font_size, font_family, paper_color) VALUES
  ('longevity', 'templates/longevity.png', '{"name": {"x": 150, "y": 200}, "applicant": {"x": 280, "y": 450}}', 24, 'KaiTi', 'red'),
  ('deceased', 'templates/deceased.png', '{"name": {"x": 150, "y": 200}, "applicant": {"x": 280, "y": 450}}', 24, 'KaiTi', 'yellow'),
  ('ancestors', 'templates/ancestors.png', '{"name": {"x": 150, "y": 200}, "applicant": {"x": 280, "y": 450}}', 24, 'KaiTi', 'yellow'),
  ('karmic_creditors', 'templates/karmic_creditors.png', '{"name": {"x": 150, "y": 200}, "applicant": {"x": 280, "y": 450}}', 24, 'KaiTi', 'yellow'),
  ('aborted_spirits', 'templates/aborted_spirits.png', '{"name": {"x": 150, "y": 200}, "applicant": {"x": 280, "y": 450}}', 24, 'KaiTi', 'yellow'),
  ('land_deity', 'templates/land_deity.png', '{"name": {"x": 150, "y": 200}, "applicant": {"x": 280, "y": 450}}', 24, 'KaiTi', 'yellow');

COMMENT ON TABLE plaque_template IS 'Template seed data - placeholders until real templates are uploaded';

