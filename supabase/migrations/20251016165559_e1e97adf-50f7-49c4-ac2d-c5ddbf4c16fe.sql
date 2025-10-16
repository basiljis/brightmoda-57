-- Add field for selecting categories to display in right menu
ALTER TABLE header_menu_settings
ADD COLUMN selected_category_ids_right uuid[] DEFAULT '{}'::uuid[];

COMMENT ON COLUMN header_menu_settings.selected_category_ids_right IS 'Categories to display in the right side of the mega menu';