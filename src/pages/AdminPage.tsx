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
import { Package, Settings, ShoppingCart, BookOpen } from 'lucide-react';
import ReferenceManagement from '@/components/admin/ReferenceManagement';
import ProductForm from '@/components/admin/ProductForm';

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Товары
          </TabsTrigger>
          <TabsTrigger value="references" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Справочники
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Заказы
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Настройки
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
                      <div className="text-right text-sm ml-4">
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references">
          <ReferenceManagement />
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
      </Tabs>
    </div>
  );
};

export default AdminPage;