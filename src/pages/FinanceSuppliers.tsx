import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, X, Users, MapPin, Phone, Mail, Building, Landmark, ChevronRight } from 'lucide-react';
import SupremeLoading from '../components/SupremeLoading';

interface Supplier {
    id: number;
    name: string;
    document: string;
    email: string;
    phone: string;
    address: string;
    pix_key: string;
    bank: string;
    agency: string;
    account: string;
    notes: string;
}

const FinanceSuppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Supplier>>({});

    const fetchSuppliers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('finance_suppliers')
            .select('*')
            .order('name', { ascending: true });

        if (!error && data) {
            setSuppliers(data as Supplier[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('finance_suppliers').insert([formData]);
        if (!error) {
            setIsModalOpen(false);
            setFormData({});
            fetchSuppliers();
        } else {
            alert('Erro ao salvar fornecedor: ' + error.message);
        }
    };

    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        (s.document && s.document.includes(search))
    );

    if (loading) return <SupremeLoading />;

    return (
        <div className="finance-page animate-fade-in" style={{ padding: "40px", paddingBottom: "80px" }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
            `}</style>
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h1>Fornecedores & Prestadores</h1>
                    <p className="subtitle">Gestão de entidades cadastradas</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="finance-search-box-premium">
                        <Search size={16} className="text-white/40" />
                        <input 
                            type="text" 
                            placeholder="Buscar fornecedor..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setIsModalOpen(true)} style={{ background: "var(--primary-color)", color: "black", border: "none", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} className=" flex items-center gap-2">
                        <Plus size={18} /> Novo Cadastro
                    </button>
                </div></header>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className=" mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/80">
                        <thead>
                            <tr className="border-b border-white/5 uppercase text-[10px] tracking-wider text-white/40">
                                <th className="px-6 py-4 font-medium">Nome / Razão Social</th>
                                <th className="px-6 py-4 font-medium">Documento</th>
                                <th className="px-6 py-4 font-medium">Contato</th>
                                <th className="px-6 py-4 font-medium text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map(s => (
                                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary-color">
                                                <Building size={18} />
                                            </div>
                                            <span className="font-bold text-white text-[14px]">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{s.document || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {s.phone && <span className="flex items-center gap-1 text-xs"><Phone size={12}/> {s.phone}</span>}
                                            {s.email && <span className="flex items-center gap-1 text-xs text-white/50"><Mail size={12}/> {s.email}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                                            <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSuppliers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-white/40">
                                        Nenhum fornecedor encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Users className="text-primary-color" /> Novo Fornecedor / Prestador
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="supplierForm" onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">Nome / Razão Social *</label>
                                        <input required type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">CPF / CNPJ</label>
                                        <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.document || ''} onChange={e => setFormData({...formData, document: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">E-mail</label>
                                        <input type="email" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase">Telefone</label>
                                        <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase flex items-center gap-1"><MapPin size={14}/> Endereço Completo</label>
                                    <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                                </div>
                                
                                <div className="pt-4 border-t border-white/10">
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Landmark size={16} className="text-primary-color"/> Dados Bancários</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/60 uppercase">Chave PIX</label>
                                            <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.pix_key || ''} onChange={e => setFormData({...formData, pix_key: e.target.value})} />
                                        </div>
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
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Observações</label>
                                    <textarea className="input-field w-full min-h-[80px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10">
                                Cancelar
                            </button>
                            <button type="submit" form="supplierForm" style={{ background: "var(--primary-color)", color: "black", border: "none", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} className="">
                                Salvar Cadastro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceSuppliers;
