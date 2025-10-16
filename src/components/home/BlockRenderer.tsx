import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';
import { ChevronDown } from 'lucide-react';

interface HomePageBlock {
  id: string;
  block_type: 'catalog' | 'catalog_filtered' | 'text' | 'collection_card' | 'features' | 'spacer';
  title: string | null;
  title_alignment: 'left' | 'center' | 'right';
  display_order: number;
  is_active: boolean;
  items_count: number | null;
  collection_id: string | null;
  collection_ids?: string[];
  show_all_collections: boolean | null;
  text_content: string | null;
  font_size: 'small' | 'medium' | 'large' | 'xlarge' | null;
  show_more_button: boolean | null;
  show_more_text: string | null;
  show_more_button_size: 'small' | 'medium' | 'large' | null;
  show_more_button_type: 'text' | 'icon' | null;
  collection_card_style: string | null;
  spacer_size?: number;
}

interface BlockRendererProps {
  block: HomePageBlock;
  products: any[];
  collections?: any[];
}

const getFontSizeClass = (size: string | null) => {
  switch (size) {
    case 'small': return 'text-sm';
    case 'medium': return 'text-base';
    case 'large': return 'text-lg';
    case 'xlarge': return 'text-xl';
    default: return 'text-base';
  }
};

const getTitleAlignmentClass = (alignment: string) => {
  switch (alignment) {
    case 'center': return 'text-center';
    case 'right': return 'text-right';
    default: return 'text-left';
  }
};

export const BlockRenderer = ({ block, products, collections = [] }: BlockRendererProps) => {
  const { getGridClasses, getContainerClass } = useCatalogSettings();
  const [visibleCount, setVisibleCount] = useState(block.items_count || 4);

  if (!block.is_active) return null;

  const titleAlignClass = getTitleAlignmentClass(block.title_alignment);

  if (block.block_type === 'text') {
    return (
      <section className="py-12">
        <div className={getContainerClass()}>
          {block.title && (
            <h2 className={`text-3xl md:text-4xl font-light text-foreground mb-8 tracking-wide ${titleAlignClass}`}>
              {block.title}
            </h2>
          )}
          <div
            className={`prose prose-lg max-w-none ${getFontSizeClass(block.font_size)} ${titleAlignClass}`}
            dangerouslySetInnerHTML={{ __html: block.text_content || '' }}
          />
        </div>
      </section>
    );
  }

  if (block.block_type === 'catalog' || block.block_type === 'catalog_filtered') {
    let filteredProducts = products;
    
    if (block.block_type === 'catalog_filtered' && !block.show_all_collections && block.collection_id) {
      filteredProducts = products.filter(p => p.collection_id === block.collection_id);
    }

    const displayProducts = filteredProducts.slice(0, visibleCount);
    const remainingCount = filteredProducts.length - displayProducts.length;

    const handleShowMore = () => {
      setVisibleCount(prev => prev + (block.items_count || 4));
    };

    return (
      <section className="py-12">
        <div className={getContainerClass()}>
          {block.title && (
            <div className={`mb-8 ${titleAlignClass}`}>
              <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-wide">
                {block.title}
              </h2>
              <div className={`w-16 h-px bg-foreground mt-4 ${
                block.title_alignment === 'center' ? 'mx-auto' : 
                block.title_alignment === 'right' ? 'ml-auto' : ''
              }`}></div>
            </div>
          )}
          
          <div className={getGridClasses()}>
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {block.show_more_button && remainingCount > 0 && (
            <div className={`mt-8 ${titleAlignClass}`}>
              {block.show_more_button_type === 'icon' ? (
                <Button 
                  onClick={handleShowMore}
                  variant="outline"
                  size={block.show_more_button_size === 'small' ? 'sm' : block.show_more_button_size === 'large' ? 'lg' : 'default'}
                  className="rounded-full border-foreground text-foreground hover:bg-foreground hover:text-background"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleShowMore}
                  variant="outline" 
                  size={block.show_more_button_size === 'small' ? 'sm' : block.show_more_button_size === 'large' ? 'lg' : 'default'}
                  className="font-light tracking-widest uppercase px-8 border-foreground text-foreground hover:bg-foreground hover:text-background"
                >
                  {block.show_more_text || 'Показать еще'} ({remainingCount})
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (block.block_type === 'collection_card') {
    const selectedCollections = (block.collection_ids || [])
      .map(id => collections.find(c => c.id === id))
      .filter(Boolean);
    
    if (selectedCollections.length === 0) return null;

    return (
      <section className="py-12">
        <div className={getContainerClass()}>
          {block.title && (
            <h2 className={`text-3xl font-light mb-8 tracking-wide ${titleAlignClass}`}>
              {block.title}
            </h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedCollections.map((collection) => (
              <a 
                key={collection.id}
                href={`/catalog?collection=${collection.id}`}
                className="block group relative overflow-hidden rounded-lg aspect-[16/9] bg-muted hover:shadow-xl transition-all duration-300"
              >
                {collection.image_url && (
                  <img 
                    src={collection.image_url} 
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-8">
                  <h3 className="text-white text-4xl font-light tracking-widest uppercase">
                    {collection.name}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (block.block_type === 'features') {
    let features: Array<{ title: string; description: string }> = [];
    
    try {
      const parsed = JSON.parse(block.text_content || '{"items":[]}');
      features = parsed.items || [];
    } catch {
      features = [];
    }

    if (features.length === 0) return null;

    return (
      <section className="py-16">
        <div className={getContainerClass()}>
          {block.title && (
            <div className={`mb-12 ${titleAlignClass}`}>
              <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-wide">
                {block.title}
              </h2>
              <div className={`w-16 h-px bg-foreground mt-4 ${
                block.title_alignment === 'center' ? 'mx-auto' : 
                block.title_alignment === 'right' ? 'ml-auto' : ''
              }`}></div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-normal text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (block.block_type === 'spacer') {
    return <div style={{ height: `${block.spacer_size || 40}px` }} />;
  }

  return null;
};
