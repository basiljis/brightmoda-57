import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PageData, Block } from '@/types/page-editor';
import SortableBlock from './SortableBlock';
import BlockRenderer from './BlockRenderer';

interface CanvasAreaProps {
  pageData: PageData;
  isPreviewMode: boolean;
  selectedBlockId: string | null;
  onBlockSelect: (blockId: string | null) => void;
  onBlockUpdate: (blockId: string, block: Block) => void;
  onBlockDelete: (blockId: string) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  pageData,
  isPreviewMode,
  selectedBlockId,
  onBlockSelect,
  onBlockUpdate,
  onBlockDelete
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-area',
  });

  const handleBlockClick = (blockId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isPreviewMode) {
      onBlockSelect(blockId);
    }
  };

  const handleCanvasClick = () => {
    if (!isPreviewMode) {
      onBlockSelect(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Title */}
      <div className="p-4 border-b bg-background">
        <h1 className="text-2xl font-bold">{pageData.title}</h1>
        {!isPreviewMode && (
          <p className="text-sm text-muted-foreground mt-1">
            {pageData.blocks.length} блоков на странице
          </p>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-6 overflow-y-auto ${
          isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
        } ${isPreviewMode ? 'bg-background' : 'bg-muted/20'}`}
        onClick={handleCanvasClick}
      >
        <div className="max-w-4xl mx-auto">
          {pageData.blocks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Пустая страница
              </h3>
              <p className="text-sm text-muted-foreground">
                {isPreviewMode 
                  ? 'На этой странице пока нет контента'
                  : 'Перетащите блоки сюда, чтобы начать создавать страницу'
                }
              </p>
            </div>
          ) : (
            <SortableContext
              items={pageData.blocks.map(block => block.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {pageData.blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    isPreviewMode={isPreviewMode}
                    onClick={(e) => handleBlockClick(block.id, e)}
                    onUpdate={(updatedBlock) => onBlockUpdate(block.id, updatedBlock)}
                    onDelete={() => onBlockDelete(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;

