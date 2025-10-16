-- Add image zoom on hover setting to catalog display settings
ALTER TABLE public.catalog_display_settings 
ADD COLUMN show_image_zoom_on_hover boolean NOT NULL DEFAULT true;