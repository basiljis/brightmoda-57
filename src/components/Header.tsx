import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, User, Search, Settings, Menu, Home, Package } from "lucide-react";
import { SearchModal } from "@/components/SearchModal";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "@/assets/logo.png";
import { products } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart"; 
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { favorites } = useFavorites();
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(logo);
  const isMobile = useIsMobile();
  const featuredProducts = products.filter(product => product.isFeatured).slice(0, 3);

  useEffect(() => {
    loadData();
    
    // Set up a listener for logo updates in real-time
    const channel = supabase.channel('site_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'site_settings' }, 
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'logo_url' in payload.new && payload.new.logo_url) {
            setLogoUrl(payload.new.logo_url as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    try {
      // Load site settings for logo
      const { data: siteData, error: siteError } = await supabase
        .from('site_settings')
        .select('logo_url')
        .maybeSingle();
      
      if (!siteError && siteData?.logo_url) {
        setLogoUrl(siteData.logo_url);
      }

      // Load collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (collectionsError) throw collectionsError;
      setCollections(collectionsData || []);

      // Load categories with subcategories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories(
            id,
            name,
            slug,
            is_active,
            sort_order
          )
        `)
        .eq('is_active', true)
        .eq('subcategories.is_active', true)
        .order('sort_order');
      
      if (categoriesError) throw categoriesError;
      
      // Sort subcategories within each category
      const processedCategories = categoriesData?.map(category => ({
        ...category,
        subcategories: category.subcategories?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || []
      })) || [];
      
      setCategories(processedCategories);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            {isMobile && (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                      <img src={logoUrl} alt="BRIGHT" className="h-8 w-auto" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Каталог</h3>
                        {categories.map((category) => (
                          <div key={category.id} className="space-y-2">
                            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                              {category.name}
                            </h4>
                            <div className="space-y-1 pl-2">
                              {category.subcategories?.map((subcategory) => (
                                <Link 
                                  key={subcategory.id}
                                  to={`/catalog?category=${category.slug}&subcategory=${subcategory.slug}`}
                                  className="block text-sm py-1 hover:text-primary transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subcategory.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {collections.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                              Коллекции
                            </h4>
                            <div className="space-y-1 pl-2">
                              {collections.map((collection) => (
                                <Link
                                  key={collection.id}
                                  to={`/collections/${collection.slug}`}
                                  className="block text-sm py-1 hover:text-primary transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {collection.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 border-t pt-4">
                        <Link
                          to="/lookbook"
                          className="block text-sm font-medium py-2 hover:text-primary transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          LOOKBOOK
                        </Link>
                        <Link
                          to="/about"
                          className="block text-sm font-medium py-2 hover:text-primary transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          О НАС
                        </Link>
                        <Link
                          to="/contacts"
                          className="block text-sm font-medium py-2 hover:text-primary transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          КОНТАКТЫ
                        </Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Logo */}
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img 
                src={logoUrl} 
                alt="BRIGHT" 
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-light tracking-wide">
                    КАТАЛОГ
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[800px] gap-6 p-6">
                      <div className="grid grid-cols-3 gap-6">
                        {/* Dynamic Categories */}
                        {categories.map((category) => (
                          <div key={category.id} className="space-y-3">
                            <h4 className="text-sm font-medium tracking-wide text-foreground/80 uppercase">
                              {category.name}
                            </h4>
                            <div className="grid gap-2">
                              {category.subcategories?.map((subcategory) => (
                                <NavigationMenuLink asChild key={subcategory.id}>
                                  <Link 
                                    to={`/catalog?category=${category.slug}&subcategory=${subcategory.slug}`} 
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {subcategory.name}
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {/* Collections Section */}
                        {collections.length > 0 && (
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
                        )}
                        
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
                  <Link to="/lookbook" className={`${navigationMenuTriggerStyle()} relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-foreground after:transition-all hover:after:w-full`}>
                    LOOKBOOK
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/about" className={`${navigationMenuTriggerStyle()} relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-foreground after:transition-all hover:after:w-full`}>
                    О НАС
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/contacts" className={`${navigationMenuTriggerStyle()} relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-foreground after:transition-all hover:after:w-full`}>
                    КОНТАКТЫ
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              {!isMobile && (
                <>
                  <Link to="/favorites">
                    <Button variant="ghost" size="sm" className="relative">
                      <Heart className="h-4 w-4" />
                      {favorites.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {favorites.length}
                        </span>
                      )}
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
                  <Link to="/cart">
                    <Button variant="ghost" size="sm" className="relative">
                      <ShoppingBag className="h-4 w-4" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />
      </header>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
          <div className="flex items-center justify-around py-2">
            <Link to="/" className="flex flex-col items-center p-2">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Главная</span>
            </Link>
            <Link to="/catalog" className="flex flex-col items-center p-2">
              <Package className="h-5 w-5" />
              <span className="text-xs mt-1">Каталог</span>
            </Link>
            <Link to="/favorites" className="flex flex-col items-center p-2 relative">
              <Heart className="h-5 w-5" />
              <span className="text-xs mt-1">Избранное</span>
              {favorites.length > 0 && (
                <span className="absolute -top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="flex flex-col items-center p-2 relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs mt-1">Корзина</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <Link to="/profile" className="flex flex-col items-center p-2">
                <User className="h-5 w-5" />
                <span className="text-xs mt-1">Профиль</span>
              </Link>
            ) : (
              <Link to="/auth" className="flex flex-col items-center p-2">
                <User className="h-5 w-5" />
                <span className="text-xs mt-1">Войти</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;