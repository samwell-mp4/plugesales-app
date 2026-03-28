import { useState, useEffect } from 'react';
import { 
    FileSpreadsheet, Users, DollarSign, Clock, Search, 
    Filter, RefreshCw, AlertCircle, User, MessageSquare, 
    Tag, ChevronRight, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { dbService } from '../services/dbService';

const CRMDashboard = () => {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');

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

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = 
            lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
            lead.numero.includes(searchTerm) ||
            lead.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'Todos' || lead.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const statusList = ['Todos', ...Array.from(new Set(leads.map(l => l.status)))];

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
        const s = status.toLowerCase();
        if (s.includes('aprov') || s.includes('ganho') || s.includes('feito')) return 'badge-success';
        if (s.includes('pend') || s.includes('novo') || s.includes('andamento')) return 'badge-warning';
        if (s.includes('perd') || s.includes('canc')) return 'badge-danger';
        return '';
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
                    <button 
                        onClick={fetchLeads} 
                        className={`refresh-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        <RefreshCw size={18} />
                        <span>{isLoading ? 'SINCRONIZANDO...' : 'ATUALIZAR DADOS'}</span>
                    </button>
                    <button className="primary-action-btn">
                        <ArrowUpRight size={18} />
                        <span>ABRIR PLANILHA</span>
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

            {/* TABLE SECTION - WITH ADVANCED RESPONSIVENESS */}
            <section className="table-outer-container glass-container shadow-2xl">
                <div className="table-controls-bar">
                    <div className="title-group">
                        <div className="indicator-dot"></div>
                        <h3>LEADS DISPONÍVEIS</h3>
                        <span className="count-label">{filteredLeads.length} REGISTROS</span>
                    </div>

                    <div className="filters-group">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome, etc..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="select-wrapper">
                            <Filter size={16} />
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                {statusList.map(s => <option key={s} value={s}>{s === 'Todos' ? 'FILTRAR STATUS' : s.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="table-loader-state">
                                        <div className="loader-spinner"></div>
                                        <p>MAPEANDO DADOS DA PLANILHA...</p>
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="table-empty-state">
                                        <Users className="empty-icon" size={48} />
                                        <p>NENHUM RESULTADO ENCONTRADO NA BASE</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id}>
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
                                            <button className="row-action-btn">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <style>{`
                /* --- ADVANCED CSS GRID & RESPONSIVENESS --- */
                .crm-advanced-view {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 60px 40px;
                    background: transparent;
                }

                .crm-main-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 50px;
                    gap: 30px;
                    flex-wrap: wrap;
                }

                .header-info .main-title {
                    font-size: 3.5rem;
                    font-weight: 900;
                    letter-spacing: -2px;
                    line-height: 1;
                    margin: 15px 0;
                }
                .highlight {
                    background: var(--primary-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .subtitle { 
                    color: var(--text-secondary); 
                    font-size: 1.1rem; 
                    max-width: 600px;
                    opacity: 0.8;
                }

                /* CATEGORY BADGE */
                .badge-category {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(172, 248, 0, 0.08);
                    padding: 6px 14px;
                    border-radius: 50px;
                    font-size: 11px;
                    font-weight: 900;
                    color: var(--primary-color);
                    border: 1px solid rgba(172, 248, 0, 0.2);
                    letter-spacing: 1px;
                }

                /* HEADER ACTIONS */
                .header-actions { display: flex; gap: 15px; }
                .refresh-btn, .primary-action-btn {
                    height: 54px;
                    padding: 0 24px;
                    border-radius: 16px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    font-size: 13px;
                }
                .refresh-btn { 
                    background: rgba(255,255,255,0.03); 
                    border: 1px solid rgba(255,255,255,0.05); 
                    color: white; 
                }
                .refresh-btn:hover { background: rgba(255,255,255,0.07); transform: translateY(-3px); }
                .refresh-btn.loading svg { animation: spin 1s linear infinite; }
                
                .primary-action-btn { 
                    background: var(--primary-gradient); 
                    color: black; 
                    border: none;
                    box-shadow: 0 10px 20px rgba(172, 248, 0, 0.2);
                }
                .primary-action-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(172, 248, 0, 0.3); }

                /* METRICS GRID - THE CORE FIX */
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    margin-bottom: 50px;
                }

                .metric-glass-card {
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(30px);
                    border: 1px solid rgba(172, 248, 0, 0.1);
                    padding: 30px;
                    border-radius: 28px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s var(--transition-normal);
                }
                .metric-glass-card:hover {
                    transform: translateY(-8px);
                    border-color: rgba(172, 248, 0, 0.3);
                    background: rgba(15, 23, 42, 0.6);
                }
                .metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .icon-box { width: 56px; height: 56px; border-radius: 18px; display: flex; items-center justify-content: center; }
                .metric-suffix { font-size: 9px; font-weight: 900; opacity: 0.2; letter-spacing: 2px; }
                
                .metric-body label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
                .metric-body h2 { font-size: 2.2rem; font-weight: 900; margin-top: 5px; }
                .text-gradient-primary { background: linear-gradient(135deg, #fff 30%, #acf800 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                
                .metric-footer-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; opacity: 0.3; }

                /* TABLE SECTION - ADVANCED RESPONSIVENESS */
                .glass-container {
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    border-radius: 35px;
                }

                .table-controls-bar {
                    padding: 30px 40px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 30px;
                    flex-wrap: wrap;
                }

                .title-group { display: flex; align-items: center; gap: 15px; }
                .indicator-dot { width: 10px; height: 10px; background: var(--primary-color); border-radius: 50%; box-shadow: 0 0 10px var(--primary-color); }
                .title-group h3 { font-size: 15px; font-weight: 900; letter-spacing: 1px; }
                .count-label { font-size: 10px; font-weight: 900; background: rgba(255,255,255,0.05); padding: 5px 12px; border-radius: 6px; color: var(--text-muted); }

                .filters-group { display: flex; gap: 15px; flex-grow: 1; justify-content: flex-end; }
                .search-wrapper { position: relative; max-width: 400px; width: 100%; }
                .search-icon { position: absolute; left: 18px; top: 16px; color: var(--primary-color); opacity: 0.5; }
                .search-wrapper input {
                    width: 100%;
                    height: 50px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 0 20px 0 54px;
                    color: white;
                    font-weight: 600;
                    font-size: 13px;
                    transition: border-color 0.2s;
                }
                .search-wrapper input:focus { border-color: var(--primary-color); outline: none; }

                .select-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(0,0,0,0.3);
                    padding: 0 20px;
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.05);
                    height: 50px;
                }
                .select-wrapper select { background: transparent; border: none; font-size: 11px; font-weight: 900; color: white; cursor: pointer; outline: none; }

                /* THE TABLE RESPONSIVE CORE */
                .table-responsive-wrapper {
                    width: 100%;
                    overflow-x: auto;
                    padding-bottom: 20px;
                    scrollbar-width: thin;
                    scrollbar-color: var(--primary-color) transparent;
                }
                
                .crm-premium-table {
                    width: 100%;
                    min-width: 1200px; /* GARANTE QUE AS COLUNAS NÃO ESMAGUEM */
                    border-collapse: collapse;
                }
                .crm-premium-table th {
                    padding: 25px 40px;
                    font-size: 10px;
                    font-weight: 900;
                    color: var(--text-muted);
                    letter-spacing: 1.5px;
                    text-align: left;
                    background: rgba(255,255,255,0.01);
                }
                .crm-premium-table td { padding: 25px 40px; border-bottom: 1px solid rgba(255,255,255,0.02); }
                .crm-premium-table tr:hover { background: rgba(172, 248, 0, 0.02); }

                /* CELL STYLES */
                .lead-identity { display: flex; align-items: center; gap: 15px; }
                .avatar-mini { width: 44px; height: 44px; border-radius: 14px; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--primary-color); font-size: 18px; border: 1px solid rgba(172, 248, 0, 0.1); }
                .lead-name { display: block; font-size: 15px; font-weight: 900; color: white; margin-bottom: 2px; }
                .lead-sub { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--text-muted); }

                .badge-pill {
                    display: inline-flex;
                    padding: 6px 16px;
                    border-radius: 50px;
                    font-size: 9px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .badge-success { background: rgba(172, 248, 0, 0.1); color: #acf800; border: 1px solid rgba(172, 248, 0, 0.2); }
                .badge-warning { background: rgba(234, 179, 8, 0.1); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2); }
                .badge-danger { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.2); }

                .tag-element, .responsavel-box { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; color: var(--text-secondary); }
                .investment-value { font-size: 14px; font-weight: 900; color: white; }
                .row-action-btn { width: 44px; height: 44px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .row-action-btn:hover { background: var(--primary-color); color: black; transform: scale(1.1); }

                /* LOADER & EMPTY */
                .table-loader-state, .table-empty-state { padding: 80px 0; text-align: center; }
                .loader-spinner { width: 40px; height: 40px; border: 3px solid rgba(172, 248, 0, 0.1); border-top-color: var(--primary-color); border-radius: 50%; margin: 0 auto 15px; animation: spin 0.8s linear infinite; }
                .empty-icon { opacity: 0.1; margin-bottom: 15px; }

                /* HELPERS */
                .text-right { text-align: right; }
                .text-center { text-align: center; }

                /* ANIMATIONS */
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fade-in-up { 
                    from { opacity: 0; transform: translateY(30px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

                /* MOBILE FIXES */
                @media (max-width: 1024px) {
                    .crm-advanced-view { padding: 30px 20px; }
                    .header-info .main-title { font-size: 2.5rem; }
                    .crm-main-header { justify-content: center; text-align: center; }
                    .header-actions { width: 100%; justify-content: center; }
                }
                @media (max-width: 768px) {
                    .filters-group { flex-direction: column; width: 100%; }
                    .search-wrapper { max-width: none; }
                    .select-wrapper { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default CRMDashboard;
