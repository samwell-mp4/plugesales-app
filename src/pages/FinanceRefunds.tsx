import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, List, Upload, FileText, X } from 'lucide-react';
import SupremeLoading from '../components/SupremeLoading';
import { useAuth } from '../contexts/AuthContext';

interface Refund {
    id: number;
    requester: string;
    request_date: string;
    value: number;
    description: string;
    attachment_url: string;
    status: string;
}

const STATUS_COLUMNS = ['Solicitado', 'Pendente', 'Aprovado', 'Pago'];

const FinanceRefunds = () => {
    const { user } = useAuth();
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form
    const [formData, setFormData] = useState<Partial<Refund>>({
        requester: user?.name || '',
        request_date: new Date().toISOString().split('T')[0],
        status: 'Solicitado'
    });
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const { data } = await supabase.from('finance_refunds').select('*').order('request_date', { ascending: false });
        if (data) setRefunds(data as Refund[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `refunds/${fileName}`;

        const { error } = await supabase.storage.from('finance-files').upload(filePath, file);
        if (error) {
            alert('Erro no upload.');
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
        const { error } = await supabase.from('finance_refunds').insert([formData]);
        setLoading(false);
        if (!error) {
            setIsModalOpen(false);
            setFormData({ requester: user?.name || '', request_date: new Date().toISOString().split('T')[0], status: 'Solicitado' });
            setFileUrl('');
            fetchData();
        } else {
            alert('Erro: ' + error.message);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        await supabase.from('finance_refunds').update({ status: newStatus }).eq('id', id);
        fetchData();
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="finance-page animate-fade-in" style={{ padding: "40px", paddingBottom: "80px" }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
            `}</style>
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h1>Reembolsos</h1>
                    <p className="subtitle">Fluxo de solicitações e pagamentos</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} style={{ background: "var(--primary-color)", color: "black", border: "none", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} className=" flex items-center gap-2">
                    <Plus size={18} /> Nova Solicitação
                </button>
            </header>

            {loading && <SupremeLoading />}

            {!loading && (
                <div className="mt-8 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                    {STATUS_COLUMNS.map(colStatus => (
                        <div key={colStatus} className="flex-1 min-w-[280px] bg-white/5 rounded-3xl p-4 flex flex-col gap-4 border border-white/5">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-bold text-white/80 uppercase tracking-wider text-xs">{colStatus}</h3>
                                <div className="bg-black/50 text-white/50 text-xs font-bold px-2 py-1 rounded-lg">
                                    {refunds.filter(r => r.status === colStatus).length}
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 flex-1">
                                {refunds.filter(r => r.status === colStatus).map(r => (
                                    <div key={r.id} className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-lg cursor-grab active:cursor-grabbing">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-white text-sm">{formatCurrency(r.value)}</span>
                                            <span className="text-[10px] text-white/40">{new Date(r.request_date).toLocaleDateString('pt-BR', { timeZone: 'UTC'})}</span>
                                        </div>
                                        <p className="text-xs text-white/60 mb-4 line-clamp-2">{r.description}</p>
                                        
                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                            <span className="text-xs font-bold text-primary-color">{r.requester}</span>
                                            <div className="flex items-center gap-2">
                                                {r.attachment_url && (
                                                    <a href={r.attachment_url} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white" title="Comprovante">
                                                        <FileText size={14} />
                                                    </a>
                                                )}
                                                <select 
                                                    className="bg-transparent text-white/40 text-xs outline-none hover:text-white cursor-pointer"
                                                    value={r.status}
                                                    onChange={e => updateStatus(r.id, e.target.value)}
                                                >
                                                    {STATUS_COLUMNS.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Solicitar Reembolso
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form id="refundForm" onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Data da Despesa *</label>
                                    <input required type="date" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.request_date || ''} onChange={e => setFormData({...formData, request_date: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Valor Total (R$) *</label>
                                    <input required type="number" step="0.01" className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} placeholder="0.00" value={formData.value || ''} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Descrição *</label>
                                    <textarea required className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} rows={3} placeholder="Descreva o motivo..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Comprovante</label>
                                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative hover:border-primary-color transition-colors h-24">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading} />
                                        {uploading ? (
                                            <span className="text-sm font-bold text-primary-color">Enviando...</span>
                                        ) : fileUrl ? (
                                            <span className="text-sm font-bold text-green-400 flex items-center gap-1"><FileText size={14}/> Anexado!</span>
                                        ) : (
                                            <>
                                                <Upload size={20} className="text-primary-color mb-1" />
                                                <span className="text-xs text-white/60">Anexar Arquivo</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s" }} className="hover:bg-white/5">Cancelar</button>
                            <button type="submit" form="refundForm" style={{ background: "var(--primary-color)", color: "black", border: "none", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} className=" disabled:opacity-50" disabled={uploading}>Confirmar Solicitação</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceRefunds;
