import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackAddToFavorites, trackRemoveFromFavorites } = useAnalytics();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setFavorites(data?.map(fav => fav.product_id) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({
        title: "Вход требуется",
        description: "Войдите в аккаунт, чтобы добавлять товары в избранное",
        variant: "destructive"
      });
      return;
    }

    const isFavorited = favorites.includes(productId);
    
    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== productId));
        
        // Track analytics
        trackRemoveFromFavorites(productId);
        
        toast({ title: "Удалено из избранного" });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, product_id: productId }]);
        
        if (error) throw error;
        setFavorites(prev => [...prev, productId]);
        
        // Track analytics - получим название товара для аналитики
        try {
          const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', productId)
            .single();
          
          trackAddToFavorites(productId, product?.name);
        } catch (error) {
          console.error('Error tracking analytics:', error);
          // Fallback без названия
          trackAddToFavorites(productId);
        }
        
        toast({ title: "Добавлено в избранное" });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить избранное",
        variant: "destructive"
      });
    }
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorited: (productId: string) => favorites.includes(productId)
  };
};