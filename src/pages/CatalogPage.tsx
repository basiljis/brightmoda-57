import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [colors, setColors] = useState([]);
  const [productColors, setProductColors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    loadData();
    
    // Set initial filters from URL
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (subcategoryParam) {
      setSelectedSubcategory(subcategoryParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Load subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select(`
          *,
          categories(name, slug)
        `)
        .eq('is_active', true)
        .order('sort_order');
      
      if (subcategoriesError) throw subcategoriesError;
      setSubcategories(subcategoriesData || []);

      // Load collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (collectionsError) throw collectionsError;
      setCollections(collectionsData || []);

      // Load colors
      const { data: colorsData, error: colorsError } = await supabase
        .from('colors')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (colorsError) throw colorsError;
      setColors(colorsData || []);

      // Load product-color relationships
      const { data: productColorsData, error: productColorsError } = await supabase
        .from('product_colors')
        .select('product_id, color_id');
      
      if (productColorsError) throw productColorsError;
      
      // Create a map of product_id -> [color_ids]
      const productColorMap: Record<string, string[]> = {};
      (productColorsData || []).forEach(pc => {
        if (!productColorMap[pc.product_id]) {
          productColorMap[pc.product_id] = [];
        }
        productColorMap[pc.product_id].push(pc.color_id);
      });
      setProductColors(productColorMap);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  
  // Find current category and subcategory objects
  const currentCategory = categories.find(cat => cat.slug === selectedCategory);
  const currentSubcategory = subcategories.find(sub => sub.slug === selectedSubcategory);
  
  // Filter products based on current filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesCategory = true;
    if (selectedCategory !== "Все" && currentCategory) {
      matchesCategory = product.category_id === currentCategory.id;
    }
    
    let matchesSubcategory = true;
    if (selectedSubcategory && currentSubcategory) {
      matchesSubcategory = product.subcategory_id === currentSubcategory.id;
    }

    let matchesCollection = true;
    if (selectedCollections.length > 0) {
      matchesCollection = selectedCollections.includes(product.collection_id);
    }

    let matchesColor = true;
    if (selectedColors.length > 0) {
      // Check if product has any of the selected colors
      const prodColors = productColors[product.id] || [];
      matchesColor = prodColors.some(colorId => selectedColors.includes(colorId));
    }
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesCollection && matchesColor;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") {
      return Number(a.price) - Number(b.price);
    } else if (sortBy === "price_desc") {
      return Number(b.price) - Number(a.price);
    }
    return 0; // default - no sorting
  });

  // Get filtered subcategories for current category
  const availableSubcategories = selectedCategory !== "Все" && currentCategory
    ? subcategories.filter(sub => sub.categories?.slug === selectedCategory)
    : [];

  const allCategories = ["Все", ...categories.map(cat => cat.slug)];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Загрузка товаров...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Каталог товаров</h1>
          <p className="text-muted-foreground">
            Коллекция премиальной одежды из мериносовой шерсти
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-card p-6 rounded-lg shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск товаров..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {allCategories.map((categorySlug) => {
                const category = categories.find(cat => cat.slug === categorySlug);
                const displayName = categorySlug === "Все" ? "Все" : category?.name || categorySlug;
                
                return (
                  <Badge
                    key={categorySlug}
                    variant={selectedCategory === categorySlug ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-elegant"
                    onClick={() => {
                      setSelectedCategory(categorySlug);
                      setSelectedSubcategory(""); // Reset subcategory when category changes
                    }}
                  >
                    {displayName}
                  </Badge>
                );
              })}
            </div>

            {/* Subcategory Filter */}
            {availableSubcategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={!selectedSubcategory ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-elegant"
                  onClick={() => setSelectedSubcategory("")}
                >
                  Все подкатегории
                </Badge>
                {availableSubcategories.map((subcategory) => (
                  <Badge
                    key={subcategory.id}
                    variant={selectedSubcategory === subcategory.slug ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-elegant"
                    onClick={() => setSelectedSubcategory(subcategory.slug)}
                  >
                    {subcategory.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Найдено {sortedProducts.length} товар{sortedProducts.length !== 1 && sortedProducts.length < 5 ? 'а' : 'ов'}
          </p>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
                {(sortBy !== "default" || selectedCollections.length > 0 || selectedColors.length > 0) && (
                  <Badge variant="default" className="ml-2">
                    {(sortBy !== "default" ? 1 : 0) + selectedCollections.length + selectedColors.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Фильтры</SheetTitle>
                <SheetDescription>
                  Настройте параметры для поиска товаров
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                <div className="space-y-6 pr-4">
                  {/* Sort by price */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Сортировка по цене</Label>
                    <RadioGroup value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="default" id="default" />
                        <Label htmlFor="default" className="font-normal cursor-pointer">По умолчанию</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="price_asc" id="price_asc" />
                        <Label htmlFor="price_asc" className="font-normal cursor-pointer">Сначала дешевле</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="price_desc" id="price_desc" />
                        <Label htmlFor="price_desc" className="font-normal cursor-pointer">Сначала дороже</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Collections filter */}
                  {collections.length > 0 && (
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Коллекции</Label>
                      <div className="space-y-2">
                        {collections.map((collection) => (
                          <div key={collection.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`collection-${collection.id}`}
                              checked={selectedCollections.includes(collection.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCollections([...selectedCollections, collection.id]);
                                } else {
                                  setSelectedCollections(selectedCollections.filter(id => id !== collection.id));
                                }
                              }}
                            />
                            <Label 
                              htmlFor={`collection-${collection.id}`} 
                              className="font-normal cursor-pointer"
                            >
                              {collection.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors filter */}
                  {colors.length > 0 && (
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Цвет</Label>
                      <div className="space-y-2">
                        {colors.map((color) => (
                          <div key={color.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`color-${color.id}`}
                              checked={selectedColors.includes(color.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedColors([...selectedColors, color.id]);
                                } else {
                                  setSelectedColors(selectedColors.filter(id => id !== color.id));
                                }
                              }}
                            />
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-border" 
                                style={{ backgroundColor: color.hex_code }}
                              />
                              <Label 
                                htmlFor={`color-${color.id}`} 
                                className="font-normal cursor-pointer"
                              >
                                {color.name}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Clear filters button */}
              {(sortBy !== "default" || selectedCollections.length > 0 || selectedColors.length > 0) && (
                <div className="absolute bottom-4 left-4 right-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSortBy("default");
                      setSelectedCollections([]);
                      setSelectedColors([]);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Товары не найдены
            </h3>
            <p className="text-muted-foreground mb-4">
              Попробуйте изменить поисковый запрос или фильтры
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Все");
                setSelectedSubcategory("");
                setSortBy("default");
                setSelectedCollections([]);
                setSelectedColors([]);
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  image: product.images?.[0] || '/placeholder.svg',
                  images: product.images || [],
                  isNew: product.is_new || false,
                  isFeatured: product.is_featured || false,
                  isPreorder: product.is_preorder || false
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;