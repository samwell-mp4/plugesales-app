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
        <div className="min-h-screen form-container-wrapper" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <style>{`
                .glass-card {
                    margin-top: 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                    border-radius: 32px;
                    padding: 48px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-card:hover {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(172, 248, 0, 0.1);
                }
                .form-container-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 60px 20px;
                    width: 100%;
                    box-sizing: border-box;
                    background: radial-gradient(circle at 0% 0%, rgba(172, 248, 0, 0.03) 0%, transparent 50%),
                                radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
                }
                .whatsapp-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 380px;
                    gap: 60px; 
                    max-width: 1300px; 
                    width: 100%;
                }
                .header-title { 
                    font-size: 4rem; 
                    font-weight: 900; 
                    margin-bottom: 8px; 
                    letter-spacing: -4px; 
                    line-height: 0.9;
                }
                .header-subtitle { 
                    font-size: 11px; 
                    opacity: 0.4; 
                    font-weight: 800; 
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }
                .section-title {
                    font-size: 1.5rem;
                    font-weight: 900;
                    letter-spacing: -1px;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                }
                .section-subtitle {
                    font-size: 13px;
                    opacity: 0.5;
                    font-weight: 500;
                    margin-bottom: 40px;
                }

                .input-premium {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: #fff;
                    padding: 16px 20px;
                    border-radius: 16px;
                    width: 100%;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                .input-premium:focus { 
                    border-color: var(--primary-color); 
                    background: rgba(255, 255, 255, 0.05); 
                    box-shadow: 0 0 20px rgba(172, 248, 0, 0.1); 
                    outline: none; 
                }

                .upload-zone {
                    border: 2px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    background: rgba(255, 255, 255, 0.01);
                }
                .upload-zone:hover { 
                    border-color: var(--primary-color); 
                    background: rgba(172, 248, 0, 0.05); 
                    transform: translateY(-4px); 
                }

                .iphone-mockup {
                    width: 320px;
                    height: 640px;
                    background: #000;
                    border: 12px solid #1a1c1e;
                    border-radius: 48px;
                    position: relative;
                    margin: 0 auto;
                    overflow: hidden;
                    box-shadow: 0 30px 60px -12px rgba(0,0,0,0.7);
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
                    padding: 40px 16px 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .chat-bubble {
                    align-self: flex-start;
                    background: #202c33;
                    color: #fff;
                    padding: 10px 14px;
                    border-radius: 0 12px 12px 12px;
                    margin: 12px;
                    max-width: 85%;
                    font-size: 13.5px;
                    position: relative;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    animation: fadeInUp 0.3s ease-out;
                }
                .chat-bubble::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -8px;
                    width: 8px;
                    height: 13px;
                    background: #202c33;
                    clip-path: polygon(100% 0, 0 0, 100% 100%);
                }
                .chat-button {
                    margin-top: 10px;
                    padding: 10px;
                    background: rgba(255,255,255,0.05);
                    border-top: 1px solid rgba(255,255,255,0.05);
                    color: #53bdeb;
                    text-align: center;
                    font-weight: 600;
                    border-radius: 8px;
                    font-size: 13px;
                }

                .glass-card {
                    margin-top: 40px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(40px);
                    box-shadow: 0 24px 60px rgba(0,0,0,0.4);
                    border-radius: 40px;
                    padding: 64px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-card:hover {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(172, 248, 0, 0.15);
                }

                .creative-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 24px 20px;
                    border-radius: 20px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    flex: 1;
                    min-width: 140px;
                    justify-content: center;
                    color: rgba(255,255,255,0.4);
                }
                .creative-card.active {
                    background: rgba(172, 248, 0, 0.1);
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                    box-shadow: 0 10px 30px rgba(172, 248, 0, 0.1);
                    transform: translateY(-2px);
                }

                .mode-toggle {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 14px;
                    padding: 4px;
                    display: inline-flex;
                    gap: 4px;
                }
                .mode-btn {
                    padding: 10px 20px;
                    border-radius: 11px;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                    color: rgba(255,255,255,0.4);
                    border: none;
                    background: transparent;
                }
                .mode-btn.active {
                    background: #fff;
                    color: #000;
                }

                .nav-btn {
                    padding: 16px 32px;
                    border-radius: 18px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .nav-btn-primary {
                    background: var(--primary-gradient);
                    color: #000;
                    box-shadow: 0 10px 25px -5px rgba(172, 248, 0, 0.3);
                }
                .nav-btn-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px -5px rgba(172, 248, 0, 0.4);
                }
                .nav-btn-secondary {
                    background: rgba(255,255,255,0.03);
                    color: rgba(255,255,255,0.6);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .nav-btn-secondary:hover {
                    background: rgba(255,255,255,0.07);
                    color: #fff;
                }

                .custom-switch {
                    position: relative;
                    display: inline-block;
                    width: 52px;
                    height: 28px;
                    flex-shrink: 0;
                }
                .custom-switch input { opacity: 0; width: 0; height: 0; }
                .switch-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(255,255,255,0.1);
                    transition: .4s;
                    border-radius: 34px;
                }
                .switch-slider:before {
                    position: absolute;
                    content: "";
                    height: 20px; width: 20px;
                    left: 4px; bottom: 4px;
                    background: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .switch-slider { background: var(--primary-color); }
                input:checked + .switch-slider:before { transform: translateX(24px); }
                
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 1024px) {
                    .whatsapp-grid { grid-template-columns: 1fr; gap: 40px; }
                    .preview-side { display: none !important; }
                }

                .ad-selector-btn {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 12px 20px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .ad-selector-btn:hover { background: rgba(255, 255, 255, 0.05); border-color: var(--primary-color); }

                .ad-dropdown {
                    position: absolute;
                    top: 110%;
                    right: 0;
                    width: 300px;
                    background: rgba(20, 20, 20, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 12px;
                    z-index: 100;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .ad-item {
                    padding: 10px 14px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 4px;
                }
                .ad-item:hover { background: rgba(255,255,255,0.05); }
                .ad-item.active { background: rgba(172, 248, 0, 0.1); color: var(--primary-color); }

                .neon-glow {
                    box-shadow: 0 0 20px rgba(172, 248, 0, 0.2);
                }
            `}</style>

            <div className="max-w-7xl w-full">
                {step < 4 ? (
                    <div className="whatsapp-grid">
                        <div className="form-side animate-fade-in">
                            <div className="mb-12 text-center sm:text-left">
                                <h1 className="header-title">
                                    Configurar <span style={{ color: 'var(--primary-color)' }}>Marca</span>
                                </h1>
                                <p className="header-subtitle">DETALHES DA CAMPANHA E IDENTIDADE VISUAL</p>
                            </div>

                            <div className="flex justify-center sm:justify-start mb-12">
                                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                                    {(user?.role === 'ADMIN' ? [0, 1, 2, 3] : [1, 2, 3]).map((i, idx) => (
                                        <div 
                                            key={i} 
                                            onClick={() => i < step && setStep(i)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                                                step === i ? 'bg-primary text-black shadow-lg scale-110' : step > i ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'
                                            }`}
                                        >
                                            {step > i ? <CheckCircle size={16} /> : idx + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {step === 0 && user?.role === 'ADMIN' && (
                                <div className="glass-card animate-fade-in space-y-8">
                                    <div>
                                        <h2 className="section-title">Selecionar Cliente</h2>
                                        <p className="section-subtitle">Escolha o destinatário desta submissão.</p>
                                    </div>
                                    <div className="space-y-6">
                                        {!isCreatingClient ? (
                                            <div className="space-y-4">
                                                <select
                                                    className="input-premium py-4"
                                                    value={formData.user_id || ''}
                                                    onChange={e => setFormData(p => ({ ...p, user_id: e.target.value }))}
                                                >
                                                    <option value="">Selecione um cliente...</option>
                                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                                                </select>
                                                <button onClick={() => setIsCreatingClient(true)} className="text-primary text-[10px] font-black tracking-widest uppercase hover:underline">+ Cadastrar Novo Cliente</button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleCreateClient} className="grid grid-cols-2 gap-4 bg-white/5 p-6 rounded-2xl">
                                                <input className="input-premium" placeholder="Nome" value={newClientData.name} onChange={e => setNewClientData(p => ({ ...p, name: e.target.value }))} required />
                                                <input className="input-premium" placeholder="Email" value={newClientData.email} onChange={e => setNewClientData(p => ({ ...p, email: e.target.value }))} required />
                                                <input className="input-premium" placeholder="DDD+Tel" value={newClientData.phone} onChange={e => setNewClientData(p => ({ ...p, phone: e.target.value }))} required />
                                                <input className="input-premium" type="password" placeholder="Senha" value={newClientData.password} onChange={e => setNewClientData(p => ({ ...p, password: e.target.value }))} required />
                                                <div className="col-span-2 flex gap-4">
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
                                <div className="glass-card animate-fade-in space-y-12">
                                    <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                                        <div className="flex flex-col items-center gap-6">
                                            <div 
                                                className="w-40 h-40 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden bg-white/5 shadow-2xl"
                                                onClick={() => document.getElementById('photo-upload')?.click()}
                                            >
                                                <input id="photo-upload" type="file" hidden accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'profile_photo')} />
                                                {formData.profile_photo ? <img src={formData.profile_photo} className="w-full h-full object-cover" /> : <ImageIcon size={40} className="opacity-20" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[3px] opacity-50">Foto do Perfil</span>
                                        </div>
                                        <div className="flex-1 w-full space-y-10">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black uppercase tracking-widest opacity-50 ml-1">Nome do Atendimento</label>
                                                <input className="input-premium py-5 px-6 text-base" placeholder="Ex: Suporte VIP" value={formData.profile_name} onChange={e => setFormData(p => ({ ...p, profile_name: e.target.value }))} />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black uppercase tracking-widest opacity-50 ml-1">DDD Regional</label>
                                                <input className="input-premium py-5 px-6 text-base" placeholder="Ex: 11" maxLength={2} value={formData.ddd} onChange={e => setFormData(p => ({ ...p, ddd: e.target.value.replace(/\D/g, '') }))} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-10 border-t border-white/5 flex gap-6">
                                        <button onClick={prevStep} className="nav-btn nav-btn-secondary px-10">VOLTAR</button>
                                        <button onClick={nextStep} className="nav-btn nav-btn-primary flex-1 justify-center py-5">PRÓXIMO PASSO <ArrowRight size={18} /></button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="glass-card animate-fade-in space-y-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="relative">
                                            <div className="ad-selector-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                                <LayoutGrid size={18} className="text-primary" />
                                                <span className="text-xs font-black uppercase tracking-widest">Anúncio #{formData.currentAdIndex + 1}</span>
                                                <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                            {dropdownOpen && (
                                                <div className="ad-dropdown">
                                                    <div className="flex justify-between items-center px-2 mb-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Lista de Anúncios</span>
                                                        <button onClick={() => {
                                                            setFormData(p => ({
                                                                ...p,
                                                                ads: [...p.ads, { ...p.ads[0], id: Date.now().toString(), ad_name: '', variables: ['', '', '', '', ''], showFifthVariable: false }],
                                                                currentAdIndex: p.ads.length
                                                            }));
                                                            setDropdownOpen(false);
                                                        }} className="text-primary"><PlusCircle size={18} /></button>
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
                                        <div className="mode-toggle">
                                            <button onClick={() => {
                                                const newAds = [...formData.ads];
                                                newAds[formData.currentAdIndex].message_mode = 'manual';
                                                setFormData(prev => ({ ...prev, ads: newAds }));
                                            }} className={`mode-btn ${formData.ads[formData.currentAdIndex].message_mode === 'manual' ? 'active' : ''}`}>Manual</button>
                                            <button onClick={() => {
                                                const newAds = [...formData.ads];
                                                newAds[formData.currentAdIndex].message_mode = 'upload';
                                                setFormData(prev => ({ ...prev, ads: newAds }));
                                            }} className={`mode-btn ${formData.ads[formData.currentAdIndex].message_mode === 'upload' ? 'active' : ''}`}>Arquivo</button>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40 ml-1">Tipo de Criativo</label>
                                            <div className="flex flex-wrap gap-4">
                                                {(['TEXT', 'IMAGE', 'VIDEO'] as const).map(t => {
                                                    const isSelected = formData.ads[formData.currentAdIndex].template_type === t;
                                                    return (
                                                        <div 
                                                            key={t} 
                                                            onClick={() => {
                                                                const newAds = [...formData.ads];
                                                                newAds[formData.currentAdIndex].template_type = t;
                                                                newAds[formData.currentAdIndex].media_url = '';
                                                                setFormData(prev => ({ ...prev, ads: newAds }));
                                                            }}
                                                            className={`flex-1 min-w-[120px] p-6 rounded-2xl border transition-all duration-400 flex flex-col items-center justify-center gap-3 group relative overflow-hidden ${
                                                                isSelected 
                                                                    ? 'bg-[#ACF800]/10 border-[#ACF800] shadow-[0_0_20px_rgba(172,248,0,0.15)] scale-105 z-10' 
                                                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                                            }`}
                                                        >
                                                            <div className={`p-3 rounded-xl transition-all duration-300 ${isSelected ? 'bg-[#ACF800] text-black shadow-[0_0_15px_#ACF800]' : 'bg-white/5 text-white/20'}`}>
                                                                {t === 'TEXT' ? <MessageSquare size={20} /> : t === 'IMAGE' ? <ImageIcon size={20} /> : <Video size={20} />}
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase tracking-[2px] ${isSelected ? 'text-[#ACF800]' : 'text-white/40'}`}>
                                                                {t === 'TEXT' ? 'Apenas Texto' : t === 'IMAGE' ? 'Imagem' : 'Vídeo'}
                                                            </span>
                                                            {isSelected && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ACF800]" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {formData.ads[formData.currentAdIndex].template_type !== 'TEXT' && (
                                            <div className="space-y-4 animate-fade-in">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">
                                                    Carregar {formData.ads[formData.currentAdIndex].template_type === 'IMAGE' ? 'Imagem' : 'Vídeo'}
                                                </label>
                                                <div className="upload-zone py-10" onClick={() => document.getElementById('media-upload')?.click()}>
                                                    <input id="media-upload" type="file" hidden accept={formData.ads[formData.currentAdIndex].template_type === 'IMAGE' ? 'image/*' : 'video/*'} onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'media_url')} />
                                                    {formData.ads[formData.currentAdIndex].media_url ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <CheckCircle size={32} className="text-primary" />
                                                            <span className="text-[10px] font-black text-primary uppercase">Arquivo Carregado</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                                            {formData.ads[formData.currentAdIndex].template_type === 'IMAGE' ? <ImageIcon size={32} /> : <Video size={32} />}
                                                            <p className="text-[10px] font-black uppercase">Clique para enviar</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3 bg-white/5 p-5 rounded-2xl border border-white/5 shadow-inner">
                                                <label className="custom-switch">
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
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">HABILITAR 5ª VARIÁVEL</span>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Link do Botão (Obrigatório HTTPS)</label>
                                                <div className="relative">
                                                    <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" />
                                                    <input 
                                                        className="input-premium py-5 pl-14" 
                                                        placeholder="https://sua-url.com" 
                                                        value={formData.ads[formData.currentAdIndex].button_link} 
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

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Planilha de Contatos</label>
                                                <div className="upload-zone py-8" onClick={() => document.getElementById('sheet-upload')?.click()}>
                                                    <input id="sheet-upload" type="file" hidden accept=".xlsx,.xls,.csv" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'spreadsheet_url')} />
                                                    {formData.ads[formData.currentAdIndex].spreadsheet_url ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <CheckCircle size={32} className="text-primary" />
                                                            <span className="text-[10px] font-black text-primary uppercase">Planilha Pronta</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                                            <FileSpreadsheet size={32} />
                                                            <p className="text-[10px] font-black uppercase">Carregar Contatos</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Configuração da Mensagem</label>
                                                    <div className="mode-toggle">
                                                        <button onClick={() => {
                                                            const newAds = [...formData.ads];
                                                            newAds[formData.currentAdIndex].message_mode = 'manual';
                                                            setFormData(prev => ({ ...prev, ads: newAds }));
                                                        }} className={`mode-btn ${formData.ads[formData.currentAdIndex].message_mode === 'manual' ? 'active' : ''}`}>Manual</button>
                                                        <button onClick={() => {
                                                            const newAds = [...formData.ads];
                                                            newAds[formData.currentAdIndex].message_mode = 'upload';
                                                            setFormData(prev => ({ ...prev, ads: newAds }));
                                                        }} className={`mode-btn ${formData.ads[formData.currentAdIndex].message_mode === 'upload' ? 'active' : ''}`}>Arquivo</button>
                                                    </div>
                                                </div>

                                                {formData.ads[formData.currentAdIndex].message_mode === 'manual' ? (
                                                    <div className="grid grid-cols-2 gap-x-6 gap-y-8 pt-4">
                                                        {[1, 2, 3, 4, 5].map(vNum => {
                                                            if (vNum === 5 && !formData.ads[formData.currentAdIndex].showFifthVariable) return null;
                                                            return (
                                                                <div key={vNum} className="space-y-2">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Variável {vNum}</label>
                                                                    <input 
                                                                        className="input-premium py-4" 
                                                                        placeholder={`Valor de {{${vNum}}}`}
                                                                        value={formData.ads[formData.currentAdIndex].variables[vNum - 1]}
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
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="upload-zone py-12" onClick={() => document.getElementById('msg-upload')?.click()}>
                                                        <input id="msg-upload" type="file" hidden accept=".txt" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ad_copy_file')} />
                                                        {formData.ads[formData.currentAdIndex].ad_copy_file ? (
                                                            <div className="flex flex-col items-center gap-2">
                                                                <CheckCircle size={32} className="text-primary" />
                                                                <span className="text-[10px] font-black text-primary uppercase">Mensagem Importada</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                                <Settings size={32} />
                                                                <p className="text-[10px] font-black uppercase">Carregar Mensagem TXT</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex gap-4">
                                        <button onClick={prevStep} className="nav-btn nav-btn-secondary">VOLTAR</button>
                                        <button onClick={nextStep} className="nav-btn nav-btn-primary flex-1 justify-center">CONFERIR RESUMO <ChevronRight size={18} /></button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="glass-card animate-fade-in space-y-8">
                                    <div className="space-y-4">
                                        <h2 className="section-title">RESUMO DA CAMPANHA</h2>
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {formData.ads.map((ad, idx) => (
                                                <div key={ad.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center justify-between group">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs">#{idx + 1}</div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Tipo: {ad.template_type}</p>
                                                            <p className="text-xs font-bold text-white/80">{ad.ad_name || 'Anúncio sem nome'}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => { setFormData(p => ({ ...p, currentAdIndex: idx })); setStep(2); }} className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"><Settings size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-8 border-t border-white/5 flex gap-4">
                                        <button onClick={prevStep} className="nav-btn nav-btn-secondary">VOLTAR</button>
                                        <button onClick={handleSubmit} disabled={isSubmitting} className="nav-btn nav-btn-primary flex-1 justify-center neon-glow">
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
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                                            {formData.profile_photo ? <img src={formData.profile_photo} className="w-full h-full object-cover" /> : <User size={20} className="opacity-20" />}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-white leading-none mb-1">{formData.profile_name || 'Nome do Atendimento'}</p>
                                            <p className="text-[10px] text-white/40 leading-none">visto por último hoje às 14:32</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-2 flex flex-col items-start gap-1 overflow-y-auto">
                                        <div className="chat-bubble">
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
                                                            controls
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
                                                Clique Aqui para Acessar
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto animate-fade-in pt-20">
                        <div className="glass-card text-center space-y-8 py-20 neon-glow">
                            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle className="text-primary" size={48} />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black tracking-tighter">SUCESSO!</h1>
                                <p className="text-white/40 font-medium text-sm px-10">Sua submissão de anúncios foi enviada com sucesso e está pronta para ser processada.</p>
                            </div>
                            <div className="flex flex-col gap-4 mt-12 px-6">
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="nav-btn nav-btn-primary w-full justify-center py-5 shadow-xl"
                                >
                                    <RefreshCw size={18} /> CRIAR NOVO ANÚNCIO
                                </button>
                                <button 
                                    onClick={() => navigate('/client-dashboard')} 
                                    className="nav-btn nav-btn-secondary w-full justify-center py-5"
                                >
                                    <Home size={18} /> IR PARA O DASHBOARD
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
