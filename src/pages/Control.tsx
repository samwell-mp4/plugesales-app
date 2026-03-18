import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShieldCheck, MessageSquare, Send, Activity, 
    ChevronRight, User, 
    Search, BarChart3, Zap
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

const AdminControl = () => {
    const { user: currentUser } = useAuth();
    const [templateLogs, setTemplateLogs] = useState<any[]>([]);
    const [dispatchLogs, setDispatchLogs] = useState<any[]>([]);
    const [engineLogs, setEngineLogs] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'TEMPLATE' | 'DISPATCH' | 'ENGINE'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const tLogs = JSON.parse(localStorage.getItem('admin_template_logs') || '[]');
        const dLogs = JSON.parse(localStorage.getItem('admin_dispatch_logs') || '[]');
        const eLogs = JSON.parse(localStorage.getItem('admin_engine_logs') || '[]');
        
        setTemplateLogs(tLogs.reverse());
        setDispatchLogs(dLogs.reverse());
        setEngineLogs(eLogs.reverse());
    }, []);

    const employees = [
        'Italo', 'Augusto', 'Otavio', 'Lucas', 'Geraldo', 'Ricardo'
    ];

    const getStats = (name: string) => {
        const templates = templateLogs.filter(t => t.author === name).length;
        const transmissions = dispatchLogs.filter(d => d.author === name).length;
        const engineRuns = engineLogs.filter(e => e.author === name).length;
        const total = templates + transmissions + engineRuns;
        return { templates, transmissions, engineRuns, total };
    };

    const filteredLogs = useMemo(() => {
        let all: any[] = [];
        if (activeFilter === 'ALL' || activeFilter === 'TEMPLATE') 
            all.push(...templateLogs.map(l => ({ ...l, logType: 'TEMPLATE' })));
        if (activeFilter === 'ALL' || activeFilter === 'DISPATCH') 
            all.push(...dispatchLogs.map(l => ({ ...l, logType: 'DISPATCH' })));
        if (activeFilter === 'ALL' || activeFilter === 'ENGINE') 
            all.push(...engineLogs.map(l => ({ ...l, logType: 'ENGINE' })));

        return all
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .filter(l => !selectedEmployee || l.author === selectedEmployee)
            .filter(l => !searchTerm || 
                l.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (l.name && l.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (l.template && l.template.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [templateLogs, dispatchLogs, engineLogs, selectedEmployee, activeFilter, searchTerm]);

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', margin: 0 }}>Painel de Controle</h1>
                    <p className="subtitle">Gestão administrativa e auditoria de performance</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-card flex items-center gap-3 py-2 px-6" style={{ borderRadius: '14px', background: 'rgba(172, 248, 0, 0.05)', border: '1px solid var(--surface-border)' }}>
                        <div style={{ background: 'var(--primary-color)', color: 'black', padding: '6px', borderRadius: '50%' }}>
                            <ShieldCheck size={16} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Logado como: {currentUser?.name || 'Admin'}</span>
                    </div>
                </div>
            </div>

            {/* Global Stats Grid - Matching Home Page Style */}
            <div className="flex gap-6 mb-10 overflow-x-auto pb-4" style={{ flexWrap: 'nowrap' }}>
                <StatCard 
                    title="Ações Globais"
                    value={(templateLogs.length + dispatchLogs.length + engineLogs.length).toString()}
                    subtitle="Registradas no sistema"
                    icon={<Activity size={24} />}
                    color="var(--primary-color)"
                />
                <StatCard 
                    title="Templates"
                    value={templateLogs.length.toString()}
                    subtitle="Modelos criados hoje"
                    icon={<MessageSquare size={24} />}
                    color="#4ade80"
                />
                <StatCard 
                    title="Envios"
                    value={dispatchLogs.length.toString()}
                    subtitle="Campanhas disparadas"
                    icon={<Send size={24} />}
                    color="#60a5fa"
                />
                <StatCard 
                    title="Motores"
                    value={engineLogs.length.toString()}
                    subtitle="Ciclos executados"
                    icon={<Zap size={24} />}
                    color="#facc15"
                />
            </div>

            <div className="flex gap-8 mt-10" style={{ flexWrap: 'wrap' }}>
                {/* Column 1: Team & Productivity */}
                <div className="flex-col gap-8" style={{ flex: '2 1 600px' }}>
                    <div className="glass-card flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 style={{ fontSize: '1.2rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '16px', margin: 0 }}>Equipe Monitorada</h2>
                            {selectedEmployee && (
                                <button 
                                    className="badge badge-success cursor-pointer hover:opacity-80" 
                                    onClick={() => setSelectedEmployee(null)}
                                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ff4d4d', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                >
                                    Limpar Filtro ({selectedEmployee})
                                </button>
                            )}
                        </div>
                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                            {employees.map(emp => {
                                const stats = getStats(emp);
                                const isSelected = selectedEmployee === emp;
                                return (
                                    <div 
                                        key={emp} 
                                        onClick={() => setSelectedEmployee(isSelected ? null : emp)}
                                        className={`glass-card items-center gap-4 p-5 hover-lift cursor-pointer ${isSelected ? 'shadow-glow' : ''}`} 
                                        style={{ 
                                            background: isSelected ? 'rgba(172, 248, 0, 0.08)' : 'rgba(0,0,0,0.2)', 
                                            border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--surface-border)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            borderRadius: '20px'
                                        }}
                                    >
                                        <div style={{ 
                                            background: isSelected ? 'var(--primary-color)' : 'rgba(172, 248, 0, 0.1)', 
                                            color: isSelected ? 'black' : 'var(--primary-color)', 
                                            padding: '12px', 
                                            borderRadius: '14px' 
                                        }}>
                                            <User size={24} />
                                        </div>
                                        <div className="flex-col" style={{ flex: 1 }}>
                                            <span style={{ fontWeight: 800, fontSize: '1rem', color: isSelected ? 'var(--primary-color)' : 'white' }}>{emp}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-1.5 w-1.5 rounded-full" style={{ background: stats.total > 0 ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)' }}></div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stats.total} ações realizadas</span>
                                            </div>
                                        </div>
                                        {isSelected ? <ChevronRight size={18} color="var(--primary-color)" /> : <ChevronRight size={18} style={{ opacity: 0.2 }} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-card flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 style={{ fontSize: '1.2rem', borderLeft: '4px solid #60a5fa', paddingLeft: '16px', margin: 0 }}>Ranking de Produtividade</h2>
                            <NavLink to="/dashboard" style={{ display: 'none' }}></NavLink> {/* Empty navlink space */}
                        </div>
                        <div className="flex-col gap-8">
                            {employees
                                .map(emp => ({ name: emp, total: getStats(emp).total }))
                                .sort((a, b) => b.total - a.total)
                                .map((emp, i) => (
                                    <div key={emp.name} className="flex items-center gap-6">
                                        <div className="font-black text-3xl opacity-10 w-10 italic" style={{ color: i === 0 ? 'var(--primary-color)' : 'white' }}>{i + 1}</div>
                                        <div className="flex-1 flex flex-col gap-3">
                                            <div className="flex justify-between items-end">
                                                <span className="font-bold text-base">{emp.name}</span>
                                                <div className="badge badge-success" style={{ 
                                                    background: i === 0 ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                                    color: i === 0 ? 'black' : 'var(--text-muted)',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    {emp.total} AÇÕES GLOBAIS
                                                </div>
                                            </div>
                                            <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    height: '100%', 
                                                    width: `${Math.min((emp.total / (Math.max(...employees.map(e => getStats(e).total)) || 1)) * 100, 100)}%`, 
                                                    background: i === 0 ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.15)',
                                                    borderRadius: '5px',
                                                    transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>

                {/* Column 2: Audit Logs */}
                <div className="flex-col gap-8" style={{ flex: '1 1 400px' }}>
                    <div className="glass-card flex-col" style={{ minHeight: '650px', background: 'rgba(0,0,0,0.3)' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 style={{ fontSize: '1.2rem', borderLeft: '4px solid var(--warning-color)', paddingLeft: '16px', margin: 0 }}>Histórico de Auditoria</h2>
                            <Activity size={18} style={{ color: 'var(--warning-color)' }} />
                        </div>

                        {/* Search field - matching dashboard search vibe */}
                        <div className="mb-6">
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: 16, top: 14, opacity: 0.3 }} />
                                <input 
                                    className="input-field" 
                                    style={{ 
                                        paddingLeft: 46, 
                                        borderRadius: '14px', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        border: '1px solid var(--surface-border)',
                                        fontSize: '0.85rem',
                                        height: '46px'
                                    }}
                                    placeholder="Buscar por usuário ou template..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filter Toggles */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {['ALL', 'TEMPLATE', 'DISPATCH', 'ENGINE'].map((f: any) => (
                                <button 
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    style={{ 
                                        padding: '6px 14px',
                                        borderRadius: '10px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        border: activeFilter === f ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                        background: activeFilter === f ? 'var(--primary-color)' : 'rgba(0,0,0,0.2)',
                                        color: activeFilter === f ? 'black' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {f === 'ALL' ? 'VER TUDO' : f}
                                </button>
                            ))}
                        </div>

                        <div className="flex-col gap-2 overflow-y-auto" style={{ maxHeight: '720px', paddingRight: '12px' }}>
                            {filteredLogs.map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 hover-row" style={{ 
                                    borderBottom: '1px solid rgba(255,255,255,0.03)', 
                                    transition: 'all 0.2s' 
                                }}>
                                    <div className="flex items-center gap-4">
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '12px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: log.logType === 'TEMPLATE' ? 'rgba(74, 222, 128, 0.1)' : 
                                                        log.logType === 'DISPATCH' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                            color: log.logType === 'TEMPLATE' ? '#4ade80' : 
                                                   log.logType === 'DISPATCH' ? '#60a5fa' : '#facc15'
                                        }}>
                                            {log.logType === 'TEMPLATE' && <MessageSquare size={20} />}
                                            {log.logType === 'DISPATCH' && <Send size={20} />}
                                            {log.logType === 'ENGINE' && <Zap size={20} />}
                                        </div>
                                        <div className="flex-col">
                                            <div className="flex items-center gap-2">
                                                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{log.author}</span>
                                                <span className="badge" style={{ 
                                                    fontSize: '0.6rem', padding: '1px 6px',
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                                                    color: 'var(--text-muted)'
                                                }}>{log.logType}</span>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }} className="truncate max-w-[180px]">
                                                {log.name ? `Novo Template: ${log.name}` : log.template ? `Disparo: ${log.template}` : `Motor Ativado (${log.mode})`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-col items-end">
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            {new Date(log.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {filteredLogs.length === 0 && (
                                <div className="p-20 flex-col items-center justify-center gap-4 opacity-20">
                                    <Search size={48} />
                                    <p style={{ fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem' }}>Nenhuma atividade para exibir</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-row:hover { background: rgba(255, 255, 255, 0.05); }
                .shadow-glass { box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); }
                .hover-lift:hover { transform: translateY(-5px); }
                .shadow-glow { box-shadow: 0 0 30px rgba(172, 248, 0, 0.15); }
                @media (max-width: 1200px) {
                    .flex.gap-8 { flex-direction: column; }
                }
            `}</style>
        </div>
    );
};

export default AdminControl;
