-- Add menu_label and menu_location columns to page_content table
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS menu_label text,
ADD COLUMN IF NOT EXISTS menu_location text DEFAULT 'none' CHECK (menu_location IN ('header', 'footer', 'none'));