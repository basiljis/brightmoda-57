import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

interface HeroCollection {
  id: string;
  title: string;
  link_url: string;
  image_url: string;
  desktop_display_mode?: string;
  autoplay_enabled?: boolean;
  autoplay_speed?: string;
}

interface HeroCarouselProps {
  collections: HeroCollection[];
}

const HeroCarousel = ({ collections }: HeroCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const displayMode = collections[0]?.desktop_display_mode || 'two';
  const autoplayEnabled = collections[0]?.autoplay_enabled || false;
  const autoplaySpeed = collections[0]?.autoplay_speed || 'medium';

  const speedMap = {
    slow: 8000,
    medium: 5000,
    fast: 3000,
  };

  const delay = speedMap[autoplaySpeed as keyof typeof speedMap] || 5000;

  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api || !autoplayEnabled) return;
    
    // For 'one' mode, enable autoplay if there are 2+ collections
    // For 'two' mode (carousel), enable autoplay if there are 3+ collections
    const minCollections = displayMode === 'one' ? 2 : 3;
    if (collections.length < minCollections) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, delay);

    return () => clearInterval(interval);
  }, [api, autoplayEnabled, delay, collections.length, displayMode]);

  if (collections.length === 0) return null;

  // Single image mode
  if (displayMode === 'one' || collections.length === 1) {
    return (
      <div className="h-screen relative overflow-hidden">
        {collections.length > 1 ? (
          <Carousel setApi={setApi} className="w-full h-full">
            <CarouselContent>
              {collections.map((collection) => (
                <CarouselItem key={collection.id}>
                  <div className="relative group cursor-pointer h-screen">
                    <Link to={collection.link_url} className="absolute inset-0 z-10" />
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${collection.image_url})` }}
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-4xl md:text-6xl font-light text-white tracking-[0.3em] mb-4">
                          {collection.title}
                        </h2>
                        <div className="w-16 h-px bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {collections.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => api?.scrollPrev()}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => api?.scrollNext()}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
                
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {collections.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === current ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                      onClick={() => api?.scrollTo(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </Carousel>
        ) : (
          <div className="relative group cursor-pointer h-screen">
            <Link to={collections[0].link_url} className="absolute inset-0 z-10" />
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${collections[0].image_url})` }}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl md:text-6xl font-light text-white tracking-[0.3em] mb-4">
                  {collections[0].title}
                </h2>
                <div className="w-16 h-px bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Two images mode
  if (collections.length === 2) {
    return (
      <div className="h-screen relative overflow-hidden">
        <div className="grid md:grid-cols-2 h-full">
          {collections.map((collection) => (
            <div key={collection.id} className="relative group cursor-pointer">
              <Link to={collection.link_url} className="absolute inset-0 z-10" />
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${collection.image_url})` }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-4xl md:text-6xl font-light text-white tracking-[0.3em] mb-4">
                    {collection.title}
                  </h2>
                  <div className="w-16 h-px bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Carousel mode for more than 2 images with two-column layout
  return (
    <div className="h-screen relative overflow-hidden">
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent>
          {Array.from({ length: Math.ceil(collections.length / 2) }).map((_, slideIndex) => {
            const leftIndex = slideIndex * 2;
            const rightIndex = slideIndex * 2 + 1;
            const leftCollection = collections[leftIndex];
            const rightCollection = collections[rightIndex];

            return (
              <CarouselItem key={slideIndex}>
                <div className="grid md:grid-cols-2 h-screen">
                  {/* Left Collection */}
                  <div className="relative group cursor-pointer">
                    <Link to={leftCollection.link_url} className="absolute inset-0 z-10" />
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${leftCollection.image_url})` }}
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-4xl md:text-6xl font-light text-white tracking-[0.3em] mb-4">
                          {leftCollection.title}
                        </h2>
                        <div className="w-16 h-px bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </div>
                  </div>

                  {/* Right Collection */}
                  {rightCollection && (
                    <div className="relative group cursor-pointer">
                      <Link to={rightCollection.link_url} className="absolute inset-0 z-10" />
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${rightCollection.image_url})` }}
                      >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <h2 className="text-4xl md:text-6xl font-light text-white tracking-[0.3em] mb-4">
                            {rightCollection.title}
                          </h2>
                          <div className="w-16 h-px bg-white mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white"
          onClick={() => api?.scrollPrev()}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white"
          onClick={() => api?.scrollNext()}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {Array.from({ length: Math.ceil(collections.length / 2) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === current ? 'bg-white w-8' : 'bg-white/50'
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default HeroCarousel;
