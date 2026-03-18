import React, { useState, useEffect, useMemo } from 'react';
import { 
    ShieldCheck, MessageSquare, Send, Activity, 
    ChevronRight, User, 
    Search, Zap, BookMarked, FileEdit, LayoutDashboard
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';

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
    const [draftLogs, setDraftLogs] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'TEMPLATE' | 'DISPATCH' | 'ENGINE'>('ALL');
    const [activeTab, setActiveTab] = useState<'MONITOR' | 'RASCUNHOS'>('MONITOR');
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        dbService.getLogs().then(logs => {
            setTemplateLogs(logs.filter((l: any) => l.log_type === 'TEMPLATE').map((l: any) => ({
                author: l.author, name: l.name, template: l.template, mode: l.mode,
                timestamp: l.timestamp, logType: 'TEMPLATE'
            })));
            setDispatchLogs(logs.filter((l: any) => l.log_type === 'DISPATCH').map((l: any) => ({
                author: l.author, name: l.name, template: l.template, mode: l.mode,
                total: l.total, success: l.success, logType: 'DISPATCH', timestamp: l.timestamp
            })));
            setEngineLogs(logs.filter((l: any) => l.log_type === 'ENGINE').map((l: any) => ({
                author: l.author, mode: l.mode, transmissionId: l.transmission_id,
                campaignName: l.campaign_name, total: l.total, logType: 'ENGINE', timestamp: l.timestamp
            })));
        });

        dbService.getPlannerDrafts().then(drafts => {
            setDraftLogs(drafts.filter((d: any) => d._draft === true).map((d: any) => ({
                author: d.author || 'Admin',
                label: d.label,
                template: d.templateName,
                tag: d.tag,
                timestamp: d.savedAt || d.timestamp,
                logType: 'DRAFT'
            })));
        });
    }, []);

    const employees = [
        'Italo', 'Augusto', 'Otavio', 'Lucas', 'Geraldo', 'Ricardo'
    ];

    const getStats = (name: string) => {
        const templates = templateLogs.filter(t => t.author === name).length;
        const transmissions = dispatchLogs.filter(d => d.author === name).length;
        const engineRuns = engineLogs.filter(e => e.author === name).length;
        const drafts = draftLogs.filter(dr => dr.author === name).length;
        const total = templates + transmissions + engineRuns + drafts;
        return { templates, transmissions, engineRuns, drafts, total };
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
                (l.template && l.template.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (l.label && l.label.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [templateLogs, dispatchLogs, engineLogs, draftLogs, selectedEmployee, activeFilter, searchTerm]);

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchTerm, selectedEmployee]);

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
            <div className="flex items-center justify-between mb-8">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>Painel de Controle</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <User size={18} style={{ color: 'var(--primary-color)' }} />
                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Logado como: {currentUser?.name || 'Admin'}</span>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => setActiveTab('MONITOR')}
                    className={`btn flex-1 py-4 flex items-center justify-center gap-3 ${activeTab === 'MONITOR' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                        borderRadius: '16px', 
                        fontWeight: 900, 
                        fontSize: '1rem',
                        color: activeTab === 'MONITOR' ? 'black' : 'white',
                        border: activeTab === 'MONITOR' ? 'none' : '1px solid rgba(255,255,255,0.05)'
                    }}
                >
                    <LayoutDashboard size={20} /> PAINEL DE MONITORAMENTO
                </button>
                <button 
                    onClick={() => setActiveTab('RASCUNHOS')}
                    className={`btn flex-1 py-4 flex items-center justify-center gap-3 ${activeTab === 'RASCUNHOS' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                        borderRadius: '16px', 
                        fontWeight: 900, 
                        fontSize: '1rem',
                        color: activeTab === 'RASCUNHOS' ? 'black' : 'white',
                        border: activeTab === 'RASCUNHOS' ? 'none' : '1px solid rgba(172,248,0,0.2)'
                    }}
                >
                    <BookMarked size={20} /> PRONTOS PARA DISPARO (RASCUNHOS)
                </button>
            </div>

            {activeTab === 'MONITOR' ? (
                <div className="animate-fade-in">
                    {/* Global Stats Grid - Matching Home Page Style */}
            <div className="flex gap-6 mb-10 overflow-x-auto pb-4" style={{ flexWrap: 'nowrap' }}>
                <StatCard 
                    title="Ações Globais"
                    value={(templateLogs.length + dispatchLogs.length + engineLogs.length + draftLogs.length).toString()}
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
                <StatCard 
                    title="Rascunhos"
                    value={draftLogs.length.toString()}
                    subtitle="Prontos para disparo"
                    icon={<BookMarked size={24} />}
                    color="#a855f7"
                />
            </div>

            <div className="flex gap-8 flex-wrap">
                {/* Column 1: Employee Ranking */}
                <div className="flex-col gap-8" style={{ flex: '1 1 300px' }}>
                    <div className="glass-card flex-col" style={{ minHeight: '300px' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 style={{ fontSize: '1.2rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '16px', margin: 0 }}>Ranking de Funcionários</h2>
                            <ShieldCheck size={18} style={{ color: 'var(--primary-color)' }} />
                        </div>
                        <div className="flex-col gap-3">
                            {employees.map((employee) => {
                                const stats = getStats(employee);
                                return (
                                    <div 
                                        key={employee} 
                                        className={`flex items-center justify-between p-4 hover-row cursor-pointer ${selectedEmployee === employee ? 'selected-employee' : ''}`} 
                                        style={{ 
                                            border: '1px solid rgba(255,255,255,0.03)', 
                                            background: selectedEmployee === employee ? 'rgba(172,248,0,0.1)' : 'rgba(255,255,255,0.01)',
                                            borderRadius: '16px',
                                            transition: 'all 0.2s',
                                            marginBottom: '8px'
                                        }}
                                        onClick={() => setSelectedEmployee(selectedEmployee === employee ? null : employee)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div style={{
                                                width: '42px', height: '42px', borderRadius: '12px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'var(--text-muted)'
                                            }}>
                                                <User size={20} />
                                            </div>
                                            <div className="flex-col">
                                                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{employee}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats.total} Ações</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} style={{ opacity: 0.5 }} />
                                    </div>
                                );
                            })}
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

                        <div className="flex-col gap-3" style={{ paddingRight: '12px' }}>
                            {paginatedLogs.map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 hover-row shadow-sm" style={{ 
                                    border: '1px solid rgba(255,255,255,0.03)', 
                                    background: 'rgba(255,255,255,0.01)',
                                    borderRadius: '16px',
                                    transition: 'all 0.2s',
                                    marginBottom: '8px'
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
                                <div className="p-20 flex-col items-center justify-center gap-4 opacity-20" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Search size={48} />
                                    <p style={{ fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem' }}>Nenhuma atividade para exibir</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '8px 16px', fontSize: '0.75rem', borderRadius: '10px' }}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </button>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                    Página <span style={{ color: 'white' }}>{currentPage}</span> de {totalPages}
                                </span>
                                <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '8px 16px', fontSize: '0.75rem', borderRadius: '10px' }}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Próxima
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
                </div>
            ) : (
                <div className="animate-fade-in flex-col gap-8">
                    <div className="glass-card flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 style={{ fontSize: '1.2rem', borderLeft: '4px solid var(--primary-color)', paddingLeft: '16px', margin: 0 }}>Prontos para Disparo (Rascunhos)</h2>
                            <div className="badge badge-success" style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 800 }}>
                                {draftLogs.length} RASCUNHOS SALVOS
                            </div>
                        </div>

                        {draftLogs.length > 0 ? (
                            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                                {draftLogs.map((draft, idx) => (
                                    <div key={idx} className="glass-card flex-col p-6 hover-lift" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)', borderRadius: '20px' }}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '12px', borderRadius: '14px' }}>
                                                <BookMarked size={24} />
                                            </div>
                                            <div className="flex-col items-end">
                                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>CRIADO EM</span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{new Date(draft.timestamp).toLocaleDateString()} {new Date(draft.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-col gap-1 mb-6">
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>{draft.label}</h4>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Template: {draft.template}</span>
                                            {draft.tag && <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 800 }}>LOTE: {draft.tag}</span>}
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Autor: {draft.author}</span>
                                        </div>

                                        <div className="flex gap-3 mt-auto">
                                            <button 
                                                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                                                onClick={() => navigate('/template-dispatch', { state: { draft: draft } })}
                                                style={{ fontSize: '0.75rem', fontWeight: 800, borderRadius: '12px' }}
                                            >
                                                <FileEdit size={14} /> EDITAR
                                            </button>
                                            <button 
                                                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                                                onClick={() => navigate('/template-dispatch', { state: { draft: draft, autoSend: true } })}
                                                style={{ color: 'black', fontSize: '0.75rem', fontWeight: 900, borderRadius: '12px' }}
                                            >
                                                <Send size={14} /> DISPARAR
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 flex-col items-center justify-center gap-4 opacity-20" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <BookMarked size={80} />
                                <p style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Nenhum rascunho preparado</p>
                                <p style={{ fontSize: '0.9rem' }}>Vá em Quick Dispatch para preparar novos envios.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
