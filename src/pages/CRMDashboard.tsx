import { useState, useEffect } from 'react';
import { 
    FileSpreadsheet, Users, DollarSign, Clock, Search, 
    Filter, RefreshCw, AlertCircle, User, MessageSquare, 
    Tag, ChevronRight, TrendingUp
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
        { label: 'Total de Leads', value: totalLeads, icon: <Users size={20} />, color: 'var(--primary-color)' },
        { label: 'Valor Total CRM', value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <DollarSign size={20} />, color: '#22c55e' },
        { label: 'Tickets Médio', value: `R$ ${(totalLeads > 0 ? totalValue / totalLeads : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <TrendingUp size={20} />, color: '#eab308' },
        { label: 'Última Sincronização', value: new Date().toLocaleTimeString(), icon: <Clock size={20} />, color: 'var(--text-muted)' }
    ];

    return (
        <div className="crm-dash-wrapper animate-fadeInUp">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-[900] tracking-tighter">CRM <span className="text-primary-color">Dashboard</span></h1>
                    <p className="text-xs font-bold text-muted opacity-60 uppercase tracking-widest mt-1">Sincronizado com Google Sheets</p>
                </div>
                <button 
                    onClick={fetchLeads} 
                    className="action-btn ghost-btn" 
                    disabled={isLoading}
                    style={{ gap: '10px', height: '48px', padding: '0 20px' }}
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /> ATUALIZAR DADOS
                </button>
            </header>

            {/* ERROR STATE */}
            {error && (
                <div className="control-card border-l-4 border-l-red-500 mb-8" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)' }}>
                    <div className="flex items-center gap-4 text-red-400">
                        <AlertCircle size={24} />
                        <div>
                            <h4 className="font-black text-sm uppercase">Erro de Sincronização</h4>
                            <p className="text-xs font-semibold opacity-80">{error}</p>
                        </div>
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-black/20 text-[10px] font-mono leading-relaxed opacity-60">
                        HINT: A planilha precisa estar configurada como "Qualquer pessoa com o link pode ler" ou o acesso via API Google precisa estar autorizado para este Spreadsheet ID.
                    </div>
                </div>
            )}

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="control-card p-6 flex items-center gap-5 group hover:border-primary-color/30 transition-all">
                        <div style={{ background: `${stat.color}15`, color: stat.color }} className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-xl font-black text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN CONTENT TABLE */}
            <div className="control-card overflow-hidden">
                <div className="p-6 border-b border-surface-border flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="text-primary-color" size={20} />
                        <h3 className="font-black uppercase tracking-tight text-sm">Leads da Planilha</h3>
                    </div>

                    <div className="flex items-center gap-3 flex-1 min-w-[300px] justify-end">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome, número ou responsável..."
                                className="premium-input pl-12 h-10 text-xs w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-surface-border">
                            <Filter size={14} className="ml-2 opacity-40" />
                            <select 
                                className="bg-transparent text-[10px] font-bold p-1 outline-none text-muted"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                {statusList.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <th className="p-4 text-[10px] font-black opacity-30 uppercase">Lead / Contato</th>
                                <th className="p-4 text-[10px] font-black opacity-30 uppercase">Status</th>
                                <th className="p-4 text-[10px] font-black opacity-30 uppercase">Tag</th>
                                <th className="p-4 text-[10px] font-black opacity-30 uppercase">Responsável</th>
                                <th className="p-4 text-[10px] font-black opacity-30 uppercase">Valor</th>
                                <th className="p-4 text-[10px] font-black opacity-30 uppercase">Entrada</th>
                                <th className="p-4 text-[10px] font-black opacity-30 uppercase text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="w-8 h-8 border-2 border-primary-color/20 border-t-primary-color rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Carregando dados da Planilha...</p>
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center opacity-40">
                                        <Users size={40} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">Nenhum lead encontrado.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-primary-gradient/10 flex items-center justify-center text-primary-color font-black text-xs">
                                                    {lead.nome.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-white">{lead.nome}</div>
                                                    <div className="text-[10px] font-semibold opacity-40 flex items-center gap-1 mt-0.5">
                                                        <MessageSquare size={10} /> {lead.numero}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                lead.status.toLowerCase().includes('aprov') || lead.status.toLowerCase().includes('ganho') 
                                                ? 'bg-green-500/10 text-green-400' 
                                                : lead.status.toLowerCase().includes('pend') || lead.status.toLowerCase().includes('novo')
                                                ? 'bg-yellow-500/10 text-yellow-400'
                                                : 'bg-white/10 text-white/40'
                                            }`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted">
                                                <Tag size={12} className="opacity-30" /> {lead.tag}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-white">
                                                <User size={12} className="opacity-30 text-primary-color" /> {lead.responsavel}
                                            </div>
                                        </td>
                                        <td className="p-4 font-black text-xs text-white">
                                            {lead.value_client || 'R$ 0,00'}
                                        </td>
                                        <td className="p-4 text-[10px] font-semibold opacity-50">
                                            {lead.data_entrada}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary-color hover:text-black transition-all">
                                                <ChevronRight size={14} />
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
                .crm-dash-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }
                .text-muted { color: var(--text-secondary); }
                .border-surface-border { border-color: var(--surface-border); }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.4s ease-out; }
            `}</style>
        </div>
    );
};

export default CRMDashboard;
