-- Fix email_subscriptions RLS to avoid referencing auth.users and backfill user_id

-- 1) Drop existing user-facing policies that reference auth.users
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.email_subscriptions;

-- 2) Create new user_id-based policies
CREATE POLICY "Users can view their own subscription (by user_id)"
ON public.email_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription (by user_id)"
ON public.email_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- 3) Backfill user_id using profiles.email to ensure users can see their rows
UPDATE public.email_subscriptions es
SET user_id = p.user_id
FROM public.profiles p
WHERE es.user_id IS NULL AND lower(es.email) = lower(p.email);
