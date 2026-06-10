import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Layers, MessageCircle } from 'lucide-react';
import './LandingPage.css';

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
        <div>
            <SEO
                title="API Oficial do WhatsApp para Empresas (WABA) | Plug & Sales"
                description="Solução completa de API Oficial do WhatsApp (WABA) para empresas. Disparo em massa com segurança, templates multimídia, botões e relatórios. Sem bloqueio, sem BM própria."
                canonical="https://plugesales.com/servicos/api-oficial-whatsapp"
                schema={[breadcrumbSchema, faqSchema]}
                keywords="api oficial whatsapp, waba, whatsapp business api, api whatsapp empresarial, bsp whatsapp"
            />

            <section className="lp-section" style={{ padding: 'clamp(140px, 20vh, 220px) 8% 80px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <Zap size={14} /> TECNOLOGIA WABA
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center' }}>
                        API Oficial do WhatsApp <span className="text-gradient">para Empresas</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 32px', textAlign: 'center' }}>
                        A WhatsApp Business API (WABA) é a única solução homologada pela Meta para disparos em massa. Conecte sua operação diretamente aos servidores oficiais do WhatsApp com segurança total.
                    </p>
                    <div className="lp-cta-group" style={{ justifyContent: 'center' }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, padding: '16px 24px', borderBottom: '2px solid rgba(172,248,0,0.3)', fontWeight: 800, color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                        <span>Característica</span>
                        <span style={{ textAlign: 'center', color: '#22c55e' }}>API Oficial</span>
                        <span style={{ textAlign: 'center', color: '#ef4444' }}>Não-Oficial</span>
                    </div>
                    {differences.map((d, i) => (
                        <div key={i} style={{
                            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, alignItems: 'center',
                            padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <span style={{ fontWeight: 600, color: '#fff' }}>{d.feature}</span>
                            <span style={{ textAlign: 'center', color: '#22c55e', fontWeight: 700 }}>{d.official}</span>
                            <span style={{ textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>{d.unofficial}</span>
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
        </div>
    );
};

export default ApiOficialPage;
