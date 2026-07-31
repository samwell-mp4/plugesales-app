import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Calendar,
    Copy,
    ExternalLink,
    MousePointer2,
    Users,
    Zap,
    MapPin,
    Smartphone,
    Laptop,
    Globe,
    Plus,
    Trash2,
    Edit,
    Check
} from 'lucide-react';
import { dbService } from '../services/dbService';

const RotatorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editTargets, setEditTargets] = useState<{ url: string; weight: number }[]>([]);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const handleOpenEdit = () => {
        if (!stats?.rotator) return;
        setEditTitle(stats.rotator.title || '');
        setEditSlug(stats.rotator.slug || '');
        
        const rawTargets = typeof stats.rotator.targets === 'string' 
            ? JSON.parse(stats.rotator.targets) 
            : (stats.rotator.targets || []);
        
        setEditTargets(rawTargets.map((t: any) => ({
            url: t.url || t.target_url || '',
            weight: parseInt(t.weight) || 1
        })));
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim()) return alert("O título não pode ser vazio.");
        if (!editSlug.trim()) return alert("O slug não pode ser vazio.");
        if (editTargets.length === 0) return alert("Adicione pelo menos um link de destino.");
        
        for (let i = 0; i < editTargets.length; i++) {
            if (!editTargets[i].url.trim()) {
                return alert(`O link #${i + 1} não pode ser vazio.`);
            }
        }

        setIsSavingEdit(true);
        try {
            const ensureProtocol = (url: string) => {
                if (!/^https?:\/\//i.test(url)) {
                    return `https://${url}`;
                }
                return url;
            };

            const formattedTargets = editTargets.map(t => ({
                url: ensureProtocol(t.url.trim()),
                weight: t.weight
            }));

            const res = await dbService.updateProLink(stats.rotator.id, {
                title: editTitle,
                slug: editSlug.trim(),
                targets: formattedTargets
            });

            if (res.error) {
                alert(res.error);
            } else {
                alert("Rotacionador atualizado com sucesso!");
                setShowEditModal(false);
                fetchStats();
            }
        } catch (error) {
            alert("Erro ao atualizar o rotacionador.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    useEffect(() => {
        if (id) fetchStats();
    }, [id]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getProLinkStats(parseInt(id!));
            setStats(data);
        } catch (error) {
            console.error("Error fetching rotator stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (slug: string) => {
        const fullUrl = `${window.location.protocol}//${window.location.host}/r/${slug}`;
        navigator.clipboard.writeText(fullUrl);
        alert("Link copiado!");
    };

    if (isLoading) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando estatísticas do rotacionador...</div>;
    if (!stats) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Rotacionador não encontrado.</div>;

    const totalClicks = stats.rotator.total_clicks || 0;
    const maxDayClicks = Math.max(...stats.timeline.map((t: any) => parseInt(t.clicks)), 1);
    
    // Parse user agent for simple device stats
    const deviceStats = stats.recentClicks.reduce((acc: any, click: any) => {
        const ua = click.user_agent || '';
        if (/Mobile|Android|iPhone/i.test(ua)) acc.mobile++;
        else acc.desktop++;
        return acc;
    }, { mobile: 0, desktop: 0 });

    const mobilePct = Math.round((deviceStats.mobile / (stats.recentClicks.length || 1)) * 100);

    const targets = typeof stats.rotator.targets === 'string' 
        ? JSON.parse(stats.rotator.targets) 
        : (stats.rotator.targets || []);

    return (
        <div className="container-root" style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '28px 24px' }}>
            <style>{`
                @keyframes barGrow { from { height: 0; } to { height: var(--final-height); } }
                
                .glass-card { 
                    background: var(--card-bg-subtle); 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 24px; 
                    padding: 24px;
                    backdrop-filter: blur(12px);
                }

                .stat-value { font-size: 32px; font-weight: 900; line-height: 1; margin-bottom: 4px; color: var(--text-primary); }
                .stat-label { font-size: 10px; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

                .chart-bar {
                    flex: 1;
                    background: var(--primary-gradient);
                    border-radius: 6px 6px 0 0;
                    margin: 0 4px;
                    position: relative;
                    min-width: 20px;
                    transition: all 0.3s;
                    animation: barGrow 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .chart-bar:hover { filter: brightness(1.2); }
                .chart-bar:hover .bar-tooltip { opacity: 1; transform: translateX(-50%) translateY(-10px); }

                .bar-tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(0);
                    background: white;
                    color: black;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 900;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.2s;
                    z-index: 10;
                }

                .link-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--surface-border-subtle);
                    border-radius: 18px;
                    margin-bottom: 12px;
                    transition: all 0.2s;
                }
                .link-row:hover { border-color: var(--primary-color); background: rgba(172,248,0,0.05); }

                .badge {
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                }
                .badge-primary { background: rgba(172,248,0,0.1); color: var(--primary-color); }
            `}</style>

            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                {/* ── HEADER ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <button 
                        onClick={() => navigate('/link-rotator')}
                        style={{ 
                            background: 'var(--card-bg-subtle)', 
                            border: '1px solid var(--surface-border-subtle)', 
                            width: '48px', height: '48px', borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--text-primary)'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1 style={{ margin: 0, fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
                                {stats.rotator.title}
                            </h1>
                            <span className="badge badge-primary">PRO ROTATOR</span>
                        </div>
                        <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
                            /{stats.rotator.slug} • Criado em {new Date(stats.rotator.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* ── STATS CARDS ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    <div className="glass-card">
                        <div className="stat-label">Cliques Totais</div>
                        <div className="stat-value text-primary-color">{totalClicks}</div>
                    </div>
                    <div className="glass-card">
                        <div className="stat-label">Links Ativos</div>
                        <div className="stat-value">{targets.length}</div>
                    </div>
                    <div className="glass-card">
                        <div className="stat-label">Média Cliques/Link</div>
                        <div className="stat-value">{(totalClicks / Math.max(targets.length, 1)).toFixed(1)}</div>
                    </div>
                    <div className="glass-card">
                        <div className="stat-label">Desempenho</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <Zap size={20} className="text-primary-color" />
                            <span style={{ fontSize: '18px', fontWeight: 900 }}>ALTO</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                    
                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* PERFORMANCE BY LINK */}
                        <div className="glass-card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Performance por Link</h2>
                                <Users size={20} style={{ opacity: 0.3 }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {stats.targets.map((t: any, idx: number) => (
                                    <div key={idx} className="link-row">
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--primary-color)' }}>
                                            #{t.target_index + 1}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {t.target_url}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>
                                                LINK DE DESTINO
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>{t.clicks}</div>
                                            <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)' }}>CLIQUES</div>
                                        </div>
                                        <div style={{ width: '100px', height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', marginLeft: '12px' }}>
                                            <div style={{ width: `${(t.clicks / Math.max(totalClicks, 1)) * 100}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '2px' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CLICKS TIMELINE */}
                        <div className="glass-card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Fluxo de Cliques (30 Dias)</h2>
                                <Calendar size={20} style={{ opacity: 0.3 }} />
                            </div>

                            <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                {stats.timeline.map((t: any, i: number) => {
                                    const height = (parseInt(t.clicks) / maxDayClicks) * 100;
                                    return (
                                        <div key={i} className="chart-bar" style={{ '--final-height': `${height}%`, height: `${height}%` } as any}>
                                            <div className="bar-tooltip">
                                                {t.clicks} Cliques • {new Date(t.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                                {stats.timeline.filter((_: any, i: number) => i % 5 === 0).map((t: any, i: number) => (
                                    <span key={i} style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>
                                        {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* QUICK ACTIONS */}
                        <div className="glass-card">
                            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 900 }}>Configurações</h2>
                            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px' }}>LINK DO ROTACIONADOR</div>
                                <div style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: 800 }}>
                                    {window.location.host}/r/{stats.rotator.slug}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '8px', marginTop: '16px' }}>
                                <button onClick={() => copyToClipboard(stats.rotator.slug)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 6px', fontSize: '11px', fontWeight: 900 }}>
                                    <Copy size={14} /> COPIAR
                                </button>
                                <button onClick={() => window.open(`/r/${stats.rotator.slug}`, '_blank')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 6px', fontSize: '11px', fontWeight: 900 }}>
                                    <ExternalLink size={14} /> TESTAR
                                </button>
                                <button onClick={handleOpenEdit} className="action-btn primary-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 6px', fontSize: '11px', fontWeight: 900, borderRadius: '12px' }}>
                                    <Edit size={14} /> EDITAR
                                </button>
                            </div>
                        </div>

                        {/* DEVICE & GEO STATS */}
                        <div className="glass-card">
                            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: 900 }}>Plataformas & Geologia</h2>
                            
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 900 }}>
                                        <Smartphone size={14} className="text-primary-color" /> MOBILE
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 900 }}>{mobilePct}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px' }}>
                                    <div style={{ width: `${mobilePct}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '3px' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 900 }}>
                                        <Laptop size={14} style={{ color: '#3b82f6' }} /> DESKTOP
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 900 }}>{100 - mobilePct}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px' }}>
                                    <div style={{ width: `${100 - mobilePct}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--surface-border-subtle)', paddingTop: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <Globe size={18} className="text-primary-color" />
                                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900 }}>TOP LOCALIZAÇÕES</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {stats.recentClicks.slice(0, 5).map((c: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontWeight: 700 }}>
                                            <MapPin size={12} style={{ opacity: 0.3 }} />
                                            <span style={{ flex: 1 }}>{c.city || 'Desconhecido'}, {c.country}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{new Date(c.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Edit Rotator Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '32px', maxHeight: '90vh', overflowY: 'auto', animation: 'scaleIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(172, 248, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                <Edit size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.25rem' }}>Editar Rotacionador PRO</h3>
                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Modifique o título, slug e os links de destino</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Título</label>
                                <input 
                                    type="text"
                                    className="field-input"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    placeholder="Ex: WhatsApp Comercial"
                                    style={{ width: '100%', height: '44px', background: 'var(--bg-primary)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', padding: '0 16px', color: 'var(--text-primary)', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Slug (Caminho do Link)</label>
                                <input 
                                    type="text"
                                    className="field-input"
                                    value={editSlug}
                                    onChange={e => setEditSlug(e.target.value)}
                                    placeholder="Ex: whatsapp-comercial"
                                    style={{ width: '100%', height: '44px', background: 'var(--bg-primary)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', padding: '0 16px', color: 'var(--text-primary)', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Links de Destino & Pesos</label>
                                <button 
                                    type="button" 
                                    onClick={() => setEditTargets([...editTargets, { url: '', weight: 1 }])}
                                    style={{ background: 'rgba(172, 248, 0, 0.1)', border: 'none', borderRadius: '8px', color: 'var(--primary-color)', fontSize: '11px', fontWeight: 900, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Plus size={14} /> ADICIONAR LINK
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                                {editTargets.map((t, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border-subtle)', padding: '12px', borderRadius: '14px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)' }}>
                                            #{idx + 1}
                                        </div>
                                        <input 
                                            type="text"
                                            value={t.url}
                                            onChange={e => {
                                                const newTargets = [...editTargets];
                                                newTargets[idx].url = e.target.value;
                                                setEditTargets(newTargets);
                                            }}
                                            placeholder="https://wa.me/5511999999999"
                                            style={{ flex: 1, height: '36px', background: 'var(--bg-primary)', border: '1px solid var(--surface-border-subtle)', borderRadius: '10px', padding: '0 12px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>PESO:</span>
                                            <input 
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={t.weight}
                                                onChange={e => {
                                                    const newTargets = [...editTargets];
                                                    newTargets[idx].weight = parseInt(e.target.value) || 1;
                                                    setEditTargets(newTargets);
                                                }}
                                                style={{ width: '50px', height: '36px', background: 'var(--bg-primary)', border: '1px solid var(--surface-border-subtle)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-primary)', outline: 'none', fontWeight: 700 }}
                                            />
                                        </div>
                                        {editTargets.length > 1 && (
                                            <button 
                                                type="button"
                                                onClick={() => setEditTargets(editTargets.filter((_, i) => i !== idx))}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowEditModal(false)} className="action-btn" style={{ flex: 1, height: '44px', borderRadius: '12px', background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', color: 'var(--text-primary)', fontWeight: 900, cursor: 'pointer' }}>
                                Cancelar
                            </button>
                            <button onClick={handleSaveEdit} className="action-btn primary-btn" style={{ flex: 1, height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }} disabled={isSavingEdit}>
                                <Check size={16} /> {isSavingEdit ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RotatorDetails;
