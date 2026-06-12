import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon, Plus, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';

interface ListImage {
  src: string;
  caption: string;
}

interface ListItem {
  html: string;
  image?: ListImage;
}

interface ListEditorProps {
  content: { heading?: string; items: string[] };
  onSave: (content: { heading?: string; items: string[] }) => void;
  onCancel: () => void;
}

function normalizeItems(items: string[]): ListItem[] {
  return items.map(item => {
    if (typeof item === 'string') return { html: item };
    return item;
  });
}

function denormalizeItems(items: ListItem[]): string[] {
  return items.map(item => {
    if (!item.image || !item.image.src.trim()) return item.html;
    return item as any;
  });
}

function ItemEditor({ html, onChange }: { html: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary-color underline' } }),
    ],
    content: html || '',
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
    editorProps: {
      attributes: { class: 'outline-none text-white/80 text-sm leading-relaxed min-h-[2.5rem]' },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-white/5 bg-black/20">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded transition-all ${editor.isActive('bold') ? 'bg-primary-color/15 text-primary-color' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`} title="Negrito"><Bold size={12} /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded transition-all ${editor.isActive('italic') ? 'bg-primary-color/15 text-primary-color' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`} title="Itálico"><Italic size={12} /></button>
        <button onClick={() => {
          const url = window.prompt('URL do link:', editor.getAttributes('link').href || 'https://');
          if (url === null) return;
          if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }} className={`p-1 rounded transition-all ${editor.isActive('link') ? 'bg-primary-color/15 text-primary-color' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`} title="Link"><LinkIcon size={12} /></button>
      </div>
      <div className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ItemImageEditor({ image, onChange }: { image?: ListImage; onChange: (img: ListImage | undefined) => void }) {
  const [open, setOpen] = useState(!!(image && image.src));
  const [src, setSrc] = useState(image?.src || '');
  const [caption, setCaption] = useState(image?.caption || '');

  const apply = () => {
    if (!src.trim()) {
      onChange(undefined);
    } else {
      onChange({ src: src.trim(), caption: caption.trim() });
    }
  };

  return (
    <div className="mt-1.5">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${open ? 'bg-primary-color/20 text-primary-color' : 'bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10'}`}>
        <ImageIcon size={11} /> {image?.src ? 'Editar Imagem' : 'Adicionar Imagem'}
      </button>
      {open && (
        <div className="mt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
          <input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="URL da imagem..."
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white/70 text-xs outline-none focus:border-primary-color/50 transition-colors" />
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Legenda (opcional)"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white/70 text-xs outline-none focus:border-primary-color/50 transition-colors" />
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); apply(); }} className="px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-bold hover:bg-green-500/30 transition-colors">Aplicar</button>
            {image?.src && <button onClick={(e) => { e.stopPropagation(); setSrc(''); setCaption(''); onChange(undefined); setOpen(false); }} className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-colors">Remover</button>}
          </div>
          {src.trim() && (
            <div className="rounded-lg overflow-hidden border border-white/10 bg-black/30 max-h-[120px]">
              <img src={src.trim()} alt={caption} className="w-full h-auto object-contain max-h-[120px]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ListEditor({ content, onSave, onCancel }: ListEditorProps) {
  const [heading, setHeading] = useState(content.heading || '');
  const [list, setList] = useState<ListItem[]>(() => normalizeItems(content.items && content.items.length > 0 ? [...content.items] : ['']));

  const updateItemHtml = useCallback((index: number, html: string) => {
    setList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], html };
      return next;
    });
  }, []);

  const updateItemImage = useCallback((index: number, image: ListImage | undefined) => {
    setList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], image };
      return next;
    });
  }, []);

  const addItem = useCallback((index: number) => {
    setList(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, { html: '' });
      return next;
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setList(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  }, []);

  const handleSave = () => {
    onSave({ heading: heading.trim(), items: denormalizeItems(list.map(({ html, image }) => ({ html: html.trim() ? html : '', image }))) });
  };

  return (
    <div className="rounded-xl border border-primary-color/30 bg-[#0a0a1a] overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-color">Lista</span>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-colors">
            <Save size={12} /> Salvar
          </button>
          <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-bold hover:bg-white/10 transition-colors">
            <X size={12} /> Cancelar
          </button>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Título (opcional)</label>
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Ex: Requisitos necessários"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white/70 text-sm outline-none focus:border-primary-color/50 transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Itens da Lista ({list.length})</label>
            <button onClick={() => addItem(list.length - 1)} className="flex items-center gap-1 text-[10px] font-bold text-primary-color/70 hover:text-primary-color transition-colors">
              <Plus size={10} /> Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {list.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] font-mono text-white/20 mt-2.5 shrink-0 w-3.5 text-center">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <ItemEditor html={item.html} onChange={(html) => updateItemHtml(i, html)} />
                  <ItemImageEditor image={item.image} onChange={(img) => updateItemImage(i, img)} />
                </div>
                <button
                  onClick={() => removeItem(i)}
                  className="mt-2 p-1 rounded text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Remover item"
                  disabled={list.length <= 1}
                ><Trash2 size={10} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
