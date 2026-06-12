import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';
import {
  BookOpen, Users, Briefcase, ShieldCheck, ChevronRight,
  FileText, Upload, MessageSquare, Calendar,
  Play, DollarSign, Layout, Link, Smartphone, Target,
  Eye, XCircle, Activity, UserPlus, BarChart,
  RefreshCw, Edit3, Image as ImageIcon,
  AlertCircle, Info, CheckCircle2, Plus, Trash2, Check, X,
  ChevronUp, ChevronDown, Search, HelpCircle, ExternalLink,
} from 'lucide-react';
import articleBlocks from '../academy/data';
import BlockRenderer from '../academy/BlockRenderer';
import AcademyEditor from '../academy/AcademyEditor';
import type { AcademyBlock } from '../academy/types';

const SIDEBAR_KEY = 'academy_sidebar';

interface Article {
  id: string;
  title: string;
}

interface CategoryData {
  id: string;
  label: string;
  icon: string;
  articles: Article[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users size={18} />, Briefcase: <Briefcase size={18} />,
  BookOpen: <BookOpen size={18} />, ShieldCheck: <ShieldCheck size={18} />,
};

const DEFAULT_CATEGORIES: CategoryData[] = [
  { id: 'operacional', label: 'Funcionário / Operacional', icon: 'Users', articles: [
    { id: 'op-contatos', title: '1.1 Gerar Novo Cliente' },
    { id: 'op-contas-monitor', title: '1.2 Contas & Monitor' },
    { id: 'op-templates', title: '1.3 Criação e Aprovação de Templates' },
    { id: 'op-upload-clientes', title: '1.4 Upload Clientes' },
    { id: 'op-tratamento-planilhas', title: '1.5 Tratamento de Planilhas' },
    { id: 'op-infobip-import', title: '1.6 Importar Planilha Infobip' },
    { id: 'op-infobip-broadcast', title: '1.7 Criando Transmissão na Infobip' },
    { id: 'op-gerar-relatorios', title: '1.8 Gerar/Importar Relatórios' },
    { id: 'op-troubleshooting', title: '1.9 Erros Comuns' },
  ]},
  { id: 'financeiro', label: 'Contabilidade / Financeiro', icon: 'Briefcase', articles: [
    { id: 'fin-visao', title: '2.1 Visão Geral do Caixa' },
    { id: 'fin-vendas', title: '2.2 Gestão de Vendas' },
    { id: 'fin-pagamentos', title: '2.3 Controle de Pagamentos e Fornecedores' },
    { id: 'fin-comissoes', title: '2.4 Comissões' },
    { id: 'fin-reembolsos', title: '2.5 Reembolsos e Auditorias' },
  ]},
  { id: 'cliente', label: 'Cliente Final', icon: 'BookOpen', articles: [
    { id: 'cli-dashboard', title: '3.1 Acessando o Dashboard' },
    { id: 'cli-relatorios', title: '3.2 Lendo Relatórios de Resultados' },
    { id: 'cli-briefings', title: '3.3 Formulários e Submissões' },
    { id: 'cli-links', title: '3.4 Links, Encurtador e Rotacionador' },
    { id: 'cli-smartbio', title: '3.5 Smart Bio e Cartão Digital' },
  ]},
  { id: 'admin', label: 'Administrador (Gestão)', icon: 'ShieldCheck', articles: [
    { id: 'adm-crm', title: '4.1 CRM e Funil de Vendas' },
    { id: 'adm-fluxo', title: '4.2 Central de Fluxo de Leads' },
    { id: 'adm-consultiva', title: '4.3 Gestão Consultiva e Retenção' },
    { id: 'adm-acessos', title: '4.4 Controle de Acessos e Usuários' },
    { id: 'adm-monitor', title: '4.5 Monitoramento N8N e Plug Cards' },
  ]},
];

function loadSidebar(): CategoryData[] {
  try {
    const savedRaw = localStorage.getItem(SIDEBAR_KEY);
    if (!savedRaw) return DEFAULT_CATEGORIES;
    const saved: CategoryData[] = JSON.parse(savedRaw);
    const merged = DEFAULT_CATEGORIES.map(defCat => {
      const existingCat = saved.find(c => c.id === defCat.id);
      if (!existingCat) return defCat;
      const mergedArticles = [...existingCat.articles];
      defCat.articles.forEach((defArt, idx) => {
        if (!mergedArticles.find(a => a.id === defArt.id)) {
          mergedArticles.splice(idx, 0, defArt);
        }
      });
      return { ...existingCat, articles: mergedArticles };
    });
    saved.forEach(s => { if (!merged.find(c => c.id === s.id)) merged.push(s); });
    return merged;
  } catch {}
  return DEFAULT_CATEGORIES;
}

function makeId(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '_' + Date.now().toString(36);
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const AcademyPage = () => {
  const [menuData, setMenuData] = useState<CategoryData[]>(loadSidebar);
  const [activeTab, setActiveTab] = useState('operacional');
  const [activeArticle, setActiveArticle] = useState<string | null>('op-contatos');
  const [editMode, setEditMode] = useState(() => localStorage.getItem('academy_edit_mode') === 'true');
  const [sidebarEdit, setSidebarEdit] = useState(false);
  const [renaming, setRenaming] = useState<{ type: 'cat' | 'art'; id: string; value: string } | null>(null);
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});
  const [pendingScrollSlug, setPendingScrollSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSearchSelect = (articleId: string, slug?: string) => {
    setSearchFocused(false);
    setSearchQuery('');
    const cat = menuData.find(c => c.articles.some(a => a.id === articleId));
    if (cat) setActiveTab(cat.id);
    setActiveArticle(articleId);
    if (slug) setPendingScrollSlug(slug);
  };

  const toggleExpand = (articleId: string) => {
    setExpandedArticles(prev => ({ ...prev, [articleId]: !prev[articleId] }));
  };

  const persistSidebar = useCallback((data: CategoryData[]) => {
    setMenuData(data);
    localStorage.setItem(SIDEBAR_KEY, JSON.stringify(data));
  }, []);

  const flatArticles = useMemo(() => {
    return menuData.flatMap(cat =>
      cat.articles.map(art => ({ ...art, categoryId: cat.id, categoryLabel: cat.label }))
    );
  }, [menuData]);

  const currentIndex = flatArticles.findIndex(a => a.id === activeArticle);
  const prevArticle = currentIndex > 0 ? flatArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < flatArticles.length - 1 ? flatArticles[currentIndex + 1] : null;

  const navigateTo = (article: typeof flatArticles[0]) => {
    setActiveTab(article.categoryId);
    setActiveArticle(article.id);
  };

  const articleData = useMemo(() => {
    if (!activeArticle) return null;
    const existing = (articleBlocks as Record<string, any>)[activeArticle];
    if (existing) return existing;
    const flat = flatArticles.find(a => a.id === activeArticle);
    if (!flat) return null;
    return { id: activeArticle, title: flat.title, description: '', categoryId: flat.categoryId, blocks: [] };
  }, [activeArticle, flatArticles]);

  const articleHeadings = useMemo(() => {
    const map: Record<string, { text: string; slug: string }[]> = {};
    const raw = articleBlocks as Record<string, any>;
    for (const [id, article] of Object.entries(raw)) {
      if (article.blocks) {
        const slugs = new Map<string, number>();
        const headings = article.blocks
          .filter((b: AcademyBlock) => b.type === 'heading')
          .map((b: AcademyBlock) => {
            let base = slugify(b.content.text);
            const count = slugs.get(base) || 0;
            slugs.set(base, count + 1);
            if (count > 0) base += `-${count}`;
            return { text: b.content.text, slug: base };
          });
        if (headings.length > 0) map[id] = headings;
      }
    }
    return map;
  }, []);

  const searchIndex = useMemo(() => {
    const raw = articleBlocks as Record<string, any>;
    const index: Record<string, { articleTitle: string; categoryLabel: string; headings: { text: string; slug: string }[] }> = {};
    for (const [id, article] of Object.entries(raw)) {
      const flat = flatArticles.find(a => a.id === id);
      if (!flat) continue;
      const headings = (article.blocks || []).filter((b: AcademyBlock) => b.type === 'heading').map((b: AcademyBlock) => ({ text: b.content.text, slug: '' }));
      index[id] = { articleTitle: article.title, categoryLabel: flat.categoryLabel, headings };
    }
    return index;
  }, [flatArticles]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { articleId: string; articleTitle: string; categoryLabel: string; matchedHeading?: string; matchedSlug?: string }[] = [];
    for (const [id, entry] of Object.entries(searchIndex)) {
      const titleMatch = entry.articleTitle.toLowerCase().includes(q);
      const matchedH = entry.headings.find(h => h.text.toLowerCase().includes(q));
      if (titleMatch || matchedH) {
        results.push({
          articleId: id,
          articleTitle: entry.articleTitle,
          categoryLabel: entry.categoryLabel,
          matchedHeading: titleMatch ? undefined : matchedH?.text,
          matchedSlug: titleMatch ? undefined : matchedH?.slug,
        });
      }
    }
    return results;
  }, [searchQuery, searchIndex]);

  const quickSuggestions = [
    { id: 'op-templates', label: 'Como criar e aprovar um template?', icon: 'MessageSquare' },
    { id: 'op-upload-clientes', label: 'Fazer upload de clientes', icon: 'Upload' },
    { id: 'op-tratamento-planilhas', label: 'Tratar planilhas antes de importar', icon: 'FileText' },
    { id: 'op-infobip-broadcast', label: 'Criar transmissão na Infobip', icon: 'Play' },
    { id: 'op-troubleshooting', label: 'Erros comuns e soluções', icon: 'AlertCircle' },
  ];

  const footerHighlights = [
    { id: 'op-templates', label: 'Criação de Templates', tip: 'Use variáveis {{1}}, {{2}} no corpo e SEMPRE inclua uma opção SAIR ao final do template.', icon: 'MessageSquare' },
    { id: 'op-upload-clientes', label: 'Upload de Clientes', tip: 'Planilhas devem ter: Nome, Telefone com código do país (5521999999999) e Etiquetas.', icon: 'Upload' },
    { id: 'op-tratamento-planilhas', label: 'Tratamento de Planilhas', tip: 'Remova duplicatas e formate números antes do upload. O Smart Split separa automaticamente.', icon: 'FileText' },
    { id: 'op-infobip-broadcast', label: 'Transmissão Infobip', tip: 'Token expira em 1h. Valide o mapeamento de variáveis e sender antes de disparar.', icon: 'Play' },
    { id: 'op-gerar-relatorios', label: 'Relatórios e Métricas', tip: 'Baixe o relatório na Infobip (Analisar > Relatórios) e anexe no Upload Clientes.', icon: 'BarChart' },
    { id: 'op-troubleshooting', label: 'Erros Comuns', tip: 'Template reprovado? Verifique palavras proibidas, formatação e opção de descadastro.', icon: 'AlertCircle' },
  ];

  const faqItems = [
    { q: 'Como criar um template no WhatsApp?', a: 'Acesse <strong>Templates</strong> no menu, clique em <strong>Criar Template</strong>, preencha nome, categoria e variáveis <code>{<!-- -->{1}}</code>, <code>{<!-- -->{2}}</code>. Após criar, envie para aprovação. O status fica <em>PENDING</em> até aprovação.', articleId: 'op-templates' },
    { q: 'O que fazer quando o template é reprovado?', a: 'Verifique o motivo no campo <strong>Rejection Reason</strong>. Erros comuns: palavras proibidas, falta de opção SAIR/PARAR, formatação incorreta. Corrija e reenvie.', articleId: 'op-templates' },
    { q: 'Como importar clientes para a Infobip?', a: 'Faça upload da planilha tratada. O sistema mapeia colunas: <strong>Nome → Nome</strong>, <strong>Telefone → Phone Number</strong>, <strong>Tags → Etiquetas</strong>. Confira e clique em <strong>Analisar</strong>.', articleId: 'op-infobip-import' },
    { q: 'Por que meu disparo não está entregando?', a: 'Verifique: 1) Template aprovado? 2) Variáveis mapeadas? 3) Token dentro da validade (1h)? 4) Contatos têm WhatsApp ativo? 5) Sender configurado? Consulte <strong>Erros Comuns</strong>.', articleId: 'op-troubleshooting' },
  ];

  const getSavedBlocks = useCallback((articleId: string): AcademyBlock[] | null => {
    const saved = localStorage.getItem(`academy_blocks_${articleId}`);
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return null;
  }, []);

  const toggleEditMode = () => {
    const next = !editMode;
    setEditMode(next);
    localStorage.setItem('academy_edit_mode', next ? 'true' : 'false');
  };

  const handleSubTopicClick = (articleId: string, slug: string) => {
    window.history.replaceState(null, '', `#${slug}`);
    if (activeArticle !== articleId) {
      setActiveArticle(articleId);
      const cat = menuData.find(c => c.articles.some(a => a.id === articleId));
      if (cat) setActiveTab(cat.id);
      setPendingScrollSlug(slug);
    } else {
      const el = document.getElementById(slug);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('heading-highlight');
        setTimeout(() => el.classList.remove('heading-highlight'), 1500);
      }
    }
  };

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      for (const [articleId, headings] of Object.entries(articleHeadings)) {
        if (headings.some(h => h.slug === hash)) {
          setActiveArticle(articleId);
          const cat = menuData.find(c => c.articles.some(a => a.id === articleId));
          if (cat) setActiveTab(cat.id);
          setPendingScrollSlug(hash);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        for (const [articleId, headings] of Object.entries(articleHeadings)) {
          if (headings.some(h => h.slug === hash)) {
            if (activeArticle !== articleId) {
              setActiveArticle(articleId);
              const cat = menuData.find(c => c.articles.some(a => a.id === articleId));
              if (cat) setActiveTab(cat.id);
            }
            setPendingScrollSlug(hash);
            break;
          }
        }
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [activeArticle, articleHeadings]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeArticle]);

  useEffect(() => {
    if (!pendingScrollSlug) return;
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(pendingScrollSlug);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('heading-highlight');
        setTimeout(() => el.classList.remove('heading-highlight'), 1500);
        setPendingScrollSlug(null);
      } else if (attempts < 30) {
        attempts++;
        setTimeout(tryScroll, 100);
      } else {
        setPendingScrollSlug(null);
      }
    };
    const timer = setTimeout(tryScroll, 50);
    return () => clearTimeout(timer);
  }, [pendingScrollSlug, activeArticle]);

  const addCategory = () => {
    const id = makeId('nova-sessao');
    const data = [...menuData, { id, label: 'Nova Sessão', icon: 'BookOpen', articles: [] }];
    persistSidebar(data);
    setActiveTab(id);
  };

  const removeCategory = (catId: string) => {
    const data = menuData.filter(c => c.id !== catId);
    persistSidebar(data);
    if (activeTab === catId) {
      const next = data[0];
      if (next) { setActiveTab(next.id); setActiveArticle(next.articles[0]?.id || null); }
    }
  };

  const renameCategory = (catId: string, label: string) => {
    if (!label.trim()) return;
    const data = menuData.map(c => c.id === catId ? { ...c, label: label.trim() } : c);
    persistSidebar(data);
    setRenaming(null);
  };

  const addArticle = (catId: string) => {
    const id = makeId('novo-topico');
    const data = menuData.map(c => c.id === catId
      ? { ...c, articles: [...c.articles, { id, title: 'Novo Tópico' }] }
      : c
    );
    persistSidebar(data);
    setActiveArticle(id);
    setActiveTab(catId);
  };

  const removeArticle = (catId: string, artId: string) => {
    const data = menuData.map(c => c.id === catId
      ? { ...c, articles: c.articles.filter(a => a.id !== artId) }
      : c
    );
    persistSidebar(data);
    if (activeArticle === artId) {
      const cat = data.find(c => c.id === catId);
      if (cat?.articles.length) setActiveArticle(cat.articles[0].id);
      else setActiveArticle(null);
    }
  };

  const renameArticle = (catId: string, artId: string, title: string) => {
    if (!title.trim()) return;
    const data = menuData.map(c => c.id === catId
      ? { ...c, articles: c.articles.map(a => a.id === artId ? { ...a, title: title.trim() } : a) }
      : c
    );
    persistSidebar(data);
    setRenaming(null);
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= menuData.length) return;
    const data = [...menuData];
    [data[index], data[target]] = [data[target], data[index]];
    persistSidebar(data);
  };

  const moveArticle = (catId: string, index: number, direction: -1 | 1) => {
    const target = index + direction;
    const cat = menuData.find(c => c.id === catId);
    if (!cat || target < 0 || target >= cat.articles.length) return;
    const data = menuData.map(c => c.id === catId ? { ...c, articles: [...c.articles] } : c);
    const arts = data.find(c => c.id === catId)!.articles;
    [arts[index], arts[target]] = [arts[target], arts[index]];
    persistSidebar(data);
  };

  const renderArticle = () => {
    if (!articleData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-white/50">
          <FileText size={48} className="mb-4 opacity-20" />
          <p>Selecione um tópico no menu lateral para começar.</p>
        </div>
      );
    }

    const savedBlocks = getSavedBlocks(activeArticle || '');
    const currentBlocks = savedBlocks || articleData.blocks;
    const isNew = currentBlocks.length === 0;

    if (editMode) {
      return (
        <AcademyEditor
          key={articleData.id}
          articleId={articleData.id}
          blocks={articleData.blocks}
          onBlocksChange={() => {}}
          onClose={() => setEditMode(false)}
        />
      );
    }

    if (isNew && !editMode) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-white/50">
          <FileText size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-bold text-white/80 mb-2">{articleData.title}</p>
          <p className="text-white/40">Este tópico está vazio. Clique em <strong className="text-primary-color">Editar</strong> para adicionar conteúdo.</p>
        </div>
      );
    }

    return (
      <div className="prose prose-invert max-w-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20">
            <FileText size={22} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{articleData.title}</h1>
        </div>
        {articleData.description && (
          <p className="text-white/70 text-lg leading-relaxed mb-8">{articleData.description}</p>
        )}
        {currentBlocks.map((block: AcademyBlock) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    );
  };

  return (
    <>
    <style>{`
      @keyframes headingGlow {
        0% { background-color: transparent; }
        20% { background-color: rgba(172, 248, 0, 0.08); }
        100% { background-color: transparent; }
      }
      .heading-highlight {
        animation: headingGlow 1.5s ease-out;
        border-radius: 4px;
      }
    `}</style>
    <div className="flex academy-root" style={{ height: '100vh' }}>
      <style>{`
        @media (min-width: 1024px) {
          .academy-sidebar-wrap { transform: none !important; position: sticky !important; top: 0; height: 100vh; z-index: 10 !important; }
        }
      `}</style>
      <div
        className="academy-sidebar-wrap border-r border-white/5 flex flex-col"
        style={{
          width: '320px',
          background: 'rgba(5, 7, 10, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 60,
        }}
      >

        <div className="p-8 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0" style={{ width: '8rem', height: '8rem', background: 'rgba(172, 248, 0, 0.1)', borderRadius: '9999px', filter: 'blur(64px)', transform: 'translateY(-50%) translateX(50%)' }}></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, var(--primary-color) 0%, rgba(172, 248, 0, 0.5) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(var(--primary-color-rgb), 0.3)' }}>
                <BookOpen size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white leading-none">Academy</h1>
                <p style={{ fontSize: '10px', letterSpacing: '0.2em' }} className="text-primary-color mt-1 font-bold uppercase">Centro de Conhecimento</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                style={{ display: 'none' }}
                onClick={() => setSidebarEdit(!sidebarEdit)}
                className={`p-2 rounded-lg transition-all ${sidebarEdit ? 'bg-primary-color/20 text-primary-color' : 'text-white/30 hover:text-white/60'}`}
                title={sidebarEdit ? 'Fechar edição do menu' : 'Editar menu'}
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 overflow-y-auto nav-scroll">
          <div className="flex flex-col gap-6">
            {menuData.map((category, catIndex) => (
              <div key={category.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <div
                    className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                      activeTab === category.id ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white/80'
                    }`}
                    onClick={() => setActiveTab(category.id)}
                  >
                    <div className={`p-1.5 rounded-lg ${activeTab === category.id ? 'bg-primary-color/20 text-primary-color' : ''}`}>
                      {ICON_MAP[category.icon] || <BookOpen size={18} />}
                    </div>
                    {renaming?.type === 'cat' && renaming.id === category.id ? (
                      <input
                        value={renaming.value}
                        onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') renameCategory(category.id, renaming.value); if (e.key === 'Escape') setRenaming(null); }}
                        className="flex-1 bg-black/40 border border-white/20 rounded px-2 py-0.5 text-white text-sm font-bold outline-none focus:border-primary-color"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="font-bold text-sm tracking-wide uppercase">{category.label}</span>
                    )}
                  </div>
                  {sidebarEdit && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      {renaming?.type === 'cat' && renaming.id === category.id ? (
                        <>
                          <button onClick={() => renameCategory(category.id, renaming.value)} className="p-1 text-green-400 hover:text-green-300"><Check size={14} /></button>
                          <button onClick={() => setRenaming(null)} className="p-1 text-white/40 hover:text-white/70"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => moveCategory(catIndex, -1)} className="p-1 text-white/30 hover:text-white/70 disabled:opacity-20" disabled={catIndex === 0}><ChevronUp size={12} /></button>
                          <button onClick={() => moveCategory(catIndex, 1)} className="p-1 text-white/30 hover:text-white/70 disabled:opacity-20" disabled={catIndex === menuData.length - 1}><ChevronDown size={12} /></button>
                          <button onClick={() => setRenaming({ type: 'cat', id: category.id, value: category.label })} className="p-1 text-white/30 hover:text-white/70"><Edit3 size={12} /></button>
                          <button onClick={() => { if (confirm(`Excluir "${category.label}"?`)) removeCategory(category.id); }} className="p-1 text-red-400/50 hover:text-red-400"><Trash2 size={12} /></button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className={`flex flex-col gap-1 ml-4 border-l-2 border-white/5 pl-4 transition-all duration-500 overflow-hidden ${
                  activeTab === category.id ? 'opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`} style={activeTab === category.id ? { maxHeight: '2000px' } : undefined}>
                  {category.articles.map((article, artIndex) => {
                    const headings = articleHeadings[article.id] || [];
                    const isExpanded = expandedArticles[article.id];
                    return (
                    <div key={article.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 group">
                        {headings.length > 0 && !sidebarEdit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(article.id); }}
                            style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', background: 'transparent' }}
                            className="text-white/40 hover:text-primary-color shrink-0 hover:bg-white/5 transition-all"
                          >
                            <ChevronRight size={12} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
                          </button>
                        )}
                        <button
                          onClick={() => { setActiveArticle(article.id); setActiveTab(category.id); setMobileSidebarOpen(false); }}
                          className={`flex-1 text-left academy-sidebar-btn ${activeArticle === article.id ? 'active' : ''}`}
                        >
                          {renaming?.type === 'art' && renaming.id === article.id ? (
                            <input
                              value={renaming.value}
                              onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
                              onKeyDown={(e) => { if (e.key === 'Enter') renameArticle(category.id, article.id, renaming.value); if (e.key === 'Escape') setRenaming(null); }}
                              className="w-full bg-black/40 border border-white/20 rounded px-2 py-0.5 text-white text-xs outline-none focus:border-primary-color"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            article.title
                          )}
                        </button>
                        {sidebarEdit && (
                          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {renaming?.type === 'art' && renaming.id === article.id ? (
                              <>
                                <button onClick={() => renameArticle(category.id, article.id, renaming.value)} className="p-1 text-green-400 hover:text-green-300"><Check size={12} /></button>
                                <button onClick={() => setRenaming(null)} className="p-1 text-white/40 hover:text-white/70"><X size={12} /></button>
                              </>
                            ) : (
                            <>
                              <button onClick={() => moveArticle(category.id, artIndex, -1)} className="p-1 text-white/30 hover:text-white/70 disabled:opacity-20" disabled={artIndex === 0}><ChevronUp size={11} /></button>
                              <button onClick={() => moveArticle(category.id, artIndex, 1)} className="p-1 text-white/30 hover:text-white/70 disabled:opacity-20" disabled={artIndex === category.articles.length - 1}><ChevronDown size={11} /></button>
                              <button onClick={() => setRenaming({ type: 'art', id: article.id, value: article.title })} className="p-1 text-white/30 hover:text-white/70"><Edit3 size={11} /></button>
                              <button onClick={() => { if (confirm(`Excluir "${article.title}"?`)) removeArticle(category.id, article.id); }} className="p-1 text-red-400/50 hover:text-red-400"><Trash2 size={11} /></button>
                            </>
                            )}
                          </div>
                        )}
                      </div>
                      {isExpanded && headings.length > 0 && !sidebarEdit && (
                        <div className="flex flex-col pl-4 ml-4">
                          {headings.map(h => (
                            <button
                              key={h.slug}
                              onClick={(e) => { e.stopPropagation(); handleSubTopicClick(article.id, h.slug); setMobileSidebarOpen(false); }}
                              className={`academy-subtopic-btn ${activeArticle === article.id ? 'active' : ''}`}
                            >
                              {h.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    );
                  })}
                  {sidebarEdit && (
                    <button
                      onClick={() => addArticle(category.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/30 hover:text-primary-color hover:bg-primary-color/10 transition-all text-xs font-bold mt-1"
                    >
                      <Plus size={12} /> Novo Tópico
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {sidebarEdit && (
            <button
              onClick={addCategory}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-primary-color hover:border-primary-color/30 transition-all text-sm font-bold"
            >
              <Plus size={16} /> Nova Sessão
            </button>
          )}
        </div>

      </div>

      <div className="flex-1 overflow-y-auto relative" ref={contentRef}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', background: 'rgba(172, 248, 0, 0.05)', borderRadius: '9999px', filter: 'blur(120px)', pointerEvents: 'none' }}></div>

        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="lg:hidden"
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0,0,0,0.6)', zIndex: 55 }}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <div className="max-w-5xl mx-auto px-8 md:px-16 relative z-10" style={{ paddingBottom: '80px' }}>

          {/* Mobile header */}
          <div className="lg:hidden" style={{ paddingTop: '16px', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
              className="hover:bg-white/15 transition-colors shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary-color) 0%, rgba(172, 248, 0, 0.5) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={16} className="text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-sm leading-none block">Academy</span>
                <span style={{ fontSize: '8px', letterSpacing: '0.2em' }} className="text-primary-color font-bold uppercase leading-none">Centro de Conhecimento</span>
              </div>
            </div>
          </div>

          {/* Search Header */}
          <div className="hide-mobile" style={{ paddingTop: '40px', paddingBottom: '24px' }} ref={searchRef}>
            <div style={{ background: 'rgba(10, 12, 18, 0.8)', backdropFilter: 'blur(20px)' }} className="border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 py-3" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                <Search size={18} className="text-white/30 shrink-0" />
                <input
                  type="text"
                  placeholder="Pesquisar na Academy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-sm academy-search-input"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white/60 p-0.5">
                    <X size={16} />
                  </button>
                )}
              </div>
              {searchFocused && (
                <div className="border-t border-white/5" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {searchQuery.trim() ? (
                    filteredResults.length > 0 ? (
                      <div className="py-2">
                        {filteredResults.map((r, i) => (
                          <button
                            key={`${r.articleId}-${i}`}
                            onClick={() => handleSearchSelect(r.articleId, r.matchedSlug)}
                            className="w-full text-left py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors"
                            style={{ paddingLeft: '20px', paddingRight: '20px' }}
                          >
                            <FileText size={14} className="text-white/20 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-white/80 text-sm font-medium block truncate">{r.articleTitle}</span>
                              {r.matchedHeading ? (
                                <span className="text-primary-color text-[11px] block truncate mt-0.5">{r.matchedHeading}</span>
                              ) : (
                                <span className="text-white/30 text-[11px] block truncate mt-0.5">{r.categoryLabel}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-white/30 text-sm" style={{ paddingLeft: '20px', paddingRight: '20px' }}>Nenhum resultado encontrado</div>
                    )
                  ) : (
                    <div className="py-2">
                      <div className="py-2 text-white/30 text-[11px] font-bold uppercase tracking-wider" style={{ paddingLeft: '20px', paddingRight: '20px' }}>Sugestões</div>
                      {quickSuggestions.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleSearchSelect(s.id)}
                          className="w-full text-left py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors"
                          style={{ paddingLeft: '20px', paddingRight: '20px' }}
                        >
                          <div className="w-6 h-6 rounded-lg bg-primary-color/10 flex items-center justify-center shrink-0">
                            {s.icon === 'MessageSquare' ? <MessageSquare size={12} className="text-primary-color" /> :
                             s.icon === 'Upload' ? <Upload size={12} className="text-primary-color" /> :
                             s.icon === 'FileText' ? <FileText size={12} className="text-primary-color" /> :
                             s.icon === 'Play' ? <Play size={12} className="text-primary-color" /> :
                             <AlertCircle size={12} className="text-primary-color" />}
                          </div>
                          <span className="text-white/70 text-sm">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Breadcrumb + Edit */}
          <div style={{ fontSize: '13px' }} className="flex items-center gap-3 font-medium mb-8 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <button onClick={() => { setActiveTab('operacional'); setActiveArticle('op-contatos'); }} className="academy-breadcrumb-btn shrink-0" style={{ opacity: 0.5 }}>Academy</button>
            <ChevronRight size={14} className="text-white/20 shrink-0" />
            <button onClick={() => { const cat = menuData.find(m => m.id === activeTab); if (cat) { setActiveArticle(cat.articles[0]?.id || null); } }} className="academy-breadcrumb-btn truncate" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {menuData.find(m => m.id === activeTab)?.label}
            </button>
            <ChevronRight size={14} className="text-white/20 shrink-0" />
            <span className="text-primary-color truncate" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {flatArticles.find(a => a.id === activeArticle)?.title}
            </span>
            <button
              style={{ display: 'none' }}
              onClick={toggleEditMode}
              className={`ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                editMode ? 'bg-primary-color text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              title={editMode ? 'Sair do modo editor' : 'Entrar no modo editor'}
            >
              {editMode ? <Eye size={14} /> : <Edit3 size={14} />}
              {editMode ? 'Visualizar' : 'Editar'}
            </button>
            <button
              onClick={() => {
                const out: Record<string, any> = {};
                for (let k in localStorage) {
                  if (k.startsWith('academy_blocks_')) {
                    const id = k.replace('academy_blocks_', '');
                    try {
                      const blocks = JSON.parse(localStorage.getItem(k) || '[]');
                      const clean = blocks.map((b: any) => ({ id: b.id, type: b.type, content: b.content }));
                      out[id] = clean;
                    } catch {}
                  }
                }
                const code = JSON.stringify(out, null, 2);
                navigator.clipboard.writeText(code).then(() => {
                  alert('Dados copiados para a área de transferência!');
                }).catch(() => {
                  prompt('Copie o código abaixo:', code);
                });
              }}
              className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white/60 hover:bg-white/20 transition-all"
              title="Salvar todos os dados da Academy"
            >
              <Save size={14} />
              Salvar Tudo
            </button>
          </div>

          {/* Article Content */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
            {renderArticle()}
          </div>

          {/* Footer */}
          <div className="mt-16 mb-12">
            <div className="border-t border-white/5" style={{ paddingTop: '32px' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 rounded-full bg-primary-color"></div>
                <h2 className="text-lg font-bold text-white">Tópicos em Destaque</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {footerHighlights.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSearchSelect(s.id)}
                    className="flex flex-col gap-1.5 px-4 py-3 rounded-xl border border-white/5 hover:border-primary-color/30 bg-white/[0.02] hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-color/10 flex items-center justify-center shrink-0 group-hover:bg-primary-color/20 transition-colors">
                        {s.icon === 'MessageSquare' ? <MessageSquare size={13} className="text-primary-color" /> :
                         s.icon === 'Upload' ? <Upload size={13} className="text-primary-color" /> :
                         s.icon === 'FileText' ? <FileText size={13} className="text-primary-color" /> :
                         s.icon === 'Play' ? <Play size={13} className="text-primary-color" /> :
                         s.icon === 'BarChart' ? <BarChart size={13} className="text-primary-color" /> :
                         <AlertCircle size={13} className="text-primary-color" />}
                      </div>
                      <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{s.label}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.4', paddingLeft: '36px' }}>{s.tip}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '40px' }}>
              <div className="border-t border-white/5" style={{ paddingTop: '32px' }}>
                <div className="flex items-center gap-3 mb-8">
                  <HelpCircle size={18} className="text-primary-color" />
                  <h2 className="text-lg font-bold text-white">Perguntas Frequentes</h2>
                </div>
                <div className="flex flex-col gap-2">
                  {faqItems.map((faq, i) => (
                    <div key={i} className="rounded-xl border border-white/5 overflow-hidden bg-white/[0.02]">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between py-4 text-left transition-colors hover:bg-white/5"
                        style={{ paddingLeft: '20px', paddingRight: '20px' }}
                      >
                        <span className="text-white/80 text-sm font-medium pr-4">{faq.q}</span>
                        <ChevronDown size={16} className={`text-white/30 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === i && (
                        <div className="border-t border-white/5" style={{ padding: '0 20px 16px' }}>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', paddingTop: '12px' }} dangerouslySetInnerHTML={{ __html: faq.a }} />
                          <button
                            onClick={() => handleSearchSelect(faq.articleId)}
                            className="mt-3 flex items-center gap-1.5 text-primary-color text-xs font-bold hover:underline"
                          >
                            Ver artigo completo <ExternalLink size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <div className="border-t border-white/5 pt-8">
                <p className="text-white/20 text-xs mb-4">Ainda com dúvidas?</p>
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/5 hover:text-white transition-colors">
                  Falar com Suporte
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky bar: Search + Hamburger */}
        <div className="lg:hidden" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: 'rgba(5, 7, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '10px 14px',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'text',
            }}
            onClick={() => {
              const el = document.querySelector<HTMLInputElement>('.academy-search-input');
              if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            }}
          >
            <Search size={16} className="text-white/30 shrink-0" />
            <span className="text-white/30 text-sm">Pesquisar na Academy...</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            style={{
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: 'rgba(172, 248, 0, 0.12)',
              border: '1px solid rgba(172, 248, 0, 0.2)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            className="hover:bg-primary-color/20 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

      </div>
    </div>
    </>
  );
};

export default AcademyPage;
