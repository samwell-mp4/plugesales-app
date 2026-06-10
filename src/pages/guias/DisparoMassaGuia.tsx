import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, ShieldCheck, Zap, TrendingUp, MessageCircle, BookOpen, ArrowRight } from 'lucide-react';
import '../LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Guia", "item": "https://plugesales.com/guia/disparo-em-massa-whatsapp" },
        { "@type": "ListItem", "position": 3, "name": "Disparo em Massa WhatsApp", "item": "https://plugesales.com/guia/disparo-em-massa-whatsapp" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        { "@type": "Question", "name": "O que é disparo em massa no WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "É o envio programado de mensagens para múltiplos contatos simultaneamente através da API Oficial do WhatsApp Business (WABA). Diferente de listas de transmissão (limitadas a 256 contatos), o disparo em massa profissional pode alcançar milhares ou milhões de pessoas por dia com mensagens personalizadas, mídia e botões interativos." } },
        { "@type": "Question", "name": "Disparo em massa no WhatsApp é legal?", "acceptedAnswer": { "@type": "Answer", "text": "Sim, desde que feito via API Oficial da Meta (WABA), com templates aprovados e consentimento (opt-in) dos destinatários. A LGPD exige que a base de contatos tenha autorização para receber mensagens de marketing. Ferramentas não-oficiais que violam os Termos de Serviço da Meta são ilegais e resultam em banimento." } },
        { "@type": "Question", "name": "Qual a diferença entre API Oficial e disparador web?", "acceptedAnswer": { "@type": "Answer", "text": "A API Oficial (WABA) é a infraestrutura homologada pela Meta, sem risco de bloqueio, com suporte a templates, botões e mídia. Disparadores web automatizam o WhatsApp Web e violam os Termos de Serviço, resultando em banimento. A API Oficial é a única opção segura e escalável para empresas." } },
        { "@type": "Question", "name": "Quantas mensagens posso enviar por dia?", "acceptedAnswer": { "@type": "Answer", "text": "Na API Oficial, o limite começa em 1.000 conversas/dia para novos números (Tier 1) e sobe para 10.000 (Tier 2) e 100.000+ (Tier 3) conforme a reputação. Com a Plug & Sales, você não precisa se preocupar com warming — nossa infraestrutura já está em tiers elevados." } },
        { "@type": "Question", "name": "Quanto custa o disparo em massa no WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "O custo varia conforme o volume. Planos Plug & Sales começam em R$ 97 para 10 mil disparos (PC-10 Foundation Card) até R$ 3.497 para 500 mil disparos (PC-500 Apex Card). Diferente de BSPs que cobram por conversa (R$ 0,18 a R$ 0,38 cada), nosso modelo é pré-pago por volume." } },
        { "@type": "Question", "name": "Preciso ter Business Manager (BM)?", "acceptedAnswer": { "@type": "Answer", "text": "Não. Com a Plug & Sales, você não precisa criar ou verificar BM. Utilizamos nossa própria infraestrutura homologada. Você só precisa enviar sua base de contatos e os materiais da campanha." } },
        { "@type": "Question", "name": "Como evitar bloqueio no disparo em massa?", "acceptedAnswer": { "@type": "Answer", "text": "Usando exclusivamente a API Oficial da Meta, com templates aprovados, respeitando os limites de reputação (Tiers), mantendo baixa taxa de denúncias, e enviando apenas para contatos com opt-in. A Plug & Sales gerencia toda essa camada de compliance para você." } },
        { "@type": "Question", "name": "Qual o melhor horário para disparar?", "acceptedAnswer": { "@type": "Answer", "text": "Testes mostram que terça a quinta-feira, entre 10h e 16h, têm as maiores taxas de abertura. Evite segundas de manhã (pessoas ocupadas) e sextas à tarde (fim de semana chegando). A segmentação por comportamento do lead é ainda mais eficaz que horário fixo." } },
        { "@type": "Question", "name": "Quais tipos de mensagem posso enviar?", "acceptedAnswer": { "@type": "Answer", "text": "Texto, imagem, vídeo, áudio, documentos, botões de link, botões de resposta rápida, listas, e mensagens com variáveis personalizadas (nome, cidade, etc). Todos os templates precisam ser aprovados pela Meta antes do disparo." } },
        { "@type": "Question", "name": "Posso usar minha própria lista de contatos?", "acceptedAnswer": { "@type": "Answer", "text": "Sim, você precisa fornecer sua própria base. Não fornecemos listas e não compartilhamos sua base com terceiros. A base deve ter opt-in dos contatos para estar em conformidade com a LGPD." } }
    ]
};

const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Como fazer disparo em massa no WhatsApp com API Oficial",
    "description": "Guia passo a passo para configurar e realizar disparos em massa no WhatsApp usando a API Oficial da Meta.",
    "step": [
        { "@type": "HowToStep", "position": 1, "name": "Escolha seu plano de disparo", "text": "Selecione o Plug Card ideal para seu volume. Desde R$ 97 para 10 mil disparos até R$ 3.497 para 500 mil." },
        { "@type": "HowToStep", "position": 2, "name": "Prepare sua base de contatos", "text": "Organize sua lista com nomes, telefones e dados de personalização. A base deve ter consentimento (opt-in) dos contatos." },
        { "@type": "HowToStep", "position": 3, "name": "Crie seus templates de mensagem", "text": "Desenvolva mensagens com texto, imagem, vídeo ou botões. Os templates passam por aprovação da Meta em até 48h." },
        { "@type": "HowToStep", "position": 4, "name": "Envie materiais para aprovação", "text": "Submeta templates e lista de contatos. Nossa equipe revisa e aprova em até 48h." },
        { "@type": "HowToStep", "position": 5, "name": "Acompanhe resultados em tempo real", "text": "Monitore entregas, aberturas e cliques direto do dashboard. Otimize campanhas seguintes com base nos dados." }
    ]
};

const GuiaDisparoMassa = () => {
    const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
    const containerStyle = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

    return (
        <div>
            <SEO
                title="Guia Completo de Disparo em Massa no WhatsApp | API Oficial 2026"
                description="Guia definitivo sobre disparo em massa no WhatsApp via API Oficial da Meta. Aprenda como funciona, custos, como evitar bloqueio, melhores práticas e tudo que você precisa para escalar."
                canonical="https://plugesales.com/guia/disparo-em-massa-whatsapp"
                schema={[breadcrumbSchema, faqSchema, howToSchema]}
                keywords="guia disparo em massa whatsapp, como fazer disparo em massa no whatsapp, tutorial disparo whatsapp, aprenda disparo em massa whatsapp"
            />

            <div className="lp-section" style={{ padding: 'clamp(120px, 18vh, 180px) 8% 60px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <BookOpen size={14} /> GUIA COMPLETO 2026
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
                        Disparo em Massa no WhatsApp: <span className="text-gradient">O Guia Definitivo</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 24px', textAlign: 'center', fontSize: '1.1rem' }}>
                        Tudo que você precisa saber para enviar milhares de mensagens por dia com segurança, dentro da lei, e sem risco de bloqueio. Da API Oficial aos custos — um guia completo para 2026.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>📖 15 min de leitura</span>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>📅 Atualizado Junho 2026</span>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>✍️ Time Plug & Sales</span>
                    </div>
                </div>
            </div>

            <section style={{ background: 'rgba(172,248,0,0.03)', padding: '40px 0', borderTop: '1px solid rgba(172,248,0,0.08)', borderBottom: '1px solid rgba(172,248,0,0.08)' }}>
                <div style={containerStyle}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: 20, color: '#acf800' }}>📑 Neste guia você vai ver:</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {['O que é disparo em massa no WhatsApp', 'API Oficial vs Não-Oficial', 'Como funciona a WABA', 'Passo a passo completo', 'Custos e planos (2026)', 'Como evitar bloqueio', 'Melhores práticas por segmento', 'FAQ completo'].map((item, i) => (
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
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>O que é disparo em massa no WhatsApp?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Disparo em massa no WhatsApp é a prática de enviar mensagens para um grande número de contatos simultaneamente. Diferente do que muitos pensam, não se trata de "spam" — quando feito corretamente via <strong style={{ color: '#fff' }}>API Oficial da Meta (WABA)</strong>, é uma estratégia legítima de marketing digital utilizada por milhares de empresas no Brasil.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O WhatsApp tem uma taxa de abertura de <strong style={{ color: '#acf800' }}>98%</strong> — contra 20% do e-mail marketing. Isso significa que quase toda mensagem enviada é lida. Para empresas que dependem de comunicação com clientes, ignorar esse canal é deixar dinheiro na mesa.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        No entanto, existe uma diferença crucial entre fazer disparo em massa do jeito certo (via API Oficial) e do jeito errado (automação de WhatsApp Web). Escolher o caminho errado pode custar seu número e sua operação.
                    </p>
                </div>
            </section>

            <section id="sec-2" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 2</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>API Oficial vs Disparador Web: Qual a diferença?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
                        Essa é a decisão mais importante que você vai tomar. Existem dois caminhos completamente diferentes:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(172,248,0,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(172,248,0,0.15)' }}>
                            <h3 style={{ color: '#acf800', marginBottom: 12 }}>✅ API Oficial (WABA)</h3>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><Check size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} /> Homologada pela Meta</li>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><Check size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} /> Zero risco de bloqueio</li>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><Check size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} /> Templates com botões e mídia</li>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><Check size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} /> Escala ilimitada</li>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><Check size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} /> Selo verde de verificação</li>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><Check size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} /> Relatórios detalhados</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(239,68,68,0.15)' }}>
                            <h3 style={{ color: '#ef4444', marginBottom: 12 }}>❌ Disparador Web</h3>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><span style={{ color: '#ef4444' }}>✕</span> Viola Termos de Serviço da Meta</li>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><span style={{ color: '#ef4444' }}>✕</span> Alto risco de bloqueio permanente</li>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><span style={{ color: '#ef4444' }}>✕</span> Sem templates ou botões</li>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><span style={{ color: '#ef4444' }}>✕</span> Limite de 100-500 msgs/dia</li>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><span style={{ color: '#ef4444' }}>✕</span> Sem verificação ou selo</li>
                                <li style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.7)' }}><span style={{ color: '#ef4444' }}>✕</span> Sem garantia de entrega</li>
                            </ul>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 12, padding: 20, border: '1px solid rgba(172,248,0,0.1)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.95rem' }}>
                            <strong style={{ color: '#acf800' }}>Resumo:</strong> Se você quer levar seu negócio a sério, a API Oficial é o único caminho. Disparadores web são uma questão de <em>quando</em> — não <em>se</em> — seu número será banido. 
                            <Link to="/comparacao/api-oficial-vs-disparador-web" style={{ color: '#acf800', marginLeft: 8 }}>Comparação completa →</Link>
                        </p>
                    </div>
                </div>
            </section>

            <section id="sec-3" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 3</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Como funciona a API Oficial do WhatsApp (WABA)?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        A WhatsApp Business API (WABA) é a infraestrutura oficial da Meta para empresas. Diferente do WhatsApp comum, que roda no seu celular, a API opera diretamente nos servidores da Meta — sem precisar de celular conectado, sem risco de queda de conexão, e com capacidade de processar milhões de mensagens por dia.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Para acessar a WABA, você precisa de um <strong style={{ color: '#fff' }}>Business Solution Provider (BSP)</strong> — uma empresa parceira da Meta que fornece a infraestrutura e a interface para gerenciar seus disparos. A Plug & Sales é sua BSP, oferecendo tudo que você precisa sem a complexidade técnica.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        A WABA utiliza um sistema de <strong style={{ color: '#fff' }}>Tiers de Reputação</strong> (1 a 3) que determinam quantas conversas você pode iniciar por dia. Números novos começam no Tier 1 (1.000 conversas/dia) e, com boa qualidade, sobem até o Tier 3 (100.000+). 
                        <span style={{ color: '#acf800' }}> Com a Plug & Sales, você já começa em tiers elevados, pulando toda a fase de aquecimento.</span>
                    </p>
                </div>
            </section>

            <section id="sec-4" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 4</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Passo a passo: Como fazer disparo em massa do zero</h2>
                    
                    {[
                        { num: '01', title: 'Escolha seu plano de disparo', desc: 'Selecione o volume ideal para seu negócio. Comece com o PC-10 (10 mil disparos por R$ 97) e escale conforme os resultados aparecerem. Cada Plug Card dá acesso imediato à nossa infraestrutura.' },
                        { num: '02', title: 'Prepare sua base de contatos', desc: 'Organize uma planilha com nomes, telefones com DDD e dados de personalização (cidade, produto de interesse, etc). Importante: todos os contatos precisam ter consentido receber mensagens (opt-in) — isso é exigido pela LGPD.' },
                        { num: '03', title: 'Crie seus templates de mensagem', desc: 'Desenvolva mensagens que convertem. Use texto + imagem + botão de link para maximizar cliques. Evite linguagem agressiva ("COMPRE AGORA!!!") — mensagens naturais têm menos denúncias e melhor reputação.' },
                        { num: '04', title: 'Submeta para aprovação', desc: 'Envie templates e lista para nossa equipe. A Meta aprova templates em até 48h. Nós revisamos sua campanha para garantir máxima taxa de entrega e conformidade.' },
                        { num: '05', title: 'Acompanhe os resultados', desc: 'Após o disparo, monitore entregas, aberturas e cliques no dashboard. Use os dados para otimizar a próxima campanha: teste horários, segmentos e tipos de mensagem.' }
                    ].map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 24, marginBottom: 32, padding: 24, borderRadius: 16, background: i % 2 === 0 ? 'rgba(172,248,0,0.02)' : 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800', minWidth: 60, lineHeight: 1 }}>{step.num}</div>
                            <div>
                                <h3 style={{ color: '#fff', marginBottom: 8, fontSize: '1.3rem' }}>{step.title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                            </div>
                        </div>
                    ))}

                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
                            COMEÇAR MEU DISPARO AGORA 👉
                        </Link>
                    </div>
                </div>
            </section>

            <section id="sec-5" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 5</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Custos do disparo em massa em 2026</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
                        O mercado de disparo em massa tem dois modelos de precificação principais:
                    </p>
                    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(172,248,0,0.3)' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#acf800' }}>Modelo</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>Custo mensal</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>Custo por msg</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>Ideal para</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>Plug & Sales (Cards)</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>R$ 97 a R$ 3.497</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>~R$ 0,007</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>Todo porte</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>BSP Tradicional</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>R$ 200 a R$ 800</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>R$ 0,18 a R$ 0,38</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>Alto volume</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>Disparador Web</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>R$ 97 a R$ 497</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>Grátis (na mensalidade)</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#ef4444' }}>⚠️ Risco de ban</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        Com a Plug & Sales, você paga <strong style={{ color: '#acf800' }}>até 95% menos</strong> que BSPs tradicionais por mensagem entregue. Sem taxa de setup, sem surpresas na fatura.
                        <Link to="/precos" style={{ color: '#acf800', marginLeft: 8 }}>Ver todos os planos →</Link>
                    </p>
                </div>
            </section>

            <section id="sec-6" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 6</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Como evitar bloqueio no disparo em massa</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O bloqueio é o maior medo de quem faz disparo em massa. E com razão: perder um número pode significar perder clientes, campanhas e receita. Felizmente, seguindo as regras da API Oficial, o risco é praticamente zero.
                    </p>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                        {[
                            { title: 'Use exclusivamente a API Oficial', desc: 'Este é o mandamento número 1. Qualquer solução não-oficial viola os Termos de Serviço da Meta e resultará em bloqueio mais cedo ou mais tarde.' },
                            { title: 'Mantenha templates aprovados', desc: 'Nunca dispare sem ter seus templates aprovados pela Meta. Mensagens não-autorizadas são a causa #1 de bloqueios na API.' },
                            { title: 'Respeite os limites do seu Tier', desc: 'Cada nível de reputação tem um teto de conversas diárias. Exceder esse limite repetidamente reduz sua reputação.' },
                            { title: 'Monitore sua taxa de denúncias', desc: 'Mantenha denúncias abaixo de 0,1%. Mensagens irrelevantes ou agressivas geram denúncias e prejudicam sua reputação.' },
                            { title: 'Inclua opt-out visível', desc: 'Sempre ofereça uma opção clara de sair da lista. "Responda SAIR para não receber mais mensagens" reduz denúncias e melhora sua reputação.' },
                            { title: 'Segmentee sua base', desc: 'Enviar a mensagem certa para a pessoa certa reduz denúncias e aumenta conversão. Use dados de comportamento e preferências.' }
                        ].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 16, padding: 16, background: 'rgba(172,248,0,0.02)', borderRadius: 12, border: '1px solid rgba(172,248,0,0.06)' }}>
                                <ShieldCheck color="#acf800" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <strong style={{ color: '#fff', display: 'block', marginBottom: 4 }}>{item.title}</strong>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>{item.desc}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Link to="/guia/como-evitar-bloqueio-whatsapp" style={{ color: '#acf800' }}>Guia completo para evitar bloqueio →</Link>
                </div>
            </section>

            <section id="sec-7" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 7</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Melhores práticas por segmento</h2>
                    <div style={{ display: 'grid', gap: 20 }}>
                        {[
                            { segment: 'E-commerce', tip: 'Dispare ofertas de recuperação de carrinho abandonado com botão de link direto para o checkout. Taxa de conversão: até 15%. Automatize também confirmações de pedido e atualizações de frete.' },
                            { segment: 'Imobiliárias', tip: 'Envie novos imóveis com fotos e vídeos para leads segmentados por bairro e faixa de preço. Use botões de resposta rápida para agendar visitas automaticamente.' },
                            { segment: 'Educação', tip: 'Dispa lembretes de matrícula, boletos e materiais didáticos. Campanhas sazonais (vestibular, matrícula) têm pico de conversão de até 40%.' },
                            { segment: 'Saúde', tip: 'Lembretes de consulta, exames e resultados com segurança total. A API Oficial permite comunicação transacional com alta prioridade de entrega.' }
                        ].map((item, i) => (
                            <div key={i} style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(172,248,0,0.02)' }}>
                                <h3 style={{ color: '#acf800', marginBottom: 8 }}>{item.segment}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0 }}>{item.tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Pronto para começar seus disparos?</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Milhares de empresas já escalam com a Plug & Sales. Sua estrutura pode estar rodando em 24h.</p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                            ATIVAR MINHA ESTRUTURA 👉
                        </Link>
                        <Link to="/precos" className="lp-btn lp-btn-large" style={{ background: 'rgba(0,0,0,0.1)', color: '#000', border: '2px solid rgba(0,0,0,0.2)' }}>
                            VER PLANOS
                        </Link>
                    </div>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Li o guia de disparo em massa e quero tirar uma dúvida." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={28} />
                <span className="wa-tooltip">Fale conosco</span>
            </a>

            <style>{`
                html { scroll-behavior: smooth; }
                @media (max-width: 768px) {
                    [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
                    table { font-size: 0.8rem !important; }
                    table td, table th { padding: 8px !important; }
                }
            `}</style>
        </div>
    );
};

export default GuiaDisparoMassa;
