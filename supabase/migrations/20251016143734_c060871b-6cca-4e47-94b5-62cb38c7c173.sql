-- Add missing columns to header_menu_settings table
ALTER TABLE header_menu_settings 
ADD COLUMN IF NOT EXISTS selected_collection_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selected_product_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selected_category_ids uuid[] DEFAULT '{}';