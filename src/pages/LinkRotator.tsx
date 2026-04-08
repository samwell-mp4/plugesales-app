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
        return ((weight / total) * 100).toFixed(1);
    };

    const filteredRotators = rotators.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-root" style={{ minHeight: '100vh', padding: '28px 24px', overflowX: 'hidden' }}>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .glass-card { 
                    background: var(--card-bg-subtle); 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 24px; 
                    padding: 24px;
                    backdrop-filter: blur(12px);
                    animation: fadeInUp 0.4s ease-out backwards;
                }
                .glass-card:hover { 
                    border-color: var(--surface-border);
                }

                .action-btn { 
                    padding: 12px 24px; 
                    border-radius: 14px; 
                    border: none; 
                    cursor: pointer; 
                    font-weight: 900; 
                    font-size: 11px; 
                    letter-spacing: 1px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 10px; 
                    transition: all 0.2s; 
                    text-transform: uppercase; 
                }
                .primary-btn { background: var(--primary-gradient); color: #000; box-shadow: 0 8px 20px -6px var(--primary); }
                .primary-btn:hover { transform: scale(1.02); }
                .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .input-field { 
                    width: 100%; 
                    background: var(--card-bg-subtle); 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 16px; 
                    padding: 14px; 
                    color: var(--text-primary); 
                    font-size: 14px; 
                    font-weight: 600; 
                    outline: none; 
                    transition: all 0.2s; 
                    box-sizing: border-box; 
                }
                .input-field:focus { 
                    border-color: var(--primary-color); 
                    box-shadow: 0 0 20px rgba(172,248,0,0.1); 
                }

                .rotator-item {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    padding: 24px;
                    background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle);
                    border-radius: 24px;
                    transition: all 0.3s;
                    margin-bottom: 20px;
                }
                .rotator-item:hover {
                    border-color: var(--surface-border);
                    transform: translateX(4px);
                }

                .icon-button {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle);
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .icon-button:hover {
                    color: var(--text-primary);
                    border-color: var(--surface-border);
                    transform: translateY(-2px);
                }
                .icon-button.delete:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .weight-badge {
                    background: rgba(172, 248, 0, 0.1);
                    color: var(--primary-color);
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                }
            `}</style>

            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '32px' }}>
                    
                    {/* ── CREATE SECTION ── */}
                    <div className="glass-card" style={{ height: 'fit-content', position: 'sticky', top: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ background: 'var(--primary-gradient)', padding: '8px', borderRadius: '12px', boxShadow: '0 0 20px rgba(172, 248, 0, 0.2)' }}>
                                <Zap size={20} color="black" />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Novo Rotacionador PRO</h2>
                        </div>

                        <form onSubmit={handleCreateRotator} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Título</label>
                                <input 
                                    className="input-field"
                                    placeholder="Ex: Rodízio WhatsApp Vendas"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Custom Slug (Opcional)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', opacity: 0.5 }}>/r/</span>
                                    <input 
                                        className="input-field"
                                        placeholder="whatsapp-vendas"
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--surface-border-subtle)', paddingTop: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Links de Destino & Pesos</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddTarget}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '10px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Plus size={12} /> ADD LINK
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {targets.map((target, idx) => (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)' }}>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                                <input 
                                                    className="input-field"
                                                    style={{ paddingTop: '10px', paddingBottom: '10px' }}
                                                    placeholder="https://wa.me/..."
                                                    value={target.url}
                                                    onChange={e => handleTargetChange(idx, 'url', e.target.value)}
                                                />
                                                {targets.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveTarget(idx)} className="icon-button delete" style={{ width: '44px', height: '44px' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <input 
                                                        type="range"
                                                        min="1"
                                                        max="100"
                                                        style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                                                        value={target.weight}
                                                        onChange={e => handleTargetChange(idx, 'weight', e.target.value)}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '45px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary-color)' }}>{calculatePercentage(target.weight)}%</span>
                                                    <span style={{ fontSize: '9px', opacity: 0.5 }}>FREQUÊNCIA</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={isCreating} className="action-btn primary-btn" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                                <Zap size={16} />
                                {isCreating ? 'Criando...' : 'Criar Rotacionador'}
                            </button>
                        </form>
                    </div>

                    {/* ── LIST SECTION ── */}
                    <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900 }}>Seus Rotacionadores</h2>
                                <span className="weight-badge" style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px' }}>PRO</span>
                            </div>
                            
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                <input 
                                    className="input-field"
                                    placeholder="Buscar rotacionador..."
                                    style={{ width: '280px', paddingLeft: '48px' }}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div style={{ paddingTop: '100px', paddingBottom: '100px', textAlign: 'center', opacity: 0.5 }}>Carregando seus rotacionadores...</div>
                        ) : filteredRotators.length === 0 ? (
                            <div className="glass-card" style={{ textAlign: 'center', paddingTop: '100px', paddingBottom: '100px' }}>
                                <Globe size={64} style={{ opacity: 0.05, marginBottom: '24px' }} />
                                <h3 style={{ opacity: 0.3, fontWeight: 900 }}>Nenhum rotacionador encontrado</h3>
                                <p style={{ opacity: 0.2, fontSize: '14px' }}>Crie seu primeiro link inteligente agora mesmo.</p>
                            </div>
                        ) : (
                            <div>
                                {filteredRotators.map((r) => (
                                    <div key={r.id} className="rotator-item">
                                        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(172, 248, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', border: '1px solid rgba(172,248,0,0.1)' }}>
                                            <Zap size={24} />
                                        </div>
                                        
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 900 }}>{r.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-color)' }}>{window.location.host}/r/{r.slug}</span>
                                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.2 }}></span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{r.targets?.length || 0} LINKS DESTINO</span>
                                            </div>
                                            
                                            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {r.targets?.map((t: any, i: number) => (
                                                    <div key={i} title={t.url} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border-subtle)', borderRadius: '10px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 900, color: 'var(--primary-color)' }}>%{calculatePercentage(t.weight)}</span>
                                                        <span style={{ opacity: 0.3, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.url}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{r.total_clicks || 0}</div>
                                                <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>CLICKS TOTAIS</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => navigate(`/rotator-stats/${r.id}`)} className="icon-button" title="Ver Detalhes">
                                                    <BarChart3 size={16} />
                                                </button>
                                                <button onClick={() => copyToClipboard(r.slug)} className="icon-button" title="Copiar Link Short">
                                                    <Copy size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteRotator(r.id)} className="icon-button delete" title="Excluir">
                                                    <Trash2 size={16} />
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
        </div>
    );
};

export default LinkRotator;
