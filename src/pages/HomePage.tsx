import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import menCollection from "@/assets/men-collection.jpg";
import womenCollection from "@/assets/women-collection.jpg";
import categoryClothing from "@/assets/category-clothing.jpg";
import categoryInterior from "@/assets/category-interior.jpg";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EmailSubscriptionSection from "@/components/EmailSubscriptionSection";
import HeroCarousel from "@/components/HeroCarousel";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";
import { BlockRenderer } from "@/components/home/BlockRenderer";

function MerinoSection({ blocks = [] as any[] }) {
  const by = (name: string) => blocks.find((b: any) => b.section_name === name)?.content_value || '';
  const title = by('merino_title') || 'Мериносовая шерсть';
  const items = [
    { t: by('merino_block_1_title') || 'Терморегуляция', d: by('merino_block_1_text') || 'Естественная способность регулировать температуру тела в любых условиях.' },
    { t: by('merino_block_2_title') || 'Комфорт', d: by('merino_block_2_text') || 'Тончайшие волокна обеспечивают мягкость и отсутствие раздражения.' },
    { t: by('merino_block_3_title') || 'Антибактериальные свойства', d: by('merino_block_3_text') || 'Натуральная защита от неприятных запахов без химических добавок.' },
    { t: by('merino_block_4_title') || 'Долговечность', d: by('merino_block_4_text') || 'Качество, которое сохраняется годами при правильном уходе.' },
  ];
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-light text-foreground mb-8 tracking-wide">{title}</h2>
      <div className="w-16 h-px bg-foreground mx-auto mb-12"></div>
      <div className="grid md:grid-cols-2 gap-12 text-left">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-light mb-3 text-foreground tracking-wide">{items[0].t}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{items[0].d}</p>
          </div>
          <div>
            <h3 className="text-xl font-light mb-3 text-foreground tracking-wide">{items[1].t}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{items[1].d}</p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-light mb-3 text-foreground tracking-wide">{items[2].t}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{items[2].d}</p>
          </div>
          <div>
            <h3 className="text-xl font-light mb-3 text-foreground tracking-wide">{items[3].t}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{items[3].d}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [collections, setCollections] = useState([]);
  const [headerCollections, setHeaderCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const featuredProducts = products.slice(0, 4);
  const [merinoBlocks, setMerinoBlocks] = useState<any[]>([]);
  const [showMerinoSection, setShowMerinoSection] = useState(true);
  const [homePageBlocks, setHomePageBlocks] = useState<any[]>([]);
  const { getGridClasses, getContainerClass } = useCatalogSettings();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    loadCollections();
    loadHeaderCollections();
    loadCategories();
    loadMerinoBlocks();
    loadMerinoSectionVisibility();
    loadHomePageBlocks();
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

  const loadMerinoBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'home')
        .in('section_name', ['merino_title', 'merino_block_1_title', 'merino_block_1_text', 'merino_block_2_title', 'merino_block_2_text', 'merino_block_3_title', 'merino_block_3_text', 'merino_block_4_title', 'merino_block_4_text'])
        .order('display_order', { ascending: true });
      if (error) throw error;
      setMerinoBlocks(data || []);
    } catch (e) {
      console.error('Error loading merino blocks:', e);
    }
  };

  const loadMerinoSectionVisibility = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_name', 'home')
        .eq('section_name', 'show_merino_section')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setShowMerinoSection(data.content_value === 'true');
      }
    } catch (e) {
      console.error('Error loading merino section visibility:', e);
    }
  };

  const loadHomePageBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('home_page_blocks')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setHomePageBlocks(data || []);
    } catch (e) {
      console.error('Error loading home page blocks:', e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Dynamic Carousel */}
      <section className="h-screen relative overflow-hidden">
        {headerCollections.length > 0 ? (
          <HeroCarousel collections={headerCollections} />
        ) : (
          // Fallback to static collections if no dynamic data
          <div className="grid md:grid-cols-2 h-full">
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
          </div>
        )}
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
          <div className={getContainerClass()}>
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
        <div className={getContainerClass()}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6 tracking-wide">
              Новые поступления
            </h2>
            <div className="w-16 h-px bg-foreground mx-auto"></div>
          </div>
          
          <div className={getGridClasses()}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="font-light tracking-wide px-8 border-foreground text-foreground hover:bg-foreground hover:text-background">
                Смотреть все
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Merino Wool - editable via page_content (home) */}
      {showMerinoSection && (
        <section className="py-24 bg-muted/30">
          <div className={getContainerClass()}>
            <MerinoSection blocks={merinoBlocks} />
          </div>
        </section>
      )}

      {/* Dynamic Home Page Blocks */}
      {homePageBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} products={products} />
      ))}

      {/* Email Subscription Section */}
      <EmailSubscriptionSection />
    </div>
  );
};

export default HomePage;