import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { BlockTemplate } from '@/types/page-editor';

interface BlockPaletteProps {
  templates: BlockTemplate[];
}

interface DraggableBlockTemplateProps {
  template: BlockTemplate;
}

const DraggableBlockTemplate: React.FC<DraggableBlockTemplateProps> = ({ template }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template-${template.type}`,
    data: {
      type: 'template',
      template
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{template.icon}</span>
          <div>
            <h3 className="font-medium text-sm">{template.label}</h3>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BlockPalette: React.FC<BlockPaletteProps> = ({ templates }) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Блоки</h2>
      <div className="space-y-3">
        {templates.map((template) => (
          <DraggableBlockTemplate key={template.type} template={template} />
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Подсказка</h3>
        <p className="text-xs text-blue-700">
          Перетащите блок в рабочую область для добавления на страницу
        </p>
      </div>
    </div>
  );
};

export default BlockPalette;

