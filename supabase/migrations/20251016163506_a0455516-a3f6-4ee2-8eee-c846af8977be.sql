-- Add separate settings for right side content visibility
ALTER TABLE header_menu_settings 
ADD COLUMN IF NOT EXISTS show_collections_right boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS show_products_right boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN header_menu_settings.show_collections IS 'Show collections list in left part of menu';
COMMENT ON COLUMN header_menu_settings.show_collections_right IS 'Show collections with images in right part of menu';
COMMENT ON COLUMN header_menu_settings.show_featured_products IS 'Legacy: same as show_products_right';
COMMENT ON COLUMN header_menu_settings.show_products_right IS 'Show products with images in right part of menu';