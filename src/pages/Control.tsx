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
            const [logs, subs, links, emps] = await Promise.all([
                dbService.getLogs(),
                dbService.getClientSubmissions(),
                dbService.getShortLinks(),
                dbService.getEmployees()
            ]);

            setTemplateLogs(logs.filter((l: any) => l.log_type === 'TEMPLATE'));
            setDispatchLogs(logs.filter((l: any) => l.log_type === 'DISPATCH'));
            setAllSubmissions(subs || []);
            setAllLinks(links || []);
            setEmployees(emps || []);
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
        <div className="animate-fade-in" style={{ paddingBottom: '100px', maxWidth: '100%', padding: '20px' }}>
            {/* Header section with margin bottom for better spacing */}
            <div className="flex items-center justify-between mb-12 pt-4">
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, margin: 0, letterSpacing: '-1.5px', background: 'linear-gradient(to right, #fff, var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CONTROLE MESTRE</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, marginTop: '4px', letterSpacing: '1px' }}>GESTÃO E MONITORAMENTO DE ALTA PERFORMANCE</p>
                </div>
                <div className="glass-card flex items-center gap-4 px-8 py-4" style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(172, 248, 0, 0.3)' }}>
                    <div className="p-2 bg-primary-subtle rounded-xl" style={{ border: '1px solid var(--primary-color)' }}>
                        <User size={20} style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <div className="flex flex-col">
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase' }}>Operador Logado</span>
                        <span style={{ fontWeight: 950, fontSize: '1rem', color: 'var(--text-primary)' }}>{currentUser?.name || 'Admin'}</span>
                    </div>
                </div>
            </div>

            {/* Premium Navigation Tabs with better margins */}
            <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('MONITOR')}
                    className={`btn flex-1 py-5 flex items-center justify-center gap-4 transition-all duration-300 ${activeTab === 'MONITOR' ? 'selected-tab-premium' : 'unselected-tab-premium'}`}
                    style={{ borderRadius: '24px', fontWeight: 950, fontSize: '1rem', letterSpacing: '1px', minWidth: '300px' }}
                >
                    <LayoutDashboard size={24} /> MONITORAMENTO GLOBAL
                </button>
                {currentUser?.role === 'ADMIN' && (
                    <button
                        onClick={() => setActiveTab('USUARIOS')}
                        className={`btn flex-1 py-5 flex items-center justify-center gap-4 transition-all duration-300 ${activeTab === 'USUARIOS' ? 'selected-tab-premium' : 'unselected-tab-premium'}`}
                        style={{ borderRadius: '24px', fontWeight: 950, fontSize: '1rem', letterSpacing: '1px', minWidth: '300px' }}
                    >
                        <ShieldCheck size={24} /> GESTÃO DE ACESSOS
                    </button>
                )}
            </div>

            {activeTab === 'MONITOR' ? (
                <div className="animate-fade-in flex flex-col gap-10">
                    {/* StatCards Row with more gap */}
                    <div className="flex gap-6 mb-4 overflow-x-auto pb-8" style={{ flexWrap: 'nowrap' }}>
                        <StatCard
                            title="Volume CRM"
                            value={isStatsLoading ? '...' : allSubmissions.length.toString()}
                            subtitle="Total de registros"
                            icon={<LayoutDashboard size={26} />}
                            color="var(--primary-color)"
                        />
                        <StatCard
                            title="Pendências"
                            value={isStatsLoading ? '...' : allSubmissions.filter(s => s.status === 'PENDENTE' || s.status === 'EM_ANALISE').length.toString()}
                            subtitle="Aguardando ação"
                            icon={<Clock size={26} />}
                            color="#facc15"
                        />
                        <StatCard
                            title="Links Ativos"
                            value={isStatsLoading ? '...' : allLinks.length.toString()}
                            subtitle="Total encurtado"
                            icon={<LinkIcon size={26} />}
                            color="#3b82f6"
                        />
                        <StatCard
                            title="Desempenho"
                            value={isStatsLoading ? '...' : allLinks.reduce((acc, l) => acc + (Number(l.clicks) || 0), 0).toString()}
                            subtitle="Cliques mundiais"
                            icon={<Activity size={26} />}
                            color="#f87171"
                        />
                    </div>

                    {/* Main Content Side-by-Side Flex with row wrap and gaps */}
                    <div className="flex gap-10 flex-wrap items-start">
                        {/* Column 1: Team Ranking (35% roughly) */}
                        <div className="flex-col" style={{ flex: '1 1 400px' }}>
                            <div className="glass-card flex-col p-8 bg-surface-subtle" style={{ borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <div className="flex items-center justify-between mb-10">
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 950, borderLeft: '5px solid var(--primary-color)', paddingLeft: '20px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Ranking da Equipe</h2>
                                    <div style={{ padding: '8px', background: 'rgba(172, 248, 0, 0.1)', borderRadius: '12px', color: 'var(--primary-color)' }}>
                                        <Activity size={24} />
                                    </div>
                                </div>
                                <div className="flex flex-col" style={{ gap: '24px' }}>
                                    {employees.map(employee => {
                                        const stats = getStats(employee);
                                        const isSelected = selectedEmployee === employee;
                                        return (
                                            <div
                                                key={employee}
                                                onClick={() => setSelectedEmployee(isSelected ? null : employee)}
                                                className={`p-6 rounded-[28px] border transition-all duration-300 cursor-pointer hover-lift shadow-glass ${isSelected ? 'selected-employee-card-v2' : 'normal-employee-card-v2'}`}
                                                style={{ marginBottom: '4px' }}
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div style={{ width: '56px', height: '56px', background: isSelected ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'black' : 'var(--text-muted)' }}>
                                                            <User size={26} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span style={{ fontWeight: 950, fontSize: '1.3rem' }}>{employee}</span>
                                                            <span style={{ fontSize: '0.7rem', color: isSelected ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase' }}>Membro Operacional</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span style={{ fontWeight: 950, fontSize: '1.5rem', color: isSelected ? 'var(--primary-color)' : 'inherit' }}>{stats.total}</span>
                                                        <span style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 800 }}>TOTAL AÇÕES</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 mb-6">
                                                    {[
                                                        { label: 'TMPL', val: stats.templates, c: '#4ade80' },
                                                        { label: 'DISP', val: stats.transmissions, c: '#60a5fa' },
                                                        { label: 'LINK', val: stats.linksCount, c: '#f87171' },
                                                        { label: 'CRM', val: stats.submissions, c: '#facc15' }
                                                    ].map(it => (
                                                        <div key={it.label} className="flex-1 flex flex-col items-center p-4 rounded-2xl bg-surface-subtle" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                            <span style={{ fontSize: '0.55rem', fontWeight: 950, opacity: 0.5, marginBottom: '6px' }}>{it.label}</span>
                                                            <span style={{ fontWeight: 950, fontSize: '1.1rem', color: it.c }}>{it.val}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div className="flex items-center gap-2">
                                                        {stats.pendingSubmissions > 0 ? (
                                                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', fontSize: '0.75rem', fontWeight: 950 }}>
                                                                <AlertCircle size={16} /> {stats.pendingSubmissions} PENDENTE
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', fontSize: '0.75rem', fontWeight: 950 }}>
                                                                <CheckCircle2 size={16} /> STATUS EM DIA
                                                            </div>
                                                        )}
                                                    </div>
                                                    {stats.lastActivity && (
                                                        <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>
                                                            <Clock size={14} /> {stats.lastActivity.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: History (65% roughly) */}
                        <div className="flex-col" style={{ flex: '1 1 600px' }}>
                            <div className="glass-card flex-col p-8 bg-surface-subtle" style={{ borderRadius: '32px', minHeight: '800px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex flex-col">
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 950, borderLeft: '5px solid var(--warning-color)', paddingLeft: '20px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Log de Auditoria</h2>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>CONTROLE DE CRIAÇÃO E ENVIO DE TEMPLATES</p>
                                    </div>
                                    <div className="flex gap-3 p-1.5 bg-surface-subtle rounded-[20px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        {['ALL', 'TEMPLATE', 'DISPATCH'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setActiveFilter(f as any)}
                                                className={`px-8 py-3 rounded-[16px] text-[0.75rem] font-black transition-all duration-300 ${activeFilter === f ? 'selected-audit-tab' : 'unselected-audit-tab'}`}
                                            >
                                                {f === 'ALL' ? 'HISTÓRICO' : f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-10 relative group">
                                    <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                                    <input
                                        className="input-field w-full pl-14 pr-8"
                                        placeholder="Pesquisar registros..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{
                                            borderRadius: '20px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            height: '60px',
                                            fontSize: '1rem',
                                            fontWeight: 600
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col" style={{ gap: '24px' }}>
                                    {paginatedLogs.map((log, i) => (
                                        <div key={i} className="flex items-center justify-between p-7 bg-surface-subtle rounded-[32px] border border-subtle hover-row transition-all shadow-glass" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div className="flex items-center gap-7">
                                                <div className={`p-4 rounded-[20px] ${log.logType === 'TEMPLATE' ? 'bg-success-glow' : 'bg-info-glow'}`} style={{
                                                    background: log.logType === 'TEMPLATE' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                    color: log.logType === 'TEMPLATE' ? '#4ade80' : '#3b82f6',
                                                    boxShadow: `0 0 20px ${log.logType === 'TEMPLATE' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`
                                                }}>
                                                    {log.logType === 'TEMPLATE' ? <MessageSquare size={26} /> : <Send size={26} />}
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <span style={{ fontWeight: 950, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{log.author}</span>
                                                        <div className="px-3 py-0.5 rounded-lg bg-surface-strong text-[0.6rem] font-black opacity-50" style={{ letterSpacing: '1.5px' }}>{log.logType}</div>
                                                    </div>
                                                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                        {log.name || log.template || 'Operação registrada'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-primary)' }}>
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                                                    {new Date(log.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between mt-auto pt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <button
                                                className="btn btn-secondary px-10 py-4 flex items-center justify-center gap-2"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(p => p - 1)}
                                                style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '18px', fontSize: '0.85rem', fontWeight: 950, letterSpacing: '1px' }}
                                            >
                                                <Activity size={16} /> ANTERIOR
                                            </button>
                                            <div className="flex items-center gap-4">
                                                <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-muted)' }}>PÁGINA</span>
                                                <div className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xl" style={{ background: 'var(--primary-color)' }}>{currentPage}</div>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-muted)' }}>DE {totalPages}</span>
                                            </div>
                                            <button
                                                className="btn btn-secondary px-10 py-4 flex items-center justify-center gap-2"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '18px', fontSize: '0.85rem', fontWeight: 950, letterSpacing: '1px' }}
                                            >
                                                PRÓXIMA <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in glass-card p-12 bg-surface-subtle" style={{ borderRadius: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex-col">
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 950, borderLeft: '6px solid var(--primary-color)', paddingLeft: '24px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Gestão de Acessos</h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '4px' }}>CONTROLE DE SEGURANÇA E CHAVES DE API</p>
                        </div>
                        <div className="badge badge-primary px-10 py-3" style={{ background: 'rgba(172, 248, 0, 0.15)', color: 'var(--primary-color)', borderRadius: '16px', fontWeight: 950, fontSize: '1rem', border: '1px solid rgba(172, 248, 0, 0.2)' }}>{users.length} USUÁRIOS ATIVOS</div>
                    </div>

                    <div className="mb-14 relative group">
                        <Search size={28} className="absolute left-7 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            className="input-field w-full pl-20 pr-10"
                            placeholder="Buscar colaboradores por nome ou email..."
                            value={userSearchTerm}
                            onChange={e => setUserSearchTerm(e.target.value)}
                            style={{
                                borderRadius: '24px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                height: '72px',
                                fontSize: '1.2rem',
                                fontWeight: 600
                            }}
                        />
                    </div>

                    {isUsersLoading ? (
                        <div className="p-40 flex-col items-center justify-center opacity-40">
                            <Activity className="animate-pulse mb-10" size={80} />
                            <span style={{ fontWeight: 950, letterSpacing: '4px', fontSize: '1.2rem' }}>SINCRONIZANDO BASE DE SEGURANÇA...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {users.filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase())).map((u, i) => (
                                <div key={i} className="flex items-center justify-between p-8 bg-surface-subtle rounded-[36px] border border-subtle hover-row shadow-glass transition-all duration-300" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                    <div className="flex items-center gap-7">
                                        <div style={{ padding: '18px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <User size={32} />
                                        </div>
                                        <div className="flex-col gap-1.5">
                                            <div className="flex items-center gap-3">
                                                <span style={{ fontWeight: 950, fontSize: '1.4rem', color: 'var(--text-primary)' }}>{u.name}</span>
                                                <div className="px-4 py-1 rounded-full text-[0.7rem] font-black" style={{ background: u.role === 'ADMIN' ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)', color: u.role === 'ADMIN' ? 'black' : 'inherit' }}>{u.role}</div>
                                            </div>
                                            <span style={{ fontSize: '1rem', opacity: 0.5, fontWeight: 600, letterSpacing: '0.5px' }}>{u.email}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-secondary px-12 py-4"
                                        style={{ borderRadius: '18px', fontWeight: 950, fontSize: '0.85rem', height: '54px', background: 'rgba(255,255,255,0.05)', letterSpacing: '1px' }}
                                        onClick={async () => {
                                            const pass = window.prompt(`Definir nova chave mestra para ${u.name}:`);
                                            if (pass) {
                                                if (!u.id) {
                                                    alert("Erro: ID do usuário ausente. Sincronize a base de dados.");
                                                    return;
                                                }
                                                const res = await dbService.adminUpdatePassword(u.id, pass);
                                                alert(res.error ? `Erro: ${res.error}` : 'Credenciais de segurança atualizadas!');
                                            }
                                        }}
                                    >REDEFINIR CHAVE</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .glass-card { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
                .shadow-glass { box-shadow: 0 12px 60px rgba(0, 0, 0, 0.5); }
                .shadow-glow-sm { box-shadow: 0 0 20px rgba(172, 248, 0, 0.2); }
                .hover-lift { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .hover-lift:hover { transform: translateY(-12px); }
                .hover-row:hover { background: rgba(172, 248, 0, 0.05) !important; border-color: rgba(172, 248, 0, 0.3) !important; transform: scale(1.01); }
                
                .selected-tab-premium { background: var(--primary-color); color: black; box-shadow: 0 0 35px rgba(172, 248, 0, 0.3); }
                .unselected-tab-premium { background: rgba(255, 255, 255, 0.02); color: var(--text-muted); border: 1px solid rgba(255, 255, 255, 0.05); }
                .unselected-tab-premium:hover { color: white; background: rgba(255, 255, 255, 0.05); }

                .selected-employee-card-v2 { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.1); box-shadow: 0 0 40px rgba(172, 248, 0, 0.15); }
                .normal-employee-card-v2 { border-color: rgba(255, 255, 255, 0.06); background: rgba(255, 255, 255, 0.015); }
                
                .selected-audit-tab { background: var(--primary-color); color: black; box-shadow: 0 0 25px rgba(172, 248, 0, 0.2); }
                .unselected-audit-tab { background: transparent; color: var(--text-muted); }
                .unselected-audit-tab:hover { color: white; background: rgba(255, 255, 255, 0.03); }

                .bg-primary-subtle { background: rgba(172, 248, 0, 0.08); }
                .bg-surface-strong { background: rgba(255, 255, 255, 0.08); }
                
                @keyframes fade-in { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); borderRadius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: var(--primary-color); }
            `}</style>
        </div>
    );
};

export default AdminControl;
