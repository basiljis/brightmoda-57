ALTER TABLE public.site_settings ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.catalog_display_settings ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.header_menu_settings ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.delivery_settings ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.email_settings ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.yandex_payment_settings ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.seo_settings ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE public.admin_section_visibility ALTER COLUMN tenant_id DROP DEFAULT;

ALTER TABLE public.site_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.catalog_display_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.header_menu_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.delivery_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.email_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.yandex_payment_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.seo_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.admin_section_visibility ALTER COLUMN tenant_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS catalog_display_settings_tenant_unique ON public.catalog_display_settings (tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS header_menu_settings_tenant_unique ON public.header_menu_settings (tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS delivery_settings_tenant_unique ON public.delivery_settings (tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS email_settings_tenant_unique ON public.email_settings (tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS yandex_payment_settings_tenant_unique ON public.yandex_payment_settings (tenant_id);

ALTER TABLE public.seo_settings DROP CONSTRAINT IF EXISTS seo_settings_page_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS seo_settings_tenant_page_unique ON public.seo_settings (tenant_id, page_name);

ALTER TABLE public.admin_section_visibility DROP CONSTRAINT IF EXISTS admin_section_visibility_user_id_section_name_key;
ALTER TABLE public.admin_section_visibility ADD CONSTRAINT admin_section_visibility_tenant_user_section_key UNIQUE (tenant_id, user_id, section_name);

CREATE OR REPLACE FUNCTION public.create_tenant(_slug text, _name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.site_settings (tenant_id) VALUES (new_id);
  INSERT INTO public.catalog_display_settings (tenant_id) VALUES (new_id);
  INSERT INTO public.header_menu_settings (tenant_id) VALUES (new_id);
  INSERT INTO public.delivery_settings (tenant_id) VALUES (new_id);
  INSERT INTO public.email_settings (tenant_id) VALUES (new_id);
  INSERT INTO public.yandex_payment_settings (tenant_id) VALUES (new_id);
  INSERT INTO public.seo_settings (tenant_id, page_name, is_active)
  VALUES (new_id, 'home', true);

  RETURN new_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_tenant(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_tenant(text, text) TO authenticated;