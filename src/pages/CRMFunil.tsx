import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Users, DollarSign, Search,
    Filter, RefreshCw, User as UserIcon, MessageSquare,
    Tag, ChevronRight, TrendingUp, List,
    Trello, Mail, Save, Plus,
    Activity, Layers, Database
} from 'lucide-react';
import { dbService } from '../services/dbService';

const CRM_SPREADSHEET_ID = "1SnrnWoa9szFoonIebmHXRahL8YkQsDc0PC6pVjmqUE0";

const CRMFunil = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('kanban');
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await dbService.getCRMLeads();
            
            // --- FILTER BY EMPLOYEE LOGIN ---
            // If user is EMPLOYEE, only show leads where responsavel matches user.name
            let filteredData = data;
            if (user?.role === 'EMPLOYEE') {
                filteredData = data.filter((l: any) => 
                    (l.responsavel || '').toLowerCase() === (user.name || '').toLowerCase()
                );
            }
            
            setLeads(filteredData);
        } catch (err: any) {
            console.error("CRM Funil Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateLead = async (id: number, updatedData: any) => {
        setIsUpdating(true);
        try {
            await dbService.updateCRMLead(id, updatedData);
            await fetchLeads(); 
            if (selectedLead && selectedLead.id === id) {
                setSelectedLead({ ...selectedLead, ...updatedData });
            }
        } catch (err: any) {
            alert("Erro ao salvar: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const name = lead.nome || '';
        const number = lead.numero || '';
        const responsavel = lead.responsavel || '';
        
        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            number.includes(searchTerm) ||
            responsavel.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'Todos' || lead.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const statusList = Array.from(new Set(leads.map(l => l.status))).filter(Boolean);
    const fullStatusList = ['Todos', ...statusList];

    const getStatusBadge = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s.includes('aprov') || s.includes('ganho') || s.includes('conclu')) return 'badge-success';
        if (s.includes('perd') || s.includes('cancel')) return 'badge-danger';
        return 'badge-warning';
    };

    const openLeadDetail = (lead: any) => setSelectedLead(lead);
    const closeLeadDetail = () => setSelectedLead(null);

    return (
        <div className="crm-container animate-fade-in">
            <header className="crm-header glass-panel">
                <div className="header-identity">
                    <div className="category-tag"><Trello size={12} /> PIPELINE DE VENDAS</div>
                    <h1 className="text-gradient">Clientes & Funil</h1>
                    <p className="subtitle">Gestão de leads e oportunidades em tempo real</p>
                </div>

                <div className="header-actions">
                    <div className="view-selector glass-panel">
                        <button className={`view-btn ${viewMode === 'lista' ? 'active' : ''}`} onClick={() => setViewMode('lista')}><List size={18} /></button>
                        <button className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')}><Trello size={18} /></button>
                    </div>
                    
                    <button className="sync-btn glass-panel" onClick={fetchLeads} disabled={isLoading}>
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>

                    <button className="btn-primary" onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${CRM_SPREADSHEET_ID}`, '_blank')}>
                        <Plus size={18} /> NOVO LEAD
                    </button>
                </div>
            </header>

            <div className="crm-filters glass-panel">
                <div className="search-wrapper">
                    <Search className="search-icon" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-filter">
                    <Filter size={16} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        {fullStatusList.map(s => <option key={s} value={s}>{s === 'Todos' ? 'TODOS OS STATUS' : s.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            <main className="crm-content glass-panel">
                {isLoading ? (
                    <div className="loading-overlay">
                        <div className="loader"></div>
                        <p>CARREGANDO FUNIL...</p>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="empty-state">
                        <Users size={64} style={{ opacity: 0.1 }} />
                        <p>NENHUM LEAD ENCONTRADO</p>
                    </div>
                ) : (
                    viewMode === 'lista' ? (
                        <div className="crm-table-wrapper">
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>CLIENTE</th>
                                        <th>STATUS</th>
                                        <th>ORIGEM</th>
                                        <th>RESPONSÁVEL</th>
                                        <th>VALOR</th>
                                        <th className="text-right">AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map(lead => (
                                        <tr key={lead.id} className="crm-row" onClick={() => openLeadDetail(lead)}>
                                            <td>
                                                <div className="client-cell">
                                                    <div className="mini-avatar">{(lead.nome || '?').charAt(0)}</div>
                                                    <div className="client-info">
                                                        <span className="client-name">{lead.nome || 'Sem Nome'}</span>
                                                        <span className="client-sub">{lead.numero}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={`status-badge ${getStatusBadge(lead.status)}`}>{lead.status}</span></td>
                                            <td><span className="tag-primary">{lead.tag || '-'}</span></td>
                                            <td><div className="responsavel-cell"><UserIcon size={12} /> {lead.responsavel || '-'}</div></td>
                                            <td><span className="value-high">{lead.value_client || '0'}</span></td>
                                            <td className="text-right">
                                                <button className="row-action">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="kanban-container">
                            {statusList.length > 0 ? statusList.map(status => (
                                <div key={status} className="kanban-column">
                                    <div className="kanban-header">
                                        <h3>{status}</h3>
                                        <span className="kanban-count">{leads.filter(l => l.status === status).length}</span>
                                    </div>
                                    <div className="kanban-cards">
                                        {filteredLeads.filter(l => l.status === status).map(lead => (
                                            <div key={lead.id} className="glass-card kanban-card shadow-hover" onClick={() => openLeadDetail(lead)}>
                                                <div className="card-top">
                                                    <span className="card-name">{lead.nome || 'Sem Nome'}</span>
                                                    <span className="card-val">{lead.value_client}</span>
                                                </div>
                                                <div className="card-mid">
                                                    <span className="card-phone">{lead.numero}</span>
                                                </div>
                                                <div className="card-bot">
                                                    <span className="card-agent">{lead.responsavel}</span>
                                                    {lead.tag && <span className="card-tag"><Tag size={10} /> {lead.tag}</span>}
                                                </div>
                                                <div className="mt-3">
                                                    <button className="w-full py-1.5 bg-success/10 text-success rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-success/20 transition-colors" onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`https://wa.me/${lead.numero.replace(/\D/g,'')}`, '_blank');
                                                    }}>
                                                        <MessageSquare size={12} /> WhatsApp
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-kanban">ADICIONE STATUS NA PLANILHA PARA GERAR COLUNAS KANBAN</div>
                            )}
                        </div>
                    )
                )}
            </main>

            {/* Lead Details Modal */}
            {selectedLead && (
                <div className="modal-overlay" onClick={closeLeadDetail}>
                    <div className="modal-frame glass-panel animate-slide-up" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <div className="modal-lead-identity">
                                <div className="lead-avatar">{(selectedLead.nome || '?').charAt(0)}</div>
                                <div>
                                    <h2>{selectedLead.nome || 'Vendedor/Cliente'}</h2>
                                    <p>{selectedLead.numero} • {selectedLead.email}</p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={closeLeadDetail}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
                        </header>

                        <div className="modal-body">
                            <div className="modal-form-grid">
                                <div className="form-section">
                                    <h3>DADOS COMERCIAIS</h3>
                                    <div className="field">
                                        <label>STATUS ATUAL</label>
                                        <select 
                                            value={selectedLead.status} 
                                            onChange={(e) => handleUpdateLead(selectedLead.id, { ...selectedLead, status: e.target.value })}
                                            className="premium-input"
                                        >
                                            {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label>VALOR</label>
                                        <input 
                                            type="text" 
                                            defaultValue={selectedLead.value_client}
                                            onBlur={(e) => handleUpdateLead(selectedLead.id, { ...selectedLead, value_client: e.target.value })}
                                            className="premium-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>ATRIBUIÇÃO</h3>
                                    <div className="field">
                                        <label>RESPONSÁVEL</label>
                                        <input 
                                            type="text" 
                                            defaultValue={selectedLead.responsavel}
                                            onBlur={(e) => handleUpdateLead(selectedLead.id, { ...selectedLead, responsavel: e.target.value })}
                                            className="premium-input"
                                        />
                                    </div>
                                    <div className="quick-actions">
                                        <button className="action-btn wp-link" onClick={() => window.open(`https://wa.me/${selectedLead.numero.replace(/\D/g,'')}`, '_blank')}>
                                            <MessageSquare size={14} /> CHAMAR WHATSAPP
                                        </button>
                                        <button className="action-btn email-link" onClick={() => window.location.href = `mailto:${selectedLead.email}`}>
                                            <Mail size={14} /> ENVIAR E-MAIL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <footer className="modal-footer">
                            <button className="cancel-btn" onClick={closeLeadDetail}>VOLTAR</button>
                            <button className="save-btn" onClick={closeLeadDetail} disabled={isUpdating}>
                                {isUpdating ? <RefreshCw className="animate-spin" /> : <Save size={18} />}
                                SALVAR ALTERAÇÕES
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            <style>{`
                .crm-container { max-width: 1400px; margin: 20px auto; padding: 0 20px; }
                .crm-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-radius: 20px; margin-bottom: 20px; }
                .text-gradient { font-size: 1.8rem; font-weight: 900; background: linear-gradient(135deg, #fff 0%, var(--primary-color) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .category-tag { font-size: 10px; font-weight: 800; color: var(--primary-color); display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
                .header-actions { display: flex; gap: 12px; align-items: center; }
                .view-selector { display: flex; padding: 4px; border-radius: 12px; }
                .view-btn { background: transparent; border: none; padding: 8px 12px; border-radius: 8px; color: rgba(255,255,255,0.4); cursor: pointer; transition: 0.3s; }
                .view-btn.active { background: var(--primary-color); color: #000; }
                .sync-btn { background: rgba(255,255,255,0.05); border: none; padding: 10px; border-radius: 10px; color: #fff; cursor: pointer; }

                .crm-filters { display: flex; justify-content: space-between; padding: 12px 20px; border-radius: 16px; margin-bottom: 20px; gap: 20px; }
                .search-wrapper { flex: 1; position: relative; }
                .search-icon { position: absolute; left: 15px; top: 13px; color: var(--primary-color); opacity: 0.5; }
                .search-wrapper input { width: 100%; height: 42px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 0 15px 0 45px; color: #fff; outline: none; }
                
                .crm-content { border-radius: 20px; min-height: 600px; overflow: hidden; position: relative; }
                .kanban-container { display: flex; gap: 20px; padding: 20px; overflow-x: auto; min-height: 650px; }
                .kanban-column { min-width: 320px; flex: 1; background: rgba(255,255,255,0.02); border-radius: 16px; padding: 15px; display: flex; flex-direction: column; }
                .kanban-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 5px; }
                .kanban-header h3 { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase; }
                .kanban-count { background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 5px; font-size: 10px; font-weight: 800; }
                .kanban-cards { display: flex; flex-direction: column; gap: 12px; flex: 1; }
                .kanban-card { padding: 16px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); }
                .kanban-card:hover { border-color: var(--primary-color); transform: translateY(-2px); }
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
                .card-name { font-weight: 800; font-size: 13px; color: #fff; }
                .card-val { color: var(--primary-color); font-weight: 900; font-size: 12px; }
                .card-phone { font-size: 11px; opacity: 0.5; }
                .card-bot { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; margin-top: 10px; }
                .card-agent { font-size: 10px; border: 1px solid rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; color: rgba(255,255,255,0.6); }

                .crm-table { width: 100%; border-collapse: collapse; }
                .crm-table th { padding: 15px 20px; text-align: left; font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.3); border-bottom: 1px solid rgba(255,255,255,0.05); letter-spacing: 1px; }
                .crm-table td { padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); }
                .crm-row:hover { background: rgba(172, 248, 0, 0.03); }

                .badge-success { background: rgba(172, 248, 0, 0.1); color: var(--primary-color); }
                .badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .badge-warning { background: rgba(234, 179, 8, 0.1); color: #eab308; }
                .status-badge { padding: 4px 10px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
                .modal-frame { width: 100%; max-width: 700px; border-radius: 24px; overflow: hidden; background: #0a0a0b; border: 1px solid rgba(255,255,255,0.1); }
                .modal-header { padding: 25px 30px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
                .modal-lead-identity { display: flex; gap: 15px; align-items: center; }
                .lead-avatar { width: 50px; height: 50px; background: var(--primary-color); color: #000; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; }
                
                .modal-body { padding: 30px; }
                .modal-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                .form-section h3 { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--primary-color); margin-bottom: 20px; border-bottom: 1px solid rgba(172,248,0,0.1); padding-bottom: 8px; }
                .field { margin-bottom: 15px; }
                .field label { display: block; font-size: 9px; font-weight: 800; color: rgba(255,255,255,0.3); margin-bottom: 6px; }
                .premium-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 10px 14px; border-radius: 10px; color: #fff; font-weight: 600; outline: none; }
                
                .modal-footer { padding: 20px 30px; background: rgba(0,0,0,0.2); display: flex; justify-content: flex-end; gap: 12px; }
                .cancel-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; }
                .save-btn { background: var(--primary-color); color: #000; border: none; padding: 8px 25px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; }
            `}</style>
        </div>
    );
};

export default CRMFunil;
