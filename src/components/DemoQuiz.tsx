import { useState } from 'react';
import {
    ArrowRight,
    MessageSquare,
    Send,
    User,
    Mail,
    Phone,
    Zap
} from 'lucide-react';
import { dbService } from '../services/dbService';

const mediaOptions = [
    { id: 'img1', type: 'IMAGE', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80', label: 'Estratégia' },
    { id: 'img2', type: 'IMAGE', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80', label: 'Dashboard' },
    { id: 'img3', type: 'VIDEO', url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=400&q=80', label: 'Meeting' },
];

const DemoQuiz = ({ affiliateId }: { affiliateId?: number | null }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        leadName: '',
        leadPhone: '',
        leadEmail: '',
        companyName: 'Minha Empresa Pro',
        offer: '🔥 Conheça a nossa Inteligência Artificial que escala seus disparos de WhatsApp com 0% de bloqueio!',
        headerType: 'IMAGE' as 'IMAGE' | 'VIDEO' | 'DOC',
        selectedMedia: mediaOptions[0].url,
        btnText: 'Quero Saber Mais'
    });

    const nextStep = async () => {
        if (step === 1 && (!formData.leadName || !formData.leadPhone || !formData.leadEmail)) {
            alert("Por favor, preencha seus dados para continuar o teste.");
            return;
        }
        
        if (step === 1) {
            try {
                await dbService.addLead({
                    affiliate_id: affiliateId,
                    name: formData.leadName,
                    phone: formData.leadPhone,
                    email: formData.leadEmail,
                    company_name: formData.companyName,
                    offer_text: formData.offer
                });
            } catch (err) {
                console.error("Erro ao salvar lead:", err);
            }
        }

        setStep(prev => Math.min(prev + 1, 5));
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="sim-container-full">
            <style>{`
                .sim-container-full {
                    display: grid;
                    grid-template-columns: 1fr 420px;
                    gap: 80px;
                    background: linear-gradient(145deg, rgba(20,22,25,0.8) 0%, rgba(10,12,15,0.95) 100%);
                    border: 1px solid rgba(172, 248, 0, 0.15);
                    border-radius: 60px;
                    padding: 80px;
                    margin: 60px auto;
                    backdrop-filter: blur(40px);
                    box-shadow: 
                        0 40px 120px rgba(0,0,0,0.6),
                        inset 0 0 20px rgba(172, 248, 0, 0.05);
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                }

                .sim-container-full::before {
                    content: '';
                    position: absolute;
                    top: -100px;
                    right: -100px;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(172, 248, 0, 0.1) 0%, transparent 70%);
                    z-index: 0;
                }

                @media (max-width: 1280px) {
                    .sim-container-full { gap: 40px; padding: 60px; }
                    .sim-container-full { grid-template-columns: 1fr 380px; }
                }

                @media (max-width: 1100px) {
                    .sim-container-full { 
                        grid-template-columns: 1fr; 
                        padding: 40px 24px; 
                        gap: 60px; 
                        border-radius: 40px; 
                        margin: 20px 10px;
                        width: auto;
                    }
                    .sim-preview-sticky { 
                        position: static !important; 
                        display: flex; 
                        justify-content: center; 
                        width: 100%;
                    }
                    .phone-mockup {
                        width: 100%;
                        max-width: 340px;
                        margin: 0 auto;
                    }
                    .wp-screen {
                        height: 540px;
                    }
                    .sim-title { font-size: 1.8rem; }
                }

                @media (max-width: 480px) {
                    .sim-container-full { padding: 32px 16px; border-radius: 20px; margin: 10px 5px; }
                    .sim-title { font-size: 1.6rem; }
                    .btn-premium { width: 100%; justify-content: center; padding: 18px 20px; font-size: 0.85rem; }
                    .sim-actions { flex-direction: column-reverse; gap: 12px; }
                    .sim-media-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .phone-mockup { max-width: 290px; padding: 8px; border-radius: 40px; }
                    .wp-screen { height: 460px; border-radius: 32px; }
                    .wp-nav-bar { padding: 30px 15px 10px; }
                }

                /* Left Side: Logic */
                .sim-logic { position: relative; z-index: 1; }
                
                .sim-step-indicator {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 40px;
                }
                .step-dot {
                    height: 4px;
                    flex: 1;
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                    transition: all 0.5s;
                }
                .step-dot.active { background: #acf800; box-shadow: 0 0 10px rgba(172,248,0,0.4); }

                .sim-content-wrapper { min-height: 400px; display: flex; flex-direction: column; justify-content: center; }

                .sim-title { font-size: 2.5rem; font-weight: 950; margin-bottom: 16px; letter-spacing: -2px; line-height: 1.1; }
                .sim-desc { color: rgba(255,255,255,0.5); margin-bottom: 40px; font-size: 1.1rem; }

                /* Inputs */
                .sim-field { margin-bottom: 24px; animation: slideIn 0.4s ease-out; }
                @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }

                .sim-label { font-size: 0.7rem; font-weight: 900; color: #acf800; letter-spacing: 2px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
                .sim-input-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .sim-input-box svg { position: absolute; left: 20px; color: rgba(255,255,255,0.3); }
                .sim-input-field {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 18px;
                    padding: 18px 24px 18px 54px;
                    color: #fff;
                    font-size: 1.1rem;
                    font-weight: 600;
                    outline: none;
                    transition: all 0.3s;
                }
                .sim-input-field:focus { border-color: #acf800; background: rgba(172, 248, 0, 0.03); box-shadow: 0 0 20px rgba(172, 248, 0, 0.05); }

                /* Media Selection Grid */
                .sim-media-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
                .sim-media-card {
                    border-radius: 16px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.3s;
                    aspect-ratio: 1/1;
                }
                .sim-media-card img { width: 100%; height: 100%; object-fit: cover; }
                .sim-media-card.active { border-color: #acf800; transform: scale(1.05); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }

                /* Right Side: Preview */
                .sim-preview-sticky { position: sticky; top: 120px; z-index: 2; height: fit-content; }
                .phone-mockup {
                    width: 380px;
                    background: #1a1c1e;
                    border-radius: 64px;
                    padding: 12px;
                    border: 4px solid #333;
                    box-shadow: 0 60px 100px rgba(0,0,0,0.8);
                    position: relative;
                }
                .phone-mockup::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 150px;
                    height: 30px;
                    background: #111;
                    border-radius: 0 0 20px 20px;
                    z-index: 10;
                }

                .wp-screen {
                    background: #0b141a;
                    border-radius: 52px;
                    height: 620px;
                    overflow: hidden;
                    background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
                    background-size: cover;
                }

                .wp-nav-bar { background: #202c33; padding: 40px 20px 12px; display: flex; align-items: center; gap: 12px; }
                .wp-profile { width: 36px; height: 36px; border-radius: 50%; background: #acf800; display: flex; align-items: center; justify-content: center; }
                
                .wp-msg-list { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
                .wp-msg-bubble { 
                    background: #202c33; 
                    border-radius: 0 16px 16px 16px; 
                    overflow: hidden; 
                    max-width: 90%; 
                    color: #e9edef;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    animation: popUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes popUp { from { transform: translateY(20px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

                .wp-msg-media { width: 100%; height: 200px; object-fit: cover; }
                .wp-msg-text { padding: 12px 16px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
                
                .wp-msg-btn {
                    background: #202c33;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding: 14px;
                    color: #53bdeb;
                    font-size: 14px;
                    font-weight: 700;
                    text-align: center;
                }

                /* Actions */
                .sim-actions { display: flex; gap: 16px; margin-top: 48px; }

                .btn-premium {
                    padding: 20px 40px;
                    border-radius: 20px;
                    font-size: 1rem;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: none;
                }
                .btn-premium-p { background: #acf800; color: #000; box-shadow: 0 20px 40px rgba(172,248,0,0.2); }
                .btn-premium-p:hover { transform: translateY(-3px); box-shadow: 0 25px 50px rgba(172,248,0,0.4); background: #c3ff33; }
                .btn-premium-s { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
                .btn-premium-s:hover { background: rgba(255,255,255,0.1); }
            `}</style>

            <div className="sim-logic">
                <div className="sim-step-indicator">
                    {[1, 2, 3, 4, 5].map(s => <div key={s} className={`step-dot ${step === s ? 'active' : ''}`} />)}
                </div>

                <div className="sim-content-wrapper">
                    {step === 1 && (
                        <div className="sim-step animate-fade-in">
                            <h2 className="sim-title">Vamos começar o seu <span style={{ color: '#acf800' }}>Teste Grátis</span></h2>
                            <p className="sim-desc">Preencha seus dados para habilitar o simulador profissional.</p>

                            <div className="sim-field">
                                <div className="sim-label"><User size={14} /> SEU NOME</div>
                                <div className="sim-input-box">
                                    <User size={18} />
                                    <input className="sim-input-field" placeholder="Como te chamamos?" value={formData.leadName} onChange={e => setFormData({ ...formData, leadName: e.target.value })} />
                                </div>
                            </div>
                            <div className="sim-field">
                                <div className="sim-label"><Phone size={14} /> WHATSAPP</div>
                                <div className="sim-input-box">
                                    <Phone size={18} />
                                    <input className="sim-input-field" placeholder="(00) 00000-0000" value={formData.leadPhone} onChange={e => setFormData({ ...formData, leadPhone: e.target.value })} />
                                </div>
                            </div>
                            <div className="sim-field">
                                <div className="sim-label"><Mail size={14} /> E-MAIL</div>
                                <div className="sim-input-box">
                                    <Mail size={18} />
                                    <input className="sim-input-field" placeholder="contato@empresa.com" value={formData.leadEmail} onChange={e => setFormData({ ...formData, leadEmail: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="sim-step animate-fade-in">
                            <h2 className="sim-title">Sua <span style={{ color: '#acf800' }}>Identidade</span></h2>
                            <p className="sim-desc">Defina como sua marca vai aparecer no topo da mensagem.</p>
                            <div className="sim-field">
                                <div className="sim-label"><Zap size={14} /> NOME DA EMPRESA</div>
                                <div className="sim-input-box">
                                    <Zap size={18} />
                                    <input className="sim-input-field" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="sim-step animate-fade-in">
                            <h2 className="sim-title">Sua <span style={{ color: '#acf800' }}>Oferta Irresistível</span></h2>
                            <p className="sim-desc">O texto que fará seu cliente clicar no botão.</p>
                            <div className="sim-field">
                                <div className="sim-label"><MessageSquare size={14} /> MENSAGEM PRINCIPAL</div>
                                <textarea className="sim-input-field" style={{ paddingLeft: '24px', height: '140px' }} value={formData.offer} onChange={e => setFormData({ ...formData, offer: e.target.value })} />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="sim-step animate-fade-in">
                            <h2 className="sim-title">O <span style={{ color: '#acf800' }}>Impacto Visual</span></h2>
                            <p className="sim-desc">Escolha uma imagem de teste.</p>
                            <div className="sim-media-grid">
                                {mediaOptions.map(m => (
                                    <div key={m.id} className={`sim-media-card ${formData.selectedMedia === m.url ? 'active' : ''}`} onClick={() => setFormData({ ...formData, selectedMedia: m.url })}>
                                        <img src={m.url} alt="Option" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="sim-step animate-fade-in">
                            <h2 className="sim-title">O <span style={{ color: '#acf800' }}>Toque Final</span></h2>
                            <p className="sim-desc">Qual será o texto do botão de ação?</p>
                            <div className="sim-field">
                                <div className="sim-label"><Send size={14} /> TEXTO DO BOTÃO</div>
                                <div className="sim-input-box">
                                    <Send size={18} />
                                    <input className="sim-input-field" value={formData.btnText} onChange={e => setFormData({ ...formData, btnText: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sim-actions">
                    <button className="btn-premium btn-premium-s" onClick={prevStep} style={{ visibility: step === 1 ? 'hidden' : 'visible' }}>Voltar</button>

                    {step === 5 ? (
                        <button className="btn-premium btn-premium-p" onClick={() => window.open('https://wa.me/5511999999999?text=Oi, meu nome é ' + formData.leadName + ' e quero escalar com a Plug e Sales!', '_blank')}>
                            Falar com um de nossos Especialistas <ArrowRight size={20} />
                        </button>
                    ) : (
                        <button className="btn-premium btn-premium-p" onClick={nextStep}>Próximo Passo <ArrowRight size={20} /></button>
                    )}
                </div>
            </div>

            <div className="sim-preview-sticky">
                <div className="phone-mockup">
                    <div className="wp-screen">
                        <div className="wp-nav-bar">
                            <div className="wp-profile">
                                <Zap size={18} fill="black" stroke="black" />
                            </div>
                            <div className="wp-info-txt">
                                <div className="wp-name" style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{formData.companyName}</div>
                                <div className="wp-status" style={{ color: '#8696a0', fontSize: '11px' }}>Visto por último às 14:20</div>
                            </div>
                        </div>
                        <div className="wp-msg-list">
                            <div className="wp-msg-bubble">
                                <img src={formData.selectedMedia} alt="Media" className="wp-msg-media" />
                                <div className="wp-msg-text">
                                    {formData.offer}
                                    <div style={{ fontSize: '10px', color: '#8696a0', textAlign: 'right', marginTop: '4px' }}>14:20 ✓✓</div>
                                </div>
                            </div>
                            <div className="wp-msg-btn">{formData.btnText}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoQuiz;
