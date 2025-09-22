import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sku: string;
  category: string;
  subcategory: string;
  is_new: boolean;
  is_preorder: boolean;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchProducts]);

  const handleClose = () => {
    setQuery("");
    setResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Поиск товаров</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск по названию, описанию или артикулу..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Поиск...
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Товары не найдены
              </div>
            )}

            {!isLoading && results.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                onClick={handleClose}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  {product.is_new && (
                    <Badge className="absolute -top-1 -right-1 text-xs">
                      NEW
                    </Badge>
                  )}
                  {product.is_preorder && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs">
                      PRE
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {product.name}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium">
                      {product.price?.toLocaleString()} ₽
                    </span>
                    {product.sku && (
                      <span className="text-xs text-muted-foreground">
                        Арт. {product.sku}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {query && !isLoading && results.length > 0 && (
            <div className="text-center pt-2 border-t">
              <Link
                to={`/catalog?search=${encodeURIComponent(query)}`}
                onClick={handleClose}
                className="text-sm text-primary hover:underline"
              >
                Посмотреть все результаты ({results.length > 10 ? 'более 10' : results.length})
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};