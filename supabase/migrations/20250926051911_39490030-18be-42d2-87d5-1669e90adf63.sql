-- Create function to handle subscription upsert
CREATE OR REPLACE FUNCTION public.upsert_email_subscription(
  p_email text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_id uuid;
BEGIN
  -- Try to update existing subscription
  UPDATE email_subscriptions 
  SET is_active = true, updated_at = now()
  WHERE (email = p_email OR user_id = p_user_id)
  RETURNING id INTO subscription_id;
  
  -- If no existing subscription, create new one
  IF NOT FOUND THEN
    INSERT INTO email_subscriptions (email, user_id, is_active)
    VALUES (p_email, p_user_id, true)
    RETURNING id INTO subscription_id;
  END IF;
  
  RETURN subscription_id;
END;
$$;