import SEO from '../components/SEO';
import { ShieldCheck, Target, Users, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Plug & Sales",
        "alternateName": "Plugesales",
        "url": "https://plugesales.com.br",
        "logo": "https://plugesales.com.br/logo-supreme.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+55-11-99999-9999",
            "contactType": "customer service",
            "areaServed": "BR",
            "availableLanguage": "Portuguese"
        },
        "sameAs": [
            "https://www.instagram.com/plugesales",
            "https://www.linkedin.com/company/plugesales"
        ],
        "description": "Líder nacional em soluções de escala via API Oficial do WhatsApp (WABA), focada em alta performance de disparos e automação de vendas sem risco de bloqueio."
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "A Plug & Sales usa a API Oficial?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sim, operamos exclusivamente via API Oficial da Meta (WABA), garantindo 100% de segurança contra bloqueios e estabilidade na entrega de mensagens."
                }
            },
            {
                "@type": "Question",
                "name": "Como funciona o disparo em massa?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Nossa plataforma utiliza infraestrutura de ponta para gerenciar grandes volumes de envios, respeitando os tiers de reputação da Meta e maximizando a taxa de abertura."
                }
            }
        ]
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com.br" },
            { "@type": "ListItem", "position": 2, "name": "Sobre Nós", "item": "https://plugesales.com.br/sobre" }
        ]
    };

    return (
        <div className="about-page animate-fade-in">
            <SEO 
                title="Líder em Escala e Automação de WhatsApp API | Plug & Sales" 
                description="Conheça a infraestrutura por trás da Plug & Sales. Especialistas em API Oficial da Meta para disparos em massa, chatbots e escala de vendas sem bloqueios."
                schema={[orgSchema, breadcrumbSchema, faqSchema]}
            />

            <div className="breadcrumb-wrapper container">
                <nav className="breadcrumbs">
                    <Link to="/">Início</Link>
                    <ChevronRight size={14} />
                    <span>Sobre Nós</span>
                </nav>
            </div>
            
            <section className="page-hero">
                <div className="container">
                    <span className="section-tag">INFRAESTRUTURA DE ELITE</span>
                    <h1 className="hero-title">Liderando a Revolução da <span className="text-gradient">Comunicação em Escala</span></h1>
                    <p className="hero-subtitle">
                        Não somos apenas uma plataforma de disparos. Somos a arquitetura tecnológica que permite empresas escalarem de milhares para milhões de conversas com segurança absoluta e conformidade total com a Meta.
                    </p>
                </div>
            </section>

            <section className="values-section section-padding">
                <div className="container">
                    <div className="values-grid">
                        <div className="value-card glass-card">
                            <ShieldCheck className="value-icon" size={40} />
                            <h3>WABA Compliance</h3>
                            <p>Segurança de nível enterprise. Operamos sob os mais rígidos protocolos da Meta para garantir que seu número seja uma fortaleza inquebrável.</p>
                        </div>
                        <div className="value-card glass-card">
                            <Zap className="value-icon" size={40} />
                            <h3>Alta Performance</h3>
                            <p>Motores de envio otimizados para velocidade extrema. Latência zero e taxa de entrega auditada para operações que não podem parar.</p>
                        </div>
                        <div className="value-card glass-card">
                            <Target className="value-icon" size={40} />
                            <h3>ROI Optimization</h3>
                            <p>Foco total em conversão. Nossa inteligência de dados ajuda a identificar os melhores gatilhos para transformar leads em clientes fiéis.</p>
                        </div>
                        <div className="value-card glass-card">
                            <Users className="value-icon" size={40} />
                            <h3>Consultoria Expert</h3>
                            <p>Mais que suporte, oferecemos inteligência. Nosso time de especialistas acompanha sua jornada de escala passo a passo.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mission-vision section-padding">
                <div className="container">
                    <div className="mission-grid">
                        <div className="mission-content">
                            <h2>Nossa Missão</h2>
                            <p>Transformar a maneira como as empresas se conectam com seus clientes, tornando o WhatsApp o canal de vendas mais eficiente e seguro do mundo.</p>
                        </div>
                        <div className="vision-content">
                            <h2>Nossa Visão</h2>
                            <p>Ser a plataforma de referência global em automação de WhatsApp API, reconhecida pela excelência tecnológica e compromisso com o sucesso do cliente.</p>
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
                .values-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px; }
                .value-card { text-align: left; transition: all 0.3s; }
                .value-icon { color: var(--primary-color); margin-bottom: 24px; }
                .value-card h3 { margin-bottom: 16px; font-size: 1.5rem; }
                .value-card p { color: var(--text-secondary); line-height: 1.6; }
                .mission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; background: rgba(172, 248, 0, 0.03); padding: 60px; border-radius: 32px; border: 1px solid rgba(172, 248, 0, 0.1); }
                .mission-content h2, .vision-content h2 { color: var(--primary-color); margin-bottom: 24px; }
                .mission-content p, .vision-content p { font-size: 1.1rem; line-height: 1.7; opacity: 0.9; }
                @media (max-width: 1024px) {
                    .hero-title { font-size: 3.2rem; }
                }

                @media (max-width: 768px) {
                    .breadcrumb-wrapper { padding-top: 100px; margin-bottom: -60px; }
                    .page-hero { padding: 60px 0 40px; }
                    .hero-title { font-size: 2.2rem; }
                    .hero-subtitle { font-size: 1.1rem; }
                    .section-padding { padding: 60px 0; }
                    .mission-grid { grid-template-columns: 1fr; padding: 32px; gap: 40px; }
                    .mission-content h2, .vision-content h2 { font-size: 1.8rem; margin-bottom: 16px; }
                }

                @media (max-width: 480px) {
                    .hero-title { font-size: 1.8rem; }
                    .value-card h3 { font-size: 1.3rem; }
                }
            `}</style>
        </div>
    );
};

export default AboutPage;
