import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, User, Search } from "lucide-react";
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
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/catalog" 
              className={`text-sm font-light tracking-wide transition-colors hover:text-primary ${
                location.pathname === '/catalog' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Каталог
            </Link>
          </nav>

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