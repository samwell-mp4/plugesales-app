import { useState, useEffect } from 'react';
import { 
    Activity, TrendingUp, DollarSign, 
    ArrowUpRight, ArrowDownRight, RefreshCw,
    PieChart, BarChart3, Calendar, Target,
    Package, Users, CheckCircle2, AlertCircle, Award
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { FinanceDashboardAccounting } from './FinanceDashboardAccounting';

const FinanceDashboard = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [negativeClients, setNegativeClients] = useState<any[]>([]);

    useEffect(() => {
        if (user?.role !== 'CONTABILIDADE') {
            fetchSales();
        }
    }, [user?.role]);

    if (user?.role === 'CONTABILIDADE') {
        return <FinanceDashboardAccounting user={user} />;
    }

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getFinanceSales({ userId: user?.id, role: user?.role });
            setSales(data);
            
            const clients = await dbService.getClients();
            const neg = clients.filter((c: any) => (c.disparo_quantidade || 0) < 0);
            setNegativeClients(neg);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Cálculos
    const totalRevenue = sales.reduce((acc, curr) => acc + parseFloat(curr.total_value || 0), 0);
    const totalReceived = sales.filter(s => s.payment_status === 'RECEBIDO').reduce((acc, curr) => acc + parseFloat(curr.total_value || 0), 0);
    const totalPending = sales.filter(s => s.payment_status === 'PENDENTE').reduce((acc, curr) => acc + parseFloat(curr.total_value || 0), 0);
    const totalOverdue = sales.filter(s => s.payment_status === 'INADIMPLENTE').reduce((acc, curr) => acc + parseFloat(curr.total_value || 0), 0);
    
    const totalCommission = sales.reduce((acc, curr) => acc + parseFloat(curr.commission_value || 0), 0);
    const netProfit = totalRevenue - totalCommission;

    const efficiency = totalRevenue > 0 ? (totalReceived / totalRevenue) * 100 : 0;

    // Top Clientes
    const clientsRevenue = sales.reduce((acc: any, curr) => {
        acc[curr.client_name] = (acc[curr.client_name] || 0) + parseFloat(curr.total_value || 0);
        return acc;
    }, {});
    const topClients = Object.entries(clientsRevenue)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5);

    // Receita por Pacote
    const packageRevenue = sales.reduce((acc: any, curr) => {
        const pkg = curr.package_hired || 'OUTRO';
        acc[pkg] = (acc[pkg] || 0) + parseFloat(curr.total_value || 0);
        return acc;
    }, {});

    const metrics = [
        { 
            label: 'Faturamento Total', 
            value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            subtitle: 'Receita bruta gerada',
            icon: <DollarSign size={24} />, 
            color: 'var(--primary-color)' 
        },
        { 
            label: 'Lucro Líquido', 
            value: `R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            subtitle: 'Faturamento - Comissões',
            icon: <TrendingUp size={24} />, 
            color: '#10b981' 
        },
        { 
            label: 'Liquidez (Recebido)', 
            value: `R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            subtitle: `${efficiency.toFixed(1)}% de eficiência`,
            icon: <CheckCircle2 size={24} />, 
            color: '#38bdf8' 
        },
        { 
            label: 'Inadimplência', 
            value: `R$ ${totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            subtitle: 'Atrasos no pagamento',
            icon: <AlertCircle size={24} />, 
            color: '#ef4444' 
        },
    ].filter(m => user?.role !== 'CLIENT' || m.label !== 'Lucro Líquido');

    return (
        <div className="animate-fade-in finance-page p-4 md:p-10 pb-20 md:pb-20">
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                
                .stats-grid-finance { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
                    gap: 24px; 
                    margin-top: 32px; 
                    margin-bottom: 32px;
                }
                
                .glass-card-finance {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    padding: 24px;
                    backdrop-filter: blur(20px);
                    transition: all 0.3s ease;
                }
                .glass-card-finance:hover {
                    border-color: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                }

                .chart-container-finance {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    padding: 32px;
                    height: 100%;
                    backdrop-filter: blur(20px);
                }
                
                .progress-track {
                    width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;
                }
                .progress-fill {
                    height: 100%; background: var(--primary-color); border-radius: 10px;
                }
            `}</style>

            <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h1>Dashboard Financeiro</h1>
                    <p className="subtitle">Visão geral do caixa e performance de vendas</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchSales} 
                        disabled={isLoading}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', color: 'white', cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {negativeClients.length > 0 && (
                <div style={{ padding: '16px 24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#f87171' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                        <AlertCircle size={18} />
                        <span>ALERTA DE CONTROLE FINANCEIRO: CLIENTES COM SALDO NEGATIVO</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingLeft: '26px' }}>
                        {negativeClients.map(c => (
                            <span key={c.name} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                                {c.name}: <strong style={{ color: 'white' }}>{c.disparo_quantidade}</strong> disparos
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="stats-grid-finance">
                {metrics.map((m, i) => (
                    <div key={i} className="glass-card-finance" style={{ borderLeft: `4px solid ${m.color}` }}>
                        <div className="flex justify-between items-start mb-4">
                            <div style={{ color: m.color, background: `${m.color}15`, padding: '12px', borderRadius: '16px' }}>
                                {m.icon}
                            </div>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{m.label}</p>
                        <h2 style={{ margin: '8px 0', fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>{m.value}</h2>
                        <div className="flex items-center gap-2 mt-4">
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{m.subtitle}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Receita por Status */}
                <div className="chart-container-finance">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>Top 5 Clientes</h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maior volume de faturamento gerado</p>
                        </div>
                        <Award size={24} color="var(--primary-color)" />
                    </div>

                    <div className="space-y-6">
                        {topClients.map(([clientName, val]: any, index) => {
                            const pct = totalRevenue > 0 ? (val / totalRevenue) * 100 : 0;
                            return (
                                <div key={index}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-muted)' }}>#{index + 1}</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{clientName}</span>
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-color)' }}>R$ {val.toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{ width: `${pct}%`, background: index === 0 ? 'var(--primary-color)' : index === 1 ? '#10b981' : '#38bdf8' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {topClients.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontWeight: 800 }}>Nenhum faturamento registrado</div>
                        )}
                    </div>
                </div>

                {/* Resumo de Pacotes e Status */}
                <div className="space-y-6">
                    <div className="chart-container-finance" style={{ height: 'auto', padding: '24px' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <Package size={20} color="var(--primary-color)" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>Distribuição de Pacotes</h3>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(packageRevenue).map(([pkg, val]: any) => (
                                <div key={pkg} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>{pkg}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-color)' }}>R$ {val.toLocaleString('pt-BR')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="chart-container-finance" style={{ height: 'auto', padding: '24px' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <Activity size={20} color="#10b981" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>Resumo de Recebimentos</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <div style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>LIQUIDADO</span>
                                <span style={{ fontSize: '1rem', fontWeight: 900, color: 'white' }}>{sales.filter(s => s.payment_status === 'RECEBIDO').length}</span>
                            </div>
                            <div style={{ textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>PENDENTE</span>
                                <span style={{ fontSize: '1rem', fontWeight: 900, color: 'white' }}>{sales.filter(s => s.payment_status === 'PENDENTE').length}</span>
                            </div>
                            <div style={{ textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', marginBottom: '4px' }}>ATRASO</span>
                                <span style={{ fontSize: '1rem', fontWeight: 900, color: 'white' }}>{sales.filter(s => s.payment_status === 'INADIMPLENTE').length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
