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
import { Edit, Trash2, Plus, ArrowUp, ArrowDown, Image } from 'lucide-react';
import FileUploadField from './FileUploadField';
import RichTextEditor from './RichTextEditor';
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

  useEffect(() => {
    loadContent();
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
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
                    <Label htmlFor="display_order">Порядок отображения</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="menu_label">Название в меню</Label>
                      <Input
                        id="menu_label"
                        value={formData.menu_label}
                        onChange={(e) => setFormData({ ...formData, menu_label: e.target.value })}
                        placeholder="Например: О компании, Наши контакты"
                      />
                      <p className="text-xs text-muted-foreground">
                        Оставьте пустым, чтобы не показывать в меню
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="menu_location">Расположение меню</Label>
                      <Select
                        value={formData.menu_location}
                        onValueChange={(value) => setFormData({ ...formData, menu_location: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Не показывать</SelectItem>
                          <SelectItem value="header">Шапка</SelectItem>
                          <SelectItem value="footer">Подвал</SelectItem>
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

            <div className="mt-6 space-y-4">
              {content.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PageContentManagement;