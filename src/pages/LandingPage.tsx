import { useState, useEffect } from 'react';
import {
    MessageSquare,
    Zap,
    ShieldCheck,
    Smartphone,
    Plus,
    X,
    CheckCircle2,
    Lock,
    Users,
    TrendingUp,
    FileText,
    Image,
    Video,
    MousePointer2,
    ShieldAlert,
    AlertTriangle,
    Check
} from 'lucide-react';
import './LandingPage.css';
import DemoQuiz from '../components/DemoQuiz';

const LandingPage = () => {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const refId = query.get('ref') || query.get('affiliate');
        if (refId && refId !== 'null' && refId !== 'undefined') {
            sessionStorage.setItem('affiliate_id', refId);
            console.log("Affiliate ID stored in sessionStorage:", refId);
        }
    }, []);

    const getAffiliateId = () => {
        const fromSession = sessionStorage.getItem('affiliate_id');
        const query = new URLSearchParams(window.location.search);
        const refId = query.get('ref') || query.get('affiliate') || fromSession;
        
        const parsedRef = refId ? parseInt(refId) : null;
        return isNaN(parsedRef as number) ? null : parsedRef;
    };

    const finalAffiliateId = getAffiliateId();

    const faqs = [
        {
            q: "Meu número pode ser bloqueado?",
            a: "Não. A operação é feita dentro da API Oficial, seguindo as diretrizes da Meta, o que garante a segurança da sua conta."
        },
        {
            q: "Preciso de CNPJ?",
            a: "Sim, a API Oficial exige uma estrutura validada para garantir que sua empresa opere profissionalmente."
        },
        {
            q: "Quanto tempo leva para começar?",
            a: "A ativação é rápida e você já consegue iniciar os envios em pouco tempo após a aprovação da sua conta pela Meta."
        },
        {
            q: "Posso usar qualquer base de contatos?",
            a: "Sim, desde que seja uma base válida e dentro das boas práticas de envio, você pode importar qualquer volume de leads."
        }
    ];

    return (
        <div className="lp-container">
            {/* ── HEADER ── */}
            <header className="lp-header">
                <div className="lp-logo">
                    <div style={{ background: '#000', padding: '6px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                        <MessageSquare size={20} color="#acf800" fill="#acf800" />
                    </div>
                    Plug & Sales
                </div>

                <nav className="lp-nav">
                    <a href="#funciona" className="lp-nav-link">Como Funciona</a>
                    <a href="#testar" className="lp-btn lp-btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                        QUERO MINHA ESTRUTURA
                    </a>
                </nav>
            </header>

            {/* ── HERO ── */}
            <section className="lp-hero">
                <div className="lp-hero-content">
                    <div className="lp-hero-tag">
                        <Zap size={14} /> API OFICIAL WHATSAPP
                    </div>
                    <h1 className="lp-hero-title">
                        Ative sua base de leads no WhatsApp com a <span style={{ color: '#acf800' }}>API Oficial</span>
                    </h1>
                    <p className="lp-hero-subtitle">
                        Sem bloqueios e sem limite de escala. Para empresas com bases acima de 10 mil contatos que querem estrutura profissional, estabilidade e alta entrega.
                    </p>
                    <div className="lp-cta-group">
                        <a href="#testar" className="lp-btn lp-btn-primary ripple">
                            👉 Quero ativar minha estrutura oficial
                        </a>
                    </div>
                </div>

                <div className="lp-hero-mockup">
                    <img
                        src="https://iili.io/qshz9nt.jpg"
                        alt="Dashboard Mockup"
                        className="lp-mockup-frame"
                    />
                    <div className="lp-floating-stat">
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#acf800', marginBottom: '8px' }}>ENTREGAS GARANTIDAS</div>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>100.000+</div>
                        <div style={{ fontSize: '9px', color: '#22c55e', marginTop: '4px' }}>por número/dia</div>
                    </div>
                </div>
            </section>

            {/* ── IDENTIFICAÇÃO (PAIN POINTS) ── */}
            <section className="lp-section lp-pain-section">
                <div className="lp-section-header">
                    <h2 className="lp-section-title">Isso parece familiar?</h2>
                </div>
                <div className="lp-pain-grid">
                    <div className="lp-pain-card">
                        <AlertTriangle className="lp-pain-icon" />
                        <p>WhatsApp travando na hora de enviar?</p>
                    </div>
                    <div className="lp-pain-card">
                        <ShieldAlert className="lp-pain-icon" />
                        <p>Números sendo bloqueados com frequência?</p>
                    </div>
                    <div className="lp-pain-card">
                        <TrendingUp className="lp-pain-icon" style={{ transform: 'rotate(90deg)' }} />
                        <p>Limitado a poucos envios por dia?</p>
                    </div>
                    <div className="lp-pain-card">
                        <Lock className="lp-pain-icon" />
                        <p>Sua operação trava justamente quando precisa escalar?</p>
                    </div>
                </div>
                <div className="lp-pain-footer">
                    Se você trabalha com base de leads grande, isso não é um detalhe… <strong>é um gargalo.</strong>
                </div>
            </section>

            {/* ── MUDANÇA DE JOGO ── */}
            <section className="lp-section lp-alt-section">
                <div className="lp-game-changer">
                    <div className="lp-game-content">
                        <h2>Operações profissionais não usam WhatsApp comum.</h2>
                        <p>
                            Elas usam a <strong>API Oficial do WhatsApp</strong> para escalar envios com estabilidade, 
                            segurança e controle total da operação.
                        </p>
                        <div className="lp-highlight-box">
                            👉 O próximo nível não é tentar mais… é estruturar certo.
                        </div>
                    </div>
                </div>
            </section>

            {/* ── COMO FUNCIONA (4 STEPS) ── */}
            <section id="funciona" className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">PROCESSO SIMPLIFICADO</span>
                    <h2 className="lp-section-title">Como Funciona</h2>
                </div>

                <div className="lp-steps-grid-4">
                    <div className="lp-step-card-v2">
                        <div className="lp-step-tag">Passo 1</div>
                        <h3>Ativação</h3>
                        <p>Ativamos seu número na API Oficial (você escolhe DDD, nome e foto de perfil).</p>
                    </div>
                    <div className="lp-step-card-v2">
                        <div className="lp-step-tag">Passo 2</div>
                        <h3>Aprovação</h3>
                        <p>Criamos e aprovamos sua mensagem (template) diretamente na Meta.</p>
                    </div>
                    <div className="lp-step-card-v2">
                        <div className="lp-step-tag">Passo 3</div>
                        <h3>Prévia</h3>
                        <p>Você envia sua base de contatos e recebe uma prévia para aprovação.</p>
                    </div>
                    <div className="lp-step-card-v2">
                        <div className="lp-step-tag">Passo 4</div>
                        <h3>Disparo</h3>
                        <p>Disparamos para toda sua base com relatório completo de entregas.</p>
                    </div>
                </div>
            </section>

            {/* ── PROVA + AUTORIDADE ── */}
            <section className="lp-section lp-dark-section">
                <div className="lp-authority-grid">
                    <div className="lp-auth-item">
                        <CheckCircle2 color="#acf800" size={32} />
                        <div>
                            <h4>Números ilimitados</h4>
                            <p>Adicione quantos números precisar para sua operação.</p>
                        </div>
                    </div>
                    <div className="lp-auth-item">
                        <TrendingUp color="#acf800" size={32} />
                        <div>
                            <h4>100k envios/dia</h4>
                            <p>Escala liberada por número para grandes volumes.</p>
                        </div>
                    </div>
                    <div className="lp-auth-item">
                        <Smartphone color="#acf800" size={32} />
                        <div>
                            <h4>Estrutura Própria</h4>
                            <p>Infraestrutura preparada para alto volume sem lentidão.</p>
                        </div>
                    </div>
                    <div className="lp-auth-item">
                        <ShieldCheck color="#acf800" size={32} />
                        <div>
                            <h4>API Oficial</h4>
                            <p>Aprovada pela Meta, operando dentro das normas.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── O QUE VOCÊ PODE ENVIAR ── */}
            <section className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">POSSIBILIDADES</span>
                    <h2 className="lp-section-title">O que você pode enviar</h2>
                </div>
                <div className="lp-content-types">
                    <div className="lp-type-card"><FileText /> Texto</div>
                    <div className="lp-type-card"><Image /> Imagens</div>
                    <div className="lp-type-card"><Video /> Vídeos</div>
                    <div className="lp-type-card"><MousePointer2 /> Botões com Link</div>
                    <div className="lp-type-card"><Users /> Personalização</div>
                </div>
                <p style={{ textAlign: 'center', marginTop: '40px', opacity: 0.8 }}>
                    Tudo pronto para gerar ação imediata na sua base.
                </p>
            </section>

            {/* ── DIFERENCIAÇÃO ── */}
            <section className="lp-section lp-diff-section">
                <div className="lp-diff-content">
                    <h3>Bloqueios não acontecem por acaso.</h3>
                    <p>
                        Eles acontecem quando você usa ferramentas não oficiais, números sem preparo ou tenta escalar sem estrutura.
                    </p>
                    <p>
                        Aqui, você opera <strong>dentro da API Oficial</strong>, com uma estrutura feita exatamente para grandes volumes.
                    </p>
                    <a href="#testar" className="lp-btn lp-btn-primary" style={{ marginTop: '32px' }}>
                        👉 Quero escalar meus disparos com segurança
                    </a>
                </div>
            </section>

            {/* ── INTERACTIVE DEMO ── */}
            <section id="testar" className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">SIMULADOR</span>
                    <h2 className="lp-section-title">Experimente a ferramenta</h2>
                </div>
                <DemoQuiz affiliateId={finalAffiliateId} />
            </section>

            {/* ── PARA QUEM É / NÃO É ── */}
            <section className="lp-section">
                <div className="lp-audience-grid">
                    <div className="lp-audience-card is-for">
                        <h3>Para quem é:</h3>
                        <ul>
                            <li><Check size={16} /> Empresas com base de leads ativa</li>
                            <li><Check size={16} /> Operações com mais de 10 mil contatos</li>
                            <li><Check size={16} /> Quem quer escalar envios com consistência</li>
                            <li><Check size={16} /> Quem já tentou e enfrentou bloqueios</li>
                        </ul>
                    </div>
                    <div className="lp-audience-card isnt-for">
                        <h3>Para quem não é:</h3>
                        <ul>
                            <li><X size={16} /> Quem ainda não tem base de leads</li>
                            <li><X size={16} /> Quem busca soluções improvisadas</li>
                            <li><X size={16} /> Operações pequenas que não precisam escalar</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── URGÊNCIA ── */}
            <section className="lp-section lp-urgency-section">
                <div className="lp-urgency-content">
                    <p>
                        Se sua operação já passou dos 10 mil contatos, continuar usando WhatsApp comum está limitando diretamente seu crescimento.
                    </p>
                    <h3>Quanto mais você demora para estruturar isso, mais dinheiro deixa na mesa.</h3>
                    <a href="#testar" className="lp-btn lp-btn-primary lp-btn-large">
                        👉 Quero ativar minha estrutura agora
                    </a>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="lp-section">
                <div className="lp-section-header">
                    <span className="lp-section-tag">DÚVIDAS</span>
                    <h2 className="lp-section-title">Perguntas Frequentes</h2>
                </div>

                <div className="lp-faq-container">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`lp-faq-item ${activeFaq === i ? 'active' : ''}`} onClick={() => toggleFaq(i)}>
                            <div className="lp-faq-question">
                                {faq.q}
                                {activeFaq === i ? <X size={18} /> : <Plus size={18} />}
                            </div>
                            <div className="lp-faq-answer">
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="lp-footer">
                <div className="lp-logo" style={{ justifyContent: 'center', marginBottom: '32px' }}>
                    Plug & Sales
                </div>
                <div className="lp-footer-links">
                    <a href="#" className="lp-nav-link">Termos de Uso</a>
                    <a href="#" className="lp-nav-link">Privacidade</a>
                    <a href="#" className="lp-nav-link">Diretrizes da Meta</a>
                </div>
                <p className="lp-copyright">
                    © 2026 Plug & Sales Pro. Operação Profissional de WhatsApp API.
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
