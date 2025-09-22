-- Create security definer function to check user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Only admins can manage delivery settings" ON public.delivery_settings;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can manage products" ON public.products
FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can manage delivery settings" ON public.delivery_settings
FOR ALL USING (public.get_current_user_role() = 'admin');