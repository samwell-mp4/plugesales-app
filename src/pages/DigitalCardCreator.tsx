import React, { useState } from 'react';
import { 
    CreditCard, 
    QrCode, 
    Download, 
    Save, 
    User, 
    Smartphone, 
    Globe, 
    Instagram, 
    Linkedin,
    Trash2,
    Plus,
    Share2,
    Loader2
} from 'lucide-react';

const DigitalCardCreator = () => {
    const [card, setCard] = useState({
        name: 'Seu Nome Completo',
        company: 'Nome da Empresa',
        photo_url: '',
        whatsapp: '',
        social_links: {
            site: '',
            instagram: '',
            linkedin: ''
        }
    });
    const [isSaving, setIsSaving] = useState(false);
    const [generatedId, setGeneratedId] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/digital-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(card)
            });
            const data = await res.json();
            if (res.ok) {
                setGeneratedId(data.id);
                alert('Cartão Digital salvo com sucesso!');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

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

    const cardLink = generatedId ? `${window.location.origin}/card/${generatedId}` : null;
    const qrCodeUrl = cardLink ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(cardLink)}` : null;

    return (
        <div className="crm-container" style={{ padding: '40px' }}>
            <style>{`
                .card-preview {
                    width: 350px;
                    background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
                    border: 1px solid rgba(172, 248, 0, 0.1);
                    border-radius: 32px;
                    padding: 40px;
                    text-align: center;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.6);
                    position: relative;
                    overflow: hidden;
                }
                .card-preview::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(172,248,0,0.03) 0%, transparent 70%);
                    pointer-events: none;
                }
                .qr-box {
                    width: 200px;
                    height: 200px;
                    background: white;
                    border-radius: 24px;
                    margin: 0 auto 32px auto;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .input-group { margin-bottom: 24px; }
                .input-group label { display: block; font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.3); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                .card-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px 20px; color: white; font-weight: 600; outline: none; transition: all 0.2s; }
                .card-input:focus { border-color: var(--primary-color); background: rgba(255,255,255,0.05); }
            `}</style>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-white mb-2">CARTÃO DIGITAL</h1>
                            <p className="text-white/40 text-sm font-bold tracking-widest uppercase">Facilite o compartilhamento do seu contato</p>
                        </div>
                        <button onClick={handleSave} disabled={isSaving} className="px-10 py-5 bg-primary-color rounded-2xl text-black font-black hover:opacity-80 transition-all flex items-center gap-3">
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            SALVAR CARTÃO
                        </button>
                    </div>

                    <div className="bg-white/2 p-10 rounded-[32px] border border-white/5">
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="input-group">
                                <label><User size={14} className="inline mr-2" /> Nome Completo</label>
                                <input type="text" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="card-input" />
                            </div>
                            <div className="input-group">
                                <label><Smartphone size={14} className="inline mr-2" /> WhatsApp (com DDD)</label>
                                <input type="text" value={card.whatsapp} onChange={(e) => setCard({ ...card, whatsapp: e.target.value })} className="card-input" placeholder="5511..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="input-group">
                                <label>Empresa / Cargo</label>
                                <input type="text" value={card.company} onChange={(e) => setCard({ ...card, company: e.target.value })} className="card-input" />
                            </div>
                            <div className="input-group">
                                <label>URL da Foto de Perfil</label>
                                <input type="text" value={card.photo_url} onChange={(e) => setCard({ ...card, photo_url: e.target.value })} className="card-input" placeholder="https://..." />
                            </div>
                        </div>

                        <div className="mb-4 pt-6 border-t border-white/5">
                            <h3 className="text-white font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest opacity-50"><Globe size={16} /> REDES SOCIAIS</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="input-group">
                                    <label><Instagram size={14} className="inline mr-2" /> Instagram</label>
                                    <input type="text" value={card.social_links.instagram} onChange={(e) => setCard({ ...card, social_links: { ...card.social_links, instagram: e.target.value } })} className="card-input py-3" placeholder="@usuario" />
                                </div>
                                <div className="input-group">
                                    <label><Linkedin size={14} className="inline mr-2" /> LinkedIn</label>
                                    <input type="text" value={card.social_links.linkedin} onChange={(e) => setCard({ ...card, social_links: { ...card.social_links, linkedin: e.target.value } })} className="card-input py-3" placeholder="perfil" />
                                </div>
                                <div className="input-group">
                                    <label><Globe size={14} className="inline mr-2" /> Site / Linktree</label>
                                    <input type="text" value={card.social_links.site} onChange={(e) => setCard({ ...card, social_links: { ...card.social_links, site: e.target.value } })} className="card-input py-3" placeholder="www..." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="card-preview mb-10">
                        <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-6 border-4 border-primary-color/20 overflow-hidden">
                            {card.photo_url ? <img src={card.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><User size={48} /></div>}
                        </div>
                        <h2 className="text-white font-black text-2xl mb-1">{card.name}</h2>
                        <p className="text-primary-color font-bold text-xs uppercase tracking-widest mb-8">{card.company}</p>

                        <div className="qr-box">
                            {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" /> : <QrCode size={64} className="text-black/10" />}
                        </div>

                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Escaneie para salvar</p>

                        <div className="flex flex-col gap-4">
                            <button onClick={downloadVCard} className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                                <Download size={20} /> SALVAR CONTATO
                            </button>
                            {cardLink && (
                                <button onClick={() => { navigator.clipboard.writeText(cardLink); alert('Link copiado!'); }} className="w-full py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center gap-3">
                                    <Share2 size={20} /> COPIAR LINK
                                </button>
                            )}
                        </div>
                    </div>

                    {cardLink && (
                        <div className="text-center">
                            <p className="text-white/40 text-xs font-bold mb-2">SEU LINK ÚNICO:</p>
                            <a href={cardLink} target="_blank" className="text-primary-color font-black text-sm underline">{cardLink}</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DigitalCardCreator;
