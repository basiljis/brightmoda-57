import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PageContent {
  id: string;
  section_name: string;
  content_value: string;
  display_order: number;
}

const TermsOfUsePage = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageContent();
  }, []);

  const loadPageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('id, section_name, content_value, display_order')
        .eq('page_name', 'terms_of_use')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      const contentMap: Record<string, string> = {};
      data?.forEach((item: PageContent) => {
        contentMap[item.section_name] = item.content_value;
      });

      setContent(contentMap);
    } catch (error) {
      console.error('Error loading terms of use content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            {content.title || 'Условия использования'}
          </h1>
          
          {content.subtitle && (
            <p className="text-xl text-muted-foreground mb-12">
              {content.subtitle}
            </p>
          )}

          <div className="prose prose-lg max-w-none">
            {Object.entries(content).map(([key, value]) => {
              if (key === 'title' || key === 'subtitle') return null;
              
              return (
                <div key={key} className="mb-8">
                  <div 
                    className="text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: value }}
                  />
                </div>
              );
            })}
            
            {Object.keys(content).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Контент для этой страницы еще не добавлен в административной панели.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;