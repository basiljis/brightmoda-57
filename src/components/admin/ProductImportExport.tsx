import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileText, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

const ProductImportExport = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        name: 'Кардиган базовый',
        description: 'Стильный кардиган из натуральной мериносовой шерсти премиум класса. Идеально подходит для прохладной погоды.',
        price: 5990,
        category: 'cardigans',
        subcategory: 'basic',
        collection: 'winter-collection',
        colors: 'beige|cream|grey',
        sizes: 'S|M|L|XL',
        images: 'https://example.com/cardigan-front.jpg|https://example.com/cardigan-back.jpg|https://example.com/cardigan-details.jpg',
        sku: 'CARD-001',
        weight: 350,
        stock_quantity: 15,
        is_featured: true,
        is_new: false,
        is_preorder: false,
        video_urls: 'https://example.com/cardigan-video.mp4',
        size_fit_info: 'Свободная посадка. Для облегающей посадки рекомендуем выбрать размер меньше.',
        composition_care_info: '100% мериносовая шерсть. Ручная стирка в прохладной воде до 30°C. Сушить горизонтально.',
        responsibility_info: 'Произведено из экологически чистой шерсти. Упаковка из переработанных материалов.',
        delivery_return_info: 'Доставка 1-3 рабочих дня. Возврат в течение 14 дней в первоначальном состоянии.'
      },
      {
        name: 'Свитер оверсайз',
        description: 'Уютный свитер свободного кроя из мягкого кашемира. Создан для максимального комфорта.',
        price: 7500,
        category: 'sweaters',
        subcategory: 'oversized',
        collection: 'autumn-collection',
        colors: 'grey|black|navy',
        sizes: 'XS|S|M|L',
        images: 'https://example.com/sweater-main.jpg|https://example.com/sweater-side.jpg',
        sku: 'SWTR-002',
        weight: 400,
        stock_quantity: 8,
        is_featured: false,
        is_new: true,
        is_preorder: false,
        video_urls: '',
        size_fit_info: 'Свободный крой. Подходит для создания многослойных образов.',
        composition_care_info: '80% кашемир, 20% шелк. Деликатная стирка или химчистка.',
        responsibility_info: 'Кашемир получен от коз, выращенных в экологически чистых районах Монголии.',
        delivery_return_info: 'Бесплатная доставка при заказе от 10 000 руб. Обмен возможен в течение 30 дней.'
      },
      {
        name: 'Платье миди',
        description: 'Элегантное платье А-силуэта из натурального льна. Универсальная модель для офиса и прогулок.',
        price: 4200,
        category: 'dresses',
        subcategory: 'midi',
        collection: 'spring-collection', 
        colors: 'white|beige|olive',
        sizes: 'XS|S|M|L|XL',
        images: 'https://example.com/dress-front.jpg',
        sku: 'DRSS-003',
        weight: 280,
        stock_quantity: 0,
        is_featured: false,
        is_new: false,
        is_preorder: true,
        video_urls: '',
        size_fit_info: 'Классическая посадка по фигуре. Длина миди - до середины икры.',
        composition_care_info: '100% лен. Машинная стирка при 40°C. Гладить во влажном состоянии.',
        responsibility_info: 'Лен выращен без использования пестицидов. Натуральные красители.',
        delivery_return_info: 'Предзаказ: доставка через 2-3 недели. Полная предоплата.'
      }
    ];

    const csv = Papa.unparse(templateData, {
      header: true,
      delimiter: ';' // Используем точку с запятой для лучшей совместимости с Excel
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_template_with_instructions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Шаблон скачан",
      description: "Подробный шаблон для импорта товаров с примерами заполнения успешно скачан"
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel'];
      const validExtensions = ['.csv'];
      const isValidType = validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidType) {
        toast({
          title: "Неправильный формат файла",
          description: "Пожалуйста, выберите CSV файл",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Файл не выбран",
        description: "Пожалуйста, выберите CSV файл для импорта",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await selectedFile.text();
      
      const parseResult = Papa.parse<Record<string, any>>(text, {
        header: true,
        skipEmptyLines: true
      });

      if (parseResult.errors && parseResult.errors.length > 0) {
        console.warn('CSV parsing warnings:', parseResult.errors);
      }

      const products = parseResult.data || [];
      
      if (products.length === 0) {
        throw new Error('Файл не содержит данных для импорта');
      }

      let imported = 0;
      let errors = 0;
      const errorMessages: string[] = [];

      for (let i = 0; i < products.length; i++) {
        try {
          const product = products[i];
          
          // Обработка специальных полей
          const processedProduct = {
            name: product.name?.trim(),
            description: product.description?.trim(),
            price: parseFloat(product.price) || 0,
            colors: product.colors ? product.colors.split('|').map((c: string) => c.trim()).filter(Boolean) : [],
            sizes: product.sizes ? product.sizes.split('|').map((s: string) => s.trim()).filter(Boolean) : [],
            images: product.images ? product.images.split('|').map((i: string) => i.trim()).filter(Boolean) : [],
            sku: product.sku?.trim() || null,
            weight: parseInt(product.weight) || null,
            stock_quantity: parseInt(product.stock_quantity) || 0,
            is_featured: String(product.is_featured).toLowerCase() === 'true',
            is_new: String(product.is_new).toLowerCase() === 'true',
            is_preorder: String(product.is_preorder).toLowerCase() === 'true'
          };

          // Валидация обязательных полей
          if (!processedProduct.name || processedProduct.price <= 0) {
            throw new Error('Название и цена товара обязательны');
          }
          
          // Получаем ID категории, подкategории и коллекции по названиям
          let categoryId = null, subcategoryId = null, collectionId = null;
          
          if (product.category?.trim()) {
            const { data: categoryData } = await supabase
              .from('categories')
              .select('id')
              .eq('slug', product.category.trim())
              .single();
            categoryId = categoryData?.id;
          }
          
          if (product.subcategory?.trim()) {
            const { data: subcategoryData } = await supabase
              .from('subcategories')
              .select('id')
              .eq('slug', product.subcategory.trim())
              .single();
            subcategoryId = subcategoryData?.id;
          }
          
          if (product.collection?.trim()) {
            const { data: collectionData } = await supabase
              .from('collections')
              .select('id')
              .eq('slug', product.collection.trim())
              .single();
            collectionId = collectionData?.id;
          }

          const { error } = await supabase
            .from('products')
            .insert([{
              ...processedProduct,
              category_id: categoryId,
              subcategory_id: subcategoryId,
              collection_id: collectionId
            }]);

          if (error) throw error;
          imported++;
        } catch (error) {
          errors++;
          errorMessages.push(`Строка ${i + 2}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }

        setImportProgress(((i + 1) / products.length) * 100);
      }

      setImportResults({
        total: products.length,
        imported,
        errors,
        errorMessages: errorMessages.slice(0, 10) // Показываем только первые 10 ошибок
      });

      toast({
        title: "Импорт завершен",
        description: `Импортировано: ${imported}, ошибок: ${errors}`
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Ошибка импорта",
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          subcategory:subcategories(name, slug),
          collection:collections(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const exportData = products.map(product => ({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        category: product.category?.slug || '',
        subcategory: product.subcategory?.slug || '',
        collection: product.collection?.slug || '',
        colors: Array.isArray(product.colors) ? product.colors.join('|') : '',
        sizes: Array.isArray(product.sizes) ? product.sizes.join('|') : '',
        images: Array.isArray(product.images) ? product.images.join('|') : '',
        sku: product.sku || '',
        weight: product.weight || 0,
        stock_quantity: product.stock_quantity || 0,
        is_featured: product.is_featured || false,
        is_new: product.is_new || false,
        is_preorder: product.is_preorder || false,
        created_at: product.created_at || ''
      }));

      const csv = Papa.unparse(exportData, {
        header: true
      });

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Экспорт завершен",
        description: `Экспортировано ${products.length} товаров`
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Ошибка экспорта",
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: "destructive"
      });
    }
  };

  const downloadReference = async (referenceType: string) => {
    try {
      let data, filename;
      
      switch (referenceType) {
        case 'categories':
          const { data: categories } = await supabase
            .from('categories')
            .select('name, slug, description, is_active, sort_order')
            .order('sort_order');
          data = categories;
          filename = 'categories_reference.csv';
          break;
          
        case 'subcategories':
          const { data: subcategories } = await supabase
            .from('subcategories')
            .select('name, slug, description, is_active, sort_order, category:categories(name, slug)')
            .order('sort_order');
          data = subcategories?.map(sub => ({
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            is_active: sub.is_active,
            sort_order: sub.sort_order,
            category_name: sub.category?.name || '',
            category_slug: sub.category?.slug || ''
          }));
          filename = 'subcategories_reference.csv';
          break;
          
        case 'collections':
          const { data: collections } = await supabase
            .from('collections')
            .select('name, slug, description, is_active, sort_order, show_on_homepage')
            .order('sort_order');
          data = collections;
          filename = 'collections_reference.csv';
          break;
          
        case 'colors':
          const { data: colors } = await supabase
            .from('colors')
            .select('name, hex_code, is_active, sort_order')
            .order('sort_order');
          data = colors;
          filename = 'colors_reference.csv';
          break;
          
        case 'sizes':
          const { data: sizes } = await supabase
            .from('sizes')
            .select('name, is_active, sort_order')
            .order('sort_order');
          data = sizes;
          filename = 'sizes_reference.csv';
          break;
          
        default:
          throw new Error('Неизвестный тип справочника');
      }

      if (!data || data.length === 0) {
        toast({
          title: "Нет данных",
          description: "Справочник пуст",
          variant: "destructive"
        });
        return;
      }

      const csv = Papa.unparse(data, { header: true });
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Справочник скачан",
        description: `Справочник "${referenceType}" успешно скачан`
      });

    } catch (error) {
      console.error('Reference download error:', error);
      toast({
        title: "Ошибка скачивания",
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Экспорт товаров
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Скачайте все товары из базы данных в формате CSV
          </p>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? 'Экспортируем...' : 'Скачать все товары'}
          </Button>
        </CardContent>
      </Card>

      {/* Reference Downloads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Скачать справочники
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Скачайте справочники для удобства заполнения файлов с товарами
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button 
              onClick={() => downloadReference('categories')} 
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Категории
            </Button>
            <Button 
              onClick={() => downloadReference('subcategories')} 
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Подкатегории
            </Button>
            <Button 
              onClick={() => downloadReference('collections')} 
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Коллекции
            </Button>
            <Button 
              onClick={() => downloadReference('colors')} 
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Цвета
            </Button>
            <Button 
              onClick={() => downloadReference('sizes')} 
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Размеры
            </Button>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Справочники помогут вам правильно заполнить поля category, subcategory, collection, colors и sizes в CSV файле с товарами.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Шаблон для импорта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Скачайте шаблон CSV файла с примерами заполнения
          </p>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Правила заполнения CSV файла:</strong>
              <ul className="mt-3 list-disc list-inside space-y-2 text-sm">
                <li><strong>name</strong> - Название товара (обязательно)</li>
                <li><strong>description</strong> - Описание товара</li>
                <li><strong>price</strong> - Цена в рублях (обязательно, только цифры)</li>
                <li><strong>category</strong> - Slug категории (например: cardigans, sweaters, dresses)</li>
                <li><strong>subcategory</strong> - Slug подкатегории (например: basic, oversized)</li>
                <li><strong>collection</strong> - Slug коллекции (например: winter-collection)</li>
                <li><strong>colors</strong> - Цвета через "|" (например: beige|cream|grey)</li>
                <li><strong>sizes</strong> - Размеры через "|" (например: S|M|L|XL)</li>
                <li><strong>images</strong> - URL изображений через "|"</li>
                <li><strong>sku</strong> - Артикул (уникальный код товара)</li>
                <li><strong>weight</strong> - Вес в граммах (только цифры)</li>
                <li><strong>stock_quantity</strong> - Количество на складе (только цифры)</li>
                <li><strong>is_featured, is_new, is_preorder</strong> - только true или false</li>
                <li><strong>video_urls</strong> - URL видео (необязательно)</li>
                <li><strong>size_fit_info</strong> - Информация о размере и посадке</li>
                <li><strong>composition_care_info</strong> - Состав и уход за товаром</li>
                <li><strong>responsibility_info</strong> - Экологичность и ответственное производство</li>
                <li><strong>delivery_return_info</strong> - Условия доставки и возврата</li>
              </ul>
              <div className="mt-3 p-3 bg-amber-50 rounded border-l-4 border-amber-400">
                <p className="text-sm font-medium text-amber-800">💡 Рекомендации:</p>
                <p className="text-sm text-amber-700 mt-1">
                  1. Сначала скачайте справочники, чтобы узнать правильные slug для категорий, коллекций, цветов и размеров<br/>
                  2. Используйте Excel или Google Sheets для редактирования<br/>
                  3. Сохраняйте файл в формате CSV с разделителем ";" (точка с запятой)<br/>
                  4. Проверьте кодировку UTF-8 для корректного отображения русских символов
                </p>
              </div>
            </AlertDescription>
          </Alert>
          <Button 
            onClick={downloadTemplate} 
            variant="outline"
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Скачать шаблон
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Импорт товаров
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvFile">CSV файл с товарами</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
            />
          </div>

          {selectedFile && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Выбран файл: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </AlertDescription>
            </Alert>
          )}

          {isImporting && (
            <div className="space-y-2">
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Импортируем товары... {Math.round(importProgress)}%
              </p>
            </div>
          )}

          <Button 
            onClick={handleImport} 
            disabled={!selectedFile || isImporting}
            className="w-full"
          >
            {isImporting ? 'Импортируем...' : 'Импортировать товары'}
          </Button>

          {importResults && (
            <Alert className={importResults.errors > 0 ? "border-yellow-500" : "border-green-500"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Результаты импорта:</strong></p>
                  <ul className="space-y-1">
                    <li>Всего строк: {importResults.total}</li>
                    <li>Импортировано: {importResults.imported}</li>
                    <li>Ошибок: {importResults.errors}</li>
                  </ul>
                  {importResults.errorMessages.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium">Ошибки:</p>
                      <ul className="text-sm space-y-1 mt-1">
                        {importResults.errorMessages.map((error: string, index: number) => (
                          <li key={index} className="text-red-600">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductImportExport;