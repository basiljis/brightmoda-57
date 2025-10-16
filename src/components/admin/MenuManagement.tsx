import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, GripVertical, Edit2, X } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RichTextEditor from './RichTextEditor';

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
  content_type?: string;
  text_content?: string;
}

interface SortableItemProps {
  item: MenuItem;
  onUpdate: (id: string, updates: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
  onSave: (item: MenuItem) => void;
  onEditContent: (item: MenuItem) => void;
  onAddSubmenu: (parentId: string) => void;
  level: number;
}

function SortableItem({ item, onUpdate, onDelete, onSave, onEditContent, onAddSubmenu, level }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-card border rounded-lg p-4 mb-2 ${level > 0 ? 'ml-8' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-2">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <div className="flex-1 space-y-3">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-3 space-y-2">
              <Label className="text-xs">Подпись в меню</Label>
              <Input 
                value={item.menu_label || ''} 
                onChange={e => onUpdate(item.id, { menu_label: e.target.value })} 
                placeholder="Название"
                className="h-9"
              />
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label className="text-xs">Расположение</Label>
              <Select 
                value={item.menu_location} 
                onValueChange={v => onUpdate(item.id, { menu_location: v as any })}
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
            
            <div className="md:col-span-3 space-y-2">
              <Label className="text-xs">URL ссылки</Label>
              <Input 
                value={item.content_value} 
                onChange={e => onUpdate(item.id, { content_value: e.target.value })} 
                placeholder="/about"
                className="h-9"
              />
            </div>

            <div className="md:col-span-1 flex items-end pb-1">
              <Switch 
                checked={item.is_active} 
                onCheckedChange={v => onUpdate(item.id, { is_active: v })} 
              />
            </div>
            
            <div className="md:col-span-3 flex items-end gap-1 pb-1">
              {level === 0 && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onAddSubmenu(item.id)}
                  title="Добавить подменю"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="icon"
                className="h-9 w-9"
                onClick={() => onEditContent(item)}
                title="Редактировать контент страницы"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="h-9 w-9"
                onClick={() => onSave(item)}
                title="Сохранить"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon"
                className="h-9 w-9"
                onClick={() => onDelete(item.id)}
                title="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PREDEFINED_PAGES = [
  { page_name: 'about', label: 'О нас', url: '/about' },
  { page_name: 'contacts', label: 'Контакты', url: '/contacts' }
];

export default function MenuManagement() {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemLocation, setNewItemLocation] = useState<'header' | 'footer' | 'both'>('header');
  const [editingContent, setEditingContent] = useState<MenuItem | null>(null);
  const [contentText, setContentText] = useState('');
  const [parentItemForSubmenu, setParentItemForSubmenu] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    load();
    checkPredefinedPages();
  }, []);

  const checkPredefinedPages = async () => {
    try {
      for (const page of PREDEFINED_PAGES) {
        // Check if menu item exists
        const { data: existing } = await supabase
          .from('page_content')
          .select('id')
          .eq('page_name', page.page_name)
          .in('menu_location', ['header', 'footer', 'both'])
          .maybeSingle();

        if (!existing) {
          const maxOrderRes = await supabase
            .from('page_content')
            .select('display_order')
            .in('menu_location', ['header', 'footer', 'both'])
            .order('display_order', { ascending: false })
            .limit(1)
            .maybeSingle();

          const maxOrder = maxOrderRes?.data?.display_order || 0;

          await supabase.from('page_content').insert({
            page_name: page.page_name,
            section_name: 'menu_item',
            menu_label: page.label,
            content_value: page.url,
            menu_location: 'header',
            display_order: maxOrder + 1,
            is_active: true,
            content_type: 'page'
          });
        }

        // Check if page content exists
        const { data: contentExists } = await supabase
          .from('page_content')
          .select('id')
          .eq('page_name', page.page_name)
          .eq('section_name', 'content')
          .maybeSingle();

        if (!contentExists) {
          await supabase.from('page_content').insert({
            page_name: page.page_name,
            section_name: 'content',
            content_type: 'html',
            content_value: `<h1>${page.label}</h1><p>Содержимое страницы...</p>`,
            display_order: 1,
            is_active: true,
            menu_location: 'none'
          });
        }
      }
      load();
    } catch (e) {
      console.error('Error checking predefined pages:', e);
    }
  };

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .in('menu_location', ['header', 'footer', 'both'])
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setItems((data || []) as MenuItem[]);
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить меню', variant: 'destructive' });
    }
  };

  const createNewItem = async (parentId?: string) => {
    if (!newItemName.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите название пункта меню', variant: 'destructive' });
      return;
    }
    
    try {
      setLoading(true);
      const maxOrder = items.reduce((max, item) => Math.max(max, item.display_order), 0);
      
      const pageName = newItemName.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
      const url = `/${newItemName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;

      // Create menu item
      const { data, error } = await supabase
        .from('page_content')
        .insert({
          page_name: pageName,
          section_name: 'menu_item',
          menu_label: newItemName,
          content_value: url,
          menu_location: parentId ? 'none' : newItemLocation,
          display_order: maxOrder + 1,
          is_active: true,
          content_type: 'page',
          parent_id: parentId || null
        })
        .select()
        .single();
      
      if (error) throw error;

      // Create default page content for all menu items (including submenus)
      const { error: contentError } = await supabase
        .from('page_content')
        .insert({
          page_name: pageName,
          section_name: 'content',
          content_type: 'html',
          content_value: `<h1>${newItemName}</h1><p>Содержимое страницы...</p>`,
          display_order: 1,
          is_active: true,
          menu_location: 'none'
        });

      if (contentError) throw contentError;
      
      toast({ 
        title: 'Создано', 
        description: parentId ? 'Подменю создано' : `Пункт меню и страница созданы. Доступна по адресу: ${url}` 
      });
      setNewItemName('');
      setParentItemForSubmenu(null);
      load();
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось создать пункт меню', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addSubmenu = (parentId: string) => {
    setParentItemForSubmenu(parentId);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        
        // Update display_order for all items
        reordered.forEach(async (item, index) => {
          await supabase
            .from('page_content')
            .update({ display_order: index })
            .eq('id', item.id);
        });
        
        return reordered;
      });

      toast({ title: 'Порядок изменен', description: 'Последовательность пунктов меню обновлена' });
    }
  };

  const updateItem = (id: string, updates: Partial<MenuItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const saveItem = async (item: MenuItem) => {
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
    if (!confirm('Удалить этот пункт меню?')) return;
    
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

  const openContentEditor = async (item: MenuItem) => {
    setEditingContent(item);
    
    // Load existing content for this page
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', item.page_name)
        .neq('section_name', 'menu_item')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      // Combine all content blocks into one text
      const combined = (data || [])
        .map(block => block.content_value)
        .join('\n\n');
      
      setContentText(combined || '');
    } catch (e) {
      console.error(e);
      setContentText('');
    }
  };

  const saveContent = async () => {
    if (!editingContent) return;
    
    try {
      setLoading(true);
      
      // Delete existing content blocks for this page (except menu item)
      await supabase
        .from('page_content')
        .delete()
        .eq('page_name', editingContent.page_name)
        .neq('section_name', 'menu_item');
      
      // Create new content block
      if (contentText.trim()) {
        const { error } = await supabase
          .from('page_content')
          .insert({
            page_name: editingContent.page_name,
            section_name: 'content',
            content_type: 'html',
            content_value: contentText,
            display_order: 1,
            is_active: true,
            menu_location: 'none'
          });
        
        if (error) throw error;
      }
      
      toast({ title: 'Сохранено', description: 'Контент страницы обновлен' });
      setEditingContent(null);
      setContentText('');
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось сохранить контент', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {parentItemForSubmenu ? 'Создать подменю' : 'Создать новый пункт меню'}
          </CardTitle>
          <CardDescription>
            {parentItemForSubmenu 
              ? 'Добавьте подпункт к выбранному пункту меню'
              : 'Создайте пункт меню и настройте контент его страницы'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input 
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="Название пункта меню (например: О компании)"
                onKeyDown={e => e.key === 'Enter' && createNewItem(parentItemForSubmenu || undefined)}
              />
            </div>
            {!parentItemForSubmenu && (
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
            )}
            {parentItemForSubmenu && (
              <Button variant="outline" onClick={() => setParentItemForSubmenu(null)}>
                <X className="h-4 w-4 mr-2" />
                Отмена
              </Button>
            )}
            <Button onClick={() => createNewItem(parentItemForSubmenu || undefined)} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {parentItemForSubmenu ? 'Создать подменю' : 'Создать'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Пункты меню</CardTitle>
          <CardDescription>
            Управляйте структурой меню. Перетаскивайте для изменения порядка.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Нет пунктов меню. Создайте первый пункт выше.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {items.filter(item => !item.parent_id).map((item) => (
                  <div key={item.id}>
                    <SortableItem
                      item={item}
                      onUpdate={updateItem}
                      onSave={saveItem}
                      onDelete={deleteItem}
                      onEditContent={openContentEditor}
                      onAddSubmenu={addSubmenu}
                      level={0}
                    />
                    {items.filter(child => child.parent_id === item.id).map((child) => (
                      <SortableItem
                        key={child.id}
                        item={child}
                        onUpdate={updateItem}
                        onSave={saveItem}
                        onDelete={deleteItem}
                        onEditContent={openContentEditor}
                        onAddSubmenu={addSubmenu}
                        level={1}
                      />
                    ))}
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование контента: {editingContent?.menu_label}</DialogTitle>
            <DialogDescription>
              Настройте содержимое страницы {editingContent?.content_value}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Контент страницы</Label>
              <RichTextEditor
                value={contentText}
                onChange={setContentText}
                placeholder="Введите содержимое страницы..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingContent(null)}>
                Отмена
              </Button>
              <Button onClick={saveContent} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить контент
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
