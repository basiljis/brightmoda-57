import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Type, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FontSettings {
  font_headings: string;
  font_body: string;
  font_accent: string;
  font_weights: {
    headings: string[];
    body: string[];
    accent: string[];
  };
  custom_fonts_css: string;
}

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
  'Oswald', 'Raleway', 'Poppins', 'Merriweather', 'Playfair Display',
  'Lora', 'Ubuntu', 'Nunito', 'PT Sans', 'Fira Sans', 'Work Sans',
  'Crimson Text', 'Libre Baskerville', 'Cormorant Garamond'
];

const FONT_WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

const FontSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<FontSettings>({
    font_headings: 'Inter',
    font_body: 'Inter',
    font_accent: 'Inter',
    font_weights: {
      headings: ['400', '600'],
      body: ['400'],
      accent: ['400']
    },
    custom_fonts_css: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewText, setPreviewText] = useState({
    heading: 'Заголовок страницы',
    body: 'Это пример основного текста. Здесь показано, как будет выглядеть обычный текст на вашем сайте.',
    accent: 'Акцентный текст'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('font_headings, font_body, font_accent, font_weights, custom_fonts_css')
        .eq('page_name', 'home')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        const fontWeights = typeof data.font_weights === 'object' && data.font_weights 
          ? data.font_weights as { headings: string[]; body: string[]; accent: string[]; }
          : { headings: ['400', '600'], body: ['400'], accent: ['400'] };
          
        setSettings({
          font_headings: data.font_headings || 'Inter',
          font_body: data.font_body || 'Inter',
          font_accent: data.font_accent || 'Inter',
          font_weights: fontWeights,
          custom_fonts_css: data.custom_fonts_css || ''
        });
      }
    } catch (error) {
      console.error('Error loading font settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('seo_settings')
        .upsert({
          page_name: 'home',
          font_headings: settings.font_headings,
          font_body: settings.font_body,
          font_accent: settings.font_accent,
          font_weights: settings.font_weights,
          custom_fonts_css: settings.custom_fonts_css,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Настройки шрифтов сохранены",
        description: "Изменения применятся после перезагрузки страницы",
      });

      // Update document fonts immediately for preview
      updateDocumentFonts();
    } catch (error) {
      console.error('Error saving font settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки шрифтов",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentFonts = () => {
    // Remove existing Google Fonts links
    const existingLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    existingLinks.forEach(link => link.remove());

    // Add new Google Fonts links
    const uniqueFonts = [...new Set([settings.font_headings, settings.font_body, settings.font_accent])];
    const googleFonts = uniqueFonts.filter(font => GOOGLE_FONTS.includes(font));
    
    if (googleFonts.length > 0) {
      const fontWeights = {
        [settings.font_headings]: settings.font_weights.headings,
        [settings.font_body]: settings.font_weights.body,
        [settings.font_accent]: settings.font_weights.accent
      };

      googleFonts.forEach(font => {
        const weights = fontWeights[font] || ['400'];
        const fontFamily = font.replace(/ /g, '+');
        const weightsStr = weights.join(',');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${weightsStr}&display=swap`;
        document.head.appendChild(link);
      });
    }

    // Add custom CSS
    let customStyle = document.getElementById('custom-fonts-style');
    if (!customStyle) {
      customStyle = document.createElement('style');
      customStyle.id = 'custom-fonts-style';
      document.head.appendChild(customStyle);
    }
    customStyle.textContent = settings.custom_fonts_css;
  };

  const handleFontWeightToggle = (fontType: 'headings' | 'body' | 'accent', weight: string) => {
    setSettings(prev => {
      const weights = prev.font_weights[fontType];
      const newWeights = weights.includes(weight)
        ? weights.filter(w => w !== weight)
        : [...weights, weight].sort();
      
      return {
        ...prev,
        font_weights: {
          ...prev.font_weights,
          [fontType]: newWeights.length > 0 ? newWeights : ['400']
        }
      };
    });
  };

  const generatePreviewStyle = (fontType: 'headings' | 'body' | 'accent') => {
    const fontFamily = settings[`font_${fontType}` as keyof FontSettings] as string;
    const weight = settings.font_weights[fontType][0] || '400';
    return {
      fontFamily: `"${fontFamily}", sans-serif`,
      fontWeight: weight
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Настройки шрифтов
          </CardTitle>
          <CardDescription>
            Выберите шрифты для разных элементов сайта и настройте их начертания
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings Column */}
            <div className="space-y-6">
              {/* Headings Font */}
              <div className="space-y-3">
                <Label>Шрифт для заголовков</Label>
                <Select 
                  value={settings.font_headings} 
                  onValueChange={(value) => setSettings(prev => ({...prev, font_headings: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map(font => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div>
                  <Label className="text-sm">Начертания для заголовков</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {FONT_WEIGHTS.map(weight => (
                      <label key={weight} className="flex items-center space-x-1 text-sm">
                        <Checkbox
                          checked={settings.font_weights.headings.includes(weight)}
                          onCheckedChange={() => handleFontWeightToggle('headings', weight)}
                        />
                        <span>{weight}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Body Font */}
              <div className="space-y-3">
                <Label>Шрифт для основного текста</Label>
                <Select 
                  value={settings.font_body} 
                  onValueChange={(value) => setSettings(prev => ({...prev, font_body: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map(font => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div>
                  <Label className="text-sm">Начертания для основного текста</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {FONT_WEIGHTS.map(weight => (
                      <label key={weight} className="flex items-center space-x-1 text-sm">
                        <Checkbox
                          checked={settings.font_weights.body.includes(weight)}
                          onCheckedChange={() => handleFontWeightToggle('body', weight)}
                        />
                        <span>{weight}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Accent Font */}
              <div className="space-y-3">
                <Label>Акцентный шрифт</Label>
                <Select 
                  value={settings.font_accent} 
                  onValueChange={(value) => setSettings(prev => ({...prev, font_accent: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map(font => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div>
                  <Label className="text-sm">Начертания для акцентного шрифта</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {FONT_WEIGHTS.map(weight => (
                      <label key={weight} className="flex items-center space-x-1 text-sm">
                        <Checkbox
                          checked={settings.font_weights.accent.includes(weight)}
                          onCheckedChange={() => handleFontWeightToggle('accent', weight)}
                        />
                        <span>{weight}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom CSS */}
              <div className="space-y-3">
                <Label>Пользовательский CSS для шрифтов</Label>
                <Textarea
                  value={settings.custom_fonts_css}
                  onChange={(e) => setSettings(prev => ({...prev, custom_fonts_css: e.target.value}))}
                  placeholder="@import url('https://fonts.googleapis.com/css2?family=CustomFont:wght@400;700&display=swap');

.custom-font {
  font-family: 'CustomFont', sans-serif;
}"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Здесь можно добавить кастомные шрифты через @import или загрузить локальные шрифты
                </p>
              </div>
            </div>

            {/* Preview Column */}
            <div className="space-y-4">
              <Label>Предварительный просмотр</Label>
              <div className="space-y-4 p-4 border rounded-lg bg-background">
                <div>
                  <Input
                    value={previewText.heading}
                    onChange={(e) => setPreviewText(prev => ({...prev, heading: e.target.value}))}
                    className="mb-2 text-sm"
                    placeholder="Текст заголовка"
                  />
                  <h2 
                    className="text-2xl font-bold"
                    style={generatePreviewStyle('headings')}
                  >
                    {previewText.heading}
                  </h2>
                </div>

                <div>
                  <Textarea
                    value={previewText.body}
                    onChange={(e) => setPreviewText(prev => ({...prev, body: e.target.value}))}
                    className="mb-2 text-sm"
                    placeholder="Основной текст"
                    rows={2}
                  />
                  <p 
                    className="text-base"
                    style={generatePreviewStyle('body')}
                  >
                    {previewText.body}
                  </p>
                </div>

                <div>
                  <Input
                    value={previewText.accent}
                    onChange={(e) => setPreviewText(prev => ({...prev, accent: e.target.value}))}
                    className="mb-2 text-sm"
                    placeholder="Акцентный текст"
                  />
                  <p 
                    className="text-lg font-medium"
                    style={generatePreviewStyle('accent')}
                  >
                    {previewText.accent}
                  </p>
                </div>
              </div>

              <Alert>
                <Type className="h-4 w-4" />
                <AlertDescription>
                  Изменения шрифтов применятся после сохранения и перезагрузки страницы.
                  Google Fonts загружаются автоматически.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? 'Сохранение...' : 'Сохранить настройки шрифтов'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FontSettings;