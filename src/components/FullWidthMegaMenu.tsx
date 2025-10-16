import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
  is_new?: boolean;
  is_preorder?: boolean;
}

interface FullWidthMegaMenuProps {
  categories: Category[];
  collections: Collection[];
  products: Product[];
  showCategories: boolean;
  showCollections: boolean;
  showProducts: boolean;
  onClose: () => void;
}

export function FullWidthMegaMenu({
  categories,
  collections,
  products,
  showCategories,
  showCollections,
  showProducts,
  onClose,
}: FullWidthMegaMenuProps) {
  return (
    <div className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-lg z-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-12 gap-8 p-8 min-h-[400px]">
          {/* Left sidebar with categories */}
          <div className="col-span-3 space-y-6 border-r border-border pr-6">
            {showCategories && categories.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-4">
                  Категории
                </h3>
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between group">
                      <h4 className="font-medium text-sm uppercase tracking-wide">
                        {category.name}
                      </h4>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="space-y-1 pl-2">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            to={`/catalog?category=${category.slug}&subcategory=${subcategory.slug}`}
                            className="block text-sm py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={onClose}
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showCollections && collections.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-4">
                  Коллекции
                </h3>
                <div className="space-y-1">
                  {collections.slice(0, 8).map((collection) => (
                    <Link
                      key={collection.id}
                      to={`/collections/${collection.slug}`}
                      className="block text-sm py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={onClose}
                    >
                      {collection.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border space-y-2">
              <Link
                to="/catalog"
                className="block text-sm font-medium hover:text-primary transition-colors"
                onClick={onClose}
              >
                ВСЕ ТОВАРЫ
              </Link>
              {showCollections && (
                <Link
                  to="/collections"
                  className="block text-sm font-medium hover:text-primary transition-colors"
                  onClick={onClose}
                >
                  ВСЕ КОЛЛЕКЦИИ
                </Link>
              )}
            </div>
          </div>

          {/* Right side with featured products and collections */}
          <div className="col-span-9">
            {showProducts && products.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-6">
                  Избранные товары
                </h3>
                <div className="grid grid-cols-4 gap-6">
                  {products.map((product) => {
                    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg';
                    
                    return (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="group"
                        onClick={onClose}
                      >
                        <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {product.price.toLocaleString()} ₽
                            </p>
                            {product.is_new && (
                              <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded">
                                NEW
                              </span>
                            )}
                            {product.is_preorder && (
                              <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
                                PRE
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {showCollections && collections.length > 0 && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-6">
                  Коллекции
                </h3>
                <div className="grid grid-cols-4 gap-6">
                  {collections.slice(0, 4).map((collection) => (
                    <Link
                      key={collection.id}
                      to={`/collections/${collection.slug}`}
                      className="group"
                      onClick={onClose}
                    >
                      {collection.image_url && (
                        <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={collection.image_url}
                            alt={collection.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                        {collection.name}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
