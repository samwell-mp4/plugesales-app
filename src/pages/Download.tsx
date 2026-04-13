import React, { useEffect, useState } from 'react';
import { 
  Smartphone, 
  Apple, 
  Chrome, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import './LandingPage.css';

const DownloadPage = () => {
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // Detecção de plataforma
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        } else if (/android/.test(userAgent)) {
            setPlatform('android');
        } else {
            setPlatform('other');
        }

        // Listener para o evento de instalação do PWA
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            // Se não houver prompt (como no iOS), apenas redireciona ou avisa
            if (platform === 'ios') {
                alert('No iPhone, use o menu de compartilhamento do Safari e selecione "Adicionar à Tela de Início".');
            } else {
                window.location.href = '/';
            }
        }
    };

    return (
        <div className="lp-container">
            {/* ── HERO / HEADER ── */}
            <section className="lp-hero" style={{ paddingBottom: '60px' }}>
                <div className="lp-hero-content">
                    <div className="lp-hero-tag">
                        <Zap size={14} /> Aplicativo Exclusivo Plug & Sales
                    </div>
                    <h1 className="lp-hero-title">
                        Sua Operação <br />
                        <span style={{ color: '#acf800' }}>Na Palma da Mão</span>
                    </h1>
                    <p className="lp-hero-subtitle">
                        Instale nossa plataforma Supreme diretamente no seu dispositivo. 
                        Acesso instantâneo, performance nativa e notificações em tempo real, sem depender de navegadores.
                    </p>
                    <div className="lp-cta-group">
                        <button className="lp-btn lp-btn-primary ripple" onClick={handleInstallClick}>
                            {deferredPrompt ? 'Instalar Aplicativo Agora' : 'Acessar Painel Agora'} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="lp-hero-mockup" style={{ textAlign: 'center' }}>
                     <div className="relative inline-block">
                        <div className="w-64 h-[500px] bg-[#05070a] border-[8px] border-[#1e293b] rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-6">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1e293b] rounded-b-2xl z-20"></div>
                            
                            <SupremeLogo size={80} animate="shimmer" />

                            <div className="text-white font-black text-xl tracking-tighter text-center mt-6">
                                PLUG & <br /> <span className="text-primary-color">SALES</span>
                            </div>
                            
                            <div className="absolute bottom-10 w-4/5 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-gradient w-2/3 animate-[loading_2s_infinite]"></div>
                            </div>
                        </div>
                        
                        <div className="lp-floating-stat" style={{ bottom: '40px', right: '-20px', top: 'auto' }}>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#acf800', marginBottom: '4px' }}>STATUS</div>
                            <div style={{ fontSize: '18px', fontWeight: 900 }}>PRONTO</div>
                        </div>
                     </div>
                </div>
            </section>

            {/* ── INSTRUCTIONS SECTION ── */}
            <section className="lp-section" style={{ paddingTop: '0' }}>
                <div className="lp-section-header">
                    <span className="lp-section-tag">ONBOARDING MOBILE</span>
                    <h2 className="lp-section-title">Escolha seu Dispositivo</h2>
                </div>

                <div className="lp-steps-grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', maxWidth: '1000px', margin: '0 auto' }}>
                    {/* iOS CARD */}
                    <div className={`lp-step-card-v2 transition-all duration-500 ${platform === 'ios' ? 'scale-105 border-primary-color/40 bg-primary-color/5' : 'opacity-70'}`}>
                        <div className="lp-step-tag flex items-center gap-2">
                             <Apple size={16} /> iPhone / iPad
                        </div>
                        <h3 className="text-white text-xl font-black mb-6">Instalação no iOS</h3>
                        
                        <div className="flex flex-col gap-5">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded bg-primary-color/20 text-primary-color flex items-center justify-center text-xs font-black flex-shrink-0 mt-1">1</div>
                                <p className="text-sm text-gray-400">Abra o site no <strong className="text-white">Safari</strong></p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded bg-primary-color/20 text-primary-color flex items-center justify-center text-xs font-black flex-shrink-0 mt-1">2</div>
                                <p className="text-sm text-gray-400">Clique no ícone <span className="text-primary-color inline-flex items-center gap-1 font-bold"><Share size={14} /> Compartilhar</span></p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded bg-primary-color/20 text-primary-color flex items-center justify-center text-xs font-black flex-shrink-0 mt-1">3</div>
                                <p className="text-sm text-gray-400">Selecione <strong className="text-white">Adicionar à Tela de Início</strong> <PlusSquare size={14} className="inline mb-1" /></p>
                            </div>
                        </div>
                    </div>

                    {/* ANDROID CARD */}
                    <div className={`lp-step-card-v2 transition-all duration-500 ${platform === 'android' ? 'scale-105 border-primary-color/40 bg-primary-color/5' : 'opacity-70'}`}>
                        <div className="lp-step-tag flex items-center gap-2">
                             <Chrome size={16} /> Android Browser
                        </div>
                        <h3 className="text-white text-xl font-black mb-6">Instalação no Android</h3>
                        
                        <div className="flex flex-col gap-5">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded bg-primary-color/20 text-primary-color flex items-center justify-center text-xs font-black flex-shrink-0 mt-1">1</div>
                                <p className="text-sm text-gray-400">Abra o site no <strong className="text-white">Chrome</strong></p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded bg-primary-color/20 text-primary-color flex items-center justify-center text-xs font-black flex-shrink-0 mt-1">2</div>
                                <p className="text-sm text-gray-400">Clique nos <span className="text-primary-color inline-flex items-center gap-1 font-bold"><MoreVertical size={14} /> Três Pontinhos</span></p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded bg-primary-color/20 text-primary-color flex items-center justify-center text-xs font-black flex-shrink-0 mt-1">3</div>
                                <p className="text-sm text-gray-400">Selecione <strong className="text-white">Instalar Aplicativo</strong> ou similar.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER STYLE ── */}
            <section className="lp-section lp-dark-section" style={{ textAlign: 'center' }}>
                 <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 text-[#acf800] font-black uppercase tracking-[0.2em] text-[10px]">
                        <CheckCircle2 size={16} /> Powered by Supreme PWA Engine
                    </div>
                    <p className="text-gray-500 text-sm max-w-lg">
                        Sua plataforma estará sempre atualizada. Ao abrir o aplicativo, ele buscará automaticamente por novas funcionalidades e correções de segurança.
                    </p>
                 </div>
            </section>

            <footer className="lp-footer" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="lp-logo" style={{ justifyContent: 'center', marginBottom: '32px' }}>
                    Plug & Sales
                </div>
                <p className="lp-copyright" style={{ textAlign: 'center', opacity: 0.3, fontSize: '0.8rem', marginTop: '40px' }}>
                    © 2026 Plug & Sales Pro. Todos os direitos reservados.
                </p>
            </footer>

            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
};

export default DownloadPage;
