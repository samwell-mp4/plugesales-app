import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
    ChevronRight, ChevronLeft, Send, CheckCircle2,
    MessageSquare, User, Mail, Briefcase, BarChart3,
    Zap, Globe, ShieldCheck
} from 'lucide-react';
import { dbService } from '../services/dbService';
import './LeadStepForm.css';

const STEPS = [
    { id: 'intro', title: 'Boas-vindas' },
    { id: 'name', title: 'Identificação' },
    { id: 'phone', title: 'Contato' },
    { id: 'email', title: 'E-mail' },
    { id: 'niche', title: 'Mercado' },
    { id: 'method', title: 'Operação' },
    { id: 'volume', title: 'Escala' },
    { id: 'success', title: 'Concluído' }
];

const LeadStepForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { id } = useParams<{ id: string }>();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitLock = useRef(false);
    const [direction, setDirection] = useState(1); // 1 for forward, -1 for back
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        niche: '',
        method: '',
        volume: '',
        referral_source: '',
        agent_name: ''
    });

    const totalSteps = STEPS.length - 1; // Success is outside the main loop

    // Mapeamento oficial idêntico à Landing Page
    const agentMap: Record<string, string> = {
        '1': 'Ricardo Willer',
        '2': 'Otávio Augusto',
        '3': 'Augusto Fagundes',
        '4': 'Luis Henrique',
        '5': 'Gabriel Martins',
        '6': 'Italo Clovis',
        '7': 'Samwell Souza',
        '8': 'Thales Henrique',
        '9': 'Ramon Gomes',
        '10': 'Gisele Vieira',
        '11': 'Joyce Vieira',
        '12': 'Thiago Rocha',
        '13': 'Gelton Carlos'
    };

    useEffect(() => {
        const ref = sessionStorage.getItem('landing_ref');
        const landingAgent = sessionStorage.getItem('landing_agent');
        const agentParam = searchParams.get('agent');
        
        // Resolve o agente através do ID na URL (/lead-flow/:id) ou parâmetro
        const routeId = id?.replace('landing', '');
        const routeAgent = routeId ? agentMap[routeId] : null;

        if (agentParam || routeAgent || landingAgent || ref) {
            setFormData(prev => ({ 
                ...prev, 
                referral_source: ref || (routeId ? `direct_id_${routeId}` : ''),
                agent_name: agentParam || routeAgent || landingAgent || '' 
            }));
        }
    }, [searchParams, id]);

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setDirection(1);
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(currentStep - 1);
        }
    };

    const updateData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        // Limit to 11 digits if no +55, 13 if +55
        if (val.length > 11) {
            val = val.substring(0, 11);
        }
        let formatted = val;
        if (val.length > 2) {
            formatted = `(${val.substring(0, 2)}) `;
            if (val.length > 6) {
                // Formatting for 9 digits or 8 digits
                if (val.length === 11) {
                    formatted += `${val.substring(2, 7)}-${val.substring(7, 11)}`;
                } else {
                    formatted += `${val.substring(2, 6)}-${val.substring(6, 11)}`;
                }
            } else {
                formatted += val.substring(2);
            }
        }
        updateData('phone', formatted);
    };

    const isValidPhone = () => {
        const digits = formData.phone.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 11;
    };

    const isValidEmail = () => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
    };

    const handleSubmit = async () => {
        if (submitLock.current) return;
        submitLock.current = true;
        setIsSubmitting(true);
        let success = false;

        try {
            // Enviar para o Backend (O backend gerencia o Webhook centralizado)
            try {
                const res = await dbService.addStepLead(formData);
                if (res) success = true;
            } catch (err) {
                console.error("Local backend error:", err);
            }

            if (success) {
                // Notify Admins
                await dbService.notifyAdmins(
                    'Novo Lead Capturado',
                    `Lead: ${formData.name} entrou via Lead-Flow. (Agente: ${formData.agent_name || 'N/A'})`,
                    'success'
                );

                if (formData.volume === 'Não possuo uma base de contatos') {
                    navigate('/finalizado');
                } else {
                    // Mapeamento inverso para achar ID pelo nome do agente
                    const routeId = id?.replace('landing', '');
                    const foundAgentEntry = Object.entries(agentMap).find(([_, name]) => name === formData.agent_name);
                    const agentId = routeId || (foundAgentEntry ? foundAgentEntry[0] : null);

                    // Se for o ID 2 (Otávio) ou não tiver ID, vai para a página de obrigado geral
                    if (!agentId || agentId === '2') {
                        navigate('/obrigado');
                    } else {
                        navigate(`/obrigado/${agentId}`);
                    }
                }
                setCurrentStep(7);
            } else {
                alert("Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.");
            }
        } catch (err) {
            console.error("General submission error:", err);
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
                            <Zap size={32} />
                        </div>
                        <h1 className="premium-title">Disparos em Massa via <span className="text-gradient">WhatsApp API</span></h1>
                        <p className="premium-subtitle">Este processo é voltado para empresas com base ativa de leads e volume relevante de envios.</p>
                        <div className="info-box">
                            <p>Preencha as informações abaixo para avaliarmos se sua operação está pronta para escalar com a API Oficial.</p>
                        </div>
                        <button className="primary-btn-premium mt-8" onClick={nextStep}>
                            Começar <ChevronRight size={20} />
                        </button>
                    </div>
                );
            case 1: // Name
                return (
                    <div className="step-content animate-slide-in">
                        <div className="icon-badge">
                            <User size={24} />
                        </div>
                        <h2 className="step-question">Qual é o seu nome?</h2>
                        <input
                            type="text"
                            className="premium-input text-center"
                            placeholder="Seu nome completo"
                            value={formData.name}
                            onChange={(e) => updateData('name', e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && formData.name.trim() && nextStep()}
                        />
                        <div className="step-actions">
                            <button className="back-btn" onClick={prevStep}><ChevronLeft size={20} /> Voltar</button>
                            <button
                                className="primary-btn-premium"
                                disabled={!formData.name.trim()}
                                onClick={nextStep}
                            >Continuar</button>
                        </div>
                    </div>
                );
            case 2: // Phone
                return (
                    <div className="step-content animate-slide-in">
                        <div className="icon-badge">
                            <MessageSquare size={24} />
                        </div>
                        <h2 className="step-question">Qual é o seu WhatsApp principal?</h2>
                        <p className="step-hint">Certifique-se de informar um número válido. Nosso contato será feito por ele.</p>
                        <input
                            type="text"
                            className="premium-input text-center"
                            placeholder="(11) 99999-9999"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            onKeyPress={(e) => e.key === 'Enter' && isValidPhone() && nextStep()}
                        />
                        {!isValidPhone() && formData.phone.replace(/\D/g,'').length > 0 && <p style={{color: '#ef4444', fontSize: '12px', marginTop: '8px'}}>O número precisa ser um formato válido de celular brasileiro.</p>}
                        <div className="step-actions mt-6">
                            <button className="back-btn" onClick={prevStep}><ChevronLeft size={20} /> Voltar</button>
                            <button
                                className="primary-btn-premium"
                                disabled={!isValidPhone()}
                                onClick={nextStep}
                            >Continuar</button>
                        </div>
                    </div>
                );
            case 3: // Email
                return (
                    <div className="step-content animate-slide-in">
                        <div className="icon-badge">
                            <Mail size={24} />
                        </div>
                        <h2 className="step-question">Qual é o seu melhor e-mail?</h2>
                        <input
                            type="email"
                            className="premium-input text-center"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => updateData('email', e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && isValidEmail() && nextStep()}
                        />
                        {!isValidEmail() && formData.email.length > 5 && <p style={{color: '#ef4444', fontSize: '12px', marginTop: '8px'}}>Insira um e-mail com formato válido.</p>}
                        <div className="step-actions mt-6">
                            <button className="back-btn" onClick={prevStep}><ChevronLeft size={20} /> Voltar</button>
                            <button
                                className="primary-btn-premium"
                                disabled={!isValidEmail()}
                                onClick={nextStep}
                            >Continuar</button>
                        </div>
                    </div>
                );
            case 4: // Niche
                return (
                    <div className="step-content animate-slide-in">
                        <div className="icon-badge">
                            <Briefcase size={24} />
                        </div>
                        <h2 className="step-question">Qual é o seu nicho de atuação?</h2>
                        <input
                            type="text"
                            className="premium-input text-center"
                            placeholder=""
                            value={formData.niche}
                            onChange={(e) => updateData('niche', e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && formData.niche.trim() && nextStep()}
                        />
                        <div className="step-actions">
                            <button className="back-btn" onClick={prevStep}><ChevronLeft size={20} /> Voltar</button>
                            <button
                                className="primary-btn-premium"
                                disabled={!formData.niche.trim()}
                                onClick={nextStep}
                            >Continuar</button>
                        </div>
                    </div>
                );
            case 5: // Method
                return (
                    <div className="step-content animate-slide-in">
                        <div className="icon-badge">
                            <Globe size={24} />
                        </div>
                        <h2 className="step-question">Você já realiza disparos em massa hoje?</h2>
                        <div className="options-grid">
                            {[
                                { id: 'A', text: 'Já utilizo API Oficial' },
                                { id: 'B', text: 'Utilizo ferramentas alternativas' },
                                { id: 'C', text: 'Ainda não realizo disparos' }
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    className={`option-card ${formData.method === opt.text ? 'selected' : ''}`}
                                    onClick={() => {
                                        updateData('method', opt.text);
                                        setTimeout(nextStep, 150);
                                    }}
                                >
                                    <span className="opt-letter">{opt.id}</span>
                                    <span className="opt-text">{opt.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="step-actions mt-8">
                            <button className="back-btn" onClick={prevStep}><ChevronLeft size={20} /> Voltar</button>
                        </div>
                    </div>
                );
            case 6: // Volume
                return (
                    <div className="step-content animate-slide-in">
                        <div className="icon-badge">
                            <BarChart3 size={24} />
                        </div>
                        <h2 className="step-question">Você possui uma base de leads ativa?</h2>
                        <p className="step-hint text-center max-w-lg mx-auto">Trabalhamos com operações em escala. Volumes muito baixos podem não se enquadrar.</p>
                        <div className="options-list">
                            {[
                                { id: 'A', text: 'Menos de 10 mil contatos' },
                                { id: 'B', text: '10 mil a 30 mil contatos' },
                                { id: 'C', text: '31 mil a 50 mil contatos' },
                                { id: 'D', text: '51 mil a 100 mil contatos' },
                                { id: 'E', text: 'Acima de 100 mil contatos' },
                                { id: 'F', text: 'Não possuo uma base de contatos' }
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    className={`option-row ${formData.volume === opt.text ? 'selected' : ''}`}
                                    onClick={() => updateData('volume', opt.text)}
                                >
                                    <span className="opt-radio"></span>
                                    <span className="opt-text">{opt.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="step-actions mt-8">
                            <button className="back-btn" onClick={prevStep}><ChevronLeft size={20} /> Voltar</button>
                            <button
                                className="primary-btn-premium"
                                disabled={!formData.volume || isSubmitting}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? 'Enviando...' : 'Finalizar Cadastro'} <Send size={18} className="ml-2" />
                            </button>
                        </div>
                    </div>
                );
            case 7: // Success
                return (
                    <div className="step-content animate-scale-in">
                        <div className="success-lottie">
                            <CheckCircle2 size={100} color="var(--primary-color)" />
                        </div>
                        <h2 className="premium-title">Recebemos seus dados!</h2>
                        <p className="premium-subtitle mb-8">Nossa equipe entrará em contato em breve pelo WhatsApp para alinhar os próximos passos da sua operação.</p>
                        <button className="secondary-btn-premium" onClick={() => navigate('/')}>
                            Voltar para o site
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="lead-flow-wrapper">
            {/* Background elements */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <div className="form-container-premium">
                {currentStep < 7 && (
                    <div className="progress-indicator">
                        <div className="progress-bar-bg">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            ></div>
                        </div>
                        <div className="step-counter">
                            ETAPA <span>{currentStep + 1}</span> DE {totalSteps}
                        </div>
                    </div>
                )}

                <div className="content-viewport">
                    {renderStepContent()}
                </div>

                {currentStep < 7 && (
                    <div className="security-badge">
                        <ShieldCheck size={14} className="mr-1" /> Dados protegidos por criptografia
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadStepForm;
