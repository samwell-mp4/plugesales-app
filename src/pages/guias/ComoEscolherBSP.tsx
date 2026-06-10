import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, ShieldCheck, Zap, TrendingUp, MessageCircle, BookOpen, Search, Star } from 'lucide-react';
import '../LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Guia", "item": "https://plugesales.com/guia/como-escolher-bsp-whatsapp" },
        { "@type": "ListItem", "position": 3, "name": "Como Escolher um BSP WhatsApp", "item": "https://plugesales.com/guia/como-escolher-bsp-whatsapp" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        { "@type": "Question", "name": "O que é um BSP WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "BSP (Business Solution Provider) é uma empresa parceira da Meta que fornece infraestrutura para acesso à WhatsApp Business API (WABA). Sem um BSP, você não consegue utilizar a API Oficial do WhatsApp." } },
        { "@type": "Question", "name": "Qual a diferença entre BSP e disparador web?", "acceptedAnswer": { "@type": "Answer", "text": "BSPs são homologados pela Meta e fornecem acesso legal à WABA. Disparadores web automatizam o WhatsApp Web e violam os Termos de Serviço, resultando em bloqueio." } },
        { "@type": "Question", "name": "Preciso de BSP para usar API do WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. A Meta exige que empresas acessem a WABA através de um BSP parceiro. Você não pode conectar diretamente na API sem um provedor intermediário." } },
        { "@type": "Question", "name": "Quanto custa um BSP WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "BSPs tradicionais cobram taxa mensal (R$ 200-800) + taxa por conversa (R$ 0,18 a R$ 0,38). A Plug & Sales oferece modelo pré-pago por volume, a partir de R$ 97 sem taxa mensal." } }
    ]
};

const ComoEscolherBSP = () => {
    const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
    const containerStyle = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

    return (
        <div className="public-page-wrapper">
            <SEO
                title="Como Escolher um BSP WhatsApp | Guia Completo 2026 | Plug & Sales"
                description="Guia completo para escolher o melhor BSP (Business Solution Provider) para WhatsApp Business API. Compare preços, recursos, suporte e infraestrutura."
                canonical="https://plugesales.com/guia/como-escolher-bsp-whatsapp"
                schema={[breadcrumbSchema, faqSchema]}
                keywords="bsp whatsapp, business solution provider whatsapp, escolher bsp whatsapp, melhor bsp whatsapp, provedor api whatsapp"
            />

            <div className="lp-section" style={{ padding: 'clamp(120px, 18vh, 180px) 8% 60px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <Search size={14} /> GUIA COMPLETO 2026
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Como Escolher o Melhor <span className="text-gradient">BSP WhatsApp</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 24px', textAlign: 'center', fontSize: '1.1rem' }}>
                        Escolher o BSP certo para sua operação de WhatsApp Business API é a decisão mais importante que você vai tomar. Este guia mostra exatamente o que avaliar para não errar.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>📖 12 min de leitura</span>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>📅 Atualizado Junho 2026</span>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>✍️ Time Plug & Sales</span>
                    </div>
                </div>
            </div>

            <section style={{ background: 'rgba(172,248,0,0.03)', padding: '40px 0', borderTop: '1px solid rgba(172,248,0,0.08)', borderBottom: '1px solid rgba(172,248,0,0.08)' }}>
                <div style={containerStyle}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: 20, color: '#acf800' }}>📑 Neste guia você vai ver:</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {['O que é um BSP WhatsApp', 'Por que você precisa de um BSP', 'Critérios essenciais de escolha', 'Comparação de preços', 'Infraestrutura e suporte', 'BSP vs Disparador Web', 'Perguntas para fazer antes de contratar', 'FAQ completo'].map((item, i) => (
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
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>O que é um BSP WhatsApp?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        BSP significa <strong style={{ color: '#fff' }}>Business Solution Provider</strong> — uma empresa parceira oficial da Meta que fornece a infraestrutura necessária para você acessar a WhatsApp Business API (WABA).
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Pense no BSP como uma <strong style={{ color: '#fff' }}>"tradução"</strong> entre o seu negócio e a infraestrutura complexa da Meta. Em vez de lidar diretamente com API, webhooks, Tiers e configurações técnicas, você contrata um BSP que já tem tudo pronto.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        A Meta não permite que empresas comuns se conectem diretamente à WABA. Todo acesso precisa ser intermediado por um BSP homologado. <strong style={{ color: '#acf800' }}>Escolher o BSP certo define o sucesso ou fracasso da sua operação.</strong>
                    </p>
                </div>
            </section>

            <section id="sec-2" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 2</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Por que você precisa de um BSP?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Se você já tentou configurar a API do WhatsApp por conta própria, sabe o pesadelo que é: criar Business Manager, verificar empresa, configurar webhooks, entender Tiers, criar templates, esperar aprovação...
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Um BSP elimina toda essa complexidade. Você não precisa de:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
                        {['Business Manager próprio', 'Verificação de empresa na Meta', 'Configuração técnica de servidores', 'Gerenciamento de Tiers de reputação', 'Preocupação com aquecimento de números', 'Conhecimento em API e webhooks'].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', color: 'rgba(255,255,255,0.7)' }}>
                                <Check size={16} color="#acf800" /> {item}
                            </li>
                        ))}
                    </ul>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        Com a <Link to="/" style={{ color: '#acf800' }}>Plug & Sales</Link>, você tem um BSP completo sem precisar de conhecimento técnico. Sua estrutura pode estar rodando em 24h.
                    </p>
                </div>
            </section>

            <section id="sec-3" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 3</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Critérios Essenciais para Escolher um BSP</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
                        Nem todo BSP é igual. Aqui estão os critérios que você precisa avaliar antes de escolher:
                    </p>
                    <div style={{ display: 'grid', gap: 20 }}>
                        {[
                            { icon: <ShieldCheck color="#acf800" size={24} />, title: 'Homologação Meta', desc: 'Verifique se o BSP é parceiro oficial da Meta. BSPs não-homologados podem ser desativados a qualquer momento.' },
                            { icon: <Zap color="#acf800" size={24} />, title: 'Facilidade de Ativação', desc: 'Quanto tempo leva para sua operação começar? BSPs bons ativam em 24-48h. BSPs ruins podem levar semanas.' },
                            { icon: <TrendingUp color="#acf800" size={24} />, title: 'Modelo de Precificação', desc: 'Taxa mensal fixa + por conversa? Ou pré-pago por volume? O modelo certo depende do seu volume de disparos.' },
                            { icon: <Star color="#acf800" size={24} />, title: 'Suporte e Atendimento', desc: 'Suporte em português? Tempo de resposta? BSPs internacionais podem ter suporte lento e em inglês.' },
                            { icon: <BookOpen color="#acf800" size={24} />, title: 'Recursos Disponíveis', desc: 'Templates multimídia, botões, listas, variáveis dinâmicas — nem todo BSP oferece todos os recursos da WABA.' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 16, padding: 20, borderRadius: 16, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(172,248,0,0.06)' }}>
                                <div style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                                <div>
                                    <h3 style={{ color: '#fff', marginBottom: 6, fontSize: '1.1rem' }}>{item.title}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: 0 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="sec-4" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 4</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Comparação de Preços entre BSPs</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
                        O mercado de BSPs tem modelos de precificação muito diferentes. Veja como eles se comparam:
                    </p>
                    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(172,248,0,0.3)' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#acf800' }}>Provedor</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>Taxa Mensal</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>Custo por Conversa</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>Setup</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>Suporte PT-BR</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#acf800' }}>Plug & Sales</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>R$ 0</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>~R$ 0,007</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>Grátis</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>✅</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>Twilio</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>Grátis</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>~R$ 0,35</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>Técnico</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#ef4444' }}>❌</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>WATI</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>~R$ 400</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>Incluso</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>Grátis</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#ef4444' }}>❌</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>Zenvia</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>~R$ 200</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>~R$ 0,18</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>Grátis</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>✅</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        Para 100 mil mensagens mensais, a Plug & Sales custa <strong style={{ color: '#acf800' }}>até 95% menos</strong> que BSPs tradicionais. <Link to="/precos" style={{ color: '#acf800' }}>Ver planos →</Link>
                    </p>
                </div>
            </section>

            <section id="sec-5" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 5</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Infraestrutura e Suporte</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        A infraestrutura do BSP define a confiabilidade da sua operação. BSPs ruins têm quedas frequentes, latência alta e suporte inexistente.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Pergunte ao seu BSP:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
                        {['Qual o uptime garantido? (mínimo 99,9%)', 'Qual o tempo médio de resposta do suporte?', 'O suporte é em português?', 'Qual a capacidade máxima de disparos por segundo?', 'Oferecem dashboard de métricas?', 'Têm infraestrutura redundante?', 'Já operam em Tier 3 da Meta?'].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', color: 'rgba(255,255,255,0.7)' }}>
                                <Check size={14} color="#acf800" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section id="sec-6" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 6</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>BSP vs Disparador Web: A Diferença que Salva seu Negócio</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Muita gente confunde BSP com disparador web. A diferença é abissal:
                    </p>
                    <div style={{ display: 'grid', gap: 20, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(34,197,94,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(34,197,94,0.15)' }}>
                            <h3 style={{ color: '#22c55e', marginBottom: 12 }}>✅ BSP (Business Solution Provider)</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: 0 }}>Homologado pela Meta. Acesso legal à API Oficial. Zero risco de bloqueio. Templates multimídia. Escala ilimitada. Relatórios. <strong>É a única opção para empresas sérias.</strong></p>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(239,68,68,0.15)' }}>
                            <h3 style={{ color: '#ef4444', marginBottom: 12 }}>❌ Disparador Web</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: 0 }}>Violação dos Termos de Serviço da Meta. Alto risco de bloqueio. Sem templates. Limite restrito. <strong>Uma questão de tempo até o banimento.</strong></p>
                        </div>
                    </div>
                    <p><Link to="/comparacao/api-oficial-vs-disparador-web" style={{ color: '#acf800' }}>Comparação completa →</Link></p>
                </div>
            </section>

            <section id="sec-7" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 7</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Perguntas para Fazer Antes de Contratar</h2>
                    <div style={{ display: 'grid', gap: 16 }}>
                        {[
                            { q: 'Vocês são parceiros oficiais da Meta?', a: 'BSPs não-oficiais podem ser desativados. Exija comprovação de parceria.' },
                            { q: 'Qual o modelo de cobrança?', a: 'Taxa mensal + por conversa pode sair caro para alto volume. Prefira pré-pago por volume.' },
                            { q: 'Preciso ter minha própria BM?', a: 'Bons BSPs oferecem infraestrutura própria. Você não precisa criar nada.' },
                            { q: 'Quanto tempo leva para ativar?', a: 'BSPs ruins levam semanas. BSPs bons ativam em 24-48h.' },
                            { q: 'Qual a capacidade máxima?', a: 'Se você planeja escalar, garanta que o BSP suporte milhões de mensagens.' },
                            { q: 'Oferecem suporte em português?', a: 'BSPs internacionais podem ter suporte lento e em inglês. Priorize quem fala sua língua.' },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: 20, borderRadius: 12, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(172,248,0,0.06)' }}>
                                <h3 style={{ color: '#acf800', marginBottom: 6, fontSize: '1.05rem' }}>{item.q}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: 0 }}>{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Pronto para escolher o melhor BSP?</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>A Plug & Sales é o BSP que oferece o melhor custo-benefício do mercado.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        ATIVAR MEU BSP 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero saber mais sobre BSP WhatsApp." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
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

export default ComoEscolherBSP;
