import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { 
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
    ExternalLink,
    Eye,
    Copy,
    Share2,
    Search,
    BarChart3,
    ArrowUpRight,
    Loader2,
    Globe,
    Settings2,
    Palette
} from 'lucide-react';

const SmartBioCreator = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
    const [bios, setBios] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const initialBioState = {
        id: undefined,
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
    };

    const [bio, setBio] = useState<any>(initialBioState);

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
        setBio({
            ...item,
            buttons: typeof item.buttons === 'string' ? JSON.parse(item.buttons) : item.buttons,
            images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images
        });
        setView('editor');
    };

    const handleCreateNew = () => {
        setBio({
            ...initialBioState,
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
            const payload = { 
                ...bio, 
                user_id: user.id 
            };
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
            alert('Erro crítico ao salvar. Verifique o console.');
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
            <div className="crm-container supreme-dashboard">
                <style>{`
                    .supreme-dashboard {
                        padding: 60px;
                        background: radial-gradient(circle at 50% -20%, rgba(172, 248, 0, 0.05), transparent 70%);
                        min-height: 100vh;
                    }
                    .dash-header-supreme {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        margin-bottom: 60px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        padding-bottom: 30px;
                    }
                    .supreme-title {
                        font-size: 4rem;
                        font-weight: 950;
                        letter-spacing: -4px;
                        line-height: 0.85;
                        margin-top: 10px;
                        background: linear-gradient(to bottom, #fff, rgba(255,255,255,0.4));
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .bio-grid-supreme {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                        gap: 30px;
                    }
                    .bio-card-supreme {
                        background: rgba(13, 13, 13, 0.6);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.03);
                        border-radius: 35px;
                        padding: 35px;
                        transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }
                    .bio-card-supreme:hover {
                        border-color: rgba(172, 248, 0, 0.3);
                        transform: translateY(-10px);
                        box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 20px rgba(172, 248, 0, 0.1);
                    }
                    .bio-card-supreme::before {
                        content: '';
                        position: absolute;
                        top: 0; left: 0; right: 0; height: 1px;
                        background: linear-gradient(90deg, transparent, rgba(172, 248, 0, 0.2), transparent);
                        opacity: 0;
                        transition: opacity 0.3s;
                    }
                    .bio-card-supreme:hover::before { opacity: 1; }

                    .card-avatar-supreme {
                        width: 70px;
                        height: 70px;
                        border-radius: 22px;
                        object-fit: cover;
                        background: #1a1a1a;
                        border: 1px solid rgba(255,255,255,0.1);
                    }
                    .card-badge-slug {
                        background: rgba(172, 248, 0, 0.1);
                        color: #acf800;
                        font-size: 10px;
                        font-weight: 900;
                        padding: 6px 12px;
                        border-radius: 10px;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                    }
                    .supreme-stats {
                        display: flex;
                        gap: 30px;
                        margin: 30px 0;
                        background: rgba(255, 255, 255, 0.02);
                        padding: 20px;
                        border-radius: 20px;
                        border: 1px solid rgba(255, 255, 255, 0.03);
                    }
                    .stat-block {
                        display: flex;
                        flex-direction: column;
                    }
                    .stat-val { font-size: 24px; font-weight: 950; color: #fff; line-height: 1; }
                    .stat-lab { font-size: 8px; font-weight: 900; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }

                    .action-row-supreme {
                        display: flex;
                        gap: 12px;
                        margin-top: auto;
                    }
                    .btn-circle-supreme {
                        flex: 1;
                        height: 50px;
                        border-radius: 18px;
                        background: rgba(255, 255, 255, 0.03);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: rgba(255, 255, 255, 0.6);
                        transition: all 0.3s;
                        border: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    .btn-circle-supreme:hover {
                        background: #fff;
                        color: #000;
                        border-color: #fff;
                        transform: scale(1.05);
                    }
                    .btn-circle-supreme.delete:hover {
                        background: #ff3b3b;
                        color: #fff;
                        border-color: #ff3b3b;
                    }
                    .btn-create-supreme {
                        background: #acf800;
                        color: #000;
                        padding: 20px 40px;
                        border-radius: 20px;
                        font-weight: 950;
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        box-shadow: 0 20px 40px rgba(172, 248, 0, 0.2);
                        transition: all 0.3s;
                    }
                    .btn-create-supreme:hover {
                        transform: translateY(-5px) scale(1.02);
                        box-shadow: 0 30px 60px rgba(172, 248, 0, 0.3);
                    }
                `}</style>

                <header className="dash-header-supreme">
                    <div>
                        <span className="text-[#acf800] font-black text-xs tracking-[5px] uppercase block mb-2">Smart Bio Engine</span>
                        <h1 className="supreme-title">Comando Central</h1>
                    </div>
                    <button onClick={handleCreateNew} className="btn-create-supreme">
                        <Plus size={24} strokeWidth={3} /> NOVA PÁGINA BIO
                    </button>
                </header>

                {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loader2 size={60} className="animate-spin text-primary-color opacity-20" />
                    </div>
                ) : bios.length === 0 ? (
                    <div className="text-center py-40 bg-white/[0.01] rounded-[50px] border border-white/5 border-dashed">
                        <div className="w-24 h-24 bg-primary-color/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary-color/20">
                            <Smartphone size={40} className="text-primary-color" />
                        </div>
                        <h2 className="text-3xl font-black mb-4">Inicie sua Frota Digital</h2>
                        <p className="text-white/30 max-w-sm mx-auto mb-10 font-bold">Crie páginas de conversão de alta performance para cada um de seus produtos ou vendedores.</p>
                        <button onClick={handleCreateNew} className="btn-create-supreme mx-auto">
                            CRIAR MINHA PRIMEIRA BIO
                        </button>
                    </div>
                ) : (
                    <div className="bio-grid-supreme">
                        {bios.map((item) => (
                            <div key={item.id} className="bio-card-supreme">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <img src={item.avatar_url || 'https://via.placeholder.com/150'} className="card-avatar-supreme" alt="" />
                                        <div className="pt-2">
                                            <h3 className="text-xl font-black text-white truncate w-40">{item.title}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Globe size={10} className="text-[#acf800]" />
                                                <span className="card-badge-slug">{item.slug}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-primary-color/10 p-3 rounded-2xl border border-primary-color/20">
                                        <ArrowUpRight size={20} className="text-primary-color" />
                                    </div>
                                </div>

                                <div className="supreme-stats">
                                    <div className="stat-block">
                                        <span className="stat-val">{item.clicks || 0}</span>
                                        <span className="stat-lab">Acessos</span>
                                    </div>
                                    <div className="stat-block border-l border-white/10 pl-8">
                                        <span className="stat-val">{typeof item.buttons === 'string' ? JSON.parse(item.buttons).length : item.buttons?.length || 0}</span>
                                        <span className="stat-lab">Links</span>
                                    </div>
                                    <div className="stat-block border-l border-white/10 pl-8">
                                        <span className="stat-val">SUPREME</span>
                                        <span className="stat-lab">Plano</span>
                                    </div>
                                </div>

                                <div className="action-row-supreme">
                                    <button onClick={() => handleEdit(item)} className="btn-circle-supreme" title="Editar Estrutura">
                                        <Settings2 size={20} />
                                    </button>
                                    <button onClick={() => copyToClipboard(item.slug)} className="btn-circle-supreme" title="Copiar URL">
                                        <Copy size={20} />
                                    </button>
                                    <button onClick={() => window.open(`${window.location.origin}/bio/${item.slug}`, '_blank')} className="btn-circle-supreme" title="Visualizar Ao Vivo">
                                        <Eye size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="btn-circle-supreme delete" title="Excluir">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="crm-container supreme-editor">
            <style>{`
                .supreme-editor {
                    padding: 40px;
                    background: #020202;
                    min-height: 100vh;
                }
                .editor-nav-supreme {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }
                .editor-main-supreme {
                    display: grid;
                    grid-template-columns: 1fr 420px;
                    gap: 40px;
                }
                .supreme-glass-panel {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 40px;
                    padding: 40px;
                    margin-bottom: 30px;
                    position: relative;
                    overflow: hidden;
                }
                .supreme-glass-panel::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                }
                .supreme-section-label {
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 5px;
                    color: #acf800;
                    text-transform: uppercase;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .supreme-section-label::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: rgba(172, 248, 0, 0.2);
                }

                .supreme-input-group {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 25px;
                }
                .supreme-input-box {
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 15px 25px;
                    transition: all 0.3s;
                }
                .supreme-input-box:focus-within {
                    border-color: #acf800;
                    background: rgba(172, 248, 0, 0.02);
                }
                .input-label-supreme {
                    font-size: 9px;
                    font-weight: 900;
                    color: rgba(255,255,255,0.2);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 5px;
                    display: block;
                }
                .input-supreme {
                    background: transparent;
                    border: none;
                    color: #fff;
                    width: 100%;
                    font-size: 16px;
                    font-weight: 700;
                    outline: none;
                }
                .input-supreme::placeholder { color: rgba(255,255,255,0.1); }

                .btn-add-link-supreme {
                    width: 100%;
                    background: #acf800;
                    color: #000;
                    padding: 20px;
                    border-radius: 20px;
                    font-weight: 950;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 20px;
                    box-shadow: 0 10px 30px rgba(172, 248, 0, 0.1);
                }
                .link-item-supreme {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 25px;
                    padding: 25px;
                    margin-bottom: 15px;
                    transition: all 0.3s;
                }
                .link-item-supreme:hover {
                    border-color: rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.03);
                }

                .phone-mockup-supreme {
                    width: 360px;
                    height: 740px;
                    background: #000;
                    border: 10px solid #1a1a1a;
                    border-radius: 50px;
                    position: sticky;
                    top: 40px;
                    overflow: hidden;
                    box-shadow: 0 50px 100px rgba(0,0,0,0.8);
                }
                .phone-content-supreme {
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at 50% 0%, #1a1a1a, #000);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 60px 25px;
                    overflow-y: auto;
                }
                .preview-avatar-supreme {
                    width: 110px;
                    height: 110px;
                    border-radius: 35px;
                    border: 3px solid #acf800;
                    padding: 4px;
                    margin-bottom: 25px;
                    box-shadow: 0 15px 30px rgba(172, 248, 0, 0.2);
                }
                .preview-btn-supreme {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 18px;
                    border-radius: 20px;
                    margin-bottom: 12px;
                    color: #fff;
                    font-weight: 800;
                    font-size: 14px;
                    text-align: center;
                    transition: all 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .preview-btn-supreme.primary {
                    background: #acf800;
                    color: #000;
                    border: none;
                    box-shadow: 0 10px 20px rgba(172, 248, 0, 0.1);
                }
                .btn-save-supreme {
                    background: #acf800;
                    color: #000;
                    padding: 15px 35px;
                    border-radius: 18px;
                    font-weight: 950;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s;
                }
                .btn-save-supreme:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(172, 248, 0, 0.2);
                }
                .btn-save-supreme:disabled { opacity: 0.5; }
            `}</style>

            <nav className="editor-nav-supreme">
                <div className="flex items-center gap-6">
                    <button onClick={() => setView('dashboard')} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black tracking-[4px] text-white/30 uppercase">Editor de Performance</span>
                        <h1 className="text-3xl font-black text-white">{bio.id ? 'Refinar Bio' : 'Esculpir Nova Bio'}</h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleSave} disabled={isSaving} className="btn-save-supreme">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isSaving ? 'PROCESSANDO...' : 'SALVAR E PUBLICAR'}
                    </button>
                </div>
            </nav>

            <main className="editor-main-supreme">
                <div className="editor-controls-supreme">
                    <div className="supreme-glass-panel">
                        <div className="supreme-section-label"><Globe size={14} /> Endereço Digital</div>
                        <div className="supreme-input-box">
                            <span className="input-label-supreme">Link Personalizado</span>
                            <div className="flex items-center gap-2">
                                <span className="text-white/20 font-black text-sm">{window.location.host}/bio/</span>
                                <input 
                                    className="input-supreme" 
                                    placeholder="ex: meu-nome"
                                    value={bio.slug} 
                                    onChange={(e) => setBio({ ...bio, slug: e.target.value })} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="supreme-glass-panel">
                        <div className="supreme-section-label"><Palette size={14} /> Identidade Visual</div>
                        <div className="supreme-input-group">
                            <div className="supreme-input-box">
                                <span className="input-label-supreme">Nome em Destaque</span>
                                <input 
                                    className="input-supreme" 
                                    value={bio.title} 
                                    onChange={(e) => setBio({ ...bio, title: e.target.value })} 
                                />
                            </div>
                            <div className="supreme-input-box">
                                <span className="input-label-supreme">URL do Avatar</span>
                                <input 
                                    className="input-supreme" 
                                    placeholder="https://..."
                                    value={bio.avatar_url} 
                                    onChange={(e) => setBio({ ...bio, avatar_url: e.target.value })} 
                                />
                            </div>
                        </div>
                        <div className="supreme-input-box">
                            <span className="input-label-supreme">Descrição Estratégica</span>
                            <textarea 
                                className="input-supreme py-2" 
                                rows={2}
                                value={bio.description} 
                                onChange={(e) => setBio({ ...bio, description: e.target.value })} 
                            />
                        </div>
                    </div>

                    <div className="supreme-glass-panel">
                        <div className="flex justify-between items-center mb-10">
                            <div className="supreme-section-label mb-0"><LinkIcon size={14} /> Links de Conversão</div>
                        </div>
                        
                        {bio.buttons.map((btn: any, index: number) => (
                            <div key={index} className="link-item-supreme">
                                <div className="supreme-input-group mb-4">
                                    <div className="supreme-input-box">
                                        <span className="input-label-supreme">Título do Botão</span>
                                        <input className="input-supreme" value={btn.label} onChange={(e) => updateButton(index, 'label', e.target.value)} />
                                    </div>
                                    <div className="supreme-input-box">
                                        <span className="input-label-supreme">URL / Destino</span>
                                        <input className="input-supreme" value={btn.url} onChange={(e) => updateButton(index, 'url', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <select 
                                        className="bg-transparent text-[10px] font-black text-[#acf800] outline-none uppercase tracking-widest cursor-pointer"
                                        value={btn.type}
                                        onChange={(e) => updateButton(index, 'type', e.target.value)}
                                    >
                                        <option value="link" className="bg-[#0d0d0d]">Link Externo</option>
                                        <option value="whatsapp" className="bg-[#0d0d0d]">WhatsApp Direct</option>
                                        <option value="preview" className="bg-[#0d0d0d]">Wizard Preview</option>
                                    </select>
                                    <button onClick={() => removeButton(index)} className="text-red-500/50 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button onClick={addButton} className="btn-add-link-supreme">
                            <Plus size={20} strokeWidth={3} /> ADICIONAR NOVO LINK
                        </button>
                    </div>
                </div>

                <aside className="preview-column-supreme">
                    <div className="phone-mockup-supreme">
                        <div className="phone-content-supreme no-scrollbar">
                            <div className="preview-avatar-supreme">
                                {bio.avatar_url ? (
                                    <img src={bio.avatar_url} className="w-full h-full rounded-[28px] object-cover bg-white/5" alt="" />
                                ) : (
                                    <div className="w-full h-full rounded-[28px] bg-white/5 flex items-center justify-center">
                                        <User size={40} className="text-white/10" />
                                    </div>
                                )}
                            </div>
                            <h2 className="text-2xl font-black text-white text-center mb-2 leading-tight">{bio.title}</h2>
                            <p className="text-white/30 text-[11px] font-bold text-center mb-10 px-6 leading-relaxed uppercase tracking-wider">{bio.description}</p>
                            
                            <div className="w-full space-y-3">
                                {bio.buttons.map((btn: any, i: number) => (
                                    <div key={i} className={`preview-btn-supreme ${i === 0 ? 'primary' : ''}`}>
                                        {btn.label || 'Título do Botão'}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto pt-10 flex flex-col items-center gap-4 opacity-10">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} fill="currentColor" className="text-primary-color" />
                                    <span className="text-[9px] font-black tracking-[3px] uppercase">Plug & Sales Supreme</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default SmartBioCreator;
