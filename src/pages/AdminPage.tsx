import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Package, Settings, ShoppingCart, BookOpen, HelpCircle, Edit, Trash2, Upload, Search, EyeOff, Eye, Send, Menu, Type, CreditCard } from 'lucide-react';
import ReferenceManagement from '@/components/admin/ReferenceManagement';
import ProductForm from '@/components/admin/ProductForm';
import ProductEdit from '@/components/admin/ProductEdit';
import LookbookManagement from '@/components/admin/LookbookManagement';
import PageContentManagement from '@/components/admin/PageContentManagement';
import ProductImportExport from '@/components/admin/ProductImportExport';
import EmailSubscriptionManagement from '@/components/admin/EmailSubscriptionManagement';
import EmailSettings from '@/components/admin/EmailSettings';
import HeaderCollectionManagement from '@/components/admin/HeaderCollectionManagement';
import SiteSettings from '@/components/admin/SiteSettings';
import SEOSettings from '@/components/admin/SEOSettings';
import FontSettings from '@/components/admin/FontSettings';
import YandexPaymentSettings from '@/components/admin/YandexPaymentSettings';
import HiddenSectionsManager from '@/components/admin/HiddenSectionsManager';

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("products");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      loadOrders();
      loadDeliverySettings();
      loadSectionVisibility();
    }
  }, [isAdmin]);

  const loadSectionVisibility = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_section_visibility')
        .select('section_name, is_visible')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      const hidden = data?.filter(item => !item.is_visible).map(item => item.section_name) || [];
      setHiddenSections(hidden);
    } catch (error) {
      console.error('Error loading section visibility:', error);
    }
  };

  const toggleSectionVisibility = async (sectionName: string) => {
    const isCurrentlyHidden = hiddenSections.includes(sectionName);
    const newVisibility = isCurrentlyHidden;
    
    try {
      const { error } = await supabase
        .from('admin_section_visibility')
        .upsert({
          user_id: user?.id,
          section_name: sectionName,
          is_visible: newVisibility
        });

      if (error) throw error;

      setHiddenSections(prev => 
        newVisibility 
          ? prev.filter(name => name !== sectionName)
          : [...prev, sectionName]
      );

      toast({
        title: newVisibility ? "Раздел показан" : "Раздел скрыт",
        description: `Раздел "${sectionName}" ${newVisibility ? 'отображается' : 'скрыт'}`,
      });
    } catch (error) {
      console.error('Error toggling section visibility:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить видимость раздела",
        variant: "destructive",
      });
    }
  };

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
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product: any) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categories?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategories?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, products]);

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
  }, [filteredProducts, itemsPerPage]);

  // Get current page products
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
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

  const handleToggleProductVisibility = async (productId: string, currentStatus: boolean, productName: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Товар скрыт" : "Товар показан",
        description: `Товар "${productName}" ${currentStatus ? 'скрыт' : 'отображается'} в каталоге`,
      });

      loadProducts();
    } catch (error) {
      console.error('Error toggling product visibility:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить видимость товара",
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

  const tabItems = [
    { value: "products", label: "Товары", icon: Package },
    { value: "references", label: "Справочники", icon: BookOpen },
    { value: "content", label: "Контент", icon: Edit },
    { value: "orders", label: "Заказы", icon: ShoppingCart },
    { value: "settings", label: "Настройки", icon: Settings },
    { value: "instructions", label: "Инструкции", icon: HelpCircle },
    { value: "subscriptions", label: "Подписки", icon: Send },
  ].filter(item => !hiddenSections.includes(item.value));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Админ-панель</h1>
          <p className="text-muted-foreground">Управление товарами и настройками</p>
        </div>
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4 mr-2" />
                Меню
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Админ-панель</h2>
              </div>
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {tabItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.value}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          activeTab === item.value 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => {
                          setActiveTab(item.value);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <HiddenSectionsManager 
        hiddenSections={hiddenSections}
        onRestoreSection={toggleSectionVisibility}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {!isMobile && (
          <TabsList className="grid w-full grid-cols-8">
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger key={item.value} value={item.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        )}

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Товары</h2>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => toggleSectionVisibility('products')}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Скрыть раздел
            </Button>
          </div>
          
          <Tabs defaultValue="management" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="management">Управление товарами</TabsTrigger>
              <TabsTrigger value="import-export">Импорт/Экспорт</TabsTrigger>
            </TabsList>
            
            <TabsContent value="management" className="space-y-6">
              <ProductForm onProductAdded={handleProductAdded} />

              <Card>
                <CardHeader>
                  <CardTitle>Список товаров</CardTitle>
                  <CardDescription>
                    Всего товаров: {filteredProducts.length} из {products.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and pagination controls */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Поиск по названию, артиклу, категории..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="items-per-page" className="text-sm whitespace-nowrap">
                        Показать:
                      </Label>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(parseInt(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {getCurrentPageProducts().map((product: any) => (
                      <div key={product.id} className={`p-4 border rounded-lg ${!product.is_active ? 'opacity-60 bg-muted/30' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{product.name}</h3>
                              {!product.is_active && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  Скрыт
                                </span>
                              )}
                              {product.sku && (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  {product.sku}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {product.categories?.name && (
                                <span>Категория: {product.categories.name}</span>
                              )}
                              {product.subcategories?.name && (
                                <span> | Подкатегория: {product.subcategories.name}</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Цена: {product.price} руб.
                            </p>
                            {product.product_colors?.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <span className="text-xs text-muted-foreground">Цвета:</span>
                                {product.product_colors.map((pc: any) => (
                                  <div
                                    key={pc.colors.name}
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: pc.colors.hex_code }}
                                    title={pc.colors.name}
                                  />
                                ))}
                              </div>
                            )}
                            {product.product_sizes?.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Размеры: {product.product_sizes.map((ps: any) => ps.sizes.name).join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleProductVisibility(product.id, product.is_active, product.name)}
                            >
                              {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                              }}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }
                            
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(pageNumber);
                                  }}
                                  isActive={currentPage === pageNumber}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                              }}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <ProductEdit
                product={editingProduct}
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onProductUpdated={handleProductUpdated}
              />
            </TabsContent>
            
            <TabsContent value="import-export">
              <ProductImportExport />
            </TabsContent>
          </Tabs>
        </TabsContent>


        <TabsContent value="references">
          <ReferenceManagement />
        </TabsContent>

        <TabsContent value="content">
          <Tabs defaultValue="pages" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pages">Страницы</TabsTrigger>
              <TabsTrigger value="lookbook">Lookbook</TabsTrigger>
              <TabsTrigger value="header-collections">Коллекции в шапке</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pages">
              <PageContentManagement />
            </TabsContent>
            
            <TabsContent value="lookbook">
              <LookbookManagement />
            </TabsContent>
            
            <TabsContent value="header-collections">
              <HeaderCollectionManagement />
            </TabsContent>
          </Tabs>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Настройки</h2>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => toggleSectionVisibility('settings')}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Скрыть раздел
            </Button>
          </div>
          
          <Tabs defaultValue="delivery" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="delivery">Доставка</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="site">Сайт</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="fonts">Шрифты</TabsTrigger>
              <TabsTrigger value="payments">Платежи</TabsTrigger>
            </TabsList>
            
            <TabsContent value="delivery">
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
            
            <TabsContent value="email">
              <EmailSettings />
            </TabsContent>
            
            <TabsContent value="site">
              <SiteSettings />
            </TabsContent>
            
            <TabsContent value="seo">
              <SEOSettings />
            </TabsContent>
            
            <TabsContent value="fonts">
              <FontSettings />
            </TabsContent>
            
            <TabsContent value="payments">
              <YandexPaymentSettings />
            </TabsContent>
          </Tabs>
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

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">6. Импорт и экспорт товаров</h3>
                  <div className="pl-4 space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h4 className="font-semibold text-green-800 mb-2">📋 Шаблон для заполнения</h4>
                      <p className="text-sm text-green-700 mb-2">
                        Перед массовой загрузкой товаров обязательно скачайте и изучите шаблон в разделе <strong>"Импорт/Экспорт"</strong>
                      </p>
                      <div className="text-sm text-green-700 space-y-1">
                        <p><strong>Обязательные поля:</strong></p>
                        <ul className="list-disc list-inside ml-2 space-y-0.5">
                          <li>name - название товара</li>
                          <li>price - цена в рублях</li>
                          <li>category - slug категории</li>
                          <li>images - хотя бы одно изображение</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-semibold text-blue-800 mb-2">🔧 Правила заполнения CSV</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <strong>Разделители:</strong> Используйте символ "|" для перечисления (цвета|размеры|изображения)</li>
                        <li>• <strong>Справочники:</strong> Сначала скачайте справочники для получения правильных slug</li>
                        <li>• <strong>Логические поля:</strong> Только true или false (is_featured, is_new, is_preorder)</li>
                        <li>• <strong>Кодировка:</strong> Сохраняйте файл в UTF-8 для корректного отображения русского текста</li>
                        <li>• <strong>Формат:</strong> CSV с разделителем ";" (точка с запятой) для Excel</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                      <h4 className="font-semibold text-orange-800 mb-2">📊 Порядок действий при импорте</h4>
                      <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                        <li>Скачайте справочники (категории, цвета, размеры, коллекции)</li>
                        <li>Скачайте шаблон CSV файла с примерами</li>
                        <li>Заполните данные по образцу, используя slug из справочников</li>
                        <li>Проверьте обязательные поля и форматирование</li>
                        <li>Сохраните файл в формате CSV (UTF-8, разделитель ";")</li>
                        <li>Загрузите файл через раздел "Импорт/Экспорт"</li>
                      </ol>
                    </div>
                    
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                      <h4 className="font-semibold text-purple-800 mb-2">💾 Функции экспорта</h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• <strong>Экспорт товаров:</strong> Скачайте все товары в CSV для редактирования</li>
                        <li>• <strong>Справочники:</strong> Выгрузите текущие категории, цвета, размеры</li>
                        <li>• <strong>Резервные копии:</strong> Регулярно создавайте экспорты для безопасности</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <h4 className="font-semibold text-blue-800">💡 Рекомендации</h4>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• Регулярно проверяйте актуальность товаров и их наличие</li>
                    <li>• Ведите единообразие в названиях и описаниях</li>
                    <li>• Используйте качественные изображения для лучшей конверсии</li>
                    <li>• Своевременно обновляйте статусы заказов</li>
                    <li>• Создавайте резервные копии данных через экспорт</li>
                    <li>• Тестируйте импорт на небольших файлах перед массовой загрузкой</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                  <h4 className="font-semibold text-amber-800">⚠️ Важные моменты</h4>
                  <ul className="mt-2 text-sm text-amber-700 space-y-1">
                    <li>• Удаление категорий повлияет на все связанные товары</li>
                    <li>• Изменения в справочниках отражаются на сайте мгновенно</li>
                    <li>• Сохраняйте резервные копии перед массовыми изменениями</li>
                    <li>• При ошибках импорта проверьте формат файла и обязательные поля</li>
                    <li>• Дублирующиеся артикулы (SKU) могут вызвать ошибки импорта</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions">
          <EmailSubscriptionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;