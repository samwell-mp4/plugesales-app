import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, 
    Mail, 
    Phone, 
    Building2, 
    Send, 
    CheckCircle, 
    ArrowRight,
    Loader2
} from 'lucide-react';
import { dbService } from '../services/dbService';

const ClientForClientForm = () => {
    const { parentId, submissionId } = useParams<{ parentId: string; submissionId?: string }>();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [parentName, setParentName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: ''
    });

    useEffect(() => {
        // Fetch parent client name for better UX
        const fetchParent = async () => {
            if (!parentId) return;
            try {
                const users = await dbService.getAllUsers();
                const parent = users.find((u: any) => String(u.id) === String(parentId));
                if (parent) setParentName(parent.name);
            } catch (err) {
                console.error("Error fetching parent client:", err);
            }
        };
        fetchParent();
    }, [parentId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!parentId) return;

        setIsSubmitting(true);
        try {
            const response = await dbService.registerSubClient(
                Number(parentId),
                submissionId ? Number(submissionId) : null,
                formData
            );

            if (response.success) {
                setIsSuccess(true);
            } else {
                alert("Erro ao enviar cadastro. Por favor, tente novamente.");
            }
        } catch (err) {
            console.error("Submission error:", err);
            alert("Erro de conexão. Verifique sua internet.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
                <div className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-[32px] p-10 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-primary" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>Cadastro Enviado!</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
                        Seus dados foram enviados com sucesso para <strong>{parentName || 'nossa equipe'}</strong>. 
                        Aguarde o contato em breve.
                    </p>
                    <button 
                        onClick={() => setIsSuccess(false)}
                        className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform"
                    >
                        VOLTAR
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <style>{`
                .input-premium {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    padding: 16px 16px 16px 48px;
                    color: white;
                    font-size: 14px;
                    transition: all 0.3s;
                    outline: none;
                }
                .input-premium:focus {
                    border-color: var(--primary-color);
                    background: rgba(255,255,255,0.05);
                    box-shadow: 0 0 20px rgba(172,248,0,0.05);
                }
                .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255,255,255,0.3);
                    transition: all 0.3s;
                }
                .input-premium:focus + .input-icon {
                    color: var(--primary-color);
                }
                .label-premium {
                    font-[10px] font-black uppercase tracking-[2px] opacity-40 mb-2 block;
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .float { animation: float 6s ease-in-out infinite; }
            `}</style>

            <div className="max-w-xl w-full">
                <div className="text-center mb-10 animate-in slide-in-from-top duration-700">
                    <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-6 float">
                        <Building2 size={32} className="text-primary" />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-2px', lineHeight: 1 }}>
                        Formulário de <span className="text-primary">Indicação</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
                        {parentName ? `Cadastro de cliente para ${parentName}` : 'Preencha seus dados abaixo'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl animate-in fade-in slide-in-from-bottom duration-1000">
                    <div className="space-y-6">
                        <div className="relative">
                            <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40 mb-2 block">Nome Completo</label>
                            <div className="relative">
                                <input 
                                    className="input-premium" 
                                    placeholder="Como devemos te chamar?" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <User className="input-icon" size={18} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40 mb-2 block">Seu melhor E-mail</label>
                                <div className="relative">
                                    <input 
                                        className="input-premium" 
                                        type="email"
                                        placeholder="email@exemplo.com" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Mail className="input-icon" size={18} />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40 mb-2 block">WhatsApp de Contato</label>
                                <div className="relative">
                                    <input 
                                        className="input-premium" 
                                        placeholder="(00) 00000-0000" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Phone className="input-icon" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40 mb-2 block">Nome da Empresa (Opcional)</label>
                            <div className="relative">
                                <input 
                                    className="input-premium" 
                                    placeholder="Sua empresa ou negócio" 
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                />
                                <Building2 className="input-icon" size={18} />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black uppercase tracking-[2px] opacity-40 mb-2 block">Alguma observação?</label>
                            <textarea 
                                className="input-premium h-32 resize-none py-4 px-4 pl-12" 
                                placeholder="Conte-nos um pouco sobre sua necessidade..." 
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                            />
                            <div className="absolute left-4 top-[44px]">
                                <ArrowRight className="text-white/30" size={18} />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-5 bg-primary text-black font-black uppercase tracking-[2px] rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_30px_-5px_rgba(172,248,0,0.3)] disabled:opacity-50 mt-4"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    ENVIAR CADASTRO <Send size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-[10px] font-bold opacity-20 uppercase tracking-[4px]">
                    Powered by Plug & Sales Pro
                </p>
            </div>
        </div>
    );
};

export default ClientForClientForm;
