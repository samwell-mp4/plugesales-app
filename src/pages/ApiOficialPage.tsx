import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Zap, Layers, Check, MessageCircle } from 'lucide-react';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "API Oficial WhatsApp", "item": "https://plugesales.com/servicos/api-oficial-whatsapp" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "O que é a API Oficial do WhatsApp?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "É a WhatsApp Business API (WABA), a solução oficial da Meta para empresas enviarem mensagens em escala com segurança, conformidade e recursos avançados como templates, botões e mídia."
            }
        },
        {
            "@type": "Question",
            "name": "Qual a diferença entre API Oficial e não-oficial?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A API Oficial é homologada pela Meta, não apresenta risco de bloqueio, suporta alto volume e permite recursos como botões, listas e mensagens multimídia. Soluções não-oficiais violam os Termos de Serviço e podem resultar em banimento."
            }
        },
        {
            "@type": "Question",
            "name": "Preciso criar uma Business Manager (BM)?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Não. Com a Plug & Sales, você não precisa criar ou verificar BM. Utilizamos nossa própria infraestrutura homologada para seus disparos."
            }
        }
    ]
};

const differences = [
    { feature: 'Segurança contra bloqueio', official: '✅ Total', unofficial: '❌ Alto risco' },
    { feature: 'Limite de envio diário', official: '📈 Ilimitado (escalável)', unofficial: '⚠️ Restrito (100-500/dia)' },
    { feature: 'Templates com botões', official: '✅ Sim', unofficial: '❌ Não' },
    { feature: 'Mídia (imagem, vídeo, áudio)', official: '✅ Sim', unofficial: '⚠️ Limitado' },
    { feature: 'Homologação Meta', official: '✅ Sim', unofficial: '❌ Violação de ToS' },
    { feature: 'Relatórios de entrega', official: '✅ Detalhados', unofficial: '❌ Sem garantia' },
    { feature: 'Número verificado (Check verde)', official: '✅ Disponível', unofficial: '❌ Não' }
];

const ApiOficialPage = () => {
    return (
        <div className="public-page-wrapper animate-fade-in">
            <SEO
                title="API Oficial do WhatsApp para Empresas (WABA) | Plug & Sales"
                description="Solução completa de API Oficial do WhatsApp (WABA) para empresas. Disparo em massa com segurança, templates multimídia, botões e relatórios. Sem bloqueio, sem BM própria."
                canonical="https://plugesales.com/servicos/api-oficial-whatsapp"
                schema={[breadcrumbSchema, faqSchema]}
                keywords="api oficial whatsapp, waba, whatsapp business api, api whatsapp empresarial, bsp whatsapp"
            />

            <div className="breadcrumb-wrapper container">
                <nav className="breadcrumbs">
                    <Link to="/">Início</Link>
                    <ChevronRight size={14} />
                    <span>API Oficial do WhatsApp</span>
                </nav>
            </div>

            <section className="page-hero">
                <div className="container">
                    <span className="section-tag">TECNOLOGIA WABA</span>
                    <h1 className="hero-title">API Oficial do WhatsApp <span className="text-gradient">para Empresas</span></h1>
                    <p className="hero-subtitle">
                        A WhatsApp Business API (WABA) é a única solução homologada pela Meta para disparos em massa. Conecte sua operação diretamente aos servidores oficiais do WhatsApp com segurança total.
                    </p>
                    <div className="lp-cta-group" style={{ marginTop: 40 }}>
                        <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
                            ATIVAR API OFICIAL 👉
                        </Link>
                    </div>
                </div>
            </section>

            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">COMPARATIVO</span>
                    <h2 className="lp-section-title">API Oficial vs Não-Oficial</h2>
                </div>
                <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
                    {differences.map((d, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                            gap: 16
                        }}>
                            <span style={{ flex: 1, fontWeight: 700, color: '#fff' }}>{d.feature}</span>
                            <span style={{ flex: 1, textAlign: 'center', color: '#22c55e', fontWeight: 700 }}>{d.official}</span>
                            <span style={{ flex: 1, textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>{d.unofficial}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="lp-section lp-alt-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">DIFERENCIAIS</span>
                    <h2 className="lp-section-title">Por que escolher a Plug & Sales como sua WABA</h2>
                </div>
                <div className="sp-authority-grid container">
                    <div className="sp-auth-item">
                        <Layers color="#acf800" size={32} />
                        <div>
                            <h4>Infraestrutura homologada</h4>
                            <p>Todo o ecossistema 100% dentro das diretrizes e requisitos técnicos da Meta.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <Zap color="#acf800" size={32} />
                        <div>
                            <h4>Sem necessidade de BM</h4>
                            <p>Você não precisa criar, verificar ou gerenciar Business Manager. Nós fazemos tudo.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <ShieldCheck color="#acf800" size={32} />
                        <div>
                            <h4>Escala imediata</h4>
                            <p>Diferente de soluções genéricas, temos estrutura pronta para alto volume desde o dia 1.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Sua API Oficial em 24h</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Estrutura completa, sem burocracia.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        ATIVAR AGORA 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero saber mais sobre a API Oficial do WhatsApp." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={28} />
                <span className="wa-tooltip">Fale conosco</span>
            </a>

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
                .text-gradient { background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                @media (max-width: 768px) {
                    .breadcrumb-wrapper { padding-top: 100px; margin-bottom: -60px; }
                    .page-hero { padding: 60px 0 40px; }
                    .hero-title { font-size: 2.2rem; }
                    .hero-subtitle { font-size: 1.1rem; }
                }
            `}</style>
        </div>
    );
};

export default ApiOficialPage;
