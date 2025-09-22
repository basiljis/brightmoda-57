import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ChevronDown, Minus, Plus, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { useState, useEffect } from "react";
import RelatedProducts from "@/components/RelatedProducts";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { ImageLightbox } from "@/components/ImageLightbox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { addToCart } = useCart();
  const { isFavorited, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (name, slug),
            subcategories (name, slug),
            product_colors (
              colors (id, name, hex_code)
            ),
            product_sizes (
              sizes (id, name)
            ),
            product_color_images (
              id,
              color_id,
              image_url,
              sort_order,
              colors (name, hex_code)
            )
          `)
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching product:', error);
          return;
        }

        setProduct(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
          <Link to="/catalog">
            <Button variant="outline">Вернуться к каталогу</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.product_sizes?.length > 0 && !selectedSize) {
      alert("Выберите размер");
      return;
    }
    addToCart(product.id, quantity, selectedSize);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
  };

  // Получаем изображения для выбранного цвета
  const getImagesForSelectedColor = () => {
    if (!product.product_color_images || product.product_color_images.length === 0) {
      // Fallback на старые изображения если нет цветных
      return product.images || [];
    }

    const selectedColorData = product.product_colors?.[selectedColor];
    if (!selectedColorData) {
      // Возвращаем все изображения если цвет не выбран
      return product.product_color_images
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img: any) => img.image_url);
    }

    // Фильтруем изображения по выбранному цвету
    const colorImages = product.product_color_images
      .filter((img: any) => img.color_id === selectedColorData.colors.id)
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((img: any) => img.image_url);

    return colorImages.length > 0 ? colorImages : product.images || [];
  };

  const currentImages = getImagesForSelectedColor();

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-8">
        {/* Breadcrumbs */}
        {product && (
          <div className="mb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Главная</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/catalog">Каталог</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {product.categories && (
                  <>
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={`/catalog?category=${product.categories.slug}`}>
                          {product.categories.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                {product.subcategories && (
                  <>
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={`/catalog?category=${product.categories?.slug}&subcategory=${product.subcategories.slug}`}>
                          {product.subcategories.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Product Images - Vertical Layout */}
          <div className="space-y-4 max-h-[80vh] overflow-y-auto">
            {currentImages && currentImages.length > 0 ? (
              currentImages.map((image: string, index: number) => (
                <div 
                  key={index} 
                  className="aspect-square bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="aspect-square bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Изображение недоступно</span>
              </div>
            )}
          </div>

          {/* Product Info - Sticky */}
          <div className="lg:sticky lg:top-8 space-y-8 max-w-lg h-fit">
            {/* Product Title */}
            <div>
              <h1 className="text-2xl font-normal tracking-wide uppercase text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                {product.description}
              </p>
                <div className="text-xl font-normal text-foreground">
                  {product.price.toLocaleString()} ₽
                </div>
            </div>

            {/* Color Selection */}
            {product.product_colors && product.product_colors.length > 0 && (
              <div>
                <div className="text-sm font-medium text-foreground mb-3 tracking-wide">
                  ЦВЕТ {product.product_colors[selectedColor]?.colors?.name?.toUpperCase()}
                </div>
                <div className="flex gap-2">
                  {product.product_colors.map((pc: any, index: number) => (
                    <button
                      key={pc.colors.id}
                      onClick={() => setSelectedColor(index)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === index 
                          ? "border-foreground scale-110" 
                          : "border-border hover:border-muted-foreground"
                      }`}
                      style={{ backgroundColor: pc.colors.hex_code }}
                      title={pc.colors.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.product_sizes && product.product_sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-foreground tracking-wide">РАЗМЕР</div>
                  <button className="text-sm underline text-muted-foreground hover:text-foreground">
                    РАЗМЕРНАЯ СЕТКА
                  </button>
                </div>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full h-12 text-sm">
                    <SelectValue placeholder="Выберите размер" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.product_sizes.map((ps: any) => (
                      <SelectItem key={ps.sizes.id} value={ps.sizes.name} className="text-sm">
                        {ps.sizes.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 text-sm font-medium tracking-wide"
              >
                ДОБАВИТЬ В КОРЗИНУ {product.price} ₽
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleToggleFavorite}
                className="w-full h-12 border border-border hover:bg-muted"
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorited(product.id) ? "fill-current text-red-500" : ""}`} />
                {isFavorited(product.id) ? "УДАЛИТЬ ИЗ ИЗБРАННОГО" : "ДОБАВИТЬ В ИЗБРАННОЕ"}
              </Button>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-0 border-t border-border">
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left text-sm font-medium tracking-wide hover:bg-muted/50 transition-colors">
                  ОПИСАНИЕ
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-4">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>{product.description}</p>
                    {product.sku && (
                      <p className="mt-4 font-medium">REF: {product.sku}</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left text-sm font-medium tracking-wide border-t border-border hover:bg-muted/50 transition-colors">
                  РАЗМЕР И ПОСАДКА
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-4">
                  <div className="text-sm text-muted-foreground">
                    {product.size_fit_info ? (
                      <p>{product.size_fit_info}</p>
                    ) : (
                      <>
                        <p>Model is 5'9" and wears size S</p>
                        <p>Oversized fit - size down for a more fitted look</p>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left text-sm font-medium tracking-wide border-t border-border hover:bg-muted/50 transition-colors">
                  СОСТАВ И УХОД
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-4">
                  <div className="text-sm text-muted-foreground">
                    {product.composition_care_info ? (
                      <p>{product.composition_care_info}</p>
                    ) : (
                      <>
                        <p className="mb-2">100% мериносовая шерсть</p>
                        <div className="space-y-1">
                          <p>Деликатная стирка при 30°C</p>
                          <p>Не отбеливать</p>
                          <p>Сушить горизонтально</p>
                          <p>Гладить через влажную ткань</p>
                        </div>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left text-sm font-medium tracking-wide border-t border-border hover:bg-muted/50 transition-colors">
                  ОТВЕТСТВЕННОСТЬ
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-4">
                  <div className="text-sm text-muted-foreground">
                    {product.responsibility_info ? (
                      <p>{product.responsibility_info}</p>
                    ) : (
                      <>
                        <p>Ethically made with sustainable materials</p>
                        <p>Fair trade certified</p>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left text-sm font-medium tracking-wide border-t border-border hover:bg-muted/50 transition-colors">
                  ДОСТАВКА И ВОЗВРАТ
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-4">
                  <div className="text-sm text-muted-foreground">
                    {product.delivery_return_info ? (
                      <p>{product.delivery_return_info}</p>
                    ) : (
                      <>
                        <p>Free shipping on orders over $200</p>
                        <p>30-day return policy</p>
                        <p>Express shipping available</p>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* Image Lightbox */}
        <ImageLightbox
          images={currentImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        {/* Related Products */}
        <div className="mt-24">
          <RelatedProducts 
            productIds={[]} 
            currentProductId={product.id}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductPage;