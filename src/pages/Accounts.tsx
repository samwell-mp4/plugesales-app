import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, RefreshCcw, Layers, Search, Eye, AlertTriangle, Smartphone, Send, Calendar, BookMarked, FileEdit, LayoutDashboard, ShieldCheck, ExternalLink, Clock } from 'lucide-react';
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
    const [useLuisHenrique, setUseLuisHenrique] = useState(false);

    const LUIS_HENRIQUE_KEY = '35a1621fff9a97453d02b0dbe043467e-9501a6c3-3289-4fb9-90b4-d16b18b48d47';
    const LUIS_HENRIQUE_BASE = '9kn66r.api-us.infobip.com';
    const DEFAULT_BASE = '8k6xv1.api-us.infobip.com';

    const effectiveApiKey = useLuisHenrique ? LUIS_HENRIQUE_KEY : apiKey;
    const effectiveBaseUrl = useLuisHenrique ? LUIS_HENRIQUE_BASE : DEFAULT_BASE;

    // Load state from User on mount
    useEffect(() => {
        if (user?.infobip_key) {
            setApiKey(user.infobip_key);
            // ADMIN: propaga automaticamente para settings globais (para todos os funcionários herdarem)
            if (user?.role === 'ADMIN') {
                dbService.getSettings().then(settings => {
                    if (!settings['infobip_key'] || settings['infobip_key'] !== user.infobip_key) {
                        dbService.saveSetting('infobip_key', user.infobip_key!);
                    }
                });
            }
        } else if (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') {
            // Fallback: carrega as configurações globais
            dbService.getSettings().then(settings => {
                if (settings['infobip_key']) setApiKey(settings['infobip_key']);
                if (settings['infobip_sender']) setSenderNumber(settings['infobip_sender']);
            });
        }
        if (user?.infobip_sender) {
            setSenderNumber(user.infobip_sender);
            // ADMIN: propaga o sender para settings globais também
            if (user?.role === 'ADMIN') {
                dbService.getSettings().then(settings => {
                    if (!settings['infobip_sender'] || settings['infobip_sender'] !== user.infobip_sender) {
                        dbService.saveSetting('infobip_sender', user.infobip_sender!);
                    }
                });
            }
        }

        const savedRecents = localStorage.getItem('recent_senders');
        if (savedRecents) setRecentNumbers(JSON.parse(savedRecents));
    }, [user]);

    // Save to Profile on change
    useEffect(() => {
        if (apiKey && apiKey !== user?.infobip_key) {
            dbService.updateProfile({ id: user?.id, infobip_key: apiKey }).then(updated => {
                if (updated && !updated.error) setUser(updated);
            });
            // Se for ADMIN, salva também nas settings globais para todos os funcionários
            if (user?.role === 'ADMIN') {
                dbService.saveSetting('infobip_key', apiKey);
            }
        }
        // Quando muda a chave (ou o switch do Luis), recarrega remetentes
        fetchSenders();
    }, [effectiveApiKey]);

    useEffect(() => {
        if (!senderNumber || senderNumber === user?.infobip_sender) return;
        
        const handler = setTimeout(() => {
            dbService.updateProfile({ id: user?.id, infobip_sender: senderNumber }).then(updated => {
                if (updated && !updated.error) setUser(updated);
            });
            // Se for ADMIN, salva também nas settings globais
            if (user?.role === 'ADMIN') {
                dbService.saveSetting('infobip_sender', senderNumber);
            }
            addToRecents(senderNumber);
        }, 1000); // 1s delay for typing

        return () => clearTimeout(handler);
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
        if (!effectiveApiKey) return;
        setIsLoadingSenders(true);
        try {
            const response = await fetch(`https://${effectiveBaseUrl}/whatsapp/1/senders`, {
                headers: {
                    'Authorization': `App ${effectiveApiKey}`,
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
    // Pagination
    const [templatesPage, setTemplatesPage] = useState(1);
    const itemsPerPage = 8;

    const fetchTemplates = async () => {
        if (!effectiveApiKey || !senderNumber) return;
        setIsLoading(true);
        try {
            const response = await fetch(`https://${effectiveBaseUrl}/whatsapp/2/senders/${senderNumber}/templates?_t=${Date.now()}`, {
                headers: {
                    'Authorization': `App ${effectiveApiKey}`,
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
        if (effectiveApiKey && senderNumber && senderNumber.length >= 8) {
            const handler = setTimeout(() => {
                fetchTemplates();
            }, 800); // 800ms debounce to wait for user to finish typing
            
            const interval = setInterval(fetchTemplates, 45000); // Periodic refresh
            
            return () => {
                clearTimeout(handler);
                clearInterval(interval);
            };
        }
    }, [senderNumber, effectiveApiKey, effectiveBaseUrl]);

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
                .stats-grid { display: grid; margin-bottom: 20px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 32px; }
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
                .accounts-page { padding: 40px; }
                .hover-row:hover { background: rgba(172, 248, 0, 0.02); }
                
                @media (max-width: 1024px) {
                    .accounts-page { padding: 20px; padding-bottom: 120px; }
                    .header-row { flex-direction: column; align-items: flex-start; gap: 16px; }
                    /* MOBILE STATS CAROUSEL */
                    .stats-grid { 
                        display: flex !important;
                        overflow-x: auto !important;
                        padding: 10px 24px 30px !important;
                        margin: 0 -24px !important;
                        gap: 16px !important;
                        scroll-snap-type: x mandatory !important;
                        -webkit-overflow-scrolling: touch !important;
                        scrollbar-width: none;
                    }
                    .stats-grid::-webkit-scrollbar { display: none; }
                    .stats-grid > div {
                        flex: 0 0 260px !important;
                        scroll-snap-align: center !important;
                        background: rgba(255, 255, 255, 0.03) !important;
                        border-color: rgba(255, 255, 255, 0.08) !important;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
                    }

                    .filter-tabs { width: 100%; overflow-x: auto; white-space: nowrap; scrollbar-width: none; -ms-overflow-style: none; display: flex; gap: 8px; }
                    .filter-tabs::-webkit-scrollbar { display: none; }
                    .config-command-center { padding: 20px; border-radius: 20px; }
                    .config-row { flex-direction: column; align-items: stretch !important; }
                    
                    /* Table to Cards Conversion */
                    .table-container { 
                        background: transparent; 
                        border: none; 
                        box-shadow: none !important;
                    }
                    table, thead, tbody, th, td, tr { display: block; }
                    thead tr { position: absolute; top: -9999px; left: -9999px; }
                    tr { 
                        background: var(--card-bg-subtle); 
                        border: 1px solid var(--surface-border-subtle);
                        border-radius: 20px;
                        margin-bottom: 16px;
                        padding: 16px;
                    }
                    td { 
                        border: none;
                        padding: 12px 0;
                        position: relative;
                        font-size: 0.85rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    td::before { 
                        content: attr(data-label);
                        font-weight: 800;
                        color: var(--text-muted);
                        text-transform: uppercase;
                        font-size: 0.7rem;
                        text-align: left;
                    }
                    td:last-child { 
                        border-bottom: 0; 
                        border-top: 1px solid var(--surface-border-subtle); 
                        margin-top: 12px; 
                        padding-top: 20px; 
                        justify-content: center;
                    }
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
                    background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle);
                    border-radius: 24px;
                    padding: 32px;
                    margin-bottom: 32px;
                    box-shadow: var(--shadow-md);
                    backdrop-filter: blur(20px);
                }
                .premium-label {
                    font-size: 0.75rem;
                    color: var(--primary-color);
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    display: block;
                }
                .sync-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: var(--primary-color);
                }
            `}</style>

            <div className="mb-8">
                <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', margin: 0 }}>Monitor de WhatsApp</h1>
                <p className="subtitle" style={{ margin: 0 }}>Gerencie seus templates autorizados pela Meta via Infobip</p>
            </div>

            <div className="stats-grid">
                <div className="glass-card" style={{ borderLeft: '4px solid var(--primary-color)', padding: '20px' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>APROVADOS</p>
                    <div className="flex items-center justify-between mt-2">
                        <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{approvedCount}</h2>
                        <CheckCircle size={28} color="var(--primary-color)" opacity={0.4} />
                    </div>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid #facc15', padding: '20px' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>PENDENTES</p>
                    <div className="flex items-center justify-between mt-2">
                        <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{pendingCount}</h2>
                        <Layers size={28} color="#facc15" opacity={0.4} />
                    </div>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid var(--danger-color)', padding: '20px' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>REJEITADOS</p>
                    <div className="flex items-center justify-between mt-2">
                        <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{rejectedCount}</h2>
                        <AlertTriangle size={28} color="var(--danger-color)" opacity={0.4} />
                    </div>
                </div>
                <div className="glass-card flex flex-col justify-center" style={{ padding: '20px' }}>
                    <div className="sync-status">
                        <div style={{ width: 8, height: 8, background: 'var(--primary-color)', borderRadius: '50%', boxShadow: '0 0 8px var(--primary-color)' }}></div>
                        <span>LIVE SYNC ACTIVE</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Atualizado: {lastUpdated?.toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="flex items-center justify-between p-4 mb-6 glass-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--surface-border-subtle)' }}>
                <div className="flex flex-col">
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-color)' }}>Infobip do Luis Henrique?</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Alternar para credenciais de monitoramento específicas</span>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '52px', height: '26px', margin: 0 }}>
                    <input
                        type="checkbox"
                        style={{ opacity: 0, width: 0, height: 0 }}
                        checked={useLuisHenrique}
                        onChange={(e) => setUseLuisHenrique(e.target.checked)}
                    />
                    <span style={{
                        position: 'absolute', cursor: 'pointer', inset: 0,
                        backgroundColor: useLuisHenrique ? 'var(--primary-color)' : '#333',
                        transition: '.4s', borderRadius: '34px'
                    }}>
                        <span style={{
                            position: 'absolute', height: '20px', width: '20px', left: useLuisHenrique ? '28px' : '4px', bottom: '3px',
                            backgroundColor: useLuisHenrique ? 'black' : 'white', transition: '.4s', borderRadius: '50%'
                        }}></span>
                    </span>
                </label>
            </div>

            <section className="config-command-center mt-8">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-8 config-row">
                        <div className="flex items-center gap-4 flex-1">
                            <div style={{ background: 'rgba(172, 248, 0, 0.1)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(172, 248, 0, 0.2)' }}>
                                <Smartphone size={32} color="var(--primary-color)" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="premium-label">Remetente Selecionado (WABA)</span>
                                <input
                                    list="monitor-senders"
                                    className="input-field"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '2px solid var(--primary-color)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1.5rem',
                                        fontWeight: 900,
                                        outline: 'none',
                                        padding: '12px 0',
                                        width: '100%',
                                        letterSpacing: '-1px'
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

                        <div className="flex items-center gap-4 opacity-50">
                            <div className="flex flex-col text-right">
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>API Status</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Conexão Segura</span>
                            </div>
                            <ShieldCheck size={24} color="var(--primary-color)" />
                        </div>
                    </div>

                    {recentNumbers.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <BookMarked size={14} color="var(--primary-color)" />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Favoritos Recentes</span>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap" style={{ maxWidth: '100%', overflow: 'hidden' }}>
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
            </section>

            <div className="flex items-center justify-between gap-6 mt-12 mb-6" style={{ flexWrap: 'wrap' }}>
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
                                background: filterStatus === tab.id ? 'var(--primary-bg, rgba(172, 248, 0, 0.1))' : 'transparent',
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
                    <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)', opacity: 0.5 }} />
                    <input
                        className="input-field"
                        style={{ paddingLeft: '48px', background: 'var(--card-bg-subtle)', fontSize: '0.9rem', borderRadius: '12px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Filtrar por nome do template..."
                    />
                </div>
            </div>

            <div className="table-container" style={{ boxShadow: 'var(--shadow-md)' }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>TEMPLATE IDENTIFICADOR</th>
                            <th style={{ width: '15%' }}>CATEGORIA</th>
                            <th style={{ width: '15%' }}>STATUS META</th>
                            <th style={{ width: '20%' }}>SINCRONIZADO</th>
                            <th style={{ textAlign: 'right', width: '10%' }}>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && templates.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '100px', textAlign: 'center' }}>
                                <RefreshCcw className="animate-spin mb-4" size={40} color="var(--primary-color)" style={{ margin: '0 auto' }} />
                                <p style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px' }}>SINCRONIZANDO COM META CLOUD...</p>
                            </td></tr>
                        ) : filteredTemplates.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Search size={48} className="mb-4" opacity={0.1} style={{ margin: '0 auto' }} />
                                <p style={{ fontWeight: 600 }}>Nenhum modelo encontrado.</p>
                            </td></tr>
                        ) : (
                            filteredTemplates.slice((templatesPage - 1) * itemsPerPage, templatesPage * itemsPerPage).map((t, index) => (
                                <tr key={index} className="hover-row">
                                    <td data-label="Template">
                                        <div className="flex flex-col text-right">
                                            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{t.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', opacity: 0.6, fontFamily: 'monospace', marginTop: '2px' }}>{t.id.slice(0, 15)}...</span>
                                        </div>
                                    </td>
                                    <td data-label="Categoria">
                                        <div className="flex flex-col text-right">
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.category}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>pt_BR</span>
                                        </div>
                                    </td>
                                    <td data-label="Status">{getStatusBadge(t.status, t.rejectionReason)}</td>
                                    <td data-label="Sincronizado">
                                        <div className="flex items-center justify-end gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <Clock size={12} opacity={0.4} />
                                            {formatDate(t.lastUpdatedAt || t.createdAt)}
                                        </div>
                                    </td>
                                    <td data-label="Ações">
                                        <div className="flex justify-end gap-2 w-full">
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '8px', minWidth: '36px', borderRadius: '10px' }}
                                                onClick={() => window.open(`https://portal.infobip.com/whatsapp/templates/detail/${t.name}`, '_blank')}
                                                title="Ver no Infobip"
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '8px', minWidth: '36px', borderRadius: '10px' }}
                                                onClick={() => alert(`JSON Structure:\n\n${JSON.stringify(t.structure, null, 2)}`)}
                                                title="Ver Estrutura"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            {t.status.toUpperCase() === 'APPROVED' && (
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '8px', minWidth: '36px', borderRadius: '10px' }}
                                                    onClick={() => navigate(`/dispatch`, { state: { template: t, sender: senderNumber, key: apiKey } })}
                                                    title="Disparar"
                                                >
                                                    <Send size={14} color="black" />
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
    );
};


export default Accounts;
