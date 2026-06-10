import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { Check, X, AlertTriangle, ShieldCheck, Zap, MessageCircle, TrendingUp, DollarSign } from 'lucide-react';
import '../LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Comparação", "item": "https://plugesales.com/comparacao/disparo-gratuito-vs-api-oficial" },
        { "@type": "ListItem", "position": 3, "name": "Disparo Grátis vs API Oficial", "item": "https://plugesales.com/comparacao/disparo-gratuito-vs-api-oficial" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        { "@type": "Question", "name": "Existe disparo em massa no WhatsApp grátis?", "acceptedAnswer": { "@type": "Answer", "text": "O WhatsApp Business App permite listas de transmissão para até 256 contatos gratuitamente. Para envio profissional para milhares de pessoas, é necessária a API Oficial, que é paga." } },
        { "@type": "Question", "name": "Qual a diferença entre disparador gratuito e API Oficial?", "acceptedAnswer": { "@type": "Answer", "text": "Disparadores gratuitos não-oficiais violam os Termos de Serviço da Meta e resultam em bloqueio. A API Oficial é homologada, segura e escalável." } },
        { "@type": "Question", "name": "Vale a pena pagar por disparo em massa?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. Com R$ 97 (10 mil disparos), o retorno é imediato. O custo de perder um número por usar ferramenta grátis é muito maior." } }
    ]
};

const DisparoGratuitoVsApiOficial = () => {
    const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
    const containerStyle = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

    return (
        <div className="public-page-wrapper">
            <SEO
                title="Disparo em Massa WhatsApp Grátis vs API Oficial: Qual escolher? | Plug & Sales"
                description="Comparação completa entre disparo em massa WhatsApp grátis e API Oficial da Meta. Entenda os riscos de ferramentas gratuitas e por que a API Oficial é a única opção profissional."
                canonical="https://plugesales.com/comparacao/disparo-gratuito-vs-api-oficial"
                keywords="disparo em massa whatsapp gratuito, disparador de mensagem whatsapp gratuito, como enviar mensagem em massa no whatsapp business grátis, disparo whatsapp grátis"
                schema={[breadcrumbSchema, faqSchema]}
            />

            <div className="lp-section" style={{ padding: 'clamp(120px, 18vh, 180px) 8% 60px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <DollarSign size={14} /> COMPARAÇÃO DEFINITIVA
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Disparo em Massa WhatsApp <span className="text-gradient">Grátis vs Oficial</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 24px', textAlign: 'center', fontSize: '1.1rem' }}>
                        Entenda de uma vez por todas a diferença entre enviar mensagem em massa de graça (e arriscar seu número) vs usar a API Oficial profissionalmente.
                    </p>
                </div>
            </div>

            <section id="sec-1" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 1</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>O Custo Oculto do "Grátis"</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Todo mundo gosta de algo grátis. Mas quando o assunto é disparo em massa no WhatsApp, o "grátis" pode custar muito caro. Veja por quê:
                    </p>
                    <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(239,68,68,0.15)' }}>
                            <h3 style={{ color: '#ef4444', marginBottom: 8 }}>❌ Disparador Web Grátis</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', marginBottom: 12 }}>
                                Ferramentas que prometem disparo grátis geralmente automatizam o WhatsApp Web. O custo real:
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>💀 Bloqueio permanente do número</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>⏳ Perda de toda base de contatos</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>📉 Operação parada por dias ou semanas</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>🔒 Sem suporte, sem garantia, sem recuperação</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(34,197,94,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(34,197,94,0.15)' }}>
                            <h3 style={{ color: '#22c55e', marginBottom: 8 }}>✅ API Oficial (a partir de R$ 97)</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', marginBottom: 12 }}>
                                A API Oficial tem custo, mas o retorno é imediato:
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>🛡️ Zero risco de bloqueio</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>📈 Milhares de mensagens/dia com segurança</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>🎯 Templates multimídia com botões</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>💰 ROI médio de 5x a 12x no primeiro mês</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>🇧🇷 Suporte em português</li>
                            </ul>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(172,248,0,0.05)', borderRadius: 12, padding: 20, border: '1px solid rgba(172,248,0,0.1)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.95rem' }}>
                            <strong style={{ color: '#acf800' }}>💰 Conta rápida:</strong> Com PC-10 Foundation Card (R$ 97), você envia 10 mil mensagens. Se apenas 2% converterem em vendas de R$ 50 cada, são <strong style={{ color: '#fff' }}>R$ 10.000 em receita</strong> — ROI de 10.000%.
                        </p>
                    </div>
                </div>
            </section>

            <section id="sec-2" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 2</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Comparação Lado a Lado</h2>
                    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(172,248,0,0.3)' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#acf800' }}>Característica</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#22c55e' }}>WhatsApp Business (Grátis)</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#ef4444' }}>Disparador Web Grátis</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>API Oficial (Plug & Sales)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff', fontWeight: 600 }}>Preço</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>Grátis</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>Grátis (risco alto)</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#acf800', fontWeight: 700 }}>R$ 97+</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff', fontWeight: 600 }}>Limite de envio</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>256 contatos</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>100-500/dia</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>Ilimitado</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff', fontWeight: 600 }}>Risco de bloqueio</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>Baixo</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#ef4444' }}>Altíssimo</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>Zero</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff', fontWeight: 600 }}>Templates multimídia</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#ef4444' }}>❌</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#ef4444' }}>❌</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>✅</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff', fontWeight: 600 }}>Relatórios</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>Básico</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#ef4444' }}>❌</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>✅ Detalhado</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff', fontWeight: 600 }}>Suporte</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>Comunidade</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>Limitado</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>Dedicado 🇧🇷</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section id="sec-3" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 3</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Quando o "Grátis" Realmente Funciona</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Existe um cenário onde o disparo grátis faz sentido: <strong style={{ color: '#fff' }}>micro-negócios com menos de 256 contatos.</strong> Se você tem uma base pequena e não pretende escalar, o WhatsApp Business App gratuito atende.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Mas se você:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                        {['Tem mais de 256 contatos na base', 'Quer escalar para milhares de disparos', 'Precisa de templates com botões e mídia', 'Não quer correr risco de perder o número', 'Quer relatórios detalhados de campanha', 'Precisa de suporte técnico em português'].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', color: 'rgba(255,255,255,0.7)' }}>
                                <Check size={14} color="#acf800" /> {item}
                            </li>
                        ))}
                    </ul>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        ...então você precisa da <strong style={{ color: '#acf800' }}>API Oficial</strong>. O investimento de R$ 97 é irrisório comparado ao custo de perder sua operação.
                    </p>
                </div>
            </section>

            <section id="sec-4" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 4</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>O Verdadeiro Custo de Usar Ferramenta Grátis</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Vamos fazer as contas do que acontece quando seu número é bloqueado por usar um disparador web gratuito:
                    </p>
                    <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                        {[
                            { item: 'Perda da base de contatos no WhatsApp', custo: 'R$ 0 — mas você perde todo o relacionamento' },
                            { item: 'Dias parado sem disparar', custo: 'R$ 5.000-50.000 em vendas perdidas' },
                            { item: 'Tempo para aquecer novo número', custo: '2-4 semanas sem escala' },
                            { item: 'Nova ferramenta (agora paga)', custo: 'R$ 97-497/mês' },
                            { item: 'Total do prejuízo estimado', custo: 'R$ 10.000-100.000+' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 20px', borderRadius: 8, background: i === 4 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)', border: i === 4 ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ flex: 1, color: 'rgba(255,255,255,0.7)' }}>{item.item}</span>
                                <span style={{ color: i === 4 ? '#ef4444' : 'rgba(255,255,255,0.5)', fontWeight: i === 4 ? 800 : 400, textAlign: 'right' }}>{item.custo}</span>
                            </div>
                        ))}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        <strong style={{ color: '#acf800' }}>Conclusão:</strong> O "grátis" no disparo em massa WhatsApp pode custar de R$ 10.000 a R$ 100.000+ para sua empresa. A API Oficial, a partir de R$ 97, é o seguro mais barato que você pode contratar. <Link to="/precos" style={{ color: '#acf800' }}>Ver planos →</Link>
                    </p>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Não arrisque seu negócio por economia</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Invista R$ 97 e tenha uma operação profissional e segura.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        COMEÇAR AGORA 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero entender a diferença entre disparo grátis e API Oficial." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={28} />
                <span className="wa-tooltip">Fale conosco</span>
            </a>

            <style>{`
                html { scroll-behavior: smooth; }
                @media (max-width: 768px) {
                    table { font-size: 0.75rem !important; }
                    table td, table th { padding: 6px 8px !important; }
                }
            `}</style>
        </div>
    );
};

export default DisparoGratuitoVsApiOficial;
