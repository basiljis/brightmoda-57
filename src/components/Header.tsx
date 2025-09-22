import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, User, Search, Settings } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/logo.png";
import { products } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart"; 
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const [collections, setCollections] = useState([]);
  const featuredProducts = products.filter(product => product.isFeatured).slice(0, 3);

  useEffect(() => {
    loadCollections();
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

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img 
              src={logo} 
              alt="BRIGHT" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-light tracking-wide">
                  КАТАЛОГ
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[800px] gap-6 p-6">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Одежда */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium tracking-wide text-foreground/80">ОДЕЖДА</h4>
                        <div className="grid gap-2">
                          <NavigationMenuLink asChild>
                            <Link to="/cardigans" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                              Кардиганы
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/vests" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                              Жилетки
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/t-shirts" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                              Футболки
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/skirts" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                              Юбки
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/pants" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                              Брюки
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/scarves" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                              Шарфы
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/hats" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                              Головные уборы
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                      
                      {/* Интерьер и коллекции */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium tracking-wide text-foreground/80">ИНТЕРЬЕР</h4>
                          <div className="grid gap-2">
                            <NavigationMenuLink asChild>
                              <Link to="/blankets" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Пледы
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link to="/pillows" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Подушки
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link to="/pillowcases" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Наволочки
                              </Link>
                            </NavigationMenuLink>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium tracking-wide text-foreground/80">КОЛЛЕКЦИИ</h4>
                          <div className="grid gap-2">
                            {collections.map((collection) => (
                              <NavigationMenuLink asChild key={collection.id}>
                                <Link to={`/collections/${collection.slug}`} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                  {collection.name}
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Новинки */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium tracking-wide text-foreground/80">НОВИНКИ</h4>
                        <div className="space-y-4">
                          {featuredProducts.map((product) => (
                            <NavigationMenuLink asChild key={product.id}>
                              <Link to={`/product/${product.id}`} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="relative">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  {product.isNew && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                                      NEW
                                    </span>
                                  )}
                                  {product.isPreorder && (
                                    <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs px-1 rounded">
                                      PRE
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {product.price.toLocaleString()} ₽
                                  </p>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/lookbook" className={navigationMenuTriggerStyle()}>
                  LOOKBOOK
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/about" className={navigationMenuTriggerStyle()}>
                  О НАС
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/contacts" className={navigationMenuTriggerStyle()}>
                  КОНТАКТЫ
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="h-4 w-4" />
            </Button>
            <Link to="/favorites">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </Link>
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link to="/profile?tab=cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingBag className="h-4 w-4" />
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;