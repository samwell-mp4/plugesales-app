import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, RefreshCcw, Layers, Search, Eye, AlertTriangle, Smartphone, Send, Calendar } from 'lucide-react';
import { dbService } from '../services/dbService';

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

const Accounts = () => {
    const navigate = useNavigate();
    // --- API / CONFIG STATE ---
    const [apiKey, setApiKey] = useState('5b90ba4e71d2c00cdb1784f476b59c1e-a0338025-abdc-46e6-8b90-0b2b2d62d5c8');
    const [senderNumber, setSenderNumber] = useState('5511997625247');

    // Load settings from DB on mount
    useEffect(() => {
        dbService.getSettings().then(settings => {
            if (settings['infobip_key']) setApiKey(settings['infobip_key']);
            if (settings['infobip_sender']) setSenderNumber(settings['infobip_sender']);
        });
    }, []);

    // Save to DB on change
    useEffect(() => {
        dbService.saveSetting('infobip_key', apiKey);
        dbService.saveSetting('infobip_sender', senderNumber);
    }, [apiKey, senderNumber]);

    const [templates, setTemplates] = useState<InfobipTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

    const fetchTemplates = async () => {
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
        fetchTemplates();
        const interval = setInterval(fetchTemplates, 20000); // Relaxed for quota
        return () => clearInterval(interval);
    }, [senderNumber, apiKey]);

    const approvedCount = templates.filter(t => t.status === 'APPROVED').length;
    const pendingCount = templates.filter(t => t.status !== 'APPROVED' && t.status !== 'REJECTED').length;
    const rejectedCount = templates.filter(t => t.status === 'REJECTED').length;

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase());
        const status = t.status.toUpperCase();
        if (filterStatus === 'APPROVED') return matchesSearch && status === 'APPROVED';
        if (filterStatus === 'PENDING') return matchesSearch && (status === 'PENDING' || status === 'IN_REVIEW' || status === 'REVIEW');
        if (filterStatus === 'REJECTED') return matchesSearch && status === 'REJECTED';
        return matchesSearch;
    });

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
                    background: rgba(15, 23, 42, 0.4);
                    margin-top: 24px;
                }
                table { width: 100%; border-collapse: collapse; }
                th { 
                    padding: 18px 24px; 
                    background: rgba(0,0,0,0.2);
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
                
                .badge-premium {
                    padding: 4px 10px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    border-radius: 8px;
                    white-space: nowrap;
                }
            `}</style>

            <div className="header-row">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', letterSpacing: '-1px' }}>Monitor de WhatsApp</h1>
                    <p className="subtitle" style={{ margin: 0 }}>Gerencie seus templates autorizados pela Meta via Infobip</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={() => fetchTemplates()} disabled={isLoading} style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                        <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '10px 24px', color: '#000', fontWeight: 800 }}>
                        <Plus size={18} /> Nova WABA
                    </button>
                </div>
            </div>

            {/* Quick Stats Dashboard */}
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
                <div className="glass-card" style={{ background: 'rgba(172, 248, 0, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
                    <div className="flex items-center gap-2">
                        <div style={{ width: 8, height: 8, background: 'var(--primary-color)', borderRadius: '50%', boxShadow: '0 0 8px var(--primary-color)' }}></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>LIVE SYNC</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Última vez: {lastUpdated?.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Filtering Section */}
            <div className="glass-card mt-8 p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between gap-6" style={{ flexWrap: 'wrap' }}>
                        <div className="filter-tabs" style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                                style={{ paddingLeft: '48px', background: 'rgba(0,0,0,0.2)', fontSize: '0.9rem', borderRadius: '12px' }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Filtrar por nome ou identificador..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-6 items-center pt-2 config-row" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                        <div className="flex items-center gap-3">
                            <Smartphone size={16} color="var(--primary-color)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SENDER:</span>
                            <input
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 800, width: '120px', outline: 'none' }}
                                value={senderNumber}
                                onChange={e => setSenderNumber(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <RefreshCcw size={16} color="var(--primary-color)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>API KEY:</span>
                            <input
                                type="password"
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 800, width: '160px', outline: 'none' }}
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Template List Table */}
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
                            filteredTemplates.map((t, index) => (
                                <tr key={index} className="hover-row">
                                    <td>
                                        <div className="flex flex-col">
                                            <span style={{ fontWeight: 800, color: 'white' }}>{t.name}</span>
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
                                                className="btn btn-secondary"
                                                style={{ padding: '10px', minWidth: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}
                                                onClick={() => alert(`JSON Structure:\n\n${JSON.stringify(t.structure, null, 2)}`)}
                                                title="View Structure"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '10px', minWidth: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}
                                                onClick={() => alert('Editing local draft...')}
                                                title="Edit Template"
                                            >
                                                <Layers size={16} />
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
        </div>
    );
};

export default Accounts;
