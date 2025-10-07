import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface MenuItem {
  id: string;
  page_name: string;
  section_name: string;
  menu_label?: string;
  content_value: string;
  menu_location: 'none' | 'header' | 'footer' | 'both';
  display_order: number;
  is_active: boolean;
}

export default function MenuManagement() {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'header' | 'footer'>('all');
  const [search, setSearch] = useState('');
  const SYSTEM_PAGES = useMemo(() => new Set(['home', 'catalog', 'about', 'contacts']), []);
  const isSystem = (pageName?: string | null) => !!pageName && SYSTEM_PAGES.has(pageName);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('id, page_name, section_name, menu_label, content_value, menu_location, display_order, is_active')
        .in('menu_location', ['header', 'footer', 'both'])
        .order('page_name', { ascending: true })
        .order('display_order', { ascending: true });
      if (error) throw error;
      setItems((data as any) || []);
    } catch (e) {
      console.error(e);
    }
  };

  const grouped = useMemo(() => {
    const list = items.filter(i => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        i.page_name?.toLowerCase().includes(q) ||
        i.menu_label?.toLowerCase().includes(q) ||
        i.section_name?.toLowerCase().includes(q)
      );
    }).filter(i => filter === 'all' ? true : filter === 'header' ? (i.menu_location === 'header' || i.menu_location === 'both') : (i.menu_location === 'footer' || i.menu_location === 'both'));
    return list.reduce((acc: Record<string, MenuItem[]>, it) => {
      const key = it.page_name || 'misc';
      acc[key] = acc[key] || [];
      acc[key].push(it);
      return acc;
    }, {});
  }, [items, filter, search]);

  const updateItem = async (patch: Partial<MenuItem> & { id: string }) => {
    setItems(prev => prev.map(it => it.id === patch.id ? { ...it, ...patch } : it));
  };

  const persistItem = async (item: MenuItem) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('page_content')
        .update({
          page_name: item.page_name,
          menu_label: item.menu_label || null,
          content_value: item.content_value,
          menu_location: item.menu_location,
          display_order: item.display_order,
          is_active: item.is_active
        })
        .eq('id', item.id);
      if (error) throw error;
      toast({ title: 'Сохранено', description: 'Пункт меню обновлён' });
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить пункт меню', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const move = async (item: MenuItem, dir: -1 | 1) => {
    const group = items.filter(i => i.page_name === item.page_name);
    const idx = group.findIndex(i => i.id === item.id);
    const target = group[idx + dir];
    if (!target) return;
    await persistItem({ ...item, display_order: target.display_order } as MenuItem);
    await persistItem({ ...target, display_order: item.display_order } as MenuItem);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1 space-y-2">
          <Label>Поиск</Label>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию, группе..." />
        </div>
        <div className="space-y-2">
          <Label>Область</Label>
          <Select value={filter} onValueChange={v => setFilter(v as any)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Шапка и Подвал</SelectItem>
              <SelectItem value="header">Только Шапка</SelectItem>
              <SelectItem value="footer">Только Подвал</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {Object.entries(grouped).map(([group, list]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="text-base">Группа: {group}</CardTitle>
            <CardDescription>Элементы, объединённые по page_name</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {list.map((it, index) => (
              <div key={it.id} className="border rounded-lg p-3">
                <div className="grid md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Группа</Label>
                    <Input 
                      value={it.page_name} 
                      onChange={e => !isSystem(it.page_name) && updateItem({ id: it.id, page_name: e.target.value })}
                      disabled={isSystem(it.page_name)}
                      title={isSystem(it.page_name) ? 'Системная страница — изменение группы запрещено' : ''}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Подпись</Label>
                    <Input value={it.menu_label || ''} onChange={e => updateItem({ id: it.id, menu_label: e.target.value })} placeholder={it.section_name} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Ссылка</Label>
                    <Input 
                      value={it.content_value} 
                      onChange={e => !isSystem(it.page_name) && updateItem({ id: it.id, content_value: e.target.value })} 
                      placeholder="/about, https://..." 
                      disabled={isSystem(it.page_name)}
                      title={isSystem(it.page_name) ? 'Системная страница — изменение ссылок запрещено' : ''}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Расположение</Label>
                    <Select value={it.menu_location} onValueChange={v => updateItem({ id: it.id, menu_location: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Скрыто</SelectItem>
                        <SelectItem value="header">Шапка</SelectItem>
                        <SelectItem value="footer">Подвал</SelectItem>
                        <SelectItem value="both">Шапка и Подвал</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Порядок</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => move(it, -1)} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => move(it, 1)} disabled={index === list.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                      <span className="text-xs text-muted-foreground ml-2">{it.display_order}</span>
                    </div>
                  </div>
                  <div className="md:col-span-1 space-y-1">
                    <Label className="text-xs">Активно</Label>
                    <div className="flex items-center h-10">
                      <Switch checked={it.is_active} onCheckedChange={(v) => updateItem({ id: it.id, is_active: v })} />
                    </div>
                  </div>
                  <div className="md:col-span-1 flex items-center justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => persistItem(items.find(x => x.id === it.id)!)} title="Сохранить"><Save className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}



