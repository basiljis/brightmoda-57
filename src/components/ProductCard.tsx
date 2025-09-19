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
    <div className="group cursor-pointer">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden bg-card rounded-none shadow-soft hover:shadow-elegant transition-all duration-300">
          <div className="aspect-square">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          
          <div className="p-6 space-y-3">
            <h3 className="font-light text-lg text-foreground tracking-wide group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-light text-foreground tracking-wide">
                {product.price.toLocaleString()} ₽
              </span>
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
    </div>
  );
};

export default ProductCard;