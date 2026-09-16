
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS custom_domain text,
  ADD COLUMN IF NOT EXISTS domain_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS domain_registrar text,
  ADD COLUMN IF NOT EXISTS domain_verify_token text NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex');

CREATE UNIQUE INDEX IF NOT EXISTS tenants_custom_domain_key
  ON public.tenants (lower(custom_domain)) WHERE custom_domain IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_tenant_domain(_tenant_id uuid, _domain text, _registrar text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  norm text := lower(trim(both '/' from regexp_replace(coalesce(_domain, ''), '^https?://', '')));
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Нет прав на этот проект';
  END IF;

  IF norm = '' THEN
    UPDATE public.tenants
      SET custom_domain = NULL, domain_status = 'none', domain_registrar = NULL
      WHERE id = _tenant_id;
    RETURN;
  END IF;

  IF norm !~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$' THEN
    RAISE EXCEPTION 'Некорректный домен';
  END IF;

  IF EXISTS (SELECT 1 FROM public.tenants WHERE lower(custom_domain) = norm AND id <> _tenant_id) THEN
    RAISE EXCEPTION 'Этот домен уже подключён к другому проекту';
  END IF;

  UPDATE public.tenants
    SET custom_domain = norm,
        domain_registrar = _registrar,
        domain_status = 'pending'
    WHERE id = _tenant_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_tenant_domain(uuid, text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.set_tenant_domain(uuid, text, text) TO authenticated;
