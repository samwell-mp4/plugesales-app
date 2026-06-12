import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon, RemoveFormatting,
  Save, X
} from 'lucide-react';

interface WysiwygEditorProps {
  html: string;
  onSave: (html: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

function ToolbarButton({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={active ? {
        backgroundColor: 'rgba(172, 248, 0, 0.15)',
        color: '#acf800',
        borderColor: 'rgba(172, 248, 0, 0.3)',
      } : {
        backgroundColor: 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.6)',
        borderColor: 'transparent',
      }}
      className="p-1.5 rounded-lg border transition-all hover:bg-white/10"
    >
      {children}
    </button>
  );
}

export default function WysiwygEditor({ html, onSave, onCancel, placeholder }: WysiwygEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary-color underline' },
      }),
      Placeholder.configure({ placeholder: placeholder || 'Digite seu texto aqui...' }),
    ],
    content: html || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none outline-none min-h-[150px] text-white/80 text-sm leading-relaxed',
      },
    },
  });

  const handleSave = useCallback(() => {
    if (editor) onSave(editor.getHTML());
  }, [editor, onSave]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL do link:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-primary-color/30 bg-[#0a0a1a] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-color">Editor de Texto</span>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-colors">
            <Save size={12} /> Salvar
          </button>
          <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-bold hover:bg-white/10 transition-colors">
            <X size={12} /> Cancelar
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-black/20 flex-wrap">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico">
          <Italic size={15} />
        </ToolbarButton>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Título 1">
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título 2">
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Título 3">
          <Heading3 size={15} />
        </ToolbarButton>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista Ordenada">
          <ListOrdered size={15} />
        </ToolbarButton>
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Link">
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Limpar formatação">
          <RemoveFormatting size={15} />
        </ToolbarButton>
      </div>

      <div className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <style>{`
          .ProseMirror p.is-editor-empty:first-child::before {
            color: rgba(255,255,255,0.2);
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
          .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
          .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; color: #e0e0e0; margin-bottom: 0.4rem; }
          .ProseMirror h3 { font-size: 1.1rem; font-weight: 600; color: #ccc; margin-bottom: 0.3rem; }
          .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
          .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
          .ProseMirror li { margin-bottom: 0.25rem; }
          .ProseMirror a { color: #acf800; text-decoration: underline; }
          .ProseMirror blockquote { border-left: 3px solid #acf800; padding-left: 1rem; color: rgba(255,255,255,0.5); font-style: italic; }
          .ProseMirror code { background: rgba(255,255,255,0.08); border-radius: 4px; padding: 0.15rem 0.4rem; font-size: 0.85em; }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
