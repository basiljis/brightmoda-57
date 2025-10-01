import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    footer_logo_dark_url: ''
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
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setSettings({
          favicon_url: data.favicon_url || '',
          logo_url: data.logo_url || '',
          logo_dark_url: data.logo_dark_url || '',
          footer_logo_url: data.footer_logo_url || '',
          footer_logo_dark_url: data.footer_logo_dark_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };


  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('site_settings').upsert({
        favicon_url: settings.favicon_url,
        logo_url: settings.logo_url,
        logo_dark_url: settings.logo_dark_url,
        footer_logo_url: settings.footer_logo_url,
        footer_logo_dark_url: settings.footer_logo_dark_url
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
          Управление фавиконом и логотипами сайта
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

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;