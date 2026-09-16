import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LookbookItem {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  season?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

const LookbookPage = () => {
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLookbookItems();
  }, []);

  const loadLookbookItems = async () => {
    try {
      const { data, error } = await supabase
        .from('lookbook_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading lookbook items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide text-foreground">
            LOOKBOOK
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Коллекция образов и стилевых решений от Shoplet
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item) => (
            <div key={item.id} className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted"></div>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-light tracking-wide text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.subtitle || item.season || ''}
                </p>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LookbookPage;