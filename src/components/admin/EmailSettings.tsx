import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface EmailSettings {
  id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  is_enabled: boolean;
}

const EmailSettings = () => {
  const [settings, setSettings] = useState<EmailSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: '',
    is_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
      toast.error('Ошибка загрузки настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let query;
      if (settings.id) {
        query = supabase
          .from('email_settings')
          .update(settings)
          .eq('id', settings.id);
      } else {
        query = supabase
          .from('email_settings')
          .insert(settings);
      }

      const { error } = await query;
      if (error) throw error;

      toast.success('Настройки сохранены');
      loadSettings(); // Reload to get the ID if it was a new record
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof EmailSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return <div>Загрузка настроек...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки рассылки</CardTitle>
        <p className="text-sm text-muted-foreground">
          Настройте SMTP сервер для отправки email рассылок
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.is_enabled}
            onCheckedChange={(checked) => handleInputChange('is_enabled', checked)}
          />
          <Label>Включить отправку рассылок</Label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtp_host">SMTP хост</Label>
            <Input
              id="smtp_host"
              placeholder="smtp.gmail.com"
              value={settings.smtp_host}
              onChange={(e) => handleInputChange('smtp_host', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_port">SMTP порт</Label>
            <Input
              id="smtp_port"
              type="number"
              placeholder="587"
              value={settings.smtp_port}
              onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value) || 587)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtp_username">SMTP логин</Label>
            <Input
              id="smtp_username"
              placeholder="your-email@gmail.com"
              value={settings.smtp_username}
              onChange={(e) => handleInputChange('smtp_username', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_password">SMTP пароль</Label>
            <Input
              id="smtp_password"
              type="password"
              placeholder="••••••••"
              value={settings.smtp_password}
              onChange={(e) => handleInputChange('smtp_password', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from_email">Email отправителя</Label>
            <Input
              id="from_email"
              placeholder="noreply@yourdomain.com"
              value={settings.from_email}
              onChange={(e) => handleInputChange('from_email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="from_name">Имя отправителя</Label>
            <Input
              id="from_name"
              placeholder="BRIGHT"
              value={settings.from_name}
              onChange={(e) => handleInputChange('from_name', e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Популярные SMTP настройки:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Gmail: smtp.gmail.com:587 (требуется пароль приложения)</li>
            <li>Yandex: smtp.yandex.ru:587</li>
            <li>Mail.ru: smtp.mail.ru:587</li>
            <li>SendGrid: smtp.sendgrid.net:587</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;