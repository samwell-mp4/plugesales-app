import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { Building2, User, Mail, MapPin, Phone, MessageCircle, Lock, ChevronRight, Briefcase } from 'lucide-react';

const ClientRegistration = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [docType, setDocType] = useState<'CPF' | 'CNPJ'>('CPF');
    
    const [formData, setFormData] = useState({
        name: '', // Razão Social or Nome completo
        fantasy_name: '',
        document_number: '',
        responsible_name: '',
        email: '',
        password: '',
        confirm_password: '',
        address: '',
        phone: '',
        whatsapp: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.name || !formData.document_number || !formData.email || !formData.password || formData.password !== formData.confirm_password) {
                alert("Preencha todos os campos corretamente e verifique se as senhas coincidem.");
                return;
            }
            if (docType === 'CNPJ' && !formData.responsible_name) {
                alert("Nome do responsável é obrigatório para CNPJ.");
                return;
            }
        }
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.address || !formData.phone || !formData.whatsapp) {
            alert("Preencha todos os dados de contato e endereço.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await dbService.register({
                ...formData,
                role: 'CLIENT',
                document_type: docType
            });

            if (result && result.token) {
                await login(formData.email, formData.password);
                navigate('/client-dashboard');
            } else {
                alert(result?.error || "Erro ao registrar. O email já pode estar em uso.");
            }
        } catch (error: any) {
            alert("Erro de conexão. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0a', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .cr-input-group { position: relative; margin-bottom: 16px; }
                .cr-input {
                    width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px; padding: 14px 14px 14px 44px; color: #fff; font-size: 14px; outline: none; transition: all 0.3s;
                }
                .cr-input:focus { border-color: #acf800; background: rgba(172,248,0,0.02); box-shadow: 0 0 0 4px rgba(172,248,0,0.1); }
                .cr-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); }
                .cr-input:focus + .cr-icon { color: #acf800; }
                .cr-btn {
                    width: 100%; background: linear-gradient(135deg, #acf800 0%, #8bc500 100%); color: #000;
                    border: none; padding: 16px; border-radius: 12px; font-weight: 800; font-size: 14px;
                    cursor: pointer; transition: all 0.3s; display: flex; justify-content: center; align-items: center; gap: 8px;
                }
                .cr-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(172,248,0,0.5); }
                .cr-type-btn {
                    flex: 1; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
                    background: transparent; color: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s;
                    display: flex; justify-content: center; align-items: center; gap: 8px;
                }
                .cr-type-btn.active { background: rgba(172,248,0,0.1); border-color: #acf800; color: #acf800; }
                .cr-left-section { display: none; }
                @media (min-width: 1024px) {
                    .cr-left-section { display: block; }
                }
            `}</style>
            
            {/* Left Image Section */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} className="cr-left-section">
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Business" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0) 0%, rgba(10,10,10,1) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', right: '20%' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>Escale suas<br/><span style={{ color: '#acf800' }}>Vendas.</span></h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', maxWidth: '400px' }}>Cadastre-se na Plug & Sales e tenha acesso ao painel completo de gestão de disparos.</p>
                </div>
            </div>

            {/* Form Section */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{ width: '100%', maxWidth: '440px' }}>
                    <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'rgba(172,248,0,0.1)', borderRadius: '16px', marginBottom: '20px' }}>
                            <Briefcase size={30} color="#acf800" />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>Cadastro de Cliente</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Crie sua conta em apenas 2 passos.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
                        <div style={{ height: '4px', flex: 1, background: '#acf800', borderRadius: '4px' }} />
                        <div style={{ height: '4px', flex: 1, background: step === 2 ? '#acf800' : 'rgba(255,255,255,0.1)', borderRadius: '4px', transition: 'all 0.3s' }} />
                    </div>

                    <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                        {step === 1 && (
                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                    <button type="button" className={`cr-type-btn ${docType === 'CPF' ? 'active' : ''}`} onClick={() => setDocType('CPF')}><User size={16}/> Pessoa Física (CPF)</button>
                                    <button type="button" className={`cr-type-btn ${docType === 'CNPJ' ? 'active' : ''}`} onClick={() => setDocType('CNPJ')}><Building2 size={16}/> Empresa (CNPJ)</button>
                                </div>

                                <div className="cr-input-group">
                                    <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder={docType === 'CNPJ' ? "Razão Social" : "Nome Completo"} className="cr-input" />
                                    <User size={18} className="cr-icon" />
                                </div>

                                {docType === 'CNPJ' && (
                                    <>
                                        <div className="cr-input-group">
                                            <input type="text" name="fantasy_name" value={formData.fantasy_name} onChange={handleChange} placeholder="Nome Fantasia (Opcional)" className="cr-input" />
                                            <Briefcase size={18} className="cr-icon" />
                                        </div>
                                        <div className="cr-input-group">
                                            <input required type="text" name="responsible_name" value={formData.responsible_name} onChange={handleChange} placeholder="Nome do Responsável" className="cr-input" />
                                            <User size={18} className="cr-icon" />
                                        </div>
                                    </>
                                )}

                                <div className="cr-input-group">
                                    <input required type="text" name="document_number" value={formData.document_number} onChange={handleChange} placeholder={docType === 'CNPJ' ? "CNPJ" : "CPF"} className="cr-input" />
                                    <Building2 size={18} className="cr-icon" />
                                </div>

                                <div className="cr-input-group">
                                    <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail principal" className="cr-input" />
                                    <Mail size={18} className="cr-icon" />
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="cr-input-group" style={{ flex: 1 }}>
                                        <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Senha" className="cr-input" />
                                        <Lock size={18} className="cr-icon" />
                                    </div>
                                    <div className="cr-input-group" style={{ flex: 1 }}>
                                        <input required type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Confirmar Senha" className="cr-input" />
                                        <Lock size={18} className="cr-icon" />
                                    </div>
                                </div>

                                <button type="submit" className="cr-btn" style={{ marginTop: '10px' }}>
                                    CONTINUAR <ChevronRight size={18} />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                <div className="cr-input-group">
                                    <input required type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Telefone" className="cr-input" />
                                    <Phone size={18} className="cr-icon" />
                                </div>

                                <div className="cr-input-group">
                                    <input required type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="WhatsApp" className="cr-input" />
                                    <MessageCircle size={18} className="cr-icon" />
                                </div>

                                <div className="cr-input-group">
                                    <input required type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Endereço Completo" className="cr-input" />
                                    <MapPin size={18} className="cr-icon" />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                    <button type="button" onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '16px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                        VOLTAR
                                    </button>
                                    <button type="submit" className="cr-btn" disabled={isLoading} style={{ flex: 1 }}>
                                        {isLoading ? 'CADASTRANDO...' : 'CRIAR CONTA'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClientRegistration;
