import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Settings, ShoppingCart, BookOpen, HelpCircle, Edit, Trash2, Upload } from 'lucide-react';
import ReferenceManagement from '@/components/admin/ReferenceManagement';
import ProductForm from '@/components/admin/ProductForm';
import ProductEdit from '@/components/admin/ProductEdit';
import LookbookManagement from '@/components/admin/LookbookManagement';
import PageContentManagement from '@/components/admin/PageContentManagement';
import ProductImportExport from '@/components/admin/ProductImportExport';

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }
  
  // Delivery settings state
  const [deliverySettings, setDeliverySettings] = useState({
    cdek_client_id: '',
    cdek_client_secret: '',
    default_city_code: 270,
    default_city_name: 'Москва'
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      loadOrders();
      loadDeliverySettings();
    }
  }, [isAdmin]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          subcategories(name),
          product_colors(colors(name, hex_code)),
          product_sizes(sizes(name))
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadDeliverySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setDeliverySettings({
          cdek_client_id: data.cdek_client_id || '',
          cdek_client_secret: data.cdek_client_secret || '',
          default_city_code: data.default_city_code || 270,
          default_city_name: data.default_city_name || 'Москва'
        });
      }
    } catch (error) {
      console.error('Error loading delivery settings:', error);
    }
  };

  const handleProductAdded = () => {
    loadProducts();
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleProductUpdated = () => {
    loadProducts();
    setEditingProduct(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить товар "${productName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Товар удален",
        description: "Товар успешно удален из каталога",
      });

      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      });
    }
  };

  const handleDeliverySettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('delivery_settings').upsert({
        cdek_client_id: deliverySettings.cdek_client_id,
        cdek_client_secret: deliverySettings.cdek_client_secret,
        default_city_code: deliverySettings.default_city_code,
        default_city_name: deliverySettings.default_city_name
      });

      if (error) throw error;

      toast({
        title: "Настройки сохранены",
        description: "Настройки доставки успешно обновлены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Админ-панель</h1>
        <p className="text-muted-foreground">Управление товарами и настройками</p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Товары
          </TabsTrigger>
          <TabsTrigger value="import-export" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Импорт/Экспорт
          </TabsTrigger>
          <TabsTrigger value="references" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Справочники
          </TabsTrigger>
          <TabsTrigger value="lookbook" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lookbook
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Контент
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Заказы
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Настройки
          </TabsTrigger>
          <TabsTrigger value="instructions" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Инструкции
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <ProductForm onProductAdded={handleProductAdded} />

          <Card>
            <CardHeader>
              <CardTitle>Список товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product: any) => (
                  <div key={product.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          {product.sku && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {product.sku}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.categories?.name} 
                          {product.subcategories?.name && ` / ${product.subcategories.name}`}
                        </p>
                        <p className="text-lg font-bold">{product.price} руб.</p>
                        
                        {/* Display images */}
                        {product.images && product.images.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {product.images.slice(0, 3).map((image: string, idx: number) => (
                              <img
                                key={idx}
                                src={image}
                                alt={`${product.name} ${idx + 1}`}
                                className="w-12 h-12 object-cover rounded border"
                              />
                            ))}
                            {product.images.length > 3 && (
                              <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs">
                                +{product.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Display colors */}
                        {product.product_colors && product.product_colors.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {product.product_colors.map((pc: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: pc.colors.hex_code }}
                                title={pc.colors.name}
                              />
                            ))}
                          </div>
                        )}

                        {/* Display sizes */}
                        {product.product_sizes && product.product_sizes.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {product.product_sizes.map((ps: any, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded"
                              >
                                {ps.sizes.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="text-right text-sm">
                          <p>Склад: {product.stock_quantity || 0}</p>
                          <div className="flex flex-col gap-1 mt-2">
                            {product.is_featured && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                Рекомендуемый
                              </span>
                            )}
                            {product.is_new && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                Новинка
                              </span>
                            )}
                            {product.is_preorder && (
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                Предзаказ
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
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
        </TabsContent>

        <TabsContent value="import-export">
          <ProductImportExport />
        </TabsContent>

        <TabsContent value="references">
          <ReferenceManagement />
        </TabsContent>

        <TabsContent value="lookbook">
          <LookbookManagement />
        </TabsContent>

        <TabsContent value="content">
          <PageContentManagement />
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Заказы</CardTitle>
              <CardDescription>Список всех заказов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Заказ #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{order.total_amount} руб.</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'pending' ? 'В обработке' : 
                           order.status === 'completed' ? 'Выполнен' : order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <ProductEdit
            product={editingProduct}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onProductUpdated={handleProductUpdated}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Настройки доставки</CardTitle>
              <CardDescription>Настройки интеграции с СДЭК</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeliverySettingsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cdek_client_id">СДЭК Client ID</Label>
                    <Input
                      id="cdek_client_id"
                      value={deliverySettings.cdek_client_id}
                      onChange={(e) => setDeliverySettings({
                        ...deliverySettings,
                        cdek_client_id: e.target.value
                      })}
                      placeholder="Введите Client ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cdek_client_secret">СДЭК Client Secret</Label>
                    <Input
                      id="cdek_client_secret"
                      type="password"
                      value={deliverySettings.cdek_client_secret}
                      onChange={(e) => setDeliverySettings({
                        ...deliverySettings,
                        cdek_client_secret: e.target.value
                      })}
                      placeholder="Введите Client Secret"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_city_name">Город по умолчанию</Label>
                    <Input
                      id="default_city_name"
                      value={deliverySettings.default_city_name}
                      onChange={(e) => setDeliverySettings({
                        ...deliverySettings,
                        default_city_name: e.target.value
                      })}
                      placeholder="Москва"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_city_code">Код города</Label>
                    <Input
                      id="default_city_code"
                      type="number"
                      value={deliverySettings.default_city_code}
                      onChange={(e) => setDeliverySettings({
                        ...deliverySettings,
                        default_city_code: parseInt(e.target.value)
                      })}
                      placeholder="270"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Сохранить настройки
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Руководство администратора</CardTitle>
                <CardDescription>Подробные инструкции по управлению системой</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">1. Управление товарами</h3>
                  <div className="pl-4 space-y-2">
                    <p className="text-sm">• <strong>Добавление товара:</strong> Заполните все обязательные поля: название, описание, цена, категория</p>
                    <p className="text-sm">• <strong>Артикул (SKU):</strong> Уникальный код товара для внутреннего учёта</p>
                    <p className="text-sm">• <strong>Предзаказ:</strong> Отметьте товары, доступные только по предзаказу</p>
                    <p className="text-sm">• <strong>Фотографии:</strong> Загрузите качественные изображения товара (рекомендуемый размер: 800x800px)</p>
                    <p className="text-sm">• <strong>Видео:</strong> Добавьте ссылки на видеообзоры товара (YouTube, Vimeo)</p>
                    <p className="text-sm">• <strong>Цвета и размеры:</strong> Выберите доступные варианты из справочников</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">2. Справочники</h3>
                  <div className="pl-4 space-y-2">
                    <p className="text-sm">• <strong>Категории:</strong> Основные разделы товаров (Одежда, Интерьер и т.д.)</p>
                    <p className="text-sm">• <strong>Подкатегории:</strong> Детализация внутри категорий (Кардиганы, Жилеты и т.д.)</p>
                    <p className="text-sm">• <strong>Цвета:</strong> Управление цветовой палитрой с HEX-кодами</p>
                    <p className="text-sm">• <strong>Размеры:</strong> Размерная сетка товаров (S, M, L, XL и т.д.)</p>
                    <p className="text-sm">• <strong>Порядок отображения:</strong> Настройка последовательности элементов на сайте</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">3. Управление заказами</h3>
                  <div className="pl-4 space-y-2">
                    <p className="text-sm">• <strong>Статусы заказов:</strong> Отслеживание этапов выполнения</p>
                    <p className="text-sm">• <strong>Обработка:</strong> Проверка и подтверждение новых заказов</p>
                    <p className="text-sm">• <strong>История:</strong> Полная информация о всех транзакциях</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">4. Настройки доставки</h3>
                  <div className="pl-4 space-y-2">
                    <p className="text-sm">• <strong>СДЭК интеграция:</strong> Настройка API для расчёта стоимости доставки</p>
                    <p className="text-sm">• <strong>Client ID/Secret:</strong> Получите в личном кабинете СДЭК</p>
                    <p className="text-sm">• <strong>Город по умолчанию:</strong> Базовый город для расчётов (код 270 - Москва)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">5. Структура сайта</h3>
                  <div className="pl-4 space-y-2">
                    <p className="text-sm">• Категории автоматически отображаются в главном меню</p>
                    <p className="text-sm">• Подкатегории создают подменю и отдельные страницы</p>
                    <p className="text-sm">• Активные справочники влияют на фильтры в каталоге</p>
                    <p className="text-sm">• Порядок сортировки определяет последовательность на сайте</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <h4 className="font-semibold text-blue-800">💡 Рекомендации</h4>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• Регулярно проверяйте актуальность товаров и их наличие</li>
                    <li>• Ведите единообразие в названиях и описаниях</li>
                    <li>• Используйте качественные изображения для лучшей конверсии</li>
                    <li>• Своевременно обновляйте статусы заказов</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                  <h4 className="font-semibold text-amber-800">⚠️ Важные моменты</h4>
                  <ul className="mt-2 text-sm text-amber-700 space-y-1">
                    <li>• Удаление категорий повлияет на все связанные товары</li>
                    <li>• Изменения в справочниках отражаются на сайте мгновенно</li>
                    <li>• Сохраняйте резервные копии перед массовыми изменениями</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;