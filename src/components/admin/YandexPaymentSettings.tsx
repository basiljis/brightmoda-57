import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface YandexPaymentSettings {
  id?: string;
  shop_id: string;
  secret_key: string;
  is_enabled: boolean;
  test_mode: boolean;
  webhook_url: string;
}

const YandexPaymentSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<YandexPaymentSettings>({
    shop_id: '',
    secret_key: '',
    is_enabled: false,
    test_mode: true,
    webhook_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('yandex_payment_settings')
        .select('*')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading Yandex payment settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить настройки Яндекс.Касса",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!settings.shop_id.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите Shop ID",
        variant: "destructive",
      });
      return;
    }

    if (!settings.secret_key.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите секретный ключ",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('yandex_payment_settings')
        .upsert({
          ...settings,
          shop_id: settings.shop_id.trim(),
          secret_key: settings.secret_key.trim(),
          webhook_url: settings.webhook_url.trim()
        });

      if (error) throw error;

      toast({
        title: "Настройки сохранены",
        description: "Настройки Яндекс.Касса успешно обновлены",
      });

      loadSettings();
    } catch (error) {
      console.error('Error saving Yandex payment settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof YandexPaymentSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Настройки Яндекс.Касса
        </CardTitle>
        <CardDescription>
          Настройка интеграции с платежной системой ЮMoney (Яндекс.Касса)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Для работы с Яндекс.Кассой необходимо получить Shop ID и секретный ключ в личном кабинете ЮMoney.
            В тестовом режиме используйте тестовые данные.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="shop_id">Shop ID</Label>
            <Input
              id="shop_id"
              type="text"
              value={settings.shop_id}
              onChange={(e) => handleInputChange('shop_id', e.target.value)}
              placeholder="Введите Shop ID из ЮMoney"
            />
          </div>

          <div>
            <Label htmlFor="secret_key">Секретный ключ</Label>
            <Input
              id="secret_key"
              type="password"
              value={settings.secret_key}
              onChange={(e) => handleInputChange('secret_key', e.target.value)}
              placeholder="Введите секретный ключ из ЮMoney"
            />
          </div>

          <div>
            <Label htmlFor="webhook_url">Webhook URL</Label>
            <Input
              id="webhook_url"
              type="url"
              value={settings.webhook_url}
              onChange={(e) => handleInputChange('webhook_url', e.target.value)}
              placeholder="https://your-domain.com/webhook/yandex"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL для получения уведомлений о статусе платежей
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="test_mode"
              checked={settings.test_mode}
              onCheckedChange={(checked) => handleInputChange('test_mode', checked)}
            />
            <Label htmlFor="test_mode">Тестовый режим</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_enabled"
              checked={settings.is_enabled}
              onCheckedChange={(checked) => handleInputChange('is_enabled', checked)}
            />
            <Label htmlFor="is_enabled">Включить Яндекс.Касса</Label>
          </div>

          {settings.is_enabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Яндекс.Касса активирована. Убедитесь, что настройки корректны перед использованием в продакшене.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Популярные настройки:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Тестовые данные:</strong></p>
            <p>Shop ID: 123456</p>
            <p>Секретный ключ: test_secret_key</p>
            <p><strong>Webhook URL:</strong> Укажите URL вашего сервера для получения уведомлений</p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default YandexPaymentSettings;