-- Create table for lookbook items
CREATE TABLE public.lookbook_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  season TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for page content (About Us, Contacts, etc.)
CREATE TABLE public.page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL, -- 'about_us', 'contacts'
  section_name TEXT NOT NULL, -- 'title', 'description', 'phone', 'email', etc.
  content_type TEXT NOT NULL, -- 'text', 'html', 'image', 'json'
  content_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lookbook_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Create policies for lookbook_items
CREATE POLICY "Lookbook items are viewable by everyone" 
ON public.lookbook_items 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify lookbook items" 
ON public.lookbook_items 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create policies for page_content
CREATE POLICY "Page content is viewable by everyone" 
ON public.page_content 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify page content" 
ON public.page_content 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create triggers for timestamps
CREATE TRIGGER update_lookbook_items_updated_at
BEFORE UPDATE ON public.lookbook_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for About Us page
INSERT INTO public.page_content (page_name, section_name, content_type, content_value, display_order) VALUES
('about_us', 'title', 'text', 'О НАС', 1),
('about_us', 'subtitle', 'text', 'История бренда BRIGHT и наша философия', 2),
('about_us', 'paragraph_1', 'text', 'BRIGHT — это бренд премиальной одежды из мериносовой шерсти, созданный с любовью к качеству, комфорту и минималистичному дизайну.', 3),
('about_us', 'paragraph_2', 'text', 'Мы верим, что настоящая роскошь заключается в простоте и качестве материалов. Каждое изделие создается из лучшей мериносовой шерсти, которая обеспечивает исключительный комфорт и долговечность.', 4),
('about_us', 'paragraph_3', 'text', 'Наша миссия — создавать вещи, которые станут основой вашего гардероба на долгие годы, сочетая в себе функциональность, красоту и устойчивость.', 5);

-- Insert default content for Contacts page
INSERT INTO public.page_content (page_name, section_name, content_type, content_value, display_order) VALUES
('contacts', 'title', 'text', 'КОНТАКТЫ', 1),
('contacts', 'subtitle', 'text', 'Свяжитесь с нами любым удобным способом', 2),
('contacts', 'phone', 'text', '+7 (495) 123-45-67', 3),
('contacts', 'email', 'text', 'hello@bright.ru', 4),
('contacts', 'address', 'text', 'Москва, ул. Тверская, 15', 5),
('contacts', 'schedule', 'text', 'Ежедневно с 10:00 до 22:00', 6),
('contacts', 'instagram', 'text', '@bright_official', 7),
('contacts', 'telegram', 'text', '@bright_support', 8),
('contacts', 'work_hours_weekdays', 'text', 'Пн-Пт: 10:00 - 20:00', 9),
('contacts', 'work_hours_weekend', 'text', 'Сб-Вс: 11:00 - 19:00', 10);

-- Insert sample lookbook items
INSERT INTO public.lookbook_items (title, subtitle, season, description, display_order) VALUES
('Образ 1', 'Осень 2024', 'Осень 2024', 'Элегантный повседневный образ с кардиганом из мериноса', 1),
('Образ 2', 'Осень 2024', 'Осень 2024', 'Минималистичный офисный стиль', 2),
('Образ 3', 'Осень 2024', 'Осень 2024', 'Уютный домашний комплект', 3),
('Образ 4', 'Осень 2024', 'Осень 2024', 'Стильный вечерний образ', 4);