import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageSquare, ArrowRight, Zap } from 'lucide-react';

const Finalizado = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'radial-gradient(circle at top right, rgba(172, 248, 0, 0.05), transparent), #020617',
            fontFamily: 'Outfit, sans-serif'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .success-card {
                    max-width: 600px;
                    width: 100%;
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(172, 248, 0, 0.2);
                    border-radius: 40px;
                    padding: 60px 40px;
                    text-align: center;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
                }
                .icon-box {
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, #acf800, #84c000);
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 32px;
                    box-shadow: 0 20px 40px rgba(172, 248, 0, 0.2);
                }
                .title {
                    font-size: 2.8rem;
                    font-weight: 900;
                    letter-spacing: -2px;
                    margin-bottom: 20px;
                    color: #fff;
                    line-height: 1;
                }
                .subtitle {
                    color: #94a3b8;
                    font-size: 1.15rem;
                    line-height: 1.6;
                    margin-bottom: 40px;
                }
                .primary-btn {
                    width: 100%;
                    background: #acf800;
                    color: #000;
                    border: none;
                    padding: 20px;
                    border-radius: 20px;
                    font-weight: 900;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                }
                .primary-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(172, 248, 0, 0.3);
                }
            `}</style>

            <div className="success-card">
                <div className="icon-box">
                    <CheckCircle2 size={50} color="#000" strokeWidth={3} />
                </div>
                
                <h1 className="title">Recebemos seus dados!</h1>
                <p className="subtitle">
                    Nossa equipe entrará em contato em breve pelo <strong>WhatsApp</strong> para alinhar os próximos passos da sua operação.
                </p>

                <button className="primary-btn" onClick={() => navigate('/')}>
                    IR PARA O SITE <ArrowRight size={20} />
                </button>

                <p style={{ marginTop: '30px', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                    (finalizado)
                </p>
            </div>
        </div>
    );
};

export default Finalizado;
