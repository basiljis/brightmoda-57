import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import FileUploadField from './FileUploadField';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HeaderCollection {
  id: string;
  collection_id: string | null;
  position: number;
  title: string;
  link_url: string;
  image_url: string;
  is_active: boolean;
  desktop_display_mode?: string;
  autoplay_enabled?: boolean;
  autoplay_speed?: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

const HeaderCollectionManagement = () => {
  const [headerCollections, setHeaderCollections] = useState<HeaderCollection[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      // Load header collections
      const { data: headerData, error: headerError } = await supabase
        .from('header_collections')
        .select('*')
        .order('position');

      if (headerError) throw headerError;

      // Load available collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (collectionsError) throw collectionsError;

      setHeaderCollections(headerData || []);
      setCollections(collectionsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (collection: HeaderCollection) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('header_collections')
        .update(collection)
        .eq('id', collection.id);

      if (error) throw error;

      toast.success('Коллекция обновлена');
      loadData();
    } catch (error) {
      console.error('Error saving header collection:', error);
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (id: string, field: keyof HeaderCollection, value: any) => {
    setHeaderCollections(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const maxPosition = headerCollections.length > 0 
        ? Math.max(...headerCollections.map(c => c.position))
        : 0;

      const { error } = await supabase
        .from('header_collections')
        .insert({
          position: maxPosition + 1,
          title: 'Новая коллекция',
          link_url: '/catalog',
          image_url: '',
          is_active: false,
          desktop_display_mode: headerCollections[0]?.desktop_display_mode || 'two',
          autoplay_enabled: headerCollections[0]?.autoplay_enabled || false,
          autoplay_speed: headerCollections[0]?.autoplay_speed || 'medium'
        });

      if (error) throw error;

      toast.success('Коллекция создана');
      loadData();
    } catch (error) {
      console.error('Error creating header collection:', error);
      toast.error('Ошибка создания');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('header_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Коллекция удалена');
      loadData();
    } catch (error) {
      console.error('Error deleting header collection:', error);
      toast.error('Ошибка удаления');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveUp = async (collection: HeaderCollection) => {
    const currentIndex = headerCollections.findIndex(c => c.id === collection.id);
    if (currentIndex === 0) return;

    const prevCollection = headerCollections[currentIndex - 1];
    
    setSaving(true);
    try {
      const { error: error1 } = await supabase
        .from('header_collections')
        .update({ position: prevCollection.position })
        .eq('id', collection.id);

      const { error: error2 } = await supabase
        .from('header_collections')
        .update({ position: collection.position })
        .eq('id', prevCollection.id);

      if (error1 || error2) throw error1 || error2;

      toast.success('Позиция изменена');
      loadData();
    } catch (error) {
      console.error('Error moving collection:', error);
      toast.error('Ошибка изменения позиции');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveDown = async (collection: HeaderCollection) => {
    const currentIndex = headerCollections.findIndex(c => c.id === collection.id);
    if (currentIndex === headerCollections.length - 1) return;

    const nextCollection = headerCollections[currentIndex + 1];
    
    setSaving(true);
    try {
      const { error: error1 } = await supabase
        .from('header_collections')
        .update({ position: nextCollection.position })
        .eq('id', collection.id);

      const { error: error2 } = await supabase
        .from('header_collections')
        .update({ position: collection.position })
        .eq('id', nextCollection.id);

      if (error1 || error2) throw error1 || error2;

      toast.success('Позиция изменена');
      loadData();
    } catch (error) {
      console.error('Error moving collection:', error);
      toast.error('Ошибка изменения позиции');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление коллекциями в шапке</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Настройте коллекции, которые отображаются в Hero секции главной страницы. 
                Можно добавить больше 2 коллекций для использования карусели.
              </p>
            </div>
            <Button onClick={handleCreate} disabled={saving}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить коллекцию
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Global Settings */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h4 className="font-medium mb-4">Общие настройки отображения</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Режим отображения на десктопе</Label>
                <Select
                  value={headerCollections[0]?.desktop_display_mode || 'two'}
                  onValueChange={(value) => {
                    setHeaderCollections(prev => 
                      prev.map(item => ({ ...item, desktop_display_mode: value }))
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one">Одна картинка</SelectItem>
                    <SelectItem value="two">Две картинки</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Определяет количество картинок, отображаемых одновременно
                </p>
              </div>

              {headerCollections.length > 2 && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Автоматическая прокрутка
                      <Switch
                        checked={headerCollections[0]?.autoplay_enabled || false}
                        onCheckedChange={(checked) => {
                          setHeaderCollections(prev => 
                            prev.map(item => ({ ...item, autoplay_enabled: checked }))
                          );
                        }}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Включить автоматическое переключение слайдов
                    </p>
                  </div>

                  {(headerCollections[0]?.autoplay_enabled || false) && (
                    <div className="space-y-2">
                      <Label>Скорость прокрутки</Label>
                      <Select
                        value={headerCollections[0]?.autoplay_speed || 'medium'}
                        onValueChange={(value) => {
                          setHeaderCollections(prev => 
                            prev.map(item => ({ ...item, autoplay_speed: value }))
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="slow">Медленно (8 сек)</SelectItem>
                          <SelectItem value="medium">Средне (5 сек)</SelectItem>
                          <SelectItem value="fast">Быстро (3 сек)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Individual Collection Items */}
          <div className="grid gap-6">
            {headerCollections.map((headerCollection, index) => (
              <div key={headerCollection.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveUp(headerCollection)}
                        disabled={index === 0 || saving}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveDown(headerCollection)}
                        disabled={index === headerCollections.length - 1 || saving}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Позиция {headerCollection.position}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {headerCollection.is_active ? 'Активна' : 'Скрыта'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Активна</Label>
                      <Switch
                        checked={headerCollection.is_active}
                        onCheckedChange={(checked) => 
                          handleInputChange(headerCollection.id, 'is_active', checked)
                        }
                      />
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={saving}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить коллекцию?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. Коллекция будет удалена навсегда.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(headerCollection.id)}>
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Заголовок</Label>
                    <Input
                      value={headerCollection.title}
                      onChange={(e) => 
                        handleInputChange(headerCollection.id, 'title', e.target.value)
                      }
                      placeholder="Например: MEN, WOMEN"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Связанная коллекция (опционально)</Label>
                    <Select 
                      value={headerCollection.collection_id || "none"}
                      onValueChange={(value) => 
                        handleInputChange(headerCollection.id, 'collection_id', value === "none" ? null : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите коллекцию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Не связано с коллекцией</SelectItem>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>URL ссылки</Label>
                    <Input
                      value={headerCollection.link_url}
                      onChange={(e) => 
                        handleInputChange(headerCollection.id, 'link_url', e.target.value)
                      }
                      placeholder="/catalog?category=men"
                    />
                  </div>

                  <div className="space-y-2">
                    <FileUploadField
                      field={`header_image_${headerCollection.id}`}
                      label="Изображение коллекции"
                      description="Загрузите изображение для отображения в шапке сайта"
                      value={headerCollection.image_url}
                      onChange={(value) => 
                        handleInputChange(headerCollection.id, 'image_url', value)
                      }
                      folder="header-collections"
                      showRecommendations={true}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSave(headerCollection)}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeaderCollectionManagement;