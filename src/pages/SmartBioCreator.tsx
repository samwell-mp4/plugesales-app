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
    Palette,
    AlertCircle
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
    }, [user?.id, view]);

    const loadBios = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getSmartBio(user!.id!);
            if (data && Array.isArray(data)) {
                setBios(data);
            } else {
                setBios([]);
            }
        } catch (err) {
            console.error('Error loading bios:', err);
            setBios([]);
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
                alert('🚀 Smart Bio salva com sucesso!');
                setView('dashboard');
                // loadBios is triggered by useEffect on view change
            } else {
                alert('❌ Erro ao salvar: ' + (res?.error || 'Slug já existe ou erro interno'));
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('❌ Erro crítico ao conectar com o servidor.');
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (slug: string) => {
        const url = `${window.location.origin}/bio/${slug}`;
        navigator.clipboard.writeText(url);
        alert('Link copiado para a área de transferência!');
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

    return (
        <div className="supreme-creator-scope">
            <style>{`
                .supreme-creator-scope {
                    --supreme-primary: #acf800;
                    --supreme-bg: #020202;
                    --supreme-card: rgba(15, 15, 15, 0.7);
                    --supreme-border: rgba(255, 255, 255, 0.05);
                }

                .supreme-creator-scope .crm-container {
                    background: var(--supreme-bg);
                    min-height: calc(100vh - 80px);
                    color: white;
                    padding: 40px;
                }

                .supreme-creator-scope .supreme-dashboard {
                    background: radial-gradient(circle at 50% -20%, rgba(172, 248, 0, 0.05), transparent 70%);
                }

                .supreme-creator-scope .supreme-title {
                    font-size: 3.5rem;
                    font-weight: 950;
                    letter-spacing: -3px;
                    line-height: 0.9;
                    background: linear-gradient(to bottom, #fff, rgba(255,255,255,0.4));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .supreme-creator-scope .bio-card-supreme {
                    background: var(--supreme-card);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--supreme-border);
                    border-radius: 30px;
                    padding: 30px;
                    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                }

                .supreme-creator-scope .bio-card-supreme:hover {
                    border-color: rgba(172, 248, 0, 0.3);
                    transform: translateY(-10px);
                    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
                }

                .supreme-creator-scope .btn-create-supreme {
                    background: var(--supreme-primary);
                    color: #000;
                    padding: 18px 35px;
                    border-radius: 20px;
                    font-weight: 950;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 20px 40px rgba(172, 248, 0, 0.2);
                    transition: all 0.3s;
                }

                .supreme-creator-scope .supreme-glass-panel {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--supreme-border);
                    border-radius: 35px;
                    padding: 35px;
                    margin-bottom: 25px;
                }

                .supreme-creator-scope .phone-mockup-supreme {
                    width: 320px;
                    height: 660px;
                    background: #000;
                    border: 8px solid #1a1a1a;
                    border-radius: 45px;
                    position: sticky;
                    top: 40px;
                    overflow: hidden;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.8);
                }

                .supreme-creator-scope .supreme-input-box {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid var(--supreme-border);
                    border-radius: 18px;
                    padding: 15px 20px;
                    transition: all 0.3s;
                }

                .supreme-creator-scope .supreme-input-box:focus-within {
                    border-color: var(--supreme-primary);
                }

                .supreme-creator-scope .stat-block {
                    display: flex;
                    flex-direction: column;
                }

                .supreme-creator-scope .btn-circle-supreme {
                    flex: 1;
                    height: 45px;
                    border-radius: 15px;
                    background: rgba(255, 255, 255, 0.03);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.5);
                    transition: all 0.2s;
                    border: 1px solid var(--supreme-border);
                }

                .supreme-creator-scope .btn-circle-supreme:hover {
                    background: #fff;
                    color: #000;
                }
                
                .supreme-creator-scope .btn-circle-supreme.delete:hover {
                    background: #ff4757;
                    color: #fff;
                }
            `}</style>

            {view === 'dashboard' ? (
                <div className="crm-container supreme-dashboard">
                    <header className="flex justify-between items-end mb-16 pb-10 border-b border-white/5">
                        <div>
                            <span className="text-[#acf800] font-black text-[10px] tracking-[5px] uppercase block mb-3">Comando Central</span>
                            <h1 className="supreme-title">Minhas Bios</h1>
                        </div>
                        <button onClick={handleCreateNew} className="btn-create-supreme">
                            <Plus size={22} strokeWidth={3} /> NOVA BIO
                        </button>
                    </header>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 size={48} className="animate-spin text-[#acf800] opacity-20" />
                        </div>
                    ) : bios.length === 0 ? (
                        <div className="text-center py-32 bg-white/[0.01] rounded-[40px] border border-white/5 border-dashed">
                            <Smartphone size={48} className="text-white/10 mx-auto mb-6" />
                            <h2 className="text-2xl font-black mb-3">Nenhuma Bio Ativa</h2>
                            <p className="text-white/30 max-w-xs mx-auto mb-10 font-bold uppercase text-[10px] tracking-widest">Sua frota digital está pronta para ser construída.</p>
                            <button onClick={handleCreateNew} className="btn-create-supreme mx-auto">
                                COMEÇAR AGORA
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {bios.map((item) => (
                                <div key={item.id} className="bio-card-supreme">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex gap-4">
                                            <img src={item.avatar_url || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-2xl object-cover border border-white/10" alt="" />
                                            <div>
                                                <h3 className="text-lg font-black text-white truncate w-40">{item.title}</h3>
                                                <span className="text-[9px] font-black text-[#acf800] bg-[#acf800]/10 px-3 py-1 rounded-full mt-2 inline-block uppercase">/{item.slug}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8 bg-black/30 p-5 rounded-2xl border border-white/5">
                                        <div className="stat-block">
                                            <span className="text-2xl font-black text-white">{item.clicks || 0}</span>
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Cliques</span>
                                        </div>
                                        <div className="stat-block border-l border-white/5 pl-6">
                                            <span className="text-2xl font-black text-white">SUPREME</span>
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Status</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <button onClick={() => handleEdit(item)} className="btn-circle-supreme" title="Editar"><Settings2 size={18} /></button>
                                        <button onClick={() => copyToClipboard(item.slug)} className="btn-circle-supreme" title="Copiar"><Copy size={18} /></button>
                                        <button onClick={() => window.open(`${window.location.origin}/bio/${item.slug}`, '_blank')} className="btn-circle-supreme" title="Ver"><Eye size={18} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="btn-circle-supreme delete" title="Excluir"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="crm-container">
                    <nav className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-5">
                            <button onClick={() => setView('dashboard')} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl font-black text-white tracking-tighter">{bio.id ? 'Refinar Bio' : 'Esculpir Bio'}</h1>
                        </div>
                        <button onClick={handleSave} disabled={isSaving} className="btn-create-supreme" style={{ padding: '15px 35px' }}>
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isSaving ? 'SALVANDO...' : 'PUBLICAR'}
                        </button>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                        <div className="space-y-6">
                            <div className="supreme-glass-panel">
                                <span className="text-[10px] font-black tracking-[4px] text-[#acf800] uppercase mb-8 block">1. Endereço e Slug</span>
                                <div className="supreme-input-box">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-2">Slug Personalizado</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/20 font-black text-xs">{window.location.host}/bio/</span>
                                        <input className="bg-transparent border-none outline-none text-white font-bold w-full" value={bio.slug} onChange={(e) => setBio({ ...bio, slug: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="supreme-glass-panel">
                                <span className="text-[10px] font-black tracking-[4px] text-[#acf800] uppercase mb-8 block">2. Identidade Visual</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="supreme-input-box">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-2">Título da Bio</span>
                                        <input className="bg-transparent border-none outline-none text-white font-bold w-full" value={bio.title} onChange={(e) => setBio({ ...bio, title: e.target.value })} />
                                    </div>
                                    <div className="supreme-input-box">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-2">URL do Avatar</span>
                                        <input className="bg-transparent border-none outline-none text-white font-bold w-full" value={bio.avatar_url} onChange={(e) => setBio({ ...bio, avatar_url: e.target.value })} />
                                    </div>
                                </div>
                                <div className="supreme-input-box">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-2">Descrição Bio</span>
                                    <textarea className="bg-transparent border-none outline-none text-white font-bold w-full py-2 resize-none" rows={2} value={bio.description} onChange={(e) => setBio({ ...bio, description: e.target.value })} />
                                </div>
                            </div>

                            <div className="supreme-glass-panel">
                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-[10px] font-black tracking-[4px] text-[#acf800] uppercase block">3. Botões de Conversão</span>
                                    <button onClick={addButton} className="text-[#acf800] font-black text-[9px] uppercase tracking-widest border border-[#acf800]/20 px-4 py-2 rounded-xl hover:bg-[#acf800]/10 transition-all">
                                        Adicionar Link +
                                    </button>
                                </div>
                                
                                {bio.buttons.map((btn: any, index: number) => (
                                    <div key={index} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl mb-4 transition-all hover:border-white/10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="supreme-input-box">
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Texto</span>
                                                <input className="bg-transparent border-none outline-none text-white font-bold w-full text-sm" value={btn.label} onChange={(e) => updateButton(index, 'label', e.target.value)} />
                                            </div>
                                            <div className="supreme-input-box">
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Destino</span>
                                                <input className="bg-transparent border-none outline-none text-white font-bold w-full text-sm" value={btn.url} onChange={(e) => updateButton(index, 'url', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center px-2">
                                            <select className="bg-transparent text-[10px] font-black text-[#acf800] outline-none uppercase tracking-widest cursor-pointer" value={btn.type} onChange={(e) => updateButton(index, 'type', e.target.value)}>
                                                <option value="link" className="bg-[#0d0d0d]">Link Externo</option>
                                                <option value="whatsapp" className="bg-[#0d0d0d]">WhatsApp Direct</option>
                                                <option value="preview" className="bg-[#0d0d0d]">Wizard Preview</option>
                                            </select>
                                            <button onClick={() => removeButton(index)} className="text-red-500/30 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <aside>
                            <div className="phone-mockup-supreme">
                                <div className="w-full h-full bg-[#0d0d0d] flex flex-col items-center py-12 px-6 overflow-y-auto no-scrollbar">
                                    <div className="w-24 h-24 rounded-[32px] border-2 border-[#acf800] p-1 mb-6 shadow-[0_10px_20px_rgba(172,248,0,0.1)]">
                                        <img src={bio.avatar_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-[28px]" alt="" />
                                    </div>
                                    <h2 className="text-xl font-black text-white mb-2">{bio.title}</h2>
                                    <p className="text-[10px] font-bold text-white/30 text-center uppercase tracking-widest mb-10 leading-relaxed px-4">{bio.description}</p>
                                    <div className="w-full space-y-3">
                                        {bio.buttons.map((b: any, i: number) => (
                                            <div key={i} className={`w-full py-4 rounded-2xl text-center font-black text-xs uppercase tracking-widest ${i === 0 ? 'bg-[#acf800] text-black shadow-[0_5px_15px_rgba(172,248,0,0.2)]' : 'bg-white/5 text-white border border-white/10'}`}>
                                                {b.label || 'Botão'}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-auto pt-10 opacity-10 flex items-center gap-2">
                                        <Zap size={12} fill="currentColor" className="text-[#acf800]" />
                                        <span className="text-[8px] font-black uppercase tracking-[3px]">Plug & Sales</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartBioCreator;
