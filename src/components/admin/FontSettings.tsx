import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Type, Upload, Eye } from 'lucide-react';

interface FontSettingsProps {
  currentSetting: any;
  setCurrentSetting: (setting: any) => void;
}

// Popular Google Fonts
const googleFonts = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
  'Poppins', 'Nunito Sans', 'PT Sans', 'Raleway', 'Ubuntu', 'Merriweather',
  'Playfair Display', 'Lora', 'Oswald', 'Slabo 27px', 'PT Serif', 'Source Serif Pro',
  'Crimson Text', 'Libre Baskerville', 'Dancing Script', 'Pacifico', 'Caveat',
  'Great Vibes', 'Amatic SC', 'Indie Flower', 'Shadows Into Light'
];

// Font weights
const fontWeights = [
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'Extra Light (200)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' }
];

const FontSettings = ({ currentSetting, setCurrentSetting }: FontSettingsProps) => {
  const [previewFont, setPreviewFont] = useState('');

  // Generate Google Fonts URL
  const generateGoogleFontsUrl = () => {
    const fonts = new Set<string>();
    
    if (currentSetting.font_headings && currentSetting.font_headings !== 'Inter') {
      const weights = currentSetting.font_weights?.headings || ['400', '600'];
      fonts.add(`${currentSetting.font_headings.replace(/\s+/g, '+')}:wght@${weights.join(';')}`);
    }
    
    if (currentSetting.font_body && currentSetting.font_body !== 'Inter' && currentSetting.font_body !== currentSetting.font_headings) {
      const weights = currentSetting.font_weights?.body || ['400'];
      fonts.add(`${currentSetting.font_body.replace(/\s+/g, '+')}:wght@${weights.join(';')}`);
    }
    
    if (currentSetting.font_accent && currentSetting.font_accent !== 'Inter' && 
        currentSetting.font_accent !== currentSetting.font_headings && 
        currentSetting.font_accent !== currentSetting.font_body) {
      const weights = currentSetting.font_weights?.accent || ['400'];
      fonts.add(`${currentSetting.font_accent.replace(/\s+/g, '+')}:wght@${weights.join(';')}`);
    }

    if (fonts.size === 0) return '';
    
    return `https://fonts.googleapis.com/css2?${Array.from(fonts).map(f => `family=${f}`).join('&')}&display=swap`;
  };

  // Preview font loading
  const loadPreviewFont = (fontName: string) => {
    if (fontName === 'Inter') return; // Already loaded
    
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;600&display=swap`;
    link.rel = 'stylesheet';
    link.id = `preview-font-${fontName.replace(/\s+/g, '-')}`;
    
    // Remove existing preview font
    const existing = document.getElementById(`preview-font-${fontName.replace(/\s+/g, '-')}`);
    if (existing) existing.remove();
    
    document.head.appendChild(link);
    setPreviewFont(fontName);
  };

  const handleFontWeightChange = (fontType: 'headings' | 'body' | 'accent', weight: string, checked: boolean) => {
    setCurrentSetting((prev: any) => {
      const newWeights = { ...prev.font_weights };
      if (checked) {
        newWeights[fontType] = [...(newWeights[fontType] || []), weight].sort();
      } else {
        newWeights[fontType] = (newWeights[fontType] || []).filter(w => w !== weight);
      }
      return { ...prev, font_weights: newWeights };
    });
  };

  // Apply fonts to document
  useEffect(() => {
    const url = generateGoogleFontsUrl();
    if (url) {
      const existingLink = document.getElementById('seo-google-fonts');
      if (existingLink) existingLink.remove();
      
      const link = document.createElement('link');
      link.id = 'seo-google-fonts';
      link.href = url;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [currentSetting.font_headings, currentSetting.font_body, currentSetting.font_accent, currentSetting.font_weights]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Настройки шрифтов
          </CardTitle>
          <CardDescription>
            Выберите шрифты из Google Fonts или загрузите собственные
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Headings Font */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="font_headings">Шрифт заголовков</Label>
              <Select
                value={currentSetting.font_headings}
                onValueChange={(value) => {
                  setCurrentSetting(prev => ({...prev, font_headings: value}));
                  loadPreviewFont(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите шрифт" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {googleFonts.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Font weights for headings */}
            <div>
              <Label>Начертания для заголовков</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {fontWeights.map((weight) => (
                  <div key={weight.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`heading-${weight.value}`}
                      checked={(currentSetting.font_weights?.headings || []).includes(weight.value)}
                      onCheckedChange={(checked) => 
                        handleFontWeightChange('headings', weight.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`heading-${weight.value}`} className="text-sm">
                      {weight.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body Font */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="font_body">Шрифт основного текста</Label>
              <Select
                value={currentSetting.font_body}
                onValueChange={(value) => {
                  setCurrentSetting(prev => ({...prev, font_body: value}));
                  loadPreviewFont(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите шрифт" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {googleFonts.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Font weights for body */}
            <div>
              <Label>Начертания для основного текста</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {fontWeights.map((weight) => (
                  <div key={weight.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`body-${weight.value}`}
                      checked={(currentSetting.font_weights?.body || []).includes(weight.value)}
                      onCheckedChange={(checked) => 
                        handleFontWeightChange('body', weight.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`body-${weight.value}`} className="text-sm">
                      {weight.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accent Font */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="font_accent">Акцентный шрифт</Label>
              <Select
                value={currentSetting.font_accent}
                onValueChange={(value) => {
                  setCurrentSetting(prev => ({...prev, font_accent: value}));
                  loadPreviewFont(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите шрифт" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {googleFonts.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Font weights for accent */}
            <div>
              <Label>Начертания для акцентного шрифта</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {fontWeights.map((weight) => (
                  <div key={weight.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`accent-${weight.value}`}
                      checked={(currentSetting.font_weights?.accent || []).includes(weight.value)}
                      onCheckedChange={(checked) => 
                        handleFontWeightChange('accent', weight.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`accent-${weight.value}`} className="text-sm">
                      {weight.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div>
            <Label htmlFor="custom_fonts_css">Пользовательский CSS для шрифтов</Label>
            <Textarea
              id="custom_fonts_css"
              value={currentSetting.custom_fonts_css || ''}
              onChange={(e) => 
                setCurrentSetting(prev => ({...prev, custom_fonts_css: e.target.value}))
              }
              placeholder="@font-face { font-family: 'CustomFont'; src: url('font.woff2'); }"
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Добавьте @font-face правила или импорты пользовательских шрифтов
            </p>
          </div>

          {/* Generated Google Fonts URL */}
          {generateGoogleFontsUrl() && (
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Сгенерированная ссылка Google Fonts:</Label>
              <Input
                value={generateGoogleFontsUrl()}
                readOnly
                className="mt-2 text-xs bg-background"
              />
            </div>
          )}

          {/* Font Preview */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Предварительный просмотр
            </h4>
            
            <div className="space-y-3">
              <div 
                style={{ fontFamily: currentSetting.font_headings }}
                className="text-2xl font-semibold"
              >
                Заголовок H1 ({currentSetting.font_headings})
              </div>
              
              <div 
                style={{ fontFamily: currentSetting.font_headings }}
                className="text-xl font-medium"
              >
                Заголовок H2 ({currentSetting.font_headings})
              </div>
              
              <div 
                style={{ fontFamily: currentSetting.font_body }}
                className="text-base"
              >
                Основной текст. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ({currentSetting.font_body})
              </div>
              
              <div 
                style={{ fontFamily: currentSetting.font_accent }}
                className="text-lg font-medium"
              >
                Акцентный текст для кнопок и выделений ({currentSetting.font_accent})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FontSettings;