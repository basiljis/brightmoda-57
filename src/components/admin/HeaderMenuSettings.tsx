import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

interface HeaderMenuSettings {
  id: string;
  menu_style: 'simple' | 'fullwidth' | 'sidebar';
  show_featured_products: boolean;
  show_collections: boolean;
  show_categories: boolean;
  featured_products_count: number;
  featured_collections_count: number;
}

export default function HeaderMenuSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HeaderMenuSettings>({
    id: '',
    menu_style: 'simple',
    show_featured_products: true,
    show_collections: true,
    show_categories: true,
    featured_products_count: 3,
    featured_collections_count: 4,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('header_menu_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as HeaderMenuSettings);
      }
    } catch (error) {
      console.error('Error loading header menu settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки меню',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('header_menu_settings')
        .upsert({
          id: settings.id || undefined,
          menu_style: settings.menu_style,
          show_featured_products: settings.show_featured_products,
          show_collections: settings.show_collections,
          show_categories: settings.show_categories,
          featured_products_count: settings.featured_products_count,
          featured_collections_count: settings.featured_collections_count,
        });

      if (error) throw error;

      toast({
        title: 'Сохранено',
        description: 'Настройки меню успешно обновлены',
      });

      await loadSettings();
    } catch (error) {
      console.error('Error saving header menu settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки меню',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки меню в шапке</CardTitle>
        <CardDescription>
          Настройте отображение выпадающего меню каталога в шапке сайта
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="menu-style">Стиль отображения меню</Label>
          <Select
            value={settings.menu_style}
            onValueChange={(value) =>
              setSettings({ ...settings, menu_style: value as any })
            }
          >
            <SelectTrigger id="menu-style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Простое меню</SelectItem>
              <SelectItem value="fullwidth">
                Полноширинное меню с картинками
              </SelectItem>
              <SelectItem value="sidebar">Боковое меню</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {settings.menu_style === 'simple' &&
              'Компактное выпадающее меню с текстовыми ссылками'}
            {settings.menu_style === 'fullwidth' &&
              'Полноширинное меню на всю страницу с изображениями товаров'}
            {settings.menu_style === 'sidebar' &&
              'Боковая панель с категориями и картинками'}
          </p>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium">Отображаемые элементы в меню</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-categories">Показывать категории</Label>
              <p className="text-sm text-muted-foreground">
                Отображать список категорий в меню
              </p>
            </div>
            <Switch
              id="show-categories"
              checked={settings.show_categories}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, show_categories: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-collections">Показывать коллекции</Label>
              <p className="text-sm text-muted-foreground">
                Отображать список коллекций в меню
              </p>
            </div>
            <Switch
              id="show-collections"
              checked={settings.show_collections}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, show_collections: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-products">Показывать товары</Label>
              <p className="text-sm text-muted-foreground">
                Отображать избранные товары с картинками в меню
              </p>
            </div>
            <Switch
              id="show-products"
              checked={settings.show_featured_products}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, show_featured_products: checked })
              }
            />
          </div>
        </div>

        {(settings.show_featured_products || settings.show_collections) && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Количество элементов</h3>

            {settings.show_featured_products && (
              <div className="space-y-2">
                <Label htmlFor="products-count">Количество товаров</Label>
                <Input
                  id="products-count"
                  type="number"
                  min="1"
                  max="12"
                  value={settings.featured_products_count}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      featured_products_count: parseInt(e.target.value) || 3,
                    })
                  }
                />
              </div>
            )}

            {settings.show_collections && (
              <div className="space-y-2">
                <Label htmlFor="collections-count">Количество коллекций</Label>
                <Input
                  id="collections-count"
                  type="number"
                  min="1"
                  max="12"
                  value={settings.featured_collections_count}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      featured_collections_count: parseInt(e.target.value) || 4,
                    })
                  }
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Сохранить настройки
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
