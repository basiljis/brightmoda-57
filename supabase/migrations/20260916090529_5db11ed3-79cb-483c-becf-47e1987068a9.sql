-- 1. Trigger-only function: nobody should be able to call it directly
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. Analytics recalculation: admins only, never anonymous visitors
CREATE OR REPLACE FUNCTION public.update_analytics_summary()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  IF auth.uid() IS NOT NULL AND public.get_current_user_role() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Only administrators can refresh analytics';
  END IF;

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
$function$;

REVOKE ALL ON FUNCTION public.update_analytics_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_analytics_summary() TO authenticated, service_role;

-- 3. Email subscription upsert: signed-in users only
REVOKE ALL ON FUNCTION public.upsert_email_subscription(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_email_subscription(text, uuid) TO authenticated, service_role;