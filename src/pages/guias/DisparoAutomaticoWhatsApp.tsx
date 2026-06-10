import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, MessageCircle, Zap, ShieldCheck, Clock, Bot, Settings, TrendingUp } from 'lucide-react';
import '../LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Guia", "item": "https://plugesales.com/guia/disparo-automatico-whatsapp" },
        { "@type": "ListItem", "position": 3, "name": "Disparo Automático WhatsApp", "item": "https://plugesales.com/guia/disparo-automatico-whatsapp" }
    ]
};

const DisparoAutomaticoWhatsApp = () => {
    const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
    const containerStyle = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

    return (
        <div className="public-page-wrapper">
            <SEO
                title="Disparo Automático no WhatsApp: Como Automatizar Mensagens em Massa | Plug & Sales"
                description="Guia completo sobre disparo automático no WhatsApp. Aprenda como automatizar o envio de mensagens em massa com segurança usando a API Oficial da Meta."
                canonical="https://plugesales.com/guia/disparo-automatico-whatsapp"
                schema={[breadcrumbSchema]}
                keywords="disparo automatico whatsapp, automatizar mensagens whatsapp, envio automatico whatsapp, disparo automático whatsapp"
            />

            <div className="lp-section" style={{ padding: 'clamp(120px, 18vh, 180px) 8% 60px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <Bot size={14} /> GUIA COMPLETO
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Disparo Automático no <span className="text-gradient">WhatsApp</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 24px', textAlign: 'center', fontSize: '1.1rem' }}>
                        Automatize o envio de mensagens em massa no WhatsApp sem risco de bloqueio. Guia completo sobre ferramentas, configuração e melhores práticas.
                    </p>
                </div>
            </div>

            <section style={{ background: 'rgba(172,248,0,0.03)', padding: '40px 0', borderTop: '1px solid rgba(172,248,0,0.08)', borderBottom: '1px solid rgba(172,248,0,0.08)' }}>
                <div style={containerStyle}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: 20, color: '#acf800' }}>📑 Neste guia você vai ver:</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {['O que é disparo automático', 'API Oficial vs Automação Web', 'Como configurar o disparo automático', 'Fluxos automatizados que vendem', 'Disparo automático vs Chatbot', 'Melhores práticas e segurança', 'FAQ completo'].map((item, i) => (
                            <a key={i} href={`#sec-${i + 1}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', padding: '8px 12px', borderRadius: 8, transition: '0.3s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.05)'; e.currentTarget.style.color = '#fff' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
                                <ChevronRight size={14} color="#acf800" /> {item}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section id="sec-1" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 1</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>O que é Disparo Automático no WhatsApp?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Disparo automático no WhatsApp é o envio programado de mensagens sem intervenção manual. Você configura regras (gatilhos) e o sistema dispara automaticamente quando elas são atendidas.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Exemplos de disparo automático:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                        {['Lead preenche formulário → disparo automático de boas-vindas', 'Carrinho abandonado → oferta automática 1h depois', 'Cliente completa 30 dias sem comprar → oferta de reengajamento', 'Aniversário do lead → mensagem automática com desconto', 'Boleto vence amanhã → lembrete automático'].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', color: 'rgba(255,255,255,0.7)' }}>
                                <Zap size={14} color="#acf800" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section id="sec-2" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 2</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>API Oficial vs Automação Web: O Abismo</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Existem dois tipos de disparo automático no WhatsApp. Um é seguro e profissional. O outro é uma bomba-relógio:
                    </p>
                    <div style={{ display: 'grid', gap: 20, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(34,197,94,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(34,197,94,0.15)' }}>
                            <h3 style={{ color: '#22c55e', marginBottom: 12 }}>✅ API Oficial da Meta (WABA)</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>Automática, segura e homologada. Envia milhares de mensagens por dia sem risco. Templates multimídia, botões e relatórios.</p>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(239,68,68,0.15)' }}>
                            <h3 style={{ color: '#ef4444', marginBottom: 12 }}>❌ Automação Web (QR Code)</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>Ferramentas que automatizam o WhatsApp Web. Violam os Termos de Serviço. O bloqueio do número é inevitável.</p>
                        </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        A <Link to="/" style={{ color: '#acf800' }}>Plug & Sales</Link> oferece disparo automático via API Oficial, com segurança total. <Link to="/servicos/disparo-em-massa-whatsapp" style={{ color: '#acf800' }}>Saiba mais →</Link>
                    </p>
                </div>
            </section>

            <section id="sec-3" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 3</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Como Configurar o Disparo Automático</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Configurar o disparo automático com a API Oficial é simples:
                    </p>
                    <ol style={{ paddingLeft: 20, marginBottom: 24 }}>
                        <li style={{ padding: '8px 0', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}><strong style={{ color: '#fff' }}>Escolha o gatilho:</strong> Formulário, carrinho abandonado, data, etc.</li>
                        <li style={{ padding: '8px 0', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}><strong style={{ color: '#fff' }}>Crie o template:</strong> Mensagem personalizada com variáveis dinâmicas.</li>
                        <li style={{ padding: '8px 0', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}><strong style={{ color: '#fff' }}>Defina a regra de disparo:</strong> Imediato, após X horas, dia específico.</li>
                        <li style={{ padding: '8px 0', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}><strong style={{ color: '#fff' }}>Ative e monitore:</strong> Acompanhe métricas em tempo real.</li>
                    </ol>
                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                        <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
                            CONFIGURAR DISPARO AUTOMÁTICO 👉
                        </Link>
                    </div>
                </div>
            </section>

            <section id="sec-4" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 4</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Fluxos Automatizados que Vendem</h2>
                    <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                        {[
                            { icon: '📝', title: 'Boas-vindas automáticas', desc: 'Lead chega → mensagem automática em segundos. 5x mais conversão que atendimento tardio.' },
                            { icon: '🛒', title: 'Recuperação de carrinho', desc: 'Lead abandona → oferta automática 1h depois. Até 15% de recuperação.' },
                            { icon: '🎂', title: 'Aniversário', desc: 'Parabéns + oferta especial. Clientes amam e compram mais.' },
                            { icon: '📅', title: 'Follow-up programado', desc: 'Lead não respondeu em 3 dias → nova mensagem automática.' },
                            { icon: '💰', title: 'Reengajamento', desc: 'Cliente não compra há 30 dias → oferta exclusiva automática.' },
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

            <section id="sec-5" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 5</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Disparo Automático vs Chatbot</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Disparo automático e chatbot são ferramentas complementares, não concorrentes:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 16, padding: 24, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <h3 style={{ color: '#acf800', marginBottom: 12 }}>📤 Disparo Automático</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Envia mensagens programadas para sua base. Ideal para campanhas, ofertas e lembretes. <strong>Comunicação one-to-many.</strong></p>
                        </div>
                        <div style={{ background: 'rgba(59,130,246,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(59,130,246,0.15)' }}>
                            <h3 style={{ color: '#3b82f6', marginBottom: 12 }}>🤖 Chatbot</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Responde automaticamente às mensagens dos leads. Ideal para atendimento e qualificação. <strong>Comunicação one-to-one.</strong></p>
                        </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        Use os dois juntos: disparo automático para campanhas + chatbot para atendimento. <Link to="/servicos/chatbot-whatsapp" style={{ color: '#acf800' }}>Saiba mais sobre chatbot →</Link>
                    </p>
                </div>
            </section>

            <section id="sec-6" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 6</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Melhores Práticas e Segurança</h2>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                        {[
                            { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Sempre use a API Oficial', desc: 'Disparo automático só é seguro via WABA. Automação Web é risco de bloqueio.' },
                            { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Respeite a frequência', desc: 'No máximo 1-2 mensagens automáticas por lead por semana.' },
                            { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Inclua opt-out', desc: 'Toda mensagem automática deve ter opção de descadastro.' },
                            { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Monitore as métricas', desc: 'Acompanhe taxa de denúncia, abertura e clique para ajustar.' },
                            { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Personalize sempre', desc: 'Mensagem automática com nome e dados do lead converte 5x mais.' },
                        ].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                                <div>
                                    <strong style={{ color: '#fff' }}>{item.title}</strong>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: '4px 0 0' }}>{item.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Automatize suas vendas agora</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Disparo automático seguro via API Oficial.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        COMEÇAR AGORA 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero configurar disparo automático no WhatsApp." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={28} />
                <span className="wa-tooltip">Fale conosco</span>
            </a>

            <style>{`
                html { scroll-behavior: smooth; }
                @media (max-width: 768px) {
                    [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default DisparoAutomaticoWhatsApp;
