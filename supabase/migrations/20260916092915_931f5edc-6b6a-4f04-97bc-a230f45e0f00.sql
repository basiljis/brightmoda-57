
CREATE TABLE IF NOT EXISTS public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid());
$$;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated, service_role;

CREATE POLICY "platform_admins_read" ON public.platform_admins
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_platform_admin());
CREATE POLICY "platform_admins_manage" ON public.platform_admins
  FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

INSERT INTO public.platform_admins (user_id)
SELECT owner_id FROM public.tenants WHERE slug = 'shoplet'
ON CONFLICT (user_id) DO NOTHING;

-- Тарифы
CREATE TABLE IF NOT EXISTS public.platform_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  months integer NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0,
  discount_percent integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.platform_plans TO authenticated;
GRANT ALL ON public.platform_plans TO service_role;
ALTER TABLE public.platform_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON public.platform_plans FOR SELECT USING (true);
CREATE POLICY "plans_admin_manage" ON public.platform_plans
  FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE TRIGGER update_platform_plans_updated_at BEFORE UPDATE ON public.platform_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.platform_plans (name, description, months, price, discount_percent, sort_order)
SELECT * FROM (VALUES
  ('Месяц', 'Подписка на 1 месяц', 1, 2900, 0, 1),
  ('Полгода', 'Подписка на 6 месяцев', 6, 17400, 10, 2),
  ('Год', 'Подписка на 12 месяцев', 12, 34800, 20, 3)
) v(name, description, months, price, discount_percent, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.platform_plans);

-- Платежи по подписке
CREATE TABLE IF NOT EXISTS public.tenant_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.platform_plans(id),
  user_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  discount_percent integer NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  months integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  method text,
  comment text,
  paid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.tenant_payments TO authenticated;
GRANT UPDATE, DELETE ON public.tenant_payments TO authenticated;
GRANT ALL ON public.tenant_payments TO service_role;
ALTER TABLE public.tenant_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_owner_read" ON public.tenant_payments
  FOR SELECT TO authenticated
  USING (public.is_platform_admin() OR public.can_manage_tenant(tenant_id));
CREATE POLICY "payments_owner_create" ON public.tenant_payments
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_tenant(tenant_id) AND user_id = auth.uid() AND status = 'pending');
CREATE POLICY "payments_admin_manage" ON public.tenant_payments
  FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE TRIGGER update_tenant_payments_updated_at BEFORE UPDATE ON public.tenant_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Глобальный администратор видит все проекты
CREATE POLICY "platform_admin_view_tenants" ON public.tenants
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY "platform_admin_update_tenants" ON public.tenants
  FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

-- Подтверждение оплаты: продлевает подписку проекта
CREATE OR REPLACE FUNCTION public.confirm_tenant_payment(_payment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p record;
  base timestamptz;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Недостаточно прав';
  END IF;

  SELECT * INTO p FROM public.tenant_payments WHERE id = _payment_id;
  IF p IS NULL THEN RAISE EXCEPTION 'Платёж не найден'; END IF;

  SELECT GREATEST(now(), trial_ends_at) INTO base FROM public.tenants WHERE id = p.tenant_id;

  UPDATE public.tenants
    SET status = 'active', trial_ends_at = base + (p.months || ' months')::interval
    WHERE id = p.tenant_id;

  UPDATE public.tenant_payments
    SET status = 'paid', paid_until = base + (p.months || ' months')::interval
    WHERE id = _payment_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.confirm_tenant_payment(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.confirm_tenant_payment(uuid) TO authenticated;

-- Список зарегистрированных пользователей для глобального администратора
CREATE POLICY "platform_admin_view_profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_platform_admin());
