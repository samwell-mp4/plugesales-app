import React, { useState, useEffect, useMemo } from 'react';
import {
    ShieldCheck, MessageSquare, Send, Activity,
    ChevronRight, User, Link as LinkIcon,
    Search, LayoutDashboard, Clock, AlertCircle, CheckCircle2
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';

const StatCard = ({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) => {
    return (
        <div className="glass-card flex-col justify-between hover-lift shadow-glass" style={{
            flex: '1 1 240px',
            minWidth: '260px',
            borderTop: `4px solid ${color}`,
            background: `rgba(255, 255, 255, 0.03)`,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            margin: '8px'
        }}>
            <div className="flex items-center justify-between mb-6">
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>{title}</h3>
                <div style={{
                    color: color,
                    background: `${color}15`,
                    padding: '12px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 20px ${color}20`
                }}>{icon}</div>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <span style={{ fontSize: '3rem', fontWeight: 950, lineHeight: 0.9, color: 'var(--text-primary)', letterSpacing: '-2px' }}>{value}</span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '12px', marginBottom: 0, fontWeight: 600 }}>{subtitle}</p>
                </div>
            </div>
        </div>
    );
};

const AdminControl = () => {
    const { user: currentUser } = useAuth();
    const [templateLogs, setTemplateLogs] = useState<any[]>([]);
    const [dispatchLogs, setDispatchLogs] = useState<any[]>([]);
    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [allLinks, setAllLinks] = useState<any[]>([]);
    const [aggregatedStats, setAggregatedStats] = useState<any>(null);
    const [employees, setEmployees] = useState<string[]>([]);

    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'TEMPLATE' | 'DISPATCH'>('ALL');
    const [activeTab, setActiveTab] = useState<'MONITOR' | 'USUARIOS'>('MONITOR');
    const [searchTerm, setSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    const loadData = async () => {
        setIsStatsLoading(true);
        try {
            const [logs, subs, linksData, emps, statsData] = await Promise.all([
                dbService.getLogs(),
                dbService.getClientSubmissions(),
                dbService.getShortLinks(undefined, undefined, undefined, undefined, 1, 1000), // Get all for ranking
                dbService.getEmployees(),
                dbService.getAllLinkStats(null)
            ]);

            setTemplateLogs(logs.filter((l: any) => l.log_type === 'TEMPLATE'));
            setDispatchLogs(logs.filter((l: any) => l.log_type === 'DISPATCH'));
            setAllSubmissions(subs || []);
            setAllLinks(linksData?.links || []);
            setEmployees(emps || []);
            setAggregatedStats(statsData);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setIsStatsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'USUARIOS') {
            setIsUsersLoading(true);
            dbService.getAllUsers().then(data => {
                setUsers(data);
                setIsUsersLoading(false);
            });
        }
    }, [activeTab]);

    const getStats = (name: string) => {
        const nameLower = name.toLowerCase().trim();
        const templates = templateLogs.filter(t => t.author?.trim().toLowerCase() === nameLower).length;
        const transmissions = dispatchLogs.filter(d => d.author?.trim().toLowerCase() === nameLower).length;
        const linksCount = allLinks.filter(l => l.author?.trim().toLowerCase() === nameLower).length;
        const submissions = (allSubmissions || []).filter(s => s.assigned_to?.trim().toLowerCase() === nameLower).length;
        const pendingSubmissions = (allSubmissions || []).filter(s =>
            s.assigned_to?.trim().toLowerCase() === nameLower &&
            (s.status === 'PENDENTE' || s.status === 'EM_ANALISE')
        ).length;

        const employeeLogs = [...templateLogs, ...dispatchLogs]
            .filter(l => l.author?.trim().toLowerCase() === nameLower)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const lastActivity = employeeLogs.length > 0 ? new Date(employeeLogs[0].timestamp) : null;
        const total = templates + transmissions + linksCount + submissions;

        return { templates, transmissions, linksCount, submissions, pendingSubmissions, lastActivity, total };
    };

    const filteredLogs = useMemo(() => {
        let all: any[] = [];
        if (activeFilter === 'ALL' || activeFilter === 'TEMPLATE')
            all.push(...templateLogs.map(l => ({ ...l, logType: 'TEMPLATE' })));
        if (activeFilter === 'ALL' || activeFilter === 'DISPATCH')
            all.push(...dispatchLogs.map(l => ({ ...l, logType: 'DISPATCH' })));

        return all
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .filter(l => !selectedEmployee || l.author?.trim().toLowerCase() === selectedEmployee.toLowerCase())
            .filter(l => !searchTerm ||
                l.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (l.name && l.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (l.template && l.template.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [templateLogs, dispatchLogs, selectedEmployee, activeFilter, searchTerm]);

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchTerm, selectedEmployee]);

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px', maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
            <style>{`
                .control-header { margin-bottom: 48px; position: relative; }
                .control-title { font-size: 3.5rem; font-weight: 950; letter-spacing: -3px; margin: 0; line-height: 1; text-transform: uppercase; }
                .control-subtitle { font-size: 0.9rem; font-weight: 900; color: var(--text-muted); letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }
                
                .premium-nav { display: flex; gap: 16px; margin-bottom: 48px; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 32px; border: 1px solid var(--surface-border-subtle); }
                .nav-item { flex: 1; padding: 20px; border-radius: 24px; font-weight: 950; font-size: 0.9rem; letter-spacing: 1px; display: flex; alignItems: center; justifyContent: center; gap: 12px; transition: all 0.3s ease; cursor: pointer; border: none; }
                .nav-item.active { background: var(--primary-color); color: black; box-shadow: 0 10px 30px rgba(172, 248, 0, 0.2); }
                .nav-item.inactive { background: transparent; color: var(--text-muted); }
                .nav-item.inactive:hover { background: rgba(255,255,255,0.05); color: white; }

                .ranking-card { background: rgba(255,255,255,0.02); border: 1px solid var(--surface-border-subtle); border-radius: 32px; padding: 32px; height: 100%; transition: all 0.3s ease; }
                .employee-row { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.03); border-radius: 24px; padding: 20px; margin-bottom: 16px; transition: all 0.3s ease; cursor: pointer; }
                .employee-row:hover { border-color: var(--primary-color); transform: translateX(8px); background: rgba(172, 248, 0, 0.05); }
                .employee-row.active { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.1); box-shadow: 0 0 30px rgba(172, 248, 0, 0.1); }

                .audit-log-card { background: rgba(255,255,255,0.02); border: 1px solid var(--surface-border-subtle); border-radius: 40px; padding: 40px; }
                .log-entry { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); border-radius: 24px; margin-bottom: 12px; transition: all 0.2s ease; }
                .log-entry:hover { transform: scale(1.005); background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }

                .stat-box { background: rgba(255,255,255,0.03); border-radius: 20px; padding: 16px; flex: 1; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
                .stat-box-val { font-size: 1.25rem; font-weight: 950; display: block; }
                .stat-box-label { font-size: 0.6rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; }

                .user-manager-card { background: rgba(255,255,255,0.02); border: 1px solid var(--surface-border-subtle); border-radius: 40px; padding: 40px; }
                .user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
                .user-row { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); border-radius: 28px; padding: 24px; transition: all 0.3s ease; }
                .user-row:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); }
            `}</style>
            
            <header className="control-header">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="control-title">Controle<br/><span style={{ color: 'var(--primary-color)' }}>Mestre</span></h1>
                        <p className="control-subtitle">Monitoramento de Alta Fidelidade & Auditoria Geral</p>
                    </div>
                    <div className="glass-card flex items-center gap-4 py-3 px-6" style={{ borderRadius: '24px', border: '1px solid var(--primary-border-subtle)' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'var(--primary-color)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={20} />
                        </div>
                        <div>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', display: 'block' }}>ADMIN LOGADO</span>
                            <span style={{ fontWeight: 950, fontSize: '1.1rem' }}>{currentUser?.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            <nav className="premium-nav">
                <button onClick={() => setActiveTab('MONITOR')} className={`nav-item ${activeTab === 'MONITOR' ? 'active' : 'inactive'}`}>
                    <LayoutDashboard size={20} /> MONITORAMENTO GLOBAL
                </button>
                <button onClick={() => setActiveTab('USUARIOS')} className={`nav-item ${activeTab === 'USUARIOS' ? 'active' : 'inactive'}`}>
                    <ShieldCheck size={20} /> GESTÃO DE ACESSOS
                </button>
            </nav>

            {activeTab === 'MONITOR' ? (
                <div className="flex-col gap-8 animate-fade-in">
                    <div className="flex gap-6 overflow-x-auto pb-4">
                        <StatCard 
                            color="#3b82f6" 
                            icon={<LinkIcon size={24}/>} 
                            title="Total de Links" 
                            value={isStatsLoading ? '...' : (aggregatedStats?.summary?.total_links || allLinks?.length || 0).toString()} 
                            subtitle="Registrados no sistema" 
                        />
                        <StatCard 
                            color="#f87171" 
                            icon={<Activity size={24}/>} 
                            title="Cliques Globais" 
                            value={isStatsLoading ? '...' : (aggregatedStats?.summary?.total_clicks || 0).toString()} 
                            subtitle="Cliques totais acumulados" 
                        />
                        <StatCard 
                            color="var(--primary-color)" 
                            icon={<MessageSquare size={24}/>} 
                            title="Time Ativo" 
                            value={isStatsLoading ? '...' : employees.length.toString()} 
                            subtitle="Operadores monitorados" 
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-4">
                            <div className="ranking-card">
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Activity size={20} color="var(--primary-color)" /> RANKING DA EQUIPE
                                </h2>
                                <div className="flex-col">
                                    {employees.map(employee => {
                                        const stats = getStats(employee);
                                        const isSelected = selectedEmployee === employee;
                                        return (
                                            <div key={employee} onClick={() => setSelectedEmployee(isSelected ? null : employee)} className={`employee-row ${isSelected ? 'active' : ''}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div style={{ width: 44, height: 44, borderRadius: '14px', background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'white' : 'var(--text-muted)' }}>
                                                            <User size={20} />
                                                        </div>
                                                        <span style={{ fontWeight: 950, fontSize: '1.1rem' }}>{employee}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span style={{ fontSize: '1.25rem', fontWeight: 950 }}>{stats.total}</span>
                                                        <span style={{ fontSize: '7px', fontWeight: 900, display: 'block', opacity: 0.5 }}>PONTOS TOTAL</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="stat-box">
                                                        <span className="stat-box-val" style={{ color: '#4ade80' }}>{stats.templates}</span>
                                                        <span className="stat-box-label">Templates</span>
                                                    </div>
                                                    <div className="stat-box">
                                                        <span className="stat-box-val" style={{ color: '#60a5fa' }}>{stats.transmissions}</span>
                                                        <span className="stat-box-label">Envios</span>
                                                    </div>
                                                    <div className="stat-box">
                                                        <span className="stat-box-val" style={{ color: '#f87171' }}>{stats.linksCount}</span>
                                                        <span className="stat-box-label">Links</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8">
                            <div className="audit-log-card">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Clock size={20} color="var(--warning-color)" /> LOG DE AUDITORIA
                                    </h2>
                                    <div className="flex gap-2 p-1 background-strong rounded-2xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                        {['ALL', 'TEMPLATE', 'DISPATCH'].map(f => (
                                            <button 
                                                key={f} 
                                                onClick={() => setActiveFilter(f as any)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeFilter === f ? 'bg-white text-black' : 'text-muted'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                                    <input 
                                        className="input-field w-full pl-12" 
                                        placeholder="Buscar no log..." 
                                        value={searchTerm} 
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{ height: '54px', borderRadius: '18px', background: 'rgba(255,255,255,0.01)' }}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    {paginatedLogs.map((log, i) => (
                                        <div key={i} className="log-entry">
                                            <div className="flex items-center gap-5">
                                                <div style={{ width: 44, height: 44, borderRadius: '16px', background: log.logType === 'TEMPLATE' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: log.logType === 'TEMPLATE' ? '#4ade80' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {log.logType === 'TEMPLATE' ? <MessageSquare size={20} /> : <Send size={20} />}
                                                </div>
                                                <div className="flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span style={{ fontWeight: 950, fontSize: '1.1rem' }}>{log.author}</span>
                                                        <span style={{ fontSize: '8px', fontWeight: 900, padding: '2px 6px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{log.logType}</span>
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>{log.name || log.template || 'Operação registrada'}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span style={{ fontSize: '1.1rem', fontWeight: 950, display: 'block' }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4 }}>{new Date(log.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-8">
                                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-secondary px-6 py-3 rounded-xl font-black">ANTERIOR</button>
                                        <span style={{ fontWeight: 950, fontSize: '0.9rem' }}>PÁGINA {currentPage} DE {totalPages}</span>
                                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-secondary px-6 py-3 rounded-xl font-black">PRÓXIMA</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="user-manager-card animate-fade-in">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0 }}>GESTÃO DE ACESSOS</h2>
                            <p className="control-subtitle">Controle de Credenciais & Segurança</p>
                        </div>
                        <div className=" glass-card px-8 py-3" style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', borderRadius: '20px', fontWeight: 950, border: '1px solid rgba(172, 248, 0, 0.2)' }}>
                            {users.length} COLABORADORES
                        </div>
                    </div>

                    <div className="relative mb-12">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30" size={24} />
                        <input 
                            className="input-field w-full pl-16" 
                            placeholder="Buscar colaboradores..." 
                            value={userSearchTerm} 
                            onChange={e => setUserSearchTerm(e.target.value)}
                            style={{ height: '70px', borderRadius: '24px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.01)' }}
                        />
                    </div>

                    {isUsersLoading ? (
                        <div className="p-40 flex items-center justify-center">
                            <Activity className="animate-spin" size={48} color="var(--primary-color)" />
                        </div>
                    ) : (
                        <div className="user-grid">
                            {users.filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase())).map((u, i) => (
                                <div key={i} className="user-row">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div style={{ width: 56, height: 56, borderRadius: '20px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={28} />
                                        </div>
                                        <div className="flex-col">
                                            <div className="flex items-center gap-3">
                                                <span style={{ fontWeight: 950, fontSize: '1.25rem' }}>{u.name}</span>
                                                <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '8px', background: u.role === 'ADMIN' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: u.role === 'ADMIN' ? 'black' : 'white' }}>{u.role}</span>
                                            </div>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{u.email}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="btn btn-primary w-full py-4 text-[10px]" 
                                        style={{ borderRadius: '16px', letterSpacing: '1px' }}
                                        onClick={async () => {
                                            const pass = window.prompt(`Nova senha para ${u.name}:`);
                                            if (pass) {
                                                const res = await dbService.adminUpdatePassword(u.id, pass);
                                                alert(res.error ? `Erro: ${res.error}` : 'Credenciais atualizadas com sucesso!');
                                            }
                                        }}
                                    >REDEFINIR CHAVE MESTRA</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminControl;
