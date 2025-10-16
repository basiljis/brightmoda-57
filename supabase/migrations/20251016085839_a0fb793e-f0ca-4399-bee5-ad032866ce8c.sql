-- Add new columns to catalog_display_settings table
ALTER TABLE public.catalog_display_settings
ADD COLUMN IF NOT EXISTS cart_button_size TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS card_text_alignment TEXT NOT NULL DEFAULT 'left';

-- Add check constraints for valid values
ALTER TABLE public.catalog_display_settings
ADD CONSTRAINT cart_button_size_check CHECK (cart_button_size IN ('small', 'medium', 'large'));

ALTER TABLE public.catalog_display_settings
ADD CONSTRAINT card_text_alignment_check CHECK (card_text_alignment IN ('left', 'center', 'right'));