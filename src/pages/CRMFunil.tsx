import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Search, Filter, RefreshCw, User as UserIcon, 
    MessageSquare, Tag, List, Trello, 
    Save, Plus, Trash2, Edit3, X, DollarSign,
    Phone, Mail, Calendar, MapPin
} from 'lucide-react';
import { dbService } from '../services/dbService';

const CRMFunil = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('kanban');
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // New Lead State
    const [newLead, setNewLead] = useState({
        nome: '',
        numero: '',
        email: '',
        tag: '',
        status: 'Novo',
        responsavel: user?.name || '',
        value_client: '0',
        metodo: '',
        volume: ''
    });

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
        } catch (err: any) {
            console.error("CRM Funil Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLead = async () => {
        if (!newLead.nome || !newLead.numero) return alert("Nome e Número são obrigatórios.");
        setIsUpdating(true);
        try {
            await dbService.addCRMLead(newLead);
            await fetchLeads();
            setIsAddModalOpen(false);
            setNewLead({
                nome: '',
                numero: '',
                email: '',
                tag: '',
                status: 'Novo',
                responsavel: user?.name || '',
                value_client: '0',
                metodo: '',
                volume: ''
            });
        } catch (err: any) {
            alert("Erro ao adicionar: " + err.message);
        } finally {
            setIsUpdating(false);
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

    const statusList = ['Novo', 'Contato', 'Diagnóstico', 'Proposta', 'Ganho', 'Perdido'];
    
    const getColumnTotal = (status: string) => {
        const columnLeads = filteredLeads.filter(l => l.status === status);
        const total = columnLeads.reduce((acc, lead) => {
            const val = parseFloat((lead.value_client || '0').replace(/[^\d.,]/g, '').replace(',', '.'));
            return acc + (isNaN(val) ? 0 : val);
        }, 0);
        return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="crm-container">
            <header className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small"><Trello size={12} /> SISTEMA DE PIPELINE NATIVO</div>
                    <h1 className="crm-main-title">Clientes & Funil</h1>
                </div>

                <div className="flex gap-4">
                    <div className="crm-toggle-group-premium">
                        <button className={`crm-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')}><Trello size={14} className="inline mr-2" /> Kanban</button>
                        <button className={`crm-toggle-btn ${viewMode === 'lista' ? 'active' : ''}`} onClick={() => setViewMode('lista')}><List size={14} className="inline mr-2" /> Lista</button>
                    </div>
                    
                    <button className="btn-icon-only" onClick={fetchLeads}><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                    
                    <button className="btn-supreme" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} /> NOVO LEAD
                    </button>
                </div>
            </header>

            {/* ACTION BAR / FILTERS */}
            <div className="crm-action-bar mb-8">
                <div className="crm-control-group flex-1">
                    <Search size={16} className="icon" />
                    <input 
                        type="text" 
                        className="crm-input-premium" 
                        placeholder="BUSCAR NO FUNIL (NOME, NÚMERO, RESPONSÁVEL)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="crm-control-group w-[250px]">
                    <Filter size={16} className="icon" />
                    <select className="crm-select-premium" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="Todos">TODOS OS STATUS</option>
                        {statusList.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            <main>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-12 h-12 border-4 border-primary-color/20 border-t-primary-color rounded-full animate-spin"></div>
                        <p className="font-black text-primary-color tracking-[0.2em] text-[10px] animate-pulse">SINCRONIZANDO SUPABASE</p>
                    </div>
                ) : (
                    viewMode === 'lista' ? (
                        <div className="crm-table-container">
                            <table className="crm-premium-table">
                                <thead>
                                    <tr>
                                        <th>CLIENTE</th>
                                        <th>STATUS</th>
                                        <th>ORIGEM / TAG</th>
                                        <th>RESPONSÁVEL</th>
                                        <th>TICKET MÉDIO</th>
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
                                            <td>
                                                <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-gray-300 border border-white/5 inline-flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-color" />
                                                    {lead.status?.toUpperCase()}
                                                </div>
                                            </td>
                                            <td><span className="text-[11px] font-bold text-gray-500">{lead.tag || '-'}</span></td>
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
                        <div className="kanban-view scrollbar-hide">
                            {statusList.map(status => (
                                <div key={status} className="kanban-col">
                                    <div className="kanban-col-header mb-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-primary-color animate-pulse shadow-[0_0_10px_#acf800]"></div>
                                                <h3>{status}</h3>
                                            </div>
                                            <span className="text-[10px] font-black text-primary-color/50 ml-5">{getColumnTotal(status)}</span>
                                        </div>
                                        <span className="bg-white/5 px-3 py-1 rounded-lg text-[11px] font-black border border-white/5">{filteredLeads.filter(l => l.status === status).length}</span>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {filteredLeads.filter(l => l.status === status).map(lead => (
                                            <div key={lead.id} className="kanban-card-premium group" onClick={() => setSelectedLead(lead)}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-white text-sm mb-1 group-hover:text-primary-color transition-colors">{lead.nome || 'Lead'}</span>
                                                        <span className="text-[10px] text-gray-500 font-bold tracking-wider">{lead.numero}</span>
                                                    </div>
                                                    <div className="text-primary-color font-black text-xs bg-primary-color/10 px-2 py-1 rounded-md">R$ {lead.value_client}</div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {lead.tag && <span className="bg-white/5 px-2 py-1 rounded-md text-[9px] font-black text-gray-400 border border-white/5 flex items-center gap-1"><Tag size={8} /> {lead.tag}</span>}
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase"><UserIcon size={10} className="text-primary-color" /> {lead.responsavel}</div>
                                                    <div className="flex gap-1">
                                                        <button className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all" onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${(lead.numero || '').replace(/\D/g,'')}`, '_blank'); }}><MessageSquare size={13} /></button>
                                                        <button className="p-2 bg-white/5 text-white/50 rounded-lg hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}><Edit3 size={13} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredLeads.filter(l => l.status === status).length === 0 && (
                                            <div className="border-2 border-dashed border-white/5 rounded-2xl py-8 flex flex-col items-center justify-center opacity-30">
                                                <UserIcon size={24} className="mb-2" />
                                                <span className="text-[10px] font-black">VAZIO</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>

            {/* MODAL ADICIONAR LEAD */}
            {isAddModalOpen && (
                <div className="crm-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="crm-modal-content" onClick={e => e.stopPropagation()}>
                        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center text-black shadow-lg shadow-primary-color/20"><Plus size={28} /></div>
                                <div>
                                    <h2 className="text-xl font-black text-white leading-none mb-2">Novo Lead</h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Adicionar prospect ao funil nativo</p>
                                </div>
                            </div>
                            <button className="p-3 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 rounded-xl transition-all" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
                        </header>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="crm-input-group">
                                    <label><UserIcon size={10} className="inline mr-1" /> Nome do Lead</label>
                                    <input type="text" className="crm-input" value={newLead.nome} onChange={e => setNewLead({...newLead, nome: e.target.value})} placeholder="Ex: João Silva" />
                                </div>
                                <div className="crm-input-group">
                                    <label><Phone size={10} className="inline mr-1" /> WhatsApp</label>
                                    <input type="text" className="crm-input" value={newLead.numero} onChange={e => setNewLead({...newLead, numero: e.target.value})} placeholder="5511999999999" />
                                </div>
                                <div className="crm-input-group">
                                    <label><Tag size={10} className="inline mr-1" /> Status Inicial</label>
                                    <select className="crm-input" value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})}>
                                        {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="crm-input-group">
                                    <label><DollarSign size={10} className="inline mr-1" /> Valor Previsto (R$)</label>
                                    <input type="text" className="crm-input" value={newLead.value_client} onChange={e => setNewLead({...newLead, value_client: e.target.value})} />
                                </div>
                                <div className="crm-input-group">
                                    <label><UserIcon size={10} className="inline mr-1" /> Responsável</label>
                                    <input type="text" className="crm-input" value={newLead.responsavel} onChange={e => setNewLead({...newLead, responsavel: e.target.value})} />
                                </div>
                                <div className="crm-input-group">
                                    <label><MapPin size={10} className="inline mr-1" /> Origem / Tag</label>
                                    <input type="text" className="crm-input" value={newLead.tag} onChange={e => setNewLead({...newLead, tag: e.target.value})} placeholder="Anúncios, Orgânico..." />
                                </div>
                            </div>

                            <button className="btn-supreme w-full mt-8 py-5" onClick={handleAddLead} disabled={isUpdating}>
                                {isUpdating ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} className="inline mr-2" />} 
                                SALVAR LEAD NO SUPABASE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR LEAD */}
            {selectedLead && (
                <div className="crm-modal-overlay" onClick={() => setSelectedLead(null)}>
                    <div className="crm-modal-content" onClick={e => e.stopPropagation()}>
                        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary-color font-black text-2xl">{(selectedLead.nome || '?').charAt(0)}</div>
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
                                    <label>Ticket Médio (R$)</label>
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
                                <button className="flex-1 btn-supreme py-5" onClick={() => handleUpdateLead(selectedLead.id, selectedLead)}>
                                    <Save size={18} /> SALVAR ALTERAÇÕES
                                </button>
                                <button className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 transition-all border border-red-500/20 hover:text-white" onClick={() => handleDeleteLead(selectedLead.id)}>
                                    <Trash2 size={24} />
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
