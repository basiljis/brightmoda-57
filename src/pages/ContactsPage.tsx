import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PageContent {
  id: string;
  section_name: string;
  content_value: string;
  display_order: number;
}

const ContactsPage = () => {
  const [content, setContent] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageContent();
  }, []);

  const loadPageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'contacts')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const contentMap: { [key: string]: string } = {};
      data?.forEach((item: PageContent) => {
        contentMap[item.section_name] = item.content_value;
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Error loading page content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide text-foreground">
              {content.title || 'КОНТАКТЫ'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content.subtitle || 'Свяжитесь с нами любым удобным способом'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {content.phone && (
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Телефон</h3>
                  <p className="text-muted-foreground">{content.phone}</p>
                </div>
              )}
              
              {content.email && (
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Email</h3>
                  <p className="text-muted-foreground">{content.email}</p>
                </div>
              )}
              
              {(content.address || content.schedule) && (
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Адрес</h3>
                  <p className="text-muted-foreground">
                    {content.address && <>{content.address}<br/></>}
                    {content.schedule}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-8">
              {(content.instagram || content.telegram) && (
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Социальные сети</h3>
                  <div className="space-y-2 text-muted-foreground">
                    {content.instagram && <p>Instagram: {content.instagram}</p>}
                    {content.telegram && <p>Telegram: {content.telegram}</p>}
                  </div>
                </div>
              )}
              
              {(content.work_hours_weekdays || content.work_hours_weekend) && (
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Часы работы</h3>
                  <div className="text-muted-foreground">
                    {content.work_hours_weekdays && <p>{content.work_hours_weekdays}</p>}
                    {content.work_hours_weekend && <p>{content.work_hours_weekend}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;