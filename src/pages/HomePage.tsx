import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import menCollection from "@/assets/men-collection.jpg";
import womenCollection from "@/assets/women-collection.jpg";
import categoryClothing from "@/assets/category-clothing.jpg";
import categoryInterior from "@/assets/category-interior.jpg";
import { ArrowRight, Star, Shield, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EmailSubscriptionSection from "@/components/EmailSubscriptionSection";

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [collections, setCollections] = useState([]);
  const [headerCollections, setHeaderCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const featuredProducts = products.slice(0, 4);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    loadCollections();
    loadHeaderCollections();
    loadCategories();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('show_on_homepage', true)
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const loadHeaderCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('header_collections')
        .select('*')
        .eq('is_active', true)
        .order('position');
      
      if (error) throw error;
      setHeaderCollections(data || []);
    } catch (error) {
      console.error('Error loading header collections:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, size_chart_image_url')
        .eq('is_active', true)
        .order('sort_order')
        .limit(6);
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Split Collection Layout */}
      <section className="h-screen relative overflow-hidden">
        <div className="grid md:grid-cols-2 h-full">
          {headerCollections.length >= 2 ? (
            <>
              {/* First Header Collection */}
              <div className="relative group cursor-pointer">
                <Link to={headerCollections[0]?.link_url || "/catalog"} className="absolute inset-0 z-10"></Link>
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${headerCollections[0]?.image_url || menCollection})` }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-4xl md:text-6xl font-light text-white tracking-[0.3em] mb-4">
                      {headerCollections[0]?.title || 'MEN'}
                    </h2>
                    <div className="w-16 h-px bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>

              {/* Second Header Collection */}
              <div className="relative group cursor-pointer">
                <Link to={headerCollections[1]?.link_url || "/catalog"} className="absolute inset-0 z-10"></Link>
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${headerCollections[1]?.image_url || womenCollection})` }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-4xl md:text-6xl font-light text-white tracking-[0.3em] mb-4">
                      {headerCollections[1]?.title || 'WOMEN'}
                    </h2>
                    <div className="w-16 h-px bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Fallback to static collections if no dynamic data */}
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
            </>
          )}
        </div>
      </section>

      {/* Floating Category Navigation */}
      <section 
        className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-500 ${
          scrollY > 100 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex gap-4 bg-background/95 backdrop-blur-md p-4 rounded-lg shadow-elegant border border-border">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link 
                key={category.id}
                to={`/catalog?category=${category.slug}`} 
                className="group flex flex-col items-center"
              >
                <div className="w-20 h-20 overflow-hidden rounded-lg">
                  <img 
                    src={category.size_chart_image_url || categoryClothing} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <p className="text-xs text-center mt-2 font-medium tracking-wide text-foreground uppercase">
                  {category.name}
                </p>
              </Link>
            ))
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      {/* Featured Collections */}
      {collections.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6 tracking-wide">
                Коллекции
              </h2>
              <div className="w-16 h-px bg-foreground mx-auto"></div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection) => (
                <Link key={collection.id} to={`/collections/${collection.slug}`} className="group">
                  <div className="aspect-[4/5] bg-muted rounded-lg overflow-hidden mb-4">
                    {collection.image_url ? (
                      <img 
                        src={collection.image_url} 
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted"></div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-light text-foreground mb-2 tracking-wide">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* Email Subscription Section */}
      <EmailSubscriptionSection />
    </div>
  );
};

export default HomePage;