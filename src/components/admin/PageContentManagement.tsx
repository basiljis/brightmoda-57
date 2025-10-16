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
      const { data: existingContent, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', pageName)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const pageData: PageData = {
        id: pageName,
        title: pageName.charAt(0).toUpperCase() + pageName.slice(1).replace('_', ' '),
        blocks: existingContent?.map(item => {
          // Map old content_type to new block types
          let blockType: BlockType = 'paragraph';
          if (item.content_type === 'image') blockType = 'image';
          if (item.content_type === 'heading') blockType = 'heading';
          
          return {
            id: item.id,
            type: blockType,
            props: blockType === 'paragraph' ? {
              content: item.content_value
            } : blockType === 'image' ? {
              url: item.content_value,
              alt: item.section_name || '',
              caption: item.menu_label || undefined
            } : blockType === 'heading' ? {
              text: item.content_value,
              level: 2 as const,
              align: 'left' as const
            } : {}
          } as Block;
        }) || []
      };

      setCurrentPageData(pageData);
      setIsPageEditorOpen(true);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные страницы',
        variant: 'destructive'
      });
    }
  };

  const handlePageEditorSave = async (pageData: PageData) => {
    try {
      await supabase
        .from('page_content')
        .delete()
        .eq('page_name', pageData.id);

      const blocksToSave = pageData.blocks.map((block, index) => ({
        page_name: pageData.id,
        section_name: `${block.type}_${index}`,
        content_type: block.type,
        content_value: block.type === 'paragraph' 
          ? (block as ParagraphBlock).props.content 
          : block.type === 'image' 
            ? (block as ImageBlock).props.url 
            : block.type === 'heading'
              ? (block as HeadingBlock).props.text
              : JSON.stringify(block.props),
        display_order: index + 1,
        is_active: true,
        menu_label: null,
        menu_location: 'none'
      }));

      if (blocksToSave.length > 0) {
        const { error } = await supabase
          .from('page_content')
          .insert(blocksToSave);

        if (error) throw error;
      }

      toast({
        title: 'Сохранено',
        description: 'Страница успешно сохранена'
      });

      setIsPageEditorOpen(false);
      loadContent();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить страницу',
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
          <div className="bg-background border rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
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
