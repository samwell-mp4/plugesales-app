import { useState, useEffect } from 'react';
import {
    User,
    FileText,
    CheckCircle,
    CheckCircle2,
    Clock,
    LogOut,
    Layers,
    Smartphone,
    ExternalLink,
    Link as LinkIcon,
    Trash2,
    X,
    Copy as CopyIcon,
    Users,
    Mail,
    Building2,
    QrCode
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
    const { user, logout } = useAuth() as any;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'submissions' | 'agency_lots' | 'links' | 'activity' | 'referrals'>('submissions');
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [subClients, setSubClients] = useState<any[]>([]);
    const [links, setLinks] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLinksLoading, setIsLinksLoading] = useState(false);
    const [isLogsLoading, setIsLogsLoading] = useState(false);
    const [isSubClientsLoading, setIsSubClientsLoading] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState('');

    
    // Analytics State
    const [statsDate, setStatsDate] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
        end: new Date().toISOString().split('T')[0]
    });
    const [aggregatedStats, setAggregatedStats] = useState<any>(null);
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [selectedLinkStats, setSelectedLinkStats] = useState<any>(null);
    const [showLinkModal, setShowLinkModal] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchSubmissions();
            fetchLinks();
            if (activeTab === 'links') fetchAggregatedStats();
            if (activeTab === 'activity') fetchLogs();
            if (activeTab === 'referrals') fetchSubClients();
        }
    }, [user, activeTab, statsDate]);

    const fetchAggregatedStats = async () => {
        if (!user?.id) return;
        setIsStatsLoading(true);
        try {
            const data = await dbService.getAllLinkStats(user.id, statsDate.start, statsDate.end);
            setAggregatedStats(data);
        } catch (error) {
            console.error("Error fetching aggregated stats:", error);
        } finally {
            setIsStatsLoading(false);
        }
    };

    const fetchLogs = async () => {
        if (!user?.id) return;
        setIsLogsLoading(true);
        try {
            const data = await dbService.getLogs(undefined, user.id);
            setAuditLogs(data);
        } catch (error) {
            console.error("Error fetching client logs:", error);
        } finally {
            setIsLogsLoading(false);
        }
    };

    const fetchLinks = async () => {
        if (!user?.id) return;
        setIsLinksLoading(true);
        try {
            const data = await dbService.getShortLinks(user.role, user.id);
            setLinks(data);
        } catch (error) {
            console.error("Error fetching client links:", error);
        } finally {
            setIsLinksLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = await dbService.getClientSubmissionsByUserId(user.id);
            setSubmissions(data);
        } catch (error) {
            console.error("Error fetching submissions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubClients = async () => {
        if (!user?.id) return;
        setIsSubClientsLoading(true);
        try {
            const data = await dbService.getSubClients(user.id);
            setSubClients(data);
        } catch (error) {
            console.error("Error fetching sub-clients:", error);
        } finally {
            setIsSubClientsLoading(false);
        }
    };

    const handleApproveSubClient = async (id: number) => {
        const password = window.prompt("Defina uma senha para o acesso deste cliente:");
        if (password === null) return;
        if (!password.trim()) return alert("A senha é obrigatória.");

        try {
            const res = await dbService.approveSubClient(id, password);
            if (res.success) {
                fetchSubClients();
            } else {
                alert("Erro ao aprovar: " + (res.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error("Error approving sub-client:", error);
        }
    };

    const handleDeleteSubClient = async (id: number) => {
        if (!window.confirm("Deseja realmente excluir este cadastro?")) return;
        try {
            const res = await dbService.deleteSubClient(id);
            if (res.success) {
                fetchSubClients();
            }
        } catch (error) {
            console.error("Error deleting sub-client:", error);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopyFeedback(label);
        setTimeout(() => setCopyFeedback(''), 2000);
    };

    const handleDuplicateSubmission = async (submission: any) => {
        if (!window.confirm(`Deseja duplicar a campanha "${submission.profile_name}"?`)) return;
        try {
            const { id, timestamp, ...rest } = submission;
            const duplicatedData = {
                ...rest,
                button_link: '', // Clear link
                original_button_link: '',
                status: 'PENDENTE',
                timestamp: new Date().toISOString(),
                submitted_by: user?.name,
                ads: (submission.ads || []).map((ad: any) => ({
                    ...ad,
                    button_link: '', // Clear link in ads too
                    original_button_link: '',
                    delivered_leads: 0,
                    clicks: 0
                }))
            };
            await dbService.addClientSubmission(duplicatedData);
            fetchSubmissions();
            alert("Campanha duplicada com sucesso! Os links foram limpos.");
        } catch (error) {
            console.error("Error duplicating submission:", error);
            alert("Erro ao duplicar submissão.");
        }
    };

    const handleDeleteSubmission = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir esta submissão?")) return;
        try {
            await dbService.deleteClientSubmission(id);
            setSubmissions((prev: any[]) => prev.filter((s: any) => s.id !== id));
        } catch (error) {
            console.error("Error deleting submission:", error);
            alert("Erro ao excluir submissão.");
        }
    };


    const handleViewLinkStats = async (id: number) => {
        setIsStatsLoading(true);
        try {
            const data = await dbService.getLinkStats(id);
            setSelectedLinkStats(data);
            setShowLinkModal(true);
        } catch (error) {
            console.error("Error fetching link stats:", error);
            alert("Erro ao buscar estatísticas do link.");
        } finally {
            setIsStatsLoading(false);
        }
    };

    const statusCfg = (status: string) => {
        switch (status) {
            case 'PENDENTE': return { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' };
            case 'EM_ANDAMENTO':
            case 'EM ANDAMENTO': return { label: 'Em andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' };
            case 'CONCLUIDO':
            case 'CONCLUÍDO': return { label: 'Concluído', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' };
            case 'GERADO': return { label: 'Gerado', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' };
            case 'CANCELADO': return { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
            default: return { label: status, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
        }
    };

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'PENDENTE').length,
        completed: submissions.filter(s => s.status === 'CONCLUÍDO' || s.status === 'CONCLUIDO').length
    };

    return (
        <div className="container-root" style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '28px 24px' }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .control-card { 
                    background: var(--card-bg-subtle); 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 24px; 
                    padding: 24px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: fadeInUp 0.4s ease-out backwards;
                }
                .control-card:hover { 
                    background: var(--card-bg-subtle); 
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px -10px rgba(0,0,0,0.1);
                }

                .action-btn { padding: 12px 20px; border-radius: 14px; border: none; cursor: pointer; font-weight: 900; font-size: 11px; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; text-transform: uppercase; }
                .primary-btn { background: var(--primary-gradient); color: #000; box-shadow: 0 8px 20px -6px var(--primary); }
                .ghost-btn { background: var(--card-bg-subtle); color: var(--text-muted); border: 1px solid var(--surface-border-subtle) !important; }
                .ghost-btn:hover { background: var(--bg-primary); color: var(--text-primary); border-color: var(--primary-color) !important; }

                .nav-tab { padding: 10px 18px; border-radius: 12px; border: 1px solid var(--surface-border-subtle); background: var(--card-bg-subtle); color: var(--text-muted); cursor: pointer; font-weight: 900; font-size: 10px; letter-spacing: 1px; transition: all 0.2s; text-transform: uppercase; }
                .nav-tab:hover { background: var(--bg-primary); color: var(--text-primary); }
                .nav-tab.active { background: rgba(172,248,0,0.1); border-color: var(--primary-color); color: var(--primary-color); box-shadow: 0 0 15px rgba(172,248,0,0.05); }

                .field-input { width: 100%; background: var(--card-bg-subtle); border: 1px solid var(--surface-border-subtle); border-radius: 16px; padding: 16px; color: var(--text-primary); font-size: 14px; font-weight: 600; outline: none; transition: all 0.2s; box-sizing: border-box; }
                .field-input:focus { border-color: var(--primary-color); background: var(--bg-primary); box-shadow: 0 0 20px rgba(172,248,0,0.05); }
                
                .field-label { font-size: 10px; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
                .info-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
                
                .submission-link {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle);
                    border-radius: 18px;
                    text-decoration: none;
                    transition: all 0.3s;
                    margin-bottom: 12px;
                }
                .submission-link:hover {
                    background: var(--bg-primary);
                    border-color: var(--primary-color);
                    transform: scale(1.01);
                }

                @media (max-width: 1024px) {
                    .stats-wrapper { grid-template-columns: 1fr !important; }
                    .header-content { flex-direction: column; align-items: flex-start !important; gap: 20px !important; }
                    .header-actions { width: 100%; justify-content: space-between; }
                }

                .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
                .stat-card { background: rgba(255,255,255,0.03); border: 1px solid var(--surface-border-subtle); border-radius: 20px; padding: 24px; }
                .stat-card h5 { margin: 0 0 8px 0; font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; }
                .stat-card .value { font-size: 28px; font-weight: 900; color: var(--text-primary); }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 1000; display: flex; items-center: center; justify-content: center; padding: 20px; }
                .modal-content { background: var(--bg-primary); border: 1px solid var(--surface-border-subtle); border-radius: 32px; width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 40px; position: relative; }
                .close-modal { position: absolute; top: 24px; right: 24px; background: rgba(255,255,255,0.05); border: none; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                
                .chart-bar { height: 8px; background: rgba(172,248,0,0.1); border-radius: 4px; overflow: hidden; margin-top: 8px; }
                .chart-fill { height: 100%; background: var(--primary-gradient); transition: width 1s ease-out; }
            `}</style>

            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                {/* ── HEADER ── */}
                <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', gap: '24px' }}>
                    <div className="header-profile-info" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{ 
                                width: 64, height: 64, borderRadius: '20px', 
                                background: 'var(--primary-gradient)', 
                                border: '2px solid var(--surface-border-subtle)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 25px -5px rgba(172, 248, 0, 0.4)'
                            }}>
                                <User size={32} color="black" />
                            </div>
                            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: '6px', background: '#22c55e', border: '3px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-1.5px', lineHeight: 1, color: 'var(--text-primary)' }}>
                                Central do <span className="text-primary-color">Cliente</span>
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                                <span className="info-chip" style={{ background: 'var(--card-bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--surface-border-subtle)' }}>
                                    SESSÃO ATIVA
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Olá, {user?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            onClick={() => {
                                const link = `${window.location.origin}/client-add/${user.id}`;
                                copyToClipboard(link, 'Link de Indicação');
                            }}
                            className="action-btn ghost-btn"
                            style={{ height: 48, padding: '0 24px' }}
                        >
                            <Users size={18} /> INDICAR CLIENTE
                        </button>
                        <button
                            onClick={() => navigate('/client-form')}
                            className="action-btn primary-btn"
                            style={{ height: 48, padding: '0 24px' }}
                        >
                            <FileText size={18} /> NOVA CAMPANHA
                        </button>
                        <button onClick={logout} className="action-btn ghost-btn" style={{ width: 48, height: 48, padding: 0 }}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* ── QUICK STATS ── */}
                <div className="stats-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                    <div className="control-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', animationDelay: '0.1s' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                            <Layers size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)' }}>{stats.total}</p>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Total Enviado</p>
                        </div>
                    </div>
                    <div className="control-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', animationDelay: '0.2s' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)' }}>{stats.pending}</p>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Em Análise</p>
                        </div>
                    </div>
                    <div className="control-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', animationDelay: '0.3s' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)' }}>{stats.completed}</p>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Finalizadas</p>
                        </div>
                    </div>
                </div>

                {/* ── NAVIGATION TABS ── */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <button
                        className={`nav-tab ${activeTab === 'submissions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('submissions')}
                    >
                        MINHAS SUBMISSÕES
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'agency_lots' ? 'active' : ''}`}
                        onClick={() => setActiveTab('agency_lots')}
                    >
                        LOTES DA AGÊNCIA
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'links' ? 'active' : ''}`}
                        onClick={() => setActiveTab('links')}
                    >
                        MEUS LINKS
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        REGISTRO DE ATIVIDADE
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'referrals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('referrals')}
                    >
                        MINHAS INDICAÇÕES
                    </button>
                </div>

                {/* ── CONTENT ── */}
                <div className="control-card" style={{ animationDelay: '0.4s', padding: '24px' }}>
                    {activeTab === 'submissions' ? (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                            {isLoading ? (
                                <div style={{ padding: '80px', textAlign: 'center' }}>
                                    <div style={{ width: 32, height: 32, margin: '0 auto 16px', border: '2px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px' }}>CARREGANDO...</p>
                                </div>
                            ) : submissions.length === 0 ? (
                                <div style={{ padding: '80px', textAlign: 'center', opacity: 0.2 }}>
                                    <FileText size={48} style={{ marginBottom: '16px' }} />
                                    <p style={{ fontWeight: 800 }}>Nenhuma submissão manual registrada.</p>
                                </div>
                            ) : (
                                submissions.map((sub) => {
                                    const cfg = statusCfg(sub.status);
                                    return (
                                        <div key={sub.id} className="submission-link">
                                            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {sub.is_referral ? <Users size={20} style={{ opacity: 0.5, color: 'var(--primary-color)' }} /> : <Smartphone size={20} style={{ opacity: 0.3, color: 'var(--text-primary)' }} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                                                    {sub.profile_name}
                                                    {sub.status === 'CONCLUÍDO' && <CheckCircle size={14} className="text-primary-color" />}
                                                    {sub.is_referral && (
                                                        <span style={{ fontSize: '8px', background: 'var(--primary-color)', color: '#000', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>INDICADO</span>
                                                    )}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{new Date(sub.timestamp).toLocaleDateString()}</span>
                                                    <span style={{ color: 'var(--surface-border-subtle)' }}>•</span>
                                                    <span className="info-chip" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '2px 8px', fontSize: '8px', borderRadius: '6px' }}>
                                                        {cfg.label.toUpperCase()}
                                                    </span>
                                                    {sub.is_referral && sub.child_name && (
                                                        <span style={{ fontSize: '9px', fontWeight: 800, opacity: 0.6 }}>• {sub.child_name.toUpperCase()}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {sub.status === 'PENDENTE' && (
                                                    <button 
                                                        onClick={() => handleDeleteSubmission(sub.id)}
                                                        className="action-btn ghost-btn" 
                                                        style={{ height: 36, width: 36, padding: 0, color: '#ef4444' }}
                                                        title="Excluir Submissão"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDuplicateSubmission(sub)}
                                                    className="action-btn ghost-btn" 
                                                    style={{ height: 36, width: 36, padding: 0 }}
                                                    title="Duplicar Campanha"
                                                >
                                                    <CopyIcon size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/client-submissions/${sub.id}`)}
                                                    className="action-btn ghost-btn" 
                                                    style={{ height: 36, padding: '0 16px', fontSize: '9px' }}
                                                >
                                                    DETALHES <ExternalLink size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : activeTab === 'agency_lots' ? (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                            {isLoading ? (
                                <div style={{ padding: '80px', textAlign: 'center' }}>
                                    <div style={{ width: 32, height: 32, margin: '0 auto 16px', border: '2px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px' }}>CARREGANDO...</p>
                                </div>
                            ) : submissions.filter(s => s.submitted_by && s.submitted_by !== user?.name && s.submitted_by !== 'Cliente (Externo)').length === 0 ? (
                                <div style={{ padding: '80px', textAlign: 'center', opacity: 0.2 }}>
                                    <Layers size={48} style={{ marginBottom: '16px' }} />
                                    <p style={{ fontWeight: 800 }}>Nenhum lote automático registrado.</p>
                                </div>
                            ) : (
                                submissions.filter(s => s.submitted_by && s.submitted_by !== user?.name && s.submitted_by !== 'Cliente (Externo)').map((sub) => {
                                    const cfg = statusCfg(sub.status);
                                    return (
                                        <div key={sub.id} className="submission-link" style={{ borderLeft: '4px solid #3b82f6' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Layers size={20} style={{ opacity: 0.5, color: '#3b82f6' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                                                    {sub.profile_name}
                                                    {(sub.status === 'CONCLUIDO' || sub.status === 'CONCLUÍDO') && <CheckCircle size={14} style={{ color: '#3b82f6' }} />}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{new Date(sub.timestamp).toLocaleDateString()}</span>
                                                    <span style={{ color: 'var(--surface-border-subtle)' }}>•</span>
                                                    <span className="info-chip" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '2px 8px', fontSize: '8px', borderRadius: '6px' }}>
                                                        {cfg.label.toUpperCase()}
                                                    </span>
                                                    <span style={{ fontSize: '8px', fontWeight: 900, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px' }}>POR: {sub.submitted_by.toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    onClick={() => navigate(`/client-submissions/${sub.id}`)}
                                                    className="action-btn ghost-btn" 
                                                    style={{ height: 36, padding: '0 16px', fontSize: '9px' }}
                                                >
                                                    DETALHES <ExternalLink size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : activeTab === 'activity' ? (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                            {isLogsLoading ? (
                                <div style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ width: 24, height: 24, margin: '0 auto 12px', border: '2px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)' }}>BUSCANDO ATIVIDADE...</p>
                                </div>
                            ) : auditLogs.length === 0 ? (
                                <div style={{ padding: '60px', textAlign: 'center' }}>
                                    <FileText size={40} style={{ margin: '0 auto 16px', opacity: 0.1, color: 'var(--text-primary)' }} />
                                    <p style={{ color: 'var(--text-muted)', fontWeight: 800 }}>Nenhum registro de atividade recente.</p>
                                </div>
                            ) : (
                                <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {auditLogs.map((log) => (
                                        <div key={log.id} style={{ padding: '16px', background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ background: log.log_type === 'TEMPLATE' ? 'rgba(172,248,0,0.1)' : 'rgba(59,130,246,0.1)', padding: '8px', borderRadius: '10px' }}>
                                                {log.log_type === 'TEMPLATE' ? <Smartphone size={16} className="text-primary-color" /> : <ExternalLink size={16} style={{ color: '#3b82f6' }} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                    {log.log_type === 'TEMPLATE' ? 'Template Criado:' : 'Campanha Disparada:'} {log.name || log.campaign_name}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                    <span>•</span>
                                                    <span>RESPONSÁVEL: {log.author || 'SISTEMA'}</span>
                                                    {log.total > 0 && <span>• {log.total} ENVIOS</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'links' ? (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                            {/* Analytics Overview Section */}
                            <div style={{ marginBottom: '40px', padding: '32px', background: 'rgba(172,248,0,0.02)', borderRadius: '24px', border: '1px solid rgba(172,248,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-1px' }}>Analytics dos <span className="text-primary-color">Seus Links</span></h3>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>DESEMPENHO AGREGADO NO PERÍODO SELECIONADO</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>DE:</span>
                                            <input type="date" className="nav-tab" style={{ padding: '8px 12px' }} value={statsDate.start} onChange={e => setStatsDate((p: any) => ({ ...p, start: e.target.value }))} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>ATÉ:</span>
                                            <input type="date" className="nav-tab" style={{ padding: '8px 12px' }} value={statsDate.end} onChange={e => setStatsDate((p: any) => ({ ...p, end: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>

                                <div className="analytics-grid">
                                    <div className="stat-card">
                                        <h5>CLIQUES TOTAIS</h5>
                                        <div className="value">{aggregatedStats?.summary?.total_clicks || 0}</div>
                                        {aggregatedStats?.timeline?.length > 0 && <p style={{ fontSize: '9px', fontWeight: 700, color: '#22c55e', marginTop: '8px' }}>ATIVIDADE DETECTADA</p>}
                                    </div>
                                    <div className="stat-card">
                                        <h5>LINKS ATIVOS</h5>
                                        <div className="value">{aggregatedStats?.summary?.total_links || 0}</div>
                                    </div>
                                    <div className="stat-card">
                                        <h5>TOP DISPOSITIVO</h5>
                                        <div className="value" style={{ fontSize: '20px' }}>
                                            {aggregatedStats?.devices?.sort((a:any, b:any) => b.count - a.count)[0]?.device_type || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <h5>TOP PAÍS</h5>
                                        <div className="value" style={{ fontSize: '20px' }}>
                                            {aggregatedStats?.geo?.sort((a:any, b:any) => b.count - a.count)[0]?.country || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {aggregatedStats?.timeline?.length > 0 && (
                                    <div style={{ marginTop: '24px' }}>
                                        <h5 style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Tendência de Cliques (Timeline)</h5>
                                        <div style={{ display: 'flex', gap: '4px', height: '100px', alignItems: 'flex-end', paddingBottom: '20px' }}>
                                            {aggregatedStats.timeline.map((day: any, i: number) => {
                                                const maxClicks = Math.max(...aggregatedStats.timeline.map((d: any) => parseInt(d.count)));
                                                const height = (parseInt(day.count) / maxClicks) * 100;
                                                return (
                                                    <div key={i} style={{ flex: 1, background: 'var(--primary-gradient)', height: `${height}%`, borderRadius: '4px 4px 0 0', position: 'relative' }} title={`${new Date(day.date).toLocaleDateString()}: ${day.count} cliques`}>
                                                        <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '8px', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                            {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Lista de Links</h3>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{links.length} LINKS ENCONTRADOS</div>
                            </div>

                            {isLinksLoading ? (
                                <div style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ width: 24, height: 24, margin: '0 auto 12px', border: '2px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)' }}>BUSCANDO LINKS...</p>
                                </div>
                            ) : links.length === 0 ? (
                                <div style={{ padding: '60px', textAlign: 'center' }}>
                                    <LinkIcon size={40} style={{ margin: '0 auto 16px', opacity: 0.1, color: 'var(--text-primary)' }} />
                                    <p style={{ color: 'var(--text-muted)', fontWeight: 800 }}>Nenhum link vinculado à sua conta.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                    {links.map((link) => (
                                        <div key={link.id} className="control-card" style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                                <div style={{ background: 'rgba(172,248,0,0.1)', padding: '10px', borderRadius: '12px' }}>
                                                    <LinkIcon size={20} className="text-primary-color" />
                                                </div>
                                                <div style={{ textAlign: 'right', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary-color)', lineHeight: 1 }}>{link.clicks || 0}</div>
                                                        <div style={{ fontSize: '8px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Cliques</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                                                {link.title}
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'var(--primary-color)', wordBreak: 'break-all' }}>
                                                {window.location.host}/l/{link.short_code}
                                            </p>
                                            
                                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                                <button 
                                                    onClick={() => handleViewLinkStats(link.id)}
                                                    className="action-btn ghost-btn" 
                                                    style={{ flex: 1, height: 40, fontSize: '9px' }}
                                                >
                                                    VER MÉTRICAS
                                                </button>
                                                <button 
                                                    onClick={() => window.open(`https://${window.location.host}/l/${link.short_code}`, '_blank')}
                                                    className="action-btn ghost-btn" 
                                                    style={{ width: 40, height: 40, padding: 0 }}
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'referrals' ? (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                            <div style={{ marginBottom: '32px', padding: '32px', background: 'rgba(172,248,0,0.02)', borderRadius: '24px', border: '1px solid rgba(172,248,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                                <div style={{ flex: 1, minWidth: '300px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-1px' }}>Seu Link de <span className="text-primary-color">Indicação</span></h3>
                                    <p style={{ margin: '8px 0 20px 0', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>GANHE BENEFÍCIOS INDICANDO NOVOS CLIENTES PARA A PLATAFORMA</p>
                                    
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)', fontSize: '13px', fontWeight: 700, color: 'var(--primary-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {window.location.origin}/client-add/{user?.id}
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(`${window.location.origin}/client-add/${user?.id}`, 'Link de Indicação')}
                                            className="action-btn primary-btn" style={{ height: 52, padding: '0 24px' }}
                                        >
                                            <CopyIcon size={18} /> COPIAR LINK
                                        </button>
                                    </div>
                                </div>
                                <div style={{ background: '#fff', padding: '12px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/client-add/${user?.id}`)}`} 
                                        alt="QR Code" 
                                        style={{ width: 100, height: 100 }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Indicados Registrados</h3>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{subClients.length} INDICAÇÕES</div>
                            </div>

                            {isSubClientsLoading ? (
                                <div style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ width: 24, height: 24, margin: '0 auto 12px', border: '2px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)' }}>CARREGANDO INDICADOS...</p>
                                </div>
                            ) : subClients.length === 0 ? (
                                <div style={{ padding: '80px', textAlign: 'center', opacity: 0.2 }}>
                                    <Users size={48} style={{ marginBottom: '16px' }} />
                                    <p style={{ fontWeight: 800 }}>Você ainda não possui indicações registradas.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                    {subClients.map((sc: any) => (
                                        <div key={sc.id} className="control-card" style={{ padding: '24px', position: 'relative', border: sc.approved ? '1px solid var(--primary-color)' : '1px solid var(--surface-border-subtle)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                                <div style={{ width: 44, height: 44, borderRadius: '12px', background: sc.approved ? 'rgba(172,248,0,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={20} className={sc.approved ? "text-primary-color" : ""} style={{ opacity: sc.approved ? 1 : 0.3 }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)' }}>{sc.data?.name || 'Cliente'}</h4>
                                                    <span style={{ fontSize: '9px', fontWeight: 900, color: sc.approved ? 'var(--primary-color)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                        {sc.approved ? 'CONTA ATIVA / APROVADA' : 'AGUARDANDO APROVAÇÃO'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    <Mail size={14} style={{ opacity: 0.5 }} /> {sc.data?.email}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    <Smartphone size={14} style={{ opacity: 0.5 }} /> {sc.data?.phone}
                                                </div>
                                                {sc.data?.company && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                        <Building2 size={14} style={{ opacity: 0.5 }} /> {sc.data?.company}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.5, fontWeight: 700 }}>
                                                    CADASTRO EM: {new Date(sc.created_at).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {!sc.approved && (
                                                    <button 
                                                        onClick={() => handleApproveSubClient(sc.id)}
                                                        className="action-btn primary-btn" 
                                                        style={{ flex: 1, height: 40, fontSize: '9px' }}
                                                    >
                                                        APROVAR
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteSubClient(sc.id)}
                                                    className="action-btn ghost-btn" 
                                                    style={{ width: 40, height: 40, padding: 0, color: '#ef4444' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* ── FOOTER LOGO ── */}
                <div style={{ marginTop: '40px', textAlign: 'center', opacity: 0.1 }}>
                    <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '4px' }}>PLUG & SALES • PRO</h2>
                </div>

                {copyFeedback && (
                    <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: '#000', padding: '12px 24px', borderRadius: '16px', fontWeight: 900, fontSize: '13px', boxShadow: '0 10px 40px rgba(172,248,0,0.3)', zIndex: 9999, animation: 'fadeInUp 0.3s ease-out' }}>
                        ✓ {copyFeedback.toUpperCase()} COPIADO COM SUCESSO!
                    </div>
                )}
            </div>

            {/* ── LINK STATS MODAL ── */}
            {showLinkModal && selectedLinkStats && (
                <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowLinkModal(false)}>
                            <X size={20} />
                        </button>
                        
                        {isStatsLoading && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '32px', zIndex: 10 }}>
                                <div style={{ width: 40, height: 40, border: '4px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            </div>
                        )}
                        
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'inline-flex', background: 'rgba(172,248,0,0.1)', padding: '12px', borderRadius: '16px', marginBottom: '16px' }}>
                                <LinkIcon className="text-primary-color" size={24} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 940, letterSpacing: '-1.5px' }}>{selectedLinkStats.link.title}</h2>
                            <p style={{ color: 'var(--primary-color)', fontWeight: 700, margin: '8px 0' }}>{window.location.host}/l/{selectedLinkStats.link.short_code}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{selectedLinkStats.link.original_url}</p>
                        </div>

                        <div className="analytics-grid">
                            <div className="stat-card">
                                <h5>CLIQUES TOTALS</h5>
                                <div className="value">{selectedLinkStats.timeline.reduce((acc: any, curr: any) => acc + parseInt(curr.count), 0)}</div>
                            </div>
                            <div className="stat-card">
                                <h5>CRIADO EM</h5>
                                <div className="value" style={{ fontSize: '18px' }}>{new Date(selectedLinkStats.link.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Localização Geográfica</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {selectedLinkStats.geo.length === 0 ? (
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sem dados geográficos ainda.</p>
                                    ) : selectedLinkStats.geo.map((g: any, i: number) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                                                <span>{g.city}, {g.country}</span>
                                                <span>{g.count}</span>
                                            </div>
                                            <div className="chart-bar"><div className="chart-fill" style={{ width: `${(g.count / selectedLinkStats.timeline.reduce((acc:any, curr:any) => acc + parseInt(curr.count), 0)) * 100}%` }}></div></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Referenciadores</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {selectedLinkStats.referrers.length === 0 ? (
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Acesso direto ou sem rastreio.</p>
                                    ) : selectedLinkStats.referrers.map((r: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                                            <span style={{ opacity: 0.6 }}>{r.referrer || 'Direto'}</span>
                                            <span>{r.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @media (max-width: 768px) {
                    .dashboard-header { flex-direction: column; align-items: flex-start !important; gap: 16px; }
                    .nav-tabs { 
                        overflow-x: auto; 
                        width: 100%; 
                        padding-bottom: 8px;
                        display: flex !important;
                        flex-wrap: nowrap !important;
                        border-bottom: 1px solid var(--surface-border-subtle);
                    }
                    .nav-tab { white-space: nowrap; flex-shrink: 0; }
                    .grid-3 { grid-template-columns: 1fr !important; }
                    .submission-card { padding: 20px !important; }
                    .modal-content { width: 95% !important; padding: 24px !important; margin: 10px !important; }
                    .analytics-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
                }
            `}</style>
        </div>
    );
};

export default ClientDashboard;
