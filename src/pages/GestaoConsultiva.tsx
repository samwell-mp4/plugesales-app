import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight,
    Plus, Search, Filter, AlertTriangle, CheckCircle2,
    Clock, MoreHorizontal, User, Layout, MessageSquare
} from 'lucide-react';
import { dbService } from '../services/dbService';

const GestaoConsultiva = () => {
    const { user } = useAuth();
    const [actions, setActions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'mes' | 'semana' | 'lista'>('mes');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAction, setNewAction] = useState({
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
            // If user is employee, filter by their name
            const responsavel = user?.role === 'EMPLOYEE' ? user.name : undefined;
            const data = await dbService.getConsultativeActions(responsavel);
            setActions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAction = async () => {
        try {
            await dbService.addConsultativeAction({
                ...newAction,
                responsavel: user?.name
            });
            setShowAddModal(false);
            fetchActions();
            setNewAction({
                client_name: '',
                action_date: new Date().toISOString().split('T')[0],
                priority: 'MÉDIA',
                status: 'PENDENTE',
                notes: ''
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await dbService.updateConsultativeAction(id, { status });
            fetchActions();
        } catch (err) {
            console.error(err);
        }
    };

    // --- Stats calculation ---
    const totalActionsMonth = actions.filter(a => new Date(a.action_date).getMonth() === currentDate.getMonth()).length;
    const completedActions = actions.filter(a => a.status === 'CONCLUÍDA').length;
    const delayedActions = actions.filter(a => a.status === 'PENDENTE' && new Date(a.action_date) < new Date()).length;
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
        <div className="consultiva-container animate-fade-in">
            <header className="page-header">
                <h1>Gestão Consultiva</h1>
            </header>

            {/* Metrics Cards */}
            <div className="metrics-row">
                <div className="glass-card stat-card border-l-blue">
                    <label>AÇÕES DE {currentDate.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()}</label>
                    <h2>{totalActionsMonth}</h2>
                </div>
                <div className="glass-card stat-card border-l-green">
                    <label>CONCLUÍDAS</label>
                    <h2>{completedActions}</h2>
                </div>
                <div className="glass-card stat-card border-l-red">
                    <label>EM ATRASO</label>
                    <h2>{delayedActions}</h2>
                </div>
                <div className="glass-card stat-card border-l-orange">
                    <label>EFETIVIDADE</label>
                    <h2>{effectiveness.toFixed(0)}%</h2>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar glass-panel">
                <div className="filter-group">
                    <div className="select-wrapper">
                        <User size={14} />
                        <select><option>Filtrar por Cliente</option></select>
                    </div>
                </div>
                <div className="filter-group flex-1">
                    <div className="select-wrapper">
                        <Filter size={14} />
                        <select><option>Prioridade (Toda)</option></select>
                    </div>
                </div>
                <button className="new-btn" onClick={() => setShowAddModal(true)}><Plus size={16} /> Nova Ação</button>
            </div>

            <div className="main-grid">
                {/* Calendar Area */}
                <div className="calendar-area glass-panel">
                    <div className="cal-header">
                        <div className="cal-nav">
                            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1)))}><ChevronLeft size={18} /></button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1)))}><ChevronRight size={18} /></button>
                            <button className="today-btn" onClick={() => setCurrentDate(new Date())}>Hoje</button>
                        </div>
                        <h2 className="current-month-label">
                            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="view-modes">
                            <button className={viewMode === 'mes' ? 'active' : ''} onClick={() => setViewMode('mes')}>Mês</button>
                            <button className={viewMode === 'semana' ? 'active' : ''} onClick={() => setViewMode('semana')}>Semana</button>
                            <button className={viewMode === 'lista' ? 'active' : ''} onClick={() => setViewMode('lista')}>Lista</button>
                        </div>
                    </div>

                    <div className="cal-grid">
                        {['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'].map(d => (
                            <div key={d} className="weekday-label">{d}</div>
                        ))}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="cal-day empty"></div>
                        ))}
                        {days.map(day => {
                            const dayActions = getActionsByDay(day);
                            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                            return (
                                <div key={day} className={`cal-day ${isToday ? 'today' : ''}`}>
                                    <span className="day-num">{day}</span>
                                    <div className="day-actions">
                                        {dayActions.map((act, i) => (
                                            <div key={i} className={`act-pill prio-${act.priority.toLowerCase()}`} title={act.notes}>
                                                {act.client_name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Side Panels */}
                <div className="side-panels">
                    <div className="glass-panel info-panel border-red">
                        <div className="panel-header">
                            <AlertTriangle size={16} className="text-red-500" />
                            <h3>PENDÊNCIAS CRÍTICAS</h3>
                        </div>
                        <div className="panel-content empty">
                             <span className="opacity-20"><AlertTriangle size={32} /></span>
                        </div>
                    </div>

                    <div className="glass-panel info-panel border-blue">
                        <div className="panel-header">
                            <CheckCircle2 size={16} className="text-blue-500" />
                            <h3>ENTREGAS DA SEMANA</h3>
                        </div>
                        <div className="deliveries-list mt-2">
                            {actions.slice(0, 3).map((act, i) => (
                                <div key={i} className="delivery-item">
                                    <div className="d-info">
                                        <span className="d-name">{act.client_name}</span>
                                        <span className="d-meta">{new Date(act.action_date).toLocaleDateString()} - {act.status.toLowerCase()}</span>
                                    </div>
                                    <button className="check-btn" onClick={() => handleUpdateStatus(act.id, 'CONCLUÍDA')}><CheckCircle2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Nova Ação */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content-small">
                        <h3>NOVA AÇÃO CONSULTIVA</h3>
                        <div className="form-group">
                            <label>CLIENTE</label>
                            <input type="text" value={newAction.client_name} onChange={e => setNewAction({...newAction, client_name: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>DATA</label>
                            <input type="date" value={newAction.action_date} onChange={e => setNewAction({...newAction, action_date: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>PRIORIDADE</label>
                            <select value={newAction.priority} onChange={e => setNewAction({...newAction, priority: e.target.value})}>
                                <option>BAIXA</option>
                                <option>MÉDIA</option>
                                <option>ALTA</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>NOTAS</label>
                            <textarea value={newAction.notes} onChange={e => setNewAction({...newAction, notes: e.target.value})}></textarea>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancelar</button>
                            <button className="save-btn" onClick={handleAddAction}>Criar Ação</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .consultiva-container { max-width: 1400px; margin: 20px auto; padding: 0 20px; }
                .page-header h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 25px; }

                .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                .stat-card { padding: 25px; border-radius: 20px; }
                .stat-card label { display: block; font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); margin-bottom: 10px; }
                .stat-card h2 { font-size: 1.8rem; font-weight: 900; margin: 0; }
                .border-l-blue { border-left: 4px solid #3b82f6; }
                .border-l-green { border-left: 4px solid #10b981; }
                .border-l-red { border-left: 4px solid #ef4444; }
                .border-l-orange { border-left: 4px solid #f59e0b; }

                .filters-bar { display: flex; align-items: center; gap: 15px; padding: 12px 20px; border-radius: 16px; margin-bottom: 25px; }
                .select-wrapper { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 8px 15px; border-radius: 12px; min-width: 200px; }
                .select-wrapper select { background: transparent; border: none; color: #fff; font-weight: 600; font-size: 12px; width: 100%; outline: none; }
                
                .new-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 20px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; }
                .new-btn:hover { background: rgba(255,255,255,0.1); }

                .main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 25px; }
                .calendar-area { padding: 25px; border-radius: 24px; }
                .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .cal-nav { display: flex; align-items: center; gap: 10px; }
                .cal-nav button { background: rgba(255,255,255,0.05); border: none; color: #fff; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .today-btn { width: auto !important; padding: 0 15px !important; font-size: 12px; font-weight: 700; }
                .current-month-label { font-size: 1.5rem; font-weight: 900; text-transform: capitalize; }
                
                .view-modes { background: rgba(0,0,0,0.2); padding: 4px; border-radius: 10px; display: flex; }
                .view-modes button { background: transparent; border: none; padding: 6px 15px; border-radius: 6px; color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 800; cursor: pointer; }
                .view-modes button.active { background: #3b8dff20; color: #3b8dff; }

                .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
                .weekday-label { text-align: center; font-size: 12px; font-weight: 900; color: rgba(255,255,255,0.2); padding-bottom: 15px; }
                .cal-day { background: rgba(255,255,255,0.01); aspect-ratio: 1; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03); padding: 10px; position: relative; }
                .cal-day.today { background: rgba(59, 141, 255, 0.05); border-color: rgba(59, 141, 255, 0.2); }
                .day-num { font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.2); }
                .today .day-num { color: #3b8dff; }
                .day-actions { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
                .act-pill { font-size: 9px; font-weight: 800; padding: 3px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .prio-alta { background: #ef444420; color: #ef4444; border-left: 2px solid #ef4444; }
                .prio-média { background: #3b82f620; color: #3b82f6; border-left: 2px solid #3b82f6; }
                .prio-baixa { background: #10b98120; color: #10b981; border-left: 2px solid #10b981; }

                .side-panels { display: flex; flex-direction: column; gap: 20px; }
                .info-panel { padding: 20px; border-radius: 20px; }
                .panel-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
                .panel-header h3 { font-size: 11px; font-weight: 950; letter-spacing: 1px; }
                .panel-content.empty { height: 80px; display: flex; align-items: center; justify-content: center; border: 2px dashed rgba(255,255,255,0.05); border-radius: 12px; margin-top: 10px; }
                
                .delivery-item { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
                .d-info { display: flex; flex-direction: column; }
                .d-name { font-size: 12px; font-weight: 800; color: #fff; }
                .d-meta { font-size: 10px; color: rgba(255,255,255,0.4); }
                .check-btn { background: transparent; border: none; color: rgba(255,255,255,0.1); cursor: pointer; transition: 0.3s; }
                .check-btn:hover { color: #10b981; }

                .modal-content-small { padding: 30px; width: 400px; }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
                .form-group input, .form-group select, .form-group textarea { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; color: #fff; outline: none; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
            `}</style>
        </div>
    );
};

export default GestaoConsultiva;
