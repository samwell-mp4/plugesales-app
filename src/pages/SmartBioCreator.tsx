import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { 
    FileText,
    Smartphone, 
    Link as LinkIcon, 
    Plus, 
    Trash2, 
    Save, 
    Layout,
    MousePointer2,
    Zap,
    User,
    ChevronRight,
    ArrowLeft,
    Check,
    MessageSquare,
    Send,
    ExternalLink,
    Eye,
    Copy,
    Share2,
    Search,
    BarChart3,
    ArrowUpRight
} from 'lucide-react';

const SmartBioCreator = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
    const [bios, setBios] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [showPDFs, setShowPDFs] = useState(true);

    const [bio, setBio] = useState<any>({
        title: 'Seu Nome ou Empresa',
        description: 'Breve descrição sobre o que você faz ou oferece.',
        avatar_url: '',
        video_url: '',
        buttons: [
            { label: 'Falar no WhatsApp', url: 'https://wa.me/55...', type: 'whatsapp' },
            { label: 'Visualizar Prévia', url: '#', type: 'preview' }
        ],
        images: [],
        slug: ''
    });

    const [employeeData, setEmployeeData] = useState({
        name: '',
        photo: '',
        whatsapp: '',
        tracking: 'origem=bio'
    });

    useEffect(() => {
        if (user?.id) {
            loadBios();
        }
    }, [user?.id]);

    const loadBios = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getSmartBio(user!.id!);
            setBios(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setBio(item);
        setView('editor');
    };

    const handleCreateNew = () => {
        setBio({
            title: 'Nova Smart Bio',
            description: 'Breve descrição...',
            avatar_url: '',
            video_url: '',
            buttons: [
                { label: 'Falar no WhatsApp', url: 'https://wa.me/55...', type: 'whatsapp' },
                { label: 'Visualizar Prévia', url: '#', type: 'preview' }
            ],
            images: [],
            slug: 'bio-' + Math.random().toString(36).substring(7)
        });
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta Bio?')) return;
        await dbService.deleteSmartBio(id);
        loadBios();
    };

    const handleSave = async () => {
        if (!bio.slug) return alert('Defina um link personalizado (slug)');
        if (!user?.id) return alert('Usuário não identificado.');
        
        setIsSaving(true);
        try {
            const payload = { ...bio, user_id: user.id };
            const res = await dbService.saveSmartBio(payload);
            if (res && !res.error) {
                alert('Smart Bio salva com sucesso!');
                setView('dashboard');
                loadBios();
            } else {
                alert('Erro ao salvar: ' + (res?.error || 'Slug já existe ou erro interno'));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (slug: string) => {
        const url = `${window.location.origin}/bio/${slug}`;
        navigator.clipboard.writeText(url);
        alert('Link copiado!');
    };

    const addButton = () => {
        setBio({
            ...bio,
            buttons: [...bio.buttons, { label: 'Novo Link', url: '', type: 'link' }]
        });
    };

    const updateButton = (index: number, field: string, value: string) => {
        const newButtons = [...bio.buttons];
        newButtons[index][field] = value;
        setBio({ ...bio, buttons: newButtons });
    };

    const removeButton = (index: number) => {
        const newButtons = bio.buttons.filter((_: any, i: number) => i !== index);
        setBio({ ...bio, buttons: newButtons });
    };

    if (view === 'dashboard') {
        return (
            <div className="crm-container" style={{ padding: '40px' }}>
                <style>{`
                    .dash-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 40px;
                    }
                    .bio-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                        gap: 25px;
                    }
                    .bio-card {
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 24px;
                        padding: 25px;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                    }
                    .bio-card:hover {
                        background: rgba(255, 255, 255, 0.06);
                        border-color: var(--primary-color);
                        transform: translateY(-5px);
                    }
                    .bio-card-stats {
                        display: flex;
                        gap: 20px;
                        margin-top: 20px;
                        padding-top: 20px;
                        border-top: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    .stat-item {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }
                    .stat-value {
                        font-size: 18px;
                        font-weight: 900;
                        color: #fff;
                    }
                    .stat-label {
                        font-size: 9px;
                        font-weight: 900;
                        color: rgba(255, 255, 255, 0.3);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .btn-action-circle {
                        width: 36px;
                        height: 36px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255, 255, 255, 0.05);
                        color: #fff;
                        transition: all 0.2s;
                        cursor: pointer;
                    }
                    .btn-action-circle:hover {
                        background: var(--primary-color);
                        color: #000;
                    }
                    .bio-card-avatar {
                        width: 50px;
                        height: 50px;
                        border-radius: 15px;
                        object-fit: cover;
                        background: rgba(255, 255, 255, 0.1);
                    }
                    .empty-state {
                        text-align: center;
                        padding: 100px 0;
                        background: rgba(255, 255, 255, 0.02);
                        border-radius: 30px;
                        border: 2px dashed rgba(255, 255, 255, 0.05);
                    }
                `}</style>

                <header className="dash-header">
                    <div>
                        <span className="crm-badge-small">
                            <Smartphone size={12} fill="currentColor" /> MEUS LINKS PRO
                        </span>
                        <h1 className="crm-main-title">Smart Bio Dashboard</h1>
                    </div>
                    <button onClick={handleCreateNew} className="btn-supreme" style={{ padding: '15px 30px', background: '#acf800', color: '#000' }}>
                        <Plus size={20} /> CRIAR NOVO LINK
                    </button>
                </header>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Zap size={40} className="animate-pulse text-primary-color" />
                    </div>
                ) : bios.length === 0 ? (
                    <div className="empty-state">
                        <Smartphone size={60} className="mx-auto mb-6 text-white/10" />
                        <h3 className="text-xl font-black mb-2">Nenhuma Bio Criada</h3>
                        <p className="text-white/40 mb-8 max-w-xs mx-auto">Comece agora a criar suas páginas de conversão de alta performance.</p>
                        <button onClick={handleCreateNew} className="btn-supreme mx-auto">
                            CRIAR MINHA PRIMEIRA BIO
                        </button>
                    </div>
                ) : (
                    <div className="bio-grid">
                        {bios.map((item) => (
                            <div key={item.id} className="bio-card">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <img src={item.avatar_url || 'https://via.placeholder.com/150'} className="bio-card-avatar" alt="" />
                                        <div>
                                            <h3 className="font-black text-lg leading-tight mb-1">{item.title}</h3>
                                            <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase">/{item.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div onClick={() => handleEdit(item)} className="btn-action-circle" title="Editar"><Layout size={16} /></div>
                                        <div onClick={() => copyToClipboard(item.slug)} className="btn-action-circle" title="Copiar Link"><Copy size={16} /></div>
                                        <div onClick={() => window.open(`${window.location.origin}/bio/${item.slug}`, '_blank')} className="btn-action-circle" title="Ver"><Eye size={16} /></div>
                                        <div onClick={() => handleDelete(item.id)} className="btn-action-circle text-red-500 hover:bg-red-500 hover:text-white" title="Excluir"><Trash2 size={16} /></div>
                                    </div>
                                </div>

                                <div className="bio-card-stats">
                                    <div className="stat-item">
                                        <span className="stat-value">{item.clicks || 0}</span>
                                        <span className="stat-label">Acessos</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{item.buttons?.length || 0}</span>
                                        <span className="stat-label">Botões</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">PRO</span>
                                        <span className="stat-label">Status</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="crm-container" style={{ padding: '20px 40px' }}>
            <style>{`
                .creator-main-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 30px;
                    margin-top: 30px;
                }
                .editor-column {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .preview-unique {
                    position: sticky;
                    top: 20px;
                    height: fit-content;
                }
                .phone-mockup-side {
                    width: 340px;
                    height: 680px;
                    background: #000;
                    border-radius: 45px;
                    border: 8px solid #1a1a1a;
                    position: relative;
                    margin: 0 auto;
                    overflow: hidden;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.8);
                }
                .phone-preview-v2 {
                    width: 100%;
                    height: 100%;
                    background: #0d0d0d;
                    overflow-y: auto;
                    padding: 40px 20px;
                    text-align: center;
                }
                .bio-avatar-ring {
                    width: 100px;
                    height: 100px;
                    border-radius: 35px;
                    padding: 4px;
                    background: linear-gradient(45deg, #acf800, #00f2fe);
                    margin: 0 auto 20px;
                }
                .bio-avatar-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 32px;
                    object-fit: cover;
                    background: #222;
                }
                .preview-title {
                    font-size: 24px;
                    font-weight: 900;
                    margin-bottom: 8px;
                    color: #fff;
                }
                .preview-btn-v2 {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 16px;
                    border-radius: 18px;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    color: #fff;
                    font-weight: 800;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .preview-btn-v2.primary {
                    background: #acf800;
                    color: #000;
                    border: none;
                    box-shadow: 0 10px 20px rgba(172, 248, 0, 0.2);
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                    font-weight: 900;
                    font-size: 10px;
                    letter-spacing: 2px;
                    color: rgba(255,255,255,0.3);
                    text-transform: uppercase;
                }
                .btn-supreme {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 15px;
                    font-weight: 900;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .btn-supreme:hover:not(:disabled) {
                    background: var(--primary-color);
                    color: black;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(172, 248, 0, 0.2);
                }
                .btn-supreme:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Wizard Styles */
                .wizard-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(20px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .wizard-card {
                    width: 100%;
                    max-width: 1000px;
                    background: #0d0d0d;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 40px;
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    overflow: hidden;
                    box-shadow: 0 50px 100px rgba(0,0,0,0.5);
                }
                .wizard-content {
                    padding: 60px;
                    border-right: 1px solid rgba(255,255,255,0.05);
                }
                .wizard-preview-pane {
                    background: #121212;
                    padding: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .wa-mockup {
                    width: 320px;
                    background: #0b141a;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                }
                .wa-header {
                    background: #202c33;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .wa-avatar {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background: #6a7175;
                }
                .wa-name { color: #e9edef; font-weight: 500; font-size: 14px; }
                .wa-status { color: #8696a0; font-size: 11px; }
                .wa-chat-area {
                    padding: 20px;
                    background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
                    background-size: contain;
                    min-height: 300px;
                }
                .wa-bubble {
                    background: #005c4b;
                    color: #e9edef;
                    padding: 0;
                    border-radius: 0 10px 10px 10px;
                    max-width: 90%;
                    font-size: 13.5px;
                    line-height: 1.4;
                    position: relative;
                    box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
                    overflow: hidden;
                }
                .wa-preview-hero {
                    width: 100%;
                    height: 180px;
                    background: #1f2937;
                    object-fit: cover;
                }
                .wa-preview-body {
                    padding: 15px;
                    background: #182229;
                }
                .wa-preview-site {
                    color: #8696a0;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 4px;
                }
                .wa-preview-title {
                    color: white;
                    font-size: 15px;
                    font-weight: 700;
                    line-height: 1.3;
                }
                .wa-action-button {
                    background: #202c33;
                    margin-top: 10px;
                    padding: 12px;
                    border-radius: 12px;
                    text-align: center;
                    color: #53bdeb;
                    font-weight: 700;
                    font-size: 14px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .wa-action-button:hover { background: #2a3942; }
                .wizard-title {
                    font-size: 3.5rem;
                    font-weight: 950;
                    letter-spacing: -4px;
                    line-height: 0.9;
                    margin-bottom: 20px;
                }
                .step-label {
                    font-size: 10px;
                    font-weight: 900;
                    color: var(--primary-color);
                    text-transform: uppercase;
                    letter-spacing: 4px;
                    margin-bottom: 15px;
                    display: block;
                }
            `}</style>

            <header className="crm-header-premium">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('dashboard')} className="btn-action-circle">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <span className="crm-badge-small">
                            <Smartphone size={12} fill="currentColor" /> SMART BIO CREATOR
                        </span>
                        <h1 className="crm-main-title">{bio.id ? 'Editar Smart Bio' : 'Criar Nova Bio'}</h1>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={handleSave} disabled={isSaving} className="btn-supreme" style={{ background: '#acf800', color: '#000' }}>
                        <Save size={18} /> {isSaving ? 'Salvando...' : 'SALVAR E PUBLICAR'}
                    </button>
                </div>
            </header>

            <div className="creator-main-wrapper">
                <div className="editor-column">
                    <div className="crm-section-card">
                        <div className="section-header"><LinkIcon size={16} /> ENDEREÇO DA BIO</div>
                        <div className="supreme-field-box">
                            <label className="field-label">LINK PERSONALIZADO (SLUG)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-white/20 font-bold">{window.location.host}/bio/</span>
                                <input className="field-input" type="text" value={bio.slug} onChange={(e) => setBio({ ...bio, slug: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="crm-section-card">
                        <div className="section-header"><Layout size={16} /> IDENTIDADE VISUAL</div>
                        <div className="input-grid-2 mb-5">
                            <div className="supreme-field-box">
                                <label className="field-label">TÍTULO DA PÁGINA</label>
                                <input className="field-input" type="text" value={bio.title} onChange={(e) => setBio({ ...bio, title: e.target.value })} />
                            </div>
                            <div className="supreme-field-box">
                                <label className="field-label">URL DO AVATAR</label>
                                <input className="field-input" type="text" value={bio.avatar_url} onChange={(e) => setBio({ ...bio, avatar_url: e.target.value })} />
                            </div>
                        </div>
                        <div className="supreme-field-box">
                            <label className="field-label">BIO / DESCRIÇÃO</label>
                            <textarea className="field-input" rows={2} value={bio.description} onChange={(e) => setBio({ ...bio, description: e.target.value })} />
                        </div>
                    </div>

                    <div className="crm-section-card">
                        <div className="flex justify-between items-center mb-6">
                            <div className="section-header mb-0"><MousePointer2 size={16} /> BOTÕES DE AÇÃO</div>
                            <button onClick={addButton} className="btn-supreme flex items-center gap-2" style={{ padding: '12px 24px', background: 'var(--primary-color)', color: 'black', borderRadius: '14px', fontWeight: '900' }}>
                                <Plus size={20} /> ADICIONAR LINK +
                            </button>
                        </div>
                        
                        {bio.buttons.map((btn: any, index: number) => (
                            <div key={index} className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-4">
                                <div className="input-grid-2 mb-4">
                                    <div className="supreme-field-box">
                                        <label className="field-label flex items-center gap-2">
                                            TEXTO {btn.type === 'preview' && <span className="bg-primary-color/20 text-primary-color px-2 py-0.5 rounded text-[7px]">DISPARA WIZARD</span>}
                                        </label>
                                        <input className="field-input" type="text" value={btn.label} onChange={(e) => updateButton(index, 'label', e.target.value)} />
                                    </div>
                                    <div className="supreme-field-box">
                                        <label className="field-label">URL</label>
                                        <input className="field-input" type="text" value={btn.url} onChange={(e) => updateButton(index, 'url', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <select 
                                        className="bg-transparent text-[10px] font-black text-white/40 outline-none uppercase tracking-widest cursor-pointer"
                                        value={btn.type}
                                        onChange={(e) => updateButton(index, 'type', e.target.value)}
                                    >
                                        <option value="link" className="bg-[#0d0d0d]">Link Padrão</option>
                                        <option value="whatsapp" className="bg-[#0d0d0d]">WhatsApp</option>
                                        <option value="preview" className="bg-[#0d0d0d]">Preview Wizard</option>
                                    </select>
                                    <button onClick={() => removeButton(index)} className="text-red-500 font-bold text-[9px] uppercase flex items-center gap-2">
                                        <Trash2 size={14} /> REMOVER
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="preview-unique">
                    <div className="phone-mockup-side">
                        <div className="phone-preview-v2 no-scrollbar">
                            <div className="bio-avatar-ring">
                                {bio.avatar_url ? (
                                    <img src={bio.avatar_url} className="bio-avatar-img" alt="Avatar" />
                                ) : (
                                    <User size={40} className="text-white/20 mt-6 mx-auto" />
                                )}
                            </div>
                            <h2 className="preview-title">{bio.title}</h2>
                            <p className="text-white/40 text-[10px] mb-8 px-4">{bio.description}</p>
                            
                            {bio.buttons.map((btn: any, i: number) => (
                                <div key={i} className={`preview-btn-v2 ${i === 0 ? 'primary' : ''}`}>
                                    {btn.type === 'whatsapp' ? <MessageSquare size={16} /> : <ExternalLink size={16} />}
                                    {btn.label}
                                </div>
                            ))}

                            <div className="mt-12 flex flex-col items-center gap-4 opacity-20">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} fill="currentColor" className="text-primary-color" />
                                    <span className="text-[10px] font-black tracking-widest uppercase">Powered by Plug & Sales</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartBioCreator;
