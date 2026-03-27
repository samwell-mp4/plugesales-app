import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Calendar, ChevronRight, 
    Trash2, ExternalLink, BarChart, CheckCircle2,
    MessageSquare, Mail, Briefcase, Zap
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

const LeadAdminView = () => {
    const { user: currentUser } = useAuth();
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadLeads = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getStepLeads();
            setLeads(data);
        } catch (error) {
            console.error("Error loading leads:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLeads();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Deseja realmente excluir este lead?")) return;
        try {
            await dbService.deleteStepLead(id);
            setLeads(leads.filter(l => l.id !== id));
        } catch (error) {
            console.error("Error deleting lead:", error);
        }
    };

    const filteredLeads = leads.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm)
    );

    if (currentUser?.role !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white p-8">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">ACESSO RESTRITO</h1>
                    <p className="text-gray-400">Você não tem permissão para acessar esta área administrativa.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-['Outfit']">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-[#acf800]">GESTÃO DE LEADS API</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Captação Estratégica Multi-Etapas</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Total Captado</span>
                        <span className="text-2xl font-black text-[#acf800]">{leads.length}</span>
                    </div>
                    <button 
                        onClick={loadLeads}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                    >
                        <Zap size={20} className={isLoading ? 'animate-pulse' : ''} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#acf800] transition-colors" />
                    <input 
                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-lg font-medium outline-none focus:border-[#acf800]/30 transition-all"
                        placeholder="Pesquisar por nome, e-mail ou WhatsApp..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-[32px] animate-pulse"></div>
                        ))
                    ) : filteredLeads.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-24 text-center">
                            <Users size={64} className="mx-auto text-white/10 mb-6" />
                            <h3 className="text-2xl font-black">Nenhum lead encontrado</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">Os leads capturados no formulário multi-etapas aparecerão aqui.</p>
                        </div>
                    ) : (
                        filteredLeads.map((lead) => (
                            <div key={lead.id} className="bg-white/5 border border-white/5 hover:border-[#acf800]/20 rounded-[32px] p-6 transition-all group">
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-[#acf800] rounded-2xl flex items-center justify-center text-black">
                                            <Users size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">{lead.name}</h3>
                                            <div className="flex gap-4 mt-1">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-bold">
                                                    <MessageSquare size={14} className="text-[#acf800]" /> {lead.phone}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-bold">
                                                    <Mail size={14} className="text-[#acf800]" /> {lead.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[140px]">
                                            <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Nicho</span>
                                            <span className="text-sm font-black flex items-center gap-2 text-white">
                                                <Briefcase size={14} className="text-[#acf800]" /> {lead.niche}
                                            </span>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[140px]">
                                            <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Operação</span>
                                            <span className="text-sm font-black flex items-center gap-2 text-white">
                                                <ExternalLink size={14} className="text-[#acf800]" /> {lead.method}
                                            </span>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[140px]">
                                            <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Volume</span>
                                            <span className="text-sm font-black flex items-center gap-2 text-white">
                                                <BarChart size={14} className="text-[#acf800]" /> {lead.volume}
                                            </span>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-[140px]">
                                            <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Captado em</span>
                                            <span className="text-sm font-black flex items-center gap-2 text-gray-400">
                                                <Calendar size={14} /> {new Date(lead.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(lead.id)}
                                            className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                    }
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                body { background-color: #050505; }
            `}</style>
        </div>
    );
};

export default LeadAdminView;
