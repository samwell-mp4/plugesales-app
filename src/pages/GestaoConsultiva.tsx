import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    ChevronLeft, ChevronRight,
    Plus, Search, Filter, AlertTriangle, CheckCircle2,
    Clock, MoreHorizontal, User,
    Trash2, Edit3, X, Save, RefreshCw
} from 'lucide-react';
import { dbService } from '../services/dbService';

const GestaoConsultiva = () => {
    const { user } = useAuth();
    const [actions, setActions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'lista'>('mes');
    const [selectedAction, setSelectedAction] = useState<any | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const [actionForm, setActionForm] = useState({
        client_name: '',
        action_date: new Date().toISOString().split('T')[0],
        priority: 'MÉDIA',
        status: 'PENDENTE',
        notes: ''
    });

    const [activeModal, setActiveModal] = useState<'add' | 'edit' | null>(null);

    useEffect(() => {
        fetchActions();
    }, []);

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
            if (activeModal === 'edit' && selectedAction) {
                await dbService.updateConsultativeAction(selectedAction.id, actionForm);
            } else {
                await dbService.addConsultativeAction({
                    ...actionForm,
                    responsavel: user?.name
                });
            }
            setActiveModal(null);
            fetchActions();
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAction = async (id: string | number) => {
        if (!window.confirm("Deseja excluir esta ação permanentemente?")) return;
        try {
            await dbService.deleteConsultativeAction(id);
            fetchActions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (id: string | number, status: string) => {
        try {
            await dbService.updateConsultativeAction(id, { status });
            fetchActions();
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
            notes: action.notes || ''
        });
        setActiveModal('edit');
    };

    const openAddModal = (date?: string) => {
        setActionForm({
            client_name: '',
            action_date: date || new Date().toISOString().split('T')[0],
            priority: 'MÉDIA',
            status: 'PENDENTE',
            notes: ''
        });
        setActiveModal('add');
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
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dStr = d.toISOString().split('T')[0];
        return actions.filter(a => a.action_date.startsWith(dStr));
    };

    return (
        <div className="crm-container">
            <h1 className="text-2xl font-black text-white mb-8">Gestão Consultiva</h1>

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
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
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
                            const dayActions = getActionsByDay(day);
                            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                            return (
                                <div key={day} className={`crm-day-box ${isToday ? 'is-today' : ''}`} onClick={() => {
                                    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
                                    openAddModal(dateStr);
                                }}>
                                    <span className="crm-day-number">{day}</span>
                                    <div className="mt-1 flex flex-col gap-0.5 max-h-[70%] overflow-y-auto no-scrollbar">
                                        {dayActions.map((act, i) => (
                                            <div key={i} className={`crm-action-pill priority-${act.priority.toLowerCase().replace('é','e')}`} onClick={(e) => { e.stopPropagation(); openEditModal(act); }}>
                                                {act.client_name}
                                            </div>
                                        ))}
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
                        <header className="p-8 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">{activeModal === 'add' ? 'Nova Ação' : 'Editar Ação'}</h2>
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400" onClick={() => setActiveModal(null)}><X size={20} /></button>
                        </header>
                        <div className="p-8">
                            <div className="crm-input-group">
                                <label>Nome do Cliente</label>
                                <input type="text" className="crm-input" placeholder="Ex: Cliente Alpha" value={actionForm.client_name} onChange={e => setActionForm({...actionForm, client_name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="crm-input-group">
                                    <label>Data Agenda</label>
                                    <input type="date" className="crm-input" value={actionForm.action_date} onChange={e => setActionForm({...actionForm, action_date: e.target.value})} />
                                </div>
                                <div className="crm-input-group">
                                    <label>Prioridade</label>
                                    <select className="crm-input" value={actionForm.priority} onChange={e => setActionForm({...actionForm, priority: e.target.value})}>
                                        <option>BAIXA</option>
                                        <option>MÉDIA</option>
                                        <option>ALTA</option>
                                    </select>
                                </div>
                            </div>
                            <div className="crm-input-group">
                                <label>Observações</label>
                                <textarea className="crm-input h-24 resize-none" placeholder="..." value={actionForm.notes} onChange={e => setActionForm({...actionForm, notes: e.target.value})}></textarea>
                            </div>
                            
                            <div className="mt-8 flex gap-4">
                                <button className="btn-supreme flex-1 py-4 text-sm" onClick={handleSaveAction} disabled={isUpdating}>
                                    {isUpdating ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                    {activeModal === 'add' ? 'Criar Ação' : 'Salvar Alterações'}
                                </button>
                                {activeModal === 'edit' && (
                                    <button className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20" onClick={() => handleDeleteAction(selectedAction.id)}>
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestaoConsultiva;
