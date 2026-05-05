import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { CheckCircle2, Layout, BarChart3, Smartphone, Zap, Globe, ShieldCheck, ChevronRight } from 'lucide-react';

const PresentationsPage = () => {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com.br" },
            { "@type": "ListItem", "position": 2, "name": "Apresentações", "item": "https://plugesales.com.br/apresentacoes" }
        ]
    };

    const features = [
        {
            title: "API Oficial Meta",
            desc: "Segurança total contra bloqueios e conformidade total com as políticas do WhatsApp.",
            icon: <ShieldCheck size={32} />
        },
        {
            title: "Disparos em Massa",
            desc: "Escala real para bases de dados gigantes, com entrega garantida e alta velocidade.",
            icon: <Zap size={32} />
        },
        {
            title: "Dashboard de Gestão",
            desc: "Controle total da sua operação com métricas em tempo real e relatórios detalhados.",
            icon: <Layout size={32} />
        },
        {
            title: "Analytics Avançado",
            desc: "Saiba exatamente quem recebeu, quem leu e quem clicou nos seus links.",
            icon: <BarChart3 size={32} />
        },
        {
            title: "Multi-Números",
            desc: "Gerencie múltiplos números e atendentes em uma única plataforma centralizada.",
            icon: <Smartphone size={32} />
        },
        {
            title: "Integração Global",
            desc: "Webhooks e API robusta para conectar o Plug & Sales ao seu CRM favorito.",
            icon: <Globe size={32} />
        }
    ];

    return (
        <div className="presentations-page animate-fade-in">
            <SEO 
                title="Apresentações e Recursos" 
                description="Explore os recursos avançados da Plug & Sales: Disparos em massa, API Oficial, Automação e Analytics para WhatsApp."
                schema={breadcrumbSchema}
            />

            <div className="breadcrumb-wrapper container">
                <nav className="breadcrumbs">
                    <Link to="/">Início</Link>
                    <ChevronRight size={14} />
                    <span>Apresentações</span>
                </nav>
            </div>

            <section className="page-hero">
                <div className="container">
                    <span className="section-tag">RECURSOS PREMIUM</span>
                    <h1 className="hero-title">Poder ilimitado para sua <span className="text-gradient">comunicação</span></h1>
                    <p className="hero-subtitle">
                        Tudo o que sua empresa precisa para dominar o WhatsApp e escalar vendas de forma profissional.
                    </p>
                </div>
            </section>

            <section className="features-grid-section section-padding">
                <div className="container">
                    <div className="features-showcase">
                        {features.map((f, i) => (
                            <div key={i} className="feature-item glass-card">
                                <div className="feature-icon-wrapper">
                                    {f.icon}
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="live-demo-section section-padding">
                <div className="container">
                    <div className="demo-content">
                        <div className="demo-text">
                            <h2>Veja a plataforma em ação</h2>
                            <p>Nossa interface foi projetada para ser intuitiva e poderosa ao mesmo tempo. Gerencie milhares de contatos com apenas alguns cliques.</p>
                            <ul className="demo-list">
                                <li><CheckCircle2 size={18} color="#acf800" /> Importação rápida de contatos (Excel/CSV)</li>
                                <li><CheckCircle2 size={18} color="#acf800" /> Criador de templates interativos com botões</li>
                                <li><CheckCircle2 size={18} color="#acf800" /> Agendamento inteligente de disparos</li>
                                <li><CheckCircle2 size={18} color="#acf800" /> Monitoramento de entrega em tempo real</li>
                            </ul>
                        </div>
                        <div className="demo-image-wrapper">
                            <img src="https://iili.io/BRvLRPS.jpg" alt="Plug & Sales Dashboard" className="demo-img" />
                            <div className="img-glow"></div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .page-hero { padding: 80px 0; text-align: center; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

                .breadcrumb-wrapper { padding-top: 120px; margin-bottom: -100px; position: relative; z-index: 10; }
                .breadcrumbs { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.4); font-size: 0.85rem; font-weight: 500; justify-content: center; }
                .breadcrumbs a { color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.3s; }
                .breadcrumbs a:hover { color: var(--primary-color); }
                .breadcrumbs span { color: var(--primary-color); font-weight: 700; }

                .section-tag { color: var(--primary-color); font-weight: 800; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; display: block; }
                .hero-title { font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 24px; line-height: 1.1; }
                .hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); max-width: 800px; margin: 0 auto; line-height: 1.6; }
                .section-padding { padding: 100px 0; }
                
                .features-showcase { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 32px; }
                .feature-item { text-align: left; }
                .feature-icon-wrapper { color: var(--primary-color); margin-bottom: 24px; width: 64px; height: 64px; background: rgba(172, 248, 0, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
                .feature-item h3 { margin-bottom: 12px; font-size: 1.5rem; }
                .feature-item p { color: var(--text-secondary); line-height: 1.6; }

                .demo-content { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; align-items: center; }
                .demo-text h2 { font-size: 2.5rem; margin-bottom: 24px; }
                .demo-text p { font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 32px; line-height: 1.7; }
                .demo-list { list-style: none; display: flex; flex-direction: column; gap: 16px; }
                .demo-list li { display: flex; align-items: center; gap: 12px; font-weight: 600; color: var(--text-primary); }
                
                .demo-image-wrapper { position: relative; }
                .demo-img { width: 100%; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5); }
                .img-glow { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at center, var(--primary-color) 0%, transparent 70%); opacity: 0.1; pointer-events: none; }

                @media (max-width: 992px) {
                    .demo-content { grid-template-columns: 1fr; gap: 60px; }
                }
            `}</style>
        </div>
    );
};


export default PresentationsPage;
