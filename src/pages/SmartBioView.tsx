import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Zap, MessageCircle, ExternalLink, Loader2 } from 'lucide-react';

const SmartBioView = () => {
    const { slug } = useParams();
    const [bio, setBio] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBio = async () => {
            try {
                const res = await fetch(`/api/smart-bio/${slug}`);
                const data = await res.json();
                setBio(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBio();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-color" size={48} />
            </div>
        );
    }

    if (!bio) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-10">
                <h1 className="text-white font-black text-4xl mb-4">404</h1>
                <p className="text-white/40">Bio não encontrada.</p>
            </div>
        );
    }

    const handleButtonClick = async (btn: any) => {
        // Here we could track the click
        if (btn.type === 'whatsapp') {
            window.open(`https://wa.me/${btn.url.replace(/\D/g, '')}`, '_blank');
        } else {
            window.open(btn.url, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-10 pt-20">
            <style>{`
                .bio-avatar {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    border: 3px solid var(--primary-color);
                    margin-bottom: 24px;
                    box-shadow: 0 0 30px rgba(172, 248, 0, 0.2);
                }
                .bio-btn {
                    width: 100%;
                    max-width: 500px;
                    padding: 24px;
                    background: white;
                    color: black;
                    border-radius: 24px;
                    font-weight: 900;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 16px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .bio-btn:hover {
                    transform: scale(1.02);
                    background: var(--primary-color);
                }
                .video-container {
                    width: 100%;
                    max-width: 500px;
                    border-radius: 24px;
                    overflow: hidden;
                    margin-bottom: 32px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
            `}</style>

            <img src={bio.avatar_url || 'https://via.placeholder.com/150'} alt={bio.title} className="bio-avatar" />
            <h1 className="text-3xl font-black mb-2">{bio.title}</h1>
            <p className="text-white/40 text-center max-w-md mb-10 leading-relaxed">{bio.description}</p>

            {bio.video_url && (
                <div className="video-container">
                    <iframe 
                        width="100%" 
                        height="315" 
                        src={bio.video_url.replace('watch?v=', 'embed/')} 
                        title="Video"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            <div className="w-full flex flex-col items-center">
                {bio.buttons.map((btn: any, i: number) => (
                    <button key={i} onClick={() => handleButtonClick(btn)} className="bio-btn">
                        {btn.type === 'whatsapp' ? <MessageCircle size={24} /> : <ExternalLink size={24} />}
                        {btn.label}
                    </button>
                ))}
            </div>

            <footer className="mt-auto pt-20 pb-10 opacity-30 flex items-center gap-2">
                <Zap size={16} fill="currentColor" />
                <span className="text-[11px] font-black tracking-widest uppercase">Powered by Plug & Sales</span>
            </footer>
        </div>
    );
};

export default SmartBioView;
