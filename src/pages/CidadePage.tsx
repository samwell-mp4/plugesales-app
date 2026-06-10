import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { estados, getEstadoBySlug, getCidadeBySlug } from '../data/brazil';
import { MessageCircle, ChevronRight, MapPin, ShieldCheck, Zap, TrendingUp, CheckCircle, Star } from 'lucide-react';
import './LandingPage.css';

const CidadePage = () => {
  const { uf, cidade } = useParams<{ uf: string; cidade: string }>();
  const estado = getEstadoBySlug(uf || '');
  const cidadeData = getCidadeBySlug(cidade || '', uf || '');

  if (!estado || !cidadeData) {
    return (
      <div className="public-page-wrapper" style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h1>Cidade não encontrada</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>A cidade que você buscou não existe em nossa base.</p>
        <Link to="/" className="lp-btn lp-btn-primary">Voltar ao início</Link>
      </div>
    );
  }

  const sectionStyle = { padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
  const containerStyle: React.CSSProperties = { maxWidth: 800, margin: '0 auto', padding: '0 24px' };

  return (
    <div className="public-page-wrapper">
      <SEO
        title={`Disparo em Massa WhatsApp em ${cidadeData.nome} - ${estado.nome} | API Oficial | Plug & Sales`}
        description={`Empresa de disparo em massa no WhatsApp em ${cidadeData.nome}, ${estado.nome}. ${cidadeData.destaque}. API Oficial da Meta sem risco de bloqueio. Ative sua estrutura em 24h.`}
        canonical={`https://plugesales.com/servicos/disparo-em-massa-whatsapp/${estado.slug}/${cidadeData.slug}`}
        keywords={`disparo em massa whatsapp ${cidadeData.nome.toLowerCase()}, disparo whatsapp ${cidadeData.nome.toLowerCase()}, disparo em massa ${cidadeData.nome.toLowerCase()}, enviar mensagem em massa ${cidadeData.nome.toLowerCase()}, whatsapp disparo ${cidadeData.nome.toLowerCase()}, disparo em massa ${cidadeData.nome.toLowerCase()} ${estado.sigla.toLowerCase()}`}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com" },
              { "@type": "ListItem", "position": 2, "name": "Disparo em Massa WhatsApp", "item": "https://plugesales.com/servicos/disparo-em-massa-whatsapp" },
              { "@type": "ListItem", "position": 3, "name": `Disparo em ${estado.nome}`, "item": `https://plugesales.com/servicos/disparo-em-massa-whatsapp/${estado.slug}` },
              { "@type": "ListItem", "position": 4, "name": `Disparo em Massa em ${cidadeData.nome}`, "item": `https://plugesales.com/servicos/disparo-em-massa-whatsapp/${estado.slug}/${cidadeData.slug}` }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": `Disparo em Massa WhatsApp em ${cidadeData.nome}`,
            "description": `Serviço de disparo em massa no WhatsApp via API Oficial da Meta para empresas em ${cidadeData.nome}, ${estado.nome}. Envio seguro de milhares de mensagens por dia.`,
            "provider": { "@type": "Organization", "name": "Plug & Sales", "url": "https://plugesales.com" },
            "areaServed": { "@type": "City", "name": cidadeData.nome, "containedInPlace": { "@type": "State", "name": estado.nome } }
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": `Como fazer disparo em massa no WhatsApp em ${cidadeData.nome}?`, "acceptedAnswer": { "@type": "Answer", "text": `Com a Plug & Sales, você ativa sua estrutura de disparo em massa em ${cidadeData.nome} em até 24h. Utilizamos a API Oficial da Meta (WABA), sem risco de bloqueio.` } },
              { "@type": "Question", "name": `Qual a melhor empresa de disparo WhatsApp em ${cidadeData.nome}?`, "acceptedAnswer": { "@type": "Answer", "text": `A Plug & Sales é referência em disparo em massa em ${cidadeData.nome}. Oferecemos infraestrutura homologada pela Meta com templates multimídia.` } }
            ]
          }
        ]}
      />

      <section style={{ padding: 'clamp(120px, 18vh, 180px) 8% 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="lp-hero-tag animate-supreme-pulse" style={{ display: 'inline-flex', marginBottom: 16 }}>
            <MapPin size={14} /> DISPARO EM MASSA EM {cidadeData.nome.toUpperCase()}
          </div>
          <h1 className="lp-hero-title" style={{ textAlign: 'left', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Disparo em Massa no WhatsApp em <span className="text-gradient">{cidadeData.nome}</span>
          </h1>
          <p className="lp-hero-subtitle" style={{ textAlign: 'left', fontSize: '1.1rem', lineHeight: 1.8 }}>
            Sua empresa em {cidadeData.nome}, {estado.nome}, merece uma estrutura profissional de disparo em massa
            no WhatsApp. {cidadeData.destaque} Com a <strong style={{ color: '#acf800' }}>Plug & Sales</strong>,
            você ativa a API Oficial da Meta em até 24h — sem risco de bloqueio, sem Business Manager próprio,
            sem burocracia. Comece a enviar milhares de mensagens por dia agora mesmo.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={12} /> {estado.nome}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
              👥 {cidadeData.populacao} habitantes
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
            <Link to="/lead-flow" className="lp-btn lp-btn-primary ripple lp-btn-glow">
              ATIVAR EM {cidadeData.nome.toUpperCase()} 👉
            </Link>
            <Link to="/precos" className="lp-btn lp-btn-secondary" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              VER PLANOS
            </Link>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={containerStyle}>
          <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>SOBRE {cidadeData.nome.toUpperCase()}</span>
          <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>
            Disparo em Massa no WhatsApp em {cidadeData.nome}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
            {cidadeData.descricao}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: 24 }}>
            {cidadeData.nome} é um mercado estratégico para disparo em massa no WhatsApp. Com {cidadeData.populacao} habitantes,
            a cidade oferece um mercado consumidor significativo para empresas que querem escalar suas comunicações.
            A Plug & Sales está pronta para atender sua empresa em {cidadeData.nome} com a melhor infraestrutura
            de disparo via API Oficial da Meta.
          </p>
          <div style={{ background: 'rgba(172,248,0,0.03)', borderRadius: 16, padding: 24, border: '1px solid rgba(172,248,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Star size={18} color="#acf800" />
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>Diferencial {cidadeData.nome}</h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.95rem', lineHeight: 1.7 }}>
              {cidadeData.destaque} Com a API Oficial da Meta, sua empresa em {cidadeData.nome} pode enviar
              campanhas segmentadas com templates multimídia, botões de link e relatórios em tempo real.
              Tudo sem risco de bloqueio ou violação dos Termos de Serviço do WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: '2rem', margin: '16px 0 24px', color: '#fff' }}>
            Por que escolher a Plug & Sales em {cidadeData.nome}?
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { icon: <ShieldCheck color="#22c55e" size={18} />, title: 'API Oficial da Meta (WABA)', desc: `Sua empresa em ${cidadeData.nome} opera dentro das diretrizes oficiais do WhatsApp. Zero risco de bloqueio.` },
              { icon: <Zap color="#acf800" size={18} />, title: 'Ativação em 24h', desc: `Não precisa de Business Manager, configuração técnica ou aquecimento de número. Em 24h sua estrutura está pronta em ${cidadeData.nome}.` },
              { icon: <CheckCircle color="#22c55e" size={18} />, title: 'Planos a partir de R$ 97', desc: 'PC-10 Foundation Card: 10 mil disparos por R$ 97. Até PC-500 Apex Card: 500 mil disparos. Pré-pago, sem surpresas.' },
              { icon: <TrendingUp color="#acf800" size={18} />, title: 'Suporte dedicado em português', desc: 'Equipe brasileira pronta para ajudar sua empresa em todas as etapas, da ativação à otimização de campanhas.' },
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
          <h2 style={{ fontSize: '1.5rem', marginBottom: 16, color: '#fff' }}>Serviços disponíveis em {cidadeData.nome}</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <Link to="/servicos/disparo-em-massa-whatsapp" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(172,248,0,0.06)', textDecoration: 'none', transition: '0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.06)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.02)' }}>
              <Zap size={18} color="#acf800" /> <span style={{ color: '#fff', flex: 1 }}>Disparo em Massa WhatsApp</span> <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
            </Link>
            <Link to="/servicos/api-oficial-whatsapp" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(172,248,0,0.06)', textDecoration: 'none', transition: '0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.06)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.02)' }}>
              <ShieldCheck size={18} color="#22c55e" /> <span style={{ color: '#fff', flex: 1 }}>API Oficial WhatsApp (WABA)</span> <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
            </Link>
            <Link to="/servicos/chatbot-whatsapp" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, background: 'rgba(172,248,0,0.02)', border: '1px solid rgba(172,248,0,0.06)', textDecoration: 'none', transition: '0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.06)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(172,248,0,0.02)' }}>
              <MessageCircle size={18} color="#3b82f6" /> <span style={{ color: '#fff', flex: 1 }}>Chatbot Inteligente WhatsApp</span> <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
            </Link>
          </div>
        </div>
      </section>

      <section style={{ ...sectionStyle, borderBottom: 'none' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 24, color: '#fff' }}>Perguntas Frequentes sobre Disparo em {cidadeData.nome}</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { q: `Como contratar disparo em massa em ${cidadeData.nome}?`, a: `Basta acessar o site da Plug & Sales e solicitar ativação. Em até 24h sua estrutura de disparo via API Oficial da Meta está funcionando em ${cidadeData.nome}.` },
              { q: `Qual o valor do disparo em massa em ${cidadeData.nome}?`, a: `Os planos começam em R$ 97 para 10 mil disparos (PC-10 Foundation Card). Consulte nossa página de preços para mais opções.` },
              { q: `Atende empresas em ${cidadeData.nome} de qualquer porte?`, a: `Sim. Atendemos desde microempresas locais até grandes corporações em ${cidadeData.nome}. Cada plano é pensado para um volume diferente.` },
              { q: `Precisa de estrutura local em ${cidadeData.nome}?`, a: `Não. Toda a infraestrutura de disparo é online, via nuvem. Sua empresa em ${cidadeData.nome} só precisa de acesso à internet.` },
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
            Ative sua estrutura em {cidadeData.nome} agora
          </h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 40, opacity: 0.8 }}>
            A partir de R$ 97. Zero risco de bloqueio. Ativação em 24h.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/lead-flow" className="lp-btn lp-btn-large" style={{ background: '#000', color: '#acf800' }}>
              ATIVAR EM {cidadeData.nome.toUpperCase()} 👉
            </Link>
            <Link to="/precos" className="lp-btn lp-btn-large" style={{ background: 'transparent', color: '#000', border: '2px solid #000' }}>
              VER PLANOS
            </Link>
          </div>
        </div>
      </section>

      <Link
        to={`/servicos/disparo-em-massa-whatsapp/${estado.slug}`}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '16px', background: 'rgba(172,248,0,0.03)', color: '#acf800', textDecoration: 'none',
          fontSize: '0.95rem', borderTop: '1px solid rgba(172,248,0,0.08)'
        }}
      >
        <ChevronRight size={14} /> Ver todas as cidades de {estado.nome}
      </Link>

      <a href={`https://wa.me/5531983994058?text=Olá! Quero fazer disparo em massa no WhatsApp em ${cidadeData.nome}.`} className="lp-floating-wa" target="_blank" rel="noopener noreferrer">
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

export default CidadePage;
