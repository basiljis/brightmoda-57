import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Plus } from 'lucide-react';

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
  category_id: string;
}

interface ProductFormProps {
  onProductAdded: () => void;
}

export default function ProductForm({ onProductAdded }: ProductFormProps) {
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
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
    video_urls: ['']
  });

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Recommendation settings
  const [recommendationType, setRecommendationType] = useState<'none' | 'products' | 'category'>('none');
  const [selectedRecommendationProducts, setSelectedRecommendationProducts] = useState<string[]>([]);
  const [selectedRecommendationCategory, setSelectedRecommendationCategory] = useState<string>('');

  useEffect(() => {
    loadReferences();
  }, []);

  useEffect(() => {
    // Filter subcategories based on selected category
    if (productForm.category_id) {
      const filtered = subcategories.filter(sub => sub.category_id === productForm.category_id);
      setFilteredSubcategories(filtered);
      // Reset subcategory if it doesn't belong to the new category
      if (productForm.subcategory_id && !filtered.find(sub => sub.id === productForm.subcategory_id)) {
        setProductForm(prev => ({ ...prev, subcategory_id: '' }));
      }
    } else {
      setFilteredSubcategories([]);
    }
  }, [productForm.category_id, subcategories]);

  const loadReferences = async () => {
    try {
      const [categoriesRes, subcategoriesRes, colorsRes, sizesRes, productsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('subcategories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('colors').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('sizes').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('id, name, category_id').order('name')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (subcategoriesRes.data) setSubcategories(subcategoriesRes.data);
      if (colorsRes.data) setColors(colorsRes.data);
      if (sizesRes.data) setSizes(sizesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
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
    setUploading(true);
    
    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (uploadedImages.length > 0) {
        imageUrls = await uploadImages();
      }

      // Filter out empty video URLs
      const videoUrls = productForm.video_urls.filter(url => url.trim() !== '');

      // Insert product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
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
          video_urls: videoUrls
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert product colors
      if (selectedColors.length > 0 && productData) {
        const colorInserts = selectedColors.map(colorId => ({
          product_id: productData.id,
          color_id: colorId
        }));

        const { error: colorsError } = await supabase
          .from('product_colors')
          .insert(colorInserts);

        if (colorsError) throw colorsError;
      }

      // Insert product sizes
      if (selectedSizes.length > 0 && productData) {
        const sizeInserts = selectedSizes.map(sizeId => ({
          product_id: productData.id,
          size_id: sizeId
        }));

        const { error: sizesError } = await supabase
          .from('product_sizes')
          .insert(sizeInserts);

        if (sizesError) throw sizesError;
      }

      // Insert product recommendations
      if (recommendationType !== 'none' && productData) {
        if (recommendationType === 'products' && selectedRecommendationProducts.length > 0) {
          const recommendationInserts = selectedRecommendationProducts.map(productId => ({
            product_id: productData.id,
            recommended_for_product_id: productId
          }));

          const { error: recommendationsError } = await supabase
            .from('product_recommendations')
            .insert(recommendationInserts);

          if (recommendationsError) throw recommendationsError;
        } else if (recommendationType === 'category' && selectedRecommendationCategory) {
          const { error: recommendationError } = await supabase
            .from('product_recommendations')
            .insert({
              product_id: productData.id,
              recommended_for_category_id: selectedRecommendationCategory
            });

          if (recommendationError) throw recommendationError;
        }
      }

      toast({
        title: "Товар добавлен",
        description: "Товар успешно добавлен в каталог",
      });

      // Reset form
      setProductForm({
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
        video_urls: ['']
      });
      setSelectedColors([]);
      setSelectedSizes([]);
      setUploadedImages([]);
      setRecommendationType('none');
      setSelectedRecommendationProducts([]);
      setSelectedRecommendationCategory('');

      onProductAdded();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить товар</CardTitle>
        <CardDescription>Добавьте новый товар в каталог</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
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

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select onValueChange={(value) => setProductForm({...productForm, category_id: value})}>
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

          {/* Colors */}
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

          {/* Sizes */}
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

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images">Изображения товара</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Загрузите изображения
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

          {/* Video URLs */}
          <div className="space-y-2">
            <Label>Видео о товаре</Label>
            {productForm.video_urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => updateVideoUrl(index, e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1"
                />
                {productForm.video_urls.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeVideoUrl(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addVideoUrl}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить видео
            </Button>
          </div>

          {/* Physical Properties */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Вес (грамм)</Label>
              <Input
                id="weight"
                type="number"
                value={productForm.weight}
                onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Длина (см)</Label>
              <Input
                id="length"
                type="number"
                value={productForm.dimensions.length}
                onChange={(e) => setProductForm({
                  ...productForm, 
                  dimensions: {...productForm.dimensions, length: e.target.value}
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Ширина (см)</Label>
              <Input
                id="width"
                type="number"
                value={productForm.dimensions.width}
                onChange={(e) => setProductForm({
                  ...productForm, 
                  dimensions: {...productForm.dimensions, width: e.target.value}
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Высота (см)</Label>
              <Input
                id="height"
                type="number"
                value={productForm.dimensions.height}
                onChange={(e) => setProductForm({
                  ...productForm, 
                  dimensions: {...productForm.dimensions, height: e.target.value}
                })}
              />
            </div>
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

          {/* Recommendations */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Показывать как рекомендуемый товар</Label>
              <Select value={recommendationType} onValueChange={(value: 'none' | 'products' | 'category') => setRecommendationType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип рекомендации" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не показывать как рекомендуемый</SelectItem>
                  <SelectItem value="products">К выбранным товарам</SelectItem>
                  <SelectItem value="category">Ко всей категории</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recommendationType === 'products' && (
              <div className="space-y-2">
                <Label>Выберите товары</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`rec-product-${product.id}`}
                        checked={selectedRecommendationProducts.includes(product.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRecommendationProducts(prev => [...prev, product.id]);
                          } else {
                            setSelectedRecommendationProducts(prev => prev.filter(id => id !== product.id));
                          }
                        }}
                      />
                      <Label htmlFor={`rec-product-${product.id}`} className="text-sm">
                        {product.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendationType === 'category' && (
              <div className="space-y-2">
                <Label>Выберите категорию</Label>
                <Select value={selectedRecommendationCategory} onValueChange={setSelectedRecommendationCategory}>
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
            )}
          </div>

          {/* Flags */}
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

          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? 'Добавление...' : 'Добавить товар'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}