import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Plus, ArrowUp, ArrowDown, Image } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LookbookItem {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  season?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

const LookbookManagement = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [editingItem, setEditingItem] = useState<LookbookItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    season: '',
    description: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('lookbook_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading lookbook items:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      season: '',
      description: '',
      display_order: items.length + 1,
      is_active: true
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('lookbook_items')
          .update(formData)
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: "Элемент обновлен",
          description: "Элемент lookbook успешно обновлен",
        });
      } else {
        const { error } = await supabase
          .from('lookbook_items')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Элемент добавлен",
          description: "Новый элемент lookbook добавлен",
        });
      }

      loadItems();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить элемент",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: LookbookItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      subtitle: item.subtitle || '',
      image_url: item.image_url || '',
      season: item.season || '',
      description: item.description || '',
      display_order: item.display_order,
      is_active: item.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот элемент lookbook?')) return;

    try {
      const { error } = await supabase
        .from('lookbook_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Элемент удален",
        description: "Элемент lookbook успешно удален",
      });

      loadItems();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить элемент",
        variant: "destructive",
      });
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('lookbook_items')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) throw error;
      loadItems();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить порядок",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление Lookbook</CardTitle>
          <CardDescription>Добавляйте и редактируйте образы в lookbook</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить образ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Редактировать образ' : 'Добавить образ'}
                </DialogTitle>
                <DialogDescription>
                  Заполните информацию об образе
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название*</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Подзаголовок</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">Сезон</Label>
                    <Input
                      id="season"
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      placeholder="Осень 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_order">Порядок отображения</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">URL изображения</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Активен</Label>
                </div>

                <Button type="submit" className="w-full">
                  {editingItem ? 'Обновить' : 'Добавить'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="mt-6 space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      {!item.is_active && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Неактивен
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                    )}
                    {item.season && (
                      <p className="text-sm text-muted-foreground">Сезон: {item.season}</p>
                    )}
                    {item.description && (
                      <p className="text-sm mt-2">{item.description}</p>
                    )}
                    {item.image_url && (
                      <div className="mt-2">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrder(item.id, item.display_order - 1)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrder(item.id, item.display_order + 1)}
                        disabled={index === items.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default LookbookManagement;