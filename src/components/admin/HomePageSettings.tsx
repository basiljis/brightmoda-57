import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const HomePageSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMerinoSection, setShowMerinoSection] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'home')
        .eq('section_name', 'show_merino_section')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setShowMerinoSection(data.content_value === 'true');
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
      const { data: existing } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_name', 'home')
        .eq('section_name', 'show_merino_section')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('page_content')
          .update({
            content_value: showMerinoSection.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('page_content')
          .insert({
            page_name: 'home',
            section_name: 'show_merino_section',
            content_type: 'setting',
            content_value: showMerinoSection.toString(),
            display_order: 0,
            is_active: true
          });

        if (error) throw error;
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
            <Label htmlFor="show-merino">Секция "О мериносовой шерсти"</Label>
            <p className="text-sm text-muted-foreground">
              Показывать информацию о свойствах мериносовой шерсти
            </p>
          </div>
          <Switch
            id="show-merino"
            checked={showMerinoSection}
            onCheckedChange={setShowMerinoSection}
          />
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
