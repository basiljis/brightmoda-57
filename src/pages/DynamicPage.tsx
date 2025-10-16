import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function DynamicPage() {
  const { "*": slug } = useParams();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        // Extract page name from slug (remove leading slash)
        const pageName = slug.replace(/^\//, '').replace(/\/$/, '');
        
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_name', pageName)
          .eq('section_name', 'content')
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        setContent(data);
      } catch (error) {
        console.error('Error loading page content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Страница не найдена</h1>
        <p className="text-muted-foreground">К сожалению, запрашиваемая страница не существует.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div 
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content.content_value }}
      />
    </div>
  );
}
