import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Search, Filter, RefreshCw, User as UserIcon, 
    MessageSquare, Tag, List, Trello, 
    Save, Plus, Trash2, Edit3, X, DollarSign,
    Phone, Mail, Calendar, MapPin, TrendingUp, Target, PieChart, Zap
} from 'lucide-react';
import { dbService } from '../services/dbService';

const CRMFunil = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('kanban');
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // New Lead State
    const [newLead, setNewLead] = useState({
        nome: '',
        numero: '',
        email: '',
        tag: '',
        status: 'Novo',
        responsavel: user?.name || '',
        metodo: '',
        volume: ''
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getCRMLeads();
            let filteredData = data;
            if (user?.role === 'EMPLOYEE') {
                filteredData = data.filter((l: any) => 
                    (l.responsavel || '').toLowerCase() === (user.name || '').toLowerCase()
                );
            }
            setLeads(filteredData);
        } catch (err: any) {
            console.error("CRM Funil Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLead = async () => {
        if (!newLead.nome || !newLead.numero) return alert("Nome e Número são obrigatórios.");
        setIsUpdating(true);
        try {
            await dbService.addCRMLead(newLead);
            await fetchLeads();
            setIsAddModalOpen(false);
            setNewLead({
                nome: '',
                numero: '',
                email: '',
                tag: '',
                status: 'Novo',
                responsavel: user?.name || '',
                metodo: '',
                volume: ''
            });
        } catch (err: any) {
            alert("Erro ao adicionar: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateLead = async (id: string | number, updatedData: any) => {
        setIsUpdating(true);
        try {
            await dbService.updateCRMLead(id, updatedData);
            await fetchLeads(); 
            setSelectedLead(null);
        } catch (err: any) {
            alert("Erro ao salvar: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteLead = async (id: string | number) => {
        if (!window.confirm("Tem certeza que deseja excluir este lead permanentemente?")) return;
        setIsUpdating(true);
        try {
            await dbService.deleteCRMLead(id);
            await fetchLeads(); 
            setSelectedLead(null);
        } catch (err: any) {
            alert("Erro ao excluir: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };


    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const name = lead.nome || '';
            const number = lead.numero || '';
            const responsavel = lead.responsavel || '';
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 number.includes(searchTerm) || 
                                 responsavel.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'Todos' || lead.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [leads, searchTerm, filterStatus]);

    // Metrics Calculations
    const metrics = useMemo(() => {
        const totalLeads = filteredLeads.length;
        const pendingLeads = filteredLeads.filter(l => l.status !== 'Venda Realizada' && l.status !== 'Não Fechou').length;
        const convertedLeads = filteredLeads.filter(l => l.status === 'Venda Realizada').length;
        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

        // Leads Today
        const today = new Date().toISOString().split('T')[0];
        const leadsToday = leads.filter(l => {
            const leadDate = l.created_at ? new Date(l.created_at).toISOString().split('T')[0] : '';
            return leadDate === today;
        }).length;

        return {
            totalLeads,
            leadsToday,
            pendingLeads,
            conversionRate
        };
    }, [filteredLeads, leads]);

    const statusList = ['Aguardando Atendimento', 'Agendamento Realizado', 'Venda Realizada', 'Não Fechou', 'Não Respondeu'];
    
    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return name.substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Recente';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="crm-container animate-fade-in">
            <header className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <Zap size={10} fill="var(--primary-color)" /> 
                        SISTEMA DE PIPELINE NATIVO v2.0
                    </div>
                    <h1 className="crm-main-title">Clientes & Funil</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="crm-toggle-group-premium">
                        <button className={`crm-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')}>
                            <Trello size={14} className="inline mr-2" /> KANBAN
                        </button>
                        <button className={`crm-toggle-btn ${viewMode === 'lista' ? 'active' : ''}`} onClick={() => setViewMode('lista')}>
                            <List size={14} className="inline mr-2" /> LISTA
                        </button>
                    </div>
                    
                    <button className="btn-icon-only" style={{ borderRadius: '14px' }} onClick={fetchLeads}>
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    
                    <button className="btn-supreme" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} strokeWidth={3} /> NOVO LEAD
                    </button>
                </div>
            </header>

            {/* KPI METRICS ROW */}
            <div className="metrics-grid-row">
                <div className="crm-card crm-card-kpi glow-border-primary" style={{ borderLeftColor: 'var(--primary-color)' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3>Total de Leads</h3>
                            <h2>{metrics.totalLeads}</h2>
                        </div>
                        <div className="w-12 h-12 bg-primary-color/10 rounded-2xl flex items-center justify-center text-primary-color">
                            <UserIcon size={24} />
                        </div>
                    </div>
                </div>

                <div className="crm-card crm-card-kpi glow-border-blue" style={{ borderLeftColor: '#3b82f6' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3>Leads de Hoje</h3>
                            <h2>{metrics.leadsToday}</h2>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                            <Calendar size={24} />
                        </div>
                    </div>
                </div>

                <div className="crm-card crm-card-kpi" style={{ borderLeftColor: '#fbbf24' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3>Em Atendimento</h3>
                            <h2>{metrics.pendingLeads}</h2>
                        </div>
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                            <Target size={24} />
                        </div>
                    </div>
                </div>

                <div className="crm-card crm-card-kpi" style={{ borderLeftColor: '#a855f7' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3>Conversão</h3>
                            <h2>{metrics.conversionRate}%</h2>
                        </div>
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                            <PieChart size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SUPREME ACTION BAR */}
            <div className="crm-action-bar">
                <div className="crm-control-group flex-1">
                    <Search size={16} className="icon" />
                    <input 
                        type="text" 
                        className="crm-input-premium" 
                        placeholder="BUSCAR NO FUNIL (NOME, NÚMERO, RESPONSÁVEL)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="crm-control-group w-[280px]">
                    <Filter size={16} className="icon" />
                    <select className="crm-select-premium" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="Todos">TODOS OS STATUS</option>
                        {statusList.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            <main className="animate-funnel">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-primary-color/10 border-t-primary-color rounded-full animate-spin"></div>
                            <Zap size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-color animate-pulse" />
                        </div>
                        <p className="font-black text-primary-color tracking-[0.3em] text-[10px] animate-pulse">SINCRONIZANDO PIPELINE</p>
                    </div>
                ) : (
                    viewMode === 'lista' ? (
                        <div className="crm-table-container">
                            <table className="crm-premium-table">
                                <thead>
                                    <tr>
                                        <th>CLIENTE</th>
                                        <th>MÉTODO</th>
                                        <th>VOLUME</th>
                                        <th>DATA</th>
                                        <th>NÚMERO</th>
                                        <th>EMAIL</th>
                                        <th>RESPONSÁVEL</th>
                                        <th className="text-right">AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map(lead => (
                                        <tr key={lead.id} className="crm-table-row group">
                                            <td>
                                                <div className="flex items-center gap-4">
                                                    <div className="lead-initials-avatar">{getInitials(lead.nome)}</div>
                                                    <span className="font-bold text-white text-[14px]">{lead.nome || 'Sem Nome'}</span>
                                                </div>
                                            </td>
                                            <td><span className="text-[11px] font-bold text-primary-color bg-primary-color/5 px-2 py-1 rounded-md">{lead.metodo || '-'}</span></td>
                                            <td><span className="text-[11px] font-bold text-gray-400">{lead.volume || '-'}</span></td>
                                            <td><span className="text-[11px] font-bold text-white bg-white/5 px-2 py-1 rounded-md uppercase tracking-tighter text-[10px]">{formatDate(lead.created_at)}</span></td>
                                            <td><span className="text-[11px] font-bold text-gray-400">{lead.numero}</span></td>
                                            <td><span className="text-[11px] font-bold text-gray-400">{lead.email || '-'}</span></td>
                                            <td><div className="flex items-center gap-2 text-[11px] font-bold text-gray-400"><UserIcon size={12} className="text-primary-color/50" /> {lead.responsavel || '-'}</div></td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => window.open(`https://wa.me/${(lead.numero || '').replace(/\D/g,'')}`, '_blank')} 
                                                        className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                                        title="WhatsApp"
                                                    >
                                                        <MessageSquare size={16} />
                                                    </button>
                                                    <button onClick={() => setSelectedLead(lead)} className="p-2 bg-white/5 hover:bg-primary-color/20 text-white hover:text-primary-color rounded-lg transition-all"><Edit3 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="kanban-view scrollbar-hide">
                            {statusList.map(status => (
                                <div key={status} className="kanban-col">
                                    <div className="kanban-col-header-premium">
                                        <div className="kanban-col-title-row">
                                            <div className="kanban-col-title">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-color shadow-[0_0_8px_var(--primary-color)]"></div>
                                                {status}
                                            </div>
                                            <span className="kanban-col-badge">
                                                {filteredLeads.filter(l => l.status === status).length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="kanban-cards-container">
                                        {filteredLeads.filter(l => l.status === status).map(lead => (
                                            <div key={lead.id} className="lead-card-glass group" onClick={() => setSelectedLead(lead)}>
                                                <div className="lead-card-header">
                                                    <div className="lead-name-group">
                                                        <span className="lead-tag-pill">{lead.tag || 'Direto'}</span>
                                                        <span className="lead-name group-hover:text-primary-color transition-colors">{lead.nome || 'Lead'}</span>
                                                    </div>
                                                    <div className="lead-initials-avatar">{getInitials(lead.nome)}</div>
                                                </div>

                                                <div className="lead-info-grid">
                                                    <div className="lead-info-item text-primary-color">
                                                        <Zap size={11} fill="currentColor" /> 
                                                        {lead.metodo || 'Sem Método'} | {lead.volume || '0'}
                                                    </div>
                                                    <div className="lead-info-item">
                                                        <Phone size={11} /> 
                                                        {lead.numero}
                                                    </div>
                                                    <div className="lead-info-item">
                                                        <UserIcon size={11} />
                                                        {lead.responsavel}
                                                    </div>
                                                </div>

                                                <div className="lead-footer-actions">
                                                    <div className="lead-date-badge">
                                                        <Calendar size={10} />
                                                        {formatDate(lead.created_at)}
                                                    </div>
                                                    <div className="lead-quick-actions">
                                                        <button 
                                                            className="btn-card-action whatsapp" 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                window.open(`https://wa.me/${(lead.numero || '').replace(/\D/g,'')}`, '_blank'); 
                                                            }}
                                                            title="WhatsApp"
                                                        >
                                                            <MessageSquare size={14} />
                                                        </button>
                                                        <button 
                                                            className="btn-card-action" 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                setSelectedLead(lead); 
                                                            }}
                                                            title="Editar"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button 
                                                            className="btn-card-action delete" 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                handleDeleteLead(lead.id); 
                                                            }}
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {filteredLeads.filter(l => l.status === status).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-[20px] opacity-20">
                                                <Zap size={24} className="mb-2" />
                                                <span className="text-[10px] font-black tracking-widest uppercase">Sem Leads</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>

            {/* MODAL ADICIONAR LEAD */}
            {isAddModalOpen && (
                <div className="crm-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="crm-modal-content" onClick={e => e.stopPropagation()}>
                        <header className="p-10 border-b border-white/5 flex justify-between items-center bg-white/2">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-primary-gradient flex items-center justify-center text-black shadow-xl shadow-primary-color/20"><Plus size={32} strokeWidth={3} /></div>
                                <div>
                                    <h2 className="text-2xl font-black text-white leading-none mb-2">Novo Lead</h2>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Registro Centralizado de Prospectos</p>
                                </div>
                            </div>
                            <button className="btn-icon-only" style={{ width: '48px', height: '48px', borderRadius: '14px' }} onClick={() => setIsAddModalOpen(false)}><X size={24} /></button>
                        </header>

                        <div className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="crm-input-group">
                                    <label>Nome do Lead</label>
                                    <input type="text" className="crm-input" value={newLead.nome} onChange={e => setNewLead({...newLead, nome: e.target.value})} placeholder="Ex: João Silva" />
                                </div>
                                <div className="crm-input-group">
                                    <label>WhatsApp / Celular</label>
                                    <input type="text" className="crm-input" value={newLead.numero} onChange={e => setNewLead({...newLead, numero: e.target.value})} placeholder="5511999999999" />
                                </div>
                                <div className="crm-input-group">
                                    <label>Status no Funil</label>
                                    <select className="crm-input" style={{ appearance: 'auto' }} value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})}>
                                        {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="crm-input-group">
                                    <label>Método de Trabalho</label>
                                    <input type="text" className="crm-input" value={newLead.metodo} onChange={e => setNewLead({...newLead, metodo: e.target.value})} placeholder="Ex: Tráfego Pago, Orgânico..." />
                                </div>
                                <div className="crm-input-group">
                                    <label>Volume de Mensagens</label>
                                    <input type="text" className="crm-input" value={newLead.volume} onChange={e => setNewLead({...newLead, volume: e.target.value})} placeholder="Ex: 100/dia" />
                                </div>
                                <div className="crm-input-group">
                                    <label>Consultor Responsável</label>
                                    <input type="text" className="crm-input" value={newLead.responsavel} onChange={e => setNewLead({...newLead, responsavel: e.target.value})} />
                                </div>
                                <div className="crm-input-group">
                                    <label>Origem / Campanha</label>
                                    <input type="text" className="crm-input" value={newLead.tag} onChange={e => setNewLead({...newLead, tag: e.target.value})} placeholder="Anúncios, Orgânico..." />
                                </div>
                            </div>

                            <button className="btn-supreme w-full mt-10 py-5" onClick={handleAddLead} disabled={isUpdating}>
                                {isUpdating ? <RefreshCw size={22} className="animate-spin" /> : <><Save size={22} /> SALVAR LEAD NO SUPABASE</>} 
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR LEAD */}
            {selectedLead && (
                <div className="crm-modal-overlay" onClick={() => setSelectedLead(null)}>
                    <div className="crm-modal-content" onClick={e => e.stopPropagation()}>
                        <header className="p-10 border-b border-white/5 flex justify-between items-center bg-white/2">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary-color font-black text-2xl shadow-lg">{getInitials(selectedLead.nome)}</div>
                                <div>
                                    <h2 className="text-2xl font-black text-white leading-none mb-2">{selectedLead.nome || 'Editar Lead'}</h2>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{selectedLead.numero} • {selectedLead.tag || 'Sem Tag'}</p>
                                </div>
                            </div>
                            <button className="btn-icon-only" style={{ width: '48px', height: '48px', borderRadius: '14px' }} onClick={() => setSelectedLead(null)}><X size={24} /></button>
                        </header>

                        <div className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="crm-input-group">
                                    <label>Status Comercial</label>
                                    <select 
                                        className="crm-input"
                                        style={{ appearance: 'auto' }}
                                        value={selectedLead.status}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, status: e.target.value })}
                                    >
                                        {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="crm-input-group">
                                    <label>Responsável</label>
                                    <input 
                                        type="text" 
                                        className="crm-input"
                                        value={selectedLead.responsavel}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, responsavel: e.target.value })}
                                    />
                                </div>
                                <div className="crm-input-group">
                                    <label>Tag / Origem</label>
                                    <input 
                                        type="text" 
                                        className="crm-input"
                                        value={selectedLead.tag}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, tag: e.target.value })}
                                    />
                                </div>
                                <div className="crm-input-group">
                                    <label>Método</label>
                                    <input 
                                        type="text" 
                                        className="crm-input"
                                        value={selectedLead.metodo}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, metodo: e.target.value })}
                                    />
                                </div>
                                <div className="crm-input-group">
                                    <label>Volume</label>
                                    <input 
                                        type="text" 
                                        className="crm-input"
                                        value={selectedLead.volume}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, volume: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button className="flex-1 btn-supreme py-5" onClick={() => handleUpdateLead(selectedLead.id, selectedLead)}>
                                    <Save size={20} /> SALVAR ALTERAÇÕES
                                </button>
                                <button className="p-5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 transition-all border border-red-500/20 hover:text-white" onClick={() => handleDeleteLead(selectedLead.id)}>
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRMFunil;
