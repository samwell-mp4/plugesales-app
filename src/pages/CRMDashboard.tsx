import { useState, useEffect } from 'react';
import {
    FileSpreadsheet, Users, DollarSign, Clock, Search,
    Filter, RefreshCw, AlertCircle, User, MessageSquare,
    Tag, ChevronRight, TrendingUp, ArrowUpRight, List,
    Trello, Mail, Phone, Edit3, X, Save, Plus, ArrowRight,
    ExternalLink
} from 'lucide-react';
import { dbService } from '../services/dbService';

const CRM_SPREADSHEET_ID = "1SnrnWoa9szFoonIebmHXRahL8YkQsDc0PC6pVjmqUE0";

const CRMDashboard = () => {
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
            await fetchLeads(); // Refresh data
            if (selectedLead && selectedLead.id === id) {
                const newLead = { ...selectedLead, ...updatedData };
                setSelectedLead(newLead);
            }
        } catch (err: any) {
            alert("Erro ao atualizar: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.numero.includes(searchTerm) ||
            lead.responsavel.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'Todos' || lead.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const statusList = Array.from(new Set(leads.map(l => l.status))).filter(Boolean);
    const fullStatusList = ['Todos', ...statusList];

    // Calc Stats
    const totalLeads = leads.length;
    const totalValue = leads.reduce((acc, curr) => {
        const val = parseFloat(curr.value_client?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return acc + val;
    }, 0);

    const stats = [
        { label: 'Total de Leads', value: totalLeads, icon: <Users size={22} />, color: 'var(--primary-color)', suffix: 'CONTATOS' },
        { label: 'Valor Total CRM', value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <DollarSign size={22} />, color: '#acf800', suffix: 'CONVERTIDO' },
        { label: 'Tickets Médio', value: `R$ ${(totalLeads > 0 ? totalValue / totalLeads : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <TrendingUp size={22} />, color: '#eab308', suffix: 'MÉDIO/LEAD' },
        { label: 'Última Sincro', value: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: <Clock size={22} />, color: 'var(--text-muted)', suffix: 'SYNC OK' }
    ];

    const getStatusBadgeClass = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s.includes('aprov') || s.includes('ganho') || s.includes('feito') || s.includes('conclu')) return 'badge-success';
        if (s.includes('pend') || s.includes('novo') || s.includes('andamento') || s.includes('espera')) return 'badge-warning';
        if (s.includes('perd') || s.includes('canc')) return 'badge-danger';
        return '';
    };

    const openLeadDetail = (lead: any) => setSelectedLead(lead);
    const closeLeadDetail = () => setSelectedLead(null);

    const renderListView = () => (
        <div className="table-responsive-wrapper">
            <table className="crm-premium-table">
                <thead>
                    <tr>
                        <th>CLIENTE / LEADS</th>
                        <th>STATUS ATUAL</th>
                        <th>REFERÊNCIA / TAG</th>
                        <th>RESPONSÁVEL</th>
                        <th>INVESTIMENTO</th>
                        <th className="text-center">ENTRADA</th>
                        <th className="text-right">AÇÕES</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLeads.map((lead) => (
                        <tr key={lead.id} onClick={() => openLeadDetail(lead)} className="clickable-row">
                            <td>
                                <div className="lead-identity">
                                    <div className="avatar-mini">{lead.nome.charAt(0)}</div>
                                    <div className="lead-meta">
                                        <span className="lead-name">{lead.nome}</span>
                                        <span className="lead-sub">{lead.numero}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`badge-pill ${getStatusBadgeClass(lead.status)}`}>
                                    {lead.status}
                                </span>
                            </td>
                            <td>
                                <div className="tag-element">
                                    <Tag size={12} />
                                    <span>{lead.tag || 'SEM TAG'}</span>
                                </div>
                            </td>
                            <td>
                                <div className="responsavel-box">
                                    <User size={12} className="text-primary-color" />
                                    <span>{lead.responsavel || '-'}</span>
                                </div>
                            </td>
                            <td>
                                <span className="investment-value">{lead.value_client || 'R$ 0,00'}</span>
                            </td>
                            <td className="text-center font-mono text-[10px] opacity-50">
                                {lead.data_entrada}
                            </td>
                            <td className="text-right">
                                <button className="row-action-btn" onClick={(e) => { e.stopPropagation(); openLeadDetail(lead); }}>
                                    <ChevronRight size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderKanbanView = () => {
        // Define columns based on existing statuses or a default set
        const columns = statusList.length > 0 ? statusList : ['Novo', 'Andamento', 'Ganho', 'Perdido'];
        
        return (
            <div className="kanban-board-container">
                {columns.map(col => (
                    <div key={col} className="kanban-column">
                        <div className="kanban-column-header">
                            <h3>{col.toUpperCase()}</h3>
                            <span className="column-count">{leads.filter(l => l.status === col).length}</span>
                        </div>
                        <div className="kanban-cards-wrapper">
                            {filteredLeads.filter(l => l.status === col).map(lead => (
                                <div key={lead.id} className="kanban-card-glass shadow-hover" onClick={() => openLeadDetail(lead)}>
                                    <div className="card-top">
                                        <div className="card-avatar">{lead.nome.charAt(0)}</div>
                                        <div className="card-main-info">
                                            <h4>{lead.nome}</h4>
                                            <p>{lead.numero}</p>
                                        </div>
                                    </div>
                                    <div className="card-tags">
                                        {lead.tag && <span className="mini-tag"><Tag size={10} /> {lead.tag}</span>}
                                        <span className="mini-value">{lead.value_client}</span>
                                    </div>
                                    <div className="card-footer">
                                        <span className="card-ref">{lead.responsavel || 'Sem atrito'}</span>
                                        <ChevronRight size={14} className="arrow-icon" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="crm-advanced-view animate-fade-in-up">
            <header className="crm-main-header">
                <div className="header-info">
                    <div className="badge-category">
                        <FileSpreadsheet className="text-primary-color" size={14} />
                        <span>CRM INTELIGENTE</span>
                    </div>
                    <h1 className="main-title">Base de Clientes <span className="highlight">Unificada</span></h1>
                    <p className="subtitle">Gestão avançada de leads sincronizada em tempo real com sua planilha Google.</p>
                </div>

                <div className="header-actions">
                    <div className="view-switcher-tabs">
                        <button 
                            className={`tab-btn ${viewMode === 'lista' ? 'active' : ''}`}
                            onClick={() => setViewMode('lista')}
                        >
                            <List size={18} />
                            <span>LISTA</span>
                        </button>
                        <button 
                            className={`tab-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                        >
                            <Trello size={18} />
                            <span>KANBAN</span>
                        </button>
                    </div>
                    <button
                        onClick={fetchLeads}
                        className={`refresh-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        <RefreshCw size={18} />
                        <span>{isLoading ? 'SINCRONIZANDO...' : 'ATUALIZAR'}</span>
                    </button>
                    <button className="primary-action-btn" onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${CRM_SPREADSHEET_ID}`, '_blank')}>
                        <Plus size={18} />
                        <span>NOVO LEAD</span>
                    </button>
                </div>
            </header>

            {/* ERROR HANDLING */}
            {error && (
                <div className="auth-error-card">
                    <AlertCircle size={32} strokeWidth={2.5} />
                    <div className="error-content">
                        <h3>FALHA NA CONEXÃO COM O GOOGLE</h3>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* METRICS - ADVANCED GRID */}
            <section className="metrics-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="metric-glass-card shadow-hover">
                        <div className="metric-header">
                            <div className="icon-box" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}20` }}>
                                {stat.icon}
                            </div>
                            <span className="metric-suffix">{stat.suffix}</span>
                        </div>
                        <div className="metric-body">
                            <label>{stat.label}</label>
                            <h2 className="text-gradient-primary">{stat.value}</h2>
                        </div>
                        <div className="metric-footer-bar" style={{ background: stat.color }}></div>
                    </div>
                ))}
            </section>

            {/* SEARCH & FILTERS BAR */}
            <div className="crm-search-bar glass-container">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, telefone, responsável..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters-group">
                    <div className="select-wrapper">
                        <Filter size={16} />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            {fullStatusList.map(s => <option key={s} value={s}>{s === 'Todos' ? 'FILTRAR STATUS' : s.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <button className="shortcut-mini-btn" onClick={() => setFilterStatus('Novo')}>
                        <Plus size={14} /> NOVOS
                    </button>
                    <button className="shortcut-mini-btn" onClick={() => setFilterStatus('Ganho')}>
                        <DollarSign size={14} /> GANHOS
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <section className="main-crm-content glass-container shadow-2xl">
                {isLoading ? (
                    <div className="table-loader-state">
                        <div className="loader-spinner"></div>
                        <p>MAPEANDO DADOS DA PLANILHA...</p>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="table-empty-state">
                        <Users className="empty-icon" size={48} />
                        <p>NENHUM RESULTADO ENCONTRADO NA BASE</p>
                    </div>
                ) : (
                    viewMode === 'lista' ? renderListView() : renderKanbanView()
                )}
            </section>

            {/* LEAD DETAIL MODAL */}
            {selectedLead && (
                <div className="lead-modal-overlay animate-fade-in" onClick={closeLeadDetail}>
                    <div className="lead-modal-content glass-container animate-slide-up" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <div className="lead-header-info">
                                <div className="avatar-large">{selectedLead.nome.charAt(0)}</div>
                                <div>
                                    <h2>{selectedLead.nome}</h2>
                                    <span className={`badge-pill ${getStatusBadgeClass(selectedLead.status)}`}>
                                        {selectedLead.status}
                                    </span>
                                </div>
                            </div>
                            <button className="close-modal-btn" onClick={closeLeadDetail}><X size={24} /></button>
                        </header>

                        <div className="modal-body-grid">
                            <div className="info-section">
                                <h3>DADOS DO CONTATO</h3>
                                <div className="input-group">
                                    <label><Phone size={14} /> TELEFONE</label>
                                    <div className="copy-field">
                                        <input type="text" value={selectedLead.numero} readOnly />
                                        <button onClick={() => window.open(`https://wa.me/${selectedLead.numero.replace(/\D/g, '')}`, '_blank')} className="action-link-btn green">
                                            <MessageSquare size={16} /> WHATSAPP
                                        </button>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label><Mail size={14} /> E-MAIL</label>
                                    <div className="copy-field">
                                        <input type="text" value={selectedLead.email} readOnly />
                                        <button onClick={() => window.location.href = `mailto:${selectedLead.email}`} className="action-link-btn blue">
                                            <Mail size={16} /> ENVIAR E-MAIL
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="edit-section">
                                <h3>GERENCIAMENTO</h3>
                                <div className="input-group">
                                    <label>STATUS ATUAL</label>
                                    <select 
                                        value={selectedLead.status} 
                                        onChange={(e) => handleUpdateLead(selectedLead.id, { ...selectedLead, status: e.target.value })}
                                        disabled={isUpdating}
                                    >
                                        {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>RESPONSÁVEL</label>
                                    <input 
                                        type="text" 
                                        defaultValue={selectedLead.responsavel} 
                                        onBlur={(e) => handleUpdateLead(selectedLead.id, { ...selectedLead, responsavel: e.target.value })}
                                        disabled={isUpdating}
                                        placeholder="Nome do consultor..."
                                    />
                                </div>
                                <div className="input-group">
                                    <label>VALOR DO CLIENTE</label>
                                    <input 
                                        type="text" 
                                        defaultValue={selectedLead.value_client} 
                                        onBlur={(e) => handleUpdateLead(selectedLead.id, { ...selectedLead, value_client: e.target.value })}
                                        disabled={isUpdating}
                                        placeholder="R$ 0,00"
                                    />
                                </div>
                            </div>
                        </div>

                        <footer className="modal-footer">
                            <button className="secondary-btn" onClick={closeLeadDetail}>FECHAR</button>
                            <button className="primary-action-btn" onClick={closeLeadDetail}>
                                <Save size={18} /> SALVAR ALTERAÇÕES
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            <style>{`
                /* --- ADVANCED CRM STYLES --- */
                .crm-advanced-view {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 40px;
                    background: transparent;
                }

                .crm-main-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                    gap: 30px;
                    flex-wrap: wrap;
                }

                .header-info .main-title {
                    font-size: 3rem;
                    font-weight: 900;
                    letter-spacing: -1.5px;
                    margin: 10px 0;
                }
                .highlight {
                    background: var(--primary-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .subtitle { color: var(--text-secondary); opacity: 0.7; font-size: 1rem; }

                /* VIEW SWITCHER */
                .view-switcher-tabs {
                    display: flex;
                    background: rgba(255,255,255,0.03);
                    padding: 4px;
                    border-radius: 14px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 900;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    background: transparent;
                }
                .tab-btn.active {
                    background: var(--primary-color);
                    color: black;
                    box-shadow: 0 4px 12px rgba(172, 248, 0, 0.2);
                }

                .badge-category {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(172, 248, 0, 0.08);
                    padding: 6px 14px;
                    border-radius: 50px;
                    font-size: 10px;
                    font-weight: 900;
                    color: var(--primary-color);
                    border: 1px solid rgba(172, 248, 0, 0.2);
                }

                .header-actions { display: flex; gap: 12px; align-items: center; }
                .refresh-btn, .primary-action-btn {
                    height: 48px;
                    padding: 0 20px;
                    border-radius: 14px;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }
                .refresh-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); color: white; }
                .refresh-btn.loading svg { animation: spin 1s linear infinite; }
                .primary-action-btn { background: var(--primary-gradient); color: black; border: none; }

                /* METRICS */
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .metric-glass-card {
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(172, 248, 0, 0.1);
                    padding: 24px;
                    border-radius: 24px;
                    position: relative;
                }
                .metric-body h2 { font-size: 1.8rem; font-weight: 900; margin-top: 5px; }

                /* SEARCH BAR */
                .crm-search-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 30px;
                    margin-bottom: 25px;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                .search-wrapper { position: relative; flex: 1; max-width: 500px; }
                .search-icon { position: absolute; left: 15px; top: 13px; color: var(--primary-color); opacity: 0.5; }
                .search-wrapper input {
                    width: 100%; height: 46px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px; padding: 0 45px; color: white; font-size: 13px;
                }
                .filters-group { display: flex; gap: 10px; align-items: center; }
                .select-wrapper {
                    display: flex; items-center gap: 8px; background: rgba(0,0,0,0.2);
                    padding: 0 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); height: 46px;
                }
                .select-wrapper select { background: transparent; border: none; color: white; font-weight: 800; font-size: 11px; outline: none; }
                .shortcut-mini-btn {
                    padding: 8px 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 10px; color: var(--text-muted); font-size: 10px; font-weight: 900; cursor: pointer; display: flex; items-center gap: 6px;
                }
                .shortcut-mini-btn:hover { background: rgba(255,255,255,0.07); color: white; }

                /* LIST VIEW */
                .crm-premium-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
                .crm-premium-table th { padding: 20px; font-size: 10px; font-weight: 900; color: var(--text-muted); text-align: left; opacity: 0.6; }
                .crm-premium-table td { padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .clickable-row { cursor: pointer; transition: 0.2s; }
                .clickable-row:hover { background: rgba(172, 248, 0, 0.03); }

                /* KANBAN VIEW */
                .kanban-board-container {
                    display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; min-height: 600px;
                }
                .kanban-column {
                    flex: 1; min-width: 320px; background: rgba(255,255,255,0.015); border-radius: 20px; padding: 15px;
                    display: flex; flex-direction: column; gap: 15px; border: 1px solid rgba(255,255,255,0.03);
                }
                .kanban-column-header { display: flex; items-center justify-content: space-between; padding: 5px 10px; }
                .kanban-column-header h3 { font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--text-muted); }
                .column-count { font-size: 10px; font-weight: 900; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 6px; }
                .kanban-cards-wrapper { display: flex; flex-direction: column; gap: 12px; }
                
                .kanban-card-glass {
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 18px; padding: 18px; cursor: pointer; transition: 0.25s;
                }
                .kanban-card-glass:hover { transform: translateY(-4px); border-color: var(--primary-color); background: rgba(255,255,255,0.04); }
                .card-top { display: flex; gap: 12px; align-items: center; margin-bottom: 15px; }
                .card-avatar { width: 36px; height: 36px; border-radius: 10px; background: rgba(172, 248, 0, 0.1); color: var(--primary-color); display: flex; items-center justify-content: center; font-weight: 900; }
                .card-main-info h4 { margin: 0; font-size: 14px; font-weight: 900; }
                .card-main-info p { margin: 2px 0 0 0; font-size: 11px; opacity: 0.5; }
                .card-tags { display: flex; gap: 8px; margin-bottom: 15px; }
                .mini-tag { font-size: 9px; font-weight: 800; color: var(--text-muted); display: flex; items-center gap: 4px; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 6px; }
                .mini-value { font-size: 10px; font-weight: 900; color: var(--primary-color); margin-left: auto; }
                .card-footer { display: flex; justify-content: space-between; items-center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 12px; }
                .card-ref { font-size: 9px; font-weight: 800; color: var(--text-secondary); opacity: 0.6; }

                /* MODAL */
                .lead-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
                    z-index: 1000; display: flex; items-center justify-content: center; padding: 20px;
                }
                .lead-modal-content {
                    width: 100%; max-width: 800px; background: #0f172a; border-radius: 30px; padding: 40px;
                }
                .modal-header { display: flex; justify-content: space-between; items-center; margin-bottom: 30px; }
                .lead-header-info { display: flex; gap: 20px; items-center; }
                .avatar-large { width: 64px; height: 64px; border-radius: 20px; background: var(--primary-color); color: black; font-size: 32px; font-weight: 900; display: flex; items-center justify-content: center; }
                .modal-body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                .input-group { margin-bottom: 20px; }
                .input-group label { display: block; font-size: 10px; font-weight: 900; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 8px; display: flex; items-center gap: 6px; }
                .copy-field { display: flex; gap: 10px; }
                .copy-field input { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; color: white; font-weight: 700; }
                .info-section h3, .edit-section h3 { font-size: 12px; font-weight: 900; color: var(--primary-color); margin-bottom: 25px; letter-spacing: 2px; }
                
                .edit-section select, .edit-section input {
                    width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
                    padding: 12px; border-radius: 10px; color: white; font-weight: 700; outline: none;
                }
                .edit-section select option { background: #1e293b; }

                .action-link-btn {
                    padding: 0 15px; border-radius: 10px; border: none; font-size: 10px; font-weight: 900; cursor: pointer; display: flex; items-center gap: 8px; color: white;
                }
                .action-link-btn.green { background: #22c55e20; color: #22c55e; border: 1px solid #22c55e30; }
                .action-link-btn.blue { background: #3b82f620; color: #3b82f6; border: 1px solid #3b82f630; }

                .modal-footer { display: flex; justify-content: flex-end; gap: 15px; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); }
                .secondary-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 12px 24px; border-radius: 12px; font-weight: 900; cursor: pointer; }

                /* ANIMATIONS */
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                .animate-fade-in { animation: fade-in 0.3s ease forwards; }
                .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};

export default CRMDashboard;
