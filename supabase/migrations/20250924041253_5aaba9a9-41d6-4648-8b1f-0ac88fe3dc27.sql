-- Create Yandex payment settings table
CREATE TABLE public.yandex_payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id TEXT,
  secret_key TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  test_mode BOOLEAN NOT NULL DEFAULT true,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.yandex_payment_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for Yandex payment settings
CREATE POLICY "Only admins can manage Yandex payment settings" 
ON public.yandex_payment_settings 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Add trigger for updating timestamps
CREATE TRIGGER update_yandex_payment_settings_updated_at
BEFORE UPDATE ON public.yandex_payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add section visibility state table for admin panel
CREATE TABLE public.admin_section_visibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section_name TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_name)
);

-- Enable RLS
ALTER TABLE public.admin_section_visibility ENABLE ROW LEVEL SECURITY;

-- Create policies for admin section visibility
CREATE POLICY "Users can manage their own visibility settings"
ON public.admin_section_visibility
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_admin_section_visibility_updated_at
BEFORE UPDATE ON public.admin_section_visibility
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();