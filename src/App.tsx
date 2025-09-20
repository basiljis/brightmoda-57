import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import CategoryPage from "./components/CategoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
              <Route path="/profile" element={<ProfilePage />} />
              
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
              <Route path="/privacy-policy" element={<CategoryPage title="Политика конфиденциальности" />} />
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
