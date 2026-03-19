import { useState } from 'react';
import {
    User,
    Image as ImageIcon,
    Video,
    CheckCircle,
    ChevronRight,
    FileSpreadsheet,
    Activity,
    Send,
    Copy,
    Trash2,
    PlusCircle,
    ChevronDown,
    LayoutGrid
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import ClientAuth from './ClientAuth';

const ClientExternalForm = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        profile_photo: '',
        profile_name: '',
        ddd: '',
        ads: [{
            template_type: 'none' as 'none' | 'image' | 'video',
            media_url: '',
            ad_copy: 'Oi {{1}}! Informamos que {{2}}\n\n{{3}}\n\nPara {{4}}, clique no botão abaixo 👇',
            ad_copy_file: '',
            button_link: '',
            spreadsheet_url: '',
            message_mode: 'manual' as 'manual' | 'upload',
            ad_name: '',
            variables: ['', '', '', ''],
            id: '1'
        }],
        currentAdIndex: 0,
        status: 'PENDENTE'
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleFileUpload = async (file: File, field: 'profile_photo' | 'media_url' | 'spreadsheet_url' | 'ad_copy_file') => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            setIsUploading(true);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload
            });

            if (!res.ok) throw new Error("Upload failed");

            const result = await res.json();
            if (result.success) {
                if (field === 'media_url') {
                    const newAds = [...formData.ads];
                    newAds[formData.currentAdIndex].media_url = result.url;
                    setFormData(prev => ({ ...prev, ads: newAds }));
                } else if (field === 'spreadsheet_url') {
                    const newAds = [...formData.ads];
                    newAds[formData.currentAdIndex].spreadsheet_url = result.url;
                    setFormData(prev => ({ ...prev, ads: newAds }));
                } else if (field === 'ad_copy_file') {
                    const newAds = [...formData.ads];
                    newAds[formData.currentAdIndex].ad_copy_file = result.url;
                    setFormData(prev => ({ ...prev, ads: newAds }));
                }
                else {
                    setFormData(prev => ({ ...prev, [field]: result.url }));
                }
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Erro no upload do arquivo.');
        } finally {
            setIsUploading(false);
        }
    };

    const getValidationErrors = () => {
        const errors: string[] = [];
        
        // Step 1 check
        if (!formData.profile_name) errors.push("Identidade: Nome do Atendimento é obrigatório.");
        if (!formData.ddd) errors.push("Identidade: DDD Regional é obrigatório.");

        // Step 2 ads check
        formData.ads.forEach((ad, idx) => {
            const adLabel = ad.ad_name ? `Anúncio "${ad.ad_name}"` : `Anúncio #${idx + 1}`;
            
            if (!ad.spreadsheet_url) {
                errors.push(`${adLabel}: Falta carregar a planilha de contatos.`);
            }
            
            if (ad.template_type !== 'none' && !ad.media_url) {
                errors.push(`${adLabel}: Escolheu ${ad.template_type === 'image' ? 'Imagem' : 'Vídeo'}, mas não enviou o arquivo.`);
            }

            if (ad.message_mode === 'upload' && !ad.ad_copy_file) {
                errors.push(`${adLabel}: Selecionou importar mensagem por arquivo, mas não enviou o arquivo (TXT/Excel).`);
            }
        });

        return errors;
    };

    const handleSubmit = async () => {
        const errors = getValidationErrors();
        
        if (!formData.profile_name || !formData.ddd) {
            alert("⚠️ Por favor preencha o Nome do Atendimento e o DDD antes de continuar.");
            return;
        }

        if (errors.length > 0) {
            const continuar = window.confirm(
                "⚠️ ATENÇÃO - Campos Incompletos:\n\n" + errors.join("\n") + "\n\nDeseja enviar mesmo assim?"
            );
            if (!continuar) return;
        }

        setIsSubmitting(true);
        try {
            // Build clean payload (exclude currentAdIndex from submission)
            const payload = {
                profile_photo: formData.profile_photo,
                profile_name: formData.profile_name,
                ddd: formData.ddd,
                status: formData.status,
                submitted_by: user?.name || 'cliente', // Atribuição solicitada
                user_id: user?.id,
                ads: formData.ads.map(ad => ({
                    ad_name: ad.ad_name,
                    template_type: ad.template_type,
                    media_url: ad.media_url,
                    ad_copy: ad.ad_copy,
                    ad_copy_file: ad.ad_copy_file,
                    button_link: ad.button_link,
                    spreadsheet_url: ad.spreadsheet_url,
                    message_mode: ad.message_mode,
                    variables: ad.variables,
                    id: ad.id,
                })),
                // Keep top-level fields for backward compat (first ad)
                template_type: formData.ads[0]?.template_type || 'none',
                media_url: formData.ads[0]?.media_url || '',
                ad_copy: formData.ads[0]?.ad_copy || '',
                button_link: formData.ads[0]?.button_link || '',
                spreadsheet_url: formData.ads[0]?.spreadsheet_url || '',
            };

            const result = await dbService.addClientSubmission(payload);
            if (result && result.id) {
                setStep(4); // Success step
            } else {
                alert("Erro ao enviar os dados. Tente novamente.");
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert("Erro crítico ao salvar. Verifique a conexão.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.profile_name || !formData.ddd) {
                alert("Por favor, preencha o Nome do Atendimento e o DDD antes de continuar.");
                return;
            }
        }
        if (step === 2) {
            const currentAd = formData.ads[formData.currentAdIndex];
            if (!currentAd.spreadsheet_url) {
                alert(`Por favor, envie a planilha de destinatários para o Anúncio #${formData.currentAdIndex + 1} antes de prosseguir.`);
                return;
            }
            if (currentAd.message_mode === 'upload' && !currentAd.ad_copy_file) {
                alert(`Por favor, envie o arquivo de mensagem para o Anúncio #${formData.currentAdIndex + 1} antes de prosseguir.`);
                return;
            }
        }
        setStep(prev => Math.min(prev + 1, 3));
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    if (!user) {
        return <ClientAuth />;
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
            <style>{`
                .glass-card {
                    margin-top: 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(24px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                }
                .whatsapp-grid { display: flex; flex-direction: column; gap: 32px; max-width: 800px; margin: 0 auto; }
                

                .input-premium {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 12px 16px;
                    border-radius: 12px;
                    width: 100%;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                }
                .input-premium:focus { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.03); box-shadow: 0 0 15px rgba(172, 248, 0, 0.1); outline: none; }

                .upload-zone {
                    border: 1.5px dashed rgba(255,255,255,0.15);
                    border-radius: 16px;
                    padding: 32px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .upload-zone:hover { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.04); transform: translateY(-2px); }

                .step-pill {
                    width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    background: rgba(255,255,255,0.04); font-weight: 800; border: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem;
                }
                .step-pill.active { background: var(--primary-color); color: black; border-color: var(--primary-color); }
                .step-pill.completed { background: var(--primary-color); color: black; }

                .form-section-title { font-size: 1.2rem; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 4px; }
                .form-section-subtitle { font-size: 0.85rem; font-weight: 600; opacity: 0.5; margin-bottom: 32px; }

                .creative-card {
                    background: rgba(255,255,255,0.02);
                    border: 1.5px solid rgba(255,255,255,0.05);
                    padding: 10px 16px;
                    border-radius: 14px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    display: flex;
                    flex-direction: row !important;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    position: relative;
                    flex: 1;
                    min-width: 0;
                }
                .creative-card:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
                .creative-card.active { border-color: var(--primary-color); background: rgba(172,248,0,0.08); }
                .creative-card.active .icon-box { color: var(--primary-color); }

                .tabs-container {
                    display: none;
                }

                .ad-selector-btn {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 10px 20px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    z-index: 50;
                }
                .ad-selector-btn:hover { background: rgba(255,255,255,0.06); border-color: var(--primary-color); }
                .ad-selector-btn.active { background: rgba(172,248,0,0.1); border-color: var(--primary-color); }

                .ad-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    width: 300px;
                    background: #111827; /* Darker, more solid background */
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    padding: 8px;
                    z-index: 999; /* Ensure it's on top */
                    animation: slide-down 0.2s ease-out;
                }
                @keyframes slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                .ad-item {
                    padding: 8px 12px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 2px;
                }
                .ad-item:hover { background: rgba(255,255,255,0.05); }
                .ad-item.active { background: rgba(172,248,0,0.1); }

                .action-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    color: rgba(255,255,255,0.5);
                    background: rgba(255,255,255,0.05); /* Added subtle background */
                    border: none;
                }
                .action-btn:hover { background: rgba(255,255,255,0.1); color: white; }
                .action-btn.delete:hover { background: rgba(244,63,94,0.2); color: #fb7185; }

                .mode-toggle {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 4px;
                    display: inline-flex;
                    gap: 4px;
                }
                .mode-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: rgba(255,255,255,0.4);
                    border: none;
                    background: transparent;
                }
                .mode-btn.active {
                    background: #fff;
                    color: #000;
                    box-shadow: 0 4px 12px rgba(255,255,255,0.2);
                }
                .mode-btn:not(.active):hover {
                    color: rgba(255,255,255,0.8);
                    background: rgba(255,255,255,0.05);
                }

                .nav-btn {
                    padding: 14px 28px;
                    border-radius: 14px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    font-size: 11px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .nav-btn-primary {
                    background: var(--primary-gradient);
                    color: #000;
                    box-shadow: 0 8px 20px -6px var(--primary);
                }
                .nav-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px -8px var(--primary);
                    filter: brightness(1.1);
                }
                .nav-btn-secondary {
                    background: rgba(255,255,255,0.05);
                    color: rgba(255,255,255,0.5);
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .nav-btn-secondary:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                    border-color: rgba(255,255,255,0.2);
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
                {step < 4 && (
                    <div className="whatsapp-grid">
                        {/* FORM SIDE */}
                        <div className="animate-slide-up w-full">
                            <div className="mb-12 flex items-center justify-between">
                                <div>
                                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-2px' }}>
                                        Configure sua <span style={{ color: 'var(--primary-color)' }}>Marca</span>
                                    </h1>
                                    <p style={{ opacity: 0.6, fontWeight: 600 }}>PREENCHA OS DETALHES PARA ENVIAR AOS SEUS CLIENTES</p>
                                </div>
                            </div>

                            {/* STEPS INDICATOR */}
                            <div className="flex items-center gap-4 mb-12">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`step-pill ${step === i ? 'active' : step > i ? 'completed' : ''}`}>
                                            {step > i ? <CheckCircle size={20} /> : i}
                                        </div>
                                        {i < 3 && <div style={{ width: '40px', height: '2px', background: step > i ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)' }} />}
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card rounded-[32px] p-6 lg:p-10 mb-8">
                                {step === 1 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h2 className="form-section-title">IDENTIDADE DA MARCA</h2>
                                            <p className="form-section-subtitle">Como sua marca aparecerá no WhatsApp dos clientes.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40">Foto do Perfil</label>
                                                <div className="upload-zone group" style={{ padding: '8px', width: '140px', height: '140px', borderRadius: '100%', margin: '0 auto' }} onClick={() => document.getElementById('photo-upload')?.click()}>
                                                    <input id="photo-upload" type="file" hidden accept="image/*" onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload(file, 'profile_photo');
                                                    }} />
                                                    {formData.profile_photo ? (
                                                        <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-300 overflow-hidden rounded-full">
                                                            <img 
                                                                src={formData.profile_photo} 
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                                                className="border-4 border-primary/20 shadow-xl" 
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-4 border-primary shadow-[0_0_20px_rgba(172,248,0,0.3)]">
                                                                <ImageIcon size={24} className="text-primary" />
                                                            </div>
                                                        </div>
                                                    ) : isUploading ? (
                                                        <Activity className="animate-spin text-primary mx-auto" size={32} />
                                                    ) : (
                                                        <div className="opacity-30 flex flex-col items-center justify-center h-full">
                                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                                                <User size={24} />
                                                            </div>
                                                            <p className="text-[8px] font-black uppercase text-center leading-tight">Enviar<br />Foto</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-8 mt-4">
                                                <div className="space-y-3 mt-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40">Nome do Atendimento</label>
                                                    <input className="input-premium py-4" placeholder="Ex: Central da Marca" value={formData.profile_name} onChange={e => setFormData(p => ({ ...p, profile_name: e.target.value }))} />
                                                </div>
                                                <div className="space-y-3 mt-4">
                                                    <label className="mt-[2px] text-[10px] font-black uppercase tracking-[2px] opacity-40">DDD Regional</label>
                                                    <input className="input-premium py-4" placeholder="Ex: 11" maxLength={2} value={formData.ddd} onChange={e => setFormData(p => ({ ...p, ddd: e.target.value.replace(/\D/g, '') }))} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between pt-10 border-t border-white/5">
                                            <button
                                                onClick={prevStep}
                                                className="nav-btn nav-btn-secondary"
                                            >
                                                VOLTAR
                                            </button>
                                            <button
                                                onClick={nextStep}
                                                className="nav-btn nav-btn-primary"
                                            >
                                                PRÓXIMA ETAPA <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8 animate-fade-in">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="form-section-title">CONTEÚDO DA MENSAGEM</h2>
                                                <p className="form-section-subtitle">O que o cliente receberá no celular.</p>
                                            </div>
                                            <div className="relative" style={{ position: 'relative' }}>
                                                <div
                                                    className={`ad-selector-btn ${dropdownOpen ? 'active' : ''}`}
                                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                                        <LayoutGrid size={18} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[9px] font-black opacity-40 leading-none mb-1 uppercase">Selecionado</p>
                                                        <p className="text-xs font-black uppercase tracking-widest text-primary">Anúncio #{formData.currentAdIndex + 1}</p>
                                                    </div>
                                                    <ChevronDown size={16} className={`ml-4 opacity-30 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                                </div>

                                                {dropdownOpen && (
                                                    <div className="ad-dropdown" onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center justify-between px-2 mb-3 mt-1">
                                                            <p className="text-[10px] font-black uppercase tracking-[1.5px] opacity-40">Anúncios ({formData.ads.length})</p>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    title="Novo"
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData(p => ({
                                                                            ...p,
                                                                            ads: [...p.ads, {
                                                                                template_type: 'none',
                                                                                media_url: '',
                                                                                ad_copy: 'Oi {{1}}! Informamos que {{2}}\n\n{{3}}\n\nPara {{4}}, clique no botão abaixo 👇',
                                                                                ad_copy_file: '',
                                                                                button_link: '',
                                                                                spreadsheet_url: '',
                                                                                message_mode: 'manual',
                                                                                ad_name: '',
                                                                                variables: ['', '', '', ''],
                                                                                id: String(Date.now())
                                                                            }],
                                                                            currentAdIndex: p.ads.length
                                                                        }));
                                                                        setDropdownOpen(false);
                                                                    }}
                                                                    className="w-7 h-7 rounded-md bg-primary text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                                                >
                                                                    <PlusCircle size={14} />
                                                                </button>
                                                                <button
                                                                    title="Bulk"
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const qty = prompt("Quantas cópias?", "1");
                                                                        if (qty && !isNaN(Number(qty))) {
                                                                            const count = Math.min(Number(qty), 20);
                                                                            const ad = formData.ads[formData.currentAdIndex];
                                                                            const newAds = Array.from({ length: count }, (_, i) => ({ 
                                                                                ...ad, 
                                                                                id: String(Date.now() + i),
                                                                                ad_copy_file: ad.ad_copy_file // ensure it copies too
                                                                            }));
                                                                            setFormData(p => ({ ...p, ads: [...p.ads, ...newAds], currentAdIndex: p.ads.length + count - 1 }));
                                                                            setDropdownOpen(false);
                                                                        }
                                                                    }}
                                                                    className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                                                                >
                                                                    <Copy size={14} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                                            {formData.ads.map((ad, idx) => (
                                                                <div
                                                                    key={ad.id || idx}
                                                                    className={`ad-item ${formData.currentAdIndex === idx ? 'active' : ''}`}
                                                                    onClick={() => {
                                                                        setFormData(p => ({ ...p, currentAdIndex: idx }));
                                                                        setDropdownOpen(false);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-black opacity-30">#{idx + 1}</span>
                                                                        <span className="text-[10px] font-bold uppercase tracking-widest">{ad.ad_name || (ad.template_type === 'none' ? 'Texto' : ad.template_type === 'image' ? 'Imagem' : 'Vídeo')}</span>
                                                                    </div>
                                                                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newAd = { ...ad, id: String(Date.now()) };
                                                                                setFormData(p => ({ ...p, ads: [...p.ads, newAd], currentAdIndex: p.ads.length }));
                                                                                setDropdownOpen(false);
                                                                            }}
                                                                            className="action-btn"
                                                                        >
                                                                            <Copy size={12} />
                                                                        </button>
                                                                        {formData.ads.length > 1 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newAds = formData.ads.filter((_, i) => i !== idx);
                                                                                    setFormData(p => ({ ...p, ads: newAds, currentAdIndex: Math.max(0, idx - 1) }));
                                                                                }}
                                                                                className="action-btn delete"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-2 space-y-8">
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40 mb-3 block">Nome do Anúncio</label>
                                                        <input
                                                            className="input-premium py-4"
                                                            placeholder="Ex: Campanha Verão 2024"
                                                            value={formData.ads[formData.currentAdIndex].ad_name || ''}
                                                            onChange={e => {
                                                                const newAds = [...formData.ads];
                                                                newAds[formData.currentAdIndex].ad_name = e.target.value;
                                                                setFormData(p => ({ ...p, ads: newAds }));
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="mt-4">
                                                        <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40 mb-4 block">Tipo de Criativo</label>
                                                        <div className="flex flex-row gap-6 w-full">
                                                            {(['none', 'image', 'video'] as const).map(t => (
                                                                <div key={t} onClick={() => {
                                                                    const newAds = [...formData.ads];
                                                                    newAds[formData.currentAdIndex].template_type = t;
                                                                    setFormData(p => ({ ...p, ads: newAds }));
                                                                }} className={`creative-card mt-4 ${formData.ads[formData.currentAdIndex].template_type === t ? 'active' : ''}`}>
                                                                    <div className="icon-box ">
                                                                        {t === 'none' ? <Send size={16} /> : t === 'image' ? <ImageIcon size={16} /> : <Video size={16} />}
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-wider">{t === 'none' ? 'Texto' : t === 'image' ? 'Imagem' : 'Vídeo'}</span>
                                                                    {formData.ads[formData.currentAdIndex].template_type === t && <div className="absolute top-2 right-2 text-primary"><CheckCircle size={14} /></div>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {formData.ads[formData.currentAdIndex].template_type !== 'none' && (
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40">Upload da Mídia</label>
                                                        <div className="upload-zone py-8" onClick={() => document.getElementById(`media-upload-${formData.currentAdIndex}`)?.click()}>
                                                            <input id={`media-upload-${formData.currentAdIndex}`} type="file" hidden accept={formData.ads[formData.currentAdIndex].template_type === 'image' ? 'image/*' : 'video/*'} onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'media_url')} />
                                                            {formData.ads[formData.currentAdIndex].media_url ? (
                                                                <div className="flex flex-col items-center gap-2 text-primary">
                                                                    <CheckCircle size={24} />
                                                                    <span className="font-bold text-[10px] uppercase">Arquivo Carregado</span>
                                                                </div>
                                                            ) : isUploading ? (
                                                                <Activity className="animate-spin text-primary" size={24} />
                                                            ) : (
                                                                <p className="text-[10px] font-black uppercase opacity-30">Enviar Arquivo</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6 mt-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40">Destinatários</label>
                                                    </div>
                                                    <div className="upload-zone py-8 flex items-center justify-center h-[140px]" onClick={() => document.getElementById(`spreadsheet-upload-${formData.currentAdIndex}`)?.click()}>
                                                        <input id={`spreadsheet-upload-${formData.currentAdIndex}`} type="file" hidden accept=".xlsx,.xls,.csv" onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleFileUpload(file, 'spreadsheet_url');
                                                        }} />
                                                        {formData.ads[formData.currentAdIndex].spreadsheet_url ? (
                                                            <div className="flex flex-col items-center gap-2 text-primary">
                                                                <FileSpreadsheet size={32} />
                                                                <span className="font-black text-[10px] uppercase tracking-widest text-center">Lista Adicionada!<br />({formData.ads[formData.currentAdIndex].spreadsheet_url.split('/').pop()?.substring(0, 10)}...)</span>
                                                            </div>
                                                        ) : (
                                                            <div className="opacity-30 text-center">
                                                                <FileSpreadsheet size={24} className="mx-auto mb-2" />
                                                                <p className="text-[9px] font-black uppercase tracking-widest">Enviar Excel/CSV</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mt-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40">Link do Botão</label>
                                                    <input className="input-premium py-4" placeholder="https://wa.me/..." value={formData.ads[formData.currentAdIndex].button_link} onChange={e => {
                                                        const newAds = [...formData.ads];
                                                        newAds[formData.currentAdIndex].button_link = e.target.value;
                                                        setFormData(p => ({ ...p, ads: newAds }));
                                                    }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mt-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40">Conteúdo da Mensagem</label>
                                                <div className="mode-toggle">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newAds = [...formData.ads];
                                                            newAds[formData.currentAdIndex].message_mode = 'manual';
                                                            setFormData(p => ({ ...p, ads: newAds }));
                                                        }}
                                                        className={`mode-btn ${formData.ads[formData.currentAdIndex].message_mode === 'manual' ? 'active' : ''}`}
                                                    >
                                                        Manual
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newAds = [...formData.ads];
                                                            newAds[formData.currentAdIndex].message_mode = 'upload';
                                                            setFormData(p => ({ ...p, ads: newAds }));
                                                        }}
                                                        className={`mode-btn ${formData.ads[formData.currentAdIndex].message_mode === 'upload' ? 'active' : ''}`}
                                                    >
                                                        Arquivo
                                                    </button>
                                                </div>
                                            </div>

                                            {formData.ads[formData.currentAdIndex].message_mode === 'manual' ? (
                                                <div className="space-y-16">
                                                    {/* PREVIEW AT TOP AS A READ-ONLY TEXT FIELD */}
                                                    <div className="space-y-6">
                                                        <label className="text-[12px] font-black uppercase tracking-[3px] opacity-40 flex items-center gap-3">
                                                        </label>
                                                        <div className="relative group mb-16">
                                                            <textarea
                                                                readOnly
                                                                className="input-premium w-full bg-white/[0.02] border-white/10 text-white/80 cursor-default select-none pt-12 text-xl leading-relaxed px-12 block"
                                                                value={formData.ads[formData.currentAdIndex].ad_copy}
                                                                style={{ resize: 'none', height: '150px' }}
                                                            />
                                                            <div className="absolute top-8 left-4 right-4 bottom-4 pointer-events-none overflow-hidden text-sm leading-relaxed whitespace-pre-wrap">
                                                                {/* Transparent overlay for variable highlighting if needed, but for now just a plain textarea is clearer as requested */}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-32 mt-24 border-t border-white/10 space-y-20">
                                                        <p className="text-[14px] font-black uppercase tracking-[5px] opacity-40 flex items-center gap-5">
                                                        </p>
                                                        <div className="flex flex-wrap -mx-6 pt-6">
                                                            {[1, 2, 3, 4].map(vNum => (
                                                                <div key={vNum} className="w-1/2 px-6 mb-16">
                                                                    <div className="space-y-6 mt-4">
                                                                        <label className="text-[12px] font-black uppercase tracking-[4px] opacity-70 text-primary-color">Variável {vNum}</label>
                                                                        <input
                                                                            className="input-premium py-10 px-12 text-xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/20 focus:border-primary/50"
                                                                            placeholder={`Valor de {{${vNum}}}`}
                                                                            value={formData.ads[formData.currentAdIndex].variables?.[vNum - 1] || ''}
                                                                            onChange={e => {
                                                                                const newAds = [...formData.ads];
                                                                                if (!newAds[formData.currentAdIndex].variables) {
                                                                                    newAds[formData.currentAdIndex].variables = ['', '', '', ''];
                                                                                }
                                                                                newAds[formData.currentAdIndex].variables[vNum - 1] = e.target.value;

                                                                                // Update ad_copy in real-time
                                                                                const v = newAds[formData.currentAdIndex].variables;
                                                                                const v1 = v[0] || '{{1}}';
                                                                                const v2 = v[1] || '{{2}}';
                                                                                const v3 = v[2] || '{{3}}';
                                                                                const v4 = v[3] || '{{4}}';
                                                                                newAds[formData.currentAdIndex].ad_copy = `Oi ${v1}! Informamos que ${v2}\n\n${v3}\n\nPara ${v4}, clique no botão abaixo 👇`;

                                                                                setFormData(p => ({ ...p, ads: newAds }));
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40">Importar Mensagem (TXT, Excel, CSV)</label>
                                                    <div className="upload-zone py-12 flex flex-col items-center justify-center gap-4" onClick={() => document.getElementById(`ad-copy-upload-${formData.currentAdIndex}`)?.click()}>
                                                        <input 
                                                            id={`ad-copy-upload-${formData.currentAdIndex}`} 
                                                            type="file" 
                                                            hidden 
                                                            accept=".txt,.xlsx,.xls,.csv" 
                                                            onChange={e => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleFileUpload(file, 'ad_copy_file');
                                                            }} 
                                                        />
                                                        {formData.ads[formData.currentAdIndex].ad_copy_file ? (
                                                            <div className="flex flex-col items-center gap-3 text-primary">
                                                                <CheckCircle size={32} />
                                                                <div className="text-center">
                                                                    <p className="font-black text-[10px] uppercase tracking-widest">Mensagem Importada!</p>
                                                                    <p className="text-[8px] opacity-60 mt-1 truncate max-w-[200px]">{formData.ads[formData.currentAdIndex].ad_copy_file.split('/').pop()}</p>
                                                                </div>
                                                            </div>
                                                        ) : isUploading ? (
                                                            <Activity className="animate-spin text-primary" size={32} />
                                                        ) : (
                                                            <div className="opacity-30 flex flex-col items-center gap-2">
                                                                <FileSpreadsheet size={32} />
                                                                <p className="text-[10px] font-black uppercase tracking-widest">Clique para enviar arquivo</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[9px] opacity-40 font-medium text-center">Formatos aceitos: .txt, .xlsx, .xls, .csv</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between pt-10 border-t border-white/5">
                                            <button
                                                onClick={prevStep}
                                                className="nav-btn nav-btn-secondary"
                                            >
                                                VOLTAR
                                            </button>
                                            <button
                                                onClick={nextStep}
                                                className="nav-btn nav-btn-primary"
                                            >
                                                PRÓXIMA ETAPA <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8 animate-fade-in">
                                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                            {formData.ads.map((ad, idx) => (
                                                                <div key={idx} className={`flex items-center gap-4 p-5 rounded-3xl bg-white/[0.02] border transition-all group relative overflow-hidden ${!ad.spreadsheet_url ? 'border-rose-500/30' : 'border-white/5 hover:border-primary/20'}`}>
                                                                    <div className={`absolute top-0 left-0 w-1 h-full ${!ad.spreadsheet_url ? 'bg-rose-500/50' : 'bg-primary/20'}`} />
                                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner ${!ad.spreadsheet_url ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                                                                        #{idx + 1}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1 ">
                                                                            <p className={`font-black text-[10px] uppercase tracking-widest ${!ad.spreadsheet_url ? 'text-rose-400' : 'text-primary/80'}`}>{ad.template_type === 'none' ? 'Texto' : ad.template_type === 'image' ? 'Imagem' : 'Vídeo'}</p>
                                                                            {ad.spreadsheet_url ? (
                                                                                <span className="flex items-center gap-1 text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full"><FileSpreadsheet size={10} /> LISTA OK</span>
                                                                            ) : (
                                                                                <span className="flex items-center gap-1 text-[8px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.4)]">FALTA PLANILHA</span>
                                                                            )}
                                                                            {ad.message_mode === 'upload' && (
                                                                                ad.ad_copy_file ? (
                                                                                    <span className="flex items-center gap-1 text-[8px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">📄 MENSAGEM OK</span>
                                                                                ) : (
                                                                                    <span className="flex items-center gap-1 text-[8px] font-black text-white bg-amber-500 px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.4)]">FALTA ARQUIVO MSG</span>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs opacity-50 truncate font-medium">{ad.message_mode === 'upload' && ad.ad_copy_file ? `Arquivo: ${ad.ad_copy_file.split('/').pop()}` : (ad.ad_copy || '(Mensagem Vazia)')}</p>
                                                                    </div>
                                                                    <button onClick={() => { setFormData(p => ({ ...p, currentAdIndex: idx })); setStep(2); }} className={`p-3 rounded-2xl transition-all ${!ad.spreadsheet_url ? 'bg-rose-500/20 text-white animate-bounce' : 'bg-white/5 hover:bg-white/10 text-primary'}`}>
                                                                        <ChevronRight size={18} />
                                                                    </button>
                                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-10 border-t border-white/5">
                                            <button
                                                onClick={prevStep}
                                                className="nav-btn nav-btn-secondary"
                                            >
                                                VOLTAR
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className={`nav-btn nav-btn-primary font-black text-sm flex items-center gap-2 transition-all mt-6 ${
                                                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_0_50px_rgba(172,248,0,0.3)]'
                                                }`}
                                            >
                                                {isSubmitting ? <Activity className="animate-spin" size={18} /> : <>GERAR CLIENTE <Send size={18} /></>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}


                {step === 4 && (
                    <div className="max-w-xl mx-auto py-24 text-center animate-slide-up">
                        <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-12 shadow-[0_0_80px_rgba(172,248,0,0.1)]">
                            <CheckCircle size={64} className="text-primary" />
                        </div>
                        <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-3px' }}>Tudo <span className="text-primary">Pronto!</span></h1>
                        <p className="text-xl font-bold opacity-60 mb-12">Seus dados e campanha foram enviados com sucesso. Agora nossa equipe processará sua lista.</p>
                        <button onClick={() => setStep(1)} className="btn btn-secondary px-8 py-4 rounded-[20px] font-black border border-white/10">
                            ENVIAR OUTRO FORMULÁRIO
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientExternalForm;
