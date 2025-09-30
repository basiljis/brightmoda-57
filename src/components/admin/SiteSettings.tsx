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
    footer_logo_url: ''
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
          footer_logo_url: data.footer_logo_url || ''
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
        footer_logo_url: settings.footer_logo_url
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

        <FileUploadField
          field="logo_url"
          label="Логотип в шапке"
          description="Логотип, отображаемый в шапке сайта"
          value={settings.logo_url}
          onChange={(value) => setSettings(prev => ({...prev, logo_url: value}))}
          folder="site"
          recommendationsFor="logo"
          disabled={loading}
        />

        <FileUploadField
          field="footer_logo_url"
          label="Логотип в подвале"
          description="Логотип, отображаемый в подвале сайта (может отличаться от основного)"
          value={settings.footer_logo_url}
          onChange={(value) => setSettings(prev => ({...prev, footer_logo_url: value}))}
          folder="site"
          recommendationsFor="logo"
          disabled={loading}
        />

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;