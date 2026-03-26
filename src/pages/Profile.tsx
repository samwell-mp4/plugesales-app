import React, { useState, useEffect } from 'react';
import { 
    User, 
    Mail, 
    Lock, 
    Smartphone, 
    Save, 
    CheckCircle2, 
    AlertCircle,
    UserCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        notification_number: user?.notification_number || '',
        password: '',
        confirmPassword: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                notification_number: user.notification_number || '',
                password: '',
                confirmPassword: ''
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (profileData.password && profileData.password !== profileData.confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        // Clean notification number
        const cleanedNotify = profileData.notification_number.replace(/\D/g, '');
        if (cleanedNotify && cleanedNotify.length < 10) {
            setMessage({ type: 'error', text: 'Número de notificação inválido (mínimo 10 dígitos).' });
            return;
        }

        if (!user || !user.id) {
            console.error("Tentativa de atualizar perfil sem ID de usuário.", { user });
            setMessage({ 
                type: 'error', 
                text: 'Sua sessão está incompleta (ID ausente). Por favor, saia e entre novamente para sincronizar.' 
            });
            return;
        }

        setIsSaving(true);
        try {
            console.log("Enviando atualização de perfil:", { id: user.id, name: profileData.name });
            const result = await dbService.updateProfile({
                id: user.id as number,
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                notification_number: cleanedNotify,
                password: profileData.password || undefined
            });

            if (result.error) {
                console.error("Erro no dbService.updateProfile:", result.error);
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
                setUser(result);
                setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            }
        } catch (error: any) {
            console.error("Erro catch no Profile handleSubmit:", error);
            setMessage({ type: 'error', text: 'Erro ao salvar perfil.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header-section" style={{ marginBottom: '40px' }}>
                <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', margin: 0, color: 'var(--text-primary)' }}>
                    Meu Perfil
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '8px', opacity: 0.7 }}>
                    Gerencie suas informações pessoais e configurações de conta
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                {/* Profile Overview Card */}
                <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
                    <div style={{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '40px', 
                        background: 'var(--primary-gradient)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: '24px',
                        boxShadow: '0 20px 40px rgba(172, 248, 0, 0.2)',
                        color: 'black'
                    }}>
                        <UserCircle size={64} strokeWidth={1.5} />
                    </div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 900 }}>{user?.name}</h2>
                    <div style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        background: 'rgba(172, 248, 0, 0.1)', 
                        color: 'var(--primary-color)',
                        fontSize: '11px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {user?.role}
                    </div>
                    
                    <div style={{ width: '100%', height: '1px', background: 'var(--surface-border-subtle)', margin: '32px 0' }} />
                    
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <Mail size={16} /> <span>{user?.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <Smartphone size={16} /> <span>{user?.notification_number || 'Sem número de aviso'}</span>
                        </div>
                    </div>
                </div>

                {/* Edit Form Card */}
                <div className="glass-card" style={{ padding: '40px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <User size={20} color="var(--primary-color)" /> Informações Gerais
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Nome Completo</label>
                                    <input 
                                        className="input-field" 
                                        value={profileData.name} 
                                        onChange={e => setProfileData({ ...profileData, name: e.target.value })} 
                                        required 
                                        style={{ background: 'var(--card-bg-subtle)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Endereço de E-mail</label>
                                    <input 
                                        type="email" 
                                        className="input-field" 
                                        value={profileData.email} 
                                        onChange={e => setProfileData({ ...profileData, email: e.target.value })} 
                                        required 
                                        style={{ background: 'var(--card-bg-subtle)' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>WhatsApp</label>
                                        <input 
                                            className="input-field" 
                                            value={profileData.phone} 
                                            onChange={e => setProfileData({ ...profileData, phone: e.target.value })} 
                                            placeholder="5511999998888"
                                            style={{ background: 'var(--card-bg-subtle)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Nº Notificação</label>
                                        <input 
                                            className="input-field" 
                                            value={profileData.notification_number} 
                                            onChange={e => setProfileData({ ...profileData, notification_number: e.target.value })} 
                                            placeholder="5511999998888"
                                            style={{ background: 'var(--card-bg-subtle)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'var(--surface-border-subtle)' }} />

                        <div>
                            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Lock size={20} color="var(--primary-color)" /> Alterar Senha
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Nova Senha</label>
                                    <input 
                                        type="password" 
                                        className="input-field" 
                                        value={profileData.password} 
                                        onChange={e => setProfileData({ ...profileData, password: e.target.value })} 
                                        placeholder="••••••••" 
                                        style={{ background: 'var(--card-bg-subtle)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Confirmar</label>
                                    <input 
                                        type="password" 
                                        className="input-field" 
                                        value={profileData.confirmPassword} 
                                        onChange={e => setProfileData({ ...profileData, confirmPassword: e.target.value })} 
                                        placeholder="••••••••" 
                                        style={{ background: 'var(--card-bg-subtle)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {message.text && (
                            <div className="animate-slide-in" style={{ 
                                padding: '16px', 
                                borderRadius: '16px', 
                                background: message.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(172, 248, 0, 0.1)',
                                border: `1px solid ${message.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(172, 248, 0, 0.2)'}`,
                                color: message.type === 'error' ? '#ef4444' : 'var(--primary-color)',
                                fontSize: '13px', 
                                fontWeight: 800, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px' 
                            }}>
                                {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                {message.text}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={isSaving} 
                            style={{ padding: '16px', fontWeight: 900, fontSize: '1rem', color: 'black', boxShadow: '0 10px 20px rgba(172, 248, 0, 0.2)' }}
                        >
                            <Save size={20} /> {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    h1 { font-size: 2rem !important; }
                    .glass-card { padding: 24px !important; }
                    .input-field { font-size: 14px !important; }
                }
            `}</style>
        </div>
    );
};

export default Profile;
