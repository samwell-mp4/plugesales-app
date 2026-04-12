import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Trash2, 
    Copy, 
    Link as LinkIcon, 
    Zap, 
    MousePointer2, 
    Search,
    ChevronRight,
    Globe,
    ExternalLink,
    AlertCircle,
    BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';

const LinkRotator = () => {
    const navigate = useNavigate();
    const { user } = useAuth() as any;
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [targets, setTargets] = useState([{ url: '', weight: 1 }]);
    const [rotators, setRotators] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) fetchRotators();
    }, [user]);

    const fetchRotators = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getProLinks(user.id);
            setRotators(data || []);
        } catch (error) {
            console.error("Error fetching rotators:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTarget = () => {
        setTargets([...targets, { url: '', weight: 1 }]);
    };

    const handleRemoveTarget = (index: number) => {
        if (targets.length > 1) {
            setTargets(targets.filter((_, i) => i !== index));
        }
    };

    const handleTargetChange = (index: number, field: string, value: any) => {
        const newTargets = [...targets];
        (newTargets[index] as any)[field] = value;
        setTargets(newTargets);
    };

    const ensureProtocol = (url: string) => {
        if (!url) return '';
        const trimmed = url.trim();
        if (!/^https?:\/\//i.test(trimmed)) {
            return `https://${trimmed}`;
        }
        return trimmed;
    };

    const handleCreateRotator = async (e: React.FormEvent) => {
        e.preventDefault();
        const validTargets = targets.filter(t => t.url.trim() !== '');
        if (validTargets.length === 0) return alert("Adicione pelo menos uma URL válida.");

        setIsCreating(true);
        try {
            const normalizedTargets = validTargets.map(t => ({
                ...t,
                url: ensureProtocol(t.url),
                weight: Number(t.weight) || 1
            }));

            const result = await dbService.createProLink({
                user_id: user.id,
                title: title || 'Rotacionador sem título',
                slug: slug || undefined,
                targets: normalizedTargets
            });

            if (result && !result.error) {
                setTitle('');
                setSlug('');
                setTargets([{ url: '', weight: 1 }]);
                fetchRotators();
            } else {
                alert(result.error || "Erro ao criar rotacionador");
            }
        } catch (error) {
            console.error("Error creating rotator:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteRotator = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este rotacionador?")) return;
        try {
            await dbService.deleteProLink(id);
            fetchRotators();
        } catch (error) {
            console.error("Error deleting rotator:", error);
        }
    };

    const copyToClipboard = (shortSlug: string) => {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const fullUrl = `${protocol}//${host}/r/${shortSlug}`;
        navigator.clipboard.writeText(fullUrl);
        alert("Link copiado para o clipboard!");
    };

    const calculatePercentage = (weight: number) => {
        const total = targets.reduce((sum, t) => sum + (Number(t.weight) || 1), 0);
        return total === 0 ? "0.0" : ((weight / total) * 100).toFixed(1);
    };

    const filteredRotators = rotators.filter(r => 
        (r.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (r.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="crm-container">
            {/* --- HEADER --- */}
            <div className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <Zap size={12} /> PRO LINK SYSTEM
                    </div>
                    <h1 className="crm-main-title">Links Inteligentes</h1>
                </div>
                
                <div className="search-group" style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                    <input 
                        className="field-input"
                        placeholder="Buscar rotacionador..."
                        style={{ width: '280px', paddingLeft: '48px', height: '48px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="gestiva-split-layout">
                {/* --- SIDEBAR: CREATE SECTION --- */}
                <div className="gestiva-sidebar-panels">
                    <div className="crm-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ background: 'var(--primary-gradient)', padding: '10px', borderRadius: '14px', boxShadow: '0 8px 20px rgba(172, 248, 0, 0.2)' }}>
                                <Plus size={22} color="black" />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.5px' }}>Novo Rotacionador</h2>
                        </div>

                        <form onSubmit={handleCreateRotator} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label className="field-label">Título da Campanha</label>
                                <input 
                                    className="field-input"
                                    placeholder="Ex: Vendas WhatsApp"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="field-label">Identificador (Slug)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 900, opacity: 0.4 }}>/r/</span>
                                    <input 
                                        className="field-input"
                                        placeholder="whatsapp-loja"
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--surface-border-subtle)', paddingTop: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <label className="field-label">Destinos & Pesos</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddTarget}
                                        className="action-btn"
                                        style={{ background: 'rgba(172, 248, 0, 0.05)', color: 'var(--primary-color)', fontSize: '10px', height: '32px', padding: '0 12px' }}
                                    >
                                        <Plus size={12} /> ADD LINK
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {targets.map((target, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '20px', border: '1px solid var(--surface-border-subtle)' }}>
                                            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                                <input 
                                                    className="field-input"
                                                    style={{ height: '42px', fontSize: '13px' }}
                                                    placeholder="URL de destino..."
                                                    value={target.url}
                                                    onChange={e => handleTargetChange(idx, 'url', e.target.value)}
                                                />
                                                {targets.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveTarget(idx)} className="action-btn" style={{ width: '42px', height: '42px', padding: 0, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <input 
                                                    type="range"
                                                    min="1"
                                                    max="100"
                                                    className="w-full"
                                                    style={{ accentColor: 'var(--primary-color)' }}
                                                    value={target.weight}
                                                    onChange={e => handleTargetChange(idx, 'weight', e.target.value)}
                                                />
                                                <div style={{ textAlign: 'right', minWidth: '60px' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 950, color: 'var(--primary-color)' }}>{calculatePercentage(target.weight)}%</div>
                                                    <div style={{ fontSize: '9px', fontWeight: 800, opacity: 0.5 }}>PESO</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={isCreating} className="action-btn primary-btn w-full" style={{ height: '54px', fontSize: '12px' }}>
                                <Zap size={16} />
                                {isCreating ? 'PROCESSANDO...' : 'CRIAR ROTACIONADOR'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- MAIN CONTENT: LIST SECTION --- */}
                <div className="gestiva-main-content">
                    {isLoading ? (
                        <div style={{ padding: '100px 0', textAlign: 'center', opacity: 0.5 }}>
                            <div className="crm-badge-small" style={{ justifyContent: 'center', marginBottom: '10px' }}>Carregando dados...</div>
                        </div>
                    ) : filteredRotators.length === 0 ? (
                        <div className="crm-card" style={{ textAlign: 'center', padding: '100px 40px' }}>
                            <Globe size={64} style={{ opacity: 0.05, marginBottom: '24px' }} />
                            <h3 style={{ opacity: 0.3, fontWeight: 950, fontSize: '1.5rem', marginBottom: '8px' }}>Nenhum rotacionador</h3>
                            <p style={{ opacity: 0.2, fontSize: '14px', fontWeight: 700 }}>Crie seu primeiro link inteligente no painel lateral.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {filteredRotators.map((r) => (
                                <div key={r.id} className="crm-card" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(172, 248, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', border: '1px solid rgba(172,248,0,0.1)', flexShrink: 0 }}>
                                        <Zap size={28} />
                                    </div>
                                    
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.5px' }}>{r.title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 850, color: 'var(--primary-color)' }}>{window.location.host}/r/{r.slug}</span>
                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.2 }}></span>
                                            <span className="info-chip" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                                                {r.targets?.length || 0} DESTINOS
                                            </span>
                                        </div>
                                        
                                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {r.targets?.map((t: any, i: number) => (
                                                <div key={i} title={t.url} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontWeight: 950, color: 'var(--primary-color)' }}>%{calculatePercentage(t.weight)}</span>
                                                    <span style={{ opacity: 0.4, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>{t.url}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', flexShrink: 0 }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '32px', fontWeight: 950, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-1px' }}>{r.total_clicks || 0}</div>
                                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '1px' }}>CLICKS</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => navigate(`/rotator-stats/${r.id}`)} className="action-btn" style={{ width: '44px', height: '44px', padding: 0, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }} title="Análise">
                                                <BarChart3 size={18} />
                                            </button>
                                            <button onClick={() => copyToClipboard(r.slug)} className="action-btn" style={{ width: '44px', height: '44px', padding: 0, background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)' }} title="Copiar URL">
                                                <Copy size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteRotator(r.id)} className="action-btn" style={{ width: '44px', height: '44px', padding: 0, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} title="Excluir">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinkRotator;
