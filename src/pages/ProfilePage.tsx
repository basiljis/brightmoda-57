import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Settings, ShoppingBag, Heart, MapPin, Phone, Mail } from "lucide-react";

const ProfilePage = () => {
  // Примечание: для полноценной работы потребуется аутентификация через Supabase
  
  const orderHistory = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "Доставлен",
      total: 12900,
      items: 2
    },
    {
      id: "ORD-002", 
      date: "2024-01-10",
      status: "В пути",
      total: 18500,
      items: 1
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Личный кабинет</h1>
              <p className="text-muted-foreground">Управляйте своим аккаунтом</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Личная информация</h2>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Имя</Label>
                  <Input id="firstName" defaultValue="Анна" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input id="lastName" defaultValue="Петрова" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="anna@example.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" defaultValue="+7 (999) 123-45-67" className="mt-1" />
                </div>
              </div>

              <div className="mt-6">
                <Button>Сохранить изменения</Button>
              </div>
            </Card>

            {/* Order History */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">История заказов</h2>
                <Button variant="outline" size="sm">
                  Все заказы
                </Button>
              </div>

              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div key={order.id} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">#{order.id}</span>
                        <Badge variant={order.status === "Доставлен" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{order.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {order.items} товар{order.items > 1 ? 'а' : ''}
                      </span>
                      <span className="font-semibold">
                        {order.total.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Быстрые действия</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Мои заказы
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Избранное
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Адреса доставки
                </Button>
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Контактная информация</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>anna@example.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+7 (999) 123-45-67</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Москва, Россия</span>
                </div>
              </div>
            </Card>

            {/* Account Status */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Статус аккаунта</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Статус:</span>
                  <Badge>Активен</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Заказов:</span>
                  <span>{orderHistory.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Общая сумма:</span>
                  <span>
                    {orderHistory.reduce((sum, order) => sum + order.total, 0).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;