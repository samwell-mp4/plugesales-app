import React, { useState, useEffect } from 'react';
import { 
    Copy, 
    Trash2, 
    BarChart3, 
    Plus, 
    Globe, 
    Search,
    ChevronRight,
    Zap,
    MapPin,
    Calendar,
    CheckSquare,
    Square,
    XCircle,
    Check,
    Users,
    MousePointer2,
    Link as LinkIcon,
    Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom';

const LinkShortener = () => {
    const { user } = useAuth() as any;
    const navigate = useNavigate();
    const [originalUrl, setOriginalUrl] = useState('');
    const [title, setTitle] = useState('');
    const [links, setLinks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Phase 2 States
    const [isBulk, setIsBulk] = useState(false);
    const [bulkLinks, setBulkLinks] = useState([{ title: '', url: '' }]);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [filterClientId, setFilterClientId] = useState<string>('');
    const [stats, setStats] = useState<any>(null);
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [selectedLinkIds, setSelectedLinkIds] = useState<number[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [showBulkAssociateModal, setShowBulkAssociateModal] = useState(false);
    const [bulkAssociateTargetId, setBulkAssociateTargetId] = useState<string>('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [linksPerPage] = useState(20);

    useEffect(() => {
        fetchLinks();
        fetchClients();
    }, [user, filterClientId, startDate, endDate, currentPage, searchTerm]);

    useEffect(() => {
        fetchStats();
    }, [user, filterClientId, startDate, endDate]);

    const fetchStats = async () => {
        // Para CLIENTE e ASSINATURA_BASICA, usa o ID dele. Para ADMIN/EMPLOYEE, usa o filtro ou 0 (Global)
        const targetUserId = (user?.role === 'CLIENT' || user?.role === 'ASSINATURA_BASICA') ? user.id : (filterClientId ? parseInt(filterClientId) : 0);
        
        setIsStatsLoading(true);
        try {
            const data = await dbService.getAllLinkStats(targetUserId || 0, startDate, endDate);
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setIsStatsLoading(false);
        }
    };

    const ensureProtocol = (url: string) => {
        if (!url) return '';
        const trimmed = url.trim();
        if (!/^https?:\/\//i.test(trimmed)) {
            return `https://${trimmed}`;
        }
        return trimmed;
    };

    const fetchClients = async () => {
        try {
            const data = await dbService.getAllUsers();
            // Filter only for users with role CLIENT
            const clientUsers = Array.isArray(data) ? data.filter((u: any) => u.role === 'CLIENT') : [];
            setClients(clientUsers);
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const fetchLinks = async () => {
        setIsLoading(true);
        try {
            const result = await dbService.getShortLinks(
                user?.role, 
                user?.role !== 'ADMIN' ? user?.id : (filterClientId ? parseInt(filterClientId) : undefined), 
                startDate, 
                endDate,
                currentPage,
                linksPerPage,
                searchTerm
            );
            
            if (result && result.links) {
                setLinks(result.links);
                setTotalPages(result.totalPages);
                setTotalCount(result.totalCount);
            } else {
                setLinks([]);
                setTotalPages(1);
                setTotalCount(0);
            }
        } catch (error) {
            console.error("Error fetching links:", error);
            setLinks([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsCreating(true);
        try {
            const payload: any = {
                user_id: user?.id,
                target_user_id: selectedClientId ? parseInt(selectedClientId) : undefined
            };

            if (isBulk) {
                payload.links = bulkLinks
                    .filter(l => l.url)
                    .map(l => ({ title: l.title, original_url: ensureProtocol(l.url) }));
                if (payload.links.length === 0) {
                    alert("Adicione pelo menos uma URL válida.");
                    return;
                }
            } else {
                if (!originalUrl) return;
                payload.original_url = ensureProtocol(originalUrl);
                payload.title = title || undefined;
            }

            const result = await dbService.createShortLink(payload);

            if (result && (result.id || Array.isArray(result))) {
                setOriginalUrl('');
                setTitle('');
                setBulkLinks([{ title: '', url: '' }]);
                setIsBulk(false);
                setSelectedClientId('');
                fetchLinks();
            }
        } catch (error) {
            console.error("Error creating link:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleBulkBatch = (prefix: string) => {
        const count = 10;
        const newBatch = Array.from({ length: count }, (_, i) => ({
            title: `${prefix}${i + 1}`,
            url: bulkLinks[0]?.url || ''
        }));
        setBulkLinks(prev => {
            const current = [...prev].filter(l => l.url || l.title);
            return [...current, ...newBatch];
        });
    };

    const handleReplicateAll = () => {
        const firstUrl = bulkLinks[0]?.url;
        if (!firstUrl) return alert("Preencha a primeira URL para replicar.");
        setBulkLinks(prev => prev.map(l => ({ ...l, url: firstUrl })));
    };

    const handleDeleteLink = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este link?")) return;
        try {
            await dbService.deleteShortLink(id);
            fetchLinks();
        } catch (error) {
            console.error("Error deleting link:", error);
        }
    };

    const copyToClipboard = (code: string) => {
        const fullUrl = `${window.location.protocol}//${window.location.host}/l/${code}`;
        navigator.clipboard.writeText(fullUrl);
        alert("Link copiado para o clipboard!");
    };

    const filteredLinks = links; // Now filtered by server

    // --- REACIVE SUMMARIES ---
    const totalClicksSummary = totalCount > 0 ? (stats?.totalClicks || 0) : 0; // We'll rely on fetchStats for global totals
    const totalLinksCount = totalCount;

    const toggleSelectAll = () => {
        if (selectedLinkIds.length === filteredLinks.length && filteredLinks.length > 0) {
            setSelectedLinkIds([]);
        } else {
            setSelectedLinkIds(filteredLinks.map(l => l.id));
        }
    };

    const toggleSelectLink = (id: number) => {
        if (selectedLinkIds.includes(id)) {
            setSelectedLinkIds(selectedLinkIds.filter(sid => sid !== id));
        } else {
            setSelectedLinkIds([...selectedLinkIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Deseja excluir ${selectedLinkIds.length} links permanentemente?`)) return;
        try {
            await dbService.bulkDeleteShortLinks(selectedLinkIds);
            setSelectedLinkIds([]);
            fetchLinks();
            fetchStats();
        } catch (error) {
            alert("Erro ao excluir links em massa.");
        }
    };

    const handleBulkAssociate = async () => {
        if (!bulkAssociateTargetId) return alert("Selecione um cliente.");
        try {
            await dbService.bulkAssociateShortLinks(selectedLinkIds, parseInt(bulkAssociateTargetId));
            setSelectedLinkIds([]);
            setShowBulkAssociateModal(false);
            fetchLinks();
        } catch (error) {
            alert("Erro ao vincular links em massa.");
        }
    };

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
                    background: var(--card-bg-subtle); 
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
                .primary-btn:hover { transform: scale(1.02); box-shadow: 0 10px 25px -5px var(--primary); }
                .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .input-field { 
                    width: 100%; 
                    background: var(--card-bg-subtle); 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 16px; 
                    padding: 16px; 
                    color: var(--text-primary); 
                    font-size: 14px; 
                    font-weight: 600; 
                    outline: none; 
                    transition: all 0.2s; 
                    box-sizing: border-box; 
                }
                .input-field:focus { 
                    border-color: var(--primary-color); 
                    background: var(--card-bg-subtle); 
                    box-shadow: 0 0 20px rgba(172,248,0,0.1); 
                }

                .link-item {
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
                .link-item:hover {
                    background: var(--card-bg-subtle);
                    border-color: var(--surface-border);
                    transform: translateX(4px);
                }

                .click-count {
                    font-size: 24px;
                    font-weight: 900;
                    color: var(--primary-color);
                    line-height: 1;
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
                    background: var(--card-bg-subtle);
                    color: var(--text-primary);
                    border-color: var(--surface-border);
                    transform: translateY(-2px);
                }
                .icon-button.delete:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .main-grid {
                    display: grid;
                    grid-template-columns: ${user?.role === 'CLIENT' ? '1fr' : '360px 1fr'};
                    gap: 32px;
                }

                select, option {
                    background-color: #000 !important;
                    color: #fff !important;
                }

                @media (max-width: 1200px) {
                    .main-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 992px) {
                    .link-item { flex-direction: column; align-items: stretch; gap: 16px; }
                }
            `}</style>

            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                 <div className="main-grid">
                     {/* ── CREATE SECTION ── */}
                     {user?.role !== 'CLIENT' && (
                        <div className="glass-card" style={{ height: 'fit-content', position: 'sticky', top: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <Plus size={20} className="text-primary-color" />
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Criar Novo Link</h2>
                            </div>
 
                            <form onSubmit={handleCreateLink} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {['ADMIN', 'EMPLOYEE'].includes(user?.role || '') && (
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            <Users size={12} /> Vincular a Cliente (Opcional)
                                        </label>
                                        <select 
                                            className="input-field"
                                            style={{ appearance: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                                            value={selectedClientId}
                                            onChange={e => setSelectedClientId(e.target.value)}
                                        >
                                            <option value="">Nenhum cliente selecionado</option>
                                            {Array.isArray(clients) && clients.map(u => (
                                                <option key={u.id} value={u.id.toString()} style={{ color: 'var(--text-primary)', background: 'var(--card-bg-subtle)' }}>
                                                    {u.name} ({u.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
 
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--card-bg-subtle)', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 900 }}>Gerar em massa?</span>
                                    <div 
                                        onClick={() => setIsBulk(!isBulk)}
                                        style={{ 
                                            width: '44px', height: '24px', background: isBulk ? 'var(--primary-color)' : 'var(--surface-border-subtle)', 
                                            borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' 
                                        }}
                                    >
                                        <div style={{ 
                                            width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', 
                                            top: '3px', left: isBulk ? '23px' : '3px', transition: 'all 0.3s' 
                                        }} />
                                    </div>
                                </div>
 
                                {!isBulk ? (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                Título do Link (Opcional)
                                            </label>
                                            <input 
                                                className="input-field"
                                                placeholder="Ex: Campanha de Outono"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                            />
                                        </div>
 
                                        <div>
                                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                URL Original
                                            </label>
                                            <input 
                                                className="input-field"
                                                placeholder="https://seu-link-longo.com/qualquer-coisa"
                                                required={!isBulk}
                                                value={originalUrl}
                                                onChange={e => setOriginalUrl(e.target.value)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                Lista de Links
                                            </label>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {['B', 'C'].map(pref => (
                                                    <button 
                                                        key={pref}
                                                        type="button" 
                                                        onClick={() => handleBulkBatch(pref)}
                                                        style={{ background: 'rgba(172, 248, 0, 0.05)', border: '1px solid rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', fontSize: '8px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                       +10 {pref}
                                                    </button>
                                                ))}
                                                <button 
                                                    type="button" 
                                                    onClick={() => setBulkLinks([{ title: '', url: '' }])}
                                                    style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '8px', fontWeight: 900, padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                   Limpar
                                                </button>
                                            </div>
                                        </div>
                                        {bulkLinks.map((link, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <input 
                                                        className="input-field"
                                                        style={{ padding: '8px 12px', fontSize: '12px' }}
                                                        placeholder={`Título ${idx === 0 ? '(B1, C1...)' : ''}`}
                                                        value={link.title}
                                                        onChange={e => {
                                                            const newLinks = [...bulkLinks];
                                                            newLinks[idx].title = e.target.value;
                                                            setBulkLinks(newLinks);
                                                        }}
                                                    />
                                                    <div style={{ position: 'relative' }}>
                                                        <input 
                                                            className="input-field"
                                                            style={{ padding: '8px 12px', paddingRight: idx === 0 ? '80px' : '12px', fontSize: '12px' }}
                                                            placeholder="https://URL-Original..."
                                                            value={link.url}
                                                            onChange={e => {
                                                                let val = e.target.value;
                                                                if (val && !val.startsWith('http') && val.length > 5) {
                                                                    val = 'https://' + val;
                                                                }
                                                                const newLinks = [...bulkLinks];
                                                                newLinks[idx].url = val;
                                                                setBulkLinks(newLinks);
                                                            }}
                                                        />
                                                        {idx === 0 && (
                                                            <button 
                                                                type="button"
                                                                onClick={handleReplicateAll}
                                                                style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', background: 'var(--primary-color)', border: 'none', borderRadius: '10px', color: 'black', fontSize: '9px', fontWeight: 900, padding: '0 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                            >
                                                                <Zap size={10} /> REPLICAR
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {bulkLinks.length > 1 && (
                                                    <button 
                                                        type="button"
                                                        className="icon-button delete"
                                                        style={{ marginTop: '8px' }}
                                                        onClick={() => setBulkLinks(bulkLinks.filter((_, i) => i !== idx))}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button 
                                            type="button"
                                            onClick={() => setBulkLinks([...bulkLinks, { title: '', url: '' }])}
                                            style={{ 
                                                padding: '10px', borderRadius: '12px', background: 'var(--card-bg-subtle)', 
                                                border: '1px dashed var(--surface-border-subtle)', color: 'var(--text-muted)',
                                                fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                            }}
                                        >
                                            <Plus size={14} /> Adicionar outro link
                                        </button>
                                    </div>
                                )}
 
                                <button type="submit" disabled={isCreating} className="action-btn primary-btn" style={{ marginTop: '10px', width: '100%' }}>
                                    <Zap size={16} />
                                    {isCreating ? 'Encurtando...' : isBulk ? `Gerar ${bulkLinks.length} Links` : 'Encurtar Link'}
                                </button>
                            </form>
                        </div>
                     )}

                    <div style={{ minWidth: 0 }}>
                        {/* Quick Stats Overview */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '20px', 
                            marginBottom: '32px',
                            animation: 'fadeInUp 0.6s ease-out'
                        }}>
                                {/* Total Clicks Card */}
                                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(172, 248, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                        <MousePointer2 size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {(!filterClientId && user?.role !== 'CLIENT') ? 'Cliques Globais' : 'Cliques Totais'}
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>
                                            {isLoading ? '...' : (stats?.totalClicks || 0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Links Card */}
                                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                        <LinkIcon size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {(!filterClientId && user?.role !== 'CLIENT') ? 'Links (Sistema)' : 'Links Encurtados'}
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>
                                            {isLoading ? '...' : totalLinksCount}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Device Card */}
                                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                                        <Smartphone size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dispositivo Top</div>
                                        <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                            {isStatsLoading ? '...' : (stats?.devices?.[0]?.device_type || 'N/A')}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Geo Card */}
                                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Origem Principal</div>
                                        <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>
                                            {isStatsLoading ? '...' : (stats?.geo?.[0]?.country || 'Brasil')}
                                        </div>
                                    </div>
                                </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Seus Links</h2>
                                <button 
                                    onClick={toggleSelectAll}
                                    style={{ 
                                        background: 'var(--card-bg-subtle)', 
                                        border: '1px solid var(--surface-border-subtle)',
                                        borderRadius: '8px',
                                        padding: '4px 12px',
                                        fontSize: '11px',
                                        fontWeight: 900,
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                >
                                    {selectedLinkIds.length === filteredLinks.length && filteredLinks.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                                    Selecionar Tudo
                                </button>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                {/* Date Filters */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card-bg-subtle)', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--surface-border-subtle)' }}>
                                    <Calendar size={14} style={{ opacity: 0.3 }} />
                                    <input 
                                        type="date" 
                                        className="input-field" 
                                        style={{ background: 'transparent', border: 'none', padding: '0', height: '32px', fontSize: '11px', width: 'auto' }}
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                    <span style={{ fontSize: '11px', opacity: 0.3 }}>até</span>
                                    <input 
                                        type="date" 
                                        className="input-field" 
                                        style={{ background: 'transparent', border: 'none', padding: '0', height: '32px', fontSize: '11px', width: 'auto' }}
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                    />
                                    {(startDate || endDate) && (
                                        <button onClick={() => { setStartDate(''); setEndDate(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            <XCircle size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Client Filter for Admin/Employee */}
                                {['ADMIN', 'EMPLOYEE'].includes(user?.role || '') && (
                                    <div style={{ position: 'relative' }}>
                                        <Users size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                        <select 
                                            className="input-field"
                                            style={{ 
                                                padding: '8px 12px 8px 36px', 
                                                fontSize: '12px', 
                                                width: '180px',
                                                height: '40px',
                                                background: 'var(--card-bg-subtle)'
                                            }}
                                            value={filterClientId}
                                            onChange={e => setFilterClientId(e.target.value)}
                                        >
                                            <option value="">Filtrar Cliente</option>
                                            {clients.map(u => (
                                                <option key={u.id} value={u.id.toString()}>
                                                    {u.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                    <input 
                                        placeholder="Buscar..."
                                        style={{ 
                                            background: 'var(--card-bg-subtle)', 
                                            border: '1px solid var(--surface-border-subtle)',
                                            borderRadius: '12px',
                                            padding: '10px 16px 10px 44px',
                                            fontSize: '13px',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            width: '160px',
                                            height: '40px'
                                        }}
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bulk Action Toolbar */}
                        {selectedLinkIds.length > 0 && (
                            <div style={{ 
                                position: 'sticky', 
                                top: '24px', 
                                zIndex: 100, 
                                background: 'var(--primary-color)', 
                                color: 'black',
                                borderRadius: '16px',
                                padding: '12px 24px',
                                marginBottom: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 10px 30px rgba(172, 248, 0, 0.3)',
                                animation: 'slideInTop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 900 }}>
                                        {selectedLinkIds.length} selecionado(s)
                                    </div>
                                    <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)' }} />
                                    <button 
                                        onClick={handleBulkDelete}
                                        style={{ background: 'none', border: 'none', color: 'black', fontWeight: 900, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Trash2 size={16} /> Excluir
                                    </button>
                                    {user?.role !== 'CLIENT' && (
                                        <button 
                                            onClick={() => setShowBulkAssociateModal(true)}
                                            style={{ background: 'none', border: 'none', color: 'black', fontWeight: 900, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <Users size={16} /> Vincular Cliente
                                        </button>
                                    )}
                                </div>
                                <button onClick={() => setSelectedLinkIds([])} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <XCircle size={18} />
                                </button>
                            </div>
                        )}

                        {isLoading ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Carregando links...
                            </div>
                        ) : filteredLinks.length === 0 ? (
                            <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center' }}>
                                <Globe size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
                                <h3 style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 900 }}>Nenhum link encontrado</h3>
                                <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', opacity: 0.5, fontSize: '14px' }}>
                                    Comece criando seu primeiro link encurtado.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {filteredLinks.map((l) => (
                                    <div key={l.id} className={`link-item ${selectedLinkIds.includes(l.id) ? 'selected' : ''}`} style={{ position: 'relative', borderLeft: selectedLinkIds.includes(l.id) ? '4px solid var(--primary-color)' : 'none' }}>
                                        {/* Checkbox */}
                                        <div 
                                            onClick={() => toggleSelectLink(l.id)}
                                            style={{ 
                                                padding: '0 24px', 
                                                cursor: 'pointer', 
                                                color: selectedLinkIds.includes(l.id) ? 'var(--primary-color)' : 'var(--text-muted)',
                                                opacity: selectedLinkIds.includes(l.id) ? 1 : 0.3,
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            {selectedLinkIds.includes(l.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>
                                                    {window.location.host}/l/{l.short_code}
                                                </span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.5 }}>•</span>
                                                <div style={{ 
                                                     maxWidth: '100%', 
                                                     overflow: 'hidden', 
                                                     textOverflow: 'ellipsis', 
                                                     whiteSpace: 'nowrap',
                                                     fontSize: '11px',
                                                     color: 'var(--text-muted)'
                                                 }}>
                                                     {l.original_url}
                                                 </div>
                                            </div>
                                            
                                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                                {l.client_name && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Users size={12} className="text-primary-color" />
                                                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                            Vínculo: <span className="text-primary-color">{l.client_name}</span>
                                                        </span>
                                                    </div>
                                                 )}
                                                 
                                                 {user?.role !== 'CLIENT' && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <select 
                                                            value={l.target_user_id || ''} 
                                                            onChange={async (e) => {
                                                                const val = e.target.value;
                                                                await dbService.updateShortLink(l.id, { target_user_id: val ? parseInt(val) : null });
                                                                fetchLinks();
                                                            }}
                                                            style={{ 
                                                                fontSize: '10px', 
                                                                background: 'var(--card-bg-subtle)', 
                                                                border: '1px solid var(--surface-border-subtle)', 
                                                                color: 'var(--text-primary)',
                                                                borderRadius: '6px',
                                                                padding: '4px 8px',
                                                                cursor: 'pointer',
                                                                outline: 'none',
                                                                fontWeight: 700
                                                            }}
                                                        >
                                                            <option value="" style={{ background: 'var(--card-bg-subtle)' }}>{l.target_user_id ? 'Alterar Vínculo' : 'Vincular a Cliente'}</option>
                                                            {clients.map(u => (
                                                                <option key={u.id} value={u.id} style={{ background: 'var(--card-bg-subtle)', color: 'var(--text-primary)' }}>
                                                                    {u.name}
                                                                 </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                 )}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'center', padding: '0 20px', minWidth: '80px' }}>
                                            <div className="click-count">{l.clicks || 0}</div>
                                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Cliques</div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="icon-button" 
                                                title="Copiar Link"
                                                onClick={() => copyToClipboard(l.short_code)}
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button 
                                                className="icon-button" 
                                                title="Ver Estatísticas"
                                                onClick={() => navigate(`/link-stats/${l.id}`)}
                                            >
                                                <BarChart3 size={18} />
                                            </button>
                                            {user?.role !== 'CLIENT' && (
                                                <button 
                                                    className="icon-button delete" 
                                                    title="Excluir Link"
                                                    onClick={() => handleDeleteLink(l.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ paddingLeft: '10px' }}>
                                            <ChevronRight size={20} style={{ opacity: 0.2 }} />
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '12px', 
                                        marginTop: '32px',
                                        padding: '20px',
                                        background: 'var(--card-bg-subtle)',
                                        borderRadius: '20px',
                                        border: '1px solid var(--surface-border-subtle)'
                                    }}>
                                        <button 
                                            disabled={currentPage === 1}
                                            onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo(0,0); }}
                                            className="icon-button"
                                            style={{ opacity: currentPage === 1 ? 0.3 : 1, width: 'auto', padding: '0 16px' }}
                                        >
                                            Anterior
                                        </button>
                                        
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {[...Array(totalPages)].map((_, i) => {
                                                const p = i + 1;
                                                // Show only near current page
                                                if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
                                                    return (
                                                        <button 
                                                            key={p}
                                                            onClick={() => { setCurrentPage(p); window.scrollTo(0,0); }}
                                                            className={`icon-button ${currentPage === p ? 'active' : ''}`}
                                                            style={{ 
                                                                width: '36px', 
                                                                height: '36px',
                                                                background: currentPage === p ? 'var(--primary-color)' : 'transparent',
                                                                color: currentPage === p ? 'black' : 'var(--text-primary)',
                                                                border: currentPage === p ? 'none' : '1px solid var(--surface-border-subtle)',
                                                                fontWeight: 900
                                                            }}
                                                        >
                                                            {p}
                                                        </button>
                                                    );
                                                }
                                                if (p === currentPage - 3 || p === currentPage + 3) {
                                                    return <span key={p} style={{ opacity: 0.3 }}>...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <button 
                                            disabled={currentPage === totalPages}
                                            onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo(0,0); }}
                                            className="icon-button"
                                            style={{ opacity: currentPage === totalPages ? 0.3 : 1, width: 'auto', padding: '0 16px' }}
                                        >
                                            Próximo
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Associate Modal */}
            {showBulkAssociateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '32px', animation: 'scaleIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(172, 248, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 900 }}>Vincular em Massa</h3>
                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{selectedLinkIds.length} links selecionados</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 900, marginBottom: '8px', color: 'var(--text-muted)' }}>Selecionar Cliente</label>
                            <select 
                                className="input-field" 
                                value={bulkAssociateTargetId}
                                onChange={e => setBulkAssociateTargetId(e.target.value)}
                                style={{ background: 'var(--card-bg-subtle)' }}
                            >
                                <option value="">Escolha um cliente...</option>
                                {clients.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowBulkAssociateModal(false)} className="action-btn" style={{ flex: 1 }}>Cancelar</button>
                            <button onClick={handleBulkAssociate} className="action-btn primary-btn" style={{ flex: 1 }} disabled={!bulkAssociateTargetId}>
                                <Check size={16} /> Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @media (max-width: 768px) {
                    .stats-overview {
                        flex-direction: column !important;
                        gap: 12px !important;
                    }
                    .stats-overview > div {
                        width: 100% !important;
                    }
                    .filter-bar {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 12px !important;
                    }
                    .filter-bar > div, .filter-bar input, .filter-bar select {
                        width: 100% !important;
                    }
                    .link-item {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 16px !important;
                        padding: 20px !important;
                    }
                    .link-item > div:last-child {
                        width: 100% !important;
                        justify-content: flex-start !important;
                        border-top: 1px solid var(--surface-border-subtle);
                        padding-top: 16px !important;
                    }
                    .click-count-container {
                        text-align: left !important;
                        padding: 0 !important;
                        margin-bottom: 8px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default LinkShortener;
