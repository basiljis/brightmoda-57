import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { planTotal } from "@/components/SubscriptionCard";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  months: number;
  price: number;
  discount_percent: number;
  is_active: boolean;
  sort_order: number;
};

type Payment = {
  id: string;
  tenant_id: string;
  total: number;
  amount: number;
  discount_percent: number;
  months: number;
  status: string;
  method: string | null;
  created_at: string;
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  trial_ends_at: string;
  custom_domain: string | null;
  domain_status: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

const emptyPlan = { name: "", description: "", months: 1, price: 0, discount_percent: 0 };

const SuperAdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newPlan, setNewPlan] = useState(emptyPlan);

  const loadAll = async () => {
    const [plansRes, paymentsRes, tenantsRes, profilesRes] = await Promise.all([
      supabase.from("platform_plans").select("*").order("sort_order"),
      supabase.from("tenant_payments").select("*").order("created_at", { ascending: false }),
      supabase
        .from("tenants")
        .select("id, name, slug, status, trial_ends_at, custom_domain, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, email, full_name, phone, role, created_at")
        .order("created_at", { ascending: false }),
    ]);
    setPlans((plansRes.data as Plan[]) ?? []);
    setPayments((paymentsRes.data as Payment[]) ?? []);
    setTenants((tenantsRes.data as Tenant[]) ?? []);
    setProfiles((profilesRes.data as Profile[]) ?? []);
  };

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsPlatformAdmin(false);
        return;
      }
      const { data } = await supabase.rpc("is_platform_admin");
      const ok = Boolean(data);
      setIsPlatformAdmin(ok);
      if (ok) loadAll();
    };
    if (!authLoading) check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  const tenantName = (id: string) => tenants.find((t) => t.id === id)?.name ?? id.slice(0, 8);

  const savePlan = async (plan: Plan) => {
    const { error } = await supabase
      .from("platform_plans")
      .update({
        name: plan.name,
        description: plan.description,
        months: plan.months,
        price: plan.price,
        discount_percent: plan.discount_percent,
        is_active: plan.is_active,
      })
      .eq("id", plan.id);
    if (error) return toast.error(error.message);
    toast.success("Тариф сохранён");
    loadAll();
  };

  const createPlan = async () => {
    if (!newPlan.name) return toast.error("Укажите название тарифа");
    const { error } = await supabase.from("platform_plans").insert({
      ...newPlan,
      sort_order: plans.length + 1,
    });
    if (error) return toast.error(error.message);
    setNewPlan(emptyPlan);
    toast.success("Тариф добавлен");
    loadAll();
  };

  const removePlan = async (id: string) => {
    const { error } = await supabase.from("platform_plans").delete().eq("id", id);
    if (error) return toast.error(error.message);
    loadAll();
  };

  const confirmPayment = async (id: string) => {
    const { error } = await supabase.rpc("confirm_tenant_payment", { _payment_id: id });
    if (error) return toast.error(error.message);
    toast.success("Оплата подтверждена, подписка продлена");
    loadAll();
  };

  const cancelPayment = async (id: string) => {
    const { error } = await supabase.from("tenant_payments").update({ status: "cancelled" }).eq("id", id);
    if (error) return toast.error(error.message);
    loadAll();
  };

  const setTenantStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("tenants").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Статус проекта обновлён");
    loadAll();
  };

  if (authLoading || isPlatformAdmin === null) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Загрузка…</div>;
  }

  if (!isPlatformAdmin) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-semibold">Доступ ограничен</h1>
        <p className="mb-6 text-muted-foreground">Этот раздел доступен только владельцу платформы.</p>
        <Button asChild>
          <Link to="/">На главную</Link>
        </Button>
      </div>
    );
  }

  const revenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.total), 0);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-semibold">Управление платформой</h1>
      <p className="mb-8 text-muted-foreground">
        Проектов: {tenants.length} · Пользователей: {profiles.length} · Поступления:{" "}
        {revenue.toLocaleString("ru-RU")} ₽
      </p>

      <Tabs defaultValue="payments">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="payments">Платежи</TabsTrigger>
          <TabsTrigger value="plans">Тарифы и скидки</TabsTrigger>
          <TabsTrigger value="tenants">Проекты</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{tenantName(p.tenant_id)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(p.created_at).toLocaleString("ru-RU")} · {p.months} мес. ·{" "}
                    {Number(p.total).toLocaleString("ru-RU")} ₽
                    {p.discount_percent > 0 && ` (скидка ${p.discount_percent}%)`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "paid" ? "default" : "secondary"}>
                    {p.status === "paid" ? "Оплачен" : p.status === "cancelled" ? "Отменён" : "Ожидает"}
                  </Badge>
                  {p.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => confirmPayment(p.id)}>
                        Подтвердить
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => cancelPayment(p.id)}>
                        Отменить
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {payments.length === 0 && <p className="text-muted-foreground">Платежей пока нет.</p>}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {plans.map((plan, index) => (
            <Card key={plan.id}>
              <CardContent className="grid gap-3 py-4 md:grid-cols-6 md:items-end">
                <div className="md:col-span-2">
                  <Label>Название</Label>
                  <Input
                    value={plan.name}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, name: e.target.value };
                      setPlans(next);
                    }}
                  />
                </div>
                <div>
                  <Label>Месяцев</Label>
                  <Input
                    type="number"
                    value={plan.months}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, months: Number(e.target.value) };
                      setPlans(next);
                    }}
                  />
                </div>
                <div>
                  <Label>Цена, ₽</Label>
                  <Input
                    type="number"
                    value={plan.price}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, price: Number(e.target.value) };
                      setPlans(next);
                    }}
                  />
                </div>
                <div>
                  <Label>Скидка, %</Label>
                  <Input
                    type="number"
                    value={plan.discount_percent}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, discount_percent: Number(e.target.value) };
                      setPlans(next);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={plan.is_active}
                    onCheckedChange={(v) => {
                      const next = [...plans];
                      next[index] = { ...plan, is_active: v };
                      setPlans(next);
                    }}
                  />
                  <span className="text-sm">Активен</span>
                </div>
                <div className="md:col-span-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Итого к оплате: {planTotal(plan.price, plan.discount_percent).toLocaleString("ru-RU")} ₽
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => savePlan(plan)}>
                      Сохранить
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removePlan(plan.id)}>
                      Удалить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Новый тариф</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-5 md:items-end">
              <div className="md:col-span-2">
                <Label>Название</Label>
                <Input value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} />
              </div>
              <div>
                <Label>Месяцев</Label>
                <Input
                  type="number"
                  value={newPlan.months}
                  onChange={(e) => setNewPlan({ ...newPlan, months: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Цена, ₽</Label>
                <Input
                  type="number"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Скидка, %</Label>
                <Input
                  type="number"
                  value={newPlan.discount_percent}
                  onChange={(e) => setNewPlan({ ...newPlan, discount_percent: Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-5">
                <Button onClick={createPlan}>Добавить тариф</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-3">
          {tenants.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-muted-foreground">
                    /{t.slug}
                    {t.custom_domain ? ` · ${t.custom_domain}` : ""} · создан{" "}
                    {new Date(t.created_at).toLocaleDateString("ru-RU")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Оплачен до {new Date(t.trial_ends_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.status === "active" ? "default" : "secondary"}>
                    {t.status === "active" ? "Активен" : "Пробный"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setTenantStatus(t.id, "active")}>
                    Активировать
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setTenantStatus(t.id, "trial")}>
                    Заблокировать
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/${t.slug}`}>Открыть</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {tenants.length === 0 && <p className="text-muted-foreground">Проектов пока нет.</p>}
        </TabsContent>

        <TabsContent value="users" className="space-y-3">
          {profiles.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{p.full_name || p.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.email}
                    {p.phone ? ` · ${p.phone}` : ""} · регистрация{" "}
                    {new Date(p.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <Badge variant="secondary">{p.role}</Badge>
              </CardContent>
            </Card>
          ))}
          {profiles.length === 0 && <p className="text-muted-foreground">Пользователей пока нет.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminPage;
