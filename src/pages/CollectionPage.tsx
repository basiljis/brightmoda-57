import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/data/products';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';

interface DBProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  is_new?: boolean;
  is_preorder?: boolean;
  collection_id?: string;
  description?: string;
  category?: string;
  colors?: string[];
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

interface Color {
  id: string;
  name: string;
  hex_code: string;
}

const CollectionPage = () => {
  const { collection: collectionSlug } = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [productColors, setProductColors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const { getGridClasses, getContainerClass } = useCatalogSettings();
  
  const [sortBy, setSortBy] = useState('default');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    loadCollectionAndProducts();
    loadColors();
  }, [collectionSlug]);

  const loadCollectionAndProducts = async () => {
    if (!collectionSlug) return;
    
    try {
      setLoading(true);

      // Load collection info
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', collectionSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (collectionError) throw collectionError;
      setCollection(collectionData);

      if (!collectionData) {
        setLoading(false);
        return;
      }

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('collection_id', collectionData.id)
        .eq('is_active', true);

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Load product colors mapping
      if (productsData && productsData.length > 0) {
        const { data: productColorsData } = await supabase
          .from('product_colors')
          .select('product_id, color_id')
          .in('product_id', productsData.map(p => p.id));

        const colorMap: Record<string, string[]> = {};
        productColorsData?.forEach(pc => {
          if (!colorMap[pc.product_id]) {
            colorMap[pc.product_id] = [];
          }
          colorMap[pc.product_id].push(pc.color_id);
        });
        setProductColors(colorMap);
      }

    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadColors = async () => {
    try {
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setColors(data || []);
    } catch (error) {
      console.error('Error loading colors:', error);
    }
  };

  const toggleColor = (colorId: string) => {
    setSelectedColors(prev =>
      prev.includes(colorId)
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSortBy('default');
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Filter by colors
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => {
        const productColorIds = productColors[product.id] || [];
        return selectedColors.some(colorId => productColorIds.includes(colorId));
      });
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();
  const activeFiltersCount = selectedColors.length + (sortBy !== 'default' ? 1 : 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Коллекция не найдена</h1>
          <p className="text-muted-foreground">Коллекция с таким адресом не существует</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {collection.image_url && (
        <div className="relative h-[300px] md:h-[400px] mb-8">
          <img
            src={collection.image_url}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{collection.name}</h1>
              {collection.description && (
                <p className="text-lg md:text-xl max-w-2xl mx-auto">{collection.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!collection.image_url && (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{collection.name}</h1>
            {collection.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{collection.description}</p>
            )}
          </div>
          <Separator className="mb-8" />
        </div>
      )}

      {/* Products Section */}
      <div className={getContainerClass()}>
        {/* Filters Bar */}
        <div className="flex items-center justify-between mb-8 pb-8">
          <div className="text-sm text-muted-foreground">
            Найдено товаров: {filteredProducts.length}
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">По умолчанию</SelectItem>
                <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                <SelectItem value="price-desc">Сначала дороже</SelectItem>
              </SelectContent>
            </Select>

            {/* Filters Button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Фильтры
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center" variant="default">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Colors */}
                  {colors.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Цвет</h3>
                      <div className="space-y-2">
                        {colors.map((color) => (
                          <div key={color.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`color-${color.id}`}
                              checked={selectedColors.includes(color.id)}
                              onCheckedChange={() => toggleColor(color.id)}
                            />
                            <Label 
                              htmlFor={`color-${color.id}`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <div
                                className="w-5 h-5 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hex_code }}
                              />
                              {color.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Сбросить фильтры
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              {products.length === 0 
                ? 'В этой коллекции пока нет товаров'
                : 'Товары не найдены. Попробуйте изменить фильтры'}
            </p>
          </div>
        ) : (
          <div className={getGridClasses()}>
            {filteredProducts.map((product, index) => {
              // Convert DBProduct to Product format for ProductCard
              const productForCard: Product = {
                id: index + 1, // Use index as number ID for display
                name: product.name,
                price: product.price,
                image: product.images[0] || '',
                hoverImage: product.images[1],
                category: product.category || 'Коллекция',
                description: product.description || '',
                features: [],
                materials: '',
                care: [],
                sizes: [],
                isNew: product.is_new,
                isPreorder: product.is_preorder,
              };
              
              return <ProductCard key={product.id} product={productForCard} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
