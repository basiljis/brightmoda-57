-- Add cookie consent settings to site_settings table
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS cookie_consent_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS cookie_consent_title text DEFAULT 'Использование файлов cookie',
ADD COLUMN IF NOT EXISTS cookie_consent_text text DEFAULT 'Мы используем файлы cookie для улучшения работы сайта и анализа трафика. Продолжая использовать сайт, вы соглашаетесь с нашей политикой обработки персональных данных.',
ADD COLUMN IF NOT EXISTS cookie_consent_button_text text DEFAULT 'Принять',
ADD COLUMN IF NOT EXISTS cookie_consent_position text DEFAULT 'bottom',
ADD COLUMN IF NOT EXISTS cookie_consent_privacy_link text DEFAULT '/privacy-policy';