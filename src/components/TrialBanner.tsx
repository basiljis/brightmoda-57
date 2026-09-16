import { useTenant } from "@/hooks/useTenant";

export const TrialBanner = () => {
  const { tenant, isReadOnly, daysLeft } = useTenant();

  if (!tenant || tenant.status === "active") return null;

  if (isReadOnly) {
    return (
      <div className="w-full bg-destructive px-4 py-2 text-center text-sm text-destructive-foreground">
        Пробный период проекта «{tenant.name}» завершён. Сайт работает в режиме просмотра — изменения недоступны.
      </div>
    );
  }

  return (
    <div className="w-full bg-secondary px-4 py-2 text-center text-sm text-secondary-foreground">
      Пробный период проекта «{tenant.name}»: осталось {daysLeft}{" "}
      {daysLeft === 1 ? "день" : daysLeft && daysLeft < 5 ? "дня" : "дней"}.
    </div>
  );
};
