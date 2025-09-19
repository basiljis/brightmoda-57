import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elegant transition-elegant border border-border">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background transition-elegant ${
            isFavorited ? "text-red-500" : "text-muted-foreground"
          }`}
          onClick={toggleFavorite}
        >
          <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
        </Button>

        {/* Discount Badge */}
        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.category}
          </p>
        </div>
        
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-elegant line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-foreground">
              {product.price.toLocaleString('ru-RU')} ₽
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.originalPrice.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>

          <Button variant="hero" size="sm">
            <ShoppingBag className="h-4 w-4 mr-2" />
            В корзину
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;