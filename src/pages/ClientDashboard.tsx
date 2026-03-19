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
    Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
    const { user, logout, setUser } = useAuth() as any;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'submissions' | 'profile'>('submissions');
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        }
    }, [user]);

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
    const statusCfg = (status: string) => {
        switch (status) {
            case 'PENDENTE': return { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' };
            case 'EM ANDAMENTO': return { label: 'Em andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' };
            case 'CONCLUÍDO': return { label: 'Concluído', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' };
            case 'CANCELADO': return { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
            default: return { label: status, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
        }
    };

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'PENDENTE').length,
        completed: submissions.filter(s => s.status === 'CONCLUÍDO').length
    };

    return (
        <div className="container-root" style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: '28px 24px' }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .control-card { 
                    background: rgba(255,255,255,0.02); 
                    border: 1px solid rgba(255,255,255,0.06); 
                    border-radius: 24px; 
                    padding: 24px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: fadeInUp 0.4s ease-out backwards;
                }
                .control-card:hover { 
                    background: rgba(255,255,255,0.03); 
                    border-color: rgba(255,255,255,0.1);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px -10px rgba(0,0,0,0.5);
                }

                .action-btn { padding: 12px 20px; border-radius: 14px; border: none; cursor: pointer; font-weight: 900; font-size: 11px; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; text-transform: uppercase; }
                .primary-btn { background: var(--primary-gradient); color: #000; box-shadow: 0 8px 20px -6px var(--primary); }
                .ghost-btn { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.08) !important; }
                .ghost-btn:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.2) !important; }

                .nav-tab { padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.3); cursor: pointer; font-weight: 900; font-size: 10px; letter-spacing: 1px; transition: all 0.2s; text-transform: uppercase; }
                .nav-tab:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
                .nav-tab.active { background: rgba(172,248,0,0.1); border-color: var(--primary-color); color: var(--primary-color); box-shadow: 0 0 15px rgba(172,248,0,0.15); }

                .field-input { width: 100%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; color: white; font-size: 14px; font-weight: 600; outline: none; transition: all 0.2s; box-sizing: border-box; }
                .field-input:focus { border-color: var(--primary-color); background: rgba(255,255,255,0.04); box-shadow: 0 0 20px rgba(172,248,0,0.1); }
                
                .field-label { font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
                .info-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
                
                .submission-link {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 18px;
                    text-decoration: none;
                    transition: all 0.3s;
                    margin-bottom: 12px;
                }
                .submission-link:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.12);
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
                                border: '2px solid rgba(255,255,255,0.1)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 25px -5px rgba(172, 248, 0, 0.4)'
                            }}>
                                <User size={32} color="black" />
                            </div>
                            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: '6px', background: '#22c55e', border: '3px solid #020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-1.5px', lineHeight: 1 }}>
                                Central do <span className="text-primary-color">Cliente</span>
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                                <span className="info-chip" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    SESSÃO ATIVA
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>{stats.total}</p>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', textTransform: 'uppercase' }}>Total Enviado</p>
                        </div>
                    </div>
                    <div className="control-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', animationDelay: '0.2s' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>{stats.pending}</p>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', textTransform: 'uppercase' }}>Em Análise</p>
                        </div>
                    </div>
                    <div className="control-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', animationDelay: '0.3s' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>{stats.completed}</p>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', textTransform: 'uppercase' }}>Finalizadas</p>
                        </div>
                    </div>
                </div>

                {/* ── NAVIGATION TABS ── */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <button
                        className={`nav-tab ${activeTab === 'submissions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('submissions')}
                    >
                        MINHAS SUBMISSÕES
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
                                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', letterSpacing: '2px' }}>CARREGANDO...</p>
                                </div>
                            ) : submissions.length === 0 ? (
                                <div style={{ padding: '80px', textAlign: 'center', opacity: 0.2 }}>
                                    <FileText size={48} style={{ marginBottom: '16px' }} />
                                    <p style={{ fontWeight: 800 }}>Nenhuma submissão encontrada</p>
                                </div>
                            ) : (
                                submissions.map((sub) => {
                                    const cfg = statusCfg(sub.status);
                                    return (
                                        <div key={sub.id} className="submission-link">
                                            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Smartphone size={20} style={{ opacity: 0.3 }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {sub.profile_name}
                                                    {sub.status === 'CONCLUÍDO' && <CheckCircle size={14} className="text-primary-color" />}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>{new Date(sub.timestamp).toLocaleDateString()}</span>
                                                    <span style={{ color: 'rgba(255,255,255,0.05)' }}>•</span>
                                                    <span className="info-chip" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '2px 8px', fontSize: '8px', borderRadius: '6px' }}>
                                                        {cfg.label.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/client-submissions/${sub.id}`)}
                                                className="action-btn ghost-btn" 
                                                style={{ height: 36, padding: '0 16px', fontSize: '9px' }}
                                            >
                                                DETALHES <ExternalLink size={14} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeInUp 0.4s ease-out' }}>
                            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label className="field-label"><User size={14} /> Dados Básicos</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', marginBottom: '8px', display: 'block' }}>NOME COMPLETO</label>
                                            <input className="field-input" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', marginBottom: '8px', display: 'block' }}>E-MAIL</label>
                                            <input type="email" className="field-input" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '16px' }}>
                                        <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', marginBottom: '8px', display: 'block' }}>WHATSAPP DE CONTATO</label>
                                        <input className="field-input" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} placeholder="Ex: 11999998888" />
                                    </div>
                                </div>

                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '8px 0' }} />

                                <div>
                                    <label className="field-label"><Zap size={14} /> Segurança</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', marginBottom: '8px', display: 'block' }}>NOVA SENHA</label>
                                            <input type="password" className="field-input" value={profileData.password} onChange={e => setProfileData({ ...profileData, password: e.target.value })} placeholder="••••••••" />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', marginBottom: '8px', display: 'block' }}>CONFIRMAR SENHA</label>
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
