import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface EmailSubscription {
  id: string;
  email: string;
  user_id: string | null;
  is_active: boolean;
  created_at: string;
}

const EmailSubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('email_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Ошибка загрузки подписок');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      setSubscriptions(subscriptions.map(sub => 
        sub.id === id ? { ...sub, is_active: isActive } : sub
      ));
      
      toast.success('Статус подписки обновлен');
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast.error('Ошибка обновления статуса');
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  if (loading) {
    return <div>Загрузка подписок...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление подписками на рассылку</CardTitle>
        <p className="text-sm text-muted-foreground">
          Всего подписок: {subscriptions.length} 
          (активных: {subscriptions.filter(sub => sub.is_active).length})
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <p className="text-muted-foreground">Подписок пока нет</p>
          ) : (
            subscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{subscription.email}</span>
                    <Badge variant={subscription.is_active ? "default" : "secondary"}>
                      {subscription.is_active ? "Активна" : "Отключена"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Подписан: {format(new Date(subscription.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={subscription.is_active}
                    onCheckedChange={(checked) => handleToggleSubscription(subscription.id, checked)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <Button onClick={loadSubscriptions} variant="outline" className="mt-4">
          Обновить список
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailSubscriptionManagement;