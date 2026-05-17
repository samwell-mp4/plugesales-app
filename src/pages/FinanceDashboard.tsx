import { useState, useEffect } from 'react';
import { 
    Activity, TrendingUp, DollarSign, 
    ArrowUpRight, ArrowDownRight, RefreshCw,
    PieChart, BarChart3, Calendar, Target,
    Package, Users, CheckCircle2, AlertCircle
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

const FinanceDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('Este Mês');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getFinanceStats(user?.id, user?.role);
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const metrics = [
        { 
            label: 'Faturamento Total', 
            value: `R$ ${parseFloat(stats?.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, 
            trend: '+12.5%', 
            up: true, 
            icon: <DollarSign size={24} />, 
            color: 'var(--primary-color)' 
        },
        { 
            label: 'Total Recebido', 
            value: `R$ ${parseFloat(stats?.total_received || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, 
            trend: '+8.2%', 
            up: true, 
            icon: <CheckCircle2 size={24} />, 
            color: '#10b981' 
        },
        { 
            label: 'Pendências (Receber)', 
            value: `R$ ${parseFloat(stats?.total_pending || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, 
            trend: '-2.4%', 
            up: false, 
            icon: <AlertCircle size={24} />, 
            color: '#f59e0b' 
        },
        { 
            label: 'Comissões Previstas', 
            value: `R$ ${parseFloat(stats?.total_commission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, 
            trend: '+15%', 
            up: true, 
            icon: <Users size={24} />, 
            color: '#3b82f6' 
        },
    ];

    const efficiency = stats?.total_revenue > 0 ? (stats.total_received / stats.total_revenue) * 100 : 0;

    return (
        <div className="animate-fade-in finance-page" style={{ padding: '40px', paddingBottom: '80px' }}>
            <style>{`
                .finance-page h1 { 
                    font-weight: 900 !important; 
                    font-size: 2.5rem !important; 
                    letter-spacing: -1.5px !important; 
                    margin: 0 !important; 
                    color: white !important;
                    background: none !important;
                    -webkit-text-fill-color: initial !important;
                }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                
                .stats-grid-finance { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
                    gap: 20px; 
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
                    transform: translateY(-5px);
                    border-color: rgba(172, 248, 0, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                }

                .stat-label-finance {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 12px;
                    display: block;
                }

                .stat-value-finance {
                    font-size: 1.8rem;
                    font-weight: 900;
                    color: white;
                    letter-spacing: -1px;
                }

                .trend-badge {
                    font-size: 0.7rem;
                    font-weight: 900;
                    padding: 4px 8px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .premium-select-container {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    backdrop-filter: blur(10px);
                }
                .premium-select-container select {
                    background: transparent;
                    border: none;
                    color: white;
                    font-weight: 800;
                    font-size: 0.8rem;
                    outline: none;
                    cursor: pointer;
                    width: 100%;
                }

                .progress-track-finance {
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    margin-top: 20px;
                    overflow: hidden;
                }
                .progress-fill-finance {
                    height: 100%;
                    border-radius: 10px;
                    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @media (max-width: 1024px) {
                    .finance-page { padding: 20px; }
                    .stats-grid-finance { 
                        display: flex; 
                        overflow-x: auto; 
                        padding-bottom: 20px;
                        margin-left: -20px;
                        margin-right: -20px;
                        padding-left: 20px;
                        padding-right: 20px;
                        scrollbar-width: none;
                    }
                    .stats-grid-finance::-webkit-scrollbar { display: none; }
                    .glass-card-finance { flex: 0 0 280px; }
                }
            `}</style>

            <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h1>Dashboard Financeiro</h1>
                    <p className="subtitle">Visão consolidada de faturamento e eficiência operacional</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="premium-select-container">
                        <Calendar size={14} color="var(--primary-color)" />
                        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                            <option value="Este Mês" style={{ background: '#0f172a' }}>Este Mês</option>
                            <option value="Últimos 3 Meses" style={{ background: '#0f172a' }}>Últimos 3 Meses</option>
                            <option value="Ano Atual" style={{ background: '#0f172a' }}>Ano Atual</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={fetchStats} 
                        disabled={isLoading}
                        style={{ 
                            background: 'rgba(255, 255, 255, 0.03)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)', 
                            borderRadius: '14px', 
                            padding: '12px',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="stats-grid-finance">
                {metrics.map((m, i) => (
                    <div key={i} className="glass-card-finance" style={{ borderLeft: `4px solid ${m.color}` }}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="stat-label-finance">{m.label}</span>
                            <div style={{ color: m.color, opacity: 0.4 }}>{m.icon}</div>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="stat-value-finance">{isLoading ? '...' : m.value}</span>
                            <div className="trend-badge" style={{ background: m.up ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: m.up ? '#10b981' : '#ef4444' }}>
                                {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {m.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mt-4">
                <div className="glass-card-finance">
                    <div className="flex items-center gap-3 mb-10">
                        <BarChart3 size={20} color="var(--primary-color)" />
                        <h3 style={{ margin: 0, fontWeight: 900, color: 'white' }}>Performance por Categoria</h3>
                    </div>

                    <div className="space-y-8">
                        {[
                            { name: 'WhatsApp Starter', value: 4500, total: 10000, color: '#10b981' },
                            { name: 'WhatsApp Growth', value: 8200, total: 10000, color: 'var(--primary-color)' },
                            { name: 'WhatsApp Enterprise', value: 3100, total: 10000, color: '#3b82f6' },
                            { name: 'Consultoria', value: 1500, total: 10000, color: '#f59e0b' },
                        ].map((item, i) => {
                            const percentage = (item.value / item.total) * 100;
                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.name}</span>
                                        <div className="flex items-center gap-4">
                                            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white' }}>R$ {item.value.toLocaleString()}</span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: item.color }}>{percentage.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <div className="progress-track-finance">
                                        <div className="progress-fill-finance" style={{ width: `${percentage}%`, background: item.color, boxShadow: `0 0 10px ${item.color}44` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-card-finance flex flex-col items-center justify-center p-10">
                    <div className="text-center mb-10">
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '4px' }}>HEALTH SCORE</span>
                        <h3 style={{ margin: '8px 0 0', fontWeight: 900, color: 'white', fontSize: '1.4rem' }}>Eficiência de Caixa</h3>
                    </div>

                    <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                            <circle 
                                cx="96" cy="96" r="88" fill="transparent" stroke="var(--primary-color)" strokeWidth="12" 
                                strokeDasharray={552.9} 
                                strokeDashoffset={552.9 * (1 - efficiency / 100)} 
                                strokeLinecap="round" 
                                style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span style={{ fontSize: '3rem', fontWeight: 900, color: 'white', letterSpacing: '-2px' }}>{efficiency.toFixed(0)}%</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '2px', textTransform: 'uppercase' }}>Taxa Rec.</span>
                        </div>
                    </div>

                    <div className="w-full space-y-3">
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Recebido</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white' }}>R$ {parseFloat(stats?.total_received || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Pendente</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white' }}>R$ {parseFloat(stats?.total_pending || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
