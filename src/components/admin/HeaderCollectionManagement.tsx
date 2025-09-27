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

interface HeaderCollection {
  id: string;
  collection_id: string | null;
  position: number;
  title: string;
  link_url: string;
  image_url: string;
  is_active: boolean;
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
          <CardTitle>Управление коллекциями в шапке</CardTitle>
          <p className="text-sm text-muted-foreground">
            Настройте коллекции, которые отображаются в Hero секции главной страницы
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {headerCollections.map((headerCollection) => (
              <div key={headerCollection.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Позиция {headerCollection.position} ({headerCollection.position === 1 ? 'Левая' : 'Правая'})
                  </h4>
                  <Switch
                    checked={headerCollection.is_active}
                    onCheckedChange={(checked) => 
                      handleInputChange(headerCollection.id, 'is_active', checked)
                    }
                  />
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