-- Create catalog display settings table
CREATE TABLE IF NOT EXISTS public.catalog_display_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_position text NOT NULL DEFAULT 'on_card', -- 'on_card' or 'below_card'
  favorite_icon_style text NOT NULL DEFAULT 'outline', -- 'outline' or 'filled'
  favorite_position text NOT NULL DEFAULT 'top_right', -- 'top_right', 'top_left', 'bottom_right', 'bottom_left'
  card_spacing text NOT NULL DEFAULT 'normal', -- 'tight', 'normal', 'loose'
  cards_per_row_desktop integer NOT NULL DEFAULT 3, -- 2, 3, 4, 5
  cards_per_row_tablet integer NOT NULL DEFAULT 2,
  cards_per_row_mobile integer NOT NULL DEFAULT 1,
  card_rounding text NOT NULL DEFAULT 'medium', -- 'none', 'small', 'medium', 'large', 'full'
  full_width_layout boolean NOT NULL DEFAULT false,
  show_hover_effects boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catalog_display_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Catalog settings are viewable by everyone"
  ON public.catalog_display_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage catalog settings"
  ON public.catalog_display_settings
  FOR ALL
  USING (get_current_user_role() = 'admin');

-- Create trigger for updated_at
CREATE TRIGGER update_catalog_display_settings_updated_at
  BEFORE UPDATE ON public.catalog_display_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO public.catalog_display_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;