import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface EmailSubscription {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

const EmailSubscriptionSettings = () => {
  const [subscription, setSubscription] = useState<EmailSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadSubscription = async () => {
    if (!user?.email || !user?.id) return;

    try {
      // Try to find subscription by user_id first, then by email
      let { data, error } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // If not found by user_id, try by email
      if (!data && !error) {
        const { data: emailData, error: emailError } = await supabase
          .from('email_subscriptions')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();
        
        data = emailData;
        error = emailError;
      }

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Ошибка загрузки настроек подписки');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async (isActive: boolean) => {
    if (!subscription) return;

    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .update({ is_active: isActive })
        .eq('id', subscription.id);

      if (error) throw error;
      
      setSubscription({ ...subscription, is_active: isActive });
      toast.success(isActive ? 'Подписка активирована' : 'Подписка отключена');
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast.error('Ошибка обновления подписки');
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [user?.email]);

  if (loading) {
    return <div>Загрузка настроек подписки...</div>;
  }

  const handleSubscribe = async () => {
    if (!user?.email) return;

    try {
      // Use upsert to handle both new and existing subscriptions
      const { error } = await supabase
        .from('email_subscriptions')
        .upsert(
          { 
            email: user.email, 
            user_id: user.id, 
            is_active: true,
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'email',
            ignoreDuplicates: false 
          }
        );

      if (error) throw error;
      
      toast.success('Вы успешно подписались на рассылку!');
      loadSubscription();
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Ошибка подписки на рассылку');
    }
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Подписка на рассылку</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Вы не подписаны на нашу рассылку. Подпишитесь, чтобы первыми узнавать о новых коллекциях!
          </p>
          <Button onClick={handleSubscribe} className="w-full">
            Подписаться на рассылку
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Подписка на рассылку</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email рассылка</p>
              <p className="text-sm text-muted-foreground">
                Получайте уведомления о новых коллекциях и акциях на {subscription.email}
              </p>
            </div>
            <Switch
              checked={subscription.is_active}
              onCheckedChange={handleToggleSubscription}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Подписка оформлена: {format(new Date(subscription.created_at), 'dd MMMM yyyy', { locale: ru })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSubscriptionSettings;