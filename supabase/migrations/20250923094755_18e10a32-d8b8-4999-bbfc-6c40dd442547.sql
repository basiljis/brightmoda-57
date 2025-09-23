-- Add font settings to seo_settings table
ALTER TABLE public.seo_settings ADD COLUMN font_headings TEXT DEFAULT 'Inter';
ALTER TABLE public.seo_settings ADD COLUMN font_body TEXT DEFAULT 'Inter';
ALTER TABLE public.seo_settings ADD COLUMN font_accent TEXT DEFAULT 'Inter';
ALTER TABLE public.seo_settings ADD COLUMN custom_fonts_css TEXT;

-- Add font_weights JSON field for storing font weights
ALTER TABLE public.seo_settings ADD COLUMN font_weights JSONB DEFAULT '{"headings": ["400", "600"], "body": ["400"], "accent": ["400"]}'::jsonb;