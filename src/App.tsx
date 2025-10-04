import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import LookbookPage from "./pages/LookbookPage";
import AboutPage from "./pages/AboutPage";
import ContactsPage from "./pages/ContactsPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import CategoryPage from "./components/CategoryPage";
import CartPage from "./pages/CartPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Load favicon on app initialization
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('favicon_url')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error || !data || !data.favicon_url) return;

        // Update favicon
        let favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
          favicon.setAttribute('href', data.favicon_url);
        } else {
          favicon = document.createElement('link');
          favicon.setAttribute('rel', 'icon');
          favicon.setAttribute('href', data.favicon_url);
          document.head.appendChild(favicon);
        }
      } catch (error) {
        console.error('Error loading favicon:', error);
      }
    };

    loadFavicon();

    // Set up real-time listener for favicon updates
    const channel = supabase.channel('site_settings_favicon_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'site_settings' }, 
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            if (newData.favicon_url) {
              let favicon = document.querySelector('link[rel="icon"]');
              if (favicon) {
                favicon.setAttribute('href', newData.favicon_url);
              } else {
                favicon = document.createElement('link');
                favicon.setAttribute('rel', 'icon');
                favicon.setAttribute('href', newData.favicon_url);
                document.head.appendChild(favicon);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load fonts on app initialization
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const { data, error } = await supabase
          .from('seo_settings')
          .select('font_headings, font_body, font_accent, font_weights, custom_fonts_css')
          .eq('page_name', 'home')
          .eq('is_active', true)
          .maybeSingle();
        
        if (error || !data) return;

        const GOOGLE_FONTS = [
          'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
          'Oswald', 'Raleway', 'Poppins', 'Merriweather', 'Playfair Display',
          'Lora', 'Ubuntu', 'Nunito', 'PT Sans', 'Fira Sans', 'Work Sans',
          'Crimson Text', 'Libre Baskerville', 'Cormorant Garamond', 'Rubik',
          'Cormorant', 'Alegreya Sans', 'IBM Plex Sans'
        ];

        // Remove existing Google Fonts links
        const existingLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        existingLinks.forEach(link => link.remove());

        // Add Google Fonts
        const uniqueFonts = [...new Set([data.font_headings, data.font_body, data.font_accent])];
        const googleFonts = uniqueFonts.filter(font => GOOGLE_FONTS.includes(font));
        
        if (googleFonts.length > 0) {
          const fontWeights = (typeof data.font_weights === 'object' && data.font_weights && !Array.isArray(data.font_weights)) 
            ? data.font_weights as { headings?: string[]; body?: string[]; accent?: string[]; } 
            : { headings: ['400', '600'], body: ['400'], accent: ['400'] };
          
          const fontWeightMap = {
            [data.font_headings]: fontWeights.headings || ['400', '600'],
            [data.font_body]: fontWeights.body || ['400'],
            [data.font_accent]: fontWeights.accent || ['400']
          };

          googleFonts.forEach(font => {
            const weights = fontWeightMap[font] || ['400'];
            const fontFamily = font.replace(/ /g, '+');
            const weightsStr = weights.join(',');
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            // Добавляем поддержку кириллицы для всех шрифтов
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${weightsStr}&subset=cyrillic,latin&display=swap`;
            document.head.appendChild(link);
          });
        }

        // Add custom CSS
        if (data.custom_fonts_css) {
          let customStyle = document.getElementById('app-custom-fonts-style');
          if (!customStyle) {
            customStyle = document.createElement('style');
            customStyle.id = 'app-custom-fonts-style';
            document.head.appendChild(customStyle);
          }
          customStyle.textContent = data.custom_fonts_css;
        }

        // Apply fonts to CSS variables
        document.documentElement.style.setProperty('--font-headings', `"${data.font_headings}", sans-serif`);
        document.documentElement.style.setProperty('--font-body', `"${data.font_body}", sans-serif`);
        document.documentElement.style.setProperty('--font-accent', `"${data.font_accent}", sans-serif`);

      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };

    loadFonts();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin" element={<AdminPage />} />
                
                {/* Clothing Categories */}
                <Route path="/cardigans" element={<CategoryPage title="Кардиганы" description="Элегантные кардиганы из премиальной мериносовой шерсти" />} />
                <Route path="/vests" element={<CategoryPage title="Жилетки" description="Стильные жилетки для создания многослойных образов" />} />
                <Route path="/t-shirts" element={<CategoryPage title="Футболки" description="Комфортные футболки из натуральных материалов" />} />
                <Route path="/skirts" element={<CategoryPage title="Юбки" description="Изысканные юбки для любого случая" />} />
                <Route path="/pants" element={<CategoryPage title="Брюки" description="Классические и современные брюки" />} />
                <Route path="/scarves" element={<CategoryPage title="Шарфы" description="Шарфы и платки из мериносовой шерсти" />} />
                <Route path="/hats" element={<CategoryPage title="Головные уборы" description="Шапки и береты ручной работы" />} />
                
                {/* Interior Categories */}
                <Route path="/blankets" element={<CategoryPage title="Пледы" description="Мягкие пледы для уютного дома" />} />
                <Route path="/pillows" element={<CategoryPage title="Подушки" description="Декоративные подушки из натуральных тканей" />} />
                <Route path="/pillowcases" element={<CategoryPage title="Наволочки" description="Наволочки премиального качества" />} />
                
                {/* Collections */}
                <Route path="/collections/:collection" element={<CategoryPage title="Коллекция" />} />
                
                {/* Pages */}
                <Route path="/lookbook" element={<LookbookPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                
                {/* Legal Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-use" element={<TermsOfUsePage />} />
                <Route path="/public-offer" element={<CategoryPage title="Публичная оферта" />} />
                <Route path="/shipping-payment" element={<CategoryPage title="Доставка и оплата" />} />
                <Route path="/returns-exchange" element={<CategoryPage title="Возврат и обмен" />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
