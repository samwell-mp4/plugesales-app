import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Check, Minus, Plus, MessageCircle, ShieldCheck, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import './LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Preços", "item": "https://plugesales.com/precos" },
        { "@type": "ListItem", "position": 3, "name": "Planos de Disparo em Massa WhatsApp", "item": "https://plugesales.com/precos" }
    ]
};

const PrecosPage = () => {
    const [cards, setCards] = useState<any[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const { data, error } = await supabase
                    .from('plug_cards')
                    .select('*')
                    .neq('is_active', false)
                    .order('price', { ascending: true });
                if (!error && data) {
                    setCards(data);
                    const initialQts: Record<number, number> = {};
                    data.forEach((c: any) => initialQts[c.id] = 1);
                    setQuantities(initialQts);
                }
            } catch (err) {
                console.error("Error fetching plug cards:", err);
            }
        };
        fetchCards();
    }, []);

    const handleQtyChange = (id: number, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + delta)
        }));
    };

    const handleWhatsAppRedirect = (card: any) => {
        const qty = quantities[card.id] || 1;
        const message = `Olá, tenho interesse no card *${card.name}* (${card.total_volume} disparos). Quantidade: ${qty}.`;
        window.open(`https://wa.me/5531983994058?text=${encodeURIComponent(message)}`, '_blank');
    };

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Plug Cards — Planos de Disparo em Massa WhatsApp",
        "description": "Planos pré-pagos de disparo em massa no WhatsApp via API Oficial da Meta. De 10 mil a 500 mil disparos por card.",
        "brand": { "@type": "Brand", "name": "Plug & Sales" },
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "BRL",
            "lowPrice": 97,
            "highPrice": 3497,
            "offerCount": cards.length > 0 ? cards.length.toString() : "5",
            "availability": "https://schema.org/InStock",
            "url": "https://plugesales.com/precos"
        }
    };

    return (
        <div className="public-page-wrapper">
            <SEO
                title="Preços — Planos de Disparo em Massa WhatsApp | Plug & Sales"
                description="Compare todos os planos de disparo em massa no WhatsApp. De 10 mil a 500 mil disparos por card. Pré-pago, sem surpresas, API Oficial da Meta."
                canonical="https://plugesales.com/precos"
                keywords="plano disparo whatsapp, plug cards, planos de disparo em massa whatsapp, cards de disparo whatsapp"
                schema={[breadcrumbSchema, productSchema]}
            />

            <section className="lp-section" style={{ padding: 'clamp(140px, 20vh, 220px) 8% 80px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <Zap size={14} /> PLANOS
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center' }}>
                        Planos de Disparo em Massa <span className="text-gradient">WhatsApp</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 32px', textAlign: 'center' }}>
                        Escolha o Plug Card ideal para seu volume. Pré-pago, sem taxa de setup, sem surpresas. Consulte valores pelo WhatsApp.
                    </p>
                </div>
            </section>

            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">COMPARATIVO</span>
                    <h2 className="lp-section-title">Comparação de Planos</h2>
                    <p style={{ marginTop: 16, opacity: 0.7 }}>Todos os planos incluem API Oficial da Meta, templates multimídia e suporte. Consulte valores pelo WhatsApp.</p>
                </div>

                <div className="container" style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(172,248,0,0.3)' }}>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', color: '#acf800' }}>Card</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'center', color: '#acf800' }}>Disparos</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'center', color: '#acf800' }}>Tier</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cards.filter(c => c.name !== 'PC-500 Apex Card').map((card, i) => (
                                    <tr key={card.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(172,248,0,0.02)' : 'transparent' }}>
                                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#fff' }}>{card.name}</td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 800, color: '#acf800' }}>{card.total_volume?.toLocaleString('pt-BR')}</td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>{card.tier?.toUpperCase()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="lp-section lp-alt-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">PLUG CARDS</span>
                    <h2 className="lp-section-title">Escolha seu Card</h2>
                </div>

                <div className="container" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {cards.filter(c => c.name !== 'PC-500 Apex Card').map(card => {
                        let featuresArr: string[] = [];
                        if (card.features) {
                            if (Array.isArray(card.features?.resources)) featuresArr = card.features.resources;
                            else if (typeof card.features === 'string') {
                                try { featuresArr = JSON.parse(card.features).resources || []; } catch(e) {}
                            }
                        }

                        return (
                            <div key={card.id} style={{
                                flex: '1 1 280px', maxWidth: 320, background: 'rgba(172,248,0,0.03)',
                                border: '1px solid rgba(172,248,0,0.12)', borderRadius: 20, padding: 32,
                                display: 'flex', flexDirection: 'column'
                            }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#acf800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                                    {card.tier?.toUpperCase()}
                                </div>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: 4, color: '#fff' }}>{card.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>{card.copy}</p>

                                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#acf800', marginBottom: 20 }}>
                                    {card.total_volume?.toLocaleString('pt-BR')} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>disparos</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, flex: 1 }}>
                                    {featuresArr.map((f: string, i: number) => (
                                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                                            <Check size={16} color="#acf800" style={{ flexShrink: 0 }} /> {f}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '4px 8px' }}>
                                        <button onClick={() => handleQtyChange(card.id, -1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}><Minus size={14} /></button>
                                        <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{quantities[card.id] || 1}</span>
                                        <button onClick={() => handleQtyChange(card.id, 1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}><Plus size={14} /></button>
                                    </div>
                                    <button onClick={() => handleWhatsAppRedirect(card)} style={{
                                        flex: 1, background: '#acf800', color: '#000', border: 'none', borderRadius: 10,
                                        padding: '12px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                    }}>
                                        <MessageCircle size={16} /> SOLICITAR
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {cards.find(c => c.name === 'PC-500 Apex Card') && (() => {
                    const apex = cards.find(c => c.name === 'PC-500 Apex Card');
                    let apexFeatures: string[] = [];
                    if (apex.features) {
                        if (Array.isArray(apex.features?.resources)) apexFeatures = apex.features.resources;
                        else if (typeof apex.features === 'string') {
                            try { apexFeatures = JSON.parse(apex.features).resources || []; } catch(e) {}
                        }
                    }
                    return (
                        <div style={{ maxWidth: 600, margin: '40px auto 0', background: 'linear-gradient(135deg, rgba(172,248,0,0.1), rgba(172,248,0,0.02))', border: '2px solid rgba(172,248,0,0.3)', borderRadius: 24, padding: 40, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#acf800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>MAIOR VOLUME</div>
                            <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: 8 }}>{apex.name}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>{apex.copy}</p>
                            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#acf800', marginBottom: 20 }}>{apex.total_volume?.toLocaleString('pt-BR')} <span style={{ fontSize: '1.2rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>disparos</span></div>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                                {apexFeatures.map((f: string, i: number) => (
                                    <span key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(172,248,0,0.05)', padding: '6px 12px', borderRadius: 8 }}>
                                        <Check size={14} color="#acf800" /> {f}
                                    </span>
                                ))}
                            </div>
                            <button onClick={() => handleWhatsAppRedirect(apex)} style={{
                                background: '#acf800', color: '#000', border: 'none', borderRadius: 12,
                                padding: '16px 40px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 8
                            }}>
                                <MessageCircle size={18} /> SOLICITAR ORÇAMENTO
                            </button>
                        </div>
                    );
                })()}
            </section>

            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">POR QUE ESCOLHER</span>
                    <h2 className="lp-section-title">Vantagens dos Plug Cards</h2>
                </div>
                <div className="sp-authority-grid container">
                    <div className="sp-auth-item">
                        <ShieldCheck color="#acf800" size={32} />
                        <div>
                            <h4>Sem risco de bloqueio</h4>
                            <p>API Oficial da Meta com estrutura própria. Zero banimento.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <Zap color="#acf800" size={32} />
                        <div>
                            <h4>Ativação em 24h</h4>
                            <p>Sem aquecimento, sem BM, sem burocracia.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <TrendingUp color="#acf800" size={32} />
                        <div>
                            <h4>Pré-pago, sem surpresas</h4>
                            <p>Você escolhe o card, paga e dispara. Sem taxas escondidas.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Ainda com dúvidas?</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Fale conosco no WhatsApp e descubra o melhor plano para seu negócio.</p>
                    <a href="https://wa.me/5531983994058?text=Olá! Quero saber os valores dos planos de disparo em massa." target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                        <MessageCircle size={20} /> CONSULTAR VALORES
                    </a>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Tenho interesse nos Plug Cards." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={28} />
                <span className="wa-tooltip">Fale conosco</span>
            </a>
        </div>
    );
};

export default PrecosPage;
