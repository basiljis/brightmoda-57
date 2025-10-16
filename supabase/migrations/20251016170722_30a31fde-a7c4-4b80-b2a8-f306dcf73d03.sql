-- Add field for showing categories in right menu
ALTER TABLE header_menu_settings
ADD COLUMN show_categories_right boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN header_menu_settings.show_categories_right IS 'Show categories in the right side of the mega menu';