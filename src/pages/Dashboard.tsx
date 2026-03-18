import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    CheckCircle2,
    Clock,
    XCircle,
    Plus,
    FileSpreadsheet,
    Zap,
    Hash,
    Database,
    ChevronRight,
    Search,
    ArrowRight,
    Activity
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const StatCard = ({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) => {
    return (
        <div className="glass-card flex-col justify-between hover-lift shadow-glass" style={{
            flex: '1 1 200px',
            minWidth: '220px',
            borderTop: `4px solid ${color}`,
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '24px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}>
            <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{title}</h3>
                <div style={{
                    color: color,
                    background: `${color}10`,
                    padding: '10px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 15px ${color}15`
                }}>{icon}</div>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <span style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1, color: 'white', letterSpacing: '-1px' }}>{value}</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px', marginBottom: 0, fontWeight: 500 }}>{subtitle}</p>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [uploadHistory, setUploadHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
    });

    const apiKey = '5b90ba4e71d2c00cdb1784f476b59c1e-a0338025-abdc-46e6-8b90-0b2b2d62d5c8';
    const fromNumber = '5511997625247';

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/2/senders/${fromNumber}/templates`, {
                headers: { 'Authorization': `App ${apiKey}` }
            });
            const data = await response.json();
            const list = data.templates || [];

            setTemplates(list);
            setStats({
                total: list.length,
                approved: list.filter((t: any) => t.status === 'APPROVED').length,
                pending: list.filter((t: any) => t.status === 'PENDING' || t.status === 'IN_REVIEW').length,
                rejected: list.filter((t: any) => t.status === 'REJECTED' || t.status === 'DISABLED').length
            });

            const savedHistory = localStorage.getItem('uploadHistory');
            if (savedHistory) {
                setUploadHistory(JSON.parse(savedHistory).slice(0, 4));
            }
        } catch (error) {
            console.error('Erro ao buscar dados do Dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const recentlyApproved = templates.filter(t => t.status === 'APPROVED')
        .sort((a, b) => new Date(b.lastStatusUpdate).getTime() - new Date(a.lastStatusUpdate).getTime())
        .slice(0, 4);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', margin: 0 }}>Bem-Vindo ao Plug & Sales</h1>
                    <p className="subtitle">Visão geral da sua operação WhatsApp Marketing</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-secondary" onClick={fetchData} disabled={isLoading}>
                        <Clock size={18} className={isLoading ? 'animate-spin' : ''} /> Atualizar Agora
                    </button>
                    <NavLink to="/templates" className="btn btn-primary" style={{ color: 'black', fontWeight: 700 }}>
                        <Plus size={18} /> Novo Template
                    </NavLink>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="flex gap-6 mb-10 overflow-x-auto pb-4" style={{ flexWrap: 'nowrap' }}>
                <StatCard
                    title="Total de Templates"
                    value={stats.total.toString()}
                    subtitle="Modelos cadastrados na API"
                    icon={<MessageSquare size={24} />}
                    color="#acf800"
                />
                <StatCard
                    title="Aprovados"
                    value={stats.approved.toString()}
                    subtitle="Prontos para envio"
                    icon={<CheckCircle2 size={24} />}
                    color="#4ade80"
                />
                <StatCard
                    title="Em Análise"
                    value={stats.pending.toString()}
                    subtitle="Aguardando Meta"
                    icon={<Clock size={24} />}
                    color="#facc15"
                />
                <StatCard
                    title="Rejeitados"
                    value={stats.rejected.toString()}
                    subtitle="Necessitam ajuste"
                    icon={<XCircle size={24} />}
                    color="#f87171"
                />
            </div>

            <div className="flex gap-8 mt-10" style={{ flexWrap: 'wrap' }}>
                {/* Column 1: Quick Actions & Recent Uploads */}
                <div className="flex-col gap-8" style={{ flex: '1 1 400px' }}>
                    <div className="glass-card flex-col">
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', borderLeft: '4px solid var(--primary-color)', paddingLeft: '16px' }}>Atalhos Rápidos</h2>
                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                            <NavLink to="/upload" className="glass-card items-center gap-3 p-4 hover-lift" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)' }}>
                                <div style={{ color: 'var(--primary-color)' }}><FileSpreadsheet size={24} /></div>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Disparar Lista Excel</span>
                            </NavLink>
                            <NavLink to="/media" className="glass-card items-center gap-3 p-4 hover-lift" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)' }}>
                                <div style={{ color: 'var(--secondary-color)' }}><Zap size={24} /></div>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Hospedar Vídeo/Img</span>
                            </NavLink>
                            <NavLink to="/dashboard" className="glass-card items-center gap-3 p-4 hover-lift" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)' }}>
                                <div style={{ color: 'var(--success-color)' }}><Hash size={24} /></div>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Encurtar Links</span>
                            </NavLink>
                            <NavLink to="/templates" className="glass-card items-center gap-3 p-4 hover-lift" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)' }}>
                                <div style={{ color: 'var(--primary-color)' }}><Database size={24} /></div>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Library API</span>
                            </NavLink>
                        </div>
                    </div>

                    <div className="glass-card flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 style={{ fontSize: '1.2rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '16px' }}>Últimas Planilhas</h2>
                            <NavLink to="/upload" style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600 }}>Ver Todas <ArrowRight size={14} /></NavLink>
                        </div>
                        <div className="flex-col gap-3">
                            {uploadHistory.length > 0 ? uploadHistory.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="flex items-center gap-3">
                                        <div style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', padding: '8px', borderRadius: '10px' }}>
                                            <FileSpreadsheet size={20} />
                                        </div>
                                        <div className="flex-col">
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.filename}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.count} leads • {item.date}</span>
                                        </div>
                                    </div>
                                    <div style={{ color: 'var(--success-color)' }}><CheckCircle2 size={16} /></div>
                                </div>
                            )) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Nenhum upload recente.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Column 2: Approvals & Real-Time Monitoring */}
                <div className="flex-col gap-8" style={{ flex: '1 1 500px' }}>
                    <div className="glass-card flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 style={{ fontSize: '1.2rem', borderLeft: '4px solid var(--secondary-color)', paddingLeft: '16px' }}>Aprovações Recentes (Meta)</h2>
                            <Search size={18} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div className="flex-col gap-4">
                            {recentlyApproved.map((t, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 hover-row" style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.2s ease' }}>
                                    <div className="flex items-center gap-4">
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #acf800, #4ade80)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black'
                                        }}>
                                            <MessageSquare size={18} />
                                        </div>
                                        <div className="flex-col">
                                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.category} • {t.language}</span>
                                        </div>
                                    </div>
                                    <div className="flex-col items-end">
                                        <div className="badge badge-success" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>APROVADO</div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(t.lastStatusUpdate)}</span>
                                    </div>
                                </div>
                            ))}
                            {recentlyApproved.length === 0 && !isLoading && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Nenhum template aprovado recentemente.</p>
                            )}
                        </div>
                        <NavLink to="/templates" className="btn btn-secondary mt-6" style={{ width: '100%', justifyContent: 'center' }}>
                            Gerenciar Todos os Templates <ChevronRight size={18} />
                        </NavLink>
                    </div>

                    <div className="glass-card flex-col" style={{ background: 'var(--primary-gradient)', color: 'black', padding: '32px' }}>
                        <div className="flex items-center gap-3 mb-2">
                            <Activity size={24} />
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Dica de Performance</h3>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5, opacity: 0.9 }}>
                            Templates com botões de <b>"Resposta Rápida"</b> possuem uma taxa de conversão 42% maior do que mensagens de texto puro. Recomendamos usar pelo menos um botão em seus disparos.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-row:hover { background: rgba(255, 255, 255, 0.03); }
                .shadow-glass { box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); }
                @media (max-width: 768px) {
                    h1 { font-size: 1.8rem !important; }
                    .flex.gap-4 { flex-direction: column; width: 100%; }
                    .btn { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
