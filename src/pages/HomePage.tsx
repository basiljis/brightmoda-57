import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import heroImage from "@/assets/hero-merino.jpg";
import { ArrowRight, Star, Shield, Truck } from "lucide-react";

const HomePage = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-left max-w-2xl">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Роскошь
              <span className="block text-primary">мериносовой шерсти</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Откройте для себя коллекцию премиальной одежды из натуральной мериносовой шерсти. 
              Комфорт, элегантность и качество в каждой детали.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/catalog">
                <Button size="lg" variant="premium" className="w-full sm:w-auto">
                  Смотреть каталог
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="hero" className="w-full sm:w-auto">
                Узнать больше
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Премиум качество</h3>
              <p className="text-muted-foreground">
                Только лучшая мериносовая шерсть от ведущих производителей
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Гарантия качества</h3>
              <p className="text-muted-foreground">
                Гарантия на всю продукцию и возврат в течение 30 дней
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
              <p className="text-muted-foreground">
                Доставка по всей России от 1-3 дней
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Популярные товары
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Откройте для себя нашу коллекцию самых популярных изделий из мериносовой шерсти
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/catalog">
              <Button variant="outline" size="lg">
                Посмотреть все товары
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Почему мериносовая шерсть?
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  Натуральная терморегуляция
                </h3>
                <p className="text-muted-foreground mb-4">
                  Мериносовая шерсть естественным образом регулирует температуру тела, 
                  сохраняя тепло в холод и прохладу в жару.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  Мягкость и комфорт
                </h3>
                <p className="text-muted-foreground mb-4">
                  Тончайшие волокна мериноса не вызывают раздражения кожи и 
                  обеспечивают невероятный комфорт при носке.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  Антибактериальные свойства
                </h3>
                <p className="text-muted-foreground">
                  Натуральные антибактериальные свойства шерсти препятствуют 
                  появлению неприятных запахов.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  Долговечность
                </h3>
                <p className="text-muted-foreground">
                  При правильном уходе изделия из мериносовой шерсти служат долгие годы, 
                  сохраняя первоначальный вид.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;