import React from 'react';
import { PageData, Block } from '@/types/page-editor';

interface PagePreviewProps {
  pageData: PageData;
  className?: string;
}

// Компоненты для рендеринга блоков в предпросмотре
const HeadingPreview = ({ block }: { block: Extract<Block, { type: 'heading' }> }) => {
  const { text, level, align } = block.props;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const getHeadingClass = () => {
    switch (level) {
      case 1: return 'text-4xl md:text-5xl font-bold mb-6 text-gray-900';
      case 2: return 'text-3xl md:text-4xl font-bold mb-5 text-gray-900';
      case 3: return 'text-2xl md:text-3xl font-semibold mb-4 text-gray-800';
      case 4: return 'text-xl md:text-2xl font-semibold mb-3 text-gray-800';
      case 5: return 'text-lg md:text-xl font-medium mb-3 text-gray-700';
      case 6: return 'text-base md:text-lg font-medium mb-2 text-gray-700';
      default: return 'text-2xl font-semibold mb-4 text-gray-800';
    }
  };
  
  return (
    <Tag 
      className={getHeadingClass()}
      style={{ textAlign: align }}
    >
      {text}
    </Tag>
  );
};

const ParagraphPreview = ({ block }: { block: Extract<Block, { type: 'paragraph' }> }) => {
  return (
    <div 
      className="text-gray-700 mb-6 leading-relaxed text-base md:text-lg"
      dangerouslySetInnerHTML={{ __html: block.props.content }}
    />
  );
};

const ImagePreview = ({ block }: { block: Extract<Block, { type: 'image' }> }) => {
  const { url, alt, caption } = block.props;
  
  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <img 
          src={url} 
          alt={alt}
          className="w-full h-auto object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Изображение+не+найдено';
          }}
        />
      </div>
      {caption && (
        <p className="text-sm text-gray-600 mt-3 text-center italic font-medium">{caption}</p>
      )}
    </div>
  );
};

const GalleryPreview = ({ block }: { block: Extract<Block, { type: 'gallery' }> }) => {
  const { layout, images } = block.props;
  
  const getGridClass = () => {
    switch (layout) {
      case 'grid': return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
      case 'masonry': return 'columns-2 md:columns-3 lg:columns-4 gap-6';
      case 'carousel': return 'flex overflow-x-auto gap-6 pb-4 scrollbar-hide';
      default: return 'grid grid-cols-2 md:grid-cols-3 gap-6';
    }
  };
  
  if (images.length === 0) {
    return (
      <div className="mb-8 p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
        <div className="text-4xl mb-2">🖼️</div>
        <p className="text-gray-500">Галерея пуста</p>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <div className={getGridClass()}>
        {images.map((image, index) => (
          <div key={index} className="break-inside-avoid group">
            <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
              <img 
                src={image.url} 
                alt={image.alt}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Изображение+не+найдено';
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ButtonPreview = ({ block }: { block: Extract<Block, { type: 'button' }> }) => {
  const { text, link, variant } = block.props;
  
  const getButtonClass = () => {
    const baseClass = "inline-block px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl";
    return variant === 'primary' 
      ? `${baseClass} bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800`
      : `${baseClass} border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-700`;
  };
  
  return (
    <div className="mb-8 text-center">
      <a href={link} className={getButtonClass()}>
        {text}
      </a>
    </div>
  );
};

const FormPreview = ({ block }: { block: Extract<Block, { type: 'form' }> }) => {
  return (
    <div className="mb-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Свяжитесь с нами</h3>
        <p className="text-gray-600">Мы всегда рады помочь вам</p>
      </div>
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Имя</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Введите ваше имя"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Введите ваш email"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Сообщение</label>
          <textarea 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            rows={4}
            placeholder="Введите ваше сообщение"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Отправить сообщение
        </button>
      </form>
    </div>
  );
};

const DividerPreview = ({ block }: { block: Extract<Block, { type: 'divider' }> }) => {
  return (
    <div className="my-12 flex items-center justify-center">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </div>
  );
};

// Основной компонент предпросмотра
const PagePreview: React.FC<PagePreviewProps> = ({ pageData, className = '' }) => {
  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'heading':
        return <HeadingPreview key={block.id} block={block} />;
      case 'paragraph':
        return <ParagraphPreview key={block.id} block={block} />;
      case 'image':
        return <ImagePreview key={block.id} block={block} />;
      case 'gallery':
        return <GalleryPreview key={block.id} block={block} />;
      case 'button':
        return <ButtonPreview key={block.id} block={block} />;
      case 'form':
        return <FormPreview key={block.id} block={block} />;
      case 'divider':
        return <DividerPreview key={block.id} block={block} />;
      default:
        return null;
    }
  };

  return (
    <div className={`h-full overflow-y-auto bg-white ${className}`}>
      {/* Заголовок страницы */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 py-6 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{pageData.title}</h1>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Предпросмотр страницы
          </p>
        </div>
      </div>
      
      {/* Контент страницы */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {pageData.blocks.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-8xl mb-6">📄</div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">Страница пуста</h3>
            <p className="text-lg text-gray-500 mb-8">Добавьте блоки для создания контента</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-lg">
              <span className="text-2xl">✨</span>
              <span>Используйте панель блоков слева для добавления контента</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {pageData.blocks.map(renderBlock)}
          </div>
        )}
      </div>
      
      {/* Подвал предпросмотра */}
      <div className="bg-gray-50 border-t border-gray-200 py-6 px-8 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-600 font-medium">
              Это предпросмотр страницы. Изменения будут сохранены при нажатии "Сохранить"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagePreview;
