
-- 1. Tenants
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  owner_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'trial',
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tenant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

GRANT SELECT ON public.tenants TO anon;
GRANT SELECT, INSERT, UPDATE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_members TO authenticated;
GRANT ALL ON public.tenant_members TO service_role;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Helper functions
CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = _tenant_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.tenant_is_active(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenants t
    WHERE t.id = _tenant_id
      AND (t.status = 'active' OR (t.status = 'trial' AND t.trial_ends_at > now()))
  );
$$;

-- can edit content of a tenant: platform admin, or tenant owner/admin while tenant not expired
CREATE OR REPLACE FUNCTION public.can_edit_tenant(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    public.get_current_user_role() = 'admin'
    OR (
      public.tenant_is_active(_tenant_id)
      AND EXISTS (
        SELECT 1 FROM public.tenant_members m
        WHERE m.tenant_id = _tenant_id
          AND m.user_id = auth.uid()
          AND m.role IN ('owner', 'admin')
      )
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_tenant_member(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_tenant(uuid) FROM anon;

-- 3. Policies on tenancy tables
CREATE POLICY "Anyone can view tenants" ON public.tenants
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own tenant" ON public.tenants
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their tenant" ON public.tenants
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
  WITH CHECK (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

CREATE POLICY "Members can view their memberships" ON public.tenant_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.get_current_user_role() = 'admin');

CREATE POLICY "Owners manage memberships" ON public.tenant_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.get_current_user_role() = 'admin'
    OR EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND t.owner_id = auth.uid())
  );

CREATE POLICY "Owners delete memberships" ON public.tenant_members
  FOR DELETE TO authenticated
  USING (
    public.get_current_user_role() = 'admin'
    OR EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = tenant_id AND t.owner_id = auth.uid())
  );

-- 4. Default tenant for existing data
INSERT INTO public.tenants (slug, name, owner_id, status, trial_ends_at)
SELECT 'shoplet', 'Shoplet',
       COALESCE((SELECT user_id FROM public.profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1),
                '00000000-0000-0000-0000-000000000000'::uuid),
       'active', now() + interval '100 years';

INSERT INTO public.tenant_members (tenant_id, user_id, role)
SELECT (SELECT id FROM public.tenants WHERE slug = 'shoplet'), p.user_id, 'owner'
FROM public.profiles p WHERE p.role = 'admin'
ON CONFLICT DO NOTHING;

-- 5. Add tenant_id to content tables, backfill, guard writes
DO $$
DECLARE
  t text;
  default_tenant uuid;
  tables text[] := ARRAY[
    'products','categories','subcategories','collections','colors','sizes',
    'product_colors','product_sizes','product_color_images','product_recommendations',
    'home_page_blocks','header_collections','header_menu_settings','page_content',
    'lookbook_items','site_settings','seo_settings','catalog_display_settings',
    'email_settings','delivery_settings','yandex_payment_settings',
    'admin_section_visibility','orders','cart_items','favorites','delivery_addresses',
    'email_subscriptions','page_views','user_actions','analytics_summary'
  ];
BEGIN
  SELECT id INTO default_tenant FROM public.tenants WHERE slug = 'shoplet';

  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE', t);
    EXECUTE format('UPDATE public.%I SET tenant_id = %L WHERE tenant_id IS NULL', t, default_tenant);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET DEFAULT %L', t, default_tenant);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (tenant_id)', 'idx_' || t || '_tenant_id', t);
  END LOOP;

  -- restrictive write guard on store-content tables only (user-owned tables keep their own rules)
  FOREACH t IN ARRAY ARRAY[
    'products','categories','subcategories','collections','colors','sizes',
    'product_colors','product_sizes','product_color_images','product_recommendations',
    'home_page_blocks','header_collections','header_menu_settings','page_content',
    'lookbook_items','site_settings','seo_settings','catalog_display_settings',
    'email_settings','delivery_settings','yandex_payment_settings','admin_section_visibility'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "tenant_write_guard" ON public.%I', t);
    EXECUTE format($f$CREATE POLICY "tenant_write_guard" ON public.%I AS RESTRICTIVE FOR ALL TO authenticated
      USING (tenant_id IS NULL OR public.can_edit_tenant(tenant_id))
      WITH CHECK (tenant_id IS NOT NULL AND public.can_edit_tenant(tenant_id))$f$, t);
  END LOOP;
END $$;

-- 6. Self-service tenant creation with 7-day trial
CREATE OR REPLACE FUNCTION public.create_tenant(_slug text, _name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_id uuid;
  norm_slug text := lower(regexp_replace(trim(_slug), '[^a-zA-Z0-9-]', '-', 'g'));
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Требуется вход в систему';
  END IF;
  IF norm_slug !~ '^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$' THEN
    RAISE EXCEPTION 'Недопустимый адрес проекта';
  END IF;
  IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = norm_slug) THEN
    RAISE EXCEPTION 'Такой адрес уже занят';
  END IF;

  INSERT INTO public.tenants (slug, name, owner_id, status, trial_ends_at)
  VALUES (norm_slug, COALESCE(NULLIF(trim(_name), ''), norm_slug), auth.uid(), 'trial', now() + interval '7 days')
  RETURNING id INTO new_id;

  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (new_id, auth.uid(), 'owner');

  RETURN new_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_tenant(text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_tenant(text, text) TO authenticated;
