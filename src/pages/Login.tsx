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
        <div className="login-page">
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

                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background: #020617;
                    padding: 24px;
                }

                .mesh-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(-45deg, #020617, #0f172a, #1e293b, #020617);
                    background-size: 400% 400%;
                    animation: mesh-gradient 15s ease infinite;
                    z-index: 0;
                }

                .blob {
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(172, 248, 0, 0.1) 0%, transparent 70%);
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: 1;
                    animation: float 20s ease-in-out infinite;
                }

                .blob-1 { top: -10%; right: -5%; animation-delay: 0s; }
                .blob-2 { bottom: -15%; left: -10%; animation-delay: -5s; }

                .login-card-container {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 440px;
                }

                .premium-login-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(40px) saturate(200%);
                    -webkit-backdrop-filter: blur(40px) saturate(200%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 40px;
                    padding: 56px 40px;
                    box-shadow: 
                        0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        inset 0 1px 1px rgba(255, 255, 255, 0.1);
                    animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .brand-icon {
                    width: 72px;
                    height: 72px;
                    background: var(--primary-gradient);
                    border-radius: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    box-shadow: 0 10px 30px rgba(172, 248, 0, 0.3);
                    transform: rotate(-5deg);
                }

                .login-title {
                    font-size: 2.2rem;
                    font-weight: 900;
                    letter-spacing: -1.5px;
                    margin-bottom: 8px;
                    background: linear-gradient(to bottom, #fff 0%, #94a3b8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .input-wrapper {
                    position: relative;
                    margin-bottom: 24px;
                }

                .input-wrapper input {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.4);
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    border-radius: 18px;
                    padding: 18px 18px 18px 52px;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s;
                    backdrop-filter: blur(10px);
                }

                .input-wrapper label {
                    position: absolute;
                    left: 52px;
                    top: 18px;
                    pointer-events: none;
                    transition: all 0.3s;
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 1rem;
                }

                .input-wrapper input:focus, 
                .input-wrapper input:not(:placeholder-shown) {
                    border-color: rgba(172, 248, 0, 0.5);
                    background: rgba(0, 0, 0, 0.6);
                    box-shadow: 0 0 20px rgba(172, 248, 0, 0.1);
                }

                .input-wrapper input:focus + label,
                .input-wrapper input:not(:placeholder-shown) + label {
                    top: -10px;
                    left: 20px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: var(--primary-color);
                    background: #1e293b;
                    padding: 0 8px;
                    border-radius: 4px;
                    border: 1px solid rgba(172, 248, 0, 0.2);
                }

                .input-icon {
                    position: absolute;
                    left: 18px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.2);
                    transition: all 0.3s;
                }

                .input-wrapper input:focus ~ .input-icon {
                    color: var(--primary-color);
                }

                .premium-btn {
                    width: 100%;
                    background: var(--primary-gradient);
                    color: #000;
                    padding: 18px;
                    border-radius: 18px;
                    font-weight: 800;
                    font-size: 1rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    margin-top: 16px;
                    position: relative;
                    overflow: hidden;
                    letter-spacing: 0.5px;
                }

                .premium-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(172, 248, 0, 0.4);
                }

                .premium-btn:active {
                    transform: translateY(0px);
                }

                .premium-btn::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent);
                    transform: rotate(45deg);
                    transition: 0.5s;
                    opacity: 0;
                }

                .premium-btn:hover::after {
                    opacity: 1;
                    left: 100%;
                    top: 100%;
                }

                .footer-security {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 32px;
                    color: rgba(255, 255, 255, 0.2);
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .error-toast {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    padding: 12px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 24px;
                    text-align: center;
                    backdrop-filter: blur(10px);
                }
            `}</style>

            <div className="mesh-bg"></div>
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>

            <div className="login-card-container">
                <div className="premium-login-card">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="brand-icon">
                            <MessageSquare color="black" size={36} fill="black" />
                        </div>
                        <h1 className="login-title">Plug & Sales</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>
                            Gestão inteligente para sua operação
                        </p>
                    </div>

                    {error && <div className="error-toast">{error}</div>}

                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="input-wrapper">
                            <input 
                                type="text" 
                                id="username" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                placeholder=" "
                                required
                            />
                            <label htmlFor="username">Usuário</label>
                            <User className="input-icon" size={20} />
                        </div>

                        <div className="input-wrapper">
                            <input 
                                type="password" 
                                id="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder=" "
                                required
                            />
                            <label htmlFor="password">Senha de acesso</label>
                            <Lock className="input-icon" size={20} />
                        </div>

                        <button type="submit" className="premium-btn">
                            ENTRAR NO DASHBOARD
                        </button>

                        <div className="footer-security">
                            <ShieldCheck size={14} />
                            SSL SECURED & ENCRYPTED
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
