-- Create table for site settings (favicon, logo)
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  favicon_url TEXT,
  logo_url TEXT,
  footer_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Site settings are viewable by everyone" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create table for SEO settings
CREATE TABLE public.seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow',
  schema_markup JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_name)
);

-- Enable RLS
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "SEO settings are viewable by everyone" 
ON public.seo_settings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage SEO settings" 
ON public.seo_settings 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Add trigger for automatic timestamp updates on site_settings
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for automatic timestamp updates on seo_settings
CREATE TRIGGER update_seo_settings_updated_at
BEFORE UPDATE ON public.seo_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default SEO settings for main pages
INSERT INTO public.seo_settings (page_name, meta_title, meta_description, robots) VALUES
('home', 'Главная страница', 'Добро пожаловать в наш интернет-магазин', 'index, follow'),
('catalog', 'Каталог товаров', 'Изучите наш каталог товаров', 'index, follow'),
('about', 'О нас', 'Узнайте больше о нашей компании', 'index, follow'),
('contacts', 'Контакты', 'Наши контактные данные', 'index, follow'),
('privacy', 'Политика конфиденциальности', 'Политика конфиденциальности', 'noindex, follow'),
('terms', 'Условия использования', 'Условия использования сайта', 'noindex, follow');