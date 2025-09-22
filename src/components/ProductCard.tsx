import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Product } from "@/data/products";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: Product;
}

const getColorValue = (colorName: string) => {
  const colorMap: { [key: string]: string } = {
    beige: "#F5F5DC",
    cream: "#FFFDD0", 
    black: "#000000",
    navy: "#000080",
    grey: "#808080",
    white: "#FFFFFF",
    brown: "#8B4513"
  };
  return colorMap[colorName] || "#CCCCCC";
};

// Функция для получения hex кода цвета из разных форматов данных
const getColorHex = (color: any) => {
  // Если это объект с hex_code (данные из Supabase)
  if (color.hex_code) {
    return color.hex_code;
  }
  // Если это объект с name (статические данные)
  if (color.name) {
    return getColorValue(color.name);
  }
  // Если это просто строка (название цвета)
  if (typeof color === 'string') {
    return getColorValue(color);
  }
  return "#CCCCCC";
};

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorited, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  // Получаем изображения для выбранного цвета в карточке товара
  const getDisplayImages = () => {
    const images: string[] = [];
    
    // Проверяем цветные изображения из Supabase
    if ((product as any).product_color_images && Array.isArray((product as any).product_color_images)) {
      const colorImages = (product as any).product_color_images as any[];
      if (colorImages.length > 0) {
        // Группируем по цветам и берем первое изображение каждого цвета для превью
        const imagesByColor = colorImages.reduce((acc: any, img: any) => {
          if (!acc[img.color_id]) {
            acc[img.color_id] = [];
          }
          acc[img.color_id].push(img);
          return acc;
        }, {});
        
        // Берем первое изображение первого доступного цвета
        const firstColorId = Object.keys(imagesByColor)[0];
        if (firstColorId && imagesByColor[firstColorId].length > 0) {
          images.push(...imagesByColor[firstColorId]
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((img: any) => img.image_url)
            .slice(0, 2));
        }
      }
    }
    
    // Fallback на обычные изображения
    if (images.length === 0) {
      if ((product as any).images && Array.isArray((product as any).images)) {
        images.push(...(product as any).images.slice(0, 2));
      } else if (product.image) {
        images.push(product.image);
        if (product.hoverImage) {
          images.push(product.hoverImage);
        }
      }
    }
    
    // Фильтруем пустые строки и берем максимум 2
    return images.filter(img => img && img.trim() !== '').slice(0, 2);
  };

  const displayImages = getDisplayImages();
  const currentImage = displayImages.length > 0 
    ? (isHovered && displayImages[1] ? displayImages[1] : displayImages[0])
    : '/placeholder.svg'; // Fallback изображение
  const hasMultipleImages = displayImages.length > 1;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(String(product.id));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(String(product.id));
  };

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden bg-card rounded-none shadow-soft hover:shadow-elegant transition-all duration-300">
          {/* Labels */}
          {(product.isNew || product.isPreorder) && (
            <div className="absolute top-3 left-3 z-10">
              {product.isNew && (
                <span className="bg-background text-foreground text-xs font-medium px-2 py-1 rounded-sm">
                  NEW
                </span>
              )}
              {product.isPreorder && (
                <span className="bg-background text-foreground text-xs font-medium px-2 py-1 rounded-sm">
                  ПРЕДЗАКАЗ
                </span>
              )}
            </div>
          )}
          
          <div className="aspect-square relative">
            <img 
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
            
            {/* Индикатор множественных изображений */}
            {hasMultipleImages && (
              <div className="absolute bottom-3 right-3 z-10">
                <div className="flex space-x-1">
                  {displayImages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        (index === 0 && !isHovered) || (index === 1 && isHovered)
                          ? 'bg-white shadow-md' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 space-y-3">
            <div className="space-y-2">
              <h3 className="font-light text-lg text-foreground tracking-wide group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              
              {/* Color circles - показываются если есть цвета */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center space-x-2">
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-border/30"
                      style={{ backgroundColor: getColorHex(color) }}
                      title={typeof color === 'string' ? color : color.name}
                    />
                  ))}
                </div>
              )}
              
              {/* Color circles для данных из Supabase (product_colors) */}
              {(product as any).product_colors && (product as any).product_colors.length > 0 && (
                <div className="flex items-center space-x-2">
                  {(product as any).product_colors.map((pc: any, index: number) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-border/30"
                      style={{ backgroundColor: pc.colors.hex_code }}
                      title={pc.colors.name}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString()} ₽
                  </span>
                )}
                <span className="text-xl font-light text-foreground tracking-wide">
                  {product.price.toLocaleString()} ₽
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleFavorite}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
              >
                <Heart 
                  className={`h-4 w-4 transition-colors ${
                    isFavorited(String(product.id)) ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Add to Cart Button - показывается под карточкой при наведении */}
      <div className={`mt-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <Button
          onClick={handleAddToCart}
          className="w-full bg-background text-foreground border border-border hover:bg-foreground hover:text-background transition-all duration-200"
          variant="outline"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Добавить в корзину
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;