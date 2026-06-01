import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, List, Filter, Upload, FileText, CheckCircle2, Clock, XCircle, CreditCard, ChevronDown } from 'lucide-react';
import SupremeLoading from '../components/SupremeLoading';
import { useAuth } from '../contexts/AuthContext';

interface Supplier {
    id: number;
    name: string;
}

interface Payable {
    id: number;
    supplier_id: number;
    launch_date: string;
    due_date: string;
    type: string;
    value: number;
    description: string;
    attachment_url: string;
    responsible: string;
    status: string;
    finance_suppliers?: Supplier;
}

const ACCOUNT_TYPES = ['Aluguel', 'Telefone', 'Internet', 'Energia', 'Água', 'Impostos', 'Marketing', 'Outros'];
const STATUS_OPTIONS = ['Pendente', 'Aprovada', 'Paga'];

const FinancePayables = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'nova' | 'consulta'>('consulta');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [payables, setPayables] = useState<Payable[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSupplier, setFilterSupplier] = useState('');
    const [filterType, setFilterType] = useState('');

    // Form Data
    const [formData, setFormData] = useState<Partial<Payable>>({
        type: 'Outros',
        status: 'Pendente',
        launch_date: new Date().toISOString().split('T')[0],
        responsible: user?.name || ''
    });
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState('');

    const fetchData = async () => {
        setLoading(true);
        // Fetch suppliers
        const { data: sData } = await supabase.from('finance_suppliers').select('id, name');
        if (sData) setSuppliers(sData as Supplier[]);

        // Fetch payables
        let query = supabase.from('finance_payables').select(`
            *,
            finance_suppliers ( id, name )
        `).order('due_date', { ascending: true });

        if (filterStatus) query = query.eq('status', filterStatus);
        if (filterSupplier) query = query.eq('supplier_id', filterSupplier);
        if (filterType) query = query.eq('type', filterType);

        const { data: pData } = await query;
        if (pData) setPayables(pData as any);
        
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterSupplier, filterType]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `payables/${fileName}`;

        const { error } = await supabase.storage.from('finance-files').upload(filePath, file);
        if (error) {
            alert('Erro no upload. O bucket finance-files existe? ' + error.message);
        } else {
            const { data } = supabase.storage.from('finance-files').getPublicUrl(filePath);
            setFileUrl(data.publicUrl);
            setFormData({ ...formData, attachment_url: data.publicUrl });
        }
        setUploading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from('finance_payables').insert([formData]);
        setLoading(false);
        if (!error) {
            alert('Conta adicionada com sucesso!');
            setFormData({ type: 'Outros', status: 'Pendente', launch_date: new Date().toISOString().split('T')[0], responsible: user?.name || '' });
            setFileUrl('');
            setActiveTab('consulta');
            fetchData();
        } else {
            alert('Erro: ' + error.message);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        await supabase.from('finance_payables').update({ status: newStatus }).eq('id', id);
        fetchData();
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const getStatusIcon = (status: string) => {
        if (status === 'Paga') return <CheckCircle2 size={16} className="text-primary-color" />;
        if (status === 'Aprovada') return <CheckCircle2 size={16} className="text-blue-400" />;
        return <Clock size={16} className="text-yellow-400" />;
    };

    return (
        <div className="finance-page animate-fade-in" style={{ padding: "40px", paddingBottom: "80px" }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
            `}</style>
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h1>Contas a Pagar</h1>
                    <p className="subtitle">Gestão de pagamentos e aprovações</p>
                </div>
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                    <button 
                        onClick={() => setActiveTab('consulta')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'consulta' ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'text-white/60 hover:text-white'}`}
                    >
                        <span className="flex items-center gap-2"><List size={16}/> Consultar Contas</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('nova')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'nova' ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'text-white/60 hover:text-white'}`}
                    >
                        <span className="flex items-center gap-2"><Plus size={16}/> Nova Conta</span>
                    </button>
                </div></header>

            {loading && <SupremeLoading />}

            {!loading && activeTab === 'consulta' && (
                <div className="mt-8 space-y-6">
                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className=" p-4 flex items-center gap-3">
                            <Filter size={18} className="text-primary-color" />
                            <select className="filter-select w-full" style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="" className="bg-black">Status: Todos</option>
                                {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                            </select>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className=" p-4 flex items-center gap-3">
                            <Filter size={18} className="text-primary-color" />
                            <select className="filter-select w-full" style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }} value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}>
                                <option value="" className="bg-black">Fornecedor: Todos</option>
                                {suppliers.map(s => <option key={s.id} value={s.id} className="bg-black">{s.name}</option>)}
                            </select>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className=" p-4 flex items-center gap-3">
                            <Filter size={18} className="text-primary-color" />
                            <select className="filter-select w-full" style={{ background: "transparent", border: "none", color: "white", outline: "none", width: "100%", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option value="" className="bg-black">Tipo: Todos</option>
                                {ACCOUNT_TYPES.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Lista */}
                    <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className=" overflow-hidden">
                        <table className="w-full text-left text-sm text-white/80">
                            <thead>
                                <tr className="border-b border-white/5 uppercase text-[10px] tracking-wider text-white/40 bg-white/5">
                                    <th className="px-6 py-4 font-medium">Conta / Fornecedor</th>
                                    <th className="px-6 py-4 font-medium">Tipo</th>
                                    <th className="px-6 py-4 font-medium">Vencimento</th>
                                    <th className="px-6 py-4 font-medium">Valor</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payables.map(p => (
                                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white">{p.finance_suppliers?.name || 'Sem Fornecedor'}</span>
                                                <span className="text-xs text-white/50 truncate max-w-[200px]">{p.description || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold">{p.type}</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${new Date(p.due_date) < new Date() && p.status !== 'Paga' ? 'text-red-400' : 'text-white'}`}>
                                                {new Date(p.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-[15px]">{formatCurrency(p.value)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(p.status)}
                                                <span className={`text-xs font-bold uppercase tracking-wider
                                                    ${p.status === 'Paga' ? 'text-primary-color' : p.status === 'Aprovada' ? 'text-blue-400' : 'text-yellow-400'}
                                                `}>{p.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {p.attachment_url && (
                                                    <a href={p.attachment_url} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white" title="Ver Anexo">
                                                        <FileText size={16} />
                                                    </a>
                                                )}
                                                <select 
                                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary-color"
                                                    value={p.status}
                                                    onChange={e => updateStatus(p.id, e.target.value)}
                                                >
                                                    {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {payables.length === 0 && (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-white/40">Nenhuma conta encontrada.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && activeTab === 'nova' && (
                <div className="mt-8 max-w-3xl mx-auto crm-glass-panel p-8">
                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary-gradient flex items-center justify-center text-black">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Lançar Nova Conta</h2>
                                <p className="text-sm text-white/60">Preencha os dados do pagamento</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 uppercase">Fornecedor / Prestador *</label>
                                <select required className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.supplier_id || ''} onChange={e => setFormData({...formData, supplier_id: parseInt(e.target.value)})}>
                                    <option value="">Selecione...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 uppercase">Tipo de Conta *</label>
                                <select required className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 uppercase">Data de Lançamento *</label>
                                <input required type="date" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.launch_date || ''} onChange={e => setFormData({...formData, launch_date: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 uppercase">Data de Vencimento *</label>
                                <input required type="date" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.due_date || ''} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 uppercase">Valor (R$) *</label>
                                <input required type="number" step="0.01" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} placeholder="0.00" value={formData.value || ''} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 uppercase">Responsável</label>
                                <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.responsible || ''} disabled />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60 uppercase">Descrição</label>
                            <textarea required className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} rows={3} placeholder="Descreva o motivo do pagamento..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60 uppercase">Anexo (Boleto, Nota Fiscal, etc)</label>
                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative hover:border-primary-color transition-colors">
                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading} />
                                <Upload size={24} className="text-primary-color mb-2" />
                                {uploading ? (
                                    <span className="text-sm font-bold text-primary-color">Enviando...</span>
                                ) : fileUrl ? (
                                    <span className="text-sm font-bold text-green-400">Arquivo anexado com sucesso!</span>
                                ) : (
                                    <>
                                        <span className="text-sm font-bold text-white">Clique ou arraste um arquivo aqui</span>
                                        <span className="text-xs text-white/40 mt-1">PDF, JPG, PNG (Máx 5MB)</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" style={{ background: "var(--primary-color)", color: "black", border: "none", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} className=" w-full md:w-auto px-12 py-4 text-sm disabled:opacity-50" disabled={uploading}>
                                Salvar Conta a Pagar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FinancePayables;
