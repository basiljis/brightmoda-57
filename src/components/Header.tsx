import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, User, Search } from "lucide-react";
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

const Header = () => {
  const location = useLocation();

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
                  <div className="grid w-[600px] gap-6 p-6">
                    <div className="grid grid-cols-2 gap-6">
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
                            <NavigationMenuLink asChild>
                              <Link to="/collections/stepanova" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Stepanova
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link to="/collections/henri" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Henri
                              </Link>
                            </NavigationMenuLink>
                          </div>
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
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;