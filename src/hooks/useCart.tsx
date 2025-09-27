import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';

interface CartItem {
  id: string;
  quantity: number;
  size?: string;
  color?: string;
  product_id: string;
}

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackAddToCart, trackRemoveFromCart } = useAnalytics();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCartItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1, size?: string, color?: string) => {
    if (!user) {
      toast({
        title: "Вход требуется",
        description: "Войдите в аккаунт, чтобы добавлять товары в корзину",
        variant: "destructive"
      });
      return;
    }

    try {
      // Проверяем, есть ли уже такой товар в корзине
      const existingItem = cartItems.find(item => 
        item.product_id === productId && 
        item.size === size && 
        item.color === color
      );

      if (existingItem) {
        // Обновляем количество
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        
        if (error) throw error;
        
        setCartItems(prev => 
          prev.map(item => 
            item.id === existingItem.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        );
      } else {
        // Добавляем новый товар
        const { data, error } = await supabase
          .from('cart_items')
          .insert([{ 
            user_id: user.id, 
            product_id: productId, 
            quantity,
            size,
            color
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        setCartItems(prev => [...prev, data]);
      }
      
      // Track analytics - получим данные о товаре для цены
      try {
        const { data: product } = await supabase
          .from('products')
          .select('price, name')
          .eq('id', productId)
          .single();
        
        if (product) {
          trackAddToCart(productId, quantity, product.price);
        }
      } catch (error) {
        console.error('Error tracking analytics:', error);
      }
      
      toast({ title: "Товар добавлен в корзину" });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар в корзину",
        variant: "destructive"
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      // Сначала получаем данные об удаляемом товаре для аналитики
      const itemToRemove = cartItems.find(item => item.id === itemId);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      
      // Track analytics
      if (itemToRemove) {
        trackRemoveFromCart(itemToRemove.product_id, itemToRemove.quantity);
      }
      
      toast({ title: "Товар удален из корзины" });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар из корзины",
        variant: "destructive"
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      
      if (error) throw error;
      
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
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

  const clearCart = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      
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

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemsCount,
    loadCartItems,
    cartCount: getCartItemsCount()
  };
};