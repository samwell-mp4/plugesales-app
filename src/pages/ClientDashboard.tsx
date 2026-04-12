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
    XCircle,
    Copy as CopyIcon,
    Users,
    Mail,
    Building2,
    ShieldCheck,
    Lock,
    Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
    const { user, setUser, logout } = useAuth() as any;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'submissions' | 'links' | 'activity' | 'referrals'>('submissions');
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
    const [selectedSubDetail, setSelectedSubDetail] = useState<any>(null);
    const [showSubDetailModal, setShowSubDetailModal] = useState(false);
    const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
    const [selectedSubForChange, setSelectedSubForChange] = useState<any>(null);

    useEffect(() => {
        if (user?.id) {
            fetchSubmissions();
            fetchLinks();
            if (activeTab === 'links') fetchAggregatedStats();
            if (activeTab === 'activity') fetchLogs();
            if (activeTab === 'referrals') {
                fetchSubClients();
                fetchReferralSubmissions();
            }
        }
    }, [user, activeTab, statsDate]);

    // Polling for status if pending
    useEffect(() => {
        if (user?.role === 'PENDING_CLIENT') {
            const interval = setInterval(async () => {
                try {
                    const latestUser = await dbService.getCurrentUser(user.id);
                    if (latestUser && latestUser.role !== 'PENDING_CLIENT') {
                        setUser(latestUser);
                        window.location.reload(); // Refresh to update UI
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [user?.role]);

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
            setLinks(data?.links || []);
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
            const ownSubmissions = await dbService.getClientSubmissionsByUserId(user.id);
            let allSubmissions = [...(Array.isArray(ownSubmissions) ? ownSubmissions : [])];
            
            // Normalize the referral flag
            allSubmissions = allSubmissions.map(s => ({
                ...s,
                isReferral: s.isReferral || s.is_referral
            }));

            // Deduplicate
            const uniqueMap = new Map();
            allSubmissions.forEach(sub => uniqueMap.set(sub.id, sub));
            allSubmissions = Array.from(uniqueMap.values());

            // Sort by timestamp descending
            allSubmissions.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            

            setSubmissions(allSubmissions);
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

    const [referralSubmissions, setReferralSubmissions] = useState<any[]>([]);
    
    const fetchReferralSubmissions = async () => {
        if (!user?.id) return;
        try {
            const data = await dbService.getReferralSubmissions(user.id);
            setReferralSubmissions(data);
        } catch (error) {
            console.error("Error fetching referral submissions:", error);
        }
    };

    const handleApproveSubClient = async (id: number) => {
        try {
            const res = await dbService.approveSubClient(id);
            if (res.success) {
                fetchSubClients();
            } else {
                alert("Erro ao aprovar: " + (res.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error("Error approving sub-client:", error);
        }
    };

    const handleApproveReferralSubmission = async (id: number, approved: boolean) => {
        if (!window.confirm(approved ? "Deseja aprovar esta campanha?" : "Deseja reprovar esta campanha?")) return;
        try {
            const res = await dbService.parentApproveSubmission(id, approved);
            if (res.success) {
                fetchReferralSubmissions();
                fetchSubmissions();
                alert(approved ? "Campanha aprovada e enviada para processamento!" : "Campanha reprovada.");
            }
        } catch (error) {
            console.error("Error approving submission:", error);
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
                button_link: '',
                original_button_link: '',
                status: 'PENDENTE',
                timestamp: new Date().toISOString(),
                submitted_by: user?.name,
                submitted_role: user?.role,
                ads: (submission.ads || []).map((ad: any) => ({
                    ...ad,
                    button_link: '',
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
            case 'AGUARDANDO_APROVACAO_PAI': return { label: 'Aguardando Pai', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' };
            case 'PENDENTE': return { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' };
            case 'EM_ANDAMENTO':
            case 'EM ANDAMENTO': return { label: 'Em andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' };
            case 'CONCLUIDO':
            case 'CONCLUÍDO': return { label: 'Concluído', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' };
            case 'GERADO': return { label: 'Gerado', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' };
            case 'CANCELADO': return { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
            case 'REPROVADA_PELO_PAI': return { label: 'Reprovada pelo Pai', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
            default: return { label: status, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
        }
    };

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'PENDENTE' || s.status === 'AGUARDANDO_APROVACAO_PAI').length,
        completed: submissions.filter(s => s.status === 'CONCLUÍDO' || s.status === 'CONCLUIDO').length
    };

    const handleBackupData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submissions, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "submissions_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        alert("Lista salva com sucesso! (submissions_backup.json)");
    };

    if (user?.role === 'PENDING_CLIENT') {
        return (
            <div style={{ 
                minHeight: '100vh', 
                background: '#050505', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Inter', sans-serif"
            }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(172, 248, 0, 0.1) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />
                <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />

                <div style={{ zIndex: 1, textAlign: 'center', padding: '40px', maxWidth: '500px', animation: 'fadeInUp 0.8s cubic-bezier(0.19, 1, 0.22, 1)' }}>
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 32px',
                        color: 'var(--primary-color)',
                        boxShadow: '0 0 40px rgba(172, 248, 0, 0.1)'
                    }}>
                        <Clock size={36} />
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1.5px' }}>
                        Quase lá, <span style={{ color: 'var(--primary-color)' }}>{user.name.split(' ')[0]}</span>!
                    </h1>
                    
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6', marginBottom: '40px' }}>
                        Seu cadastro foi recebido com sucesso. Nossa equipe está analisando seus dados para liberar seu acesso à Dashboard.
                    </p>

                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        border: '1px solid rgba(255, 255, 255, 0.05)', 
                        padding: '24px', 
                        borderRadius: '20px', 
                        marginBottom: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                            <ShieldCheck size={18} style={{ color: 'var(--primary-color)' }} />
                            <span>Conta criada e vinculada</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                            <Lock size={18} style={{ color: 'var(--primary-color)' }} />
                            <span>Acesso restrito em análise</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button 
                            onClick={() => window.location.reload()}
                            style={{ padding: '14px 28px', background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', transition: '0.3s' }}
                        >
                            ATUALIZAR STATUS
                        </button>
                        <button 
                            onClick={logout}
                            style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <LogOut size={16} /> SAIR
                        </button>
                    </div>

                    <p style={{ marginTop: '40px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '1px' }}>
                        PLUG & SALES © 2026 • SEGURANÇA MÁXIMA
                    </p>
                </div>

            </div>
        );
    }

    return (
        <div className="container-root">
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

                    .stats-wrapper { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important; }
                    .header-content { flex-direction: column; align-items: flex-start !important; gap: 24px !important; }
                    .header-actions { width: 100%; justify-content: flex-start; gap: 12px; }
                    .header-profile-info { flex-direction: column; align-items: flex-start !important; text-align: left; }
                }

                @media (max-width: 600px) {
                    .container-root { padding: 16px 12px; }
                    .stats-wrapper { grid-template-columns: 1fr !important; gap: 16px !important; }
                    .nav-tab { flex: 1; text-align: center; }
                    .header-actions { flex-direction: column; align-items: stretch; }
                    .header-actions .action-btn { width: 100%; }
                    .primary-btn { margin-bottom: 8px; }
                    .control-card { padding: 16px; }
                    .submission-link { padding: 12px; flex-direction: column; align-items: flex-start; gap: 12px; }
                }

                .container-root { 
                    min-height: 100vh; 
                    background: var(--bg-primary); 
                    color: var(--text-primary); 
                    padding: 28px 24px; 
                }

                .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
                .stat-card { background: rgba(255,255,255,0.03); border: 1px solid var(--surface-border-subtle); border-radius: 20px; padding: 24px; }
                .stat-card h5 { margin: 0 0 8px 0; font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; }
                .stat-card .value { font-size: 28px; font-weight: 900; color: var(--text-primary); }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .modal-content { background: var(--bg-primary); border: 1px solid var(--surface-border-subtle); border-radius: 32px; width: 100%; max-width: 800px; max-height: 92vh; overflow-y: auto; padding: 40px; position: relative; }
                .close-modal { position: absolute; top: 24px; right: 24px; background: rgba(255,255,255,0.05); border: none; color: white; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; z-index: 10; }
                .close-modal:hover { background: rgba(255,255,255,0.1); transform: rotate(90deg); }
                
                .chart-bar { height: 8px; background: rgba(172,248,0,0.1); border-radius: 4px; overflow: hidden; margin-top: 8px; }
                .chart-fill { height: 100%; background: var(--primary-gradient); transition: width 1s ease-out; }

                @media (max-width: 768px) {
                    .modal-content { padding: 32px 24px; border-radius: 24px; width: 96vw; max-height: 95vh; }
                    .modal-content h2 { font-size: 1.5rem !important; }
                    .close-modal { top: 16px; right: 16px; width: 36px; height: 36px; }
                }

                @media (max-width: 480px) {
                    .modal-content { padding: 24px 20px; }
                    .action-btn { font-size: 10px; padding: 10px 14px; }
                    .stats-wrapper { gap: 12px !important; }
                }
            `}</style>

            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
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

                <div className="stats-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                    <div className="control-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', animationDelay: '0.1s' }}>
                        <div className="stat-icon-container" style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                            <Layers size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)' }}>{stats.total}</p>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Total Enviado</p>
                        </div>
                    </div>
                    <div className="control-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', animationDelay: '0.2s' }}>
                        <div className="stat-icon-container" style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)' }}>{stats.pending}</p>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Em Análise</p>
                        </div>
                    </div>
                    <div className="control-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', animationDelay: '0.3s' }}>
                        <div className="stat-icon-container" style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', flexShrink: 0 }}>
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-1px', color: 'var(--text-primary)' }}>{stats.completed}</p>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Finalizadas</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <button className={`nav-tab ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>MINHAS SUBMISSÕES</button>
                    <button className={`nav-tab ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>MEUS LINKS</button>
                    <button className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>REGISTRO DE ATIVIDADE</button>
                    <button className={`nav-tab ${activeTab === 'referrals' ? 'active' : ''}`} onClick={() => setActiveTab('referrals')}>INDICAÇÕES</button>
                </div>

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
                                                {sub.isReferral ? <Users size={20} style={{ opacity: 0.5, color: 'var(--primary-color)' }} /> : <Smartphone size={20} style={{ opacity: 0.3, color: 'var(--text-primary)' }} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                                                    {sub.profile_name}
                                                    {sub.isReferral && <span style={{ fontSize: '7px', background: 'rgba(172,248,0,0.1)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(172,248,0,0.2)' }}>REFERRAL</span>}
                                                    {sub.status === 'CONCLUÍDO' && <CheckCircle size={14} className="text-primary-color" />}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{new Date(sub.timestamp).toLocaleDateString()}</span>
                                                    <span style={{ color: 'var(--surface-border-subtle)' }}>•</span>
                                                    <span className="info-chip" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '2px 8px', fontSize: '8px', borderRadius: '6px' }}>
                                                        {cfg.label.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {sub.status === 'AGUARDANDO_APROVACAO_PAI' && sub.isReferral && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleApproveReferralSubmission(sub.id, true); }} 
                                                            className="action-btn ghost-btn" 
                                                            style={{ height: 36, padding: '0 12px', fontSize: '9px', borderColor: '#22c55e', color: '#22c55e', background: 'rgba(34,197,94,0.05)' }}
                                                        >
                                                            <CheckCircle2 size={14} /> APROVAR
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleApproveReferralSubmission(sub.id, false); }} 
                                                            className="action-btn ghost-btn" 
                                                            style={{ height: 36, padding: '0 12px', fontSize: '9px', borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.05)' }}
                                                        >
                                                            <XCircle size={14} /> REPROVAR
                                                        </button>
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedSubForChange(sub); setShowChangeRequestModal(true); }} 
                                                    className="action-btn ghost-btn alert-bell-btn" 
                                                    style={{ height: 40, width: 40, padding: 0, color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }} 
                                                    title="Pedir Alteração (Alerta)"
                                                >
                                                    <Bell size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteSubmission(sub.id)} className="action-btn ghost-btn" style={{ height: 36, width: 36, padding: 0, color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }} title="Excluir"><Trash2 size={14} /></button>
                                                <button onClick={() => handleDuplicateSubmission(sub)} className="action-btn ghost-btn" style={{ height: 36, width: 36, padding: 0 }}><CopyIcon size={14} /></button>
                                                <button onClick={() => navigate(`/client-submissions/${sub.id}`)} className="action-btn ghost-btn" style={{ height: 36, padding: '0 16px', fontSize: '9px' }}>DETALHES <ExternalLink size={14} /></button>
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
                                                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{log.log_type === 'TEMPLATE' ? 'Template Criado:' : 'Campanha Disparada:'} {log.name || log.campaign_name}</div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                    <span>•</span>
                                                    <span>RESPONSÁVEL: {log.author || 'SISTEMA'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'links' ? (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
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
                                    <div className="stat-card"><h5>CLIQUES TOTAIS</h5><div className="value">{aggregatedStats?.summary?.total_clicks || 0}</div></div>
                                    <div className="stat-card"><h5>LINKS ATIVOS</h5><div className="value">{aggregatedStats?.summary?.total_links || 0}</div></div>
                                    <div className="stat-card"><h5>TOP DISPOSITIVO</h5><div className="value" style={{ fontSize: '20px' }}>{aggregatedStats?.devices?.sort((a:any, b:any) => b.count - a.count)[0]?.device_type || 'N/A'}</div></div>
                                    <div className="stat-card"><h5>TOP PAÍS</h5><div className="value" style={{ fontSize: '20px' }}>{aggregatedStats?.geo?.sort((a:any, b:any) => b.count - a.count)[0]?.country || 'N/A'}</div></div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {links.map((link) => (
                                    <div key={link.id} className="control-card" style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                            <div style={{ background: 'rgba(172,248,0,0.1)', padding: '10px', borderRadius: '12px' }}><LinkIcon size={20} className="text-primary-color" /></div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary-color)', lineHeight: 1 }}>{link.clicks || 0}</div>
                                                <div style={{ fontSize: '8px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Cliques</div>
                                            </div>
                                        </div>
                                        <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{link.title}</h4>
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'var(--primary-color)', wordBreak: 'break-all' }}>{window.location.host}/l/{link.short_code}</p>
                                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleViewLinkStats(link.id)} className="action-btn ghost-btn" style={{ flex: 1, height: 40, fontSize: '9px' }}>VER MÉTRICAS</button>
                                            <button onClick={() => window.open(`https://${window.location.host}/l/${link.short_code}`, '_blank')} className="action-btn ghost-btn" style={{ width: 40, height: 40, padding: 0 }}><ExternalLink size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'referrals' ? (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                            {/* SEÇÃO: LINK DE INDICAÇÃO */}
                            <div className="control-card" style={{ marginBottom: '40px', border: '1px solid var(--primary-color)', background: 'rgba(172,248,0,0.02)' }}>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-1px' }}>Seu <span className="text-primary-color">Link de Indicação</span></h3>
                                <p style={{ margin: '8px 0 24px 0', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>GANHE BENEFÍCIOS INDICANDO NOVOS CLIENTES PARA A PLATAFORMA</p>
                                
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <input 
                                            readOnly 
                                            value={`${window.location.protocol}//${window.location.host}/client-add/${user?.id}`}
                                            className="field-input"
                                            style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.05)', color: 'var(--primary-color)', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard(`${window.location.protocol}//${window.location.host}/client-add/${user?.id}`, 'REFE')}
                                        className="action-btn primary-btn"
                                        style={{ height: 52, padding: '0 32px' }}
                                    >
                                        <CopyIcon size={18} /> {copyFeedback === 'REFE' ? 'COPIADO!' : 'COPIAR LINK'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Users className="text-primary-color" size={20} />
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Indicados Registrados</h3>
                                </div>
                                {isSubClientsLoading ? (
                                    <div style={{ padding: '40px', textAlign: 'center' }}>
                                        <div style={{ width: 24, height: 24, margin: '0 auto 12px', border: '2px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    </div>
                                ) : subClients.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Nenhum cliente indicado até o momento.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                        {subClients.map((client) => (
                                            <div key={client.id} style={{ padding: '20px', background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>{client.name}</h4>
                                                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>{client.email}</p>
                                                    </div>
                                                    <span className="info-chip" style={{ 
                                                        background: client.approved ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', 
                                                        color: client.approved ? '#22c55e' : '#f59e0b',
                                                        border: `1px solid ${client.approved ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                                        padding: '4px 8px',
                                                        fontSize: '8px'
                                                    }}>
                                                        {client.approved ? 'ATIVO' : 'PENDENTE'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {!client.approved && (
                                                        <button 
                                                            onClick={() => handleApproveSubClient(client.id)}
                                                            className="action-btn primary-btn" style={{ flex: 1, height: 36, fontSize: '9px' }}
                                                        >APROVAR</button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteSubClient(client.id)}
                                                        className="action-btn ghost-btn" style={{ height: 36, width: 36, padding: 0, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                                                    ><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ borderTop: '1px solid var(--surface-border-subtle)', paddingTop: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Layers className="text-primary-color" size={20} />
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Campanhas das Indicações</h3>
                                </div>
                                {referralSubmissions.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Nenhuma campanha de indicação aguardando ação.</p>
                                    </div>
                                ) : (
                                    referralSubmissions.map((sub) => {
                                        const cfg = statusCfg(sub.status);
                                        return (
                                            <div key={sub.id} className="submission-link">
                                                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(172,248,0,0.1)', border: '1px solid rgba(172,248,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Smartphone size={20} style={{ color: 'var(--primary-color)' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900 }}>{sub.profile_name}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>POR: {sub.submitted_by || 'CLIENTE INDICADO'}</span>
                                                        <span style={{ color: 'var(--surface-border-subtle)' }}>•</span>
                                                        <span className="info-chip" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '2px 8px', fontSize: '8px', borderRadius: '6px' }}>
                                                            {cfg.label.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        onClick={() => handleApproveReferralSubmission(sub.id, true)}
                                                        className="action-btn ghost-btn" 
                                                        style={{ height: 36, padding: '0 16px', fontSize: '9px', borderColor: '#22c55e', color: '#22c55e', background: 'rgba(34,197,94,0.05)' }}
                                                    >APROVAR</button>
                                                    <button 
                                                        onClick={() => handleApproveReferralSubmission(sub.id, false)}
                                                        className="action-btn ghost-btn" 
                                                        style={{ height: 36, padding: '0 16px', fontSize: '9px', borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.05)' }}
                                                    >REPROVAR</button>
                                                    <button onClick={() => { setSelectedSubDetail(sub); setShowSubDetailModal(true); }} className="action-btn ghost-btn" style={{ height: 36, width: 36, padding: 0 }}><ExternalLink size={14} /></button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

            {showSubDetailModal && selectedSubDetail && (
                <div className="modal-overlay" onClick={() => setShowSubDetailModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <button className="close-modal" onClick={() => setShowSubDetailModal(false)}><X size={20} /></button>
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'inline-flex', background: 'rgba(172,248,0,0.1)', padding: '12px', borderRadius: '16px', marginBottom: '16px' }}><FileText className="text-primary-color" size={24} /></div>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 940, letterSpacing: '-1.5px' }}>{selectedSubDetail.profile_name}</h2>
                            <p style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px' }}>DETALHES DA CAMPANHA • {selectedSubDetail.status.replace(/_/g, ' ')}</p>
                        </div>
                        <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cópia do Anúncio</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedSubDetail.ad_copy || "Nenhuma cópia providenciada."}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '16px', padding: '16px' }}>
                                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>TIPO DE TEMPLATE</span>
                                <div style={{ fontWeight: 700, marginTop: '4px' }}>{selectedSubDetail.template_type}</div>
                            </div>
                            <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '16px', padding: '16px' }}>
                                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>DDD</span>
                                <div style={{ fontWeight: 700, marginTop: '4px' }}>{selectedSubDetail.ddd}</div>
                            </div>
                        </div>
                        {selectedSubDetail.status === 'AGUARDANDO_APROVACAO_PAI' && (
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button type="button" onClick={() => { handleApproveReferralSubmission(selectedSubDetail.id, true); setShowSubDetailModal(false); }} className="action-btn primary-btn" style={{ flex: 1, height: 52 }}>APROVAR CAMPANHA</button>
                                <button type="button" onClick={() => { handleApproveReferralSubmission(selectedSubDetail.id, false); setShowSubDetailModal(false); }} className="action-btn ghost-btn" style={{ height: 52, color: '#ef4444' }}>REPROVAR</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showLinkModal && selectedLinkStats && (
                <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowLinkModal(false)}><X size={20} /></button>
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'inline-flex', background: 'rgba(172,248,0,0.1)', padding: '12px', borderRadius: '16px', marginBottom: '16px' }}><LinkIcon className="text-primary-color" size={24} /></div>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 940, letterSpacing: '-1.5px' }}>{selectedLinkStats.link.title}</h2>
                            <p style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px' }}>DETALHES DE PERFORMANCE EM TEMPO REAL</p>
                        </div>
                        
                        <div className="analytics-grid">
                            <div className="stat-card"><h5>CLIQUES TOTAIS</h5><div className="value">{selectedLinkStats.clicks || 0}</div></div>
                            <div className="stat-card"><h5>PAÍS PRINCIPAL</h5><div className="value" style={{ fontSize: '20px' }}>{selectedLinkStats.geo_stats?.sort((a:any, b:any) => b.count - a.count)[0]?.country || 'N/A'}</div></div>
                            <div className="stat-card"><h5>DISPOSITIVO</h5><div className="value" style={{ fontSize: '20px' }}>{selectedLinkStats.device_stats?.sort((a:any, b:any) => b.count - a.count)[0]?.device_type || 'N/A'}</div></div>
                            <div className="stat-card"><h5>CRIADO EM</h5><div className="value" style={{ fontSize: '20px' }}>{new Date(selectedLinkStats.link.created_at).toLocaleDateString()}</div></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="control-card">
                                <h4 style={{ margin: '0 0 20px 0', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Geolocalização (Países)</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {selectedLinkStats.geo_stats?.slice(0, 5).map((g: any) => (
                                        <div key={g.country}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                                                <span>{g.country}</span>
                                                <span className="text-primary-color">{g.count}</span>
                                            </div>
                                            <div className="chart-bar"><div className="chart-fill" style={{ width: `${(g.count / selectedLinkStats.clicks) * 100}%` }} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="control-card">
                                <h4 style={{ margin: '0 0 20px 0', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dispositivos e Navegadores</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {selectedLinkStats.device_stats?.slice(0, 5).map((d: any) => (
                                        <div key={d.device_type}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                                                <span>{d.device_type}</span>
                                                <span className="text-primary-color">{d.count}</span>
                                            </div>
                                            <div className="chart-bar"><div className="chart-fill" style={{ width: `${(d.count / selectedLinkStats.clicks) * 100}%`, background: 'var(--secondary-color)' }} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {copyFeedback && (
                <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: '#000', padding: '12px 24px', borderRadius: '16px', fontWeight: 900, fontSize: '13px', boxShadow: '0 10px 40px rgba(172,248,0,0.3)', zIndex: 9999, animation: 'fadeInUp 0.3s ease-out' }}>
                    ✓ {copyFeedback.toUpperCase()} COPIADO COM SUCESSO!
                </div>
            )}

            {showChangeRequestModal && selectedSubForChange && (
                <div className="modal-overlay" style={{ zIndex: 10001 }}>
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <button onClick={() => setShowChangeRequestModal(false)} className="close-modal"><X size={20} /></button>
                        
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <Bell size={24} className="text-primary-color" />
                                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-1px' }}>Solicitar Alteração</h2>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>As mudanças serão enviadas para aprovação do Admin.</p>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const requested_data = {
                                template_type: formData.get('template_type'),
                                media_url: formData.get('media_url'),
                                ad_copy: formData.get('ad_copy'),
                                button_link: formData.get('button_link'),
                                spreadsheet_url: formData.get('spreadsheet_url'),
                                variables: (formData.get('variables') as string)?.split(',').map(v => v.trim()).filter(v => v),
                            };
                            
                            const original_data = {
                                template_type: selectedSubForChange.template_type,
                                media_url: selectedSubForChange.media_url,
                                ad_copy: selectedSubForChange.ad_copy,
                                button_link: selectedSubForChange.button_link,
                                spreadsheet_url: selectedSubForChange.spreadsheet_url,
                                variables: selectedSubForChange.ads?.[0]?.variables || [],
                            };

                            const res = await dbService.addChangeRequest({
                                submission_id: selectedSubForChange.id,
                                user_id: user?.id as number,
                                requested_data,
                                original_data
                            });

                            if (res) {
                                alert("Solicitação enviada com sucesso! Aguarde a aprovação.");
                                setShowChangeRequestModal(false);
                            } else {
                                alert("Erro ao enviar solicitação.");
                            }
                        }}>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label className="field-label">Tipo de Template</label>
                                    <select name="template_type" defaultValue={selectedSubForChange.template_type} className="field-input" style={{ appearance: 'none' }}>
                                        <option value="none">Apenas Texto</option>
                                        <option value="image">Imagem</option>
                                        <option value="video">Vídeo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="field-label">Mídia (Imagem/Vídeo)</label>
                                    <input name="media_url" defaultValue={selectedSubForChange.media_url} placeholder="https://..." className="field-input" />
                                </div>

                                <div>
                                    <label className="field-label">Link do Botão</label>
                                    <input name="button_link" defaultValue={selectedSubForChange.button_link} placeholder="https://wa.me/..." className="field-input" />
                                </div>

                                <div>
                                    <label className="field-label">Cópia / Mensagem</label>
                                    <textarea name="ad_copy" defaultValue={selectedSubForChange.ad_copy} rows={4} className="field-input" style={{ resize: 'vertical' }} />
                                </div>

                                <div>
                                    <label className="field-label">Planilha Excel (URL)</label>
                                    <input name="spreadsheet_url" defaultValue={selectedSubForChange.spreadsheet_url} placeholder="https://docs.google.com/..." className="field-input" />
                                </div>

                                <div>
                                    <label className="field-label">Variáveis (Separadas por vírgula)</label>
                                    <input 
                                        name="variables" 
                                        defaultValue={(selectedSubForChange.ads?.[0]?.variables || []).join(', ')} 
                                        placeholder="v1, v2, v3..." 
                                        className="field-input" 
                                    />
                                    <p style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>Ex: nome, data, valor</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => setShowChangeRequestModal(false)} className="action-btn ghost-btn" style={{ flex: 1, minWidth: '120px' }}>CANCELAR</button>
                                <button type="submit" className="action-btn primary-btn" style={{ flex: 2, minWidth: '180px' }}>ENVIAR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
};

export default ClientDashboard;
