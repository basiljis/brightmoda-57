export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'gallery'
  | 'button'
  | 'form'
  | 'divider'
  | 'yandex_map';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  props: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
    align: 'left' | 'center' | 'right';
  };
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  props: {
    content: string; // можно хранить как plain text или HTML
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  props: {
    url: string;
    alt: string;
    caption?: string;
  };
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  props: {
    layout: 'grid' | 'masonry' | 'carousel';
    images: { url: string; alt: string }[];
  };
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  props: {
    text: string;
    link: string;
    variant: 'primary' | 'outline';
  };
}

export interface FormBlock extends BaseBlock {
  type: 'form';
  props: Record<string, never>; // без настроек
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  props: Record<string, never>;
}

export interface YandexMapBlock extends BaseBlock {
  type: 'yandex_map';
  props: {
    embedUrl: string;
    height: number;
  };
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | GalleryBlock
  | ButtonBlock
  | FormBlock
  | DividerBlock
  | YandexMapBlock;

export interface PageData {
  id: string;
  title: string;
  blocks: Block[];
}

export interface BlockTemplate {
  type: BlockType;
  label: string;
  icon: string;
  description: string;
}

export interface EditorState {
  pageData: PageData;
  selectedBlockId: string | null;
  isPreviewMode: boolean;
  isDirty: boolean;
}

