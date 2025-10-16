import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FileUploadField from './FileUploadField';

const SiteSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    favicon_url: '',
    logo_url: '',
    logo_dark_url: '',
    footer_logo_url: '',
    footer_logo_dark_url: '',
    copyright_text: '',
    footer_description: '',
    cookie_consent_enabled: true,
    cookie_consent_title: 'Использование файлов cookie',
    cookie_consent_text: 'Мы используем файлы cookie для улучшения работы сайта и анализа трафика. Продолжая использовать сайт, вы соглашаетесь с нашей политикой обработки персональных данных.',
    cookie_consent_button_text: 'Принять',
    cookie_consent_position: 'bottom',
    cookie_consent_privacy_link: '/privacy-policy',
    social_links: {
      instagram: '',
      facebook: '',
      vk: '',
      telegram: '',
      youtube: '',
      tiktok: '',
      contact_us_platform: '',
      contact_us_icon_mode: 'auto', // auto | default | custom
      contact_us_custom_icon_url: ''
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSettings({
          favicon_url: data.favicon_url || '',
          logo_url: data.logo_url || '',
          logo_dark_url: data.logo_dark_url || '',
          footer_logo_url: data.footer_logo_url || '',
          footer_logo_dark_url: data.footer_logo_dark_url || '',
          copyright_text: data.copyright_text || '© 2024 BRIGHT. Все права защищены.',
          footer_description: data.footer_description || 'Премиальная одежда из мериносовой шерсти. Качество, комфорт и стиль в каждом изделии.',
          cookie_consent_enabled: data.cookie_consent_enabled ?? true,
          cookie_consent_title: data.cookie_consent_title || 'Использование файлов cookie',
          cookie_consent_text: data.cookie_consent_text || 'Мы используем файлы cookie для улучшения работы сайта и анализа трафика. Продолжая использовать сайт, вы соглашаетесь с нашей политикой обработки персональных данных.',
          cookie_consent_button_text: data.cookie_consent_button_text || 'Принять',
          cookie_consent_position: data.cookie_consent_position || 'bottom',
          cookie_consent_privacy_link: data.cookie_consent_privacy_link || '/privacy-policy',
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
      console.error('Error loading site settings:', error);
    }
  };


  const handleSave = async () => {
    setLoading(true);
    try {
      // Get the first record's ID to update it
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      const { error } = await supabase.from('site_settings').upsert({
        id: existingSettings?.id,
        favicon_url: settings.favicon_url,
        logo_url: settings.logo_url,
        logo_dark_url: settings.logo_dark_url,
        footer_logo_url: settings.footer_logo_url,
        footer_logo_dark_url: settings.footer_logo_dark_url,
        copyright_text: settings.copyright_text,
        footer_description: settings.footer_description,
        cookie_consent_enabled: settings.cookie_consent_enabled,
        cookie_consent_title: settings.cookie_consent_title,
        cookie_consent_text: settings.cookie_consent_text,
        cookie_consent_button_text: settings.cookie_consent_button_text,
        cookie_consent_position: settings.cookie_consent_position,
        cookie_consent_privacy_link: settings.cookie_consent_privacy_link,
        social_links: settings.social_links
      }).select();

      if (error) throw error;

      // Update favicon in document head
      if (settings.favicon_url) {
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
          existingFavicon.setAttribute('href', settings.favicon_url);
        } else {
          const newFavicon = document.createElement('link');
          newFavicon.rel = 'icon';
          newFavicon.href = settings.favicon_url;
          document.head.appendChild(newFavicon);
        }
      }

      toast({
        title: "Настройки сохранены",
        description: "Настройки сайта успешно обновлены",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки сайта</CardTitle>
        <CardDescription>
          Управление фавиконом и логотипами
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <FileUploadField
            field="favicon_url"
            label="Фавикон"
            description="Иконка сайта, отображаемая во вкладке браузера"
            value={settings.favicon_url}
            onChange={(value) => setSettings(prev => ({...prev, favicon_url: value}))}
            accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml,image/ico"
            folder="site"
            recommendationsFor="favicon"
            disabled={loading}
          />
          {settings.favicon_url && (
            <div className="mt-2 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Текущий фавикон:</p>
              <img src={settings.favicon_url} alt="Favicon" className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <FileUploadField
            field="logo_url"
            label="Логотип в шапке (светлая тема)"
            description="Логотип, отображаемый в шапке сайта при светлой теме"
            value={settings.logo_url}
            onChange={(value) => setSettings(prev => ({...prev, logo_url: value}))}
            folder="site"
            recommendationsFor="logo"
            disabled={loading}
          />
          {settings.logo_url && (
            <div className="mt-2 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Текущий логотип шапки (светлая тема):</p>
              <img src={settings.logo_url} alt="Header Logo Light" className="h-12 w-auto" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <FileUploadField
            field="logo_dark_url"
            label="Логотип в шапке (темная тема)"
            description="Логотип, отображаемый в шапке сайта при темной теме"
            value={settings.logo_dark_url}
            onChange={(value) => setSettings(prev => ({...prev, logo_dark_url: value}))}
            folder="site"
            recommendationsFor="logo"
            disabled={loading}
          />
          {settings.logo_dark_url && (
            <div className="mt-2 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Текущий логотип шапки (темная тема):</p>
              <img src={settings.logo_dark_url} alt="Header Logo Dark" className="h-12 w-auto" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <FileUploadField
            field="footer_logo_url"
            label="Логотип в подвале (светлая тема)"
            description="Логотип, отображаемый в подвале сайта при светлой теме"
            value={settings.footer_logo_url}
            onChange={(value) => setSettings(prev => ({...prev, footer_logo_url: value}))}
            folder="site"
            recommendationsFor="logo"
            disabled={loading}
          />
          {settings.footer_logo_url && (
            <div className="mt-2 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Текущий логотип подвала (светлая тема):</p>
              <img src={settings.footer_logo_url} alt="Footer Logo Light" className="h-12 w-auto" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <FileUploadField
            field="footer_logo_dark_url"
            label="Логотип в подвале (темная тема)"
            description="Логотип, отображаемый в подвале сайта при темной теме"
            value={settings.footer_logo_dark_url}
            onChange={(value) => setSettings(prev => ({...prev, footer_logo_dark_url: value}))}
            folder="site"
            recommendationsFor="logo"
            disabled={loading}
          />
          {settings.footer_logo_dark_url && (
            <div className="mt-2 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Текущий логотип подвала (темная тема):</p>
              <img src={settings.footer_logo_dark_url} alt="Footer Logo Dark" className="h-12 w-auto" />
            </div>
          )}
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold">Уведомление о Cookie</h3>
          <p className="text-sm text-muted-foreground">
            Настройте окно с подтверждением обработки персональных данных и сбором информации
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cookie_consent_enabled">Показывать уведомление</Label>
              <p className="text-sm text-muted-foreground">
                Включить или отключить показ окна согласия с cookie
              </p>
            </div>
            <Switch
              id="cookie_consent_enabled"
              checked={settings.cookie_consent_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({...prev, cookie_consent_enabled: checked}))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cookie_consent_title">Заголовок</Label>
            <Input
              id="cookie_consent_title"
              value={settings.cookie_consent_title}
              onChange={(e) => setSettings(prev => ({...prev, cookie_consent_title: e.target.value}))}
              placeholder="Использование файлов cookie"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cookie_consent_text">Текст уведомления</Label>
            <Textarea
              id="cookie_consent_text"
              value={settings.cookie_consent_text}
              onChange={(e) => setSettings(prev => ({...prev, cookie_consent_text: e.target.value}))}
              placeholder="Мы используем файлы cookie..."
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cookie_consent_button_text">Текст кнопки</Label>
            <Input
              id="cookie_consent_button_text"
              value={settings.cookie_consent_button_text}
              onChange={(e) => setSettings(prev => ({...prev, cookie_consent_button_text: e.target.value}))}
              placeholder="Принять"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cookie_consent_position">Позиция окна</Label>
            <select
              id="cookie_consent_position"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={settings.cookie_consent_position}
              onChange={(e) => setSettings(prev => ({...prev, cookie_consent_position: e.target.value}))}
              disabled={loading}
            >
              <option value="bottom">Снизу</option>
              <option value="top">Сверху</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cookie_consent_privacy_link">Ссылка на политику конфиденциальности</Label>
            <Input
              id="cookie_consent_privacy_link"
              value={settings.cookie_consent_privacy_link}
              onChange={(e) => setSettings(prev => ({...prev, cookie_consent_privacy_link: e.target.value}))}
              placeholder="/privacy-policy"
              disabled={loading}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;