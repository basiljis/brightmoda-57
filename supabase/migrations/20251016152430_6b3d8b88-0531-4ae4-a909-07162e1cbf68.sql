-- Add right_side_content field to header_menu_settings
ALTER TABLE header_menu_settings 
ADD COLUMN right_side_content text NOT NULL DEFAULT 'both' 
CHECK (right_side_content IN ('products', 'collections', 'both'));