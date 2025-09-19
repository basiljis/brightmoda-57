import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, ShoppingBag, ArrowLeft, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { products } from "@/data/products";
import { useState } from "react";

const ProductPage = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const [selectedSize, setSelectedSize] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);

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
      alert("Пожалуйста, выберите размер");
      return;
    }
    // Here would be cart logic
    alert(`Добавлено в корзину: ${product.name}, размер ${selectedSize}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <Link to="/catalog" className="flex items-center text-muted-foreground hover:text-primary transition-elegant">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к каталогу
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative bg-card rounded-lg overflow-hidden shadow-soft">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[600px] object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background transition-elegant ${
                  isFavorited ? "text-red-500" : "text-muted-foreground"
                }`}
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart className={`h-6 w-6 ${isFavorited ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {product.originalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                    <Badge variant="destructive">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-muted-foreground">(127 отзывов)</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Описание</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Размер</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className="min-w-12"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Добавить в корзину
              </Button>
              
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  В избранное
                </Button>
                <Button variant="outline" size="sm">
                  Таблица размеров
                </Button>
                <Button variant="outline" size="sm">
                  Поделиться
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-card p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm">Бесплатная доставка от 5000 ₽</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span className="text-sm">Возврат в течение 30 дней</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">Гарантия качества</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Product Details */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Особенности</h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Материал</h3>
            <p className="text-sm text-muted-foreground">
              {product.materials}
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Уход</h3>
            <ul className="space-y-2">
              {product.care.map((instruction, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;