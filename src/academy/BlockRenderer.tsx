import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Info, CheckCircle2, Image as ImageIcon,
  Upload, MessageSquare, Calendar, Play, DollarSign,
  Layout, Link, Smartphone, Target, Eye, XCircle,
  Activity, UserPlus, BarChart, RefreshCw, ShieldCheck,
  CheckCheck, FileText, AlertTriangle, ArrowRight, X,
} from 'lucide-react';
import type { AcademyBlock } from './types';

function ExpandableImage({ src, alt, caption, className, imgStyle }: {
  src: string; alt: string; caption?: string;
  className?: string; imgStyle?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [open]);

  if (!src || !src.trim()) return null;

  return (
    <>
      <img
        src={src} alt={alt}
        className={className}
        style={{ cursor: 'pointer', ...imgStyle }}
        onClick={() => setOpen(true)}
      />

      {open && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '100%', padding: '40px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src} alt={alt}
              style={{
                maxWidth: '100%', maxHeight: '100%',
                objectFit: 'contain', borderRadius: '8px',
                userSelect: 'none', pointerEvents: 'none',
              }}
            />
          </div>

          <button
            style={{
              position: 'fixed', top: '20px', right: '20px',
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(12px)', zIndex: 10001,
            }}
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="hover:bg-white/15 transition-colors"
          >
            <X size={18} />
          </button>

          {caption && (
            <div
              style={{
                position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center',
                padding: '8px 20px', borderRadius: '10px',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                maxWidth: '80vw', zIndex: 10001,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {caption}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

const ArticleImage = ({ src, caption }: { src?: string; caption: string }) => {
  if (src && src.trim()) {
    return (
      <div className="my-8">
        <div className="w-full rounded-2xl overflow-hidden border border-white/10" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <ExpandableImage src={src} alt={caption} className="w-full h-auto object-contain max-h-[500px]" imgStyle={{ display: 'block' }} />
          {caption && <p className="text-white/40 text-xs italic text-center py-3 px-4">{caption}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="my-8">
      <div style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.2))', height: '18rem', borderColor: 'rgba(255,255,255,0.1)' }} className="w-full border rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-colors">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.05), transparent)', opacity: 0.5 }}></div>
        <ImageIcon size={48} className="text-white/20 mb-3" />
        <span className="text-white/40 text-sm italic z-10 px-6 text-center">[{caption}]</span>
      </div>
    </div>
  );
};

const AlertBox = ({ type, title, children }: { type: 'warning' | 'info' | 'success', title: string, children: React.ReactNode }) => {
  const colors = {
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    success: 'bg-green-500/10 border-green-500/30 text-green-400'
  };
  const icons = { warning: <AlertCircle size={20} />, info: <Info size={20} />, success: <CheckCircle2 size={20} /> };
  return (
    <div className={`flex gap-4 p-5 rounded-xl border ${colors[type]} my-6 backdrop-blur-md`}>
      <div className="mt-0.5 shrink-0">{icons[type]}</div>
      <div>
        <h4 className="font-bold mb-1 text-white">{title}</h4>
        <div className="text-sm opacity-90 leading-relaxed text-white/80" dangerouslySetInnerHTML={{ __html: children as string }} />
      </div>
    </div>
  );
};

const getIcon = (name: string, size: number = 22, _color?: string) => {
  const icons: Record<string, React.ReactNode> = {
    Upload: <Upload size={size} />, MessageSquare: <MessageSquare size={size} />,
    Calendar: <Calendar size={size} />, Play: <Play size={size} />,
    DollarSign: <DollarSign size={size} />, Layout: <Layout size={size} />,
    Link: <Link size={size} />, Smartphone: <Smartphone size={size} />,
    Target: <Target size={size} />, Eye: <Eye size={size} />,
    XCircle: <XCircle size={size} />, Activity: <Activity size={size} />,
    UserPlus: <UserPlus size={size} />, BarChart: <BarChart size={size} />,
    RefreshCw: <RefreshCw size={size} />, ShieldCheck: <ShieldCheck size={size} />,
    CheckCheck: <CheckCheck size={size} />, FileText: <FileText size={size} />,
    AlertTriangle: <AlertTriangle size={size} />, CheckCircle: <CheckCircle2 size={size} />,
    AlertCircle: <AlertCircle size={size} />, Info: <Info size={size} />,
  };
  return icons[name] || <FileText size={size} />;
};

const iconGradients: Record<string, string> = {
  Upload: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
  MessageSquare: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
  Calendar: 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400',
  Play: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
  AlertTriangle: 'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400',
  BarChart: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  DollarSign: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
  UserPlus: 'from-pink-500/20 to-pink-500/5 border-pink-500/20 text-pink-400',
  Layout: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
  FileText: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
  Link: 'from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400',
  Smartphone: 'from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400',
  Activity: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
  ShieldCheck: 'from-slate-500/20 to-slate-500/5 border-slate-500/20 text-slate-400',
  Target: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400',
  RefreshCw: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
  Users: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  BarChart3: 'from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400',
};

function BlockRenderer({ block }: { block: AcademyBlock }) {
  const c = block.content;

  switch (block.type) {
    case 'paragraph':
      return <p className="text-white/70 text-lg leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: c.html }} />;

    case 'heading':
      const slug = c.text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return (
        <h3 id={slug} className="group text-xl font-bold text-white mt-8 mb-4 relative">
          <a
            href={`#${slug}`}
            onClick={(e) => { e.preventDefault(); window.history.replaceState(null, '', `#${slug}`); }}
            className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 hover:opacity-70 transition-all duration-200 text-white/50 no-underline text-base leading-none p-0.5 select-none"
            aria-label={`Âncora para ${c.text}`}
          >
            #
          </a>
          {c.text}
        </h3>
      );

    case 'alert':
      return (
        <AlertBox type={c.variant} title={c.title}>
          {c.text}
        </AlertBox>
      );

    case 'steps':
      return (
        <ol className="list-decimal list-outside ml-5 text-white/70 space-y-4 my-6">
          {(c.items as any[]).map((item: any, i: number) => {
            const html = typeof item === 'string' ? item : item.html;
            const img = typeof item === 'object' ? item.image : null;
            return (
              <li key={i} className="leading-relaxed">
                <span dangerouslySetInnerHTML={{ __html: html }} />
                  {img && img.src && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-white/5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <ExpandableImage src={img.src} alt={img.caption || ''} className="w-full h-auto object-contain max-h-[400px]" imgStyle={{ display: 'block' }} />
                    {img.caption && <p className="text-white/30 text-[10px] italic text-center py-1.5 px-3">{img.caption}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      );

    case 'image':
      return <ArticleImage src={c.src} caption={c.caption} />;

    case 'list':
      return (
        <div className="my-6">
          {c.heading && <p className="text-white/60 mb-4" dangerouslySetInnerHTML={{ __html: c.heading }} />}
          <ul className="list-disc list-outside ml-5 text-white/70 space-y-2">
            {(c.items as any[]).map((item: any, i: number) => {
              const html = typeof item === 'string' ? item : item.html;
              const img = typeof item === 'object' ? item.image : null;
              return (
                <li key={i} className="leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: html }} />
                  {img && img.src && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <ExpandableImage src={img.src} alt={img.caption || ''} className="w-full h-auto object-contain max-h-[400px]" imgStyle={{ display: 'block' }} />
                      {img.caption && <p className="text-white/30 text-[10px] italic text-center py-1.5 px-3">{img.caption}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      );

    case 'card':
      return (
        <div className="grid gap-4 my-6">
          {(c.items as any[]).map((item: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className={'text-' + (item.title.includes('Vermelho') ? 'red' : item.title.includes('Amarelo') ? 'yellow' : 'green') + '-400'}>
                  {getIcon(item.icon, 18)}
                </span>
                <h4 className="font-bold text-white">{item.title}</h4>
              </div>
              <p className="text-white/60 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      );

    case 'troubleshooting':
      return (
        <div className="grid gap-4 my-8">
          {(c.items as any[]).map((item: any, i: number) => (
            <div key={i} className={`${item.type === 'error' ? 'bg-red-500/5 border-red-500/20' : 'bg-yellow-500/5 border-yellow-500/20'} border rounded-xl p-5`}>
              <div className="flex items-start gap-4">
                {item.type === 'error' ? <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" /> : <AlertCircle size={20} className="text-yellow-400 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'role-cards':
      return (
        <div className="grid gap-3 my-6">
          {(c.roles as any[]).map((r: any, i: number) => {
            const colors: Record<string, string> = {
              ADMIN: 'text-red-400 border-red-500/20 bg-red-500/5',
              EMPLOYEE: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
              CONTABILIDADE: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
              VENDEDOR: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
              CLIENT: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
            };
            return (
              <div key={i} className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${colors[r.role] || 'text-white/60 border-white/10 bg-white/5'}`}>
                <span className="font-mono font-bold text-xs tracking-wider shrink-0">{r.role}</span>
                <span className="text-white/60 text-sm">{r.desc}</span>
              </div>
            );
          })}
        </div>
      );

    case 'stage-list':
      return (
        <div className="grid gap-3 my-6">
          {(c.stages as string[]).map((stage: string, i: number) => {
            const stageColors: Record<string, string> = {
              'Lead Entrou': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
              'Contato Inicial': 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
              'Reunião Agendada': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
              'Proposta Enviada': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
              'Fechado': 'bg-green-500/20 border-green-500/30 text-green-400',
            };
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${stageColors[stage] || 'bg-white/5 border-white/10 text-white/60'}`}>
                <ArrowRight size={16} />
                <span className="font-bold text-sm">{stage}</span>
              </div>
            );
          })}
        </div>
      );

    case 'divider':
      return <div className="border-t border-white/5 my-8"></div>;

    default:
      return null;
  }
}

export default BlockRenderer;
