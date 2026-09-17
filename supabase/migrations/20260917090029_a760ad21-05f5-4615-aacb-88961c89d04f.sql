
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_slug_key;
ALTER TABLE public.colors DROP CONSTRAINT IF EXISTS colors_name_key;
ALTER TABLE public.sizes DROP CONSTRAINT IF EXISTS sizes_name_key;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_sku_key;
ALTER TABLE public.analytics_summary DROP CONSTRAINT IF EXISTS analytics_summary_date_metric_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS categories_tenant_name_key ON public.categories (tenant_id, name);
CREATE UNIQUE INDEX IF NOT EXISTS categories_tenant_slug_key ON public.categories (tenant_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS collections_tenant_slug_key ON public.collections (tenant_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS colors_tenant_name_key ON public.colors (tenant_id, name);
CREATE UNIQUE INDEX IF NOT EXISTS sizes_tenant_name_key ON public.sizes (tenant_id, name);
CREATE UNIQUE INDEX IF NOT EXISTS products_tenant_sku_key ON public.products (tenant_id, sku) WHERE sku IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS analytics_summary_tenant_date_metric_key ON public.analytics_summary (tenant_id, date, metric_name);
