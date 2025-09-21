import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ChevronDown, Minus, Plus } from "lucide-react";
import { products } from "@/data/products";
import { useState } from "react";
import RelatedProducts from "@/components/RelatedProducts";
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
  const product = products.find(p => p.id === Number(id));
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [quantity, setQuantity] = useState(1);

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
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    alert(`Added to cart: ${product.name}, size ${selectedSize}, quantity ${quantity}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-0">
            <div className="grid grid-cols-2 gap-4 h-[800px]">
              {/* Flat lay image */}
              <div className="bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Model image */}
              <div className="bg-muted">
                <img
                  src={product.image}
                  alt={`${product.name} на модели`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8 max-w-lg">
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
            <div>
              <div className="text-sm font-medium text-foreground mb-3 tracking-wide">
                COLOR {product.colors?.[selectedColor]?.name?.toUpperCase() || "CHERRY/CREAM"}
              </div>
              <div className="flex gap-2">
                {(product.colors || [
                  { name: "cherry", image: product.image },
                  { name: "blue", image: product.image }
                ]).map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`w-16 h-16 border-2 transition-all ${
                      selectedColor === index 
                        ? "border-foreground" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={color.image}
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-foreground tracking-wide">SIZE</div>
                <button className="text-sm underline text-muted-foreground hover:text-foreground">
                  SIZE GUIDE
                </button>
              </div>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full h-12 text-sm">
                  <SelectValue placeholder="XXS ONLY 1 LEFT" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size) => (
                    <SelectItem key={size} value={size} className="text-sm">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                onClick={() => setIsFavorited(!isFavorited)}
                className="w-full h-12 border border-border hover:bg-muted"
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                ДОБАВИТЬ В ИЗБРАННОЕ
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
                    <p className="mt-4">Unisex product</p>
                    <p>Oversized fit</p>
                    <p>Bandana collar</p>
                    <p>Buttoned cuffs</p>
                    <p>Mother of pearl buttons</p>
                    <p>Horizontal Ami De Coeur silver plate under back gusset</p>
                    <p>Center back length 87.2 (size XS)</p>
                    <p>Center back length 90.2 (size M)</p>
                    <p>Made in Bulgaria (with love)</p>
                    <p className="mt-4 font-medium">REF: UTP801.CO0133.693</p>
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
                    <p>Model is 5'9" and wears size S</p>
                    <p>Oversized fit - size down for a more fitted look</p>
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
                    <p className="mb-2">{product.materials}</p>
                    <div className="space-y-1">
                      {product.care.map((instruction, index) => (
                        <p key={index}>{instruction}</p>
                      ))}
                    </div>
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
                    <p>Ethically made with sustainable materials</p>
                    <p>Fair trade certified</p>
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
                    <p>Free shipping on orders over $200</p>
                    <p>30-day return policy</p>
                    <p>Express shipping available</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-24">
            <RelatedProducts 
              productIds={product.relatedProducts} 
              currentProductId={product.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;