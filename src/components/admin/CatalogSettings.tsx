import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

const CatalogSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    cart_position: 'on_card',
    cart_button_type: 'text',
    cart_button_size: 'medium',
    favorite_icon_style: 'outline',
    favorite_position: 'top_right',
    card_spacing: 'normal',
    card_vertical_spacing: 'normal',
    cards_per_row_desktop: 3,
    cards_per_row_tablet: 2,
    cards_per_row_mobile: 1,
    card_rounding: 'medium',
    card_text_alignment: 'left',
    full_width_layout: false,
    show_hover_effects: true,
    show_image_zoom_on_hover: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('catalog_display_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading catalog settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('catalog_display_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          ...settings,
        });

      if (error) throw error;

      toast({
        title: 'Настройки сохранены',
        description: 'Настройки отображения каталога успешно обновлены',
      });
    } catch (error) {
      console.error('Error saving catalog settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Настройки каталога</h2>
        <p className="text-muted-foreground mt-1">
          Управление отображением карточек товаров в каталоге
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Корзина */}
        <Card>
          <CardHeader>
            <CardTitle>Кнопка корзины</CardTitle>
            <CardDescription>Расположение и вид кнопки "Добавить в корзину"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Позиция</Label>
              <Select
                value={settings.cart_position}
                onValueChange={(value) => setSettings({ ...settings, cart_position: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_card">На карточке (справа сверху)</SelectItem>
                  <SelectItem value="below_card">Под карточкой</SelectItem>
                  <SelectItem value="below_price">Под ценой (внутри карточки)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Тип отображения</Label>
              <Select
                value={settings.cart_button_type}
                onValueChange={(value) => setSettings({ ...settings, cart_button_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="icon">Иконка</SelectItem>
                  <SelectItem value="text">Кнопка с текстом</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Размер кнопки</Label>
              <Select
                value={settings.cart_button_size}
                onValueChange={(value) => setSettings({ ...settings, cart_button_size: value })}
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
          </CardContent>
        </Card>

        {/* Избранное */}
        <Card>
          <CardHeader>
            <CardTitle>Иконка избранного</CardTitle>
            <CardDescription>Стиль и расположение иконки "В избранное"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Стиль иконки</Label>
              <Select
                value={settings.favorite_icon_style}
                onValueChange={(value) => setSettings({ ...settings, favorite_icon_style: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outline">Контур</SelectItem>
                  <SelectItem value="filled">Заливка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Позиция</Label>
              <Select
                value={settings.favorite_position}
                onValueChange={(value) => setSettings({ ...settings, favorite_position: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top_right">Верхний правый угол</SelectItem>
                  <SelectItem value="top_left">Верхний левый угол</SelectItem>
                  <SelectItem value="bottom_right">Нижний правый угол</SelectItem>
                  <SelectItem value="bottom_left">Нижний левый угол</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Расстояние между карточками */}
        <Card>
          <CardHeader>
            <CardTitle>Сетка карточек</CardTitle>
            <CardDescription>Расположение и плотность карточек</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Расстояние между карточками (по горизонтали)</Label>
              <Select
                value={settings.card_spacing}
                onValueChange={(value) => setSettings({ ...settings, card_spacing: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tight">Вплотную</SelectItem>
                  <SelectItem value="normal">Нормальное</SelectItem>
                  <SelectItem value="loose">Широкое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Расстояние между карточками (по вертикали)</Label>
              <Select
                value={settings.card_vertical_spacing}
                onValueChange={(value) => setSettings({ ...settings, card_vertical_spacing: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tight">Вплотную</SelectItem>
                  <SelectItem value="normal">Нормальное</SelectItem>
                  <SelectItem value="loose">Широкое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Карточек по горизонтали (десктоп)</Label>
              <Select
                value={settings.cards_per_row_desktop.toString()}
                onValueChange={(value) => setSettings({ ...settings, cards_per_row_desktop: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Карточек по горизонтали (планшет)</Label>
              <Select
                value={settings.cards_per_row_tablet.toString()}
                onValueChange={(value) => setSettings({ ...settings, cards_per_row_tablet: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="full-width">На всю ширину экрана</Label>
                <p className="text-xs text-muted-foreground">
                  Растягивает контент до краев экрана на всех страницах (каталог, коллекции, главная)
                </p>
              </div>
              <Switch
                id="full-width"
                checked={settings.full_width_layout}
                onCheckedChange={(checked) => setSettings({ ...settings, full_width_layout: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Скругление */}
        <Card>
          <CardHeader>
            <CardTitle>Внешний вид</CardTitle>
            <CardDescription>Скругление углов и эффекты</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Скругление углов</Label>
              <Select
                value={settings.card_rounding}
                onValueChange={(value) => setSettings({ ...settings, card_rounding: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без скругления</SelectItem>
                  <SelectItem value="small">Небольшое</SelectItem>
                  <SelectItem value="medium">Среднее</SelectItem>
                  <SelectItem value="large">Большое</SelectItem>
                  <SelectItem value="full">Полное</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="hover-effects">Эффекты при наведении</Label>
              <Switch
                id="hover-effects"
                checked={settings.show_hover_effects}
                onCheckedChange={(checked) => setSettings({ ...settings, show_hover_effects: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="image-zoom">Увеличение картинки при наведении</Label>
                <p className="text-xs text-muted-foreground">
                  Эффект масштабирования изображения внутри карточки
                </p>
              </div>
              <Switch
                id="image-zoom"
                checked={settings.show_image_zoom_on_hover}
                onCheckedChange={(checked) => setSettings({ ...settings, show_image_zoom_on_hover: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Выравнивание текста */}
        <Card>
          <CardHeader>
            <CardTitle>Текст на карточках</CardTitle>
            <CardDescription>Выравнивание названия, цвета и цены</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Выравнивание текста</Label>
              <Select
                value={settings.card_text_alignment}
                onValueChange={(value) => setSettings({ ...settings, card_text_alignment: value })}
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
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </div>
    </div>
  );
};

export default CatalogSettings;