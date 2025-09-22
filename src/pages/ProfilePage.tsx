import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, Heart, MapPin, ShoppingCart, LogOut, Settings } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DeliveryAddresses from '@/components/profile/DeliveryAddresses';
import CartItems from '@/components/profile/CartItems';

const ProfilePage = () => {
  const { user, signOut, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadOrders();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      setProfile(data);
      setEditForm({
        full_name: data?.full_name || '',
        phone: data?.phone || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone
        })
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setProfile(prev => ({
        ...prev,
        full_name: editForm.full_name,
        phone: editForm.phone
      }));
      setIsEditing(false);
      toast({
        title: "Профиль обновлен",
        description: "Изменения успешно сохранены",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из аккаунта",
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Заказы
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Избранное
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Адреса
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Корзина
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Личная информация
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Редактировать
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Полное имя</Label>
                  <Input 
                    id="name" 
                    value={isEditing ? editForm.full_name : profile?.full_name || ''} 
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile?.email || user?.email || ''} 
                    className="bg-muted"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={isEditing ? editForm.phone : profile?.phone || ''} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveProfile}>
                      Сохранить изменения
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        full_name: profile?.full_name || '',
                        phone: profile?.phone || ''
                      });
                    }}>
                      Отмена
                    </Button>
                  </div>
                )}
                
                {/* Account Status */}
                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-4">Статус аккаунта</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Количество заказов</span>
                      <p className="font-semibold">{orders.length}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Сумма покупок</span>
                      <p className="font-semibold">
                        {orders.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount || 0), 0)} ₽
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Статус</span>
                      <p><Badge>{profile?.role === 'admin' ? 'Администратор' : 'Клиент'}</Badge></p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Регистрация</span>
                      <p className="text-sm">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU') : '—'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/admin">
                        <Settings className="h-4 w-4 mr-2" />
                        Панель администратора
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  История заказов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length > 0 ? orders.map((order: any) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Заказ #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{order.total_amount} руб.</p>
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {order.status === 'pending' ? 'В обработке' : 
                             order.status === 'completed' ? 'Выполнен' : order.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Заказов пока нет</h3>
                      <p className="text-muted-foreground mb-4">
                        Сделайте первый заказ, чтобы увидеть его здесь
                      </p>
                      <Link to="/catalog">
                        <Button>Перейти к покупкам</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Link to="/favorites">
              <Button className="mb-4">Перейти на страницу избранного</Button>
            </Link>
            <p className="text-muted-foreground">
              Управляйте своими избранными товарами на отдельной странице
            </p>
          </TabsContent>

          <TabsContent value="addresses">
            <DeliveryAddresses />
          </TabsContent>

          <TabsContent value="cart">
            <CartItems />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;