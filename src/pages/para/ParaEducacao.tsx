import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { GraduationCap, TrendingUp, MessageCircle, Check, Zap, Users, BookOpen, ArrowRight, Star } from 'lucide-react';
import '../LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Para Educação", "item": "https://plugesales.com/para/educacao" },
        { "@type": "ListItem", "position": 3, "name": "Disparo em Massa WhatsApp para Educação", "item": "https://plugesales.com/para/educacao" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        { "@type": "Question", "name": "Como o WhatsApp ajuda instituições de ensino?", "acceptedAnswer": { "@type": "Answer", "text": "O WhatsApp permite disparar campanhas sazonais de matrícula, enviar lembretes de boleto, compartilhar materiais didáticos e manter contato com alunos e responsáveis com taxa de abertura de 98%." } },
        { "@type": "Question", "name": "Posso enviar boletos por WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. A API Oficial permite templates com botão de link para o boleto. Taxa de pagamento em dia aumenta até 30%." } },
        { "@type": "Question", "name": "WhatsApp ajuda a aumentar matrículas?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. Campanhas sazonais de matrícula via WhatsApp têm taxa de conversão de até 40%, contra 5-10% de outros canais." } },
        { "@type": "Question", "name": "É seguro enviar materiais didáticos por WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "Sim, a API Oficial suporta envio de documentos (PDF, Word) com segurança e confiabilidade." } }
    ]
};

const ParaEducacao = () => {
    const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
    const containerStyle = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

    return (
        <div className="public-page-wrapper">
            <SEO
                title="Disparo em Massa WhatsApp para Educação | API Oficial | Plug & Sales"
                description="Aumente matrículas e engajamento com disparo em massa no WhatsApp para instituições de ensino. Campanhas sazonais, lembretes de boleto e comunicação com alunos via API Oficial."
                canonical="https://plugesales.com/para/educacao"
                keywords="whatsapp educação, disparo em massa escola, matrícula whatsapp, comunicação escolar whatsapp, instituição ensino whatsapp"
                schema={[breadcrumbSchema, faqSchema]}
            />

            <section className="lp-section" style={{ padding: 'clamp(140px, 20vh, 220px) 8% 80px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <GraduationCap size={14} /> PARA EDUCAÇÃO
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center' }}>
                        Disparo em Massa no WhatsApp <span className="text-gradient">para Educação</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 32px', textAlign: 'center' }}>
                        Aumente matrículas, reduza inadimplência e engaje alunos com comunicação via API Oficial da Meta. Campanhas segmentadas com taxa de abertura de 98%.
                    </p>
                    <div className="lp-cta-group" style={{ justifyContent: 'center' }}>
                        <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
                            QUERO PARA MINHA INSTITUIÇÃO 👉
                        </Link>
                    </div>
                </div>
            </section>

            <section id="sec-1" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 1</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Por que WhatsApp para Educação?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Instituições de ensino enfrentam desafios únicos de comunicação: campanhas sazonais de matrícula, inadimplência, evasão escolar e necessidade de engajar alunos e responsáveis.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O WhatsApp resolve tudo isso com <strong style={{ color: '#acf800' }}>98% de taxa de abertura</strong>. Diferente de SMS (custo alto) ou e-mail (ignorado), o WhatsApp garante que sua mensagem seja lida em minutos.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 32 }}>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>98%</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Taxa de abertura</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>40%</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Conversão matrícula</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>30%</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>+ pagamentos em dia</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>5x</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Menos evasão</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="sec-2" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 2</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Fluxos de Comunicação para Educação</h2>
                    <div style={{ display: 'grid', gap: 20 }}>
                        {[
                            { icon: '📚', title: 'Campanhas de Matrícula', desc: 'Dispare para leads e ex-alunos com oferta de rematrícula, bolsas e condições especiais. Botão "MATRICULAR AGORA" com link direto.' },
                            { icon: '💳', title: 'Lembretes de Boleto', desc: 'Alunos inadimplentes recebem lembrete com link do boleto. Taxa de pagamento em dia aumenta até 30%. Reduz inadimplência drasticamente.' },
                            { icon: '📖', title: 'Materiais Didáticos', desc: 'Envie PDFs, apostilas e avisos diretamente para grupos de alunos ou individualmente. Sem perder na bagunça do e-mail.' },
                            { icon: '📅', title: 'Comunicados e Avisos', desc: 'Calendário de provas, feriados, eventos e reuniões de pais. Todo mundo recebe e todo mundo vê.' },
                            { icon: '⭐', title: 'Pesquisa de Satisfação', desc: 'Após cada período, dispare pesquisa NPS. Use os dados para melhorar a experiência do aluno e reduzir evasão.' },
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

            <section id="sec-3" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 3</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Campanhas Sazonais de Matrícula</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O período de matrículas é o momento mais crítico do ano para instituições de ensino. Com o disparo em massa via WhatsApp, você cria uma sequência automatizada que maximiza conversão:
                    </p>
                    <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                        {[
                            { step: '1', title: 'Pré-matrícula (45 dias antes)', desc: 'Disparo para base de leads e ex-alunos: "Matrículas abertas! Garanta sua vaga com 20% de desconto até [data]."' },
                            { step: '2', title: 'Matrícula (30 dias antes)', desc: 'Oferta principal com botão de link direto para matrícula online. Segmentação por curso e período.' },
                            { step: '3', title: 'Últimos dias (15 dias antes)', desc: 'Urgência: "Últimos dias para garantir o desconto! Vagas limitadas." Escassez real aciona compra.' },
                            { step: '4', title: 'Pós-matrícula', desc: 'Boas-vindas: "Matrícula confirmada! Aqui estão as informações do seu curso." Reduz evasão de desistência.' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 20, padding: 20, borderRadius: 16, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#acf800', minWidth: 50, lineHeight: 1 }}>{item.step}</div>
                                <div>
                                    <h3 style={{ color: '#fff', marginBottom: 4 }}>{item.title}</h3>
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
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Redução de Inadimplência</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        A inadimplência é um dos maiores problemas de instituições de ensino. O WhatsApp resolve com comunicação direta e efetiva:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                        {[
                            { acao: 'Lembrete 5 dias antes do vencimento', res: '30% dos alunos pagam antes do prazo' },
                            { acao: 'Aviso no dia do vencimento', res: 'Mais 25% pagam no dia' },
                            { acao: 'Notificação 5 dias após vencimento', res: 'Recupera mais 20% dos inadimplentes' },
                            { acao: 'Oferta de parcelamento no 15º dia', res: 'Recupera mais 15%' },
                        ].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }}>
                                <span style={{ flex: 1 }}>📌 {item.acao}</span>
                                <span style={{ color: '#22c55e', fontWeight: 700, minWidth: 120, textAlign: 'right' }}>{item.res}</span>
                            </li>
                        ))}
                    </ul>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        <strong style={{ color: '#acf800' }}>Resultado:</strong> Sequência automatizada de 4 mensagens recupera até 90% dos inadimplentes. Sem constrangimento, sem ligação, sem custo operacional.
                    </p>
                </div>
            </section>

            <section id="sec-5" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 5</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Case de Sucesso: Faculdade EAD</h2>
                    <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 16, padding: 32, border: '1px solid rgba(172,248,0,0.1)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', fontStyle: 'italic', marginBottom: 24 }}>
                            "Usamos a Plug & Sales para nossa campanha de rematrícula. O resultado superou todas as expectativas: 40% de conversão na campanha de matrícula, 65% de redução na inadimplência e ROI de 12x no primeiro semestre."
                        </p>
                        <div style={{ fontWeight: 700, color: '#acf800' }}>— Diretor de Marketing, Faculdade EAD</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 32 }}>
                        <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'rgba(172,248,0,0.02)' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#acf800' }}>40%</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Conversão matrícula</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'rgba(172,248,0,0.02)' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#acf800' }}>65%</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Menos inadimplência</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'rgba(172,248,0,0.02)' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#acf800' }}>12x</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>ROI no semestre</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'rgba(172,248,0,0.02)' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#acf800' }}>5.000+</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>alunos impactados</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Transforme a comunicação da sua instituição</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Dezenas de instituições de ensino já aumentam matrículas com a Plug & Sales.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        ATIVAR AGORA 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero saber mais sobre disparo em massa para educação." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
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

export default ParaEducacao;
