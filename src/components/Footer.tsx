import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

interface PageContent {
  id: string;
  section_name: string;
  content_value: string;
  display_order: number;
}

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [aboutSections, setAboutSections] = useState<PageContent[]>([]);
  const [supportSections, setSupportSections] = useState<PageContent[]>([]);

  useEffect(() => {
    loadCategories();
    loadSubcategories();
    loadAboutSections();
    loadSupportSections();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('id, name, slug, category_id')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadAboutSections = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('id, section_name, content_value, display_order')
        .eq('page_name', 'about_us')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setAboutSections(data || []);
    } catch (error) {
      console.error('Error loading about sections:', error);
    }
  };

  const loadSupportSections = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('id, section_name, content_value, display_order')
        .eq('page_name', 'support')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSupportSections(data || []);
    } catch (error) {
      console.error('Error loading support sections:', error);
    }
  };

  const getSectionDisplayName = (sectionName: string) => {
    const sectionNames: { [key: string]: string } = {
      'title': 'О компании',
      'history': 'История бренда',
      'quality': 'Качество материалов',
      'ecology': 'Экологичность',
      'career': 'Карьера',
      'mission': 'Наша миссия',
      'values': 'Наши ценности',
      'delivery': 'Доставка и возврат',
      'size_guide': 'Таблица размеров',
      'care': 'Уход за изделиями',
      'contacts': 'Контакты'
    };
    return sectionNames[sectionName] || sectionName;
  };
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
              {categories.slice(0, 4).map((category) => (
                <Link 
                  key={category.id}
                  to={`/catalog?category=${category.slug}`} 
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground tracking-wide">
              ПОДДЕРЖКА
            </h3>
            <div className="space-y-3">
              <Link to="/contacts" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Контакты
              </Link>
              {supportSections.slice(0, 4).map((section) => (
                <Link 
                  key={section.id}
                  to="/contacts" 
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {getSectionDisplayName(section.section_name)}
                </Link>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground tracking-wide">
              О НАС
            </h3>
            <div className="space-y-3">
              {aboutSections.slice(0, 5).map((section) => (
                <Link 
                  key={section.id}
                  to="/about" 
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {section.content_value}
                </Link>
              ))}
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
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Политика конфиденциальности
              </Link>
              <Link to="/terms-of-use" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;