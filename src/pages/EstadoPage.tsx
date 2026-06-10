import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { estados, getEstadoBySlug, getCidadesByEstado } from '../data/brazil';
import { MessageCircle, ChevronRight, ShieldCheck, Zap, TrendingUp, Building2, MapPin, CheckCircle } from 'lucide-react';
import './LandingPage.css';

const EstadoPage = () => {
  const { uf } = useParams<{ uf: string }>();
  const estado = getEstadoBySlug(uf || '');

  if (!estado) {
    return (
      <div className="public-page-wrapper" style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h1>Estado não encontrado</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>O estado que você buscou não existe em nossa base.</p>
        <Link to="/" className="lp-btn lp-btn-primary">Voltar ao início</Link>
      </div>
    );
  }

  const cidadesEstado = getCidadesByEstado(estado.sigla);
  const cidadeCards = [
    { nome: estado.capital, slug: estado.capital_slug, destaque: `Capital de ${estado.nome}` },
    ...cidadesEstado.filter(c => c.slug !== estado.capital_slug).map(c => ({ nome: c.nome, slug: c.slug, destaque: c.destaque }))
  ];
  const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
  const containerStyle: React.CSSProperties = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

  const cidadeSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": cidadeCards.slice(0, 10).map((c, i) => ({
      "@type": "ListItem", "position": i + 1,
      "name": `Disparo em Massa WhatsApp em ${c.nome} - ${estado.nome}`,
      "url": `https://plugesales.com/servicos/disparo-em-massa-whatsapp/${estado.slug}/${c.slug}`
    }))
  };

  return (
    <div className="public-page-wrapper">
      <SEO
        title={`Disparo em Massa WhatsApp em ${estado.nome} | API Oficial | Plug & Sales`}
        description={`Empresa de disparo em massa no WhatsApp em ${estado.nome}. ${estado.descricao_curta} API Oficial da Meta sem risco de bloqueio. Ative em 24h.`}
        canonical={`https://plugesales.com/servicos/disparo-em-massa-whatsapp/${estado.slug}`}
        keywords={`disparo em massa whatsapp ${estado.sigla.toLowerCase()}, disparo whatsapp ${estado.nome}, disparo em massa ${estado.nome}, enviar mensagem em massa ${estado.sigla.toLowerCase()}, whatsapp disparo ${estado.sigla.toLowerCase()}, api oficial whatsapp ${estado.nome}, empresa de disparo whatsapp ${estado.nome}`}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
              { "@type": "ListItem", "position": 2, "name": "Disparo em Massa WhatsApp", "item": "https://plugesales.com/servicos/disparo-em-massa-whatsapp" },
              { "@type": "ListItem", "position": 3, "name": `Disparo em Massa WhatsApp em ${estado.nome}`, "item": `https://plugesales.com/servicos/disparo-em-massa-whatsapp/${estado.slug}` }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": `Disparo em Massa WhatsApp em ${estado.nome}`,
            "description": `Serviço de disparo em massa no WhatsApp via API Oficial da Meta para empresas em ${estado.nome}. Envio de milhares de mensagens por dia sem bloqueio.`,
            "provider": { "@type": "Organization", "name": "Plug & Sales", "url": "https://plugesales.com" },
            "areaServed": { "@type": "State", "name": estado.nome, "sameAs": `https://pt.wikipedia.org/wiki/${estado.nome}` }
          },
          cidadeSchema,
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": `Como fazer disparo em massa no WhatsApp em ${estado.nome}?`, "acceptedAnswer": { "@type": "Answer", "text": `Com a Plug & Sales, você ativa sua estrutura de disparo em massa em ${estado.nome} em até 24h. Utilizamos a API Oficial da Meta (WABA), sem risco de bloqueio.` } },
              { "@type": "Question", "name": `Qual a melhor empresa de disparo WhatsApp em ${estado.nome}?`, "acceptedAnswer": { "@type": "Answer", "text": `A Plug & Sales é a melhor opção para disparo em massa em ${estado.nome}. Oferecemos infraestrutura homologada pela Meta, templates multimídia e relatórios em tempo real.` } },
              { "@type": "Question", "name": `Quanto custa disparo em massa no WhatsApp em ${estado.nome}?`, "acceptedAnswer": { "@type": "Answer", "text": `Os planos começam em R$ 97 para 10 mil disparos. Não há taxa de setup ou mensalidade. Pagamento pré-pago, sem surpresas.` } }
            ]
          }
        ]}
      />

      <section style={{ padding: 'clamp(120px, 18vh, 180px) 8% 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex', marginBottom: 16 }}>
            <MapPin size={14} /> DISPARO EM MASSA EM {estado.nome.toUpperCase()}
          </div>
          <h1 className="lp-hero-title" style={{ textAlign: 'left', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Disparo em Massa no WhatsApp em <span className="text-gradient">{estado.nome}</span>
          </h1>
          <p className="lp-hero-subtitle" style={{ textAlign: 'left', fontSize: '1.1rem', lineHeight: 1.8 }}>
            Sua empresa em {estado.nome} merece uma estrutura profissional de disparo em massa no WhatsApp.
            {estado.descricao_curta} Com a <strong style={{ color: '#acf800' }}>Plug & Sales</strong>,
            você ativa a API Oficial da Meta em até 24h e começa a enviar milhares de mensagens por dia
            sem risco de bloqueio, sem precisar de Business Manager próprio.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
            <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
              ATIVAR DISPARO EM {estado.nome.toUpperCase()} 👉
            </Link>
            <Link to="/precos" className="lp-btn lp-btn-secondary" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              VER PLANOS
            </Link>
          </div>
        </div>
      </section>

      <section id="economia" style={sectionStyle}>
        <div style={containerStyle}>
          <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>SOBRE {estado.nome.toUpperCase()}</span>
          <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Mercado de Disparo em Massa em {estado.nome}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
            {estado.descricao}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32 }}>
            <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 16, padding: 24, border: '1px solid rgba(172,248,0,0.08)' }}>
              <Building2 size={20} color="#acf800" style={{ marginBottom: 12 }} />
              <h3 style={{ color: '#fff', marginBottom: 8, fontSize: '1.1rem' }}>Economia</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7 }}>{estado.economia}</p>
            </div>
            <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 16, padding: 24, border: '1px solid rgba(172,248,0,0.08)' }}>
              <TrendingUp size={20} color="#acf800" style={{ marginBottom: 12 }} />
              <h3 style={{ color: '#fff', marginBottom: 8, fontSize: '1.1rem' }}>Indústrias</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7 }}>{estado.industria}</p>
            </div>
            <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 16, padding: 24, border: '1px solid rgba(172,248,0,0.08)' }}>
              <MapPin size={20} color="#acf800" style={{ marginBottom: 12 }} />
              <h3 style={{ color: '#fff', marginBottom: 8, fontSize: '1.1rem' }}>Capital</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7 }}>{estado.capital}</p>
            </div>
            <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 16, padding: 24, border: '1px solid rgba(172,248,0,0.08)' }}>
              <Zap size={20} color="#acf800" style={{ marginBottom: 12 }} />
              <h3 style={{ color: '#fff', marginBottom: 8, fontSize: '1.1rem' }}>População</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7 }}>{estado.populacao} habitantes | PIB: {estado.pib}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="cidades" style={sectionStyle}>
        <div style={containerStyle}>
          <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>CIDADES ATENDIDAS</span>
          <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Disparo em Massa nas Cidades de {estado.nome}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
            Atendemos empresas em todas as regiões de {estado.nome}. Confira as principais cidades onde já oferecemos
            infraestrutura de disparo em massa no WhatsApp via API Oficial da Meta:
          </p>
          <div style={{ display: 'grid', gap: 16 }}>
            {cidadeCards.map((cidade, i) => (
              <Link
                key={i}
                to={`/servicos/disparo-em-massa-whatsapp/${estado.slug}/${cidade.slug}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                  borderRadius: 12, background: 'rgba(172,248,0,0.02)',
                  border: '1px solid rgba(172,248,0,0.06)', textDecoration: 'none',
                  transition: '0.3s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.06)'; e.currentTarget.style.borderColor = 'rgba(172,248,0,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.02)'; e.currentTarget.style.borderColor = 'rgba(172,248,0,0.06)' }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(172,248,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MapPin size={18} color="#acf800" />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', display: 'block' }}>{cidade.nome}</span>
                  {cidade.destaque && (
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{cidade.destaque}</span>
                  )}
                </div>
                <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
              </Link>
            ))}
          </div>
          {cidadesEstado.length === 0 && (
            <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 12, padding: 20, border: '1px solid rgba(172,248,0,0.08)', marginTop: 16 }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.95rem' }}>
                Ainda não listamos cidades específicas em {estado.nome}, mas atendemos empresas em todo o estado.
                <Link to="/lead-flow" style={{ color: '#acf800', marginLeft: 8 }}>Entre em contato →</Link>
              </p>
            </div>
          )}
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>Por que usar API Oficial em {estado.nome}?</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'Zero risco de bloqueio', desc: `Diferente de ferramentas não-oficiais, a API Oficial da Meta é homologada e segura. Sua operação em ${estado.nome} não corre risco de banimento.` },
              { icon: <Zap color="#acf800" size={18} />, title: 'Milhares de mensagens por dia', desc: 'Capacidade de enviar de 10 mil a 500 mil+ mensagens por dia, sem limites artificiais. Escala real para sua empresa.' },
              { icon: <CheckCircle color="#22c55e" size={18} />, title: 'Templates multimídia com botões', desc: 'Imagem, vídeo, áudio, documento e botões de link. Suas campanhas em disparo em massa com aparência profissional.' },
              { icon: <TrendingUp color="#acf800" size={18} />, title: 'Relatórios em tempo real', desc: 'Acompanhe entregas, aberturas, cliques e conversões de cada campanha diretamente do dashboard.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                <div>
                  <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1.05rem' }}>{item.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'rgba(172,248,0,0.03)', padding: '40px 0', borderTop: '1px solid rgba(172,248,0,0.08)', borderBottom: '1px solid rgba(172,248,0,0.08)' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 24, color: '#fff' }}>Perguntas Frequentes sobre Disparo em Massa em {estado.nome}</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { q: `Como ativar disparo em massa no WhatsApp em ${estado.nome}?`, a: `Basta entrar em contato com a Plug & Sales. Em até 24h sua estrutura de disparo via API Oficial da Meta está ativa. Sem burocracia, sem configuração técnica.` },
              { q: `Preciso de CNPJ em ${estado.nome} para contratar?`, a: `Sim, é necessário ter CNPJ ativo. Atendemos empresas de todos os portes em ${estado.nome}.` },
              { q: `Qual o volume mínimo de disparo em ${estado.nome}?`, a: `O mínimo é de 10 mil contatos por disparo. Não há limite máximo — sua empresa pode escalar conforme necessário.` },
              { q: `Como funciona o pagamento em ${estado.nome}?`, a: `O pagamento é pré-pago via Plug Cards. Você escolhe o plano ideal, paga e já pode disparar. Sem taxas mensais ou surpresas.` },
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
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 24 }}>
            Ative sua estrutura em {estado.nome} agora
          </h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>
            A partir de R$ 97. Sem risco de bloqueio. Ativação em 24h.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
              ATIVAR AGORA EM {estado.nome.toUpperCase()} 👉
            </Link>
            <Link to="/precos" className="lp-btn lp-btn-large" style={{ background: 'transparent', color: '#000', border: '2px solid #000' }}>
              VER PLANOS
            </Link>
          </div>
        </div>
      </section>

      <a href="https://wa.me/5531983994058?text=Olá! Quero fazer disparo em massa no WhatsApp em {{estado.nome}}." className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
        <MessageCircle size={28} />
        <span className="wa-tooltip">Fale conosco</span>
      </a>

      <style>{`
        html { scroll-behavior: smooth; }
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default EstadoPage;
