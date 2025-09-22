-- Create table for color-specific images
CREATE TABLE IF NOT EXISTS public.product_color_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_color_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view product color images" 
ON public.product_color_images 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage product color images" 
ON public.product_color_images 
FOR ALL 
USING (get_current_user_role() = 'admin'::text);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_color_images_product_color ON public.product_color_images(product_id, color_id);
CREATE INDEX IF NOT EXISTS idx_product_color_images_sort ON public.product_color_images(product_id, color_id, sort_order);