import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Zap, MessageCircle, ExternalLink, Loader2, Share2, User, ChevronRight, ArrowLeft, Send, Check, Smartphone, FileText } from 'lucide-react';

const SmartBioView = () => {
    const { slug } = useParams();
    const [bio, setBio] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [employeeData, setEmployeeData] = useState({
        name: '',
        photo: '',
        phone: '',
        tracking: ''
    });

    useEffect(() => {
        const fetchBio = async () => {
            try {
                const res = await fetch(`/api/smart-bio/${slug}`);
                const data = await res.json();
                setBio(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBio();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-color/20 border-t-primary-color rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={20} className="text-primary-color animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!bio) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <Zap size={40} className="text-red-500" />
                </div>
                <h1 className="text-white font-black text-4xl mb-2">404</h1>
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Página não encontrada</p>
            </div>
        );
    }

    const handleButtonClick = async (btn: any) => {
        if (btn.type === 'preview') {
            setIsWizardOpen(true);
            return;
        }
        if (btn.type === 'whatsapp') {
            window.open(`https://wa.me/${btn.url.replace(/\D/g, '')}`, '_blank');
        } else {
            window.open(btn.url, '_blank');
        }
    };

    const handleFinalizeDispatch = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setWizardStep(3);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center px-6 py-16 sm:py-24 relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-color/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-color/5 rounded-full blur-[120px] pointer-events-none"></div>

            <style>{`
                .bio-avatar-wrapper {
                    position: relative;
                    margin-bottom: 32px;
                    z-index: 10;
                }
                .bio-avatar-wrapper::after {
                    content: '';
                    position: absolute;
                    inset: -8px;
                    border: 2px solid rgba(172, 248, 0, 0.3);
                    border-radius: 50%;
                    animation: pulse-ring 2s infinite;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.1); opacity: 0; }
                }
                .bio-avatar {
                    width: 130px;
                    height: 130px;
                    border-radius: 50%;
                    border: 4px solid var(--primary-color);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    object-fit: cover;
                }
                .bio-btn {
                    width: 100%;
                    max-width: 450px;
                    padding: 22px;
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    color: white;
                    border-radius: 24px;
                    font-weight: 900;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 16px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    cursor: pointer;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .bio-btn:hover {
                    transform: translateY(-5px) scale(1.02);
                    background: white;
                    color: black;
                    border-color: white;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .bio-btn.primary {
                    background: var(--primary-color);
                    color: black;
                    border: none;
                }
                .video-container {
                    width: 100%;
                    max-width: 450px;
                    border-radius: 32px;
                    overflow: hidden;
                    margin-bottom: 40px;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                    z-index: 10;
                }
                /* Wizard & Preview Styles */
                .wizard-overlay {
                    position: fixed;
                    inset: 0;
                    background: #020617ee;
                    backdrop-filter: blur(40px) saturate(180%);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .wizard-card {
                    background: #0f172a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 48px;
                    width: 100%;
                    max-width: 1100px;
                    height: 800px;
                    display: grid;
                    grid-template-columns: 1fr 450px;
                    overflow: hidden;
                    box-shadow: 0 100px 150px -50px rgba(0,0,0,0.9);
                }
                .wizard-content {
                    padding: 80px;
                    display: flex;
                    flex-direction: column;
                    background: radial-gradient(circle at 0% 0%, rgba(172, 248, 0, 0.08), transparent 60%);
                }
                .wizard-preview-side {
                    background: #0b141a;
                    border-left: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                .wa-header-mock {
                    background: #202c33;
                    padding: 45px 25px 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border-bottom: 1px solid rgba(0,0,0,0.2);
                }
                .wa-avatar-mock {
                    width: 42px;
                    height: 42px;
                    background: #6a7175;
                    border-radius: 50%;
                    position: relative;
                    flex-shrink: 0;
                }
                .wa-status-dot {
                    width: 12px;
                    height: 12px;
                    background: #00a884;
                    border: 2px solid #202c33;
                    border-radius: 50%;
                    position: absolute;
                    bottom: 0;
                    right: 0;
                }
                .wa-body-mock {
                    flex: 1;
                    padding: 25px;
                    background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
                    background-size: 400px;
                    background-repeat: repeat;
                    background-blend-mode: overlay;
                    background-color: #0b141a;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    overflow-y: auto;
                }
                .wa-bubble-official {
                    background: #202c33;
                    border-radius: 0 16px 16px 16px;
                    max-width: 95%;
                    padding: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    position: relative;
                }
                .wa-sender-name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #53bdeb;
                    margin-bottom: 6px;
                    padding: 0 6px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .wa-verified-badge {
                    color: #00a884;
                    fill: #00a884;
                }
                .wa-message-text {
                    color: #e9edef;
                    font-size: 14.5px;
                    line-height: 1.6;
                    padding: 0 6px 8px;
                }
                .wa-link-preview-card {
                    background: rgba(0,0,0,0.25);
                    border-radius: 12px;
                    margin: 4px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .wa-preview-hero {
                    width: 100%;
                    height: 180px;
                    background: #1f2937;
                    object-fit: cover;
                }
                .wa-preview-body {
                    padding: 15px;
                    background: #182229;
                }
                .wa-preview-site {
                    color: #8696a0;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 4px;
                }
                .wa-preview-title {
                    color: white;
                    font-size: 15px;
                    font-weight: 700;
                    line-height: 1.3;
                }
                .wa-action-button {
                    background: #202c33;
                    margin-top: 10px;
                    padding: 12px;
                    border-radius: 12px;
                    text-align: center;
                    color: #53bdeb;
                    font-weight: 700;
                    font-size: 14px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .wa-action-button:hover { background: #2a3942; }
                .wizard-title {
                    font-size: 3.5rem;
                    font-weight: 950;
                    letter-spacing: -4px;
                    line-height: 0.9;
                    margin-bottom: 20px;
                }
                .step-dot {
                    width: 40px;
                    height: 6px;
                    border-radius: 3px;
                    background: rgba(255, 255, 255, 0.1);
                    transition: all 0.3s;
                }
                .step-dot.active {
                    background: #acf800;
                    box-shadow: 0 0 15px #acf800;
                }
                .nav-btn {
                    padding: 18px 30px;
                    border-radius: 18px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .nav-btn-primary { background: #acf800; color: #000; border: none; }
                .nav-btn-secondary { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
                .supreme-field-box {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 20px;
                }
                .field-label {
                    color: #acf800;
                    font-size: 9px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                    display: block;
                }
                .field-input {
                    background: transparent;
                    border: none;
                    color: white;
                    width: 100%;
                    font-weight: 700;
                    font-size: 15px;
                    outline: none;
                }
            `}</style>

            <div className="bio-avatar-wrapper">
                <img src={bio.avatar_url || 'https://via.placeholder.com/150'} alt={bio.title} className="bio-avatar" />
            </div>

            <h1 className="text-3xl font-black mb-3 z-10">{bio.title}</h1>
            <p className="text-white/40 text-center max-w-sm mb-12 leading-relaxed font-bold z-10">{bio.description}</p>

            {bio.video_url && (
                <div className="video-container">
                    <iframe 
                        width="100%" 
                        height="250" 
                        src={bio.video_url.replace('watch?v=', 'embed/')} 
                        title="Video"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            <div className="w-full flex flex-col items-center z-10 px-4">
                {bio.buttons.map((btn: any, i: number) => (
                    <button 
                        key={i} 
                        onClick={() => handleButtonClick(btn)} 
                        className={`bio-btn ${i === 0 ? 'primary' : ''}`}
                    >
                        {btn.type === 'whatsapp' ? <MessageCircle size={22} /> : <ExternalLink size={22} />}
                        {btn.label}
                    </button>
                ))}
            </div>

            <footer className="mt-20 flex flex-col items-center gap-6 opacity-40 z-10">
                <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
                    <Share2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Compartilhar Página</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap size={16} fill="currentColor" className="text-primary-color" />
                    <span className="text-[11px] font-black tracking-widest uppercase">Powered by Plug & Sales</span>
                </div>
            </footer>

            {isWizardOpen && (
                <div className="wizard-overlay">
                    <div className="wizard-card">
                        <div className="wizard-content">
                            <div className="flex gap-2 mb-10">
                                <div className={`step-dot ${wizardStep >= 1 ? 'active' : ''}`} />
                                <div className={`step-dot ${wizardStep >= 2 ? 'active' : ''}`} />
                                <div className={`step-dot ${wizardStep >= 3 ? 'active' : ''}`} />
                            </div>

                            {wizardStep === 1 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h2 className="wizard-title">Sua Identidade <span className="text-[#acf800]">Profissional</span></h2>
                                        <p className="text-white/40 text-sm">Personalize como você aparecerá no card do WhatsApp.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="supreme-field-box">
                                            <label className="field-label">SEU NOME COMPLETO</label>
                                            <input 
                                                className="field-input" 
                                                placeholder="Ex: Carlos Alberto" 
                                                value={employeeData.name}
                                                onChange={e => setEmployeeData({...employeeData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="supreme-field-box">
                                            <label className="field-label">URL DA SUA FOTO</label>
                                            <input 
                                                className="field-input" 
                                                placeholder="https://..." 
                                                value={employeeData.photo}
                                                onChange={e => setEmployeeData({...employeeData, photo: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-8 flex gap-4">
                                        <button onClick={() => setIsWizardOpen(false)} className="nav-btn nav-btn-secondary">FECHAR</button>
                                        <button onClick={() => setWizardStep(2)} className="nav-btn nav-btn-primary flex-1">PRÓXIMO PASSO <ChevronRight size={18}/></button>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 2 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h2 className="wizard-title">Configurar <span className="text-[#acf800]">Rastreio</span></h2>
                                        <p className="text-white/40 text-sm">Defina seu código de rastreio para monitorar suas vendas.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="supreme-field-box">
                                            <label className="field-label">SEU CÓDIGO DE TRACKING (UTM)</label>
                                            <input 
                                                className="field-input" 
                                                placeholder="Ex: ref-carlos" 
                                                value={employeeData.tracking}
                                                onChange={e => setEmployeeData({...employeeData, tracking: e.target.value})}
                                            />
                                        </div>
                                        <div className="supreme-field-box">
                                            <label className="field-label">SEU WHATSAPP COMERCIAL</label>
                                            <input 
                                                className="field-input" 
                                                placeholder="Ex: 5511999999999" 
                                                value={employeeData.phone}
                                                onChange={e => setEmployeeData({...employeeData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-8 flex gap-4">
                                        <button onClick={() => setWizardStep(1)} className="nav-btn nav-btn-secondary"><ArrowLeft size={18}/> VOLTAR</button>
                                        <button onClick={handleFinalizeDispatch} disabled={isSaving} className="nav-btn nav-btn-primary flex-1">
                                            {isSaving ? 'GERANDO LINK...' : 'FINALIZAR E SALVAR'} <Send size={18}/>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 3 && (
                                <div className="space-y-8 animate-fade-in text-center py-20">
                                    <div className="w-20 h-20 bg-[#acf800]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check size={40} className="text-[#acf800]" />
                                    </div>
                                    <div>
                                        <h2 className="wizard-title">Página <span className="text-[#acf800]">Personalizada!</span></h2>
                                        <p className="text-white/40 text-sm">Seu link único de vendas foi gerado com sucesso.</p>
                                        <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                                            <p className="text-[#acf800] font-black text-lg break-all">plugsales.com/bio/{slug}?ref={employeeData.tracking || 'meu-link'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-8">
                                        <button onClick={() => { setIsWizardOpen(false); setWizardStep(1); }} className="nav-btn nav-btn-primary mx-auto">CONCLUÍDO</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="wizard-preview-side">
                            <div className="wa-header-mock">
                                <div className="wa-avatar-mock">
                                    {employeeData.photo ? (
                                        <img src={employeeData.photo} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-white/40" />
                                    )}
                                    <div className="wa-status-dot" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-white text-[15px] font-bold leading-none">{employeeData.name || 'Sua Empresa'}</p>
                                        <Zap size={14} className="wa-verified-badge" fill="currentColor" />
                                    </div>
                                    <p className="text-[#00a884] text-[11px] mt-1 font-bold">Online agora</p>
                                </div>
                            </div>

                            <div className="wa-body-mock">
                                <div className="wa-bubble-official animate-fade-in">
                                    <div className="wa-sender-name">
                                        {employeeData.name || 'Atendimento'} 
                                        <Zap size={10} fill="currentColor" />
                                    </div>
                                    <p className="wa-message-text">
                                        Olá! 👋 Acabei de gerar sua página exclusiva com todos os nossos materiais e links oficiais. Clique abaixo para acessar:
                                    </p>
                                    
                                    <div className="wa-link-preview-card">
                                        {bio.avatar_url && (
                                            <img src={bio.avatar_url} className="wa-preview-hero" />
                                        )}
                                        <div className="wa-preview-body">
                                            <p className="wa-preview-site">PLUGSALES.COM</p>
                                            <p className="wa-preview-title">{bio.title}</p>
                                            <p className="text-[#8696a0] text-[12px] mt-1 line-clamp-1">{bio.description}</p>
                                        </div>
                                    </div>

                                    <div className="wa-action-button">
                                        <ExternalLink size={16} /> ACESSAR MEUS LINKS
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartBioView;
