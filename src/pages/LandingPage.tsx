import { useState } from 'react';
import { 
    MessageSquare, 
    Zap, 
    ShieldCheck, 
    Layers, 
    Smartphone, 
    BarChart3, 
    ArrowRight, 
    Plus,
    X
} from 'lucide-react';
import './LandingPage.css';
import DemoQuiz from '../components/DemoQuiz';

const LandingPage = () => {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const features = [
        {
            icon: <MessageSquare size={24} />,
            title: "Disparo Inteligente",
            description: "Envie milhares de mensagens com tecnologia anti-bloqueio e personalização dinâmica."
        },
        {
            icon: <BarChart3 size={24} />,
            title: "Analytics em Tempo Real",
            description: "Acompanhe cliques, conversões e engajamento com dashboards detalhados."
        },
        {
            icon: <ShieldCheck size={24} />,
            title: "Segurança Avançada",
            description: "Conexões criptografadas e conformidade total com as diretrizes da Meta."
        },
        {
            icon: <Layers size={24} />,
            title: "Multiatendimento",
            description: "Gerencie múltiplas contas e campanhas em uma única interface intuitiva."
        },
        {
            icon: <Smartphone size={24} />,
            title: "Mobile First",
            description: "Controle sua operação de qualquer lugar, com interface 100% responsiva."
        },
        {
            icon: <Zap size={24} />,
            title: "Automações Rápidas",
            description: "Crie fluxos de trabalho que economizam horas do seu time todos os dias."
        }
    ];

    const faqs = [
        {
            q: "Como funciona o sistema de disparos?",
            a: "Nosso sistema utiliza a API oficial da Meta para garantir segurança e entrega. Você importa seus contatos, cria o template e nós cuidamos de toda a fila de processamento."
        },
        {
            q: "É possível integrar com meu CRM?",
            a: "Sim, oferecemos webhooks e APIs para integração direta com as principais ferramentas do mercado."
        },
        {
            q: "Existe risco de bloqueio de conta?",
            a: "Ao utilizar a API oficial seguindo nossas melhores práticas recomendadas, o risco de bloqueio é praticamente nulo se comparado a automações piratas."
        },
        {
            q: "Como é feito o suporte?",
            a: "Temos um time de especialistas disponível via WhatsApp e e-mail para ajudar em cada etapa da sua operação."
        }
    ];

    return (
        <div className="lp-container">
            {/* ── HEADER ── */}
            <header className="lp-header">
                <div className="lp-logo">
                    <div style={{ background: '#000', padding: '6px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                        <MessageSquare size={20} color="#acf800" fill="#acf800" />
                    </div>
                    Plug & Sales
                </div>
                
                <nav className="lp-nav">
                    <a href="#funciona" className="lp-nav-link">Como Funciona</a>
                    <a href="#features" className="lp-nav-link">Recursos</a>
                    <a href="#testar" className="lp-btn lp-btn-primary" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>
                        TESTAR AGORA
                    </a>
                </nav>
            </header>

            {/* ── HERO ── */}
            <section className="lp-hero">
                <div className="lp-hero-content">
                    <div className="lp-hero-tag">
                        <Zap size={14} /> NOVIDADE: DASHBOARD ANALYTICS 2.0
                    </div>
                    <h1 className="lp-hero-title">
                        Escalone Suas Vendas No <span style={{ color: '#acf800' }}>WhatsApp</span>
                    </h1>
                    <p className="lp-hero-subtitle">
                        A plataforma definitiva para agências e empresas que buscam automação profissional, 
                        disparos em massa com API oficial e gestão completa de campanhas.
                    </p>
                    <div className="lp-cta-group">
                        <a href="#testar" className="lp-btn lp-btn-primary">
                            TESTAR AGORA GRATUITAMENTE <ArrowRight size={18} />
                        </a>
                        <button onClick={() => window.open('https://wa.me/5511999999999', '_blank')} className="lp-btn lp-btn-secondary">
                            FALAR COM AGENTE
                        </button>
                    </div>
                </div>
                
                <div className="lp-hero-mockup">
                    <img 
                        src="/src/assets/lp/hero-mockup.png" 
                        alt="Dashboard Mockup" 
                        className="lp-mockup-frame"
                    />
                    <div style={{ position: 'absolute', top: '20%', right: '-40px', background: 'rgba(5,7,10,0.8)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#acf800', marginBottom: '8px' }}>ENTREGAS HOJE</div>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>12.540</div>
                        <div style={{ fontSize: '9px', color: '#22c55e', marginTop: '4px' }}>+12% que ontem</div>
                    </div>
                </div>
            </section>

            {/* ── PROCESS ── */}
            <section id="funciona" className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">SIMPLICIDADE</span>
                    <h2 className="lp-section-title">Três Passos Para O Sucesso</h2>
                    <p>Dominamos a complexidade para que você foque no que importa: vender.</p>
                </div>
                
                <div className="lp-steps-grid">
                    <div className="lp-step-card">
                        <div className="lp-step-number">01</div>
                        <h3>Conecte Sua Conta</h3>
                        <p>Integre seu número oficial via API em segundos e comece a operar com total segurança.</p>
                    </div>
                    <div className="lp-step-card">
                        <div className="lp-step-number">02</div>
                        <h3>Crie Sua Campanha</h3>
                        <p>Use nosso editor de templates intuitivo para criar mensagens que convertem de verdade.</p>
                    </div>
                    <div className="lp-step-card">
                        <div className="lp-step-number">03</div>
                        <h3>Escalone o Envio</h3>
                        <p>Dispare para milhares de contatos com um clique e acompanhe métricas em tempo real.</p>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="lp-section" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="lp-section-header">
                    <span className="lp-section-tag">RECURSOS</span>
                    <h2 className="lp-section-title">Tudo O Que Você Precisa</h2>
                </div>
                
                <div className="lp-features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="lp-feature-card">
                            <div className="lp-feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── INTERACTIVE DEMO ── */}
            <section id="testar" className="lp-section" style={{ paddingLeft: '4%', paddingRight: '4%' }}>
                <div className="lp-section-header" style={{ maxWidth: '1000px' }}>
                    <span className="lp-section-tag">SIMULADOR OFICIAL</span>
                    <h2 className="lp-section-title">Experimente O Poder Do <span style={{ color: '#acf800' }}>WhatsApp Marketing</span></h2>
                    <p>Personalize cada detalhe da sua campanha abaixo e veja o resultado instantâneo no preview à direita.</p>
                </div>
                
                <DemoQuiz />
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">DÚVIDAS</span>
                    <h2 className="lp-section-title">Perguntas Frequentes</h2>
                </div>
                
                <div className="lp-faq-container">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`lp-faq-item ${activeFaq === i ? 'active' : ''}`} onClick={() => toggleFaq(i)}>
                            <div className="lp-faq-question">
                                {faq.q}
                                {activeFaq === i ? <X size={18} /> : <Plus size={18} />}
                            </div>
                            <div className="lp-faq-answer">
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="lp-footer">
                <div className="lp-logo" style={{ justifyContent: 'center', marginBottom: '32px' }}>
                   Plug & Sales
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '48px' }}>
                    <a href="#" className="lp-nav-link">Termos de Uso</a>
                    <a href="#" className="lp-nav-link">Privacidade</a>
                    <a href="#" className="lp-nav-link">Diretrizes da Meta</a>
                </div>
                <p className="lp-copyright">
                    © 2026 Plug & Sales Pro. Todos os direitos reservados.
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
