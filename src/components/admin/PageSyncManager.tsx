import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Plus, Eye, Edit, CheckCircle, AlertCircle } from 'lucide-react';

interface SitePage {
  path: string;
  name: string;
  component: string;
  isActive: boolean;
  hasContent: boolean;
  lastModified?: string;
}

interface PageSyncStatus {
  totalPages: number;
  syncedPages: number;
  unsyncedPages: number;
  pages: SitePage[];
}

// Определяем все страницы сайта на основе маршрутов (исключая системные страницы)
// Системные страницы (cart, favorites, profile) исключены, так как они не должны редактироваться через контент-менеджер
const SITE_PAGES: Omit<SitePage, 'hasContent' | 'lastModified'>[] = [
  { path: '/', name: 'Главная', component: 'HomePage', isActive: true },
  { path: '/catalog', name: 'Каталог', component: 'CatalogPage', isActive: true },
  { path: '/about', name: 'О нас', component: 'AboutPage', isActive: true },
  { path: '/contacts', name: 'Контакты', component: 'ContactsPage', isActive: true },
  { path: '/lookbook', name: 'Lookbook', component: 'LookbookPage', isActive: true },
  { path: '/privacy-policy', name: 'Политика конфиденциальности', component: 'PrivacyPolicyPage', isActive: true },
  { path: '/terms-of-use', name: 'Условия использования', component: 'TermsOfUsePage', isActive: true },
  { path: '/public-offer', name: 'Публичная оферта', component: 'CategoryPage', isActive: true },
  { path: '/shipping-payment', name: 'Доставка и оплата', component: 'CategoryPage', isActive: true },
  { path: '/returns-exchange', name: 'Возврат и обмен', component: 'CategoryPage', isActive: true },
  // Категории товаров
  { path: '/cardigans', name: 'Кардиганы', component: 'CategoryPage', isActive: true },
  { path: '/vests', name: 'Жилеты', component: 'CategoryPage', isActive: true },
  { path: '/sweaters', name: 'Свитеры', component: 'CategoryPage', isActive: true },
  { path: '/skirts', name: 'Юбки', component: 'CategoryPage', isActive: true },
  { path: '/pants', name: 'Брюки', component: 'CategoryPage', isActive: true },
  { path: '/scarves', name: 'Шарфы', component: 'CategoryPage', isActive: true },
  { path: '/hats', name: 'Головные уборы', component: 'CategoryPage', isActive: true },
  { path: '/blankets', name: 'Пледы', component: 'CategoryPage', isActive: true },
  { path: '/pillows', name: 'Подушки', component: 'CategoryPage', isActive: true },
  { path: '/pillowcases', name: 'Наволочки', component: 'CategoryPage', isActive: true },
];

const PageSyncManager = () => {
  const { toast } = useToast();
  const [syncStatus, setSyncStatus] = useState<PageSyncStatus>({
    totalPages: 0,
    syncedPages: 0,
    unsyncedPages: 0,
    pages: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPageSyncStatus();
  }, []);

  const checkPageSyncStatus = async () => {
    setLoading(true);
    try {
      // Получаем все страницы с контентом из базы данных
      const { data: existingContent, error } = await supabase
        .from('page_content')
        .select('page_name, updated_at')
        .order('page_name');

      if (error) throw error;

      // Создаем карту существующих страниц
      const existingPagesMap = new Map();
      existingContent?.forEach(item => {
        existingPagesMap.set(item.page_name, item.updated_at);
      });

      // Проверяем статус каждой страницы сайта
      const pagesWithStatus: SitePage[] = SITE_PAGES.map(page => {
        const pageName = getPageNameFromPath(page.path);
        const hasContent = existingPagesMap.has(pageName);
        const lastModified = existingPagesMap.get(pageName);

        return {
          ...page,
          hasContent,
          lastModified
        };
      });

      const syncedPages = pagesWithStatus.filter(p => p.hasContent).length;
      const unsyncedPages = pagesWithStatus.filter(p => !p.hasContent).length;

      setSyncStatus({
        totalPages: pagesWithStatus.length,
        syncedPages,
        unsyncedPages,
        pages: pagesWithStatus
      });

    } catch (error) {
      console.error('Error checking page sync status:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить статус синхронизации страниц',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPageNameFromPath = (path: string): string => {
    if (path === '/') return 'home';
    return path.replace('/', '').replace('-', '_');
  };

  const createPageContent = async (page: SitePage) => {
    try {
      const pageName = getPageNameFromPath(page.path);
      
      // Создаем базовую структуру контента для страницы
      const defaultContent = [
        {
          page_name: pageName,
          section_name: 'page_layout',
          content_type: 'json',
          content_value: 'default',
          display_order: 0,
          is_active: true,
          menu_label: null,
          menu_location: 'none'
        },
        {
          page_name: pageName,
          section_name: 'title',
          content_type: 'html',
          content_value: `<h1>${page.name}</h1>`,
          display_order: 1,
          is_active: true,
          menu_label: null,
          menu_location: 'none'
        }
      ];

      const { error } = await supabase
        .from('page_content')
        .insert(defaultContent);

      if (error) throw error;

      toast({
        title: 'Страница создана',
        description: `Контент для страницы "${page.name}" успешно создан`
      });

      // Обновляем статус
      checkPageSyncStatus();

    } catch (error) {
      console.error('Error creating page content:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать контент для страницы',
        variant: 'destructive'
      });
    }
  };

  const openPageEditor = (page: SitePage) => {
    const pageName = getPageNameFromPath(page.path);
    window.dispatchEvent(new CustomEvent('open-visual-editor-for', { 
      detail: { page: pageName } 
    }));
  };

  const getStatusBadge = (page: SitePage) => {
    if (page.hasContent) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Синхронизировано
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Не синхронизировано
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Синхронизация страниц
          </CardTitle>
          <CardDescription>
            Управление контентом страниц сайта и их синхронизация с админ-панелью
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{syncStatus.totalPages}</div>
                <div className="text-sm text-muted-foreground">Всего страниц</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{syncStatus.syncedPages}</div>
                <div className="text-sm text-muted-foreground">Синхронизировано</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{syncStatus.unsyncedPages}</div>
                <div className="text-sm text-muted-foreground">Не синхронизировано</div>
              </div>
            </div>

            {/* Кнопка обновления */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Страницы сайта</h3>
              <Button 
                onClick={checkPageSyncStatus} 
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Обновить статус
              </Button>
            </div>

            {/* Список страниц */}
            <div className="space-y-3">
              {syncStatus.pages.map((page, index) => (
                <div 
                  key={page.path} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{page.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {page.path} • {page.component}
                      </div>
                      {page.lastModified && (
                        <div className="text-xs text-muted-foreground">
                          Обновлено: {new Date(page.lastModified).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(page)}
                    
                    <div className="flex gap-1">
                      {page.hasContent ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPageEditor(page)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => createPageContent(page)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Создать контент
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(page.path, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Действия */}
            {syncStatus.unsyncedPages > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <h4 className="font-medium text-amber-800">Несинхронизированные страницы</h4>
                </div>
                <p className="text-sm text-amber-700 mb-3">
                  У вас есть {syncStatus.unsyncedPages} страниц без контента. 
                  Создайте контент для этих страниц, чтобы они отображались корректно.
                </p>
                <Button 
                  onClick={() => {
                    const unsyncedPages = syncStatus.pages.filter(p => !p.hasContent);
                    unsyncedPages.forEach(page => createPageContent(page));
                  }}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать контент для всех страниц
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageSyncManager;
