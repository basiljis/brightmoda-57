import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TenantRecord,
  getActiveTenant,
  isTenantExpired,
  setActiveTenant,
  slugCandidateFromPath,
  trialDaysLeft,
  TENANT_SELECT,
} from "@/lib/tenant";

type TenantContextValue = {
  tenant: TenantRecord | null;
  basePath: string;
  isReadOnly: boolean;
  daysLeft: number | null;
  refresh: () => Promise<void>;
};

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  basePath: "",
  isReadOnly: false,
  daysLeft: null,
  refresh: async () => {},
});

export const useTenant = () => useContext(TenantContext);

/** Находит проект по первому сегменту адреса, иначе — проект по умолчанию. */
export const resolveTenant = async (pathname: string): Promise<TenantRecord | null> => {
  // 1. Собственный домен магазина имеет приоритет над адресом вида /nameproject.
  const host = window.location.hostname.toLowerCase().replace(/^www\./, "");
  if (!/(^|\.)lovable\.app$/.test(host) && host !== "localhost" && !/^\d+(\.\d+){3}$/.test(host)) {
    const { data: byDomain } = await supabase
      .from("tenants")
      .select(TENANT_SELECT)
      .eq("custom_domain", host)
      .maybeSingle();
    if (byDomain) {
      setActiveTenant(byDomain as TenantRecord);
      return byDomain as TenantRecord;
    }
  }

  const slug = slugCandidateFromPath(pathname);
  const targetSlug = slug ?? "shoplet";

  const { data } = await supabase
    .from("tenants")
    .select(TENANT_SELECT)
    .eq("slug", targetSlug)
    .maybeSingle();

  if (data) {
    setActiveTenant(data as TenantRecord);
    return data as TenantRecord;
  }

  if (slug) {
    // Неизвестный сегмент — это обычная страница проекта по умолчанию.
    const { data: fallback } = await supabase
      .from("tenants")
      .select(TENANT_SELECT)
      .eq("slug", "shoplet")
      .maybeSingle();
    setActiveTenant((fallback as TenantRecord) ?? null);
    return (fallback as TenantRecord) ?? null;
  }

  setActiveTenant(null);
  return null;
};

export const TenantProvider = ({
  children,
  initialTenant,
}: {
  children: ReactNode;
  initialTenant: TenantRecord | null;
}) => {
  const [tenant, setTenant] = useState<TenantRecord | null>(initialTenant ?? getActiveTenant());

  useEffect(() => {
    setActiveTenant(tenant);
  }, [tenant]);

  const refresh = async () => {
    if (!tenant) return;
    const { data } = await supabase
      .from("tenants")
      .select(TENANT_SELECT)
      .eq("id", tenant.id)
      .maybeSingle();
    if (data) {
      setActiveTenant(data as TenantRecord);
      setTenant(data as TenantRecord);
    }
  };

  const slugInPath = slugCandidateFromPath(window.location.pathname);
  const basePath = tenant && slugInPath === tenant.slug ? `/${tenant.slug}` : "";

  return (
    <TenantContext.Provider
      value={{
        tenant,
        basePath,
        isReadOnly: isTenantExpired(tenant),
        daysLeft: trialDaysLeft(tenant),
        refresh,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};
