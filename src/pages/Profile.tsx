import React, { useState, useEffect } from 'react';
import { 
    User, 
    Mail, 
    Lock, 
    Smartphone, 
    Save, 
    CheckCircle2, 
    AlertCircle,
    UserCircle,
    Phone,
    Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { pushNotificationService } from '../services/pushNotificationService';

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
    const [pushSubscribed, setPushSubscribed] = useState(false);
    const [pushChecking, setPushChecking] = useState(true);

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

            // Check current push status
            pushNotificationService.getStatus(user.id as number).then(status => {
                setPushSubscribed(status);
                setPushChecking(false);
            });
        }
    }, [user]);

    const handleTogglePush = async () => {
        if (!user || pushChecking) return;
        setPushChecking(true);
        
        if (pushSubscribed) {
            const res = await pushNotificationService.unsubscribeUser(user.id as number);
            if (!res?.error) setPushSubscribed(false);
        } else {
            const res = await pushNotificationService.subscribeUser(user.id as number);
            if (!res?.error) setPushSubscribed(true);
        }
        setPushChecking(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (profileData.password && profileData.password !== profileData.confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        const cleanedNotify = profileData.notification_number.replace(/\D/g, '');
        if (cleanedNotify && cleanedNotify.length < 10 && cleanedNotify.length > 0) {
            setMessage({ type: 'error', text: 'Número de notificação inválido (mínimo 10 dígitos).' });
            return;
        }

        if (!user || !user.id) {
            setMessage({ 
                type: 'error', 
                text: 'Sua sessão está incompleta. Por favor, faça login novamente.' 
            });
            return;
        }

        setIsSaving(true);
        try {
            const result = await dbService.updateProfile({
                id: user.id as number,
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                notification_number: cleanedNotify,
                password: profileData.password || undefined
            });

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
                setUser(result);
                setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Erro ao salvar perfil.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="crm-container">
            {/* Header section */}
            <div className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <User size={12} /> ACCOUNT MANAGEMENT
                    </div>
                    <h1 className="crm-main-title">Meu Perfil</h1>
                </div>
            </div>

            <div className="gestiva-split-layout">
                {/* Profile Overview Card */}
                <div className="gestiva-sidebar-panels">
                    <div className="crm-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px' }}>
                        <div style={{ 
                            width: '140px', 
                            height: '140px', 
                            borderRadius: '48px', 
                            background: 'var(--primary-gradient)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            marginBottom: '32px',
                            boxShadow: '0 20px 50px rgba(172, 248, 0, 0.25)',
                            color: 'black'
                        }}>
                            <UserCircle size={80} strokeWidth={1} />
                        </div>
                        
                        <h2 style={{ margin: '0 0 12px 0', fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.5px' }}>{user?.name}</h2>
                        
                        <span className="status-badge-premium" style={{ '--bg': 'rgba(172, 248, 0, 0.05)', '--color': '#acf800', '--border': 'rgba(172, 248, 0, 0.2)' } as any}>
                            {user?.role}
                        </span>

                        <div style={{ width: '100%', height: '1px', background: 'var(--surface-border-subtle)', margin: '40px 0' }} />

                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                                <div style={{ minWidth: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Mail size={18} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div className="field-label" style={{ fontSize: '9px', marginBottom: '2px' }}>E-mail Primário</div>
                                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{user?.email}</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                                <div style={{ minWidth: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bell size={18} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div className="field-label" style={{ fontSize: '9px', marginBottom: '2px' }}>Notificações</div>
                                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{user?.notification_number || 'Não configurado'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form Card */}
                <div className="gestiva-main-content">
                    <div className="crm-card" style={{ padding: '48px' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 32px 0', fontSize: '1.5rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.5px' }}>
                                    <User size={24} color="var(--primary-color)" /> Informações Gerais
                                </h3>
                                <div className="card-grid-responsive">
                                    <div>
                                        <label className="field-label">Nome Completo</label>
                                        <input 
                                            className="field-input" 
                                            value={profileData.name} 
                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">Endereço de E-mail</label>
                                        <input 
                                            type="email" 
                                            className="field-input" 
                                            value={profileData.email} 
                                            onChange={e => setProfileData({ ...profileData, email: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">WhatsApp (DDI+DDD+Num)</label>
                                        <input 
                                            className="field-input" 
                                            value={profileData.phone} 
                                            onChange={e => setProfileData({ ...profileData, phone: e.target.value })} 
                                            placeholder="5511999998888"
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">Nº para Alertas</label>
                                        <input 
                                            className="field-input" 
                                            value={profileData.notification_number} 
                                            onChange={e => setProfileData({ ...profileData, notification_number: e.target.value })} 
                                            placeholder="5511999998888"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: '1px', background: 'var(--surface-border-subtle)' }} />

                            {/* PWA PUSH NOTIFICATIONS SECTION */}
                            <div>
                                <h3 style={{ margin: '0 0 32px 0', fontSize: '1.5rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.5px' }}>
                                    <Bell size={24} color="var(--primary-color)" /> Notificações PWA
                                </h3>
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.02)', 
                                    border: '1px solid var(--surface-border-subtle)', 
                                    padding: '32px', 
                                    borderRadius: '24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '24px'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 800 }}>Push no Celular</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                                            Receba avisos nativos em tempo real quando novos leads forem capturados, mesmo com o app fechado.
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {pushChecking ? (
                                            <div className="status-badge-premium" style={{ '--bg': 'rgba(255,255,255,0.05)', '--color': '#888', '--border': 'rgba(255,255,255,0.1)' } as any}>
                                                VERIFICANDO...
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handleTogglePush}
                                                type="button"
                                                className={`action-btn ${pushSubscribed ? 'danger-btn' : 'primary-btn'}`}
                                                style={{ height: '40px', padding: '0 24px', fontSize: '11px', whiteSpace: 'nowrap' }}
                                            >
                                                {pushSubscribed ? 'DESATIVAR NOTIFICAÇÕES' : 'ATIVAR NESTE DISPOSITIVO'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: '1px', background: 'var(--surface-border-subtle)' }} />

                            <div>
                                <h3 style={{ margin: '0 0 32px 0', fontSize: '1.5rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.5px' }}>
                                    <Lock size={24} color="var(--primary-color)" /> Segurança da Conta
                                </h3>
                                <div className="card-grid-responsive">
                                    <div>
                                        <label className="field-label">Nova Senha</label>
                                        <input 
                                            type="password" 
                                            className="field-input" 
                                            value={profileData.password} 
                                            onChange={e => setProfileData({ ...profileData, password: e.target.value })} 
                                            placeholder="Deixe vazio para manter" 
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">Confirmar Senha</label>
                                        <input 
                                            type="password" 
                                            className="field-input" 
                                            value={profileData.confirmPassword} 
                                            onChange={e => setProfileData({ ...profileData, confirmPassword: e.target.value })} 
                                            placeholder="Confirmar nova senha" 
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                            </div>

                            {message.text && (
                                <div className="animate-slide-in" style={{ 
                                    padding: '20px', 
                                    borderRadius: '20px', 
                                    background: message.type === 'error' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(172, 248, 0, 0.05)',
                                    border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(172, 248, 0, 0.2)'}`,
                                    color: message.type === 'error' ? '#ef4444' : 'var(--primary-color)',
                                    fontSize: '14px', 
                                    fontWeight: 800, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px' 
                                }}>
                                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                                    {message.text}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="action-btn primary-btn" 
                                disabled={isSaving} 
                                style={{ height: '64px', fontSize: '14px', letterSpacing: '1px' }}
                            >
                                <Save size={20} /> {isSaving ? 'PROCESSANDO...' : 'SALVAR ALTERAÇÕES'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
