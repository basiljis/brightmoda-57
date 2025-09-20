import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import menCollection from "@/assets/men-collection.jpg";
import womenCollection from "@/assets/women-collection.jpg";
import categoryClothing from "@/assets/category-clothing.jpg";
import categoryInterior from "@/assets/category-interior.jpg";
import { ArrowRight, Star, Shield, Truck } from "lucide-react";
import { useEffect, useState } from "react";

const HomePage = () => {
  const featuredProducts = products.slice(0, 4);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Split Collection Layout */}
      <section className="h-screen relative overflow-hidden">
        <div className="grid md:grid-cols-2 h-full">
          {/* Men's Collection */}
          <div className="relative group cursor-pointer">
            <Link to="/catalog" className="absolute inset-0 z-10"></Link>
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${menCollection})` }}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl md:text-6xl font-light text-white tracking-[0.3em] mb-4">
                  MEN
                </h2>
                <div className="w-16 h-px bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Women's Collection */}
          <div className="relative group cursor-pointer">
            <Link to="/catalog" className="absolute inset-0 z-10"></Link>
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${womenCollection})` }}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl md:text-6xl font-light text-white tracking-[0.3em] mb-4">
                  WOMEN
                </h2>
                <div className="w-16 h-px bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Category Navigation */}
      <section 
        className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-500 ${
          scrollY > 100 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex gap-4 bg-background/95 backdrop-blur-md p-4 rounded-lg shadow-elegant border border-border">
          <Link to="/catalog" className="group">
            <div className="w-20 h-20 overflow-hidden rounded-lg">
              <img 
                src={categoryClothing} 
                alt="Одежда"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <p className="text-xs text-center mt-2 font-medium tracking-wide text-foreground">
              ОДЕЖДА
            </p>
          </Link>
          
          <div className="group cursor-pointer">
            <div className="w-20 h-20 overflow-hidden rounded-lg">
              <img 
                src={categoryInterior} 
                alt="Интерьер"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <p className="text-xs text-center mt-2 font-medium tracking-wide text-foreground">
              ИНТЕРЬЕР
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6 tracking-wide">
              Новые поступления
            </h2>
            <div className="w-16 h-px bg-foreground mx-auto"></div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="font-light tracking-wide px-8 border-foreground text-foreground hover:bg-foreground hover:text-background">
                Смотреть все
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Merino Wool */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-8 tracking-wide">
              Мериносовая шерсть
            </h2>
            <div className="w-16 h-px bg-foreground mx-auto mb-12"></div>
            
            <div className="grid md:grid-cols-2 gap-12 text-left">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-light mb-3 text-foreground tracking-wide">
                    Терморегуляция
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Естественная способность регулировать температуру тела в любых условиях.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-light mb-3 text-foreground tracking-wide">
                    Комфорт
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Тончайшие волокна обеспечивают мягкость и отсутствие раздражения.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-light mb-3 text-foreground tracking-wide">
                    Антибактериальные свойства
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Натуральная защита от неприятных запахов без химических добавок.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-light mb-3 text-foreground tracking-wide">
                    Долговечность
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
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