import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Users, Search, Filter, RefreshCw, User as UserIcon, 
    MessageSquare, Tag, ChevronRight, List, Trello, 
    Mail, Save, Plus, Database, Trash2, Edit3, X
} from 'lucide-react';
import { dbService } from '../services/dbService';

const CRM_SPREADSHEET_ID = "1SnrnWoa9szFoonIebmHXRahL8YkQsDc0PC6pVjmqUE0";

const CRMFunil = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('kanban');
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await dbService.getCRMLeads();
            let filteredData = data;
            if (user?.role === 'EMPLOYEE') {
                filteredData = data.filter((l: any) => 
                    (l.responsavel || '').toLowerCase() === (user.name || '').toLowerCase()
                );
            }
            setLeads(filteredData);
        } catch (err: any) {
            console.error("CRM Funil Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMigrate = async () => {
        if (!window.confirm("Isso irá importar todos os leads da Planilha Google para o Supabase. Deseja continuar?")) return;
        setIsLoading(true);
        try {
            const res = await dbService.migrateCRM();
            alert(`Sucesso! ${res.count} leads migrados.`);
            fetchLeads();
        } catch (err: any) {
            alert("Erro na migração: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateLead = async (id: string | number, updatedData: any) => {
        setIsUpdating(true);
        try {
            await dbService.updateCRMLead(id, updatedData);
            await fetchLeads(); 
            setSelectedLead(null);
        } catch (err: any) {
            alert("Erro ao salvar: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteLead = async (id: string | number) => {
        if (!window.confirm("Tem certeza que deseja excluir este lead permanentemente?")) return;
        setIsUpdating(true);
        try {
            await dbService.deleteCRMLead(id);
            await fetchLeads(); 
            setSelectedLead(null);
        } catch (err: any) {
            alert("Erro ao excluir: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const name = lead.nome || '';
        const number = lead.numero || '';
        const responsavel = lead.responsavel || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             number.includes(searchTerm) || 
                             responsavel.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'Todos' || lead.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statusList = Array.from(new Set(leads.map(l => l.status))).filter(Boolean);
    const fullStatusList = ['Todos', ...statusList];

    const getStatusBadgeClass = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s.includes('aprov') || s.includes('ganho') || s.includes('conclu')) return 'badge-success';
        if (s.includes('perd') || s.includes('cancel')) return 'badge-danger';
        return 'badge-warning';
    };

    return (
        <div className="crm-container">
            <header className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small"><Trello size={12} /> PIPELINE DE VENDAS</div>
                    <h1 className="crm-main-title">Clientes & Funil</h1>
                </div>

                <div className="flex gap-3">
                    <div className="glass-panel flex p-1 rounded-xl">
                        <button className={`p-2 rounded-lg transition-all ${viewMode === 'lista' ? 'bg-primary-color text-black shadow-lg' : 'text-gray-400'}`} onClick={() => setViewMode('lista')}><List size={20} /></button>
                        <button className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'primary-gradient text-black shadow-lg shadow-primary-glow' : 'text-gray-400'}`} onClick={() => setViewMode('kanban')}><Trello size={20} /></button>
                    </div>
                    
                    <button className="btn-icon-only" onClick={fetchLeads}><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                    
                    {user?.role === 'ADMIN' && (
                        <button className="btn-icon-only text-primary-color border-primary-color/20" onClick={handleMigrate} title="Migrar Planilha"><Database size={18} /></button>
                    )}

                    <button className="btn-glow" onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${CRM_SPREADSHEET_ID}`, '_blank')}>
                        <Plus size={18} /> Novo Lead
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="crm-card relative flex items-center px-4 rounded-2xl border-white/5 h-[56px] bg-[#0f172a]/50 backdrop-blur-xl">
                    <Search className="text-primary-color/50" size={18} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar por nome, número ou responsável..."
                        className="bg-transparent border-none outline-none text-white w-full ml-3 font-medium placeholder:text-gray-600 focus:ring-0"
                        value={searchTerm}
                        style={{ background: 'transparent' }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="crm-card relative flex items-center px-4 rounded-2xl border-white/5 h-[56px] bg-[#0f172a]/50 backdrop-blur-xl">
                    <Filter className="text-primary-color/50" size={18} />
                    <select 
                        className="bg-transparent border-none outline-none text-white w-full ml-3 font-medium cursor-pointer focus:ring-0"
                        style={{ background: 'transparent' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        {fullStatusList.map(s => <option key={s} value={s}>{s === 'Todos' ? 'TODOS OS STATUS' : s.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            <main>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-12 h-12 border-4 border-primary-color/20 border-t-primary-color rounded-full animate-spin"></div>
                        <p className="font-bold text-gray-500 tracking-widest text-xs">SINCRONIZANDO SUPABASE...</p>
                    </div>
                ) : (
                    viewMode === 'lista' ? (
                        <div className="crm-table-container">
                            <table className="crm-premium-table">
                                <thead>
                                    <tr>
                                        <th>CLIENTE</th>
                                        <th>STATUS</th>
                                        <th>ORIGEM</th>
                                        <th>RESPONSÁVEL</th>
                                        <th>VALOR</th>
                                        <th className="text-right pr-8">AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map(lead => (
                                        <tr key={lead.id} className="crm-table-row group">
                                            <td>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-color/10 flex items-center justify-center text-primary-color font-black text-lg">{(lead.nome || '?').charAt(0)}</div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white text-sm">{lead.nome || 'Sem Nome'}</span>
                                                        <span className="text-[11px] text-gray-500 font-medium">{lead.numero}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={`badge ${getStatusBadgeClass(lead.status)}`}>{lead.status}</span></td>
                                            <td><span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-gray-400 border border-white/5">{lead.tag || '-'}</span></td>
                                            <td><div className="flex items-center gap-2 text-xs font-bold text-gray-400"><UserIcon size={12} className="text-primary-color" /> {lead.responsavel || '-'}</div></td>
                                            <td><span className="font-black text-primary-color text-sm">R$ {lead.value_client || '0'}</span></td>
                                            <td className="text-right pr-8">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => setSelectedLead(lead)} className="p-2 bg-white/5 hover:bg-primary-color/20 text-white hover:text-primary-color rounded-lg transition-all"><Edit3 size={16} /></button>
                                                    <button onClick={() => handleDeleteLead(lead.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="kanban-view">
                            {statusList.map(status => (
                                <div key={status} className="kanban-col">
                                    <div className="kanban-col-header">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary-color animate-pulse"></div>
                                            <h3>{status}</h3>
                                        </div>
                                        <span className="bg-white/5 px-2 py-0.5 rounded-md text-[10px] font-black">{filteredLeads.filter(l => l.status === status).length}</span>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {filteredLeads.filter(l => l.status === status).map(lead => (
                                            <div key={lead.id} className="kanban-card-premium group" onClick={() => setSelectedLead(lead)}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-white text-sm mb-1">{lead.nome || 'Lead'}</span>
                                                        <span className="text-[10px] text-gray-500 font-bold tracking-wider">{lead.numero}</span>
                                                    </div>
                                                    <span className="text-primary-color font-black text-xs">R$ {lead.value_client}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {lead.tag && <span className="bg-white/5 px-2 py-1 rounded-md text-[9px] font-extrabold text-gray-400 flex items-center gap-1"><Tag size={8} /> {lead.tag}</span>}
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase"><UserIcon size={10} className="text-primary-color" /> {lead.responsavel}</div>
                                                    <div className="flex gap-1">
                                                        <button className="p-1.5 bg-green-500/10 text-green-500 rounded-md hover:bg-green-500/20 transition-all" onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.numero.replace(/\D/g,'')}`, '_blank'); }}><MessageSquare size={12} /></button>
                                                        <button className="p-1.5 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }}><Trash2 size={12} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>

            {/* Modal de Detalhes / Edição */}
            {selectedLead && (
                <div className="crm-modal-overlay" onClick={() => setSelectedLead(null)}>
                    <div className="crm-modal-content" onClick={e => e.stopPropagation()}>
                        <header className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center text-black font-black text-2xl">{(selectedLead.nome || '?').charAt(0)}</div>
                                <div>
                                    <h2 className="text-xl font-black text-white leading-none mb-2">{selectedLead.nome || 'Editar Lead'}</h2>
                                    <p className="text-xs text-gray-500 font-bold">{selectedLead.numero} • {selectedLead.email || 'Sem e-mail'}</p>
                                </div>
                            </div>
                            <button className="p-3 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 rounded-xl transition-all" onClick={() => setSelectedLead(null)}><X size={20} /></button>
                        </header>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="crm-input-group">
                                    <label>Status Comercial</label>
                                    <select 
                                        className="crm-input"
                                        value={selectedLead.status}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, status: e.target.value })}
                                    >
                                        {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="crm-input-group">
                                    <label>Valor do Lead (R$)</label>
                                    <input 
                                        type="text" 
                                        className="crm-input"
                                        value={selectedLead.value_client}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, value_client: e.target.value })}
                                    />
                                </div>
                                <div className="crm-input-group">
                                    <label>Responsável</label>
                                    <input 
                                        type="text" 
                                        className="crm-input"
                                        value={selectedLead.responsavel}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, responsavel: e.target.value })}
                                    />
                                </div>
                                <div className="crm-input-group">
                                    <label>Tag / Origem</label>
                                    <input 
                                        type="text" 
                                        className="crm-input"
                                        value={selectedLead.tag}
                                        onChange={(e) => setSelectedLead({ ...selectedLead, tag: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button className="flex-1 py-4 bg-primary-color text-black font-black text-sm rounded-xl hover:shadow-2xl hover:shadow-primary-glow transition-all flex items-center justify-center gap-3" onClick={() => handleUpdateLead(selectedLead.id, selectedLead)}>
                                    <Save size={18} /> Salvar Alterações
                                </button>
                                <button className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 transition-all border border-red-500/20 hover:text-white" onClick={() => handleDeleteLead(selectedLead.id)}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRMFunil;
