-- Add vertical spacing setting to catalog_display_settings
ALTER TABLE public.catalog_display_settings
ADD COLUMN card_vertical_spacing text NOT NULL DEFAULT 'normal';