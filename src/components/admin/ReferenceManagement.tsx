import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Palette, Tag, Shapes, Layers } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

interface Color {
  id: string;
  name: string;
  hex_code: string;
  is_active: boolean;
  sort_order: number;
}

interface Size {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
}

export default function ReferenceManagement() {
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    is_active: true,
    sort_order: 0,
    isEditing: false
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    id: '',
    category_id: '',
    name: '',
    slug: '',
    description: '',
    is_active: true,
    sort_order: 0,
    isEditing: false
  });

  const [colorForm, setColorForm] = useState({
    id: '',
    name: '',
    hex_code: '#000000',
    is_active: true,
    sort_order: 0,
    isEditing: false
  });

  const [sizeForm, setSizeForm] = useState({
    id: '',
    name: '',
    is_active: true,
    sort_order: 0,
    isEditing: false
  });

  useEffect(() => {
    loadAllReferences();
  }, []);

  const loadAllReferences = async () => {
    await Promise.all([
      loadCategories(),
      loadSubcategories(),
      loadColors(),
      loadSizes()
    ]);
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*, categories(name)')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadColors = async () => {
    try {
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setColors(data || []);
    } catch (error) {
      console.error('Error loading colors:', error);
    }
  };

  const loadSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('sizes')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setSizes(data || []);
    } catch (error) {
      console.error('Error loading sizes:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = categoryForm.slug || generateSlug(categoryForm.name);
      
      if (categoryForm.isEditing) {
        const { error } = await supabase.from('categories').update({
          name: categoryForm.name,
          slug,
          description: categoryForm.description,
          is_active: categoryForm.is_active,
          sort_order: categoryForm.sort_order
        }).eq('id', categoryForm.id);

        if (error) throw error;

        toast({
          title: "Категория обновлена",
          description: "Категория успешно обновлена",
        });
      } else {
        const { error } = await supabase.from('categories').insert({
          name: categoryForm.name,
          slug,
          description: categoryForm.description,
          is_active: categoryForm.is_active,
          sort_order: categoryForm.sort_order
        });

        if (error) throw error;

        toast({
          title: "Категория добавлена",
          description: "Категория успешно добавлена",
        });
      }

      setCategoryForm({
        id: '',
        name: '',
        slug: '',
        description: '',
        is_active: true,
        sort_order: 0,
        isEditing: false
      });

      loadCategories();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: categoryForm.isEditing ? "Не удалось обновить категорию" : "Не удалось добавить категорию",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active,
      sort_order: category.sort_order,
      isEditing: true
    });
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить категорию "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Категория удалена",
        description: "Категория успешно удалена",
      });

      loadCategories();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить категорию",
        variant: "destructive",
      });
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = subcategoryForm.slug || generateSlug(subcategoryForm.name);
      
      if (subcategoryForm.isEditing) {
        const { error } = await supabase.from('subcategories').update({
          category_id: subcategoryForm.category_id,
          name: subcategoryForm.name,
          slug,
          description: subcategoryForm.description,
          is_active: subcategoryForm.is_active,
          sort_order: subcategoryForm.sort_order
        }).eq('id', subcategoryForm.id);

        if (error) throw error;

        toast({
          title: "Подкатегория обновлена",
          description: "Подкатегория успешно обновлена",
        });
      } else {
        const { error } = await supabase.from('subcategories').insert({
          category_id: subcategoryForm.category_id,
          name: subcategoryForm.name,
          slug,
          description: subcategoryForm.description,
          is_active: subcategoryForm.is_active,
          sort_order: subcategoryForm.sort_order
        });

        if (error) throw error;

        toast({
          title: "Подкатегория добавлена",
          description: "Подкатегория успешно добавлена",
        });
      }

      setSubcategoryForm({
        id: '',
        category_id: '',
        name: '',
        slug: '',
        description: '',
        is_active: true,
        sort_order: 0,
        isEditing: false
      });

      loadSubcategories();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: subcategoryForm.isEditing ? "Не удалось обновить подкатегорию" : "Не удалось добавить подкатегорию",
        variant: "destructive",
      });
    }
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setSubcategoryForm({
      id: subcategory.id,
      category_id: subcategory.category_id,
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description || '',
      is_active: subcategory.is_active,
      sort_order: subcategory.sort_order,
      isEditing: true
    });
  };

  const handleDeleteSubcategory = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить подкатегорию "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('subcategories').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Подкатегория удалена",
        description: "Подкатегория успешно удалена",
      });

      loadSubcategories();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить подкатегорию",
        variant: "destructive",
      });
    }
  };

  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (colorForm.isEditing) {
        const { error } = await supabase.from('colors').update({
          name: colorForm.name,
          hex_code: colorForm.hex_code,
          is_active: colorForm.is_active,
          sort_order: colorForm.sort_order
        }).eq('id', colorForm.id);

        if (error) throw error;

        toast({
          title: "Цвет обновлен",
          description: "Цвет успешно обновлен",
        });
      } else {
        const { error } = await supabase.from('colors').insert({
          name: colorForm.name,
          hex_code: colorForm.hex_code,
          is_active: colorForm.is_active,
          sort_order: colorForm.sort_order
        });

        if (error) throw error;

        toast({
          title: "Цвет добавлен",
          description: "Цвет успешно добавлен",
        });
      }

      setColorForm({
        id: '',
        name: '',
        hex_code: '#000000',
        is_active: true,
        sort_order: 0,
        isEditing: false
      });

      loadColors();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: colorForm.isEditing ? "Не удалось обновить цвет" : "Не удалось добавить цвет",
        variant: "destructive",
      });
    }
  };

  const handleEditColor = (color: Color) => {
    setColorForm({
      id: color.id,
      name: color.name,
      hex_code: color.hex_code,
      is_active: color.is_active,
      sort_order: color.sort_order,
      isEditing: true
    });
  };

  const handleDeleteColor = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить цвет "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('colors').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Цвет удален",
        description: "Цвет успешно удален",
      });

      loadColors();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить цвет",
        variant: "destructive",
      });
    }
  };

  const handleSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (sizeForm.isEditing) {
        const { error } = await supabase.from('sizes').update({
          name: sizeForm.name,
          is_active: sizeForm.is_active,
          sort_order: sizeForm.sort_order
        }).eq('id', sizeForm.id);

        if (error) throw error;

        toast({
          title: "Размер обновлен",
          description: "Размер успешно обновлен",
        });
      } else {
        const { error } = await supabase.from('sizes').insert({
          name: sizeForm.name,
          is_active: sizeForm.is_active,
          sort_order: sizeForm.sort_order
        });

        if (error) throw error;

        toast({
          title: "Размер добавлен",
          description: "Размер успешно добавлен",
        });
      }

      setSizeForm({
        id: '',
        name: '',
        is_active: true,
        sort_order: 0,
        isEditing: false
      });

      loadSizes();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: sizeForm.isEditing ? "Не удалось обновить размер" : "Не удалось добавить размер",
        variant: "destructive",
      });
    }
  };

  const handleEditSize = (size: Size) => {
    setSizeForm({
      id: size.id,
      name: size.name,
      is_active: size.is_active,
      sort_order: size.sort_order,
      isEditing: true
    });
  };

  const handleDeleteSize = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить размер "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('sizes').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Размер удален",
        description: "Размер успешно удален",
      });

      loadSizes();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить размер",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Справочники</h2>
        <p className="text-muted-foreground">Управление категориями, цветами и размерами</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Категории
          </TabsTrigger>
          <TabsTrigger value="subcategories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Подкатегории
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Цвета
          </TabsTrigger>
          <TabsTrigger value="sizes" className="flex items-center gap-2">
            <Shapes className="h-4 w-4" />
            Размеры
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{categoryForm.isEditing ? 'Редактировать категорию' : 'Добавить категорию'}</CardTitle>
              <CardDescription>{categoryForm.isEditing ? 'Измените данные категории' : 'Создайте новую категорию товаров'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Название</Label>
                    <Input
                      id="cat-name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cat-slug">Slug (URL)</Label>
                    <Input
                      id="cat-slug"
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                      placeholder="Будет создан автоматически"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cat-description">Описание</Label>
                  <Textarea
                    id="cat-description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-sort">Порядок сортировки</Label>
                    <Input
                      id="cat-sort"
                      type="number"
                      value={categoryForm.sort_order}
                      onChange={(e) => setCategoryForm({...categoryForm, sort_order: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="cat-active"
                      checked={categoryForm.is_active}
                      onCheckedChange={(checked) => setCategoryForm({...categoryForm, is_active: checked})}
                    />
                    <Label htmlFor="cat-active">Активна</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {categoryForm.isEditing ? 'Обновить категорию' : 'Добавить категорию'}
                </Button>
                {categoryForm.isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCategoryForm({
                      id: '',
                      name: '',
                      slug: '',
                      description: '',
                      is_active: true,
                      sort_order: 0,
                      isEditing: false
                    })}
                  >
                    Отмена
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список категорий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">/{category.slug}</p>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.is_active ? 'Активна' : 'Неактивна'}
                        </span>
                        <span className="text-xs text-muted-foreground">#{category.sort_order}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcategories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{subcategoryForm.isEditing ? 'Редактировать подкатегорию' : 'Добавить подкатегорию'}</CardTitle>
              <CardDescription>{subcategoryForm.isEditing ? 'Измените данные подкатегории' : 'Создайте новую подкатегорию товаров'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubcategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subcat-category">Категория</Label>
                  <Select onValueChange={(value) => setSubcategoryForm({...subcategoryForm, category_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat.is_active).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subcat-name">Название</Label>
                    <Input
                      id="subcat-name"
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({...subcategoryForm, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subcat-slug">Slug (URL)</Label>
                    <Input
                      id="subcat-slug"
                      value={subcategoryForm.slug}
                      onChange={(e) => setSubcategoryForm({...subcategoryForm, slug: e.target.value})}
                      placeholder="Будет создан автоматически"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcat-description">Описание</Label>
                  <Textarea
                    id="subcat-description"
                    value={subcategoryForm.description}
                    onChange={(e) => setSubcategoryForm({...subcategoryForm, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subcat-sort">Порядок сортировки</Label>
                    <Input
                      id="subcat-sort"
                      type="number"
                      value={subcategoryForm.sort_order}
                      onChange={(e) => setSubcategoryForm({...subcategoryForm, sort_order: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="subcat-active"
                      checked={subcategoryForm.is_active}
                      onCheckedChange={(checked) => setSubcategoryForm({...subcategoryForm, is_active: checked})}
                    />
                    <Label htmlFor="subcat-active">Активна</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {subcategoryForm.isEditing ? 'Обновить подкатегорию' : 'Добавить подкатегорию'}
                </Button>
                {subcategoryForm.isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSubcategoryForm({
                      id: '',
                      category_id: '',
                      name: '',
                      slug: '',
                      description: '',
                      is_active: true,
                      sort_order: 0,
                      isEditing: false
                    })}
                  >
                    Отмена
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список подкатегорий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subcategories.map((subcategory: any) => (
                  <div key={subcategory.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{subcategory.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {subcategory.categories?.name} / {subcategory.slug}
                        </p>
                        {subcategory.description && (
                          <p className="text-sm text-muted-foreground mt-1">{subcategory.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          subcategory.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {subcategory.is_active ? 'Активна' : 'Неактивна'}
                        </span>
                        <span className="text-xs text-muted-foreground">#{subcategory.sort_order}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSubcategory(subcategory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSubcategory(subcategory.id, subcategory.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{colorForm.isEditing ? 'Редактировать цвет' : 'Добавить цвет'}</CardTitle>
              <CardDescription>{colorForm.isEditing ? 'Измените данные цвета' : 'Создайте новый цвет для товаров'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleColorSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color-name">Название цвета</Label>
                    <Input
                      id="color-name"
                      value={colorForm.name}
                      onChange={(e) => setColorForm({...colorForm, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color-hex">Код цвета</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color-hex"
                        type="color"
                        value={colorForm.hex_code}
                        onChange={(e) => setColorForm({...colorForm, hex_code: e.target.value})}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={colorForm.hex_code}
                        onChange={(e) => setColorForm({...colorForm, hex_code: e.target.value})}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color-sort">Порядок сортировки</Label>
                    <Input
                      id="color-sort"
                      type="number"
                      value={colorForm.sort_order}
                      onChange={(e) => setColorForm({...colorForm, sort_order: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="color-active"
                      checked={colorForm.is_active}
                      onCheckedChange={(checked) => setColorForm({...colorForm, is_active: checked})}
                    />
                    <Label htmlFor="color-active">Активен</Label>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {colorForm.isEditing ? 'Обновить цвет' : 'Добавить цвет'}
                </Button>
                {colorForm.isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setColorForm({
                      id: '',
                      name: '',
                      hex_code: '#000000',
                      is_active: true,
                      sort_order: 0,
                      isEditing: false
                    })}
                  >
                    Отмена
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список цветов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colors.map((color) => (
                  <div key={color.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color.hex_code }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{color.name}</h3>
                        <p className="text-sm text-muted-foreground">{color.hex_code}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditColor(color)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteColor(color.id, color.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          color.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {color.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">#{color.sort_order}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{sizeForm.isEditing ? 'Редактировать размер' : 'Добавить размер'}</CardTitle>
              <CardDescription>{sizeForm.isEditing ? 'Измените данные размера' : 'Создайте новый размер для товаров'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSizeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size-name">Название размера</Label>
                    <Input
                      id="size-name"
                      value={sizeForm.name}
                      onChange={(e) => setSizeForm({...sizeForm, name: e.target.value})}
                      placeholder="Например: XS, S, M, L, XL"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="size-sort">Порядок сортировки</Label>
                    <Input
                      id="size-sort"
                      type="number"
                      value={sizeForm.sort_order}
                      onChange={(e) => setSizeForm({...sizeForm, sort_order: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="size-active"
                    checked={sizeForm.is_active}
                    onCheckedChange={(checked) => setSizeForm({...sizeForm, is_active: checked})}
                  />
                  <Label htmlFor="size-active">Активен</Label>
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {sizeForm.isEditing ? 'Обновить размер' : 'Добавить размер'}
                </Button>
                {sizeForm.isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSizeForm({
                      id: '',
                      name: '',
                      is_active: true,
                      sort_order: 0,
                      isEditing: false
                    })}
                  >
                    Отмена
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список размеров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sizes.map((size) => (
                  <div key={size.id} className="p-4 border rounded-lg text-center">
                    <div className="font-semibold text-lg">{size.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">#{size.sort_order}</div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                      size.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {size.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}