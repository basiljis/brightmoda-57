import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface CartItem {
  id: string;
  quantity: number;
  size?: string;
  color?: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

const CartItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    recipient_name: '',
    phone: '',
    city: '',
    address: '',
    comment: '',
  });

  useEffect(() => {
    if (user) {
      loadCartItems();
    }
  }, [user]);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          size,
          color,
          product:products (
            id,
            name,
            price,
            images
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);
      
      if (error) throw error;
      
      setCartItems(items => 
        items.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось обновить количество",
        variant: "destructive"
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      setCartItems(items => items.filter(item => item.id !== itemId));
      toast({ title: "Товар удален из корзины" });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось удалить товар",
        variant: "destructive"
      });
    }
  };

  const clearCart = async () => {
    if (!confirm('Очистить корзину?')) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setCartItems([]);
      toast({ title: "Корзина очищена" });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось очистить корзину",
        variant: "destructive"
      });
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  );

  const submitOrder = async () => {
    if (!user) {
      toast({ title: 'Войдите в аккаунт', description: 'Чтобы оформить заказ, нужно войти', variant: 'destructive' });
      return;
    }
    if (!form.recipient_name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({ title: 'Заполните данные', description: 'Имя, телефон и адрес обязательны', variant: 'destructive' });
      return;
    }

    setPlacing(true);
    try {
      const items = cartItems.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size ?? null,
        color: item.color ?? null,
        image: item.product.images?.[0] ?? null,
      }));

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items,
          total_amount: totalAmount,
          status: 'pending',
          delivery_status: 'not_shipped',
          delivery_info: {
            recipient_name: form.recipient_name.trim(),
            phone: form.phone.trim(),
            city: form.city.trim(),
            address: form.address.trim(),
            comment: form.comment.trim(),
          },
        })
        .select('id')
        .single();

      if (error) throw error;

      await supabase.from('cart_items').delete().eq('user_id', user.id);
      await supabase.from('user_actions').insert({
        user_id: user.id,
        action_type: 'checkout_completed',
        entity_type: 'order',
        entity_id: order?.id ?? null,
        metadata: { total: totalAmount, items_count: items.length },
      });

      setCartItems([]);
      setCheckoutOpen(false);
      toast({ title: 'Заказ оформлен', description: 'Мы свяжемся с вами для подтверждения' });
    } catch (e: any) {
      console.error('Error placing order:', e);
      toast({
        title: 'Ошибка',
        description: e?.message || 'Не удалось оформить заказ',
        variant: 'destructive',
      });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Корзина ({cartItems.length})
          </div>
          {cartItems.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCart}>
              Очистить
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                    {item.product.images?.[0] && (
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link 
                      to={`/product/${item.product.id}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <div className="flex gap-2 mt-1">
                      {item.size && (
                        <Badge variant="outline" className="text-xs">
                          {item.size}
                        </Badge>
                      )}
                      {item.color && (
                        <Badge variant="outline" className="text-xs">
                          {item.color}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.product.price} ₽
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-lg font-semibold">{totalAmount} ₽</span>
                </div>
                <Button className="w-full" size="lg">
                  Оформить заказ
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Корзина пуста</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте товары в корзину, чтобы оформить заказ
              </p>
              <Link to="/catalog">
                <Button>Перейти к покупкам</Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItems;