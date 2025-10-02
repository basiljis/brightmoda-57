import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    social_links: {
      instagram: '',
      facebook: '',
      vk: '',
      telegram: '',
      youtube: '',
      tiktok: ''
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
          social_links: (data.social_links as {
            instagram: string;
            facebook: string;
            vk: string;
            telegram: string;
            youtube: string;
            tiktok: string;
          }) || {
            instagram: '',
            facebook: '',
            vk: '',
            telegram: '',
            youtube: '',
            tiktok: ''
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
          Управление фавиконом, логотипами, текстами и социальными сетями
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
          <h3 className="text-lg font-semibold">Тексты подвала</h3>
          
          <div className="space-y-2">
            <Label htmlFor="copyright_text">Текст копирайта</Label>
            <Input
              id="copyright_text"
              value={settings.copyright_text}
              onChange={(e) => setSettings(prev => ({...prev, copyright_text: e.target.value}))}
              placeholder="© 2024 BRIGHT. Все права защищены."
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

        <div className="space-y-4 pt-6 border-t">
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
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;