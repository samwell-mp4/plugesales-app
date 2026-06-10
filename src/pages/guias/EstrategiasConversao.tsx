import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, TrendingUp, MessageCircle, Target, Zap, Users, BarChart3, Clock } from 'lucide-react';
import '../LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Guia", "item": "https://plugesales.com/guia/estrategias-conversao-whatsapp" },
        { "@type": "ListItem", "position": 3, "name": "Estratégias de Conversão WhatsApp", "item": "https://plugesales.com/guia/estrategias-conversao-whatsapp" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        { "@type": "Question", "name": "Qual a taxa de conversão média do WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "A taxa de conversão média no WhatsApp varia de 5% a 15% para campanhas bem segmentadas, contra 1-3% do e-mail marketing. Com estratégias avançadas, é possível atingir 20%+." } },
        { "@type": "Question", "name": "Como aumentar a conversão no disparo em massa?", "acceptedAnswer": { "@type": "Answer", "text": "Personalização com variáveis dinâmicas, segmentação por nível de consciência, uso de botões de link, timing correto, e teste A/B contínuo são as estratégias mais eficazes." } },
        { "@type": "Question", "name": "Qual o melhor horário para disparar mensagens?", "acceptedAnswer": { "@type": "Answer", "text": "Terça a quinta-feira entre 10h e 16h têm as maiores taxas de abertura. Evite segundas de manhã e sextas à tarde. O horário ideal varia por segmento." } },
        { "@type": "Question", "name": "Quantas mensagens devo enviar por lead?", "acceptedAnswer": { "@type": "Answer", "text": "O ideal é 1-2 mensagens por semana por lead. Acima disso, a taxa de denúncia aumenta e a reputação do número cai." } }
    ]
};

const EstrategiasConversao = () => {
    const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
    const containerStyle = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

    return (
        <div className="public-page-wrapper">
            <SEO
                title="Estratégias de Conversão no WhatsApp | Guia Completo 2026 | Plug & Sales"
                description="Guia completo com estratégias de conversão para disparo em massa no WhatsApp. Aprenda a segmentar, personalizar e otimizar campanhas para máximo ROI."
                canonical="https://plugesales.com/guia/estrategias-conversao-whatsapp"
                schema={[breadcrumbSchema, faqSchema]}
                keywords="estratégias conversão whatsapp, aumentar conversão whatsapp, otimizar disparo whatsapp, roi whatsapp, taxa conversão whatsapp"
            />

            <div className="lp-section" style={{ padding: 'clamp(120px, 18vh, 180px) 8% 60px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <TrendingUp size={14} /> GUIA COMPLETO 2026
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Estratégias de Conversão no <span className="text-gradient">WhatsApp</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 24px', textAlign: 'center', fontSize: '1.1rem' }}>
                        Não basta enviar mensagens — você precisa converter. Este guia ensina as estratégias avançadas que usamos para gerar ROI de 300%+ nos disparos em massa dos nossos clientes.
                    </p>
                </div>
            </div>

            <section style={{ background: 'rgba(172,248,0,0.03)', padding: '40px 0', borderTop: '1px solid rgba(172,248,0,0.08)', borderBottom: '1px solid rgba(172,248,0,0.08)' }}>
                <div style={containerStyle}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: 20, color: '#acf800' }}>📑 Neste guia você vai ver:</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {['Os 4 pilares da conversão', 'Segmentação por nível de consciência', 'Engenharia da mensagem AIDA', 'Personalização com variáveis', 'Timing e frequência ideais', 'Teste A/B na prática', 'Métricas que importam', 'FAQ completo'].map((item, i) => (
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
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Os 4 Pilares da Conversão no WhatsApp</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Toda campanha de alto desempenho no WhatsApp se apoia em quatro pilares. Se algum estiver fraco, a conversão cai:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24 }}>
                        {[
                            { icon: <Target size={28} />, title: 'Segmentação', desc: 'A pessoa certa' },
                            { icon: <MessageCircle size={28} />, title: 'Mensagem', desc: 'O conteúdo certo' },
                            { icon: <Clock size={28} />, title: 'Timing', desc: 'O momento certo' },
                            { icon: <Zap size={28} />, title: 'CTA', desc: 'A ação certa' },
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                                <div style={{ color: '#acf800', marginBottom: 12 }}>{item.icon}</div>
                                <h3 style={{ color: '#fff', marginBottom: 6, fontSize: '1.1rem' }}>{item.title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        A <strong style={{ color: '#acf800' }}>Plug & Sales</strong> fornece infraestrutura e ferramentas para que você domine todos os quatro pilares. <Link to="/" style={{ color: '#acf800' }}>Saiba mais →</Link>
                    </p>
                </div>
            </section>

            <section id="sec-2" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 2</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Segmentação por Nível de Consciência</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O maior erro em disparo em massa é tratar toda a base como se estivesse no mesmo estágio. A segmentação por nível de consciência é a técnica mais poderosa para aumentar conversão:
                    </p>
                    <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                        {[
                            { level: 'Inconsciente', desc: 'Não sabe que tem o problema.', acao: 'Conteúdo educativo. Artigos, dicas, cases. Sem oferta direta.', pct: '15%' },
                            { level: 'Consciente do Problema', desc: 'Sabe que precisa, mas não conhece solução.', acao: 'Apresente benefícios e diferenciais. Depoimentos.', pct: '25%' },
                            { level: 'Consciente da Solução', desc: 'Conhece seu produto, mas não comprou.', acao: 'Oferta direta com urgência. Botão de link para compra.', pct: '35%' },
                            { level: 'Mais Consciente', desc: 'Já comprou antes. Cliente recorrente.', acao: 'Cross-sell e ofertas exclusivas. Menor esforço, maior retorno.', pct: '50%+' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 60px', gap: 12, alignItems: 'center', padding: '16px 20px', borderRadius: 12, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div><strong style={{ color: '#acf800' }}>{item.level}</strong></div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{item.desc}</div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{item.acao}</div>
                                <div style={{ color: '#22c55e', fontWeight: 700, textAlign: 'right' }}>{item.pct}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        Aplique essa segmentação e veja sua conversão <strong style={{ color: '#acf800' }}>dobrar ou triplicar</strong> sem aumentar o volume de disparos.
                    </p>
                </div>
            </section>

            <section id="sec-3" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 3</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Engenharia da Mensagem: Framework AIDA</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O framework AIDA (Atenção, Interesse, Desejo, Ação) é a base de toda comunicação persuasiva. Adaptado para o WhatsApp, ele funciona assim:
                    </p>
                    <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                        {[
                            { step: '01', title: 'ATENÇÃO (3 segundos)', desc: 'Primeira linha personalizada com nome do lead + gatilho relevante. "Olá João, vi seu interesse no produto X."' },
                            { step: '02', title: 'INTERESSE (10 segundos)', desc: 'Conecte o produto a uma necessidade real. Use dados: "70% dos clientes que compraram X tiveram resultado Y em 7 dias."' },
                            { step: '03', title: 'DESEJO (5 segundos)', desc: 'Mostre o que eles ganham. Botão com "VER OFERTA" ou "GARANTIR DESCONTO" cria desejo visual.' },
                            { step: '04', title: 'AÇÃO (imediato)', desc: 'UM único CTA. Mensagens com múltiplos CTAs confundem e reduzem conversão em até 40%.' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 20, padding: 20, borderRadius: 16, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#acf800', minWidth: 50, lineHeight: 1 }}>{item.step}</div>
                                <div>
                                    <h3 style={{ color: '#fff', marginBottom: 6 }}>{item.title}</h3>
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
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Personalização com Variáveis Dinâmicas</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Mensagens personalizadas convertem até <strong style={{ color: '#acf800' }}>5x mais</strong> que mensagens genéricas. E personalização vai muito além do nome:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
                        {[
                            'Nome do cliente', 'Produto de interesse', 'Valor ou desconto personalizado',
                            'Cidade ou região', 'Data da última compra', 'Categoria favorita',
                            'Estágio no funil', 'Origem do lead'
                        ].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', color: 'rgba(255,255,255,0.7)' }}>
                                <Check size={14} color="#acf800" /> <strong style={{ color: '#fff' }}>{item}</strong>
                            </li>
                        ))}
                    </ul>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        <strong style={{ color: '#fff' }}>Exemplo real:</strong> "Olá João, notei que você visitou nossa página do Tênis Runner X na semana passada. Preparamos uma oferta especial de 15% de desconto só para você!" — isso converte 5x mais que "Confira nossas ofertas!".
                    </p>
                </div>
            </section>

            <section id="sec-5" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 5</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Timing e Frequência Ideais</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O timing certo pode dobrar sua conversão. Análise de mais de 10 milhões de disparos mostra:
                    </p>
                    <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                        {[
                            { seg: 'E-commerce', horario: 'Ter-Qui, 10h-14h', motivo: 'Pausa do trabalho, horário de almoço' },
                            { seg: 'Imobiliárias', horario: 'Sábado, 9h-12h', motivo: 'Buscando imóveis no fim de semana' },
                            { seg: 'Educação', horario: 'Seg-Qua, 19h-21h', motivo: 'Pós-trabalho, planejando estudos' },
                            { seg: 'Saúde', horario: 'Manhã, 8h-11h', motivo: 'Agendamentos do dia' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 180px', gap: 16, alignItems: 'center', padding: '12px 20px', borderRadius: 8, background: i % 2 === 0 ? 'rgba(172,248,0,0.02)' : 'transparent' }}>
                                <strong style={{ color: '#fff' }}>{item.seg}</strong>
                                <span style={{ color: '#acf800', fontWeight: 700 }}>{item.horario}</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{item.motivo}</span>
                            </div>
                        ))}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        <strong style={{ color: '#fff' }}>Frequência ideal:</strong> 1-2 mensagens por lead por semana. Acima disso, a taxa de denúncia sobe e a reputação cai.
                    </p>
                </div>
            </section>

            <section id="sec-6" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 6</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Teste A/B na Prática</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        A otimização contínua é o que separa operações medíocres de operações de elite. Teste sempre:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                        {[
                            { var: 'Tom da mensagem', test: 'Formal vs Conversacional vs Urgente' },
                            { var: 'Tipo de mídia', test: 'Imagem vs Vídeo vs Texto + Botão' },
                            { var: 'CTA', test: 'Botão de Link vs Resposta Rápida vs Link Solto' },
                            { var: 'Horário', test: 'Manhã (8h) vs Tarde (14h) vs Noite (20h)' },
                            { var: 'Segmento', test: 'Base completa vs Segmento frio vs Segmento quente' },
                        ].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }}>
                                <span style={{ minWidth: 180, fontWeight: 700, color: '#fff' }}>{item.var}</span>
                                <span>{item.test}</span>
                            </li>
                        ))}
                    </ul>
                    <div style={{ background: 'rgba(172,248,0,0.05)', borderRadius: 12, padding: 20, border: '1px solid rgba(172,248,0,0.1)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.95rem' }}>
                            📊 <strong style={{ color: '#acf800' }}>Case Real:</strong> Cliente de educação testou tom formal vs conversacional. O conversacional teve <strong style={{ color: '#fff' }}>340% mais cliques</strong>. Pequenas mudanças, grandes resultados.
                        </p>
                    </div>
                    <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        Com a <Link to="/" style={{ color: '#acf800' }}>Plug & Sales</Link>, você pode criar múltiplas variações de template e comparar resultados em tempo real no dashboard.
                    </p>
                </div>
            </section>

            <section id="sec-7" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 7</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Métricas que Importam</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Não se distraia com métricas de vaidade. Foque no que realmente impacta o resultado do seu negócio:
                    </p>
                    <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                        {[
                            { metrica: 'Custo por Lead (CPL)', foco: 'Quanto custa cada lead que converte' },
                            { metrica: 'ROI (Retorno sobre Investimento)', foco: 'Receita gerada ÷ Custo total da campanha' },
                            { metrica: 'Taxa de Conversão', foco: '% de leads que realizam a ação desejada' },
                            { metrica: 'Taxa de Clique (CTR)', foco: '% que clicou no CTA da mensagem' },
                            { metrica: 'Taxa de Denúncia', foco: 'Manter abaixo de 0,1% para saúde do número' },
                            { metrica: 'LTV (Valor do Tempo de Vida)', foco: 'Quanto cada cliente traz no longo prazo' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 20px', borderRadius: 8, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <strong style={{ color: '#fff' }}>{item.metrica}</strong>
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{item.foco}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Pronto para converter mais?</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>A infraestrutura certa para campanhas de alto desempenho.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        COMEÇAR AGORA 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero estratégias de conversão para meu disparo em massa." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={28} />
                <span className="wa-tooltip">Fale conosco</span>
            </a>

            <style>{`
                html { scroll-behavior: smooth; }
                @media (max-width: 768px) {
                    [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
                    [style*="grid-template-columns: 120px 1fr 1fr 60px"] { grid-template-columns: 1fr !important; gap: 6px; }
                    [style*="grid-template-columns: 120px 1fr 180px"] { grid-template-columns: 1fr !important; gap: 4px; }
                    [style*="grid-template-columns: 1fr 1fr"]:not([style*="120px"]) { grid-template-columns: 1fr !important; }
                    table { font-size: 0.8rem !important; }
                }
            `}</style>
        </div>
    );
};

export default EstrategiasConversao;
