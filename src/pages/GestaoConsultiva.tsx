import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    ChevronLeft, ChevronRight, ChevronDown,
    Plus, Search, Filter, AlertTriangle, CheckCircle2,
    Clock, MoreHorizontal, User,
    Trash2, Edit3, X, Save, RefreshCw,
    Globe, Calendar as CalendarIcon, Check, Copy
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { googleCalendarService } from '../services/googleCalendarService';

const GestaoConsultiva = () => {
    const { user } = useAuth();
    const [actions, setActions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'lista'>('mes');
    const [selectedAction, setSelectedAction] = useState<any | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // --- Google Calendar State ---
    const [googleConnected, setGoogleConnected] = useState(false);
    const [googleEmail, setGoogleEmail] = useState<string | null>(null);
    const [calendars, setCalendars] = useState<any[]>([]);
    const [selectedCalendarId, setSelectedCalendarId] = useState<string>(localStorage.getItem('gcal_selected_id') || '');
    const [googleEvents, setGoogleEvents] = useState<any[]>([]);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const [actionForm, setActionForm] = useState({
        client_name: '',
        action_date: new Date().toISOString().split('T')[0],
        priority: 'MÉDIA',
        status: 'PENDENTE',
        notes: '',
        google_event_id: ''
    });

    const [activeModal, setActiveModal] = useState<'add' | 'edit' | null>(null);

    // Initialize GIS and load events
    useEffect(() => {
        fetchActions();
        checkGoogleStatus();
        
        googleCalendarService.initClient(async (code) => {
            if (user?.id) {
                setIsGoogleLoading(true);
                try {
                    await googleCalendarService.exchangeCode(code, user.id);
                    await checkGoogleStatus();
                } catch (err) {
                    console.error("Error exchanging code:", err);
                } finally {
                    setIsGoogleLoading(false);
                }
            }
        });
    }, [user?.id]);

    const checkGoogleStatus = async () => {
        if (!user?.id) return;
        try {
            const status = await googleCalendarService.checkStatus(user.id);
            setGoogleConnected(status.connected);
            setGoogleEmail(status.email);
            if (status.connected) {
                loadCalendars();
            }
        } catch (err) {
            console.error("Error checking Google status:", err);
        }
    };

    useEffect(() => {
        if (googleConnected && selectedCalendarId && calendars.length > 0) {
            fetchGoogleEvents();
        }
    }, [googleConnected, selectedCalendarId, currentDate, calendars.length]);

    const loadCalendars = async () => {
        if (!user?.id || !googleConnected) return;
        try {
            const token = await googleCalendarService.getValidToken(user.id);
            const list = await googleCalendarService.listCalendars(token);
            if (list && list.length > 0) {
                setCalendars(list);
                const currentExists = list.some((c: any) => c.id === selectedCalendarId);
                if (!selectedCalendarId || !currentExists) {
                    const primary = list.find((c: any) => c.primary) || list[0];
                    setSelectedCalendarId(primary.id);
                    localStorage.setItem('gcal_selected_id', primary.id);
                }
            }
        } catch (err) {
            console.error("Error loading calendars:", err);
            if ((err as any).status === 401) {
                setGoogleConnected(false);
            }
        }
    };

    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopyFeedback(id);
        setTimeout(() => setCopyFeedback(null), 2000);
    };

    const fetchGoogleEvents = async () => {
        if (!user?.id || !googleConnected || !selectedCalendarId) return;
        setIsGoogleLoading(true);
        try {
            const token = await googleCalendarService.getValidToken(user.id);
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
            
            const events = await googleCalendarService.listEvents(token, selectedCalendarId, startOfMonth, endOfMonth);
            setGoogleEvents(events);
        } catch (err) {
            console.error("Error fetching Google events:", err);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleGoogleConnect = () => {
        googleCalendarService.requestAuth();
    };

    const fetchActions = async () => {
        setIsLoading(true);
        try {
            const responsavel = user?.role === 'EMPLOYEE' ? user.name : undefined;
            const data = await dbService.getConsultativeActions(responsavel);
            setActions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAction = async () => {
        setIsUpdating(true);
        try {
            let googleId = actionForm.google_event_id;

            // Sincronização com Google Calendar
            if (user?.id && googleConnected && selectedCalendarId) {
                const token = await googleCalendarService.getValidToken(user.id);
                const gEvent = {
                    summary: `[Plug] ${actionForm.client_name}`,
                    description: `Status: ${actionForm.status}\nPrioridade: ${actionForm.priority}\nNotas: ${actionForm.notes}`,
                    start: { dateTime: `${actionForm.action_date}T09:00:00Z` },
                    end: { dateTime: `${actionDateToISO(actionForm.action_date)}T10:00:00Z` },
                };

                if (activeModal === 'edit' && googleId) {
                    await googleCalendarService.updateEvent(token, selectedCalendarId, googleId, gEvent);
                } else {
                    const created = await googleCalendarService.createEvent(token, selectedCalendarId, gEvent, true);
                    googleId = created.id;

                    // Envia Webhook se for uma nova criação com Google Meet
                    const meetLink = created.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri || '';
                    await dbService.sendMeetingWebhook({
                        event_type: 'consultative_action_created',
                        ...actionForm,
                        meeting_link: meetLink,
                        agent_name: user?.name,
                        agent_numero: user?.notification_number || user?.phone || '',
                        responsavel: user?.name,
                        google_id: googleId
                    });
                }
            }

            const payload = { ...actionForm, google_event_id: googleId };

            if (activeModal === 'edit' && selectedAction) {
                await dbService.updateConsultativeAction(selectedAction.id, payload);
            } else {
                await dbService.addConsultativeAction({
                    ...payload,
                    responsavel: user?.name
                });
            }
            
            setActiveModal(null);
            fetchActions();
            if (googleConnected) fetchGoogleEvents();
        } catch (err) {
            console.error(err);
            alert("Erro na sincronização. Verifique sua conexão com o Google.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    // Helper to ensure date is ISO for Google
    const actionDateToISO = (dateStr: string) => {
        return dateStr; // action_date is already YYYY-MM-DD
    };

    const handleDeleteAction = async (id: string | number) => {
        if (!window.confirm("Deseja excluir esta ação permanentemente?")) return;
        try {
            const actionToDelete = actions.find(a => a.id === id);
            if (actionToDelete?.google_event_id && user?.id && googleConnected && selectedCalendarId) {
                const token = await googleCalendarService.getValidToken(user.id);
                await googleCalendarService.deleteEvent(token, selectedCalendarId, actionToDelete.google_event_id);
            }
            await dbService.deleteConsultativeAction(id);
            fetchActions();
            if (googleConnected) fetchGoogleEvents();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (id: string | number, status: string) => {
        try {
            const action = actions.find(a => a.id === id);
            await dbService.updateConsultativeAction(id, { status });
            
            // Sync status to Google if linked
            if (action?.google_event_id && user?.id && googleConnected && selectedCalendarId) {
                const token = await googleCalendarService.getValidToken(user.id);
                const description = `Status: ${status}\nPrioridade: ${action.priority}\nNotas: ${action.notes || ''}`;
                await googleCalendarService.updateEvent(token, selectedCalendarId, action.google_event_id, { description });
            }
            
            fetchActions();
            if (googleConnected) fetchGoogleEvents();
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = (action: any) => {
        setSelectedAction(action);
        setActionForm({
            client_name: action.client_name,
            action_date: action.action_date.split('T')[0],
            priority: action.priority,
            status: action.status,
            notes: action.notes || '',
            google_event_id: action.google_event_id || ''
        });
        setActiveModal('edit');
    };

    const openAddModal = (date?: string) => {
        setActionForm({
            client_name: '',
            action_date: date || new Date().toISOString().split('T')[0],
            priority: 'MÉDIA',
            status: 'PENDENTE',
            notes: '',
            google_event_id: ''
        });
        setActiveModal('add');
    };

    const openGoogleEventModal = (gEvent: any) => {
        // Se já existe uma ação local vinculada, abre ela no modo edit
        const linkedAction = actions.find(a => a.google_event_id === gEvent.id);
        if (linkedAction) {
            openEditModal(linkedAction);
        } else {
            // Se não, abre o modal de ADD pré-preenchido
            setActionForm({
                client_name: gEvent.summary?.replace('[Plug] ', '') || 'Evento Google',
                action_date: (gEvent.start?.dateTime || gEvent.start?.date || '').split('T')[0],
                priority: 'MÉDIA',
                status: 'PENDENTE',
                notes: gEvent.description || '',
                google_event_id: gEvent.id
            });
            setActiveModal('add');
        }
    };

    // --- Stats calculation ---
    const monthActions = actions.filter(a => {
        if (!a || !a.action_date) return false;
        try {
            return new Date(a.action_date).getMonth() === currentDate.getMonth();
        } catch (e) { return false; }
    });
    const totalActionsMonth = monthActions.length;
    const completedActions = monthActions.filter(a => a.status === 'CONCLUÍDA').length;
    const delayedActions = monthActions.filter(a => {
        if (!a || !a.action_date) return false;
        try {
            return a.status === 'PENDENTE' && new Date(a.action_date) < new Date();
        } catch (e) { return false; }
    }).length;
    const effectiveness = totalActionsMonth > 0 ? (completedActions / totalActionsMonth) * 100 : 0;

    // --- Calendar helpers ---
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }, (_, i) => i + 1);

    const getActionsByDay = (day: number) => {
        const dStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        const local = actions.filter(a => a.action_date.startsWith(dStr));
        
        // Filter out Google events that are already represented as local actions
        const localGoogleIds = new Set(actions.map(a => a.google_event_id).filter(id => !!id));
        const google = googleEvents.filter(ge => {
            const geDate = (ge.start?.dateTime || ge.start?.date || '').split('T')[0];
            return geDate === dStr && !localGoogleIds.has(ge.id);
        });

        return { local, google };
    };

    return (
        <div className="crm-container">
            <header className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                <h1 className="text-2xl font-black text-white">Gestão Consultiva</h1>
                
                {/* GOOGLE CALENDAR CONTROLS */}
                <div className="flex items-center gap-3 bg-white/5 p-2 px-4 rounded-2xl border border-white/10 ml-auto">
                    {!googleConnected ? (
                        <button className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:text-primary-color transition-colors" onClick={handleGoogleConnect}>
                            <Globe size={14} /> Conectar Google
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-primary-color uppercase tracking-widest">
                                <Check size={14} /> {googleEmail || 'Conectado'}
                            </div>
                            <div className="flex items-center gap-2 group relative">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Agenda:</span>
                                <select 
                                    className="bg-transparent border-none text-white text-[11px] font-black focus:ring-0 cursor-pointer p-0 appearance-none pr-4"
                                    value={selectedCalendarId}
                                    onChange={(e) => {
                                        setSelectedCalendarId(e.target.value);
                                        localStorage.setItem('gcal_selected_id', e.target.value);
                                    }}
                                >
                                    {calendars.map(c => <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.summary}</option>)}
                                </select>
                                <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                            <button className="text-gray-500 hover:text-white transition-colors" onClick={() => { 
                                if(window.confirm('Desconectar agenda do Google?') && user?.id) {
                                    googleCalendarService.disconnect(user.id).then(() => {
                                        setGoogleConnected(false);
                                        setGoogleEmail(null);
                                    });
                                }
                            }} title="Sair do Google">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* KPI ROW */}
            <div className="metrics-grid-row mb-8">
                <div className="crm-card crm-card-kpi border-l-blue-500">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">AÇÕES DE {currentDate.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()}</span>
                    <h2 className="text-4xl font-black text-white">{totalActionsMonth}</h2>
                </div>
                <div className="crm-card crm-card-kpi border-l-green-500">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">CONCLUÍDAS</span>
                    <h2 className="text-4xl font-black text-white">{completedActions}</h2>
                </div>
                <div className="crm-card crm-card-kpi border-l-red-500">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">EM ATRASO</span>
                    <h2 className="text-4xl font-black text-white">{delayedActions}</h2>
                </div>
                <div className="crm-card crm-card-kpi border-l-orange-500">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">EFETIVIDADE</span>
                    <h2 className="text-4xl font-black text-white">{effectiveness.toFixed(0)}%</h2>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="crm-action-bar mb-8">
                <div className="crm-control-group flex-1">
                    <Search size={16} className="icon" />
                    <input 
                        type="text" 
                        className="crm-input-premium" 
                        placeholder="BUSCAR CLIENTE OU AÇÃO..." 
                    />
                </div>

                <div className="crm-control-group w-[220px]">
                    <Filter size={16} className="icon" />
                    <select className="crm-select-premium">
                        <option value="">TODAS PRIORIDADES</option>
                        <option value="ALTA">ALTA PRIORIDADE</option>
                        <option value="MEDIA">MÉDIA PRIORIDADE</option>
                        <option value="BAIXA">BAIXA PRIORIDADE</option>
                    </select>
                </div>

                <button className="btn-supreme" onClick={() => openAddModal()}>
                    <Plus size={18} /> NOVA AÇÃO
                </button>

                <div className="flex gap-2">
                    <button className="btn-icon-only" onClick={fetchActions}>
                        <RefreshCw size={18} className={isLoading || isGoogleLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT SPLIT - RESPONSIVE CLASSES */}
            <div className="gestiva-split-layout">
                {/* CALENDAR */}
                <div className="crm-card p-10" style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-gray-400 border border-white/10 transition-all hover:border-white/20 active:scale-90" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1)))}><ChevronLeft size={20} /></button>
                            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-gray-400 border border-white/10 transition-all hover:border-white/20 active:scale-90" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1)))}><ChevronRight size={20} /></button>
                            <button className="px-5 py-2 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10 ml-2 transition-all hover:border-white/20 active:scale-95" onClick={() => setCurrentDate(new Date())}>Hoje</button>
                        </div>
                        
                        <h2 className="text-3xl font-black text-white tracking-tighter capitalize drop-shadow-2xl">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                        
                        <div className="crm-toggle-group-premium">
                            {['Mês', 'Semana', 'Lista'].map(mode => (
                                <button 
                                    key={mode} 
                                    className={`crm-toggle-btn ${viewMode === mode.toLowerCase() ? 'active' : ''}`} 
                                    onClick={() => setViewMode(mode.toLowerCase() as any)}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="crm-calendar-inner">
                        {['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sab.'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-gray-600 uppercase mb-4">{d}</div>
                        ))}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-white/[0.01] rounded-xl"></div>
                        ))}
                        {days.map(day => {
                            const { local, google } = getActionsByDay(day);
                            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                            return (
                                <div key={day} className={`crm-day-box ${isToday ? 'is-today' : ''}`} onClick={() => {
                                    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
                                    openAddModal(dateStr);
                                }}>
                                    <span className="crm-day-number">{day}</span>
                                    <div className="mt-1 flex flex-col gap-0.5 max-h-[70%] overflow-y-auto no-scrollbar">
                                        {/* LOCAL CRM ACTIONS */}
                                        {local.map((act, i) => (
                                            <div key={`local-${i}`} className={`crm-action-pill priority-${act.priority.toLowerCase().replace('é','e')}`} title={act.client_name} onClick={(e) => { e.stopPropagation(); openEditModal(act); }}>
                                                <span className="truncate">{act.client_name}</span>
                                                {act.google_event_id && <Globe size={8} className="ml-auto opacity-50 shrink-0" />}
                                            </div>
                                        ))}
                                        {/* GOOGLE EXTERNAL EVENTS */}
                                        {google.map((ge, i) => {
                                            const meetLink = ge.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri;
                                            return (
                                                <div key={`google-${i}`} className="crm-action-pill !bg-white/5 !text-white/60 !border-white/10 flex items-center group/pill" onClick={(e) => { e.stopPropagation(); openGoogleEventModal(ge); }}>
                                                    <CalendarIcon size={8} className="mr-1 shrink-0 group-hover/pill:text-primary-color" />
                                                    <span className="truncate flex-1">{ge.summary || '(Sem Título)'}</span>
                                                    {meetLink && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(meetLink, `calendar-${ge.id}`); }}
                                                            className="ml-1 text-primary-color hover:scale-125 transition-all"
                                                            title="Copiar Link Meet"
                                                        >
                                                            {copyFeedback === `calendar-${ge.id}` ? <Check size={8} /> : <Copy size={8} />}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SIDEBAR PANELS */}
                <div className="gestiva-sidebar-panels flex flex-col gap-6">
                    <div className="crm-card p-8 glow-border-red">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/20">
                                <AlertTriangle size={20} />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Pendências Críticas</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            {actions.filter(a => a.priority === 'ALTA' && a.status === 'PENDENTE').slice(0, 3).map((act, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-red-500/30 transition-all cursor-pointer group" onClick={() => openEditModal(act)}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-black text-white group-hover:text-red-400 transition-colors">{act.client_name}</span>
                                        <Clock size={12} className="text-red-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(act.action_date).toLocaleDateString('pt-BR')}</span>
                                </div>
                            ))}
                            {actions.filter(a => a.priority === 'ALTA' && a.status === 'PENDENTE').length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
                                     <AlertTriangle size={48} className="text-red-500" />
                                     <span className="text-[10px] font-black mt-4">NENHUMA PENDÊNCIA</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="crm-card p-8 glow-border-blue">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/20">
                                <CheckCircle2 size={20} />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Entregas da Semana</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                             {actions.filter(a => a.status === 'PENDENTE').sort((a,b) => new Date(a.action_date).getTime() - new Date(b.action_date).getTime()).slice(0, 4).map((act, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-white">{act.client_name}</span>
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">{new Date(act.action_date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <button className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center" onClick={() => handleUpdateStatus(act.id, 'CONCLUÍDA')} title="Marcar como Concluída"><CheckCircle2 size={14} /></button>
                                </div>
                            ))}
                             {actions.filter(a => a.status === 'PENDENTE').length === 0 && (
                                <div className="h-20 bg-white/5 rounded-3xl border border-white/5 opacity-50 flex items-center justify-center">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Tudo em dia</span>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {activeModal && (
                <div className="crm-modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="crm-modal-content max-w-[500px]" onClick={e => e.stopPropagation()}>
                        <header>
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">{activeModal === 'add' ? 'Nova Ação Controlada' : 'Editar Ação Estratégica'}</h2>
                            <button className="p-3 hover:bg-white/10 rounded-xl text-gray-400 transition-all hover:text-white" onClick={() => setActiveModal(null)}><X size={20} /></button>
                        </header>
                        
                        <div className="crm-modal-body">
                            <div className="crm-input-group">
                                <label>Identificação do Cliente</label>
                                <input type="text" className="crm-input" placeholder="Ex: Cliente Alpha Solutions" value={actionForm.client_name} onChange={e => setActionForm({...actionForm, client_name: e.target.value})} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="crm-input-group">
                                    <label>Data de Execução</label>
                                    <input type="date" className="crm-input" value={actionForm.action_date} onChange={e => setActionForm({...actionForm, action_date: e.target.value})} />
                                </div>
                                <div className="crm-input-group">
                                    <label>Nível de Prioridade</label>
                                    <select className="crm-input" value={actionForm.priority} onChange={e => setActionForm({...actionForm, priority: e.target.value})}>
                                        <option>BAIXA</option>
                                        <option>MÉDIA</option>
                                        <option>ALTA</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="crm-input-group">
                                <label>Notas e Observações Estratégicas</label>
                                <textarea 
                                    className="crm-input h-32 resize-none" 
                                    placeholder="Detalhe os próximos passos aqui..." 
                                    value={actionForm.notes} 
                                    onChange={(e) => setActionForm({...actionForm, notes: e.target.value})}
                                ></textarea>
                            </div>

                            {googleConnected && (
                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center gap-3 p-3 bg-primary-color/5 rounded-xl border border-primary-color/20">
                                        <div className={`w-2 h-2 rounded-full ${actionForm.google_event_id ? 'bg-primary-color animate-pulse' : 'bg-white/10'}`}></div>
                                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest flex-1">
                                            {actionForm.google_event_id ? 'Sincronizado' : 'Pronto para Google'}
                                        </span>
                                        <Globe size={14} className={actionForm.google_event_id ? 'text-primary-color' : 'text-white/20'} />
                                    </div>

                                    {actionForm.google_event_id && googleEvents.find(e => e.id === actionForm.google_event_id) && (
                                        (() => {
                                            const ge = googleEvents.find(e => e.id === actionForm.google_event_id);
                                            const meetLink = ge.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri;
                                            if (!meetLink) return null;
                                            return (
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                            <Globe size={10} className="text-primary-color" /> Link da Reunião
                                                        </span>
                                                        <span className="text-[11px] font-bold text-primary-color truncate underline decoration-primary-color/20">{meetLink}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => copyToClipboard(meetLink, 'modal-meet')}
                                                        className="w-full sm:w-auto px-5 py-2.5 bg-primary-color text-black rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary-color/10"
                                                    >
                                                        {copyFeedback === 'modal-meet' ? <Check size={14} /> : <Copy size={14} />}
                                                        {copyFeedback === 'modal-meet' ? 'COPIADO' : 'COPIAR'}
                                                    </button>
                                                </div>
                                            );
                                        })()
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="crm-modal-footer">
                            <button className="btn-supreme flex-1 py-3.5 text-[10px] tracking-[0.2em]" onClick={handleSaveAction} disabled={isUpdating}>
                                {isUpdating ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                {activeModal === 'add' ? 'CRIAR AÇÃO' : 'SALVAR ALTERAÇÕES'}
                            </button>
                            {activeModal === 'edit' && (
                                <button className="p-3.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg shadow-red-500/10" onClick={() => handleDeleteAction(selectedAction.id)}>
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestaoConsultiva;
