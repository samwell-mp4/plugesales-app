import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { Check, X, ShieldCheck, AlertTriangle, MessageCircle, Zap } from 'lucide-react';
import '../LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Comparação", "item": "https://plugesales.com/comparacao/api-oficial-vs-disparador-web" },
        { "@type": "ListItem", "position": 3, "name": "API Oficial vs Disparador Web", "item": "https://plugesales.com/comparacao/api-oficial-vs-disparador-web" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Qual a diferença entre API Oficial e disparador web?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A API Oficial (WABA) é homologada pela Meta, sem risco de bloqueio, com suporte a templates multimídia e botões. Disparadores web automatizam o WhatsApp Web, violam os Termos de Serviço e resultam em banimento permanente."
            }
        },
        {
            "@type": "Question",
            "name": "Disparador web pode bloquear meu número?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim. Disparadores web violam os Termos de Serviço da Meta. O bloqueio é questão de tempo — pode levar dias ou meses, mas ocorre quando a Meta detecta o comportamento automatizado."
            }
        },
        {
            "@type": "Question",
            "name": "Qual a capacidade de envio da API Oficial?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A API Oficial escala de 1.000 a 100.000+ conversas/dia conforme o Tier de reputação. Com a Plug & Sales, você começa em tiers elevados, sem aquecimento."
            }
        }
    ]
};

const comparisonData = [
    { feature: 'Homologação Meta', official: true, unofficial: false },
    { feature: 'Risco de bloqueio', official: false, unofficial: true },
    { feature: 'Templates com botões', official: true, unofficial: false },
    { feature: 'Imagem, vídeo e áudio', official: true, unofficial: false },
    { feature: 'Limite de envio diário', official: 'Ilimitado (escalável)', unofficial: '100-500 mensagens' },
    { feature: 'Número verificado (Check verde)', official: true, unofficial: false },
    { feature: 'Relatórios detalhados', official: true, unofficial: false },
    { feature: 'Conformidade LGPD', official: true, unofficial: false },
    { feature: 'Suporte técnico', official: 'Dedicado 24h', unofficial: 'Limitado' },
    { feature: 'Custo por mensagem', official: '~R$ 0,007', unofficial: 'Incluso na mensalidade' },
];

const ComparacaoApiOficialVsDisparadorWeb = () => {
    return (
        <div className="public-page-wrapper">
            <SEO
                title="API Oficial vs Disparador Web — Comparação Completa | Plug & Sales"
                description="Comparação definitiva entre API Oficial do WhatsApp (WABA) e disparadores web não-oficiais. Entenda riscos, limites e custos de cada abordagem."
                canonical="https://plugesales.com/comparacao/api-oficial-vs-disparador-web"
                keywords="api oficial vs disparador web, comparativo api whatsapp, waba vs disparador, diferença api oficial e disparador"
                schema={[breadcrumbSchema, faqSchema]}
            />

            <section className="lp-section" style={{ padding: 'clamp(140px, 20vh, 220px) 8% 80px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <Zap size={14} /> COMPARAÇÃO DEFINITIVA
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center' }}>
                        API Oficial vs <span className="text-gradient">Disparador Web</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 32px', textAlign: 'center' }}>
                        Nem toda ferramenta de disparo em massa é igual. Compare lado a lado a API Oficial da Meta com soluções não-oficiais e entenda por que a escolha certa define o futuro da sua operação.
                    </p>
                </div>
            </section>

            <section className="lp-section" style={{ paddingTop: 0 }}>
                <div className="lp-section-header">
                    <span className="lp-section-tag">COMPARATIVO</span>
                    <h2 className="lp-section-title">Lado a Lado</h2>
                </div>
                <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                        gap: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.03)', fontWeight: 800, color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid rgba(172,248,0,0.3)' }}>
                            Característica
                        </div>
                        <div style={{ padding: '20px 24px', textAlign: 'center', background: 'rgba(34,197,94,0.05)', fontWeight: 800, color: '#22c55e', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid rgba(34,197,94,0.3)' }}>
                            API Oficial
                        </div>
                        <div style={{ padding: '20px 24px', textAlign: 'center', background: 'rgba(239,68,68,0.05)', fontWeight: 800, color: '#ef4444', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid rgba(239,68,68,0.3)' }}>
                            Disparador Web
                        </div>

                        {comparisonData.map((row, i) => (
                            <>
                                <div key={`f-${i}`} style={{
                                    padding: '18px 24px', borderBottom: i < comparisonData.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', fontWeight: 600, color: '#fff'
                                }}>
                                    {row.feature}
                                </div>
                                <div key={`o-${i}`} style={{
                                    padding: '18px 24px', textAlign: 'center', borderBottom: i < comparisonData.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    background: i % 2 === 0 ? 'rgba(34,197,94,0.02)' : 'transparent'
                                }}>
                                    {typeof row.official === 'boolean' ? (
                                        row.official ? <Check size={20} color="#22c55e" style={{ margin: '0 auto' }} /> : <X size={20} color="#ef4444" style={{ margin: '0 auto' }} />
                                    ) : (
                                        <span style={{ fontSize: '0.9rem', color: '#22c55e' }}>{row.official}</span>
                                    )}
                                </div>
                                <div key={`u-${i}`} style={{
                                    padding: '18px 24px', textAlign: 'center', borderBottom: i < comparisonData.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    background: i % 2 === 0 ? 'rgba(239,68,68,0.02)' : 'transparent'
                                }}>
                                    {typeof row.unofficial === 'boolean' ? (
                                        row.unofficial ? <Check size={20} color="#22c55e" style={{ margin: '0 auto' }} /> : <X size={20} color="#ef4444" style={{ margin: '0 auto' }} />
                                    ) : (
                                        <span style={{ fontSize: '0.9rem', color: '#ef4444' }}>{row.unofficial}</span>
                                    )}
                                </div>
                            </>
                        ))}
                    </div>
                </div>
            </section>

            <section className="lp-section lp-alt-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">ANÁLISE</span>
                    <h2 className="lp-section-title">Por que a API Oficial é a única escolha segura</h2>
                </div>
                <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
                        A diferença fundamental entre API Oficial e disparador web não é de funcionalidade — é de <strong style={{ color: '#fff' }}>legalidade e sustentabilidade</strong>. Enquanto a API Oficial opera dentro dos Termos de Serviço da Meta, disparadores web automatizam o WhatsApp Web, uma violação clara que resulta em bloqueio.
                    </p>

                    <div style={{ display: 'grid', gap: 20, marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 16, padding: 20, borderRadius: 16, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                            <ShieldCheck color="#22c55e" size={24} style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <h4 style={{ color: '#22c55e', marginBottom: 6 }}>API Oficial (WABA) — Recomendado</h4>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', margin: 0 }}>
                                    Homologada pela Meta, sem risco de bloqueio, templates com botões e mídia, escala ilimitada, relatórios detalhados, conformidade LGPD. <strong>Única opção para empresas que levam a sério a comunicação digital.</strong>
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, padding: 20, borderRadius: 16, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <AlertTriangle color="#ef4444" size={24} style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <h4 style={{ color: '#ef4444', marginBottom: 6 }}>Disparador Web — Não Recomendado</h4>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', margin: 0 }}>
                                    Viola Termos de Serviço da Meta, alto risco de bloqueio permanente, limite restrito de 100-500 mensagens/dia, sem templates ou botões, sem garantia de entrega. <strong>Uma questão de tempo até o banimento.</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">CUSTOS</span>
                    <h2 className="lp-section-title">Comparação de Custos</h2>
                </div>
                <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(172,248,0,0.3)' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#acf800' }}>Modelo</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>Investimento</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>Custo por 10k msg</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>Risco</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>Plug & Sales (API Oficial)</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>R$ 97</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>R$ 97</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>Nenhum</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>BSP Tradicional (API Oficial)</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>R$ 200-800/mês + R$ 0,18/msg</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#ef4444' }}>R$ 2.000-4.600</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>Nenhum</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>Disparador Web (Não-Oficial)</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>R$ 97-497/mês</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>Grátis (na mensalidade)</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#ef4444' }}>⚠️ Banimento</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Não arrisque seu negócio</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Escolha a API Oficial com quem entende do assunto. Sua estrutura em 24h.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        ATIVAR API OFICIAL 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero entender melhor a diferença entre API Oficial e disparador web." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={28} />
                <span className="wa-tooltip">Fale conosco</span>
            </a>
        </div>
    );
};

export default ComparacaoApiOficialVsDisparadorWeb;
