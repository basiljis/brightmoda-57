-- Create collections table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  show_on_homepage BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Create policies for collections
CREATE POLICY "Collections are viewable by everyone" 
ON public.collections 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage collections" 
ON public.collections 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Add collection_id to products table
ALTER TABLE public.products ADD COLUMN collection_id UUID REFERENCES public.collections(id);

-- Create trigger for collections timestamps
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample collections
INSERT INTO public.collections (name, slug, description, show_on_homepage, sort_order) VALUES
('Осенняя коллекция', 'autumn', 'Теплые и уютные вещи для осени', true, 1),
('Базовая коллекция', 'basics', 'Основа гардероба на каждый день', true, 2),
('Премиум коллекция', 'premium', 'Эксклюзивные изделия из лучших материалов', false, 3);