import React, { useState, useEffect } from 'react';
import {
    User,
    Image as ImageIcon,
    Video,
    CheckCircle2,
    FileSpreadsheet,
    Activity,
    MessageSquare,
    Send,
    Trash2,
    PlusCircle,
    Globe,
    Settings,
    ArrowRight,
    ArrowLeft,
    Check,
    AlertCircle,
    Eye,
    X,
    UploadCloud,
    Calendar,
    Sparkles,
    Layers,
    Smartphone,
    RefreshCw,
    ExternalLink,
    HelpCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import ClientAuth from './ClientAuth';

interface ClientExternalFormProps {
    isInternal?: boolean;
}

const ClientExternalForm: React.FC<ClientExternalFormProps> = ({ isInternal = false }) => {
    const { user } = useAuth() as any;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editingId = searchParams.get('id');

    const isStaff = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE' || isInternal;
    const [step, setStep] = useState<number>(isStaff ? 0 : 1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', email: '', phone: '', password: '' });
    const [hasSubmissions, setHasSubmissions] = useState(false);

    // Mobile view mode: 'form' or 'preview'
    const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
    // Mobile slide-up preview modal
    const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);

    useEffect(() => {
        if (isStaff) {
            dbService.getClients().then(setClients);
        } else if (user?.id) {
            dbService.getClientSubmissions().then(subs => {
                const userSubs = subs.filter((s: any) => String(s.user_id) === String(user.id));
                setHasSubmissions(userSubs.length > 0);
            });
        }
    }, [user, isStaff]);

    const [formData, setFormData] = useState({
        user_id: isStaff ? ('' as string | number) : user?.id,
        profile_photo: '',
        profile_name: '',
        ddd: '',
        notes: '',
        dispatch_date: '',
        ads: [{
            template_type: 'TEXT' as 'TEXT' | 'IMAGE' | 'VIDEO',
            media_url: '',
            ad_copy: 'Olá {{1}}\n\nEstamos informando {{2}}\n\n{{3}}\n\nPara {{4}} Clique no botão abaixo!',
            ad_copy_file: '',
            button_link: '',
            spreadsheet_url: '',
            message_mode: 'manual' as 'manual' | 'upload',
            ad_name: '',
            variables: ['', '', '', '', ''],
            showFifthVariable: false,
            id: '1'
        }],
        currentAdIndex: 0,
        status: 'PENDENTE'
    });

    useEffect(() => {
        if (editingId && user) {
            dbService.getClientSubmissionById(Number(editingId)).then(sub => {
                if (sub && !sub.error) {
                    const isOwner = user?.id ? String(sub.user_id) === String(user.id) : false;
                    const isParent = user?.id ? String(sub.parent_id) === String(user.id) : false;

                    if (isStaff || isOwner || isParent) {
                        let formattedDispatchDate = '';
                        if (sub.dispatch_date) {
                            try {
                                formattedDispatchDate = new Date(sub.dispatch_date).toISOString().slice(0, 16);
                            } catch (e) {
                                formattedDispatchDate = sub.dispatch_date;
                            }
                        }
                        setFormData({
                            user_id: sub.user_id || '',
                            profile_photo: sub.profile_photo || '',
                            profile_name: sub.profile_name || '',
                            ddd: sub.ddd || '',
                            notes: sub.notes || '',
                            dispatch_date: formattedDispatchDate,
                            ads: (sub.ads && sub.ads.length > 0) ? sub.ads.map((ad: any, idx: number) => ({
                                template_type: ad.template_type || 'TEXT',
                                media_url: ad.media_url || '',
                                ad_copy: ad.ad_copy || '',
                                ad_copy_file: ad.ad_copy_file || '',
                                button_link: ad.button_link || '',
                                spreadsheet_url: ad.spreadsheet_url || '',
                                message_mode: ad.message_mode || 'manual',
                                ad_name: ad.ad_name || '',
                                variables: ad.variables || ['', '', '', '', ''],
                                showFifthVariable: ad.showFifthVariable || false,
                                id: ad.id || String(idx + 1)
                            })) : [{
                                template_type: (sub.template_type || 'TEXT') as 'TEXT' | 'IMAGE' | 'VIDEO',
                                media_url: sub.media_url || '',
                                ad_copy: sub.ad_copy || '',
                                ad_copy_file: '',
                                button_link: sub.button_link || '',
                                spreadsheet_url: sub.spreadsheet_url || '',
                                message_mode: 'manual',
                                ad_name: '',
                                variables: ['', '', '', '', ''],
                                showFifthVariable: false,
                                id: '1'
                            }],
                            currentAdIndex: 0,
                            status: sub.status || 'PENDENTE'
                        });
                        setStep(1);
                    }
                }
            });
        }
    }, [editingId, user, isStaff]);

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
                } else {
                    setFormData(prev => ({ ...prev, [field]: result.url }));
                }
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Erro no upload do arquivo. Verifique o tamanho e tente novamente.');
        } finally {
            setIsUploading(false);
        }
    };

    const ensureProtocol = (url: string) => {
        if (!url) return '';
        const trimmed = url.trim();
        if (/^https:\/\//i.test(trimmed)) return trimmed;
        if (/^http:\/\//i.test(trimmed)) return trimmed.replace('http://', 'https://');
        if (trimmed.length > 0) return `https://${trimmed}`;
        return trimmed;
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await dbService.register({ ...newClientData, role: 'CLIENT' });
            if (result.error) {
                alert(result.error);
            } else {
                setClients(prev => [...prev, result.user]);
                setFormData(prev => ({ ...prev, user_id: result.user.id }));
                setIsCreatingClient(false);
                setNewClientData({ name: '', email: '', phone: '', password: '' });
                alert("Cliente criado com sucesso!");
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao criar cliente");
        }
    };

    const getValidationErrors = () => {
        const errors: string[] = [];
        if (!formData.profile_name) errors.push("Identidade: Nome do Atendimento é obrigatório.");
        if (!formData.ddd) errors.push("Identidade: DDD Regional é obrigatório.");

        formData.ads.forEach((ad, idx) => {
            const adLabel = ad.ad_name ? `Anúncio "${ad.ad_name}"` : `Anúncio #${idx + 1}`;
            if (!ad.spreadsheet_url) errors.push(`${adLabel}: Falta carregar a planilha de contatos.`);
            if (ad.template_type !== 'TEXT' && !ad.media_url) errors.push(`${adLabel}: Escolheu ${ad.template_type === 'IMAGE' ? 'Imagem' : 'Vídeo'}, mas não enviou o arquivo.`);
            if (ad.message_mode === 'upload' && !ad.ad_copy_file) errors.push(`${adLabel}: Selecionou importar mensagem por arquivo, mas não enviou o arquivo (TXT).`);
        });

        return errors;
    };

    const handleSubmit = async () => {
        const errors = getValidationErrors();
        if (!formData.profile_name || !formData.ddd) {
            alert("⚠️ Por favor preencha o Nome do Atendimento e o DDD antes de continuar.");
            setStep(1);
            return;
        }

        if (errors.length > 0) {
            const continuar = window.confirm("⚠️ ATENÇÃO - Campos Incompletos:\n\n" + errors.join("\n") + "\n\nDeseja enviar mesmo assim?");
            if (!continuar) return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                profile_photo: formData.profile_photo,
                profile_name: formData.profile_name,
                ddd: formData.ddd,
                notes: formData.notes,
                dispatch_date: formData.dispatch_date || null,
                status: formData.status,
                submitted_by: user?.name || 'cliente',
                submitted_role: user?.role || 'CLIENT',
                user_id: formData.user_id || user?.id,
                ads: formData.ads.map(ad => ({
                    ...ad,
                    original_button_link: ad.button_link,
                })),
                template_type: formData.ads[0]?.template_type || 'TEXT',
                media_url: formData.ads[0]?.media_url || '',
                ad_copy: formData.ads[0]?.ad_copy || '',
                button_link: formData.ads[0]?.button_link || '',
                original_button_link: formData.ads[0]?.button_link || '',
                spreadsheet_url: formData.ads[0]?.spreadsheet_url || '',
                origin: 'CLIENT_FORM'
            };

            let result;
            if (editingId) {
                result = await dbService.updateClientSubmission(Number(editingId), payload);
            } else {
                result = await dbService.addClientSubmission(payload);
            }

            if (result && (result.id || result.success || !result.error)) {
                setStep(4);
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
        if (step === 0 && !formData.user_id && isStaff) {
            alert("Por favor, selecione ou cadastre um cliente antes de continuar.");
            return;
        }
        if (step === 1 && (!formData.profile_name || !formData.ddd)) {
            alert("Por favor, preencha o Nome do Atendimento e o DDD antes de continuar.");
            return;
        }
        if (step === 2) {
            const currentAd = formData.ads[formData.currentAdIndex];
            if (!currentAd.spreadsheet_url) {
                const proceedWithoutSheet = window.confirm(`Aviso: A planilha de destinatários para o Anúncio #${formData.currentAdIndex + 1} não foi carregada ainda. Deseja prosseguir para a revisão mesmo assim?`);
                if (!proceedWithoutSheet) return;
            }
        }
        setStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, isStaff ? 0 : 1));

    if (!user) return <ClientAuth />;

    const currentAd = formData.ads[formData.currentAdIndex] || formData.ads[0];

    // Helper to render message copy with resolved or formatted variables in preview
    const renderPreviewCopy = () => {
        let text = currentAd.ad_copy || '';
        // If empty, generate standard template
        if (!text) {
            const v = currentAd.variables || [];
            const v1 = v[0] || '{{1}}';
            const v2 = v[1] || '{{2}}';
            const v3 = v[2] || '{{3}}';
            const v4 = v[3] || '{{4}}';
            text = `Olá ${v1}\n\nEstamos informando ${v2}\n\n${v3}\n\nPara ${v4} Clique no botão abaixo!`;
        }
        return text;
    };

    // Steps configuration
    const stepsConfig = [
        ...(isStaff ? [{ id: 0, title: 'Cliente', desc: 'Vincular conta', icon: User }] : []),
        { id: 1, title: 'Identidade', desc: 'Marca & Horário', icon: Sparkles },
        { id: 2, title: 'Criativo', desc: 'Mídia & Mensagem', icon: Layers },
        { id: 3, title: 'Revisão', desc: 'Conferir & Enviar', icon: Send },
    ];

    // Component: WhatsApp Phone Mockup
    const renderPhoneMockup = (compact = false) => (
        <div className={`iphone-shell ${compact ? 'compact-mode' : ''}`}>
            {/* Speaker & Dynamic Island */}
            <div className="dynamic-island">
                <div className="camera-lens" />
                <div className="sensor" />
            </div>

            {/* Screen */}
            <div className="iphone-inner-screen">
                {/* WhatsApp Chat Bar */}
                <div className="wa-top-bar">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="wa-avatar">
                            {formData.profile_photo ? (
                                <img src={formData.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={18} className="text-white/40" />
                            )}
                            <span className="wa-online-dot" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="wa-contact-name truncate">
                                {formData.profile_name || 'Nome do Atendimento'}
                            </p>
                            <p className="wa-online-label">online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-[#acf800]">
                            {currentAd.template_type}
                        </span>
                    </div>
                </div>

                {/* Chat Messages Area */}
                <div className="wa-chat-canvas">
                    {/* Timestamp Bubble */}
                    <div className="wa-date-pill">
                        HOJE
                    </div>

                    {/* WhatsApp Balloon */}
                    <div className="wa-balloon">
                        {/* Media Display */}
                        {currentAd.template_type === 'IMAGE' && (
                            <div className="wa-media-box">
                                {currentAd.media_url ? (
                                    <img src={currentAd.media_url} alt="Criativo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="wa-media-placeholder">
                                        <ImageIcon size={28} className="text-[#acf800]/60" />
                                        <span className="text-[10px] font-bold text-white/50">Prévia da Imagem</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentAd.template_type === 'VIDEO' && (
                            <div className="wa-media-box">
                                {currentAd.media_url ? (
                                    <video src={currentAd.media_url} controls className="w-full h-full object-cover" />
                                ) : (
                                    <div className="wa-media-placeholder">
                                        <Video size={28} className="text-[#acf800]/60" />
                                        <span className="text-[10px] font-bold text-white/50">Prévia do Vídeo</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Copy Text */}
                        <p className="wa-message-text whitespace-pre-wrap">
                            {renderPreviewCopy()}
                        </p>

                        {/* WhatsApp CTA Button */}
                        {currentAd.button_link ? (
                            <a
                                href={ensureProtocol(currentAd.button_link)}
                                target="_blank"
                                rel="noreferrer"
                                className="wa-cta-button"
                            >
                                <ExternalLink size={13} />
                                <span>Acessar Link</span>
                            </a>
                        ) : (
                            <div className="wa-cta-button opacity-70">
                                <span>Acessar Link</span>
                            </div>
                        )}

                        {/* Time & Double Checkmark */}
                        <div className="wa-meta">
                            <span>12:00</span>
                            <span className="wa-checks">✓✓</span>
                        </div>
                    </div>
                </div>

                {/* Chat Input Footer Mock */}
                <div className="wa-input-footer">
                    <div className="wa-fake-input">Mensagem</div>
                    <div className="wa-mic-btn">
                        <Send size={14} className="text-black ml-0.5" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="submission-page-root">
            <style>{`
                .submission-page-root {
                    width: 100%;
                    min-height: 100vh;
                    background: radial-gradient(circle at 10% 10%, rgba(172, 248, 0, 0.04) 0%, transparent 40%),
                                radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.04) 0%, transparent 40%),
                                #030712;
                    color: #fff;
                    box-sizing: border-box;
                    padding-bottom: 100px;
                /* Ensure scroll container allows position: sticky to stick to viewport */
                .main-content {
                    overflow: visible !important;
                }

                /* 2-Column Main Layout */
                .submission-main-layout {
                    display: flex;
                    flex-direction: row;
                    gap: 32px;
                    align-items: flex-start;
                    width: 100%;
                    position: relative;
                }

                .submission-form-col {
                    flex: 1 1 0%;
                    min-width: 0;
                }

                .submission-preview-col {
                    width: 350px;
                    flex-shrink: 0;
                    position: -webkit-sticky;
                    position: sticky;
                    top: 24px;
                    align-self: flex-start;
                    z-index: 20;
                }

                .mobile-device-tab-toggle {
                    display: none;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 4px;
                    width: 100%;
                }

                @media (max-width: 1023px) {
                    .submission-main-layout {
                        flex-direction: column;
                        gap: 20px;
                    }
                    .submission-preview-col {
                        width: 100%;
                        position: static;
                    }
                    .submission-form-col.mobile-hide-col {
                        display: none !important;
                    }
                    .submission-preview-col.mobile-hide-col {
                        display: none !important;
                    }
                    .mobile-device-tab-toggle {
                        display: flex;
                    }
                }

                @media (min-width: 640px) and (max-width: 1023px) {
                    .mobile-device-tab-toggle {
                        width: auto;
                    }
                }

                /* Single Row Modern Stepper */
                .step-indicator-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 8px 10px;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                    width: 100%;
                    box-sizing: border-box;
                }

                .step-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 14px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: all 0.25s ease;
                    flex: 1 1 0%;
                    min-width: 0;
                    justify-content: flex-start;
                    height: 48px;
                    box-sizing: border-box;
                }

                .step-item:hover:not(.disabled) {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                }

                .step-item.active {
                    background: rgba(172, 248, 0, 0.12);
                    border-color: rgba(172, 248, 0, 0.4);
                    box-shadow: 0 0 20px rgba(172, 248, 0, 0.12);
                }

                .step-item.completed {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(172, 248, 0, 0.25);
                }

                .step-item.disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }

                .step-badge {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 900;
                    flex-shrink: 0;
                    transition: all 0.25s ease;
                }

                .step-item.active .step-badge {
                    background: #acf800;
                    color: #000;
                    box-shadow: 0 0 12px rgba(172, 248, 0, 0.4);
                }

                .step-item.completed .step-badge {
                    background: rgba(172, 248, 0, 0.2);
                    color: #acf800;
                }

                .step-item:not(.active):not(.completed) .step-badge {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                }

                .step-text-container {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    overflow: hidden;
                    text-align: left;
                }

                .step-title {
                    font-size: 12px;
                    font-weight: 800;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.2;
                }

                .step-desc {
                    font-size: 10px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.4);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.2;
                }

                @media (max-width: 768px) {
                    .step-desc {
                        display: none;
                    }
                    .step-item {
                        padding: 6px 8px;
                        gap: 6px;
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .step-title {
                        display: none;
                    }
                    .step-item {
                        flex: 0 0 auto;
                        width: 44px;
                        padding: 0;
                        justify-content: center;
                    }
                    .step-indicator-bar {
                        justify-content: space-around;
                    }
                }

                .main-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(30px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 28px;
                    padding: 32px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                    transition: all 0.3s ease;
                }

                @media (max-width: 640px) {
                    .main-card {
                        padding: 20px 16px;
                        border-radius: 20px;
                    }
                }

                .input-box {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                    padding: 14px 18px;
                    border-radius: 14px;
                    width: 100%;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    outline: none;
                    box-sizing: border-box;
                }

                .input-box:focus {
                    border-color: #acf800;
                    background: rgba(172, 248, 0, 0.03);
                    box-shadow: 0 0 20px rgba(172, 248, 0, 0.12);
                }

                .input-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 6px;
                }

                .btn-primary {
                    background: #acf800;
                    color: #000;
                    font-weight: 900;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    padding: 14px 28px;
                    border-radius: 14px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 10px 25px rgba(172, 248, 0, 0.25);
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 35px rgba(172, 248, 0, 0.35);
                    background: #bbfb1a;
                }

                .btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-weight: 700;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    padding: 14px 24px;
                    border-radius: 14px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                /* iPhone Mockup Shell & WhatsApp Look */
                .iphone-sticky-container {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .iphone-shell {
                    width: 340px;
                    height: min(650px, calc(100vh - 100px));
                    background: #11141a;
                    border: 9px solid #232834;
                    border-radius: 46px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(172, 248, 0, 0.04);
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                }

                .iphone-shell.compact-mode {
                    width: 100%;
                    max-width: 340px;
                    height: 640px;
                    border-width: 8px;
                    margin: 0 auto;
                }

                .dynamic-island {
                    position: absolute;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90px;
                    height: 22px;
                    background: #000;
                    border-radius: 20px;
                    z-index: 30;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 10px;
                }

                .camera-lens {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #1a2233;
                }

                .sensor {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: #0e121a;
                }

                .iphone-inner-screen {
                    width: 100%;
                    height: 100%;
                    background: #0b141a;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .wa-top-bar {
                    background: #202c33;
                    padding: 42px 14px 10px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    z-index: 10;
                }

                .wa-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    flex-shrink: 0;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .wa-online-dot {
                    position: absolute;
                    bottom: 1px;
                    right: 1px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #25d366;
                    border: 1.5px solid #202c33;
                }

                .wa-contact-name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #e9edef;
                    line-height: 1.2;
                }

                .wa-online-label {
                    font-size: 10px;
                    color: #8696a0;
                    line-height: 1;
                }

                .wa-chat-canvas {
                    flex: 1;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    background-color: #0b141a;
                    background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0);
                    background-size: 16px 16px;
                }

                .wa-date-pill {
                    align-self: center;
                    background: #182229;
                    color: #8696a0;
                    font-size: 9px;
                    font-weight: 700;
                    padding: 3px 10px;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                }

                .wa-balloon {
                    align-self: flex-start;
                    background: #202c33;
                    border-radius: 0 14px 14px 14px;
                    padding: 10px 12px;
                    max-width: 90%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    position: relative;
                }

                .wa-media-box {
                    width: 100%;
                    height: 140px;
                    border-radius: 10px;
                    overflow: hidden;
                    background: #000;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .wa-media-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                }

                .wa-message-text {
                    font-size: 12.5px;
                    color: #e9edef;
                    line-height: 1.45;
                    word-break: break-word;
                }

                .wa-cta-button {
                    margin-top: 10px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    background: rgba(83, 189, 235, 0.12);
                    border: 1px solid rgba(83, 189, 235, 0.25);
                    color: #53bdeb;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }

                .wa-cta-button:hover {
                    background: rgba(83, 189, 235, 0.2);
                }

                .wa-meta {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 4px;
                    font-size: 9px;
                    color: #8696a0;
                    margin-top: 4px;
                }

                .wa-checks {
                    color: #53bdeb;
                    font-weight: 900;
                    letter-spacing: -1px;
                }

                .wa-input-footer {
                    background: #202c33;
                    padding: 10px 12px 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .wa-fake-input {
                    flex: 1;
                    background: #2a3942;
                    border-radius: 20px;
                    padding: 8px 14px;
                    font-size: 11px;
                    color: #8696a0;
                }

                .wa-mic-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #acf800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .creative-format-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    width: 100%;
                }

                @media (max-width: 520px) {
                    .creative-format-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .creative-type-card {
                    padding: 14px 12px;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.25s ease;
                    min-height: 76px;
                    box-sizing: border-box;
                }

                .creative-type-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(172, 248, 0, 0.3);
                }

                .creative-type-card.active {
                    background: rgba(172, 248, 0, 0.08);
                    border-color: #acf800;
                    box-shadow: 0 0 25px rgba(172, 248, 0, 0.15);
                }

                /* Step 1 Identity Grid */
                .step-identity-layout {
                    display: flex;
                    gap: 24px;
                    align-items: flex-start;
                    width: 100%;
                }

                .step-identity-photo {
                    width: 200px;
                    flex-shrink: 0;
                }

                .step-identity-fields {
                    flex: 1 1 0%;
                    min-width: 0;
                }

                .identity-fields-grid {
                    display: grid;
                    grid-template-columns: 1fr 110px;
                    gap: 16px;
                }

                @media (max-width: 680px) {
                    .step-identity-layout {
                        flex-direction: column;
                    }
                    .step-identity-photo {
                        width: 100%;
                    }
                    .identity-fields-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Two Column Form Row */
                .form-two-columns {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    width: 100%;
                }

                @media (max-width: 640px) {
                    .form-two-columns {
                        grid-template-columns: 1fr;
                    }
                }

                .ad-tab-chip {
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                    transition: all 0.2s ease;
                }

                .ad-tab-chip.active {
                    background: rgba(172, 248, 0, 0.15);
                    border-color: #acf800;
                    color: #acf800;
                }

                /* Mobile Floating Sticky Preview Bar */
                .mobile-sticky-preview-bar {
                    display: none;
                }

                @media (max-width: 1023px) {
                    .mobile-sticky-preview-bar {
                        display: flex;
                        position: fixed;
                        bottom: 16px;
                        left: 16px;
                        right: 16px;
                        z-index: 50;
                        background: rgba(15, 23, 42, 0.92);
                        backdrop-filter: blur(25px);
                        border: 1px solid rgba(172, 248, 0, 0.35);
                        border-radius: 20px;
                        padding: 10px 16px;
                        align-items: center;
                        justify-content: space-between;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(172, 248, 0, 0.15);
                    }
                }
            `}</style>

            <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Top Header */}
                <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                            <button
                                type="button"
                                onClick={() => navigate(isStaff ? '/client-submissions' : '/client-dashboard')}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
                                title="Voltar"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-[3px] text-[#acf800] bg-[#acf800]/10 px-2.5 py-1 rounded-md border border-[#acf800]/20">
                                {isStaff ? 'Painel Operacional' : 'Área do Cliente'}
                            </span>
                            <span className="text-white/30 text-xs">•</span>
                            <p className="text-[11px] font-bold tracking-[2px] uppercase text-white/50">
                                {isStaff ? 'Gestão Interna de Disparos' : 'Configuração de Envio'}
                            </p>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            {editingId ? 'EDITAR' : 'NOVA'}{' '}
                            <span className="text-[#acf800] italic">SUBMISSÃO</span>
                        </h1>
                    </div>

                    {/* Mobile Tab Toggle: Formulário vs Prévia WhatsApp */}
                    {step < 4 && (
                        <div className="mobile-device-tab-toggle">
                            <button
                                type="button"
                                onClick={() => setMobileTab('form')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${mobileTab === 'form' ? 'bg-[#acf800] text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                <MessageSquare size={14} />
                                Formulário
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileTab('preview')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${mobileTab === 'preview' ? 'bg-[#acf800] text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                <Smartphone size={14} />
                                Prévia WhatsApp
                            </button>
                        </div>
                    )}
                </header>

                {/* Progress / Step Navigation Bar */}
                {step < 4 && (
                    <nav aria-label="Etapas da Submissão" className="mb-8">
                        <div className="step-indicator-bar">
                            {stepsConfig.map((s, idx) => {
                                const isCurrent = step === s.id;
                                const isPassed = step > s.id;
                                return (
                                    <button
                                        type="button"
                                        key={s.id}
                                        onClick={() => {
                                            if (isPassed || isCurrent) {
                                                setStep(s.id);
                                            }
                                        }}
                                        disabled={!isPassed && !isCurrent}
                                        className={`step-item ${isCurrent ? 'active' : ''} ${isPassed ? 'completed' : ''} ${!isPassed && !isCurrent ? 'disabled' : ''}`}
                                    >
                                        <div className="step-badge">
                                            {isPassed ? <Check size={14} className="text-[#acf800]" /> : <span>{idx + 1}</span>}
                                        </div>
                                        <div className="step-text-container">
                                            <p className="step-title">{s.title}</p>
                                            <p className="step-desc">{s.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </nav>
                )}

                {/* Main Content Layout */}
                {step < 4 ? (
                    <div className="submission-main-layout">
                        {/* Form Column */}
                        <div className={`submission-form-col space-y-6 ${mobileTab === 'preview' ? 'mobile-hide-col' : ''}`}>
                            {/* STEP 0: SELECIONAR CLIENTE (Colaborador / Admin) */}
                            {step === 0 && isStaff && (
                                <div className="main-card space-y-8 animate-fade-in">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-white">Vincular Cliente Destinatário</h2>
                                            <p className="text-xs text-white/50 mt-1">Selecione o cliente responsável por este disparo de mensagens.</p>
                                        </div>
                                        <span className="p-3 bg-[#acf800]/10 text-[#acf800] rounded-2xl border border-[#acf800]/20">
                                            <User size={24} />
                                        </span>
                                    </div>

                                    {!isCreatingClient ? (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="input-label">
                                                    <span>Cliente Cadastrado</span>
                                                    <span className="text-[#acf800] text-[10px]">Obrigatório</span>
                                                </label>
                                                <select
                                                    className="input-box py-3.5 text-sm cursor-pointer"
                                                    value={formData.user_id || ''}
                                                    onChange={e => setFormData(p => ({ ...p, user_id: e.target.value }))}
                                                >
                                                    <option value="">Selecione um cliente na lista...</option>
                                                    {clients.map(c => (
                                                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                                                            {c.name} • {c.email} {c.phone ? `(${c.phone})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs font-bold text-white">Cliente não cadastrado no sistema?</p>
                                                    <p className="text-[11px] text-white/40">Crie o perfil e credenciais do cliente em poucos segundos.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCreatingClient(true)}
                                                    className="btn-secondary text-xs font-black text-[#acf800] border-[#acf800]/30 hover:bg-[#acf800]/10 w-full sm:w-auto"
                                                >
                                                    + CADASTRAR NOVO CLIENTE
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleCreateClient} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                                            <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                                <h3 className="text-sm font-black text-[#acf800] uppercase tracking-wider">Novo Cadastro Rápido</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCreatingClient(false)}
                                                    className="text-xs text-white/40 hover:text-white"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="input-label">Nome Completo</label>
                                                    <input
                                                        className="input-box"
                                                        placeholder="Ex: João da Silva"
                                                        value={newClientData.name}
                                                        onChange={e => setNewClientData(p => ({ ...p, name: e.target.value }))}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="input-label">E-mail</label>
                                                    <input
                                                        type="email"
                                                        className="input-box"
                                                        placeholder="email@empresa.com"
                                                        value={newClientData.email}
                                                        onChange={e => setNewClientData(p => ({ ...p, email: e.target.value }))}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="input-label">Telefone / WhatsApp</label>
                                                    <input
                                                        className="input-box"
                                                        placeholder="Ex: 11999999999"
                                                        value={newClientData.phone}
                                                        onChange={e => setNewClientData(p => ({ ...p, phone: e.target.value }))}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="input-label">Senha Provisória</label>
                                                    <input
                                                        type="password"
                                                        className="input-box"
                                                        placeholder="Mínimo 6 dígitos"
                                                        value={newClientData.password}
                                                        onChange={e => setNewClientData(p => ({ ...p, password: e.target.value }))}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button type="submit" className="btn-primary flex-1">
                                                    CADASTRAR E VINCULAR
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCreatingClient(false)}
                                                    className="btn-secondary"
                                                >
                                                    CANCELAR
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Navigation */}
                                    <div className="pt-6 border-t border-white/5 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!formData.user_id}
                                            className="btn-primary w-full sm:w-auto"
                                        >
                                            CONTINUAR PARA IDENTIDADE <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 1: IDENTIDADE & MARCA */}
                            {step === 1 && (
                                <div className="main-card space-y-8 animate-fade-in">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-white">Identidade da Campanha</h2>
                                            <p className="text-xs text-white/50 mt-1">Configure o remetente visível e agendamento dos envios.</p>
                                        </div>
                                        <span className="p-3 bg-[#acf800]/10 text-[#acf800] rounded-2xl border border-[#acf800]/20">
                                            <Sparkles size={24} />
                                        </span>
                                    </div>

                                    {/* Brand identity grid */}
                                    <div className="step-identity-layout">
                                        {/* Avatar / Logo Upload */}
                                        <div className="step-identity-photo flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                            <label className="input-label text-center mb-3">Foto / Logo do Perfil</label>
                                            <div
                                                onClick={() => document.getElementById('photo-upload-input')?.click()}
                                                style={{
                                                    width: '104px',
                                                    height: '104px',
                                                    minWidth: '104px',
                                                    minHeight: '104px',
                                                    maxWidth: '104px',
                                                    maxHeight: '104px',
                                                    borderRadius: '24px',
                                                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                                                    background: 'rgba(255, 255, 255, 0.02)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    boxSizing: 'border-box'
                                                }}
                                                className="hover:border-[#acf800] hover:bg-[#acf800]/5 transition-all group shadow-inner"
                                            >
                                                <input
                                                    id="photo-upload-input"
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'profile_photo')}
                                                />
                                                {formData.profile_photo ? (
                                                    <img
                                                        src={formData.profile_photo}
                                                        alt="Logo"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            display: 'block'
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-white/40 group-hover:text-[#acf800] transition-colors">
                                                        <UploadCloud size={26} />
                                                        <span className="text-[9px] font-black uppercase tracking-wider">Subir Foto</span>
                                                    </div>
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                                        <Activity className="animate-spin text-[#acf800]" size={22} />
                                                    </div>
                                                )}
                                            </div>
                                            {formData.profile_photo && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, profile_photo: '' }))}
                                                    className="mt-3 text-[10px] font-bold text-rose-400 hover:underline flex items-center gap-1"
                                                >
                                                    <Trash2 size={12} /> Remover foto
                                                </button>
                                            )}
                                            <p className="text-[10px] text-white/30 mt-2">Recomendado: 500x500 PNG ou JPG</p>
                                        </div>

                                        {/* Main Fields */}
                                        <div className="step-identity-fields space-y-4">
                                            <div className="identity-fields-grid">
                                                <div>
                                                    <label className="input-label">
                                                        <span>Nome do Atendimento</span>
                                                        <span className="text-[#acf800] text-[10px]">Obrigatório</span>
                                                    </label>
                                                    <input
                                                        className="input-box"
                                                        placeholder="Ex: Suporte VIP, Central de Ofertas"
                                                        value={formData.profile_name}
                                                        onChange={e => setFormData(p => ({ ...p, profile_name: e.target.value }))}
                                                        required
                                                    />
                                                    <p className="text-[10px] text-white/40 mt-1">Como o lead verá no topo da conversa do WhatsApp.</p>
                                                </div>

                                                <div>
                                                    <label className="input-label">
                                                        <span>DDD Regional</span>
                                                        <span className="text-[#acf800] text-[10px]">Obrigatório</span>
                                                    </label>
                                                    <input
                                                        className="input-box text-center font-bold text-base"
                                                        placeholder="Ex: 11"
                                                        maxLength={2}
                                                        value={formData.ddd}
                                                        onChange={e => setFormData(p => ({ ...p, ddd: e.target.value.replace(/\D/g, '') }))}
                                                        required
                                                    />
                                                    <p className="text-[10px] text-white/40 mt-1">DDD chip.</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="input-label">
                                                    <span>Data e Horário do Disparo</span>
                                                    <span className="text-white/40 text-[10px]">Opcional</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="datetime-local"
                                                        className="input-box"
                                                        value={formData.dispatch_date}
                                                        onChange={e => setFormData(p => ({ ...p, dispatch_date: e.target.value }))}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-white/40 mt-1">Deixe em branco para disparo imediato após aprovação.</p>
                                            </div>

                                            <div>
                                                <label className="input-label">
                                                    <span>Observações da Equipe</span>
                                                    <span className="text-white/40 text-[10px]">Interno</span>
                                                </label>
                                                <textarea
                                                    className="input-box resize-y"
                                                    rows={3}
                                                    placeholder="Notas ou instruções extras para os operadores da Plug & Sales..."
                                                    value={formData.notes}
                                                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        {isStaff ? (
                                            <button type="button" onClick={prevStep} className="btn-secondary w-full sm:w-auto">
                                                <ArrowLeft size={16} /> VOLTAR AO CLIENTE
                                            </button>
                                        ) : <div />}
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!formData.profile_name || !formData.ddd}
                                            className="btn-primary w-full sm:w-auto"
                                        >
                                            AVANÇAR PARA CRIATIVO & MENSAGEM <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: CRIATIVO & MENSAGEM */}
                            {step === 2 && (
                                <div className="main-card space-y-8 animate-fade-in">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-white">Criativo, Mídia & Mensagem</h2>
                                            <p className="text-xs text-white/50 mt-1">Configure o conteúdo que será disparado para cada contato.</p>
                                        </div>
                                        {/* Multi-Ad Tabs */}
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                                            {formData.ads.map((ad, idx) => (
                                                <button
                                                    type="button"
                                                    key={ad.id}
                                                    onClick={() => setFormData(p => ({ ...p, currentAdIndex: idx }))}
                                                    className={`ad-tab-chip ${formData.currentAdIndex === idx ? 'active' : ''}`}
                                                >
                                                    <span>ANÚNCIO {idx + 1}</span>
                                                    {formData.ads.length > 1 && (
                                                        <Trash2
                                                            size={12}
                                                            className="text-rose-400 hover:text-rose-300 ml-1"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setFormData(p => {
                                                                    const newAds = p.ads.filter((_, i) => i !== idx);
                                                                    return { ...p, ads: newAds, currentAdIndex: 0 };
                                                                });
                                                            }}
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const lastAd = formData.ads[formData.ads.length - 1];
                                                    const newAd = {
                                                        ...lastAd,
                                                        id: Date.now().toString(),
                                                        ad_name: '',
                                                        media_url: '',
                                                        spreadsheet_url: '',
                                                        variables: ['', '', '', '', ''],
                                                        showFifthVariable: false
                                                    };
                                                    setFormData(p => ({
                                                        ...p,
                                                        ads: [...p.ads, newAd],
                                                        currentAdIndex: p.ads.length
                                                    }));
                                                }}
                                                className="p-2 rounded-xl bg-[#acf800]/10 hover:bg-[#acf800]/20 text-[#acf800] border border-[#acf800]/30 transition-all"
                                                title="Adicionar Novo Anúncio"
                                            >
                                                <PlusCircle size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Creative Format Selector */}
                                    <div>
                                        <label className="input-label mb-2">Formato do Conteúdo</label>
                                        <div className="creative-format-grid">
                                            {[
                                                { type: 'TEXT' as const, label: 'Apenas Texto', icon: MessageSquare },
                                                { type: 'IMAGE' as const, label: 'Imagem + Texto', icon: ImageIcon },
                                                { type: 'VIDEO' as const, label: 'Vídeo + Texto', icon: Video },
                                            ].map(item => {
                                                const isSelected = currentAd.template_type === item.type;
                                                const Icon = item.icon;
                                                return (
                                                    <div
                                                        key={item.type}
                                                        onClick={() => {
                                                            const newAds = [...formData.ads];
                                                            newAds[formData.currentAdIndex].template_type = item.type;
                                                            setFormData(p => ({ ...p, ads: newAds }));
                                                        }}
                                                        className={`creative-type-card ${isSelected ? 'active' : ''}`}
                                                    >
                                                        <Icon size={22} className={isSelected ? 'text-[#acf800]' : 'text-white/40'} />
                                                        <span className="text-xs font-black uppercase text-center">{item.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Media Upload Area (If not TEXT) */}
                                    {currentAd.template_type !== 'TEXT' && (
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <label className="input-label mb-2">
                                                <span>Arquivo de Mídia ({currentAd.template_type === 'IMAGE' ? 'Imagem' : 'Vídeo'})</span>
                                                <span className="text-[#acf800] text-[10px]">Obrigatório</span>
                                            </label>
                                            <div
                                                onClick={() => document.getElementById('media-upload-input')?.click()}
                                                className="p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#acf800] bg-white/[0.01] hover:bg-[#acf800]/5 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all text-center relative"
                                            >
                                                <input
                                                    id="media-upload-input"
                                                    type="file"
                                                    hidden
                                                    accept={currentAd.template_type === 'IMAGE' ? 'image/*' : 'video/*'}
                                                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'media_url')}
                                                />
                                                {currentAd.media_url ? (
                                                    <div className="flex items-center gap-3 text-[#acf800]">
                                                        <CheckCircle2 size={24} />
                                                        <div className="text-left">
                                                            <p className="text-xs font-black uppercase">Arquivo Carregado com Sucesso</p>
                                                            <p className="text-[10px] text-white/50 truncate max-w-xs">{currentAd.media_url}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-white/40">
                                                        <UploadCloud size={32} className="text-[#acf800]/80" />
                                                        <p className="text-xs font-bold text-white">Clique para selecionar ou arraste o arquivo</p>
                                                        <p className="text-[10px] text-white/40">
                                                            {currentAd.template_type === 'IMAGE' ? 'PNG, JPG, JPEG (Max 15MB)' : 'MP4, MOV (Max 50MB)'}
                                                        </p>
                                                    </div>
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center gap-2 text-[#acf800]">
                                                        <Activity className="animate-spin" size={20} />
                                                        <span className="text-xs font-bold">Enviando mídia...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contacts Spreadsheet & CTA Link in 2 Columns */}
                                    <div className="form-two-columns">
                                        {/* Planilha de Destinatários */}
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                                            <div>
                                                <label className="input-label mb-2">
                                                    <span>Planilha de Destinatários</span>
                                                    <span className="text-[#acf800] text-[10px]">Obrigatório</span>
                                                </label>
                                                <p className="text-[10px] text-white/40 mb-3">Arquivo com colunas de Telefone e Variáveis dos leads.</p>
                                            </div>
                                            <div
                                                onClick={() => document.getElementById('sheet-upload-input')?.click()}
                                                className={`p-4 rounded-xl border border-dashed cursor-pointer flex items-center justify-between gap-3 transition-all ${currentAd.spreadsheet_url ? 'border-[#acf800] bg-[#acf800]/5 text-[#acf800]' : 'border-white/20 hover:border-[#acf800] text-white/60'}`}
                                            >
                                                <input
                                                    id="sheet-upload-input"
                                                    type="file"
                                                    hidden
                                                    accept=".xlsx,.xls,.csv"
                                                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'spreadsheet_url')}
                                                />
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <FileSpreadsheet size={20} className={currentAd.spreadsheet_url ? 'text-[#acf800]' : 'text-white/40'} />
                                                    <span className="text-xs font-bold truncate">
                                                        {currentAd.spreadsheet_url ? 'Planilha Carregada ✓' : 'Carregar Planilha (.xlsx, .csv)'}
                                                    </span>
                                                </div>
                                                {currentAd.spreadsheet_url ? (
                                                    <CheckCircle2 size={16} />
                                                ) : (
                                                    <UploadCloud size={16} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Link do Botão */}
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                                            <div>
                                                <label className="input-label mb-2">
                                                    <span>Link do Botão (WhatsApp CTA)</span>
                                                    <span className="text-white/40 text-[10px]">Opcional</span>
                                                </label>
                                                <p className="text-[10px] text-white/40 mb-3">Destino do botão "Acessar Link" no rodapé do balão.</p>
                                            </div>
                                            <div className="relative">
                                                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                                <input
                                                    className="input-box pl-10"
                                                    placeholder="https://seusite.com.br/promo"
                                                    value={currentAd.button_link || ''}
                                                    onChange={e => {
                                                        const newAds = [...formData.ads];
                                                        newAds[formData.currentAdIndex].button_link = e.target.value;
                                                        setFormData(p => ({ ...p, ads: newAds }));
                                                    }}
                                                    onBlur={e => {
                                                        const newAds = [...formData.ads];
                                                        newAds[formData.currentAdIndex].button_link = ensureProtocol(e.target.value);
                                                        setFormData(p => ({ ...p, ads: newAds }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Setup & Variables */}
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Configuração da Mensagem</h3>
                                                <p className="text-xs text-white/40">Defina o texto dinâmico ou faça upload de mensagens personalizadas.</p>
                                            </div>
                                            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newAds = [...formData.ads];
                                                        newAds[formData.currentAdIndex].message_mode = 'manual';
                                                        setFormData(p => ({ ...p, ads: newAds }));
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${currentAd.message_mode === 'manual' ? 'bg-[#acf800] text-black shadow' : 'text-white/60 hover:text-white'}`}
                                                >
                                                    Variáveis
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newAds = [...formData.ads];
                                                        newAds[formData.currentAdIndex].message_mode = 'upload';
                                                        setFormData(p => ({ ...p, ads: newAds }));
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${currentAd.message_mode === 'upload' ? 'bg-[#acf800] text-black shadow' : 'text-white/60 hover:text-white'}`}
                                                >
                                                    Arquivo TXT
                                                </button>
                                            </div>
                                        </div>

                                        {currentAd.message_mode === 'manual' ? (
                                            <div className="space-y-4">
                                                {/* 5th variable switch */}
                                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-2 h-2 rounded-full bg-[#acf800]" />
                                                        <div>
                                                            <p className="text-xs font-black text-white uppercase">Habilitar 5ª Variável</p>
                                                            <p className="text-[10px] text-white/40">Adiciona mais um campo de personalização no texto.</p>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 accent-[#acf800] cursor-pointer"
                                                        checked={currentAd.showFifthVariable}
                                                        onChange={e => {
                                                            const newAds = [...formData.ads];
                                                            const ad = newAds[formData.currentAdIndex];
                                                            ad.showFifthVariable = e.target.checked;
                                                            const v = ad.variables;
                                                            const v1 = v[0] || '{{1}}';
                                                            const v2 = v[1] || '{{2}}';
                                                            const v3 = v[2] || '{{3}}';
                                                            const v4 = v[3] || '{{4}}';
                                                            const v5 = v[4] || '{{5}}';

                                                            if (e.target.checked) {
                                                                ad.ad_copy = `Olá ${v1}, tudo bem? \n\nEstamos passando por aqui para informar que ${v2}.\n\nMais detalhes: ${v3}\n\nObservação importante: ${v4}\n\nPara ${v5}, clique no botão abaixo 👇`;
                                                            } else {
                                                                ad.ad_copy = `Olá ${v1}\n\nEstamos informando ${v2}\n\n${v3}\n\nPara ${v4} Clique no botão abaixo!`;
                                                            }
                                                            setFormData(p => ({ ...p, ads: newAds }));
                                                        }}
                                                    />
                                                </div>

                                                {/* Variables inputs in 2 columns */}
                                                <div className="form-two-columns">
                                                    {[1, 2, 3, 4, 5].map(vNum => {
                                                        if (vNum === 5 && !currentAd.showFifthVariable) return null;
                                                        const placeholders = [
                                                            'Ex: Nome do Contato ({{1}})',
                                                            'Ex: Novidade / Assunto ({{2}})',
                                                            'Ex: Detalhes ou Desconto ({{3}})',
                                                            'Ex: Ação / Aproveitar ({{4}})',
                                                            'Ex: Confirmar vaga / Link ({{5}})'
                                                        ];
                                                        return (
                                                            <div key={vNum}>
                                                                <label className="input-label text-[#acf800]">
                                                                    <span>Variável {vNum}</span>
                                                                    <span className="text-white/30 text-[9px] font-mono">{`{{${vNum}}}`}</span>
                                                                </label>
                                                                <input
                                                                    className="input-box"
                                                                    placeholder={placeholders[vNum - 1]}
                                                                    value={currentAd.variables[vNum - 1] || ''}
                                                                    onChange={e => {
                                                                        const newAds = [...formData.ads];
                                                                        const ad = newAds[formData.currentAdIndex];
                                                                        ad.variables[vNum - 1] = e.target.value;

                                                                        const v = ad.variables;
                                                                        const v1 = v[0] || '{{1}}';
                                                                        const v2 = v[1] || '{{2}}';
                                                                        const v3 = v[2] || '{{3}}';
                                                                        const v4 = v[3] || '{{4}}';
                                                                        const v5 = v[4] || '{{5}}';

                                                                        if (ad.showFifthVariable) {
                                                                            ad.ad_copy = `Olá ${v1}, tudo bem? \n\nEstamos passando por aqui para informar que ${v2}.\n\nMais detalhes: ${v3}\n\nObservação importante: ${v4}\n\nPara ${v5}, clique no botão abaixo 👇`;
                                                                        } else {
                                                                            ad.ad_copy = `Olá ${v1}\n\nEstamos informando ${v2}\n\n${v3}\n\nPara ${v4} Clique no botão abaixo!`;
                                                                        }
                                                                        setFormData(p => ({ ...p, ads: newAds }));
                                                                    }}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Textarea preview / custom edit */}
                                                <div>
                                                    <label className="input-label mt-2">
                                                        <span>Texto Montado do WhatsApp</span>
                                                        <span className="text-white/40 text-[10px]">Atualiza em tempo real</span>
                                                    </label>
                                                    <textarea
                                                        className="input-box font-sans text-xs leading-relaxed"
                                                        rows={4}
                                                        value={currentAd.ad_copy}
                                                        onChange={e => {
                                                            const newAds = [...formData.ads];
                                                            newAds[formData.currentAdIndex].ad_copy = e.target.value;
                                                            setFormData(p => ({ ...p, ads: newAds }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="input-label mb-2">Arquivo de Mensagens (TXT)</label>
                                                <div
                                                    onClick={() => document.getElementById('msg-upload-input')?.click()}
                                                    className="p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#acf800] bg-white/[0.01] hover:bg-[#acf800]/5 cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
                                                >
                                                    <input
                                                        id="msg-upload-input"
                                                        type="file"
                                                        hidden
                                                        accept=".txt"
                                                        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ad_copy_file')}
                                                    />
                                                    {currentAd.ad_copy_file ? (
                                                        <div className="flex items-center gap-2 text-[#acf800]">
                                                            <CheckCircle2 size={20} />
                                                            <span className="text-xs font-bold">Arquivo TXT Carregado</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-white/40">
                                                            <UploadCloud size={28} className="text-[#acf800]" />
                                                            <p className="text-xs font-bold text-white">Carregar arquivo TXT com mensagens</p>
                                                            <p className="text-[10px] text-white/40">Uma mensagem por linha</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Navigation */}
                                    <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <button type="button" onClick={prevStep} className="btn-secondary w-full sm:w-auto">
                                            <ArrowLeft size={16} /> VOLTAR PARA IDENTIDADE
                                        </button>
                                        <button type="button" onClick={nextStep} className="btn-primary w-full sm:w-auto">
                                            REVISAR E ENVIAR <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: REVISÃO & CONFIRMAÇÃO */}
                            {step === 3 && (
                                <div className="main-card space-y-8 animate-fade-in">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-white">Resumo Executivo da Submissão</h2>
                                            <p className="text-xs text-white/50 mt-1">Confira todos os dados antes de iniciar o processamento.</p>
                                        </div>
                                        <span className="p-3 bg-[#acf800]/10 text-[#acf800] rounded-2xl border border-[#acf800]/20">
                                            <Send size={24} />
                                        </span>
                                    </div>

                                    {/* Summary Overview Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Identidade do Disparo</p>
                                            <div className="flex items-center gap-3">
                                                {formData.profile_photo ? (
                                                    <img
                                                        src={formData.profile_photo}
                                                        alt="Logo"
                                                        style={{
                                                            width: '44px',
                                                            height: '44px',
                                                            minWidth: '44px',
                                                            minHeight: '44px',
                                                            maxWidth: '44px',
                                                            maxHeight: '44px',
                                                            borderRadius: '50%',
                                                            objectFit: 'cover',
                                                            border: '2px solid rgba(255, 255, 255, 0.15)',
                                                            display: 'block',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: '44px',
                                                            height: '44px',
                                                            minWidth: '44px',
                                                            minHeight: '44px',
                                                            borderRadius: '50%',
                                                            background: 'rgba(255, 255, 255, 0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <User size={18} className="text-white/40" />
                                                    </div>
                                                )}
                                                <div style={{ minWidth: 0 }}>
                                                    <p className="text-sm font-bold text-white truncate">{formData.profile_name || 'Sem nome'}</p>
                                                    <p className="text-xs text-white/50">DDD Regional: {formData.ddd || '--'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-white/40">Agendamento & Status</p>
                                            <p className="text-sm font-bold text-white">
                                                {formData.dispatch_date ? new Date(formData.dispatch_date).toLocaleString('pt-BR') : 'Disparo Imediato'}
                                            </p>
                                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                AGUARDANDO ENVIO
                                            </span>
                                        </div>
                                    </div>

                                    {/* Ads List Review */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-white/60">
                                            Anúncios Cadastrados ({formData.ads.length})
                                        </h3>
                                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                            {formData.ads.map((ad, idx) => (
                                                <div
                                                    key={ad.id}
                                                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 rounded-xl bg-[#acf800]/10 text-[#acf800] flex items-center justify-center font-black text-xs border border-[#acf800]/20 flex-shrink-0">
                                                            #{idx + 1}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black uppercase text-[#acf800]">
                                                                    {ad.template_type}
                                                                </span>
                                                                <span className="text-white/20">•</span>
                                                                <span className="text-xs font-bold text-white truncate">
                                                                    {ad.ad_name || `Anúncio #${idx + 1}`}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-white/50 truncate">
                                                                {ad.spreadsheet_url ? 'Planilha anexada ✓' : '⚠️ Sem planilha'} • {ad.button_link ? 'Link ativo' : 'Sem botão'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(p => ({ ...p, currentAdIndex: idx }));
                                                            setStep(2);
                                                        }}
                                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
                                                    >
                                                        <Settings size={14} />
                                                        <span className="hidden sm:inline">Editar</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <button type="button" onClick={prevStep} className="btn-secondary w-full sm:w-auto">
                                            <ArrowLeft size={16} /> VOLTAR AO CRIATIVO
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="btn-primary w-full sm:w-auto text-sm px-8 py-4"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Activity className="animate-spin" size={18} />
                                                    <span>ENVIANDO DADOS...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>CONFIRMAR E ENVIAR SUBMISSÃO</span>
                                                    <Send size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Phone Mockup Column - Desktop (Sticky) & Mobile Toggle View */}
                        <div className={`submission-preview-col ${mobileTab === 'form' ? 'mobile-hide-col' : ''}`}>
                            <div className="iphone-sticky-container">
                                <div className="flex items-center justify-between w-full max-w-[350px] mb-3 px-2">
                                    <div className="flex items-center gap-2">
                                        <Smartphone size={16} className="text-[#acf800]" />
                                        <span className="text-[11px] font-black uppercase tracking-wider text-white">Prévia do WhatsApp</span>
                                    </div>
                                    <span className="text-[10px] text-white/40 font-semibold">Tempo Real</span>
                                </div>

                                {renderPhoneMockup(false)}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* STEP 4: SUCESSO */
                    <div className="max-w-xl mx-auto py-12 animate-scale-in">
                        <div className="main-card text-center space-y-8 p-8 sm:p-12 border-[#acf800]/30 shadow-[0_20px_60px_rgba(172,248,0,0.15)]">
                            <div className="w-20 h-20 bg-[#acf800]/20 text-[#acf800] rounded-3xl flex items-center justify-center mx-auto border border-[#acf800]/30 shadow-lg">
                                <CheckCircle2 size={42} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white tracking-tight">SUBMISSÃO ENVIADA COM SUCESSO!</h2>
                                <p className="text-sm text-white/50 max-w-md mx-auto">
                                    Sua campanha foi registrada na fila operacional e será processada conforme o cronograma.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left text-xs space-y-1.5">
                                <p><strong className="text-white">Remetente:</strong> <span className="text-white/70">{formData.profile_name} (DDD {formData.ddd})</span></p>
                                <p><strong className="text-white">Anúncios:</strong> <span className="text-white/70">{formData.ads.length} criativo(s) configurado(s)</span></p>
                                <p><strong className="text-white">Status:</strong> <span className="text-[#acf800] font-bold">Aguardando Execução</span></p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="btn-primary flex-1 justify-center"
                                >
                                    NOVO ENVIO
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(isStaff ? '/client-submissions' : '/client-dashboard')}
                                    className="btn-secondary flex-1 justify-center"
                                >
                                    VOLTAR ÀS SUBMISSÕES
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Floating Sticky Preview Bar */}
                {step < 4 && (
                    <div className="mobile-sticky-preview-bar">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <Smartphone size={20} className="text-[#acf800]" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#acf800] animate-ping" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase text-white leading-none">Prévia WhatsApp</p>
                                <p className="text-[9px] font-bold text-[#acf800] leading-none mt-0.5">
                                    {formData.profile_name || 'Em edição'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowMobilePreviewModal(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#acf800] text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                        >
                            <Eye size={13} /> Ver no Celular
                        </button>
                    </div>
                )}

                {/* Mobile Slide-Up Preview Modal */}
                {showMobilePreviewModal && (
                    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
                        <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 max-h-[92vh] flex flex-col relative overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                                <div className="flex items-center gap-2">
                                    <Smartphone size={18} className="text-[#acf800]" />
                                    <span className="text-xs font-black uppercase tracking-wider text-white">Prévia Real do WhatsApp</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowMobilePreviewModal(false)}
                                    className="p-1.5 rounded-xl bg-white/10 text-white/60 hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto flex justify-center py-2">
                                {renderPhoneMockup(true)}
                            </div>
                            <div className="pt-3 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowMobilePreviewModal(false)}
                                    className="btn-secondary w-full justify-center text-xs py-2.5"
                                >
                                    FECHAR PRÉVIA
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientExternalForm;
