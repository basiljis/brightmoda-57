import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PageContent {
  id: string;
  section_name: string;
  content_value: string;
  display_order: number;
}

const AboutPage = () => {
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
        .eq('page_name', 'about_us')
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
              {content.title || 'О НАС'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content.subtitle || 'История бренда BRIGHT и наша философия'}
            </p>
          </div>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            {content.paragraph_1 && (
              <p>{content.paragraph_1}</p>
            )}
            
            {content.paragraph_2 && (
              <p>{content.paragraph_2}</p>
            )}
            
            {content.paragraph_3 && (
              <p>{content.paragraph_3}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;