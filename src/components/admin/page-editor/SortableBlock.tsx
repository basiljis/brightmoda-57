import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block } from '@/types/page-editor';
import BlockRenderer from './BlockRenderer';
import { Button } from '@/components/ui/button';
import { Settings, Trash2, GripVertical } from 'lucide-react';

interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  isPreviewMode: boolean;
  onClick: (event: React.MouseEvent) => void;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

const SortableBlock: React.FC<SortableBlockProps> = ({
  block,
  isSelected,
  isPreviewMode,
  onClick,
  onUpdate,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить этот блок?')) {
      onDelete();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      {/* Block Content */}
      <div className="bg-background border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow max-h-[600px] overflow-y-auto">
        <BlockRenderer block={block} />
      </div>

      {/* Block Controls */}
      {!isPreviewMode && (
        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0"
            {...attributes}
            {...listeners}
            title="Перетащить"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0"
            title="Настроить"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0"
            onClick={handleDelete}
            title="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Block Type Label */}
      {!isPreviewMode && (
        <div className="absolute -top-1 -left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          {block.type}
        </div>
      )}
    </div>
  );
};

export default SortableBlock;

