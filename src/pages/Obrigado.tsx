import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingCart, ArrowRight, Zap, Target } from 'lucide-react';

const Obrigado = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'radial-gradient(circle at top right, rgba(172, 248, 0, 0.05), transparent), #05070a',
            fontFamily: 'Outfit, sans-serif'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .thank-you-card {
                    max-width: 650px;
                    width: 100%;
                    background: rgba(255, 255, 255, 0.015);
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(172, 248, 0, 0.15);
                    border-radius: 50px;
                    padding: 80px 60px;
                    text-align: center;
                    box-shadow: 0 60px 120px rgba(0, 0, 0, 0.9);
                    position: relative;
                    overflow: hidden;
                }
                .accent-glow {
                    position: absolute;
                    top: -100px;
                    right: -100px;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(172, 248, 0, 0.1) 0%, transparent 70%);
                    filter: blur(40px);
                    pointer-events: none;
                }
                .icon-box {
                    width: 120px;
                    height: 120px;
                    background: linear-gradient(135deg, #acf800, #84c000);
                    border-radius: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 40px;
                    box-shadow: 0 30px 60px rgba(172, 248, 0, 0.2);
                    transform: rotate(-5deg);
                }
                .title {
                    font-size: 3.5rem;
                    font-weight: 900;
                    letter-spacing: -3px;
                    margin-bottom: 24px;
                    color: #fff;
                    line-height: 1;
                }
                .subtitle {
                    color: #94a3b8;
                    font-size: 1.25rem;
                    line-height: 1.6;
                    margin-bottom: 50px;
                    max-width: 500px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .cta-btn {
                    width: 100%;
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 24px;
                    border-radius: 24px;
                    font-weight: 900;
                    font-size: 1.1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .cta-btn:hover {
                    transform: scale(1.02);
                    background: #acf800;
                    box-shadow: 0 20px 40px rgba(172, 248, 0, 0.2);
                }
                @media (max-width: 480px) {
                    .title { font-size: 2.5rem; }
                    .thank-you-card { padding: 60px 24px; }
                }
            `}</style>

            <div className="thank-you-card">
                <div className="accent-glow" />
                <div className="icon-box">
                    <Target size={60} color="#000" strokeWidth={3} />
                </div>
                
                <h1 className="title">Tudo Pronto!</h1>
                <p className="subtitle">
                    Sua operação foi identificada e agora o próximo passo é escalar com o poder do <br /><strong>Plug & Sales</strong>.
                </p>

                <p style={{ marginTop: '40px', color: '#1e293b', fontSize: '0.9rem', fontWeight: 800, letterSpacing: 2 }}>
                    (OBRIGADO)
                </p>
            </div>
        </div>
    );
};

export default Obrigado;
