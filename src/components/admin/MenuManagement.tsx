import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Edit, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  id: string;
  page_name: string;
  section_name: string;
  menu_label?: string;
  content_value: string;
  menu_location: 'none' | 'header' | 'footer' | 'both';
  display_order: number;
  is_active: boolean;
  parent_id?: string | null;
  children?: MenuItem[];
}

const EXCLUDED_PAGES = ['home', 'cart', 'profile', 'favorites'];

export default function MenuManagement() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'header' | 'footer'>('all');
  const [search, setSearch] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemLocation, setNewItemLocation] = useState<'header' | 'footer' | 'both'>('header');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .in('menu_location', ['header', 'footer', 'both'])
        .not('page_name', 'in', `(${EXCLUDED_PAGES.join(',')})`)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      // Build hierarchy
      const itemsMap = new Map<string, MenuItem>();
      const rootItems: MenuItem[] = [];
      
      (data || []).forEach((item: any) => {
        itemsMap.set(item.id, { ...item, children: [] });
      });
      
      itemsMap.forEach((item) => {
        if (item.parent_id) {
          const parent = itemsMap.get(item.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(item);
          } else {
            rootItems.push(item);
          }
        } else {
          rootItems.push(item);
        }
      });
      
      setItems(rootItems);
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить меню', variant: 'destructive' });
    }
  };

  const filteredItems = items.filter(item => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches = (i: MenuItem): boolean => {
        const directMatch = i.page_name?.toLowerCase().includes(q) ||
          i.menu_label?.toLowerCase().includes(q) ||
          i.section_name?.toLowerCase().includes(q);
        const childMatch = i.children?.some(matches) || false;
        return directMatch || childMatch;
      };
      if (!matches(item)) return false;
    }
    
    if (filter === 'all') return true;
    return item.menu_location === filter || item.menu_location === 'both';
  });

  const createNewItem = async () => {
    if (!newItemName.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите название пункта меню', variant: 'destructive' });
      return;
    }
    
    try {
      setLoading(true);
      const maxOrder = items.reduce((max, item) => Math.max(max, item.display_order), 0);
      
      const { data, error } = await supabase
        .from('page_content')
        .insert({
          page_name: newItemName.toLowerCase().replace(/\s+/g, '_'),
          section_name: 'menu_item',
          menu_label: newItemName,
          content_value: `/${newItemName.toLowerCase().replace(/\s+/g, '-')}`,
          menu_location: newItemLocation,
          display_order: maxOrder + 1,
          is_active: true,
          content_type: 'link'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({ title: 'Создано', description: 'Новый пункт меню создан' });
      setNewItemName('');
      load();
      
      // Navigate to page editor
      if (data) {
        navigate(`/admin?tab=content-pages&page=${data.page_name}`);
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось создать пункт меню', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createSubItem = async (parentId: string, parentItem: MenuItem) => {
    const name = prompt('Введите название подраздела:');
    if (!name?.trim()) return;
    
    try {
      setLoading(true);
      const maxOrder = (parentItem.children || []).reduce((max, child) => Math.max(max, child.display_order), parentItem.display_order);
      
      const { data, error } = await supabase
        .from('page_content')
        .insert({
          page_name: parentItem.page_name,
          section_name: 'submenu_item',
          menu_label: name,
          content_value: `${parentItem.content_value}/${name.toLowerCase().replace(/\s+/g, '-')}`,
          menu_location: parentItem.menu_location,
          display_order: maxOrder + 1,
          parent_id: parentId,
          is_active: true,
          content_type: 'link'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({ title: 'Создано', description: 'Подраздел добавлен' });
      load();
      
      // Navigate to page editor
      if (data) {
        navigate(`/admin?tab=content-pages&page=${data.page_name}&section=${data.section_name}`);
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось создать подраздел', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (id: string, patch: Partial<MenuItem>) => {
    setItems(prev => {
      const update = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.id === id) {
            return { ...item, ...patch };
          }
          if (item.children) {
            return { ...item, children: update(item.children) };
          }
          return item;
        });
      };
      return update(prev);
    });
  };

  const persistItem = async (item: MenuItem) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('page_content')
        .update({
          menu_label: item.menu_label || null,
          content_value: item.content_value,
          menu_location: item.menu_location,
          display_order: item.display_order,
          is_active: item.is_active,
          parent_id: item.parent_id || null
        })
        .eq('id', item.id);
      
      if (error) throw error;
      toast({ title: 'Сохранено', description: 'Пункт меню обновлён' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Удалить этот пункт меню? Все подразделы также будут удалены.')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('page_content')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: 'Удалено', description: 'Пункт меню удалён' });
      load();
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const move = async (item: MenuItem, dir: -1 | 1, siblings: MenuItem[]) => {
    const idx = siblings.findIndex(i => i.id === item.id);
    const target = siblings[idx + dir];
    if (!target) return;
    
    await persistItem({ ...item, display_order: target.display_order });
    await persistItem({ ...target, display_order: item.display_order });
    load();
  };

  const openPageEditor = (item: MenuItem) => {
    navigate(`/admin?tab=content-pages&page=${item.page_name}`);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0, siblings: MenuItem[] = items) => {
    const findItem = (items: MenuItem[], id: string): MenuItem | undefined => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children, id);
          if (found) return found;
        }
      }
    };
    
    const idx = siblings.findIndex(i => i.id === item.id);
    
    return (
      <div key={item.id} className="space-y-2">
        <div 
          className="border rounded-lg p-3 hover:bg-muted/50 transition-colors" 
          style={{ marginLeft: `${level * 1.5}rem` }}
        >
          <div className="flex items-center gap-3">
            {level > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            
            <div className="flex-1 grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Подпись</Label>
                <Input 
                  value={item.menu_label || ''} 
                  onChange={e => updateItem(item.id, { menu_label: e.target.value })} 
                  placeholder="Название"
                  className="h-9"
                />
              </div>
              
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Ссылка</Label>
                <Input 
                  value={item.content_value} 
                  onChange={e => updateItem(item.id, { content_value: e.target.value })} 
                  placeholder="/about"
                  className="h-9"
                />
              </div>
              
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Расположение</Label>
                <Select 
                  value={item.menu_location} 
                  onValueChange={v => updateItem(item.id, { menu_location: v as any })}
                >
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Скрыто</SelectItem>
                    <SelectItem value="header">Шапка</SelectItem>
                    <SelectItem value="footer">Подвал</SelectItem>
                    <SelectItem value="both">Оба</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2 flex items-end gap-1 pb-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => move(item, -1, siblings)} 
                  disabled={idx === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => move(item, 1, siblings)} 
                  disabled={idx === siblings.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="col-span-1 flex items-end pb-1">
                <Switch 
                  checked={item.is_active} 
                  onCheckedChange={v => updateItem(item.id, { is_active: v })} 
                />
              </div>
              
              <div className="col-span-1 flex items-end gap-1 pb-1">
                {level === 0 && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => createSubItem(item.id, item)}
                    title="Добавить подраздел"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => openPageEditor(item)}
                  title="Редактировать страницу"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => {
                    const currentItem = findItem(items, item.id);
                    if (currentItem) persistItem(currentItem);
                  }}
                  title="Сохранить"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => deleteItem(item.id)}
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {item.children && item.children.length > 0 && (
          <div className="space-y-2">
            {item.children.map(child => renderMenuItem(child, level + 1, item.children || []))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Создать новый пункт меню</CardTitle>
          <CardDescription>
            Создайте пункт меню и перейдите к редактированию его страницы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input 
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="Название пункта меню (например: О компании)"
                onKeyDown={e => e.key === 'Enter' && createNewItem()}
              />
            </div>
            <Select value={newItemLocation} onValueChange={v => setNewItemLocation(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Шапка</SelectItem>
                <SelectItem value="footer">Подвал</SelectItem>
                <SelectItem value="both">Оба</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createNewItem} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Создать
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Поиск..."
          />
        </div>
        <Select value={filter} onValueChange={v => setFilter(v as any)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="header">Только шапка</SelectItem>
            <SelectItem value="footer">Только подвал</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Пункты меню</CardTitle>
          <CardDescription>
            Управляйте структурой меню. Исключены: Главная, Корзина, Личный кабинет, Избранное
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Нет пунктов меню. Создайте первый пункт выше.
            </p>
          ) : (
            filteredItems.map(item => renderMenuItem(item))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
