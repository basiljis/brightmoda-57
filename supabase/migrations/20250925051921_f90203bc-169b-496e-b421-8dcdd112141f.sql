-- Fix email_subscriptions RLS policies
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.email_subscriptions;

-- Create admin policies using profiles table
CREATE POLICY "Admins can view all subscriptions" 
ON public.email_subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage all subscriptions" 
ON public.email_subscriptions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);