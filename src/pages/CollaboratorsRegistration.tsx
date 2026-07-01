import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    UserPlus, Landmark, FileText, Upload, X, Search, 
    ChevronRight, CreditCard, DollarSign, Activity, FileCheck, ShieldAlert, Key
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
    const [activeTab, setActiveTab] = useState<'cadastro' | 'financeiro' | 'vendas' | 'admin'>('cadastro');
    
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
    
    // Admin
    const [newPassword, setNewPassword] = useState('');

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
            const { data: reqData } = await supabase
                .from('finance_requests')
                .select('*')
                .eq('requester', collab.full_name)
                .order('created_at', { ascending: false });

            const { data: refData } = await supabase
                .from('finance_refunds')
                .select('*')
                .eq('requester', collab.full_name)
                .order('request_date', { ascending: false });

            const allSales = await dbService.getFinanceSales({ role: 'ADMIN' });
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
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });

            if (!res.ok) throw new Error('Falha no upload para o servidor local.');
            const data = await res.json();
            
            setFormData({ ...formData, [field]: data.url });
        } catch (err: any) {
            alert('Erro no upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let payload = { ...formData };
        
        if (view === 'create' || String(selectedCollab?.id).startsWith('pg_')) {
            // Criação ou Movendo usuário do Postgres para o Supabase (ID numérico autogerado)
            delete payload.id;
            const { error } = await supabase.from('collaborators').insert([payload]);
            if (!error) {
                alert('Colaborador cadastrado com sucesso!');
                setView('list');
            } else {
                alert('Erro ao cadastrar: ' + error.message);
            }
        } else if (view === 'detail') {
            const { error } = await supabase.from('collaborators').update(payload).eq('id', selectedCollab.id);
            if (!error) {
                alert('Colaborador atualizado com sucesso!');
                setSelectedCollab(formData);
            } else {
                alert('Erro ao atualizar: ' + error.message);
            }
        }
    };
    
    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            return alert('A senha precisa ter pelo menos 6 caracteres.');
        }
        if (!String(selectedCollab?.id).startsWith('pg_')) {
            return alert('Apenas contas do banco interno podem ter a senha redefinida por aqui.');
        }
        
        const pgId = parseInt(String(selectedCollab.id).replace('pg_', ''));
        const res = await dbService.adminUpdatePassword(pgId, newPassword);
        if (res.error) {
            alert('Erro ao alterar senha: ' + res.error);
        } else {
            alert('Senha atualizada com sucesso!');
            setNewPassword('');
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    return (
        <div className="finance-page animate-fade-in p-4 md:p-10 pb-20 md:pb-20">
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                
                /* Layout Glassmorphism Premium */
                .glass-card-rh {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    backdrop-filter: blur(30px);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-card-rh:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.15);
                }
                
                .input-field-premium {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    color: white;
                    font-weight: 600;
                    padding: 14px 16px;
                    width: 100%;
                    outline: none;
                    transition: all 0.3s;
                }
                .input-field-premium:focus {
                    background: rgba(255,255,255,0.05);
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
                }
                
                .tab-btn {
                    background: transparent;
                    border: none;
                    outline: none;
                    padding: 14px 24px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.4);
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                    border-radius: 8px 8px 0 0;
                }
                .tab-btn:hover {
                    color: white;
                    background: rgba(255,255,255,0.03);
                }
                .tab-btn.active {
                    color: var(--primary-color);
                    border-bottom-color: var(--primary-color);
                    background: rgba(255,255,255,0.06);
                    color: white;
                }
                .tab-btn.active svg {
                    color: var(--primary-color);
                }
            `}</style>
            
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h1>{view === 'list' ? 'Colaboradores' : view === 'create' ? 'Novo Colaborador' : 'Perfil do Colaborador'}</h1>
                    <p className="subtitle">
                        {view === 'list' ? 'Gestão de equipe, dados pessoais e histórico' : view === 'create' ? 'Cadastre um novo membro da equipe' : `Visualizando: ${selectedCollab?.full_name}`}
                    </p>
                </div>
                {view !== 'list' && (
                    <button onClick={() => setView('list')} className="bg-white/5 border border-white/10 text-white rounded-xl px-6 py-3 font-bold text-sm hover:bg-white/10 transition-colors shadow-lg">
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
                        <button onClick={handleNewCollaborator} style={{ background: "var(--primary-color)", color: "black" }} className="border-none rounded-xl px-6 py-3 font-black text-sm cursor-pointer flex items-center gap-2 hover:opacity-90 w-full md:w-auto justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                            <UserPlus size={18} /> Novo Cadastro
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {collaborators.filter(c => c.full_name?.toLowerCase().includes(search.toLowerCase())).map(collab => (
                            <div 
                                key={collab.id} 
                                onClick={() => handleSelectCollaborator(collab)}
                                className="glass-card-rh p-6 cursor-pointer hover:border-primary-color/50 transition-all group relative overflow-hidden flex flex-col h-full"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-color/5 rounded-bl-full -z-10 group-hover:bg-primary-color/10 transition-colors"></div>
                                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-primary-color font-black text-2xl mb-5 border border-white/5 shadow-inner">
                                    {collab.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="text-white font-bold text-lg m-0 mb-1">{collab.full_name}</h3>
                                <p className="text-white/50 text-sm m-0 mb-6 font-medium">{collab.role || 'Sem cargo definido'}</p>
                                
                                <div className="flex flex-col text-xs text-white/40 gap-2 mt-auto pt-4 border-t border-white/5">
                                    <span className="truncate">{collab.email}</span>
                                    {collab.phone && <span>{collab.phone}</span>}
                                </div>
                            </div>
                        ))}
                        {collaborators.length === 0 && (
                            <div className="col-span-full text-center py-12 text-white/50 font-medium">Nenhum colaborador cadastrado.</div>
                        )}
                    </div>
                </div>
            )}

            {/* CREATE OR DETAIL VIEW */}
            {(view === 'create' || view === 'detail') && (
                <div className="max-w-6xl mx-auto">
                    {view === 'detail' && (
                        <div className="flex border-b border-white/10 mb-8 overflow-x-auto custom-scrollbar bg-black/20 rounded-t-2xl px-2 pt-2">
                            <button className={`tab-btn ${activeTab === 'cadastro' ? 'active' : ''}`} onClick={() => setActiveTab('cadastro')}>
                                <UserPlus size={16} /> Cadastro Completo
                            </button>
                            <button className={`tab-btn ${activeTab === 'financeiro' ? 'active' : ''}`} onClick={() => setActiveTab('financeiro')}>
                                <CreditCard size={16} /> Reembolsos & Solicitações
                            </button>
                            <button className={`tab-btn ${activeTab === 'vendas' ? 'active' : ''}`} onClick={() => setActiveTab('vendas')}>
                                <DollarSign size={16} /> Histórico de Vendas
                            </button>
                            {(user?.role === 'ADMIN' || user?.role === 'CONTABILIDADE') && (
                                <button className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
                                    <ShieldAlert size={16} /> Controle Admin
                                </button>
                            )}
                        </div>
                    )}

                    {/* TAB: CADASTRO */}
                    {activeTab === 'cadastro' && (
                        <form onSubmit={handleSave} className="space-y-8 animate-fade-in">
                            {/* Dados Pessoais */}
                            <div className="glass-card-rh p-6 md:p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-color"></div>
                                <h2 className="text-xl font-black text-white flex items-center gap-3 mb-8 tracking-tight">
                                    <UserPlus className="text-primary-color" size={24} /> Dados Pessoais
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Nome Completo *</label>
                                        <input required type="text" className="input-field-premium" value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">CPF *</label>
                                        <input required type="text" className="input-field-premium" value={formData.cpf || ''} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">E-mail *</label>
                                        <input required type="email" className="input-field-premium" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Telefone</label>
                                        <input type="text" className="input-field-premium" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Data de Nascimento</label>
                                        <input type="date" className="input-field-premium" value={formData.birth_date || ''} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Cargo</label>
                                        <input type="text" className="input-field-premium" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Dados Bancários */}
                            <div className="glass-card-rh p-6 md:p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                                <h2 className="text-xl font-black text-white flex items-center gap-3 mb-8 tracking-tight">
                                    <Landmark className="text-blue-500" size={24} /> Dados Bancários
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Banco</label>
                                        <input type="text" className="input-field-premium" value={formData.bank || ''} onChange={e => setFormData({...formData, bank: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Agência</label>
                                        <input type="text" className="input-field-premium" value={formData.agency || ''} onChange={e => setFormData({...formData, agency: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Conta</label>
                                        <input type="text" className="input-field-premium" value={formData.account || ''} onChange={e => setFormData({...formData, account: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Tipo da Conta</label>
                                        <select className="input-field-premium" value={formData.account_type || ''} onChange={e => setFormData({...formData, account_type: e.target.value})}>
                                            <option value="" className="bg-[#111]">Selecione...</option>
                                            <option value="Corrente" className="bg-[#111]">Corrente</option>
                                            <option value="Poupança" className="bg-[#111]">Poupança</option>
                                            <option value="Salário" className="bg-[#111]">Salário</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 lg:col-span-4">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1">Chave PIX</label>
                                        <input type="text" className="input-field-premium" value={formData.pix_key || ''} onChange={e => setFormData({...formData, pix_key: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Documentos */}
                            <div className="glass-card-rh p-6 md:p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                                <h2 className="text-xl font-black text-white flex items-center gap-3 mb-8 tracking-tight">
                                    <FileText className="text-purple-500" size={24} /> Documentos (Upload)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-black/30 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative hover:border-purple-500/50 hover:bg-purple-500/5 transition-all h-40">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'rg_url')} disabled={uploading} />
                                        {formData.rg_url ? (
                                            <span className="text-green-400 font-bold flex flex-col items-center gap-2"><FileCheck size={28} /> RG Anexado</span>
                                        ) : (
                                            <><Upload size={28} className="mb-3 text-white/30"/> <span className="text-sm font-bold text-white/70">Upload RG</span></>
                                        )}
                                    </div>
                                    <div className="bg-black/30 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative hover:border-purple-500/50 hover:bg-purple-500/5 transition-all h-40">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'cpf_url')} disabled={uploading} />
                                        {formData.cpf_url ? (
                                            <span className="text-green-400 font-bold flex flex-col items-center gap-2"><FileCheck size={28} /> CPF Anexado</span>
                                        ) : (
                                            <><Upload size={28} className="mb-3 text-white/30"/> <span className="text-sm font-bold text-white/70">Upload CPF</span></>
                                        )}
                                    </div>
                                    <div className="bg-black/30 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative hover:border-purple-500/50 hover:bg-purple-500/5 transition-all h-40">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'bank_receipt_url')} disabled={uploading} />
                                        {formData.bank_receipt_url ? (
                                            <span className="text-green-400 font-bold flex flex-col items-center gap-2"><FileCheck size={28} /> Comprovante Anexado</span>
                                        ) : (
                                            <><Upload size={28} className="mb-3 text-white/30"/> <span className="text-sm font-bold text-white/70">Upload Comp. Bancário</span></>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pb-8">
                                <button type="submit" style={{ background: "var(--primary-color)", color: "black" }} className="rounded-xl px-12 py-4 font-black text-lg w-full md:w-auto shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] disabled:opacity-50 hover:opacity-90 transition-opacity" disabled={uploading}>
                                    {view === 'create' ? 'Cadastrar Colaborador' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB: FINANCEIRO (Reembolsos & Solicitações) */}
                    {activeTab === 'financeiro' && (
                        <div className="animate-fade-in space-y-6">
                            {historyLoading ? (
                                <div className="text-center py-12 text-white/50"><SupremeLoading /></div>
                            ) : (
                                <>
                                    <div className="glass-card-rh p-8">
                                        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                            <CreditCard className="text-primary-color" /> Solicitações Recentes
                                        </h2>
                                        <div className="space-y-4">
                                            {history.requests.length === 0 && <p className="text-white/40 text-sm italic p-4 bg-white/5 rounded-xl text-center">Nenhuma solicitação encontrada.</p>}
                                            {history.requests.map(req => (
                                                <div key={req.id} className="p-5 bg-black/20 rounded-xl border border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-white/10 transition-colors">
                                                    <div>
                                                        <h4 className="font-bold text-white text-base mb-1">{req.type}</h4>
                                                        <p className="text-sm text-white/50 m-0">{req.notes || 'Sem descrição'}</p>
                                                    </div>
                                                    <div className="md:text-right flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto">
                                                        {req.value && <div className="text-primary-color font-black text-lg">{formatCurrency(req.value)}</div>}
                                                        <div className="text-xs text-white/40 mt-1">{new Date(req.created_at).toLocaleDateString()}</div>
                                                        <span className="text-[10px] uppercase font-bold px-3 py-1.5 bg-white/10 rounded-lg mt-2 inline-block tracking-widest">{req.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-card-rh p-8">
                                        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                            <Activity className="text-blue-500" /> Reembolsos Diretos
                                        </h2>
                                        <div className="space-y-4">
                                            {history.refunds.length === 0 && <p className="text-white/40 text-sm italic p-4 bg-white/5 rounded-xl text-center">Nenhum reembolso antigo encontrado.</p>}
                                            {history.refunds.map(ref => (
                                                <div key={ref.id} className="p-5 bg-black/20 rounded-xl border border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-white/10 transition-colors">
                                                    <div>
                                                        <h4 className="font-bold text-white text-base mb-1">{ref.description}</h4>
                                                        <p className="text-sm text-white/50 m-0">Conta: {ref.bank_account}</p>
                                                    </div>
                                                    <div className="md:text-right flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto">
                                                        <div className="text-blue-400 font-black text-lg">{formatCurrency(ref.value)}</div>
                                                        <div className="text-xs text-white/40 mt-1">{new Date(ref.request_date).toLocaleDateString()}</div>
                                                        <span className="text-[10px] uppercase font-bold px-3 py-1.5 bg-white/10 rounded-lg mt-2 inline-block tracking-widest">{ref.status}</span>
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
                                <div className="text-center py-12 text-white/50"><SupremeLoading /></div>
                            ) : (
                                <div className="glass-card-rh p-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                                        <h2 className="text-xl font-black text-white m-0 flex items-center gap-3">
                                            <DollarSign className="text-green-500" /> Histórico de Vendas
                                        </h2>
                                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 font-black px-6 py-3 rounded-xl text-xl shadow-[0_0_20px_rgba(74,222,128,0.1)]">
                                            Total: {formatCurrency(history.sales.reduce((acc, s) => acc + (parseFloat(s.total_value) || 0), 0))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {history.sales.length === 0 && <p className="text-white/40 text-sm text-center py-8 bg-black/20 rounded-xl">Nenhuma venda encontrada para este colaborador.</p>}
                                        {history.sales.map(sale => (
                                            <div key={sale.id} className="p-5 bg-black/20 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-6 items-center hover:bg-white/5 transition-colors">
                                                <div>
                                                    <h4 className="font-bold text-white text-base m-0 mb-1">{sale.client_name}</h4>
                                                    <p className="text-xs text-white/50 m-0 font-medium">{sale.package_hired}</p>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Data</div>
                                                    <div className="text-sm text-white/90">{new Date(sale.sale_date).toLocaleDateString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Valor Venda</div>
                                                    <div className="text-base font-black text-white">{formatCurrency(sale.total_value)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Comissão</div>
                                                    <div className="text-lg font-black text-green-400">{formatCurrency(sale.commission_value)}</div>
                                                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider mt-1 inline-block">{sale.commission_status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* TAB: CONTROLE ADMIN */}
                    {activeTab === 'admin' && (user?.role === 'ADMIN' || user?.role === 'CONTABILIDADE') && (
                        <div className="animate-fade-in space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Módulo de Senha */}
                                <div className="glass-card-rh p-8 border-t-4 border-t-red-500">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6">
                                        <Key className="text-red-500" /> Redefinição de Senha
                                    </h2>
                                    <p className="text-sm text-white/50 mb-6 line-clamp-2">
                                        Altere a senha de acesso ao sistema deste colaborador. Apenas aplicável a contas registradas no banco de dados interno principal.
                                    </p>
                                    
                                    {!String(selectedCollab?.id).startsWith('pg_') ? (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold">
                                            Este colaborador não está vinculado a um acesso do sistema principal (PostgreSQL). Senha gerenciada externamente ou inexistente.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-white/60 uppercase tracking-widest ml-1 mb-2 block">Nova Senha</label>
                                                <input 
                                                    type="password" 
                                                    className="input-field-premium" 
                                                    placeholder="Digite a nova senha..."
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                />
                                            </div>
                                            <button 
                                                onClick={handleUpdatePassword}
                                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20"
                                            >
                                                Forçar Atualização de Senha
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Resumo Contábil */}
                                <div className="glass-card-rh p-8 border-t-4 border-t-primary-color">
                                    <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6">
                                        <Activity className="text-primary-color" /> Resumo Contábil Consolidado
                                    </h2>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                                            <div className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Total em Vendas</div>
                                            <div className="text-2xl font-black text-white">
                                                {formatCurrency(history.sales.reduce((acc, s) => acc + (parseFloat(s.total_value) || 0), 0))}
                                            </div>
                                        </div>
                                        <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                                            <div className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Total de Comissões</div>
                                            <div className="text-2xl font-black text-green-400">
                                                {formatCurrency(history.sales.reduce((acc, s) => acc + (parseFloat(s.commission_value) || 0), 0))}
                                            </div>
                                        </div>
                                        <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                                            <div className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Total Solicitado</div>
                                            <div className="text-xl font-bold text-white/80">
                                                {formatCurrency(history.requests.reduce((acc, r) => acc + (parseFloat(r.value) || 0), 0))}
                                            </div>
                                        </div>
                                        <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                                            <div className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Total Reembolsado</div>
                                            <div className="text-xl font-bold text-blue-400">
                                                {formatCurrency(history.refunds.reduce((acc, r) => acc + (parseFloat(r.value) || 0), 0))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CollaboratorsRegistration;
