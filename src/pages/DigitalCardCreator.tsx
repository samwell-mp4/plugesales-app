import React, { useState } from 'react';
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
    CheckCircle2
} from 'lucide-react';

const DigitalCardCreator = () => {
    const [card, setCard] = useState({
        name: 'Seu Nome Completo',
        photo_url: '',
        company: 'Sua Empresa / Cargo',
        whatsapp: '5511999999999',
        social_links: {
            instagram: '@seuusuario',
            linkedin: 'seu-perfil',
            site: 'https://...'
        }
    });
    const [isSaving, setIsSaving] = useState(false);
    const [savedId, setSavedId] = useState<string | null>(null);

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
                setSavedId(data.id);
                alert('Cartão criado com sucesso!');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="crm-container" style={{ padding: '20px 40px' }}>
            <style>{`
                .creator-main-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 40px;
                    margin-top: 20px;
                }
                @media (max-width: 1200px) {
                    .creator-main-wrapper {
                        grid-template-columns: 1fr;
                    }
                }

                .crm-section-card {
                    background: rgba(15, 23, 42, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    padding: 32px;
                    margin-bottom: 32px;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--primary-color);
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 24px;
                }

                .input-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px !important;
                }

                .supreme-field-box {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 20px;
                    transition: all 0.3s;
                    margin-bottom: 12px;
                }
                .supreme-field-box:focus-within {
                    border-color: var(--primary-color);
                    background: rgba(172, 248, 0, 0.02);
                }

                .field-label {
                    color: var(--primary-color);
                    font-size: 9px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 8px;
                    display: block;
                }

                .field-input {
                    background: transparent;
                    border: none;
                    color: white;
                    width: 100%;
                    font-weight: 700;
                    font-size: 15px;
                    outline: none;
                }

                /* PREVIEW CARD STYLES EXACTLY LIKE SCREENSHOT */
                .preview-sticky-side {
                    position: sticky;
                    top: 20px;
                }
                .preview-sticky-side .bg-blob:first-child {
                    top: -80px;
                    left: -80px;
                }
                .preview-sticky-side .bg-blob:nth-child(2) {
                    bottom: -80px;
                    right: -80px;
                }
                .preview-unique .vcard-preview-card {
                    position: relative;
                    overflow: hidden;
                    background: #111827;
                    border: 1px solid rgba(172, 248, 0, 0.1);
                    border-radius: 40px;
                    padding: 60px 40px;
                    text-align: center;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
                }
                 .preview-unique .vcard-preview-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 30% 30%, rgba(172, 248, 0, 0.15), transparent 70%);
                    animation: gradientShift 12s infinite alternate;
                    z-index: -1;
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                .bg-blob {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 260px;
                    height: 260px;
                    background: var(--primary-color);
                    filter: blur(90px);
                    opacity: 0.07;
                    border-radius: 50%;
                    animation: floatBlob 10s infinite alternate;
                    z-index: -1;
                }
                @keyframes floatBlob {
                    0% { transform: translate(-30%, -30%); }
                    100% { transform: translate(30%, 30%); }
                }
                .vcard-avatar-ring {
                    width: 130px;
                    height: 130px;
                    border-radius: 50%;
                    border: 4px solid var(--primary-color);
                    margin: 0 auto 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background: #1f2937;
                }
                .vcard-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .vcard-name {
                    color: white;
                    font-size: 24px;
                    font-weight: 900;
                    margin-bottom: 8px;
                }
                .vcard-company {
                    color: white;
                    opacity: 0.6;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 30px;
                }
                .vcard-social-row {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 30px;
                }
                .social-icon-box {
                    width: 44px;
                    height: 44px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .vcard-qr-placeholder {
                    margin-top: 20px;
                }
            `}</style>

            <header className="crm-header-premium">
                <div className="crm-title-group">
                    <span className="crm-badge-small">
                        <Zap size={12} fill="currentColor" /> NETWORKING DIGITAL
                    </span>
                    <h1 className="crm-main-title">Cartão de Visita</h1>
                    <p className="text-white/40 text-[11px] font-bold tracking-widest mt-1">
                        Sua identidade comercial em um QR Code
                    </p>
                </div>

                <button onClick={handleSave} disabled={isSaving} className="btn-supreme">
                    <Save size={18} /> {isSaving ? 'Gerando...' : 'GERAR CARTÃO DIGITAL'}
                </button>
            </header>

            <div className="creator-main-wrapper">
                <div className="editor-column">
                    <div className="crm-section-card">
                        <div className="section-header">
                            <User size={16} /> PERFIL PROFISSIONAL
                        </div>
                        <div className="input-grid-2 mb-5">
                            <div className="supreme-field-box">
                                <label className="field-label">NOME COMPLETO</label>
                                <input className="field-input" type="text" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                            </div>
                            <div className="supreme-field-box">
                                <label className="field-label">CARGO OU EMPRESA</label>
                                <input className="field-input" type="text" value={card.company} onChange={(e) => setCard({ ...card, company: e.target.value })} />
                            </div>
                        </div>
                        <div className="input-grid-2">
                            <div className="supreme-field-box">
                                <label className="field-label">WHATSAPP (COM DDD)</label>
                                <input className="field-input" type="text" value={card.whatsapp} onChange={(e) => setCard({ ...card, whatsapp: e.target.value })} />
                            </div>
                            <div className="supreme-field-box">
                                <label className="field-label">URL DA FOTO DE PERFIL</label>
                                <input className="field-input" type="text" value={card.photo_url} onChange={(e) => setCard({ ...card, photo_url: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="crm-section-card">
                        <div className="section-header">
                            <Globe size={16} /> CONECTIVIDADE
                        </div>
                        <div className="space-y-4">
                            <div className="supreme-field-box">
                                <label className="field-label">INSTAGRAM (USUÁRIO)</label>
                                <input className="field-input" type="text" value={card.social_links.instagram} onChange={(e) => setCard({ ...card, social_links: { ...card.social_links, instagram: e.target.value } })} />
                            </div>
                            <div className="supreme-field-box">
                                <label className="field-label">LINKEDIN (SLUG)</label>
                                <input className="field-input" type="text" value={card.social_links.linkedin} onChange={(e) => setCard({ ...card, social_links: { ...card.social_links, linkedin: e.target.value } })} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="preview-unique"><div className="preview-sticky-side">
                    <div className="vcard-preview-card"><div className="bg-blob"></div><div className="bg-blob" style={{ bottom: '-80px', right: '-80px' }}></div>
                        <div className="vcard-avatar-ring">
                            {card.photo_url ? (
                                <img src={card.photo_url} className="vcard-avatar-img" />
                            ) : (
                                <User size={50} className="text-white/20" />
                            )}
                        </div>
                        <h2 className="vcard-name">{card.name}</h2>
                        <p className="vcard-company">{card.company}</p>
                        
                        <div className="vcard-social-row">
                            <div className="social-icon-box"><Instagram size={20} /></div>
                            <div className="social-icon-box"><Linkedin size={20} /></div>
                            <div className="social-icon-box"><Globe size={20} /></div>
                        </div>

                        <div className="vcard-qr-placeholder">
                            <QrCode size={80} className="mx-auto text-white" />
                        </div>
                        <p className="text-white font-bold text-[10px] mt-6">QR Code gerado ao salvar</p>
                        <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
                            <Zap size={14} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase">Powered by Plug & Sales</span>
                        </div>
                    </div>
                </div></div>
            </div>
        </div>
    );
};

export default DigitalCardCreator;
