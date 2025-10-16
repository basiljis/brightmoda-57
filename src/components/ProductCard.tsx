import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Product } from "@/data/products";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";

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
  const { settings, getRoundingClass } = useCatalogSettings();
  
  const getButtonSize = () => {
    const sizes = {
      small: 'sm',
      medium: 'default',
      large: 'lg',
    };
    return sizes[settings.cart_button_size] as 'sm' | 'default' | 'lg';
  };

  const getTextAlignmentClass = () => {
    const alignments = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };
    return alignments[settings.card_text_alignment];
  };

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

  const getFavoritePositionClass = () => {
    const positions = {
      top_right: 'top-3 right-3',
      top_left: 'top-3 left-3',
      bottom_right: 'bottom-3 right-3',
      bottom_left: 'bottom-3 left-3',
    };
    return positions[settings.favorite_position];
  };

  const shouldShowOnHover = settings.show_hover_effects;

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`}>
        <div className={`relative overflow-hidden bg-card shadow-soft hover:shadow-elegant transition-all duration-300 ${getRoundingClass()}`}>
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
          
          <div className="aspect-square relative overflow-hidden">
            <img 
              src={currentImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                settings.show_image_zoom_on_hover ? 'group-hover:scale-110' : ''
              }`}
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
            
            {/* Add to Cart Button on card - with padding from edges */}
            {settings.cart_position === 'on_card' && (
              <div className={`absolute bottom-4 left-4 right-4 z-10 ${shouldShowOnHover ? (isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2') : 'opacity-100 translate-y-0'} transition-all duration-300`}>
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 rounded-sm font-light tracking-wider uppercase text-sm"
                  size="lg"
                >
                  {settings.cart_button_type === 'text' ? 'Добавить в корзину' : <ShoppingCart className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
          
          <div className={`p-6 space-y-3 ${getTextAlignmentClass()}`}>
            <div className="space-y-2">
              <h3 className={`font-light text-lg text-foreground tracking-wide group-hover:text-primary transition-colors ${getTextAlignmentClass()}`}>
                {product.name}
              </h3>
              
              {/* Color circles - приоритет данным из Supabase */}
              {((product as any).product_colors && (product as any).product_colors.length > 0) ? (
                <div className={`flex items-center space-x-2 ${settings.card_text_alignment === 'center' ? 'justify-center' : settings.card_text_alignment === 'right' ? 'justify-end' : ''}`}>
                  {(product as any).product_colors.map((pc: any, index: number) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-border/30"
                      style={{ backgroundColor: pc.colors.hex_code }}
                      title={pc.colors.name}
                    />
                  ))}
                </div>
              ) : (
                product.colors && product.colors.length > 0 && (
                  <div className={`flex items-center space-x-2 ${settings.card_text_alignment === 'center' ? 'justify-center' : settings.card_text_alignment === 'right' ? 'justify-end' : ''}`}>
                    {product.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-border/30"
                        style={{ backgroundColor: getColorHex(color) }}
                        title={typeof color === 'string' ? color : color.name}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
            
            <div className={`flex items-center pt-2 ${settings.card_text_alignment === 'center' ? 'justify-center' : settings.card_text_alignment === 'right' ? 'justify-end' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl font-light text-foreground tracking-wide">
                  {product.price.toLocaleString()} ₽
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString()} ₽
                  </span>
                )}
              </div>
            </div>
            
            {/* Button below price inside card */}
            {settings.cart_position === 'below_price' && (
              <div className={`pt-2 ${settings.card_text_alignment === 'center' ? 'flex justify-center' : settings.card_text_alignment === 'right' ? 'flex justify-end' : ''}`}>
                <Button
                  onClick={handleAddToCart}
                  className={`${settings.cart_button_type === 'icon' ? 'w-auto px-4' : 'w-[calc(100%-1rem)]'} bg-background text-foreground border border-border hover:bg-foreground hover:text-background transition-all duration-200 ${getRoundingClass()} ${shouldShowOnHover ? (isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2') : 'opacity-100 translate-y-0'}`}
                  variant="outline"
                  size={getButtonSize()}
                >
                  <ShoppingCart className={`h-4 w-4 ${settings.cart_button_type === 'text' ? 'mr-2' : ''}`} />
                  {settings.cart_button_type === 'text' && 'Добавить в корзину'}
                </Button>
              </div>
            )}
          </div>
          
          {/* Favorite Button - positioned by settings */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleFavorite}
            className={`absolute ${getFavoritePositionClass()} z-10 ${shouldShowOnHover ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity p-2 bg-background/80 backdrop-blur-sm`}
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                settings.favorite_icon_style === 'filled' && isFavorited(String(product.id))
                  ? 'fill-primary text-primary' 
                  : isFavorited(String(product.id))
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            />
          </Button>
        </div>
      </Link>
      
      {/* Add to Cart Button - показывается под карточкой при наведении (только если настройка = below_card) */}
      {settings.cart_position === 'below_card' && (
        <div className={`mt-3 transition-all duration-300 ${shouldShowOnHover ? (isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2') : 'opacity-100 translate-y-0'}`}>
          <Button
            onClick={handleAddToCart}
            className={`${settings.cart_button_type === 'icon' ? 'w-auto px-4' : 'w-full'} bg-background text-foreground border border-border hover:bg-foreground hover:text-background transition-all duration-200 ${getRoundingClass()}`}
            variant="outline"
            size={getButtonSize()}
          >
            <ShoppingCart className={`h-4 w-4 ${settings.cart_button_type === 'text' ? 'mr-2' : ''}`} />
            {settings.cart_button_type === 'text' && 'Добавить в корзину'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;