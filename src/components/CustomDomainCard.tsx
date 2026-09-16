import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import {
  DOMAIN_TARGET_IP,
  REGISTRARS,
  getRegistrar,
  COMMON_DNS_STEPS,
  COMMON_VERIFY_STEPS,
  COMMON_SSL_STEPS,
} from "@/lib/domain-registrars";
import { TenantRecord } from "@/lib/tenant";

const statusLabel: Record<string, string> = {
  none: "Не подключён",
  pending: "Ожидает настройки DNS",
  verifying: "Проверяем записи",
  active: "Подключён",
  failed: "Ошибка подключения",
};

const CopyValue = ({ value }: { value: string }) => (
  <button
    type="button"
    onClick={() => {
      navigator.clipboard.writeText(value);
      toast.success("Скопировано");
    }}
    className="inline-flex items-center gap-2 rounded-md border bg-muted px-3 py-1.5 font-mono text-sm"
  >
    {value}
    <Copy className="h-3.5 w-3.5 opacity-60" />
  </button>
);

const CustomDomainCard = ({
  project,
  onSaved,
}: {
  project: TenantRecord;
  onSaved: () => void;
}) => {
  const [domain, setDomain] = useState(project.custom_domain ?? "");
  const [registrar, setRegistrar] = useState(project.domain_registrar ?? "regru");
  const [saving, setSaving] = useState(false);

  const guide = getRegistrar(registrar);
  const txtValue = `shoplet-verify=${project.domain_verify_token ?? ""}`;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.rpc("set_tenant_domain", {
      _tenant_id: project.id,
      _domain: domain,
      _registrar: registrar,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(domain ? "Домен сохранён. Настройте DNS по инструкции" : "Домен отключён");
    onSaved();
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="mb-3 flex items-center gap-3">
        <Label className="text-base">Свой домен</Label>
        <Badge variant={project.domain_status === "active" ? "default" : "secondary"}>
          {statusLabel[project.domain_status ?? "none"] ?? "Не подключён"}
        </Badge>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <Label htmlFor={`domain-${project.id}`}>Адрес домена</Label>
          <Input
            id={`domain-${project.id}`}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="mystore.ru"
          />
        </div>
        <div className="min-w-[220px] flex-1">
          <Label>Где куплен домен</Label>
          <Select value={registrar} onValueChange={setRegistrar}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите регистратора" />
            </SelectTrigger>
            <SelectContent>
              {REGISTRARS.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <Accordion type="single" collapsible className="mt-4">
        <AccordionItem value="guide">
          <AccordionTrigger>Инструкция для «{guide.name}»</AccordionTrigger>
          <AccordionContent>
            <p className="mb-3 text-sm text-muted-foreground">{guide.panel}</p>
            <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm">
              {guide.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>

            <div className="space-y-3 text-sm">
              <div>
                <p className="mb-1 font-medium">Записи A (имя «@» и «www»), значение:</p>
                <CopyValue value={DOMAIN_TARGET_IP} />
              </div>
              <div>
                <p className="mb-1 font-medium">Запись TXT, имя «_shoplet», значение:</p>
                <CopyValue value={txtValue} />
              </div>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="mb-1 font-medium">DNS-записи — что должно получиться</p>
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {COMMON_DNS_STEPS.map((s, i) => <li key={i}>{s}</li>)}
                  {(guide.dns ?? []).map((s, i) => <li key={`g-${i}`}>{s}</li>)}
                </ul>
              </div>

              <div>
                <p className="mb-1 font-medium">Подтверждение домена</p>
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {(guide.verify ?? []).map((s, i) => <li key={`v-${i}`}>{s}</li>)}
                  {COMMON_VERIFY_STEPS.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              <div>
                <p className="mb-1 font-medium">SSL-сертификат (https)</p>
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {(guide.ssl ?? []).map((s, i) => <li key={`s-${i}`}>{s}</li>)}
                  {COMMON_SSL_STEPS.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>

            {guide.site && (
              <a
                href={guide.site}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm underline"
              >
                Открыть сайт регистратора
              </a>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default CustomDomainCard;
