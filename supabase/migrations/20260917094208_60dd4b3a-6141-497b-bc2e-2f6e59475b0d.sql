ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_service text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'not_shipped',
  ADD COLUMN IF NOT EXISTS admin_comment text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

DROP POLICY IF EXISTS tenant_admins_update_orders ON public.orders;
CREATE POLICY tenant_admins_update_orders ON public.orders
  FOR UPDATE TO authenticated
  USING (public.can_manage_tenant(tenant_id))
  WITH CHECK (public.can_manage_tenant(tenant_id));