-- Add display_name column to admin_user_temple for easier tracking
-- So admins can see "Sicong | temple 2" instead of just UUIDs

ALTER TABLE admin_user_temple 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);

-- Update existing record with your name
UPDATE admin_user_temple 
SET display_name = 'Sicong' 
WHERE user_id = '0ba50d85-38b8-4b13-8463-6b13'::uuid;

