import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, ShieldCheck, Lock, User } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(username, password);
        if (!success) {
            setError('Usuário ou senha incorretos.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
            <style>{`
                .login-card {
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(172, 248, 0, 0.2);
                    padding: 40px;
                    border-radius: 32px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                }
                .login-input {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 12px 16px;
                    width: 100%;
                    color: white;
                    margin-top: 8px;
                    outline: none;
                    transition: border 0.3s;
                }
                .login-input:focus {
                    border-color: var(--primary-color);
                }
                .login-btn {
                    background: var(--primary-gradient);
                    color: black;
                    border: none;
                    padding: 14px;
                    border-radius: 12px;
                    width: 100%;
                    font-weight: 800;
                    margin-top: 24px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .login-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(172, 248, 0, 0.3);
                }
            `}</style>

            <div className="login-card animate-fade-in">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div style={{ background: 'var(--primary-gradient)', padding: '12px', borderRadius: '20px', marginBottom: '16px' }}>
                        <MessageSquare color="white" size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-1px' }}>Plug & Sales</h1>
                    <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Acesse sua conta para continuar</p>
                </div>

                {error && (
                    <div className="p-3 mb-4 text-xs font-bold text-center text-red-400 bg-red-400/10 rounded-xl border border-red-400/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)' }}>USUÁRIO</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: 14, top: 22, opacity: 0.4 }} />
                            <input 
                                className="login-input" 
                                style={{ paddingLeft: 40 }}
                                type="text" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                placeholder="Nome do usuário..."
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)' }}>SENHA</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: 22, opacity: 0.4 }} />
                            <input 
                                className="login-input" 
                                style={{ paddingLeft: 40 }}
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn">ENTRAR NO SISTEMA</button>
                    
                    <div className="flex justify-center items-center gap-2 mt-6 opacity-30 text-[10px] font-bold">
                        <ShieldCheck size={12} />
                        SISTEMA DE SEGURANÇA ATIVO
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
