-- Multi-temple support: Create temples configuration table
-- Each temple can have different image styles (B&W for printing, color for projector)

-- temples table: Central configuration for each temple
CREATE TABLE IF NOT EXISTS temples (
  id SERIAL PRIMARY KEY,
  name_zh VARCHAR(100) NOT NULL,       -- "亞特蘭大淨宗學會" or "靈山美佛寺"
  name_en VARCHAR(100),                 -- Optional English name
  logo_url VARCHAR(500),                -- Logo image URL (stored in /public/temples/{id}.png)
  image_style VARCHAR(20) DEFAULT 'bw', -- 'bw' = black & white, 'color' = colored bg
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial temples
INSERT INTO temples (id, name_zh, image_style) VALUES
  (1, '亞特蘭大淨宗學會', 'bw'),      -- Uses B&W, prints on colored paper
  (2, '靈山美佛寺', 'color')          -- Uses colored backgrounds for projector
ON CONFLICT (id) DO NOTHING;

-- Link users to temples (many-to-many, but typically 1:1)
-- Developer can change their temple_id in Supabase to switch temple view
CREATE TABLE IF NOT EXISTS admin_user_temple (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  temple_id INTEGER REFERENCES temples(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, temple_id)
);

-- Add RLS policies for temples table
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read temples (for their own temple info)
CREATE POLICY "Authenticated users can read temples"
  ON temples FOR SELECT
  TO authenticated
  USING (true);

-- Add RLS policies for admin_user_temple table
ALTER TABLE admin_user_temple ENABLE ROW LEVEL SECURITY;

-- Users can only read their own temple assignments
CREATE POLICY "Users can read own temple assignment"
  ON admin_user_temple FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Comment: To add a new temple:
-- 1. INSERT INTO temples (name_zh, image_style) VALUES ('新道場名稱', 'bw');
-- 2. INSERT INTO admin_user_temple (user_id, temple_id) VALUES ('user-uuid', temple_id);

