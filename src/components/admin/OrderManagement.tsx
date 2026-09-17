import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenant';
import { ExternalLink, Truck, RefreshCw } from 'lucide-react';

const ORDER_STATUSES = [
  { value: 'pending', label: 'В обработке' },
  { value: 'paid', label: 'Оплачен' },
  { value: 'processing', label: 'Комплектуется' },
  { value: 'completed', label: 'Выполнен' },
  { value: 'cancelled', label: 'Отменён' },
];

const DELIVERY_STATUSES = [
  { value: 'not_shipped', label: 'Не отправлен' },
  { value: 'packed', label: 'Собран' },
  { value: 'shipped', label: 'Передан в доставку' },
  { value: 'in_transit', label: 'В пути' },
  { value: 'ready_for_pickup', label: 'Готов к выдаче' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'returned', label: 'Возврат' },
];

const DELIVERY_SERVICES = ['СДЭК', 'Почта России', 'Boxberry', 'Яндекс Доставка', 'Самовывоз', 'Курьер'];

const label = (list: { value: string; label: string }[], v?: string) =>
  list.find((i) => i.value === v)?.label || v || '—';

const OrderManagement = () => {
  const { toast } = useToast();
  const { tenant } = useTenant() as any;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (tenant?.id) query = query.eq('tenant_id', tenant.id);
      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      console.error('Error loading orders:', e);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить заказы', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  const saveOrder = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: any = {
        status: editing.status,
        delivery_status: editing.delivery_status,
        delivery_service: editing.delivery_service || null,
        tracking_number: editing.tracking_number || null,
        tracking_url: editing.tracking_url || null,
        admin_comment: editing.admin_comment || null,
      };
      if (editing.delivery_status === 'shipped' && !editing.shipped_at) payload.shipped_at = new Date().toISOString();
      if (editing.delivery_status === 'delivered' && !editing.delivered_at) payload.delivered_at = new Date().toISOString();

      const { error } = await supabase.from('orders').update(payload).eq('id', editing.id);
      if (error) throw error;
      toast({ title: 'Сохранено', description: 'Заказ обновлён' });
      setEditing(null);
      loadOrders();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Ошибка', description: e.message || 'Не удалось сохранить', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = orders.filter((o) => {
    const okStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.trim().toLowerCase();
    const okSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      (o.tracking_number || '').toLowerCase().includes(q) ||
      JSON.stringify(o.delivery_info || {}).toLowerCase().includes(q);
    return okStatus && okSearch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Заказы</CardTitle>
            <CardDescription>Статусы заказов и отслеживание доставки</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadOrders}>
            <RefreshCw className="h-4 w-4 mr-2" /> Обновить
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 pt-4">
          <Input
            placeholder="Поиск по номеру заказа, треку, получателю"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground py-8 text-center">Загрузка...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">Заказов не найдено</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заказ</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Получатель</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Доставка</TableHead>
                  <TableHead>Трек-номер</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => {
                  const info = (o.delivery_info || {}) as any;
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">#{o.id.slice(0, 8)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{info.recipient_name || info.name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{info.city || info.address_line || ''}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{o.total_amount} ₽</TableCell>
                      <TableCell>
                        <Badge variant={o.status === 'completed' ? 'default' : 'secondary'}>
                          {label(ORDER_STATUSES, o.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                          {label(DELIVERY_STATUSES, o.delivery_status)}
                        </div>
                        {o.delivery_service && (
                          <div className="text-xs text-muted-foreground">{o.delivery_service}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {o.tracking_number ? (
                          o.tracking_url ? (
                            <a
                              href={o.tracking_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 underline"
                            >
                              {o.tracking_number}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            o.tracking_number
                          )
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setEditing({ ...o })}>
                          Изменить
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Заказ #{editing?.id?.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Статус заказа</Label>
                <Select value={editing.status || 'pending'} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Статус доставки</Label>
                <Select
                  value={editing.delivery_status || 'not_shipped'}
                  onValueChange={(v) => setEditing({ ...editing, delivery_status: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DELIVERY_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Служба доставки</Label>
                <Select
                  value={editing.delivery_service || ''}
                  onValueChange={(v) => setEditing({ ...editing, delivery_service: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Выберите службу" /></SelectTrigger>
                  <SelectContent>
                    {DELIVERY_SERVICES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Трек-номер</Label>
                <Input
                  value={editing.tracking_number || ''}
                  onChange={(e) => setEditing({ ...editing, tracking_number: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label>Ссылка для отслеживания</Label>
                <Input
                  value={editing.tracking_url || ''}
                  onChange={(e) => setEditing({ ...editing, tracking_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Комментарий</Label>
                <Textarea
                  value={editing.admin_comment || ''}
                  onChange={(e) => setEditing({ ...editing, admin_comment: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={saveOrder} disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OrderManagement;
