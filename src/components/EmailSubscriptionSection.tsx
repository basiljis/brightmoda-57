import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const EmailSubscriptionSection = () => {
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
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-light mb-4 tracking-wide">
            Подпишитесь на рассылку
          </h3>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Подпишитесь на нашу e-mail рассылку, чтобы первыми увидеть новые коллекции, новости и видео
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1 border-0 bg-background/60 backdrop-blur text-center"
            />
            <Button 
              type="submit" 
              disabled={loading}
              variant="outline"
              className="px-8 border-foreground/20 hover:bg-foreground hover:text-background transition-colors duration-300"
            >
              {loading ? '...' : 'Подписаться'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EmailSubscriptionSection;