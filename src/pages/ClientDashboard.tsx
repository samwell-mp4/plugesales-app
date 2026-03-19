import React, { useState, useEffect } from 'react';
import {
    User,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    LogOut,
    Save,
    Key,
    Smartphone,
    Hash,
    ExternalLink
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

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDENTE': return { color: '#facc15', icon: <Clock size={16} />, text: 'Em Análise' };
            case 'EM ANDAMENTO': return { color: '#60a5fa', icon: <Hash size={16} />, text: 'Sendo Processada' };
            case 'CONCLUÍDO': return { color: '#acf800', icon: <CheckCircle2 size={16} />, text: 'Concluído' };
            case 'CANCELADO': return { color: '#f87171', icon: <AlertCircle size={16} />, text: 'Cancelado' };
            default: return { color: '#94a3b8', icon: <Clock size={16} />, text: status };
        }
    };

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'PENDENTE').length,
        completed: submissions.filter(s => s.status === 'CONCLUÍDO').length
    };

    return (
        <div className="animate-fade-in p-2 lg:p-8 pb-32 max-w-7xl mx-auto">
            <style>{`
                .active-scale { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .active-scale:active { transform: scale(0.96); opacity: 0.8; }
                
                .premium-glass {
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(24px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
                }
                
                .premium-header {
                    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
                    border-radius: 32px;
                    border: 1px solid rgba(255,255,255,0.08);
                }

                .stat-card-premium {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: default;
                }
                .stat-card-premium:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(172, 248, 0, 0.3);
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6);
                }

                .tab-btn {
                    position: relative;
                    padding: 14px 28px;
                    font-weight: 800;
                    font-size: 14px;
                    letter-spacing: 0.5px;
                    color: rgba(255,255,255,0.4);
                    transition: all 0.3s ease;
                    border-radius: 12px;
                }
                .tab-btn.active {
                    color: white;
                    background: rgba(255,255,255,0.05);
                }
                .tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: 8px;
                    left: 25%;
                    width: 50%;
                    height: 2px;
                    background: var(--primary-color);
                    border-radius: 2px;
                    box-shadow: 0 0 10px var(--primary-color);
                }

                .submission-row {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 12px;
                    transition: all 0.3s ease;
                }
                .submission-row:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.1);
                    transform: scale(1.005);
                }

                .input-premium {
                    background: rgba(255,255,255,0.03) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    height: 56px !important;
                    border-radius: 16px !important;
                    font-weight: 600 !important;
                    padding: 0 20px !important;
                    transition: all 0.3s ease !important;
                }
                .input-premium:focus {
                    border-color: var(--primary-color) !important;
                    background: rgba(255,255,255,0.05) !important;
                    box-shadow: 0 0 0 4px rgba(172, 248, 0, 0.1) !important;
                }
            `}</style>

            {/* Header Area */}
            <div className="premium-header mb-10 p-8 lg:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div style={{
                            background: 'var(--primary-gradient)',
                            width: '64px', height: '64px',
                            minWidth: '64px', minHeight: '64px',
                            borderRadius: '22px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 12px 30px -8px rgba(172, 248, 0, 0.4)',
                            flexShrink: 0
                        }}>
                            <User size={32} color="black" />
                        </div>
                        <div>
                            <h1 style={{ fontWeight: 900, fontSize: '2.4rem', letterSpacing: '-1.5px', marginBottom: '4px', lineHeight: 1.1 }}>
                                Central do <span className="text-primary-color">Cliente</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] uppercase font-black tracking-wider text-green-400">Online</span>
                                </span>
                                <span className="text-white/30 text-xs font-bold uppercase tracking-widest leading-none">
                                    Sessão: {user?.name}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/client-form')}
                            className="bg-[#acf800] text-black h-14 px-8 rounded-2xl font-black flex items-center gap-3 active-scale hover:brightness-110 shadow-[0_8px_25px_-5px_rgba(172,248,0,0.4)]"
                        >
                            <FileText size={20} /> NOVA CAMPANHA
                        </button>

                        <div className="h-10 w-[1px] bg-white/10 mx-2 hidden lg:block" />

                        <button
                            onClick={logout}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/10 text-white/40 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 active-scale"
                            title="Sair"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Robust 3-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="stat-card-premium p-7 flex items-center gap-6">
                    <div style={{ background: 'rgba(96, 165, 250, 0.08)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.1)' }}>
                        <FileText size={28} />
                    </div>
                    <div>
                        <span className="text-4xl font-black block tracking-tighter" style={{ lineHeight: 1, color: '#f8fafc' }}>{stats.total}</span>
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[2px] mt-2 block">TOTAL ENVIADO</span>
                    </div>
                </div>

                <div className="stat-card-premium p-7 flex items-center gap-6">
                    <div style={{ background: 'rgba(250, 204, 21, 0.08)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.1)' }}>
                        <Clock size={28} />
                    </div>
                    <div>
                        <span className="text-4xl font-black block tracking-tighter" style={{ lineHeight: 1, color: '#f8fafc' }}>{stats.pending}</span>
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[2px] mt-2 block">EM ANÁLISE</span>
                    </div>
                </div>

                <div className="stat-card-premium p-7 flex items-center gap-6 lg:col-span-1 sm:col-span-2">
                    <div style={{ background: 'rgba(172, 248, 0, 0.08)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#acf800', border: '1px solid rgba(172, 248, 0, 0.1)' }}>
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <span className="text-4xl font-black block tracking-tighter" style={{ lineHeight: 1, color: '#f8fafc' }}>{stats.completed}</span>
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[2px] mt-2 block">FINALIZADAS</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-10 p-1.5 bg-white/5 w-fit rounded-2xl border border-white/5">
                <button
                    onClick={() => setActiveTab('submissions')}
                    className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
                >
                    MINHAS SUBMISSÕES
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                >
                    MEU PERFIL
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'submissions' ? (
                    <div className="animate-fade-in space-y-3">
                        {isLoading ? (
                            <div className="p-32 flex flex-col items-center gap-4 opacity-40">
                                <Clock className="animate-spin text-primary-color" size={48} strokeWidth={1} />
                                <span className="text-xs font-black tracking-widest">CARREGANDO...</span>
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="premium-glass p-24 text-center border-dashed" style={{ borderRadius: '32px' }}>
                                <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-white/5">
                                    <FileText size={32} className="opacity-20" />
                                </div>
                                <h3 className="text-xl font-black mb-2">Nada por aqui ainda</h3>
                                <p className="text-white/30 text-sm max-w-xs mx-auto">Suas campanhas aparecerão listadas aqui assim que você realizar o primeiro envio.</p>
                                <button
                                    onClick={() => navigate('/client-form')}
                                    className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-black tracking-widest transition-all"
                                >
                                    ENVIAR MINHA PRIMEIRA CAMPANHA
                                </button>
                            </div>
                        ) : (
                            submissions.map((sub) => {
                                const status = getStatusInfo(sub.status);
                                return (
                                    <div key={sub.id} className="submission-row group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary-color/20 transition-all shrink-0">
                                                    <Smartphone size={24} className="text-white/40 group-hover:text-primary-color transition-all" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-xl m-0 flex items-center gap-3">
                                                        {sub.profile_name}
                                                        {status.text === 'Concluído' && <CheckCircle2 size={18} className="text-primary-color" />}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Clock size={12} /> {new Date(sub.timestamp).toLocaleDateString()}
                                                        </span>
                                                        <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-lg border border-white/5">
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: status.color, boxShadow: `0 0 10px ${status.color}` }} />
                                                            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: status.color }}>
                                                                {status.text}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8 md:pl-8 border-l border-white/5">
                                                {sub.sender_number && (
                                                    <div className="hidden sm:flex flex-col items-end">
                                                        <span className="text-[9px] text-white/20 uppercase font-black tracking-[2px] mb-1">LINHA DE ENVIO</span>
                                                        <span className="text-xs font-black text-primary-color/80">{sub.sender_number}</span>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => navigate(`/client-submissions/${sub.id}`)}
                                                    className="h-14 px-8 rounded-2xl flex items-center gap-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all font-black text-[11px] tracking-widest active-scale"
                                                >
                                                    DETALHES <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {sub.notes && (
                                            <div className="mt-6 p-5 rounded-2xl bg-[#acf800]/5 border border-[#acf800]/10 flex gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-primary-color/10 flex items-center justify-center shrink-0">
                                                    <AlertCircle size={16} className="text-primary-color" />
                                                </div>
                                                <p className="text-xs m-0 text-white/60 leading-relaxed italic">
                                                    <b className="text-primary-color not-italic uppercase tracking-widest mr-2 block mb-1">Feedback do Suporte:</b>
                                                    "{sub.notes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <div className="premium-glass p-10 max-w-2xl animate-fade-in" style={{ borderRadius: '32px' }}>
                        <form onSubmit={handleProfileUpdate} className="flex flex-col gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-color/10 flex items-center justify-center">
                                    <User className="text-primary-color" size={24} />
                                </div>
                                <div>
                                    <h3 className="m-0 font-black text-xl italic tracking-tight">DADOS BÁSICOS</h3>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Informações de contato e identificação</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[2px]">Nome da Empresa / Marca</label>
                                    <input
                                        className="input-premium"
                                        value={profileData.name}
                                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                        required
                                        placeholder="Minha Marca"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[2px]">E-mail de Acesso</label>
                                    <input
                                        type="email"
                                        className="input-premium"
                                        value={profileData.email}
                                        onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                        required
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[2px]">WhatsApp para Notificações</label>
                                <input
                                    className="input-premium"
                                    value={profileData.phone}
                                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                    placeholder="Ex: 11999998888"
                                />
                            </div>

                            <div className="h-[1px] bg-white/5 my-2" />

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                    <Key className="text-blue-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="m-0 font-black text-xl italic tracking-tight">SEGURANÇA</h3>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Atualize sua senha de acesso</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[2px]">Nova Senha (Opcional)</label>
                                    <input
                                        type="password"
                                        className="input-premium"
                                        value={profileData.password}
                                        onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[2px]">Confirmar Senha</label>
                                    <input
                                        type="password"
                                        className="input-premium"
                                        value={profileData.confirmPassword}
                                        onChange={e => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {profileMessage.text && (
                                <div className={`p-5 rounded-2xl font-black text-xs tracking-wide flex items-center gap-3 animate-fade-in ${profileMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                    {profileMessage.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                                    {profileMessage.text.toUpperCase()}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="bg-[#acf800] text-black h-16 rounded-2xl font-black text-[13px] tracking-widest flex items-center justify-center gap-3 active-scale hover:brightness-110 shadow-[0_10px_30px_-5px_rgba(172,248,0,0.3)] mt-4"
                                disabled={isSavingProfile}
                            >
                                {isSavingProfile ? 'PROCESSANDO...' : 'SALVAR ALTERAÇÕES'}
                                <Save size={20} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientDashboard;
