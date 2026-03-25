import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Zap, ArrowLeft } from 'lucide-react';

const ThankYou = () => {
    const navigate = useNavigate();

    return (
        <div className="thank-you-container animate-fade-in" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'radial-gradient(circle at top right, rgba(172, 248, 0, 0.05), transparent), radial-gradient(circle at bottom left, rgba(0, 0, 0, 1), #05070a)'
        }}>
            <style>{`
                .thank-you-card {
                    max-width: 600px;
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(172, 248, 0, 0.2);
                    border-radius: 40px;
                    padding: 60px 40px;
                    text-align: center;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
                }
                .success-icon-wrap {
                    width: 100px;
                    height: 100px;
                    background: var(--primary-gradient);
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 32px;
                    box-shadow: 0 20px 40px rgba(172, 248, 0, 0.3);
                }
                .ty-title {
                    font-size: 3rem;
                    font-weight: 900;
                    letter-spacing: -2px;
                    margin-bottom: 16px;
                    background: linear-gradient(to bottom, #fff, #888);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .ty-subtitle {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-bottom: 48px;
                }
                .ty-btn-group {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .ty-btn {
                    padding: 18px 32px;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    text-decoration: none;
                }
                .ty-btn-primary {
                    background: var(--primary-color);
                    color: black;
                    border: none;
                }
                .ty-btn-primary:hover {
                    background: #c3ff5c;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(172, 248, 0, 0.2);
                }
                .ty-btn-secondary {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .ty-btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                @media (max-width: 480px) {
                    .ty-title { font-size: 2.2rem; }
                    .thank-you-card { padding: 40px 24px; }
                }
            `}</style>

            <div className="thank-you-card">
                <div className="success-icon-wrap">
                    <CheckCircle2 size={48} color="black" strokeWidth={2.5} />
                </div>
                
                <h1 className="ty-title">Solicitação Recebida!</h1>
                <p className="ty-subtitle">
                    Obrigado pelo seu interesse. Identificamos o seu perfil e em breve um de nossos especialistas entrará em contato para transformar sua operação.
                </p>

                <div className="ty-btn-group">
                    <button 
                        className="ty-btn ty-btn-primary"
                        onClick={() => window.open('https://wa.me/5511999999999?text=Olá, acabei de preencher o simulador e gostaria de falar com um especialista!', '_blank')}
                    >
                        <MessageCircle size={20} /> CONVERSAR COM ESPECIALISTA
                    </button>
                    
                    <button 
                        className="ty-btn ty-btn-secondary"
                        onClick={() => navigate('/')}
                    >
                        <Zap size={20} color="#acf800" /> EXPERIMENTAR GRATUITO
                    </button>

                    <button 
                        onClick={() => navigate('/landing')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <ArrowLeft size={14} /> Voltar para o Início
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThankYou;
