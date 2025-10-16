import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Block } from '@/types/page-editor';
import { Settings, Palette } from 'lucide-react';
import FileUploadField from '@/components/admin/FileUploadField';

interface SettingsPanelProps {
  selectedBlock: Block | null;
  onBlockUpdate: (blockId: string, block: Block) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ selectedBlock, onBlockUpdate }) => {
  if (!selectedBlock) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Настройки блока</h3>
            <p className="text-sm text-muted-foreground">
              Выберите блок для редактирования его свойств
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePropChange = (prop: string, value: any) => {
    const updatedBlock = {
      ...selectedBlock,
      props: {
        ...selectedBlock.props,
        [prop]: value
      }
    } as Block;
    onBlockUpdate(selectedBlock.id, updatedBlock);
  };

  const renderBlockSettings = () => {
    switch (selectedBlock.type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Текст заголовка</Label>
              <Input
                id="text"
                value={selectedBlock.props.text}
                onChange={(e) => handlePropChange('text', e.target.value)}
                placeholder="Введите заголовок"
              />
            </div>
            <div>
              <Label htmlFor="level">Уровень заголовка</Label>
              <Select
                value={selectedBlock.props.level.toString()}
                onValueChange={(value) => handlePropChange('level', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1 - Главный заголовок</SelectItem>
                  <SelectItem value="2">H2 - Подзаголовок</SelectItem>
                  <SelectItem value="3">H3 - Заголовок секции</SelectItem>
                  <SelectItem value="4">H4 - Подзаголовок секции</SelectItem>
                  <SelectItem value="5">H5 - Малый заголовок</SelectItem>
                  <SelectItem value="6">H6 - Самый малый заголовок</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="align">Выравнивание</Label>
              <Select
                value={selectedBlock.props.align}
                onValueChange={(value) => handlePropChange('align', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">По левому краю</SelectItem>
                  <SelectItem value="center">По центру</SelectItem>
                  <SelectItem value="right">По правому краю</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Содержимое</Label>
              <Textarea
                id="content"
                value={selectedBlock.props.content}
                onChange={(e) => handlePropChange('content', e.target.value)}
                placeholder="Введите текст..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Поддерживается HTML разметка
              </p>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <FileUploadField
              field="image-url"
              label="Изображение"
              description="Загрузите изображение или вставьте URL"
              value={selectedBlock.props.url}
              onChange={(value) => handlePropChange('url', value)}
              accept="image/*"
              bucket="product-images"
              folder="page-images"
              showRecommendations={true}
              recommendationsFor="gallery"
            />
            <div>
              <Label htmlFor="alt">Альтернативный текст</Label>
              <Input
                id="alt"
                value={selectedBlock.props.alt}
                onChange={(e) => handlePropChange('alt', e.target.value)}
                placeholder="Описание изображения"
              />
            </div>
            <div>
              <Label htmlFor="caption">Подпись (необязательно)</Label>
              <Input
                id="caption"
                value={selectedBlock.props.caption || ''}
                onChange={(e) => handlePropChange('caption', e.target.value)}
                placeholder="Подпись под изображением"
              />
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="layout">Макет галереи</Label>
              <Select
                value={selectedBlock.props.layout}
                onValueChange={(value) => handlePropChange('layout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Сетка</SelectItem>
                  <SelectItem value="masonry">Кирпичная кладка</SelectItem>
                  <SelectItem value="carousel">Карусель</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Изображения</Label>
              <div className="space-y-4">
                {selectedBlock.props.images.map((image, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Изображение {index + 1}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const newImages = selectedBlock.props.images.filter((_, i) => i !== index);
                          handlePropChange('images', newImages);
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                    <FileUploadField
                      field={`gallery-image-${index}`}
                      label="Изображение"
                      description="Загрузите изображение или вставьте URL"
                      value={image.url}
                      onChange={(value) => {
                        const newImages = [...selectedBlock.props.images];
                        newImages[index] = { ...image, url: value };
                        handlePropChange('images', newImages);
                      }}
                      accept="image/*"
                      bucket="product-images"
                      folder="page-images"
                      showRecommendations={false}
                    />
                    <div>
                      <Label htmlFor={`alt-${index}`}>Альтернативный текст</Label>
                      <Input
                        id={`alt-${index}`}
                        value={image.alt}
                        onChange={(e) => {
                          const newImages = [...selectedBlock.props.images];
                          newImages[index] = { ...image, alt: e.target.value };
                          handlePropChange('images', newImages);
                        }}
                        placeholder="Описание изображения"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newImages = [...selectedBlock.props.images, { url: '', alt: '' }];
                    handlePropChange('images', newImages);
                  }}
                  className="w-full"
                >
                  + Добавить изображение
                </Button>
              </div>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Текст кнопки</Label>
              <Input
                id="text"
                value={selectedBlock.props.text}
                onChange={(e) => handlePropChange('text', e.target.value)}
                placeholder="Текст кнопки"
              />
            </div>
            <div>
              <Label htmlFor="link">Ссылка</Label>
              <Input
                id="link"
                value={selectedBlock.props.link}
                onChange={(e) => handlePropChange('link', e.target.value)}
                placeholder="https://example.com или /page"
              />
            </div>
            <div>
              <Label htmlFor="variant">Стиль кнопки</Label>
              <Select
                value={selectedBlock.props.variant}
                onValueChange={(value) => handlePropChange('variant', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Основная</SelectItem>
                  <SelectItem value="outline">Контурная</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📋 Форма</h4>
              <p className="text-sm text-blue-700">
                Это стандартная контактная форма. Настройки недоступны.
              </p>
            </div>
          </div>
        );

      case 'divider':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">➖ Разделитель</h4>
              <p className="text-sm text-gray-700">
                Визуальный разделитель между блоками. Настройки недоступны.
              </p>
            </div>
          </div>
        );

      case 'yandex_map':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="embedUrl">Ссылка для встраивания</Label>
              <Textarea
                id="embedUrl"
                value={selectedBlock.props.embedUrl}
                onChange={(e) => handlePropChange('embedUrl', e.target.value)}
                placeholder="https://yandex.ru/map-widget/..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Вставьте ссылку для встраивания из Яндекс.Карт
              </p>
            </div>
            <div>
              <Label htmlFor="height">Высота (px)</Label>
              <Input
                id="height"
                type="number"
                min={200}
                max={800}
                value={selectedBlock.props.height}
                onChange={(e) => handlePropChange('height', parseInt(e.target.value))}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Неизвестный тип блока: {(selectedBlock as any).type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Настройки блока
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Тип: {selectedBlock.type}</p>
              <p className="text-xs text-muted-foreground">ID: {selectedBlock.id}</p>
            </div>
            {renderBlockSettings()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;

