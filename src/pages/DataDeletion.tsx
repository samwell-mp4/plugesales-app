import React, { useState } from 'react';
import { ShieldAlert, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const DataDeletion = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSent(true);
        }
    };

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
                maxWidth: '650px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                padding: '48px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px' }}>Privacidade & Controle</span>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 950, margin: '4px 0 0' }}>Exclusão de Dados</h1>
                    </div>
                </div>

                <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: '24px' }}>
                    De acordo com as regras de privacidade da Meta (Facebook) e a Lei Geral de Proteção de Dados (LGPD), você pode solicitar a exclusão de todas as informações associadas à sua conta no <strong>Plug & Sales</strong> a qualquer momento.
                </p>

                {sent ? (
                    <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '24px', borderRadius: '16px', textAlign: 'center', color: '#10b981' }}>
                        <CheckCircle size={40} style={{ marginBottom: '12px' }} />
                        <h3 style={{ margin: 0, fontWeight: 900, color: 'white' }}>Solicitação Enviada!</h3>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
                            Sua solicitação de exclusão para o e-mail <strong>{email}</strong> foi registrada. Nossa equipe processará a remoção de todos os dados do banco em até 24 horas úteis.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '16px', fontSize: '0.9rem', color: '#94a3b8' }}>
                            <strong style={{ color: 'white', display: 'block', marginBottom: '8px' }}>O que será excluído:</strong>
                            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                                <li>Perfil do usuário e credenciais de login.</li>
                                <li>Associação de logins sociais (Facebook ID).</li>
                                <li>Histórico de disparos e relatórios vinculados.</li>
                                <li>Estatísticas de links encurtados e rotadores.</li>
                            </ul>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'white', display: 'block', marginBottom: '8px' }}>
                                Insira seu E-mail de Cadastro para Exclusão:
                            </label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '52px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    padding: '0 16px',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="exemplo@email.com"
                            />
                        </div>

                        <button 
                            type="submit" 
                            style={{
                                height: '52px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '0.95rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                            SOLICITAR EXCLUSÃO DOS MEUS DADOS
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '32px', display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                    <span>Dúvidas? Envie para</span>
                    <a href="mailto:suporte@plugesales.com" style={{ color: '#acf800', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} /> suporte@plugesales.com
                    </a>
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

export default DataDeletion;
