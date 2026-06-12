import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon, Plus, Trash2, Save, X, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';

interface StepImage {
  src: string;
  caption: string;
}

interface StepItem {
  html: string;
  image?: StepImage;
  _key?: string;
}

let stepKeyCounter = 0;
function makeStepKey(): string { return `step_${++stepKeyCounter}`; }

interface StepsEditorProps {
  items: string[];
  onSave: (items: string[]) => void;
  onCancel: () => void;
}

function normalizeItems(items: string[]): StepItem[] {
  return items.map(item => {
    if (typeof item === 'string') return { html: item };
    return item;
  });
}

function denormalizeItems(items: StepItem[]): string[] {
  return items.map(item => {
    if (!item.image || !item.image.src.trim()) return item.html;
    return item as any;
  });
}

function StepEditor({ html, onChange }: { html: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary-color underline' } }),
    ],
    content: html || '',
    editorProps: {
      attributes: { class: 'outline-none text-white/80 text-sm leading-relaxed min-h-[2.5rem]' },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL do link:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="bg-black/30 border border-white/10 rounded-lg overflow-hidden focus-within:border-primary-color/50 transition-colors flex-1">
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-white/5 bg-black/20">
        <button onClick={(e) => { e.stopPropagation(); editor.chain().focus().toggleBold().run(); }}
          style={editor.isActive('bold') ? { color: '#acf800', backgroundColor: 'rgba(172,248,0,0.12)' } : { color: 'rgba(255,255,255,0.4)' }}
          className="p-1 rounded hover:bg-white/5 transition-colors" title="Negrito"><Bold size={13} /></button>
        <button onClick={(e) => { e.stopPropagation(); editor.chain().focus().toggleItalic().run(); }}
          style={editor.isActive('italic') ? { color: '#acf800', backgroundColor: 'rgba(172,248,0,0.12)' } : { color: 'rgba(255,255,255,0.4)' }}
          className="p-1 rounded hover:bg-white/5 transition-colors" title="Itálico"><Italic size={13} /></button>
        <div className="w-px h-4 bg-white/10 mx-0.5" />
        <button onClick={(e) => { e.stopPropagation(); setLink(); }}
          style={editor.isActive('link') ? { color: '#acf800', backgroundColor: 'rgba(172,248,0,0.12)' } : { color: 'rgba(255,255,255,0.4)' }}
          className="p-1 rounded hover:bg-white/5 transition-colors" title="Link"><LinkIcon size={13} /></button>
      </div>
      <div className="px-3 py-1.5"><EditorContent editor={editor} /></div>
    </div>
  );
}

function StepImageEditor({ image, onChange }: { image?: StepImage; onChange: (img: StepImage | undefined) => void }) {
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

export default function StepsEditor({ items, onSave, onCancel }: StepsEditorProps) {
  const [stepList, setStepList] = useState<StepItem[]>(() => normalizeItems(items && items.length ? items : ['']).map(s => ({ ...s, _key: makeStepKey() })));

  const updateStepHtml = useCallback((index: number, html: string) => {
    setStepList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], html };
      return next;
    });
  }, []);

  const updateStepImage = useCallback((index: number, image: StepImage | undefined) => {
    setStepList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], image };
      return next;
    });
  }, []);

  const addStep = useCallback(() => {
    setStepList(prev => [...prev, { html: '', _key: makeStepKey() }]);
  }, []);

  const removeStep = useCallback((index: number) => {
    setStepList(prev => prev.filter((_, i) => i !== index));
  }, []);

  const moveStep = useCallback((index: number, direction: -1 | 1) => {
    setStepList(prev => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  return (
    <div onClick={(e) => e.stopPropagation()} className="p-4 rounded-xl border border-primary-color/30 bg-[#0a0a1a]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-color">Passo a Passo</span>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); addStep(); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-bold hover:bg-white/10 transition-colors">
            <Plus size={12} /> Adicionar Passo
          </button>
          <button onClick={(e) => { e.stopPropagation(); onSave(denormalizeItems(stepList.map(({ _key, ...rest }) => rest))); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-colors">
            <Save size={12} /> Salvar
          </button>
          <button onClick={(e) => { e.stopPropagation(); onCancel(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-bold hover:bg-white/10 transition-colors">
            <X size={12} /> Cancelar
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {stepList.map((step, i) => (
          <div key={step._key} className="flex items-start gap-2">
            <div className="flex flex-col items-center gap-0.5 pt-1.5 shrink-0">
              <button onClick={(e) => { e.stopPropagation(); moveStep(i, -1); }}
                disabled={i === 0}
                className="p-0.5 text-white/20 hover:text-white/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                title="Mover para cima"><ChevronUp size={12} /></button>
              <span className="w-6 h-6 rounded-full bg-primary-color/20 text-primary-color text-xs font-bold flex items-center justify-center">{i + 1}</span>
              <button onClick={(e) => { e.stopPropagation(); moveStep(i, 1); }}
                disabled={i === stepList.length - 1}
                className="p-0.5 text-white/20 hover:text-white/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                title="Mover para baixo"><ChevronDown size={12} /></button>
            </div>
            <div className="flex-1 min-w-0">
              <StepEditor html={step.html} onChange={(html) => updateStepHtml(i, html)} />
              <StepImageEditor image={step.image} onChange={(img) => updateStepImage(i, img)} />
            </div>
            {stepList.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); removeStep(i); }} className="flex-shrink-0 mt-1.5 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Remover passo">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
