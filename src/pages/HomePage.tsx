import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
    Zap,
    Plus,
    X,
    TrendingUp,
    ShieldCheck,
    Bot,
    BarChart3,
    Target,
    Layers,
    FileText,
    Image,
    Video,
    MousePointer2,
    Users,
    Check
} from 'lucide-react';
import './LandingPage.css';

const HomePage = () => {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const faqs = [
        {
            q: "Meu número pode ser bloqueado?",
            a: "Não. Os disparos são feitos através da nossa estrutura com números próprios, sob nossa responsabilidade."
        },
        {
            q: "Existe limite mínimo para o disparo em massa?",
            a: "Sim, o mínimo é de 10 mil contatos por disparo."
        },
        {
            q: "Como é realizada a cobrança?",
            a: "A cobrança é feita apenas por mensagem entregue, com uma pequena taxa que varia de acordo com o volume de leads."
        },
        {
            q: "Em quanto tempo as mensagens são entregues?",
            a: "As mensagens são disparadas em poucos minutos. Recomendamos aguardar até 1 hora para a consolidação total das entregas."
        },
        {
            q: "Vocês enviam relatório?",
            a: "Sim, fornecemos um relatório direto da plataforma com a quantidade exata de mensagens disparadas e entregues."
        },
        {
            q: "Preciso ter uma lista de contatos própria?",
            a: "Sim, é necessário possuir uma lista própria. Não fornecemos listas e não compartilhamos sua base com terceiros."
        }
    ];

    const schemas = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://plugesales.com.br",
            "name": "Plug & Sales",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://plugesales.com.br/?s={search_term}",
                "query-input": "required name=search_term"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f.a
                }
            }))
        }
    ];

    return (
        <div className="public-page-wrapper">
            <SEO 
                title="Plug & Sales | Infraestrutura Profissional para WhatsApp" 
                description="A estrutura invisível por trás das operações mais lucrativas do Brasil. Disparos em massa via API Oficial com escala real."
                schema={schemas}
            />

            {/* ── HERO ── */}
            <section className="lp-hero">
                <div className="lp-hero-bg-glow"></div>
                <div className="lp-hero-content">
                    <div className="lp-hero-tag animate-supreme-pulse">
                        <Zap size={14} /> PLUG & SALES
                    </div>
                    <h1 className="lp-hero-title">
                        A estrutura <span className="text-gradient">invisível</span> por trás das operações mais lucrativas do Brasil
                    </h1>
                    <p className="lp-hero-subtitle">
                        Pare de perder tempo com configurações, BM, aquecimento de chips ou risco de banimento. Nós já temos a estrutura pronta para você escalar agora.
                    </p>
                    <div className="lp-cta-group">
                        <Link
                            to="/lead-flow"
                            className="lp-btn lp-btn-primary ripple lp-btn-glow"
                        >
                            Quero Ativar Minha Estrutura Agora 👉
                        </Link>
                    </div>
                </div>

                <div className="lp-hero-mockup">
                    <img
                        src="https://iili.io/BRvLRPS.jpg"
                        alt="Dashboard Mockup"
                        className="lp-mockup-frame"
                    />
                    <div className="lp-floating-stat">
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#acf800', marginBottom: '8px' }}>ENTREGAS GARANTIDAS</div>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>100.000+</div>
                        <div style={{ fontSize: '9px', color: '#22c55e', marginTop: '4px' }}>por número/dia</div>
                    </div>
                </div>
            </section>

            {/* ── O QUE FAZEMOS ── */}
            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">NOSSA MISSÃO</span>
                    <h2 className="lp-section-title">O Que Fazemos</h2>
                    <p className="section-intro-text">
                        Somos especialistas em transformar bases de leads em lucro com disparos massivos via API Oficial do WhatsApp + estrutura de conversão automatizada.
                    </p>
                </div>

                <div className="sp-features-grid container">
                    <div className="sp-feature-card">
                        <div className="sp-feature-icon"><Zap /></div>
                        <h3>Integração Oficial</h3>
                        <p>Sua operação conectada diretamente à Meta, garantindo estabilidade e segurança total.</p>
                    </div>
                    <div className="sp-feature-card">
                        <div className="sp-feature-icon"><TrendingUp /></div>
                        <h3>Vendas em Escala</h3>
                        <p>Alcançamos milhares de contatos por dia com alta taxa de entrega e conversão.</p>
                    </div>
                    <div className="sp-feature-card">
                        <div className="sp-feature-icon"><BarChart3 /></div>
                        <h3>Relatório e Otimização</h3>
                        <p>Dados precisos de entrega e leitura para você ajustar sua estratégia em tempo real.</p>
                    </div>
                    <div className="sp-feature-card">
                        <div className="sp-feature-icon"><Layers /></div>
                        <h3>Envio Massivo</h3>
                        <p>Estrutura pronta para disparos de altíssimo volume sem gargalos técnicos.</p>
                    </div>
                    <div className="sp-feature-card">
                        <div className="sp-feature-icon"><Bot /></div>
                        <h3>Automação de Conversa</h3>
                        <p>Fluxos inteligentes que respondem e qualificam seus leads automaticamente.</p>
                    </div>
                </div>
            </section>

            {/* ── POR QUE NÓS ── */}
            <section className="lp-section lp-alt-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">DIFERENCIAIS</span>
                    <h2 className="lp-section-title">Por que somente nós fazemos isso</h2>
                </div>
                <div className="sp-authority-grid container">
                    <div className="sp-auth-item">
                        <ShieldCheck color="#acf800" size={32} />
                        <div>
                            <h4>Infraestrutura homologada</h4>
                            <p>Tudo 100% dentro das diretrizes da Meta.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <Layers color="#acf800" size={32} />
                        <div>
                            <h4>Volume real de disparos</h4>
                            <p>Sem limites fantasiosos, entregamos escala de verdade.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <Bot color="#acf800" size={32} />
                        <div>
                            <h4>Conversão automatizada</h4>
                            <p>Não focamos apenas na entrega, mas no resultado final.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <Zap color="#acf800" size={32} />
                        <div>
                            <h4>Velocidade de ativação</h4>
                            <p>Sua estrutura rodando em tempo recorde.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <Target color="#acf800" size={32} />
                        <div>
                            <h4>Exclusividade</h4>
                            <p>Foco total por região e segmento para nossos parceiros.</p>
                        </div>
                    </div>
                    <div className="sp-auth-item">
                        <Users color="#acf800" size={32} />
                        <div>
                            <h4>Suporte e Operação</h4>
                            <p>Equipe interna dedicada ao sucesso da sua campanha.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── BRAÇOS DE ENTREGA ── */}
            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">ESTRUTURA</span>
                    <h2 className="lp-section-title">Operamos com dois grandes braços de entrega</h2>
                    <p style={{ marginTop: '16px', opacity: 0.7 }}>Sinergia total para escala e conversão.</p>
                </div>

                <div className="lp-audience-grid container">
                    <div className="lp-audience-card is-for">
                        <div className="flex items-center gap-4 mb-6">
                            <Layers size={32} color="#acf800" />
                            <h3 style={{ margin: 0 }}>Disparos em Massa</h3>
                        </div>
                        <p style={{ marginBottom: '24px', opacity: 0.8 }}>Alcance e tráfego em larga escala via API Oficial.</p>
                        <ul className="lp-feature-list">
                            <li><Check size={16} /> Sem necessidade de BM própria</li>
                            <li><Check size={16} /> Templates com Foto, Vídeo e Áudio</li>
                            <li><Check size={16} /> Botões de Link e Variáveis</li>
                            <li><Check size={16} /> Relatórios diretos da plataforma</li>
                            <li><Check size={16} /> Selo de verificação opcional</li>
                        </ul>
                    </div>
                    <div className="lp-audience-card is-for" style={{ borderColor: 'rgba(0, 102, 255, 0.2)', background: 'rgba(0, 102, 255, 0.05)' }}>
                        <div className="flex items-center gap-4 mb-6">
                            <Bot size={32} color="#3b82f6" />
                            <h3 style={{ margin: 0 }}>Estrutura de Conversão</h3>
                        </div>
                        <p style={{ marginBottom: '24px', opacity: 0.8 }}>IA de vendas com atuação ativa e receptiva.</p>
                        <ul className="lp-feature-list">
                            <li><Check size={16} /> Briefing rápido via formulário</li>
                            <li><Check size={16} /> Configuração express em até 48h</li>
                            <li><Check size={16} /> Fluxos de venda inteligentes</li>
                            <li><Check size={16} /> Ativação de Número Receptivo Blindado</li>
                            <li><Check size={16} /> Recebimento ilimitado de mensagens</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── O QUE VOCÊ PODE ENVIAR ── */}
            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">POSSIBILIDADES</span>
                    <h2 className="lp-section-title">O que você pode enviar</h2>
                </div>
                <div className="lp-content-types container">
                    <div className="lp-type-card"><FileText /> Texto</div>
                    <div className="lp-type-card"><Image /> Imagens</div>
                    <div className="lp-type-card"><Video /> Vídeos</div>
                    <div className="lp-type-card"><MousePointer2 /> Botões com Link</div>
                    <div className="lp-type-card"><Users /> Personalização</div>
                </div>
                <p style={{ textAlign: 'center', marginTop: '40px', opacity: 0.8 }}>
                    Tudo pronto para gerar ação imediata na sua base.
                </p>
            </section>

            {/* ── URGÊNCIA ── */}
            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '24px' }}>Pronto para escalar sua operação?</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '40px', opacity: 0.8 }}>Quanto mais você demora para estruturar isso, mais dinheiro deixa na mesa.</p>
                    <Link
                        to="/lead-flow"
                        className="lp-btn lp-btn-large"
                        style={{ background: '#000', color: '#acf800' }}
                    >
                        ATIVAR MINHA ESTRUTURA AGORA 👉
                    </Link>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">DÚVIDAS</span>
                    <h2 className="lp-section-title">Perguntas Frequentes</h2>
                </div>

                <div className="lp-faq-container container">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`lp-faq-item ${activeFaq === i ? 'active' : ''}`} onClick={() => toggleFaq(i)}>
                            <div className="lp-faq-question">
                                {faq.q}
                                {activeFaq === i ? <X size={18} /> : <Plus size={18} />}
                            </div>
                            <div className="lp-faq-answer">
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
