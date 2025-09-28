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
  user_id?: string | null;
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
      // First try to find subscription by user_id
      let { data, error } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If found by user_id, use the most recent one
      if (data && data.length > 0) {
        setSubscription(data[0]);
        return;
      }

      // If not found by user_id, try by email
      const { data: emailData, error: emailError } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('email', user.email)
        .is('user_id', null)
        .order('created_at', { ascending: false });
        
      if (emailError) throw emailError;
      
      // If found by email, use the most recent one and update with user_id
      if (emailData && emailData.length > 0) {
        const subscription = emailData[0];
        
        // Update the subscription with user_id
        const { error: updateError } = await supabase
          .from('email_subscriptions')
          .update({ user_id: user.id })
          .eq('id', subscription.id);
          
        if (updateError) throw updateError;
        
        setSubscription({ ...subscription, user_id: user.id });
        return;
      }

      // No subscription found
      setSubscription(null);
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
      // Use the upsert_email_subscription function to handle duplicates
      const { data, error } = await supabase.rpc('upsert_email_subscription', {
        p_email: user.email,
        p_user_id: user.id
      });

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