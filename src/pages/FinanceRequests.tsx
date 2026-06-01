import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, X, MessageSquare, Paperclip, Send, Clock, CheckCircle2 } from 'lucide-react';
import SupremeLoading from '../components/SupremeLoading';
import { useAuth } from '../contexts/AuthContext';

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
        const { data } = await supabase.from('finance_requests').select('*').order('created_at', { ascending: false });
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
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `requests/${fileName}`;

        const { error } = await supabase.storage.from('finance-files').upload(filePath, file);
        if (!error) {
            const { data } = supabase.storage.from('finance-files').getPublicUrl(filePath);
            setFileUrl(data.publicUrl);
            setFormData({ ...formData, attachment_url: data.publicUrl });
        }
        setUploading(false);
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
        const { error } = await supabase.from('finance_requests').insert([payload]);
        setLoading(false);
        if (!error) {
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

    const handleFinishRequest = async () => {
        if (!selectedRequest) return;
        const { error } = await supabase.from('finance_requests').update({ status: 'Finalizada' }).eq('id', selectedRequest.id);
        if (!error) {
            setSelectedRequest(null);
            fetchRequests();
        }
    };

    return (
        <div className="crm-layout">
            <div className="crm-header-container">
                <div>
                    <h1 className="crm-page-title">Central de Solicitações</h1>
                    <p className="crm-page-subtitle">Acompanhe e gerencie requisições internas</p>
                </div>
                <button onClick={() => setIsCreateOpen(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Nova Solicitação
                </button>
            </div>

            {loading && <SupremeLoading />}

            {!loading && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(req => (
                        <div key={req.id} onClick={() => handleOpenDetails(req)} className="crm-glass-panel p-6 cursor-pointer hover:border-primary-color transition-colors group">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold text-white">Nova Solicitação</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="p-6">
                            <form id="createReqForm" onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Tipo</label>
                                    <select className="crm-input w-full" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase">Descreva sua solicitação</label>
                                    <textarea required className="crm-input w-full min-h-[100px]" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
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
                            <button onClick={() => setIsCreateOpen(false)} className="px-6 py-3 rounded-xl font-bold text-white/60 hover:text-white">Cancelar</button>
                            <button type="submit" form="createReqForm" className="btn-primary" disabled={uploading}>Enviar Solicitação</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedRequest.type}</h2>
                                <p className="text-xs text-white/50">Solicitado por {selectedRequest.requester} em {new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="text-white/50 hover:text-white"><X size={24} /></button>
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
                                            {resp.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedRequest.status !== 'Finalizada' ? (
                            <div className="p-4 border-t border-white/10 bg-black/40">
                                <form onSubmit={handleSendResponse} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="crm-input flex-1 bg-white/5" 
                                        placeholder="Adicionar resposta..." 
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit" className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                                        <Send size={18} />
                                    </button>
                                    <button type="button" onClick={handleFinishRequest} className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold text-sm transition-colors">
                                        Finalizar
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 border-t border-white/10 bg-black/40 text-center flex items-center justify-center gap-2 text-primary-color font-bold text-sm">
                                <CheckCircle2 size={18} /> Solicitação Finalizada
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceRequests;
