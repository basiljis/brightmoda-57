import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Save, Undo, Redo, Settings, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Block, PageData, BlockTemplate, EditorState } from '@/types/page-editor';
import BlockPalette from './page-editor/BlockPalette';
import CanvasArea from './page-editor/CanvasArea';
import SettingsPanel from './page-editor/SettingsPanel';
import BlockRenderer from './page-editor/BlockRenderer';
import PagePreview from './page-editor/PagePreview';

const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    type: 'heading',
    label: 'Заголовок',
    icon: '📝',
    description: 'Добавить заголовок'
  },
  {
    type: 'paragraph',
    label: 'Текст',
    icon: '📄',
    description: 'Добавить текстовый блок'
  },
  {
    type: 'image',
    label: 'Изображение',
    icon: '🖼️',
    description: 'Добавить изображение'
  },
  {
    type: 'gallery',
    label: 'Галерея',
    icon: '🖼️',
    description: 'Добавить галерею изображений'
  },
  {
    type: 'button',
    label: 'Кнопка',
    icon: '🔘',
    description: 'Добавить кнопку'
  },
  {
    type: 'form',
    label: 'Форма',
    icon: '📋',
    description: 'Добавить форму'
  },
  {
    type: 'divider',
    label: 'Разделитель',
    icon: '➖',
    description: 'Добавить разделитель'
  },
  {
    type: 'yandex_map',
    label: 'Яндекс Карта',
    icon: '🗺️',
    description: 'Добавить карту Яндекс'
  }
];

interface PageEditorProps {
  initialPageData?: PageData;
  onSave?: (pageData: PageData) => void;
  onClose?: () => void;
}

const PageEditor: React.FC<PageEditorProps> = ({ 
  initialPageData, 
  onSave, 
  onClose 
}) => {
  const { toast } = useToast();
  
  const [editorState, setEditorState] = useState<EditorState>({
    pageData: initialPageData || {
      id: nanoid(),
      title: 'Новая страница',
      blocks: []
    },
    selectedBlockId: null,
    isPreviewMode: false,
    isDirty: false
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<PageData[]>([editorState.pageData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updatePageData = useCallback((newPageData: PageData) => {
    setEditorState(prev => ({
      ...prev,
      pageData: newPageData,
      isDirty: true
    }));
  }, []);

  const addToHistory = useCallback((pageData: PageData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(pageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Если перетаскиваем из палитры блоков
    if (activeId.startsWith('template-')) {
      const templateType = activeId.replace('template-', '') as Block['type'];
      const newBlock = createBlockFromTemplate(templateType);
      
      if (overId === 'canvas-area') {
        // Добавляем в конец
        const newPageData = {
          ...editorState.pageData,
          blocks: [...editorState.pageData.blocks, newBlock]
        };
        updatePageData(newPageData);
        addToHistory(newPageData);
      } else {
        // Вставляем перед существующим блоком
        const targetIndex = editorState.pageData.blocks.findIndex(block => block.id === overId);
        if (targetIndex !== -1) {
          const newBlocks = [...editorState.pageData.blocks];
          newBlocks.splice(targetIndex, 0, newBlock);
          const newPageData = {
            ...editorState.pageData,
            blocks: newBlocks
          };
          updatePageData(newPageData);
          addToHistory(newPageData);
        }
      }
    } else {
      // Переупорядочиваем существующие блоки
      const oldIndex = editorState.pageData.blocks.findIndex(block => block.id === activeId);
      const newIndex = editorState.pageData.blocks.findIndex(block => block.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newBlocks = arrayMove(editorState.pageData.blocks, oldIndex, newIndex);
        const newPageData = {
          ...editorState.pageData,
          blocks: newBlocks
        };
        updatePageData(newPageData);
        addToHistory(newPageData);
      }
    }
  };

  const createBlockFromTemplate = (type: Block['type']): Block => {
    const id = nanoid();
    
    switch (type) {
      case 'heading':
        return {
          id,
          type: 'heading',
          props: {
            text: 'Новый заголовок',
            level: 2,
            align: 'left'
          }
        };
      case 'paragraph':
        return {
          id,
          type: 'paragraph',
          props: {
            content: 'Введите текст здесь...'
          }
        };
      case 'image':
        return {
          id,
          type: 'image',
          props: {
            url: '',
            alt: 'Описание изображения'
          }
        };
      case 'gallery':
        return {
          id,
          type: 'gallery',
          props: {
            layout: 'grid',
            images: []
          }
        };
      case 'button':
        return {
          id,
          type: 'button',
          props: {
            text: 'Кнопка',
            link: '#',
            variant: 'primary'
          }
        };
      case 'form':
        return {
          id,
          type: 'form',
          props: {}
        };
      case 'divider':
        return {
          id,
          type: 'divider',
          props: {}
        };
      case 'yandex_map':
        return {
          id,
          type: 'yandex_map',
          props: {
            embedUrl: '',
            height: 400
          }
        };
      default:
        throw new Error(`Unknown block type: ${type}`);
    }
  };

  const handleBlockSelect = (blockId: string | null) => {
    setEditorState(prev => ({
      ...prev,
      selectedBlockId: blockId
    }));
  };

  const handleBlockUpdate = (blockId: string, updatedBlock: Block) => {
    const newBlocks = editorState.pageData.blocks.map(block =>
      block.id === blockId ? updatedBlock : block
    );
    const newPageData = {
      ...editorState.pageData,
      blocks: newBlocks
    };
    updatePageData(newPageData);
    addToHistory(newPageData);
  };

  const handleBlockDelete = (blockId: string) => {
    const newBlocks = editorState.pageData.blocks.filter(block => block.id !== blockId);
    const newPageData = {
      ...editorState.pageData,
      blocks: newBlocks
    };
    updatePageData(newPageData);
    addToHistory(newPageData);
    setEditorState(prev => ({
      ...prev,
      selectedBlockId: null
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editorState.pageData);
    }
    setEditorState(prev => ({
      ...prev,
      isDirty: false
    }));
    toast({
      title: 'Сохранено',
      description: 'Страница успешно сохранена'
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      updatePageData(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      updatePageData(history[newIndex]);
    }
  };

  const togglePreview = () => {
    setEditorState(prev => ({
      ...prev,
      isPreviewMode: !prev.isPreviewMode
    }));
  };

  const selectedBlock = editorState.pageData.blocks.find(
    block => block.id === editorState.selectedBlockId
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Редактор страниц</h1>
          {editorState.isDirty && (
            <span className="text-sm text-orange-600">• Несохраненные изменения</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex === 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
          >
            <Eye className="h-4 w-4 mr-2" />
            {editorState.isPreviewMode ? 'Редактировать' : 'Предпросмотр'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!editorState.isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Left Panel - Block Palette */}
          {!editorState.isPreviewMode && (
            <div className="w-80 border-r bg-muted/30 overflow-y-auto">
              <BlockPalette templates={BLOCK_TEMPLATES} />
            </div>
          )}

          {/* Center Panel - Canvas or Preview */}
          <div className="flex-1 flex flex-col">
            {editorState.isPreviewMode ? (
              <PagePreview pageData={editorState.pageData} />
            ) : (
              <CanvasArea
                pageData={editorState.pageData}
                isPreviewMode={editorState.isPreviewMode}
                selectedBlockId={editorState.selectedBlockId}
                onBlockSelect={handleBlockSelect}
                onBlockUpdate={handleBlockUpdate}
                onBlockDelete={handleBlockDelete}
              />
            )}
          </div>

          {/* Right Panel - Settings */}
          {!editorState.isPreviewMode && (
            <div className="w-80 border-l bg-muted/30 overflow-y-auto">
              <SettingsPanel
                selectedBlock={selectedBlock}
                onBlockUpdate={handleBlockUpdate}
              />
            </div>
          )}
        </DndContext>
      </div>
    </div>
  );
};

export default PageEditor;
