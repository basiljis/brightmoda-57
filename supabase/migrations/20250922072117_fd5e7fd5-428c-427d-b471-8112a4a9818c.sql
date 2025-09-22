-- Create table for product relationships
CREATE TABLE public.product_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  recommended_for_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommended_for_category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure either product or category is specified, but not both
  CONSTRAINT check_recommendation_target 
    CHECK ((recommended_for_product_id IS NOT NULL AND recommended_for_category_id IS NULL) 
           OR (recommended_for_product_id IS NULL AND recommended_for_category_id IS NOT NULL))
);

-- Enable RLS
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view product recommendations" 
ON public.product_recommendations 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage product recommendations" 
ON public.product_recommendations 
FOR ALL 
USING (get_current_user_role_secure() = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_product_recommendations_product_id ON public.product_recommendations(product_id);
CREATE INDEX idx_product_recommendations_for_product ON public.product_recommendations(recommended_for_product_id);
CREATE INDEX idx_product_recommendations_for_category ON public.product_recommendations(recommended_for_category_id);