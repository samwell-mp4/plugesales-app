import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Users, Zap, ChevronRight, TrendingUp, Database, BarChart3, Globe, CheckCircle, MessageCircle, ArrowRight, Layers, Rocket, Activity, Sparkles, BookOpen, Building2, Smartphone, RefreshCw, Shield, Send, Bot, ShoppingBag, GraduationCap } from 'lucide-react';

const AboutPage = () => {
    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Plug & Sales",
        "alternateName": "Plugesales",
        "url": "https://plugesales.com",
        "logo": "https://plugesales.com/logo-supreme.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+55-31-98399-4058",
            "contactType": "customer service",
            "areaServed": "BR",
            "availableLanguage": "Portuguese"
        },
        "sameAs": [
            "https://www.instagram.com/plugesales",
            "https://www.linkedin.com/company/plugesales"
        ],
        "description": "Líder nacional em soluções de escala via API Oficial do WhatsApp (WABA), focada em alta performance de disparos, chatbots inteligentes e automação de vendas sem risco de bloqueio.",
        "foundingDate": "2023",
        "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 10, "maxValue": 50 },
        "areaServed": { "@type": "Country", "name": "BR" },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Serviços Plug & Sales",
            "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Disparo em Massa WhatsApp" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "API Oficial WhatsApp (WABA)" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Chatbot Inteligente WhatsApp" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Plug Cards — Planos de Disparo" } }
            ]
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "A Plug & Sales usa a API Oficial da Meta?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sim, operamos exclusivamente via API Oficial da Meta (WABA), garantindo 100% de segurança contra bloqueios e estabilidade na entrega de mensagens. Diferente de ferramentas não-oficiais que utilizam automação de contas pessoais e podem ser banadas."
                }
            },
            {
                "@type": "Question",
                "name": "Quais serviços a Plug & Sales oferece?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Oferecemos disparo em massa no WhatsApp via API Oficial, chatbots inteligentes com IA para automação de vendas e suporte, consultoria especializada em WABA, e os Plug Cards — planos pré-pagos de disparo com volume de 10 mil a 500 mil mensagens."
                }
            },
            {
                "@type": "Question",
                "name": "Qual a diferença entre Plug & Sales e outras ferramentas de disparo?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A principal diferença é que operamos 100% com a API Oficial da Meta (WABA), o que garante segurança contra bloqueios, maior taxa de entrega, templates multimídia aprovados e conformidade com os termos do WhatsApp. Ferramentas não-oficiais correm risco de banimento e têm limitações severas."
                }
            },
            {
                "@type": "Question",
                "name": "Como funcionam os Plug Cards?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Os Plug Cards são planos pré-pagos de disparo em massa. Você escolhe o card com o volume ideal (de 10 mil a 500 mil disparos), paga uma única vez e utiliza os disparos conforme sua necessidade. Sem assinatura mensal, sem taxa de setup, sem surpresas."
                }
            },
            {
                "@type": "Question",
                "name": "O chatbot da Plug & Sales usa inteligência artificial?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sim! Nosso chatbot inteligente utiliza IA generativa para entender e responder clientes de forma natural, com integração a banco de dados, CRM e sistemas terceiros. Pode atuar tanto em vendas quanto em suporte, 24 horas por dia."
                }
            },
            {
                "@type": "Question",
                "name": "Como entrar em contato com a Plug & Sales?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Você pode falar conosco diretamente pelo WhatsApp no número (31) 98399-4058, ou nos seguir no Instagram (@plugesales) e LinkedIn para ficar por dentro das novidades."
                }
            }
        ]
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
            { "@type": "ListItem", "position": 2, "name": "Sobre Nós", "item": "https://plugesales.com/sobre" }
        ]
    };

    return (
        <div className="about-page animate-fade-in">
            <SEO
                title="Sobre a Plug & Sales — Líder em API Oficial WhatsApp | Disparo em Massa, Chatbot e Automação"
                description="Conheça a Plug & Sales: líder em soluções de disparo em massa no WhatsApp via API Oficial da Meta (WABA). Chatbot com IA, Plug Cards, consultoria especializada e infraestrutura de alta performance para empresas que querem escalar vendas sem bloqueios."
                canonical="https://plugesales.com/sobre"
                schema={[orgSchema, breadcrumbSchema, faqSchema]}
                keywords="sobre plug sales, empresa disparo whatsapp, infraestrutura waba, chatbot whatsapp, api oficial whatsapp, plug cards, disparo em massa brasil, automação whatsapp"
            />

            <div className="breadcrumb-wrapper container">
                <nav className="breadcrumbs">
                    <Link to="/">Início</Link>
                    <ChevronRight size={14} />
                    <span>Sobre Nós</span>
                </nav>
            </div>

            <section className="page-hero">
                <div className="container">
                    <span className="section-tag">QUEM SOMOS</span>
                    <h1 className="hero-title">
                        A <span className="text-gradient">Infraestrutura Definitiva</span> para Escalar no WhatsApp
                    </h1>
                    <p className="hero-subtitle">
                        Somos especialistas em API Oficial da Meta (WABA), disparo em massa, chatbots inteligentes e automação de vendas.
                        Nossa missão é substituir ferramentas não-oficiais e BSPs caros por uma solução completa, segura e com ROI comprovado.
                    </p>
                </div>
            </section>

            <section className="stats-section section-padding">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card glass-card">
                            <div className="stat-number">5+</div>
                            <div className="stat-label">Anos de Mercado</div>
                        </div>
                        <div className="stat-card glass-card">
                            <div className="stat-number">2Bi+</div>
                            <div className="stat-label">Mensagens Entregues</div>
                        </div>
                        <div className="stat-card glass-card">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Clientes Ativos</div>
                        </div>
                        <div className="stat-card glass-card">
                            <div className="stat-number">99.8%</div>
                            <div className="stat-label">Taxa de Entrega</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="story-section section-padding">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">NOSSA HISTÓRIA</span>
                        <h2 className="section-title">De uma necessidade real a uma plataforma que <span className="text-gradient">transforma o mercado</span></h2>
                    </div>
                    <div className="story-content">
                        <p className="story-paragraph">
                            A Plug & Sales nasceu da observação de um problema recorrente no mercado brasileiro: empresas que dependiam de 
                            ferramentas não-oficiais de disparo no WhatsApp estavam tendo seus números bloqueados diariamente. 
                            Enquanto isso, as soluções oficiais disponíveis no mercado — os BSPs (Business Solution Providers) — cobravam 
                            taxas abusivas e ofereciam suporte genérico, sem entender a realidade do empreendedor brasileiro.
                        </p>
                        <p className="story-paragraph">
                            Fundada em 2023 por profissionais de tecnologia e vendas, a Plug & Sales surgiu como uma alternativa direta 
                            aos BSPs tradicionais. Nosso objetivo era simples: oferecer a mesma tecnologia de ponta da API Oficial da Meta, 
                            mas com preços justos, suporte humanizado e uma plataforma construída para o mercado nacional.
                        </p>
                        <p className="story-paragraph">
                            Hoje, somos referência no segmento de disparo em massa via WhatsApp, atendendo desde pequenos negócios 
                            até grandes corporações em todo o Brasil. Nossa plataforma processa bilhões de mensagens por ano com 
                            segurança, conformidade total com a Meta e uma taxa de entrega que supera 99%.
                        </p>
                    </div>
                </div>
            </section>

            <section className="services-section section-padding">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">O QUE OFERECEMOS</span>
                        <h2 className="section-title">Um ecossistema completo para <span className="text-gradient">sua comunicação escalar</span></h2>
                        <p className="section-subtitle">
                            Não somos apenas uma ferramenta de disparo. Somos uma plataforma integrada que cobre toda a jornada 
                            de comunicação da sua empresa com o cliente.
                        </p>
                    </div>
                    <div className="services-grid">
                        <div className="service-card glass-card">
                            <div className="service-card-icon">
                                <Send size={32} />
                            </div>
                            <h3 className="service-card-title">Disparo em Massa WhatsApp</h3>
                            <p className="service-card-desc">
                                Envie campanhas de marketing, cobranças, lembretes e comunicados para milhares de contatos simultaneamente 
                                via API Oficial da Meta. Templates multimídia aprovados, agendamento inteligente e relatórios detalhados.
                            </p>
                            <Link to="/servicos/disparo-em-massa-whatsapp" className="service-card-link">
                                Saiba mais <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="service-card glass-card">
                            <div className="service-card-icon">
                                <MessageCircle size={32} />
                            </div>
                            <h3 className="service-card-title">API Oficial WhatsApp (WABA)</h3>
                            <p className="service-card-desc">
                                Ativação e gerenciamento completo da sua conta WABA (WhatsApp Business API). 
                                Cuidamos de todo o processo:Embedded Signup, verificação de empresa, configuração de webhooks, 
                                gerência de tiers de reputação e otimização de taxa de entrega.
                            </p>
                            <Link to="/servicos/api-oficial-whatsapp" className="service-card-link">
                                Saiba mais <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="service-card glass-card">
                            <div className="service-card-icon">
                                <Bot size={32} />
                            </div>
                            <h3 className="service-card-title">Chatbot Inteligente com IA</h3>
                            <p className="service-card-desc">
                                Automatize vendas e suporte com chatbots que entendem linguagem natural. 
                                Integração com CRM, banco de dados e sistemas terceiros. Atendimento 24h com 
                                qualidade humana, usando inteligência artificial generativa.
                            </p>
                            <Link to="/servicos/chatbot-whatsapp" className="service-card-link">
                                Saiba mais <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="service-card glass-card">
                            <div className="service-card-icon">
                                <Layers size={32} />
                            </div>
                            <h3 className="service-card-title">Plug Cards</h3>
                            <p className="service-card-desc">
                                Planos pré-pagos de disparo em massa com volume de 10 mil a 500 mil mensagens. 
                                Sem assinatura, sem taxa de setup, sem surpresas. Escolha o card ideal para seu 
                                momento e dispare quando precisar.
                            </p>
                            <Link to="/precos" className="service-card-link">
                                Ver planos <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="infra-section section-padding">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">INFRAESTRUTURA</span>
                        <h2 className="section-title">Arquitetura enterprise com <span className="text-gradient">performance de guerra</span></h2>
                    </div>
                    <div className="infra-grid">
                        <div className="infra-item glass-card">
                            <Database size={24} className="infra-icon" />
                            <h3>Ambiente Multi-Tenant Isolado</h3>
                            <p>Cada cliente opera em ambiente isolado com recursos dedicados. Sem compartilhamento de infraestrutura que possa comprometer performance ou segurança.</p>
                        </div>
                        <div className="infra-item glass-card">
                            <Activity size={24} className="infra-icon" />
                            <h3>Gerenciamento de Tiers WABA</h3>
                            <p>Monitoramento contínuo da reputação do seu número. Estratégias proativas para subir de tier e aumentar o limite diário de mensagens.</p>
                        </div>
                        <div className="infra-item glass-card">
                            <RefreshCw size={24} className="infra-icon" />
                            <h3>Redundância e Failover</h3>
                            <p>Múltiplos servidores em diferentes zonas de disponibilidade. Se um falha, outro assume instantaneamente sem perda de dados ou interrupção.</p>
                        </div>
                        <div className="infra-item glass-card">
                            <BarChart3 size={24} className="infra-icon" />
                            <h3>Relatórios em Tempo Real</h3>
                            <p>Acompanhe entregas, aberturas, cliques e taxas de conversão em dashboards atualizados em tempo real. Dados que orientam decisões.</p>
                        </div>
                        <div className="infra-item glass-card">
                            <Shield size={24} className="infra-icon" />
                            <h3>Conformidade Total Meta</h3>
                            <p>Operamos estritamente dentro das políticas da Meta. Todos os templates passam por aprovação, todas as mensagens seguem as regras de opt-in.</p>
                        </div>
                        <div className="infra-item glass-card">
                            <Globe size={24} className="infra-icon" />
                            <h3>Alta Disponibilidade</h3>
                            <p>Infraestrutura cloud-native com SLA de 99.9% de uptime. Seu disparo não para, independente do volume ou horário.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="diff-section section-padding">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">POR QUE A PLUG & SALES</span>
                        <h2 className="section-title">O que nos torna <span className="text-gradient">diferentes</span></h2>
                    </div>
                    <div className="diff-grid">
                        <div className="diff-card glass-card">
                            <div className="diff-badge diff-pro">PRÓ</div>
                            <h3>Plug & Sales</h3>
                            <ul className="diff-list">
                                <li><CheckCircle size={16} className="diff-check" /> API Oficial Meta 100%</li>
                                <li><CheckCircle size={16} className="diff-check" /> Sem risco de bloqueio</li>
                                <li><CheckCircle size={16} className="diff-check" /> Templates multimídia ilimitados</li>
                                <li><CheckCircle size={16} className="diff-check" /> Chatbot com IA inclusa</li>
                                <li><CheckCircle size={16} className="diff-check" /> Suporte humanizado especializado</li>
                                <li><CheckCircle size={16} className="diff-check" /> Preço justo, sem taxa de setup</li>
                                <li><CheckCircle size={16} className="diff-check" /> Relatórios detalhados em tempo real</li>
                                <li><CheckCircle size={16} className="diff-check" /> Consultoria de growth inclusa</li>
                            </ul>
                        </div>
                        <div className="diff-card glass-card">
                            <div className="diff-badge diff-against">MERCADO</div>
                            <h3>BSPs Tradicionais</h3>
                            <ul className="diff-list">
                                <li><span className="diff-cross">✗</span> API Oficial, mas com taxas abusivas</li>
                                <li><span className="diff-cross">✗</span> Suporte genérico e lento</li>
                                <li><span className="diff-cross">✗</span> Setup burocrático e caro</li>
                                <li><span className="diff-cross">✗</span> Sem chatbot integrado</li>
                                <li><span className="diff-cross">✗</span> Contratos de fidelidade longos</li>
                                <li><span className="diff-cross">✗</span> Sem consultoria de growth</li>
                                <li><span className="diff-cross">✗</span> Sem transparência de entrega</li>
                                <li><span className="diff-cross">✗</span> Foco em enterprise, ignoram PMEs</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="values-section section-padding">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">NOSSOS VALORES</span>
                        <h2 className="section-title">O que nos guia a cada <span className="text-gradient">disparo</span></h2>
                    </div>
                    <div className="values-grid">
                        <div className="value-card glass-card">
                            <ShieldCheck className="value-icon" size={40} />
                            <h3>WABA Compliance</h3>
                            <p>Segurança de nível enterprise. Operamos sob os mais rígidos protocolos da Meta para garantir que seu número seja uma fortaleza inquebrável.</p>
                        </div>
                        <div className="value-card glass-card">
                            <Zap className="value-icon" size={40} />
                            <h3>Alta Performance</h3>
                            <p>Motores de envio otimizados para velocidade extrema. Latência zero e taxa de entrega auditada para operações que não podem parar.</p>
                        </div>
                        <div className="value-card glass-card">
                            <Target className="value-icon" size={40} />
                            <h3>ROI Optimization</h3>
                            <p>Foco total em conversão. Nossa inteligência de dados ajuda a identificar os melhores gatilhos para transformar leads em clientes fiéis.</p>
                        </div>
                        <div className="value-card glass-card">
                            <Users className="value-icon" size={40} />
                            <h3>Consultoria Expert</h3>
                            <p>Mais que suporte, oferecemos inteligência. Nosso time de especialistas acompanha sua jornada de escala passo a passo.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="journey-section section-padding">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">CONHEÇA NOSSOS GUIAS</span>
                        <h2 className="section-title">Conteúdo que <span className="text-gradient">ensina na prática</span></h2>
                        <p className="section-subtitle">
                            Produzimos guias completos sobre disparo em massa, API oficial, automação e estratégias de conversão 
                            para ajudar sua empresa a escalar com segurança.
                        </p>
                    </div>
                    <div className="journey-grid">
                        <Link to="/guia/disparo-em-massa-whatsapp" className="journey-card glass-card">
                            <BookOpen size={24} className="journey-icon" />
                            <h3>Guia Completo de Disparo em Massa</h3>
                            <p>Tudo que você precisa saber para enviar mensagens em lote pelo WhatsApp de forma profissional e segura.</p>
                            <span className="journey-link">Ler guia <ArrowRight size={12} /></span>
                        </Link>
                        <Link to="/guia/disparo-automatico-whatsapp" className="journey-card glass-card">
                            <Rocket size={24} className="journey-icon" />
                            <h3>Disparo Automático</h3>
                            <p>Aprenda a automatizar campanhas de marketing e cobrança com disparo programado via API Oficial.</p>
                            <span className="journey-link">Ler guia <ArrowRight size={12} /></span>
                        </Link>
                        <Link to="/guia/estrategias-conversao-whatsapp" className="journey-card glass-card">
                            <TrendingUp size={24} className="journey-icon" />
                            <h3>Estratégias de Conversão</h3>
                            <p>Descubra como aumentar suas taxas de abertura, clique e venda com mensagens bem segmentadas.</p>
                            <span className="journey-link">Ler guia <ArrowRight size={12} /></span>
                        </Link>
                        <Link to="/guia/como-enviar-mensagem-em-massa-whatsapp" className="journey-card glass-card">
                            <Smartphone size={24} className="journey-icon" />
                            <h3>Como Enviar Mensagem em Massa</h3>
                            <p>Passo a passo completo para configurar e enviar sua primeira campanha de disparo em massa.</p>
                            <span className="journey-link">Ler guia <ArrowRight size={12} /></span>
                        </Link>
                        <Link to="/comparacao/disparo-gratuito-vs-api-oficial" className="journey-card glass-card">
                            <BarChart3 size={24} className="journey-icon" />
                            <h3>Disparo Grátis vs API Oficial</h3>
                            <p>Entenda as diferenças entre ferramentas gratuitas e a API oficial e por que a oficial é a única opção segura.</p>
                            <span className="journey-link">Comparar <ArrowRight size={12} /></span>
                        </Link>
                        <Link to="/precos" className="journey-card glass-card">
                            <Layers size={24} className="journey-icon" />
                            <h3>Plug Cards — Planos</h3>
                            <p>Conheça nossos planos pré-pagos de disparo em massa. De 10 mil a 500 mil disparos por card.</p>
                            <span className="journey-link">Ver planos <ArrowRight size={12} /></span>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="verticals-section section-padding">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">SOLUÇÕES POR SETOR</span>
                        <h2 className="section-title">Disparo em massa para cada <span className="text-gradient">segmento</span></h2>
                        <p className="section-subtitle">
                            Adaptamos nossa plataforma para as necessidades específicas de cada mercado, com templates, 
                            estratégias e melhores práticas por setor.
                        </p>
                    </div>
                    <div className="verticals-grid">
                        <Link to="/para/ecommerce" className="vertical-card glass-card">
                            <ShoppingBag size={28} className="vertical-icon" />
                            <h3>E-commerce</h3>
                            <p>Carrinho abandonado, ofertas, recuperação de clientes e pós-venda automatizado.</p>
                            <span className="vertical-link">Saiba mais <ArrowRight size={12} /></span>
                        </Link>
                        <Link to="/para/imobiliarias" className="vertical-card glass-card">
                            <Building2 size={28} className="vertical-icon" />
                            <h3>Imobiliárias</h3>
                            <p>Disparo de novos imóveis, lembretes de visita, follow-up de leads e campanhas sazonais.</p>
                            <span className="vertical-link">Saiba mais <ArrowRight size={12} /></span>
                        </Link>
                        <Link to="/para/educacao" className="vertical-card glass-card">
                            <GraduationCap size={28} className="vertical-icon" />
                            <h3>Educação</h3>
                            <p>Matrículas, lembretes de aula, comunicados a pais e alunose campanhas de captação.</p>
                            <span className="vertical-link">Saiba mais <ArrowRight size={12} /></span>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="cta-section section-padding">
                <div className="container">
                    <div className="cta-box glass-panel neon-border">
                        <Sparkles size={32} className="cta-sparkle" />
                        <h2 className="cta-title">Pronto para escalar suas vendas no WhatsApp?</h2>
                        <p className="cta-text">
                            Mais de 500 empresas já utilizam a Plug & Sales para disparar milhões de mensagens com segurança, 
                            usando a API Oficial da Meta. Suporte especializado, preço justo e resultado comprovado.
                        </p>
                        <div className="cta-buttons">
                            <a href="https://wa.me/5531983994058?text=Olá! Quero saber mais sobre a Plug & Sales e os planos de disparo." target="_blank" rel="noopener noreferrer" className="cta-btn-primary">
                                <MessageCircle size={20} /> FALAR CONOSCO
                            </a>
                            <Link to="/precos" className="cta-btn-secondary">
                                VER PLANOS <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .page-hero { padding: 40px 0 80px; text-align: center; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

                .breadcrumb-wrapper { padding-top: 130px; margin-bottom: 0; position: relative; z-index: 10; }
                .breadcrumbs { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.4); font-size: 0.85rem; font-weight: 500; justify-content: center; }
                .breadcrumbs a { color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.3s; }
                .breadcrumbs a:hover { color: var(--primary-color); }
                .breadcrumbs span { color: var(--primary-color); font-weight: 700; }

                .section-tag { color: var(--primary-color); font-weight: 800; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; display: block; }
                .hero-title { font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 24px; line-height: 1.1; }
                .hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); max-width: 800px; margin: 0 auto; line-height: 1.6; }
                .section-padding { padding: 100px 0; }
                .section-header { text-align: center; max-width: 800px; margin: 0 auto 60px; }
                .section-title { font-size: clamp(2rem, 3.5vw, 3rem); margin-bottom: 16px; line-height: 1.2; }
                .section-subtitle { font-size: 1.1rem; color: var(--text-secondary); line-height: 1.7; }

                /* Stats */
                .stats-section { padding-top: 20px !important; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
                .stat-card { text-align: center; padding: 40px 24px; }
                .stat-number { font-size: 2.5rem; font-weight: 900; color: var(--primary-color); margin-bottom: 8px; }
                .stat-label { font-size: 1rem; color: var(--text-secondary); font-weight: 500; }

                /* Story */
                .story-content { max-width: 860px; margin: 0 auto; }
                .story-paragraph { font-size: 1.1rem; line-height: 1.8; color: var(--text-secondary); margin-bottom: 24px; }

                /* Services */
                .services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
                .service-card { padding: 32px; display: flex; flex-direction: column; gap: 16px; }
                .service-card-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(172, 248, 0, 0.1); display: flex; align-items: center; justify-content: center; color: var(--primary-color); }
                .service-card-title { font-size: 1.3rem; font-weight: 700; }
                .service-card-desc { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; flex: 1; }
                .service-card-link { display: inline-flex; align-items: center; gap: 6px; color: var(--primary-color); font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: gap 0.3s; }
                .service-card-link:hover { gap: 10px; }

                /* Infrastructure */
                .infra-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .infra-item { padding: 28px; }
                .infra-icon { color: var(--primary-color); margin-bottom: 16px; }
                .infra-item h3 { margin-bottom: 12px; font-size: 1.15rem; }
                .infra-item p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }

                /* Diferenciais */
                .diff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 960px; margin: 0 auto; }
                .diff-card { padding: 36px; }
                .diff-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; margin-bottom: 16px; }
                .diff-pro { background: rgba(172, 248, 0, 0.15); color: var(--primary-color); border: 1px solid rgba(172, 248, 0, 0.3); }
                .diff-against { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.2); }
                .diff-card h3 { margin-bottom: 24px; font-size: 1.3rem; }
                .diff-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
                .diff-list li { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; color: var(--text-secondary); }
                .diff-check { color: var(--primary-color); flex-shrink: 0; }
                .diff-cross { color: #ff4d4d; font-weight: bold; flex-shrink: 0; }

                /* Values */
                .values-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px; }
                .value-card { text-align: left; transition: all 0.3s; }
                .value-icon { color: var(--primary-color); margin-bottom: 24px; }
                .value-card h3 { margin-bottom: 16px; font-size: 1.5rem; }
                .value-card p { color: var(--text-secondary); line-height: 1.6; }

                /* Journey / Guides */
                .journey-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .journey-card { padding: 28px; display: flex; flex-direction: column; gap: 12px; text-decoration: none; color: inherit; transition: all 0.3s; }
                .journey-card:hover { transform: translateY(-3px); border-color: var(--primary-border-subtle); box-shadow: var(--shadow-glow); }
                .journey-icon { color: var(--primary-color); }
                .journey-card h3 { font-size: 1.1rem; font-weight: 700; }
                .journey-card p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; flex: 1; }
                .journey-link { display: inline-flex; align-items: center; gap: 6px; color: var(--primary-color); font-weight: 700; font-size: 0.85rem; transition: gap 0.3s; }
                .journey-card:hover .journey-link { gap: 10px; }

                /* Verticais */
                .verticals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .vertical-card { padding: 28px; display: flex; flex-direction: column; gap: 12px; text-decoration: none; color: inherit; transition: all 0.3s; }
                .vertical-card:hover { transform: translateY(-3px); border-color: var(--primary-border-subtle); box-shadow: var(--shadow-glow); }
                .vertical-icon { color: var(--primary-color); }
                .vertical-card h3 { font-size: 1.1rem; font-weight: 700; }
                .vertical-card p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; flex: 1; }
                .vertical-link { display: inline-flex; align-items: center; gap: 6px; color: var(--primary-color); font-weight: 700; font-size: 0.85rem; text-decoration: none; transition: gap 0.3s; }
                .vertical-card:hover .vertical-link { gap: 10px; }

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

                @media (max-width: 1024px) {
                    .hero-title { font-size: 3.2rem; }
                    .services-grid { grid-template-columns: 1fr; }
                    .infra-grid { grid-template-columns: repeat(2, 1fr); }
                    .journey-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 768px) {
                    .breadcrumb-wrapper { padding-top: 110px; margin-bottom: 0; }
                    .page-hero { padding: 30px 0 40px; }
                    .hero-title { font-size: 2.2rem; }
                    .hero-subtitle { font-size: 1.1rem; }
                    .section-padding { padding: 60px 0; }
                    .section-header { margin-bottom: 40px; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
                    .stat-card { padding: 24px 16px; }
                    .stat-number { font-size: 2rem; }
                    .infra-grid { grid-template-columns: 1fr; }
                    .diff-grid { grid-template-columns: 1fr; }
                    .journey-grid { grid-template-columns: 1fr; }
                    .verticals-grid { grid-template-columns: 1fr; }
                    .cta-box { padding: 40px 24px; }
                }

                @media (max-width: 480px) {
                    .hero-title { font-size: 1.8rem; }
                    .value-card h3 { font-size: 1.3rem; }
                    .stats-grid { grid-template-columns: 1fr 1fr; }
                }
            `}</style>
        </div>
    );
};

export default AboutPage;
