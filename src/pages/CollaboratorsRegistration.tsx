import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    UserPlus, Landmark, FileText, Upload, X, Search, 
    ChevronRight, CreditCard, DollarSign, Activity, FileCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import SupremeLoading from '../components/SupremeLoading';

const CollaboratorsRegistration = () => {
    const { user } = useAuth();
    
    // View state: 'list', 'create', 'detail'
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Selected collaborator data
    const [selectedCollab, setSelectedCollab] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'cadastro' | 'financeiro' | 'vendas'>('cadastro');
    
    // External data (Sales, Requests, Refunds)
    const [history, setHistory] = useState<{
        requests: any[],
        refunds: any[],
        sales: any[]
    }>({ requests: [], refunds: [], sales: [] });
    const [historyLoading, setHistoryLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState<any>({});
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (view === 'list') {
            fetchCollaborators();
        }
    }, [view]);

    const fetchCollaborators = async () => {
        setLoading(true);
        try {
            const [pgUsers, { data: sbCollabs }] = await Promise.all([
                dbService.getFinanceSalespeople(),
                supabase.from('collaborators').select('*').order('full_name', { ascending: true })
            ]);

            const merged = [...(sbCollabs || [])];

            if (pgUsers && pgUsers.length > 0) {
                pgUsers.forEach((u: any) => {
                    const exists = merged.find(c => c.full_name?.toLowerCase() === u.name?.toLowerCase() || c.email?.toLowerCase() === u.email?.toLowerCase());
                    if (!exists) {
                        merged.push({
                            id: `pg_${u.id}`,
                            full_name: u.name,
                            email: u.email,
                            role: 'Vendedor / Colaborador' // fallback
                        });
                    }
                });
            }

            merged.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
            setCollaborators(merged);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (collab: any) => {
        setHistoryLoading(true);
        try {
            // 1. Fetch Finance Requests
            const { data: reqData } = await supabase
                .from('finance_requests')
                .select('*')
                .eq('requester', collab.full_name)
                .order('created_at', { ascending: false });

            // 2. Fetch Finance Refunds
            const { data: refData } = await supabase
                .from('finance_refunds')
                .select('*')
                .eq('requester', collab.full_name)
                .order('request_date', { ascending: false });

            // 3. Fetch Sales (Using dbService, fetching all and filtering by name for simplicity as Admin)
            const allSales = await dbService.getFinanceSales({ role: 'ADMIN' });
            
            // Tenta casar o nome exato ou parte do nome (primeiro nome)
            const firstName = collab.full_name.split(' ')[0].toLowerCase();
            
            const userSales = allSales.filter((s: any) => {
                if (!s.salesperson_name) return false;
                const spName = s.salesperson_name.toLowerCase();
                return spName === collab.full_name.toLowerCase() || spName.includes(firstName);
            });

            setHistory({
                requests: reqData || [],
                refunds: refData || [],
                sales: userSales || []
            });
        } catch (err) {
            console.error(err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSelectCollaborator = (collab: any) => {
        setSelectedCollab(collab);
        setFormData(collab);
        setView('detail');
        setActiveTab('cadastro');
        fetchHistory(collab);
    };

    const handleNewCollaborator = () => {
        setFormData({});
        setView('create');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const filePath = `collaborators/${Math.random()}_${file.name}`;
        const { error } = await supabase.storage.from('finance-files').upload(filePath, file);
        if (!error) {
            const { data } = supabase.storage.from('finance-files').getPublicUrl(filePath);
            setFormData({ ...formData, [field]: data.publicUrl });
        }
        setUploading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (view === 'create') {
            const { error } = await supabase.from('collaborators').insert([formData]);
            if (!error) {
                alert('Colaborador cadastrado com sucesso!');
                setView('list');
            } else {
                alert('Erro ao cadastrar: ' + error.message);
            }
        } else if (view === 'detail') {
            const { error } = await supabase.from('collaborators').update(formData).eq('id', selectedCollab.id);
            if (!error) {
                alert('Colaborador atualizado com sucesso!');
                setSelectedCollab(formData);
            } else {
                alert('Erro ao atualizar: ' + error.message);
            }
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    return (
        <div className="finance-page animate-fade-in p-4 md:p-10 pb-20 md:pb-20">
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                .glass-card-rh {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    backdrop-filter: blur(20px);
                }
                .tab-btn {
                    background: transparent;
                    border: none;
                    outline: none;
                    padding: 12px 24px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.5);
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                }
                .tab-btn:hover {
                    color: white;
                    background: rgba(255,255,255,0.05);
                }
                .tab-btn.active {
                    color: var(--primary-color);
                    border-bottom-color: var(--primary-color);
                    background: rgba(255,255,255,0.02);
                }
            `}</style>
            
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h1>{view === 'list' ? 'Painel de Recursos Humanos' : view === 'create' ? 'Novo Colaborador' : 'Perfil do Colaborador'}</h1>
                    <p className="subtitle">
                        {view === 'list' ? 'Gestão de equipe, reembolsos e histórico' : view === 'create' ? 'Cadastre um novo membro da equipe' : `Visualizando: ${selectedCollab?.full_name}`}
                    </p>
                </div>
                {view !== 'list' && (
                    <button onClick={() => setView('list')} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "12px 20px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }} className="hover:bg-white/5 transition-colors">
                        Voltar para Lista
                    </button>
                )}
            </header>

            {loading && view === 'list' && <SupremeLoading />}

            {/* LIST VIEW */}
            {!loading && view === 'list' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar colaborador..." 
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary-color transition-colors"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button onClick={handleNewCollaborator} style={{ background: "var(--primary-color)", color: "black", border: "none", borderRadius: "12px", padding: "12px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }} className="hover:opacity-90 w-full md:w-auto justify-center">
                            <UserPlus size={18} /> Cadastrar Novo
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {collaborators.filter(c => c.full_name?.toLowerCase().includes(search.toLowerCase())).map(collab => (
                            <div 
                                key={collab.id} 
                                onClick={() => handleSelectCollaborator(collab)}
                                className="glass-card-rh p-6 cursor-pointer hover:border-primary-color/50 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-color/5 rounded-bl-full -z-10 group-hover:bg-primary-color/10 transition-colors"></div>
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary-color font-black text-xl mb-4 border border-white/5">
                                    {collab.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="text-white font-bold text-lg m-0 mb-1">{collab.full_name}</h3>
                                <p className="text-white/50 text-xs m-0 mb-4">{collab.role || 'Sem cargo definido'}</p>
                                
                                <div className="flex items-center text-xs text-white/40 gap-2 mt-auto">
                                    <span>{collab.email}</span>
                                </div>
                            </div>
                        ))}
                        {collaborators.length === 0 && (
                            <div className="col-span-full text-center py-12 text-white/50">Nenhum colaborador cadastrado.</div>
                        )}
                    </div>
                </div>
            )}

            {/* CREATE OR DETAIL VIEW */}
            {(view === 'create' || view === 'detail') && (
                <div className="max-w-6xl mx-auto">
                    {view === 'detail' && (
                        <div className="flex border-b border-white/10 mb-8 overflow-x-auto custom-scrollbar">
                            <button className={`tab-btn ${activeTab === 'cadastro' ? 'active' : ''}`} onClick={() => setActiveTab('cadastro')}>
                                <UserPlus size={16} /> Cadastro Completo
                            </button>
                            <button className={`tab-btn ${activeTab === 'financeiro' ? 'active' : ''}`} onClick={() => setActiveTab('financeiro')}>
                                <CreditCard size={16} /> Reembolsos & Solicitações
                            </button>
                            <button className={`tab-btn ${activeTab === 'vendas' ? 'active' : ''}`} onClick={() => setActiveTab('vendas')}>
                                <DollarSign size={16} /> Histórico de Vendas
                            </button>
                        </div>
                    )}

                    {/* TAB: CADASTRO */}
                    {activeTab === 'cadastro' && (
                        <form onSubmit={handleSave} className="space-y-8 animate-fade-in">
                            {/* Dados Pessoais */}
                            <div className="glass-card-rh p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary-color"></div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                    <UserPlus className="text-primary-color" /> Dados Pessoais
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">Nome Completo *</label>
                                        <input required type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">CPF *</label>
                                        <input required type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.cpf || ''} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">E-mail *</label>
                                        <input required type="email" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">Telefone</label>
                                        <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">Data de Nascimento</label>
                                        <input type="date" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.birth_date || ''} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">Cargo</label>
                                        <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Dados Bancários */}
                            <div className="glass-card-rh p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                    <Landmark className="text-blue-500" /> Dados Bancários
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">Banco</label>
                                        <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.bank || ''} onChange={e => setFormData({...formData, bank: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">Agência</label>
                                        <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.agency || ''} onChange={e => setFormData({...formData, agency: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">Conta</label>
                                        <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.account || ''} onChange={e => setFormData({...formData, account: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">Tipo da Conta</label>
                                        <select className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.account_type || ''} onChange={e => setFormData({...formData, account_type: e.target.value})}>
                                            <option value="" className="bg-[#111]">Selecione...</option>
                                            <option value="Corrente" className="bg-[#111]">Corrente</option>
                                            <option value="Poupança" className="bg-[#111]">Poupança</option>
                                            <option value="Salário" className="bg-[#111]">Salário</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">PIX</label>
                                        <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.pix_key || ''} onChange={e => setFormData({...formData, pix_key: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Documentos */}
                            <div className="glass-card-rh p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                    <FileText className="text-purple-500" /> Documentos (Upload)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative hover:border-white/30 transition-colors h-32 bg-white/5">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'rg_url')} disabled={uploading} />
                                        {formData.rg_url ? <span className="text-green-400 font-bold text-sm">RG Anexado</span> : <><Upload size={20} className="mb-2 text-white/40"/> <span className="text-sm font-bold text-white/80">RG</span></>}
                                    </div>
                                    <div className="border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative hover:border-white/30 transition-colors h-32 bg-white/5">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'cpf_url')} disabled={uploading} />
                                        {formData.cpf_url ? <span className="text-green-400 font-bold text-sm">CPF Anexado</span> : <><Upload size={20} className="mb-2 text-white/40"/> <span className="text-sm font-bold text-white/80">CPF</span></>}
                                    </div>
                                    <div className="border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative hover:border-white/30 transition-colors h-32 bg-white/5">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'bank_receipt_url')} disabled={uploading} />
                                        {formData.bank_receipt_url ? <span className="text-green-400 font-bold text-sm">Comprovante Bancário Anexado</span> : <><Upload size={20} className="mb-2 text-white/40"/> <span className="text-sm font-bold text-white/80">Comp. Bancário</span></>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pb-8">
                                <button type="submit" style={{ background: "var(--primary-color)", color: "black", border: "none", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} className=" px-12 py-4 w-full md:w-auto shadow-xl disabled:opacity-50" disabled={uploading}>
                                    {view === 'create' ? 'Cadastrar Colaborador' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB: FINANCEIRO (Reembolsos & Solicitações) */}
                    {activeTab === 'financeiro' && (
                        <div className="animate-fade-in space-y-6">
                            {historyLoading ? (
                                <div className="text-center py-12 text-white/50">Carregando histórico...</div>
                            ) : (
                                <>
                                    <div className="glass-card-rh p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">Solicitações Recentes</h2>
                                        <div className="space-y-4">
                                            {history.requests.length === 0 && <p className="text-white/40 text-sm">Nenhuma solicitação encontrada.</p>}
                                            {history.requests.map(req => (
                                                <div key={req.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">{req.type}</h4>
                                                        <p className="text-xs text-white/50 m-0">{req.notes || 'Sem descrição'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        {req.value && <div className="text-primary-color font-bold text-sm">{formatCurrency(req.value)}</div>}
                                                        <div className="text-xs text-white/40">{new Date(req.created_at).toLocaleDateString()}</div>
                                                        <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white/10 rounded-md mt-1 inline-block">{req.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-card-rh p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">Reembolsos Diretos (Histórico Antigo)</h2>
                                        <div className="space-y-4">
                                            {history.refunds.length === 0 && <p className="text-white/40 text-sm">Nenhum reembolso antigo encontrado.</p>}
                                            {history.refunds.map(ref => (
                                                <div key={ref.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">{ref.description}</h4>
                                                        <p className="text-xs text-white/50 m-0">Conta: {ref.bank_account}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-primary-color font-bold text-sm">{formatCurrency(ref.value)}</div>
                                                        <div className="text-xs text-white/40">{new Date(ref.request_date).toLocaleDateString()}</div>
                                                        <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white/10 rounded-md mt-1 inline-block">{ref.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB: VENDAS */}
                    {activeTab === 'vendas' && (
                        <div className="animate-fade-in space-y-6">
                            {historyLoading ? (
                                <div className="text-center py-12 text-white/50">Carregando histórico...</div>
                            ) : (
                                <div className="glass-card-rh p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-bold text-white m-0">Vendas do Colaborador</h2>
                                        <div className="bg-primary-color/10 text-primary-color font-black px-4 py-2 rounded-xl text-lg">
                                            Total: {formatCurrency(history.sales.reduce((acc, s) => acc + (parseFloat(s.total_value) || 0), 0))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {history.sales.length === 0 && <p className="text-white/40 text-sm text-center py-8">Nenhuma venda encontrada para este colaborador.</p>}
                                        {history.sales.map(sale => (
                                            <div key={sale.id} className="p-4 bg-white/5 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                                <div>
                                                    <h4 className="font-bold text-white text-sm m-0">{sale.client_name}</h4>
                                                    <p className="text-xs text-white/50 m-0">{sale.package_hired}</p>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-white/40 uppercase font-bold">Data</div>
                                                    <div className="text-sm text-white">{new Date(sale.sale_date).toLocaleDateString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-white/40 uppercase font-bold">Valor</div>
                                                    <div className="text-sm font-bold text-white">{formatCurrency(sale.total_value)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-white/40 uppercase font-bold">Comissão</div>
                                                    <div className="text-sm font-black text-[#4ade80]">{formatCurrency(sale.commission_value)}</div>
                                                    <span className="text-[10px] uppercase font-bold text-white/50">{sale.commission_status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CollaboratorsRegistration;
