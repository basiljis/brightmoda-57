import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Product } from "@/data/products";

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

const ProductCard = ({ product }: ProductCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to cart logic here
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
              src={isHovered && product.hoverImage ? product.hoverImage : product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
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
                      style={{ backgroundColor: getColorValue(color.name) }}
                      title={color.name}
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
                onClick={toggleFavorite}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
              >
                <Heart 
                  className={`h-4 w-4 transition-colors ${
                    isFavorited ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'
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