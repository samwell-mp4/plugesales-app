import React, { useState } from 'react';
import { 
    FileText,
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
    Send
} from 'lucide-react';

const SmartBioCreator = () => {
    const [bio, setBio] = useState({
        title: 'Seu Nome ou Empresa',
        description: 'Breve descrição sobre o que você faz ou oferece.',
        avatar_url: '',
        video_url: '',
        buttons: [
            { label: 'Fale Conosco', url: '', type: 'whatsapp' },
            { label: 'Visualizar Prévia', url: '', type: 'preview' }
        ],
        images: [],
        slug: 'seu-link'
    });
    const [showPDFs, setShowPDFs] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [employeeData, setEmployeeData] = useState({
        name: '',
        photo: '',
        phone: '',
        tracking: ''
    });

    const addButton = () => {
        setBio(prev => ({ ...prev, buttons: [...prev.buttons, { label: 'Novo Link', url: '', type: 'link' }] }));
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

    const handleFinalizeDispatch = async () => {
        setIsSaving(true);
        try {
            // Simulated webhook call
            const payload = {
                bio,
                employee: employeeData,
                timestamp: new Date().toISOString()
            };
            console.log('Dispatching to webhook:', payload);
            await new Promise(resolve => setTimeout(resolve, 1500));
            setWizardStep(3);
        } catch (err) {
            console.error(err);
            alert('Erro ao enviar disparo');
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
                    gap: 20px;
                }

                .supreme-field-box {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 20px;
                    transition: all 0.3s;
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

                .preview-unique .phone-mockup-side {
                    position: sticky !important;
                    top: 20px !important;
                    background: linear-gradient(315deg, #0f172a, #1e293b, #0f172a) !important;
                    background-size: 400% 400% !important;
                    animation: gradientMove 12s ease infinite !important;
                    overflow: hidden !important;
                    z-index: 1;
                    border-radius: 40px;
                }
                
                @keyframes gradientMove {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .preview-unique .phone-mockup-side::before {
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

                .phone-preview-v2 {
                    background: transparent;
                    border: 1px solid rgba(172, 248, 0, 0.1);
                    border-radius: 40px;
                    padding: 50px 30px;
                    text-align: center;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
                    height: 700px;
                    overflow-y: auto;
                }

                .preview-unique .preview-title {
                    background: linear-gradient(135deg, #fff, var(--primary-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-size: 1.8rem !important;
                    font-weight: 900 !important;
                    margin-bottom: 8px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1px !important;
                }

                .preview-unique .phone-preview-v2 p {
                    color: rgba(255,255,255,0.8) !important;
                    font-size: 1rem !important;
                    margin-bottom: 12px !important;
                }

                .preview-unique .pdf-carousel {
                    display: flex;
                    overflow-x: auto;
                    gap: 12px;
                    padding: 8px 0;
                    scroll-snap-type: x mandatory;
                    margin-top: 12px;
                }

                .preview-unique .pdf-item {
                    flex: 0 0 auto;
                    min-width: 120px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 12px;
                    text-align: center;
                    scroll-snap-align: start;
                    color: #acf800;
                    text-decoration: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    transition: background 0.2s ease, border-color 0.2s ease;
                }

                .preview-unique .pdf-item:hover {
                    background: rgba(255,255,255,0.08);
                    border-color: var(--primary-color);
                }

                .preview-unique .pdf-icon {
                    color: var(--primary-color);
                }

                .preview-unique .phone-preview-v2 span {
                    color: var(--primary-color) !important;
                    font-weight: 900 !important;
                }

                .bio-avatar-ring {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 4px solid var(--primary-color);
                    margin: 0 auto 20px;
                    overflow: hidden;
                    background: #1f2937;
                }

                .bio-avatar-img { width: 100%; height: 100%; object-fit: cover; }
                
                .bio-btn-preview {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 14px;
                    color: white;
                    font-weight: 700;
                    font-size: 13px;
                    margin-bottom: 12px;
                }

                .bio-btn-preview:first-child {
                    background: var(--primary-color);
                    color: black;
                    border: none;
                }

                .switch-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 10px;
                    padding: 10px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .switch-label {
                    font-size: 11px;
                    font-weight: 900;
                    color: var(--primary-color);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .wizard-overlay {
                    position: fixed;
                    inset: 0;
                    background: #020617ee;
                    backdrop-filter: blur(40px) saturate(180%);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .wizard-card {
                    background: #0f172a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 48px;
                    width: 100%;
                    max-width: 1100px;
                    height: 800px;
                    display: grid;
                    grid-template-columns: 1fr 450px;
                    overflow: hidden;
                    box-shadow: 0 100px 150px -50px rgba(0,0,0,0.9);
                }
                .wizard-content {
                    padding: 80px;
                    display: flex;
                    flex-direction: column;
                    background: radial-gradient(circle at 0% 0%, rgba(172, 248, 0, 0.08), transparent 60%);
                }
                .wizard-preview-side {
                    background: #0b141a;
                    border-left: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                .wa-header-mock {
                    background: #202c33;
                    padding: 45px 25px 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border-bottom: 1px solid rgba(0,0,0,0.2);
                }
                .wa-avatar-mock {
                    width: 42px;
                    height: 42px;
                    background: #6a7175;
                    border-radius: 50%;
                    position: relative;
                    flex-shrink: 0;
                }
                .wa-status-dot {
                    width: 12px;
                    height: 12px;
                    background: #00a884;
                    border: 2px solid #202c33;
                    border-radius: 50%;
                    position: absolute;
                    bottom: 0;
                    right: 0;
                }
                .wa-body-mock {
                    flex: 1;
                    padding: 25px;
                    background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
                    background-size: 400px;
                    background-repeat: repeat;
                    background-blend-mode: overlay;
                    background-color: #0b141a;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    overflow-y: auto;
                }
                .wa-bubble-official {
                    background: #202c33;
                    border-radius: 0 16px 16px 16px;
                    max-width: 95%;
                    padding: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    position: relative;
                }
                .wa-sender-name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #53bdeb;
                    margin-bottom: 6px;
                    padding: 0 6px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .wa-verified-badge {
                    color: #00a884;
                    fill: #00a884;
                }
                .wa-message-text {
                    color: #e9edef;
                    font-size: 14.5px;
                    line-height: 1.6;
                    padding: 0 6px 8px;
                }
                .wa-link-preview-card {
                    background: rgba(0,0,0,0.25);
                    border-radius: 12px;
                    margin: 4px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .wa-preview-hero {
                    width: 100%;
                    height: 180px;
                    background: #1f2937;
                    object-fit: cover;
                }
                .wa-preview-body {
                    padding: 15px;
                    background: #182229;
                }
                .wa-preview-site {
                    color: #8696a0;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 4px;
                }
                .wa-preview-title {
                    color: white;
                    font-size: 15px;
                    font-weight: 700;
                    line-height: 1.3;
                }
                .wa-action-button {
                    background: #202c33;
                    margin-top: 10px;
                    padding: 12px;
                    border-radius: 12px;
                    text-align: center;
                    color: #53bdeb;
                    font-weight: 700;
                    font-size: 14px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .wa-action-button:hover { background: #2a3942; }
                .wizard-title {
                    font-size: 3.5rem;
                    font-weight: 950;
                    letter-spacing: -4px;
                    line-height: 0.9;
                    margin-bottom: 20px;
                }
                .step-label {
                    font-size: 10px;
                    font-weight: 900;
                    color: var(--primary-color);
                    text-transform: uppercase;
                    letter-spacing: 4px;
                    margin-bottom: 15px;
                    display: block;
                }
            `}</style>

            <header className="crm-header-premium">
                <div className="crm-title-group">
                    <span className="crm-badge-small">
                        <Smartphone size={12} fill="currentColor" /> SMART BIO CREATOR
                    </span>
                    <h1 className="crm-main-title">Páginas de Link</h1>
                    <p className="text-white/40 text-[11px] font-bold tracking-widest mt-1">
                        Sua central de conversão otimizada
                    </p>
                </div>

                <div className="flex gap-4">
                    <button onClick={handleSave} disabled={isSaving} className="btn-supreme">
                        <Save size={18} /> {isSaving ? 'Salvando...' : 'SALVAR SMART BIO'}
                    </button>
                </div>
            </header>

            <div className="creator-main-wrapper">
                <div className="editor-column">
                    <div className="crm-section-card">
                        <div className="section-header"><LinkIcon size={16} /> ENDEREÇO DA BIO</div>
                        <div className="supreme-field-box">
                            <label className="field-label">LINK PERSONALIZADO (SLUG)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-white/20 font-bold">plugsales.com/bio/</span>
                                <input className="field-input" type="text" value={bio.slug} onChange={(e) => setBio({ ...bio, slug: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="crm-section-card">
                        <div className="section-header"><Layout size={16} /> IDENTIDADE VISUAL</div>
                        <div className="input-grid-2 mb-5">
                            <div className="supreme-field-box">
                                <label className="field-label">TÍTULO DA PÁGINA</label>
                                <input className="field-input" type="text" value={bio.title} onChange={(e) => setBio({ ...bio, title: e.target.value })} />
                            </div>
                            <div className="supreme-field-box">
                                <label className="field-label">URL DO AVATAR</label>
                                <input className="field-input" type="text" value={bio.avatar_url} onChange={(e) => setBio({ ...bio, avatar_url: e.target.value })} />
                            </div>
                        </div>
                        <div className="supreme-field-box">
                            <label className="field-label">BIO / DESCRIÇÃO</label>
                            <textarea className="field-input" rows={2} value={bio.description} onChange={(e) => setBio({ ...bio, description: e.target.value })} />
                        </div>
                    </div>

                    <div className="crm-section-card">
                        <div className="flex justify-between items-center mb-6">
                            <div className="section-header mb-0"><MousePointer2 size={16} /> BOTÕES DE AÇÃO</div>
                            <button onClick={addButton} className="btn-supreme" style={{ padding: '8px 16px', borderRadius: '10px' }}>
                                <Plus size={18} /> ADICIONAR
                            </button>
                        </div>
                        
                        {bio.buttons.map((btn, index) => (
                            <div key={index} className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-4">
                                <div className="input-grid-2 mb-4">
                                    <div className="supreme-field-box">
                                        <label className="field-label flex items-center gap-2">
                                            TEXTO {btn.type === 'preview' && <span className="bg-primary-color/20 text-primary-color px-2 py-0.5 rounded text-[7px]">DISPARA WIZARD</span>}
                                        </label>
                                        <input className="field-input" type="text" value={btn.label} onChange={(e) => updateButton(index, 'label', e.target.value)} />
                                    </div>
                                    <div className="supreme-field-box">
                                        <label className="field-label">URL</label>
                                        <input className="field-input" type="text" value={btn.url} onChange={(e) => updateButton(index, 'url', e.target.value)} />
                                    </div>
                                </div>
                                <button onClick={() => removeButton(index)} className="text-red-500 font-bold text-[9px] uppercase flex items-center gap-2">
                                    <Trash2 size={14} /> REMOVER
                                </button>
                            </div>
                        ))}

                        <div className="switch-container">
                            <input 
                                type="checkbox" 
                                id="pdf-toggle"
                                checked={showPDFs} 
                                onChange={(e) => setShowPDFs(e.target.checked)}
                                style={{ accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                            />
                            <label htmlFor="pdf-toggle" className="switch-label">Mostrar Carrossel de PDFs</label>
                        </div>
                    </div>
                </div>

                <div className="preview-unique">
                    <div className="phone-mockup-side">
                        <div className="phone-preview-v2 no-scrollbar">
                            <div className="bio-avatar-ring">
                                {bio.avatar_url ? (
                                    <img src={bio.avatar_url} className="bio-avatar-img" alt="Avatar" />
                                ) : (
                                    <User size={40} className="text-white/20 mt-6 mx-auto" />
                                )}
                            </div>
                            <h2 className="preview-title">{bio.title}</h2>
                            <p className="text-white/40 text-[10px] mb-8 px-4">{bio.description}</p>
                            
                            <div className="space-y-3">
                                {bio.buttons.map((btn, i) => (
                                    <div 
                                        key={i} 
                                        className="bio-btn-preview" 
                                        onClick={() => btn.type === 'preview' && setIsWizardOpen(true)}
                                        style={{ cursor: btn.type === 'preview' ? 'pointer' : 'default' }}
                                    >
                                        {btn.label}
                                    </div>
                                ))}
                            </div>

                            {showPDFs && (
                                <div className="pdf-carousel">
                                    <a className="pdf-item" href="/pdfs/guia-vendas.pdf" target="_blank" rel="noopener noreferrer">
                                        <div className="pdf-icon"><FileText size={24} /></div>
                                        <span>Guia de Vendas.pdf</span>
                                    </a>
                                    <a className="pdf-item" href="/pdfs/manual-produto.pdf" target="_blank" rel="noopener noreferrer">
                                        <div className="pdf-icon"><FileText size={24} /></div>
                                        <span>Manual de Produto.pdf</span>
                                    </a>
                                </div>
                            )}

                            <div className="mt-12 pt-10 border-t border-white/5 opacity-20">
                                <div className="footer-text" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', color: 'var(--primary-color)', marginTop: '12px' }}>
                                    Plug & Sales
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isWizardOpen && (
                <div className="wizard-overlay">
                    <div className="wizard-card animate-fade-in">
                        <div className="wizard-content">
                            <div className="step-indicator">
                                <div className={`step-dot ${wizardStep >= 1 ? 'active' : ''}`} />
                                <div className={`step-dot ${wizardStep >= 2 ? 'active' : ''}`} />
                                <div className={`step-dot ${wizardStep >= 3 ? 'active' : ''}`} />
                            </div>

                            {wizardStep === 1 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h2 className="wizard-title">Identidade do <span className="text-primary-color">Funcionário</span></h2>
                                        <p className="text-white/40 text-sm">Personalize quem está enviando esta Smart Bio.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="supreme-field-box">
                                            <label className="field-label">NOME DO FUNCIONÁRIO</label>
                                            <input 
                                                className="field-input" 
                                                placeholder="Ex: Ana Souza" 
                                                value={employeeData.name}
                                                onChange={e => setEmployeeData({...employeeData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="supreme-field-box">
                                            <label className="field-label">URL DA FOTO DE PERFIL</label>
                                            <input 
                                                className="field-input" 
                                                placeholder="https://..." 
                                                value={employeeData.photo}
                                                onChange={e => setEmployeeData({...employeeData, photo: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-8 flex gap-4">
                                        <button onClick={() => setIsWizardOpen(false)} className="nav-btn nav-btn-secondary">CANCELAR</button>
                                        <button onClick={() => setWizardStep(2)} className="nav-btn nav-btn-primary flex-1">PRÓXIMO PASSO <ChevronRight size={18}/></button>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 2 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h2 className="wizard-title">Configurar <span className="text-primary-color">Disparo</span></h2>
                                        <p className="text-white/40 text-sm">Defina o destino e o código de rastreio.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="supreme-field-box">
                                            <label className="field-label">CÓDIGO DE TRACKING (UTM)</label>
                                            <input 
                                                className="field-input" 
                                                placeholder="Ex: campanha-maio" 
                                                value={employeeData.tracking}
                                                onChange={e => setEmployeeData({...employeeData, tracking: e.target.value})}
                                            />
                                        </div>
                                        <div className="supreme-field-box">
                                            <label className="field-label">WHATSAPP DE DESTINO</label>
                                            <input 
                                                className="field-input" 
                                                placeholder="Ex: 5511999999999" 
                                                value={employeeData.phone}
                                                onChange={e => setEmployeeData({...employeeData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-8 flex gap-4">
                                        <button onClick={() => setWizardStep(1)} className="nav-btn nav-btn-secondary"><ArrowLeft size={18}/> VOLTAR</button>
                                        <button onClick={handleFinalizeDispatch} disabled={isSaving} className="nav-btn nav-btn-primary flex-1">
                                            {isSaving ? 'ENVIANDO...' : 'FINALIZAR E ENVIAR'} <Send size={18}/>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {wizardStep === 3 && (
                                <div className="space-y-8 animate-fade-in text-center py-20">
                                    <div className="w-20 h-20 bg-primary-color/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check size={40} className="text-primary-color" />
                                    </div>
                                    <div>
                                        <h2 className="wizard-title">Disparo <span className="text-primary-color">Realizado!</span></h2>
                                        <p className="text-white/40 text-sm">O template foi gerado e enviado para a fila.</p>
                                    </div>
                                    <div className="pt-8">
                                        <button onClick={() => { setIsWizardOpen(false); setWizardStep(1); }} className="nav-btn nav-btn-primary mx-auto">CONCLUÍDO</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="wizard-preview-side">
                            <div className="wa-header-mock">
                                <div className="wa-avatar-mock">
                                    {employeeData.photo ? (
                                        <img src={employeeData.photo} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-white/40" />
                                    )}
                                    <div className="wa-status-dot" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-white text-[15px] font-bold leading-none">{employeeData.name || 'Sua Empresa'}</p>
                                        <Zap size={14} className="wa-verified-badge" fill="currentColor" />
                                    </div>
                                    <p className="text-[#00a884] text-[11px] mt-1 font-bold">Online agora</p>
                                </div>
                            </div>

                            <div className="wa-body-mock">
                                <div className="wa-bubble-official animate-fade-in">
                                    <div className="wa-sender-name">
                                        {employeeData.name || 'Atendimento'} 
                                        <Zap size={10} fill="currentColor" />
                                    </div>
                                    <p className="wa-message-text">
                                        Olá! 👋 Acabei de gerar sua página exclusiva com todos os nossos materiais e links oficiais. Clique abaixo para acessar:
                                    </p>
                                    
                                    <div className="wa-link-preview-card">
                                        {bio.avatar_url && (
                                            <img src={bio.avatar_url} className="wa-preview-hero" />
                                        )}
                                        <div className="wa-preview-body">
                                            <p className="wa-preview-site">PLUGSALES.COM</p>
                                            <p className="wa-preview-title">{bio.title}</p>
                                            <p className="text-[#8696a0] text-[12px] mt-1 line-clamp-1">{bio.description}</p>
                                        </div>
                                    </div>

                                    <div className="wa-action-button">
                                        <ExternalLink size={16} /> ACESSAR MEUS LINKS
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartBioCreator;
