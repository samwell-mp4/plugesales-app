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
    Zap,
    Share2,
    Check,
    CheckCircle2
} from 'lucide-react';

const DigitalCardView = () => {
    const { id } = useParams();
    const [card, setCard] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

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
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-color/20 border-t-primary-color rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!card) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center p-10">
                <h1 className="text-white font-black text-4xl mb-4">404</h1>
                <p className="text-white/40">Identidade não encontrada.</p>
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

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center px-6 py-20 relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-color/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-color/5 rounded-full blur-[120px] pointer-events-none"></div>
            
            <style>{`
                .identity-container {
                    width: 100%;
                    max-width: 400px;
                    background: #0f172a;
                    border: 1px solid rgba(172, 248, 0, 0.3);
                    border-radius: 48px;
                    padding: 60px 32px;
                    text-align: center;
                    box-shadow: 0 50px 100px rgba(0,0,0,0.8), 0 0 50px rgba(172, 248, 0, 0.05);
                    position: relative;
                    z-index: 10;
                }
                .wa-badge-verified {
                    background: rgba(37, 211, 102, 0.1);
                    color: #25d366;
                    font-size: 10px;
                    font-weight: 900;
                    padding: 6px 14px;
                    border-radius: 30px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 32px;
                    border: 1px solid rgba(37, 211, 102, 0.2);
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .avatar-wrapper {
                    position: relative;
                    width: fit-content;
                    margin: 0 auto 32px auto;
                }
                .avatar-wrapper::after {
                    content: '';
                    position: absolute;
                    inset: -10px;
                    border: 2px solid rgba(172, 248, 0, 0.3);
                    border-radius: 50%;
                    animation: pulse-ring 2s infinite;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.1); opacity: 0; }
                }
                .identity-avatar {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    border: 5px solid var(--primary-color);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    object-fit: cover;
                    position: relative;
                    z-index: 2;
                }
                .action-primary {
                    width: 100%;
                    padding: 24px;
                    background: var(--primary-gradient);
                    color: black;
                    border-radius: 24px;
                    font-weight: 1000;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 20px;
                    transition: all 0.3s;
                    border: none;
                    cursor: pointer;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    box-shadow: 0 10px 30px rgba(172, 248, 0, 0.3);
                }
                .action-secondary {
                    width: 100%;
                    padding: 20px;
                    background: rgba(255,255,255,0.03);
                    color: white;
                    border-radius: 24px;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 40px;
                    transition: all 0.3s;
                    border: 1px solid rgba(255,255,255,0.08);
                    cursor: pointer;
                }
                .social-row {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .social-icon-box {
                    width: 56px;
                    height: 56px;
                    border-radius: 18px;
                    background: rgba(255,255,255,0.03);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: all 0.3s;
                }
                .social-icon-box:hover {
                    background: white;
                    color: black;
                    transform: translateY(-5px);
                }
            `}</style>

            <div className="identity-container">
                <div className="wa-badge-verified">
                    <CheckCircle2 size={12} fill="currentColor" /> Atendimento Verificado
                </div>
                
                <div className="avatar-wrapper">
                    <img src={card.photo_url || 'https://via.placeholder.com/150'} alt={card.name} className="identity-avatar" />
                </div>

                <h1 className="text-3xl font-black mb-2">{card.name}</h1>
                <p className="text-primary-color font-bold text-xs uppercase tracking-[4px] mb-12">{card.company}</p>

                <div className="flex flex-col">
                    <button onClick={downloadVCard} className="action-primary">
                        <Download size={24} /> Salvar Contato
                    </button>
                    <button onClick={() => window.open(`https://wa.me/${card.whatsapp.replace(/\D/g, '')}`, '_blank')} className="action-secondary">
                        <MessageCircle size={22} className="text-[#25d366]" /> Iniciar Conversa
                    </button>
                </div>

                <div className="social-row">
                    {card.social_links.instagram && (
                        <a href={`https://instagram.com/${card.social_links.instagram.replace('@', '')}`} target="_blank" className="social-icon-box">
                            <Instagram size={24} />
                        </a>
                    )}
                    {card.social_links.linkedin && (
                        <a href={`https://linkedin.com/in/${card.social_links.linkedin}`} target="_blank" className="social-icon-box">
                            <Linkedin size={24} />
                        </a>
                    )}
                    {card.social_links.site && (
                        <a href={card.social_links.site} target="_blank" className="social-icon-box">
                            <Globe size={24} />
                        </a>
                    )}
                </div>

                <button onClick={copyToClipboard} className="text-[10px] font-black uppercase tracking-[2px] text-white/30 flex items-center gap-2 mx-auto hover:text-white transition-colors">
                    {isCopied ? <Check size={14} className="text-primary-color" /> : <Share2 size={14} />}
                    {isCopied ? 'Link de Vendas Copiado!' : 'Compartilhar Identidade'}
                </button>
            </div>

            <footer className="mt-20 flex flex-col items-center gap-2 opacity-30 z-10">
                <div className="flex items-center gap-2">
                    <Zap size={16} fill="currentColor" className="text-primary-color" />
                    <span className="text-[11px] font-black tracking-widest uppercase text-white">Plug & Sales Verified</span>
                </div>
            </footer>
        </div>
    );
};

export default DigitalCardView;
