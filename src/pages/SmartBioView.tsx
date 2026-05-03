import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Zap, MessageCircle, ExternalLink, Loader2, Share2, User, ChevronRight, ArrowLeft, Send, Check, Smartphone, FileText, Globe } from 'lucide-react';

const SmartBioView = () => {
    const { slug } = useParams();
    const location = useLocation();
    const [bio, setBio] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    
    // Tracking/Ref query param
    const queryParams = new URLSearchParams(location.search);
    const ref = queryParams.get('ref') || '';

    const [employeeData, setEmployeeData] = useState({
        name: '',
        photo: '',
        phone: '',
        tracking: ref
    });

    useEffect(() => {
        const fetchBio = async () => {
            try {
                // Absolute path from root
                const res = await fetch(`/api/smart-bio/${slug}`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                
                // Parse buttons/images if they are strings from DB
                const parsedBio = {
                    ...data,
                    buttons: typeof data.buttons === 'string' ? JSON.parse(data.buttons) : data.buttons,
                    images: typeof data.images === 'string' ? JSON.parse(data.images) : data.images
                };
                setBio(parsedBio);
            } catch (err) {
                console.error('Fetch Bio Error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        if (slug) fetchBio();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="sb-view-root min-h-screen bg-[#020202] flex items-center justify-center">
                <style>{`
                    .sb-view-root { --sb-primary: #acf800; }
                    .sb-view-spinner { width: 80px; height: 80px; border: 2px solid rgba(172,248,0,0.1); border-top-color: var(--sb-primary); border-radius: 50%; animation: sb-spin 1s linear infinite; }
                    @keyframes sb-spin { to { transform: rotate(360deg); } }
                `}</style>
                <div className="relative">
                    <div className="sb-view-spinner" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={24} className="text-[#acf800] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!bio) {
        return (
            <div className="sb-view-root min-h-screen bg-[#020202] flex flex-col items-center justify-center text-center p-10">
                <div className="w-24 h-24 bg-red-500/10 rounded-[35px] flex items-center justify-center mb-8 border border-red-500/20">
                    <Zap size={40} className="text-red-500" />
                </div>
                <h1 className="text-white font-black text-5xl mb-4 tracking-tighter">404</h1>
                <p className="text-white/20 font-black uppercase tracking-[5px] text-[10px]">Página não encontrada</p>
                <button 
                    onClick={() => window.location.href = '/'}
                    className="mt-12 px-8 py-4 bg-white/5 rounded-2xl text-white font-black text-xs tracking-widest uppercase border border-white/10 hover:bg-white/10 transition-all"
                >
                    Voltar ao Início
                </button>
            </div>
        );
    }

    const handleButtonClick = (btn: any) => {
        if (btn.type === 'preview') {
            setIsWizardOpen(true);
            return;
        }
        
        let finalUrl = btn.url;
        if (ref && finalUrl.includes('?')) {
            finalUrl += `&ref=${ref}`;
        } else if (ref) {
            finalUrl += `?ref=${ref}`;
        }

        if (btn.type === 'whatsapp') {
            const cleanPhone = btn.url.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        } else {
            window.open(finalUrl, '_blank');
        }
    };

    const handleFinalizeDispatch = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setWizardStep(3);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="sb-public-wrapper min-h-screen bg-[#020202] text-white flex flex-col items-center px-6 py-20 relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                
                .sb-public-wrapper {
                    font-family: 'Outfit', sans-serif;
                    --sb-primary: #acf800;
                }

                .sb-view-container {
                    width: 100%;
                    max-width: 480px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 10;
                }

                .sb-avatar-view {
                    width: 130px;
                    height: 130px;
                    border-radius: 45px;
                    padding: 5px;
                    background: linear-gradient(135deg, var(--sb-primary), #00f2fe);
                    margin-bottom: 35px;
                    box-shadow: 0 25px 50px rgba(172, 248, 0, 0.2);
                    position: relative;
                }

                .sb-avatar-view::after {
                    content: '';
                    position: absolute;
                    inset: -10px;
                    border: 1px solid rgba(172, 248, 0, 0.2);
                    border-radius: 50px;
                    animation: sb-pulse-ring 3s infinite;
                }

                @keyframes sb-pulse-ring {
                    0% { transform: scale(0.9); opacity: 1; }
                    100% { transform: scale(1.2); opacity: 0; }
                }

                .sb-view-btn {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 24px;
                    border-radius: 28px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    font-weight: 900;
                    font-size: 1.1rem;
                    color: #fff;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    backdrop-filter: blur(10px);
                }

                .sb-view-btn:hover {
                    background: #fff;
                    color: #000;
                    transform: translateY(-8px);
                    border-color: #fff;
                }

                .sb-view-btn.primary {
                    background: var(--sb-primary);
                    color: #000;
                    border: none;
                    box-shadow: 0 15px 35px rgba(172, 248, 0, 0.3);
                }

                .sb-video-box {
                    width: 100%;
                    border-radius: 40px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    margin-bottom: 40px;
                }

                .sb-ambient-top { position: absolute; top: -20%; left: 50%; transform: translateX(-50%); width: 100%; height: 60%; background: radial-gradient(circle, rgba(172, 248, 0, 0.07) 0%, transparent 70%); pointer-events: none; }
                .sb-ambient-bottom { position: absolute; bottom: -10%; left: 50%; transform: translateX(-50%); width: 80%; height: 40%; background: radial-gradient(circle, rgba(0, 242, 254, 0.05) 0%, transparent 70%); pointer-events: none; }

                .sb-wiz-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.95);
                    backdrop-filter: blur(30px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .sb-wiz-card {
                    background: #0a0a0a;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 50px;
                    width: 100%;
                    max-width: 1100px;
                    height: 800px;
                    display: grid;
                    grid-template-columns: 1fr 440px;
                    overflow: hidden;
                    box-shadow: 0 100px 200px rgba(0,0,0,0.9);
                }
            `}</style>

            <div className="sb-ambient-top" />
            <div className="sb-ambient-bottom" />

            <div className="sb-view-container">
                <div className="sb-avatar-view">
                    <img src={bio.avatar_url || 'https://via.placeholder.com/150'} alt={bio.title} className="w-full h-full rounded-[40px] object-cover bg-white/5" />
                </div>

                <h1 className="text-4xl font-black mb-4 text-center tracking-tight leading-none">{bio.title}</h1>
                <p className="text-white/40 text-center mb-12 font-bold leading-relaxed px-4 uppercase tracking-[2px] text-[11px]">{bio.description}</p>

                {bio.video_url && (
                    <div className="sb-video-box">
                        <iframe width="100%" height="280" src={bio.video_url.replace('watch?v=', 'embed/')} title="Apresentação" frameBorder="0" allowFullScreen></iframe>
                    </div>
                )}

                <div className="w-full space-y-4">
                    {bio.buttons.map((btn: any, i: number) => (
                        <button key={i} onClick={() => handleButtonClick(btn)} className={`sb-view-btn ${i === 0 ? 'primary' : ''}`}>
                            {btn.type === 'whatsapp' ? <MessageCircle size={22} strokeWidth={2.5} /> : <ExternalLink size={22} strokeWidth={2.5} />}
                            {btn.label}
                        </button>
                    ))}
                </div>

                <footer className="mt-24 flex flex-col items-center gap-8 opacity-20">
                    <div className="flex items-center gap-2">
                        <Zap size={18} fill="currentColor" className="text-primary-color" />
                        <span className="text-[10px] font-black tracking-[4px] uppercase">Plug & Sales Supreme</span>
                    </div>
                </footer>
            </div>

            {isWizardOpen && (
                <div className="sb-wiz-overlay animate-fade-in">
                    <div className="sb-wiz-card">
                        <div className="p-20 flex flex-col h-full bg-gradient-to-br from-white/[0.02] to-transparent">
                            <div className="flex gap-3 mb-16">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${wizardStep >= s ? 'w-12 bg-primary-color shadow-[0_0_15px_rgba(172,248,0,0.5)]' : 'w-6 bg-white/10'}`} />
                                ))}
                            </div>

                            {wizardStep === 1 && (
                                <div className="space-y-10 animate-slide-up">
                                    <h2 className="text-6xl font-black tracking-tighter leading-[0.9]">Identidade <br/><span className="text-primary-color">Premium</span></h2>
                                    <div className="space-y-6">
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 focus-within:border-primary-color/50 transition-all">
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[3px] mb-2 block">Seu Nome Comercial</span>
                                            <input className="bg-transparent border-none outline-none text-xl font-bold w-full text-white" placeholder="Ex: Rodrigo Silva" value={employeeData.name} onChange={e => setEmployeeData({...employeeData, name: e.target.value})} />
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 focus-within:border-primary-color/50 transition-all">
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[3px] mb-2 block">URL da Foto de Perfil</span>
                                            <input className="bg-transparent border-none outline-none text-xl font-bold w-full text-white" placeholder="https://..." value={employeeData.photo} onChange={e => setEmployeeData({...employeeData, photo: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="pt-10 flex gap-4">
                                        <button onClick={() => setIsWizardOpen(false)} className="px-8 py-5 rounded-2xl bg-white/5 text-white font-black text-xs uppercase tracking-widest border border-white/10">Sair</button>
                                        <button onClick={() => setWizardStep(2)} className="flex-1 px-8 py-5 rounded-2xl bg-primary-color text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">Próxima Etapa <ChevronRight size={18}/></button>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 2 && (
                                <div className="space-y-10 animate-slide-up">
                                    <h2 className="text-6xl font-black tracking-tighter leading-[0.9]">Ativação de <br/><span className="text-primary-color">Rastreio</span></h2>
                                    <div className="space-y-6">
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 focus-within:border-primary-color/50 transition-all">
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[3px] mb-2 block">Código de Tracking (Ref)</span>
                                            <input className="bg-transparent border-none outline-none text-xl font-bold w-full text-white" placeholder="Ex: ref-rodrigo" value={employeeData.tracking} onChange={e => setEmployeeData({...employeeData, tracking: e.target.value})} />
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 focus-within:border-primary-color/50 transition-all">
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[3px] mb-2 block">Seu WhatsApp Comercial</span>
                                            <input className="bg-transparent border-none outline-none text-xl font-bold w-full text-white" placeholder="Ex: 5511999999999" value={employeeData.phone} onChange={e => setEmployeeData({...employeeData, phone: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="pt-10 flex gap-4">
                                        <button onClick={() => setWizardStep(1)} className="px-8 py-5 rounded-2xl bg-white/5 text-white font-black text-xs uppercase tracking-widest border border-white/10 flex items-center gap-3"><ArrowLeft size={18}/> Voltar</button>
                                        <button onClick={handleFinalizeDispatch} disabled={isSaving} className="flex-1 px-8 py-5 rounded-2xl bg-primary-color text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                                            {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>}
                                            {isSaving ? 'CONFIGURANDO...' : 'ATIVAR MINHA PÁGINA'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 3 && (
                                <div className="space-y-10 animate-slide-up text-center py-20">
                                    <div className="w-24 h-24 bg-primary-color/20 rounded-full flex items-center justify-center mx-auto mb-10 border border-primary-color/30">
                                        <Check size={40} className="text-primary-color" strokeWidth={4} />
                                    </div>
                                    <h2 className="text-6xl font-black tracking-tighter leading-[0.9]">Pronto para <br/><span className="text-primary-color">Vender!</span></h2>
                                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Sua página personalizada está ativa e rastreada.</p>
                                    <div className="mt-12 p-8 bg-white/5 rounded-[40px] border border-white/10">
                                        <p className="text-primary-color font-black text-xl break-all">plugsales.com/bio/{slug}?ref={employeeData.tracking}</p>
                                    </div>
                                    <button onClick={() => setIsWizardOpen(false)} className="mt-10 px-12 py-6 bg-primary-color text-black font-black rounded-3xl uppercase tracking-widest text-xs">Acessar Meu Painel</button>
                                </div>
                            )}
                        </div>

                        <div className="relative flex flex-col border-l border-white/5" style={{ backgroundColor: '#0b141a', backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: '400px', backgroundBlendMode: 'overlay' }}>
                            <div className="bg-[#202c33] p-10 pt-16 flex items-center gap-5">
                                <div className="w-14 h-14 bg-white/5 rounded-full overflow-hidden border-2 border-white/10">
                                    {employeeData.photo ? <img src={employeeData.photo} className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-white/20" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-white font-bold text-lg">{employeeData.name || 'Seu Atendimento'}</p>
                                        <Zap size={14} className="text-[#00a884]" fill="currentColor" />
                                    </div>
                                    <p className="text-[#00a884] text-xs font-bold mt-0.5">Online agora</p>
                                </div>
                            </div>

                            <div className="flex-1 p-10 flex flex-col gap-6 overflow-y-auto">
                                <div className="bg-[#202c33] rounded-[0_24px_24px_24px] p-2 shadow-2xl max-w-[95%]">
                                    <div className="p-4 pt-2">
                                        <p className="text-[#53bdeb] font-bold text-sm mb-1 flex items-center gap-2">
                                            {employeeData.name || 'Atendimento'} <Zap size={12} fill="currentColor" />
                                        </p>
                                        <p className="text-[#e9edef] text-[15px] leading-relaxed">
                                            Olá! Acabei de configurar sua página exclusiva com nossos materiais oficiais. Clique abaixo para acessar:
                                        </p>
                                    </div>
                                    
                                    <div className="m-1 rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                                        {bio.avatar_url && <img src={bio.avatar_url} className="w-full h-48 object-cover opacity-80" />}
                                        <div className="p-4 bg-[#182229]">
                                            <p className="text-[#8696a0] text-[10px] font-black tracking-widest mb-1 uppercase">PLUGSALES.COM</p>
                                            <p className="text-white font-bold text-base leading-tight">{bio.title}</p>
                                            <p className="text-[#8696a0] text-xs mt-1 line-clamp-1 font-medium">{bio.description}</p>
                                        </div>
                                    </div>

                                    <div className="mt-2 p-4 border-t border-white/5 text-center text-[#53bdeb] font-black text-sm tracking-wider uppercase flex items-center justify-center gap-3">
                                        <ExternalLink size={16} /> Abrir Página
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
