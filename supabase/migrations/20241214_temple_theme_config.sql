-- Temple Theme Configuration Migration
-- Adds theme_config JSONB to temples table and avatar to admin_user_temple

-- 1. Add theme_config to temples table
ALTER TABLE temples ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}';

-- 2. Set Temple 2 config (primary background - for 靈山美佛寺)
UPDATE temples SET theme_config = '{"banner_bg": "primary", "banner_text": "primary-foreground"}' WHERE id = 2;

-- 3. Set Temple 1 config (default/card background - for 亞特蘭大淨宗學會, can update later)
UPDATE temples SET theme_config = '{"banner_bg": "card", "banner_text": "foreground"}' WHERE id = 1;

-- 4. Add avatar column to admin_user_temple for per-user avatar configuration
ALTER TABLE admin_user_temple ADD COLUMN IF NOT EXISTS avatar VARCHAR(50) DEFAULT 'lotus.png';

-- 5. Migrate existing hardcoded avatars from Sidebar.tsx
-- shanemen@gmail.com was hardcoded to use pearl.png
UPDATE admin_user_temple SET avatar = 'pearl.png' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'shanemen@gmail.com');

-- Available avatar options (stored in /public/avatars/):
-- boba.png, cheesecake.png, daffodil.png, fairy-jar.png, grapefruit.png,
-- hyacinth.png, latte.png, lotus.png, pearl.png, pinwheel.png, tomato.png

-- Theme config structure:
-- {
--   "banner_bg": "primary" | "card" | "white" | "muted",
--   "banner_text": "primary-foreground" | "foreground" | "primary"
-- }

COMMENT ON COLUMN temples.theme_config IS 'JSONB configuration for temple-specific theming (banner colors, etc.)';
COMMENT ON COLUMN admin_user_temple.avatar IS 'Avatar image filename from /public/avatars/ directory';

