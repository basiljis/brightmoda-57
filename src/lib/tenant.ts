// Мультитенантность: определение текущего проекта (магазина) по адресу страницы.

export type TenantRecord = {
  id: string;
  slug: string;
  name: string;
  owner_id: string;
  status: string;
  trial_ends_at: string;
};

// Таблицы, данные которых принадлежат конкретному проекту.
export const TENANT_TABLES = new Set<string>([
  'products', 'categories', 'subcategories', 'collections', 'colors', 'sizes',
  'product_colors', 'product_sizes', 'product_color_images', 'product_recommendations',
  'home_page_blocks', 'header_collections', 'header_menu_settings', 'page_content',
  'lookbook_items', 'site_settings', 'seo_settings', 'catalog_display_settings',
  'email_settings', 'delivery_settings', 'yandex_payment_settings',
  'admin_section_visibility', 'orders', 'cart_items', 'favorites',
  'delivery_addresses', 'email_subscriptions', 'page_views', 'user_actions',
  'analytics_summary',
]);

// Пути приложения, которые нельзя использовать как адрес проекта.
export const RESERVED_SLUGS = new Set<string>([
  'admin', 'auth', 'cart', 'catalog', 'product', 'products', 'profile', 'projects',
  'favorites', 'collections', 'lookbook', 'about', 'contacts', 'reset-password',
  'privacy-policy', 'terms-of-use', 'public-offer', 'shipping-payment',
  'returns-exchange', 'api', 'assets', 'static', 'www', 'app',
]);

let activeTenant: TenantRecord | null = null;

export const getActiveTenant = () => activeTenant;
export const getActiveTenantId = () => activeTenant?.id ?? null;
export const setActiveTenant = (tenant: TenantRecord | null) => {
  activeTenant = tenant;
};

export const normalizeSlug = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

/** Первый сегмент пути — кандидат на адрес проекта. */
export const slugCandidateFromPath = (pathname: string): string | null => {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (!segment) return null;
  const slug = normalizeSlug(segment);
  if (!slug || RESERVED_SLUGS.has(slug)) return null;
  return slug;
};

export const isTenantExpired = (tenant: TenantRecord | null) => {
  if (!tenant) return false;
  if (tenant.status === 'active') return false;
  return new Date(tenant.trial_ends_at).getTime() <= Date.now();
};

export const trialDaysLeft = (tenant: TenantRecord | null) => {
  if (!tenant || tenant.status === 'active') return null;
  const ms = new Date(tenant.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};
