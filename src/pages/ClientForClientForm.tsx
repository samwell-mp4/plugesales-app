import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronRight, ChevronLeft, Send, 
    User, Mail, Briefcase, Lock, ShieldCheck,
    Smartphone, Zap
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import './ClientForClientForm.css';

const STEPS = [
    { id: 'intro', title: 'Boas-vindas' },
    { id: 'name', title: 'Identificação' },
    { id: 'contact', title: 'Contato' },
    { id: 'security', title: 'Segurança' }
];

const ClientForClientForm = () => {
    const { parentId, submissionId } = useParams<{ parentId: string; submissionId?: string }>();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        password: ''
    });

    const totalSteps = STEPS.length;

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!parentId) return;
        setIsSubmitting(true);

        try {
            const res = await dbService.registerSubClient(
                Number(parentId),
                submissionId ? Number(submissionId) : null,
                formData
            );

            if (res.success) {
                // Auto-login
                const loginRes = await dbService.login({ 
                    email: formData.email, 
                    password: formData.password 
                });
                
                if (loginRes && !loginRes.error) {
                    // AuthContext provides setUser (via useAuth) which handles localStorage and state
                    setUser(loginRes);
                    navigate('/client-dashboard');
                } else {
                    // Fallback to manual login if auto-login fails for some reason
                    navigate('/client-auth');
                }
            } else {
                alert("Erro ao realizar cadastro: " + (res.error || "Tente novamente mais tarde."));
            }
        } catch (err) {
            console.error("Registration error:", err);
            alert("Erro crítico ao enviar formulário.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Intro
                return (
                    <div className="step-content animate-slide-in">
                        <div className="icon-badge main-glow">
                            <Zap size={30} />
                        </div>
                        <h1 className="premium-title">Seja um <span style={{ color: 'var(--primary-color)' }}>Parceiro</span> Plug & Sales</h1>
                        <p className="premium-subtitle">Você foi convidado para gerenciar suas próprias campanhas com a tecnologia oficial do WhatsApp API.</p>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', maxWidth: '400px' }}>
                            Preencha os dados a seguir para criar seu acesso. Sua conta passará por uma breve aprovação.
                        </div>
                        <button className="primary-btn-premium" style={{ marginTop: '30px' }} onClick={nextStep}>
                            Começar Agora <ChevronRight size={18} />
                        </button>
                    </div>
                );
            case 1: // Name & Company
                return (
                    <div className="step-content animate-slide-in">
                        <div className="icon-badge">
                            <User size={24} />
                        </div>
                        <h2 className="step-question">Quem é você?</h2>
                        <input 
                            type="text" 
                            className="premium-input" 
                            placeholder="Seu Nome Completo"
                            value={formData.name}
                            onChange={(e) => updateData('name', e.target.value)}
                        />
                        <input 
                            type="text" 
                            className="premium-input" 
                            placeholder="Nome da sua Empresa"
                            value={formData.company}
                            onChange={(e) => updateData('company', e.target.value)}
                        />
                        <div className="step-actions">
                            <button className="back-btn" onClick={prevStep}><ChevronLeft size={18} /> Voltar</button>
                            <button 
                                className="primary-btn-premium" 
                                disabled={!formData.name.trim() || !formData.company.trim()} 
                                onClick={nextStep}
                            >Continuar</button>
                        </div>
                    </div>
                );
            case 2: // Contact info
                return (
                    <div className="step-content animate-slide-in">
                        <div className="icon-badge">
                            <Smartphone size={24} />
                        </div>
                        <h2 className="step-question">Como falamos com você?</h2>
                        <input 
                            type="email" 
                            className="premium-input" 
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => updateData('email', e.target.value)}
                        />
                        <input 
                            type="text" 
                            className="premium-input" 
                            placeholder="+55 (00) 00000-0000"
                            value={formData.phone}
                            onChange={(e) => updateData('phone', e.target.value)}
                        />
                        <div className="step-actions">
                            <button className="back-btn" onClick={prevStep}><ChevronLeft size={18} /> Voltar</button>
                            <button 
                                className="primary-btn-premium" 
                                disabled={!formData.email.includes('@') || !formData.phone.trim()} 
                                onClick={nextStep}
                            >Continuar</button>
                        </div>
                    </div>
                );
            case 3: // Password (Security)
                return (
                    <div className="step-content animate-slide-in">
                        <div className="icon-badge">
                            <Lock size={24} />
                        </div>
                        <h2 className="step-question">Crie sua senha de acesso</h2>
                        <p className="step-hint">Escolha uma senha segura para gerenciar suas campanhas.</p>
                        <input 
                            type="password" 
                            className="premium-input" 
                            placeholder="Sua Senha"
                            value={formData.password}
                            onChange={(e) => updateData('password', e.target.value)}
                        />
                        <div className="step-actions">
                            <button className="back-btn" onClick={prevStep}><ChevronLeft size={18} /> Voltar</button>
                            <button 
                                className="primary-btn-premium" 
                                disabled={formData.password.length < 4 || isSubmitting} 
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? 'Finalizando...' : 'Finalizar Cadastro'} <Send size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="lead-flow-wrapper">
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>
            
            <div className="form-container-premium">
                <div className="progress-indicator">
                    <div className="progress-bar-bg">
                        <div 
                            className="progress-bar-fill" 
                            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                        ></div>
                    </div>
                    <div className="step-counter">
                        PASSO <span>{currentStep + 1}</span> DE {totalSteps}
                    </div>
                </div>
                
                <div className="content-viewport">
                    {renderStepContent()}
                </div>

                <div className="security-badge">
                    <ShieldCheck size={14} /> Seus dados estão protegidos por criptografia de ponta a ponta
                </div>
            </div>
        </div>
    );
};

export default ClientForClientForm;
