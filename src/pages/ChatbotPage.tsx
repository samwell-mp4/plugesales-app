import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { Bot, MessageCircle, Zap, Check, Users, BarChart3 } from 'lucide-react';
import './LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Chatbot WhatsApp", "item": "https://plugesales.com/servicos/chatbot-whatsapp" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Como funciona o chatbot da Plug & Sales?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Utilizamos inteligência artificial para criar fluxos de conversa automatizados que qualificam leads, respondem perguntas frequentes e agendam vendas 24/7."
            }
        },
        {
            "@type": "Question",
            "name": "O chatbot pode ser personalizado?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim. Criamos fluxos personalizados com a identidade visual e tom de voz da sua marca, com respostas inteligentes baseadas no seu produto ou serviço."
            }
        }
    ]
};

const ChatbotPage = () => {
    return (
        <div>
            <SEO
                title="Chatbot Inteligente para WhatsApp | Automação de Vendas | Plug & Sales"
                description="Chatbot inteligente para WhatsApp com IA. Automatize atendimento, qualifique leads e aumente vendas 24h por dia. Integração com API Oficial da Meta."
                canonical="https://plugesales.com/servicos/chatbot-whatsapp"
                schema={[breadcrumbSchema, faqSchema]}
                keywords="chatbot whatsapp, bot whatsapp, atendimento automatizado whatsapp, ia vendas whatsapp"
            />

            <section className="lp-section" style={{ padding: 'clamp(140px, 20vh, 220px) 8% 80px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <Bot size={14} /> AUTOMAÇÃO INTELIGENTE
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center' }}>
                        Chatbot Inteligente para <span className="text-gradient">WhatsApp</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 32px', textAlign: 'center' }}>
                        Automatize seu atendimento com IA. Fluxos inteligentes que qualificam leads, respondem dúvidas e fecham vendas enquanto você dorme.
                    </p>
                    <div className="lp-cta-group" style={{ justifyContent: 'center' }}>
                        <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
                            CRIAR MEU CHATBOT 👉
                        </Link>
                    </div>
                </div>
            </section>

            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">RECURSOS</span>
                    <h2 className="lp-section-title">O que nosso chatbot faz</h2>
                </div>
                <div className="sp-authority-grid container">
                    <div className="sp-auth-item">
                        <Bot color="#acf800" size={32} />
                        <div>
                            <h4>Respostas inteligentes</h4>
                            <p>IA treinada com seu produto/serviço para responder dúvidas com precisão e naturalidade.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <Users color="#acf800" size={32} />
                        <div>
                            <h4>Qualificação de leads</h4>
                            <p>Fluxos que identificam o perfil e intenção de compra de cada lead automaticamente.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <BarChart3 color="#acf800" size={32} />
                        <div>
                            <h4>Métricas completas</h4>
                            <p>Relatórios de conversão, tempo de resposta, leads qualificados e muito mais.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <Zap color="#acf800" size={32} />
                        <div>
                            <h4>Ativo 24/7</h4>
                            <p>Funciona 24 horas por dia, 7 dias por semana. Nunca perca um lead por falta de atendimento.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-section lp-alt-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">BENEFÍCIOS</span>
                    <h2 className="lp-section-title">Por que automatizar com a Plug & Sales</h2>
                </div>
                <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 24px', background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.08)' }}>
                            <Check color="#acf800" size={20} style={{ marginTop: 2, flexShrink: 0 }} />
                            <div><strong style={{ color: '#fff' }}>Redução de custos:</strong> <span style={{ color: 'rgba(255,255,255,0.7)' }}>Diminua sua equipe de atendimento em até 70% com automação inteligente.</span></div>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 24px', background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.08)' }}>
                            <Check color="#acf800" size={20} style={{ marginTop: 2, flexShrink: 0 }} />
                            <div><strong style={{ color: '#fff' }}>Aumento de conversão:</strong> <span style={{ color: 'rgba(255,255,255,0.7)' }}>Leads respondidos em segundos convertem até 5x mais.</span></div>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 24px', background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.08)' }}>
                            <Check color="#acf800" size={20} style={{ marginTop: 2, flexShrink: 0 }} />
                            <div><strong style={{ color: '#fff' }}>Escalabilidade:</strong> <span style={{ color: 'rgba(255,255,255,0.7)' }}>Atenda milhares de leads simultaneamente sem filas ou tempo de espera.</span></div>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 24px', background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.08)' }}>
                            <Check color="#acf800" size={20} style={{ marginTop: 2, flexShrink: 0 }} />
                            <div><strong style={{ color: '#fff' }}>Learning contínuo:</strong> <span style={{ color: 'rgba(255,255,255,0.7)' }}>Nosso chatbot aprende e melhora com cada interação ao longo do tempo.</span></div>
                        </li>
                    </ul>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Automatize suas vendas agora</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Enquanto você lê isso, leads estão esperando resposta.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        CRIAR MEU CHATBOT 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero saber mais sobre o chatbot para WhatsApp." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={28} />
                <span className="wa-tooltip">Fale conosco</span>
            </a>
        </div>
    );
};

export default ChatbotPage;
