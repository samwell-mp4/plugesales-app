import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#acf800', textTransform: 'uppercase', letterSpacing: '1px' }}>Documentação Oficial</span>
                        <h1 style={{ fontSize: '2rem', fontWeight: 950, margin: '4px 0 0' }}>Política de Privacidade</h1>
                    </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '32px' }}>
                    Última atualização: 5 de Agosto de 2026.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '0.95rem', color: '#cbd5e1' }}>
                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>1. Informações que Coletamos</h2>
                        <p>
                            A sua privacidade é de extrema importância para nós. Coletamos dados essenciais para o funcionamento do sistema, incluindo:
                        </p>
                        <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li><strong>Informações de Registro:</strong> Nome completo, e-mail, telefone/WhatsApp e dados comerciais de faturamento fornecidos na contratação dos pacotes.</li>
                            <li><strong>Autenticação Social:</strong> Quando você faz login usando contas de terceiros (como o Facebook), coletamos seu ID do usuário, nome e endereço de e-mail associado para identificar e autenticar a sua conta no sistema.</li>
                            <li><strong>Dados de Campanhas:</strong> Arquivos e planilhas de contatos carregados por você para fins de disparo de mensagens, respeitando a confidencialidade integral dessas informações.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>2. Como Utilizamos os seus Dados</h2>
                        <p>
                            Os dados coletados são utilizados unicamente para:
                        </p>
                        <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Prover, manter e otimizar as funcionalidades da plataforma Plug & Sales.</li>
                            <li>Gerenciar o envio de campanhas de WhatsApp autorizadas e exibir relatórios de entrega precisos.</li>
                            <li>Garantir a segurança física e lógica do acesso dos usuários através de autenticações seguras.</li>
                            <li>Processar de forma transparente os dados de comissões, saldo de disparos e histórico financeiro.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>3. Compartilhamento de Dados</h2>
                        <p>
                            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. Seus dados de envio e credenciais são transmitidos de forma segura e criptografada apenas para as APIs necessárias de automação contratadas (como as conexões oficiais de telefonia e disparo da Infobip/Meta).
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>4. Seus Direitos e Exclusão de Dados</h2>
                        <p>
                            De acordo com a Lei Geral de Proteção de Dados (LGPD) e diretrizes globais de privacidade, você possui o direito de:
                        </p>
                        <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Confirmar a existência de tratamento e acessar seus dados pessoais a qualquer momento.</li>
                            <li>Solicitar a correção ou atualização de dados incorretos.</li>
                            <li><strong>Solicitar a exclusão definitiva</strong> de sua conta e de todos os dados a ela vinculados. Para solicitar a exclusão de dados associados ao seu login do Facebook ou conta Plug & Sales, basta enviar uma solicitação de exclusão para o e-mail de suporte: <strong>suporte@plugesales.com</strong>.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '12px' }}>5. Segurança dos Dados</h2>
                        <p>
                            Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger seus dados contra perda, acesso não autorizado, alteração ou divulgação indevida, incluindo o uso de criptografia SSL/TLS e proteção de banco de dados robusta.
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

export default PrivacyPolicy;
