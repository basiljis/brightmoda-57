import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, RefreshCw } from 'lucide-react';
import PageEditor from './PageEditor';
import PageSyncManager from './PageSyncManager';
import { PageData, Block, BlockType, ParagraphBlock, ImageBlock, HeadingBlock } from '@/types/page-editor';

interface PageContent {
  id: string;
  page_name: string;
  section_name: string;
  content_type: string;
  content_value: string;
  display_order: number;
  is_active: boolean;
  menu_label?: string;
  menu_location?: string;
}

const PAGE_OPTIONS = [
  { value: 'home', label: 'Главная' },
  { value: 'catalog', label: 'Каталог' },
  { value: 'about', label: 'О нас' },
  { value: 'contacts', label: 'Контакты' },
  { value: 'lookbook', label: 'Lookbook' },
  { value: 'privacy_policy', label: 'Политика конфиденциальности' },
  { value: 'terms_of_use', label: 'Условия использования' },
  { value: 'public_offer', label: 'Публичная оферта' },
  { value: 'shipping_payment', label: 'Доставка и оплата' },
  { value: 'returns_exchange', label: 'Возврат и обмен' },
  { value: 'cardigans', label: 'Кардиганы' },
  { value: 'vests', label: 'Жилеты' },
  { value: 'sweaters', label: 'Свитеры' },
  { value: 'skirts', label: 'Юбки' },
  { value: 'pants', label: 'Брюки' },
  { value: 'scarves', label: 'Шарфы' },
  { value: 'hats', label: 'Головные уборы' },
  { value: 'blankets', label: 'Пледы' },
  { value: 'pillows', label: 'Подушки' },
  { value: 'pillowcases', label: 'Наволочки' }
];

const PageContentManagement = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('about');
  const [isPageEditorOpen, setIsPageEditorOpen] = useState(false);
  const [currentPageData, setCurrentPageData] = useState<PageData | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'sync'>('sync');

  useEffect(() => {
    loadContent();
    const onOpenVisualEditor = (e: any) => {
      const page = e?.detail?.page;
      if (page && page !== selectedPage) setSelectedPage(page);
      openPageEditor(page);
    };
    window.addEventListener('open-visual-editor-for', onOpenVisualEditor as any);
    return () => {
      window.removeEventListener('open-visual-editor-for', onOpenVisualEditor as any);
    };
  }, [selectedPage]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', selectedPage)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading page content:', error);
    }
  };

  const openPageEditor = async (pageName: string) => {
    try {
      // Пытаемся загрузить page_blocks (JSON формат с блоками)
      const { data: pageBlocksData, error: blocksError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', pageName)
        .eq('section_name', 'page_blocks')
        .maybeSingle();

      let pageData: PageData;

      if (!blocksError && pageBlocksData && pageBlocksData.content_value) {
        // Если есть сохраненные блоки, используем их
        try {
          const savedData = JSON.parse(pageBlocksData.content_value);
          pageData = {
            id: pageName,
            title: savedData.title || pageName.charAt(0).toUpperCase() + pageName.slice(1).replace('_', ' '),
            blocks: savedData.blocks || []
          };
        } catch (e) {
          console.error('Error parsing page_blocks:', e);
          // Если не удалось распарсить, создаем пустую страницу
          pageData = {
            id: pageName,
            title: pageName.charAt(0).toUpperCase() + pageName.slice(1).replace('_', ' '),
            blocks: []
          };
        }
      } else {
        // Если нет page_blocks, создаем новую пустую страницу
        pageData = {
          id: pageName,
          title: pageName.charAt(0).toUpperCase() + pageName.slice(1).replace('_', ' '),
          blocks: []
        };
      }

      setCurrentPageData(pageData);
      setIsPageEditorOpen(true);
    } catch (error) {
      console.error('Error opening page editor:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось открыть редактор страницы',
        variant: 'destructive'
      });
    }
  };

  const handlePageEditorSave = async (pageData: PageData) => {
    try {
      // Сначала сохраняем menu_item и page_blocks
      const { data: menuItems } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', pageData.id)
        .in('section_name', ['menu_item', 'page_blocks']);

      // Удаляем только контентные блоки, НЕ трогаем menu_item и page_blocks
      await supabase
        .from('page_content')
        .delete()
        .eq('page_name', pageData.id)
        .not('section_name', 'in', '(menu_item,page_blocks)');

      // Создаем один основной контент из всех блоков
      const htmlContent = pageData.blocks.map(block => {
        if (block.type === 'paragraph') {
          return `<p>${(block as ParagraphBlock).props.content}</p>`;
        } else if (block.type === 'heading') {
          const level = (block as HeadingBlock).props.level || 'h2';
          return `<${level}>${(block as HeadingBlock).props.text}</${level}>`;
        } else if (block.type === 'image') {
          return `<img src="${(block as ImageBlock).props.url}" alt="${(block as ImageBlock).props.alt || ''}" />`;
        }
        return '';
      }).join('\n');

      // Сохраняем как единый контент
      const { error: contentError } = await supabase
        .from('page_content')
        .insert({
          page_name: pageData.id,
          section_name: 'content',
          content_type: 'html',
          content_value: htmlContent,
          display_order: 0,
          is_active: true,
          menu_label: null,
          menu_location: 'none'
        });

      if (contentError) throw contentError;

      // Также сохраняем page_blocks для редактора
      const pageBlocksData = {
        id: pageData.id,
        title: pageData.title,
        blocks: pageData.blocks
      };

      const { error: blocksError } = await supabase
        .from('page_content')
        .upsert({
          page_name: pageData.id,
          section_name: 'page_blocks',
          content_type: 'json',
          content_value: JSON.stringify(pageBlocksData),
          display_order: -1,
          is_active: true,
          menu_label: null,
          menu_location: 'none'
        });

      if (blocksError) throw blocksError;

      toast({
        title: 'Сохранено',
        description: 'Страница успешно сохранена'
      });

      setIsPageEditorOpen(false);
      loadContent();
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Ошибка',
        description: `Не удалось сохранить страницу: ${(error as any).message}`,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление содержимым страниц</CardTitle>
          <CardDescription>Редактируйте содержимое страниц с помощью визуального редактора</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={viewMode === 'sync' ? 'default' : 'outline'}
              onClick={() => setViewMode('sync')}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Синхронизация страниц
            </Button>
            <Button
              variant={viewMode === 'editor' ? 'default' : 'outline'}
              onClick={() => setViewMode('editor')}
            >
              <Palette className="h-4 w-4 mr-2" />
              Редактор контента
            </Button>
          </div>
          {viewMode === 'sync' ? (
            <PageSyncManager />
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Выберите страницу</Label>
                <Select value={selectedPage} onValueChange={setSelectedPage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => openPageEditor(selectedPage)}>
                  <Palette className="h-4 w-4 mr-2" />
                  Визуальный редактор
                </Button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Текущий контент</h3>
                <div className="space-y-4">
                  {content.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.section_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Тип: {item.content_type} | Порядок: {item.display_order}
                          </p>
                          <div className="text-sm border rounded p-2 bg-gray-50 max-h-20 overflow-y-auto mt-2">
                            {item.content_type === 'image' ? (
                              <span className="text-blue-600">Изображение: {item.content_value}</span>
                            ) : (
                              item.content_value
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {content.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Контент не найден. Используйте визуальный редактор для создания страницы.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isPageEditorOpen && currentPageData && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">Редактирование контента</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Страница: {PAGE_OPTIONS.find(p => p.value === currentPageData.id)?.label || currentPageData.title}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsPageEditorOpen(false)}
                className="h-10 w-10"
              >
                ✕
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PageEditor
                initialPageData={currentPageData}
                onSave={handlePageEditorSave}
                onClose={() => setIsPageEditorOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageContentManagement;
