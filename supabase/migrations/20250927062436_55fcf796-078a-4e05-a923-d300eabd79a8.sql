-- Create analytics tables for tracking site statistics

-- Table for page views tracking
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking user actions (favorites, cart, etc.)
CREATE TABLE public.user_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'add_to_cart', 'add_to_favorites', 'remove_from_cart', 'checkout_started', 'checkout_completed', 'product_view'
  entity_type TEXT, -- 'product', 'page', 'cart'
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for daily analytics summary (for performance)
CREATE TABLE public.analytics_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, metric_name)
);

-- Indexes for better performance
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_user_actions_created_at ON public.user_actions(created_at);
CREATE INDEX idx_user_actions_user_id ON public.user_actions(user_id);
CREATE INDEX idx_user_actions_action_type ON public.user_actions(action_type);
CREATE INDEX idx_analytics_summary_date ON public.analytics_summary(date);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_views
CREATE POLICY "Anyone can insert page views" 
ON public.page_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all page views" 
ON public.page_views 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- RLS policies for user_actions
CREATE POLICY "Anyone can insert user actions" 
ON public.user_actions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all user actions" 
ON public.user_actions 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own actions" 
ON public.user_actions 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS policies for analytics_summary
CREATE POLICY "Admins can manage analytics summary" 
ON public.analytics_summary 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Function to update analytics summary
CREATE OR REPLACE FUNCTION public.update_analytics_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Update daily page views
  INSERT INTO analytics_summary (date, metric_name, metric_value, metadata)
  SELECT 
    today_date,
    'page_views',
    COUNT(*),
    jsonb_build_object('top_pages', 
      jsonb_agg(jsonb_build_object('path', page_path, 'count', cnt) ORDER BY cnt DESC)
      FILTER (WHERE rn <= 10)
    )
  FROM (
    SELECT 
      page_path, 
      COUNT(*) as cnt,
      ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rn
    FROM page_views 
    WHERE DATE(created_at) = today_date
    GROUP BY page_path
  ) t
  ON CONFLICT (date, metric_name) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    metadata = EXCLUDED.metadata,
    updated_at = now();

  -- Update daily unique visitors
  INSERT INTO analytics_summary (date, metric_name, metric_value)
  SELECT 
    today_date,
    'unique_visitors',
    COUNT(DISTINCT COALESCE(user_id::text, session_id))
  FROM page_views 
  WHERE DATE(created_at) = today_date
  ON CONFLICT (date, metric_name) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    updated_at = now();

  -- Update favorites added
  INSERT INTO analytics_summary (date, metric_name, metric_value, metadata)
  SELECT 
    today_date,
    'favorites_added',
    COUNT(*),
    jsonb_build_object('top_products', 
      jsonb_agg(jsonb_build_object('product_id', entity_id, 'count', cnt) ORDER BY cnt DESC)
      FILTER (WHERE rn <= 10)
    )
  FROM (
    SELECT 
      entity_id, 
      COUNT(*) as cnt,
      ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rn
    FROM user_actions 
    WHERE action_type = 'add_to_favorites' 
      AND DATE(created_at) = today_date
    GROUP BY entity_id
  ) t
  ON CONFLICT (date, metric_name) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    metadata = EXCLUDED.metadata,
    updated_at = now();

  -- Update cart additions
  INSERT INTO analytics_summary (date, metric_name, metric_value)
  SELECT 
    today_date,
    'cart_additions',
    COUNT(*)
  FROM user_actions 
  WHERE action_type = 'add_to_cart' 
    AND DATE(created_at) = today_date
  ON CONFLICT (date, metric_name) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    updated_at = now();

  -- Update abandoned carts (carts with items but no checkout in 24h)
  INSERT INTO analytics_summary (date, metric_name, metric_value)
  SELECT 
    today_date,
    'abandoned_carts',
    COUNT(DISTINCT session_id)
  FROM user_actions 
  WHERE action_type = 'add_to_cart' 
    AND DATE(created_at) = today_date
    AND session_id NOT IN (
      SELECT DISTINCT session_id 
      FROM user_actions 
      WHERE action_type = 'checkout_completed' 
        AND created_at >= today_date - INTERVAL '1 day'
    )
  ON CONFLICT (date, metric_name) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    updated_at = now();

  -- Update completed purchases
  INSERT INTO analytics_summary (date, metric_name, metric_value)
  SELECT 
    today_date,
    'completed_purchases',
    COUNT(*)
  FROM user_actions 
  WHERE action_type = 'checkout_completed' 
    AND DATE(created_at) = today_date
  ON CONFLICT (date, metric_name) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    updated_at = now();

  -- Update new subscribers
  INSERT INTO analytics_summary (date, metric_name, metric_value)
  SELECT 
    today_date,
    'new_subscribers',
    COUNT(*)
  FROM email_subscriptions 
  WHERE DATE(created_at) = today_date
  ON CONFLICT (date, metric_name) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    updated_at = now();

END;
$$;