-- Create table for header menu settings
CREATE TABLE IF NOT EXISTS public.header_menu_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_style TEXT NOT NULL DEFAULT 'simple',
  -- simple, fullwidth, sidebar
  show_featured_products BOOLEAN NOT NULL DEFAULT true,
  show_collections BOOLEAN NOT NULL DEFAULT true,
  show_categories BOOLEAN NOT NULL DEFAULT true,
  featured_products_count INTEGER NOT NULL DEFAULT 3,
  featured_collections_count INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.header_menu_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Header menu settings are viewable by everyone"
  ON public.header_menu_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage header menu settings"
  ON public.header_menu_settings
  FOR ALL
  USING (get_current_user_role() = 'admin');

-- Insert default settings
INSERT INTO public.header_menu_settings (menu_style, show_featured_products, show_collections, show_categories)
VALUES ('simple', true, true, true)
ON CONFLICT DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_header_menu_settings_updated_at
  BEFORE UPDATE ON public.header_menu_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();