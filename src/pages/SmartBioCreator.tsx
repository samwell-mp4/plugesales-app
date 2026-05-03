import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { 
    Plus, 
    Trash2, 
    Save, 
    Zap, 
    ArrowLeft, 
    Settings2, 
    Eye, 
    Copy, 
    Loader2, 
    Globe, 
    Instagram,
    Youtube,
    Facebook,
    Linkedin,
    Twitter,
    Upload,
    X,
    Music2,
    ChevronLeft,
    ChevronRight,
    Layout,
    Calendar,
    Clock,
    User as UserIcon,
    Mail,
    ExternalLink,
    Smartphone,
    MessageCircle,
    ImageIcon,
    Video,
    FileText,
    Send,
    CheckCircle2,
    Download
} from 'lucide-react';

const SmartBioCreator = () => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
    const [bios, setBios] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // Mobile UX State
    const [mobileStep, setMobileStep] = useState(1);
    const [mobileShowPreview, setMobileShowPreview] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
    
    // PDF Carousel State
    const [activePdfIdx, setActivePdfIdx] = useState(0);
    
    // Modal States
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [showDisparoSimulator, setShowDisparoSimulator] = useState(false);
    const [simStep, setSimStep] = useState(1);
    
    // Simulator State
    const [simData, setSimData] = useState({
        photo: '',
        name: 'Suporte Elite',
        msg: 'Olá! Conheça nosso catálogo oficial e agende sua reunião agora mesmo.',
        type: 'text', // text, image, video
        media: 'https://via.placeholder.com/600x400?text=BIO+PRO+MEDIA'
    });
    
    const initialBioState = {
        id: undefined,
        title: 'Seu Nome ou Empresa',
        description: 'Breve descrição sobre o que você faz ou oferece.',
        avatar_url: '',
        buttons: [
            { label: 'Falar no WhatsApp', url: 'https://wa.me/55...', type: 'whatsapp' }
        ],
        pdfs: [
            { label: 'Catálogo Pro', url: '#', cover: 'https://via.placeholder.com/300x400?text=BIO+PRO+CAPA' }
        ],
        socials: [
            { platform: 'instagram', url: '' }
        ],
        images: [],
        slug: '',
        show_preview_btn: true,
        show_pdfs: true,
        show_socials: true,
        show_meeting_btn: true
    };

    const [bio, setBio] = useState<any>(initialBioState);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1200);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user?.id) loadBios();
    }, [user?.id, view]);

    const loadBios = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getSmartBio(user!.id!);
            setBios(Array.isArray(data) ? data : []);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        const parsed = {
            ...item,
            buttons: typeof item.buttons === 'string' ? JSON.parse(item.buttons) : item.buttons,
            images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images,
            pdfs: typeof item.pdfs === 'string' ? JSON.parse(item.pdfs) : (item.pdfs || initialBioState.pdfs),
            socials: typeof item.socials === 'string' ? JSON.parse(item.socials) : (item.socials || initialBioState.socials),
            show_preview_btn: item.show_preview_btn !== undefined ? item.show_preview_btn : true,
            show_pdfs: item.show_pdfs !== undefined ? item.show_pdfs : true,
            show_socials: item.show_socials !== undefined ? item.show_socials : true,
            show_meeting_btn: item.show_meeting_btn !== undefined ? item.show_meeting_btn : true,
        };
        setBio(parsed);
        setView('editor');
    };

    const handleCreateNew = () => {
        setBio({ ...initialBioState, slug: 'bio-' + Math.random().toString(36).substring(7) });
        setView('editor');
    };

    const handleSave = async () => {
        if (!bio.slug) return alert('Defina um link personalizado (slug)');
        setIsSaving(true);
        try {
            const res = await dbService.saveSmartBio({ ...bio, user_id: user?.id });
            if (res && !res.error) {
                alert('🚀 BIO PRO salva com sucesso!');
                setView('dashboard');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                setBio({ ...bio, avatar_url: data.shortUrl || data.url });
            }
        } finally {
            setIsUploading(false);
        }
    };

    const addSocial = () => setBio({...bio, socials: [...bio.socials, { platform: 'instagram', url: '' }]});
    const removeSocial = (idx: number) => setBio({...bio, socials: bio.socials.filter((_:any, i:number) => i !== idx)});
    const updateSocial = (idx: number, field: string, val: string) => {
        const next = [...bio.socials];
        next[idx][field] = val;
        setBio({...bio, socials: next});
    };

    const addPdf = () => setBio({...bio, pdfs: [...bio.pdfs, { label: 'Novo Documento', url: '', cover: '' }]});
    const removePdf = (idx: number) => setBio({...bio, pdfs: bio.pdfs.filter((_:any, i:number) => i !== idx)});
    const updatePdf = (idx: number, field: string, val: string) => {
        const next = [...bio.pdfs];
        next[idx][field] = val;
        setBio({...bio, pdfs: next});
    };

    const SocialIcon = ({ platform, size = 20 }: { platform: string, size?: number }) => {
        switch (platform) {
            case 'instagram': return <Instagram size={size} />;
            case 'facebook': return <Facebook size={size} />;
            case 'linkedin': return <Linkedin size={size} />;
            case 'youtube': return <Youtube size={size} />;
            case 'twitter': return <Twitter size={size} />;
            case 'tiktok': return <Music2 size={size} />;
            default: return <Globe size={size} />;
        }
    };

    return (
        <div className="sb-bio-pro-supreme-final">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');

                .sb-bio-pro-supreme-final {
                    --neon: #acf800;
                    --dark: #020202;
                    --border: rgba(255, 255, 255, 0.08);
                    --glass: rgba(255, 255, 255, 0.02);
                    background: var(--dark) !important;
                    min-height: 100vh !important;
                    width: 100% !important;
                    padding: 30px !important;
                    font-family: 'Outfit', sans-serif !important;
                    color: white !important;
                    overflow-x: hidden !important;
                }

                /* GLOBAL NEON SCROLLBAR */
                .sb-bio-pro-supreme-final::-webkit-scrollbar,
                .sb-bio-pro-supreme-final *::-webkit-scrollbar { width: 6px !important; }
                .sb-bio-pro-supreme-final::-webkit-scrollbar-track,
                .sb-bio-pro-supreme-final *::-webkit-scrollbar-track { background: rgba(0,0,0,0.2) !important; }
                .sb-bio-pro-supreme-final::-webkit-scrollbar-thumb,
                .sb-bio-pro-supreme-final *::-webkit-scrollbar-thumb { 
                    background: var(--neon) !important; 
                    border-radius: 10px !important; 
                    box-shadow: 0 0 12px var(--neon) !important; 
                }

                .sb-bio-pro-supreme-final * { box-sizing: border-box !important; }

                .sb-header { width: 100%; max-width: 1400px; margin: 0 auto 50px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 25px; gap: 20px; flex-wrap: wrap; }
                .sb-title-serene { font-size: clamp(1.8rem, 6vw, 2.8rem) !important; font-weight: 900 !important; letter-spacing: -1.5px !important; background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 !important; text-transform: uppercase; }

                /* Grid Layout */
                .sb-grid { display: flex !important; flex-direction: row !important; gap: 60px !important; width: 100% !important; max-width: 1400px !important; margin: 0 auto !important; align-items: flex-start !important; justify-content: center !important; }
                .sb-form-col { flex: 1 !important; min-width: 0 !important; max-width: 800px !important; }
                .sb-preview-col { position: sticky !important; top: 30px !important; width: 400px !important; flex-shrink: 0 !important; display: block !important; }

                /* Avatar */
                .sb-avatar-supreme { width: 140px; height: 140px; aspect-ratio: 1/1 !important; border-radius: 50% !important; padding: 6px; background: linear-gradient(135deg, var(--neon) 0%, #00f2fe 100%); margin-bottom: 35px; box-shadow: 0 30px 60px rgba(172, 248, 0, 0.4); position: relative; }
                .sb-avatar-supreme img { width: 100% !important; height: 100% !important; border-radius: 50% !important; object-fit: cover !important; border: 4px solid #000 !important; }

                /* Cards & Inputs */
                .sb-card { background: var(--glass) !important; border: 1px solid var(--border) !important; border-radius: 40px !important; padding: 35px !important; margin-bottom: 30px !important; position: relative; overflow: hidden; }
                .sb-input-wrap { background: rgba(255,255,255,0.02) !important; border: 1px solid var(--border) !important; border-radius: 24px !important; padding: 18px 25px !important; margin-bottom: 15px !important; transition: 0.3s; }
                .sb-label { font-size: 9px !important; font-weight: 950 !important; color: rgba(255,255,255,0.2) !important; text-transform: uppercase !important; letter-spacing: 2px !important; margin-bottom: 8px !important; display: block !important; }
                .sb-input { background: transparent !important; border: none !important; color: white !important; font-size: 18px !important; font-weight: 800 !important; width: 100% !important; outline: none !important; }
                .sb-premium-select { background: #000 !important; border: 1px solid var(--border) !important; color: white !important; border-radius: 15px !important; padding: 0 15px !important; height: 50px !important; font-size: 10px !important; font-weight: 950 !important; text-transform: uppercase !important; outline: none !important; cursor: pointer !important; min-width: 110px !important; }

                /* Switch Styles */
                .sb-switch-row { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; background: rgba(255,255,255,0.02); border-radius: 24px; border: 1px solid var(--border); margin-bottom: 12px; }
                .sb-switch { width: 50px; height: 26px; background: rgba(255,255,255,0.05); border-radius: 50px; position: relative; cursor: pointer; transition: 0.4s; border: 1px solid var(--border); }
                .sb-switch.active { background: var(--neon); border-color: var(--neon); box-shadow: 0 0 20px rgba(172, 248, 0, 0.4); }
                .sb-switch-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: white; border-radius: 50%; transition: 0.4s; }
                .sb-switch.active .sb-switch-thumb { left: 27px; background: #000; }

                /* Buttons */
                .sb-btn-premium { background: var(--neon) !important; color: #000 !important; padding: 18px 40px !important; border-radius: 22px !important; font-weight: 950 !important; border: none !important; cursor: pointer !important; transition: 0.3s !important; display: flex !important; align-items: center !important; gap: 12px !important; text-transform: uppercase; font-size: 14px; }
                .sb-btn-action { background: rgba(255,255,255,0.05) !important; color: white !important; padding: 14px 28px !important; border-radius: 18px !important; font-weight: 950 !important; font-size: 11px !important; text-transform: uppercase !important; border: 1px solid var(--border) !important; cursor: pointer !important; display: flex !important; align-items: center !important; gap: 10px !important; }

                /* Phone Preview */
                .sb-phone { width: 100%; height: 800px; background: #000; border: 14px solid #1a1a1a; border-radius: 70px; overflow: hidden; position: relative; }
                .sb-screen { width: 100% !important; height: 100% !important; background: linear-gradient(180deg, #020202 0%, #080808 30%, #acf80005 60%, #00f2fe05 100%) !important; display: flex !important; flex-direction: column !important; align-items: center !important; padding: 80px 30px !important; overflow-y: auto !important; overflow-x: hidden !important; position: relative !important; z-index: 1 !important; }

                /* Preview Buttons */
                .sb-preview-btn { width: 100% !important; padding: 22px !important; border-radius: 30px !important; text-align: center !important; font-weight: 950 !important; font-size: 13px !important; text-transform: uppercase !important; letter-spacing: 2px !important; margin-bottom: 15px !important; border: none !important; display: block !important; cursor: pointer !important; transition: 0.3s !important; }
                .sb-preview-btn.whatsapp { background: var(--neon) !important; color: #000 !important; box-shadow: 0 10px 30px rgba(172, 248, 0, 0.4) !important; }
                .sb-preview-btn.previa { background: #fff !important; color: #000 !important; box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3) !important; }
                .sb-preview-btn.meeting { background: rgba(255,255,255,0.05) !important; color: white !important; border: 1px solid rgba(255,255,255,0.1) !important; backdrop-filter: blur(10px) !important; }
                .sb-preview-btn.default { background: rgba(255,255,255,0.05) !important; color: white !important; border: 1px solid rgba(255,255,255,0.1) !important; backdrop-filter: blur(10px) !important; }

                /* PDF PREVIEW SLIDER */
                .sb-preview-pdf-slider { width: 100%; position: relative; margin-top: 40px; }
                .sb-pdf-card-wrap { width: 100%; aspect-ratio: 3/4; border-radius: 30px; overflow: hidden; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
                .sb-pdf-card-wrap img { width: 100%; height: 100%; object-fit: cover; }
                .sb-pdf-info { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%); padding: 30px 20px 20px; }
                .sb-pdf-label { color: white; font-weight: 900; font-size: 14px; text-transform: uppercase; margin-bottom: 8px; display: block; }
                .sb-pdf-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--neon); color: black; padding: 10px; border-radius: 12px; font-weight: 950; font-size: 10px; text-transform: uppercase; }

                /* Simulator V2 Split Layout */
                .sb-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(25px); z-index: 30000; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .sb-modal-sim { width: 100%; max-width: 1100px; background: #000; border: 1px solid var(--border); border-radius: 50px; padding: 50px; position: relative; overflow: hidden; display: flex; gap: 50px; box-shadow: 0 50px 100px rgba(0,0,0,0.8); }
                .sb-sim-form { flex: 1; }
                .sb-sim-preview { width: 400px; flex-shrink: 0; display: block; }

                /* WhatsApp Bubble Mockup Fixed */
                .wa-chat-container { background: #0b141a; border-radius: 35px; padding: 25px; width: 100%; position: relative; min-height: 400px; border: 1px solid rgba(255,255,255,0.05); }
                .wa-bubble { background: #005c4b; color: white; border-radius: 12px 12px 12px 0; padding: 12px; max-width: 90%; margin-bottom: 5px; position: relative; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
                .wa-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); overflow: hidden; flex-shrink: 0; }
                .wa-avatar img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
                .wa-media { border-radius: 10px; overflow: hidden; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.1); width: 100%; }
                .wa-link-preview { background: #111b21; border-radius: 10px; overflow: hidden; margin-top: 10px; border-left: 4px solid var(--neon); }
                .wa-link-img { width: 100%; height: 160px; object-fit: cover; opacity: 0.8; }
                .wa-btn { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; text-align: center; margin-top: 10px; font-weight: 800; font-size: 13px; color: var(--neon); border: 1px solid rgba(172,248,0,0.1); }

                @media (max-width: 1100px) {
                    .sb-modal-sim { flex-direction: column; gap: 30px; max-height: 90vh; overflow-y: auto; padding: 30px; }
                    .sb-sim-preview { width: 100%; order: -1; }
                    .sb-grid { flex-direction: column !important; gap: 30px !important; }
                    .sb-preview-col { display: ${mobileShowPreview ? 'block' : 'none'} !important; position: fixed !important; top: 0; left: 0; width: 100% !important; height: 100% !important; z-index: 10000 !important; background: black !important; padding: 15px !important; }
                }

                .animate-supreme { animation: supremeFade 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
                @keyframes supremeFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {view === 'dashboard' ? (
                <div className="animate-supreme">
                    <header className="sb-header">
                        <div>
                            <span className="text-[10px] font-black text-[#acf800] uppercase tracking-[4px]">Elite BIO PRO Engine</span>
                            <h1 className="sb-title-serene">Meus Links</h1>
                        </div>
                        <button onClick={handleCreateNew} className="sb-btn-premium"><Plus size={22} strokeWidth={4} /> NOVA BIO PRO</button>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-[1400px] mx-auto">
                        {bios.map((item) => (
                            <div key={item.id} className="sb-card" style={{ marginBottom: 0 }}>
                                <div className="flex gap-6 mb-8">
                                    <div className="sb-avatar-supreme" style={{ width: '85px', height: '85px', padding: '4px', marginBottom: 0 }}><img src={item.avatar_url || 'https://via.placeholder.com/150'} alt="" /></div>
                                    <div className="pt-2">
                                        <h3 className="text-xl font-black text-white truncate w-40 mb-4">{item.title}</h3>
                                        <span className="bg-[#acf800]/10 text-[#acf800] text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-wider">/{item.slug}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => handleEdit(item)} className="p-3 rounded-xl bg-white/5 text-white"><Settings2 size={18} /></button>
                                    <button onClick={() => dbService.deleteSmartBio(item.id).then(loadBios)} className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white ml-auto"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="animate-supreme">
                    <nav className="sb-header">
                        <div className="flex items-center gap-8">
                            <button onClick={() => setView('dashboard')} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 border border-white/5"><ArrowLeft size={24} /></button>
                            <h1 className="sb-title-serene">BIO PRO</h1>
                        </div>
                        <button onClick={handleSave} disabled={isSaving} className="sb-btn-premium">{isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} PUBLICAR</button>
                    </nav>

                    <div className="sb-grid">
                        <div className="sb-form-col">
                            {(!isMobile || mobileStep === 1) && (
                                <div className="sb-card animate-supreme">
                                    <span className="sb-label" style={{ color: 'var(--neon)', marginBottom: '25px' }}>Identidade Visual</span>
                                    <div className="sb-input-wrap">
                                        <span className="sb-label">Endereço (Slug)</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-white/20 font-black">/bio/</span>
                                            <input className="sb-input" value={bio.slug} onChange={(e) => setBio({ ...bio, slug: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="sb-input-wrap">
                                            <span className="sb-label">Título da Página</span>
                                            <input className="sb-input" value={bio.title} onChange={(e) => setBio({ ...bio, title: e.target.value })} />
                                        </div>
                                        <div className="sb-input-wrap">
                                            <span className="sb-label">Avatar URL</span>
                                            <input className="sb-input" value={bio.avatar_url} onChange={(e) => setBio({ ...bio, avatar_url: e.target.value })} />
                                        </div>
                                    </div>
                                    <button onClick={() => fileInputRef.current?.click()} className="sb-btn-action w-full justify-center mt-4">
                                        {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={16} />}
                                        {isUploading ? 'ENVIANDO...' : 'ENVIAR FOTO'}
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                </div>
                            )}

                            {(!isMobile || mobileStep === 2) && (
                                <div className="animate-supreme">
                                    <div className="sb-card">
                                        <span className="sb-label" style={{ color: 'var(--neon)', marginBottom: '25px' }}>Exibição & Redes</span>
                                        <div className="sb-switch-row">
                                            <span className="text-xs font-black uppercase">Agendar Reunião</span>
                                            <div className={`sb-switch ${bio.show_meeting_btn ? 'active' : ''}`} onClick={() => setBio({...bio, show_meeting_btn: !bio.show_meeting_btn})}><div className="sb-switch-thumb" /></div>
                                        </div>
                                        <div className="sb-switch-row">
                                            <span className="text-xs font-black uppercase">Botão Visualizar Prévia</span>
                                            <div className={`sb-switch ${bio.show_preview_btn ? 'active' : ''}`} onClick={() => setBio({...bio, show_preview_btn: !bio.show_preview_btn})}><div className="sb-switch-thumb" /></div>
                                        </div>
                                        <div className="sb-switch-row">
                                            <span className="text-xs font-black uppercase">Redes Sociais</span>
                                            <div className={`sb-switch ${bio.show_socials ? 'active' : ''}`} onClick={() => setBio({...bio, show_socials: !bio.show_socials})}><div className="sb-switch-thumb" /></div>
                                        </div>
                                    </div>

                                    {bio.show_socials && (
                                        <div className="sb-card animate-supreme">
                                            <div className="flex justify-between items-center mb-8">
                                                <span className="sb-label" style={{ marginBottom: 0 }}>Links Sociais</span>
                                                <button onClick={addSocial} className="sb-btn-action">+ ADICIONAR</button>
                                            </div>
                                            {bio.socials.map((soc: any, idx: number) => (
                                                <div key={idx} className="flex gap-4 mb-4 items-center">
                                                    <select className="sb-premium-select" value={soc.platform} onChange={(e) => updateSocial(idx, 'platform', e.target.value)}>
                                                        <option value="instagram">Instagram</option>
                                                        <option value="facebook">Facebook</option>
                                                        <option value="youtube">YouTube</option>
                                                        <option value="linkedin">LinkedIn</option>
                                                    </select>
                                                    <div className="sb-input-wrap flex-1 !mb-0">
                                                        <input className="sb-input !text-sm" value={soc.url} onChange={(e) => updateSocial(idx, 'url', e.target.value)} placeholder="Link do perfil..." />
                                                    </div>
                                                    <button onClick={() => removeSocial(idx)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {(!isMobile || mobileStep === 3) && (
                                <div className="animate-supreme">
                                    <div className="sb-card">
                                        <span className="sb-label" style={{ color: 'var(--neon)', marginBottom: '25px' }}>Documentos PDF</span>
                                        <div className="sb-switch-row">
                                            <span className="text-xs font-black uppercase">Slider de PDFs</span>
                                            <div className={`sb-switch ${bio.show_pdfs ? 'active' : ''}`} onClick={() => setBio({...bio, show_pdfs: !bio.show_pdfs})}><div className="sb-switch-thumb" /></div>
                                        </div>
                                    </div>

                                    {bio.show_pdfs && (
                                        <div className="sb-card animate-supreme">
                                            <div className="flex justify-between items-center mb-8">
                                                <span className="sb-label" style={{ marginBottom: 0 }}>Meus Catálogos / PDFs</span>
                                                <button onClick={addPdf} className="sb-btn-action">+ NOVO PDF</button>
                                            </div>
                                            {bio.pdfs.map((pdf: any, idx: number) => (
                                                <div key={idx} className="sb-card !p-8 !bg-white/0 border-dashed border-white/10 mb-6">
                                                    <div className="flex justify-between mb-6">
                                                        <span className="sb-label">Documento #{idx+1}</span>
                                                        <button onClick={() => removePdf(idx)} className="text-red-500"><Trash2 size={18}/></button>
                                                    </div>
                                                    <div className="sb-input-wrap"><input className="sb-input !text-sm" value={pdf.label} onChange={(e) => updatePdf(idx, 'label', e.target.value)} placeholder="Título do PDF..." /></div>
                                                    <div className="sb-input-wrap"><input className="sb-input !text-sm" value={pdf.cover} onChange={(e) => updatePdf(idx, 'cover', e.target.value)} placeholder="URL da Capa..." /></div>
                                                    <div className="sb-input-wrap !mb-0"><input className="sb-input !text-sm" value={pdf.url} onChange={(e) => updatePdf(idx, 'url', e.target.value)} placeholder="Link do PDF..." /></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isMobile && (
                                <div className="sb-mobile-hub">
                                    {mobileStep > 1 && <button onClick={() => setMobileStep(mobileStep-1)} className="sb-hub-btn sb-hub-glass"><ChevronLeft size={22} /></button>}
                                    <button onClick={() => setMobileShowPreview(!mobileShowPreview)} className="sb-hub-btn sb-hub-glass">
                                        {mobileShowPreview ? <Layout size={22} /> : <Eye size={22} />}
                                        {mobileShowPreview ? 'EDITOR' : 'PRÉVIA'}
                                    </button>
                                    {mobileStep < 3 ? (
                                        <button onClick={() => setMobileStep(mobileStep+1)} className="sb-hub-btn sb-hub-primary">PRÓXIMO <ChevronRight size={22} /></button>
                                    ) : (
                                        <button onClick={handleSave} className="sb-hub-btn sb-hub-primary">SALVAR</button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="sb-preview-col">
                            <div className="sb-phone">
                                <div className="sb-screen">
                                    <div className="sb-avatar-supreme"><img src={bio.avatar_url || 'https://via.placeholder.com/150'} alt="Avatar" /></div>
                                    <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '2.4rem', fontWeight: 950 }}>{bio.title}</h2>
                                    <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '45px', padding: '0 20px' }}>{bio.description}</p>
                                    
                                    <div className="w-full space-y-4">
                                        {bio.show_meeting_btn && <div onClick={() => setShowMeetingModal(true)} className="sb-preview-btn meeting">Agendar Reunião</div>}
                                        {bio.show_preview_btn && <div onClick={() => { setShowDisparoSimulator(true); setSimStep(1); }} className="sb-preview-btn previa">Visualizar Prévia</div>}
                                        {bio.buttons.map((b: any, i: number) => (
                                            <div key={i} className={`sb-preview-btn ${b.type === 'whatsapp' ? 'whatsapp' : 'default'}`}>{b.label}</div>
                                        ))}
                                    </div>

                                    {bio.show_pdfs && bio.pdfs.length > 0 && (
                                        <div className="sb-preview-pdf-slider animate-supreme">
                                            <div className="sb-pdf-card-wrap">
                                                <img src={bio.pdfs[activePdfIdx].cover || 'https://via.placeholder.com/300x400?text=PDF'} alt="" />
                                                <div className="sb-pdf-info">
                                                    <span className="sb-pdf-label">{bio.pdfs[activePdfIdx].label}</span>
                                                    <div className="sb-pdf-btn"><Download size={14} /> DOWNLOAD PDF</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-center gap-4 mt-6">
                                                <button onClick={() => setActivePdfIdx(prev => prev > 0 ? prev - 1 : bio.pdfs.length - 1)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><ChevronLeft size={20}/></button>
                                                <button onClick={() => setActivePdfIdx(prev => prev < bio.pdfs.length - 1 ? prev + 1 : 0)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><ChevronRight size={20}/></button>
                                            </div>
                                        </div>
                                    )}

                                    {bio.show_socials && bio.socials.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-6 mt-12 mb-10">
                                            {bio.socials.map((soc: any, i: number) => (
                                                <div key={i} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50"><SocialIcon platform={soc.platform} /></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {showDisparoSimulator && (
                        <div className="sb-modal-overlay" onClick={() => setShowDisparoSimulator(false)}>
                            <div className="sb-modal-sim animate-supreme" onClick={e => e.stopPropagation()}>
                                <X className="sb-modal-close" size={28} onClick={() => setShowDisparoSimulator(false)} />
                                <div className="sb-sim-form">
                                    <div className="flex gap-2 mb-10">
                                        {[1, 2, 3].map(s => <div key={s} className={`h-1 flex-1 rounded-full ${simStep >= s ? 'bg-[#acf800]' : 'bg-white/10'}`} />)}
                                    </div>
                                    {simStep === 1 && (
                                        <div className="animate-supreme">
                                            <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-widest">Passo 01: Perfil</h3>
                                            <div className="sb-input-wrap"><span className="sb-label">Nome</span><input className="sb-input" value={simData.name} onChange={e => setSimData({...simData, name: e.target.value})} /></div>
                                            <div className="sb-input-wrap"><span className="sb-label">Avatar URL</span><input className="sb-input" value={simData.photo} onChange={e => setSimData({...simData, photo: e.target.value})} /></div>
                                            <button onClick={() => setSimStep(2)} className="sb-btn-premium w-full justify-center mt-6">PRÓXIMO <ChevronRight size={20}/></button>
                                        </div>
                                    )}
                                    {simStep === 2 && (
                                        <div className="animate-supreme">
                                            <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-widest">Passo 02: Template</h3>
                                            <div className="flex gap-4 mb-8">
                                                <div className={`flex-1 p-6 rounded-3xl border ${simData.type === 'text' ? 'border-[#acf800] bg-[#acf800]/5' : 'border-white/10'} text-center cursor-pointer`} onClick={() => setSimData({...simData, type: 'text'})}><FileText className="mx-auto mb-2" /> TEXTO</div>
                                                <div className={`flex-1 p-6 rounded-3xl border ${simData.type === 'image' ? 'border-[#acf800] bg-[#acf800]/5' : 'border-white/10'} text-center cursor-pointer`} onClick={() => setSimData({...simData, type: 'image'})}><ImageIcon className="mx-auto mb-2" /> IMAGEM</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => setSimStep(1)} className="sb-btn-action flex-1 justify-center">VOLTAR</button>
                                                <button onClick={() => setSimStep(3)} className="sb-btn-premium flex-1 justify-center">PRÓXIMO</button>
                                            </div>
                                        </div>
                                    )}
                                    {simStep === 3 && (
                                        <div className="animate-supreme">
                                            <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-widest">Passo 03: Mensagem</h3>
                                            <div className="sb-input-wrap"><span className="sb-label">Mensagem</span><textarea className="sb-input h-32 resize-none pt-4" value={simData.msg} onChange={e => setSimData({...simData, msg: e.target.value})} /></div>
                                            <button onClick={() => setShowDisparoSimulator(false)} className="sb-btn-premium w-full justify-center">CONCLUIR</button>
                                        </div>
                                    )}
                                </div>
                                <div className="sb-sim-preview animate-supreme">
                                    <div className="wa-chat-container">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="wa-avatar"><img src={simData.photo || 'https://via.placeholder.com/150'} alt="" /></div>
                                            <span className="text-[12px] font-black text-white">{simData.name}</span>
                                        </div>
                                        <div className="wa-bubble">
                                            {simData.type === 'image' && <div className="wa-media"><img src={simData.media} alt="" /></div>}
                                            <p className="text-[13px]">{simData.msg}</p>
                                            <div className="wa-link-preview">
                                                <img src={bio.avatar_url || 'https://via.placeholder.com/600x300'} className="wa-link-img" alt="" />
                                                <div className="p-4 bg-[#111b21]"><h4 className="text-xs font-black text-white truncate">{bio.title}</h4><p className="text-[10px] text-white/30 mt-1">plugesales.app/bio/{bio.slug}</p></div>
                                            </div>
                                            <div className="wa-btn">ABRIR BIO PRO</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SmartBioCreator;
