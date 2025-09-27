import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, X, FileText } from 'lucide-react';

interface FileUploadFieldProps {
  field: string;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  bucket?: string;
  folder?: string;
  showRecommendations?: boolean;
  disabled?: boolean;
}

const FileUploadField = ({
  field,
  label,
  description,
  value,
  onChange,
  accept = "image/*",
  bucket = "product-images",
  folder = "uploads",
  showRecommendations = true,
  disabled = false
}: FileUploadFieldProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);

      toast({
        title: "Файл загружен",
        description: "Файл успешно загружен и сохранен",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить файл",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    onChange('');
  };

  const isImage = accept.includes('image');

  return (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>
      
      {value && (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
          {isImage ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          <span className="text-sm flex-1 truncate">{value}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            id={field}
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            disabled={uploading || disabled}
          />
          {uploading && (
            <div className="text-sm text-muted-foreground">Загрузка...</div>
          )}
        </div>
        
        <Input
          placeholder="Или вставьте URL файла"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      
      {showRecommendations && isImage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <div className="font-medium text-blue-900 mb-2">📸 Рекомендации по размерам:</div>
          <ul className="text-blue-800 space-y-1">
            <li>• <strong>Баннеры/Герои:</strong> 1920x1080px, 1920x600px</li>
            <li>• <strong>Каталог товаров:</strong> 800x800px, 1000x1000px</li>
            <li>• <strong>Галереи:</strong> 1200x800px, 1024x768px</li>
            <li>• <strong>Портреты:</strong> 600x800px, 480x640px</li>
            <li>• <strong>Логотипы:</strong> 300x100px, 200x80px</li>
            <li>• <strong>Иконки:</strong> 128x128px, 64x64px</li>
            <li>• <strong>Favicon:</strong> 32x32px, 16x16px</li>
          </ul>
          <div className="mt-2 text-blue-700">
            <strong>Форматы:</strong> JPEG, PNG, WebP, SVG • <strong>Размер:</strong> до 5MB
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadField;