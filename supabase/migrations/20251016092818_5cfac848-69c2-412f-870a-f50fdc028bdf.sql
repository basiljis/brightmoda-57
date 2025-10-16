-- Create table for homepage blocks
CREATE TABLE public.home_page_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_type text NOT NULL CHECK (block_type IN ('catalog', 'catalog_filtered', 'text')),
  title text,
  title_alignment text NOT NULL DEFAULT 'left' CHECK (title_alignment IN ('left', 'center', 'right')),
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  
  -- Catalog settings
  items_count integer,
  collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  show_all_collections boolean DEFAULT false,
  
  -- Text block settings
  text_content text,
  font_size text CHECK (font_size IN ('small', 'medium', 'large', 'xlarge')),
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_page_blocks ENABLE ROW LEVEL SECURITY;

-- Everyone can view active blocks
CREATE POLICY "Everyone can view active home page blocks"
  ON public.home_page_blocks
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage blocks
CREATE POLICY "Only admins can manage home page blocks"
  ON public.home_page_blocks
  FOR ALL
  USING (get_current_user_role() = 'admin');

-- Create trigger for updated_at
CREATE TRIGGER update_home_page_blocks_updated_at
  BEFORE UPDATE ON public.home_page_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on display_order for faster sorting
CREATE INDEX idx_home_page_blocks_order ON public.home_page_blocks(display_order) WHERE is_active = true;