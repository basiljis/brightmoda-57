import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Plus, ArrowUp, ArrowDown, Image, Palette } from 'lucide-react';
import FileUploadField from './FileUploadField';
import RichTextEditor from './RichTextEditor';
import PageEditor from './PageEditor';
import { PageData } from '@/types/page-editor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  { value: 'about_us', label: 'О нас' },
  { value: 'contacts', label: 'Контакты' },
  { value: 'support', label: 'Поддержка' },
  { value: 'privacy_policy', label: 'Политика конфиденциальности' },
  { value: 'terms_of_use', label: 'Условия использования' }
];

const CONTENT_TYPE_OPTIONS = [
  { value: 'text', label: 'Текст' },
  { value: 'html', label: 'HTML' },
  { value: 'image', label: 'Изображение' },
  { value: 'json', label: 'JSON' }
];

const PageContentManagement = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('about_us');
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    page_name: 'about_us',
    section_name: '',
    content_type: 'text',
    content_value: '',
    display_order: 0,
    is_active: true,
    menu_label: '',
    menu_location: 'none'
  });
  const [dragBlockId, setDragBlockId] = useState<string | null>(null);
  const [pageLayout, setPageLayout] = useState<string>('default');
  const [isPageEditorOpen, setIsPageEditorOpen] = useState(false);
  const [currentPageData, setCurrentPageData] = useState<PageData | null>(null);
  const LAYOUT_OPTIONS = [
    { value: 'default', label: 'Обычная страница' },
    { value: 'hero', label: 'Геро-секция вверху' },
    { value: 'two-columns', label: 'Две колонки' },
    { value: 'grid', label: 'Сетка карточек' },
    { value: 'landing', label: 'Лендинг' },
  ];
  const [menuLevel, setMenuLevel] = useState<'top' | 'submenu'>('top');
  const headerParentOptions = Array.from(new Set(
    content
      .filter(i => (i as any).menu_location === 'header' || (i as any).menu_location === 'both')
      .map(i => i.page_name)
      .filter(Boolean)
  ));

  useEffect(() => {
    loadContent();
    loadPageLayout();
    const onOpenPicker = (e: any) => {
      const page = e?.detail?.page;
      if (page && page !== selectedPage) setSelectedPage(page);
      setIsDialogOpen(true);
      resetForm();
    };
    const onOpenVisualEditor = (e: any) => {
      const page = e?.detail?.page;
      if (page && page !== selectedPage) setSelectedPage(page);
      openPageEditor(page);
    };
    window.addEventListener('open-blocks-picker', onOpenPicker as any);
    window.addEventListener('open-visual-editor-for', onOpenVisualEditor as any);
    return () => {
      window.removeEventListener('open-blocks-picker', onOpenPicker as any);
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

  const loadPageLayout = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_name', selectedPage)
        .eq('section_name', 'page_layout')
        .maybeSingle();
      if (!error && data && data.content_value) {
        setPageLayout(data.content_value);
      } else {
        setPageLayout('default');
      }
    } catch (e) {
      setPageLayout('default');
    }
  };

  const savePageLayout = async () => {
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_name: selectedPage,
          section_name: 'page_layout',
          content_type: 'json',
          content_value: pageLayout,
          display_order: 0,
          is_active: true,
        });
      if (error) throw error;
      toast({ title: 'Шаблон сохранён', description: 'Оформление страницы обновлено' });
    } catch (e) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить шаблон', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      page_name: selectedPage,
      section_name: '',
      content_type: 'text',
      content_value: '',
      display_order: content.length + 1,
      is_active: true,
      menu_label: '',
      menu_location: 'none'
    });
    setEditingContent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingContent) {
        const { error } = await supabase
          .from('page_content')
          .update(formData)
          .eq('id', editingContent.id);

        if (error) throw error;

        toast({
          title: "Контент обновлен",
          description: "Содержимое страницы успешно обновлено",
        });
      } else {
        const { error } = await supabase
          .from('page_content')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Контент добавлен",
          description: "Новое содержимое страницы добавлено",
        });
      }

      loadContent();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить содержимое",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: PageContent) => {
    setEditingContent(item);
    setFormData({
      page_name: item.page_name,
      section_name: item.section_name,
      content_type: item.content_type,
      content_value: item.content_value,
      display_order: item.display_order,
      is_active: item.is_active,
      menu_label: item.menu_label || '',
      menu_location: item.menu_location || 'none'
    });
    const sameGroup = content.filter(c => c.page_name === item.page_name && ((c as any).menu_location === 'header' || (c as any).menu_location === 'both'));
    setMenuLevel(sameGroup.length > 1 ? 'submenu' : 'top');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот элемент содержимого?')) return;

    try {
      const { error } = await supabase
        .from('page_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Контент удален",
        description: "Содержимое страницы успешно удалено",
      });

      loadContent();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить содержимое",
        variant: "destructive",
      });
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('page_content')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) throw error;
      loadContent();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить порядок",
        variant: "destructive",
      });
    }
  };

  const handleBlockDragStart = (id: string) => setDragBlockId(id);
  const handleBlockDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleBlockDrop = async (targetId: string) => {
    if (!dragBlockId || dragBlockId === targetId) return;
    const source = content.find(c => c.id === dragBlockId);
    const target = content.find(c => c.id === targetId);
    if (!source || !target) return;
    await updateOrder(source.id, target.display_order);
    await updateOrder(target.id, source.display_order);
    setDragBlockId(null);
  };

  const handlePaletteDragStart = (e: React.DragEvent, tpl: { type: string; section: string }) => {
    e.dataTransfer.setData('application/x-block-template', JSON.stringify(tpl));
  };

  const handleListDropFromPalette = async (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/x-block-template');
    if (!raw) return;
    const tpl = JSON.parse(raw) as { type: string; section: string };
    try {
      const nextOrder = (content[content.length - 1]?.display_order || 0) + 1;
      const defaults: Record<string, string> = {
        text: '<p>Новый текстовый блок</p>',
        html: '<h2>Новый заголовок</h2>',
        image: ''
      };
      const { error } = await supabase
        .from('page_content')
        .insert([{
          page_name: selectedPage,
          section_name: tpl.section,
          content_type: tpl.type,
          content_value: defaults[tpl.type] ?? '',
          display_order: nextOrder,
          is_active: true,
          menu_label: null,
          menu_location: 'none'
        }]);
      if (error) throw error;
      await loadContent();
      toast({ title: 'Блок добавлен', description: 'Новый блок создан и добавлен в конец' });
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось создать блок', variant: 'destructive' });
    }
  };

  // Новые функции для работы с PageEditor
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
        blocks: existingContent?.map(item => ({
          id: item.id,
          type: item.content_type as any,
          props: {
            ...(item.content_type === 'text' || item.content_type === 'html' ? {
              content: item.content_value
            } : {}),
            ...(item.content_type === 'image' ? {
              url: item.content_value,
              alt: item.section_name,
              caption: item.menu_label
            } : {})
          }
        })) || []
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
        content_value: block.type === 'text' || block.type === 'html' 
          ? (block as any).props.content 
          : block.type === 'image' 
            ? (block as any).props.url 
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

  const getSectionDisplayName = (sectionName: string) => {
    const sectionMap: { [key: string]: string } = {
      title: 'Заголовок',
      subtitle: 'Подзаголовок',
      paragraph_1: 'Абзац 1',
      paragraph_2: 'Абзац 2',
      paragraph_3: 'Абзац 3',
      phone: 'Телефон',
      email: 'Email',
      address: 'Адрес',
      schedule: 'График работы',
      instagram: 'Instagram',
      telegram: 'Telegram',
      work_hours_weekdays: 'Часы работы (будни)',
      work_hours_weekend: 'Часы работы (выходные)'
    };
    return sectionMap[sectionName] || sectionName;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление содержимым страниц</CardTitle>
          <CardDescription>Редактируйте содержимое страниц "О нас" и "Контакты"</CardDescription>
        </CardHeader>
        <CardContent>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-lg bg-muted/30">
              <div className="md:col-span-2 space-y-1">
                <Label htmlFor="page_layout">Оформление страницы (шаблон)</Label>
                <Select value={pageLayout} onValueChange={setPageLayout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Шаблон определяет общую компоновку страницы. Содержимое ниже можно перетаскивать.</p>
              </div>
              <div className="flex items-end justify-end">
                <Button onClick={savePageLayout}>Сохранить шаблон</Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => openPageEditor(selectedPage)}>
                <Palette className="h-4 w-4 mr-2" />
                Визуальный редактор
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить элемент
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContent ? 'Редактировать элемент' : 'Добавить элемент'}
                    </DialogTitle>
                    <DialogDescription>
                      Заполните информацию о содержимом страницы
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { t: 'Текст', v: 'text', p: 'Абзац с визуальным редактором' },
                        { t: 'HTML', v: 'html', p: '<h2>Заголовок</h2>' },
                        { t: 'Изображение', v: 'image', p: 'Загрузка изображения' },
                      ].map((x) => (
                        <button
                          key={x.v}
                          type="button"
                          className={`border rounded p-2 text-left ${formData.content_type === x.v ? 'border-primary' : ''}`}
                          onClick={() => setFormData({ ...formData, content_type: x.v as any })}
                          title={x.p}
                        >
                          <div className="text-sm font-medium">{x.t}</div>
                          <div className="text-xs text-muted-foreground truncate">{x.p}</div>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="section_name">Название секции*</Label>
                        <Input
                          id="section_name"
                          value={formData.section_name}
                          onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                          required
                          placeholder="title, phone, email, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content_type">Тип контента</Label>
                        <Select
                          value={formData.content_type}
                          onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTENT_TYPE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content_value">Содержимое*</Label>

                      {formData.content_type === 'image' ? (
                        <FileUploadField
                          field="content_value"
                          label=""
                          description="Загрузите изображение для отображения на странице"
                          value={formData.content_value}
                          onChange={(value) => setFormData({ ...formData, content_value: value })}
                          folder="page-content"
                          showRecommendations={true}
                        />
                      ) : formData.content_type === 'text' ? (
                        <RichTextEditor
                          value={formData.content_value}
                          onChange={(html) => setFormData({ ...formData, content_value: html })}
                          placeholder="Введите текст..."
                        />
                      ) : (
                        <Textarea
                          id="content_value"
                          value={formData.content_value}
                          onChange={(e) => setFormData({ ...formData, content_value: e.target.value })}
                          rows={6}
                          required
                          placeholder={
                            formData.content_type === 'html'
                              ? 'Введите HTML код...'
                              : 'Введите JSON данные...'
                          }
                        />
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Активен</Label>
                    </div>

                    <Button type="submit" className="w-full">
                      {editingContent ? 'Обновить' : 'Добавить'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6" onDragOver={handleBlockDragOver} onDrop={handleListDropFromPalette}>
                <div className="md:col-span-1 space-y-3">
                  <h4 className="text-sm font-semibold">Добавить блок</h4>
                  <div className="grid gap-2">
                    <div className="border rounded p-3 cursor-grab bg-background" draggable onDragStart={(e) => handlePaletteDragStart(e, { type: 'text', section: 'paragraph_1' })}>
                      <p className="text-xs text-muted-foreground">Текстовый блок</p>
                    </div>
                    <div className="border rounded p-3 cursor-grab bg-background" draggable onDragStart={(e) => handlePaletteDragStart(e, { type: 'html', section: 'title' })}>
                      <p className="text-xs text-muted-foreground">Заголовок</p>
                    </div>
                    <div className="border rounded p-3 cursor-grab bg-background" draggable onDragStart={(e) => handlePaletteDragStart(e, { type: 'image', section: 'image_1' })}>
                      <p className="text-xs text-muted-foreground">Изображение</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Перетащите блок в область справа для создания.</p>
                </div>

                <div className="md:col-span-3 space-y-4">
                  {content.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="border rounded-lg p-4"
                      draggable
                      onDragStart={() => handleBlockDragStart(item.id)}
                      onDragOver={handleBlockDragOver}
                      onDrop={() => handleBlockDrop(item.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{getSectionDisplayName(item.section_name)}</h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {CONTENT_TYPE_OPTIONS.find(opt => opt.value === item.content_type)?.label}
                            </span>
                            {item.menu_location && item.menu_location !== 'none' && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {item.menu_location === 'header' ? '📍 Шапка' : '📍 Подвал'}
                              </span>
                            )}
                            {!item.is_active && (
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                Неактивен
                              </span>
                            )}
                          </div>
                          {item.menu_label && (
                            <p className="text-sm text-blue-600 mb-1">
                              Меню: {item.menu_label}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mb-2">
                            Секция: {item.section_name}
                          </p>
                          <div className="text-sm border rounded p-2 bg-gray-50 max-h-20 overflow-y-auto">
                            {item.content_type === 'image' ? (
                              <div className="flex items-center gap-2">
                                <Image className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-600 truncate">{item.content_value}</span>
                              </div>
                            ) : item.content_type === 'text' || item.content_type === 'html' ? (
                              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content_value }} />
                            ) : (
                              item.content_value
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrder(item.id, item.display_order - 1)}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrder(item.id, item.display_order + 1)}
                              disabled={index === content.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isPageEditorOpen && currentPageData && (
          <div className="fixed inset-0 z-50 bg-background">
            <PageEditor
              initialPageData={currentPageData}
              onSave={handlePageEditorSave}
              onClose={() => setIsPageEditorOpen(false)}
            />
          </div>
        )}
      </div>
    );
  };

  export default PageContentManagement;










