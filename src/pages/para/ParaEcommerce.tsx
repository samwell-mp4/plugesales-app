import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { ShoppingCart, TrendingUp, MessageCircle, RefreshCw, Check, Zap, BarChart3, Users, ArrowRight } from 'lucide-react';
import '../LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Para E-commerce", "item": "https://plugesales.com/para/ecommerce" },
        { "@type": "ListItem", "position": 3, "name": "Disparo em Massa WhatsApp para E-commerce", "item": "https://plugesales.com/para/ecommerce" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Como usar WhatsApp para recuperar carrinho abandonado?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Com a API Oficial, você cria um template com imagem do produto + link direto para o checkout. A taxa de conversão chega a 15%, contra 3-5% do e-mail."
            }
        },
        {
            "@type": "Question",
            "name": "Posso enviar ofertas personalizadas por WhatsApp?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim. A API Oficial suporta variáveis dinâmicas como nome, produto, valor e cidade. Cada cliente recebe uma mensagem única com dados do seu próprio carrinho."
            }
        },
        {
            "@type": "Question",
            "name": "Qual a taxa de abertura de mensagens no WhatsApp?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "O WhatsApp tem taxa de abertura de 98%, contra 20% do e-mail marketing. Mensagens são lidas em até 3 minutos em média."
            }
        },
        {
            "@type": "Question",
            "name": "Preciso de integração técnica com minha loja?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Não. Você fornece a lista de contatos segmentada e os templates. Cuidamos de todo o disparo via API Oficial. Integração via API disponível para lojas com desenvolvimento próprio."
            }
        }
    ]
};

const ParaEcommerce = () => {
    const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
    const containerStyle = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

    return (
        <div className="public-page-wrapper">
            <SEO
                title="Disparo em Massa WhatsApp para E-commerce | API Oficial | Plug & Sales"
                description="Aumente suas vendas com disparo em massa no WhatsApp para e-commerce. Recupere carrinhos abandonados, envie ofertas personalizadas e automatize confirmações com API Oficial da Meta."
                canonical="https://plugesales.com/para/ecommerce"
                keywords="disparo whatsapp ecommerce, whatsapp para loja virtual, recuperação carrinho abandonado whatsapp, disparo em massa ecommerce"
                schema={[breadcrumbSchema, faqSchema]}
            />

            <section className="lp-section" style={{ padding: 'clamp(140px, 20vh, 220px) 8% 80px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <ShoppingCart size={14} /> PARA E-COMMERCE
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center' }}>
                        Disparo em Massa no WhatsApp <span className="text-gradient">para E-commerce</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 32px', textAlign: 'center' }}>
                        Transforme o WhatsApp no seu principal canal de vendas. Recupere carrinhos abandonados, dispare ofertas personalizadas e aumente o ticket médio com a API Oficial da Meta.
                    </p>
                    <div className="lp-cta-group" style={{ justifyContent: 'center' }}>
                        <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
                            QUERO PARA MEU E-COMMERCE 👉
                        </Link>
                    </div>
                </div>
            </section>

            <section id="sec-1" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 1</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Por que WhatsApp para E-commerce?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O WhatsApp é o canal de comunicação mais usado do Brasil — presente em <strong style={{ color: '#fff' }}>99% dos smartphones</strong> do país. Com taxa de abertura de <strong style={{ color: '#acf800' }}>98%</strong>, suas mensagens são lidas em minutos, não em horas ou dias como o e-mail.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Para e-commerces, isso significa: recuperação de carrinho abandonado com até <strong style={{ color: '#acf800' }}>15% de conversão</strong>, confirmações de pedido com atualizações em tempo real, e ofertas personalizadas que geram clique imediato.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 32 }}>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>98%</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Taxa de abertura</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>15%</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Conversão carrinho</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>3min</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Tempo médio de leitura</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>5x</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Mais conversão que e-mail</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="sec-2" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 2</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Recuperação de Carrinho Abandonado</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Sabia que <strong style={{ color: '#fff' }}>70% dos carrinhos de e-commerce são abandonados</strong> antes da compra? Isso representa milhares de reais em vendas perdidas todos os meses. Com o disparo em massa via WhatsApp, você recupera até 15% dessas vendas automaticamente.
                    </p>
                    <div style={{ display: 'grid', gap: 16 }}>
                        {[
                            { step: '1', title: 'Cliente abandona o carrinho', desc: 'O cliente adiciona produtos mas não finaliza a compra. Disparamos uma mensagem em até 1 hora.' },
                            { step: '2', title: 'Mensagem personalizada', desc: 'Template com imagem do produto, valor e link direto para o checkout. Cliente clica e finaliza em segundos.' },
                            { step: '3', title: 'Acompanhamento em tempo real', desc: 'Relatórios mostram quantos clicaram, quantos compraram e o ticket médio recuperado.' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 20, padding: 20, borderRadius: 16, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#acf800', minWidth: 50, lineHeight: 1 }}>{item.step}</div>
                                <div>
                                    <h3 style={{ color: '#fff', marginBottom: 4 }}>{item.title}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', margin: 0 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="sec-3" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 3</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Fluxos de Venda para E-commerce</h2>
                    <div style={{ display: 'grid', gap: 20 }}>
                        {[
                            { icon: '🛒', title: 'Confirmação de Pedido', desc: 'Envie automaticamente resumo do pedido, valor total e prazo de entrega via template oficial.' },
                            { icon: '📦', title: 'Atualização de Frete', desc: 'Notifique o cliente quando o pedido for despachado com código de rastreio e link de acompanhamento.' },
                            { icon: '⭐', title: 'Follow-up Pós-Compra', desc: 'Peça avaliação do produto dias após a entrega. Clientes satisfeitos geram prova social.' },
                            { icon: '🔥', title: 'Ofertas Segmentadas', desc: 'Dispare promoções baseadas no histórico de compras. Clientes recorrentes compram 3x mais.' },
                            { icon: '📅', title: 'Lembrete de Reposição', desc: 'Para produtos consumíveis, lembre o cliente na hora certa de recomprar. Automatizado e personalizado.' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 16, padding: 20, borderRadius: 12, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(172,248,0,0.06)' }}>
                                <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
                                <div>
                                    <h3 style={{ color: '#fff', marginBottom: 4, fontSize: '1.1rem' }}>{item.title}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', margin: 0 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="sec-4" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 4</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Vantagens da API Oficial para E-commerces</h2>
                    <div style={{ display: 'grid', gap: 16 }}>
                        {[
                            { title: 'Templates com botão de link', desc: 'Envie mensagens com call-to-action direto para o checkout. Cliente compra em 1 clique.' },
                            { title: 'Personalização por cliente', desc: 'Nome, produto, valor — cada mensagem é única. Taxa de conversão muito maior que mensagens genéricas.' },
                            { title: 'Relatórios detalhados', desc: 'Saiba exatamente quantos abriram, clicaram e compraram. Otimize suas campanhas com dados reais.' },
                            { title: 'Sem risco de bloqueio', desc: 'API Oficial homologada pela Meta. Sua operação de vendas não corre risco de parar.' },
                            { title: 'Escala sob demanda', desc: 'De 1.000 a 100.000+ mensagens por dia. Cresça sem se preocupar com infraestrutura.' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12 }}>
                                <Check size={18} color="#acf800" style={{ flexShrink: 0, marginTop: 3 }} />
                                <div>
                                    <strong style={{ color: '#fff' }}>{item.title}</strong>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: '4px 0 0' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="lp-section" style={{ background: 'rgba(172,248,0,0.03)', borderTop: '1px solid rgba(172,248,0,0.08)', borderBottom: '1px solid rgba(172,248,0,0.08)' }}>
                <div style={containerStyle}>
                    <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: 24, color: '#acf800' }}>📊 ROI Real</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
                        E-commerces que usam disparo em massa no WhatsApp via API Oficial reportam <strong style={{ color: '#fff' }}>ROI médio de 5x a 12x</strong> no primeiro mês. Com PC-10 Foundation Card (R$ 97), você recupera o investimento recuperando apenas <strong style={{ color: '#acf800' }}>2 carrinhos abandonados</strong> de ticket médio R$ 50.
                    </p>
                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                        <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
                            COMEÇAR AGORA 👉
                        </Link>
                    </div>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Transforme seu WhatsApp em máquina de vendas</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Milhares de e-commerces já recuperam vendas com a Plug & Sales.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        ATIVAR AGORA 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero saber mais sobre disparo em massa para e-commerce." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={28} />
                <span className="wa-tooltip">Fale conosco</span>
            </a>

            <style>{`
                html { scroll-behavior: smooth; }
                @media (max-width: 768px) {
                    [style*="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))"] { grid-template-columns: 1fr 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default ParaEcommerce;
