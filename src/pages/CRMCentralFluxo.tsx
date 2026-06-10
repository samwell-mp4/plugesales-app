import React, { useState, useEffect } from 'react';
import { Activity, Clock, Users, Search, Filter, AlertTriangle, AlertCircle, AlertOctagon, RefreshCw, BarChart2, List as ListIcon, Columns } from 'lucide-react';
import { dbService } from '../services/dbService';

const CRMCentralFluxo = () => {
    const [activeTab, setActiveTab] = useState<'painel' | 'relatorios'>('painel');
    const [viewMode, setViewMode] = useState<'cards' | 'lista'>('cards');
    const [leads, setLeads] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterFuncionario, setFilterFuncionario] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [leadsData, logsData] = await Promise.all([
                dbService.getCRMLeads(),
                dbService.getCRMLogs(200)
            ]);
            setLeads(leadsData || []);
            setLogs(logsData || []);
        } catch (err) {
            console.error("Erro ao carregar dados do Fluxo:", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateIdleDays = (dateStr: string) => {
        if (!dateStr) return 0;
        const updatedDate = new Date(dateStr);
        const diffTime = Math.abs(new Date().getTime() - updatedDate.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const getIdleAlertInfo = (days: number) => {
        if (days >= 7) return { color: '#ef4444', icon: <AlertOctagon size={16} />, label: 'Crítico' };
        if (days >= 5) return { color: '#f97316', icon: <AlertTriangle size={16} />, label: 'Atraso' };
        if (days >= 3) return { color: '#eab308', icon: <AlertCircle size={16} />, label: 'Atenção' };
        return { color: '#22c55e', icon: <Activity size={16} />, label: 'Em Dia' };
    };

    // Filtered Leads
    const filteredLeads = leads.filter(l => {
        const matchFunc = filterFuncionario ? (l.responsavel || '').toLowerCase().includes(filterFuncionario.toLowerCase()) : true;
        const matchStat = filterStatus ? (l.status || '') === filterStatus : true;
        return matchFunc && matchStat;
    });

    const totalLeads = filteredLeads.length;
    const leadsByIdle = {
        critico: filteredLeads.filter(l => calculateIdleDays(l.updated_at) >= 7).length,
        atraso: filteredLeads.filter(l => { const d = calculateIdleDays(l.updated_at); return d >= 5 && d < 7; }).length,
        atencao: filteredLeads.filter(l => { const d = calculateIdleDays(l.updated_at); return d >= 3 && d < 5; }).length,
        emDia: filteredLeads.filter(l => calculateIdleDays(l.updated_at) < 3).length,
    };

    const funcionariosAtivos = Array.from(new Set(leads.map(l => l.responsavel).filter(Boolean)));
    const statusAtivos = Array.from(new Set(leads.map(l => l.status).filter(Boolean)));

    // Chart Data Generation (Simple CSS Bars)
    const topFuncionarios = [...funcionariosAtivos].map(f => ({
        name: f as string,
        count: filteredLeads.filter(l => l.responsavel === f).length
    })).sort((a, b) => b.count - a.count).slice(0, 5);
    const maxFuncCount = Math.max(...topFuncionarios.map(t => t.count), 1);

    return (
        <div className="animate-fade-in" style={{ padding: '32px', paddingBottom: '80px', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="flex justify-between items-center flex-wrap gap-4" style={{ marginBottom: '32px' }}>
                <div className="flex flex-col">
                    <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <BarChart2 size={36} color="var(--primary-color)" /> Central Fluxo de Leads
                    </h1>
                    <p className="subtitle">Monitore a inatividade de leads e o desempenho da equipe em tempo real</p>
                </div>

                <div className="flex gap-2 p-1" style={{ background: 'var(--card-bg-subtle)', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)' }}>
                    <button 
                        className={`btn ${activeTab === 'painel' ? 'btn-primary' : 'btn-secondary'}`} 
                        style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '0.85rem' }}
                        onClick={() => setActiveTab('painel')}
                    >
                        Painel Geral
                    </button>
                    <button 
                        className={`btn ${activeTab === 'relatorios' ? 'btn-primary' : 'btn-secondary'}`} 
                        style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '0.85rem' }}
                        onClick={() => setActiveTab('relatorios')}
                    >
                        Auditoria & Relatórios
                    </button>
                </div>
            </div>

            {/* Global Filters */}
            <div className="glass-card flex items-center flex-wrap" style={{ gap: '24px', marginBottom: '32px', padding: '20px 24px', borderRadius: '20px' }}>
                <div className="flex items-center gap-3">
                    <Filter size={18} color="var(--primary-color)" />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Filtros</span>
                </div>
                <select className="input-field" style={{ width: '220px', padding: '12px', borderRadius: '12px' }} value={filterFuncionario} onChange={e => setFilterFuncionario(e.target.value)}>
                    <option value="">Todos os Funcionários</option>
                    {funcionariosAtivos.map(f => <option key={f as string} value={f as string}>{f as string}</option>)}
                </select>
                <select className="input-field" style={{ width: '220px', padding: '12px', borderRadius: '12px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">Todos os Status</option>
                    {statusAtivos.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                </select>
                <button className="btn-p-control" onClick={loadData} title="Recarregar Dados" style={{ marginLeft: 'auto', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {activeTab === 'painel' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Top Metrics */}
                    <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', borderLeft: '4px solid var(--primary-color)' }}>
                            <div className="flex justify-between items-start mb-4">
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Volume Total</span>
                                <Users size={20} color="var(--primary-color)" />
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>{totalLeads}</h2>
                        </div>
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', borderLeft: '4px solid #ef4444' }}>
                            <div className="flex justify-between items-start mb-4">
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Crítico (+7d)</span>
                                <AlertOctagon size={20} color="#ef4444" />
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: '#ef4444' }}>{leadsByIdle.critico}</h2>
                        </div>
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', borderLeft: '4px solid #f97316' }}>
                            <div className="flex justify-between items-start mb-4">
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Atraso (5-6d)</span>
                                <AlertTriangle size={20} color="#f97316" />
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: '#f97316' }}>{leadsByIdle.atraso}</h2>
                        </div>
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', borderLeft: '4px solid #eab308' }}>
                            <div className="flex justify-between items-start mb-4">
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Atenção (3-4d)</span>
                                <AlertCircle size={20} color="#eab308" />
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: '#eab308' }}>{leadsByIdle.atencao}</h2>
                        </div>
                    </div>

                    {/* Graphics / Chart Section */}
                    <div className="glass-card p-8" style={{ borderRadius: '24px' }}>
                        <h3 style={{ marginBottom: '24px', fontWeight: 800 }}>Desempenho por Funcionário</h3>
                        <div className="flex flex-col gap-4">
                            {topFuncionarios.map((func, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span style={{ width: '150px', fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{func.name}</span>
                                    <div style={{ flex: 1, height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${(func.count / maxFuncCount) * 100}%`, 
                                            height: '100%', 
                                            background: 'linear-gradient(90deg, var(--primary-color), #8bd100)',
                                            borderRadius: '12px',
                                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}></div>
                                    </div>
                                    <span style={{ width: '40px', textAlign: 'right', fontWeight: 900 }}>{func.count}</span>
                                </div>
                            ))}
                            {topFuncionarios.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum dado para exibir.</p>}
                        </div>
                    </div>

                    {/* Leads View Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 style={{ fontWeight: 800 }}>Leads em Foco</h3>
                            <div className="flex gap-2">
                                <button className="btn-p-control" style={{ opacity: viewMode === 'lista' ? 1 : 0.4 }} onClick={() => setViewMode('lista')}><ListIcon size={20} /></button>
                                <button className="btn-p-control" style={{ opacity: viewMode === 'cards' ? 1 : 0.4 }} onClick={() => setViewMode('cards')}><Columns size={20} /></button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-10 text-center text-muted">Carregando fluxo...</div>
                        ) : viewMode === 'lista' ? (
                            <div className="glass-card" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                            <th style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>LEAD</th>
                                            <th style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>RESPONSÁVEL</th>
                                            <th style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>STATUS</th>
                                            <th style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ÚLT. ATUALIZAÇÃO</th>
                                            <th style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OCIOSIDADE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLeads.map(l => {
                                            const idle = calculateIdleDays(l.updated_at);
                                            const alert = getIdleAlertInfo(idle);
                                            return (
                                                <tr key={l.id} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }} className="hover-row">
                                                    <td style={{ padding: '16px', fontWeight: 700 }}>{l.nome || 'Sem Nome'}</td>
                                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{l.responsavel || '-'}</td>
                                                    <td style={{ padding: '16px' }}><span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>{l.status}</span></td>
                                                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(l.updated_at || l.created_at).toLocaleDateString()}</td>
                                                    <td style={{ padding: '16px' }}>
                                                        <div className="flex items-center gap-2" style={{ color: alert.color, fontWeight: 800, fontSize: '0.85rem' }}>
                                                            {alert.icon} {idle} dias ({alert.label})
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {filteredLeads.map(l => {
                                    const idle = calculateIdleDays(l.updated_at);
                                    const alert = getIdleAlertInfo(idle);
                                    return (
                                        <div key={l.id} className="glass-card hover-lift" style={{ padding: '20px', borderRadius: '20px', borderLeft: `4px solid ${alert.color}` }}>
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 style={{ margin: 0, fontWeight: 800 }}>{l.nome || 'Lead'}</h4>
                                                <div className="flex items-center gap-1" style={{ color: alert.color, fontSize: '0.75rem', fontWeight: 800, background: `${alert.color}15`, padding: '4px 8px', borderRadius: '8px' }}>
                                                    {alert.icon} {idle}d
                                                </div>
                                            </div>
                                            <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                Resp: <strong style={{ color: 'var(--text-primary)' }}>{l.responsavel || '-'}</strong>
                                            </p>
                                            <div className="flex justify-between items-center" style={{ marginTop: 'auto' }}>
                                                <span style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontWeight: 700 }}>{l.status}</span>
                                                <span className="flex items-center gap-1" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    <Clock size={12} /> {new Date(l.updated_at || l.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'relatorios' && (
                <div className="glass-card p-8 animate-fade-in" style={{ borderRadius: '24px' }}>
                    <h3 style={{ marginBottom: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ListIcon size={24} color="var(--primary-color)" /> Auditoria de Movimentações
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                        Histórico completo de alterações de status dos leads. Ideal para auditoria de produtividade.
                    </p>
                    
                    {loading ? (
                        <div className="text-center p-10 text-muted">Carregando logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center p-10 text-muted">Nenhum log de movimentação encontrado. Mova alguns leads no funil para gerar registros.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                        <th style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>DATA/HORA</th>
                                        <th style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>LEAD</th>
                                        <th style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FUNCIONÁRIO</th>
                                        <th style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MOVIMENTO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }} className="hover-row">
                                            <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 800 }}>{log.lead_name || 'Desconhecido'}</td>
                                            <td style={{ padding: '16px', color: 'var(--primary-color)', fontWeight: 700 }}>
                                                {log.changed_by_user}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div className="flex items-center gap-2" style={{ fontSize: '0.85rem' }}>
                                                    <span style={{ opacity: 0.6 }}>{log.old_status || 'N/A'}</span>
                                                    <span style={{ opacity: 0.5 }}>→</span>
                                                    <span style={{ fontWeight: 800, background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '4px' }}>{log.new_status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CRMCentralFluxo;
