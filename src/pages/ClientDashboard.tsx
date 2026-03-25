import React, { useState, useEffect } from 'react';
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
    Zap,
    Link as LinkIcon,
    Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
    const { user, logout, setUser } = useAuth() as any;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'submissions' | 'agency_lots' | 'links' | 'profile' | 'activity'>('submissions');
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [links, setLinks] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLinksLoading, setIsLinksLoading] = useState(false);
    const [isLogsLoading, setIsLogsLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        confirmPassword: ''
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user?.id) {
            fetchSubmissions();
            fetchLinks();
            if (activeTab === 'activity') fetchLogs();
        }
    }, [user, activeTab]);

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

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage({ type: '', text: '' });

        if (profileData.password && profileData.password !== profileData.confirmPassword) {
            setProfileMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        setIsSavingProfile(true);
        try {
            const result = await dbService.updateProfile({
                id: user!.id,
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                password: profileData.password || undefined
            });

            if (result.error) {
                setProfileMessage({ type: 'error', text: result.error });
            } else {
                setProfileMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
                // Update local context
                setUser(result);
            }
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: 'Erro ao salvar perfil.' });
        } finally {
            setIsSavingProfile(false);
        }
    };
    const handleDeleteSubmission = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir esta submissão?")) return;
        try {
            await dbService.deleteClientSubmission(id);
            setSubmissions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error("Error deleting submission:", error);
            alert("Erro ao excluir submissão.");
        }
    };

    const handleDeleteLink = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este link?")) return;
        try {
            await dbService.deleteShortLink(id);
            setLinks(prev => prev.filter(l => l.id !== id));
        } catch (error) {
            console.error("Error deleting link:", error);
            alert("Erro ao excluir link.");
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
                        className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        MEU PERFIL
                    </button>
                </div>

                {/* ── CONTENT ── */}
                <div className="control-card" style={{ animationDelay: '0.4s', padding: activeTab === 'profile' ? '40px' : '24px' }}>
                    {activeTab === 'submissions' ? (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                            {isLoading ? (
                                <div style={{ padding: '80px', textAlign: 'center' }}>
                                    <div style={{ width: 32, height: 32, margin: '0 auto 16px', border: '2px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px' }}>CARREGANDO...</p>
                                </div>
                            ) : submissions.filter(s => s.submitted_by === user?.name || s.submitted_by === 'Cliente (Externo)' || !s.submitted_by).length === 0 ? (
                                <div style={{ padding: '80px', textAlign: 'center', opacity: 0.2 }}>
                                    <FileText size={48} style={{ marginBottom: '16px' }} />
                                    <p style={{ fontWeight: 800 }}>Nenhuma submissão manual registrada.</p>
                                </div>
                            ) : (
                                submissions.filter(s => s.submitted_by === user?.name || s.submitted_by === 'Cliente (Externo)' || !s.submitted_by).map((sub) => {
                                    const cfg = statusCfg(sub.status);
                                    return (
                                        <div key={sub.id} className="submission-link">
                                            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Smartphone size={20} style={{ opacity: 0.3, color: 'var(--text-primary)' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                                                    {sub.profile_name}
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
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                    {links.map((link) => (
                                        <div key={link.id} className="control-card" style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                <div style={{ background: 'rgba(172,248,0,0.1)', padding: '8px', borderRadius: '10px' }}>
                                                    <LinkIcon size={18} className="text-primary-color" />
                                                </div>
                                                <div style={{ textAlign: 'right', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary-color)', lineHeight: 1 }}>{link.clicks || 0}</div>
                                                        <div style={{ fontSize: '8px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Cliques</div>
                                                    </div>
                                                    {user?.role !== 'CLIENT' && (
                                                        <button 
                                                            onClick={() => handleDeleteLink(link.id)}
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                                            title="Excluir Link"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                                                {link.title}
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)', wordBreak: 'break-all' }}>
                                                {window.location.host}/l/{link.short_code}
                                            </p>
                                            <div style={{ marginTop: '16px', opacity: 0.3, fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                                                {link.original_url}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeInUp 0.4s ease-out' }}>
                            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label className="field-label"><User size={14} /> Dados Básicos</label>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>NOME COMPLETO</label>
                                            <input className="field-input" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>E-MAIL</label>
                                            <input type="email" className="field-input" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '16px' }}>
                                        <label style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>WHATSAPP DE CONTATO</label>
                                        <input className="field-input" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} placeholder="Ex: 11999998888" />
                                    </div>
                                </div>

                                <div style={{ height: '1px', background: 'var(--surface-border-subtle)', margin: '8px 0' }} />

                                <div>
                                    <label className="field-label"><Zap size={14} /> Segurança</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>NOVA SENHA</label>
                                            <input type="password" className="field-input" value={profileData.password} onChange={e => setProfileData({ ...profileData, password: e.target.value })} placeholder="••••••••" />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>CONFIRMAR SENHA</label>
                                            <input type="password" className="field-input" value={profileData.confirmPassword} onChange={e => setProfileData({ ...profileData, confirmPassword: e.target.value })} placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>

                                {profileMessage.text && (
                                    <div style={{ 
                                        padding: '16px', 
                                        borderRadius: '16px', 
                                        background: profileMessage.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                                        border: `1px solid ${profileMessage.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                                        color: profileMessage.type === 'error' ? '#ef4444' : '#22c55e',
                                        fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textAlign: 'center'
                                    }}>
                                        {profileMessage.text.toUpperCase()}
                                    </div>
                                )}

                                <button type="submit" className="action-btn primary-btn" disabled={isSavingProfile} style={{ width: '100%', height: 52 }}>
                                    {isSavingProfile ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* ── FOOTER LOGO ── */}
                <div style={{ marginTop: '40px', textAlign: 'center', opacity: 0.1 }}>
                    <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '4px' }}>PLUG & SALES • PRO</h2>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
