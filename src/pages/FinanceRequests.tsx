import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, X, MessageSquare, Paperclip, Send, Clock, CheckCircle2 } from 'lucide-react';
import SupremeLoading from '../components/SupremeLoading';
import { useAuth } from '../contexts/AuthContext';
import { sendAccountingNotification } from '../services/webhookService';

interface RequestModel {
    id: number;
    requester: string;
    type: string;
    notes: string;
    attachment_url: string;
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
    
    // Create Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({ type: 'Desconto', notes: '', attachment_url: '' });
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState('');

    // Details Modal
    const [selectedRequest, setSelectedRequest] = useState<RequestModel | null>(null);
    const [responses, setResponses] = useState<ResponseModel[]>([]);
    const [newMessage, setNewMessage] = useState('');

    const fetchRequests = async () => {
        setLoading(true);
        let query = supabase.from('finance_requests').select('*').order('created_at', { ascending: false });
        
        if (user?.role === 'EMPLOYEE') {
            query = query.eq('requester', user.name);
        }

        const { data } = await query;
        if (data) setRequests(data as RequestModel[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

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
        const payload = {
            requester: user?.name || '',
            type: formData.type,
            notes: formData.notes,
            attachment_url: formData.attachment_url,
            status: 'Pendente'
        };
        const { error, data: insertedData } = await supabase.from('finance_requests').insert([payload]).select().single();
        setLoading(false);
        if (!error && insertedData) {
            // Webhook
            const dateFormatted = `${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`;
            let msgText = `Uma nova solicitação do tipo "${formData.type}" foi enviada por ${user?.name || 'Usuário'}. Data: ${dateFormatted}.`;
            if (formData.notes) msgText += `\n\n📝 Observações: ${formData.notes}`;
            if (formData.attachment_url) msgText += `\n\n📄 Anexo: ${formData.attachment_url}`;
            
            sendAccountingNotification(
                'NOVA_SOLICITACAO',
                `Nova Solicitação: ${formData.type} - ${user?.name}`,
                msgText,
                { request: insertedData }
            );

            setIsCreateOpen(false);
            setFormData({ type: 'Desconto', notes: '', attachment_url: '' });
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

    return (
        <div className="finance-page animate-fade-in" style={{ padding: "40px", paddingBottom: "80px" }}>
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

            {loading && <SupremeLoading />}

            {!loading && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(req => (
                        <div key={req.id} onClick={() => handleOpenDetails(req)} style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)" }} className=" p-6 cursor-pointer hover:border-primary-color transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={16} className="text-primary-color" />
                                    <span className="font-bold text-white text-sm">{req.type}</span>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${req.status === 'Finalizada' ? 'bg-primary-color/10 text-primary-color' : 'bg-yellow-400/10 text-yellow-400'}`}>
                                    {req.status}
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mb-6 line-clamp-2">{req.notes}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <span className="text-xs text-white/40">{new Date(req.created_at).toLocaleDateString()}</span>
                                <span className="text-xs font-bold text-white/80 group-hover:text-primary-color transition-colors">Ver Detalhes &rarr;</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isCreateOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
                    <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl relative">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold text-white">Nova Solicitação</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6">
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
                    <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative">
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
