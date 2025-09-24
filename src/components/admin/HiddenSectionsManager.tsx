import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Package, Upload, BookOpen, Edit, ShoppingCart, Settings, HelpCircle, Send } from 'lucide-react';

interface HiddenSectionsManagerProps {
  hiddenSections: string[];
  onRestoreSection: (sectionName: string) => void;
}

const HiddenSectionsManager = ({ hiddenSections, onRestoreSection }: HiddenSectionsManagerProps) => {
  const sectionInfo = {
    'products': { label: 'Товары', icon: Package },
    'import-export': { label: 'Импорт/Экспорт', icon: Upload },
    'references': { label: 'Справочники', icon: BookOpen },
    'content': { label: 'Контент', icon: Edit },
    'orders': { label: 'Заказы', icon: ShoppingCart },
    'settings': { label: 'Настройки', icon: Settings },
    'instructions': { label: 'Инструкции', icon: HelpCircle },
    'subscriptions': { label: 'Подписки', icon: Send },
  };

  if (hiddenSections.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">Скрытые разделы</CardTitle>
        <CardDescription className="text-orange-700">
          У вас есть {hiddenSections.length} скрытых разделов. Нажмите "Показать", чтобы восстановить их.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {hiddenSections.map((sectionName) => {
            const section = sectionInfo[sectionName as keyof typeof sectionInfo];
            if (!section) return null;
            
            const Icon = section.icon;
            
            return (
              <Button
                key={sectionName}
                variant="outline"
                size="sm"
                onClick={() => onRestoreSection(sectionName)}
                className="border-orange-300 text-orange-800 hover:bg-orange-100"
              >
                <Icon className="h-4 w-4 mr-2" />
                {section.label}
                <Eye className="h-3 w-3 ml-2" />
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HiddenSectionsManager;