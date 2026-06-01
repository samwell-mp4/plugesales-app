import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Landmark, FileText, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CollaboratorsRegistration = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<any>({});
    const [uploading, setUploading] = useState(false);

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
        const { error } = await supabase.from('collaborators').insert([formData]);
        if (!error) {
            alert('Colaborador cadastrado com sucesso!');
            setFormData({});
        } else {
            alert('Erro ao cadastrar: ' + error.message);
        }
    };

    return (
        <div className="finance-page animate-fade-in" style={{ padding: "40px", paddingBottom: "80px" }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
            `}</style>
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h1>Cadastro de Colaboradores</h1>
                    <p className="subtitle">Registro centralizado de equipe (EMPOOLEY)</p>
                </div></header>

            <form onSubmit={handleSave} className="mt-8 max-w-4xl mx-auto space-y-8">
                {/* Dados Pessoais */}
                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className=" p-8 relative overflow-hidden">
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
                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className=" p-8 relative overflow-hidden">
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
                                <option value="">Selecione...</option>
                                <option value="Corrente">Corrente</option>
                                <option value="Poupança">Poupança</option>
                                <option value="Salário">Salário</option>
                            </select>
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-white/60 uppercase">PIX</label>
                            <input type="text" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.pix_key || ''} onChange={e => setFormData({...formData, pix_key: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Documentos */}
                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className=" p-8 relative overflow-hidden">
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
                        Cadastrar Colaborador
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CollaboratorsRegistration;
