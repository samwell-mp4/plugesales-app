import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, ShieldCheck, Lock, User, Mail, Phone, ArrowRight, UserPlus } from 'lucide-react';

const ClientAuth = () => {
    const { login, register } = useAuth();
    const [mode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    
    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'REGISTER') {
                const success = await register({ name, email, phone, password });
                if (!success) setError('Erro ao registrar. Email pode já estar em uso.');
            } else {
                const success = await login(email, password);
                if (!success) setError('Email ou senha incorretos.');
            }
        } catch (err) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="client-auth-page">
            <style>{`
                @keyframes mesh-gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }

                .client-auth-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background: var(--bg-primary);
                    padding: 24px;
                    color: var(--text-primary);
                }

                .mesh-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: var(--bg-primary);
                    background-size: 400% 400%;
                    animation: mesh-gradient 15s ease infinite;
                    z-index: 0;
                }

                .blob {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(172, 248, 0, 0.08) 0%, transparent 70%);
                    border-radius: 50%;
                    filter: blur(100px);
                    z-index: 1;
                    animation: float 25s ease-in-out infinite;
                }

                .blob-1 { top: -15%; right: -10%; animation-delay: 0s; }
                .blob-2 { bottom: -20%; left: -15%; animation-delay: -7s; }

                .auth-card-container {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 480px;
                }

                .premium-auth-card {
                    background: var(--card-bg-subtle);
                    backdrop-filter: blur(40px) saturate(200%);
                    -webkit-backdrop-filter: blur(40px) saturate(200%);
                    border: 1px solid var(--surface-border-subtle);
                    border-radius: 40px;
                    padding: 48px 40px;
                    box-shadow: 
                        0 25px 50px -12px rgba(0, 0, 0, 0.1),
                        inset 0 1px 1px var(--surface-border-subtle);
                    animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }


                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .brand-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin-bottom: 40px;
                }

                .brand-icon {
                    width: 64px;
                    height: 64px;
                    background: var(--primary-gradient);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    box-shadow: 0 10px 25px rgba(172, 248, 0, 0.3);
                    transform: rotate(-3deg);
                }

                .auth-title {
                    font-size: 1.8rem;
                    font-weight: 940;
                    letter-spacing: -1.2px;
                    margin-bottom: 8px;
                    background: linear-gradient(to bottom, #fff 0%, #cbd5e1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .auth-subtitle {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }

                .mode-selector {
                    display: flex;
                    background: rgba(255, 255, 255, 0.04);
                    padding: 4px;
                    border-radius: 16px;
                    margin-bottom: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .mode-btn {
                    flex: 1;
                    padding: 12px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: var(--text-muted);
                    border: none;
                    background: transparent;
                    cursor: pointer;
                }

                .mode-btn.active {
                    background: white;
                    color: black;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .input-group {
                    position: relative;
                    margin-bottom: 16px;
                }

                .input-group input {
                    width: 100%;
                    background: var(--bg-primary);
                    border: 1.5px solid var(--surface-border-subtle);
                    border-radius: 16px;
                    padding: 16px 16px 16px 48px;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    transition: all 0.3s;
                }

                .input-group input:focus {
                    border-color: rgba(172, 248, 0, 0.4);
                    background: var(--bg-primary);
                    box-shadow: 0 0 15px rgba(172, 248, 0, 0.05);
                    outline: none;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    transition: all 0.3s;
                }

                .input-group input:focus + .input-icon {
                    color: var(--primary-color);
                }

                .submit-btn {
                    width: 100%;
                    background: var(--primary-gradient);
                    color: #000;
                    padding: 18px;
                    border-radius: 18px;
                    font-weight: 900;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    margin-top: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 25px rgba(172, 248, 0, 0.4);
                    filter: brightness(1.1);
                }

                .submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .error-msg {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    padding: 12px;
                    border-radius: 14px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 24px;
                    text-align: center;
                }

                .security-tag {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 32px;
                    color: var(--text-muted);
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            `}</style>

            <div className="mesh-bg"></div>
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>

            <div className="auth-card-container">
                <div className="premium-auth-card">
                    <div className="brand-header">
                        <div className="brand-icon">
                            <MessageSquare color="black" size={32} fill="black" />
                        </div>
                        <h1 className="auth-title">
                            {mode === 'REGISTER' ? 'Criar Nova Conta' : 'Acessar Conta'}
                        </h1>
                        <p className="auth-subtitle">Portal do Cliente</p>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit} autoComplete="off">
                        {mode === 'REGISTER' && (
                            <>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        placeholder="Seu nome completo"
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        required
                                    />
                                    <User className="input-icon" size={18} />
                                </div>
                                <div className="input-group">
                                    <input 
                                        type="tel" 
                                        placeholder="Telefone / WhatsApp"
                                        value={phone} 
                                        onChange={e => setPhone(e.target.value)} 
                                        required
                                    />
                                    <Phone className="input-icon" size={18} />
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <input 
                                type="email" 
                                placeholder="Seu melhor e-mail"
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required
                            />
                            <Mail className="input-icon" size={18} />
                        </div>

                        <div className="input-group">
                            <input 
                                type="password" 
                                placeholder="Sua senha"
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required
                            />
                            <Lock className="input-icon" size={18} />
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (mode === 'REGISTER' ? 'CRIANDO...' : 'ENTRANDO...') : (
                                <>
                                    {mode === 'REGISTER' ? 'CRIAR MINHA CONTA' : 'ACESSAR AGORA'}
                                    {mode === 'REGISTER' ? <UserPlus size={18} /> : <ArrowRight size={18} />}
                                </>
                            )}
                        </button>


                        <div className="security-tag">
                            <ShieldCheck size={12} />
                            Ambiente Seguro & Criptografado
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClientAuth;
