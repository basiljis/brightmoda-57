import React from 'react';
import { Block } from '@/types/page-editor';

interface BlockRendererProps {
  block: Block;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.props.level}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag 
          className={`font-bold ${
            block.props.align === 'center' ? 'text-center' :
            block.props.align === 'right' ? 'text-right' : 'text-left'
          }`}
        >
          {block.props.text}
        </HeadingTag>
      );

    case 'paragraph':
      return (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: block.props.content }}
        />
      );

    case 'image':
      return (
        <div className="space-y-2">
          {block.props.url ? (
            <img 
              src={block.props.url} 
              alt={block.props.alt}
              className="max-w-full h-auto rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              Изображение не выбрано
            </div>
          )}
          {block.props.caption && (
            <p className="text-sm text-muted-foreground text-center">
              {block.props.caption}
            </p>
          )}
        </div>
      );

    case 'gallery':
      if (block.props.images.length === 0) {
        return (
          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
            Галерея пуста
          </div>
        );
      }

      return (
        <div className={`grid gap-4 ${
          block.props.layout === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
          block.props.layout === 'masonry' ? 'columns-2 md:columns-3 lg:columns-4' :
          'grid-cols-1'
        }`}>
          {block.props.images.map((image, index) => (
            <div key={index} className="relative group">
              <img 
                src={image.url} 
                alt={image.alt}
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
          ))}
        </div>
      );

    case 'button':
      return (
        <div className="flex justify-center">
          <a
            href={block.props.link}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              block.props.variant === 'primary'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {block.props.text}
          </a>
        </div>
      );

    case 'form':
      return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Контактная форма</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите ваше имя"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите ваш email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сообщение
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Введите ваше сообщение"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Отправить
            </button>
          </form>
        </div>
      );

    case 'divider':
      return (
        <div className="flex items-center justify-center py-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="px-4 text-gray-500">•</div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
      );

    case 'yandex_map':
      return (
        <div className="w-full">
          {block.props.latitude && block.props.longitude ? (
            <iframe
              src={`https://yandex.ru/map-widget/v1/?ll=${block.props.longitude},${block.props.latitude}&z=${block.props.zoom || 15}&l=map&pt=${block.props.longitude},${block.props.latitude},pm2rdm`}
              width="100%"
              height={block.props.height}
              className="border-0 rounded-lg"
              allowFullScreen
            />
          ) : (
            <div 
              className="w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground"
              style={{ height: `${block.props.height}px` }}
            >
              Укажите координаты карты
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="text-muted-foreground">
          Неизвестный тип блока: {(block as any).type}
        </div>
      );
  }
};

export default BlockRenderer;

