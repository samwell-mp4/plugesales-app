import React, { useState } from 'react';
import {
    User,
    Image as ImageIcon,
    Video,
    CheckCircle,
    ChevronRight,
    FileSpreadsheet,
    Activity,
    MessageSquare,
    Send,
    Copy,
    Trash2,
    PlusCircle,
    ChevronDown,
    LayoutGrid,
    Globe,
    Settings,
    ArrowRight,
    RefreshCw,
    Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import ClientAuth from './ClientAuth';

const ClientExternalForm = () => {
    const { user } = useAuth() as any;
    const navigate = useNavigate();
    const [step, setStep] = useState(user?.role === 'ADMIN' ? 0 : 1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', email: '', phone: '', password: '' });

    const [hasSubmissions, setHasSubmissions] = useState(false);

    React.useEffect(() => {
        if (user?.role === 'ADMIN') {
            dbService.getClients().then(setClients);
        } else if (user?.id) {
            dbService.getClientSubmissions().then(subs => {
                const userSubs = subs.filter((s: any) => String(s.user_id) === String(user.id));
                setHasSubmissions(userSubs.length > 0);
            });
        }
    }, [user]);

    const [formData, setFormData] = useState({
        user_id: user?.role === 'ADMIN' ? ('' as string | number) : user?.id,
        profile_photo: '',
        profile_name: '',
        ddd: '',
        ads: [{
            template_type: 'TEXT' as 'TEXT' | 'IMAGE' | 'VIDEO',
            media_url: '',
            ad_copy: 'Oi {{1}}! Informamos que {{2}}\n\n{{3}}\n\nPara {{4}}, clique no botão abaixo 👇',
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
            if (ad.message_mode === 'upload' && !ad.ad_copy_file) errors.push(`${adLabel}: Selecionou importar mensagem por arquivo, mas não enviou o arquivo (TXT/Excel).`);
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
            const continuar = window.confirm("⚠️ ATENÇÃO - Campos Incompletos:\n\n" + errors.join("\n") + "\n\nDeseja enviar mesmo assim?");
            if (!continuar) return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                profile_photo: formData.profile_photo,
                profile_name: formData.profile_name,
                ddd: formData.ddd,
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

            const result = await dbService.addClientSubmission(payload);
            if (result && result.id) {
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
        if (step === 0 && !formData.user_id && user?.role === 'ADMIN') {
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
                alert(`Por favor, envie a planilha de destinatários para o Anúncio #${formData.currentAdIndex + 1} antes de prosseguir.`);
                return;
            }
        }
        setStep(prev => Math.min(prev + 1, 3));
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, user?.role === 'ADMIN' ? 0 : 1));

    if (!user) return <ClientAuth />;

    return (
        <div className="min-h-screen form-container-wrapper" style={{ background: '#020617', color: '#fff' }}>
            <style>{`
                .form-container-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 80px 20px;
                    width: 100%;
                    min-height: 100vh;
                    box-sizing: border-box;
                    background: radial-gradient(circle at 0% 0%, rgba(172, 248, 0, 0.05) 0%, transparent 40%),
                                 radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.05) 0%, transparent 40%),
                                 #020617;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    backdrop-filter: blur(40px);
                    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
                    border-radius: 40px;
                    padding: 50px;
                    max-width: 850px;
                    width: 100%;
                    transition: all 0.4s ease;
                }
                .glass-card:hover {
                    border-color: rgba(172, 248, 0, 0.2);
                    background: rgba(255, 255, 255, 0.03);
                }
                .whatsapp-grid { 
                    display: grid; 
                    grid-template-columns: 1.1fr 380px;
                    gap: 60px; 
                    max-width: 1350px; 
                    width: 100%;
                }
                .header-title { 
                    font-size: 2.8rem; 
                    font-weight: 950; 
                    margin-bottom: 16px; 
                    letter-spacing: -1.5px; 
                    line-height: 1.1;
                    color: #fff;
                    display: block;
                    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .header-subtitle { 
                    font-size: 10px; 
                    opacity: 0.4; 
                    font-weight: 900; 
                    letter-spacing: 6px;
                    text-transform: uppercase;
                    color: #fff;
                    margin-top: -5px;
                }
                .section-title {
                    font-size: 1.8rem;
                    font-weight: 950;
                    letter-spacing: -1.5px;
                    margin-bottom: 8px;
                    color: #fff;
                }
                .section-subtitle {
                    font-size: 14px;
                    opacity: 0.5;
                    font-weight: 500;
                    margin-bottom: 40px;
                    color: #fff;
                }

                .input-premium {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #fff;
                    padding: 16px 20px;
                    border-radius: 16px;
                    width: 100%;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }
                .input-premium:focus { 
                    border-color: #acf800; 
                    background: rgba(255, 255, 255, 0.07); 
                    box-shadow: 0 0 30px rgba(172, 248, 0, 0.15); 
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 28px;
                }
                .form-group:last-child { margin-bottom: 0; }

                .photo-uploader {
                    width: 120px;
                    height: 120px;
                    border-radius: 35px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.02);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    flex-shrink: 0;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                }
                .photo-uploader:hover {
                    border-color: #acf800;
                    background: rgba(172, 248, 0, 0.05);
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(172, 248, 0, 0.1);
                }
                .photo-uploader img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .ad-selector-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 10px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .ad-selector-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: #acf800;
                }

                .preview-side {
                    position: sticky;
                    top: 120px;
                    height: fit-content;
                }
                .iphone-mockup {
                    width: 340px;
                    height: 680px;
                    background: #000;
                    border: 12px solid #1a1c1e;
                    border-radius: 54px;
                    position: relative;
                    margin: 0 auto;
                    overflow: hidden;
                    box-shadow: 0 50px 100px -20px rgba(0,0,0,0.8), 0 0 40px rgba(172, 248, 0, 0.05);
                    border-bottom: 16px solid #1a1c1e;
                }
                .iphone-screen {
                    width: 100%;
                    height: 100%;
                    background: #0b141a;
                    background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
                    background-size: cover;
                    display: flex;
                    flex-direction: column;
                }
                .chat-header {
                    background: #202c33;
                    padding: 40px 16px 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .chat-bubble {
                    align-self: flex-start;
                    background: #202c33;
                    color: #fff;
                    padding: 12px 16px;
                    border-radius: 0 16px 16px 16px;
                    margin: 15px;
                    max-width: 85%;
                    font-size: 14px;
                    position: relative;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    line-height: 1.5;
                }
                .chat-button {
                    margin-top: 12px;
                    padding: 12px;
                    background: rgba(255,255,255,0.05);
                    color: #53bdeb;
                    text-align: center;
                    font-weight: 700;
                    border-radius: 12px;
                    font-size: 14px;
                    border: 1px solid rgba(83, 189, 235, 0.1);
                }

                .upload-zone {
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.02);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                }
                .upload-zone:hover {
                    border-color: #acf800;
                    background: rgba(172, 248, 0, 0.04);
                }
                .upload-zone.uploaded {
                    border-style: solid;
                    border-color: rgba(172, 248, 0, 0.2);
                    background: rgba(172, 248, 0, 0.03);
                }

                .mode-toggle {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 5px;
                    display: inline-flex;
                }
                .mode-btn {
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: rgba(255, 255, 255, 0.3);
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    letter-spacing: 1px;
                }
                .mode-btn.active {
                    background: #fff;
                    color: #000;
                    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
                }

                .nav-btn {
                    padding: 20px 40px;
                    border-radius: 22px;
                    font-weight: 950;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-size: 13px;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: none;
                    cursor: pointer;
                }
                .nav-btn-primary {
                    background: #acf800;
                    color: #000;
                    box-shadow: 0 15px 30px rgba(172, 248, 0, 0.2);
                }
                .nav-btn-primary:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(172, 248, 0, 0.3);
                }
                .nav-btn-secondary {
                    background: rgba(255,255,255,0.04);
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .nav-btn-secondary:hover {
                    background: rgba(255,255,255,0.08);
                }

                .custom-switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 32px;
                    flex-shrink: 0;
                }
                .switch-slider {
                    position: absolute;
                    cursor: pointer;
                    inset: 0;
                    background: rgba(255,255,255,0.1);
                    transition: .4s;
                    border-radius: 34px;
                }
                .switch-slider:before {
                    position: absolute;
                    content: "";
                    height: 24px; width: 24px;
                    left: 4px; bottom: 4px;
                    background: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .switch-slider { background: #acf800; }
                input:checked + .switch-slider:before { transform: translateX(28px); }
                
                .creative-card {
                    width: 125px;
                    height: 125px;
                    padding: 0;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.02);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .creative-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .creative-card.active {
                    background: rgba(172, 248, 0, 0.06);
                    border-color: #acf800;
                    box-shadow: 0 10px 30px rgba(172, 248, 0, 0.1);
                }
                .creative-icon-box {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .creative-card.active .creative-icon-box {
                    background: #acf800;
                    color: #000;
                }
                .creative-card:not(.active) .creative-icon-box {
                    background: rgba(255, 255, 255, 0.04);
                    color: rgba(255, 255, 255, 0.2);
                }
                .creative-label {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    transition: all 0.3s ease;
                }
                .creative-card.active .creative-label { color: #acf800; }
                .creative-card:not(.active) .creative-label { color: rgba(255, 255, 255, 0.3); }

                @media (max-width: 1024px) {
                    .whatsapp-grid { grid-template-columns: 1fr; gap: 40px; }
                    .iphone-mockup { display: none !important; }
                    .header-title { font-size: 2.8rem; letter-spacing: -3px; }
                }

                .ad-dropdown {
                    position: absolute;
                    top: calc(100% + 10px);
                    left: 0;
                    width: 280px;
                    background: #0a0f1a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 15px;
                    z-index: 1000;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
                    animation: slideUp 0.2s ease-out;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .ad-item {
                    padding: 12px 16px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 6px;
                }
                .ad-item:hover { background: rgba(255,255,255,0.05); }
                .ad-item.active { background: rgba(172, 248, 0, 0.1); color: #acf800; }
            `}</style>

            <div className="max-w-7xl w-full">
                {step < 4 ? (
                    <div className="whatsapp-grid">
                        <div className="form-side animate-fade-in">
                            <div className="mb-12 text-center sm:text-left">
                                <h1 className="header-title">
                                    Configurar <span style={{ color: '#acf800' }}>Marca</span>
                                </h1>
                                <p className="header-subtitle">DETALHES DA CAMPANHA E IDENTIDADE VISUAL</p>
                            </div>

                            <div className="flex justify-center sm:justify-start mb-12">
                                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 mb-8">
                                    {(user?.role === 'ADMIN' ? [0, 1, 2, 3] : [1, 2, 3]).map((i, idx) => (
                                        <div
                                            key={i}
                                            onClick={() => i < step && setStep(i)}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] transition-all cursor-pointer ${step === i ? 'bg-[#acf800] text-black shadow-lg scale-110' : step > i ? 'bg-[#acf800]/20 text-[#acf800]' : 'bg-white/5 text-white/10'
                                                }`}
                                        >
                                            {step > i ? <CheckCircle size={14} /> : idx + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {step === 0 && user?.role === 'ADMIN' && (
                                <div className="glass-card animate-fade-in space-y-12">
                                    <div className="space-y-4">
                                        <h2 className="section-title">Selecionar Cliente</h2>
                                        <p className="section-subtitle">Escolha o destinatário desta submissão.</p>
                                    </div>
                                    <div className="space-y-10">
                                        {!isCreatingClient ? (
                                            <div className="space-y-6">
                                                <div className="form-group">
                                                    <label className="text-[10px] font-black uppercase tracking-[3px] opacity-40 ml-1">Cliente Vinculado</label>
                                                    <select
                                                        className="input-premium py-4"
                                                        value={formData.user_id || ''}
                                                        onChange={e => setFormData(p => ({ ...p, user_id: e.target.value }))}
                                                    >
                                                        <option value="">Selecione um cliente...</option>
                                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                                                    </select>
                                                </div>
                                                <button onClick={() => setIsCreatingClient(true)} className="text-[#acf800] text-[10px] font-black tracking-widest uppercase hover:underline">+ Cadastrar Novo Cliente</button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleCreateClient} className="grid grid-cols-2 gap-6 bg-white/5 p-8 rounded-3xl border border-white/5">
                                                <div className="form-group">
                                                    <label className="text-[9px] font-black uppercase opacity-40">Nome</label>
                                                    <input className="input-premium" placeholder="Nome" value={newClientData.name} onChange={e => setNewClientData(p => ({ ...p, name: e.target.value }))} required />
                                                </div>
                                                <div className="form-group">
                                                    <label className="text-[9px] font-black uppercase opacity-40">E-mail</label>
                                                    <input className="input-premium" placeholder="Email" value={newClientData.email} onChange={e => setNewClientData(p => ({ ...p, email: e.target.value }))} required />
                                                </div>
                                                <div className="form-group">
                                                    <label className="text-[9px] font-black uppercase opacity-40">Telefone</label>
                                                    <input className="input-premium" placeholder="DDD+Tel" value={newClientData.phone} onChange={e => setNewClientData(p => ({ ...p, phone: e.target.value }))} required />
                                                </div>
                                                <div className="form-group">
                                                    <label className="text-[9px] font-black uppercase opacity-40">Senha</label>
                                                    <input className="input-premium" type="password" placeholder="Senha" value={newClientData.password} onChange={e => setNewClientData(p => ({ ...p, password: e.target.value }))} required />
                                                </div>
                                                <div className="col-span-2 flex gap-6 mt-4">
                                                    <button type="submit" className="nav-btn nav-btn-primary flex-1 justify-center">CADASTRAR</button>
                                                    <button type="button" onClick={() => setIsCreatingClient(false)} className="nav-btn nav-btn-secondary">CANCELAR</button>
                                                </div>
                                            </form>
                                        )}
                                        <button onClick={nextStep} className="nav-btn nav-btn-primary w-full justify-center">PRÓXIMO PASSO <ArrowRight size={18} /></button>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="glass-card animate-fade-in space-y-16">
                                    <div className="flex flex-col md:flex-row gap-20 items-center md:items-start text-center md:text-left">
                                        <div className="flex flex-col items-center gap-8">
                                            <div
                                                className="photo-uploader group"
                                                onClick={() => document.getElementById('photo-upload')?.click()}
                                            >
                                                <input id="photo-upload" type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'profile_photo')} />
                                                {formData.profile_photo ? (
                                                    <img src={formData.profile_photo} />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                                                        <ImageIcon size={24} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Enviar</span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-[3px] opacity-40">Logo do Perfil</span>
                                        </div>

                                        <div className="flex-1 w-full pt-4">
                                            <div className="form-group">
                                                <label className="text-[10px] font-black uppercase tracking-[3px] opacity-40 ml-1">Nome do Atendimento</label>
                                                <input className="input-premium" placeholder="Ex: Suporte VIP" value={formData.profile_name} onChange={e => setFormData(p => ({ ...p, profile_name: e.target.value }))} />
                                            </div>
                                            <div className="form-group">
                                                <label className="text-[10px] font-black uppercase tracking-[3px] opacity-40 ml-1">DDD Regional</label>
                                                <input className="input-premium" placeholder="Ex: 11" maxLength={2} value={formData.ddd} onChange={e => setFormData(p => ({ ...p, ddd: e.target.value.replace(/\D/g, '') }))} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-24 border-t border-white/5 flex gap-8">
                                        <button onClick={prevStep} className="nav-btn nav-btn-secondary flex-1 justify-center">VOLTAR</button>
                                        <button onClick={nextStep} className="nav-btn nav-btn-primary flex-2 justify-center">PRÓXIMO PASSO <ArrowRight size={18} /></button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="glass-card animate-fade-in space-y-12">
                                    <div className="flex justify-between items-center pb-8 border-b border-white/5">
                                        <div className="relative">
                                            <div className="ad-selector-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                                <LayoutGrid size={18} className="text-[#acf800]" />
                                                <span className="text-xs font-black uppercase tracking-widest text-white/90">Anúncio #{formData.currentAdIndex + 1}</span>
                                                <ChevronDown size={14} className={`transition-transform text-white/40 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                            {dropdownOpen && (
                                                <div className="ad-dropdown">
                                                    <div className="flex justify-between items-center px-2 mb-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Lista de Anúncios</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFormData(p => {
                                                                    const lastAd = p.ads[p.ads.length - 1];
                                                                    return {
                                                                        ...p,
                                                                        ads: [...p.ads, {
                                                                            ...lastAd,
                                                                            id: Date.now().toString(),
                                                                            ad_name: '',
                                                                            variables: ['', '', '', '', ''],
                                                                            showFifthVariable: false
                                                                        }],
                                                                        currentAdIndex: p.ads.length
                                                                    };
                                                                });
                                                                setDropdownOpen(false);
                                                            }}
                                                            className="text-[#acf800] hover:scale-110 transition-transform p-2"
                                                        >
                                                            <PlusCircle size={20} />
                                                        </button>
                                                    </div>
                                                    {formData.ads.map((ad, idx) => (
                                                        <div
                                                            key={ad.id}
                                                            className={`ad-item ${formData.currentAdIndex === idx ? 'active' : ''}`}
                                                            onClick={() => { setFormData(p => ({ ...p, currentAdIndex: idx })); setDropdownOpen(false); }}
                                                        >
                                                            <span className="text-[11px] font-bold">Anúncio #{idx + 1}</span>
                                                            {formData.ads.length > 1 && (
                                                                <Trash2 size={12} className="text-rose-500 hover:scale-125" onClick={e => {
                                                                    e.stopPropagation();
                                                                    setFormData(p => {
                                                                        const newAds = p.ads.filter((_, i) => i !== idx);
                                                                        return { ...p, ads: newAds, currentAdIndex: 0 };
                                                                    });
                                                                }} />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '40px' }}>
                                        <label className="text-[10px] font-black uppercase tracking-[3px] opacity-40 ml-1">Tipo de Criativo</label>
                                        <div className="flex flex-wrap gap-4 pt-2">
                                            {(['TEXT', 'IMAGE', 'VIDEO'] as const).map(t => {
                                                const isSelected = formData.ads[formData.currentAdIndex].template_type === t;
                                                return (
                                                    <div
                                                        key={t}
                                                        onClick={() => {
                                                            const newAds = [...formData.ads];
                                                            newAds[formData.currentAdIndex].template_type = t;
                                                            newAds[formData.currentAdIndex].media_url = '';
                                                            setFormData(p => ({ ...p, ads: newAds }));
                                                        }}
                                                        className={`creative-card ${isSelected ? 'active' : ''}`}
                                                    >
                                                        <div className="creative-icon-box">
                                                            {t === 'TEXT' ? <MessageSquare size={18} /> : t === 'IMAGE' ? <ImageIcon size={18} /> : <Video size={18} />}
                                                        </div>
                                                        <span className="creative-label">
                                                            {t === 'TEXT' ? 'Texto' : t === 'IMAGE' ? 'Imagem' : 'Vídeo'}
                                                        </span>
                                                        {isSelected && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#acf800]"></div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {formData.ads[formData.currentAdIndex].template_type !== 'TEXT' && (
                                        <div className="form-group">
                                            <label className="text-[10px] font-black uppercase tracking-[3px] opacity-40 ml-1">
                                                Mídia do Criativo ({formData.ads[formData.currentAdIndex].template_type === 'IMAGE' ? 'Imagem' : 'Vídeo'})
                                            </label>
                                            <div 
                                                className={`upload-zone py-12 ${formData.ads[formData.currentAdIndex].media_url ? 'uploaded' : ''}`} 
                                                onClick={() => document.getElementById('media-upload')?.click()}
                                            >
                                                <input id="media-upload" type="file" hidden accept={formData.ads[formData.currentAdIndex].template_type === 'IMAGE' ? 'image/*' : 'video/*'} onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'media_url')} />
                                                {formData.ads[formData.currentAdIndex].media_url ? (
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle size={18} className="text-[#acf800]" />
                                                        <span className="text-[10px] font-black text-[#acf800] uppercase tracking-widest">Arquivo Carregado</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 opacity-30">
                                                        <PlusCircle size={20} />
                                                        <span className="text-[10px] font-black uppercase tracking-[2px]">Clique para carregar mídia</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Configuration Section */}
                                    <div className="space-y-12">
                                        <div className="flex items-center gap-6 bg-white/[0.03] p-8 rounded-[32px] border border-white/5 shadow-inner">
                                            <label className="custom-switch scale-110">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.ads[formData.currentAdIndex].showFifthVariable}
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
                                                            ad.ad_copy = `Oi ${v1}! Informamos que ${v2}\n\n${v3}\n\n${v4}\n\nPara ${v5}, clique no botão abaixo 👇`;
                                                        } else {
                                                            ad.ad_copy = `Oi ${v1}! Informamos que ${v2}\n\n${v3}\n\nPara ${v4}, clique no botão abaixo 👇`;
                                                        }
                                                        setFormData(p => ({ ...p, ads: newAds }));
                                                    }}
                                                />
                                                <span className="switch-slider"></span>
                                            </label>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-black uppercase tracking-[4px] text-[#acf800]">HABILITAR 5ª VARIÁVEL</span>
                                                <p className="text-[9px] opacity-30 font-bold tracking-widest uppercase">Campo extra de personalização</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="form-group">
                                                <label className="text-[10px] font-black uppercase tracking-[3px] opacity-40 ml-1">Link do Botão (HTTPS)</label>
                                                <div className="relative group">
                                                    <Globe size={18} className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 group-focus-within:text-[#acf800] transition-all" />
                                                    <input
                                                        className="input-premium py-6 pl-16 pr-8"
                                                        placeholder="https://sua-url.com"
                                                        value={formData.ads[formData.currentAdIndex].button_link || ''}
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

                                            <div className="form-group">
                                                <label className="text-[10px] font-black uppercase tracking-[3px] opacity-40 ml-1">Planilha de Contatos</label>
                                                <div
                                                    className={`upload-zone h-[76px] ${formData.ads[formData.currentAdIndex].spreadsheet_url ? 'uploaded' : ''}`}
                                                    onClick={() => document.getElementById('sheet-upload')?.click()}
                                                >
                                                    <input id="sheet-upload" type="file" hidden accept=".xlsx,.xls,.csv" onChange={e => {
                                                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'spreadsheet_url');
                                                    }} />
                                                    {formData.ads[formData.currentAdIndex].spreadsheet_url ? (
                                                        <div className="flex items-center gap-3">
                                                            <CheckCircle size={20} className="text-[#acf800]" />
                                                            <span className="text-[10px] font-black text-[#acf800] uppercase tracking-widest">Base ok</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 opacity-30 group-hover:opacity-100 transition-all">
                                                            <FileSpreadsheet size={20} />
                                                            <p className="text-[10px] font-black uppercase tracking-[2px] padding-4">Subir Base</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Config */}
                                    <div className="space-y-10 pt-16 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-black uppercase tracking-[4px] opacity-40 ml-1">Configuração da Mensagem</label>
                                                <p className="text-[9px] opacity-20 font-bold tracking-widest uppercase ml-1">Preencha as variáveis</p>
                                            </div>
                                            <div className="mode-toggle">
                                                <button onClick={() => {
                                                    const newAds = [...formData.ads];
                                                    newAds[formData.currentAdIndex].message_mode = 'manual';
                                                    setFormData(p => ({ ...p, ads: newAds }));
                                                }} className={`mode-btn ${formData.ads[formData.currentAdIndex].message_mode === 'manual' ? 'active' : ''}`}>Manual</button>
                                                <button onClick={() => {
                                                    const newAds = [...formData.ads];
                                                    newAds[formData.currentAdIndex].message_mode = 'upload';
                                                    setFormData(p => ({ ...p, ads: newAds }));
                                                }} className={`mode-btn ${formData.ads[formData.currentAdIndex].message_mode === 'upload' ? 'active' : ''}`}>Arquivo</button>
                                            </div>
                                        </div>

                                        {formData.ads[formData.currentAdIndex].message_mode === 'manual' ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 pt-2">
                                                {[1, 2, 3, 4, 5].map(vNum => {
                                                    if (vNum === 5 && !formData.ads[formData.currentAdIndex].showFifthVariable) return null;
                                                    return (
                                                        <div key={vNum} className="form-group">
                                                            <label className="text-[9px] font-black uppercase tracking-[3px] text-[#acf800] ml-1">Variável {vNum}</label>
                                                            <div className="relative group">
                                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#acf800] opacity-20 group-focus-within:opacity-100 group-focus-within:scale-150 transition-all"></div>
                                                                <input
                                                                    className="input-premium py-5 pl-14"
                                                                    placeholder={`Ex: ${vNum === 1 ? 'Nome' : 'Valor'}`}
                                                                    value={formData.ads[formData.currentAdIndex].variables[vNum - 1] || ''}
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
                                                                            ad.ad_copy = `Oi ${v1}! Informamos que ${v2}\n\n${v3}\n\n${v4}\n\nPara ${v5}, clique no botão abaixo 👇`;
                                                                        } else {
                                                                            ad.ad_copy = `Oi ${v1}! Informamos que ${v2}\n\n${v3}\n\nPara ${v4}, clique no botão abaixo 👇`;
                                                                        }
                                                                        setFormData(p => ({ ...p, ads: newAds }));
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="form-group">
                                                <label className="text-[10px] font-black uppercase tracking-[3px] opacity-40 ml-1">Upload de Mensagens</label>
                                                <div 
                                                    className={`upload-zone py-12 ${formData.ads[formData.currentAdIndex].ad_copy_file ? 'uploaded' : ''}`} 
                                                    onClick={() => document.getElementById('msg-upload')?.click()}
                                                >
                                                    <input id="msg-upload" type="file" hidden accept=".txt" onChange={e => {
                                                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'ad_copy_file');
                                                    }} />
                                                    {formData.ads[formData.currentAdIndex].ad_copy_file ? (
                                                        <div className="flex items-center gap-3">
                                                            <CheckCircle size={18} className="text-[#acf800]" />
                                                            <span className="text-[10px] font-black text-[#acf800] uppercase tracking-widest">Base de Mensagens Ok</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 opacity-30">
                                                            <FileSpreadsheet size={20} />
                                                            <span className="text-[10px] font-black uppercase tracking-[2px]">Subir arquivo de mensagens</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-24 border-t border-white/5 flex gap-8">
                                        <button onClick={prevStep} className="nav-btn nav-btn-secondary flex-1 justify-center">VOLTAR</button>
                                        <button onClick={nextStep} className="nav-btn nav-btn-primary flex-2 justify-center">PRÓXIMO PASSO <ArrowRight size={18} /></button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="glass-card animate-fade-in space-y-16">
                                    <div className="space-y-4">
                                        <h2 className="section-title">RESUMO DA CAMPANHA</h2>
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {formData.ads.map((ad, idx) => (
                                                <div key={ad.id} className="bg-white/5 p-8 rounded-[32px] border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 rounded-2xl bg-[#acf800]/10 text-[#acf800] flex items-center justify-center font-black text-sm border border-[#acf800]/20">#{idx + 1}</div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-[3px] text-[#acf800]/60">{ad.template_type}</p>
                                                            <p className="text-sm font-bold text-white/90">{ad.ad_name || `Anúncio #${idx + 1}`}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => { setFormData(p => ({ ...p, currentAdIndex: idx })); setStep(2); }} className="p-4 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 hover:text-[#acf800]"><Settings size={18} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-16 border-t border-white/5 flex gap-8">
                                        <button onClick={prevStep} className="nav-btn nav-btn-secondary flex-1 justify-center">VOLTAR</button>
                                        <button onClick={handleSubmit} disabled={isSubmitting} className="nav-btn nav-btn-primary flex-2 justify-center">
                                            {isSubmitting ? <Activity className="animate-spin" size={18} /> : <>FINALIZAR E ENVIAR <Send size={18} /></>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PREVIEW SIDE */}
                        <div className="preview-side">
                            <div className="iphone-mockup">
                                <div className="iphone-screen">
                                    <div className="chat-header">
                                        <div className="w-[40px] h-[40px] rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0" style={{ maxWidth: '40px', maxHeight: '40px' }}>
                                            {formData.profile_photo ? <img src={formData.profile_photo} className="w-full h-full object-contain" style={{ maxWidth: '100%', maxHeight: '100%', padding: '2px' }} /> : <User size={20} className="opacity-20" />}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-white leading-none mb-1">{formData.profile_name || 'Nome do Atendimento'}</p>
                                            <p className="text-[10px] text-white/40 leading-none">online</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-2 flex flex-col items-start gap-1 overflow-y-auto">
                                        <div className="chat-bubble animate-scale-in">
                                            {formData.ads[formData.currentAdIndex].template_type === 'IMAGE' && (
                                                <div className="mb-3 w-full aspect-video bg-black/60 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden relative group">
                                                    {formData.ads[formData.currentAdIndex].media_url ? (
                                                        <img
                                                            src={formData.ads[formData.currentAdIndex].media_url}
                                                            className="w-full h-full object-contain"
                                                            alt="Preview"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 opacity-20">
                                                            <ImageIcon size={32} />
                                                            <span className="text-[8px] font-black uppercase">Aguardando Imagem</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {formData.ads[formData.currentAdIndex].template_type === 'VIDEO' && (
                                                <div className="mb-3 w-full aspect-video bg-black/60 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden relative group">
                                                    {formData.ads[formData.currentAdIndex].media_url ? (
                                                        <video
                                                            src={formData.ads[formData.currentAdIndex].media_url}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 opacity-20">
                                                            <Video size={32} />
                                                            <span className="text-[8px] font-black uppercase">Aguardando Vídeo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap leading-relaxed">{formData.ads[formData.currentAdIndex].ad_copy}</p>
                                            <div className="chat-button mt-4">
                                                Acessar Link
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto animate-fade-in pt-20">
                        <div className="glass-card text-center space-y-10 py-24">
                            <div className="w-24 h-24 bg-[#acf800]/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                                <CheckCircle className="text-[#acf800]" size={48} />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black tracking-tighter">SUCESSO!</h1>
                                <p className="text-white/40 font-medium text-sm px-10">Sua campanha foi enviada para processamento com sucesso.</p>
                            </div>
                            <div className="flex flex-col gap-4 mt-12 px-6">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="nav-btn nav-btn-primary w-full justify-center"
                                >
                                    NOVO ANÚNCIO
                                </button>
                                <button
                                    onClick={() => navigate('/client-dashboard')}
                                    className="nav-btn nav-btn-secondary w-full justify-center"
                                >
                                    VOLTAR AO DASHBOARD
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
