import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Zap, MessageCircle, ExternalLink, Loader2, Share2, User, ChevronRight, ArrowLeft, Send, Check, Smartphone, FileText, Globe, Download, Instagram, Facebook, Youtube, Linkedin, Twitter, Music2 } from 'lucide-react';

const SmartBioView = () => {
    const { slug } = useParams();
    const location = useLocation();
    const [bio, setBio] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [activePdfIdx, setActivePdfIdx] = useState(0);
    
    // Tracking/Ref query param
    const queryParams = new URLSearchParams(location.search);
    const ref = queryParams.get('ref') || '';

    const [employeeData, setEmployeeData] = useState({
        name: '',
        photo: '',
        phone: '',
        tracking: ref
    });

    useEffect(() => {
        const fetchBio = async () => {
            try {
                const res = await fetch(`/api/smart-bio/${slug}`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                
                const parsedBio = {
                    ...data,
                    buttons: typeof data.buttons === 'string' ? JSON.parse(data.buttons) : (data.buttons || []),
                    pdfs: typeof data.pdfs === 'string' ? JSON.parse(data.pdfs) : (data.pdfs || []),
                    socials: typeof data.socials === 'string' ? JSON.parse(data.socials) : (data.socials || []),
                    images: typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || [])
                };
                setBio(parsedBio);

                // Increment click count (fire and forget)
                fetch(`/api/smart-bio/${slug}/click`, { method: 'POST' }).catch(() => {});
                
            } catch (err) {
                console.error('Fetch Bio Error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        if (slug) fetchBio();
    }, [slug]);

    const SocialIcon = ({ platform, size = 22 }: { platform: string, size?: number }) => {
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

    if (isLoading) {
        return (
            <div className="sb-view-root min-h-screen bg-[#020202] flex items-center justify-center overflow-hidden relative">
                <style>{`
                    .sb-view-root { --sb-primary: #acf800; }
                    .sb-view-spinner { width: 80px; height: 80px; border: 2px solid rgba(172,248,0,0.1); border-top-color: var(--sb-primary); border-radius: 50%; animation: sb-spin 1s linear infinite; }
                    @keyframes sb-spin { to { transform: rotate(360deg); } }
                    .bg-blob { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(172,248,0,0.1) 0%, transparent 70%); filter: blur(100px); animation: float-blob 20s infinite alternate; }
                    @keyframes float-blob { from { transform: translate(-20%, -20%); } to { transform: translate(20%, 20%); } }
                `}</style>
                <div className="bg-blob" />
                <div className="relative">
                    <div className="sb-view-spinner" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={24} className="text-[#acf800] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!bio) {
        return (
            <div className="sb-view-root min-h-screen bg-[#020202] flex flex-col items-center justify-center text-center p-10">
                <div className="w-24 h-24 bg-red-500/10 rounded-[35px] flex items-center justify-center mb-8 border border-red-500/20">
                    <Zap size={40} className="text-red-500" />
                </div>
                <h1 className="text-white font-black text-5xl mb-4 tracking-tighter">404</h1>
                <p className="text-white/20 font-black uppercase tracking-[5px] text-[10px]">Página não encontrada</p>
                <button onClick={() => window.location.href = '/'} className="mt-12 px-8 py-4 bg-white/5 rounded-2xl text-white font-black text-xs tracking-widest uppercase border border-white/10 hover:bg-white/10 transition-all">Voltar ao Início</button>
            </div>
        );
    }

    const handleButtonClick = (btn: any) => {
        if (btn.type === 'preview') {
            setIsWizardOpen(true);
            return;
        }
        let finalUrl = btn.url;
        if (ref && finalUrl.includes('?')) finalUrl += `&ref=${ref}`;
        else if (ref) finalUrl += `?ref=${ref}`;
        if (btn.type === 'whatsapp') {
            const cleanPhone = btn.url.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        } else {
            window.open(finalUrl, '_blank');
        }
    };

    return (
        <div className="sb-public-wrapper min-h-screen bg-[#020202] text-white flex flex-col items-center px-6 py-24 relative overflow-x-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                
                .sb-public-wrapper { font-family: 'Outfit', sans-serif; --sb-primary: #acf800; }
                .sb-view-container { width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; z-index: 10; position: relative; }

                .sb-avatar-view {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    padding: 6px;
                    background: linear-gradient(135deg, var(--sb-primary), #00f2fe);
                    margin-bottom: 40px;
                    box-shadow: 0 30px 60px rgba(172, 248, 0, 0.3);
                    position: relative;
                }
                .sb-avatar-view img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid #000; }

                .sb-view-btn {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 24px;
                    border-radius: 35px;
                    margin-bottom: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    font-weight: 950;
                    font-size: 1.1rem;
                    color: #fff;
                    transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    backdrop-filter: blur(25px);
                }
                .sb-view-btn:hover { background: #fff; color: #000; transform: translateY(-10px) scale(1.02); box-shadow: 0 30px 60px rgba(255,255,255,0.1); border-color: transparent; }
                .sb-view-btn.primary { background: var(--sb-primary); color: #000; border: none; box-shadow: 0 20px 40px rgba(172, 248, 0, 0.4); }
                .sb-view-btn.primary:hover { background: #fff; box-shadow: 0 30px 60px rgba(255,255,255,0.2); }

                .sb-view-blob { position: absolute; width: 800px; height: 800px; background: radial-gradient(circle, rgba(172, 248, 0, 0.08) 0%, transparent 70%); border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
                .blob-top { top: -200px; right: -200px; }
                .blob-bottom { bottom: -200px; left: -200px; background: radial-gradient(circle, rgba(0, 242, 254, 0.06) 0%, transparent 70%); }

                .sb-pdf-card { width: 100%; aspect-ratio: 3/4; border-radius: 40px; overflow: hidden; position: relative; box-shadow: 0 40px 80px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); margin-top: 50px; transition: 0.4s; }
                .sb-pdf-card:hover { transform: translateY(-10px); border-color: var(--sb-primary); }
                .sb-pdf-card img { width: 100%; height: 100%; object-fit: cover; }
                .sb-pdf-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, transparent 100%); padding: 40px 30px 30px; }
                .sb-pdf-label { font-weight: 950; font-size: 18px; text-transform: uppercase; margin-bottom: 12px; display: block; letter-spacing: 1px; }
                .sb-pdf-action { background: var(--sb-primary); color: #000; padding: 15px; border-radius: 18px; font-weight: 950; font-size: 13px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 10px; }

                .sb-social-hub { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-top: 60px; }
                .sb-social-icon { width: 60px; height: 60px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); transition: 0.3s; }
                .sb-social-icon:hover { background: var(--sb-primary); color: #000; border-color: transparent; transform: scale(1.1); }
            `}</style>

            <div className="sb-view-blob blob-top" />
            <div className="sb-view-blob blob-bottom" />

            <div className="sb-view-container animate-supreme">
                <div className="sb-avatar-view">
                    <img src={bio.avatar_url || 'https://via.placeholder.com/150'} alt={bio.title} />
                </div>

                <h1 className="text-5xl font-black mb-4 text-center tracking-tighter leading-none uppercase">{bio.title}</h1>
                <p className="text-white/40 text-center mb-16 font-bold leading-relaxed px-6 uppercase tracking-[4px] text-[12px]">{bio.description}</p>

                <div className="w-full space-y-5">
                    {bio.buttons.map((btn: any, i: number) => (
                        <button key={i} onClick={() => handleButtonClick(btn)} className={`sb-view-btn ${i === 0 ? 'primary' : ''}`}>
                            {btn.type === 'whatsapp' ? <MessageCircle size={24} strokeWidth={3} /> : <ExternalLink size={24} strokeWidth={3} />}
                            {btn.label}
                        </button>
                    ))}
                </div>

                {bio.pdfs && bio.pdfs.length > 0 && (
                    <div className="w-full">
                        <div className="sb-pdf-card" onClick={() => window.open(bio.pdfs[activePdfIdx].url, '_blank')}>
                            <img src={bio.pdfs[activePdfIdx].cover || 'https://via.placeholder.com/300x400?text=CAPA+PDF'} alt="" />
                            <div className="sb-pdf-overlay">
                                <span className="sb-pdf-label">{bio.pdfs[activePdfIdx].label}</span>
                                <div className="sb-pdf-action"><Download size={18} strokeWidth={3} /> BAIXAR AGORA</div>
                            </div>
                        </div>
                        {bio.pdfs.length > 1 && (
                            <div className="flex justify-center gap-4 mt-8">
                                <button onClick={() => setActivePdfIdx(p => p > 0 ? p - 1 : bio.pdfs.length - 1)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><ArrowLeft size={20}/></button>
                                <button onClick={() => setActivePdfIdx(p => p < bio.pdfs.length - 1 ? p + 1 : 0)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><ChevronRight size={20}/></button>
                            </div>
                        )}
                    </div>
                )}

                {bio.socials && bio.socials.length > 0 && (
                    <div className="sb-social-hub">
                        {bio.socials.map((soc: any, i: number) => (
                            <a key={i} href={soc.url} target="_blank" rel="noreferrer" className="sb-social-icon">
                                <SocialIcon platform={soc.platform} />
                            </a>
                        ))}
                    </div>
                )}

                <footer className="mt-32 pb-10 flex flex-col items-center gap-4 opacity-10">
                    <div className="flex items-center gap-3">
                        <Zap size={22} fill="currentColor" className="text-[#acf800]" />
                        <span className="text-[11px] font-black tracking-[6px] uppercase">Plug & Sales Supreme</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default SmartBioView;
