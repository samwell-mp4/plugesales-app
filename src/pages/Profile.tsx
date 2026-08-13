import React, { useState, useEffect } from 'react';
import { 
    User, 
    Mail, 
    Lock, 
    Smartphone, 
    Save, 
    CheckCircle2, 
    AlertCircle,
    UserCircle,
    Phone,
    Bell,
    CreditCard,
    FileText,
    Check,
    Landmark,
    DollarSign,
    Calendar,
    UploadCloud,
    ChevronRight,
    Download,
    Filter,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    X,
    Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { pushNotificationService } from '../services/pushNotificationService';
import * as XLSX from 'xlsx';

const Profile = () => {
    const { user, setUser } = useAuth();
    
    // Main navigation tabs: 'dados' | 'financeiro'
    const [activeTab, setActiveTab] = useState<'dados' | 'financeiro'>('dados');
    
    // Sub-tab for finance (only for ADMIN / CONTABILIDADE): 'colaborador' | 'contabilidade'
    const [financeSubTab, setFinanceSubTab] = useState<'colaborador' | 'contabilidade'>('colaborador');

    // General profile form states
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        notification_number: user?.notification_number || '',
        infobip_key: user?.infobip_key || '',
        infobip_sender: user?.infobip_sender || '',
        infobip_url: user?.infobip_url || '',
        password: '',
        confirmPassword: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [pushSubscribed, setPushSubscribed] = useState(false);
    const [pushChecking, setPushChecking] = useState(true);

    // --- COLLABORATOR FINANCE STATES ---
    const [competenceSummary, setCompetenceSummary] = useState<any>({
        monthly_receivable: 0,
        pix_key: '',
        total_advanced: 0,
        remaining_balance: 0,
        has_pending: false,
        nf_url: null,
        nf_uploaded_at: null
    });
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [loadingFinance, setLoadingFinance] = useState(false);
    const [uploadingNf, setUploadingNf] = useState(false);

    // Modal: Request Advance
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [advanceStep, setAdvanceStep] = useState(1);
    const [advanceValue, setAdvanceValue] = useState('');
    const [advancePix, setAdvancePix] = useState('');
    const [submittingAdvance, setSubmittingAdvance] = useState(false);
    const [advanceError, setAdvanceError] = useState('');

    // --- ACCOUNTING / ADMIN STATES ---
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [spreadsheetData, setSpreadsheetData] = useState<any[]>([]);
    const [selectedCompetence, setSelectedCompetence] = useState('');
    const [justificationModal, setJustificationModal] = useState<{ show: boolean, requestId: number | null }>({ show: false, requestId: null });
    const [justificationText, setJustificationText] = useState('');
    const [processingAction, setProcessingAction] = useState(false);
    
    // Quick inline edit receivable for Admin/Contabilidade
    const [editingReceivableId, setEditingReceivableId] = useState<number | null>(null);
    const [tempReceivableValue, setTempReceivableValue] = useState('');
    const [tempPixKey, setTempPixKey] = useState('');

    // Filters for requests
    const [requestSearch, setRequestSearch] = useState('');
    const [requestStatusFilter, setRequestStatusFilter] = useState('Pendente');
    const [requestCompetenceFilter, setRequestCompetenceFilter] = useState('Todas');
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    // Generate Competence string e.g. "Agosto/2026"
    const getCurrentCompetence = () => {
        const date = new Date();
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${months[date.getMonth()]}/${date.getFullYear()}`;
    };

    const currentCompetence = getCurrentCompetence();

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                notification_number: user.notification_number || '',
                infobip_key: user.infobip_key || '',
                infobip_sender: user.infobip_sender || '',
                infobip_url: user.infobip_url || '',
                password: '',
                confirmPassword: ''
            });

            // Check current push status
            pushNotificationService.getStatus(user.id as number).then(status => {
                setPushSubscribed(status);
                setPushChecking(false);
            });

            // Set default competence for admin spreadsheet
            setSelectedCompetence(currentCompetence);
        }
    }, [user]);

    // Fetch collaborator's own financial details
    const fetchMyFinanceDetails = async () => {
        if (!user?.id) return;
        setLoadingFinance(true);
        try {
            const [summary, requests] = await Promise.all([
                dbService.getMyCompetence(user.id as number, currentCompetence),
                dbService.getMyRequests(user.id as number)
            ]);

            if (summary && !summary.error) {
                setCompetenceSummary(summary);
                setAdvancePix(summary.pix_key || '');
            }
            if (Array.isArray(requests)) {
                setMyRequests(requests);
            }
        } catch (err) {
            console.error("Error loading finance details:", err);
        } finally {
            setLoadingFinance(false);
        }
    };

    // Fetch accountant details (Pending Requests + General Spreadsheet)
    const fetchAccountingDetails = async () => {
        if (user?.role !== 'ADMIN' && user?.role !== 'CONTABILIDADE') return;
        try {
            const [pending, spreadsheet] = await Promise.all([
                dbService.getPendingRequests(),
                dbService.getCompetencesSpreadsheet(selectedCompetence)
            ]);
            if (Array.isArray(pending)) setPendingRequests(pending);
            if (Array.isArray(spreadsheet)) setSpreadsheetData(spreadsheet);
        } catch (err) {
            console.error("Error loading accounting dashboard:", err);
        }
    };

    useEffect(() => {
        if (activeTab === 'financeiro') {
            fetchMyFinanceDetails();
            if (user?.role === 'ADMIN' || user?.role === 'CONTABILIDADE') {
                fetchAccountingDetails();
            }
        }
    }, [activeTab, selectedCompetence]);

    const handleTogglePush = async () => {
        if (!user || pushChecking) return;
        setPushChecking(true);
        
        if (pushSubscribed) {
            const res = await pushNotificationService.unsubscribeUser(user.id as number);
            if (!res?.error) setPushSubscribed(false);
        } else {
            const res = await pushNotificationService.subscribeUser(user.id as number);
            if (!res?.error) setPushSubscribed(true);
        }
        setPushChecking(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (profileData.password && profileData.password !== profileData.confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        const cleanedNotify = profileData.notification_number.replace(/\D/g, '');
        if (cleanedNotify && cleanedNotify.length < 10 && cleanedNotify.length > 0) {
            setMessage({ type: 'error', text: 'Número de notificação inválido (mínimo 10 dígitos).' });
            return;
        }

        if (!user || !user.id) {
            setMessage({ 
                type: 'error', 
                text: 'Sua sessão está incompleta. Por favor, faça login novamente.' 
            });
            return;
        }

        const isClient = user.role === 'CLIENT';
        setIsSaving(true);
        try {
            const result = await dbService.updateProfile({
                id: user.id as number,
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                notification_number: cleanedNotify,
                infobip_key: isClient ? undefined : profileData.infobip_key,
                infobip_sender: isClient ? undefined : profileData.infobip_sender,
                infobip_url: isClient ? undefined : profileData.infobip_url,
                password: profileData.password || undefined
            });

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
                setUser(result);
                setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Erro ao salvar perfil.' });
        } finally {
            setIsSaving(false);
        }
    };

    // --- UPLOAD NOTA FISCAL ---
    const handleNfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'pdf' && ext !== 'xml') {
            alert('Apenas arquivos PDF e XML são aceitos para a Nota Fiscal.');
            return;
        }

        setUploadingNf(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });

            if (!uploadRes.ok) throw new Error('Falha no envio do arquivo.');
            const data = await uploadRes.json();

            // Save to DB
            const saveRes = await dbService.uploadNf({
                userId: user.id as number,
                competence: currentCompetence,
                nfUrl: data.url
            });

            if (saveRes.error) {
                alert(saveRes.error);
            } else {
                alert('Nota Fiscal enviada com sucesso!');
                fetchMyFinanceDetails();
            }
        } catch (err: any) {
            alert('Erro no envio da nota fiscal: ' + err.message);
        } finally {
            setUploadingNf(false);
        }
    };

    // --- REQUEST ADVANCE FLOW ---
    const handleStartAdvance = () => {
        if (competenceSummary.has_pending) {
            alert('Você já possui uma solicitação de adiantamento pendente de aprovação.');
            return;
        }
        if (competenceSummary.remaining_balance <= 0) {
            alert('Você não possui saldo restante para adiantar nesta competência.');
            return;
        }
        setAdvanceValue('');
        setAdvanceError('');
        setAdvanceStep(1);
        setShowAdvanceModal(true);
    };

    const handleConfirmAdvanceStep1 = () => {
        setAdvanceError('');
        const val = parseFloat(advanceValue);
        if (isNaN(val) || val <= 0) {
            setAdvanceError('Por favor, informe um valor válido maior que zero.');
            return;
        }
        if (val > competenceSummary.remaining_balance) {
            setAdvanceError(`O valor excede seu saldo disponível de R$ ${competenceSummary.remaining_balance.toFixed(2)}.`);
            return;
        }
        setAdvanceStep(2);
    };

    const handleConfirmAdvanceStep2 = () => {
        setAdvanceError('');
        if (!advancePix.trim()) {
            setAdvanceError('A chave PIX é obrigatória.');
            return;
        }
        setAdvanceStep(3);
    };

    const handleFinalizeAdvance = async () => {
        if (!user?.id) return;
        setSubmittingAdvance(true);
        setAdvanceError('');
        try {
            const res = await dbService.requestAdvance({
                userId: user.id as number,
                competence: currentCompetence,
                value: parseFloat(advanceValue),
                pix_key: advancePix
            });

            if (res.error) {
                setAdvanceError(res.error);
            } else {
                setShowAdvanceModal(false);
                alert('Solicitação de adiantamento enviada com sucesso para a Contabilidade!');
                fetchMyFinanceDetails();
            }
        } catch (err: any) {
            setAdvanceError(err.message);
        } finally {
            setSubmittingAdvance(false);
        }
    };

    // --- ACCOUNTING / ADMIN ACTIONS ---
    const handleRespondRequest = async (requestId: number, status: 'Aprovado' | 'Rejeitado', justification?: string) => {
        setProcessingAction(true);
        try {
            const res = await dbService.respondRequest({
                requestId,
                status,
                justification
            });
            if (res.error) {
                alert(res.error);
            } else {
                alert(`Solicitação de adiantamento ${status.toLowerCase()} com sucesso.`);
                setSelectedRequest(null);
                fetchAccountingDetails();
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessingAction(false);
        }
    };

    const openRejectModal = (requestId: number) => {
        setJustificationText('');
        setJustificationModal({ show: true, requestId });
    };

    const submitRejection = () => {
        if (!justificationText.trim()) {
            alert('A justificativa do cancelamento é obrigatória.');
            return;
        }
        if (justificationModal.requestId) {
            handleRespondRequest(justificationModal.requestId, 'Rejeitado', justificationText);
            setJustificationModal({ show: false, requestId: null });
        }
    };

    const handleSaveReceivableInline = async (collabId: number) => {
        const val = parseFloat(tempReceivableValue);
        if (isNaN(val)) return alert('Valor inválido.');
        try {
            const res = await dbService.updateProfileReceivable({
                userId: collabId,
                monthlyReceivable: val,
                pixKey: tempPixKey || undefined
            });
            if (res.error) {
                alert(res.error);
            } else {
                setEditingReceivableId(null);
                fetchAccountingDetails();
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    const startEditingReceivable = (collab: any) => {
        setEditingReceivableId(collab.id);
        setTempReceivableValue(collab.monthly_receivable.toString());
        setTempPixKey(collab.pix_key || '');
    };

    // Excel export of consolidates
    const exportToExcel = () => {
        if (spreadsheetData.length === 0) return alert('Sem dados para exportar.');
        const formatted = spreadsheetData.map(item => ({
            'Colaborador': item.name,
            'Competência': selectedCompetence,
            'Valor a Receber': item.monthly_receivable,
            'Adiantamentos': item.total_advanced,
            'Valor Líquido': item.net_receivable,
            'Chave PIX': item.pix_key,
            'Status Nota Fiscal': item.nf_url ? 'Enviada' : 'Pendente'
        }));
        const worksheet = XLSX.utils.json_to_sheet(formatted);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Geral');
        XLSX.writeFile(workbook, `Planilha_Financeira_${selectedCompetence.replace('/', '_')}.xlsx`);
    };

    // Deadline check
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = lastDayOfMonth - now.getDate();
    const isDeadlineWarning = !competenceSummary.nf_url && daysLeft <= 5;

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    return (
        <div className="crm-container">
            {/* Header section */}
            <div className="crm-header-premium" style={{ marginBottom: '32px' }}>
                <div className="crm-title-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <div className="crm-badge-small">
                            <User size={12} /> ACCOUNT & FINANCE
                        </div>
                        <h1 className="crm-main-title">Meu Perfil</h1>
                    </div>

                    {/* Main tab buttons */}
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border-subtle)', padding: '6px', borderRadius: '16px' }}>
                        <button 
                            onClick={() => setActiveTab('dados')} 
                            className={`action-btn ${activeTab === 'dados' ? 'primary-btn' : 'secondary-btn'}`}
                            style={{ padding: '10px 24px', fontSize: '12px', height: 'auto', borderRadius: '12px' }}
                        >
                            <User size={16} /> MEUS DADOS
                        </button>
                        <button 
                            onClick={() => setActiveTab('financeiro')} 
                            className={`action-btn ${activeTab === 'financeiro' ? 'primary-btn' : 'secondary-btn'}`}
                            style={{ padding: '10px 24px', fontSize: '12px', height: 'auto', borderRadius: '12px' }}
                        >
                            <DollarSign size={16} /> FINANCEIRO
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'dados' ? (
                <div className="gestiva-split-layout">
                    {/* Profile Overview Card */}
                    <div className="gestiva-sidebar-panels">
                        <div className="crm-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px' }}>
                            <div style={{ 
                                width: '140px', 
                                height: '140px', 
                                borderRadius: '48px', 
                                background: 'var(--primary-gradient)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                marginBottom: '32px',
                                boxShadow: '0 20px 50px rgba(172, 248, 0, 0.25)',
                                color: 'black'
                            }}>
                                <UserCircle size={80} strokeWidth={1} />
                            </div>
                            
                            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.5px' }}>{user?.name}</h2>
                            
                            <span className="status-badge-premium" style={{ '--bg': 'rgba(172, 248, 0, 0.05)', '--color': '#acf800', '--border': 'rgba(172, 248, 0, 0.2)' } as any}>
                                {user?.role}
                            </span>

                            <div style={{ width: '100%', height: '1px', background: 'var(--surface-border-subtle)', margin: '40px 0' }} />

                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                                    <div style={{ minWidth: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail size={18} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div className="field-label" style={{ fontSize: '9px', marginBottom: '2px' }}>E-mail Primário</div>
                                        <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{user?.email}</div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                                    <div style={{ minWidth: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Bell size={18} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div className="field-label" style={{ fontSize: '9px', marginBottom: '2px' }}>Notificações</div>
                                        <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{user?.notification_number || 'Não configurado'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form Card */}
                    <div className="gestiva-main-content">
                        <div className="crm-card" style={{ padding: '48px' }}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 32px 0', fontSize: '1.5rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.5px' }}>
                                        <User size={24} color="var(--primary-color)" /> Informações Gerais
                                    </h3>
                                    <div className="card-grid-responsive">
                                        <div>
                                            <label className="field-label">Nome Completo</label>
                                            <input 
                                                className="field-input" 
                                                value={profileData.name} 
                                                onChange={e => setProfileData({ ...profileData, name: e.target.value })} 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="field-label">Endereço de E-mail</label>
                                            <input 
                                                type="email" 
                                                className="field-input" 
                                                value={profileData.email} 
                                                onChange={e => setProfileData({ ...profileData, email: e.target.value })} 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="field-label">WhatsApp (DDI+DDD+Num)</label>
                                            <input 
                                                className="field-input" 
                                                value={profileData.phone} 
                                                onChange={e => setProfileData({ ...profileData, phone: e.target.value })} 
                                                placeholder="5511999998888"
                                            />
                                        </div>
                                        <div>
                                            <label className="field-label">Nº para Alertas</label>
                                            <input 
                                                className="field-input" 
                                                value={profileData.notification_number} 
                                                onChange={e => setProfileData({ ...profileData, notification_number: e.target.value })} 
                                                placeholder="5511999998888"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {user?.role !== 'CLIENT' && (
                                    <>
                                        <div style={{ height: '1px', background: 'var(--surface-border-subtle)' }} />

                                        <div>
                                            <h3 style={{ margin: '0 0 32px 0', fontSize: '1.5rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.5px' }}>
                                                <Smartphone size={24} color="var(--primary-color)" /> Gateway Infobip
                                            </h3>
                                            <div className="card-grid-responsive">
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <label className="field-label">Infobip API Key</label>
                                                    <input 
                                                        className="field-input" 
                                                        value={profileData.infobip_key} 
                                                        onChange={e => setProfileData({ ...profileData, infobip_key: e.target.value })} 
                                                        placeholder="App 35a1621fff9a9..."
                                                        style={{ fontFamily: 'monospace' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="field-label">Infobip Base URL</label>
                                                    <input 
                                                        className="field-input" 
                                                        value={profileData.infobip_url} 
                                                        onChange={e => setProfileData({ ...profileData, infobip_url: e.target.value })} 
                                                        placeholder="8k6xv1.api-us.infobip.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="field-label">Remetente (WABA)</label>
                                                    <input 
                                                        className="field-input" 
                                                        value={profileData.infobip_sender} 
                                                        onChange={e => setProfileData({ ...profileData, infobip_sender: e.target.value })} 
                                                        placeholder="5511999998888"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ height: '1px', background: 'var(--surface-border-subtle)' }} />
                                    </>
                                )}

                                {/* PWA PUSH NOTIFICATIONS SECTION */}
                                <div>
                                    <h3 style={{ margin: '0 0 32px 0', fontSize: '1.5rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.5px' }}>
                                        <Bell size={24} color="var(--primary-color)" /> Notificações PWA
                                    </h3>
                                    <div style={{ 
                                        background: 'rgba(255,255,255,0.02)', 
                                        border: '1px solid var(--surface-border-subtle)', 
                                        padding: '32px', 
                                        borderRadius: '24px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '24px'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 800 }}>Push no Celular</h4>
                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                                                Receba avisos nativos em tempo real quando novos leads forem capturados, mesmo com o app fechado.
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            {pushChecking ? (
                                                <div className="status-badge-premium" style={{ '--bg': 'rgba(255,255,255,0.05)', '--color': '#888', '--border': 'rgba(255,255,255,0.1)' } as any}>
                                                    VERIFICANDO...
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={handleTogglePush}
                                                    type="button"
                                                    className={`action-btn ${pushSubscribed ? 'danger-btn' : 'primary-btn'}`}
                                                    style={{ height: '40px', padding: '0 24px', fontSize: '11px', whiteSpace: 'nowrap' }}
                                                >
                                                    {pushSubscribed ? 'DESATIVAR NOTIFICAÇÕES' : 'ATIVAR NESTE DISPOSITIVO'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ height: '1px', background: 'var(--surface-border-subtle)' }} />

                                <div>
                                    <h3 style={{ margin: '0 0 32px 0', fontSize: '1.5rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.5px' }}>
                                        <Lock size={24} color="var(--primary-color)" /> Segurança da Conta
                                    </h3>
                                    <div className="card-grid-responsive">
                                        <div>
                                            <label className="field-label">Nova Senha</label>
                                            <input 
                                                type="password" 
                                                className="field-input" 
                                                value={profileData.password} 
                                                onChange={e => setProfileData({ ...profileData, password: e.target.value })} 
                                                placeholder="Deixe vazio para manter" 
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        <div>
                                            <label className="field-label">Confirmar Senha</label>
                                            <input 
                                                type="password" 
                                                className="field-input" 
                                                value={profileData.confirmPassword} 
                                                onChange={e => setProfileData({ ...profileData, confirmPassword: e.target.value })} 
                                                placeholder="Confirmar nova senha" 
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {message.text && (
                                    <div className="animate-slide-in" style={{ 
                                        padding: '20px', 
                                        borderRadius: '20px', 
                                        background: message.type === 'error' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(172, 248, 0, 0.05)',
                                        border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(172, 248, 0, 0.2)'}`,
                                        color: message.type === 'error' ? '#ef4444' : 'var(--primary-color)',
                                        fontSize: '14px', 
                                        fontWeight: 800, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px' 
                                    }}>
                                        {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                                        {message.text}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    className="action-btn primary-btn" 
                                    disabled={isSaving} 
                                    style={{ height: '64px', fontSize: '14px', letterSpacing: '1px' }}
                                >
                                    <Save size={20} /> {isSaving ? 'PROCESSANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                /* TAB: FINANCEIRO */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Admin / Contabilidade Toggle to switch view */}
                    {(user?.role === 'ADMIN' || user?.role === 'CONTABILIDADE') && (
                        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--surface-border-subtle)', paddingBottom: '16px' }}>
                            <button 
                                onClick={() => setFinanceSubTab('colaborador')}
                                className="tab-btn"
                                style={{ 
                                    borderBottom: financeSubTab === 'colaborador' ? '2px solid var(--primary-color)' : 'none',
                                    color: financeSubTab === 'colaborador' ? 'var(--text-primary)' : 'var(--text-muted)',
                                    fontWeight: financeSubTab === 'colaborador' ? 'bold' : 'normal',
                                    padding: '10px 16px',
                                    background: 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                <User size={16} style={{ marginRight: '6px' }} /> Meu Resumo
                            </button>
                            <button 
                                onClick={() => setFinanceSubTab('contabilidade')}
                                className="tab-btn"
                                style={{ 
                                    borderBottom: financeSubTab === 'contabilidade' ? '2px solid var(--primary-color)' : 'none',
                                    color: financeSubTab === 'contabilidade' ? 'var(--text-primary)' : 'var(--text-muted)',
                                    fontWeight: financeSubTab === 'contabilidade' ? 'bold' : 'normal',
                                    padding: '10px 16px',
                                    background: 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                <Landmark size={16} style={{ marginRight: '6px' }} /> Controle Contabilidade
                            </button>
                        </div>
                    )}

                    {/* NF Deadline warning alert banner */}
                    {isDeadlineWarning && financeSubTab === 'colaborador' && (
                        <div style={{ 
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '20px 24px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            color: '#ef4444'
                        }}>
                            <AlertTriangle size={24} />
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontWeight: 900 }}>Prazo de Nota Fiscal se esgotando!</h4>
                                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                                    Atenção: restam apenas <strong>{daysLeft} dias</strong> para anexar sua nota fiscal de prestação de serviços para a competência de {currentCompetence}.
                                </p>
                            </div>
                        </div>
                    )}

                    {financeSubTab === 'colaborador' ? (
                        /* --- COLABORATOR VIEW --- */
                        <div className="gestiva-split-layout">
                            <div className="gestiva-sidebar-panels" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                
                                {/* NF Upload Card */}
                                <div className="crm-card" style={{ padding: '32px' }}>
                                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FileText size={20} color="var(--primary-color)" /> Nota Fiscal
                                    </h3>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                        Faça o upload do documento fiscal correspondente aos serviços prestados nesta competência (Aceitos apenas PDF ou XML).
                                    </p>

                                    {competenceSummary.nf_url ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ 
                                                background: 'rgba(74, 222, 128, 0.05)',
                                                border: '1px solid rgba(74, 222, 128, 0.2)',
                                                color: '#4ade80',
                                                padding: '16px',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                fontSize: '13px',
                                                fontWeight: 'bold'
                                            }}>
                                                <Check size={18} /> Nota Fiscal Enviada
                                            </div>
                                            {competenceSummary.nf_uploaded_at && (
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                    Enviado em: {new Date(competenceSummary.nf_uploaded_at).toLocaleString('pt-BR')}
                                                </span>
                                            )}
                                            <a 
                                                href={competenceSummary.nf_url} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="action-btn secondary-btn"
                                                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                                            >
                                                <Download size={16} /> Visualizar Nota Fiscal
                                            </a>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <label 
                                                htmlFor="nf-file-input" 
                                                style={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    border: '2px dashed var(--surface-border-subtle)',
                                                    borderRadius: '20px',
                                                    padding: '40px 20px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    textAlign: 'center',
                                                    background: 'rgba(255,255,255,0.01)'
                                                }}
                                                className="hover-card"
                                            >
                                                <UploadCloud size={32} color="var(--primary-color)" style={{ marginBottom: '12px' }} />
                                                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                                    {uploadingNf ? 'Enviando...' : 'Selecionar Arquivo'}
                                                </span>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    PDF ou XML (Max. 10MB)
                                                </span>
                                            </label>
                                            <input 
                                                type="file" 
                                                id="nf-file-input" 
                                                accept=".pdf,.xml" 
                                                onChange={handleNfUpload}
                                                style={{ display: 'none' }}
                                                disabled={uploadingNf}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="gestiva-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                
                                {/* Resumo da Competência Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                                    <div className="crm-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                                            COMPETÊNCIA ATUAL
                                        </span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                                            {currentCompetence}
                                        </span>
                                    </div>
                                    <div className="crm-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                                            TOTAL A RECEBER
                                        </span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                                            {formatCurrency(competenceSummary.monthly_receivable)}
                                        </span>
                                    </div>
                                    <div className="crm-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                                            ADIANTADO
                                        </span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>
                                            {formatCurrency(competenceSummary.total_advanced)}
                                        </span>
                                    </div>
                                    <div className="crm-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                                            SALDO LÍQUIDO RESTANTE
                                        </span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6' }}>
                                            {formatCurrency(competenceSummary.remaining_balance)}
                                        </span>
                                    </div>
                                </div>

                                {/* Main Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <button 
                                        onClick={handleStartAdvance} 
                                        className="action-btn primary-btn"
                                        style={{ padding: '16px 36px', fontSize: '14px', borderRadius: '16px', gap: '10px' }}
                                    >
                                        <DollarSign size={18} /> SOLICITAR ADIANTAMENTO
                                    </button>
                                </div>

                                {/* History list */}
                                <div className="crm-card" style={{ padding: '32px' }}>
                                    <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 900 }}>
                                        Histórico de Solicitações
                                    </h3>
                                    
                                    {loadingFinance ? (
                                        <div style={{ textAlign: 'center', padding: '30px' }}>Carregando dados...</div>
                                    ) : myRequests.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                            Nenhum adiantamento solicitado até o momento.
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>DATA</th>
                                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>COMPETÊNCIA</th>
                                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>VALOR</th>
                                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>CHAVE PIX</th>
                                                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>STATUS</th>
                                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>RETORNO FINANCEIRO</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {myRequests.map(req => (
                                                        <tr key={req.id} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                                            <td style={{ padding: '16px', fontSize: '13px' }}>
                                                                {new Date(req.created_at).toLocaleDateString('pt-BR')}
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '13px', fontWeight: 'bold' }}>
                                                                {req.competence}
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>
                                                                {formatCurrency(parseFloat(req.value))}
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                                {req.pix_key}
                                                            </td>
                                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                                <span className="status-badge-premium" style={{
                                                                    '--bg': req.status === 'Aprovado' ? 'rgba(74, 222, 128, 0.05)' : req.status === 'Rejeitado' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                                                    '--color': req.status === 'Aprovado' ? '#4ade80' : req.status === 'Rejeitado' ? '#ef4444' : '#f59e0b',
                                                                    '--border': req.status === 'Aprovado' ? 'rgba(74, 222, 128, 0.2)' : req.status === 'Rejeitado' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                                                                } as any}>
                                                                    {req.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {req.status === 'Rejeitado' ? (req.justification || 'Sem justificativa') : (req.responded_at ? 'Finalizado/Pago' : 'Aguardando contabilidade')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- ACCOUNTING / CONTABILIDADE VIEW --- */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            {/* REQUESTS LIST WITH SMART COLUMNS FILTERS */}
                            <div className="crm-card" style={{ padding: '32px' }}>
                                <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Clock size={20} color="var(--primary-color)" /> Painel de Solicitações
                                </h2>

                                {/* Columns filters */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <label className="field-label" style={{ fontSize: '10px', marginBottom: '6px' }}>BUSCAR COLABORADOR</label>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                            <input 
                                                type="text" 
                                                className="field-input" 
                                                placeholder="Nome do colaborador..." 
                                                value={requestSearch} 
                                                onChange={e => setRequestSearch(e.target.value)}
                                                style={{ paddingLeft: '36px', height: '38px', fontSize: '12px' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="field-label" style={{ fontSize: '10px', marginBottom: '6px' }}>FILTRAR STATUS</label>
                                        <select 
                                            value={requestStatusFilter} 
                                            onChange={e => setRequestStatusFilter(e.target.value)}
                                            className="field-input"
                                            style={{ height: '38px', fontSize: '12px', padding: '0 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}
                                        >
                                            <option value="Todas">Todos os Status</option>
                                            <option value="Pendente">Pendentes</option>
                                            <option value="Aprovado">Aprovados</option>
                                            <option value="Rejeitado">Rejeitados</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="field-label" style={{ fontSize: '10px', marginBottom: '6px' }}>FILTRAR COMPETÊNCIA</label>
                                        <select 
                                            value={requestCompetenceFilter} 
                                            onChange={e => setRequestCompetenceFilter(e.target.value)}
                                            className="field-input"
                                            style={{ height: '38px', fontSize: '12px', padding: '0 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}
                                        >
                                            <option value="Todas">Todas as Competências</option>
                                            {Array.from(new Set(pendingRequests.map(r => r.competence))).map(comp => (
                                                <option key={comp} value={comp}>{comp}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {pendingRequests.filter(req => {
                                    const matchesSearch = req.collaborator_name.toLowerCase().includes(requestSearch.toLowerCase());
                                    const matchesStatus = requestStatusFilter === 'Todas' ? true : req.status === requestStatusFilter;
                                    const matchesCompetence = requestCompetenceFilter === 'Todas' ? true : req.competence === requestCompetenceFilter;
                                    return matchesSearch && matchesStatus && matchesCompetence;
                                }).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                        Nenhuma solicitação encontrada para os filtros selecionados.
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="crm-table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>COLABORADOR</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>COMPETÊNCIA</th>
                                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>VALOR SOLICITADO</th>
                                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>SALDO RESTANTE</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>CHAVE PIX</th>
                                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>STATUS</th>
                                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>AÇÃO</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingRequests
                                                    .filter(req => {
                                                        const matchesSearch = req.collaborator_name.toLowerCase().includes(requestSearch.toLowerCase());
                                                        const matchesStatus = requestStatusFilter === 'Todas' ? true : req.status === requestStatusFilter;
                                                        const matchesCompetence = requestCompetenceFilter === 'Todas' ? true : req.competence === requestCompetenceFilter;
                                                        return matchesSearch && matchesStatus && matchesCompetence;
                                                    })
                                                    .map(req => (
                                                        <tr 
                                                            key={req.id} 
                                                            onClick={() => setSelectedRequest(req)} 
                                                            style={{ borderBottom: '1px solid var(--surface-border-subtle)', cursor: 'pointer' }}
                                                            className="hover-card"
                                                        >
                                                            <td style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold' }}>{req.collaborator_name}</td>
                                                            <td style={{ padding: '12px', fontSize: '13px' }}>{req.competence}</td>
                                                            <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatCurrency(req.value)}</td>
                                                            <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', color: '#3b82f6' }}>{formatCurrency(req.remaining_balance)}</td>
                                                            <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>{req.pix_key}</td>
                                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                                <span className="status-badge-premium" style={{
                                                                    '--bg': req.status === 'Aprovado' ? 'rgba(74, 222, 128, 0.05)' : req.status === 'Rejeitado' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                                                    '--color': req.status === 'Aprovado' ? '#4ade80' : req.status === 'Rejeitado' ? '#ef4444' : '#f59e0b',
                                                                    '--border': req.status === 'Aprovado' ? 'rgba(74, 222, 128, 0.2)' : req.status === 'Rejeitado' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                                                                } as any}>
                                                                    {req.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                                <button 
                                                                    className="action-btn secondary-btn"
                                                                    style={{ padding: '6px 12px', fontSize: '11px', height: 'auto' }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedRequest(req);
                                                                    }}
                                                                >
                                                                    AVALIAR
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* GENERAL SPREADSHEET (PLANILHA GERAL) */}
                            <div className="crm-card" style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FileSpreadsheet size={20} color="var(--primary-color)" /> Planilha Financeira Geral
                                    </h2>
                                    
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        {/* Competence Selector */}
                                        <select 
                                            value={selectedCompetence} 
                                            onChange={e => setSelectedCompetence(e.target.value)} 
                                            className="field-input"
                                            style={{ width: '160px', padding: '8px 12px', height: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}
                                        >
                                            <option value={getCurrentCompetence()}>{getCurrentCompetence()}</option>
                                            <option value="Julho/2026">Julho/2026</option>
                                            <option value="Junho/2026">Junho/2026</option>
                                            <option value="Maio/2026">Maio/2026</option>
                                            <option value="Abril/2026">Abril/2026</option>
                                        </select>

                                        <button 
                                            onClick={exportToExcel} 
                                            className="action-btn secondary-btn"
                                            style={{ padding: '8px 16px', fontSize: '12px', height: 'auto' }}
                                        >
                                            <Download size={14} style={{ marginRight: '6px' }} /> EXPORTAR EXCEL
                                        </button>
                                    </div>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="crm-table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>COLABORADOR</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>VALOR A RECEBER (DEVIDO)</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>ADIANTAMENTOS</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>VALOR LÍQUIDO</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>N.F. ENVIADA</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>CHAVE PIX</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>AÇÃO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {spreadsheetData.map(item => {
                                                const isEditing = editingReceivableId === item.id;
                                                return (
                                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold' }}>{item.name}</td>
                                                        <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>
                                                            {isEditing ? (
                                                                <input 
                                                                    type="number" 
                                                                    step="0.01" 
                                                                    className="field-input" 
                                                                    value={tempReceivableValue} 
                                                                    onChange={e => setTempReceivableValue(e.target.value)}
                                                                    style={{ width: '100px', textAlign: 'right', padding: '4px 8px', fontSize: '12px', height: 'auto' }}
                                                                />
                                                            ) : (
                                                                formatCurrency(item.monthly_receivable)
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', color: '#f59e0b' }}>{formatCurrency(item.total_advanced)}</td>
                                                        <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', color: '#3b82f6', fontWeight: 'bold' }}>{formatCurrency(item.net_receivable)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            {item.nf_url ? (
                                                                <a 
                                                                    href={item.nf_url} 
                                                                    target="_blank" 
                                                                    rel="noreferrer" 
                                                                    style={{ 
                                                                        fontSize: '11px', 
                                                                        background: 'rgba(74, 222, 128, 0.1)', 
                                                                        color: '#4ade80', 
                                                                        border: '1px solid rgba(74, 222, 128, 0.2)',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '8px',
                                                                        textDecoration: 'none',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                >
                                                                    VER NF
                                                                </a>
                                                            ) : (
                                                                <span style={{ fontSize: '11px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold' }}>PENDENTE</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                            {isEditing ? (
                                                                <input 
                                                                    type="text" 
                                                                    className="field-input" 
                                                                    value={tempPixKey} 
                                                                    onChange={e => setTempPixKey(e.target.value)}
                                                                    style={{ width: '140px', padding: '4px 8px', fontSize: '12px', height: 'auto' }}
                                                                />
                                                            ) : (
                                                                item.pix_key || 'Não cadastrado'
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            {isEditing ? (
                                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                                    <button 
                                                                        onClick={() => handleSaveReceivableInline(item.id)}
                                                                        className="action-btn primary-btn"
                                                                        style={{ padding: '4px 8px', fontSize: '10px', height: 'auto' }}
                                                                    >
                                                                        GRAVAR
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setEditingReceivableId(null)}
                                                                        className="action-btn secondary-btn"
                                                                        style={{ padding: '4px 8px', fontSize: '10px', height: 'auto' }}
                                                                    >
                                                                        SAIR
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => startEditingReceivable(item)}
                                                                    className="action-btn secondary-btn"
                                                                    style={{ padding: '4px 8px', fontSize: '10px', height: 'auto' }}
                                                                >
                                                                    EDITAR
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- MODAL: SOLICITAR ADIANTAMENTO (3 STEPS) --- */}
            {showAdvanceModal && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.8)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 9999,
                    backdropFilter: 'blur(10px)'
                }}>
                    <div className="crm-card animate-slide-in" style={{ padding: '40px', maxWidth: '480px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Solicitar Adiantamento</h3>
                            <button onClick={() => setShowAdvanceModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Progress Stepper indicator */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, height: '2px', background: 'var(--surface-border-subtle)', zIndex: 1 }} />
                            <div style={{ position: 'absolute', top: '10px', left: 0, width: `${(advanceStep - 1) * 50}%`, height: '2px', background: 'var(--primary-color)', zIndex: 2, transition: 'all 0.3s' }} />
                            
                            <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: advanceStep >= 1 ? 'var(--primary-color)' : 'var(--surface-border-subtle)', color: advanceStep >= 1 ? 'black' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>1</div>
                                <span style={{ fontSize: '9px', color: advanceStep >= 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>VALOR</span>
                            </div>
                            <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: advanceStep >= 2 ? 'var(--primary-color)' : 'var(--surface-border-subtle)', color: advanceStep >= 2 ? 'black' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>2</div>
                                <span style={{ fontSize: '9px', color: advanceStep >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>PIX</span>
                            </div>
                            <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: advanceStep >= 3 ? 'var(--primary-color)' : 'var(--surface-border-subtle)', color: advanceStep >= 3 ? 'black' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>3</div>
                                <span style={{ fontSize: '9px', color: advanceStep >= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>CONFIRMAR</span>
                            </div>
                        </div>

                        {/* STEP 1: INFORM VALUE */}
                        {advanceStep === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label className="field-label">VALOR DESEJADO (R$)</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className="field-input" 
                                        value={advanceValue} 
                                        onChange={e => setAdvanceValue(e.target.value)} 
                                        placeholder="0.00" 
                                        autoFocus
                                    />
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                                        Saldo disponível para adiantar: {formatCurrency(competenceSummary.remaining_balance)}
                                    </span>
                                </div>
                                {advanceError && <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>{advanceError}</div>}
                                <button onClick={handleConfirmAdvanceStep1} className="action-btn primary-btn" style={{ height: '48px', justifyContent: 'center' }}>
                                    AVANÇAR <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* STEP 2: CONFIRM PIX */}
                        {advanceStep === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label className="field-label">CONFIRMAR CHAVE PIX DE RECEBIMENTO</label>
                                    <input 
                                        type="text" 
                                        className="field-input" 
                                        value={advancePix} 
                                        onChange={e => setAdvancePix(e.target.value)} 
                                        placeholder="Ex: CPF, E-mail, Celular ou Chave Aleatória"
                                        autoFocus
                                    />
                                </div>
                                {advanceError && <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>{advanceError}</div>}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setAdvanceStep(1)} className="action-btn secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>
                                        VOLTAR
                                    </button>
                                    <button onClick={handleConfirmAdvanceStep2} className="action-btn primary-btn" style={{ flex: 1, justifyContent: 'center' }}>
                                        AVANÇAR
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: CONFIRM & SUBMIT */}
                        {advanceStep === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--surface-border-subtle)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Valor Solicitado</span>
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatCurrency(parseFloat(advanceValue))}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chave PIX de Destino</span>
                                        <span style={{ fontWeight: 'bold' }}>{advancePix}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Competência</span>
                                        <span style={{ fontWeight: 'bold' }}>{currentCompetence}</span>
                                    </div>
                                </div>

                                {advanceError && <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>{advanceError}</div>}
                                
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setAdvanceStep(2)} className="action-btn secondary-btn" style={{ flex: 1, justifyContent: 'center' }} disabled={submittingAdvance}>
                                        VOLTAR
                                    </button>
                                    <button onClick={handleFinalizeAdvance} className="action-btn primary-btn" style={{ flex: 1, justifyContent: 'center' }} disabled={submittingAdvance}>
                                        {submittingAdvance ? 'ENVIANDO...' : 'SOLICITAR'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL: REJECT JUSTIFICATION --- */}
            {justificationModal.show && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.8)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 9999,
                    backdropFilter: 'blur(10px)'
                }}>
                    <div className="crm-card animate-slide-in" style={{ padding: '32px', maxWidth: '400px', width: '90%' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 900 }}>Motivo da Rejeição</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Por favor, informe a justificativa do cancelamento. O colaborador poderá visualizar este motivo no perfil dele.
                        </p>
                        
                        <textarea 
                            className="field-input" 
                            style={{ width: '100%', height: '100px', resize: 'none', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}
                            placeholder="Descreva aqui o motivo..."
                            value={justificationText}
                            onChange={e => setJustificationText(e.target.value)}
                        />

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setJustificationModal({ show: false, requestId: null })} 
                                className="action-btn secondary-btn"
                                style={{ padding: '8px 16px', fontSize: '12px' }}
                            >
                                CANCELAR
                            </button>
                            <button 
                                onClick={submitRejection} 
                                className="action-btn danger-btn"
                                style={{ padding: '8px 16px', fontSize: '12px', background: '#ef4444', color: 'white' }}
                            >
                                REJEITAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: COMANDA INDIVIDUAL (REQUEST DETAIL) --- */}
            {selectedRequest && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.8)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 9998,
                    backdropFilter: 'blur(10px)'
                }}>
                    <div className="crm-card animate-slide-in" style={{ padding: '40px', maxWidth: '520px', width: '90%', border: '1px solid var(--surface-border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>COMANDA FINANCEIRA</span>
                                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 950 }}>{selectedRequest.collaborator_name}</h3>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Request Card Stats */}
                        <div style={{ 
                            background: 'rgba(255,255,255,0.01)', 
                            border: '1px solid var(--surface-border-subtle)', 
                            borderRadius: '24px', 
                            padding: '24px', 
                            marginBottom: '28px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px dashed var(--surface-border-subtle)' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>VALOR SOLICITADO</span>
                                <h2 style={{ margin: '8px 0 0 0', fontSize: '2.25rem', fontWeight: 950, color: 'var(--primary-color)' }}>
                                    {formatCurrency(selectedRequest.value)}
                                </h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginBottom: '2px' }}>Competência</span>
                                    <span style={{ fontWeight: 'bold' }}>{selectedRequest.competence}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginBottom: '2px' }}>Chave PIX</span>
                                    <span style={{ fontWeight: 'bold', wordBreak: 'break-all' }}>{selectedRequest.pix_key}</span>
                                </div>
                            </div>

                            <div style={{ height: '1px', background: 'var(--surface-border-subtle)' }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Valor Mensal Fixo (RH)</span>
                                    <span style={{ fontWeight: 'bold' }}>{formatCurrency(selectedRequest.monthly_receivable)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Total Já Adiantado</span>
                                    <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{formatCurrency(selectedRequest.total_advanced)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--surface-border-subtle)', paddingTop: '10px' }}>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Saldo Disponível</span>
                                    <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{formatCurrency(selectedRequest.remaining_balance)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Request status info or action buttons */}
                        {selectedRequest.status === 'Pendente' ? (
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button 
                                    onClick={() => handleRespondRequest(selectedRequest.id, 'Aprovado')}
                                    className="action-btn primary-btn"
                                    style={{ flex: 1, height: '48px', justifyContent: 'center', fontSize: '13px' }}
                                    disabled={processingAction}
                                >
                                    APROVAR ADIANTAMENTO
                                </button>
                                <button 
                                    onClick={() => openRejectModal(selectedRequest.id)}
                                    className="action-btn danger-btn"
                                    style={{ flex: 1, height: '48px', justifyContent: 'center', fontSize: '13px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                    disabled={processingAction}
                                >
                                    REJEITAR
                                </button>
                            </div>
                        ) : (
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '12px',
                                background: selectedRequest.status === 'Aprovado' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                border: `1px solid ${selectedRequest.status === 'Aprovado' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                padding: '20px',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <span style={{ 
                                    fontWeight: 'bold', 
                                    color: selectedRequest.status === 'Aprovado' ? '#4ade80' : '#ef4444',
                                    fontSize: '14px'
                                }}>
                                    SOLICITAÇÃO {selectedRequest.status.toUpperCase()}
                                </span>
                                {selectedRequest.status === 'Rejeitado' && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        <strong>Motivo:</strong> {selectedRequest.justification || 'Não informado'}
                                    </div>
                                )}
                                {selectedRequest.responded_at && (
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Respondido em: {new Date(selectedRequest.responded_at).toLocaleString('pt-BR')}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
