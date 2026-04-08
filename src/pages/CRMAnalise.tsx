import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Activity, TrendingUp, Users, DollarSign,
    Target, BarChart3, PieChart, Calendar,
    ArrowUpRight, ArrowDownRight, RefreshCw,
    Download, Filter
} from 'lucide-react';
import { dbService } from '../services/dbService';

const CRMAnalise = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('Este Mês');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getCRMLeads();
            let filteredData = data;
            if (user?.role === 'EMPLOYEE') {
                filteredData = data.filter((l: any) => 
                    (l.responsavel || '').toLowerCase() === (user.name || '').toLowerCase()
                );
            }
            setLeads(filteredData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Metrics Calculation ---
    const totalLeads = leads.length;
    const totalValue = leads.reduce((acc, lead) => {
        const valStr = String(lead.value_client || '0');
        const numericVal = parseFloat(valStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return acc + numericVal;
    }, 0);

    const convertedLeads = leads.filter(l => {
        const s = (l.status || '').toLowerCase();
        return s.includes('aprov') || s.includes('ganho') || s.includes('conclu');
    }).length;

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const avgTicket = convertedLeads > 0 ? totalValue / convertedLeads : (totalLeads > 0 ? totalValue / totalLeads : 0);

    const metrics = [
        { label: 'Conversão', value: `${conversionRate.toFixed(1)}%`, trend: '+2.4%', up: true, icon: <Target className="text-secondary" /> },
        { label: 'Valor Total', value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, trend: '+12%', up: true, icon: <DollarSign className="text-primary" /> },
        { label: 'Leads Ativos', value: totalLeads, trend: '-3', up: false, icon: <Users className="text-blue-400" /> },
        { label: 'Ticket Médio', value: `R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, trend: '+5%', up: true, icon: <TrendingUp className="text-purple-400" /> },
    ];

    // Status Distribution
    const statusCounts: Record<string, number> = {};
    leads.forEach(l => {
        const s = l.status || 'Sem Status';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    return (
        <div className="crm-container animate-fade-in">
            <header className="crm-header glass-panel">
                <div className="header-identity">
                    <div className="category-tag"><BarChart3 size={12} /> BUSINESS INTELLIGENCE</div>
                    <h1 className="text-gradient">Análise Geral CRM</h1>
                    <p className="subtitle">Métricas de performance e funil de conversão</p>
                </div>

                <div className="header-actions">
                    <div className="time-selector glass-panel">
                        <Calendar size={14} className="opacity-40" />
                        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                            <option>Hoje</option>
                            <option>Esta Semana</option>
                            <option>Este Mês</option>
                            <option>Trimestre</option>
                        </select>
                    </div>
                    
                    <button className="sync-btn glass-panel" onClick={fetchLeads} disabled={isLoading}>
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>

                    <button className="btn-secondary">
                        <Download size={16} /> EXPORTAR
                    </button>
                </div>
            </header>

            <div className="metrics-grid">
                {metrics.map((m, i) => (
                    <div key={i} className="glass-card metric-card">
                        <div className="metric-header">
                            <div className="m-icon-box">{m.icon}</div>
                            <div className={`trend-tag ${m.up ? 'trend-up' : 'trend-down'}`}>
                                {m.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {m.trend}
                            </div>
                        </div>
                        <div className="metric-body">
                            <h3>{m.label}</h3>
                            <h2>{m.value}</h2>
                        </div>
                        <div className="metric-footer">
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: m.up ? '75%' : '40%', background: m.up ? 'var(--primary-color)' : '#ef4444' }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-flex">
                <div className="glass-card chart-container flex-1">
                    <div className="chart-header">
                        <h3><Activity size={16} /> Distribuição de Status</h3>
                        <Filter size={16} className="opacity-30" />
                    </div>
                    <div className="status-bars">
                        {statusData.sort((a,b) => b.value - a.value).map((item, i) => {
                            const percentage = (item.value / (totalLeads || 1)) * 100;
                            return (
                                <div key={i} className="status-row">
                                    <div className="status-info">
                                        <span className="status-name">{item.name}</span>
                                        <span className="status-count">{item.value} leads</span>
                                    </div>
                                    <div className="status-bar-bg">
                                        <div className="status-bar-fill" style={{ width: `${percentage}%`, background: `hsl(${100 - i * 20}, 80%, 60%)` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-card performance-summary">
                    <div className="chart-header">
                        <h3><PieChart size={16} /> Resumo de Eficiência</h3>
                    </div>
                    <div className="efficiency-circle">
                        <div className="circle-inner">
                            <span className="efficiency-val">{conversionRate.toFixed(0)}%</span>
                            <span className="efficiency-label">TAXA DE ÊXITO</span>
                        </div>
                    </div>
                    <div className="eff-stats">
                        <div className="eff-item">
                            <span className="marker" style={{ background: 'var(--primary-color)' }}></span>
                            <span className="lbl">Concluídos</span>
                            <span className="val">{convertedLeads}</span>
                        </div>
                        <div className="eff-item">
                            <span className="marker" style={{ background: 'rgba(255,255,255,0.1)' }}></span>
                            <span className="lbl">Em Aberto</span>
                            <span className="val">{totalLeads - convertedLeads}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .crm-container { max-width: 1400px; margin: 20px auto; padding: 0 20px; }
                .crm-header { display: flex; justify-content: space-between; align-items: center; padding: 25px 35px; border-radius: 20px; margin-bottom: 25px; }
                .text-gradient { font-size: 2.2rem; font-weight: 900; background: linear-gradient(135deg, #fff 0%, var(--primary-color) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px; }
                .category-tag { font-size: 10px; font-weight: 800; color: var(--primary-color); display: flex; align-items: center; gap: 6px; margin-bottom: 8px; opacity: 0.8; }
                
                .header-actions { display: flex; gap: 15px; align-items: center; }
                .time-selector { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-radius: 12px; }
                .time-selector select { background: transparent; border: none; color: #fff; font-weight: 700; font-size: 12px; outline: none; }
                
                .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 25px; }
                .metric-card { padding: 25px; border-radius: 24px; }
                .metric-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
                .m-icon-box { width: 42px; height: 42px; background: rgba(255,255,255,0.03); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05); }
                .trend-tag { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; }
                .trend-up { background: rgba(172, 248, 0, 0.1); color: var(--primary-color); }
                .trend-down { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .metric-body h3 { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.4); margin: 0; }
                .metric-body h2 { font-size: 1.8rem; font-weight: 900; margin: 8px 0 15px; letter-spacing: -0.5px; }
                .progress-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
                .progress-bar-fill { height: 100%; border-radius: 10px; }

                .charts-flex { display: flex; gap: 20px; }
                .chart-container { padding: 30px; border-radius: 24px; }
                .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .chart-header h3 { font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
                
                .status-bars { display: flex; flex-direction: column; gap: 18px; }
                .status-row { display: flex; flex-direction: column; gap: 8px; }
                .status-info { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; }
                .status-name { color: rgba(255,255,255,0.6); }
                .status-bar-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.03); border-radius: 10px; overflow: hidden; }
                .status-bar-fill { height: 100%; border-radius: 10px; }

                .performance-summary { width: 350px; padding: 30px; display: flex; flex-direction: column; align-items: center; }
                .efficiency-circle { width: 180px; height: 180px; border-radius: 50%; border: 12px solid rgba(172, 248, 0, 0.1); display: flex; align-items: center; justify-content: center; margin: 20px 0 35px; position: relative; }
                .efficiency-circle::after { content: ''; position: absolute; inset: -12px; border-radius: 50%; border: 12px solid var(--primary-color); border-bottom-color: transparent; border-right-color: transparent; transform: rotate(45deg); }
                .circle-inner { display: flex; flex-direction: column; align-items: center; }
                .efficiency-val { font-size: 2.5rem; font-weight: 950; line-height: 1; }
                .efficiency-label { font-size: 9px; font-weight: 900; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin-top: 5px; }
                
                .eff-stats { width: 100%; display: flex; flex-direction: column; gap: 12px; }
                .eff-item { display: flex; align-items: center; gap: 12px; font-size: 12px; }
                .marker { width: 8px; height: 8px; border-radius: 50%; }
                .lbl { flex: 1; color: rgba(255,255,255,0.5); font-weight: 600; }
                .val { font-weight: 800; }
            `}</style>
        </div>
    );
};

export default CRMAnalise;
