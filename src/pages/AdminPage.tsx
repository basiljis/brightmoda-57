import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Settings, ShoppingCart } from 'lucide-react';

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }
  
  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    colors: '',
    sizes: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    stock_quantity: '',
    is_featured: false,
    is_new: false
  });

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
        .select('*')
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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('products').insert({
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        subcategory: productForm.subcategory,
        colors: productForm.colors.split(',').map(c => c.trim()),
        sizes: productForm.sizes.split(',').map(s => s.trim()),
        weight: parseInt(productForm.weight),
        dimensions: {
          length: parseInt(productForm.dimensions.length),
          width: parseInt(productForm.dimensions.width),
          height: parseInt(productForm.dimensions.height)
        },
        stock_quantity: parseInt(productForm.stock_quantity),
        is_featured: productForm.is_featured,
        is_new: productForm.is_new
      });

      if (error) throw error;

      toast({
        title: "Товар добавлен",
        description: "Товар успешно добавлен в каталог",
      });

      // Reset form
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        colors: '',
        sizes: '',
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        stock_quantity: '',
        is_featured: false,
        is_new: false
      });

      loadProducts();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар",
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Товары
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
          <Card>
            <CardHeader>
              <CardTitle>Добавить товар</CardTitle>
              <CardDescription>Добавьте новый товар в каталог</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Название товара</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Цена (руб.)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Категория</Label>
                    <Select onValueChange={(value) => setProductForm({...productForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clothing">Одежда</SelectItem>
                        <SelectItem value="interior">Интерьер</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Подкатегория</Label>
                    <Input
                      id="subcategory"
                      value={productForm.subcategory}
                      onChange={(e) => setProductForm({...productForm, subcategory: e.target.value})}
                      placeholder="Например: кардиганы, жилеты"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="colors">Цвета (через запятую)</Label>
                    <Input
                      id="colors"
                      value={productForm.colors}
                      onChange={(e) => setProductForm({...productForm, colors: e.target.value})}
                      placeholder="Белый, Черный, Серый"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sizes">Размеры (через запятую)</Label>
                    <Input
                      id="sizes"
                      value={productForm.sizes}
                      onChange={(e) => setProductForm({...productForm, sizes: e.target.value})}
                      placeholder="XS, S, M, L, XL"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Вес (грамм)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={productForm.weight}
                      onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length">Длина (см)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={productForm.dimensions.length}
                      onChange={(e) => setProductForm({
                        ...productForm, 
                        dimensions: {...productForm.dimensions, length: e.target.value}
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Ширина (см)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={productForm.dimensions.width}
                      onChange={(e) => setProductForm({
                        ...productForm, 
                        dimensions: {...productForm.dimensions, width: e.target.value}
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Высота (см)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={productForm.dimensions.height}
                      onChange={(e) => setProductForm({
                        ...productForm, 
                        dimensions: {...productForm.dimensions, height: e.target.value}
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Количество на складе</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                  />
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={productForm.is_featured}
                      onCheckedChange={(checked) => setProductForm({...productForm, is_featured: checked})}
                    />
                    <Label htmlFor="featured">Рекомендуемый товар</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="new"
                      checked={productForm.is_new}
                      onCheckedChange={(checked) => setProductForm({...productForm, is_new: checked})}
                    />
                    <Label htmlFor="new">Новинка</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Добавить товар
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product: any) => (
                  <div key={product.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category} / {product.subcategory}</p>
                        <p className="text-lg font-bold">{product.price} руб.</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>Склад: {product.stock_quantity}</p>
                        {product.is_featured && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Рекомендуемый</span>}
                        {product.is_new && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs ml-1">Новинка</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                    <Label htmlFor="cdek_client_id">CDEK Client ID</Label>
                    <Input
                      id="cdek_client_id"
                      value={deliverySettings.cdek_client_id}
                      onChange={(e) => setDeliverySettings({
                        ...deliverySettings, 
                        cdek_client_id: e.target.value
                      })}
                      placeholder="Введите Client ID от СДЭК"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cdek_client_secret">CDEK Client Secret</Label>
                    <Input
                      id="cdek_client_secret"
                      type="password"
                      value={deliverySettings.cdek_client_secret}
                      onChange={(e) => setDeliverySettings({
                        ...deliverySettings, 
                        cdek_client_secret: e.target.value
                      })}
                      placeholder="Введите Client Secret от СДЭК"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_city_code">Код города отправления</Label>
                    <Input
                      id="default_city_code"
                      type="number"
                      value={deliverySettings.default_city_code}
                      onChange={(e) => setDeliverySettings({
                        ...deliverySettings, 
                        default_city_code: parseInt(e.target.value)
                      })}
                     />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_city_name">Название города отправления</Label>
                    <Input
                      id="default_city_name"
                      value={deliverySettings.default_city_name}
                      onChange={(e) => setDeliverySettings({
                        ...deliverySettings, 
                        default_city_name: e.target.value
                      })}
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