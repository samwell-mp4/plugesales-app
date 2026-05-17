import { useState, useEffect } from 'react';
import { 
    BarChart3, PieChart, Download, 
    RefreshCw, Calendar, TrendingUp,
    Package, DollarSign, Target, Activity
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

    const revenueByPackage = sales.reduce((acc: any, curr) => {
        const pkg = curr.package_hired || 'Outros';
        acc[pkg] = (acc[pkg] || 0) + parseFloat(curr.total_value);
        return acc;
    }, {});

    const totalRevenue = sales.reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);
    const totalDelivered = sales.reduce((acc, curr) => acc + (curr.quantity_delivered || 0), 0);
    const totalInvestment = sales.reduce((acc, curr) => acc + parseFloat(curr.investment_used || 0), 0);
    const cpa = totalDelivered > 0 ? totalInvestment / totalDelivered : 0;

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

                .table-container-report {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    overflow: hidden;
                    margin-top: 32px;
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
            `}</style>

            <header className="flex flex-wrap items-center justify-between gap-6 mb-10">
                <div>
                    <h1>Relatórios Consolidados</h1>
                    <p className="subtitle">Business Intelligence e métricas de performance operacional</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-16 px-5 py-2">
                        <Calendar size={14} color="var(--primary-color)" />
                        <input type="date" className="bg-transparent border-none outline-none text-white font-bold text-xs" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)' }}>ATÉ</span>
                        <input type="date" className="bg-transparent border-none outline-none text-white font-bold text-xs" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
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
                        style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '14px', padding: '12px 24px', fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Download size={18} /> EXPORTAR FULL
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="glass-card-report lg:col-span-2">
                    <div className="flex items-center gap-3 mb-10">
                        <DollarSign size={20} color="var(--primary-color)" />
                        <h3 style={{ margin: 0, fontWeight: 900, color: 'white', fontSize: '1.4rem' }}>Receita por Pacote</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            {Object.entries(revenueByPackage).map(([pkg, value]: [string, any]) => {
                                const percentage = (value / (totalRevenue || 1)) * 100;
                                return (
                                    <div key={pkg}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{pkg}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 950, color: 'white' }}>R$ {value.toLocaleString('pt-BR')}</span>
                                        </div>
                                        <div className="progress-track-report">
                                            <div className="progress-fill-report" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(172, 248, 0, 0.1)', border: '1px solid rgba(172, 248, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', margin: '0 auto 24px' }}>
                                <TrendingUp size={32} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '4px' }}>VOLUME BRUTO</span>
                            <h2 style={{ margin: '8px 0 0', fontSize: '3.2rem', fontWeight: 950, color: 'white', letterSpacing: '-2px' }}>R$ {totalRevenue.toLocaleString('pt-BR')}</h2>
                        </div>
                    </div>
                </div>

                <div className="glass-card-report flex flex-col gap-8 bg-primary-color/[0.03]">
                    <div className="flex items-center gap-3">
                        <Target size={20} color="var(--primary-color)" />
                        <h3 style={{ margin: 0, fontWeight: 900, color: 'white', fontSize: '1.4rem' }}>Performance KPIs</h3>
                    </div>

                    <div className="space-y-6">
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Unidades Entregues</span>
                            <div className="flex justify-between items-end">
                                <h4 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 950, color: 'white' }}>{totalDelivered.toLocaleString()} <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>UNID</span></h4>
                                <Package size={24} color="var(--primary-color)" opacity={0.3} />
                            </div>
                        </div>

                        <div style={{ background: 'var(--primary-color)', padding: '32px', borderRadius: '32px', color: 'black' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '8px', opacity: 0.7 }}>ROI Operacional (CPA)</span>
                            <h4 style={{ margin: 0, fontSize: '3rem', fontWeight: 950, letterSpacing: '-2px' }}>R$ {cpa.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</h4>
                            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 900 }}>
                                <Activity size={14} />
                                <span>SINCRONIZADO EM TEMPO REAL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-container-report">
                <table>
                    <thead>
                        <tr>
                            <th>CONTRATO / CLIENTE</th>
                            <th>META UNIDADES</th>
                            <th>PROGRESSO (%)</th>
                            <th style={{ textAlign: 'right' }}>ROI ESTIMADO</th>
                            <th style={{ textAlign: 'center' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => {
                            const progress = (sale.quantity_delivered / (sale.quantity_hired || 1)) * 100;
                            return (
                                <tr key={sale.id}>
                                    <td>
                                        <div className="flex flex-col">
                                            <span style={{ fontWeight: 900, color: 'white', fontSize: '0.95rem' }}>{sale.client_name}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{sale.package_hired}</span>
                                        </div>
                                    </td>
                                    <td><span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{sale.quantity_hired?.toLocaleString()} UNID</span></td>
                                    <td>
                                        <div style={{ width: '200px' }}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary-color)' }}>{sale.quantity_delivered?.toLocaleString()}</span>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>{progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="progress-track-report" style={{ height: '4px', marginTop: 0 }}>
                                                <div className="progress-fill-report" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 900, color: 'white', fontSize: '1rem' }}>
                                        {sale.investment_used > 0 ? ((parseFloat(sale.total_value) / parseFloat(sale.investment_used))).toFixed(2) + 'x' : '---'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ 
                                            fontSize: '0.65rem', 
                                            fontWeight: 900, 
                                            padding: '4px 10px', 
                                            borderRadius: '20px', 
                                            background: sale.campaign_status === 'ATIVA' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                            color: sale.campaign_status === 'ATIVA' ? '#10b981' : 'var(--text-muted)',
                                            border: `1px solid ${sale.campaign_status === 'ATIVA' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                                        }}>
                                            {sale.campaign_status === 'ATIVA' ? 'EM EXECUÇÃO' : 'FINALIZADO'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinanceReports;
