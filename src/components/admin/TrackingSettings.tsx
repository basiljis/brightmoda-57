import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart, Heart, Users, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getActiveTenantId } from '@/lib/tenant';

const TrackingSettings = () => {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    visitsTotal: 0,
    visitsToday: 0,
    uniqueVisitors: 0,
    cartItems: 0,
    favorites: 0,
  });

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('id, analytics_tracking_enabled')
      .maybeSingle();

    if (data) {
      setSettingsId((data as any).id);
      setEnabled((data as any).analytics_tracking_enabled ?? true);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [total, today, sessions, cart, favorites] = await Promise.all([
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
      supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay.toISOString()),
      supabase.from('page_views').select('session_id').limit(1000),
      supabase.from('cart_items').select('quantity'),
      supabase.from('favorites').select('*', { count: 'exact', head: true }),
    ]);

    const uniqueVisitors = new Set(
      (sessions.data || []).map((row: any) => row.session_id).filter(Boolean)
    ).size;

    const cartItems = (cart.data || []).reduce(
      (sum: number, row: any) => sum + (row.quantity || 0),
      0
    );

    setStats({
      visitsTotal: total.count || 0,
      visitsToday: today.count || 0,
      uniqueVisitors,
      cartItems,
      favorites: favorites.count || 0,
    });
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const handleToggle = async (value: boolean) => {
    setEnabled(value);
    try {
      const tenantId = getActiveTenantId();
      if (!tenantId) throw new Error('Магазин не выбран');
      const { error } = await supabase
        .from('site_settings')
        .upsert({ tenant_id: tenantId, analytics_tracking_enabled: value }, { onConflict: 'tenant_id' });
      if (error) throw error;
      toast({
        title: value ? 'Отслеживание включено' : 'Отслеживание выключено',
        description: value
          ? 'Посещения страниц снова записываются'
          : 'Новые посещения не записываются',
      });
    } catch (error) {
      setEnabled(!value);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройку',
        variant: 'destructive',
      });
    }
  };

  const cards = [
    { label: 'Всего посещений', value: stats.visitsTotal, icon: Eye },
    { label: 'Посещений сегодня', value: stats.visitsToday, icon: Eye },
    { label: 'Уникальных посетителей', value: stats.uniqueVisitors, icon: Users },
    { label: 'Товаров в корзинах', value: stats.cartItems, icon: ShoppingCart },
    { label: 'Товаров в избранном', value: stats.favorites, icon: Heart },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Отслеживание посещений</CardTitle>
          <CardDescription>
            Сбор статистики посещений страниц и действий покупателей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="tracking-enabled" className="text-base">
                Записывать посещения
              </Label>
              <p className="text-sm text-muted-foreground">
                При выключении новые посещения и действия не сохраняются
              </p>
            </div>
            <Switch id="tracking-enabled" checked={enabled} onCheckedChange={handleToggle} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Показатели</span>
            <Button variant="outline" size="sm" onClick={loadStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </CardTitle>
          <CardDescription>Текущие данные по сайту</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Icon className="h-4 w-4" />
                    {card.label}
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {loading ? '—' : card.value.toLocaleString('ru-RU')}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingSettings;
