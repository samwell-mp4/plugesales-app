import React, { useState, useEffect } from 'react';
import { 
    Smartphone, 
    Link as LinkIcon, 
    Plus, 
    Trash2, 
    Save, 
    Eye, 
    Video, 
    Image as ImageIcon,
    Layout,
    Type,
    MousePointer2,
    BarChart3,
    Zap
} from 'lucide-react';

const SmartBioCreator = () => {
    const [bio, setBio] = useState({
        title: 'Seu Nome ou Empresa',
        description: 'Breve descrição sobre o que você faz ou oferece.',
        avatar_url: '',
        video_url: '',
        buttons: [{ label: 'WhatsApp', url: '', type: 'whatsapp' }],
        images: [],
        slug: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const addButton = () => {
        setBio(prev => ({ ...prev, buttons: [...prev.buttons, { label: 'Novo Botão', url: '', type: 'link' }] }));
    };

    const removeButton = (index: number) => {
        setBio(prev => ({ ...prev, buttons: prev.buttons.filter((_, i) => i !== index) }));
    };

    const updateButton = (index: number, field: string, value: string) => {
        const newButtons = [...bio.buttons];
        (newButtons[index] as any)[field] = value;
        setBio(prev => ({ ...prev, buttons: newButtons }));
    };

    const handleSave = async () => {
        if (!bio.slug) return alert('Defina um link personalizado (slug)');
        setIsSaving(true);
        try {
            const res = await fetch('/api/smart-bio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bio)
            });
            if (res.ok) alert('Smart Bio salva com sucesso!');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="crm-container" style={{ padding: '40px' }}>
            <style>{`
                .preview-phone {
                    width: 375px;
                    height: 750px;
                    background: #000;
                    border: 12px solid #1a1a1a;
                    border-radius: 50px;
                    overflow: hidden;
                    position: sticky;
                    top: 40px;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
                }
                .editor-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 32px;
                    padding: 40px;
                }
                .input-group { margin-bottom: 24px; }
                .input-group label { display: block; font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.3); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                .bio-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px 20px; color: white; font-weight: 600; outline: none; transition: all 0.2s; }
                .bio-input:focus { border-color: var(--primary-color); background: rgba(255,255,255,0.05); }
                .btn-editor-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px; margin-bottom: 12px; }
            `}</style>

            <div className="flex gap-10">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-white mb-2">SMART BIO</h1>
                            <p className="text-white/40 text-sm font-bold tracking-widest uppercase">Páginas de conversão de alta performance</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => window.open(`/bio/${bio.slug}`, '_blank')} className="px-6 py-4 bg-white/5 rounded-2xl text-white font-black hover:bg-white/10 transition-all flex items-center gap-2">
                                <Eye size={18} /> PREVIEW
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="px-8 py-4 bg-primary-color rounded-2xl text-black font-black hover:opacity-80 transition-all flex items-center gap-2">
                                <Save size={18} /> {isSaving ? 'SALVANDO...' : 'SALVAR PÁGINA'}
                            </button>
                        </div>
                    </div>

                    <div className="editor-card">
                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div className="input-group">
                                <label><Type size={14} className="inline mr-2" /> Link Personalizado (Slug)</label>
                                <div className="flex items-center bg-white/5 rounded-16 overflow-hidden border border-white/10">
                                    <span className="px-4 text-white/30 font-bold text-sm">plugsales.com/bio/</span>
                                    <input type="text" value={bio.slug} onChange={(e) => setBio({ ...bio, slug: e.target.value })} className="bg-transparent border-none outline-none py-4 text-white font-bold flex-1" placeholder="meu-link" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label><Layout size={14} className="inline mr-2" /> Título da Página</label>
                                <input type="text" value={bio.title} onChange={(e) => setBio({ ...bio, title: e.target.value })} className="bio-input" />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Descrição / Bio</label>
                            <textarea rows={3} value={bio.description} onChange={(e) => setBio({ ...bio, description: e.target.value })} className="bio-input" />
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div className="input-group">
                                <label><Video size={14} className="inline mr-2" /> URL do Vídeo (YouTube/Vimeo)</label>
                                <input type="text" value={bio.video_url} onChange={(e) => setBio({ ...bio, video_url: e.target.value })} className="bio-input" placeholder="https://..." />
                            </div>
                            <div className="input-group">
                                <label><ImageIcon size={14} className="inline mr-2" /> URL do Avatar / Foto</label>
                                <input type="text" value={bio.avatar_url} onChange={(e) => setBio({ ...bio, avatar_url: e.target.value })} className="bio-input" placeholder="https://..." />
                            </div>
                        </div>

                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-white font-black tracking-tight flex items-center gap-2"><MousePointer2 size={20} className="text-primary-color" /> BOTÕES E LINKS</h3>
                                <button onClick={addButton} className="p-2 bg-primary-color/10 text-primary-color rounded-xl hover:bg-primary-color hover:text-black transition-all">
                                    <Plus size={20} />
                                </button>
                            </div>
                            {bio.buttons.map((btn, index) => (
                                <div key={index} className="btn-editor-item flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-white/20 mb-2 block uppercase">Texto do Botão</label>
                                        <input type="text" value={btn.label} onChange={(e) => updateButton(index, 'label', e.target.value)} className="bio-input py-3" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-white/20 mb-2 block uppercase">Link / URL</label>
                                        <input type="text" value={btn.url} onChange={(e) => updateButton(index, 'url', e.target.value)} className="bio-input py-3" />
                                    </div>
                                    <button onClick={() => removeButton(index)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hidden xl:block">
                    <div className="preview-phone">
                        <div className="h-full overflow-y-auto no-scrollbar bg-gradient-to-b from-[#0a0a0a] to-[#121212] p-8 text-center">
                            <div className="w-24 h-24 rounded-full bg-white/10 mx-auto mb-6 border-2 border-primary-color overflow-hidden">
                                {bio.avatar_url && <img src={bio.avatar_url} className="w-full h-full object-cover" />}
                            </div>
                            <h2 className="text-white font-black text-xl mb-2">{bio.title}</h2>
                            <p className="text-white/40 text-sm mb-8 leading-relaxed">{bio.description}</p>

                            {bio.video_url && (
                                <div className="w-full aspect-video bg-white/5 rounded-2xl mb-8 overflow-hidden flex items-center justify-center">
                                    <Video size={32} className="text-white/20" />
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                {bio.buttons.map((btn, i) => (
                                    <div key={i} className="w-full py-5 bg-white text-black font-black rounded-2xl text-sm tracking-tight shadow-xl">
                                        {btn.label}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-20 pt-10 border-t border-white/5">
                                <div className="flex items-center justify-center gap-2 opacity-30">
                                    <Zap size={14} fill="currentColor" />
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
