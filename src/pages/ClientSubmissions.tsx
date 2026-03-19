import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Trash2, 
    User, 
    Image as ImageIcon, 
    Video, 
    FileText, 
    Link as LinkIcon, 
    CheckCircle, 
    Layers, 
    Search,
    Activity,
    Pencil
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

interface ClientSubmission {
    id: number;
    profile_photo: string;
    profile_name: string;
    ddd: string;
    template_type: string;
    media_url: string;
    ad_copy: string;
    button_link: string;
    spreadsheet_url: string;
    status: string;
    accepted_by?: string;
    sender_number?: string;
    timestamp: string;
}

const ClientSubmissions = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<ClientSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0 });
    const [activeTab, setActiveTab] = useState<'available' | 'mine' | 'all'>('available');

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getClientSubmissions();
            setSubmissions(data || []);
        } catch (err) {
            console.error("Error loading submissions:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Deseja realmente excluir este envio?")) return;
        await dbService.deleteClientSubmission(id);
        loadSubmissions();
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredSubmissions = Array.isArray(submissions) ? submissions.filter(s => {
        const matchesSearch = (s.profile_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (s.ddd || "").includes(searchTerm);
        
        if (!matchesSearch) return false;

        if (activeTab === 'available') return !s.accepted_by;
        if (activeTab === 'mine') return s.accepted_by === user?.name;
        return true; // 'all'
    }) : [];

    const selectAll = () => {
        if (selectedIds.length === filteredSubmissions.length) setSelectedIds([]);
        else setSelectedIds(filteredSubmissions.map(s => s.id));
    };

    const handleEdit = (_sub: ClientSubmission) => {
        alert("Edição em massa em breve. Use o botão Novo Envio para criar novos.");
    };

    const handleAccept = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!user) return;
        try {
            await dbService.updateClientSubmission(id, { accepted_by: user.name });
            loadSubmissions();
        } catch (err) {
            console.error("Error accepting task:", err);
        }
    };

    const callInfobipAPI = async (payload: any) => {
        try {
            const settings = await dbService.getSettings();
            const apiKey = settings['infobip_key'];
            if (!apiKey) throw new Error("API Key não configurada.");

            const res = await fetch('https://qgylyz.api.infobip.com/whatsapp/1/templates', {
                method: 'POST',
                headers: {
                    'Authorization': `App ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                return { success: false, error: errorData.errorMessage || `HTTP ${res.status}` };
            }

            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    const handleBulkGenerate = async () => {
        if (selectedIds.length === 0) return;
        const confirm = window.confirm(`Deseja gerar templates reais na Infobip para ${selectedIds.length} envios selecionados?`);
        if (!confirm) return;

        setIsProcessing(true);
        setGeneratingProgress({ current: 0, total: selectedIds.length });
        
        let successCount = 0;
        let errorCount = 0;

        try {
            for (let i = 0; i < selectedIds.length; i++) {
                const id = selectedIds[i];
                const sub = submissions.find(s => s.id === id);
                if (!sub) continue;

                setGeneratingProgress({ current: i + 1, total: selectedIds.length });

                // Construct Technical Name: name_ddd_type
                const techName = `${sub.profile_name.toLowerCase().replace(/\s+/g, '_')}_${sub.ddd}_${sub.template_type}`;
                
                // Build Payload (Marketing/Utility/Authentication - default to Marketing)
                const payload: any = {
                    name: techName,
                    language: 'pt_BR',
                    category: 'MARKETING',
                    structure: {
                        body: { text: sub.ad_copy }
                    }
                };

                if (sub.template_type !== 'none') {
                    payload.structure.header = {
                        format: sub.template_type.toUpperCase(),
                        example: sub.media_url
                    };
                }

                if (sub.button_link) {
                    payload.structure.buttons = [{
                        type: 'URL',
                        text: 'Acessar Agora',
                        url: sub.button_link
                    }];
                }

                const res = await callInfobipAPI(payload);

                if (res.success) {
                    successCount++;
                    await dbService.updateClientSubmissionStatus(id, 'GERADO'); 
                } else {
                    errorCount++;
                    console.error(`Error generating ${techName}:`, res.error);
                    // Log error to backend
                    await fetch('/api/logs/template-error', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: techName, error: res.error, author: 'Client Area' })
                    }).catch(() => {});
                }

                // Delay for stability (2.5s)
                if (i < selectedIds.length - 1) {
                    await new Promise(r => setTimeout(r, 2500));
                }
            }

            alert(`Processamento concluído!\nSucesso: ${successCount}\nErros: ${errorCount}`);
            setSelectedIds([]);
            loadSubmissions();
        } catch (err) {
            console.error("Bulk error:", err);
            alert("Erro fatal ao processar envios.");
        } finally {
            setIsProcessing(false);
            setGeneratingProgress({ current: 0, total: 0 });
        }
    };


    return (
        <div className="animate-fade-in px-6 py-8" style={{ background: '#020617', minHeight: '100vh' }}>
            <style>{`
                .client-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                
                .glass-card { 
                    background: rgba(255, 255, 255, 0.02); 
                    border: 1px solid rgba(255, 255, 255, 0.08); 
                    backdrop-filter: blur(24px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                }

                .submission-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 20px;
                    padding: 20px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    cursor: pointer;
                }
                .submission-card:hover { 
                    transform: translateY(-4px); 
                    border-color: var(--primary-color);
                    background: rgba(172, 248, 0, 0.02);
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); 
                }
                .submission-card.selected { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.05); }
                
                .card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
                .profile-img { width: 52px; height: 52px; border-radius: 14px; object-fit: cover; border: 1.5px solid rgba(255,255,255,0.1); }
                .status-badge { font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

                .checkbox-custom {
                    width: 22px; height: 22px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 6px;
                    display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
                }
                .checkbox-custom.checked { background: var(--primary-color); border-color: var(--primary-color); color: black; }

                .progress-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(2, 6, 23, 0.95); z-index: 10000;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    backdrop-filter: blur(20px);
                }
                
                .action-overlay {
                    position: absolute; top: 12px; right: 12px; display: flex; gap: 6px; opacity: 0; transform: translateY(-5px); transition: all 0.2s;
                }
                .submission-card:hover .action-overlay { opacity: 1; transform: translateY(0); }
            `}</style>

            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px', margin: 0 }}>Upload de Clientes</h1>
                        <p style={{ opacity: 0.4, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Capture e gerencie solicitações de templates em massa</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mr-4">
                            <button 
                                onClick={() => setActiveTab('available')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'available' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                            >
                                DISPONÍVEIS
                            </button>
                            <button 
                                onClick={() => setActiveTab('mine')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'mine' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                            >
                                MINHAS TAREFAS
                            </button>
                            {user?.role === 'ADMIN' && (
                                <button 
                                    onClick={() => setActiveTab('all')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'all' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                                >
                                    TODAS (ADM)
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                const url = window.location.origin + '/client-form';
                                navigator.clipboard.writeText(url);
                                alert("Link do formulário copiado: " + url);
                            }}
                            className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl transition-all border border-white/5 font-bold text-xs"
                        >
                            <LinkIcon size={16} className="inline mr-2" /> COPIAR LINK
                        </button>
                        <button className="btn btn-primary px-6 py-3 rounded-xl font-black text-black text-xs" onClick={() => navigate('/client-submissions/add')} style={{ background: 'var(--primary-gradient)' }}>
                            <Plus size={18} className="inline mr-1" /> NOVO ENVIO
                        </button>
                        {selectedIds.length > 0 && (
                            <button className="bg-primary/20 hover:bg-primary/30 px-6 py-3 rounded-xl border border-primary/30 text-primary font-black text-xs transition-all" onClick={handleBulkGenerate} disabled={isProcessing}>
                                {isProcessing ? <Activity className="animate-spin" size={16} /> : <Layers size={16} className="inline mr-1" />} {isProcessing ? 'GERANDO...' : `GERAR (${selectedIds.length})`}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-8 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="search-bar-container flex-1 relative">
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)', opacity: 0.4 }} />
                        <input 
                            className="bg-transparent border-none text-white w-full text-sm outline-none" 
                            style={{ paddingLeft: '40px' }} 
                            placeholder="Buscar por cliente ou DDD..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="text-[10px] font-black tracking-widest text-white/40 hover:text-white transition-colors" onClick={selectAll}>
                        {selectedIds.length === filteredSubmissions.length ? 'DESSELECIONAR' : 'SELECIONAR TUDO'}
                    </button>
                </div>

            {isLoading ? (
                <div className="flex-col items-center justify-center p-20 gap-4" style={{ display: 'flex' }}>
                    <Activity className="animate-spin" size={40} color="var(--primary-color)" />
                    <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Carregando solicitações...</span>
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <div className="flex-col items-center justify-center p-20 opacity-20" style={{ display: 'flex' }}>
                    <Layers size={80} strokeWidth={1} />
                    <p style={{ fontWeight: 900, fontSize: '1.2rem', marginTop: '16px' }}>NENHUM ENVIO ENCONTRADO</p>
                </div>
            ) : (
                <div className="client-grid animate-slide-up">
                    {filteredSubmissions.map(s => (
                        <div key={s.id} className={`submission-card ${selectedIds.includes(s.id) ? 'selected' : ''}`} onClick={() => toggleSelect(s.id)}>
                            <div className="action-overlay">
                                <button className="p-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); handleEdit(s); }}>
                                    <Pencil size={14} />
                                </button>
                                <button className="p-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-red-500 rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            
                            <div className="absolute top-4 left-4">
                                <div className={`checkbox-custom ${selectedIds.includes(s.id) ? 'checked' : ''}`}>
                                    {selectedIds.includes(s.id) && <CheckCircle size={14} />}
                                </div>
                            </div>

                            <div className="card-header mt-8">
                                {s.profile_photo ? (
                                    <img src={s.profile_photo} alt="Perfil" className="profile-img" />
                                ) : (
                                    <div className="profile-img bg-white/5 flex items-center justify-center"><User size={24} className="opacity-20" /></div>
                                )}
                                <div>
                                    <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.3px' }}>{s.profile_name}</h4>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 800 }}>DDD {s.ddd}</span>
                                </div>
                            </div>

                            <div className="flex-col gap-3">
                                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                                    {s.template_type === 'image' ? <ImageIcon size={18} color="#a855f7" /> : s.template_type === 'video' ? <Video size={18} color="#3b82f6" /> : <FileText size={18} color="var(--text-muted)" />}
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.template_type.toUpperCase()}</span>
                                    <span className="status-badge ml-auto" style={{ background: s.status === 'GERADO' ? 'rgba(172, 248, 0, 0.1)' : 'rgba(250, 204, 21, 0.1)', color: s.status === 'GERADO' ? 'var(--primary-color)' : '#facc15' }}>{s.status}</span>
                                </div>
                                
                                <div className="flex flex-col gap-1 p-3 border border-white/5 rounded-xl">
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Mensagem</span>
                                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.ad_copy}</p>
                                </div>

                                <div className="flex gap-2">
                                    {!s.accepted_by ? (
                                        <button 
                                            className="flex-1 bg-primary text-black font-black text-[10px] py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            onClick={(e) => handleAccept(e, s.id)}
                                        >
                                            ACEITAR TAREFA
                                        </button>
                                    ) : (
                                        <button 
                                            className="flex-1 bg-white/10 text-white font-black text-[10px] py-3 rounded-xl hover:bg-white/20 transition-all border border-white/5"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/client-submissions/${s.id}`);
                                            }}
                                        >
                                            ABRIR PAINEL
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>

            {/* Bulk Generation Progress Overlay */}
            {generatingProgress.total > 0 && (
                <div className="progress-overlay animate-fade-in">
                    <Activity className="animate-spin text-primary mb-8" size={80} />
                    <h2 style={{ fontWeight: 900, fontSize: '2.5rem', margin: 0, color: 'white' }}>Gerando Templates...</h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.7, marginTop: '16px', color: 'white' }}>
                        Processando {generatingProgress.current} de {generatingProgress.total} envios
                    </p>
                    <div className="w-full max-w-md bg-white/10 h-4 rounded-full mt-10 overflow-hidden border border-white/5">
                        <div 
                            className="bg-primary h-full transition-all duration-500" 
                            style={{ width: `${(generatingProgress.current / generatingProgress.total) * 100}%`, boxShadow: '0 0 20px var(--primary-color)', background: 'var(--primary-color)' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientSubmissions;
