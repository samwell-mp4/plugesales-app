import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, ShieldCheck, TrendingUp, MessageCircle, Check } from 'lucide-react';

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Disparo em Massa no WhatsApp via API Oficial",
    "description": "Serviço de envio em larga escala via API Oficial da Meta (WABA), com capacidade ilimitada e personalização visual.",
    "provider": {
        "@type": "Organization",
        "name": "Plug & Sales",
        "url": "https://plugesales.com"
    },
    "areaServed": "BR",
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Planos de Disparo em Massa",
        "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "PC-10 Foundation Card" }, "price": "97", "priceCurrency": "BRL" },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "PC-20 Growth Card" }, "price": "197", "priceCurrency": "BRL" },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "PC-50 Performance Card" }, "price": "497", "priceCurrency": "BRL" },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "PC-100 Scale Card" }, "price": "897", "priceCurrency": "BRL" }
        ]
    }
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Disparo em Massa WhatsApp", "item": "https://plugesales.com/servicos/disparo-em-massa-whatsapp" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "O disparo em massa pelo WhatsApp pode bloquear meu número?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Não. Utilizamos a API Oficial da Meta (WABA) com estrutura própria de números. Seu número principal nunca é exposto a risco de bloqueio."
            }
        },
        {
            "@type": "Question",
            "name": "Qual o volume mínimo de disparo?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "O mínimo é de 10 mil contatos por disparo. Não há limite máximo — nossa infraestrutura escala conforme sua necessidade."
            }
        },
        {
            "@type": "Question",
            "name": "Preciso ter minha própria lista de contatos?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim, você precisa fornecer sua própria base de contatos. Não fornecemos listas e não compartilhamos sua base com terceiros."
            }
        },
        {
            "@type": "Question",
            "name": "Quanto tempo leva para ativar?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sua estrutura pode estar rodando em até 24h após a aprovação dos materiais. O processo é rápido e sem burocracia."
            }
        }
    ]
};

const DisparoMassaPage = () => {
    return (
        <div className="public-page-wrapper animate-fade-in">
            <SEO
                title="Disparo em Massa no WhatsApp | API Oficial Meta | Plug & Sales"
                description="Serviço de disparo em massa no WhatsApp via API Oficial da Meta. Envio de milhares de mensagens por dia sem bloqueio, com templates personalizados e relatórios em tempo real."
                canonical="https://plugesales.com/servicos/disparo-em-massa-whatsapp"
                schema={[serviceSchema, breadcrumbSchema, faqSchema]}
                keywords="disparo em massa whatsapp, envio em massa whatsapp, mensagem em massa whatsapp, disparo whatsapp api oficial"
            />

            <div className="breadcrumb-wrapper container">
                <nav className="breadcrumbs">
                    <Link to="/">Início</Link>
                    <ChevronRight size={14} />
                    <span>Disparo em Massa WhatsApp</span>
                </nav>
            </div>

            <section className="page-hero">
                <div className="container">
                    <span className="section-tag">SERVIÇO PREMIUM</span>
                    <h1 className="hero-title">Disparo em Massa no <span className="text-gradient">WhatsApp</span></h1>
                    <p className="hero-subtitle">
                        Envie milhares de mensagens por dia via API Oficial da Meta, com templates personalizados, foto, vídeo, áudio e botões. Sem bloqueio, sem burocracia, sem risco.
                    </p>
                    <div className="lp-cta-group" style={{ marginTop: 40 }}>
                        <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
                            QUERO COMEÇAR AGORA 👉
                        </Link>
                    </div>
                </div>
            </section>

            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">RECURSOS</span>
                    <h2 className="lp-section-title">O que você pode enviar</h2>
                </div>
                <div className="lp-content-types container" style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                    <div className="lp-type-card" style={{ background: 'rgba(172,248,0,0.05)', border: '1px solid rgba(172,248,0,0.15)' }}>📝 Texto</div>
                    <div className="lp-type-card" style={{ background: 'rgba(172,248,0,0.05)', border: '1px solid rgba(172,248,0,0.15)' }}>🖼️ Imagens</div>
                    <div className="lp-type-card" style={{ background: 'rgba(172,248,0,0.05)', border: '1px solid rgba(172,248,0,0.15)' }}>🎬 Vídeos</div>
                    <div className="lp-type-card" style={{ background: 'rgba(172,248,0,0.05)', border: '1px solid rgba(172,248,0,0.15)' }}>🔘 Botões com Link</div>
                    <div className="lp-type-card" style={{ background: 'rgba(172,248,0,0.05)', border: '1px solid rgba(172,248,0,0.15)' }}>🎯 Personalização</div>
                    <div className="lp-type-card" style={{ background: 'rgba(172,248,0,0.05)', border: '1px solid rgba(172,248,0,0.15)' }}>📎 Arquivos</div>
                </div>
            </section>

            <section className="lp-section lp-alt-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">VANTAGENS</span>
                    <h2 className="lp-section-title">Por que escolher nosso disparo em massa</h2>
                </div>
                <div className="sp-authority-grid container">
                    <div className="sp-auth-item">
                        <ShieldCheck color="#acf800" size={32} />
                        <div>
                            <h4>Sem risco de bloqueio</h4>
                            <p>API Oficial da Meta com estrutura própria de números. Zero risco para seu número principal.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <Zap color="#acf800" size={32} />
                        <div>
                            <h4>Ativação em 24h</h4>
                            <p>Sua estrutura rodando em tempo recorde. Sem configurações complexas ou aquecimento de chips.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <TrendingUp color="#acf800" size={32} />
                        <div>
                            <h4>Volume real sem limites</h4>
                            <p>De 10 mil a milhões de disparos por dia. Nossa infraestrutura escala com seu negócio.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <MessageCircle color="#acf800" size={32} />
                        <div>
                            <h4>Relatórios detalhados</h4>
                            <p>Acompanhe entregas, aberturas e cliques em tempo real direto da plataforma.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">COMO FUNCIONA</span>
                    <h2 className="lp-section-title">Passo a passo</h2>
                </div>
                <div className="lp-audience-grid container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                    <div className="lp-audience-card is-for" style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 48, fontWeight: 900, color: '#acf800', marginBottom: 16 }}>1</div>
                        <h3>Escolha seu plano</h3>
                        <p style={{ opacity: 0.8 }}>Selecione o Plug Card ideal para seu volume de disparos.</p>
                    </div>
                    <div className="lp-audience-card is-for" style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 48, fontWeight: 900, color: '#acf800', marginBottom: 16 }}>2</div>
                        <h3>Envie seus materiais</h3>
                        <p style={{ opacity: 0.8 }}>Templates, lista de contatos e configuração da campanha.</p>
                    </div>
                    <div className="lp-audience-card is-for" style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 48, fontWeight: 900, color: '#acf800', marginBottom: 16 }}>3</div>
                        <h3>Aprovação em 48h</h3>
                        <p style={{ opacity: 0.8 }}>Nossa equipe revisa e aprova seus materiais para disparo.</p>
                    </div>
                    <div className="lp-audience-card is-for" style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ fontSize: 48, fontWeight: 900, color: '#acf800', marginBottom: 16 }}>4</div>
                        <h3>Resultados em tempo real</h3>
                        <p style={{ opacity: 0.8 }}>Acompanhe métricas de entrega e conversão direto do dashboard.</p>
                    </div>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Pronto para escalar?</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Milhares de empresas já disparam com a Plug & Sales.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        ATIVAR AGORA 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Gostaria de saber mais sobre o disparo em massa." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
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

export default DisparoMassaPage;
