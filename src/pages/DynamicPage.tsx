import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import BlockRenderer from '@/components/admin/page-editor/BlockRenderer';
import type { PageData } from '@/types/page-editor';

export default function DynamicPage() {
  const { "*": slug } = useParams();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        // Extract page path from slug (remove leading/trailing slashes)
        const pagePath = '/' + slug.replace(/^\//, '').replace(/\/$/, '');
        
        // First, try to find the page by matching the URL in menu items
        const { data: menuItem, error: menuError } = await supabase
          .from('page_content')
          .select('page_name')
          .eq('section_name', 'menu_item')
          .eq('content_value', pagePath)
          .eq('is_active', true)
          .maybeSingle();

        if (menuError) throw menuError;
        
        // If we found the menu item, use its page_name to get the blocks
        if (menuItem) {
          const { data: pageBlocks, error: blocksError } = await supabase
            .from('page_content')
            .select('*')
            .eq('page_name', menuItem.page_name)
            .eq('section_name', 'page_blocks')
            .eq('is_active', true)
            .maybeSingle();

          if (blocksError) throw blocksError;
          
          if (pageBlocks?.content_value) {
            const parsed = JSON.parse(pageBlocks.content_value);
            setPageData(parsed);
          } else {
            // Fallback: try old-style 'content' section
            const { data: oldContent, error: oldError } = await supabase
              .from('page_content')
              .select('*')
              .eq('page_name', menuItem.page_name)
              .eq('section_name', 'content')
              .eq('is_active', true)
              .maybeSingle();
            
            if (!oldError && oldContent) {
              // Convert old HTML content to block structure
              setPageData({
                id: oldContent.id,
                title: menuItem.page_name,
                blocks: [{
                  id: 'legacy-content',
                  type: 'paragraph',
                  props: { content: oldContent.content_value }
                }]
              });
            } else {
              setPageData(null);
            }
          }
        } else {
          setPageData(null);
        }
      } catch (error) {
        console.error('Error loading page content:', error);
        setPageData(null);
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

  if (!pageData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Страница не найдена</h1>
        <p className="text-muted-foreground">К сожалению, запрашиваемая страница не существует.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {pageData.blocks.map(block => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
