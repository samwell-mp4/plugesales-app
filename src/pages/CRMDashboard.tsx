import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    FileSpreadsheet, Users, DollarSign, Clock, Search,
    Filter, RefreshCw, AlertCircle, User, MessageSquare,
    Tag, ChevronRight, TrendingUp, List,
    Trello, Mail, Phone, Save, Plus,
    Activity, Layers, Database
} from 'lucide-react';
import { dbService } from '../services/dbService';

const CRM_SPREADSHEET_ID = "1SnrnWoa9szFoonIebmHXRahL8YkQsDc0PC6pVjmqUE0";

const CRMDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
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
            console.log("CRM Leads Fetched:", data); // Debug
            setLeads(data);
        } catch (err: any) {
            console.error("CRM Dashboard Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateLead = async (id: number, updatedData: any) => {
        setIsUpdating(true);
        try {
            await dbService.updateCRMLead(id, updatedData);
            await fetchLeads(); // Sincroniza dados da planilha
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

    // Stats Calculation with robust numeric extraction
    const totalValue = leads.reduce((acc, curr) => {
        const valStr = String(curr.value_client || '0');
        const numericVal = parseFloat(valStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return acc + numericVal;
    }, 0);

    const stats = [
        { label: 'Base de Leads', value: leads.length, icon: <Users size={20} />, color: '#acf800' },
        { label: 'Cifrão Total', value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <DollarSign size={20} />, color: '#acf800' },
        { label: 'Ticket Médio', value: `R$ ${(leads.length > 0 ? totalValue / leads.length : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <TrendingUp size={20} />, color: '#eab308' },
        { label: 'Sincronização', value: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: <Database size={20} />, color: '#94a3b8' }
    ];

    const getStatusBadge = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s.includes('aprov') || s.includes('ganho') || s.includes('conclu')) return 'badge-success';
        if (s.includes('perd') || s.includes('cancel')) return 'badge-danger';
        return 'badge-warning';
    };

    const openLeadDetail = (lead: any) => {
        console.log("Opening lead details:", lead); // Debug
        setSelectedLead(lead);
    };
    const closeLeadDetail = () => setSelectedLead(null);

    return (
        <div className="crm-container animate-fade-in">
            {/* Header com Design Glassmorphism Prêmiun */}
            <header className="crm-header glass-panel">
                <div className="header-identity">
                    <div className="category-tag"><Activity size={12} /> GESTÃO DE PERFORMANCE</div>
                    <h1 className="text-gradient">Painel CRM Estratégico</h1>
                    <p className="subtitle">Sincronização em Tempo Real com Google Sheets (API V4)</p>
                </div>

                <div className="header-actions">
                    <div className="view-selector glass-panel">
                        <button className={`view-btn ${viewMode === 'lista' ? 'active' : ''}`} onClick={() => setViewMode('lista')}><List size={18} /></button>
                        <button className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')}><Trello size={18} /></button>
                    </div>
                    
                    <button className="sync-btn glass-panel" onClick={fetchLeads} disabled={isLoading}>
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        {isLoading ? 'MAPEANDO...' : 'SINCRONIZAR'}
                    </button>

                    <button className="btn-primary" onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${CRM_SPREADSHEET_ID}`, '_blank')}>
                        <Plus size={18} /> NOVO LEAD
                    </button>
                </div>
            </header>

            {/* Stats Cards Dashboard Estilo Premium */}
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card metric-card shadow-hover">
                        <div className="metric-icon" style={{ color: stat.color }}>{stat.icon}</div>
                        <div className="metric-data">
                            <label>{stat.label.toUpperCase()}</label>
                            <h2>{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtros e Busca */}
            <div className="crm-filters glass-panel">
                <div className="search-wrapper">
                    <Search className="search-icon" size={16} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar por nome, número ou responsável..."
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

            {/* Main Content Area */}
            <main className="crm-content glass-panel">
                {isLoading ? (
                    <div className="loading-overlay">
                        <div className="loader"></div>
                        <p>CONECTANDO AO GOOGLE SHEETS...</p>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="empty-state">
                        <Users size={64} style={{ opacity: 0.1 }} />
                        <p>NENHUM DADO ENCONTRADO NA PLANILHA</p>
                    </div>
                ) : (
                    viewMode === 'lista' ? (
                        <div className="crm-table-wrapper">
                            <table className="crm-table">
                                <thead>
                                    <tr>
                                        <th>CLIENTE</th>
                                        <th>STATUS</th>
                                        <th>ORIGEM / TAG</th>
                                        <th>RESPONSÁVEL</th>
                                        <th>VALOR / LEAD</th>
                                        <th>VOLUME</th>
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
                                            <td>
                                                <div className="tag-box">
                                                    <span className="tag-primary"><Tag size={10} /> {lead.tag || '-'}</span>
                                                    {lead.metodo && <span className="tag-secondary"><Layers size={10} /> {lead.metodo}</span>}
                                                </div>
                                            </td>
                                            <td><div className="responsavel-cell"><User size={12} /> {lead.responsavel || '-'}</div></td>
                                            <td><span className="value-high">{lead.value_client || '0'}</span></td>
                                            <td><span className="volume-txt">{lead.volume || '-'}</span></td>
                                            <td className="text-right">
                                                <button className="row-action" onClick={(e) => { e.stopPropagation(); openLeadDetail(lead); }}>
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
                                        <label>VALOR (VALUE_CLIENT)</label>
                                        <input 
                                            type="text" 
                                            defaultValue={selectedLead.value_client}
                                            onBlur={(e) => handleUpdateLead(selectedLead.id, { ...selectedLead, value_client: e.target.value })}
                                            className="premium-input"
                                        />
                                    </div>
                                    <div className="field">
                                        <label>ORIGEM / MÉTODO</label>
                                        <input 
                                            type="text" 
                                            defaultValue={selectedLead.metodo}
                                            onBlur={(e) => handleUpdateLead(selectedLead.id, { ...selectedLead, metodo: e.target.value })}
                                            className="premium-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>ATRIBUIÇÃO E VOLUME</h3>
                                    <div className="field">
                                        <label>RESPONSÁVEL</label>
                                        <input 
                                            type="text" 
                                            defaultValue={selectedLead.responsavel}
                                            onBlur={(e) => handleUpdateLead(selectedLead.id, { ...selectedLead, responsavel: e.target.value })}
                                            className="premium-input"
                                        />
                                    </div>
                                    <div className="field">
                                        <label>VOLUME DE CONTATOS</label>
                                        <input 
                                            type="text" 
                                            defaultValue={selectedLead.volume}
                                            onBlur={(e) => handleUpdateLead(selectedLead.id, { ...selectedLead, volume: e.target.value })}
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
                .crm-container { max-width: 1300px; margin: 30px auto; padding: 0 20px; }
                
                /* Header */
                .crm-header { display: flex; justify-content: space-between; align-items: center; padding: 25px 35px; border-radius: 20px; margin-bottom: 25px; gap: 20px; flex-wrap: wrap; }
                .category-tag { font-size: 10px; font-weight: 800; color: var(--primary-color); display: flex; align-items: center; gap: 6px; margin-bottom: 8px; opacity: 0.8; }
                .text-gradient { font-size: 2.2rem; font-weight: 900; margin: 0; letter-spacing: -1px; }
                .subtitle { margin: 5px 0 0; color: var(--text-muted); font-size: 12px; }

                .header-actions { display: flex; gap: 15px; align-items: center; }
                .view-selector { display: flex; padding: 4px; border-radius: 12px; }
                .view-btn { background: transparent; border: none; padding: 8px 12px; border-radius: 8px; color: var(--text-muted); cursor: pointer; transition: 0.3s; }
                .view-btn.active { background: var(--primary-color); color: #000; }
                .sync-btn { border: none; padding: 10px 20px; border-radius: 12px; font-weight: 800; font-size: 11px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 10px; }

                /* Stats Grid */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 25px; }
                .metric-card { padding: 25px; display: flex; align-items: center; gap: 20px; border-left: 4px solid #acf800; }
                .metric-icon { background: rgba(0,0,0,0.2); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .metric-data label { font-size: 10px; font-weight: 800; color: var(--text-muted); letter-spacing: 1px; }
                .metric-data h2 { font-size: 1.6rem; margin: 5px 0 0; font-weight: 900; }

                /* Filters */
                .crm-filters { display: flex; justify-content: space-between; padding: 15px 30px; border-radius: 16px; margin-bottom: 25px; gap: 20px; }
                .search-wrapper { flex: 1; position: relative; max-width: 500px; }
                .search-icon { position: absolute; left: 15px; top: 13px; color: var(--primary-color); opacity: 0.5; }
                .search-wrapper input { width: 100%; height: 42px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 0 15px 0 45px; color: #fff; outline: none; }
                .status-filter { display: flex; align-items: center; gap: 10px; }
                .status-filter select { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); padding: 8px 15px; border-radius: 10px; color: #fff; font-weight: 700; font-size: 11px; outline: none; }

                /* Content Area */
                .crm-content { border-radius: 20px; min-height: 500px; overflow: hidden; position: relative; }
                .loading-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; gap: 20px; }
                .loader { width: 40px; height: 40px; border: 3px solid rgba(172, 248, 0, 0.1); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; }
                
                .crm-table-wrapper { overflow-x: auto; }
                .crm-table { width: 100%; border-collapse: collapse; }
                .crm-table th { padding: 20px; text-align: left; font-size: 11px; font-weight: 800; color: var(--text-muted); border-bottom: 1px solid rgba(255,255,255,0.05); }
                .crm-table td { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); }
                .crm-row { cursor: pointer; transition: 0.2s; }
                .crm-row:hover { background: rgba(172, 248, 0, 0.03); }

                .client-cell { display: flex; align-items: center; gap: 15px; }
                .mini-avatar { width: 36px; height: 36px; background: var(--primary-color); color: #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
                .client-name { display: block; font-weight: 700; font-size: 14px; }
                .client-sub { font-size: 11px; color: var(--text-muted); }

                .status-badge { padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
                .badge-success { background: var(--success-bg); color: var(--primary-color); }
                .badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .badge-warning { background: rgba(234, 179, 8, 0.1); color: #eab308; }

                .tag-box { display: flex; flex-direction: column; gap: 4px; }
                .tag-primary, .tag-secondary { font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
                .tag-secondary { opacity: 0.6; font-size: 9px; }
                
                .responsavel-cell { font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
                .value-high { font-weight: 800; color: var(--primary-color); font-size: 13px; }
                .volume-txt { font-weight: 600; opacity: 0.8; font-size: 12px; }
                .row-action { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 5px; }

                /* Kanban */
                .kanban-container { display: flex; gap: 20px; padding: 25px; overflow-x: auto; min-height: 600px; }
                .kanban-column { min-width: 300px; flex: 1; background: rgba(255,255,255,0.01); border-radius: 16px; padding: 15px; border: 1px solid rgba(255,255,255,0.03); }
                .kanban-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 5px; }
                .kanban-header h3 { font-size: 12px; font-weight: 900; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase; }
                .kanban-count { background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 5px; font-size: 10px; font-weight: 800; }
                .kanban-card { padding: 18px; margin-bottom: 12px; cursor: pointer; transition: 0.3s; }
                .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .card-name { font-weight: 800; font-size: 13px; }
                .card-val { color: var(--primary-color); font-weight: 900; font-size: 12px; }
                .card-mid { margin-bottom: 12px; }
                .card-phone { font-size: 11px; opacity: 0.5; }
                .card-bot { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }
                .card-agent { font-size: 10px; border: 1px solid rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; }
                .card-tag { font-size: 10px; display: flex; align-items: center; gap: 4px; color: var(--primary-color); }

                /* Modal Prêmiun */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
                .modal-frame { width: 100%; max-width: 800px; border-radius: 28px; overflow: hidden; position: relative; z-index: 1001; background: #0a0a0b; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 40px rgba(0,0,0,0.5); }
                .modal-header { padding: 35px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
                .modal-lead-identity { display: flex; gap: 20px; align-items: center; }
                .lead-avatar { width: 60px; height: 60px; background: var(--primary-color); color: #000; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; }
                .modal-header h2 { margin: 0; font-size: 1.8rem; letter-spacing: -1px; }
                .modal-header p { margin: 5px 0 0; color: var(--text-muted); font-size: 13px; }
                .close-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: 0.3s; }
                .close-btn:hover { color: #fff; }

                .modal-body { padding: 35px; }
                .modal-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                .form-section h3 { font-size: 12px; font-weight: 900; letter-spacing: 1.5px; border-bottom: 1px solid rgba(172,248,0,0.2); padding-bottom: 10px; margin-bottom: 25px; color: var(--primary-color); }
                .field { margin-bottom: 20px; }
                .field label { display: block; font-size: 10px; font-weight: 800; color: var(--text-muted); margin-bottom: 8px; }
                .premium-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px 15px; border-radius: 12px; color: #fff; font-weight: 700; outline: none; transition: 0.3s; }
                .premium-input:focus { border-color: var(--primary-color); background: rgba(172,248,0,0.02); }

                .quick-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 25px; }
                .action-btn { border: none; padding: 12px; border-radius: 10px; font-weight: 800; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
                .wp-link { background: #25d36620; color: #25d366; }
                .wp-link:hover { background: #25d36640; }
                .email-link { background: #3b82f620; color: #3b82f6; }
                .email-link:hover { background: #3b82f640; }

                .modal-footer { padding: 25px 35px; background: rgba(0,0,0,0.2); display: flex; justify-content: flex-end; gap: 15px; }
                .cancel-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 25px; border-radius: 10px; font-weight: 800; cursor: pointer; }
                .save-btn { background: var(--primary-color); color: #000; border: none; padding: 10px 30px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; }

                @keyframes spin { to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default CRMDashboard;
