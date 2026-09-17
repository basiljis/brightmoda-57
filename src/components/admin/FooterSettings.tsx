import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from './RichTextEditor';
import { getActiveTenantId } from '@/lib/tenant';
import { TERMS_OF_USE_TEMPLATE, PRIVACY_POLICY_TEMPLATE } from '@/lib/legal-templates';

const FooterSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    copyright_text: '',
    footer_description: '',
    social_links: {
      instagram: '',
      facebook: '',
      vk: '',
      telegram: '',
      youtube: '',
      tiktok: '',
      contact_us_platform: '',
      contact_us_icon_mode: 'auto',
      contact_us_custom_icon_url: ''
    }
  });
  const [termsContent, setTermsContent] = useState('');
  const [privacyContent, setPrivacyContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadPageContent();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setSettings({
          copyright_text: data.copyright_text || '© 2024 Shoplet. Все права защищены.',
          footer_description: data.footer_description || 'Премиальная одежда из мериносовой шерсти. Качество, комфорт и стиль в каждом изделии.',
          social_links: {
            instagram: (data.social_links as any)?.instagram || '',
            facebook: (data.social_links as any)?.facebook || '',
            vk: (data.social_links as any)?.vk || '',
            telegram: (data.social_links as any)?.telegram || '',
            youtube: (data.social_links as any)?.youtube || '',
            tiktok: (data.social_links as any)?.tiktok || '',
            contact_us_platform: (data.social_links as any)?.contact_us_platform || '',
            contact_us_icon_mode: (data.social_links as any)?.contact_us_icon_mode || 'auto',
            contact_us_custom_icon_url: (data.social_links as any)?.contact_us_custom_icon_url || ''
          }
        });
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
    }
  };

  const loadPageContent = async () => {
    try {
      const tenantId = getActiveTenantId();

      // Load Terms of Use
      let termsQuery = supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'terms_of_use')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (tenantId) termsQuery = termsQuery.eq('tenant_id', tenantId);
      const { data: termsData } = await termsQuery;

      const terms = (termsData || []).map(item => item.content_value).join('\n').trim();
      setTermsContent(terms || TERMS_OF_USE_TEMPLATE);

      // Load Privacy Policy
      let privacyQuery = supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'privacy_policy')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (tenantId) privacyQuery = privacyQuery.eq('tenant_id', tenantId);
      const { data: privacyData } = await privacyQuery;

      const privacy = (privacyData || []).map(item => item.content_value).join('\n').trim();
      setPrivacyContent(privacy || PRIVACY_POLICY_TEMPLATE);
    } catch (error) {
      console.error('Error loading page content:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const tenantId = getActiveTenantId();
      if (!tenantId) throw new Error('Магазин не выбран');
      const { error } = await supabase.from('site_settings').upsert({
        tenant_id: tenantId,
        copyright_text: settings.copyright_text,
        footer_description: settings.footer_description,
        social_links: settings.social_links,
        updated_at: new Date().toISOString()
      } as any, { onConflict: 'tenant_id' }).select();

      if (error) throw error;

      toast({
        title: "Настройки сохранены",
        description: "Настройки подвала успешно обновлены",
      });
    } catch (error) {
      console.error('Error saving footer settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePageContent = async (pageName: 'terms_of_use' | 'privacy_policy', content: string) => {
    setLoading(true);
    try {
      const tenantId = getActiveTenantId();
      if (!tenantId) throw new Error('Магазин не выбран');

      // Delete existing content for this page
      await supabase
        .from('page_content')
        .delete()
        .eq('page_name', pageName)
        .eq('tenant_id', tenantId);

      // Insert new content
      const { error } = await supabase
        .from('page_content')
        .insert({
          tenant_id: tenantId,
          page_name: pageName,
          section_name: 'main',
          content_type: 'html',
          content_value: content,
          is_active: true,
          display_order: 0
        });

      if (error) throw error;

      toast({
        title: "Контент сохранен",
        description: `Содержимое страницы успешно обновлено`,
      });
    } catch (error) {
      console.error('Error saving page content:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить контент",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки подвала</CardTitle>
        <CardDescription>
          Управление текстами, ссылками и социальными сетями в подвале сайта
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Тексты подвала</h3>
          
          <div className="space-y-2">
            <Label htmlFor="copyright_text">Текст копирайта</Label>
            <Input
              id="copyright_text"
              value={settings.copyright_text}
              onChange={(e) => setSettings(prev => ({...prev, copyright_text: e.target.value}))}
              placeholder="© 2024 Shoplet. Все права защищены."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_description">Описание в подвале</Label>
            <Textarea
              id="footer_description"
              value={settings.footer_description}
              onChange={(e) => setSettings(prev => ({...prev, footer_description: e.target.value}))}
              placeholder="Премиальная одежда из мериносовой шерсти. Качество, комфорт и стиль в каждом изделии."
              disabled={loading}
              rows={3}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Страницы</h3>
          <p className="text-sm text-muted-foreground">
            Редактируйте содержимое страниц Условия использования и Политика конфиденциальности
          </p>
          
          <Tabs defaultValue="terms">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="terms">Условия использования</TabsTrigger>
              <TabsTrigger value="privacy">Политика конфиденциальности</TabsTrigger>
            </TabsList>
            
            <TabsContent value="terms" className="space-y-4">
              <div className="space-y-2">
                <Label>Содержимое страницы "Условия использования"</Label>
                <RichTextEditor
                  value={termsContent}
                  onChange={setTermsContent}
                  placeholder="Введите текст условий использования..."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => handleSavePageContent('terms_of_use', termsContent)}
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить условия использования'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => setTermsContent(TERMS_OF_USE_TEMPLATE)}
                >
                  Вставить шаблон
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <div className="space-y-2">
                <Label>Содержимое страницы "Политика конфиденциальности"</Label>
                <RichTextEditor
                  value={privacyContent}
                  onChange={setPrivacyContent}
                  placeholder="Введите текст политики конфиденциальности..."
                />
              </div>
              <Button 
                onClick={() => handleSavePageContent('privacy_policy', privacyContent)}
                disabled={loading}
              >
                {loading ? 'Сохранение...' : 'Сохранить политику конфиденциальности'}
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Социальные сети</h3>
          <p className="text-sm text-muted-foreground">Введите полные URL-адреса. Оставьте пустым, если не используется.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={settings.social_links.instagram}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  social_links: {...prev.social_links, instagram: e.target.value}
                }))}
                placeholder="https://instagram.com/yourpage"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={settings.social_links.facebook}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  social_links: {...prev.social_links, facebook: e.target.value}
                }))}
                placeholder="https://facebook.com/yourpage"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vk">VK</Label>
              <Input
                id="vk"
                value={settings.social_links.vk}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  social_links: {...prev.social_links, vk: e.target.value}
                }))}
                placeholder="https://vk.com/yourpage"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                value={settings.social_links.telegram}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  social_links: {...prev.social_links, telegram: e.target.value}
                }))}
                placeholder="https://t.me/yourchannel"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={settings.social_links.youtube}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  social_links: {...prev.social_links, youtube: e.target.value}
                }))}
                placeholder="https://youtube.com/@yourchannel"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                value={settings.social_links.tiktok}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  social_links: {...prev.social_links, tiktok: e.target.value}
                }))}
                placeholder="https://tiktok.com/@yourpage"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_us_platform">Кнопка «Связаться с нами» — платформа</Label>
            <select
              id="contact_us_platform"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={settings.social_links.contact_us_platform || ''}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                social_links: { ...prev.social_links, contact_us_platform: e.target.value }
              }))}
              disabled={loading}
            >
              <option value="">Не выбрано</option>
              <option value="telegram">Telegram</option>
              <option value="instagram">Instagram</option>
              <option value="vk">VK</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Кнопка отображается в шапке, если выбрана платформа и соответствующая ссылка выше заполнена.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_us_icon_mode">Иконка кнопки «Связаться с нами»</Label>
            <select
              id="contact_us_icon_mode"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={settings.social_links.contact_us_icon_mode || 'auto'}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                social_links: { ...prev.social_links, contact_us_icon_mode: e.target.value }
              }))}
              disabled={loading}
            >
              <option value="auto">Автоматическая (логотип платформы)</option>
              <option value="default">По умолчанию (конверт)</option>
              <option value="custom">Пользовательская</option>
            </select>
          </div>

          {settings.social_links.contact_us_icon_mode === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="contact_us_custom_icon_url">URL пользовательской иконки</Label>
              <Input
                id="contact_us_custom_icon_url"
                value={settings.social_links.contact_us_custom_icon_url}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links, contact_us_custom_icon_url: e.target.value }
                }))}
                placeholder="https://example.com/icon.png"
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить настройки'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FooterSettings;
