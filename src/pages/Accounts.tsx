import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, RefreshCcw, Layers, Search, Eye, AlertTriangle, Smartphone, Send, Calendar, BookMarked, FileEdit, LayoutDashboard, ShieldCheck, ExternalLink } from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

interface InfobipTemplate {
    id: string;
    name: string;
    language: string;
    category: string;
    status: string;
    structure: any;
    rejectionReason?: string;
    lastUpdatedAt?: string;
    createdAt?: string;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-4 mt-8">
            <button
                className="btn btn-secondary"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                style={{ height: '44px', width: '44px', borderRadius: '12px', padding: 0, opacity: currentPage === 1 ? 0.3 : 1 }}
            >
                ←
            </button>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                PÁGINA <span style={{ color: 'var(--primary-color)' }}>{currentPage}</span> DE {totalPages}
            </span>
            <button
                className="btn btn-secondary"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                style={{ height: '44px', width: '44px', borderRadius: '12px', padding: 0, opacity: currentPage === totalPages ? 0.3 : 1 }}
            >
                →
            </button>
        </div>
    );
};

const Accounts = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    
    // --- API / CONFIG STATE ---
    const [apiKey, setApiKey] = useState(user?.infobip_key || '');
    const [senderNumber, setSenderNumber] = useState(user?.infobip_sender || '');
    const [senders, setSenders] = useState<any[]>([]);
    const [recentNumbers, setRecentNumbers] = useState<string[]>([]);
    const [isLoadingSenders, setIsLoadingSenders] = useState(false);
    
    // Load state from User on mount
    useEffect(() => {
        if (user?.infobip_key) setApiKey(user.infobip_key);
        if (user?.infobip_sender) setSenderNumber(user.infobip_sender);

        const savedRecents = localStorage.getItem('recent_senders');
        if (savedRecents) setRecentNumbers(JSON.parse(savedRecents));
    }, [user]);

    // Save to Profile on change
    useEffect(() => {
        if (apiKey && apiKey !== user?.infobip_key) {
            dbService.updateProfile({ id: user?.id, infobip_key: apiKey }).then(updated => {
                if (updated && !updated.error) setUser(updated);
            });
            fetchSenders();
        }
    }, [apiKey]);

    useEffect(() => {
        if (senderNumber && senderNumber !== user?.infobip_sender) {
            dbService.updateProfile({ id: user?.id, infobip_sender: senderNumber }).then(updated => {
                if (updated && !updated.error) setUser(updated);
            });
            addToRecents(senderNumber);
        }
    }, [senderNumber]);

    const addToRecents = (num: string) => {
        if (!num || num.length < 5) return;
        setRecentNumbers(prev => {
            const filtered = prev.filter(n => n !== num);
            const newList = [num, ...filtered].slice(0, 5); // Keep last 5
            localStorage.setItem('recent_senders', JSON.stringify(newList));
            return newList;
        });
    };

    const fetchSenders = async () => {
        if (!apiKey) return;
        setIsLoadingSenders(true);
        try {
            const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/1/senders`, {
                headers: {
                    'Authorization': `App ${apiKey}`,
                    'Accept': 'application/json'
                }
            });
            const result = await response.json();
            if (response.ok && result.senders) {
                setSenders(result.senders);
            }
        } catch (err) {
            console.error('Error fetching senders:', err);
        } finally {
            setIsLoadingSenders(false);
        }
    };

    const [templates, setTemplates] = useState<InfobipTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
    const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'RASCUNHOS'>('TEMPLATES');
    const [drafts, setDrafts] = useState<any[]>([]);

    // Pagination
    const [templatesPage, setTemplatesPage] = useState(1);
    const [draftsPage, setDraftsPage] = useState(1);
    const itemsPerPage = 8;

    const fetchTemplates = async () => {
        if (!apiKey || !senderNumber) return;
        setIsLoading(true);
        try {
            const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/2/senders/${senderNumber}/templates?_t=${Date.now()}`, {
                headers: {
                    'Authorization': `App ${apiKey}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok && data.templates) {
                const sorted = data.templates.map((t: any) => ({
                    ...t,
                    rejectionReason: t.rejectionReason || t.status?.description || t.reason || null
                })).sort((a: any, b: any) =>
                    new Date(b.lastUpdatedAt || b.lastUpdateAt || b.createdAt || 0).getTime() -
                    new Date(a.lastUpdatedAt || a.lastUpdateAt || a.createdAt || 0).getTime()
                );
                setTemplates(sorted);
                setLastUpdated(new Date());
            } else if (!response.ok) {
                const err = data;
                console.error('Fetch Templates Error:', err);
                alert(`Erro ao sincronizar: ${err.errorMessage || err.message || JSON.stringify(err)}`);
            }
        } catch (error: any) {
            console.error('Erro ao buscar templates:', error);
            alert(`Erro de conexão: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (apiKey && senderNumber) {
            fetchTemplates();
            const interval = setInterval(fetchTemplates, 20000); // Relaxed for quota
            return () => clearInterval(interval);
        }

        // Fetch drafts from DB
        dbService.getPlannerDrafts().then(dbDrafts => {
            setDrafts(dbDrafts.filter((d: any) => d._draft === true));
        });
    }, [senderNumber, apiKey]);

    const approvedCount = templates.filter(t => t.status === 'APPROVED').length;
    const pendingCount = templates.filter(t => t.status !== 'APPROVED' && t.status !== 'REJECTED').length;
    const rejectedCount = templates.filter(t => t.status === 'REJECTED').length;

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = (t.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
            (t.id || '').toLowerCase().includes((searchTerm || '').toLowerCase());
        const status = (t.status || '').toUpperCase();
        if (filterStatus === 'APPROVED') return matchesSearch && status === 'APPROVED';
        if (filterStatus === 'PENDING') return matchesSearch && (status === 'PENDING' || status === 'IN_REVIEW' || status === 'REVIEW');
        if (filterStatus === 'REJECTED') return matchesSearch && status === 'REJECTED';
        return matchesSearch;
    });

    // Reset pagination on filter
    useEffect(() => {
        setTemplatesPage(1);
    }, [searchTerm, filterStatus]);

    const getStatusBadge = (status: string, reason?: string) => {
        const s = status.toUpperCase();
        if (s === 'APPROVED') return <span className="badge-premium" style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(172, 248, 0, 0.2)' }}>APROVADO</span>;
        if (s === 'PENDING' || s === 'IN_REVIEW' || s === 'REVIEW') return <span className="badge-premium" style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.2)' }}>PENDENTE</span>;
        if (s === 'REJECTED') return (
            <div className="flex flex-col gap-1 items-start">
                <span className="badge-premium" style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.2)' }}>REJEITADO</span>
                {reason && <span style={{ fontSize: '0.6rem', color: '#ff4d4d', opacity: 0.8, maxWidth: '150px' }}>{reason}</span>}
            </div>
        );
        return <span className="badge-premium" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>{status}</span>;
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '---';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="animate-fade-in accounts-page" style={{ paddingBottom: '80px' }}>
            <style>{`
                .header-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 32px; }
                .search-bar-container { position: relative; flex: 1; min-width: 280px; }
                .table-container { 
                    overflow-x: auto; 
                    border-radius: 20px; 
                    border: 1px solid var(--surface-border);
                    background: var(--card-bg-subtle);
                    margin-top: 24px;
                }
                table { width: 100%; border-collapse: collapse; }
                th { 
                    padding: 18px 24px; 
                    background: var(--card-bg-subtle);
                    color: var(--text-secondary); 
                    font-size: 0.8rem; 
                    text-transform: uppercase; 
                    font-weight: 700;
                    letter-spacing: 1px;
                }
                td { padding: 18px 24px; border-bottom: 1px solid var(--surface-border); font-size: 0.95rem; }
                .hover-row:hover { background: rgba(172, 248, 0, 0.02); }
                
                @media (max-width: 768px) {
                    .header-row { flex-direction: column; align-items: flex-start; }
                    .stats-grid { grid-template-columns: 1fr 1fr; }
                    .filter-tabs { width: 100%; overflow-x: auto; white-space: nowrap; }
                    .config-row { flex-direction: column; align-items: stretch !important; }
                    .table-container { border-radius: 0; margin-left: -32px; margin-right: -32px; width: calc(100% + 64px); }
                }
                
                .recent-tag {
                    padding: 8px 16px;
                    background: rgba(172, 248, 0, 0.08);
                    border: 1px solid rgba(172, 248, 0, 0.15);
                    border-radius: 14px;
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: var(--primary-color);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .recent-tag:hover {
                    background: var(--primary-color);
                    color: black;
                    transform: translateY(-2px);
                    box-shadow: 0 0 15px rgba(172, 248, 0, 0.3);
                }
                .config-command-center {
                    background: var(--command-center-bg);
                    border: 1px solid var(--surface-border-subtle);
                    border-radius: 24px;
                    padding: 32px;
                    margin-bottom: 32px;
                    box-shadow: var(--shadow-md);
                }
            `}</style>

            <div className="flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', margin: 0 }}>Monitor de WhatsApp</h1>
                        <p className="subtitle">Gerencie seus templates autorizados pela Meta via Infobip</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            className="btn" 
                            onClick={() => window.open('https://portal.infobip.com/whatsapp/templates', '_blank')}
                            style={{ borderRadius: '12px', padding: '10px 24px', background: '#f97316', color: 'white', fontWeight: 800, border: 'none' }}
                        >
                            <Layers size={18} /> IR PARA INFOBIP
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => navigate('/control')}
                            style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 800 }}
                        >
                            <ShieldCheck size={18} /> VER AÇÕES
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => setActiveTab('TEMPLATES')}
                        className={`btn flex-1 py-4 flex items-center justify-center gap-3 ${activeTab === 'TEMPLATES' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                            borderRadius: '16px',
                            fontWeight: 900,
                            fontSize: '1rem',
                            color: activeTab === 'TEMPLATES' ? 'black' : 'var(--text-primary)',
                            border: activeTab === 'TEMPLATES' ? 'none' : '1px solid var(--surface-border-subtle)'
                        }}
                    >
                        <LayoutDashboard size={20} /> MEUS TEMPLATES (META)
                    </button>
                    <button
                        onClick={() => setActiveTab('RASCUNHOS')}
                        className={`btn flex-1 py-4 flex items-center justify-center gap-3 ${activeTab === 'RASCUNHOS' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                            borderRadius: '16px',
                            fontWeight: 900,
                            fontSize: '1rem',
                            color: activeTab === 'RASCUNHOS' ? 'black' : 'var(--text-primary)',
                            border: activeTab === 'RASCUNHOS' ? 'none' : '1px solid var(--surface-border-subtle)'
                        }}
                    >
                        <BookMarked size={20} /> PRONTOS PARA DISPARO (RASCUNHOS)
                    </button>
                </div>
            </div>

            {activeTab === 'TEMPLATES' ? (
                <div className="animate-fade-in">
                    <div className="stats-grid">
                        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary-color)', padding: '20px' }}>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>APROVADOS</p>
                            <div className="flex items-center justify-between mt-2">
                                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{approvedCount}</h2>
                                <CheckCircle size={28} color="var(--primary-color)" opacity={0.4} />
                            </div>
                        </div>
                        <div className="glass-card" style={{ borderLeft: '4px solid #facc15', padding: '20px' }}>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>PENDENTES</p>
                            <div className="flex items-center justify-between mt-2">
                                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{pendingCount}</h2>
                                <Layers size={28} color="#facc15" opacity={0.4} />
                            </div>
                        </div>
                        <div className="glass-card" style={{ borderLeft: '4px solid #ff4d4d', padding: '20px' }}>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>REJEITADOS</p>
                            <div className="flex items-center justify-between mt-2">
                                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{rejectedCount}</h2>
                                <AlertTriangle size={28} color="#ff4d4d" opacity={0.4} />
                            </div>
                        </div>
                        <div className="glass-card" style={{ background: 'var(--card-bg-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
                            <div className="flex items-center gap-2">
                                <div style={{ width: 8, height: 8, background: 'var(--primary-color)', borderRadius: '50%', boxShadow: '0 0 8px var(--primary-color)' }}></div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>LIVE SYNC</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Última vez: {lastUpdated?.toLocaleTimeString()}</span>
                        </div>
                    </div>

                    <div className="config-command-center mt-8 animate-fade-in mt-4">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-8 config-row ">
                                <div className="flex items-center gap-4 flex-1 ">
                                    <div style={{ background: 'rgba(172, 248, 0, 0.1)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(172, 248, 0, 0.2)' }}>
                                        <Smartphone size={32} color="var(--primary-color)" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Remetente Selecionado (WABA)</span>
                                        <input
                                            list="monitor-senders"
                                            className={`input-field ${isLoadingSenders ? 'opacity-30' : ''}`}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '2px solid var(--primary-color)',
                                                color: 'var(--text-primary)',
                                                fontSize: '1.8rem',
                                                fontWeight: 900,
                                                outline: 'none',
                                                padding: '8px 0',
                                                width: '100%',
                                                letterSpacing: '-0.5px'
                                            }}

                                            value={senderNumber}
                                            onChange={e => setSenderNumber(e.target.value)}
                                            placeholder="Escolha ou digite o número..."
                                        />
                                        <datalist id="monitor-senders">
                                            {senders.map((s: any) => (
                                                <option key={s.sender} value={s.sender}>{s.senderName || s.sender}</option>
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 opacity-30">
                                    <div className="flex flex-col text-right">
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>API Status</span>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Conexão Segura</span>
                                    </div>
                                    <CheckCircle size={24} color="var(--primary-color)" />
                                </div>
                            </div>

                            {recentNumbers.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <BookMarked size={14} color="var(--primary-color)" />
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Favoritos Recentes</span>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {recentNumbers.map(num => (
                                            <button
                                                key={num}
                                                className="recent-tag hover-lift"
                                                onClick={() => setSenderNumber(num)}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 mt-8" style={{ flexWrap: 'wrap' }}>
                        <div className="filter-tabs" style={{ display: 'flex', background: 'var(--card-bg-subtle)', borderRadius: '12px', padding: '4px', border: '1px solid var(--surface-border-subtle)' }}>
                            {[
                                { id: 'ALL', label: 'Todos', count: templates.length },
                                { id: 'APPROVED', label: 'Aprovados', count: approvedCount },
                                { id: 'PENDING', label: 'Pendentes', count: pendingCount },
                                { id: 'REJECTED', label: 'Rejeitados', count: rejectedCount }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterStatus(tab.id as any)}
                                    style={{
                                        padding: '8px 20px',
                                        border: 'none',
                                        background: filterStatus === tab.id ? 'rgba(172, 248, 0, 0.1)' : 'transparent',
                                        color: filterStatus === tab.id ? 'var(--primary-color)' : 'var(--text-muted)',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {tab.label}
                                    <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        <div className="search-bar-container">
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)', opacity: 0.5 }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '48px', background: 'var(--card-bg-subtle)', fontSize: '0.9rem', borderRadius: '12px' }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Filtrar por nome ou identificador..."
                            />
                        </div>
                    </div>

                    <div className="table-container shadow-glass">
                        <table>
                            <thead>
                                <tr>
                                    <th>TEMPLATE</th>
                                    <th>CATEGORIA</th>
                                    <th>STATUS META</th>
                                    <th>ATUALIZADO</th>
                                    <th style={{ textAlign: 'right' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && templates.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '80px', textAlign: 'center' }}>
                                        <RefreshCcw className="animate-spin mb-4" size={40} color="var(--primary-color)" style={{ margin: '0 auto' }} />
                                        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Syncing with Meta Cloud...</p>
                                    </td></tr>
                                ) : filteredTemplates.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <Search size={40} className="mb-4" opacity={0.1} style={{ margin: '0 auto' }} />
                                        <p>Nenhum modelo encontrado.</p>
                                    </td></tr>
                                ) : (
                                    filteredTemplates.slice((templatesPage - 1) * itemsPerPage, templatesPage * itemsPerPage).map((t, index) => (
                                        <tr key={index} className="hover-row">
                                            <td>
                                                <div className="flex flex-col">
                                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{t.name}</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', opacity: 0.6, fontFamily: 'monospace', marginTop: '2px' }}>{t.id.slice(0, 15)}...</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.category}</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>pt_BR</span>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(t.status, t.rejectionReason)}</td>
                                            <td>
                                                <div className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    <Calendar size={12} opacity={0.4} />
                                                    {formatDate(t.lastUpdatedAt || t.createdAt)}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '10px', minWidth: '40px', background: '#f97316', color: 'white', borderRadius: '10px', border: 'none' }}
                                                        onClick={() => window.open(`https://portal.infobip.com/whatsapp/templates/detail/${t.name}`, '_blank')}
                                                        title="Ver no Infobip"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '10px', minWidth: '40px', background: 'var(--card-bg-subtle)', borderRadius: '10px' }}
                                                        onClick={() => alert(`JSON Structure:\n\n${JSON.stringify(t.structure, null, 2)}`)}
                                                        title="View Structure"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {t.status.toUpperCase() === 'APPROVED' && (
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ padding: '10px', minWidth: '40px', borderRadius: '10px' }}
                                                            onClick={() => navigate(`/dispatch`, { state: { template: t, sender: senderNumber, key: apiKey } })}
                                                            title="Go to Dispatch"
                                                        >
                                                            <Send size={16} color="black" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={templatesPage}
                        totalPages={Math.ceil(filteredTemplates.length / itemsPerPage)}
                        onPageChange={setTemplatesPage}
                    />
                </div>
            ) : (
                <div className="animate-fade-in flex-col gap-8">
                    <div className="glass-card flex-col" style={{ padding: '32px' }}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--primary-color)', paddingLeft: '20px', margin: 0, fontWeight: 900 }}>Prontos para Disparo</h2>
                            <div className="badge badge-success" style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', padding: '8px 16px', borderRadius: '12px', fontWeight: 900 }}>
                                {drafts.length} AGUARDANDO
                            </div>
                        </div>

                        {drafts.length > 0 ? (
                            <>
                                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                                    {drafts.slice((draftsPage - 1) * itemsPerPage, draftsPage * itemsPerPage).map((draft, idx) => (
                                        <div key={idx} className="glass-card flex-col p-6 hover-lift" style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border)', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}>
                                            <div className="flex items-start justify-between mb-6">
                                                <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '14px', borderRadius: '16px' }}>
                                                    <BookMarked size={28} />
                                                </div>
                                                <div className="flex-col items-end">
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Criado em</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{new Date(draft.savedAt || draft.timestamp).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex-col gap-2 mb-8">
                                                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{draft.label}</h4>
                                                <div className="flex items-center gap-2">
                                                    <Layers size={14} color="var(--text-muted)" />
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{draft.templateName}</span>
                                                </div>
                                                {draft.tag && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Smartphone size={14} color="var(--primary-color)" />
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 800 }}>LOTE: {draft.tag}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-4 mt-auto">
                                                <button
                                                    className="btn btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
                                                    onClick={() => navigate('/dispatch', { state: { draft: draft, sender: senderNumber, key: apiKey } })}
                                                    style={{ fontSize: '0.8rem', fontWeight: 800, borderRadius: '14px' }}
                                                >
                                                    <FileEdit size={16} /> EDITAR
                                                </button>
                                                <button
                                                    className="btn flex-1 flex items-center justify-center gap-2 py-3"
                                                    onClick={() => navigate('/dispatch', { state: { draft: draft, autoSend: true, sender: senderNumber, key: apiKey } })}
                                                    style={{ background: '#f97316', color: 'white', border: 'none', fontSize: '0.8rem', fontWeight: 900, borderRadius: '14px' }}
                                                >
                                                    <Send size={16} /> DISPARAR
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Pagination
                                    currentPage={draftsPage}
                                    totalPages={Math.ceil(drafts.length / itemsPerPage)}
                                    onPageChange={setDraftsPage}
                                />
                            </>
                        ) : (
                            <div className="p-24 flex-col items-center justify-center gap-6 opacity-20" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <BookMarked size={100} strokeWidth={1} />
                                <div className="flex-col items-center gap-2">
                                    <p style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>Fila de rascunhos vazia</p>
                                    <p style={{ fontSize: '1rem', margin: 0 }}>Crie novos rascunhos no Quick Dispatch para gerenciar aqui.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export default Accounts;
