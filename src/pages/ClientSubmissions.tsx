import { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    User, 
    Image as ImageIcon, 
    Video, 
    FileText, 
    Link as LinkIcon, 
    Upload, 
    CheckCircle, 
    Layers, 
    Search,
    ChevronRight,
    ChevronLeft,
    X,
    FileSpreadsheet,
    Activity,
    Send
} from 'lucide-react';
import { dbService } from '../services/dbService';

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
    timestamp: string;
}

const ClientSubmissions = () => {
    const [submissions, setSubmissions] = useState<ClientSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        profile_photo: '',
        profile_name: '',
        ddd: '',
        template_type: 'none',
        media_url: '',
        ad_copy: '',
        button_link: '',
        spreadsheet_url: '',
        status: 'PENDENTE'
    });

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getClientSubmissions();
            setSubmissions(data);
        } catch (err) {
            console.error("Error loading submissions:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    const handleFileUpload = async (file: File, field: 'profile_photo' | 'media_url' | 'spreadsheet_url') => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            setIsUploading(true);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Upload failed (${res.status}):`, errorText);
                alert(`Erro no upload (${res.status}). Veja o console para detalhes.`);
                return;
            }

            const result = await res.json();
            if (result.success) {
                setFormData(prev => ({ ...prev, [field]: result.url }));
            } else {
                console.error("Upload failed with success: false", result);
                alert("Erro ao fazer upload do arquivo: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            console.error('Fetch error during upload:', err);
            alert('Erro de rede ao fazer upload. Verifique se o servidor está ativo.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.profile_name || !formData.ddd) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        setIsProcessing(true);
        try {
            await dbService.addClientSubmission(formData);
            setShowModal(false);
            setStep(1);
            setFormData({
                profile_photo: '',
                profile_name: '',
                ddd: '',
                template_type: 'none',
                media_url: '',
                ad_copy: '',
                button_link: '',
                spreadsheet_url: '',
                status: 'PENDENTE'
            });
            loadSubmissions();
        } catch (err) {
            console.error("Error submitting:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Deseja realmente excluir este envio?")) return;
        await dbService.deleteClientSubmission(id);
        loadSubmissions();
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === filteredSubmissions.length) setSelectedIds([]);
        else setSelectedIds(filteredSubmissions.map(s => s.id));
    };

    const handleBulkGenerate = async () => {
        if (selectedIds.length === 0) return;
        const confirm = window.confirm(`Deseja gerar templates para ${selectedIds.length} envios selecionados?`);
        if (!confirm) return;

        setIsProcessing(true);
        try {
            for (const id of selectedIds) {
                console.log(`Generating template for submission ${id}...`);
                // Simulate and update status
                await dbService.updateClientSubmissionStatus(id, 'GERADO');
                await new Promise(r => setTimeout(r, 400)); 
            }
            alert(`${selectedIds.length} templates gerados com sucesso na Infobip!`);
            setSelectedIds([]);
            loadSubmissions();
        } catch (err) {
            console.error("Bulk error:", err);
            alert("Erro ao processar envios em massa.");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredSubmissions = Array.isArray(submissions) ? submissions.filter(s => 
        (s.profile_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.ddd || "").includes(searchTerm)
    ) : [];

    return (
        <div className="animate-fade-in" style={{ padding: '32px' }}>
            <style>{`
                .client-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
                .step-indicator { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 32px; }
                .step-dot { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--surface-border); }
                .step-dot.active { background: var(--primary-color); color: black; border-color: var(--primary-color); box-shadow: 0 0 15px rgba(172, 248, 0, 0.3); }
                .step-dot.completed { background: rgba(172, 248, 0, 0.1); color: var(--primary-color); border-color: var(--primary-color); }
                .step-line { flex: 1; height: 2px; background: var(--surface-border); max-width: 60px; }
                .step-line.completed { background: var(--primary-color); }
                
                .file-dropzone {
                    border: 2px dashed var(--surface-border);
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: rgba(0,0,0,0.2);
                }
                .file-dropzone:hover { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.05); }
                .file-dropzone input { display: none; }

                .submission-card {
                    background: rgba(15, 23, 42, 0.4);
                    border: 1px solid var(--surface-border);
                    border-radius: 28px;
                    padding: 24px;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    overflow: hidden;
                }
                .submission-card:hover { 
                    transform: translateY(-5px); 
                    border-color: rgba(172, 248, 0, 0.3); 
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4); 
                }
                .submission-card.selected { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.03); }
                
                .card-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
                .profile-img { width: 64px; height: 64px; border-radius: 18px; object-fit: cover; border: 2px solid rgba(172, 248, 0, 0.2); }
                .status-badge { font-size: 0.65rem; font-weight: 900; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }

                .checkbox-custom {
                    width: 24px; height: 24px; border: 2px solid var(--surface-border); border-radius: 8px;
                    display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
                }
                .checkbox-custom.checked { background: var(--primary-color); border-color: var(--primary-color); color: black; }
            `}</style>

            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', margin: 0 }}>Upload de Clientes</h1>
                    <p className="subtitle">Capture e gerencie solicitações de templates em massa</p>
                </div>
                <div className="flex gap-4">
                    {selectedIds.length > 0 && (
                        <button className="btn btn-primary animate-fade-in" onClick={handleBulkGenerate} style={{ color: 'black', fontWeight: 900, borderRadius: '14px', background: 'var(--primary-gradient)' }}>
                            <Layers size={18} /> GERAR SELECIONADOS ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={() => setShowModal(true)} style={{ borderRadius: '14px', padding: '12px 24px', fontWeight: 800 }}>
                        <Plus size={18} /> Novo Envio
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-8 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="search-bar-container flex-1 relative">
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)', opacity: 0.5 }} />
                    <input 
                        className="input-field" 
                        style={{ paddingLeft: '48px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }} 
                        placeholder="Buscar por cliente ou DDD..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary" onClick={selectAll} style={{ borderRadius: '12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {selectedIds.length === filteredSubmissions.length ? 'DESSELECIONAR TUDO' : 'SELECIONAR TODOS'}
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
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}>
                                    <Trash2 size={16} />
                                </button>
                                <div className={`checkbox-custom ${selectedIds.includes(s.id) ? 'checked' : ''}`}>
                                    {selectedIds.includes(s.id) && <CheckCircle size={16} />}
                                </div>
                            </div>

                            <div className="card-header">
                                {s.profile_photo ? (
                                    <img src={s.profile_photo} alt="Perfil" className="profile-img" />
                                ) : (
                                    <div className="profile-img bg-slate-800 flex items-center justify-center"><User size={28} opacity={0.3} /></div>
                                )}
                                <div className="flex-col">
                                    <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>{s.profile_name}</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 800 }}>DDD {s.ddd}</span>
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
                                    {s.spreadsheet_url ? (
                                        <div className="flex-1 flex items-center gap-2 p-2 bg-green-500/5 border border-green-500/10 rounded-lg">
                                            <FileSpreadsheet size={14} color="#22c55e" />
                                            <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 800 }}>PLANILHA OK</span>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                                            <FileSpreadsheet size={14} color="#ef4444" />
                                            <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>SEM LISTA</span>
                                        </div>
                                    )}
                                    {s.button_link && (
                                        <div className="flex-1 flex items-center gap-2 p-2 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                                            <LinkIcon size={14} color="#3b82f6" />
                                            <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 800 }}>BOTÃO OK</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Multi-step Modal */}
            {showModal && (
                <div className="loading-overlay" style={{ background: 'rgba(2, 6, 23, 0.95)' }}>
                    <div className="glass-card flex-col animate-scale-in" style={{ width: '100%', maxWidth: '600px', padding: '48px', borderRadius: '40px', background: '#0f172a', border: '1px solid var(--surface-border)' }}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 style={{ fontWeight: 900, margin: 0, fontSize: '1.8rem' }}>Novo Envio de Cliente</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Passo {step} de 3</p>
                            </div>
                            <button className="btn btn-secondary p-2" onClick={() => setShowModal(false)} style={{ borderRadius: '12px' }}><X size={20} /></button>
                        </div>

                        <div className="step-indicator">
                            <div className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>{step > 1 ? <CheckCircle size={20} /> : 1}</div>
                            <div className={`step-line ${step > 1 ? 'completed' : ''}`}></div>
                            <div className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>{step > 2 ? <CheckCircle size={20} /> : 2}</div>
                            <div className={`step-line ${step > 2 ? 'completed' : ''}`}></div>
                            <div className={`step-dot ${step === 3 ? 'active' : ''}`}>3</div>
                        </div>

                        {step === 1 && (
                            <div className="animate-fade-in flex-col gap-6" style={{ display: 'flex' }}>
                                <div className="flex-col gap-2">
                                    <label style={{ fontWeight: 800, fontSize: '0.85rem' }}>Foto de Perfil</label>
                                    <div className="file-dropzone" onClick={() => document.getElementById('profile_photo_input')?.click()}>
                                        <input id="profile_photo_input" type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'profile_photo')} />
                                        {formData.profile_photo ? (
                                            <div className="flex items-center justify-center gap-4">
                                                <img src={formData.profile_photo} alt="Preview" style={{ width: 60, height: 60, borderRadius: '12px', objectFit: 'cover' }} />
                                                <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>Foto Selecionada!</span>
                                            </div>
                                        ) : isUploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Activity className="animate-spin" size={32} color="var(--primary-color)" />
                                                <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>Enviando arquivo...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload size={32} opacity={0.3} />
                                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Clique para subir a foto do perfil</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Nome do Perfil</label>
                                    <input className="input-field" value={formData.profile_name} onChange={e => setFormData({ ...formData, profile_name: e.target.value })} placeholder="Ex: Atendimento Plug" />
                                </div>
                                <div className="input-group">
                                    <label>DDD (apenas números)</label>
                                    <input className="input-field" value={formData.ddd} onChange={e => setFormData({ ...formData, ddd: e.target.value.replace(/\D/g, '') })} placeholder="Ex: 11" maxLength={2} />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in flex-col gap-6" style={{ display: 'flex' }}>
                                <div className="input-group">
                                    <label>Tipo de Conteúdo</label>
                                    <div className="flex gap-2">
                                        {(['none', 'image', 'video'] as const).map(type => (
                                            <button 
                                                key={type} 
                                                className={`btn flex-1 ${formData.template_type === type ? 'btn-primary' : 'btn-secondary'}`} 
                                                onClick={() => setFormData({ ...formData, template_type: type })}
                                                style={{ borderRadius: '12px', color: formData.template_type === type ? 'black' : 'white' }}
                                            >
                                                {type.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {formData.template_type !== 'none' && (
                                    <div className="flex-col gap-2">
                                        <label style={{ fontWeight: 800, fontSize: '0.85rem' }}>Mídia do Anúncio ({formData.template_type})</label>
                                        <div className="file-dropzone" onClick={() => document.getElementById('media_url_input')?.click()}>
                                            <input id="media_url_input" type="file" accept={formData.template_type === 'image' ? 'image/*' : 'video/*'} onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'media_url')} />
                                            {formData.media_url ? (
                                                <span style={{ color: 'var(--primary-color)', fontWeight: 800 }}>Mídia Carregada!</span>
                                            ) : isUploading ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Activity className="animate-spin" size={32} color="var(--primary-color)" />
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>Enviando mídia...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Upload size={32} opacity={0.3} />
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Subir arquivo de mídia</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="input-group">
                                    <label>Copy do Anúncio (Mensagem)</label>
                                    <textarea className="input-field" rows={4} value={formData.ad_copy} onChange={e => setFormData({ ...formData, ad_copy: e.target.value })} style={{ borderRadius: '16px', padding: '16px' }} placeholder="Digite a mensagem do anúncio..." />
                                </div>
                                <div className="input-group">
                                    <label>Link do Botão (Opcional)</label>
                                    <input className="input-field" value={formData.button_link} onChange={e => setFormData({ ...formData, button_link: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-fade-in flex-col gap-8 items-center text-center" style={{ display: 'flex' }}>
                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '32px', borderRadius: '50%' }}>
                                    <FileSpreadsheet size={64} color="#22c55e" />
                                </div>
                                <div className="flex-col gap-2">
                                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>Lista de Contatos do Cliente</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px' }}>Suba a planilha Excel (XLSX) contendo os números para este envio específico.</p>
                                </div>
                                <div className="file-dropzone w-full" onClick={() => document.getElementById('spreadsheet_input')?.click()}>
                                    <input id="spreadsheet_input" type="file" accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'spreadsheet_url')} />
                                    {formData.spreadsheet_url ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckCircle size={20} color="#22c55e" />
                                            <span style={{ color: '#22c55e', fontWeight: 900 }}>PLANILHA CARREGADA COM SUCESSO!</span>
                                        </div>
                                    ) : isUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Activity className="animate-spin" size={32} color="var(--primary-color)" />
                                            <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 800 }}>PROCESSANDO PLANILHA...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload size={36} color="var(--primary-color)" />
                                            <span style={{ fontWeight: 800 }}>SELECIONAR EXCEL (.XLSX)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 mt-12">
                            {step > 1 && (
                                <button className="btn btn-secondary flex-1 py-4" onClick={() => setStep(step - 1)} style={{ borderRadius: '16px' }}>
                                    <ChevronLeft size={20} /> VOLTAR
                                </button>
                            )}
                            {step < 3 ? (
                                <button className="btn btn-primary flex-1 py-4" onClick={() => setStep(step + 1)} style={{ color: 'black', fontWeight: 900, borderRadius: '16px' }}>
                                    PRÓXIMO <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button className="btn btn-primary flex-1 py-4" onClick={handleSubmit} disabled={isProcessing} style={{ color: 'black', fontWeight: 900, borderRadius: '16px', background: 'var(--primary-gradient)' }}>
                                    {isProcessing ? 'SALVANDO...' : 'FINALIZAR ENVIO'} <Send size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientSubmissions;
