import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    CreditCard, 
    Save, 
    Smartphone, 
    Instagram, 
    Linkedin, 
    Globe, 
    User,
    QrCode,
    Download,
    Zap,
    Briefcase,
    Plus,
    MessageCircle,
    CheckCircle2,
    ArrowLeft,
    Settings2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Layout,
    Loader2,
    Upload,
    X,
    Twitter,
    Youtube,
    Facebook,
    Music2,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Clock,
    User as UserIcon,
    ExternalLink,
    FileText,
    ImageIcon,
    Video,
    Send
} from 'lucide-react';

const DigitalCardCreator = () => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [card, setCard] = useState({
        name: 'Seu Nome Completo',
        photo_url: '',
        company: 'Sua Empresa / Cargo',
        whatsapp: '5511999999999',
        phone: '5511999999999',
        email: 'seuemail@empresa.com',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        slug: 'card-' + Math.random().toString(36).substring(7),
        social_links: {
            instagram: '',
            linkedin: '',
            site: '',
            facebook: '',
            twitter: ''
        },
        show_qr: true,
        show_socials: true,
        show_contact_info: true,
        show_address: true,
        show_whatsapp_btn: true,
        show_vcf_btn: true,
        show_meeting_btn: true,
        show_preview_btn: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // Mobile UX State
    const [mobileStep, setMobileStep] = useState(1);
    const [mobileShowPreview, setMobileShowPreview] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);

    // Modal States
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [showDisparoSimulator, setShowDisparoSimulator] = useState(false);
    const [simStep, setSimStep] = useState(1);
    
    // Simulator State
    const [simData, setSimData] = useState({
        photo: '',
        name: 'Equipe de Vendas',
        msg: 'Olá! Sou seu consultor oficial. Salve meu contato e veja meu cartão digital aqui.',
        type: 'text', // text, image, video
        media: 'https://via.placeholder.com/600x400?text=DIGITAL+CARD+MEDIA'
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1200);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSave = async () => {
        if (!card.slug) return alert('Defina um link personalizado (slug)');
        setIsSaving(true);
        try {
            const res = await fetch('/api/digital-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...card, user_id: user?.id })
            });
            if (res.ok) {
                alert('🚀 Cartão Profissional Supreme publicado!');
            }
        } catch (err) {
            console.error(err);
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
                setCard({ ...card, photo_url: data.shortUrl || data.url });
            }
        } finally {
            setIsUploading(false);
        }
    };

    const SocialIcon = ({ platform, size = 20 }: { platform: string, size?: number }) => {
        switch (platform) {
            case 'instagram': return <Instagram size={size} />;
            case 'facebook': return <Facebook size={size} />;
            case 'linkedin': return <Linkedin size={size} />;
            case 'youtube': return <Youtube size={size} />;
            case 'twitter': return <Twitter size={size} />;
            default: return <Globe size={size} />;
        }
    };

    return (
        <div className="sb-digital-card-supreme-final">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');

                .sb-digital-card-supreme-final {
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
                .sb-digital-card-supreme-final::-webkit-scrollbar,
                .sb-digital-card-supreme-final *::-webkit-scrollbar { width: 6px !important; }
                .sb-digital-card-supreme-final::-webkit-scrollbar-track,
                .sb-digital-card-supreme-final *::-webkit-scrollbar-track { background: rgba(0,0,0,0.2) !important; }
                .sb-digital-card-supreme-final::-webkit-scrollbar-thumb,
                .sb-digital-card-supreme-final *::-webkit-scrollbar-thumb { 
                    background: var(--neon) !important; 
                    border-radius: 10px !important; 
                    box-shadow: 0 0 12px var(--neon) !important; 
                }

                .sb-digital-card-supreme-final * { box-sizing: border-box !important; }

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

                /* Contact Rows */
                .sb-contact-row { display: flex; align-items: center; gap: 20px; width: 100%; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 25px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 12px; transition: 0.3s; }
                .sb-contact-icon { width: 45px; height: 45px; background: rgba(172, 248, 0, 0.1); border-radius: 15px; display: flex; align-items: center; justify-content: center; color: var(--neon); flex-shrink: 0; }
                .sb-contact-text { display: flex; flex-direction: column; overflow: hidden; }
                .sb-contact-val { font-size: 14px; font-weight: 800; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .sb-contact-label { font-size: 9px; font-weight: 950; text-transform: uppercase; color: rgba(255,255,255,0.3); letter-spacing: 1px; }

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

            <header className="sb-header">
                <div>
                    <span className="text-[10px] font-black text-[#acf800] uppercase tracking-[4px]">Elite Networking Engine</span>
                    <h1 className="sb-title-serene">Cartão de Visita</h1>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="sb-btn-premium">
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
                    {isSaving ? 'PUBLICANDO...' : 'PUBLICAR CARTÃO'}
                </button>
            </header>

            <div className="sb-grid">
                <div className="sb-form-col">
                    {(!isMobile || mobileStep === 1) && (
                        <div className="sb-card animate-supreme">
                            <span className="sb-label" style={{ color: 'var(--neon)', marginBottom: '25px' }}>Identidade Visual</span>
                            <div className="sb-input-wrap">
                                <span className="sb-label">Endereço (Slug)</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-white/20 font-black">/card/</span>
                                    <input className="sb-input" value={card.slug} onChange={(e) => setCard({ ...card, slug: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="sb-input-wrap">
                                    <span className="sb-label">Nome Completo</span>
                                    <input className="sb-input" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                                </div>
                                <div className="sb-input-wrap">
                                    <span className="sb-label">Cargo ou Empresa</span>
                                    <input className="sb-input" value={card.company} onChange={(e) => setCard({ ...card, company: e.target.value })} />
                                </div>
                            </div>
                            <div className="sb-input-wrap">
                                <span className="sb-label">URL da Foto de Perfil</span>
                                <input className="sb-input" value={card.photo_url} onChange={(e) => setCard({ ...card, photo_url: e.target.value })} />
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
                                <span className="sb-label" style={{ color: 'var(--neon)', marginBottom: '25px' }}>Informações de Contato</span>
                                <div className="sb-switch-row">
                                    <span className="text-xs font-black uppercase">Exibir Contatos</span>
                                    <div className={`sb-switch ${card.show_contact_info ? 'active' : ''}`} onClick={() => setCard({...card, show_contact_info: !card.show_contact_info})}><div className="sb-switch-thumb" /></div>
                                </div>
                                <div className="sb-switch-row">
                                    <span className="text-xs font-black uppercase">Exibir Endereço</span>
                                    <div className={`sb-switch ${card.show_address ? 'active' : ''}`} onClick={() => setCard({...card, show_address: !card.show_address})}><div className="sb-switch-thumb" /></div>
                                </div>
                            </div>

                            {(card.show_contact_info || card.show_address) && (
                                <div className="sb-card animate-supreme">
                                    <span className="sb-label" style={{ marginBottom: '25px' }}>Dados do Cartão</span>
                                    {card.show_contact_info && (
                                        <div className="space-y-4">
                                            <div className="sb-input-wrap"><span className="sb-label">WhatsApp</span><input className="sb-input" value={card.whatsapp} onChange={(e) => setCard({ ...card, whatsapp: e.target.value })} /></div>
                                            <div className="sb-input-wrap"><span className="sb-label">Telefone Direto</span><input className="sb-input" value={card.phone} onChange={(e) => setCard({ ...card, phone: e.target.value })} /></div>
                                            <div className="sb-input-wrap"><span className="sb-label">E-mail Profissional</span><input className="sb-input" value={card.email} onChange={(e) => setCard({ ...card, email: e.target.value })} /></div>
                                        </div>
                                    )}
                                    {card.show_address && (
                                        <div className="sb-input-wrap mt-4"><span className="sb-label">Endereço Comercial</span><input className="sb-input" value={card.address} onChange={(e) => setCard({ ...card, address: e.target.value })} /></div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {(!isMobile || mobileStep === 3) && (
                        <div className="animate-supreme">
                            <div className="sb-card">
                                <span className="sb-label" style={{ color: 'var(--neon)', marginBottom: '25px' }}>Ações & Redes</span>
                                <div className="sb-switch-row">
                                    <span className="text-xs font-black uppercase">Agendar Reunião</span>
                                    <div className={`sb-switch ${card.show_meeting_btn ? 'active' : ''}`} onClick={() => setCard({...card, show_meeting_btn: !card.show_meeting_btn})}><div className="sb-switch-thumb" /></div>
                                </div>
                                <div className="sb-switch-row">
                                    <span className="text-xs font-black uppercase">Visualizar Prévia</span>
                                    <div className={`sb-switch ${card.show_preview_btn ? 'active' : ''}`} onClick={() => setCard({...card, show_preview_btn: !card.show_preview_btn})}><div className="sb-switch-thumb" /></div>
                                </div>
                                <div className="sb-switch-row">
                                    <span className="text-xs font-black uppercase">Redes Sociais</span>
                                    <div className={`sb-switch ${card.show_socials ? 'active' : ''}`} onClick={() => setCard({...card, show_socials: !card.show_socials})}><div className="sb-switch-thumb" /></div>
                                </div>
                            </div>

                            {card.show_socials && (
                                <div className="sb-card animate-supreme">
                                    <span className="sb-label" style={{ marginBottom: '25px' }}>Links Sociais</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="sb-input-wrap"><span className="sb-label">Instagram</span><input className="sb-input" value={card.social_links.instagram} onChange={(e) => setCard({ ...card, social_links: { ...card.social_links, instagram: e.target.value } })} /></div>
                                        <div className="sb-input-wrap"><span className="sb-label">LinkedIn</span><input className="sb-input" value={card.social_links.linkedin} onChange={(e) => setCard({ ...card, social_links: { ...card.social_links, linkedin: e.target.value } })} /></div>
                                    </div>
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
                            <div className="sb-avatar-supreme"><img src={card.photo_url || 'https://via.placeholder.com/150'} alt="Avatar" /></div>
                            <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '2.4rem', fontWeight: 950 }}>{card.name}</h2>
                            <p style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '45px', padding: '0 20px' }}>{card.company}</p>
                            
                            <div className="w-full space-y-3 mb-10">
                                {card.show_contact_info && (
                                    <>
                                        <div className="sb-contact-row">
                                            <div className="sb-contact-icon"><Phone size={18} /></div>
                                            <div className="sb-contact-text"><span className="sb-contact-label">WhatsApp</span><span className="sb-contact-val">{card.whatsapp}</span></div>
                                        </div>
                                        <div className="sb-contact-row">
                                            <div className="sb-contact-icon"><Mail size={18} /></div>
                                            <div className="sb-contact-text"><span className="sb-contact-label">E-mail</span><span className="sb-contact-val">{card.email}</span></div>
                                        </div>
                                    </>
                                )}
                                {card.show_address && (
                                    <div className="sb-contact-row">
                                        <div className="sb-contact-icon"><MapPin size={18} /></div>
                                        <div className="sb-contact-text"><span className="sb-contact-label">Endereço</span><span className="sb-contact-val">{card.address}</span></div>
                                    </div>
                                )}
                            </div>

                            <div className="w-full space-y-4">
                                {card.show_meeting_btn && <div onClick={() => setShowMeetingModal(true)} className="sb-preview-btn meeting">Agendar Reunião</div>}
                                {card.show_preview_btn && <div onClick={() => { setShowDisparoSimulator(true); setSimStep(1); }} className="sb-preview-btn previa">Visualizar Prévia</div>}
                            </div>

                            {card.show_socials && (
                                <div className="flex justify-center gap-6 mt-10">
                                    {card.social_links.instagram && <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50"><Instagram size={20} /></div>}
                                    {card.social_links.linkedin && <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50"><Linkedin size={20} /></div>}
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
                                    <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-widest">Perfil</h3>
                                    <div className="sb-input-wrap"><span className="sb-label">Nome</span><input className="sb-input" value={simData.name} onChange={e => setSimData({...simData, name: e.target.value})} /></div>
                                    <div className="sb-input-wrap"><span className="sb-label">Avatar URL</span><input className="sb-input" value={simData.photo} onChange={e => setSimData({...simData, photo: e.target.value})} /></div>
                                    <button onClick={() => setSimStep(2)} className="sb-btn-premium w-full justify-center mt-6">PRÓXIMO <ChevronRight size={20}/></button>
                                </div>
                            )}
                            {simStep === 2 && (
                                <div className="animate-supreme">
                                    <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-widest">Template</h3>
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
                                    <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-widest">Mensagem</h3>
                                    <div className="sb-input-wrap"><span className="sb-label">Copy</span><textarea className="sb-input h-32 resize-none pt-4" value={simData.msg} onChange={e => setSimData({...simData, msg: e.target.value})} /></div>
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
                                        <img src={card.photo_url || 'https://via.placeholder.com/600x300'} className="wa-link-img" alt="" />
                                        <div className="p-4 bg-[#111b21]"><h4 className="text-xs font-black text-white truncate">{card.name}</h4><p className="text-[10px] text-white/30 mt-1">plugesales.app/card/{card.slug}</p></div>
                                    </div>
                                    <div className="wa-btn">SALVAR CONTATO</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalCardCreator;
