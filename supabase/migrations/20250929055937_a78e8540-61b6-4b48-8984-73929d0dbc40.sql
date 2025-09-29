-- Add SEO promotion fields for Yandex and Google
ALTER TABLE seo_settings 
ADD COLUMN IF NOT EXISTS google_analytics_id text,
ADD COLUMN IF NOT EXISTS google_search_console_verification text,
ADD COLUMN IF NOT EXISTS yandex_metrica_id text,
ADD COLUMN IF NOT EXISTS yandex_webmaster_verification text,
ADD COLUMN IF NOT EXISTS google_tag_manager_id text,
ADD COLUMN IF NOT EXISTS facebook_domain_verification text,
ADD COLUMN IF NOT EXISTS additional_meta_tags jsonb DEFAULT '{}'::jsonb;