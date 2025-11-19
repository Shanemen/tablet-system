-- Add order_index column to application_name table
-- This is used to maintain the order of names when multiple names are submitted

ALTER TABLE application_name
ADD COLUMN order_index INTEGER DEFAULT 1;

COMMENT ON COLUMN application_name.order_index IS 'Order of the name in the submission (1-based index)';

