-- Fix email_subscriptions RLS policies to work properly for both users and admins

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.email_subscriptions;

-- Create simple, working admin policies
CREATE POLICY "Admins can view all email subscriptions"
ON public.email_subscriptions
FOR SELECT
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all email subscriptions"
ON public.email_subscriptions
FOR UPDATE
USING (get_current_user_role() = 'admin');

-- Update existing user policies to be more permissive for finding subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription (by user_id)" ON public.email_subscriptions;

CREATE POLICY "Users can view their own subscription"
ON public.email_subscriptions
FOR SELECT
USING (
  auth.uid() = user_id OR 
  email IN (
    SELECT p.email 
    FROM profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Ensure user_id is properly set for existing records
UPDATE public.email_subscriptions es
SET user_id = p.user_id
FROM public.profiles p
WHERE es.user_id IS NULL 
  AND lower(es.email) = lower(p.email);