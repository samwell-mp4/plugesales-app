import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  DragDropContext, Droppable, Draggable,
} from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import {
  GripVertical, Plus, Trash2, Save, Eye, Edit3, X,
  FileText, AlertCircle, ListOrdered, Image as ImageIcon,
  Heading1, List, LayoutGrid, Bug, Shield, GitBranch,
  SeparatorHorizontal, Layers, Minimize2, ChevronUp, ChevronDown,
} from 'lucide-react';
import BlockRenderer from './BlockRenderer';
import WysiwygEditor from './WysiwygEditor';
import StepsEditor from './StepsEditor';
import ListEditor from './ListEditor';
import type { AcademyBlock, BlockType } from './types';

const STORAGE_KEY_PREFIX = 'academy_blocks_';

const BLOCK_PALETTE: { type: BlockType; label: string; icon: React.ReactNode; defaultContent: Record<string, any> }[] = [
  { type: 'paragraph', label: 'Parágrafo', icon: <FileText size={14} />, defaultContent: { html: 'Digite seu texto aqui...' } },
  { type: 'heading', label: 'Título', icon: <Heading1 size={14} />, defaultContent: { text: 'Novo Título' } },
  { type: 'alert', label: 'Alerta', icon: <AlertCircle size={14} />, defaultContent: { variant: 'info', title: 'Atenção', text: 'Mensagem de alerta...' } },
  { type: 'steps', label: 'Passo a Passo', icon: <ListOrdered size={14} />, defaultContent: { items: ['Passo 1', 'Passo 2', 'Passo 3'] } },
  { type: 'image', label: 'Imagem', icon: <ImageIcon size={14} />, defaultContent: { src: '', caption: 'Descrição da imagem' } },
  { type: 'list', label: 'Lista', icon: <List size={14} />, defaultContent: { items: ['Item 1', 'Item 2', 'Item 3'], heading: '' } },
  { type: 'card', label: 'Card', icon: <LayoutGrid size={14} />, defaultContent: { items: [{ title: 'Título', text: 'Descrição', icon: 'FileText' }] } },
  { type: 'troubleshooting', label: 'Erro/Solução', icon: <Bug size={14} />, defaultContent: { items: [{ title: 'Erro', text: 'Solução...', type: 'error' }] } },
  { type: 'role-cards', label: 'Perfis', icon: <Shield size={14} />, defaultContent: { roles: [{ role: 'PERFIL', desc: 'Descrição' }] } },
  { type: 'stage-list', label: 'Etapas', icon: <GitBranch size={14} />, defaultContent: { stages: ['Etapa 1', 'Etapa 2'] } },
  { type: 'divider', label: 'Divisor', icon: <SeparatorHorizontal size={14} />, defaultContent: {} },
];

const BLOCK_LABELS: Record<string, string> = {
  paragraph: 'Parágrafo', heading: 'Título', alert: 'Alerta',
  steps: 'Passo a Passo', image: 'Imagem', list: 'Lista',
  card: 'Card', troubleshooting: 'Erro/Solução',
  'role-cards': 'Perfis', 'stage-list': 'Etapas', divider: 'Divisor',
};

function getContentPreview(block: AcademyBlock): string {
  const c = block.content;
  switch (block.type) {
    case 'paragraph': return (c.html || '').replace(/<[^>]+>/g, '').slice(0, 40);
    case 'heading': return c.text || '';
    case 'alert': return c.title || '';
    case 'steps': return `${(c.items || []).length} passos`;
    case 'image': return c.src ? c.caption || '📷' : '📷 ' + (c.caption || '');
    case 'list': return `${(c.items || []).length} itens`;
    case 'card': return `${(c.items || []).length} cards`;
    case 'troubleshooting': return `${(c.items || []).length} itens`;
    case 'role-cards': return `${(c.roles || []).length} perfis`;
    case 'stage-list': return `${(c.stages || []).length} etapas`;
    case 'divider': return '─';
    default: return '';
  }
}

function ImageBlockEditor({ block, onSave, onCancel }: { block: AcademyBlock; onSave: (content: any) => void; onCancel: () => void }) {
  const [src, setSrc] = useState(block.content.src || '');
  const [caption, setCaption] = useState(block.content.caption || '');

  const handleSave = () => {
    onSave({ src: src.trim(), caption: caption.trim() });
  };

  return (
    <div className="p-4 rounded-xl border border-primary-color/30 bg-[#0a0a1a]" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-color">Imagem</span>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-colors">
            <Save size={12} /> Salvar
          </button>
          <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-bold hover:bg-white/10 transition-colors">
            <X size={12} /> Cancelar
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wider">URL da Imagem</label>
          <input
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            placeholder="https://exemplo.com/imagem.png"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white/80 text-sm outline-none focus:border-primary-color/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wider">Legenda</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Descrição da imagem"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white/80 text-sm outline-none focus:border-primary-color/50 transition-colors"
          />
        </div>
      </div>
      {src && src.trim() && (
        <div className="mt-3 rounded-lg overflow-hidden border border-white/10" style={{ background: 'rgba(0,0,0,0.3)', maxHeight: '200px' }}>
          <img src={src.trim()} alt={caption} className="w-full h-auto object-contain" style={{ maxHeight: '200px' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}

function InsertButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full h-7 my-0.5 opacity-0 hover:opacity-100 transition-opacity group relative"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px bg-white/5 group-hover:bg-primary-color/50 transition-colors"></div>
      </div>
      <div className="relative z-10 w-5 h-5 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center group-hover:border-primary-color/50 group-hover:bg-primary-color/10 transition-all">
        <Plus size={10} className="text-white/40 group-hover:text-primary-color transition-colors" />
      </div>
    </button>
  );
}

function JsonEditor({ block, onSave, onCancel }: { block: AcademyBlock; onSave: (content: any) => void; onCancel: () => void }) {
  const [content, setContent] = useState(JSON.stringify(block.content, null, 2));
  useEffect(() => { setContent(JSON.stringify(block.content, null, 2)); }, [block.content]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(content);
      onSave(parsed);
    } catch {}
  };

  return (
    <div className="p-4 rounded-xl border border-primary-color/30 bg-[#0a0a1a]" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-color">{block.type}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-colors">
            <Save size={12} /> Salvar
          </button>
          <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-bold hover:bg-white/10 transition-colors">
            <X size={12} /> Cancelar
          </button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white/80 text-xs font-mono leading-relaxed resize-y focus:outline-none focus:border-primary-color/50" style={{ height: 'auto', minHeight: '300px' }}
        spellCheck={false}
      />
    </div>
  );
}

export default function AcademyEditor({
  articleId, blocks: initialBlocks, onBlocksChange, onClose,
}: {
  articleId: string; blocks: AcademyBlock[]; onBlocksChange: (blocks: AcademyBlock[]) => void; onClose: () => void;
}) {
  const [blocks, setBlocks] = useState<AcademyBlock[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + articleId);
    if (saved) {
      try {
        const parsed: AcademyBlock[] = JSON.parse(saved);
        const savedIds = new Set(parsed.map(b => b.id));
        const missing = initialBlocks.filter(b => !savedIds.has(b.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem(STORAGE_KEY_PREFIX + articleId, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch {}
    }
    return initialBlocks;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const persist = useCallback((newBlocks: AcademyBlock[]) => {
    setBlocks(newBlocks);
    localStorage.setItem(STORAGE_KEY_PREFIX + articleId, JSON.stringify(newBlocks));
    onBlocksChange(newBlocks);
  }, [articleId, onBlocksChange]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(blocks);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    persist(items);
  }, [blocks, persist]);

  const addBlock = useCallback((type: BlockType, defaultContent: Record<string, any>, index?: number) => {
    const paletteItem = BLOCK_PALETTE.find(b => b.type === type);
    const newBlock: AcademyBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      content: { ...(paletteItem?.defaultContent || defaultContent) },
    };
    const insertAt = index ?? blocks.length;
    const newBlocks = [...blocks];
    newBlocks.splice(insertAt, 0, newBlock);
    persist(newBlocks);
    setInsertIndex(null);
    setSelectedId(newBlock.id);
  }, [blocks, persist]);

  const deleteBlock = useCallback((id: string) => {
    persist(blocks.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [blocks, persist, selectedId]);

  const moveBlock = useCallback((index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    persist(newBlocks);
  }, [blocks, persist]);

  const editBlockContent = useCallback((id: string, content: any) => {
    persist(blocks.map(b => b.id === id ? { ...b, content } : b));
  }, [blocks, persist]);

  const resetBlocks = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + articleId);
    setBlocks(initialBlocks);
    onBlocksChange(initialBlocks);
  }, [articleId, initialBlocks, onBlocksChange]);

  useEffect(() => {
    if (selectedId && previewRef.current) {
      const el = previewRef.current.querySelector(`[data-block-id="${selectedId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId]);

  return (
    <>
      <div className="flex items-center justify-between mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-color/20 text-primary-color">
            <Eye size={18} />
          </div>
          <div>
            <span className="text-white font-bold text-sm">Modo Editor</span>
            <p className="text-white/40 text-xs">Camadas • Arraste para reordenar</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setInsertIndex(blocks.length)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, rgba(172,248,0,0.25), rgba(172,248,0,0.08))', color: '#acf800', border: '1px solid rgba(172,248,0,0.3)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(172,248,0,0.35), rgba(172,248,0,0.12))'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(172,248,0,0.25), rgba(172,248,0,0.08))'}
          >
            <Plus size={14} /> Bloco
          </button>
          <button onClick={() => setLayersOpen(!layersOpen)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${layersOpen ? 'bg-white/10 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
            <Layers size={14} />
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 text-white/60 text-sm font-bold hover:bg-white/10 transition-colors">
            Visualizar
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl border border-white/10" style={{ minHeight: '500px' }}>
        {/* Backdrop when layers open */}
        {layersOpen && (
          <div
            className="absolute inset-0 z-20 bg-black/40"
            onClick={() => setLayersOpen(false)}
          />
        )}

        {/* Content preview - full width */}
        <div className="flex flex-col">

          <div ref={previewRef} className="p-8">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-white/30">
                <FileText size={56} className="mb-4 opacity-20" />
                <p className="text-lg font-bold text-white/50 mb-1">Nenhum bloco ainda</p>
                <p className="text-sm text-white/30 mb-6">Clique no botão <strong className="text-primary-color">+</strong> acima ou no painel de camadas para adicionar</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {BLOCK_PALETTE.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => addBlock(item.type, item.defaultContent, 0)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-medium hover:bg-primary-color/20 hover:text-primary-color hover:border-primary-color/30 transition-all"
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
              {insertIndex === 0 && (
                <div className="mx-6 mb-4 p-3 rounded-xl border border-primary-color/30 bg-primary-color/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary-color">Inserir no início</p>
                    <button onClick={() => setInsertIndex(null)} className="p-1 text-white/30 hover:text-white/60 transition-colors"><X size={14} /></button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {BLOCK_PALETTE.map((item) => (
                      <button key={item.type} onClick={() => addBlock(item.type, item.defaultContent, 0)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium hover:bg-primary-color/20 hover:text-primary-color hover:border-primary-color/30 transition-all"
                      >{item.icon} {item.label}</button>
                    ))}
                  </div>
                </div>
              )}
              {blocks.map((block, index) => (
                <React.Fragment key={block.id}>
                <div data-block-id={block.id}>
                  <div
                    className={`transition-all duration-200 rounded-xl ${
                      selectedId === block.id && editingId !== block.id
                        ? 'ring-2 ring-primary-color/50 ring-offset-2 ring-offset-transparent'
                        : editingId !== block.id ? 'hover:ring-1 hover:ring-white/10' : ''
                    }`}
                    style={editingId !== block.id ? { padding: '0.5rem 1.5rem' } : {}}
                  >
                    {editingId === block.id ? (
                      block.type === 'image' ? (
                        <ImageBlockEditor
                          block={block}
                          onSave={(content) => { editBlockContent(block.id, content); setEditingId(null); }}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : block.type === 'paragraph' ? (
                        <WysiwygEditor
                          html={block.content.html || ''}
                          onSave={(html) => { editBlockContent(block.id, { html }); setEditingId(null); }}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : block.type === 'steps' ? (
                        <StepsEditor
                          items={block.content.items || []}
                          onSave={(items) => { editBlockContent(block.id, { items }); setEditingId(null); }}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : block.type === 'list' ? (
                        <ListEditor
                          content={{ heading: block.content.heading, items: block.content.items || [] }}
                          onSave={(content) => { editBlockContent(block.id, content); setEditingId(null); }}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <JsonEditor
                          block={block}
                          onSave={(content) => { editBlockContent(block.id, content); setEditingId(null); }}
                          onCancel={() => setEditingId(null)}
                        />
                      )
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0" onClick={() => { setSelectedId(block.id); setEditingId(block.id); }}>
                          <div className="flex items-start gap-2">
                            <span className="text-[9px] font-mono text-white/20 mt-1 shrink-0 leading-none select-none">{String(index + 1).padStart(2, '0')}</span>
                            <div className="flex-1 min-w-0">
                              <BlockRenderer block={block} />
                            </div>
                          </div>
                        </div>
                        {selectedId === block.id && (
                          <div className="flex flex-col gap-1 shrink-0 pt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); moveBlock(index, -1); }}
                              className="p-1 rounded-lg bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                              disabled={index === 0}
                              title="Mover para cima"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); moveBlock(index, 1); }}
                              className="p-1 rounded-lg bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                              disabled={index === blocks.length - 1}
                              title="Mover para baixo"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <div className="w-full h-px bg-white/10 my-0.5" />
                            <button
                              onClick={(e) => { e.stopPropagation(); setInsertIndex(index + 1); }}
                              className="p-1 rounded-lg bg-white/5 text-white/30 hover:text-primary-color hover:bg-primary-color/15 transition-all"
                              title="Adicionar bloco abaixo"
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                              className="p-1 rounded-lg bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/15 transition-all"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {insertIndex === index + 1 && (
                  <div className="mx-6 mb-4 p-3 rounded-xl border border-primary-color/30 bg-primary-color/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary-color">Inserir abaixo</p>
                      <button onClick={() => setInsertIndex(null)} className="p-1 text-white/30 hover:text-white/60 transition-colors"><X size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {BLOCK_PALETTE.map((item) => (
                        <button key={item.type} onClick={() => addBlock(item.type, item.defaultContent, insertIndex)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium hover:bg-primary-color/20 hover:text-primary-color hover:border-primary-color/30 transition-all"
                        >{item.icon} {item.label}</button>
                      ))}
                    </div>
                  </div>
                )}
                </React.Fragment>
              ))}
            </>
            )}
          </div>
        </div>

      </div>

    {layersOpen && createPortal(
      <div className="fixed inset-0" style={{ pointerEvents: 'none', zIndex: 10000 }}>
        <div
          className="absolute inset-0"
          style={{ pointerEvents: 'auto', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setLayersOpen(false)}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-80 flex flex-col shadow-2xl"
          style={{
            pointerEvents: 'auto',
            background: '#07080c',
            borderLeft: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="px-3 py-2.5 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(172,248,0,0.2)' }}>
                <Layers size={11} className="text-primary-color" />
              </div>
              <p className="text-xs font-bold tracking-wider text-white">Camadas</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-white/20 font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>{blocks.length}</span>
              <button onClick={() => setLayersOpen(false)} className="p-1 text-white/40 hover:text-white transition-colors rounded hover:bg-white/10" title="Fechar"><X size={12} /></button>
            </div>
          </div>
          <div className="overflow-y-auto px-1.5 py-1" style={{ height: 'calc(100vh - 56px)' }}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="blocks">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-0">
                    <InsertButton onClick={() => setInsertIndex(0)} />
                    {blocks.map((block, index) => (
                      <React.Fragment key={block.id}>
                        <Draggable draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`group flex items-center gap-1 px-1.5 py-1 rounded-md cursor-pointer transition-all ${
                                selectedId === block.id
                                  ? 'bg-primary-color/10 border border-primary-color/20'
                                  : 'hover:bg-white/[0.03] border border-transparent'
                              } ${snapshot.isDragging ? 'shadow-md z-50' : ''}`}
                              onClick={() => setSelectedId(block.id)}
                              style={{ ...provided.draggableProps.style, backgroundColor: snapshot.isDragging ? '#14141f' : undefined }}
                            >
                              <div {...provided.dragHandleProps} className="text-white/15 hover:text-white/40 transition-colors cursor-grab active:cursor-grabbing shrink-0">
                                <GripVertical size={10} />
                              </div>
                              <span className="w-3.5 text-[8px] font-mono text-white/20 text-center shrink-0">{index + 1}</span>
                              <div className="w-4 h-4 rounded bg-white/[0.06] flex items-center justify-center shrink-0 text-white/30">
                                {BLOCK_PALETTE.find(p => p.type === block.type)?.icon || <FileText size={8} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium text-white/60 truncate leading-tight">{BLOCK_LABELS[block.type] || block.type}</p>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingId(block.id); }}
                                className="p-0.5 text-blue-400/50 hover:text-blue-400 transition-colors rounded hover:bg-white/5"
                                title="Editar"
                              ><Edit3 size={8} /></button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                                className="p-0.5 text-red-400/40 hover:text-red-400 transition-colors rounded hover:bg-white/5"
                                title="Excluir"
                              ><Trash2 size={8} /></button>
                            </div>
                          )}
                        </Draggable>
                        <InsertButton onClick={() => setInsertIndex(index + 1)} />
                      </React.Fragment>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>,
      document.body
    )}
  </>);
}
