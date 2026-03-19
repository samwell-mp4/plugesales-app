import React, { useState, useEffect } from 'react';
import {
    Zap,
    ShieldCheck,
    XCircle,
    Monitor,
    Database,
    Search,
    Clock,
    Send,
    BookMarked,
    Layers,
    Activity,
    ChevronRight,
    FileSpreadsheet
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';

const StatCard = ({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) => {
    return (
        <div className="glass-card flex-col justify-between hover-lift shadow-glass" style={{
            flex: '1 1 180px',
            minWidth: '200px',
            borderTop: `4px solid ${color}`,
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}>
            <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{title}</h3>
                <div style={{
                    color: color,
                    background: `${color}15`,
                    padding: '8px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>{icon}</div>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: 'white', letterSpacing: '-1.5px' }}>{value}</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px', marginBottom: 0, fontWeight: 500 }}>{subtitle}</p>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<any[]>([]);
    const [recentDrafts, setRecentDrafts] = useState<any[]>([]);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        drafts: 0
    });

    const [apiKey, setApiKey] = useState('5b90ba4e71d2c00cdb1784f476b59c1e-a0338025-abdc-46e6-8b90-0b2b2d62d5c8');
    const [fromNumber, setFromNumber] = useState('5511997625247');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Load settings first
            const settings = await dbService.getSettings();
            const currentKey = settings['infobip_key'] || apiKey;
            const currentSender = settings['infobip_sender'] || fromNumber;
            setApiKey(currentKey);
            setFromNumber(currentSender);

            const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/2/senders/${currentSender}/templates`, {
                headers: { 'Authorization': `App ${currentKey}` }
            });
            const data = await response.json();
            const list = data.templates || [];

            setTemplates(list);
            const drafts = await dbService.getPlannerDrafts();
            const draftList = drafts.filter((d: any) => d._draft === true);
            setRecentDrafts(draftList.slice(0, 3));

            setStats({
                total: list.length,
                approved: list.filter((t: any) => t.status === 'APPROVED').length,
                pending: list.filter((t: any) => t.status === 'PENDING' || t.status === 'IN_REVIEW').length,
                rejected: list.filter((t: any) => t.status === 'REJECTED' || t.status === 'DISABLED').length,
                drafts: draftList.length
            });

            // Load recent dispatch logs
            const logs = await dbService.getLogs('DISPATCH');
            setRecentLogs(logs.slice(0, 3));

        } catch (error) {
            console.error('Erro ao buscar dados do Dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const recentlyApproved = [...templates].filter(t => t.status === 'APPROVED')
        .sort((a: any, b: any) => {
            const dateA = new Date(a.lastUpdatedAt || a.lastUpdateAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.lastUpdatedAt || b.lastUpdateAt || b.createdAt || 0).getTime();
            return dateB - dateA;
        })
        .slice(0, 5);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Recente';
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="animate-fade-in dashboard-root" style={{ paddingBottom: '60px' }}>
            <div className="flex items-center justify-between mb-10 header-section">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: '3rem', letterSpacing: '-2px', margin: 0, background: 'linear-gradient(to right, #ffffff, #888888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard de Operações</h1>
                    <p className="subtitle" style={{ fontSize: '1.1rem', opacity: 0.7 }}>Gestão de templates e monitoramento de performance em tempo real</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-secondary" style={{ borderRadius: '16px', padding: '12px 24px', fontWeight: 800 }} onClick={fetchData} disabled={isLoading}>
                        <Clock size={18} className={isLoading ? 'animate-spin' : ''} /> SYNC META
                    </button>
                    <NavLink to="/dispatch" className="btn btn-primary" style={{ color: 'black', fontWeight: 900, borderRadius: '16px', padding: '12px 24px', boxShadow: '0 0 20px rgba(172, 248, 0, 0.2)' }}>
                        <Send size={18} /> DISPARO RÁPIDO
                    </NavLink>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="flex gap-6 mb-12 scroll-hide hide-scrollbar" style={{ flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '15px' }}>
                <StatCard
                    title="TEMPLATES TOTAIS"
                    value={stats.total.toString()}
                    subtitle="Modelos registrados na Infobip"
                    icon={<Layers size={22} />}
                    color="#ffffff"
                />
                <StatCard
                    title="RASCUNHOS"
                    value={stats.drafts.toString()}
                    subtitle="Prontos para disparar"
                    icon={<BookMarked size={22} />}
                    color="#60a5fa"
                />
                <StatCard
                    title="APROVADOS"
                    value={stats.approved.toString()}
                    subtitle="Disponíveis para disparo agora"
                    icon={<ShieldCheck size={22} />}
                    color="var(--primary-color)"
                />
                <StatCard
                    title="EM ANÁLISE"
                    value={stats.pending.toString()}
                    subtitle="Aguardando liberação da Meta"
                    icon={<Activity size={22} />}
                    color="#facc15"
                />
                <StatCard
                    title="REJEITADOS"
                    value={stats.rejected.toString()}
                    subtitle="Templates que falharam na análise"
                    icon={<XCircle size={22} />}
                    color="#f87171"
                />
            </div>

            <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
                {/* Column 1: Shortcuts & Activity */}
                <div className="flex-col gap-10">
                    <div className="glass-card flex-col p-8" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', minHeight: '340px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Zap size={24} color="var(--primary-color)" /> Atalhos da Plataforma
                        </h2>
                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {[
                                { path: '/dispatch', icon: <Send size={20} />, label: 'Disparo Rápido', color: 'var(--primary-color)' },
                                { path: '/upload', icon: <FileSpreadsheet size={20} />, label: 'Envio em Lote', color: '#60a5fa' },
                                { path: '/accounts', icon: <Monitor size={20} />, label: 'Monitor WABA', color: '#fbbf24' },
                                { path: '/media', icon: <Database size={20} />, label: 'Hospedagem', color: '#2dd4bf' },
                                { path: '/control', icon: <ShieldCheck size={20} />, label: 'Painel Central', color: '#f43f5e' },
                            ].map((item, i) => (
                                <NavLink key={i} to={item.path} className="shortcut-item">
                                    <div className="icon-box" style={{ color: item.color }}>{item.icon}</div>
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card flex-col p-8 mt-4 " style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Clock size={24} color="var(--primary-color)" /> Atividade Recente
                        </h2>
                        <div className="flex-col gap-6">
                            <div className="activity-group">
                                <h3 className="section-title">Últimos Rascunhos</h3>
                                <div className="flex-col gap-3">
                                    {recentDrafts.map((d, i) => (
                                        <div key={i} className="activity-row clickable" onClick={() => navigate('/dispatch', { state: { draft: d } })}>
                                            <div className="flex items-center gap-3">
                                                <BookMarked size={16} color="var(--primary-color)" />
                                                <span className="truncate" style={{ fontWeight: 600, maxWidth: '160px' }}>{d.label}</span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(d.savedAt || d.timestamp)}</span>
                                        </div>
                                    ))}
                                    {recentDrafts.length === 0 && <p className="empty-text">Sem rascunhos recentes.</p>}
                                </div>
                            </div>

                            <div className="activity-group">
                                <h3 className="section-title">Log de Disparos</h3>
                                <div className="flex-col gap-3">
                                    {recentLogs.map((log, i) => (
                                        <div key={i} className="activity-row">
                                            <div className="flex items-center gap-3">
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.success > 0 ? '#4ade80' : '#f87171' }}></div>
                                                <span className="truncate" style={{ fontWeight: 600 }}>{log.template || 'Disparo Manual'}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80' }}>{log.success} OK</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(log.timestamp)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Approvals */}
                <div className="glass-card flex-col p-8" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px' }}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Monitor size={24} color="var(--primary-color)" /> Aprovações Meta Recentes
                        </h2>
                        <div className="badge" style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', fontWeight: 800 }}>Sincronizado</div>
                    </div>

                    <div className="approval-list flex-col gap-0">
                        {recentlyApproved.map((t, idx) => (
                            <div
                                key={idx}
                                className="approval-item clickable"
                                onClick={() => navigate('/dispatch', { state: { template: t, sender: fromNumber, key: apiKey } })}
                                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="index-number">#{idx + 1}</div>
                                    <div className="flex-col" style={{ overflow: 'hidden' }}>
                                        <span className="truncate" style={{ fontWeight: 800, fontSize: '1rem', color: 'white', display: 'block' }}>{t.name}</span>
                                        <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{t.category}</span>
                                            <span>•</span>
                                            <span>{t.language}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-col items-end">
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '0.5px' }}>APROVADO</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {formatDate(t.lastUpdatedAt || t.lastUpdateAt || t.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {recentlyApproved.length === 0 && (
                            <div className="flex-col items-center justify-center p-20 opacity-30">
                                <Search size={48} />
                                <p style={{ marginTop: '16px', fontWeight: 600 }}>Nenhum template aprovado</p>
                            </div>
                        )}
                    </div>

                    <NavLink to="/accounts" className="btn btn-secondary mt-8" style={{ width: '100%', justifyContent: 'center', height: '54px', borderRadius: '16px', fontWeight: 800 }}>
                        ACESSAR MONITOR DE CONTAS <ChevronRight size={18} />
                    </NavLink>
                </div>
            </div>

            <style>{`
                .shortcut-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 20px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none;
                    color: var(--text-secondary);
                }
                .shortcut-item:hover {
                    background: rgba(172, 248, 0, 0.04);
                    border-color: rgba(172, 248, 0, 0.2);
                    transform: translateY(-4px);
                    color: white;
                }
                .shortcut-item .icon-box {
                    padding: 12px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .shortcut-item span { font-size: 0.8rem; font-weight: 700; text-align: center; line-height: 1.2; }

                .activity-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.03);
                    border-radius: 16px;
                    transition: all 0.2s;
                }
                .activity-row.clickable:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.1);
                    cursor: pointer;
                }
                .section-title { font-size: 0.8rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
                
                .approval-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.02);
                    transition: background 0.2s;
                }
                .approval-item:hover {
                    background: rgba(172, 248, 0, 0.03);
                }
                .approval-item:last-child { border-bottom: none; }
                .index-number {
                    width: 32px;
                    height: 32px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 900;
                    color: var(--text-muted);
                }
                
                .scroll-hide::-webkit-scrollbar { display: none; }
                .truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 180px;
                }
                @media (min-width: 1400px) {
                    .truncate { max-width: 300px; }
                }

                @media (max-width: 1000px) {
                    .grid-layout { grid-template-columns: 1fr; }
                    h1 { font-size: 2.2rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
