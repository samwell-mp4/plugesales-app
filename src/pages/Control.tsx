import React, { useState, useEffect, useMemo } from 'react';
import {
    ShieldCheck, MessageSquare, Send, Activity,
    ChevronRight, User, Link as LinkIcon,
    Search, LayoutDashboard, Clock, AlertCircle, CheckCircle2,
    Users, ShieldAlert, Zap
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';

const Control = () => {
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
                dbService.getShortLinks(undefined, undefined, undefined, undefined, 1, 1000),
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
        const nameLower = (name || '').toLowerCase().trim();
        const templates = templateLogs.filter(t => (t.author || '').trim().toLowerCase() === nameLower).length;
        const transmissions = dispatchLogs.filter(d => (d.author || '').trim().toLowerCase() === nameLower).length;
        const linksCount = allLinks.filter(l => (l.author || '').trim().toLowerCase() === nameLower).length;
        const submissions = (allSubmissions || []).filter(s => (s.assigned_to || '').trim().toLowerCase() === nameLower).length;
        
        const employeeLogs = [...templateLogs, ...dispatchLogs]
            .filter(l => (l.author || '').trim().toLowerCase() === nameLower)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const lastActivity = employeeLogs.length > 0 ? new Date(employeeLogs[0].timestamp) : null;
        const total = templates + transmissions + linksCount + submissions;

        return { templates, transmissions, linksCount, submissions, lastActivity, total };
    };

    const filteredLogs = useMemo(() => {
        let all: any[] = [];
        if (activeFilter === 'ALL' || activeFilter === 'TEMPLATE')
            all.push(...templateLogs.map(l => ({ ...l, logType: 'TEMPLATE' })));
        if (activeFilter === 'ALL' || activeFilter === 'DISPATCH')
            all.push(...dispatchLogs.map(l => ({ ...l, logType: 'DISPATCH' })));

        return all
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .filter(l => !selectedEmployee || (l.author || '').trim().toLowerCase() === selectedEmployee.toLowerCase())
            .filter(l => !searchTerm ||
                (l.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div className="crm-container">
            {/* Header section */}
            <div className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <ShieldCheck size={12} /> MASTER CONTROL PANEL
                    </div>
                    <h1 className="crm-main-title">Centro de Controle</h1>
                </div>
                
                <div className="crm-card" style={{ padding: '8px 24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--primary-gradient)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} />
                    </div>
                    <div>
                        <div className="field-label" style={{ fontSize: '8px', marginBottom: '0' }}>OPERADOR ATIVO</div>
                        <div style={{ fontWeight: 950, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>{currentUser?.name}</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="crm-card" style={{ padding: '8px', marginBottom: '48px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setActiveTab('MONITOR')} 
                    className={`action-btn ${activeTab === 'MONITOR' ? 'primary-btn' : 'ghost-btn'}`}
                    style={{ flex: 1, height: '54px', minWidth: '200px' }}
                >
                    <LayoutDashboard size={20} /> MONITORAMENTO EM TEMPO REAL
                </button>
                <button 
                    onClick={() => setActiveTab('USUARIOS')} 
                    className={`action-btn ${activeTab === 'USUARIOS' ? 'primary-btn' : 'ghost-btn'}`}
                    style={{ flex: 1, height: '54px', minWidth: '200px' }}
                >
                    <ShieldCheck size={20} /> GESTÃO DE COLABORADORES
                </button>
            </div>

            {activeTab === 'MONITOR' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Top Stats */}
                    <div className="metrics-grid-row">
                        <div className="crm-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                            <div className="field-label" style={{ color: '#3b82f6', marginBottom: '12px' }}><LinkIcon size={14}/> Total de Links</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 950 }}>{isStatsLoading ? '...' : (aggregatedStats?.summary?.total_links || allLinks?.length || 0)}</div>
                        </div>
                        <div className="crm-card" style={{ borderLeft: '4px solid #ef4444' }}>
                            <div className="field-label" style={{ color: '#ef4444', marginBottom: '12px' }}><Activity size={14}/> Cliques Globais</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 950 }}>{isStatsLoading ? '...' : (aggregatedStats?.summary?.total_clicks || 0)}</div>
                        </div>
                        <div className="crm-card" style={{ borderLeft: '4px solid #acf800' }}>
                            <div className="field-label" style={{ color: '#acf800', marginBottom: '12px' }}><Users size={14}/> Time Ativo</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 950 }}>{isStatsLoading ? '...' : employees.length}</div>
                        </div>
                        <div className="crm-card" style={{ borderLeft: '4px solid #f97316' }}>
                            <div className="field-label" style={{ color: '#f97316', marginBottom: '12px' }}><MessageSquare size={14}/> Logs Hoje</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 950 }}>{templateLogs.length + dispatchLogs.length}</div>
                        </div>
                    </div>

                    <div className="gestiva-split-layout">
                        {/* Sidebar: Ranking */}
                        <div className="gestiva-sidebar-panels">
                            <div className="crm-card" style={{ padding: '32px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Activity size={20} color="var(--primary-color)" /> Ranking de Atividade
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {employees.map(employee => {
                                        const stats = getStats(employee);
                                        const isSelected = selectedEmployee === employee;
                                        return (
                                            <div 
                                                key={employee} 
                                                onClick={() => setSelectedEmployee(isSelected ? null : employee)} 
                                                style={{ 
                                                    background: isSelected ? 'rgba(172, 248, 0, 0.08)' : 'rgba(255,255,255,0.02)',
                                                    border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--surface-border-subtle)'}`,
                                                    borderRadius: '24px',
                                                    padding: '20px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    transform: isSelected ? 'translateX(8px)' : 'none'
                                                }}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div style={{ width: 44, height: 44, borderRadius: '14px', background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <User size={20} />
                                                        </div>
                                                        <span style={{ fontWeight: 950 }}>{employee}</span>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 950, color: isSelected ? '#acf800' : 'white' }}>{stats.total}</div>
                                                        <div className="field-label" style={{ fontSize: '7px', margin: 0, opacity: 0.5 }}>PONTOS</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '12px', textAlign: 'center' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 950, color: '#4ade80', display: 'block' }}>{stats.templates}</span>
                                                        <span style={{ fontSize: '7px', fontWeight: 900, opacity: 0.5 }}>TMPS</span>
                                                    </div>
                                                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '12px', textAlign: 'center' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 950, color: '#60a5fa', display: 'block' }}>{stats.transmissions}</span>
                                                        <span style={{ fontSize: '7px', fontWeight: 900, opacity: 0.5 }}>ENVS</span>
                                                    </div>
                                                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '12px', textAlign: 'center' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 950, color: '#f87171', display: 'block' }}>{stats.linksCount}</span>
                                                        <span style={{ fontSize: '7px', fontWeight: 900, opacity: 0.5 }}>LNKS</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Main Section: Logs */}
                        <div className="gestiva-main-content">
                            <div className="crm-card" style={{ padding: '40px' }}>
                                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <Clock size={24} color="var(--primary-color)" /> Audit Trail
                                    </h2>
                                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '18px' }}>
                                        {['ALL', 'TEMPLATE', 'DISPATCH'].map(f => (
                                            <button 
                                                key={f} 
                                                onClick={() => setActiveFilter(f as any)}
                                                className={`action-btn ${activeFilter === f ? 'primary-btn' : 'ghost-btn'}`}
                                                style={{ height: '32px', fontSize: '10px', padding: '0 16px', borderRadius: '14px' }}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ position: 'relative', marginBottom: '32px' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                    <input 
                                        className="field-input" 
                                        placeholder="Pesquisar em toda a rede de auditoria..." 
                                        value={searchTerm} 
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{ height: '56px', paddingLeft: '56px' }}
                                    />
                                </div>

                                <div className="flex-col gap-3">
                                    {paginatedLogs.map((log, i) => (
                                        <div key={i} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            padding: '20px 24px', 
                                            background: 'rgba(255,255,255,0.02)', 
                                            borderRadius: '24px', 
                                            border: '1px solid var(--surface-border-subtle)',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            <div className="flex items-center gap-6">
                                                <div style={{ width: 44, height: 44, borderRadius: '16px', background: log.logType === 'TEMPLATE' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(59, 130, 246, 0.05)', color: log.logType === 'TEMPLATE' ? '#4ade80' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {log.logType === 'TEMPLATE' ? <MessageSquare size={20} /> : <Send size={20} />}
                                                </div>
                                                <div className="flex-col">
                                                    <div className="flex items-center gap-3">
                                                        <span style={{ fontWeight: 950, fontSize: '1.1rem' }}>{log.author}</span>
                                                        <span className="status-badge-premium" style={{ '--bg': 'rgba(255,255,255,0.03)', '--color': 'var(--text-muted)', '--border': 'rgba(255,255,255,0.1)', fontSize: '8px' } as any}>{log.logType}</span>
                                                    </div>
                                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>{log.name || log.template || 'Operação registrada'}</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 950, lineHeight: 1 }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4 }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-12">
                                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="action-btn ghost-btn" style={{ height: '44px', padding: '0 24px' }}>ANTERIOR</button>
                                        <span style={{ fontWeight: 950, fontSize: '0.9rem', color: 'var(--primary-color)' }}>{currentPage} / {totalPages}</span>
                                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="action-btn ghost-btn" style={{ height: '44px', padding: '0 24px' }}>PRÓXIMA</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* User Management View */
                <div className="crm-card animate-fade-in" style={{ padding: '40px' }}>
                    <div className="flex items-center justify-between mb-12 flex-wrap gap-6">
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0, letterSpacing: '-0.5px' }}>Gestão de Acessos</h2>
                            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 700 }}>Gerenciamento Central de Credenciais</p>
                        </div>
                        <div className="status-badge-premium" style={{ padding: '10px 24px', fontSize: '12px', background: 'rgba(172, 248, 0, 0.05)', color: '#acf800' }}>
                            {users.length} USUÁRIOS ATIVOS
                        </div>
                    </div>

                    <div style={{ position: 'relative', marginBottom: '48px' }}>
                        <Search size={22} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                        <input 
                            className="field-input" 
                            placeholder="Pesquisar por nome, email ou cargo..." 
                            value={userSearchTerm} 
                            onChange={e => setUserSearchTerm(e.target.value)}
                            style={{ height: '70px', paddingLeft: '70px', fontSize: '1.1rem' }}
                        />
                    </div>

                    <div className="card-grid-responsive">
                        {users.filter(u => (u.name || '').toLowerCase().includes(userSearchTerm.toLowerCase())).map((u, i) => (
                            <div key={i} className="crm-card" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--surface-border-subtle)', padding: '32px' }}>
                                <div className="flex items-center gap-6 mb-8">
                                    <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                        <User size={32} />
                                    </div>
                                    <div className="flex-col">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span style={{ fontWeight: 950, fontSize: '1.25rem' }}>{u.name}</span>
                                            <span className="status-badge-premium" style={{ 
                                                '--bg': u.role === 'ADMIN' ? 'rgba(172, 248, 0, 0.1)' : 'rgba(255,255,255,0.05)',
                                                '--color': u.role === 'ADMIN' ? '#acf800' : 'var(--text-muted)',
                                                '--border': u.role === 'ADMIN' ? 'rgba(172, 248, 0, 0.2)' : 'rgba(255,255,255,0.1)',
                                                fontSize: '8px'
                                            } as any}>{u.role}</span>
                                        </div>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>{u.email}</span>
                                    </div>
                                </div>
                                <button 
                                    className="action-btn ghost-btn w-full" 
                                    style={{ height: '48px', fontSize: '10px' }}
                                    onClick={async () => {
                                        const pass = window.prompt(`Nova senha para ${u.name}:`);
                                        if (pass) {
                                            const res = await dbService.adminUpdatePassword(u.id, pass);
                                            alert(res.error ? `Erro: ${res.error}` : 'Credenciais atualizadas com sucesso!');
                                        }
                                    }}
                                >ALTERAR CREDENCIAIS</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Control;
