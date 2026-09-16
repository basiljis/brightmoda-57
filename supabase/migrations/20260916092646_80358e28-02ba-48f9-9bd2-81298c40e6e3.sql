
-- Кто может управлять данными конкретного проекта
CREATE OR REPLACE FUNCTION public.can_manage_tenant(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _tenant_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.tenant_members m
    WHERE m.tenant_id = _tenant_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.can_manage_tenant(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_manage_tenant(uuid) TO authenticated, service_role;

-- Запись разрешена только участникам активного проекта (без глобального админа)
CREATE OR REPLACE FUNCTION public.can_edit_tenant(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.tenant_is_active(_tenant_id) AND public.can_manage_tenant(_tenant_id);
$$;

DO $$
DECLARE
  r record;
  tables text[] := ARRAY[
    'catalog_display_settings','categories','collections','colors','delivery_settings',
    'email_settings','header_collections','header_menu_settings','home_page_blocks',
    'lookbook_items','page_content','product_color_images','product_colors',
    'product_recommendations','product_sizes','products','seo_settings','site_settings',
    'sizes','subcategories','yandex_payment_settings','analytics_summary'
  ];
  t text;
BEGIN
  -- Удаляем все старые политики, основанные на глобальной роли администратора
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND (qual LIKE '%get_current_user_role%' OR with_check LIKE '%get_current_user_role%')
      AND tablename = ANY(tables)
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;

  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE POLICY "tenant_admins_manage" ON public.%I FOR ALL TO authenticated
         USING (public.can_manage_tenant(tenant_id))
         WITH CHECK (public.can_manage_tenant(tenant_id))', t);
  END LOOP;
END $$;

-- Статистика: только участники своего проекта
DROP POLICY IF EXISTS "Admins can view all page views" ON public.page_views;
CREATE POLICY "tenant_admins_view_page_views" ON public.page_views
  FOR SELECT TO authenticated USING (public.can_manage_tenant(tenant_id));

DROP POLICY IF EXISTS "Admins can view all user actions" ON public.user_actions;
CREATE POLICY "tenant_admins_view_user_actions" ON public.user_actions
  FOR SELECT TO authenticated USING (public.can_manage_tenant(tenant_id));

-- Заказы и подписки: только участники своего проекта
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "tenant_admins_view_orders" ON public.orders
  FOR SELECT TO authenticated USING (public.can_manage_tenant(tenant_id));

DROP POLICY IF EXISTS "Admins can view all email subscriptions" ON public.email_subscriptions;
CREATE POLICY "tenant_admins_view_subscriptions" ON public.email_subscriptions
  FOR SELECT TO authenticated USING (public.can_manage_tenant(tenant_id));

DROP POLICY IF EXISTS "Admins can update all email subscriptions" ON public.email_subscriptions;
CREATE POLICY "tenant_admins_update_subscriptions" ON public.email_subscriptions
  FOR UPDATE TO authenticated
  USING (public.can_manage_tenant(tenant_id))
  WITH CHECK (public.can_manage_tenant(tenant_id));

-- Секретные настройки не должны читаться публично
DROP POLICY IF EXISTS "Only admins can view email settings" ON public.email_settings;
REVOKE SELECT ON public.email_settings, public.delivery_settings, public.yandex_payment_settings,
  public.analytics_summary, public.page_views, public.user_actions FROM anon;

-- Сводка аналитики обновляется только администратором своего проекта или сервисом
CREATE OR REPLACE FUNCTION public.update_analytics_summary()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE
  today_date DATE := CURRENT_DATE;
  t_id uuid;
BEGIN
  SELECT m.tenant_id INTO t_id
  FROM public.tenant_members m
  WHERE m.user_id = auth.uid() AND m.role IN ('owner','admin')
  LIMIT 1;

  IF auth.uid() IS NOT NULL AND t_id IS NULL THEN
    RAISE EXCEPTION 'Нет прав на обновление статистики';
  END IF;

  INSERT INTO analytics_summary (date, metric_name, metric_value, tenant_id)
  SELECT today_date, 'page_views', COUNT(*), t_id
  FROM page_views
  WHERE DATE(created_at) = today_date AND (t_id IS NULL OR tenant_id = t_id)
  ON CONFLICT (date, metric_name) DO UPDATE
    SET metric_value = EXCLUDED.metric_value, updated_at = now();

  INSERT INTO analytics_summary (date, metric_name, metric_value, tenant_id)
  SELECT today_date, 'unique_visitors', COUNT(DISTINCT COALESCE(user_id::text, session_id)), t_id
  FROM page_views
  WHERE DATE(created_at) = today_date AND (t_id IS NULL OR tenant_id = t_id)
  ON CONFLICT (date, metric_name) DO UPDATE
    SET metric_value = EXCLUDED.metric_value, updated_at = now();

  INSERT INTO analytics_summary (date, metric_name, metric_value, tenant_id)
  SELECT today_date, 'favorites_added', COUNT(*), t_id
  FROM user_actions
  WHERE action_type = 'add_to_favorites' AND DATE(created_at) = today_date
    AND (t_id IS NULL OR tenant_id = t_id)
  ON CONFLICT (date, metric_name) DO UPDATE
    SET metric_value = EXCLUDED.metric_value, updated_at = now();

  INSERT INTO analytics_summary (date, metric_name, metric_value, tenant_id)
  SELECT today_date, 'cart_additions', COUNT(*), t_id
  FROM user_actions
  WHERE action_type = 'add_to_cart' AND DATE(created_at) = today_date
    AND (t_id IS NULL OR tenant_id = t_id)
  ON CONFLICT (date, metric_name) DO UPDATE
    SET metric_value = EXCLUDED.metric_value, updated_at = now();

  INSERT INTO analytics_summary (date, metric_name, metric_value, tenant_id)
  SELECT today_date, 'completed_purchases', COUNT(*), t_id
  FROM user_actions
  WHERE action_type = 'checkout_completed' AND DATE(created_at) = today_date
    AND (t_id IS NULL OR tenant_id = t_id)
  ON CONFLICT (date, metric_name) DO UPDATE
    SET metric_value = EXCLUDED.metric_value, updated_at = now();

  INSERT INTO analytics_summary (date, metric_name, metric_value, tenant_id)
  SELECT today_date, 'new_subscribers', COUNT(*), t_id
  FROM email_subscriptions
  WHERE DATE(created_at) = today_date AND (t_id IS NULL OR tenant_id = t_id)
  ON CONFLICT (date, metric_name) DO UPDATE
    SET metric_value = EXCLUDED.metric_value, updated_at = now();
END;
$function$;
