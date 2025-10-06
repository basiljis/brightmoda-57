import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import { Instagram, Facebook, Send, Youtube, Music } from "lucide-react";
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
  page_name: string;
  section_name: string;
  content_value: string;
  display_order: number;
  menu_label?: string;
  menu_location?: string;
}

const Footer = () => {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [aboutSections, setAboutSections] = useState<PageContent[]>([]);
  const [supportSections, setSupportSections] = useState<PageContent[]>([]);
  const [footerMenuItems, setFooterMenuItems] = useState<PageContent[]>([]);
  const [footerLogoUrl, setFooterLogoUrl] = useState(logo);
  const [footerLogoDarkUrl, setFooterLogoDarkUrl] = useState(logo);
  const [copyrightText, setCopyrightText] = useState('© 2024 BRIGHT. Все права защищены.');
  const [footerDescription, setFooterDescription] = useState('Премиальная одежда из мериносовой шерсти. Качество, комфорт и стиль в каждом изделии.');
  const [socialLinks, setSocialLinks] = useState<{[key: string]: string}>({});

  const currentFooterLogo = theme === 'dark' && footerLogoDarkUrl ? footerLogoDarkUrl : footerLogoUrl;

  useEffect(() => {
    loadSiteSettings();
    loadCategories();
    loadSubcategories();
    loadAboutSections();
    loadSupportSections();
    loadFooterMenuItems();

    // Set up real-time listener for footer logo updates
    const channel = supabase.channel('footer_logo_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'site_settings' }, 
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            setFooterLogoUrl(newData.footer_logo_url || newData.logo_url || logo);
            setFooterLogoDarkUrl(newData.footer_logo_dark_url || newData.logo_dark_url || logo);
            setCopyrightText(newData.copyright_text || '© 2024 BRIGHT. Все права защищены.');
            setFooterDescription(newData.footer_description || 'Премиальная одежда из мериносовой шерсти. Качество, комфорт и стиль в каждом изделии.');
            setSocialLinks((newData.social_links as { [key: string]: string }) || {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('footer_logo_url, footer_logo_dark_url, logo_url, logo_dark_url, copyright_text, footer_description, social_links')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setFooterLogoUrl(data.footer_logo_url || data.logo_url || logo);
        setFooterLogoDarkUrl(data.footer_logo_dark_url || data.logo_dark_url || logo);
        setCopyrightText(data.copyright_text || '© 2024 BRIGHT. Все права защищены.');
        setFooterDescription(data.footer_description || 'Премиальная одежда из мериносовой шерсти. Качество, комфорт и стиль в каждом изделии.');
        setSocialLinks((data.social_links as {[key: string]: string}) || {});
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

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
        .select('*')
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
        .select('*')
        .eq('page_name', 'support')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSupportSections(data || []);
    } catch (error) {
      console.error('Error loading support sections:', error);
    }
  };

  const loadFooterMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('menu_location', 'footer')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setFooterMenuItems(data || []);
    } catch (error) {
      console.error('Error loading footer menu items:', error);
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

  const getSocialIcon = (platform: string) => {
    const iconProps = { size: 20 };
    switch (platform) {
      case 'instagram': return <Instagram {...iconProps} />;
      case 'facebook': return <Facebook {...iconProps} />;
      case 'vk': return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.18 14.98h-1.28c-.64 0-.84-.52-1.99-1.67-1-.91-1.45-1.03-1.69-1.03-.35 0-.45.1-.45.58v1.53c0 .41-.13.65-1.21.65-1.79 0-3.77-1.08-5.16-3.1-2.09-2.96-2.66-5.19-2.66-5.64 0-.24.1-.47.58-.47h1.28c.43 0 .6.2.76.66.86 2.5 2.3 4.69 2.89 4.69.23 0 .33-.1.33-.68v-2.63c-.07-1.14-.67-1.24-.67-1.65 0-.2.17-.39.43-.39h2.02c.36 0 .49.19.49.61v3.54c0 .36.16.49.27.49.23 0 .42-.13.85-.56 1.33-1.49 2.28-3.79 2.28-3.79.13-.27.32-.47.75-.47h1.28c.51 0 .63.26.51.61-.19.87-2.24 4.2-2.24 4.2-.19.31-.26.45 0 .81.19.27.81.8 1.23 1.28.76.85 1.35 1.56 1.51 2.06.15.49-.08.74-.59.74z"/></svg>;
      case 'telegram': return <Send {...iconProps} />;
      case 'youtube': return <Youtube {...iconProps} />;
      case 'tiktok': return <Music {...iconProps} />;
      default: return null;
    }
  };

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
              <img 
                src={currentFooterLogo} 
                alt="BRIGHT" 
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {footerDescription}
            </p>
            {/* Social Links */}
            {Object.entries(socialLinks).some(([_, url]) => url) && (
              <div className="flex gap-3 pt-2">
                {Object.entries(socialLinks).map(([platform, url]) => 
                  url ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={platform}
                    >
                      {getSocialIcon(platform)}
                    </a>
                  ) : null
                )}
              </div>
            )}
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
              {aboutSections
                .filter(section => section.section_name === 'title')
                .slice(0, 5)
                .map((section) => (
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

          {/* Custom Footer Menu Items */}
          {footerMenuItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground tracking-wide">
                ДОПОЛНИТЕЛЬНО
              </h3>
              <div className="space-y-3">
                {footerMenuItems.map((item) => (
                  <Link 
                    key={item.id}
                    to={item.content_value} 
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.menu_label || item.section_name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              {copyrightText}
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