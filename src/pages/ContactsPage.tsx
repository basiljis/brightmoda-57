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
              КОНТАКТЫ
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-muted-foreground">
            {content.content ? (
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
            ) : (
              <p>Содержимое страницы не найдено. Настройте контент в административной панели.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;