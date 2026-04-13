import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Search, Filter, RefreshCw, User as UserIcon, 
    MessageSquare, Tag, List, Trello, Star,
    Save, Plus, Trash2, Edit3, X, DollarSign,
    Phone, Mail, Calendar, MapPin, TrendingUp, Target, PieChart, Zap,
    ChevronRight, Briefcase, Globe, Info, Clock, CheckCircle,
    AlertTriangle, ChevronDown, ChevronUp, ArrowRightLeft, Check
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { googleCalendarService } from '../services/googleCalendarService';

// --- Components ---

const LeadCard = memo(({ 
    lead, onEdit, onFavorite, onWhatsApp, onSchedule, 
    isExpanded, onToggleExpand, leadToMove, onSetLeadToMove, 
    statusList, onMove, formatDate, getInitials 
}: any) => {
    const isMovingThis = leadToMove?.id === lead.id;

    return (
        <div 
            className={`lead-card-glass group ${isExpanded ? 'is-expanded' : ''} ${isMovingThis ? 'is-selected-move animate-pulse-border' : ''}`} 
            onClick={() => onEdit(lead)}
        >
            <div className="lead-card-header">
                <div className="lead-name-group">
                    <span className="lead-tag-pill">{lead.tag || 'Direto'}</span>
                    <span className="lead-name group-hover:text-primary-color transition-colors">{lead.nome || 'Lead'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"
                        onClick={(e) => { e.stopPropagation(); onToggleExpand(lead.id); }}
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <div className="lead-initials-avatar">{getInitials(lead.nome)}</div>
                </div>
            </div>

            <div className="lead-info-grid">
                <div className="lead-info-item text-primary-color">
                    <Zap size={11} fill="currentColor" /> 
                    {lead.metodo || 'Sem Método'} | {lead.volume || '0'}
                </div>
                {isExpanded && (
                    <>
                        <div className="lead-info-item">
                            <Phone size={11} /> 
                            {lead.numero}
                        </div>
                        <div className="lead-info-item">
                            <UserIcon size={11} />
                            {lead.responsavel}
                        </div>
                    </>
                )}
            </div>

            {isExpanded && (
                <div className="lead-card-details-expanded animate-fade-in mt-4 pt-4 border-t border-white/5">
                     {lead.email && <div className="text-[10px] text-gray-500 mb-2 truncate"><Mail size={10} className="inline mr-1" /> {lead.email}</div>}
                     {lead.nicho && <div className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-widest"><Target size={10} className="inline mr-1" /> {lead.nicho}</div>}
                     
                     {/* B) MOVIMENTAÇÃO INTERNA NO CARD */}
                     <div className="mt-4 p-3 bg-white/3 rounded-xl border border-white/5">
                        <p className="text-[9px] font-black text-primary-color uppercase mb-2 tracking-widest flex items-center gap-2">
                            <ArrowRightLeft size={10} /> Mover para outro Status:
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {statusList.filter((s: string) => s !== lead.status).map((status: string) => (
                                <button 
                                    key={status}
                                    className="px-2 py-1 bg-white/5 hover:bg-primary-color/20 text-[8px] font-black text-white/50 hover:text-primary-color rounded-md transition-all border border-white/5"
                                    onClick={(e) => { e.stopPropagation(); onMove(lead.id, status); }}
                                >
                                    {status.toUpperCase()}
                                </button>
                            ))}
                        </div>
                     </div>
                </div>
            )}

            <div className="lead-footer-actions">
                <div className="lead-date-badge">
                    <Calendar size={10} />
                    {formatDate(lead.created_at)}
                </div>
                <div className="lead-quick-actions">
                    <button 
                        className={`btn-card-action ${isMovingThis ? 'active-move' : 'bg-white/5 text-gray-400'}`}
                        onClick={(e) => { e.stopPropagation(); onSetLeadToMove(isMovingThis ? null : lead); }}
                        title="Mover (Clique aqui e depois no topo da coluna destino)"
                    >
                        <ArrowRightLeft size={14} />
                    </button>
                    <button 
                        className="btn-card-action bg-primary-color/10 text-primary-color hover:bg-primary-color hover:text-black"
                        onClick={(e) => { e.stopPropagation(); onSchedule(lead); }}
                        title="Agendar Reunião Google"
                    >
                        <Calendar size={14} />
                    </button>
                    <button 
                        className={`lead-favorite-btn ${lead.is_favorite ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onFavorite(lead); }}
                    >
                        <Star size={14} fill={lead.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                    <button 
                        className="btn-card-action whatsapp" 
                        onClick={(e) => { e.stopPropagation(); onWhatsApp(lead.numero); }}
                        title="WhatsApp"
                    >
                        <MessageSquare size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
});

LeadCard.displayName = 'LeadCard';

const statusList = [
    'Aguardando Atendimento',
    'Agendamento Realizado',
    'Venda Realizada',
    'Não Fechou',
    'Não Respondeu'
];

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

    // --- Interaction States ---
    const [expandedCards, setExpandedCards] = useState<Set<string | number>>(new Set());
    const [leadToMove, setLeadToMove] = useState<any | null>(null);

    // --- Google Calendar State ---
    const [googleToken, setGoogleToken] = useState<string | null>(localStorage.getItem('gcal_token'));
    const [isScheduling, setIsScheduling] = useState<any | null>(null);
    const [calendars, setCalendars] = useState<any[]>([]);
    const [selectedCalendarId, setSelectedCalendarId] = useState<string>(localStorage.getItem('gcal_selected_id') || '');

    const [scheduleForm, setScheduleForm] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        createMeet: true
    });
    
    // New Lead State
    const [newLead, setNewLead] = useState({
        nome: '',
        numero: '',
        email: '',
        tag: '',
        status: 'Aguardando Atendimento',
        responsavel: user?.name || '',
        metodo: '',
        volume: '',
        nicho: ''
    });

    useEffect(() => {
        fetchLeads();

        googleCalendarService.initClient((token) => {
            setGoogleToken(token);
            localStorage.setItem('gcal_token', token);
            loadCalendars(token);
        });

        if (googleToken) {
            const checkAndLoad = setInterval(() => {
                if ((window as any).google?.accounts?.oauth2) {
                    loadCalendars(googleToken);
                    clearInterval(checkAndLoad);
                }
            }, 500);
            return () => clearInterval(checkAndLoad);
        }
    }, []);

    // Desktop/Laptop default expanded
    useEffect(() => {
        if (!isLoading && leads.length > 0 && window.innerWidth > 1024) {
             setExpandedCards(new Set(leads.map(l => l.id.toString())));
        }
    }, [isLoading, leads.length]);

    const toggleExpand = (id: string | number) => {
        const next = new Set(expandedCards);
        if (next.has(id.toString())) next.delete(id.toString());
        else next.add(id.toString());
        setExpandedCards(next);
    };

    const loadCalendars = async (token: string) => {
        if (!token) return;
        try {
            const list = await googleCalendarService.listCalendars(token);
            if (list && list.length > 0) {
                setCalendars(list);
                // Sincroniza com o ID salvo globalmente
                const savedId = localStorage.getItem('gcal_selected_id');
                const exists = list.some((c: any) => c.id === savedId);
                
                if (savedId && exists) {
                    setSelectedCalendarId(savedId);
                } else {
                    const primary = list.find((c: any) => c.primary) || list[0];
                    setSelectedCalendarId(primary.id);
                    localStorage.setItem('gcal_selected_id', primary.id);
                }
            }
        } catch (err) {
            console.error("Error loading calendars:", err);
            if ((err as any).status === 401) {
                setGoogleToken(null);
                localStorage.removeItem('gcal_token');
            }
        }
    };

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
                status: 'Aguardando Atendimento',
                responsavel: user?.name || '',
                metodo: '',
                volume: '',
                nicho: ''
            });
        } catch (err: any) {
            alert("Erro ao adicionar: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleScheduleMeeting = async () => {
        if (!googleToken || !selectedCalendarId || !isScheduling) return;
        setIsUpdating(true);
        try {
            const startDateTime = `${scheduleForm.date}T${scheduleForm.time}:00`;
            const endDate = new Date(new Date(startDateTime).getTime() + scheduleForm.duration * 60000);
            const endDateTime = endDate.toISOString();

            const event = {
                summary: `[Plug] Reunião: ${isScheduling.nome}`,
                description: `Lead: ${isScheduling.nome}\nTelefone: ${isScheduling.numero}\nEmail: ${isScheduling.email || 'Não informado'}\n\nAgendado via CRM Plug & Sales`,
                start: { dateTime: new Date(startDateTime).toISOString() },
                end: { dateTime: endDateTime }
            };

            const created = await googleCalendarService.createEvent(
                googleToken, 
                selectedCalendarId, 
                event, 
                scheduleForm.createMeet
            );

            // Atualiza o lead no CRM
            const updatedData = {
                status: 'Agendamento Realizado',
                google_event_id: created.id,
                meeting_date: startDateTime,
                meeting_link: created.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri || ''
            };

            await dbService.updateCRMLead(isScheduling.id, updatedData);
            await fetchLeads();
            setIsScheduling(null);
            alert("Agendamento realizado com sucesso!");
        } catch (err: any) {
            console.error("Schedule Error:", err);
            alert("Erro ao agendar: " + err.message);
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

    // --- CLICK TO MOVE LOGIC ---
    const handleMoveLead = async (leadId: string | number, newStatus: string) => {
        setIsUpdating(true);
        const originalLeads = [...leads];
        // Optimistic update
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        setLeadToMove(null);

        try {
            await dbService.updateCRMLead(leadId, { status: newStatus });
        } catch (err) {
            console.error("Error updating status:", err);
            setLeads(originalLeads); // rollback
            alert("Erro ao mover lead.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleColumnHeaderClick = (status: string) => {
        if (leadToMove && leadToMove.status !== status) {
            handleMoveLead(leadToMove.id, status);
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

    const toggleFavorite = async (lead: any) => {
        const updated = { ...lead, is_favorite: !lead.is_favorite };
        setLeads(leads.map(l => l.id === lead.id ? updated : l));
        if (selectedLead && selectedLead.id === lead.id) {
            setSelectedLead(updated);
        }
        try {
            await dbService.updateCRMLead(lead.id, { is_favorite: updated.is_favorite });
        } catch (err) {
            console.error("Error toggling favorite:", err);
            fetchLeads();
        }
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const name = (lead.nome || '').toLowerCase();
            const number = (lead.numero || '').toLowerCase();
            const responsavel = (lead.responsavel || '').toLowerCase();
            const query = searchTerm.toLowerCase();

            const matchesSearch = name.includes(query) || number.includes(query) || responsavel.includes(query);
            const matchesFilter = filterStatus === 'Todos' || lead.status === filterStatus;

            return matchesSearch && matchesFilter;
        });
    }, [leads, searchTerm, filterStatus]);

    const leadsByStatus = useMemo(() => {
        const groups: Record<string, any[]> = {};
        statusList.forEach(status => groups[status] = []);
        filteredLeads.forEach(lead => {
            if (groups[lead.status]) {
                groups[lead.status].push(lead);
            }
        });
        return groups;
    }, [filteredLeads]);

    const metrics = useMemo(() => {
        const totalLeads = filteredLeads.length;
        const pendingLeads = filteredLeads.filter(l => l.status !== 'Venda Realizada' && l.status !== 'Não Fechou').length;
        const convertedLeads = filteredLeads.filter(l => l.status === 'Venda Realizada').length;
        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

        const today = new Date().toISOString().split('T')[0];
        const leadsToday = leads.filter(l => {
            const leadDate = l.created_at ? new Date(l.created_at).toISOString().split('T')[0] : '';
            return leadDate === today;
        }).length;

        return { totalLeads, leadsToday, pendingLeads, conversionRate };
    }, [filteredLeads, leads]);

    const getInitials = useCallback((name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return name.substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, []);

    const formatDate = useCallback((dateStr: string) => {
        if (!dateStr) return 'Recente';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }, []);

    const handleWhatsApp = useCallback((numero: string) => {
        window.open(`https://wa.me/${(numero || '').replace(/\D/g,'')}`, '_blank');
    }, []);

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
                                        <th className="w-[40px]"></th>
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
                                                <button 
                                                    className={`lead-favorite-btn ${lead.is_favorite ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(lead); }}
                                                >
                                                    <Star size={16} fill={lead.is_favorite ? 'currentColor' : 'none'} />
                                                </button>
                                            </td>
                                            <td onClick={() => setSelectedLead(lead)} className="cursor-pointer">
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
                                                        onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${(lead.numero || '').replace(/\D/g,'')}`, '_blank'); }} 
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
                        <div className="kanban-view">
                            {statusList.map(status => (
                                <div key={status} className="kanban-col">
                                    <div 
                                        className={`kanban-col-header-premium cursor-pointer transition-all rounded-2xl ${leadToMove ? 'bg-primary-color/10 ring-1 ring-primary-color/30' : ''}`}
                                        onClick={() => handleColumnHeaderClick(status)}
                                    >
                                        <div className="kanban-col-title-row">
                                            <div className="kanban-col-title">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-color shadow-[0_0_8px_var(--primary-color)]"></div>
                                                {status}
                                            </div>
                                            <span className="kanban-col-badge">
                                                {filteredLeads.filter(l => l.status === status).length}
                                            </span>
                                        </div>
                                        {leadToMove && leadToMove.status !== status && (
                                            <div className="flex items-center justify-center gap-2 mt-2 py-2 bg-primary-color/20 rounded-xl animate-pulse">
                                                <ArrowRightLeft size={12} className="text-primary-color" />
                                                <span className="text-[9px] font-black text-primary-color italic">CLIQUE AQUI PARA MOVER</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="kanban-cards-container">
                                        {(leadsByStatus[status] || []).map((lead) => (
                                            <LeadCard 
                                                key={lead.id} 
                                                lead={lead} 
                                                isExpanded={expandedCards.has(lead.id.toString())}
                                                onToggleExpand={toggleExpand}
                                                leadToMove={leadToMove}
                                                onSetLeadToMove={setLeadToMove}
                                                statusList={statusList}
                                                onMove={handleMoveLead}
                                                onEdit={setSelectedLead}
                                                onFavorite={toggleFavorite}
                                                onWhatsApp={handleWhatsApp}
                                                onSchedule={setIsScheduling}
                                                formatDate={formatDate}
                                                getInitials={getInitials}
                                            />
                                        ))}

                                        {(leadsByStatus[status] || []).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-[24px] opacity-10">
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

            {/* MODAL ADICIONAR LEAD SUPREME */}
            {isAddModalOpen && (
                <div className="supreme-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="supreme-modal-content crm-add-modal max-w-[800px] h-auto" onClick={e => e.stopPropagation()}>
                        <header>
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center text-black shadow-xl shadow-primary-color/20"><Plus size={28} strokeWidth={3} /></div>
                                <div>
                                    <h2 className="text-xl font-black text-white leading-none mb-1 text-primary-color italic">SUPREME LEAD ENTRY</h2>
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Registro Centralizado de Prospectos</p>
                                </div>
                            </div>
                            <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
                        </header>

                        <div className="supreme-modal-body">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="crm-input-group">
                                    <label>Identificação</label>
                                    <input type="text" className="crm-input" value={newLead.nome} onChange={e => setNewLead({...newLead, nome: e.target.value})} placeholder="Nome do Cliente" />
                                </div>
                                <div className="crm-input-group">
                                    <label>Contato WhatsApp</label>
                                    <input type="text" className="crm-input" value={newLead.numero} onChange={e => setNewLead({...newLead, numero: e.target.value})} placeholder="5511999999999" />
                                </div>
                                <div className="crm-input-group">
                                    <label>E-mail</label>
                                    <input type="email" className="crm-input" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} placeholder="email@exemplo.com" />
                                </div>
                                <div className="crm-input-group">
                                    <label>Nicho de Atuação</label>
                                    <input type="text" className="crm-input" value={newLead.nicho} onChange={e => setNewLead({...newLead, nicho: e.target.value})} placeholder="Ex: Estética, Imobiliário..." />
                                </div>
                                <div className="crm-input-group">
                                    <label>Método</label>
                                    <input type="text" className="crm-input" value={newLead.metodo} onChange={e => setNewLead({...newLead, metodo: e.target.value})} placeholder="Ex: Tráfego Pago" />
                                </div>
                                <div className="crm-input-group">
                                    <label>Volume Estimado</label>
                                    <input type="text" className="crm-input" value={newLead.volume} onChange={e => setNewLead({...newLead, volume: e.target.value})} placeholder="Ex: 50/semana" />
                                </div>
                            </div>
                        </div>

                        <div className="supreme-modal-footer">
                            <button className="btn-supreme w-full py-5 text-sm tracking-widest font-black" onClick={handleAddLead} disabled={isUpdating}>
                                {isUpdating ? <RefreshCw size={22} className="animate-spin" /> : <><Save size={20} /> FINALIZAR CADASTRO SUPREME</>} 
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUPREME MODAL DETALHES LEAD */}
            {selectedLead && (
                <div className="supreme-modal-overlay" onClick={() => setSelectedLead(null)}>
                    <div className="supreme-modal-content max-w-[1000px] h-[85vh]" onClick={e => e.stopPropagation()}>
                        {/* Sidebar */}
                        <aside className="supreme-modal-sidebar">
                            <div className="flex flex-col items-center text-center gap-4 mb-8">
                                <div className="w-24 h-24 rounded-3xl bg-primary-color flex items-center justify-center text-black text-4xl font-black shadow-2xl shadow-primary-color/30">
                                    {getInitials(selectedLead.nome)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">{selectedLead.nome}</h2>
                                    <p className="text-[10px] text-primary-color font-black uppercase tracking-widest">{selectedLead.status}</p>
                                </div>
                            </div>

                            <div className="supreme-sidebar-actions">
                                <button 
                                    className="btn-supreme py-4 justify-center" 
                                    onClick={() => window.open(`https://wa.me/${(selectedLead.numero || '').replace(/\D/g,'')}`, '_blank')}
                                >
                                    <MessageSquare size={18} /> ABRIR WHATSAPP
                                </button>
                                
                                <button 
                                    className={`btn-sidebar-supreme favorite ${selectedLead.is_favorite ? 'active' : ''}`}
                                    onClick={() => toggleFavorite(selectedLead)}
                                >
                                    <Star size={18} fill={selectedLead.is_favorite ? '#fbbf24' : 'none'} /> 
                                    {selectedLead.is_favorite ? 'NOS FAVORITOS' : 'ADICIONAR FAVORITO'}
                                </button>

                                <button 
                                    className="btn-sidebar-supreme delete"
                                    onClick={() => handleDeleteLead(selectedLead.id)}
                                >
                                    <Trash2 size={18} /> EXCLUIR REGISTRO
                                </button>
                            </div>

                            <div className="mt-auto p-6 bg-white/2 rounded-3xl border border-white/5">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-4">Ações Rápidas</p>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-xs text-white/50 font-bold">
                                        <Clock size={14} className="text-primary-color" />
                                        Entrada: {formatDate(selectedLead.created_at)}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-white/50 font-bold">
                                        <UserIcon size={14} className="text-primary-color" />
                                        Resp: {selectedLead.responsavel}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="supreme-modal-main flex-1 overflow-y-auto p-12">
                            <div className="flex justify-between items-center mb-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-12 bg-primary-gradient rounded-full"></div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white italic tracking-tight">DETALHES DO LEAD</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Lead Captured via Step Landing Page</p>
                                    </div>
                                </div>
                                <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all" onClick={() => setSelectedLead(null)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <section className="supreme-detail-section">
                                <h4 className="supreme-section-title"><UserIcon size={14} /> Informações de Contato</h4>
                                <div className="supreme-info-grid">
                                    <div className="supreme-info-card">
                                        <span className="supreme-info-label">Nome Completo</span>
                                        <input 
                                            className="bg-transparent border-none text-white font-black text-lg p-0 focus:ring-0 w-full"
                                            value={selectedLead.nome}
                                            onChange={(e) => setSelectedLead({...selectedLead, nome: e.target.value})}
                                        />
                                    </div>
                                    <div className="supreme-info-card">
                                        <span className="supreme-info-label">WhatsApp / Telefone</span>
                                        <input 
                                            className="bg-transparent border-none text-white font-black text-lg p-0 focus:ring-0 w-full"
                                            value={selectedLead.numero}
                                            onChange={(e) => setSelectedLead({...selectedLead, numero: e.target.value})}
                                        />
                                    </div>
                                    <div className="supreme-info-card">
                                        <span className="supreme-info-label">E-mail</span>
                                        <input 
                                            className="bg-transparent border-none text-white/80 font-bold text-sm p-0 focus:ring-0 w-full"
                                            value={selectedLead.email || ''}
                                            onChange={(e) => setSelectedLead({...selectedLead, email: e.target.value})}
                                            placeholder="Não informado"
                                        />
                                    </div>
                                    <div className="supreme-info-card">
                                        <span className="supreme-info-label">Status no Funil</span>
                                        <select 
                                            className="bg-transparent border-none text-primary-color font-black text-sm p-0 focus:ring-0 w-full cursor-pointer uppercase"
                                            value={selectedLead.status}
                                            onChange={(e) => setSelectedLead({...selectedLead, status: e.target.value})}
                                        >
                                            {statusList.map(s => <option key={s} value={s} className="bg-[#0f172a]">{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className="supreme-detail-section">
                                <h4 className="supreme-section-title"><Globe size={14} /> Dados da Captura (Step Landing Page)</h4>
                                <div className="supreme-info-grid">
                                    <div className="supreme-info-card">
                                        <span className="supreme-info-label">Método de Trabalho</span>
                                        <input 
                                            className="bg-transparent border-none text-white font-black text-lg p-0 focus:ring-0 w-full"
                                            value={selectedLead.metodo || ''}
                                            onChange={(e) => setSelectedLead({...selectedLead, metodo: e.target.value})}
                                            placeholder="-"
                                        />
                                    </div>
                                    <div className="supreme-info-card">
                                        <span className="supreme-info-label">Volume de Mensagens</span>
                                        <input 
                                            className="bg-transparent border-none text-white font-black text-lg p-0 focus:ring-0 w-full"
                                            value={selectedLead.volume || ''}
                                            onChange={(e) => setSelectedLead({...selectedLead, volume: e.target.value})}
                                            placeholder="-"
                                        />
                                    </div>
                                    <div className="supreme-info-card">
                                        <span className="supreme-info-label">Origem / Tag</span>
                                        <input 
                                            className="bg-transparent border-none text-white/60 font-bold text-sm p-0 focus:ring-0 w-full"
                                            value={selectedLead.tag || ''}
                                            onChange={(e) => setSelectedLead({...selectedLead, tag: e.target.value})}
                                            placeholder="Anúncios, Orgânico..."
                                        />
                                    </div>
                                    <div className="supreme-info-card">
                                        <span className="supreme-info-label">Consultor Atribuído</span>
                                        <input 
                                            className="bg-transparent border-none text-white/60 font-bold text-sm p-0 focus:ring-0 w-full"
                                            value={selectedLead.responsavel}
                                            onChange={(e) => setSelectedLead({...selectedLead, responsavel: e.target.value})}
                                        />
                                    </div>
                                    {selectedLead.meeting_link && (
                                        <div className="supreme-info-card lg:col-span-2 border-primary-color/30 bg-primary-color/5">
                                            <span className="supreme-info-label text-primary-color">Link da Reunião (Google Meet)</span>
                                            <div className="flex items-center justify-between mt-1">
                                                <a href={selectedLead.meeting_link} target="_blank" rel="noreferrer" className="text-white font-black text-sm underline truncate decoration-primary-color underline-offset-4">
                                                    {selectedLead.meeting_link}
                                                </a>
                                                <Globe size={16} className="text-primary-color animate-pulse" />
                                            </div>
                                            <span className="text-[9px] text-gray-500 font-bold uppercase mt-2 block">Data: {new Date(selectedLead.meeting_date).toLocaleString('pt-BR')}</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="supreme-modal-footer">
                                <button className="btn-supreme py-5 px-10" onClick={() => handleUpdateLead(selectedLead.id, selectedLead)}>
                                    <Save size={20} /> SALVAR ALTERAÇÕES SUPREME
                                </button>
                            </div>
                        </main>
                    </div>
                </div>
            )}

            {/* GOOGLE SCHEDULING MODAL */}
            {isScheduling && (
                <div className="supreme-modal-overlay" onClick={() => setIsScheduling(null)}>
                    <div className="supreme-modal-content max-w-[450px]" onClick={e => e.stopPropagation()}>
                        <header>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-color/10 flex items-center justify-center text-primary-color"><Calendar size={24} /></div>
                                <div>
                                    <h2 className="text-lg font-black text-white leading-none mb-1">AGENDAR REUNIÃO</h2>
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{isScheduling.nome}</p>
                                </div>
                            </div>
                            <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white" onClick={() => setIsScheduling(null)}><X size={20} /></button>
                        </header>
                        <div className="supreme-modal-body">
                            {!googleToken ? (
                                <div className="text-center py-10">
                                    <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-white mb-6">Você precisa conectar sua conta Google primeiro.</p>
                                    <button className="btn-supreme w-full py-4" onClick={() => googleCalendarService.requestToken()}>
                                        <Globe size={18} /> CONECTAR GOOGLE CALENDAR
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    <div className="crm-input-group">
                                        <label>Agenda Destino</label>
                                        <div className="relative">
                                            <select 
                                                className="crm-input appearance-none"
                                                value={selectedCalendarId}
                                                onChange={(e) => {
                                                    setSelectedCalendarId(e.target.value);
                                                    localStorage.setItem('gcal_selected_id', e.target.value);
                                                }}
                                            >
                                                {calendars.map(c => <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.summary}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="crm-input-group">
                                            <label>Data</label>
                                            <input type="date" className="crm-input" value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} />
                                        </div>
                                        <div className="crm-input-group">
                                            <label>Horário</label>
                                            <input type="time" className="crm-input" value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="crm-input-group">
                                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                                            <input 
                                                type="checkbox" 
                                                id="meet-link"
                                                className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary-color focus:ring-primary-color"
                                                checked={scheduleForm.createMeet}
                                                onChange={e => setScheduleForm({...scheduleForm, createMeet: e.target.checked})}
                                            />
                                            <label htmlFor="meet-link" className="text-xs font-bold text-white cursor-pointer select-none">
                                                Gerar Link Automático do Google Meet
                                            </label>
                                        </div>
                                    </div>

                                    <button className="btn-supreme w-full py-5 text-sm" onClick={handleScheduleMeeting} disabled={isUpdating}>
                                        {isUpdating ? <RefreshCw size={22} className="animate-spin" /> : <><Save size={20} /> FINALIZAR AGENDAMENTO</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRMFunil;
