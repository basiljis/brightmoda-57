import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, User, Search, Settings, Menu, Home, Package, MessageCircle, Send as TelegramIcon } from "lucide-react";
import { useTheme } from "next-themes";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { FullWidthMegaMenu } from "@/components/FullWidthMegaMenu";
import logo from "@/assets/logo.png";
import { products } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart"; 
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";

const Header = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { favorites } = useFavorites();
  const { theme } = useTheme();
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [headerMenuItems, setHeaderMenuItems] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(logo);
  const [logoDarkUrl, setLogoDarkUrl] = useState(logo);
  const [contactPlatform, setContactPlatform] = useState<string | null>(null);
  const [contactUrl, setContactUrl] = useState<string | null>(null);
  const [contactIconMode, setContactIconMode] = useState<string>('auto');
  const [contactCustomIcon, setContactCustomIcon] = useState<string | null>(null);
  const [menuSettings, setMenuSettings] = useState<{
    menu_style: string;
    show_featured_products: boolean;
    show_collections: boolean;
    show_categories: boolean;
    featured_products_count: number;
    featured_collections_count: number;
    selected_collection_ids?: string[];
    selected_product_ids?: string[];
    selected_category_ids?: string[];
  }>({
    menu_style: 'simple',
    show_featured_products: true,
    show_collections: true,
    show_categories: true,
    featured_products_count: 3,
    featured_collections_count: 4,
    selected_collection_ids: [],
    selected_product_ids: [],
    selected_category_ids: [],
  });
  const [featuredProductsData, setFeaturedProductsData] = useState([]);
  const isMobile = useIsMobile();
  const featuredProducts = products.filter(product => product.isFeatured).slice(0, 3);
  const { getContainerClass } = useCatalogSettings();

  const currentLogo = theme === 'dark' && logoDarkUrl ? logoDarkUrl : logoUrl;
  const isLogoReady = Boolean(currentLogo && typeof currentLogo === 'string' && currentLogo.length > 0);

  useEffect(() => {
    loadData();
    
    // Set up a listener for logo updates in real-time
    const channel = supabase.channel('site_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'site_settings' }, 
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            if (newData.logo_url) setLogoUrl(newData.logo_url);
            if (newData.logo_dark_url) setLogoDarkUrl(newData.logo_dark_url);
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
        .select('logo_url, logo_dark_url, social_links')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!siteError && siteData) {
        if (siteData.logo_url) setLogoUrl(siteData.logo_url);
        if (siteData.logo_dark_url) setLogoDarkUrl(siteData.logo_dark_url);
        const links = (siteData as any).social_links || {};
        const platform = links.contact_us_platform || null;
        setContactPlatform(platform);
        setContactUrl(platform ? links[platform] || null : null);
        setContactIconMode(links.contact_us_icon_mode || 'auto');
        setContactCustomIcon(links.contact_us_custom_icon_url || null);
      }

      // Load header menu settings
      const { data: menuSettingsData, error: menuSettingsError } = await supabase
        .from('header_menu_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!menuSettingsError && menuSettingsData) {
        setMenuSettings(menuSettingsData);
      }

      // Load featured products from database
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, images, is_new, is_preorder')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(menuSettingsData?.featured_products_count || 3);
      
      if (!productsError && productsData) {
        setFeaturedProductsData(productsData as any);
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

      // Load header menu items (including submenus)
      const { data: headerMenuData, error: headerMenuError } = await supabase
        .from('page_content')
        .select('*')
        .or('menu_location.in.(header,both),and(parent_id.not.is.null,is_active.eq.true)')
        .eq('is_active', true)
        .order('display_order');
      
      if (headerMenuError) throw headerMenuError;
      setHeaderMenuItems(headerMenuData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className={getContainerClass()}>
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
                      {isLogoReady ? (
                        <img src={currentLogo} alt="BRIGHT" className="h-8 w-auto" width={120} height={32} loading="eager" />
                      ) : (
                        <div className="h-8 w-[120px] bg-transparent" aria-hidden />
                      )}
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
                        {/* Custom menu items with submenus */}
                        {(() => {
                          const rootItems = headerMenuItems.filter((item: any) => !item.parent_id);
                          const childrenMap = new Map<string, any[]>();
                          
                          headerMenuItems.forEach((item: any) => {
                            if (item.parent_id) {
                              if (!childrenMap.has(item.parent_id)) {
                                childrenMap.set(item.parent_id, []);
                              }
                              childrenMap.get(item.parent_id)!.push(item);
                            }
                          });
                          
                          return rootItems.map((item: any) => {
                            const children = childrenMap.get(item.id) || [];
                            
                            return (
                              <div key={item.id} className="space-y-1">
                                <Link
                                  to={item.content_value}
                                  className="block text-sm font-medium py-2 hover:text-primary transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {(item.menu_label || item.section_name).toUpperCase()}
                                </Link>
                                {children.length > 0 && (
                                  <div className="pl-4 space-y-1">
                                    {children.map((child: any) => (
                                      <Link
                                        key={child.id}
                                        to={child.content_value}
                                        className="block text-sm py-1 text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                      >
                                        {child.menu_label || child.section_name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Logo */}
            <Link to="/" className="hover:opacity-80 transition-opacity">
              {isLogoReady ? (
                <img 
                  src={currentLogo} 
                  alt="BRIGHT" 
                  className="h-8 w-auto"
                  width={120}
                  height={32}
                  loading="eager"
                />
              ) : (
                <div className="h-8 w-[120px] bg-transparent" aria-hidden />
              )}
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {menuSettings.menu_style === 'fullwidth' ? (
                  <NavigationMenuItem>
                    <button
                      className="inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-light tracking-wide transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                      onMouseEnter={() => setIsCatalogMenuOpen(true)}
                      onClick={() => setIsCatalogMenuOpen(!isCatalogMenuOpen)}
                    >
                      КАТАЛОГ
                    </button>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-light tracking-wide">
                      КАТАЛОГ
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[800px] gap-6 p-6">
                        <div className="grid grid-cols-3 gap-6">
                          {/* Dynamic Categories */}
                          {menuSettings.show_categories && (() => {
                            const displayedCategories = menuSettings.selected_category_ids && menuSettings.selected_category_ids.length > 0
                              ? categories.filter((cat: any) => menuSettings.selected_category_ids?.includes(cat.id))
                              : categories;
                            return displayedCategories.map((category: any) => (
                              <div key={category.id} className="space-y-3">
                                <h4 className="text-sm font-medium tracking-wide text-foreground/80 uppercase">
                                  {category.name}
                                </h4>
                                <div className="grid gap-2">
                                  {category.subcategories?.map((subcategory: any) => (
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
                            ));
                          })()}
                          
                          {/* Collections Section */}
                          {menuSettings.show_collections && (() => {
                            const displayedCollections = menuSettings.selected_collection_ids && menuSettings.selected_collection_ids.length > 0
                              ? collections.filter((col: any) => menuSettings.selected_collection_ids?.includes(col.id))
                              : collections;
                            return displayedCollections.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium tracking-wide text-foreground/80">КОЛЛЕКЦИИ</h4>
                                <div className="grid gap-2">
                                  {displayedCollections.slice(0, menuSettings.featured_collections_count).map((collection: any) => (
                                    <NavigationMenuLink asChild key={collection.id}>
                                      <Link to={`/collections/${collection.slug}`} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {collection.name}
                                      </Link>
                                    </NavigationMenuLink>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                          
                          {/* Featured Products */}
                          {menuSettings.show_featured_products && (() => {
                            const displayedProducts = menuSettings.selected_product_ids && menuSettings.selected_product_ids.length > 0
                              ? featuredProductsData.filter((prod: any) => menuSettings.selected_product_ids?.includes(prod.id))
                              : featuredProductsData;
                            return displayedProducts.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium tracking-wide text-foreground/80">НОВИНКИ</h4>
                                <div className="space-y-4">
                                  {displayedProducts.slice(0, 3).map((product: any) => {
                                  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg';
                                  
                                  return (
                                    <NavigationMenuLink asChild key={product.id}>
                                      <Link to={`/product/${product.id}`} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="relative">
                                          <img 
                                            src={imageUrl} 
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded"
                                          />
                                          {product.is_new && (
                                            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                                              NEW
                                            </span>
                                          )}
                                          {product.is_preorder && (
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
                                  );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
                
                {/* Custom menu items with dropdown support */}
                {(() => {
                  // Build hierarchy
                  const rootItems = headerMenuItems.filter((item: any) => !item.parent_id);
                  const childrenMap = new Map<string, any[]>();
                  
                  headerMenuItems.forEach((item: any) => {
                    if (item.parent_id) {
                      if (!childrenMap.has(item.parent_id)) {
                        childrenMap.set(item.parent_id, []);
                      }
                      childrenMap.get(item.parent_id)!.push(item);
                    }
                  });
                  
                  return rootItems.map((item: any) => {
                    const children = childrenMap.get(item.id) || [];
                    
                    return (
                      <NavigationMenuItem 
                        key={item.id}
                        onMouseEnter={() => setIsCatalogMenuOpen(false)}
                      >
                        {children.length > 0 ? (
                          <>
                            <NavigationMenuTrigger className="text-sm font-light tracking-wide">
                              {(item.menu_label || item.section_name).toUpperCase()}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                              <div className="grid w-[400px] gap-3 p-4">
                                {children.map((child: any) => (
                                  <NavigationMenuLink asChild key={child.id}>
                                    <Link 
                                      to={child.content_value} 
                                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                    >
                                      <div className="text-sm font-medium leading-none">
                                        {child.menu_label || child.section_name}
                                      </div>
                                    </Link>
                                  </NavigationMenuLink>
                                ))}
                              </div>
                            </NavigationMenuContent>
                          </>
                        ) : (
                          <Link 
                            to={item.content_value} 
                            className={`${navigationMenuTriggerStyle()} relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-foreground after:transition-all hover:after:w-full`}
                          >
                            {(item.menu_label || item.section_name).toUpperCase()}
                          </Link>
                        )}
                      </NavigationMenuItem>
                    );
                  });
                })()}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hidden sm:flex"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Поиск</TooltipContent>
              </Tooltip>
              
              {!isMobile && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>Избранное</TooltipContent>
                  </Tooltip>
                  {user ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link to="/profile">
                            <Button variant="ghost" size="sm">
                              <User className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>Профиль</TooltipContent>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to="/admin">
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>Админка</TooltipContent>
                        </Tooltip>
                      )}
                    </>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/auth">
                          <Button variant="ghost" size="sm">
                            <User className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Войти</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>Корзина</TooltipContent>
                  </Tooltip>
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

      {/* Fullwidth mega menu */}
      {menuSettings.menu_style === 'fullwidth' && isCatalogMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsCatalogMenuOpen(false)}
          />
          <div 
            className="relative z-50"
            onMouseLeave={() => setIsCatalogMenuOpen(false)}
          >
            <FullWidthMegaMenu
              categories={
                menuSettings.selected_category_ids && menuSettings.selected_category_ids.length > 0
                  ? (categories as any[]).filter((cat: any) => menuSettings.selected_category_ids?.includes(cat.id))
                  : categories as any
              }
              collections={
                menuSettings.selected_collection_ids && menuSettings.selected_collection_ids.length > 0
                  ? (collections as any[]).filter((col: any) => menuSettings.selected_collection_ids?.includes(col.id))
                  : collections as any
              }
              products={
                menuSettings.selected_product_ids && menuSettings.selected_product_ids.length > 0
                  ? (featuredProductsData as any[]).filter((prod: any) => menuSettings.selected_product_ids?.includes(prod.id))
                  : featuredProductsData as any
              }
              showCategories={menuSettings.show_categories}
              showCollections={menuSettings.show_collections}
              showProducts={menuSettings.show_featured_products}
              onClose={() => setIsCatalogMenuOpen(false)}
            />
          </div>
        </>
      )}

      {/* Floating Contact button (bottom-right) */}
      {contactPlatform && contactUrl && (
        <a href={contactUrl} target="_blank" rel="noopener noreferrer" className={`fixed ${isMobile ? 'bottom-20' : 'bottom-6'} right-6 z-50`}>
          <Button variant="default" size="icon" className="h-14 w-14 rounded-full shadow-lg">
            {contactIconMode === 'custom' && contactCustomIcon ? (
              <img src={contactCustomIcon} alt="Связаться" className="h-6 w-6 object-contain" />
            ) : contactIconMode === 'default' ? (
              <MessageCircle className="h-6 w-6" />
            ) : contactPlatform === 'telegram' ? (
              <TelegramIcon className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
          </Button>
        </a>
      )}

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