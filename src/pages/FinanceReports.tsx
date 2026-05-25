import { useState, useEffect } from 'react';
import { 
    BarChart3, PieChart, Download, 
    RefreshCw, Calendar, TrendingUp,
    Package, DollarSign, Target, Activity, Users, AlertCircle
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';

const FinanceReports = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getFinanceSales(dateRange);
            setSales(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const exportFullReport = () => {
        const ws = XLSX.utils.json_to_sheet(sales);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatório Consolidado");
        XLSX.writeFile(wb, `bi_financeiro_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Novas métricas financeiras relevantes
    const totalRevenue = sales.reduce((acc, curr) => acc + parseFloat(curr.total_value || 0), 0);
    const totalCommissions = sales.reduce((acc, curr) => acc + parseFloat(curr.commission_value || 0), 0);
    const netProfit = totalRevenue - totalCommissions;
    const totalOverdue = sales.filter(s => s.payment_status === 'INADIMPLENTE').reduce((acc, curr) => acc + parseFloat(curr.total_value || 0), 0);

    const revenueByPackage = sales.reduce((acc: any, curr) => {
        const pkg = curr.package_hired || 'Outros';
        acc[pkg] = (acc[pkg] || 0) + parseFloat(curr.total_value || 0);
        return acc;
    }, {});

    return (
        <div className="animate-fade-in finance-page" style={{ padding: '40px', paddingBottom: '80px' }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                
                .glass-card-report {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    padding: 32px;
                    backdrop-filter: blur(20px);
                }

                .premium-input-finance {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    color: white;
                    font-weight: 800;
                    font-size: 0.8rem;
                    padding: 8px 12px;
                    outline: none;
                }

                .progress-track-report {
                    width: 100%;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    overflow: hidden;
                    margin-top: 12px;
                }
                .progress-fill-report {
                    height: 100%;
                    background: var(--primary-color);
                    box-shadow: 0 0 15px var(--primary-color);
                    transition: width 1s ease;
                }
            `}</style>

            <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h1>Relatórios Financeiros</h1>
                    <p className="subtitle">Análise avançada de performance e rentabilidade</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} color="var(--primary-color)" />
                        <input 
                            type="date" 
                            className="premium-input-finance"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                        <input 
                            type="date" 
                            className="premium-input-finance"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        />
                    </div>
                    
                    <button 
                        onClick={fetchSales} 
                        disabled={isLoading}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', color: 'white', cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    
                    <button 
                        onClick={exportFullReport}
                        style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '14px', padding: '12px 24px', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                        <Download size={16} /> EXPORTAR BI
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass-card-report">
                    <div className="flex items-center justify-between mb-4">
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FATURAMENTO BRUTO</span>
                        <DollarSign size={20} color="var(--primary-color)" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: 0 }}>
                        R$ {totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Total faturado no período</p>
                </div>

                <div className="glass-card-report">
                    <div className="flex items-center justify-between mb-4">
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>COMISSÕES DA EQUIPE</span>
                        <Users size={20} color="#38bdf8" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: 0 }}>
                        R$ {totalCommissions.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Custo com vendedores</p>
                </div>

                <div className="glass-card-report" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="flex items-center justify-between mb-4">
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>LUCRO LÍQUIDO</span>
                        <TrendingUp size={20} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', margin: 0 }}>
                        R$ {netProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Faturamento menos comissões</p>
                </div>

                <div className="glass-card-report" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="flex items-center justify-between mb-4">
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>INADIMPLÊNCIA</span>
                        <AlertCircle size={20} color="#ef4444" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444', margin: 0 }}>
                        R$ {totalOverdue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Pagamentos em atraso</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card-report">
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={20} color="var(--primary-color)" /> Faturamento por Pacote
                    </h3>
                    
                    <div className="space-y-6">
                        {Object.entries(revenueByPackage).map(([pkg, value]: any) => {
                            const percent = totalRevenue > 0 ? (value / totalRevenue) * 100 : 0;
                            return (
                                <div key={pkg}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>{pkg}</span>
                                        <div className="text-right">
                                            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-color)' }}>R$ {value.toLocaleString('pt-BR')}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{percent.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="progress-track-report">
                                        <div className="progress-fill-report" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-card-report">
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={20} color="var(--primary-color)" /> Resumo Operacional
                    </h3>
                    
                    <div className="space-y-4">
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Total de Lançamentos Registrados</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>{sales.length}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Ticket Médio (Faturamento / Lançamentos)</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                                R$ {sales.length > 0 ? (totalRevenue / sales.length).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00'}
                            </span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Lucratividade (%)</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>
                                {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0'}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceReports;
