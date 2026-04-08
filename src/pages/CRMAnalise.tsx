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
        { label: 'Taxa de Conversão', value: `${conversionRate.toFixed(1)}%`, trend: '+2.4%', up: true, icon: <Target size={24} />, color: 'var(--primary-color)' },
        { label: 'Pipeline Total', value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, trend: '+12%', up: true, icon: <DollarSign size={24} />, color: '#10b981' },
        { label: 'Leads no Funil', value: totalLeads, trend: '-3', up: false, icon: <Users size={24} />, color: '#3b82f6' },
        { label: 'Ticket Médio', value: `R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, trend: '+5%', up: true, icon: <TrendingUp size={24} />, color: '#f59e0b' },
    ];

    // Status Distribution
    const statusCounts: Record<string, number> = {};
    leads.forEach(l => {
        const s = l.status || 'Sem Status';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    return (
        <div className="crm-container">
            <header className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small"><BarChart3 size={12} /> BUSINESS INTELLIGENCE</div>
                    <h1 className="crm-main-title">Análise de Performance</h1>
                </div>

                <div className="flex gap-4">
                    <div className="glass-panel flex items-center px-4 rounded-xl border-white/5 bg-white/5">
                        <Calendar size={14} className="text-primary-color mr-3" />
                        <select className="bg-transparent border-none outline-none text-white font-bold text-xs cursor-pointer py-2" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                            <option>Hoje</option>
                            <option>Esta Semana</option>
                            <option>Este Mês</option>
                            <option>Trimestre</option>
                        </select>
                    </div>
                    
                    <button className="btn-icon-only" onClick={fetchLeads} disabled={isLoading}>
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>

                    <button className="btn-supreme">
                        <Download size={16} /> Exportar
                    </button>
                </div>
            </header>

            <div className="metrics-grid-row">
                {metrics.map((m, i) => (
                    <div key={i} className="crm-card relative group overflow-hidden border-t-2" style={{ borderTopColor: m.color }}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-all transform group-hover:scale-110">
                            {m.icon}
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-primary-color">
                                {m.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${m.up ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {m.trend}
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{m.label}</span>
                        <h2 className="text-3xl font-black text-white">{m.value}</h2>
                        <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full transition-all duration-1000" style={{ width: m.up ? '75%' : '40%', background: m.color }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                <div className="crm-card p-10">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-black text-white flex items-center gap-3">
                                <Activity size={20} className="text-primary-color" /> 
                                Fluxo do Funil de Vendas
                            </h3>
                            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-tighter">Volume de leads por estágio de negociação</p>
                        </div>
                        <Filter size={18} className="text-gray-600" />
                    </div>
                    
                    <div className="flex flex-col gap-6">
                        {statusData.sort((a,b) => b.value - a.value).map((item, i) => {
                            const percentage = (item.value / (totalLeads || 1)) * 100;
                            return (
                                <div key={i} className="group cursor-default">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: `hsl(${172 + i * 30}, 80%, 50%)` }}></div>
                                            <span className="text-xs font-black text-gray-300 uppercase">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-black text-white">{item.value} <span className="text-gray-600 ml-1">leads</span></span>
                                            <span className="text-[10px] font-black text-primary-color px-2 py-0.5 bg-primary-color/10 rounded">{percentage.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-3 bg-white/[0.03] rounded-full overflow-hidden border border-white/5 group-hover:border-primary-color/20 transition-all">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, background: `linear-gradient(90deg, hsl(${172 + i * 30}, 80%, 50%), hsl(${172 + i * 30 + 20}, 70%, 40%))` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="crm-card performance-summary flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-color/5 filter blur-3xl rounded-full"></div>
                    
                    <div className="mb-8">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[4px] mb-2">Health Score</h3>
                        <div className="flex items-center gap-4">
                            <PieChart size={24} className="text-primary-color" />
                            <h2 className="text-xl font-black">Eficiência de Fechamento</h2>
                        </div>
                    </div>

                    <div className="relative w-52 h-52 flex items-center justify-center mb-10">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="104" cy="104" r="90" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                            <circle cx="104" cy="104" r="90" fill="transparent" stroke="var(--primary-color)" strokeWidth="12" strokeDasharray={565.48} strokeDashoffset={565.48 * (1 - conversionRate / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-5xl font-black text-white tracking-tighter">{conversionRate.toFixed(0)}%</span>
                            <span className="text-[10px] font-black text-gray-500 tracking-widest mt-1">SUCCESS RATE</span>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-3">
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary-color"></div>
                                <span className="text-xs font-bold text-gray-400">Leads Convertidos</span>
                            </div>
                            <span className="text-sm font-black text-white">{convertedLeads}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                                <span className="text-xs font-bold text-gray-400">Leads Perdidos/Em Aberto</span>
                            </div>
                            <span className="text-sm font-black text-white">{totalLeads - convertedLeads}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRMAnalise;
