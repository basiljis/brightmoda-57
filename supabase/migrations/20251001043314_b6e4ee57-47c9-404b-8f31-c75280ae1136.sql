-- Add dark theme logo fields to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS logo_dark_url text,
ADD COLUMN IF NOT EXISTS footer_logo_dark_url text;

COMMENT ON COLUMN site_settings.logo_dark_url IS 'Logo URL for dark theme in header';
COMMENT ON COLUMN site_settings.footer_logo_dark_url IS 'Logo URL for dark theme in footer';