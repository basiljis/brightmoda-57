import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, BarChart3, Globe } from 'lucide-react';

interface SEOSetting {
  id: string;
  page_name: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  robots: string;
  schema_markup: any;
  is_active: boolean;
  // Новые поля для продвижения
  google_analytics_id: string;
  google_search_console_verification: string;
  yandex_metrica_id: string;
  yandex_webmaster_verification: string;
  google_tag_manager_id: string;
  facebook_domain_verification: string;
  additional_meta_tags: any;
}

const SEOSettings = () => {
  const { toast } = useToast();
  const [seoSettings, setSeoSettings] = useState<SEOSetting[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [currentSetting, setCurrentSetting] = useState<Partial<SEOSetting>>({
    page_name: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    robots: 'index, follow',
    schema_markup: {},
    is_active: true,
    // Новые поля для продвижения
    google_analytics_id: '',
    google_search_console_verification: '',
    yandex_metrica_id: '',
    yandex_webmaster_verification: '',
    google_tag_manager_id: '',
    facebook_domain_verification: '',
    additional_meta_tags: {}
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadSEOSettings();
  }, []);

  const loadSEOSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .order('page_name');
      
      if (error) throw error;
      setSeoSettings(data || []);
    } catch (error) {
      console.error('Error loading SEO settings:', error);
    }
  };

  const handlePageSelect = (pageId: string) => {
    setSelectedPage(pageId);
    const setting = seoSettings.find(s => s.id === pageId);
    if (setting) {
      setCurrentSetting(setting);
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  };

  const resetForm = () => {
    setCurrentSetting({
      page_name: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      og_title: '',
      og_description: '',
      og_image: '',
      canonical_url: '',
      robots: 'index, follow',
      schema_markup: {},
      is_active: true,
      // Новые поля для продвижения
      google_analytics_id: '',
      google_search_console_verification: '',
      yandex_metrica_id: '',
      yandex_webmaster_verification: '',
      google_tag_manager_id: '',
      facebook_domain_verification: '',
      additional_meta_tags: {}
    });
    setIsEditing(false);
    setSelectedPage('');
  };

  const handleSave = async () => {
    if (!currentSetting.page_name || !currentSetting.meta_title) {
      toast({
        title: "Ошибка",
        description: "Укажите название страницы и мета-заголовок",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...currentSetting,
        page_name: currentSetting.page_name!, // Type assertion since we check above
        schema_markup: typeof currentSetting.schema_markup === 'string' 
          ? JSON.parse(currentSetting.schema_markup || '{}')
          : currentSetting.schema_markup || {},
        additional_meta_tags: typeof currentSetting.additional_meta_tags === 'string' 
          ? JSON.parse(currentSetting.additional_meta_tags || '{}')
          : currentSetting.additional_meta_tags || {}
      };

      const { error } = await supabase.from('seo_settings').upsert(dataToSave);

      if (error) throw error;

      toast({
        title: "SEO настройки сохранены",
        description: "Настройки успешно обновлены",
      });

      loadSEOSettings();
      resetForm();
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, pageName: string) => {
    if (!confirm(`Удалить SEO настройки для страницы "${pageName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('seo_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Настройки удалены",
        description: `SEO настройки для "${pageName}" удалены`,
      });

      loadSEOSettings();
      if (selectedPage === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting SEO settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить настройки",
        variant: "destructive",
      });
    }
  };

  const predefinedPages = [
    { value: 'home', label: 'Главная страница' },
    { value: 'catalog', label: 'Каталог' },
    { value: 'about', label: 'О нас' },
    { value: 'contacts', label: 'Контакты' },
    { value: 'privacy', label: 'Политика конфиденциальности' },
    { value: 'terms', label: 'Условия использования' },
    { value: 'lookbook', label: 'Лукбук' },
    { value: 'cart', label: 'Корзина' },
    { value: 'favorites', label: 'Избранное' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO настройки</CardTitle>
          <CardDescription>
            Управление мета-тегами и SEO параметрами страниц
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Page list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Страницы</h3>
                <Button size="sm" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {seoSettings.map((setting) => (
                  <div
                    key={setting.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPage === setting.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handlePageSelect(setting.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{setting.page_name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {setting.meta_title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!setting.is_active && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Неактивно
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(setting.id, setting.page_name);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Редактировать' : 'Добавить'} SEO настройки
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="page_name">Название страницы</Label>
                  {!isEditing ? (
                    <Select
                      value={currentSetting.page_name}
                      onValueChange={(value) => 
                        setCurrentSetting(prev => ({...prev, page_name: value}))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите страницу" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedPages.map((page) => (
                          <SelectItem key={page.value} value={page.value}>
                            {page.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={currentSetting.page_name}
                      disabled
                      className="bg-muted"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="meta_title">Мета-заголовок</Label>
                  <Input
                    id="meta_title"
                    value={currentSetting.meta_title}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, meta_title: e.target.value}))
                    }
                    placeholder="Заголовок страницы для поисковых систем"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Рекомендуется до 60 символов
                  </p>
                </div>

                <div>
                  <Label htmlFor="meta_description">Мета-описание</Label>
                  <Textarea
                    id="meta_description"
                    value={currentSetting.meta_description}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, meta_description: e.target.value}))
                    }
                    placeholder="Описание страницы для поисковых систем"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Рекомендуется до 160 символов
                  </p>
                </div>

                <div>
                  <Label htmlFor="meta_keywords">Ключевые слова</Label>
                  <Input
                    id="meta_keywords"
                    value={currentSetting.meta_keywords}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, meta_keywords: e.target.value}))
                    }
                    placeholder="ключевое слово 1, ключевое слово 2"
                  />
                </div>

                <div>
                  <Label htmlFor="og_title">Open Graph заголовок</Label>
                  <Input
                    id="og_title"
                    value={currentSetting.og_title}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, og_title: e.target.value}))
                    }
                    placeholder="Заголовок для социальных сетей"
                  />
                </div>

                <div>
                  <Label htmlFor="og_description">Open Graph описание</Label>
                  <Textarea
                    id="og_description"
                    value={currentSetting.og_description}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, og_description: e.target.value}))
                    }
                    placeholder="Описание для социальных сетей"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="og_image">Open Graph изображение</Label>
                  <Input
                    id="og_image"
                    value={currentSetting.og_image}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, og_image: e.target.value}))
                    }
                    placeholder="URL изображения для социальных сетей"
                  />
                </div>

                <div>
                  <Label htmlFor="canonical_url">Канонический URL</Label>
                  <Input
                    id="canonical_url"
                    value={currentSetting.canonical_url}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, canonical_url: e.target.value}))
                    }
                    placeholder="https://example.com/page"
                  />
                </div>

                <div>
                  <Label htmlFor="robots">Robots директивы</Label>
                  <Select
                    value={currentSetting.robots}
                    onValueChange={(value) => 
                      setCurrentSetting(prev => ({...prev, robots: value}))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index, follow">index, follow</SelectItem>
                      <SelectItem value="noindex, follow">noindex, follow</SelectItem>
                      <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                      <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="schema_markup">Schema разметка (JSON)</Label>
                  <Textarea
                    id="schema_markup"
                    value={typeof currentSetting.schema_markup === 'object' 
                      ? JSON.stringify(currentSetting.schema_markup, null, 2)
                      : currentSetting.schema_markup
                    }
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, schema_markup: e.target.value}))
                    }
                    placeholder='{"@type": "WebPage", "name": "Page Name"}'
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={currentSetting.is_active}
                    onCheckedChange={(checked) => 
                      setCurrentSetting(prev => ({...prev, is_active: checked}))
                    }
                  />
                  <Label htmlFor="is_active">Активно</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Карточка с настройками продвижения */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Настройки продвижения
          </CardTitle>
          <CardDescription>
            Настройки для Яндекс.Метрики, Google Analytics и других сервисов продвижения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analytics">Аналитика</TabsTrigger>
              <TabsTrigger value="verification">Верификация</TabsTrigger>
              <TabsTrigger value="additional">Дополнительно</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    value={currentSetting.google_analytics_id}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, google_analytics_id: e.target.value}))
                    }
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Идентификатор Google Analytics 4
                  </p>
                </div>

                <div>
                  <Label htmlFor="yandex_metrica_id">Яндекс.Метрика ID</Label>
                  <Input
                    id="yandex_metrica_id"
                    value={currentSetting.yandex_metrica_id}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, yandex_metrica_id: e.target.value}))
                    }
                    placeholder="12345678"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Идентификатор счетчика Яндекс.Метрики
                  </p>
                </div>

                <div>
                  <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
                  <Input
                    id="google_tag_manager_id"
                    value={currentSetting.google_tag_manager_id}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, google_tag_manager_id: e.target.value}))
                    }
                    placeholder="GTM-XXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Идентификатор Google Tag Manager
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="google_search_console_verification">Google Search Console верификация</Label>
                  <Input
                    id="google_search_console_verification"
                    value={currentSetting.google_search_console_verification}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, google_search_console_verification: e.target.value}))
                    }
                    placeholder="google1234567890abcdef.html"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Код верификации для Google Search Console
                  </p>
                </div>

                <div>
                  <Label htmlFor="yandex_webmaster_verification">Яндекс.Вебмастер верификация</Label>
                  <Input
                    id="yandex_webmaster_verification"
                    value={currentSetting.yandex_webmaster_verification}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, yandex_webmaster_verification: e.target.value}))
                    }
                    placeholder="yandex_1234567890abcdef.html"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Код верификации для Яндекс.Вебмастера
                  </p>
                </div>

                <div>
                  <Label htmlFor="facebook_domain_verification">Facebook Domain Verification</Label>
                  <Input
                    id="facebook_domain_verification"
                    value={currentSetting.facebook_domain_verification}
                    onChange={(e) => 
                      setCurrentSetting(prev => ({...prev, facebook_domain_verification: e.target.value}))
                    }
                    placeholder="1234567890abcdef1234567890abcdef"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Код верификации домена для Facebook
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4">
              <div>
                <Label htmlFor="additional_meta_tags">Дополнительные мета-теги (JSON)</Label>
                <Textarea
                  id="additional_meta_tags"
                  value={typeof currentSetting.additional_meta_tags === 'object' 
                    ? JSON.stringify(currentSetting.additional_meta_tags, null, 2)
                    : currentSetting.additional_meta_tags
                  }
                  onChange={(e) => 
                    setCurrentSetting(prev => ({...prev, additional_meta_tags: e.target.value}))
                  }
                  placeholder={`{
  "pinterest-site-verification": "1234567890abcdef",
  "msvalidate.01": "1234567890ABCDEF",
  "custom-meta": "value"
}`}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JSON объект с дополнительными мета-тегами для различных сервисов
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? 'Сохранение...' : 'Сохранить все настройки'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOSettings;