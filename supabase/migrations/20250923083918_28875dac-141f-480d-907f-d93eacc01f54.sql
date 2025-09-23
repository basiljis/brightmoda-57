-- Create email_subscriptions table
CREATE TABLE public.email_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for email subscriptions
CREATE POLICY "Anyone can subscribe with email" 
ON public.email_subscriptions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own subscription" 
ON public.email_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id OR email IN (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

CREATE POLICY "Users can update their own subscription" 
ON public.email_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id OR email IN (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

CREATE POLICY "Admins can view all subscriptions" 
ON public.email_subscriptions 
FOR SELECT 
USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admins can manage all subscriptions" 
ON public.email_subscriptions 
FOR ALL 
USING (get_current_user_role() = 'admin'::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_subscriptions_updated_at
BEFORE UPDATE ON public.email_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();