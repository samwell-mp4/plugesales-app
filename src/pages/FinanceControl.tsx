import { useState, useEffect } from 'react';
import { 
    Activity, Filter, Search, Download, 
    CheckCircle2, XCircle, AlertCircle, 
    Calendar, DollarSign, RefreshCw, 
    ChevronLeft, ChevronRight, MoreHorizontal, X
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

const FinanceControl = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('TODOS');
    const [filterCompetence, setFilterCompetence] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getFinanceSales();
            setSales(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updatePaymentStatus = async (id: number, status: string) => {
        try {
            await dbService.saveFinanceSale({ id, payment_status: status });
            fetchSales();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredSales = sales.filter(s => {
        const matchesStatus = filterStatus === 'TODOS' || s.payment_status === filterStatus;
        const matchesCompetence = !filterCompetence || s.payment_competence === filterCompetence;
        const matchesSearch = (s.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (s.client_cpf_cnpj || '').includes(searchTerm);
        return matchesStatus && matchesCompetence && matchesSearch;
    });

    const totalFiltered = filteredSales.reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);
    const totalReceived = filteredSales.filter(s => s.payment_status === 'RECEBIDO').reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);
    const totalPending = filteredSales.filter(s => s.payment_status === 'PENDENTE').reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);
    const totalOverdue = filteredSales.filter(s => s.payment_status === 'INADIMPLENTE').reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);

    return (
        <div className="animate-fade-in finance-page" style={{ padding: '40px', paddingBottom: '80px' }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                
                .stats-grid-control { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 16px; 
                    margin-top: 32px; 
                    margin-bottom: 32px;
                }
                
                .glass-card-control {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 20px;
                    padding: 20px;
                    backdrop-filter: blur(20px);
                }

                .filter-bar-finance {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 12px 24px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                }

                .table-container-finance {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    overflow: hidden;
                    backdrop-filter: blur(20px);
                }
                
                table { width: 100%; border-collapse: collapse; }
                th { 
                    padding: 18px 24px; 
                    background: rgba(255,255,255,0.02); 
                    color: var(--text-muted); 
                    font-size: 0.75rem; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 1px;
                    text-align: left;
                }
                td { padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }

                .premium-input-finance {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    color: white;
                    font-weight: 800;
                    font-size: 0.8rem;
                    padding: 8px 12px;
                    outline: none;
                }
            `}</style>

            <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h1>Controle Financeiro</h1>
                    <p className="subtitle">Fluxo de caixa e liquidação de recebíveis</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-14 px-4">
                        <Search size={16} color="var(--primary-color)" />
                        <input 
                            placeholder="Buscar lançamento..." 
                            className="bg-transparent border-none outline-none py-3 text-white font-bold text-xs w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={fetchSales} 
                        disabled={isLoading}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', color: 'white', cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="stats-grid-control">
                {[
                    { label: 'FILTRADO', value: totalFiltered, color: 'var(--primary-color)', icon: <DollarSign size={20} /> },
                    { label: 'LIQUIDADO', value: totalReceived, color: '#10b981', icon: <CheckCircle2 size={20} /> },
                    { label: 'PENDENTE', value: totalPending, color: '#facc15', icon: <AlertCircle size={20} /> },
                    { label: 'ATRASADO', value: totalOverdue, color: '#ef4444', icon: <XCircle size={20} /> },
                ].map((s, i) => (
                    <div key={i} className="glass-card-control" style={{ borderLeft: `4px solid ${s.color}` }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px' }}>{s.label}</p>
                        <div className="flex items-center justify-between mt-2">
                            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'white' }}>R$ {s.value.toLocaleString('pt-BR')}</h2>
                            <div style={{ color: s.color, opacity: 0.3 }}>{s.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="filter-bar-finance">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Filter size={14} color="var(--primary-color)" />
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filtros</span>
                    </div>
                    <select 
                        className="premium-input-finance" 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ width: '180px' }}
                    >
                        <option value="TODOS" style={{ background: '#0a0f18' }}>Todos os Status</option>
                        <option value="PENDENTE" style={{ background: '#0a0f18' }}>Pendente</option>
                        <option value="RECEBIDO" style={{ background: '#0a0f18' }}>Recebido</option>
                        <option value="INADIMPLENTE" style={{ background: '#0a0f18' }}>Inadimplente</option>
                    </select>
                    <input 
                        type="month"
                        className="premium-input-finance"
                        value={filterCompetence}
                        onChange={(e) => setFilterCompetence(e.target.value)}
                    />
                </div>
                <button 
                    className="ml-auto" 
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                    onClick={() => { setFilterStatus('TODOS'); setFilterCompetence(''); setSearchTerm(''); }}
                >
                    LIMPAR FILTROS
                </button>
            </div>

            <div className="table-container-finance">
                <table>
                    <thead>
                        <tr>
                            <th>COMPETÊNCIA</th>
                            <th>CLIENTE</th>
                            <th>VALOR</th>
                            <th>VENDEDOR</th>
                            <th>SITUAÇÃO</th>
                            <th style={{ textAlign: 'right' }}>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px' }}><RefreshCw className="animate-spin mx-auto text-primary-color" /></td></tr>
                        ) : filteredSales.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.8rem' }}>NENHUM LANÇAMENTO</td></tr>
                        ) : filteredSales.map((sale) => (
                            <tr key={sale.id}>
                                <td style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{sale.payment_competence}</td>
                                <td>
                                    <div className="flex flex-col">
                                        <span style={{ fontWeight: 900, color: 'white', fontSize: '0.9rem' }}>{sale.client_name}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{sale.client_cpf_cnpj || '---'}</span>
                                    </div>
                                </td>
                                <td><span style={{ fontWeight: 900, color: 'white' }}>R$ {parseFloat(sale.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></td>
                                <td><span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{sale.salesperson_name || '---'}</span></td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sale.payment_status === 'RECEBIDO' ? '#10b981' : sale.payment_status === 'PENDENTE' ? '#facc15' : '#ef4444' }}></div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: sale.payment_status === 'RECEBIDO' ? '#10b981' : sale.payment_status === 'PENDENTE' ? '#facc15' : '#ef4444' }}>{sale.payment_status}</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => updatePaymentStatus(sale.id, 'RECEBIDO')}
                                            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                                        >
                                            LIQUIDAR
                                        </button>
                                        <button 
                                            onClick={() => updatePaymentStatus(sale.id, 'INADIMPLENTE')}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                                        >
                                            ATRASO
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinanceControl;
