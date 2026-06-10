import { useState } from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, Zap } from 'lucide-react';
import './LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Busca", "item": "https://plugesales.com/busca" }
    ]
};

const searchItems = [
    { title: 'Disparo em Massa no WhatsApp', desc: 'Serviço de envio em larga escala via API Oficial da Meta.', url: '/servicos/disparo-em-massa-whatsapp' },
    { title: 'API Oficial do WhatsApp (WABA)', desc: 'Solução completa da WhatsApp Business API para empresas.', url: '/servicos/api-oficial-whatsapp' },
    { title: 'Chatbot Inteligente para WhatsApp', desc: 'Automatize atendimento e vendas com IA.', url: '/servicos/chatbot-whatsapp' },
    { title: 'Preços — Plug Cards', desc: 'Compare todos os planos de disparo em massa.', url: '/precos' },
    { title: 'Guia Completo de Disparo em Massa', desc: 'Aprenda tudo sobre disparo em massa no WhatsApp.', url: '/guia/disparo-em-massa-whatsapp' },
    { title: 'API Oficial vs Disparador Web', desc: 'Comparação completa entre as duas abordagens.', url: '/comparacao/api-oficial-vs-disparador-web' },
    { title: 'Disparo em Massa para E-commerce', desc: 'Aumente vendas da sua loja virtual com WhatsApp.', url: '/para/ecommerce' },
    { title: 'Sobre a Plug & Sales', desc: 'Conheça nossa história e infraestrutura.', url: '/sobre' },
];

const BuscaPage = () => {
    const [query, setQuery] = useState('');

    const filtered = query.trim()
        ? searchItems.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.desc.toLowerCase().includes(query.toLowerCase())
        )
        : [];

    return (
        <div className="public-page-wrapper">
            <SEO
                title="Busca — Plug & Sales | Disparo em Massa WhatsApp"
                description="Encontre informações sobre disparo em massa no WhatsApp, API Oficial da Meta, Plug Cards e muito mais."
                canonical="https://plugesales.com/busca"
                schema={[breadcrumbSchema]}
                keywords="busca plug sales, pesquisar disparo whatsapp, encontrar"
            />

            <section className="lp-section" style={{ padding: 'clamp(140px, 20vh, 220px) 8% 80px', textAlign: 'center' }}>
                <div style={{ maxWidth: 640, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <Search size={14} /> BUSCA
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                        O que você está <span className="text-gradient">buscando?</span>
                    </h1>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, maxWidth: 500, margin: '32px auto 0',
                        background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '4px 4px 4px 20px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Search size={20} color="rgba(255,255,255,0.4)" />
                        <input
                            type="text"
                            placeholder="Pesquisar…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                            style={{
                                flex: 1, background: 'transparent', border: 'none', color: '#fff',
                                fontSize: '1.1rem', padding: '16px 0', outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </section>

            <section className="lp-section" style={{ paddingTop: 0 }}>
                <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
                    {query.trim() && filtered.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: 40 }}>
                            Nenhum resultado encontrado para "{query}".
                        </p>
                    )}

                    {query.trim() && filtered.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {filtered.map((item, i) => (
                                <Link key={i} to={item.url} style={{
                                    display: 'block', padding: '20px 24px', borderRadius: 16,
                                    background: 'rgba(172,248,0,0.03)', border: '1px solid rgba(172,248,0,0.1)',
                                    textDecoration: 'none', transition: '0.3s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.08)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.03)' }}>
                                    <h3 style={{ color: '#fff', margin: '0 0 6px', fontSize: '1.1rem' }}>{item.title}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' }}>{item.desc}</p>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!query.trim() && (
                        <div>
                            <h3 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: 16, textAlign: 'center' }}>Páginas mais buscadas</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {searchItems.map((item, i) => (
                                    <Link key={i} to={item.url} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '16px 20px', borderRadius: 12,
                                        background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                                        textDecoration: 'none', transition: '0.3s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.06)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.02)' }}>
                                        <span style={{ color: '#fff', fontWeight: 500 }}>{item.title}</span>
                                        <span style={{ color: '#acf800', fontSize: '0.85rem' }}>→</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Preciso de ajuda." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={28} />
                <span className="wa-tooltip">Fale conosco</span>
            </a>
        </div>
    );
};

export default BuscaPage;
