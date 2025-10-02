-- Add footer text fields and social links to site_settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS copyright_text text DEFAULT '© 2024 BRIGHT. Все права защищены.',
ADD COLUMN IF NOT EXISTS footer_description text DEFAULT 'Премиальная одежда из мериносовой шерсти. Качество, комфорт и стиль в каждом изделии.',
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{"instagram": "", "facebook": "", "vk": "", "telegram": "", "youtube": "", "tiktok": ""}'::jsonb;