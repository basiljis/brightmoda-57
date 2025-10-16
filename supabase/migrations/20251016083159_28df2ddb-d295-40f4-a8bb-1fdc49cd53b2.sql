-- Add cart button display type setting to catalog_display_settings
ALTER TABLE public.catalog_display_settings
ADD COLUMN cart_button_type text NOT NULL DEFAULT 'text';