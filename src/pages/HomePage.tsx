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
      {/* Hero Section - Minimalist Ami Paris Style */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-light text-white tracking-wider">
              Le Carrousel
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light tracking-wide max-w-2xl mx-auto">
              Коллекция премиальных изделий из мериносовой шерсти. 
              Минимализм, качество, элегантность.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/catalog">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black transition-all duration-300 font-light tracking-wide px-8">
                  Смотреть каталог
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Clean Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6 tracking-wide">
              Избранные модели
            </h2>
            <div className="w-16 h-px bg-primary mx-auto"></div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="font-light tracking-wide px-8">
                Все изделия
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Minimalist */}
      <section className="py-24 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6 tracking-wide">
                Мериносовая шерсть
              </h2>
              <div className="w-16 h-px bg-primary mx-auto"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 text-left">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-light mb-4 text-foreground tracking-wide">
                    Терморегуляция
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Естественная способность регулировать температуру тела в любых условиях.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-light mb-4 text-foreground tracking-wide">
                    Антибактериальные свойства
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Натуральная защита от неприятных запахов без химических добавок.
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-light mb-4 text-foreground tracking-wide">
                    Комфорт
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Тончайшие волокна обеспечивают мягкость и отсутствие раздражения.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-light mb-4 text-foreground tracking-wide">
                    Долговечность
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Качество, которое сохраняется годами при правильном уходе.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;