import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const ToolbarButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Button type="button" variant="outline" size="sm" onClick={onClick} className="h-8 px-2">
    {label}
  </Button>
);

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const applyBlock = (tag: 'H1' | 'H2' | 'P') => {
    document.execCommand('formatBlock', false, tag);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = prompt('Введите URL');
    if (!url) return;
    exec('createLink', url);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        <ToolbarButton label="H1" onClick={() => applyBlock('H1')} />
        <ToolbarButton label="H2" onClick={() => applyBlock('H2')} />
        <ToolbarButton label="П" onClick={() => applyBlock('P')} />
        <ToolbarButton label="B" onClick={() => exec('bold')} />
        <ToolbarButton label="I" onClick={() => exec('italic')} />
        <ToolbarButton label="U" onClick={() => exec('underline')} />
        <ToolbarButton label="Список" onClick={() => exec('insertUnorderedList')} />
        <ToolbarButton label="Нум." onClick={() => exec('insertOrderedList')} />
        <ToolbarButton label="Ссылка" onClick={insertLink} />
        <ToolbarButton label="Очистить" onClick={() => exec('removeFormat')} />
      </div>
      <div
        ref={editorRef}
        className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 prose prose-sm max-w-none"
        contentEditable
        onInput={() => {
          if (editorRef.current) onChange(editorRef.current.innerHTML);
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}



