import { useEffect, useRef } from 'react';
import { Check, Shield, Zap, BarChart3, ArrowRight, Smartphone, Share2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// Images
import whatsappMockup from '../assets/lp/whatsapp-mockup.png';

const LandingPage = () => {
    const navigate = useNavigate();
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.reveal-trigger');
        elements.forEach(el => observerRef.current?.observe(el));

        return () => observerRef.current?.disconnect();
    }, []);

    return (
        <div className="lp-container">
            {/* Animated Background Blobs distributed through the page */}
            <div className="lp-blob lp-blob-1"></div>
            <div className="lp-blob lp-blob-2"></div>
            <div className="lp-blob lp-blob-3"></div>
            <div className="lp-blob" style={{ bottom: '10%', right: '10%', background: 'rgba(172, 248, 0, 0.1)', animationDelay: '-2s' }}></div>
            <div className="lp-blob" style={{ top: '40%', left: '5%', background: 'rgba(0, 242, 254, 0.05)', animationDelay: '-7s' }}></div>

            {/* Header */}
            <header className="lp-header" style={{ position: 'relative', zIndex: 100 }}>
                <div className="lp-logo">PLUG & SALES</div>
                <nav className="hidden md-flex gap-8">
                    <button onClick={() => navigate('/login')} className="btn btn-secondary">Entrar</button>
                    <button onClick={() => navigate('/login')} className="btn btn-primary glow-btn">Começar Agora</button>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="lp-hero">
                <div className="lp-hero-tag reveal-trigger delay-1">API Oficial Meta Partner</div>
                <h1 className="lp-hero-title reveal-trigger delay-2">
                    <span className="text-gradient-animate">A Infraestrutura que sua</span> <br /> 
                    <span className="text-primary">Operação de WhatsApp</span> Merece
                </h1>
                <p className="lp-hero-subtitle reveal-trigger delay-3">
                    Estabilidade total, sem riscos de banimento e escala ilimitada. 
                    Gerencie múltiplos clientes e campanhas em uma única plataforma profissional.
                </p>
                <div className="lp-cta-group reveal-trigger delay-4">
                    <button onClick={() => navigate('/login')} className="btn btn-primary glow-btn px-8 py-4 text-lg">
                        Começar Agora Grátis <ArrowRight className="ml-2" size={20} />
                    </button>
                </div>
            </section>

            {/* Stats */}
            <div className="lp-stats reveal-trigger">
                <div className="lp-stat-item">
                    <span className="lp-stat-value">100%</span>
                    <span className="lp-stat-label">Oficial & Seguro</span>
                </div>
                <div className="lp-stat-item">
                    <span className="lp-stat-value">Multi</span>
                    <span className="lp-stat-label">Gestão de Clientes</span>
                </div>
                <div className="lp-stat-item">
                    <span className="lp-stat-value">Real-Time</span>
                    <span className="lp-stat-label">Métricas e Analytics</span>
                </div>
            </div>

            {/* Why Official? */}
            <section className="lp-section">
                <div className="lp-mockup-section">
                    <div className="reveal-trigger">
                        <img src={whatsappMockup} alt="WhatsApp API Mockup" className="lp-mockup-image float-3d" />
                    </div>
                    <div className="reveal-trigger delay-2">
                        <div className="lp-section-title text-left" style={{ textAlign: 'left', marginBottom: '32px' }}>
                            <h2 style={{ marginBottom: '16px' }}>Por que usar a API Oficial?</h2>
                            <p>Assuma o controle total da sua comunicação sem as limitações das soluções "não oficiais".</p>
                        </div>
                        <div className="lp-comparison" style={{ gridTemplateColumns: '1fr', padding: '0', background: 'transparent', border: 'none' }}>
                            <div className="lp-comp-side">
                                <h4 className="text-primary flex items-center gap-2">
                                    <Zap className="text-primary" /> Plug & Sales (Oficial)
                                </h4>
                                <ul className="lp-comp-list">
                                    <li className="lp-comp-item"><Check size={14} className="text-primary" /> Segurança total e conformidade Meta</li>
                                    <li className="lp-comp-item"><Check size={14} className="text-primary" /> Escala ilimitada de disparos por segundo</li>
                                    <li className="lp-comp-item"><Check size={14} className="text-primary" /> Templates interativos e homologados</li>
                                    <li className="lp-comp-item"><Check size={14} className="text-primary" /> Dashboard de analytics em tempo real</li>
                                    <li className="lp-comp-item"><Check size={14} className="text-primary" /> Verificação de conta (Selo Verde)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features (Differentials) */}
            <section className="lp-section">
                <div className="lp-section-title reveal-trigger">
                    <h2 className="text-gradient">Diferenciais que Impulsionam Vendas</h2>
                    <p>Por que os maiores players do mercado escolhem a nossa plataforma?</p>
                </div>
                <div className="lp-features-grid">
                    {[
                        { 
                            icon: <Users size={28} />, 
                            title: "Controle Total de Clientes", 
                            desc: "Dashboard centralizado para gerenciar subcontas, monitorar envios e performance de cada cliente individualmente." 
                        },
                        { 
                            icon: <Shield size={28} />, 
                            title: "Templates Homologados Meta", 
                            desc: "Criação em lote e aprovação ultra-rápida de templates com botões interativos e mídia de alta qualidade." 
                        },
                        { 
                            icon: <Zap size={28} />, 
                            title: "Disparos em Massa de Alta Escala", 
                            desc: "Nossa infraestrutura suporta milhares de mensagens por segundo, garantindo entrega instantânea sem bloqueios." 
                        },
                        { 
                            icon: <Share2 size={28} />, 
                            title: "Encurtador com Rastreamento", 
                            desc: "Gere links curtos inteligentes e saiba exatamente quem clicou, otimizando o ROI das suas campanhas." 
                        },
                        { 
                            icon: <BarChart3 size={28} />, 
                            title: "Analytics Preditivo", 
                            desc: "Dados consolidados de delivery, leitura e conversão. exporte relatórios profissionais para seus clientes." 
                        },
                        { 
                            icon: <Smartphone size={28} />, 
                            title: "Hospedagem de Mídia Integrada", 
                            desc: "Upload direto de arquivos para nossos servidores seguros, garantindo que suas mídias sempre carreguem no WhatsApp." 
                        }
                    ].map((f, i) => (
                        <div key={i} className={`lp-feature-card reveal-trigger delay-${(i % 3) + 1}`}>
                            <div className="lp-feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Final */}
            <section className="lp-hero reveal-trigger">
                <h2 className="lp-hero-title">Pronto para o Próximo Nível?</h2>
                <p className="lp-hero-subtitle">
                    Junte-se a centenas de empresas que já transformaram seu WhatsApp
                    em uma máquina de vendas imparável.
                </p>
                <button onClick={() => navigate('/login')} className="btn btn-primary glow-btn px-12 py-5 text-xl">
                    Começar Agora <Zap className="ml-2" size={24} />
                </button>
            </section>

            {/* Footer */}
            <footer className="lp-footer">
                <span className="lp-footer-logo">PLUG & SALES</span>
                <p className="lp-copyright">
                    © 2026 Plug & Sales. Todos os direitos reservados.
                    <br />Tecnologia certificada Meta Business Partner.
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
