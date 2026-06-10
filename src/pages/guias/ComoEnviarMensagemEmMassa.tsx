import SEO from '../../components/SEO';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, MessageCircle, Zap, ShieldCheck, AlertTriangle, Download, Smartphone, Globe, FileText } from 'lucide-react';
import '../LandingPage.css';

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
        { "@type": "ListItem", "position": 2, "name": "Guia", "item": "https://plugesales.com/guia/como-enviar-mensagem-em-massa-whatsapp" },
        { "@type": "ListItem", "position": 3, "name": "Como Enviar Mensagem em Massa no WhatsApp", "item": "https://plugesales.com/guia/como-enviar-mensagem-em-massa-whatsapp" }
    ]
};

const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Como enviar mensagem em massa no WhatsApp",
    "description": "Guia passo a passo para enviar mensagens em massa no WhatsApp de forma segura e profissional usando a API Oficial da Meta.",
    "step": [
        { "@type": "HowToStep", "position": 1, "name": "Escolha entre WhatsApp Business e API Oficial", "text": "Para uso profissional com mais de 256 contatos, escolha a API Oficial da Meta (WABA) através de um BSP como a Plug & Sales." },
        { "@type": "HowToStep", "position": 2, "name": "Crie sua conta no BSP", "text": "Cadastre-se na Plug & Sales. Não precisa de Business Manager próprio nem configuração técnica." },
        { "@type": "HowToStep", "position": 3, "name": "Prepare sua lista de contatos", "text": "Organize sua base com nomes, telefones com DDD e dados de personalização. Todos os contatos precisam ter opt-in (consentimento)." },
        { "@type": "HowToStep", "position": 4, "name": "Crie os templates de mensagem", "text": "Desenvolva mensagens com texto, imagem, vídeo ou botões. Os templates passam por aprovação da Meta em até 48h." },
        { "@type": "HowToStep", "position": 5, "name": "Dispare e acompanhe resultados", "text": "Envie sua campanha e monitore entregas, aberturas e cliques em tempo real no dashboard." }
    ]
};

const ComoEnviarMensagemEmMassa = () => {
    const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
    const containerStyle = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

    return (
        <div className="public-page-wrapper">
            <SEO
                title="Como Enviar Mensagem em Massa no WhatsApp | Tutorial Passo a Passo 2026"
                description="Aprenda como enviar mensagem em massa no WhatsApp do jeito certo. Tutorial completo com passo a passo, ferramentas, dicas de segmentação e como evitar bloqueio."
                canonical="https://plugesales.com/guia/como-enviar-mensagem-em-massa-whatsapp"
                schema={[breadcrumbSchema, howToSchema]}
                keywords="como enviar mensagem em massa no whatsapp, enviar whatsapp em massa, mandar mensagem em massa whatsapp, como enviar mensagens em massa no whatsapp, como mandar mensagens em massa no whatsapp"
            />

            <div className="lp-section" style={{ padding: 'clamp(120px, 18vh, 180px) 8% 60px', textAlign: 'center' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex' }}>
                        <MessageCircle size={14} /> TUTORIAL COMPLETO
                    </div>
                    <h1 className="lp-hero-title" style={{ textAlign: 'center', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Como Enviar Mensagem em Massa no <span className="text-gradient">WhatsApp</span>
                    </h1>
                    <p className="lp-hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 24px', textAlign: 'center', fontSize: '1.1rem' }}>
                        Aprenda o passo a passo completo para enviar mensagens em massa no WhatsApp de forma profissional, segura e sem risco de bloqueio. Do básico ao avançado.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>📖 12 min de leitura</span>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>📅 Atualizado Junho 2026</span>
                    </div>
                </div>
            </div>

            <section style={{ background: 'rgba(172,248,0,0.03)', padding: '40px 0', borderTop: '1px solid rgba(172,248,0,0.08)', borderBottom: '1px solid rgba(172,248,0,0.08)' }}>
                <div style={containerStyle}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: 20, color: '#acf800' }}>📑 Neste tutorial você vai aprender:</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {['As 3 formas de enviar mensagem em massa', 'WhatsApp Business vs API Oficial', 'Passo a passo detalhado com prints', 'Ferramentas recomendadas', 'Como enviar sem bloquear o número', 'Envio grátis vs profissional', 'Erros comuns que matam sua conversão', 'FAQ: perguntas frequentes'].map((item, i) => (
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
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>As 3 Formas de Enviar Mensagem em Massa no WhatsApp</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Existem três maneiras de enviar mensagens em massa no WhatsApp. Cada uma tem prós, contras e níveis de risco completamente diferentes:
                    </p>
                    <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(239,68,68,0.15)' }}>
                            <h3 style={{ color: '#ef4444', marginBottom: 8 }}>❌ Método 1: Lista de Transmissão (WhatsApp Comum)</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: 0 }}>
                                O WhatsApp comum permite criar listas de transmissão com até <strong>256 contatos</strong>. Só funciona se os contatos tiverem seu número salvo na agenda. Ideal apenas para comunicação pessoal ou micro-negócios. <strong>Não escala.</strong>
                            </p>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(239,68,68,0.15)' }}>
                            <h3 style={{ color: '#ef4444', marginBottom: 8 }}>❌ Método 2: Disparador Web (QR Code) — Risco de Bloqueio</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: 0 }}>
                                Ferramentas que automatizam o WhatsApp Web via QR Code. Elas violam os Termos de Serviço da Meta. O bloqueio do número é <strong>questão de tempo</strong>. Além disso, o limite é de 100-500 mensagens/dia. <strong>Não recomendado para empresas.</strong>
                            </p>
                        </div>
                        <div style={{ background: 'rgba(34,197,94,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(34,197,94,0.15)' }}>
                            <h3 style={{ color: '#22c55e', marginBottom: 8 }}>✅ Método 3: API Oficial da Meta (WABA) — O Único Profissional</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: 0 }}>
                                A WhatsApp Business API (WABA) é a solução oficial da Meta para envio em massa. <strong>Zero risco de bloqueio</strong>, escala de 1.000 a 100.000+ mensagens/dia, templates com botões e mídia. É o que empresas sérias usam. <Link to="/servicos/disparo-em-massa-whatsapp" style={{ color: '#acf800' }}>Saiba mais →</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="sec-2" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 2</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>WhatsApp Business vs API Oficial: Qual escolher?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
                        Muita gente confunde o <strong>WhatsApp Business app</strong> (gratuito, baixado na loja de apps) com a <strong>WhatsApp Business API</strong> (infraestrutura profissional). A diferença é enorme:
                    </p>
                    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(172,248,0,0.3)' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#acf800' }}>Funcionalidade</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>WhatsApp Business App</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#acf800' }}>API Oficial (WABA)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff' }}>Limite de transmissão</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>256 contatos</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>Ilimitado (100k+/dia)</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff' }}>Precisa de celular ligado</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#ef4444' }}>Sim</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>Não (roda no servidor)</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff' }}>Templates com botões</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#ef4444' }}>Não</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>Sim</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff' }}>Relatórios de entrega</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#ef4444' }}>Básico</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>Detalhado</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 16px', color: '#fff' }}>Risco de bloqueio</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>Baixo (uso normal)</td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#22c55e' }}>Zero</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        <strong style={{ color: '#fff' }}>Resumo:</strong> Para enviar mensagem em massa profissionalmente, a <strong style={{ color: '#acf800' }}>API Oficial</strong> é a única opção. O WhatsApp Business app é para atendimento individual, não para disparo em massa.
                    </p>
                </div>
            </section>

            <section id="sec-3" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 3</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Passo a Passo: Como Enviar Mensagem em Massa pela API Oficial</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
                        Siga este passo a passo para enviar sua primeira campanha de mensagem em massa de forma profissional:
                    </p>
                    {[
                        { num: '01', title: 'Escolha um BSP (Business Solution Provider)', desc: 'O primeiro passo é contratar um BSP homologado pela Meta. Com a <a href="/" style="color:#acf800;">Plug & Sales</a>, você não precisa de Business Manager próprio, configuração técnica ou aquecimento de números. A ativação leva 24h.', extra: '✅ <strong>Custo:</strong> A partir de R$ 97 (10 mil disparos). <a href="/precos" style="color:#acf800;">Ver planos →</a>' },
                        { num: '02', title: 'Prepare sua lista de contatos', desc: 'Organize uma planilha (CSV ou Excel) com os dados dos seus leads. Colunas recomendadas: Nome, Telefone (com DDD), Email, Cidade, Produto de Interesse. <strong>Importante:</strong> todos os contatos precisam ter autorizado o recebimento de mensagens (opt-in) — isso é obrigatório pela LGPD.', extra: '📋 <strong>Dica:</strong> Quanto mais dados de personalização, maior a taxa de conversão.' },
                        { num: '03', title: 'Crie seus templates de mensagem', desc: 'Desenvolva as mensagens que serão enviadas. Use um tom conversational e personalizado. Exemplo: "Olá {{1}}, vi seu interesse em {{2}}. Preparamos uma oferta especial!" Os templates precisam ser aprovados pela Meta (48h úteis).', extra: '🎯 <strong>Formatos:</strong> Texto, imagem, vídeo, áudio, documento, botão de link.' },
                        { num: '04', title: 'Submeta materiais para aprovação', desc: 'Envie os templates e a lista de contatos para nossa equipe. Revisamos sua campanha para garantir máxima taxa de entrega e conformidade com as políticas da Meta.', extra: '⏱️ <strong>Prazo:</strong> Aprovação em até 48h úteis.' },
                        { num: '05', title: 'Acompanhe os resultados', desc: 'Após o disparo, monitore em tempo real: quantas mensagens foram entregues, quantos abriram, quantos clicaram. Use esses dados para otimizar a próxima campanha.', extra: '📊 <strong>Métricas:</strong> Taxa de entrega, abertura, clique, conversão.' },
                    ].map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 24, marginBottom: 32, padding: 24, borderRadius: 16, background: i % 2 === 0 ? 'rgba(172,248,0,0.02)' : 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#acf800', minWidth: 60, lineHeight: 1 }}>{step.num}</div>
                            <div>
                                <h3 style={{ color: '#fff', marginBottom: 8, fontSize: '1.3rem' }}>{step.title}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: step.desc }}></p>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }} dangerouslySetInnerHTML={{ __html: step.extra }}></p>
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

            <section id="sec-4" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 4</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Ferramentas Recomendadas para Enviar Mensagem em Massa</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
                        Existem diversas ferramentas no mercado. Veja como elas se comparam:
                    </p>
                    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(172,248,0,0.3)' }}>
                                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#acf800' }}>Ferramenta</th>
                                    <th style={{ padding: '10px 14px', textAlign: 'center', color: '#acf800' }}>Tipo</th>
                                    <th style={{ padding: '10px 14px', textAlign: 'center', color: '#acf800' }}>Limite</th>
                                    <th style={{ padding: '10px 14px', textAlign: 'center', color: '#acf800' }}>Risco</th>
                                    <th style={{ padding: '10px 14px', textAlign: 'center', color: '#acf800' }}>Preço</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#acf800' }}>Plug & Sales</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>API Oficial</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>Ilimitado</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#22c55e' }}>Zero</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>R$ 97+</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fff' }}>WhatsApp Business App</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>App Gratuito</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>256 contatos</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#22c55e' }}>Baixo</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>Grátis</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fff' }}>Disparadores Web</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>Não-Oficial</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>100-500/dia</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#ef4444' }}>Alto</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>R$ 97-497/mês</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fff' }}>BSPs Tradicionais</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>API Oficial</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>Alto</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#22c55e' }}>Zero</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>R$ 200+/mês</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section id="sec-5" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 5</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Como Enviar Mensagem em Massa sem Bloquear o Número</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        O bloqueio é o maior medo de quem quer enviar mensagem em massa. A boa notícia é que <strong style={{ color: '#fff' }}>dá para evitar 100% dos bloqueios</strong> seguindo estas regras:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                        {[
                            { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Use a API Oficial, nunca disparador web', desc: 'Esta é a regra de ouro. A API Oficial é feita para automação. Disparadores web violam os ToS e são detectados.' },
                            { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Respeite os limites do seu Tier', desc: 'Não tente disparar 50.000 mensagens no dia 1. O crescimento gradual constrói reputação.' },
                            { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Mantenha taxa de denúncias abaixo de 0,1%', desc: 'Mensagens relevantes e com opt-out visível reduzem denúncias. Acima de 0,3%, você entra em zona de risco.' },
                            { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Use templates aprovados pela Meta', desc: 'Nunca dispare sem aprovação. Mensagens não-autorizadas são a causa #1 de bloqueios na API.' },
                            { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Inclua opt-out em todas as mensagens', desc: '"Responda SAIR para não receber mais" reduz denúncias e melhora sua reputação no sistema da Meta.' },
                        ].map((item, i) => (
                            <li key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                                <div>
                                    <strong style={{ color: '#fff' }}>{item.title}</strong>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: '4px 0 0' }}>{item.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        Na <Link to="/" style={{ color: '#acf800' }}>Plug & Sales</Link>, toda essa gestão de risco é feita automaticamente. Sua operação já começa em tiers elevados, com números aquecidos.
                    </p>
                </div>
            </section>

            <section id="sec-6" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 6</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Envio Grátis vs Profissional: O que você precisa saber</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 20 }}>
                        Muita gente busca "como enviar mensagem em massa no whatsapp business grátis". Entenda a diferença entre o que é grátis e o que é profissional:
                    </p>
                    <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 12, padding: 20, border: '1px solid rgba(172,248,0,0.1)' }}>
                            <h3 style={{ color: '#acf800', marginBottom: 8 }}>📱 WhatsApp Business App (Grátis)</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>✅ Gratuito para baixar e usar</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>❌ Limite de 256 contatos por transmissão</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>❌ Precisa de celular ligado 24h</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>❌ Sem templates ou botões</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(34,197,94,0.03)', borderRadius: 12, padding: 20, border: '1px solid rgba(34,197,94,0.15)' }}>
                            <h3 style={{ color: '#22c55e', marginBottom: 8 }}>⚡ API Oficial via Plug & Sales (Profissional)</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>✅ A partir de R$ 97 (10 mil disparos)</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>✅ Milhares de mensagens por dia</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>✅ Roda no servidor, sem celular</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>✅ Templates com botões, imagem, vídeo</li>
                                <li style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>✅ Zero risco de bloqueio</li>
                            </ul>
                        </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        Se você precisa enviar mensagem em massa profissionalmente, o investimento de R$ 97 se paga com a primeira venda recuperada. <strong style={{ color: '#acf800' }}>O "grátis" sai caro quando seu número é bloqueado.</strong>
                    </p>
                    <p><Link to="/comparacao/disparo-gratuito-vs-api-oficial" style={{ color: '#acf800' }}>Comparação completa: grátis vs oficial →</Link></p>
                </div>
            </section>

            <section id="sec-7" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CAPÍTULO 7</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Erros Comuns que Matam sua Conversão</h2>
                    <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
                        {[
                            { erro: 'Enviar para base não segmentada', conseq: 'Mensagens irrelevantes geram denúncias e desperdiçam créditos. Segmente por interesse e estágio do lead.' },
                            { erro: 'Mensagens genéricas sem personalização', conseq: '"Olá, confira nossas ofertas" tem fração da conversão de "Olá João, vi que você gostou do produto X".' },
                            { erro: 'Excesso de mensagens (mais de 2/semana)', conseq: 'A taxa de denúncia dispara e a reputação do número despenca. Qualidade > quantidade.' },
                            { erro: 'CTA fraco ou múltiplos CTAs', conseq: 'Um único botão claro converte 40% mais que mensagens com múltiplas opções.' },
                            { erro: 'Ignorar as métricas pós-disparo', conseq: 'Sem dados, você repete os mesmos erros. Acompanhe taxa de abertura, clique e conversão.' },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: 20, borderRadius: 12, background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)' }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <AlertTriangle color="#ef4444" size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <div>
                                        <h3 style={{ color: '#fff', marginBottom: 4, fontSize: '1rem' }}>{item.erro}</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>{item.conseq}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="sec-8" style={sectionStyle}>
                <div style={containerStyle}>
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>FAQ</span>
                    <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Perguntas Frequentes</h2>
                    <div style={{ display: 'grid', gap: 16 }}>
                        {[
                            { q: 'Como enviar mensagem em massa no WhatsApp Business grátis?', a: 'O WhatsApp Business App permite listas de transmissão de até 256 contatos gratuitamente. Para mais que isso, você precisa da API Oficial (paga).' },
                            { q: 'Quantas mensagens posso enviar por dia sem bloquear?', a: 'Na API Oficial, o limite vai de 1.000 a 100.000+ por dia conforme seu Tier. Na Plug & Sales, você começa em tiers elevados.' },
                            { q: 'Preciso de um chip para cada número?', a: 'Não. A API Oficial usa números virtuais na nuvem. Sem chips, sem celulares ligados.' },
                            { q: 'Qual a melhor ferramenta para enviar mensagem em massa?', a: 'A melhor ferramenta é um BSP homologado pela Meta. A Plug & Sales oferece o melhor custo-benefício do mercado.' },
                            { q: 'Como enviar mensagem em massa sem aparecer como spam?', a: 'Use a API Oficial, personalize as mensagens, inclua opt-out e respeite a frequência de 1-2x por semana.' },
                            { q: 'Tem como enviar mensagem em massa pelo WhatsApp Web?', a: 'Não oficialmente. Ferramentas que automatizam o WhatsApp Web violam os Termos de Serviço e podem bloquear seu número.' },
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
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>Pronto para enviar sua primeira campanha?</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>Ative sua estrutura em 24h. A partir de R$ 97.</p>
                    <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
                        COMEÇAR AGORA 👉
                    </Link>
                </div>
            </section>

            <a href="https://wa.me/5531983994058?text=Olá! Quero saber como enviar mensagem em massa no WhatsApp." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
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

export default ComoEnviarMensagemEmMassa;
