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
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', marginBottom: '4px' }}>
                        Portal do <span className="text-gradient">Cliente</span>
                    </h1>
                    <p className="text-white/60 font-medium">Bem-vindo de volta, {user?.name}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate('/client-form')}
                        className="btn btn-primary"
                        style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: 800 }}
                    >
                        Nova Campanha
                    </button>
                    <button 
                        onClick={logout}
                        className="btn btn-secondary"
                        style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: 'none' }}
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="glass-card flex items-center gap-4 p-6" style={{ borderLeft: '4px solid #60a5fa' }}>
                    <div style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '12px', borderRadius: '12px', color: '#60a5fa' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <span className="text-2xl font-black block">{stats.total}</span>
                        <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Total Enviado</span>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4 p-6" style={{ borderLeft: '4px solid #facc15' }}>
                    <div style={{ background: 'rgba(250, 204, 21, 0.1)', padding: '12px', borderRadius: '12px', color: '#facc15' }}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <span className="text-2xl font-black block">{stats.pending}</span>
                        <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Em Análise</span>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4 p-6" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <div style={{ background: 'rgba(172, 248, 0, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary-color)' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <span className="text-2xl font-black block">{stats.completed}</span>
                        <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Finalizadas</span>
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
                <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    {isLoading ? (
                        <div className="p-20 flex justify-center">
                            <Clock className="animate-spin text-primary-color" size={40} />
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="glass-card p-20 text-center opacity-40">
                            <FileText size={48} className="mx-auto mb-4" />
                            <p className="font-bold">Nenhuma submissão encontrada.</p>
                        </div>
                    ) : (
                        submissions.map((sub) => {
                            const status = getStatusInfo(sub.status);
                            return (
                                <div key={sub.id} className="glass-card p-5 hover-lift">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div style={{ 
                                                width: '50px', height: '50px', borderRadius: '14px', 
                                                background: 'rgba(255,255,255,0.03)', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                            }}>
                                                <Smartphone size={24} className="text-white/60" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-lg m-0">{sub.profile_name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-white/40">{new Date(sub.timestamp).toLocaleDateString()}</span>
                                                    <span className="text-white/10">•</span>
                                                    <span className="text-xs font-bold" style={{ color: status.color }}>
                                                        {status.text}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {sub.sender_number && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-white/30 uppercase font-black">Enviado por</span>
                                                    <span className="text-xs font-bold text-primary-color">{sub.sender_number}</span>
                                                </div>
                                            )}
                                            <div className="h-10 w-[1px] bg-white/5 hidden md:block" />
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => navigate(`/client-submissions/${sub.id}`)}
                                                    className="btn btn-secondary w-10 h-10 p-0 rounded-xl"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {sub.notes && (
                                        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <p className="text-xs m-0 text-blue-200"><b>Feedback:</b> {sub.notes}</p>
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
