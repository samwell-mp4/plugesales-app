import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Activity, 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search,
    RefreshCw,
    AlertCircle,
    Bell
} from 'lucide-react';

interface CronLog {
    id: number;
    timestamp: string;
    found: number;
    notificationsSent: number;
    status: 'SUCCESS' | 'IDLE' | 'ERROR';
    error?: string;
    details: string[];
}

const CronReport = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<CronLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/cron/history');
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error('Error fetching cron logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Auto-refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = logs.filter(log => 
        log.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
            case 'IDLE': return <Activity className="w-5 h-5 text-blue-400" />;
            case 'ERROR': return <XCircle className="w-5 h-5 text-red-400" />;
            default: return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-['Inter']">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                            Monitor de Automações
                        </h1>
                        <p className="text-gray-400 text-sm">Acompanhamento em tempo real do agendador (Cron)</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Buscar nos logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>
                    <button 
                        onClick={fetchLogs}
                        disabled={isLoading}
                        className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Horário</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Agendamentos</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Notificações</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                            Nenhum registro encontrado no histórico recente.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(log.status)}
                                                    <span className={`text-sm font-bold ${
                                                        log.status === 'SUCCESS' ? 'text-green-400' : 
                                                        log.status === 'ERROR' ? 'text-red-400' : 'text-blue-400'
                                                    }`}>
                                                        {log.status === 'IDLE' ? 'EM ESPERA' : log.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                                                    {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-white/10 px-2.5 py-1 rounded-lg text-sm font-medium">
                                                    {log.found} encontrados
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.notificationsSent > 0 ? (
                                                    <div className="flex items-center gap-2 text-blue-400">
                                                        <Bell className="w-4 h-4" />
                                                        <span className="font-bold">{log.notificationsSent} enviadas</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {log.details.length > 0 && (
                                                    <div className="text-xs text-gray-500 max-w-[200px] inline-block truncate italic">
                                                        {log.details[0]}
                                                        {log.details.length > 1 && ` (+${log.details.length - 1})`}
                                                    </div>
                                                )}
                                                {log.error && (
                                                    <div className="flex items-center justify-end gap-1 text-xs text-red-400">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Erro no processamento
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Activity className="w-4 h-4 text-blue-500" />
                    O histórico mantém as últimas 100 execuções. O intervalo atual do Cron é de 20 segundos.
                </div>
            </div>
        </div>
    );
};

export default CronReport;
