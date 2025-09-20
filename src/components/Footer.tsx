import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
              <img 
                src={logo} 
                alt="BRIGHT" 
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Премиальная одежда из мериносовой шерсти. 
              Качество, комфорт и стиль в каждом изделии.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground tracking-wide">
              КАТАЛОГ
            </h3>
            <div className="space-y-3">
              <Link to="/catalog" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Все изделия
              </Link>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Свитеры
              </div>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Кардиганы
              </div>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Водолазки
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground tracking-wide">
              ПОДДЕРЖКА
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Доставка и возврат
              </div>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Таблица размеров
              </div>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Уход за изделиями
              </div>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Контакты
              </div>
            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground tracking-wide">
              О НАС
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                История бренда
              </div>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Качество материалов
              </div>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Экологичность
              </div>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Карьера
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 BRIGHT. Все права защищены.
            </div>
            <div className="flex space-x-6">
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Политика конфиденциальности
              </div>
              <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Условия использования
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;