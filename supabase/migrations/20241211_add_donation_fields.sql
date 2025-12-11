-- Add donation fields to ceremony table
-- Created: December 11, 2024

ALTER TABLE ceremony ADD COLUMN show_donation BOOLEAN DEFAULT false;
ALTER TABLE ceremony ADD COLUMN donation_url VARCHAR(500);

COMMENT ON COLUMN ceremony.show_donation IS 'Whether to display donation button on success page';
COMMENT ON COLUMN ceremony.donation_url IS 'URL to donation page (only used if show_donation is true)';
