import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { products } from "@/data/products";
import menCollection from "@/assets/men-collection.jpg";
import womenCollection from "@/assets/women-collection.jpg";
import { supabase } from "@/integrations/supabase/client";
import EmailSubscriptionSection from "@/components/EmailSubscriptionSection";
import HeroCarousel from "@/components/HeroCarousel";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";
import { BlockRenderer } from "@/components/home/BlockRenderer";

const HomePage = () => {
  const [collections, setCollections] = useState([]);
  const [headerCollections, setHeaderCollections] = useState([]);
  const [homePageBlocks, setHomePageBlocks] = useState<any[]>([]);
  const { getContainerClass } = useCatalogSettings();

  useEffect(() => {
    loadCollections();
    loadHeaderCollections();
    loadHomePageBlocks();
  }, []);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
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
              <Link to="/catalog?category=men" className="absolute inset-0 z-10" aria-label="Перейти в мужской каталог"></Link>
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
              <Link to="/catalog?category=women" className="absolute inset-0 z-10" aria-label="Перейти в женский каталог"></Link>
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

      {/* Dynamic Home Page Blocks */}
      {homePageBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} products={products} collections={collections} />
      ))}

      {/* Email Subscription Section */}
      <EmailSubscriptionSection />
    </div>
  );
};

export default HomePage;