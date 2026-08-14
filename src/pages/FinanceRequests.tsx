import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, X, MessageSquare, Paperclip, Send, Clock, CheckCircle2, DollarSign, LayoutDashboard } from 'lucide-react';
import SupremeLoading from '../components/SupremeLoading';
import { useAuth } from '../contexts/AuthContext';
import { sendAccountingNotification } from '../services/webhookService';
import { dbService } from '../services/dbService';

interface RequestModel {
    id: number;
    requester: string;
    type: string;
    notes: string;
    attachment_url: string;
    value?: number;
    status: string;
    created_at: string;
}

interface ResponseModel {
    id: number;
    request_id: number;
    responder: string;
    message: string;
    created_at: string;
}

const REQUEST_TYPES = ['Desconto', 'Comissão', 'Adiantamento', 'Reembolso'];

const FinanceRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<RequestModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [userFinanceData, setUserFinanceData] = useState<any | null>(null);
    const [searchText, setSearchText] = useState('');
    
    // Create Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({ type: 'Desconto', notes: '', attachment_url: '', value: 0 });
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState('');

    // Details Modal
    const [selectedRequest, setSelectedRequest] = useState<RequestModel | null>(null);
    const [responses, setResponses] = useState<ResponseModel[]>([]);
    const [newMessage, setNewMessage] = useState('');

    const formatCurrency = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
    };

    const loadUserFinanceData = async () => {
        if (!user || !user.id || (user.role !== 'EMPLOYEE' && user.role !== 'VENDEDOR')) return;
        try {
            const date = new Date();
            const months = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            const competenceStr = `${months[date.getMonth()]}/${date.getFullYear()}`;
            const data = await dbService.getMyCompetence(user.id as number, competenceStr);
            if (data && !data.error) {
                setUserFinanceData(data);
            }
        } catch (err) {
            console.error("Error loading user finance competence:", err);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        let query = supabase.from('finance_requests').select('*').order('created_at', { ascending: false });
        
        if (user?.role === 'EMPLOYEE' || user?.role === 'VENDEDOR') {
            query = query.eq('requester', user.name);
        }

        const { data } = await query;
        if (data) setRequests(data as RequestModel[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
        loadUserFinanceData();
    }, [user]);

    const fetchResponses = async (reqId: number) => {
        const { data } = await supabase.from('finance_request_responses').select('*').eq('request_id', reqId).order('created_at', { ascending: true });
        if (data) setResponses(data as ResponseModel[]);
    };

    const handleOpenDetails = (req: RequestModel) => {
        setSelectedRequest(req);
        fetchResponses(req.id);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            });
            
            if (!uploadRes.ok) throw new Error("Upload failed");
            
            const uploadData = await uploadRes.json();
            const hostedUrl = uploadData.url || `${window.location.origin}${uploadData.path}`;
            
            setFileUrl(hostedUrl);
            setFormData({ ...formData, attachment_url: hostedUrl });
        } catch (err) {
            console.error(err);
            alert("Erro no upload do anexo.");
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload: any = {
            requester: user?.name || '',
            type: formData.type,
            notes: formData.notes,
            attachment_url: formData.attachment_url,
            status: 'Pendente'
        };
        if (formData.type === 'Reembolso' || formData.type === 'Adiantamento') {
            payload.value = formData.value;
        }
        const { error, data: insertedData } = await supabase.from('finance_requests').insert([payload]).select().single();
        setLoading(false);
        if (!error && insertedData) {
            // Webhook
            const dateFormatted = `${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`;
            let msgText = `Uma nova solicitação do tipo "${formData.type}" foi enviada por ${user?.name || 'Usuário'}. Data: ${dateFormatted}.`;
            if (payload.value) msgText += `\n💰 Valor: R$ ${payload.value}`;
            if (formData.notes) msgText += `\n\n📝 Observações: ${formData.notes}`;
            if (formData.attachment_url) msgText += `\n\n📄 Anexo: ${formData.attachment_url}`;
            
            sendAccountingNotification(
                'NOVA_SOLICITACAO',
                `Nova Solicitação: ${formData.type} - ${user?.name}`,
                msgText,
                { request: insertedData }
            );

            setIsCreateOpen(false);
            setFormData({ type: 'Desconto', notes: '', attachment_url: '', value: 0 });
            setFileUrl('');
            fetchRequests();
        }
    };

    const handleSendResponse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest || !newMessage.trim()) return;
        
        const payload = {
            request_id: selectedRequest.id,
            responder: user?.name || '',
            message: newMessage
        };
        const { error } = await supabase.from('finance_request_responses').insert([payload]);
        if (!error) {
            setNewMessage('');
            fetchResponses(selectedRequest.id);
        }
    };

    const [isFinishing, setIsFinishing] = useState(false);
    const [finishFileUrl, setFinishFileUrl] = useState('');
    const [finishUploading, setFinishUploading] = useState(false);

    const handleFinishFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setFinishUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            });
            
            if (!uploadRes.ok) throw new Error("Upload failed");
            
            const uploadData = await uploadRes.json();
            const hostedUrl = uploadData.url || `${window.location.origin}${uploadData.path}`;
            
            setFinishFileUrl(hostedUrl);
        } catch (err) {
            console.error(err);
            alert("Erro no upload do comprovante.");
        } finally {
            setFinishUploading(false);
        }
    };

    const confirmFinishRequest = async () => {
        if (!selectedRequest || !finishFileUrl) return;
        
        // Add response message with the receipt URL
        await supabase.from('finance_request_responses').insert([{
            request_id: selectedRequest.id,
            responder: user?.name || 'Sistema',
            message: finishFileUrl
        }]);

        const { error } = await supabase.from('finance_requests').update({ status: 'Finalizada' }).eq('id', selectedRequest.id);
        if (!error) {
            // Webhook
            const dateFormatted = `${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`;
            const msg = `A solicitação de ${selectedRequest.type} feita por ${selectedRequest.requester} foi Finalizada em ${dateFormatted}.\n\n📄 Comprovante: ${finishFileUrl}`;
            
            sendAccountingNotification(
                'ALTERACAO_STATUS_SOLICITACAO',
                `Solicitação Finalizada: ${selectedRequest.type}`,
                msg,
                { request: { ...selectedRequest, status: 'Finalizada' } }
            );

            setIsFinishing(false);
            setFinishFileUrl('');
            setSelectedRequest(null);
            fetchRequests();
        }
    };

    const handleCancelRequest = async () => {
        if (!selectedRequest) return;
        if (!window.confirm("Deseja realmente cancelar esta solicitação?")) return;
        
        const { error } = await supabase.from('finance_requests').update({ status: 'Cancelada' }).eq('id', selectedRequest.id);
        if (!error) {
            setSelectedRequest(null);
            fetchRequests();
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        const { error } = await supabase.from('finance_requests').update({ status: newStatus }).eq('id', id);
        if (!error) {
            const req = requests.find(r => r.id === id);
            if (req) {
                const dateFormatted = `${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`;
                const msg = `O status da solicitação de ${req.type} feita por ${req.requester} foi alterado para ${newStatus} em ${dateFormatted}.`;
                sendAccountingNotification(
                    'ALTERACAO_STATUS_SOLICITACAO',
                    `Status da Solicitação: ${newStatus}`,
                    msg,
                    { request: { ...req, status: newStatus } }
                );
            }

            setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
            fetchRequests();
        } else {
            alert("Erro ao atualizar status");
        }
    };

    const handleFinishRequest = async () => {
        setIsFinishing(true);
    };

    const isAccountingOrAdmin = user?.role === 'ADMIN' || user?.role === 'CONTABILIDADE';
    const filtered = requests.filter(req => {
        const term = searchText.toLowerCase();
        return (
            (req.requester || '').toLowerCase().includes(term) ||
            (req.type || '').toLowerCase().includes(term) ||
            (req.notes || '').toLowerCase().includes(term)
        );
    });

    const pendingReqs = filtered.filter(r => r.status === 'Pendente');
    const approvedReqs = filtered.filter(r => r.status === 'Aprovada');
    const historyReqs = filtered.filter(r => r.status === 'Finalizada' || r.status === 'Cancelada');

    const renderCard = (req: RequestModel) => (
        <div key={req.id} onClick={() => handleOpenDetails(req)} style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className=" p-5 cursor-pointer hover:border-primary-color transition-colors group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-primary-color" />
                    <span className="font-bold text-white text-xs">{req.type}</span>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg ${req.status === 'Finalizada' ? 'bg-primary-color/10 text-primary-color' : req.status === 'Aprovada' ? 'bg-green-500/10 text-green-500' : req.status === 'Cancelada' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-400/10 text-yellow-400'}`}>
                    {req.status}
                </span>
            </div>
            <p className="text-xs text-white/50 mb-4 line-clamp-2">{req.notes}</p>
            {req.value ? <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)' }}>{formatCurrency(req.value)}</p> : null}
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="text-[10px] text-white/40">{new Date(req.created_at).toLocaleDateString()}</span>
                {isAccountingOrAdmin && (
                    <span className="text-[10px] font-black text-[#acf800] uppercase tracking-wider">Solicitado por: {req.requester}</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="finance-page animate-fade-in p-4 md:p-10 pb-20 md:pb-20">
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
            `}</style>
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h1>Central de Solicitações</h1>
                    <p className="subtitle">Acompanhe e gerencie requisições internas</p>
                </div>
                <button onClick={() => setIsCreateOpen(true)} style={{ background: "var(--primary-color)", color: "black", border: "none", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} className=" flex items-center gap-2">
                    <Plus size={18} /> Nova Solicitação
                </button>
            </header>

            {/* Estatísticas do Funcionário (Somente para colaboradores e vendedores) */}
            {userFinanceData && (user?.role === 'EMPLOYEE' || user?.role === 'VENDEDOR') && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border-subtle)', borderRadius: '20px', padding: '20px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Mensal RH</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 950, color: 'white', display: 'block', marginTop: '6px' }}>{formatCurrency(userFinanceData.monthly_receivable)}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border-subtle)', borderRadius: '20px', padding: '20px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Total Adiantado</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 950, color: '#f59e0b', display: 'block', marginTop: '6px' }}>{formatCurrency(userFinanceData.total_advanced)}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border-subtle)', borderRadius: '20px', padding: '20px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Saldo Restante</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--primary-color)', display: 'block', marginTop: '6px' }}>{formatCurrency(userFinanceData.monthly_receivable - userFinanceData.total_advanced)}</span>
                    </div>
                </div>
            )}

            {/* Barra de Filtro de Busca */}
            <div className="search-group" style={{ position: 'relative', marginBottom: '32px', maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                <input 
                    className="field-input"
                    placeholder="Buscar solicitações..."
                    style={{ width: '100%', paddingLeft: '48px', height: '48px' }}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>

            {loading && <SupremeLoading />}

            {!loading && (
                <>
                    {isAccountingOrAdmin ? (
                        /* Painel da Contabilidade / Kanban em Colunas */
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Coluna 1: Pendentes */}
                            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--surface-border-subtle)', borderRadius: '24px', padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>PENDENTES</span>
                                    <span style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '2px 8px', borderRadius: '8px', fontSize: '11px' }}>{pendingReqs.length}</span>
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                                    {pendingReqs.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>Nenhuma pendência</div>
                                    ) : (
                                        pendingReqs.map(renderCard)
                                    )}
                                </div>
                            </div>

                            {/* Coluna 2: Aprovadas */}
                            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--surface-border-subtle)', borderRadius: '24px', padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>APROVADAS (A PAGAR)</span>
                                    <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '2px 8px', borderRadius: '8px', fontSize: '11px' }}>{approvedReqs.length}</span>
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                                    {approvedReqs.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>Nenhuma aprovada</div>
                                    ) : (
                                        approvedReqs.map(renderCard)
                                    )}
                                </div>
                            </div>

                            {/* Coluna 3: Histórico */}
                            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--surface-border-subtle)', borderRadius: '24px', padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>HISTÓRICO / FINALIZADAS</span>
                                    <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '8px', fontSize: '11px' }}>{historyReqs.length}</span>
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                                    {historyReqs.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>Histórico vazio</div>
                                    ) : (
                                        historyReqs.map(renderCard)
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Lista Padrão de Solicitações do Funcionário */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                                    Você não possui solicitações registradas.
                                </div>
                            ) : (
                                filtered.map(renderCard)
                            )}
                        </div>
                    )}
                </>
            )}

            {isCreateOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
                    <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] m-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold text-white">Nova Solicitação</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="createReqForm" onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Tipo</label>
                                    <select className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        {REQUEST_TYPES.map(t => <option key={t} value={t} className="bg-[#111]">{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Descreva sua solicitação</label>
                                    <textarea required className="input-field w-full min-h-[100px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Valor (R$)</label>
                                    <input type="number" step="0.01" min="0" required className="input-field w-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} value={formData.value || ''} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Anexos (Opcional)</label>
                                    <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center relative hover:border-primary-color transition-colors">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading} />
                                        {uploading ? <span className="text-primary-color text-sm">Enviando...</span> : fileUrl ? <span className="text-green-400 text-sm">Anexado!</span> : <span className="text-white/60 text-sm">Anexar PDF, JPG ou PNG</span>}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-3">
                            <button onClick={() => setIsCreateOpen(false)} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s" }} className="hover:bg-white/5">Cancelar</button>
                            <button type="submit" form="createReqForm" style={{ background: "var(--primary-color)", color: "black", border: "none", borderRadius: "14px", padding: "16px 24px", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} className="" disabled={uploading}>Enviar Solicitação</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedRequest && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
                    <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative m-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedRequest.type}</h2>
                                <p className="text-xs text-white/50">Solicitado por {selectedRequest.requester} em {new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => { setSelectedRequest(null); setIsFinishing(false); setFinishFileUrl(''); }} className="text-white/50 hover:text-white"><X size={24} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                            {/* Original Request Info */}
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <p className="text-sm text-white/80 whitespace-pre-wrap">{selectedRequest.notes}</p>
                                {selectedRequest.attachment_url && (
                                    <a href={selectedRequest.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-primary-color hover:underline">
                                        <Paperclip size={14} /> Ver Anexo
                                    </a>
                                )}
                            </div>

                            {/* Timeline / Chat */}
                            <div className="space-y-4">
                                {responses.map(resp => (
                                    <div key={resp.id} className={`flex flex-col max-w-[80%] ${resp.responder === user?.name ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                        <span className="text-[10px] text-white/40 mb-1 px-1">{resp.responder} • {new Date(resp.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        <div className={`p-3 rounded-2xl text-sm ${resp.responder === user?.name ? 'bg-primary-color text-black rounded-tr-sm' : 'bg-white/10 text-white/90 rounded-tl-sm'}`}>
                                            {resp.message.startsWith('http') ? (
                                                <a href={resp.message} target="_blank" rel="noreferrer" className="underline font-bold">Ver Comprovante Anexado</a>
                                            ) : (
                                                resp.message
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedRequest.status !== 'Finalizada' && selectedRequest.status !== 'Cancelada' && !isFinishing ? (
                            <div className="p-4 border-t border-white/10 bg-black/40">
                                <form onSubmit={handleSendResponse} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="input-field flex-1 bg-white/5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "white", fontWeight: 700, padding: "12px", width: "100%" }} 
                                        placeholder="Adicionar resposta..." 
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit" className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors" title="Enviar Mensagem">
                                        <Send size={18} />
                                    </button>
                                    
                                    <button type="button" onClick={handleCancelRequest} className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold text-sm transition-colors">
                                        Cancelar
                                    </button>

                                    {user?.role === 'ADMIN' && (
                                        <button type="button" onClick={() => setIsFinishing(true)} className="px-6 py-3 bg-primary-color text-black hover:opacity-80 rounded-xl font-bold text-sm transition-opacity">
                                            Finalizar c/ Anexo
                                        </button>
                                    )}

                                    {(user?.role === 'ADMIN' || user?.role === 'CONTABILIDADE') && (
                                        <>
                                            <button type="button" onClick={() => updateStatus(selectedRequest.id, 'Aprovada')} className="px-4 py-3 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-xl font-bold text-sm transition-colors">
                                                Aprovar
                                            </button>
                                            <button type="button" onClick={() => updateStatus(selectedRequest.id, 'Cancelada')} className="px-4 py-3 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-xl font-bold text-sm transition-colors">
                                                Rejeitar
                                            </button>
                                        </>
                                    )}
                                </form>
                            </div>
                        ) : isFinishing ? (
                            <div className="p-6 border-t border-white/10 bg-black/60 flex flex-col gap-4">
                                <h3 className="text-white font-bold text-sm">Anexar Comprovante (Obrigatório)</h3>
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center relative hover:border-primary-color transition-colors bg-black/20">
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFinishFileUpload} disabled={finishUploading} />
                                    {finishUploading ? <span className="text-primary-color text-sm font-bold">Enviando comprovante...</span> : finishFileUrl ? <span className="text-green-400 text-sm font-bold">Comprovante anexado com sucesso!</span> : <span className="text-white/60 text-sm">Clique para enviar o comprovante de pagamento</span>}
                                </div>
                                <div className="flex gap-2 justify-end mt-2">
                                    <button type="button" onClick={() => setIsFinishing(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors">
                                        Voltar
                                    </button>
                                    <button type="button" onClick={confirmFinishRequest} disabled={!finishFileUrl || finishUploading} className="px-6 py-2 bg-primary-color text-black hover:opacity-80 rounded-xl font-bold text-sm transition-opacity disabled:opacity-50">
                                        Confirmar Finalização
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border-t border-white/10 bg-black/40 text-center flex items-center justify-center gap-2 font-bold text-sm">
                                {selectedRequest.status === 'Finalizada' ? (
                                    <><CheckCircle2 size={18} className="text-primary-color" /> <span className="text-primary-color">Solicitação Finalizada</span></>
                                ) : (
                                    <><X size={18} className="text-red-500" /> <span className="text-red-500">Solicitação Cancelada</span></>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceRequests;
