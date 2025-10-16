import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderMenuSettings {
  id: string;
  menu_style: 'simple' | 'fullwidth' | 'sidebar';
  show_featured_products: boolean;
  show_collections: boolean;
  show_categories: boolean;
  show_collections_right: boolean;
  show_products_right: boolean;
  featured_products_count: number;
  featured_collections_count: number;
  selected_collection_ids?: string[];
  selected_product_ids?: string[];
  selected_category_ids?: string[];
  selected_category_ids_right?: string[];
  right_side_content: 'products' | 'collections' | 'both';
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
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
    show_collections_right: true,
    show_products_right: true,
    featured_products_count: 3,
    featured_collections_count: 4,
    selected_collection_ids: [],
    selected_product_ids: [],
    selected_category_ids: [],
    selected_category_ids_right: [],
    right_side_content: 'both',
  });

  const [availableCollections, setAvailableCollections] = useState<Collection[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadSettings();
    loadAvailableData();
  }, []);

  const loadAvailableData = async () => {
    try {
      const [collectionsRes, productsRes, categoriesRes] = await Promise.all([
        supabase.from('collections').select('id, name, slug').eq('is_active', true).order('name'),
        supabase.from('products').select('id, name, price').eq('is_active', true).order('name'),
        supabase.from('categories').select('id, name, slug').eq('is_active', true).order('name')
      ]);

      if (collectionsRes.data) setAvailableCollections(collectionsRes.data);
      if (productsRes.data) setAvailableProducts(productsRes.data);
      if (categoriesRes.data) setAvailableCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading available data:', error);
    }
  };

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
          show_collections_right: settings.show_collections_right,
          show_products_right: settings.show_products_right,
          featured_products_count: settings.featured_products_count,
          featured_collections_count: settings.featured_collections_count,
          selected_collection_ids: settings.selected_collection_ids || [],
          selected_product_ids: settings.selected_product_ids || [],
          selected_category_ids: settings.selected_category_ids || [],
          selected_category_ids_right: settings.selected_category_ids_right || [],
          right_side_content: settings.right_side_content,
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
          <h3 className="font-medium">Левая часть меню (списки)</h3>
          <p className="text-sm text-muted-foreground">
            Настройка отображения текстовых списков слева
          </p>

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

          {settings.show_categories && (
            <div className="space-y-3 pl-4 border-l-2">
              <div className="space-y-2">
                <Label htmlFor="select-categories-left">Категории для отображения</Label>
                <Select
                  onValueChange={(value) => {
                    if (!settings.selected_category_ids?.includes(value)) {
                      setSettings({
                        ...settings,
                        selected_category_ids: [...(settings.selected_category_ids || []), value]
                      });
                    }
                  }}
                >
                  <SelectTrigger id="select-categories-left">
                    <SelectValue placeholder="Выберите категорию..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Оставьте пустым для отображения всех категорий
                </p>
              </div>
              {settings.selected_category_ids && settings.selected_category_ids.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Выбранные категории:</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.selected_category_ids.map((id) => {
                      const category = availableCategories.find(c => c.id === id);
                      return category ? (
                        <Badge key={id} variant="secondary" className="gap-1">
                          {category.name}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                selected_category_ids: settings.selected_category_ids?.filter(cid => cid !== id)
                              });
                            }}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

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

          {settings.show_collections && (
            <div className="space-y-3 pl-4 border-l-2">
              <div className="space-y-2">
                <Label htmlFor="select-collections-left">Коллекции для отображения</Label>
                <Select
                  onValueChange={(value) => {
                    if (!settings.selected_collection_ids?.includes(value)) {
                      setSettings({
                        ...settings,
                        selected_collection_ids: [...(settings.selected_collection_ids || []), value]
                      });
                    }
                  }}
                >
                  <SelectTrigger id="select-collections-left">
                    <SelectValue placeholder="Выберите коллекцию..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCollections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Оставьте пустым для отображения всех коллекций
                </p>
              </div>
              {settings.selected_collection_ids && settings.selected_collection_ids.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Выбранные коллекции:</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.selected_collection_ids.map((id) => {
                      const collection = availableCollections.find(c => c.id === id);
                      return collection ? (
                        <Badge key={id} variant="secondary" className="gap-1">
                          {collection.name}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                selected_collection_ids: settings.selected_collection_ids?.filter(cid => cid !== id)
                              });
                            }}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium">Правая часть меню (картинки)</h3>
          <p className="text-sm text-muted-foreground">
            Настройка отображения элементов с изображениями справа
          </p>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-products-right">Показывать товары</Label>
              <p className="text-sm text-muted-foreground">
                Отображать избранные товары с картинками в правой части
              </p>
            </div>
            <Switch
              id="show-products-right"
              checked={settings.show_products_right}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, show_products_right: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-collections-right">Показывать коллекции</Label>
              <p className="text-sm text-muted-foreground">
                Отображать коллекции с картинками в правой части
              </p>
            </div>
            <Switch
              id="show-collections-right"
              checked={settings.show_collections_right}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, show_collections_right: checked })
              }
            />
          </div>
        </div>

        {settings.menu_style === 'fullwidth' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Настройка правой части с картинками</h3>

            <div className="space-y-2">
              <Label htmlFor="right-side-content">Тип контента справа</Label>
              <Select
                value={settings.right_side_content}
                onValueChange={(value) =>
                  setSettings({ ...settings, right_side_content: value as 'products' | 'collections' | 'both' })
                }
              >
                <SelectTrigger id="right-side-content">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Только товары</SelectItem>
                  <SelectItem value="collections">Только коллекции</SelectItem>
                  <SelectItem value="both">Товары и коллекции</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Выберите, какой контент отображать в правой части меню
              </p>
            </div>

          {settings.show_collections_right && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="select-collections">Выбрать коллекции для отображения в правой части</Label>
                <Select
                  onValueChange={(value) => {
                    if (!settings.selected_collection_ids?.includes(value)) {
                      setSettings({
                        ...settings,
                        selected_collection_ids: [...(settings.selected_collection_ids || []), value]
                      });
                    }
                  }}
                >
                  <SelectTrigger id="select-collections">
                    <SelectValue placeholder="Выберите коллекцию..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCollections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {settings.selected_collection_ids && settings.selected_collection_ids.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Выбранные коллекции:</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.selected_collection_ids.map((id) => {
                      const collection = availableCollections.find(c => c.id === id);
                      return collection ? (
                        <Badge key={id} variant="secondary" className="gap-1">
                          {collection.name}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                selected_collection_ids: settings.selected_collection_ids?.filter(cid => cid !== id)
                              });
                            }}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="select-categories-right">Выбрать категории для отображения в правой части</Label>
              <Select
                onValueChange={(value) => {
                  if (!settings.selected_category_ids_right?.includes(value)) {
                    setSettings({
                      ...settings,
                      selected_category_ids_right: [...(settings.selected_category_ids_right || []), value]
                    });
                  }
                }}
              >
                <SelectTrigger id="select-categories-right">
                  <SelectValue placeholder="Выберите категорию..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Оставьте пустым для автоматического выбора
              </p>
            </div>
            {settings.selected_category_ids_right && settings.selected_category_ids_right.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Выбранные категории:</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.selected_category_ids_right.map((id) => {
                    const category = availableCategories.find(c => c.id === id);
                    return category ? (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {category.name}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              selected_category_ids_right: settings.selected_category_ids_right?.filter(cid => cid !== id)
                            });
                          }}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {settings.show_products_right && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="select-products">Выбрать товары для отображения в правой части</Label>
                <Select
                  onValueChange={(value) => {
                    if (!settings.selected_product_ids?.includes(value)) {
                      setSettings({
                        ...settings,
                        selected_product_ids: [...(settings.selected_product_ids || []), value]
                      });
                    }
                  }}
                >
                  <SelectTrigger id="select-products">
                    <SelectValue placeholder="Выберите товар..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.price.toLocaleString()} ₽
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {settings.selected_product_ids && settings.selected_product_ids.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Выбранные товары:</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.selected_product_ids.map((id) => {
                      const product = availableProducts.find(p => p.id === id);
                      return product ? (
                        <Badge key={id} variant="secondary" className="gap-1">
                          {product.name}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                selected_product_ids: settings.selected_product_ids?.filter(pid => pid !== id)
                              });
                            }}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {settings.show_categories && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="select-categories">Выбрать категории для отображения (старая секция - удалить?)</Label>
                <Select
                  onValueChange={(value) => {
                    if (!settings.selected_category_ids?.includes(value)) {
                      setSettings({
                        ...settings,
                        selected_category_ids: [...(settings.selected_category_ids || []), value]
                      });
                    }
                  }}
                >
                  <SelectTrigger id="select-categories">
                    <SelectValue placeholder="Выберите категорию..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {settings.selected_category_ids && settings.selected_category_ids.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Выбранные категории:</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.selected_category_ids.map((id) => {
                      const category = availableCategories.find(c => c.id === id);
                      return category ? (
                        <Badge key={id} variant="secondary" className="gap-1">
                          {category.name}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSettings({
                                ...settings,
                                selected_category_ids: settings.selected_category_ids?.filter(cid => cid !== id)
                              });
                            }}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

            <p className="text-sm text-muted-foreground">
              Если элементы не выбраны, будут отображаться автоматически выбранные товары/коллекции/категории
            </p>
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
