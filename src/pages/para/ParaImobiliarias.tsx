import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { Home, TrendingUp, MessageCircle, Check, Zap, Calendar, Users, ArrowRight, Star } from 'lucide-react';
import '../LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Para Imobiliárias", "item": "https://plugesales.com/para/imobiliarias" },
        { "@type": "ListItem", "position": 3, "name": "Disparo em Massa WhatsApp para Imobiliárias", "item": "https://plugesales.com/para/imobiliarias" }
    ]
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        { "@type": "Question", "name": "Como o WhatsApp pode ajudar imobiliárias?", "acceptedAnswer": { "@type": "Answer", "text": "O WhatsApp permite disparar novos imóveis para leads segmentados, agendar visitas automaticamente, enviar lembretes de compromissos e manter contato com clientes pós-venda. Taxa de abertura de 98%." } },
        { "@type": "Question", "name": "Posso enviar fotos e vídeos de imóveis pelo WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. A API Oficial suporta templates multimídia com imagens, vídeos e botões. Perfeito para tour virtual de imóveis." } },
        { "@type": "Question", "name": "Como agendar visitas automaticamente?", "acceptedAnswer": { "@type": "Answer", "text": "Com botões de resposta rápida, o lead pode selecionar dia e horário. A resposta é registrada no CRM automaticamente para o corretor acompanhar." } },
        { "@type": "Question", "name": "WhatsApp ajuda a vender mais imóveis?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. Imobiliárias que usam disparo segmentado reportam até 40% mais agendamentos e 25% mais fechamentos." } }
    ]
};

const ParaImobiliarias = () => {
    const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
    const containerStyle = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

    return (
        <div className="public-page-wrapper">
            <SEO
                title="Disparo em Massa WhatsApp para Imobiliárias | API Oficial | Plug & Sales"
                description="Aumente as vendas da sua imobiliária com disparo em massa no WhatsApp. Envie novos imóveis, agende visitas e mantenha contato com leads via API Oficial da Meta."
                canonical="https://plugesales.com/para/imobiliarias"
                keywords="whatsapp imobiliária, disparo em massa imobiliária, vendas imóveis whatsapp, agendar visita whatsapp, corretor whatsapp"
                schema={[breadcrumbSchema, faqSchema]}
            />

            <section className="lp-section" style={{ padding: 'clamp(140px, 20vh, 220px) 8% 80px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <Home size={14} /> PARA IMOBILIÁRIAS
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center' }}>
                        Disparo em Massa no WhatsApp <span className="text-gradient">para Imobiliárias</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 32px', textAlign: 'center' }}>
                        Envie novos imóveis para leads segmentados, agende visitas automaticamente e feche mais negócios com a API Oficial da Meta.
                    </p>
                    <div className="lp-cta-group" style={{ justifyContent: 'center' }}>
                        <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
                            QUERO PARA MINHA IMOBILIÁRIA 👉
                        </Link>
                    </div>
                </div>
            </section>

            <section id="sec-1" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 1</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Por que WhatsApp para Imobiliárias?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O mercado imobiliário é um dos que mais se beneficiam do WhatsApp. Com taxa de abertura de <strong style={{ color: '#acf800' }}>98%</strong>, suas ofertas de imóveis são realmente vistas. Diferente de e-mail (aberto por 20%) ou redes sociais (alcance orgânico em queda), o WhatsApp garante que sua mensagem chegue.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Para imobiliárias, isso significa: leads segmentados recebendo imóveis no perfil certo, visitas agendadas automaticamente e follow-up que realmente funciona.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 32 }}>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>98%</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Taxa de abertura</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>40%</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>+ agendamentos</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>3min</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Tempo médio de resposta</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 24, background: 'rgba(172,248,0,0.03)', borderRadius: 16, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800' }}>25%</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>+ fechamentos</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="sec-2" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 2</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Fluxos de Venda para Imobiliárias</h2>
                    <div style={{ display: 'grid', gap: 20 }}>
                        {[
                            { icon: '🏠', title: 'Novos Imóveis Segmentados', desc: 'Lead recebe foto + vídeo + ficha técnica do imóvel no perfil dele (bairro, faixa de preço, metragem). Botão "AGENDAR VISITA" direto na mensagem.' },
                            { icon: '📅', title: 'Agendamento Automático de Visitas', desc: 'Botões de resposta rápida: "Seg 10h", "Seg 14h", "Ter 10h". Lead clica, visita é registrada no CRM automaticamente.' },
                            { icon: '🔔', title: 'Lembrete de Visita', desc: '24h antes da visita, lead recebe lembrete automático com endereço, fotos e contato do corretor. Reduz absenteísmo em 60%.' },
                            { icon: '💬', title: 'Follow-up Pós-Visita', desc: 'Após a visita, disparo automático perguntando o que achou. Lead responde e corretor recebe alerta para dar continuidade.' },
                            { icon: '📊', title: 'Relatórios de Desempenho', desc: 'Saiba quantos leads receberam imóveis, quantos agendaram visita e quantos fecharam. Otimize suas campanhas.' },
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
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Segmentação de Leads Imobiliários</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O segredo do sucesso no mercado imobiliário é <strong style={{ color: '#fff' }}>enviar o imóvel certo para o lead certo</strong>. Nossa plataforma permite segmentar por:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                        {['Bairro ou região de interesse', 'Faixa de preço (aluguel ou compra)', 'Tipo de imóvel (apto, casa, comercial)', 'Metragem mínima e máxima', 'Número de quartos e vagas', 'Estágio do lead (buscando vs pronto para fechar)', 'Origem do lead (site, portaria, indicação)'].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }}>
                                <Check size={14} color="#acf800" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section id="sec-4" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 4</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Case de Sucesso: Imobiliária em MG</h2>
                    <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 16, padding: 32, border: '1px solid rgba(172,248,0,0.1)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', fontStyle: 'italic', marginBottom: 24 }}>
                            "Implementamos o disparo em massa via API Oficial com a Plug & Sales em toda nossa carteira de 12 corretores. O resultado em 60 dias foi transformador: agendamentos aumentaram 230% e o tempo médio de venda caiu de 90 para 45 dias."
                        </p>
                        <div style={{ fontWeight: 700, color: '#acf800' }}>— Diretor Comercial, Imobiliária em BH</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 32 }}>
                        <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'rgba(172,248,0,0.02)' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#acf800' }}>230%</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>+ agendamentos</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'rgba(172,248,0,0.02)' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#acf800' }}>90→45</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>dias para vender</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'rgba(172,248,0,0.02)' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#acf800' }}>60%</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>menos absenteísmo</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'rgba(172,248,0,0.02)' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#acf800' }}>12x</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>ROI no primeiro mês</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lp-section lp-urgency-section" style={{ background: 'var(--primary-gradient)', color: '#000' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Transforme sua imobiliária</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Mais de 50 imobiliárias já vendem mais com a Plug & Sales.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        ATIVAR AGORA 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero saber mais sobre disparo em massa para imobiliárias." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
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

export default ParaImobiliarias;
