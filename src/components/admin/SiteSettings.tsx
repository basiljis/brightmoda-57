import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, Trash2 } from 'lucide-react';

const SiteSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    favicon_url: '',
    logo_url: '',
    footer_logo_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState('');

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

  const handleFileUpload = async (file: File, field: string) => {
    if (!file) return;

    setUploading(field);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setSettings(prev => ({...prev, [field]: publicUrl}));

      toast({
        title: "Файл загружен",
        description: "Изображение успешно загружено",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить файл",
        variant: "destructive",
      });
    } finally {
      setUploading('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('site_settings').upsert({
        favicon_url: settings.favicon_url,
        logo_url: settings.logo_url,
        footer_logo_url: settings.footer_logo_url
      });

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

  const clearImage = (field: string) => {
    setSettings(prev => ({...prev, [field]: ''}));
  };

  const FileUploadField = ({ 
    field, 
    label, 
    description, 
    accept = "image/*" 
  }: { 
    field: string; 
    label: string; 
    description: string; 
    accept?: string; 
  }) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>
      
      {settings[field as keyof typeof settings] && (
        <div className="flex items-center gap-2 p-2 border rounded">
          <Image className="h-4 w-4" />
          <span className="text-sm flex-1 truncate">
            {settings[field as keyof typeof settings]}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearImage(field)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Input
          id={field}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, field);
          }}
          disabled={uploading === field}
        />
        {uploading === field && (
          <div className="text-sm text-muted-foreground">Загрузка...</div>
        )}
      </div>
      
      <Input
        placeholder="Или вставьте URL"
        value={settings[field as keyof typeof settings]}
        onChange={(e) => setSettings(prev => ({...prev, [field]: e.target.value}))}
      />
    </div>
  );

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
          description="Иконка сайта, отображаемая во вкладке браузера (рекомендуется 32x32 или 16x16 пикселей)"
          accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml"
        />

        <FileUploadField
          field="logo_url"
          label="Логотип в шапке"
          description="Логотип, отображаемый в шапке сайта"
        />

        <FileUploadField
          field="footer_logo_url"
          label="Логотип в подвале"
          description="Логотип, отображаемый в подвале сайта (может отличаться от основного)"
        />

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;