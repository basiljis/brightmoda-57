import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const EmailSubscription = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Пожалуйста, введите email адрес');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .insert({
          email,
          user_id: user?.id || null,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('Этот email уже подписан на рассылку');
        } else {
          throw error;
        }
      } else {
        toast.success('Вы успешно подписались на рассылку!');
        setEmail('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Произошла ошибка при подписке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold mb-2">Подпишитесь на рассылку</h3>
      <p className="text-muted-foreground mb-4">
        Подпишитесь на нашу e-mail рассылку, чтобы первыми увидеть новые коллекции, новости и видео
      </p>
      <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md">
        <Input
          type="email"
          placeholder="Введите ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Подписка...' : 'Подписаться'}
        </Button>
      </form>
    </div>
  );
};

export default EmailSubscription;