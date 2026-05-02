import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Download, 
    MessageCircle, 
    Instagram, 
    Linkedin, 
    Globe, 
    User,
    Loader2,
    Zap
} from 'lucide-react';

const DigitalCardView = () => {
    const { id } = useParams();
    const [card, setCard] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const res = await fetch(`/api/digital-card/${id}`);
                const data = await res.json();
                setCard(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCard();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-color" size={48} />
            </div>
        );
    }

    if (!card) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-10">
                <h1 className="text-white font-black text-4xl mb-4">404</h1>
                <p className="text-white/40">Cartão não encontrado.</p>
            </div>
        );
    }

    const downloadVCard = () => {
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${card.name}
ORG:${card.company}
TEL;TYPE=CELL:${card.whatsapp}
END:VCARD`;
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${card.name.replace(/\s+/g, '_')}.vcf`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-10 pt-20">
            <style>{`
                .card-container {
                    width: 100%;
                    max-width: 400px;
                    background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
                    border: 1px solid rgba(172, 248, 0, 0.1);
                    border-radius: 40px;
                    padding: 48px 32px;
                    text-align: center;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
                }
                .view-avatar {
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    border: 4px solid var(--primary-color);
                    margin: 0 auto 32px auto;
                    box-shadow: 0 0 50px rgba(172, 248, 0, 0.1);
                }
                .social-btn {
                    width: 56px;
                    height: 56px;
                    border-radius: 18px;
                    background: rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    transition: all 0.2s;
                }
                .social-btn:hover {
                    background: var(--primary-color);
                    color: black;
                    transform: translateY(-5px);
                }
                .primary-action {
                    width: 100%;
                    padding: 24px;
                    background: white;
                    color: black;
                    border-radius: 24px;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 16px;
                    transition: all 0.2s;
                }
                .primary-action:hover {
                    background: var(--primary-color);
                }
            `}</style>

            <div className="card-container">
                <img src={card.photo_url || 'https://via.placeholder.com/150'} alt={card.name} className="view-avatar" />
                <h1 className="text-3xl font-black mb-2">{card.name}</h1>
                <p className="text-primary-color font-bold text-sm uppercase tracking-widest mb-10">{card.company}</p>

                <div className="flex flex-col gap-4 mb-10">
                    <button onClick={downloadVCard} className="primary-action shadow-xl">
                        <Download size={24} /> SALVAR CONTATO
                    </button>
                    <button onClick={() => window.open(`https://wa.me/${card.whatsapp.replace(/\D/g, '')}`, '_blank')} className="primary-action bg-white/5 text-white border border-white/10">
                        <MessageCircle size={24} /> CHAMAR NO WHATSAPP
                    </button>
                </div>

                <div className="flex justify-center gap-4">
                    {card.social_links.instagram && (
                        <a href={`https://instagram.com/${card.social_links.instagram.replace('@', '')}`} target="_blank" className="social-btn">
                            <Instagram size={24} />
                        </a>
                    )}
                    {card.social_links.linkedin && (
                        <a href={`https://linkedin.com/in/${card.social_links.linkedin}`} target="_blank" className="social-btn">
                            <Linkedin size={24} />
                        </a>
                    )}
                    {card.social_links.site && (
                        <a href={card.social_links.site} target="_blank" className="social-btn">
                            <Globe size={24} />
                        </a>
                    )}
                </div>
            </div>

            <footer className="mt-20 pb-10 opacity-30 flex items-center gap-2">
                <Zap size={16} fill="currentColor" />
                <span className="text-[11px] font-black tracking-widest uppercase">Powered by Plug & Sales</span>
            </footer>
        </div>
    );
};

export default DigitalCardView;
