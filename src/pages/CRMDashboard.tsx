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
        { label: 'Total de Leads', value: totalLeads, icon: <Users size={20} />, color: 'var(--primary-color)', suffix: 'CONTATOS' },
        { label: 'Valor Total CRM', value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <DollarSign size={20} />, color: '#acf800', suffix: 'CONVERTIDO' },
        { label: 'Tickets Médio', value: `R$ ${(totalLeads > 0 ? totalValue / totalLeads : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <TrendingUp size={20} />, color: '#eab308', suffix: 'POR CLIENTE' },
        { label: 'Última Sincro', value: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: <Clock size={20} />, color: 'var(--text-muted)', suffix: 'AO VIVO' }
    ];

    const getStatusBadgeClass = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('aprov') || s.includes('ganho') || s.includes('feito')) return 'badge-success';
        if (s.includes('pend') || s.includes('novo') || s.includes('andamento')) return 'badge-warning';
        if (s.includes('perd') || s.includes('canc')) return 'badge-danger';
        return '';
    };

    return (
        <div className="crm-dashboard-container animate-fade-in">
            <header className="flex justify-between items-end mb-10">
                <div className="header-titles">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary-gradient/10 border border-primary-color/20">
                            <FileSpreadsheet className="text-primary-color" size={24} />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-primary-color uppercase">Gestão de Leads</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight leading-tight">
                        CRM <span className="text-gradient">Dashboard</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-400 mt-2">
                        Visualização inteligente em tempo real dos dados sincronizados do <span className="text-white border-b border-primary-color/30">Google Sheets</span>.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={fetchLeads} 
                        className={`btn btn-secondary ${isLoading ? 'opacity-50' : ''}`}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        {isLoading ? 'SINCRONIZANDO...' : 'ATUALIZAR DADOS'}
                    </button>
                    <button className="btn btn-primary">
                        <ArrowUpRight size={16} />
                        PLANILHA MESTRE
                    </button>
                </div>
            </header>

            {/* ERROR ALERT */}
            {error && (
                <div className="glass-panel border-l-4 border-l-rose-500 p-6 mb-10 animate-glow">
                    <div className="flex items-center gap-4 text-rose-400">
                        <div className="p-3 bg-rose-500/10 rounded-xl">
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-wider mb-1">Falha na Sincronização</h4>
                            <p className="text-xs font-semibold opacity-70">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card group hover-scale p-7 flex flex-col justify-between min-h-[160px]">
                        <div className="flex justify-between items-start">
                            <div 
                                style={{ background: `${stat.color}15`, color: stat.color }} 
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                            >
                                {stat.icon}
                            </div>
                            <span className="text-[9px] font-black text-white/20 tracking-widest">{stat.suffix}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-white group-hover:text-primary-color transition-colors">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLE SECTION */}
            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-8 bg-primary-color rounded-full"></div>
                        <div>
                            <h3 className="font-black uppercase tracking-tight text-sm text-white">Base de Leads</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{filteredLeads.length} contatos encontrados</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-1 min-w-[400px] justify-end">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-color opacity-50" size={18} />
                            <input 
                                type="text" 
                                placeholder="Pesquisar por nome, número ou responsável..."
                                className="input-field pl-14 h-12 text-xs font-semibold !rounded-2xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5 h-12">
                            <Filter size={16} className="text-primary-color opacity-50" />
                            <select 
                                className="bg-transparent text-[10px] font-black p-1 outline-none text-slate-400 cursor-pointer uppercase tracking-wider"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                {statusList.map(s => <option key={s} value={s}>{s === 'Todos' ? 'FILTRAR STATUS' : s.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lead Informações</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Atual</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tags</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Responsável</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Investimento</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Data</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Gerenciar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-32 text-center">
                                        <div className="w-12 h-12 border-2 border-primary-color/10 border-t-primary-color rounded-full animate-spin mx-auto mb-6"></div>
                                        <p className="text-[10px] font-black text-primary-color/40 uppercase tracking-[0.3em]">Sincronizando com a Nuvem...</p>
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-32 text-center opacity-30">
                                        <Users size={60} className="mx-auto mb-6 opacity-10" />
                                        <p className="font-black uppercase tracking-widest text-sm">Nenhum registro encontrado</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead, idx) => (
                                    <tr key={lead.id} className="hover:bg-primary-color/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary-color font-black text-sm group-hover:bg-primary-gradient group-hover:text-black transition-all">
                                                    {lead.nome.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-white mb-1 group-hover:text-primary-color transition-colors">{lead.nome}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                                                        <MessageSquare size={12} className="text-primary-color/50" /> {lead.numero}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`badge ${getStatusBadgeClass(lead.status)} !text-[9px] !font-black !px-3 !py-1.5`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                                                <Tag size={13} className="text-primary-color/40" /> {lead.tag || 'SEM TAG'}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2.5 text-[10px] font-black text-white/90">
                                                <div className="w-6 h-6 rounded-full bg-primary-color/10 flex items-center justify-center">
                                                    <User size={12} className="text-primary-color" />
                                                </div>
                                                {lead.responsavel || 'NÃO ATRIBUÍDO'}
                                            </div>
                                        </td>
                                        <td className="p-6 font-black text-sm text-white">
                                            {lead.value_client || 'R$ 0,00'}
                                        </td>
                                        <td className="p-6 text-[10px] font-black text-slate-500 text-center">
                                            {lead.data_entrada}
                                        </td>
                                        <td className="p-6 text-center">
                                            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary-gradient hover:text-black transition-all group-hover:scale-110">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .crm-dashboard-container {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 40px 30px;
                }
                
                .text-gradient {
                    background: var(--primary-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    border-radius: 50px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                /* Personalização de Scrollbar */
                .overflow-x-auto::-webkit-scrollbar { height: 6px; }
                .overflow-x-auto::-webkit-scrollbar-track { background: transparent; }
                .overflow-x-auto::-webkit-scrollbar-thumb { background: rgba(172, 248, 0, 0.1); border-radius: 10px; }
                .overflow-x-auto::-webkit-scrollbar-thumb:hover { background: rgba(172, 248, 0, 0.2); }
            `}</style>
        </div>
    );
};

export default CRMDashboard;
