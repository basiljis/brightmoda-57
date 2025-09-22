-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND public.get_current_user_role() = 'admin');

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, name),
  UNIQUE(category_id, slug)
);

-- Create colors table
CREATE TABLE public.colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  hex_code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sizes table
CREATE TABLE public.sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new fields to products table
ALTER TABLE public.products 
ADD COLUMN sku TEXT UNIQUE,
ADD COLUMN is_preorder BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN video_urls TEXT[] DEFAULT '{}',
ADD COLUMN category_id UUID REFERENCES public.categories(id),
ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id);

-- Create junction tables for many-to-many relationships
CREATE TABLE public.product_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES public.colors(id) ON DELETE CASCADE,
  UNIQUE(product_id, color_id)
);

CREATE TABLE public.product_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES public.sizes(id) ON DELETE CASCADE,
  UNIQUE(product_id, size_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories
CREATE POLICY "Everyone can view active categories" ON public.categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage categories" ON public.categories
FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for subcategories
CREATE POLICY "Everyone can view active subcategories" ON public.subcategories
FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage subcategories" ON public.subcategories
FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for colors
CREATE POLICY "Everyone can view active colors" ON public.colors
FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage colors" ON public.colors
FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for sizes
CREATE POLICY "Everyone can view active sizes" ON public.sizes
FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage sizes" ON public.sizes
FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for product_colors
CREATE POLICY "Everyone can view product colors" ON public.product_colors
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage product colors" ON public.product_colors
FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for product_sizes
CREATE POLICY "Everyone can view product sizes" ON public.product_sizes
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage product sizes" ON public.product_sizes
FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at
BEFORE UPDATE ON public.subcategories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_colors_updated_at
BEFORE UPDATE ON public.colors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sizes_updated_at
BEFORE UPDATE ON public.sizes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default data
INSERT INTO public.categories (name, slug, description) VALUES
('Одежда', 'clothing', 'Коллекция одежды'),
('Аксессуары', 'accessories', 'Аксессуары и дополнения'),
('Домашний текстиль', 'home-textiles', 'Товары для дома');

INSERT INTO public.subcategories (category_id, name, slug, description) VALUES
((SELECT id FROM public.categories WHERE slug = 'clothing'), 'Свитеры', 'sweaters', 'Теплые свитеры'),
((SELECT id FROM public.categories WHERE slug = 'clothing'), 'Кардиганы', 'cardigans', 'Стильные кардиганы'),
((SELECT id FROM public.categories WHERE slug = 'clothing'), 'Платья', 'dresses', 'Элегантные платья');

INSERT INTO public.colors (name, hex_code) VALUES
('Белый', '#FFFFFF'),
('Черный', '#000000'),
('Серый', '#808080'),
('Бежевый', '#F5F5DC'),
('Коричневый', '#A52A2A'),
('Синий', '#0000FF'),
('Красный', '#FF0000'),
('Зеленый', '#008000');

INSERT INTO public.sizes (name, sort_order) VALUES
('XS', 1),
('S', 2),
('M', 3),
('L', 4),
('XL', 5),
('XXL', 6);