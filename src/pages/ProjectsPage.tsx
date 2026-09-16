import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { normalizeSlug, RESERVED_SLUGS, TenantRecord, TENANT_SELECT } from "@/lib/tenant";
import CustomDomainCard from "@/components/CustomDomainCard";
import SubscriptionCard from "@/components/SubscriptionCard";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<TenantRecord[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("tenants")
      .select(TENANT_SELECT)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setProjects((data as TenantRecord[]) ?? []);
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = normalizeSlug(slug || name);

    if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(finalSlug)) {
      toast.error("Адрес может содержать только латинские буквы, цифры и дефис (от 3 символов)");
      return;
    }
    if (RESERVED_SLUGS.has(finalSlug)) {
      toast.error("Этот адрес зарезервирован, выберите другой");
      return;
    }

    setLoading(true);
    const { error } = await supabase.rpc("create_tenant", {
      _slug: finalSlug,
      _name: name || finalSlug,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Проект создан. Пробный период — 7 дней");
    setName("");
    setSlug("");
    loadProjects();
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Мои проекты</h1>
        <p className="mb-6 text-muted-foreground">Войдите, чтобы создать свой магазин.</p>
        <Button asChild>
          <Link to="/auth">Войти</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-semibold">Мои проекты</h1>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Создать новый проект</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="project-name">Название проекта</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Мой магазин"
                required
              />
            </div>
            <div>
              <Label htmlFor="project-slug">Адрес проекта</Label>
              <Input
                id="project-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="nameproject"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Сайт будет доступен по адресу /{normalizeSlug(slug || name) || "nameproject"}
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Создание..." : "Создать проект (7 дней бесплатно)"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {projects.map((p) => {
          const daysLeft = Math.max(
            0,
            Math.ceil((new Date(p.trial_ends_at).getTime() - Date.now()) / 86400000)
          );
          return (
            <Card key={p.id}>
              <CardContent className="py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">/{p.slug}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.status === "active"
                      ? "Активен"
                      : daysLeft > 0
                        ? `Пробный период: осталось ${daysLeft} дн.`
                        : "Пробный период завершён — только просмотр"}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <a href={p.custom_domain ? `https://${p.custom_domain}` : `/${p.slug}`}>Открыть</a>
                </Button>
                </div>
                <CustomDomainCard project={p} onSaved={loadProjects} />
                <SubscriptionCard project={p} />
              </CardContent>
            </Card>
          );
        })}
        {projects.length === 0 && (
          <p className="text-muted-foreground">У вас пока нет проектов.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
