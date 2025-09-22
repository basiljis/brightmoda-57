import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Plus, MoveUp, MoveDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

interface Color {
  id: string;
  name: string;
  hex_code: string;
}

interface Size {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  category_id?: string;
  subcategory_id?: string;
  weight?: number;
  dimensions?: any;
  stock_quantity: number;
  is_featured: boolean;
  is_new: boolean;
  is_preorder: boolean;
  images?: string[];
  video_urls?: string[];
  product_colors?: any[];
  product_sizes?: any[];
  size_fit_info?: string;
  composition_care_info?: string;
  responsibility_info?: string;
  delivery_return_info?: string;
}

interface ProductEditProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

export default function ProductEdit({ product, isOpen, onClose, onProductUpdated }: ProductEditProps) {
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    category_id: '',
    subcategory_id: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    stock_quantity: '',
    is_featured: false,
    is_new: false,
    is_preorder: false,
    video_urls: [''],
    size_fit_info: '',
    composition_care_info: '',
    responsibility_info: '',
    delivery_return_info: ''
  });

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReferences();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setProductForm({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category_id: product.category_id || '',
        subcategory_id: product.subcategory_id || '',
        weight: product.weight?.toString() || '',
        dimensions: {
          length: product.dimensions?.length?.toString() || '',
          width: product.dimensions?.width?.toString() || '',
          height: product.dimensions?.height?.toString() || ''
        },
        stock_quantity: product.stock_quantity?.toString() || '0',
        is_featured: product.is_featured || false,
        is_new: product.is_new || false,
        is_preorder: product.is_preorder || false,
        video_urls: product.video_urls?.length ? product.video_urls : [''],
        size_fit_info: product.size_fit_info || '',
        composition_care_info: product.composition_care_info || '',
        responsibility_info: product.responsibility_info || '',
        delivery_return_info: product.delivery_return_info || ''
      });

      setExistingImages(product.images || []);
      setSelectedColors(product.product_colors?.map(pc => pc.color_id) || []);
      setSelectedSizes(product.product_sizes?.map(ps => ps.size_id) || []);
    }
  }, [product]);

  useEffect(() => {
    if (productForm.category_id) {
      const filtered = subcategories.filter(sub => sub.category_id === productForm.category_id);
      setFilteredSubcategories(filtered);
      if (productForm.subcategory_id && !filtered.find(sub => sub.id === productForm.subcategory_id)) {
        setProductForm(prev => ({ ...prev, subcategory_id: '' }));
      }
    } else {
      setFilteredSubcategories([]);
    }
  }, [productForm.category_id, subcategories]);

  const loadReferences = async () => {
    try {
      const [categoriesRes, subcategoriesRes, colorsRes, sizesRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('subcategories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('colors').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('sizes').select('*').eq('is_active', true).order('sort_order')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (subcategoriesRes.data) setSubcategories(subcategoriesRes.data);
      if (colorsRes.data) setColors(colorsRes.data);
      if (sizesRes.data) setSizes(sizesRes.data);
    } catch (error) {
      console.error('Error loading references:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (dragIndex: number, hoverIndex: number) => {
    setExistingImages(prev => {
      const newImages = [...prev];
      const draggedImage = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      return newImages;
    });
  };

  const addVideoUrl = () => {
    setProductForm(prev => ({
      ...prev,
      video_urls: [...prev.video_urls, '']
    }));
  };

  const updateVideoUrl = (index: number, url: string) => {
    setProductForm(prev => ({
      ...prev,
      video_urls: prev.video_urls.map((item, i) => i === index ? url : item)
    }));
  };

  const removeVideoUrl = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      video_urls: prev.video_urls.filter((_, i) => i !== index)
    }));
  };

  const uploadImages = async (): Promise<string[]> => {
    const imageUrls: string[] = [];
    
    for (const file of uploadedImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      imageUrls.push(urlData.publicUrl);
    }

    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setUploading(true);
    
    try {
      let imageUrls: string[] = [...existingImages];
      if (uploadedImages.length > 0) {
        const newImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const videoUrls = productForm.video_urls.filter(url => url.trim() !== '');

      const { error: productError } = await supabase
        .from('products')
        .update({
          name: productForm.name,
          sku: productForm.sku || null,
          description: productForm.description,
          price: parseFloat(productForm.price),
          category_id: productForm.category_id || null,
          subcategory_id: productForm.subcategory_id || null,
          weight: productForm.weight ? parseInt(productForm.weight) : null,
          dimensions: {
            length: productForm.dimensions.length ? parseInt(productForm.dimensions.length) : null,
            width: productForm.dimensions.width ? parseInt(productForm.dimensions.width) : null,
            height: productForm.dimensions.height ? parseInt(productForm.dimensions.height) : null
          },
          stock_quantity: productForm.stock_quantity ? parseInt(productForm.stock_quantity) : 0,
          is_featured: productForm.is_featured,
          is_new: productForm.is_new,
          is_preorder: productForm.is_preorder,
          images: imageUrls,
          video_urls: videoUrls,
          size_fit_info: productForm.size_fit_info || null,
          composition_care_info: productForm.composition_care_info || null,
          responsibility_info: productForm.responsibility_info || null,
          delivery_return_info: productForm.delivery_return_info || null
        })
        .eq('id', product.id);

      if (productError) throw productError;

      // Update colors
      await supabase.from('product_colors').delete().eq('product_id', product.id);
      if (selectedColors.length > 0) {
        const colorInserts = selectedColors.map(colorId => ({
          product_id: product.id,
          color_id: colorId
        }));
        const { error: colorsError } = await supabase
          .from('product_colors')
          .insert(colorInserts);
        if (colorsError) throw colorsError;
      }

      // Update sizes
      await supabase.from('product_sizes').delete().eq('product_id', product.id);
      if (selectedSizes.length > 0) {
        const sizeInserts = selectedSizes.map(sizeId => ({
          product_id: product.id,
          size_id: sizeId
        }));
        const { error: sizesError } = await supabase
          .from('product_sizes')
          .insert(sizeInserts);
        if (sizesError) throw sizesError;
      }

      toast({
        title: "Товар обновлен",
        description: "Товар успешно обновлен",
      });

      onProductUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить товар",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать товар</DialogTitle>
          <DialogDescription>Внесите изменения в товар</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название товара</Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sku">Артикул</Label>
              <Input
                id="sku"
                value={productForm.sku}
                onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                placeholder="Уникальный код товара"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={productForm.description}
              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Цена (руб.)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={productForm.price}
              onChange={(e) => setProductForm({...productForm, price: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select value={productForm.category_id} onValueChange={(value) => setProductForm({...productForm, category_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Подкатегория</Label>
              <Select 
                value={productForm.subcategory_id}
                onValueChange={(value) => setProductForm({...productForm, subcategory_id: value})}
                disabled={!productForm.category_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите подкатегорию" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Цвета</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {colors.map((color) => (
                <div key={color.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color.id}`}
                    checked={selectedColors.includes(color.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedColors(prev => [...prev, color.id]);
                      } else {
                        setSelectedColors(prev => prev.filter(id => id !== color.id));
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <Label htmlFor={`color-${color.id}`} className="text-sm">
                      {color.name}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Размеры</Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {sizes.map((size) => (
                <div key={size.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size.id}`}
                    checked={selectedSizes.includes(size.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSizes(prev => [...prev, size.id]);
                      } else {
                        setSelectedSizes(prev => prev.filter(id => id !== size.id));
                      }
                    }}
                  />
                  <Label htmlFor={`size-${size.id}`} className="text-sm">
                    {size.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label>Текущие изображения (перетащите для изменения порядка)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group bg-gray-50 p-2 rounded border">
                    <div className="flex items-center gap-3">
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Изображение {index + 1}</p>
                        <p className="text-xs text-gray-500">Основное фото для карточки товара</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            className="p-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-600"
                            title="Переместить вверх"
                          >
                            <MoveUp className="h-3 w-3" />
                          </button>
                        )}
                        {index < existingImages.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            className="p-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-600"
                            title="Переместить вниз"
                          >
                            <MoveDown className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="p-1 bg-red-100 hover:bg-red-200 rounded text-red-600"
                          title="Удалить изображение"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Первое изображение будет использоваться как основное фото товара в каталоге
              </p>
            </div>
          )}

          {/* New Images */}
          <div className="space-y-2">
            <Label htmlFor="images">Добавить изображения</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Загрузите новые изображения
                    </span>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Количество на складе</Label>
            <Input
              id="stock"
              type="number"
              value={productForm.stock_quantity}
              onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
            />
          </div>

          {/* Additional Product Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Дополнительная информация о товаре</h3>
            
            <div className="space-y-2">
              <Label htmlFor="size_fit_info">Размер и посадка</Label>
              <Textarea
                id="size_fit_info"
                value={productForm.size_fit_info}
                onChange={(e) => setProductForm({...productForm, size_fit_info: e.target.value})}
                placeholder="Информация о размере и посадке товара"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="composition_care_info">Состав и уход</Label>
              <Textarea
                id="composition_care_info"
                value={productForm.composition_care_info}
                onChange={(e) => setProductForm({...productForm, composition_care_info: e.target.value})}
                placeholder="Информация о составе материалов и уходе за товаром"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibility_info">Ответственность</Label>
              <Textarea
                id="responsibility_info"
                value={productForm.responsibility_info}
                onChange={(e) => setProductForm({...productForm, responsibility_info: e.target.value})}
                placeholder="Информация об экологичности и ответственном производстве"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_return_info">Доставка и возврат</Label>
              <Textarea
                id="delivery_return_info"
                value={productForm.delivery_return_info}
                onChange={(e) => setProductForm({...productForm, delivery_return_info: e.target.value})}
                placeholder="Информация о доставке и условиях возврата"
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={productForm.is_featured}
                onCheckedChange={(checked) => setProductForm({...productForm, is_featured: checked})}
              />
              <Label htmlFor="featured">Рекомендуемый товар</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="new"
                checked={productForm.is_new}
                onCheckedChange={(checked) => setProductForm({...productForm, is_new: checked})}
              />
              <Label htmlFor="new">Новинка</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="preorder"
                checked={productForm.is_preorder}
                onCheckedChange={(checked) => setProductForm({...productForm, is_preorder: checked})}
              />
              <Label htmlFor="preorder">Предзаказ</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={uploading} className="flex-1">
              {uploading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
