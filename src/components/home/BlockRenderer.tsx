import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';

interface HomePageBlock {
  id: string;
  block_type: 'catalog' | 'catalog_filtered' | 'text';
  title: string | null;
  title_alignment: 'left' | 'center' | 'right';
  display_order: number;
  is_active: boolean;
  items_count: number | null;
  collection_id: string | null;
  show_all_collections: boolean | null;
  text_content: string | null;
  font_size: 'small' | 'medium' | 'large' | 'xlarge' | null;
  show_more_button: boolean | null;
  show_more_text: string | null;
}

interface BlockRendererProps {
  block: HomePageBlock;
  products: any[];
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

export const BlockRenderer = ({ block, products }: BlockRendererProps) => {
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
              <Button 
                onClick={handleShowMore}
                variant="outline" 
                size="lg" 
                className="font-light tracking-widest uppercase px-8 border-foreground text-foreground hover:bg-foreground hover:text-background"
              >
                {block.show_more_text || 'Показать еще'} ({remainingCount})
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return null;
};
