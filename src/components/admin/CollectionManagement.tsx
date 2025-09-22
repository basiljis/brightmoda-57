import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  show_on_homepage: boolean;
  is_active: boolean;
  sort_order: number;
}

const CollectionManagement = () => {
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionForm, setCollectionForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    image_url: '',
    show_on_homepage: false,
    is_active: true,
    sort_order: 0,
    isEditing: false
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = collectionForm.slug || generateSlug(collectionForm.name);
      
      if (collectionForm.isEditing) {
        const { error } = await supabase.from('collections').update({
          name: collectionForm.name,
          slug,
          description: collectionForm.description,
          image_url: collectionForm.image_url,
          show_on_homepage: collectionForm.show_on_homepage,
          is_active: collectionForm.is_active,
          sort_order: collectionForm.sort_order
        }).eq('id', collectionForm.id);

        if (error) throw error;

        toast({
          title: "Коллекция обновлена",
          description: "Коллекция успешно обновлена",
        });
      } else {
        const { error } = await supabase.from('collections').insert({
          name: collectionForm.name,
          slug,
          description: collectionForm.description,
          image_url: collectionForm.image_url,
          show_on_homepage: collectionForm.show_on_homepage,
          is_active: collectionForm.is_active,
          sort_order: collectionForm.sort_order
        });

        if (error) throw error;

        toast({
          title: "Коллекция добавлена",
          description: "Коллекция успешно добавлена",
        });
      }

      setCollectionForm({
        id: '',
        name: '',
        slug: '',
        description: '',
        image_url: '',
        show_on_homepage: false,
        is_active: true,
        sort_order: 0,
        isEditing: false
      });

      loadCollections();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: collectionForm.isEditing ? "Не удалось обновить коллекцию" : "Не удалось добавить коллекцию",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (collection: Collection) => {
    setCollectionForm({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      image_url: collection.image_url || '',
      show_on_homepage: collection.show_on_homepage,
      is_active: collection.is_active,
      sort_order: collection.sort_order,
      isEditing: true
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить коллекцию "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Коллекция удалена",
        description: "Коллекция успешно удалена",
      });

      loadCollections();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить коллекцию",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{collectionForm.isEditing ? 'Редактировать коллекцию' : 'Добавить коллекцию'}</CardTitle>
          <CardDescription>{collectionForm.isEditing ? 'Измените данные коллекции' : 'Создайте новую коллекцию товаров'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collection-name">Название коллекции</Label>
                <Input
                  id="collection-name"
                  value={collectionForm.name}
                  onChange={(e) => setCollectionForm({...collectionForm, name: e.target.value})}
                  placeholder="Например: Осенняя коллекция"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collection-slug">URL-адрес (slug)</Label>
                <Input
                  id="collection-slug"
                  value={collectionForm.slug}
                  onChange={(e) => setCollectionForm({...collectionForm, slug: e.target.value})}
                  placeholder="autumn-collection"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collection-image">URL изображения</Label>
                <Input
                  id="collection-image"
                  value={collectionForm.image_url}
                  onChange={(e) => setCollectionForm({...collectionForm, image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collection-sort">Порядок сортировки</Label>
                <Input
                  id="collection-sort"
                  type="number"
                  value={collectionForm.sort_order}
                  onChange={(e) => setCollectionForm({...collectionForm, sort_order: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection-description">Описание</Label>
              <Textarea
                id="collection-description"
                value={collectionForm.description}
                onChange={(e) => setCollectionForm({...collectionForm, description: e.target.value})}
                placeholder="Описание коллекции..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="collection-homepage"
                checked={collectionForm.show_on_homepage}
                onCheckedChange={(checked) => setCollectionForm({...collectionForm, show_on_homepage: checked})}
              />
              <Label htmlFor="collection-homepage">Отображать на главной странице</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="collection-active"
                checked={collectionForm.is_active}
                onCheckedChange={(checked) => setCollectionForm({...collectionForm, is_active: checked})}
              />
              <Label htmlFor="collection-active">Активна</Label>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {collectionForm.isEditing ? 'Обновить коллекцию' : 'Добавить коллекцию'}
            </Button>
            {collectionForm.isEditing && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setCollectionForm({
                  id: '',
                  name: '',
                  slug: '',
                  description: '',
                  image_url: '',
                  show_on_homepage: false,
                  is_active: true,
                  sort_order: 0,
                  isEditing: false
                })}
              >
                Отмена
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список коллекций</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collections.map((collection) => (
              <div key={collection.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{collection.name}</h3>
                      {collection.show_on_homepage && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          На главной
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">/{collection.slug}</p>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                    )}
                    {collection.image_url && (
                      <div className="mt-2">
                        <img
                          src={collection.image_url}
                          alt={collection.name}
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      collection.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {collection.is_active ? 'Активна' : 'Неактивна'}
                    </span>
                    <span className="text-xs text-muted-foreground">#{collection.sort_order}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(collection)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(collection.id, collection.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionManagement;