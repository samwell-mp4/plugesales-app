import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight,
    Plus, Search, Filter, AlertTriangle, CheckCircle2,
    Clock, MoreHorizontal, User, Layout, MessageSquare,
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

    const [activeModal, setActiveModal] = useState<'add' | 'edit' | null>(null);

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

    const openAddModal = () => {
        setActionForm({
            client_name: '',
            action_date: new Date().toISOString().split('T')[0],
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
            <header className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small"><CalendarIcon size={12} /> GESTÃO DE PERFORMANCE</div>
                    <h1 className="crm-main-title">Gestão Consultiva</h1>
                </div>

                <div className="flex gap-4">
                    <button className="sync-btn glass-panel p-3 rounded-xl border-white/5" onClick={fetchActions}><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                    <button className="btn-glow" onClick={openAddModal}><Plus size={18} /> Nova Ação</button>
                </div>
            </header>

            <div className="metrics-grid-row">
                <div className="crm-card border-l-4 border-l-blue-500 hover:scale-[1.02]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">AÇÕES DE {currentDate.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()}</span>
                    <h2 className="text-3xl font-black">{totalActionsMonth}</h2>
                </div>
                <div className="crm-card border-l-4 border-l-green-500 hover:scale-[1.02]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">CONCLUÍDAS</span>
                    <h2 className="text-3xl font-black text-primary-color">{completedActions}</h2>
                </div>
                <div className="crm-card border-l-4 border-l-red-500 hover:scale-[1.02]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">EM ATRASO</span>
                    <h2 className="text-3xl font-black text-red-500">{delayedActions}</h2>
                </div>
                <div className="crm-card border-l-4 border-l-orange-500 hover:scale-[1.02]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">EFETIVIDADE</span>
                    <h2 className="text-3xl font-black">{effectiveness.toFixed(0)}%</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] lg:grid-cols-[1fr_380px] gap-8">
                {/* CALENDAR SECTION */}
                <div className="crm-card p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <button className="btn-icon-only" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1)))}><ChevronLeft size={20} /></button>
                            <h2 className="text-xl font-black uppercase tracking-tight min-w-[180px] text-center">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                            <button className="btn-icon-only" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1)))}><ChevronRight size={20} /></button>
                        </div>
                        <div className="view-modes bg-white/5 p-1 rounded-xl">
                            {['mes', 'semana', 'lista'].map(mode => (
                                <button key={mode} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${viewMode === mode ? 'primary-gradient text-black shadow-lg shadow-primary-glow' : 'text-gray-500'}`} onClick={() => setViewMode(mode as any)}>{mode}</button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                        {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-gray-600 uppercase mb-4">{d}</div>
                        ))}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-white/[0.01] border border-white/5 border-dashed"></div>
                        ))}
                        {days.map(day => {
                            const dayActions = getActionsByDay(day);
                            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                            return (
                                <div key={day} className={`aspect-square rounded-2xl border transition-all p-3 group relative overflow-hidden ${isToday ? 'bg-primary-color/5 border-primary-color/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                                    <span className={`text-xs font-black ${isToday ? 'text-primary-color' : 'text-gray-500'}`}>{day}</span>
                                    <div className="mt-2 flex flex-col gap-1">
                                        {dayActions.map((act, i) => (
                                            <div key={i} className={`text-[8px] font-black px-2 py-1 rounded-md truncate cursor-pointer hover:scale-105 transition-transform ${act.priority === 'ALTA' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : act.priority === 'MÉDIA' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`} onClick={() => openEditModal(act)}>
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
                <div className="flex flex-col gap-8">
                    <div className="crm-card border-t-4 border-t-red-500">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle size={18} className="text-red-500" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Pendências Críticas</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            {actions.filter(a => a.priority === 'ALTA' && a.status === 'PENDENTE').slice(0, 3).map((act, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-red-500/30 transition-all cursor-pointer" onClick={() => openEditModal(act)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-black text-white">{act.client_name}</span>
                                        <Clock size={12} className="text-red-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(act.action_date).toLocaleDateString()}</span>
                                </div>
                            ))}
                            {actions.filter(a => a.priority === 'ALTA' && a.status === 'PENDENTE').length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-20">
                                    <CheckCircle2 size={32} />
                                    <span className="text-[10px] font-black">SEM PENDÊNCIAS</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="crm-card border-t-4 border-t-blue-500">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock size={18} className="text-blue-500" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Entregas da Semana</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            {actions.filter(a => a.status === 'PENDENTE').sort((a,b) => new Date(a.action_date).getTime() - new Date(b.action_date).getTime()).slice(0, 5).map((act, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between group">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-white">{act.client_name}</span>
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">{new Date(act.action_date).toLocaleDateString()}</span>
                                    </div>
                                    <button className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center" onClick={() => handleUpdateStatus(act.id, 'CONCLUÍDA')}><CheckCircle2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL SISTEMA */}
            {activeModal && (
                <div className="crm-modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="crm-modal-content max-w-[500px]" onClick={e => e.stopPropagation()}>
                        <header className="p-8 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">{activeModal === 'add' ? 'Nova Ação Consultiva' : 'Editar Ação'}</h2>
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
                                <button className="flex-1 py-4 bg-primary-color text-black font-black text-sm rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all" onClick={handleSaveAction} disabled={isUpdating}>
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
