import React from 'react';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

const TermsOfUse = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#090d16',
            color: '#f8fafc',
            fontFamily: 'Inter, sans-serif',
            padding: '60px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '850px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                padding: '48px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(172,248,0,0.1)', color: '#acf800' }}>
                        <FileText size={28} />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#acf800', textTransform: 'uppercase', letterSpacing: '1px' }}>Documentação Oficial</span>
                        <h1 style={{ fontSize: '2rem', fontWeight: 950, margin: '4px 0 0' }}>Termos de Uso</h1>
                    </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '32px' }}>
                    Última atualização: 5 de Agosto de 2026.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '0.95rem', color: '#cbd5e1' }}>
                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e utilizar a plataforma <strong>Plug & Sales</strong> (https://plugesales.com), você concorda expressamente em cumprir e estar vinculado aos seguintes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve acessar ou utilizar nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>2. Descrição do Serviço</h2>
                        <p>
                            A Plug & Sales é uma plataforma de automação de marketing e gerenciamento de vendas, integrando soluções de disparo de mensagens, encurtador de links, rotador de tráfego, CRM e relatórios de entrega através de canais autorizados como a API oficial do WhatsApp (Infobip).
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>3. Cadastro e Segurança de Conta</h2>
                        <p>
                            Para utilizar determinadas funcionalidades, você deve se registrar e manter uma conta ativa. Você é inteiramente responsável por manter a confidencialidade de suas credenciais de acesso, incluindo logins sociais (como autenticação via Facebook). Qualquer atividade realizada em sua conta será de sua total responsabilidade.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>4. Uso Aceitável e Políticas de Disparo</h2>
                        <p>
                            Você concorda em utilizar nossos serviços de disparo de mensagens apenas para finalidades lícitas e em estrita conformidade com as políticas comerciais e de uso do WhatsApp/Meta. É terminantemente proibido o envio de spam, conteúdos abusivos, fraudulentos ou que violem direitos de terceiros.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>5. Integrações de Terceiros (Facebook & Meta API)</h2>
                        <p>
                            Nossos serviços incluem integrações opcionais com APIs de terceiros. Ao conectar sua conta do Facebook, você autoriza a plataforma a gerenciar informações de login e perfil de acordo com as permissões explicitamente concedidas no ato da autenticação.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>6. Limitação de Responsabilidade</h2>
                        <p>
                            A Plug & Sales não se responsabiliza por eventuais interrupções temporárias do serviço causadas por falhas de provedores externos, instabilidades na API oficial do WhatsApp/Meta ou suspensões de contas diretamente pelas plataformas integradas devido a violações de suas respectivas políticas de conformidade.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>7. Modificações dos Termos</h2>
                        <p>
                            Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações entrarão em vigor imediatamente após a publicação da versão revisada nesta página.
                        </p>
                    </section>
                </div>

                <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a href="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#acf800', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 800 }}>
                        <ArrowLeft size={16} /> Voltar ao Login
                    </a>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Plug & Sales © 2026</span>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;
