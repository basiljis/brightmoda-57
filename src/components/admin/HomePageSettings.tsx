import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const HomePageSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMerinoSection, setShowMerinoSection] = useState(true);
  const [merinoTitle, setMerinoTitle] = useState('Мериносовая шерсть');
  const [merinoBlocks, setMerinoBlocks] = useState([
    { title: 'Терморегуляция', text: 'Естественная способность регулировать температуру тела в любых условиях.' },
    { title: 'Комфорт', text: 'Тончайшие волокна обеспечивают мягкость и отсутствие раздражения.' },
    { title: 'Антибактериальные свойства', text: 'Натуральная защита от неприятных запахов без химических добавок.' },
    { title: 'Долговечность', text: 'Качество, которое сохраняется годами при правильном уходе.' }
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'home');

      if (error) throw error;
      
      if (data) {
        const visibilitySetting = data.find(item => item.section_name === 'show_merino_section');
        if (visibilitySetting) {
          setShowMerinoSection(visibilitySetting.content_value === 'true');
        }

        const title = data.find(item => item.section_name === 'merino_title');
        if (title) {
          setMerinoTitle(title.content_value);
        }

        const newBlocks = [...merinoBlocks];
        for (let i = 0; i < 4; i++) {
          const blockTitle = data.find(item => item.section_name === `merino_block_${i + 1}_title`);
          const blockText = data.find(item => item.section_name === `merino_block_${i + 1}_text`);
          
          if (blockTitle || blockText) {
            newBlocks[i] = {
              title: blockTitle?.content_value || newBlocks[i].title,
              text: blockText?.content_value || newBlocks[i].text
            };
          }
        }
        setMerinoBlocks(newBlocks);
      }
    } catch (error) {
      console.error('Error loading home page settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare all content items
      const contentItems = [
        {
          section_name: 'show_merino_section',
          content_type: 'setting',
          content_value: showMerinoSection.toString(),
          display_order: 0
        },
        {
          section_name: 'merino_title',
          content_type: 'text',
          content_value: merinoTitle,
          display_order: 1
        }
      ];

      // Add block titles and texts
      merinoBlocks.forEach((block, index) => {
        contentItems.push({
          section_name: `merino_block_${index + 1}_title`,
          content_type: 'text',
          content_value: block.title,
          display_order: (index + 1) * 2
        });
        contentItems.push({
          section_name: `merino_block_${index + 1}_text`,
          content_type: 'text',
          content_value: block.text,
          display_order: (index + 1) * 2 + 1
        });
      });

      // Get existing content
      const { data: existingContent } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'home')
        .in('section_name', contentItems.map(item => item.section_name));

      // Update or insert each item
      for (const item of contentItems) {
        const existing = existingContent?.find(e => e.section_name === item.section_name);
        
        if (existing) {
          const { error } = await supabase
            .from('page_content')
            .update({
              content_value: item.content_value,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('page_content')
            .insert({
              page_name: 'home',
              section_name: item.section_name,
              content_type: item.content_type,
              content_value: item.content_value,
              display_order: item.display_order,
              is_active: true
            });

          if (error) throw error;
        }
      }

      toast({
        title: 'Сохранено',
        description: 'Настройки главной страницы успешно обновлены'
      });
    } catch (error) {
      console.error('Error saving home page settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки главной страницы</CardTitle>
        <CardDescription>
          Управляйте видимостью секций на главной странице
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-merino">Показывать секцию</Label>
            <p className="text-sm text-muted-foreground">
              Отображать секцию "О мериносовой шерсти" на главной странице
            </p>
          </div>
          <Switch
            id="show-merino"
            checked={showMerinoSection}
            onCheckedChange={setShowMerinoSection}
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="merino-title">Заголовок секции</Label>
            <Input
              id="merino-title"
              value={merinoTitle}
              onChange={(e) => setMerinoTitle(e.target.value)}
              placeholder="Мериносовая шерсть"
            />
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold">Блоки информации</h3>
            {merinoBlocks.map((block, index) => (
              <div key={index} className="space-y-3 pb-4 border-b last:border-b-0">
                <div className="space-y-2">
                  <Label htmlFor={`block-${index}-title`}>Блок {index + 1} - Заголовок</Label>
                  <Input
                    id={`block-${index}-title`}
                    value={block.title}
                    onChange={(e) => {
                      const newBlocks = [...merinoBlocks];
                      newBlocks[index] = { ...newBlocks[index], title: e.target.value };
                      setMerinoBlocks(newBlocks);
                    }}
                    placeholder="Заголовок"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`block-${index}-text`}>Блок {index + 1} - Текст</Label>
                  <Textarea
                    id={`block-${index}-text`}
                    value={block.text}
                    onChange={(e) => {
                      const newBlocks = [...merinoBlocks];
                      newBlocks[index] = { ...newBlocks[index], text: e.target.value };
                      setMerinoBlocks(newBlocks);
                    }}
                    placeholder="Описание"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить настройки
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HomePageSettings;
