import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TenantRecord } from "@/lib/tenant";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  months: number;
  price: number;
  discount_percent: number;
};

type Payment = {
  id: string;
  total: number;
  status: string;
  months: number;
  created_at: string;
};

export const planTotal = (price: number, discount: number) =>
  Math.round(Number(price) * (1 - Number(discount || 0) / 100));

const statusLabel: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  cancelled: "Отменён",
};

const SubscriptionCard = ({ project }: { project: TenantRecord }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: plansData }, { data: paymentsData }] = await Promise.all([
      supabase
        .from("platform_plans")
        .select("id, name, description, months, price, discount_percent")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("tenant_payments")
        .select("id, total, status, months, created_at")
        .eq("tenant_id", project.id)
        .order("created_at", { ascending: false }),
    ]);
    setPlans((plansData as Plan[]) ?? []);
    setPayments((paymentsData as Payment[]) ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const handleOrder = async (plan: Plan) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("tenant_payments").insert({
      tenant_id: project.id,
      plan_id: plan.id,
      user_id: user.id,
      amount: plan.price,
      discount_percent: plan.discount_percent,
      total: planTotal(plan.price, plan.discount_percent),
      months: plan.months,
      status: "pending",
      method: "manual",
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Заявка на оплату создана. После подтверждения оплаты подписка продлится автоматически.");
    load();
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">Подписка</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {plans.map((plan) => {
            const total = planTotal(plan.price, plan.discount_percent);
            return (
              <div key={plan.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{plan.name}</p>
                  {plan.discount_percent > 0 && (
                    <Badge variant="secondary">−{plan.discount_percent}%</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-2 text-lg font-semibold">
                  {total.toLocaleString("ru-RU")} ₽
                  {plan.discount_percent > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                      {Number(plan.price).toLocaleString("ru-RU")} ₽
                    </span>
                  )}
                </p>
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  disabled={saving}
                  onClick={() => handleOrder(plan)}
                >
                  Оплатить
                </Button>
              </div>
            );
          })}
          {plans.length === 0 && (
            <p className="text-sm text-muted-foreground">Тарифы пока не настроены.</p>
          )}
        </div>

        {payments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">История платежей</p>
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <span>
                  {new Date(p.created_at).toLocaleDateString("ru-RU")} · {p.months} мес. ·{" "}
                  {Number(p.total).toLocaleString("ru-RU")} ₽
                </span>
                <Badge variant={p.status === "paid" ? "default" : "secondary"}>
                  {statusLabel[p.status] ?? p.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
