import { useEffect, useRef, useState } from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { 
    ShieldCheck, Zap, Layout, BarChart3, Smartphone, Globe, 
    ChevronRight, CheckCircle2, MessageCircle, ArrowRight, 
    TrendingUp, Database, Layers, Users, Target, Rocket, 
    Sparkles, Activity, Clock, Bot, Send, Eye, Download, Upload, FileText
} from 'lucide-react';

function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView] as const;
}

function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const [ref, inView] = useInView(0.1);
    return (
        <div ref={ref} className={`fade-section ${inView ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

interface StatProps { end: string; label: string; suffix?: string }
function AnimatedStat({ end, label, suffix = '' }: StatProps) {
    return (
        <div className="stat-card glass-card">
            <div className="stat-number">{end}{suffix}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

const PresentationsPage = () => {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
            { "@type": "ListItem", "position": 2, "name": "Apresentações", "item": "https://plugesales.com/apresentacoes" }
        ]
    };

    const presentationSchema = {
        "@context": "https://schema.org",
        "@type": "PresentationDigitalDocument",
        "name": "Plug & Sales — Plataforma de Disparo em Massa WhatsApp",
        "description": "Apresentação completa dos recursos da plataforma Plug & Sales: API Oficial Meta, disparos em massa, dashboard, analytics, chatbot e automação.",
        "author": { "@type": "Organization", "name": "Plug & Sales" }
    };

    const testimonials = [
        { name: 'Rafael Oliveira', role: 'CEO, Imobiliária Lumier', text: 'Passamos de 50 para 2.000 leads qualificados por mês com os disparos da Plug & Sales. A taxa de bloqueio caiu a zero.' },
        { name: 'Juliana Costa', role: 'Head de Marketing, EduTech Plus', text: 'O chatbot com IA reduziu nosso tempo de resposta de 4 horas para 30 segundos. ROI imediato.' },
        { name: 'Marcos Andrade', role: 'Diretor Comercial, Varejo Connect', text: 'Testamos 3 BSPs antes da Plug. Nenhum entregou a velocidade e o suporte que eles oferecem.' }
    ];

    return (
        <div className="presentations-page animate-fade-in">
            <SEO 
                title="Apresentações Plug & Sales — Plataforma de Disparo em Massa WhatsApp, Chatbot e API Oficial" 
                description="Conheça todos os recursos da Plug & Sales: disparo em massa via API Oficial da Meta, chatbot inteligente com IA, dashboard em tempo real, analytics e automação. Veja a plataforma em ação."
                canonical="https://plugesales.com/apresentacoes"
                schema={[breadcrumbSchema, presentationSchema]}
                keywords="apresentação plug sales, plataforma disparo whatsapp, dashboard disparo em massa, recursos api oficial whatsapp, demo disparo whatsapp, features plug sales"
            />

            <div className="breadcrumb-wrapper container">
                <nav className="breadcrumbs">
                    <Link to="/">Início</Link>
                    <ChevronRight size={14} />
                    <span>Apresentações</span>
                </nav>
            </div>

            <section className="hero-section">
                <div className="container">
                    <div className="hero-bg-glow" />
                    <span className="section-tag">EXPLORE A PLATAFORMA</span>
                    <h1 className="hero-title">
                        Tudo que você precisa para <span className="text-gradient">dominar o WhatsApp</span>
                    </h1>
                    <p className="hero-subtitle">
                        Uma plataforma completa de disparo em massa, chatbot com IA e API Oficial da Meta. 
                        Dashboard poderoso, analytics em tempo real e suporte que realmente resolve.
                    </p>
                    <div className="hero-actions">
                        <a href="https://wa.me/5531983994058?text=Olá! Quero uma demonstração da plataforma Plug & Sales." target="_blank" rel="noopener noreferrer" className="hero-btn-primary">
                            <MessageCircle size={20} /> SOLICITAR DEMO
                        </a>
                        <a href="#recursos" className="hero-btn-secondary">
                            EXPLORAR RECURSOS <ArrowRight size={16} />
                        </a>
                    </div>
                </div>
            </section>

            <FadeInSection>
                <section className="stats-section section-padding" id="recursos">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">NÚMEROS DA PLATAFORMA</span>
                            <h2 className="section-title">Uma máquina de <span className="text-gradient">resultados</span></h2>
                        </div>
                        <div className="stats-grid">
                            <AnimatedStat end="2Bi+" label="Mensagens Entregues" />
                            <AnimatedStat end="99.8" label="Taxa de Entrega" suffix="%" />
                            <AnimatedStat end="500+" label="Clientes Ativos" />
                            <AnimatedStat end="4.9" label="Avaliação Média" suffix="/5" />
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection delay={100}>
                <section className="features-section section-padding">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">RECURSOS PREMIUM</span>
                            <h2 className="section-title">Engenharia de ponta para <span className="text-gradient">escalar sem limites</span></h2>
                            <p className="section-subtitle">
                                Cada recurso da nossa plataforma foi projetado para maximizar sua entrega, proteger seu número 
                                e acelerar seu faturamento.
                            </p>
                        </div>
                        <div className="features-grid">
                            <div className="feature-card glass-card">
                                <div className="feature-icon"><ShieldCheck size={28} /></div>
                                <h3>API Oficial Meta</h3>
                                <p>Segurança total contra bloqueios. Conformidade 100% com as políticas do WhatsApp. Sem risco de banimento.</p>
                            </div>
                            <div className="feature-card glass-card">
                                <div className="feature-icon"><Zap size={28} /></div>
                                <h3>Disparo em Massa</h3>
                                <p>Milhares de mensagens por minuto com entrega garantida. Filas inteligentes e rate limiting automático.</p>
                            </div>
                            <div className="feature-card glass-card">
                                <div className="feature-icon"><Layout size={28} /></div>
                                <h3>Dashboard Completo</h3>
                                <p>Controle total da operação com métricas em tempo real, gráficos interativos e exportação de relatórios.</p>
                            </div>
                            <div className="feature-card glass-card">
                                <div className="feature-icon"><BarChart3 size={28} /></div>
                                <h3>Analytics Avançado</h3>
                                <p>Saiba exatamente quem recebeu, leu, clicou e respondeu. Dados que orientam suas decisões de marketing.</p>
                            </div>
                            <div className="feature-card glass-card">
                                <div className="feature-icon"><Bot size={28} /></div>
                                <h3>Chatbot com IA</h3>
                                <p>Automação inteligente de vendas e suporte. Fluxos conversacionais que qualificam leads e fecham negócios.</p>
                            </div>
                            <div className="feature-card glass-card">
                                <div className="feature-icon"><Globe size={28} /></div>
                                <h3>Integração via API</h3>
                                <p>Webhooks, API REST e conectores prontos para CRM, ERP e plataformas de e-commerce.</p>
                            </div>
                            <div className="feature-card glass-card">
                                <div className="feature-icon"><Smartphone size={28} /></div>
                                <h3>Multi-Números</h3>
                                <p>Gerencie dezenas de números em uma única plataforma. Cada operação com seu próprio perfil e limites.</p>
                            </div>
                            <div className="feature-card glass-card">
                                <div className="feature-icon"><Database size={28} /></div>
                                <h3>Segmentação Inteligente</h3>
                                <p>Crie segmentos dinâmicos por comportamento, localização, histórico e muito mais.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection delay={100}>
                <section className="dashboard-section section-padding">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">PLATAFORMA EM AÇÃO</span>
                            <h2 className="section-title">Veja o poder da <span className="text-gradient">Plug & Sales</span></h2>
                            <p className="section-subtitle">
                                Nossa interface foi projetada para ser intuitiva e poderosa simultaneamente. 
                                Gerencie milhares de contatos, crie templates e acompanhe resultados em tempo real.
                            </p>
                        </div>
                        <div className="dashboard-showcase">
                            <div className="dashboard-image-wrapper">
                                <div className="dashboard-glow" />
                                <img 
                                    src="https://iili.io/BRvLRPS.jpg" 
                                    alt="Plug & Sales Dashboard - Plataforma de Disparo em Massa WhatsApp" 
                                    className="dashboard-img"
                                />
                            </div>
                            <div className="dashboard-features">
                                <div className="dash-feat">
                                    <div className="dash-feat-icon"><Upload size={20} /></div>
                                    <div>
                                        <h4>Importação Rápida</h4>
                                        <p>Contatos via Excel, CSV ou integração direta com seu CRM.</p>
                                    </div>
                                </div>
                                <div className="dash-feat">
                                    <div className="dash-feat-icon"><FileText size={20} /></div>
                                    <div>
                                        <h4>Criador de Templates</h4>
                                        <p>Botões, imagens, vídeos e carrosséis aprovados pela Meta.</p>
                                    </div>
                                </div>
                                <div className="dash-feat">
                                    <div className="dash-feat-icon"><Clock size={20} /></div>
                                    <div>
                                        <h4>Agendamento Inteligente</h4>
                                        <p>Programe disparos no melhor horário para cada segmento.</p>
                                    </div>
                                </div>
                                <div className="dash-feat">
                                    <div className="dash-feat-icon"><Activity size={20} /></div>
                                    <div>
                                        <h4>Monitoramento ao Vivo</h4>
                                        <p>Acompanhe entregas e aberturas em tempo real.</p>
                                    </div>
                                </div>
                                <div className="dash-feat">
                                    <div className="dash-feat-icon"><Eye size={20} /></div>
                                    <div>
                                        <h4>Relatórios Detalhados</h4>
                                        <p>Taxa de entrega, abertura, clique e conversão por campanha.</p>
                                    </div>
                                </div>
                                <div className="dash-feat">
                                    <div className="dash-feat-icon"><Download size={20} /></div>
                                    <div>
                                        <h4>Exportação de Dados</h4>
                                        <p>Exporte relatórios em CSV, PDF ou integre via webhook.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection delay={100}>
                <section className="journey-section section-padding">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">JORNADA DO CLIENTE</span>
                            <h2 className="section-title">Do primeiro disparo à <span className="text-gradient">escala total</span></h2>
                            <p className="section-subtitle">
                                Em menos de 48 horas sua operação está rodando. Nosso time acompanha cada etapa.
                            </p>
                        </div>
                        <div className="journey-flow">
                            <div className="journey-step glass-card">
                                <div className="step-number">01</div>
                                <div className="step-content">
                                    <h3>Escolha seu Plug Card</h3>
                                    <p>Selecione o plano ideal para seu volume de disparos. Sem assinatura, sem burocracia.</p>
                                </div>
                            </div>
                            <div className="journey-connector"><Rocket size={20} /></div>
                            <div className="journey-step glass-card">
                                <div className="step-number">02</div>
                                <div className="step-content">
                                    <h3>Ativação WABA</h3>
                                    <p>Cuidamos de toda a configuração da sua API Oficial da Meta. Número pronto em até 24h.</p>
                                </div>
                            </div>
                            <div className="journey-connector"><Rocket size={20} /></div>
                            <div className="journey-step glass-card">
                                <div className="step-number">03</div>
                                <div className="step-content">
                                    <h3>Crie seus Templates</h3>
                                    <p>Desenvolva mensagens multimídia com nossa central de templates. Aprovação rápida pela Meta.</p>
                                </div>
                            </div>
                            <div className="journey-connector"><Rocket size={20} /></div>
                            <div className="journey-step glass-card">
                                <div className="step-number">04</div>
                                <div className="step-content">
                                    <h3>Importe e Segmente</h3>
                                    <p>Carregue sua base e crie segmentos inteligentes para campanhas direcionadas.</p>
                                </div>
                            </div>
                            <div className="journey-connector"><Rocket size={20} /></div>
                            <div className="journey-step glass-card">
                                <div className="step-number">05</div>
                                <div className="step-content">
                                    <h3>Dispare e Acompanhe</h3>
                                    <p>Envie campanhas e acompanhe métricas em tempo real. Otimize com dados reais.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection delay={100}>
                <section className="diff-section section-padding">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">POR QUE ESCOLHER</span>
                            <h2 className="section-title">Plug & Sales vs <span className="text-gradient">alternativas</span></h2>
                        </div>
                        <div className="diff-grid">
                            <div className="diff-card glass-card">
                                <div className="diff-badge diff-pro">PLUG & SALES</div>
                                <h3>Plataforma Completa</h3>
                                <ul className="diff-list">
                                    <li><CheckCircle2 size={16} className="diff-check" /> API Oficial Meta — sem bloqueio</li>
                                    <li><CheckCircle2 size={16} className="diff-check" /> Chatbot com IA integrado</li>
                                    <li><CheckCircle2 size={16} className="diff-check" /> Dashboard em tempo real</li>
                                    <li><CheckCircle2 size={16} className="diff-check" /> Suporte humanizado especializado</li>
                                    <li><CheckCircle2 size={16} className="diff-check" /> Preço justo, sem taxa de setup</li>
                                    <li><CheckCircle2 size={16} className="diff-check" /> Plug Cards pré-pagos flexíveis</li>
                                    <li><CheckCircle2 size={16} className="diff-check" /> Analytics avançado incluso</li>
                                    <li><CheckCircle2 size={16} className="diff-check" /> Consultoria de growth inclusa</li>
                                </ul>
                            </div>
                            <div className="diff-card glass-card">
                                <div className="diff-badge diff-against">OUTRAS FERRAMENTAS</div>
                                <h3>Limitações comuns</h3>
                                <ul className="diff-list">
                                    <li><span className="diff-cross">✗</span> Risco de bloqueio (não-oficiais)</li>
                                    <li><span className="diff-cross">✗</span> Chatbot básico ou inexistente</li>
                                    <li><span className="diff-cross">✗</span> Relatórios limitados</li>
                                    <li><span className="diff-cross">✗</span> Suporte genérico e lento</li>
                                    <li><span className="diff-cross">✗</span> Taxas abusivas e contrato de fidelidade</li>
                                    <li><span className="diff-cross">✗</span> Assinatura mensal obrigatória</li>
                                    <li><span className="diff-cross">✗</span> Sem analytics ou dados superficiais</li>
                                    <li><span className="diff-cross">✗</span> Zero consultoria estratégica</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection delay={100}>
                <section className="testimonials-section section-padding">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">DEPOIMENTOS</span>
                            <h2 className="section-title">Quem usa <span className="text-gradient">recomenda</span></h2>
                        </div>
                        <div className="testimonials-grid">
                            {testimonials.map((t, i) => (
                                <div key={i} className="testimonial-card glass-card">
                                    <div className="testimonial-stars">
                                        {[...Array(5)].map((_, s) => <span key={s} className="star">★</span>)}
                                    </div>
                                    <p className="testimonial-text">"{t.text}"</p>
                                    <div className="testimonial-author">
                                        <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                                        <div>
                                            <strong>{t.name}</strong>
                                            <span>{t.role}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection delay={100}>
                <section className="cta-section section-padding">
                    <div className="container">
                        <div className="cta-box glass-panel neon-border">
                            <Sparkles size={32} className="cta-sparkle" />
                            <h2 className="cta-title">Quer ver a plataforma em ação?</h2>
                            <p className="cta-text">
                                Solicite uma demonstração personalizada com nossa equipe. Mostramos todos os recursos, 
                                tiramos dúvidas e montamos o plano ideal para seu negócio.
                            </p>
                            <div className="cta-buttons">
                                <a href="https://wa.me/5531983994058?text=Olá! Quero uma demonstração da plataforma Plug & Sales." target="_blank" rel="noopener noreferrer" className="cta-btn-primary">
                                    <MessageCircle size={20} /> SOLICITAR DEMO
                                </a>
                                <Link to="/precos" className="cta-btn-secondary">
                                    VER PLANOS <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <style>{`
                .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
                .section-padding { padding: 100px 0; }

                .breadcrumb-wrapper { padding-top: 130px; margin-bottom: 0; position: relative; z-index: 10; }
                .breadcrumbs { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.4); font-size: 0.85rem; font-weight: 500; justify-content: center; }
                .breadcrumbs a { color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.3s; }
                .breadcrumbs a:hover { color: var(--primary-color); }
                .breadcrumbs span { color: var(--primary-color); font-weight: 700; }

                .section-tag { color: var(--primary-color); font-weight: 800; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; display: block; }
                .section-header { text-align: center; max-width: 800px; margin: 0 auto 60px; }
                .section-title { font-size: clamp(2rem, 3.5vw, 3rem); margin-bottom: 16px; line-height: 1.2; }
                .section-subtitle { font-size: 1.1rem; color: var(--text-secondary); line-height: 1.7; }

                /* Hero */
                .hero-section { padding: 40px 0 80px; text-align: center; position: relative; overflow: hidden; }
                .hero-bg-glow { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(172,248,0,0.08) 0%, transparent 70%); pointer-events: none; }
                .hero-title { font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 24px; line-height: 1.1; }
                .hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); max-width: 720px; margin: 0 auto 40px; line-height: 1.6; }
                .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
                .hero-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 16px 36px; background: var(--primary-gradient); color: #000; font-weight: 800; border-radius: 12px; text-decoration: none; font-size: 0.95rem; transition: all 0.3s; box-shadow: 0 4px 20px var(--primary-shadow); }
                .hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 30px var(--primary-glow); }
                .hero-btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 16px 36px; background: transparent; color: var(--text-primary); border: 1px solid var(--surface-border); border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: all 0.3s; }
                .hero-btn-secondary:hover { border-color: var(--primary-color); color: var(--primary-color); }

                /* Stats */
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
                .stat-card { text-align: center; padding: 40px 24px; }
                .stat-number { font-size: 2.5rem; font-weight: 900; color: var(--primary-color); margin-bottom: 8px; }
                .stat-label { font-size: 1rem; color: var(--text-secondary); font-weight: 500; }

                /* Features */
                .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
                .feature-card { padding: 28px 24px; text-align: left; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .feature-card:hover { transform: translateY(-4px); border-color: var(--primary-border-subtle); box-shadow: var(--shadow-glow); }
                .feature-icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(172,248,0,0.08); display: flex; align-items: center; justify-content: center; color: var(--primary-color); margin-bottom: 20px; transition: all 0.3s; }
                .feature-card:hover .feature-icon { background: rgba(172,248,0,0.15); transform: scale(1.05); }
                .feature-card h3 { font-size: 1.15rem; margin-bottom: 12px; }
                .feature-card p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }

                /* Dashboard */
                .dashboard-showcase { display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; align-items: center; }
                .dashboard-image-wrapper { position: relative; }
                .dashboard-glow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, var(--primary-color) 0%, transparent 60%); opacity: 0.08; pointer-events: none; }
                .dashboard-img { width: 100%; border-radius: 24px; border: 1px solid var(--surface-border); box-shadow: 0 30px 80px rgba(0,0,0,0.5); }
                .dashboard-features { display: flex; flex-direction: column; gap: 20px; }
                .dash-feat { display: flex; align-items: flex-start; gap: 16px; background: var(--card-bg-subtle); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: 16px 20px; transition: all 0.3s; }
                .dash-feat:hover { border-color: var(--primary-border-subtle); background: rgba(172,248,0,0.03); }
                .dash-feat-icon { width: 40px; height: 40px; min-width: 40px; border-radius: 10px; background: rgba(172,248,0,0.08); display: flex; align-items: center; justify-content: center; color: var(--primary-color); }
                .dash-feat h4 { font-size: 0.95rem; margin-bottom: 4px; }
                .dash-feat p { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; }

                /* Journey */
                .journey-flow { display: flex; flex-direction: column; align-items: center; gap: 0; max-width: 700px; margin: 0 auto; }
                .journey-step { display: flex; align-items: flex-start; gap: 24px; padding: 28px 32px; width: 100%; transition: all 0.3s; }
                .journey-step:hover { border-color: var(--primary-border-subtle); box-shadow: var(--shadow-glow); }
                .step-number { font-size: 2rem; font-weight: 900; color: var(--primary-color); line-height: 1; min-width: 48px; opacity: 0.5; }
                .step-content h3 { font-size: 1.15rem; margin-bottom: 8px; }
                .step-content p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; }
                .journey-connector { display: flex; align-items: center; justify-content: center; padding: 12px 0; color: var(--primary-color); opacity: 0.3; }
                .journey-connector svg { animation: bounceArrow 2s ease-in-out infinite; }

                @keyframes bounceArrow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(4px); }
                }

                /* Diferenciais */
                .diff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 960px; margin: 0 auto; }
                .diff-card { padding: 36px; }
                .diff-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; margin-bottom: 16px; }
                .diff-pro { background: rgba(172,248,0,0.15); color: var(--primary-color); border: 1px solid rgba(172,248,0,0.3); }
                .diff-against { background: rgba(255,77,77,0.1); color: #ff4d4d; border: 1px solid rgba(255,77,77,0.2); }
                .diff-card h3 { margin-bottom: 24px; font-size: 1.3rem; }
                .diff-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
                .diff-list li { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; color: var(--text-secondary); }
                .diff-check { color: var(--primary-color); flex-shrink: 0; }
                .diff-cross { color: #ff4d4d; font-weight: bold; flex-shrink: 0; }

                /* Testimonials */
                .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .testimonial-card { padding: 32px; text-align: left; }
                .testimonial-stars { display: flex; gap: 4px; margin-bottom: 16px; }
                .star { color: #facc15; font-size: 1.1rem; }
                .testimonial-text { font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary); margin-bottom: 24px; font-style: italic; flex: 1; }
                .testimonial-author { display: flex; align-items: center; gap: 12px; padding-top: 16px; border-top: 1px solid var(--surface-border); }
                .testimonial-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; color: #000; font-weight: 900; font-size: 1rem; }
                .testimonial-author strong { font-size: 0.9rem; display: block; }
                .testimonial-author span { font-size: 0.8rem; color: var(--text-muted); }

                /* CTA */
                .cta-section { padding-bottom: 80px !important; }
                .cta-box { text-align: center; padding: 60px 40px; border-radius: var(--radius-lg); max-width: 800px; margin: 0 auto; }
                .cta-sparkle { color: var(--primary-color); margin-bottom: 16px; display: inline-block; }
                .cta-title { font-size: clamp(1.8rem, 3vw, 2.5rem); margin-bottom: 16px; }
                .cta-text { font-size: 1.1rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 32px; line-height: 1.6; }
                .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
                .cta-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: var(--primary-gradient); color: #000; font-weight: 800; border-radius: 12px; text-decoration: none; font-size: 0.95rem; transition: all 0.3s; box-shadow: 0 4px 20px var(--primary-shadow); }
                .cta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 25px var(--primary-glow); }
                .cta-btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: transparent; color: var(--text-primary); border: 1px solid var(--surface-border); border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: all 0.3s; }
                .cta-btn-secondary:hover { border-color: var(--primary-color); color: var(--primary-color); }

                /* Scroll Fade-in Animations */
                .fade-section { opacity: 0; transform: translateY(30px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .fade-section.visible { opacity: 1; transform: translateY(0); }

                @media (max-width: 1024px) {
                    .hero-title { font-size: 3.2rem; }
                    .features-grid { grid-template-columns: repeat(2, 1fr); }
                    .dashboard-showcase { grid-template-columns: 1fr; gap: 40px; }
                    .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 768px) {
                    .breadcrumb-wrapper { padding-top: 110px; }
                    .hero-section { padding: 30px 0 60px; }
                    .hero-title { font-size: 2.2rem; }
                    .hero-subtitle { font-size: 1.1rem; }
                    .section-padding { padding: 60px 0; }
                    .section-header { margin-bottom: 40px; }
                    .features-grid { grid-template-columns: 1fr; }
                    .diff-grid { grid-template-columns: 1fr; }
                    .testimonials-grid { grid-template-columns: 1fr; }
                    .stats-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
                    .stat-card { padding: 24px 16px; }
                    .stat-number { font-size: 2rem; }
                    .cta-box { padding: 40px 24px; }
                    .journey-step { padding: 20px; }
                }

                @media (max-width: 480px) {
                    .hero-title { font-size: 1.8rem; }
                }
            `}</style>
        </div>
    );
};

export default PresentationsPage;
