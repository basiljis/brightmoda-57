-- Create email_settings table for SMTP configuration
CREATE TABLE public.email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_username TEXT,
  smtp_password TEXT,
  from_email TEXT,
  from_name TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create header_collections table for managing collections displayed in header/hero
CREATE TABLE public.header_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position IN (1, 2)), -- 1 for left (MEN), 2 for right (WOMEN)
  title TEXT NOT NULL,
  link_url TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(position) -- Only one collection per position
);

-- Enable Row Level Security
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.header_collections ENABLE ROW LEVEL SECURITY;

-- Policies for email_settings
CREATE POLICY "Only admins can view email settings" 
ON public.email_settings 
FOR SELECT 
USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Only admins can manage email settings" 
ON public.email_settings 
FOR ALL 
USING (get_current_user_role() = 'admin'::text);

-- Policies for header_collections
CREATE POLICY "Everyone can view active header collections" 
ON public.header_collections 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage header collections" 
ON public.header_collections 
FOR ALL 
USING (get_current_user_role() = 'admin'::text);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_email_settings_updated_at
BEFORE UPDATE ON public.email_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_header_collections_updated_at
BEFORE UPDATE ON public.header_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default header collections data
INSERT INTO public.header_collections (position, title, link_url, image_url) VALUES 
(1, 'MEN', '/catalog?category=men', '/src/assets/men-collection.jpg'),
(2, 'WOMEN', '/catalog?category=women', '/src/assets/women-collection.jpg');