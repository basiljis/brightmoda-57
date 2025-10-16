import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import RichTextEditor from './RichTextEditor';

interface HomePageBlock {
  id: string;
  block_type: 'catalog' | 'catalog_filtered' | 'text' | 'collection_card' | 'features' | 'spacer';
  title: string | null;
  title_alignment: 'left' | 'center' | 'right';
  display_order: number;
  is_active: boolean;
  items_count: number | null;
  collection_id: string | null;
  collection_ids?: string[];
  show_all_collections: boolean | null;
  text_content: string | null;
  font_size: 'small' | 'medium' | 'large' | 'xlarge' | null;
  show_more_button: boolean | null;
  show_more_text: string | null;
  show_more_button_size: 'small' | 'medium' | 'large' | null;
  show_more_button_type: 'text' | 'icon' | null;
  collection_card_style: string | null;
  spacer_size?: number;
}

interface Collection {
  id: string;
  name: string;
}

interface SortableBlockProps {
  block: HomePageBlock;
  collections: Collection[];
  onUpdate: (id: string, updates: Partial<HomePageBlock>) => void;
  onDelete: (id: string) => void;
}

function SortableBlock({ block, collections, onUpdate, onDelete }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getBlockTypeLabel = (type: string) => {
    switch (type) {
      case 'catalog': return 'Каталог';
      case 'catalog_filtered': return 'Каталог с фильтром';
      case 'text': return 'Текстовый блок';
      case 'collection_card': return 'Карточка коллекции';
      case 'features': return 'Преимущества';
      case 'spacer': return 'Отступ';
      default: return type;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-4 mb-3">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-2">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{getBlockTypeLabel(block.block_type)}</span>
            <Button variant="ghost" size="sm" onClick={() => onDelete(block.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Заголовок</Label>
              <Input
                value={block.title || ''}
                onChange={(e) => onUpdate(block.id, { title: e.target.value })}
                placeholder="Заголовок блока"
              />
            </div>

            <div className="space-y-2">
              <Label>Выравнивание заголовка</Label>
              <Select
                value={block.title_alignment}
                onValueChange={(value: 'left' | 'center' | 'right') => onUpdate(block.id, { title_alignment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">По левому краю</SelectItem>
                  <SelectItem value="center">По центру</SelectItem>
                  <SelectItem value="right">По правому краю</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {block.block_type === 'collection_card' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Коллекции</Label>
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <div key={collection.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`collection-${block.id}-${collection.id}`}
                        checked={(block.collection_ids || []).includes(collection.id)}
                        onChange={(e) => {
                          const currentIds = block.collection_ids || [];
                          const newIds = e.target.checked
                            ? [...currentIds, collection.id]
                            : currentIds.filter(id => id !== collection.id);
                          onUpdate(block.id, { collection_ids: newIds });
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`collection-${block.id}-${collection.id}`} className="cursor-pointer">
                        {collection.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {block.block_type === 'spacer' && (
            <div className="space-y-2">
              <Label>Размер отступа (px)</Label>
              <Input
                type="number"
                min="0"
                step="10"
                value={block.spacer_size || 40}
                onChange={(e) => onUpdate(block.id, { spacer_size: parseInt(e.target.value) || 40 })}
              />
            </div>
          )}

          {(block.block_type === 'catalog' || block.block_type === 'catalog_filtered') && (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Количество карточек</Label>
                  <Input
                    type="number"
                    min="1"
                    value={block.items_count || 4}
                    onChange={(e) => onUpdate(block.id, { items_count: parseInt(e.target.value) || 4 })}
                  />
                </div>

                {block.block_type === 'catalog_filtered' && (
                  <div className="space-y-2">
                    <Label>Коллекция</Label>
                    <Select
                      value={block.show_all_collections ? 'all' : (block.collection_id || '')}
                      onValueChange={(value) => {
                        if (value === 'all') {
                          onUpdate(block.id, { show_all_collections: true, collection_id: null });
                        } else {
                          onUpdate(block.id, { show_all_collections: false, collection_id: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите коллекцию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все коллекции</SelectItem>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`show-more-${block.id}`}
                    checked={block.show_more_button || false}
                    onChange={(e) => onUpdate(block.id, { show_more_button: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor={`show-more-${block.id}`}>Показывать кнопку "Показать еще"</Label>
                </div>

                {block.show_more_button && (
                  <div className="pl-6 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Тип кнопки</Label>
                        <Select
                          value={block.show_more_button_type || 'text'}
                          onValueChange={(value: 'text' | 'icon') => onUpdate(block.id, { show_more_button_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">С текстом</SelectItem>
                            <SelectItem value="icon">Иконка</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Размер кнопки</Label>
                        <Select
                          value={block.show_more_button_size || 'medium'}
                          onValueChange={(value: 'small' | 'medium' | 'large') => onUpdate(block.id, { show_more_button_size: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Маленький</SelectItem>
                            <SelectItem value="medium">Средний</SelectItem>
                            <SelectItem value="large">Большой</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {block.show_more_button_type !== 'icon' && (
                      <div className="space-y-2">
                        <Label>Текст кнопки</Label>
                        <Input
                          value={block.show_more_text || 'Показать еще'}
                          onChange={(e) => onUpdate(block.id, { show_more_text: e.target.value })}
                          placeholder="Показать еще"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {block.block_type === 'text' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Размер шрифта</Label>
                <Select
                  value={block.font_size || 'medium'}
                  onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => onUpdate(block.id, { font_size: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Маленький</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="large">Большой</SelectItem>
                    <SelectItem value="xlarge">Очень большой</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Содержимое</Label>
                <RichTextEditor
                  value={block.text_content || ''}
                  onChange={(value) => onUpdate(block.id, { text_content: value })}
                  placeholder="Введите текст..."
                />
              </div>
            </div>
          )}

          {block.block_type === 'features' && (
            <div className="space-y-3">
              <FeaturesEditor
                features={(() => {
                  try {
                    const parsed = JSON.parse(block.text_content || '{"items":[]}');
                    return parsed.items || [];
                  } catch {
                    return [];
                  }
                })()}
                onChange={(features) => {
                  onUpdate(block.id, { text_content: JSON.stringify({ items: features }) });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturesEditor({ features, onChange }: { features: Array<{ title: string; description: string }>; onChange: (features: Array<{ title: string; description: string }>) => void }) {
  const handleAdd = () => {
    onChange([...features, { title: '', description: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(features.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Элементы преимуществ</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Добавить элемент
        </Button>
      </div>
      
      {features.map((feature, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Элемент {index + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(index)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input
              value={feature.title}
              onChange={(e) => handleUpdate(index, 'title', e.target.value)}
              placeholder="Например: Терморегуляция"
            />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Input
              value={feature.description}
              onChange={(e) => handleUpdate(index, 'description', e.target.value)}
              placeholder="Описание преимущества"
            />
          </div>
        </div>
      ))}
      
      {features.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Нет элементов. Добавьте первый элемент преимущества.
        </p>
      )}
    </div>
  );
}

const HomePageBlocks = () => {
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<HomePageBlock[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBlockType, setNewBlockType] = useState<'catalog' | 'catalog_filtered' | 'text' | 'collection_card' | 'features' | 'spacer'>('catalog');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [blocksRes, collectionsRes] = await Promise.all([
        supabase.from('home_page_blocks').select('*').order('display_order'),
        supabase.from('collections').select('id, name').eq('is_active', true),
      ]);

      if (blocksRes.error) throw blocksRes.error;
      if (collectionsRes.error) throw collectionsRes.error;

      setBlocks((blocksRes.data || []) as HomePageBlock[]);
      setCollections(collectionsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddBlock = async () => {
    try {
      const maxOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.display_order)) : -1;
      
      const newBlock = {
        block_type: newBlockType,
        title: '',
        title_alignment: 'left' as const,
        display_order: maxOrder + 1,
        is_active: true,
        items_count: newBlockType !== 'text' && newBlockType !== 'spacer' ? 4 : null,
        show_all_collections: newBlockType === 'catalog_filtered' ? false : null,
        font_size: newBlockType === 'text' ? ('medium' as const) : null,
        show_more_button: false,
        show_more_text: 'Показать еще',
        show_more_button_size: 'medium' as const,
        show_more_button_type: 'text' as const,
        text_content: newBlockType === 'features' ? JSON.stringify({ items: [] }) : null,
        spacer_size: newBlockType === 'spacer' ? 40 : null,
        collection_ids: newBlockType === 'collection_card' ? [] : null,
      };

      const { data, error } = await supabase
        .from('home_page_blocks')
        .insert([newBlock])
        .select()
        .single();

      if (error) throw error;

      setBlocks([...blocks, data as HomePageBlock]);
      setIsDialogOpen(false);
      
      toast({
        title: 'Блок добавлен',
        description: 'Новый блок успешно создан',
      });
    } catch (error) {
      console.error('Error adding block:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить блок',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBlock = (id: string, updates: Partial<HomePageBlock>) => {
    setBlocks(blocks.map(block => block.id === id ? { ...block, ...updates } : block));
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      const { error } = await supabase.from('home_page_blocks').delete().eq('id', id);

      if (error) throw error;

      setBlocks(blocks.filter(block => block.id !== id));
      
      toast({
        title: 'Блок удален',
        description: 'Блок успешно удален',
      });
    } catch (error) {
      console.error('Error deleting block:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить блок',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = blocks.map((block, index) => ({
        ...block,
        display_order: index,
      }));

      for (const block of updates) {
        const { error } = await supabase
          .from('home_page_blocks')
          .update(block)
          .eq('id', block.id);

        if (error) throw error;
      }

      toast({
        title: 'Изменения сохранены',
        description: 'Блоки главной страницы обновлены',
      });
    } catch (error) {
      console.error('Error saving blocks:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Главная страница</h2>
          <p className="text-muted-foreground mt-1">
            Управление блоками на главной странице
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить блок
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить блок</DialogTitle>
              <DialogDescription>
                Выберите тип блока для добавления на главную страницу
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Тип блока</Label>
                <Select value={newBlockType} onValueChange={(value: any) => setNewBlockType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="catalog">Каталог</SelectItem>
                    <SelectItem value="catalog_filtered">Каталог с фильтром по коллекции</SelectItem>
                    <SelectItem value="text">Текстовый блок</SelectItem>
                    <SelectItem value="collection_card">Карточка коллекции</SelectItem>
                    <SelectItem value="features">Преимущества</SelectItem>
                    <SelectItem value="spacer">Отступ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddBlock} className="w-full">
                Создать блок
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {blocks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Нет блоков. Добавьте первый блок для главной страницы.
          </CardContent>
        </Card>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  collections={collections}
                  onUpdate={handleUpdateBlock}
                  onDelete={handleDeleteBlock}
                />
              ))}
            </SortableContext>
          </DndContext>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePageBlocks;
