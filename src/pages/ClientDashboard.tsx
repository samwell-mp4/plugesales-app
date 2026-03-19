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
        <div className="animate-fade-in p-2 lg:p-6 pb-20">
            <style>{`
                .active-scale { transition: transform 0.15s ease; }
                .active-scale:active { transform: scale(0.95); }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                }
                
                .stat-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .stat-card:hover {
                    transform: translateY(-5px);
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                }
                .stat-card::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.03), transparent);
                    transform: translateX(-100%);
                    transition: 0.5s;
                }
                .stat-card:hover::after { transform: translateX(100%); }

                .submission-card {
                    margin-bottom: 12px;
                    border-radius: 20px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s ease;
                }
                .submission-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(172, 248, 0, 0.2);
                    transform: scale(1.01);
                }
            `}</style>
            {/* Header / Action Bar */}
            <div className="glass-card mb-8 p-6 lg:p-8" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px' }}>
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div style={{ 
                            background: 'var(--primary-gradient)', 
                            width: '56px', height: '56px', 
                            borderRadius: '20px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 10px 25px -5px var(--primary-color)'
                        }}>
                            <User size={28} color="black" />
                        </div>
                        <div>
                            <h1 style={{ fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-1.5px', marginBottom: '4px', lineHeight: 1 }}>
                                Central do <span className="text-primary-color">Cliente</span>
                            </h1>
                            <p className="text-white/40 font-bold text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Logado como {user?.name}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/client-form')}
                            className="btn btn-primary h-14 px-8 rounded-2xl font-black flex items-center gap-3 active-scale"
                            style={{ boxShadow: '0 8px 20px -6px var(--primary-color)' }}
                        >
                            <FileText size={20} /> NOVA CAMPANHA
                        </button>
                        
                        <div className="h-10 w-[1px] bg-white/10 mx-2 hidden md:block" />
                        
                        <button 
                            onClick={logout}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 active-scale"
                            title="Sair"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                </header>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card stat-card flex items-center gap-5 p-6" style={{ borderLeft: '4px solid #60a5fa' }}>
                    <div style={{ background: 'rgba(96, 165, 250, 0.1)', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <span className="text-3xl font-black block tracking-tighter" style={{ lineHeight: 1 }}>{stats.total}</span>
                        <span className="text-white/30 text-[10px] font-black uppercase tracking-[2px] mt-1 block">Total Enviado</span>
                    </div>
                </div>
                <div className="glass-card stat-card flex items-center gap-5 p-6" style={{ borderLeft: '4px solid #facc15' }}>
                    <div style={{ background: 'rgba(250, 204, 21, 0.1)', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15' }}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <span className="text-3xl font-black block tracking-tighter" style={{ lineHeight: 1 }}>{stats.pending}</span>
                        <span className="text-white/30 text-[10px] font-black uppercase tracking-[2px] mt-1 block">Em Análise</span>
                    </div>
                </div>
                <div className="glass-card stat-card flex items-center gap-5 p-6" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <div style={{ background: 'rgba(172, 248, 0, 0.1)', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <span className="text-3xl font-black block tracking-tighter" style={{ lineHeight: 1 }}>{stats.completed}</span>
                        <span className="text-white/30 text-[10px] font-black uppercase tracking-[2px] mt-1 block">Finalizadas</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-white/5">
                <button 
                    onClick={() => setActiveTab('submissions')}
                    className={`pb-4 px-2 font-bold transition-all ${activeTab === 'submissions' ? 'text-primary-color border-b-2 border-primary-color' : 'text-white/40 hover:text-white'}`}
                >
                    Submissões
                </button>
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 px-2 font-bold transition-all ${activeTab === 'profile' ? 'text-primary-color border-b-2 border-primary-color' : 'text-white/40 hover:text-white'}`}
                >
                    Meu Perfil
                </button>
            </div>

            {activeTab === 'submissions' ? (
                <div className="grid grid-cols-1 gap-2 animate-fade-in">
                    {isLoading ? (
                        <div className="p-20 flex justify-center">
                            <Clock className="animate-spin text-primary-color" size={40} />
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="glass-card p-20 text-center opacity-40" style={{ borderRadius: '24px' }}>
                            <FileText size={48} className="mx-auto mb-4" />
                            <p className="font-bold">Nenhuma submissão encontrada.</p>
                        </div>
                    ) : (
                        submissions.map((sub) => {
                            const status = getStatusInfo(sub.status);
                            return (
                                <div key={sub.id} className="submission-card">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div style={{ 
                                                width: '52px', height: '52px', borderRadius: '16px', 
                                                background: 'rgba(255,255,255,0.03)', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: '1px solid rgba(255,255,255,0.08)'
                                            }}>
                                                <Smartphone size={24} className="text-white/60" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-lg m-0 flex items-center gap-2">
                                                    {sub.profile_name}
                                                    {status.text === 'Concluído' && <CheckCircle2 size={16} className="text-primary-color" />}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(sub.timestamp).toLocaleDateString()}</span>
                                                    <span className="text-white/10">•</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                                                        <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: status.color }}>
                                                            {status.text}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            {sub.sender_number && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">Enviado por</span>
                                                    <span className="text-xs font-black text-primary-color">{sub.sender_number}</span>
                                                </div>
                                            )}
                                            <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
                                            <button 
                                                onClick={() => navigate(`/client-submissions/${sub.id}`)}
                                                className="h-12 px-6 rounded-xl flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all font-black text-[11px] tracking-widest active-scale"
                                            >
                                                DETALHES <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {sub.notes && (
                                        <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                            <p className="text-xs m-0 text-blue-200/60 leading-relaxed italic">
                                                <b className="text-blue-400 not-italic uppercase tracking-widest mr-2">Feedback:</b> "{sub.notes}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="glass-card p-8 max-w-2xl animate-fade-in">
                    <form onSubmit={handleProfileUpdate} className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 mb-2">
                            <User className="text-primary-color" size={24} />
                            <h3 className="m-0 font-black">Dados Básicos</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-white/50 uppercase">Nome Completo</label>
                                <input 
                                    className="input-field" 
                                    value={profileData.name}
                                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-white/50 uppercase">E-mail</label>
                                <input 
                                    type="email" 
                                    className="input-field" 
                                    value={profileData.email}
                                    onChange={e => setProfileData({...profileData, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-white/50 uppercase">WhatsApp de Contato</label>
                            <input 
                                className="input-field" 
                                value={profileData.phone}
                                onChange={e => setProfileData({...profileData, phone: e.target.value})}
                                placeholder="DDD + Número"
                            />
                        </div>

                        <div className="h-[1px] bg-white/5 my-2" />

                        <div className="flex items-center gap-3 mb-2">
                            <Key className="text-primary-color" size={24} />
                            <h3 className="m-0 font-black">Segurança</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-white/50 uppercase">Nova Senha</label>
                                <input 
                                    type="password" 
                                    className="input-field" 
                                    value={profileData.password}
                                    onChange={e => setProfileData({...profileData, password: e.target.value})}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-white/50 uppercase">Confirmar Senha</label>
                                <input 
                                    type="password" 
                                    className="input-field" 
                                    value={profileData.confirmPassword}
                                    onChange={e => setProfileData({...profileData, confirmPassword: e.target.value})}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {profileMessage.text && (
                            <div className={`p-4 rounded-xl font-bold text-sm ${profileMessage.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                {profileMessage.text}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary mt-4" 
                            style={{ padding: '16px', borderRadius: '16px', fontWeight: 900 }}
                            disabled={isSavingProfile}
                        >
                            {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'} <Save size={20} className="ml-2" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;
