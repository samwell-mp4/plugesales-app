import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Clock, CheckCircle2, ShieldCheck, Edit, Trash2, Key, Search, DollarSign, Plus, Minus, Coins, Zap, User, Link as LinkIcon, RefreshCw, X, Filter, ExternalLink } from 'lucide-react';
import { dbService } from '../services/dbService';

const EmployeeClients = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED'>('APPROVED');
    const [pendingClients, setPendingClients] = useState<any[]>([]);
    const [approvedClients, setApprovedClients] = useState<any[]>([]);
    const [salespeople, setSalespeople] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeller, setFilterSeller] = useState('TODOS');
    const [filterPacote, setFilterPacote] = useState('TODOS');

    const [editingClient, setEditingClient] = useState<any>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editMode, setEditMode] = useState<'COMMERCIAL' | 'BASIC' | 'PASSWORD'>('COMMERCIAL');

    const [editForm, setEditForm] = useState({
        pacote: '', preco_vendido: '', comissao_vendedor: '',
        name: '', email: '', phone: '', document_number: '', whatsapp: '',
        password: '', disparo_quantidade: 0, seller_name: ''
    });

    // Credit quick add/remove modal
    const [isCreditQuickModalOpen, setIsCreditQuickModalOpen] = useState(false);
    const [creditOpType, setCreditOpType] = useState<'ADD' | 'SUBTRACT'>('ADD');
    const [creditOpAmount, setCreditOpAmount] = useState<number>(0);
    const [selectedClientForCredit, setSelectedClientForCredit] = useState<any>(null);

    // Modal to create sale directly
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [selectedClientForSale, setSelectedClientForSale] = useState<any>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Client Dashboard states
    const [selectedClientForDashboard, setSelectedClientForDashboard] = useState<any | null>(null);
    const [dashboardSales, setDashboardSales] = useState<any[]>([]);
    const [dashboardSubmissions, setDashboardSubmissions] = useState<any[]>([]);
    const [loadingDashboard, setLoadingDashboard] = useState(false);

    // Pagination states
    const [clientsPage, setClientsPage] = useState(1);
    const [salesPage, setSalesPage] = useState(1);
    const [subsPage, setSubsPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Reset client page on search/filter changes
    useEffect(() => {
        setClientsPage(1);
    }, [searchTerm, filterSeller, filterPacote, activeTab]);
    const [saleForm, setSaleForm] = useState({
        package_hired: 'Disparos',
        quantity_hired: 1000,
        unit_value: 0.20,
        salesperson_id: '',
        payment_status: 'PENDENTE'
    });

    // Manual client registration state
    const [isManualRegisterOpen, setIsManualRegisterOpen] = useState(false);
    const [manualForm, setManualForm] = useState({
        name: '',
        email: '',
        password: '',
        whatsapp: '',
        document_number: '',
        preco_vendido: '0.20',
        comissao_vendedor: '0.05',
        disparo_quantidade: 1000,
        pacote: 'Avulso',
        seller_name: ''
    });

    // Modal to create card/submission directly
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [selectedClientForCard, setSelectedClientForCard] = useState<any>(null);
    const [cardForm, setCardForm] = useState({
        profile_name: '',
        ddd: '',
        template_type: 'none',
        media_url: '',
        ad_copy: '',
        button_link: '',
        notes: ''
    });

    // Link existing card states
    const [allSubmissionsList, setAllSubmissionsList] = useState<any[]>([]);
    const [subSearchQuery, setSubSearchQuery] = useState('');
    const [linkCardMode, setLinkCardMode] = useState<'EXISTING' | 'CREATE'>('EXISTING');
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');

    // Nova Venda delivery method states
    const [deliveryMethod, setDeliveryMethod] = useState<'MANUAL' | 'CARD' | 'REPORT'>('MANUAL');
    const [selectedCardForDelivery, setSelectedCardForDelivery] = useState<string>('');
    const [reportFile, setReportFile] = useState<File | null>(null);
    const [uploadingReport, setUploadingReport] = useState(false);
    const [tempQuantityDelivered, setTempQuantityDelivered] = useState<number>(0);
    const [saleNotes, setSaleNotes] = useState('');

    // Quick credit upload & notes states
    const [creditReceiptFile, setCreditReceiptFile] = useState<File | null>(null);
    const [uploadingCreditReceipt, setUploadingCreditReceipt] = useState(false);
    const [creditNotes, setCreditNotes] = useState('');

    const loadClients = async () => {
        setIsLoading(true);
        try {
            const sellerFilter = (user?.role === 'ADMIN' || user?.role === 'CONTABILIDADE') ? '' : `seller_name=${encodeURIComponent(user?.name || '')}`;
            const [pendingRes, approvedRes, peopleData] = await Promise.all([
                fetch(`/api/users/pending?${sellerFilter}`),
                fetch(`/api/admin/users?${sellerFilter}`),
                dbService.getFinanceSalespeople()
            ]);
            
            const pendingData = await pendingRes.json();
            const approvedData = await approvedRes.json();
            
            setPendingClients(pendingData.filter((u: any) => u.role === 'CLIENT' || u.role === 'ASSINATURA_BASICA'));
            setApprovedClients(approvedData.filter((u: any) => u.role === 'CLIENT' || u.role === 'ASSINATURA_BASICA'));
            setSalespeople(peopleData);
        } catch (err) {
            console.error("Error loading clients:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.name) {
            loadClients();
        }
    }, [user?.name]);

    const handleGenerateInvite = async () => {
        try {
            const res = await fetch('/api/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ created_by: user?.id })
            });
            if (res.ok) {
                const data = await res.json();
                const inviteUrl = `${window.location.origin}/news-clients/${data.code}`;
                navigator.clipboard.writeText(inviteUrl);
                alert(`Convite gerado e copiado para a área de transferência!\n\nLink: ${inviteUrl}\n\nVálido por 24 horas.`);
            } else {
                alert('Erro ao gerar convite.');
            }
        } catch (err) {
            alert('Erro de conexão ao gerar convite.');
        }
    };

    const handleManualRegister = async () => {
        if (!manualForm.name || !manualForm.email || !manualForm.password) {
            alert("Nome, email e senha são obrigatórios!");
            return;
        }

        setSubmitting(true);
        try {
            // Step 1: Generate invite code
            const inviteRes = await fetch('/api/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ created_by: user?.id })
            });
            if (!inviteRes.ok) throw new Error("Falha ao criar convite de segurança.");
            const inviteData = await inviteRes.json();
            const inviteCode = inviteData.code;

            // Step 2: Register user (role = WAITING_APPROVAL)
            const registerRes = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: manualForm.name,
                    email: manualForm.email,
                    password: manualForm.password,
                    whatsapp: manualForm.whatsapp || null,
                    phone: manualForm.whatsapp || null,
                    document_number: manualForm.document_number || null,
                    invite_code: inviteCode
                })
            });
            if (!registerRes.ok) {
                const errData = await registerRes.json();
                throw new Error(errData.error || "Falha ao registrar cliente.");
            }
            const newUser = await registerRes.json();

            // Step 3: Approve user access with commercial settings
            const approveRes = await fetch(`/api/users/${newUser.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seller_name: manualForm.seller_name || user?.name || '',
                    pacote: manualForm.pacote || 'Avulso',
                    preco_vendido: manualForm.preco_vendido || '0.20',
                    comissao_vendedor: manualForm.comissao_vendedor || '0.05',
                    disparo_quantidade: manualForm.disparo_quantidade || 0
                })
            });

            if (approveRes.ok) {
                alert("Cliente registrado e ativado com sucesso!");
                setIsManualRegisterOpen(false);
                setManualForm({
                    name: '',
                    email: '',
                    password: '',
                    whatsapp: '',
                    document_number: '',
                    preco_vendido: '0.20',
                    comissao_vendedor: '0.05',
                    disparo_quantidade: 1000,
                    pacote: 'Avulso',
                    seller_name: ''
                });
                loadClients();
            } else {
                const errData = await approveRes.json();
                throw new Error(errData.error || "Falha ao aprovar comercialmente.");
            }
        } catch (err: any) {
            alert("Erro: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (client: any) => {
        try {
            const res = await fetch(`/api/users/${client.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    seller_name: client.seller_name || user?.name || '',
                    pacote: client.pacote || 'Avulso',
                    preco_vendido: client.preco_vendido || '0.20',
                    comissao_vendedor: client.comissao_vendedor || '0.05',
                    disparo_quantidade: client.disparo_quantidade || 0
                })
            });
            if (res.ok) {
                alert("Cliente aprovado com sucesso!");
                loadClients();
            } else {
                const err = await res.json();
                alert(`Erro ao aprovar: ${err.error}`);
            }
        } catch (err) { alert("Erro ao aprovar."); }
    };

    const handleReject = async (id: number) => {
        if(!window.confirm("Deseja realmente rejeitar/excluir este cliente?")) return;
        try {
            const res = await fetch(`/api/users/${id}/reject`, { method: 'POST' });
            if (res.ok) {
                alert("Cliente excluído/rejeitado.");
                loadClients();
            }
        } catch (err) { alert("Erro ao rejeitar."); }
    };

    const openEditModal = (client: any, mode: 'COMMERCIAL' | 'BASIC' | 'PASSWORD') => {
        setEditingClient(client);
        setEditMode(mode);
        setEditForm({
            pacote: client.pacote || 'Avulso',
            preco_vendido: client.preco_vendido || '0.20',
            comissao_vendedor: client.comissao_vendedor || '0.05',
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            document_number: client.document_number || client.document_type || '',
            whatsapp: client.whatsapp || '',
            password: '',
            disparo_quantidade: client.disparo_quantidade || 0,
            seller_name: client.seller_name || ''
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            if (editMode === 'COMMERCIAL') {
                const res = await fetch(`/api/users/${editingClient.id}/commercial`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        pacote: editForm.pacote, 
                        preco_vendido: editForm.preco_vendido, 
                        comissao_vendedor: editForm.comissao_vendedor,
                        seller_name: editForm.seller_name,
                        disparo_quantidade: editForm.disparo_quantidade
                    })
                });
                if (res.ok) {
                    alert("Dados comerciais atualizados.");
                    setEditModalOpen(false);
                    loadClients();
                }
            } else if (editMode === 'BASIC') {
                const res = await fetch(`/api/auth/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingClient.id,
                        name: editForm.name,
                        email: editForm.email,
                        phone: editForm.phone,
                        whatsapp: editForm.whatsapp
                    })
                });
                if (res.ok) {
                    alert("Dados básicos atualizados.");
                    setEditModalOpen(false);
                    loadClients();
                }
            } else if (editMode === 'PASSWORD') {
                if (!editForm.password) return alert("Digite uma nova senha.");
                const res = await dbService.adminUpdatePassword(editingClient.id, editForm.password);
                if (!res.error) {
                    alert("Senha alterada com sucesso.");
                    setEditModalOpen(false);
                } else {
                    alert("Erro ao alterar senha.");
                }
            }
        } catch (err) {
            alert("Erro ao salvar dados.");
        }
    };

    const openLinkCardModal = async (client: any) => {
        setSelectedClientForCard(client);
        setLinkCardMode('EXISTING');
        setSubSearchQuery('');
        setSelectedSubmissionId('');
        setIsCardModalOpen(true);
        try {
            const res = await fetch('/api/client-submissions');
            if (res.ok) {
                const data = await res.json();
                setAllSubmissionsList(data || []);
            }
        } catch (err) {
            console.error("Error fetching submissions for link:", err);
        }
    };

    const handleLinkExistingCard = async () => {
        if (!selectedSubmissionId || !selectedClientForCard) return alert("Selecione um card para vincular.");
        setSubmitting(true);
        try {
            const res = await fetch(`/api/client-submissions/${selectedSubmissionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_id: selectedClientForCard.id,
                    assigned_to: selectedClientForCard.seller_name || user?.name || 'Admin'
                })
            });
            if (res.ok) {
                alert("Card vinculado com sucesso!");
                setIsCardModalOpen(false);
                loadClients();
                if (selectedClientForDashboard && selectedClientForDashboard.id === selectedClientForCard.id) {
                    openClientDashboard(selectedClientForDashboard);
                }
            } else {
                alert("Erro ao vincular card.");
            }
        } catch (err) {
            alert("Erro de conexão ao vincular card.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickCreditOp = async () => {
        if (!selectedClientForCredit) return;
        const currentCredits = selectedClientForCredit.disparo_quantidade || 0;
        const opAmount = creditOpAmount || 0;
        if (opAmount <= 0) {
            alert("Por favor, insira uma quantidade maior que zero.");
            return;
        }

        const newCredits = creditOpType === 'ADD' ? currentCredits + opAmount : Math.max(0, currentCredits - opAmount);

        setSubmitting(true);
        try {
            let receiptUrl = '';
            if (creditOpType === 'ADD' && creditReceiptFile) {
                setUploadingCreditReceipt(true);
                try {
                    const formData = new FormData();
                    formData.append('file', creditReceiptFile);
                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        receiptUrl = uploadData.fileUrl;
                    }
                } catch (err) {
                    console.error("Error uploading credit receipt:", err);
                } finally {
                    setUploadingCreditReceipt(false);
                }
            }

            // Save transaction record in finance_sales!
            const saleData = {
                client_name: selectedClientForCredit.name,
                client_cpf_cnpj: selectedClientForCredit.document_number || '',
                client_contact: selectedClientForCredit.whatsapp || selectedClientForCredit.phone || '',
                package_hired: creditOpType === 'ADD' ? 'Ajuste Saldo: Adicionar' : 'Ajuste Saldo: Descontar',
                quantity_hired: opAmount,
                unit_value: 0,
                total_value: 0,
                sale_date: new Date().toISOString(),
                salesperson_id: user?.id,
                payment_status: 'RECEBIDO',
                payment_competence: new Date().toISOString().slice(0, 7),
                commission_status: 'PREVISTA',
                commission_value: 0,
                receipt_url: receiptUrl || null,
                notes: creditNotes || null
            };
            await dbService.saveFinanceSale(saleData);

            // Update user balance
            const res = await fetch(`/api/users/${selectedClientForCredit.id}/commercial`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    pacote: selectedClientForCredit.pacote || 'Avulso', 
                    preco_vendido: selectedClientForCredit.preco_vendido || '0.20', 
                    comissao_vendedor: selectedClientForCredit.comissao_vendedor || '0.05',
                    seller_name: selectedClientForCredit.seller_name || '',
                    disparo_quantidade: newCredits
                })
            });

            if (res.ok) {
                alert(`Saldo atualizado com sucesso! Novo saldo: ${newCredits}`);
                setIsCreditQuickModalOpen(false);
                setCreditOpAmount(0);
                setCreditNotes('');
                setCreditReceiptFile(null);
                loadClients();
                if (selectedClientForDashboard && selectedClientForDashboard.id === selectedClientForCredit.id) {
                    openClientDashboard(selectedClientForDashboard);
                }
            } else {
                alert("Erro ao atualizar saldo de créditos.");
            }
        } catch (err) {
            alert("Erro ao salvar dados de créditos.");
        } finally {
            setSubmitting(false);
        }
    };

    const openClientDashboard = async (client: any) => {
        setSelectedClientForDashboard(client);
        setSalesPage(1);
        setSubsPage(1);
        setLoadingDashboard(true);
        try {
            const [salesData, subsData] = await Promise.all([
                dbService.getFinanceSales({ userId: client.id, role: 'CLIENT' }),
                dbService.getClientSubmissionsByUserId(client.id)
            ]);
            setDashboardSales(salesData || []);
            setDashboardSubmissions(subsData || []);
        } catch (error) {
            console.error("Error loading client dashboard data:", error);
        } finally {
            setLoadingDashboard(false);
        }
    };

    const handleCreateSale = async () => {
        try {
            let receiptUrl = '';
            if (receiptFile) {
                setUploadingReceipt(true);
                try {
                    const formData = new FormData();
                    formData.append('file', receiptFile);
                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        receiptUrl = uploadData.fileUrl;
                    } else {
                        alert("Falha ao enviar comprovante de pagamento.");
                        setUploadingReceipt(false);
                        return;
                    }
                } catch (err) {
                    alert("Erro de conexão ao enviar comprovante.");
                    setUploadingReceipt(false);
                    return;
                } finally {
                    setUploadingReceipt(false);
                }
            } else {
                alert("Por favor, envie o comprovante de pagamento.");
                return;
            }

            let reportUrl = '';
            if (deliveryMethod === 'REPORT' && reportFile) {
                setUploadingReport(true);
                try {
                    const formData = new FormData();
                    formData.append('file', reportFile);
                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        reportUrl = uploadData.fileUrl;
                    } else {
                        alert("Falha ao enviar relatório.");
                        setUploadingReport(false);
                        return;
                    }
                } catch (err) {
                    alert("Erro de conexão ao enviar relatório.");
                    setUploadingReport(false);
                    return;
                } finally {
                    setUploadingReport(false);
                }
            }

            const finalQuantityDelivered = deliveryMethod === 'CARD' 
                ? (allSubmissionsList.find(s => String(s.id) === selectedCardForDelivery)?.credits_deducted || 0)
                : tempQuantityDelivered;

            const saleData = {
                client_name: selectedClientForSale.name,
                client_cpf_cnpj: selectedClientForSale.document_number || '',
                client_contact: selectedClientForSale.whatsapp || selectedClientForSale.phone || '',
                package_hired: saleForm.package_hired,
                quantity_hired: saleForm.quantity_hired,
                unit_value: saleForm.unit_value,
                total_value: saleForm.quantity_hired * saleForm.unit_value,
                sale_date: new Date().toISOString(),
                salesperson_id: saleForm.salesperson_id || user?.id,
                payment_status: saleForm.payment_status,
                payment_competence: new Date().toISOString().slice(0, 7),
                commission_status: 'PREVISTA',
                commission_value: saleForm.quantity_hired * (parseFloat(String(selectedClientForSale.comissao_vendedor || '0').replace(',', '.')) || 0),
                receipt_url: receiptUrl,
                report_url: reportUrl || null,
                notes: saleNotes || null,
                quantity_delivered: finalQuantityDelivered
            };

            const res = await dbService.saveFinanceSale(saleData);
            if (!res.error) {
                // Update client balance automatically!
                const currentCredits = selectedClientForSale.disparo_quantidade || 0;
                const newCredits = currentCredits + saleForm.quantity_hired;
                await fetch(`/api/users/${selectedClientForSale.id}/commercial`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        pacote: selectedClientForSale.pacote || 'Avulso', 
                        preco_vendido: selectedClientForSale.preco_vendido || '0.20', 
                        comissao_vendedor: selectedClientForSale.comissao_vendedor || '0.05',
                        seller_name: selectedClientForSale.seller_name || '',
                        disparo_quantidade: newCredits
                    })
                });

                alert("Venda criada e saldo de créditos do cliente atualizado com sucesso!");
                setIsSaleModalOpen(false);
                setReceiptFile(null);
                setReportFile(null);
                setSaleNotes('');
                setTempQuantityDelivered(0);
                loadClients();
                if (selectedClientForDashboard && selectedClientForDashboard.id === selectedClientForSale.id) {
                    openClientDashboard(selectedClientForDashboard);
                }
            } else {
                alert("Erro ao criar venda: " + res.error);
            }
        } catch (err) {
            alert("Erro de conexão ao criar venda.");
        }
    };

    const handleCreateCard = async () => {
        try {
            const submissionData = {
                ...cardForm,
                user_id: selectedClientForCard.id,
                submitted_by: user?.name,
                submitted_role: user?.role,
                assigned_to: selectedClientForCard.seller_name || user?.name || 'Admin',
                origin: 'ADMIN_MANUAL'
            };

            const res = await fetch('/api/client-submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (res.ok) {
                alert("Card/Submissão criada com sucesso e vinculada ao cliente!");
                setIsCardModalOpen(false);
            } else {
                alert("Erro ao criar card.");
            }
        } catch (err) {
            alert("Erro de conexão ao criar card.");
        }
    };

    const currentList = activeTab === 'PENDING' ? pendingClients : approvedClients;
    const filteredList = currentList.filter(c => {
        const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (c.phone || '').includes(searchTerm) ||
                              (c.whatsapp || '').includes(searchTerm);
        const matchesSeller = filterSeller === 'TODOS' || c.seller_name === filterSeller;
        const matchesPacote = filterPacote === 'TODOS' || c.pacote === filterPacote;
        return matchesSearch && matchesSeller && matchesPacote;
    });

    const uniqueSellers = Array.from(new Set([...pendingClients, ...approvedClients].map(c => c.seller_name).filter(Boolean))).sort();
    const uniquePacotes = Array.from(new Set([...pendingClients, ...approvedClients].map(c => c.pacote).filter(Boolean))).sort();

    return (
        <div className="crm-container" style={{ minHeight: '100vh', padding: '32px' }}>
            <div className="crm-header-premium mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <Users size={12} /> CENTRAL DE CLIENTES E CONTROLE FINANCEIRO
                    </div>
                    <h1 className="crm-main-title">Gerenciamento de Clientes</h1>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={handleGenerateInvite} 
                        className="action-btn ghost-btn" 
                        style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', borderColor: '#acf800', color: '#acf800' }}
                    >
                        <User size={15} /> GERAR CONVITE CLIENTE
                    </button>
                    <button 
                        onClick={() => {
                            setManualForm(prev => ({ ...prev, seller_name: user?.name || '' }));
                            setIsManualRegisterOpen(true);
                        }} 
                        className="action-btn primary-btn" 
                        style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', background: 'var(--primary-gradient)', color: 'black' }}
                    >
                        <Plus size={16} /> REGISTRAR MANUALMENTE
                    </button>
                </div>
            </div>

            {/* Alternar Abas Pendentes e Ativos */}
            <div className="crm-card" style={{ padding: '8px', marginBottom: '32px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setActiveTab('APPROVED')} 
                    className={`action-btn ${activeTab === 'APPROVED' ? 'primary-btn' : 'ghost-btn'}`}
                    style={{ flex: 1, height: '54px' }}
                >
                    <CheckCircle2 size={20} /> CLIENTES ATIVOS ({approvedClients.length})
                </button>
                <button 
                    onClick={() => setActiveTab('PENDING')} 
                    className={`action-btn ${activeTab === 'PENDING' ? 'primary-btn' : 'ghost-btn'}`}
                    style={{ flex: 1, height: '54px' }}
                >
                    <Clock size={20} /> AGUARDANDO APROVAÇÃO ({pendingClients.length})
                </button>
            </div>

            {/* Filtros Avançados */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={22} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                    <input 
                        className="field-input" 
                        placeholder="Buscar cliente por nome, email ou contato..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ height: '58px', paddingLeft: '70px', fontSize: '1rem' }}
                    />
                </div>
                
                <div style={{ minWidth: '200px' }}>
                    <select 
                        className="field-input"
                        value={filterSeller}
                        onChange={e => setFilterSeller(e.target.value)}
                        style={{ height: '58px', padding: '0 20px', background: 'var(--card-bg)' }}
                    >
                        <option value="TODOS">Todos Vendedores</option>
                        {uniqueSellers.map(seller => (
                            <option key={seller} value={seller}>{seller}</option>
                        ))}
                    </select>
                </div>

                <div style={{ minWidth: '200px' }}>
                    <select 
                        className="field-input"
                        value={filterPacote}
                        onChange={e => setFilterPacote(e.target.value)}
                        style={{ height: '58px', padding: '0 20px', background: 'var(--card-bg)' }}
                    >
                        <option value="TODOS">Todos Planos</option>
                        {uniquePacotes.map(pacote => (
                            <option key={pacote} value={pacote}>{pacote}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div style={{ color: 'var(--text-muted)' }}>Carregando clientes...</div>
            ) : filteredList.length === 0 ? (
                <div className="crm-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                    Nenhum cliente cadastrado nesta seção.
                </div>
            ) : (
                <div className="crm-card" style={{ padding: '0', overflowX: 'auto', border: '1px solid var(--surface-border-subtle)', background: 'rgba(10,15,24,0.3)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cliente / Contato</th>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Plano</th>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Vendedor Responsável</th>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Saldo (Créditos)</th>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Valores Unitários</th>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Ações / Operações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.map(client => (
                                <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontWeight: 950, color: 'white', fontSize: '1rem' }}>{client.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            {client.email} • {client.whatsapp || client.phone || 'Sem contato'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            {client.pacote || 'Avulso'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>
                                        {client.seller_name || <span style={{ opacity: 0.3 }}>Nenhum</span>}
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: 950, color: '#acf800' }}>
                                                {(client.disparo_quantidade || 0).toLocaleString()}
                                            </span>
                                            {activeTab === 'APPROVED' && (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedClientForCredit(client);
                                                        setCreditOpAmount(0);
                                                        setIsCreditQuickModalOpen(true);
                                                    }}
                                                    style={{ padding: '4px 8px', background: 'rgba(172,248,0,0.1)', border: '1px solid rgba(172,248,0,0.2)', color: '#acf800', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}
                                                    title="Adicionar ou descontar créditos"
                                                >
                                                    + CRÉDITOS
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                        <div>Preço Unit: <strong style={{ color: 'white' }}>R$ {client.preco_vendido || '0.20'}</strong></div>
                                        <div style={{ marginTop: '2px' }}>Comissão: <strong style={{ color: 'white' }}>R$ {client.comissao_vendedor || '0.05'}</strong></div>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                            {activeTab === 'PENDING' ? (
                                                <>
                                                    <button onClick={() => handleApprove(client)} className="action-btn primary-btn" style={{ padding: '0 16px', fontSize: '0.8rem', height: '36px' }}>
                                                        APROVAR ACESSO
                                                    </button>
                                                    <button onClick={() => handleReject(client.id)} className="action-btn ghost-btn" style={{ width: '36px', height: '36px', padding: 0, color: '#ef4444', borderColor: '#ef4444' }} title="Rejeitar">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => openClientDashboard(client)} 
                                                        className="action-btn primary-btn" 
                                                        style={{ padding: '0 14px', fontSize: '0.8rem', height: '36px', background: 'var(--primary-gradient)', color: 'black' }}
                                                    >
                                                        DASHBOARD
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedClientForSale(client);
                                                            setSaleForm(prev => ({ ...prev, unit_value: parseFloat(client.preco_vendido) || 0.20 }));
                                                            setIsSaleModalOpen(true);
                                                        }} 
                                                        className="action-btn ghost-btn" 
                                                        style={{ padding: '0 14px', fontSize: '0.8rem', height: '36px', borderColor: '#acf800', color: '#acf800' }}
                                                    >
                                                        <DollarSign size={14} /> NOVA VENDA
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedClientForCard(client);
                                                            setCardForm({ profile_name: client.name, ddd: '', template_type: 'none', media_url: '', ad_copy: '', button_link: '', notes: '' });
                                                            setIsCardModalOpen(true);
                                                        }} 
                                                        className="action-btn ghost-btn" 
                                                        style={{ padding: '0 14px', fontSize: '0.8rem', height: '36px', borderColor: '#38bdf8', color: '#38bdf8' }}
                                                    >
                                                        <LinkIcon size={14} /> VINCULAR CARD
                                                    </button>
                                                    
                                                    {/* Config Options dropdown replacements (Quick Edit buttons) */}
                                                    <button className="action-btn ghost-btn" onClick={() => openEditModal(client, 'COMMERCIAL')} style={{ width: '36px', height: '36px', padding: 0 }} title="Comercial e Parâmetros">
                                                        <Edit size={15} color="#acf800" />
                                                    </button>
                                                    <button className="action-btn ghost-btn" onClick={() => openEditModal(client, 'BASIC')} style={{ width: '36px', height: '36px', padding: 0 }} title="Editar Dados">
                                                        <User size={15} color="#3b82f6" />
                                                    </button>
                                                    <button className="action-btn ghost-btn" onClick={() => openEditModal(client, 'PASSWORD')} style={{ width: '36px', height: '36px', padding: 0 }} title="Mudar Senha">
                                                        <Key size={15} color="#f59e0b" />
                                                    </button>
                                                    <button onClick={() => handleReject(client.id)} className="action-btn ghost-btn" style={{ width: '36px', height: '36px', padding: 0, color: '#ef4444', borderColor: '#ef4444' }} title="Excluir cliente">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Pagination Controls for Clients */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 24px', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Mostrando {Math.min(filteredList.length, (clientsPage - 1) * 10 + 1)}-{Math.min(filteredList.length, clientsPage * 10)} de {filteredList.length} clientes
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                disabled={clientsPage === 1}
                                onClick={() => setClientsPage(p => Math.max(1, p - 1))}
                                className="action-btn ghost-btn"
                                style={{ height: '36px', padding: '0 16px', fontSize: '0.8rem' }}
                            >
                                Anterior
                            </button>
                            <button 
                                disabled={clientsPage * 10 >= filteredList.length}
                                onClick={() => setClientsPage(p => p + 1)}
                                className="action-btn ghost-btn"
                                style={{ height: '36px', padding: '0 16px', fontSize: '0.8rem' }}
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Credit Add/Remove Modal */}
            {isCreditQuickModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card" style={{ width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 950 }}>Adicionar / Descontar Créditos</h2>
                            <button onClick={() => setIsCreditQuickModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                             Cliente: <strong style={{ color: 'white' }}>{selectedClientForCredit?.name}</strong> <br />
                             Saldo Atual: <strong style={{ color: '#acf800' }}>{(selectedClientForCredit?.disparo_quantidade || 0).toLocaleString()} créditos</strong>
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="field-label">Tipo de Operação</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setCreditOpType('ADD')}
                                        className={`action-btn ${creditOpType === 'ADD' ? 'primary-btn' : 'ghost-btn'}`}
                                        style={{ flex: 1, height: '48px', borderColor: creditOpType === 'ADD' ? 'var(--primary-color)' : '' }}
                                    >
                                        <Plus size={16} /> Adicionar (+)
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setCreditOpType('SUBTRACT')}
                                        className={`action-btn ${creditOpType === 'SUBTRACT' ? 'primary-btn' : 'ghost-btn'}`}
                                        style={{ flex: 1, height: '48px', color: creditOpType === 'SUBTRACT' ? 'black' : '#ef4444', background: creditOpType === 'SUBTRACT' ? '#ef4444' : '', borderColor: '#ef4444' }}
                                    >
                                        <Minus size={16} /> Descontar (-)
                                    </button>
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="field-label">Quantidade de Créditos</label>
                                <input 
                                    type="number" 
                                    className="field-input" 
                                    value={creditOpAmount === 0 ? '' : creditOpAmount} 
                                    onChange={e => setCreditOpAmount(Math.max(0, parseInt(e.target.value) || 0))} 
                                    placeholder="Ex: 5000"
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projeção do Novo Saldo:</span>
                                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', marginTop: '4px' }}>
                                    {creditOpType === 'ADD' 
                                        ? ((selectedClientForCredit?.disparo_quantidade || 0) + (creditOpAmount || 0)).toLocaleString()
                                        : Math.max(0, (selectedClientForCredit?.disparo_quantidade || 0) - (creditOpAmount || 0)).toLocaleString()
                                    } créditos
                                </div>
                            </div>

                            {creditOpType === 'ADD' && (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className="field-label">Comprovante de Pagamento (Opcional)</label>
                                    <input 
                                        type="file" 
                                        className="field-input" 
                                        onChange={e => setCreditReceiptFile(e.target.files?.[0] || null)} 
                                        accept="image/*,application/pdf"
                                        disabled={uploadingCreditReceipt}
                                    />
                                </div>
                            )}

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="field-label">Observações / Motivo do Ajuste</label>
                                <textarea 
                                    className="field-input" 
                                    value={creditNotes} 
                                    onChange={e => setCreditNotes(e.target.value)} 
                                    placeholder="Escreva o motivo da alteração manual de saldo..."
                                    style={{ height: '60px', padding: '12px', resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button onClick={handleQuickCreditOp} className="action-btn primary-btn" style={{ flex: 1, height: '48px' }} disabled={submitting}>CONFIRMAR</button>
                            <button onClick={() => {
                                setIsCreditQuickModalOpen(false);
                                setCreditNotes('');
                                setCreditReceiptFile(null);
                            }} className="action-btn ghost-btn" style={{ flex: 1, height: '48px' }} disabled={submitting}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit / Configuration Modal */}
            {editModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card" style={{ width: '100%', maxWidth: '650px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>
                                {editMode === 'COMMERCIAL' ? 'Configuração Comercial (Venda/Créditos)' : editMode === 'BASIC' ? 'Dados Básicos' : 'Alterar Senha'}
                            </h2>
                            <button onClick={() => setEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: editMode === 'PASSWORD' ? '1fr' : '1fr 1fr', gap: '16px' }}>
                            {editMode === 'COMMERCIAL' && (
                                <>
                                    <div>
                                        <label className="field-label">Créditos (Disparos Disponíveis)</label>
                                        <input type="number" className="field-input" value={editForm.disparo_quantidade} onChange={e => setEditForm({...editForm, disparo_quantidade: parseInt(e.target.value) || 0})} />
                                    </div>
                                    <div>
                                        <label className="field-label">Preço Vendido (Unitário)</label>
                                        <input className="field-input" value={editForm.preco_vendido} onChange={e => setEditForm({...editForm, preco_vendido: e.target.value})} placeholder="Ex: 0.20" />
                                    </div>
                                    <div>
                                        <label className="field-label">Comissão do Vendedor (Por unidade)</label>
                                        <input className="field-input" value={editForm.comissao_vendedor} onChange={e => setEditForm({...editForm, comissao_vendedor: e.target.value})} placeholder="Ex: 0.05" />
                                    </div>
                                    <div>
                                        <label className="field-label">Vendedor / Responsável</label>
                                        <select 
                                            className="field-input" 
                                            value={editForm.seller_name} 
                                            onChange={e => setEditForm({...editForm, seller_name: e.target.value})}
                                            style={{ background: 'var(--card-bg)' }}
                                        >
                                            <option value="">Nenhum</option>
                                            {salespeople.map(sp => (
                                                <option key={sp.id} value={sp.name}>{sp.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label className="field-label">Pacote / Plano</label>
                                        <input className="field-input" value={editForm.pacote} onChange={e => setEditForm({...editForm, pacote: e.target.value})} />
                                    </div>
                                </>
                            )}

                            {editMode === 'BASIC' && (
                                <>
                                    <div>
                                        <label className="field-label">Nome Completo</label>
                                        <input className="field-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="field-label">Email</label>
                                        <input className="field-input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label className="field-label">WhatsApp / Telefone</label>
                                        <input className="field-input" value={editForm.whatsapp} onChange={e => setEditForm({...editForm, whatsapp: e.target.value})} />
                                    </div>
                                </>
                            )}

                            {editMode === 'PASSWORD' && (
                                <>
                                    <div>
                                        <label className="field-label">Nova Senha</label>
                                        <input className="field-input" type="password" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} placeholder="Digite a nova senha..." />
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button onClick={handleSaveEdit} className="action-btn primary-btn" style={{ flex: 1, height: '48px' }}>SALVAR ALTERAÇÕES</button>
                            <button onClick={() => setEditModalOpen(false)} className="action-btn ghost-btn" style={{ flex: 1, height: '48px' }}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Direct Sale Modal */}
            {isSaleModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card" style={{ width: '100%', maxWidth: '650px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>Nova Venda Direta</h2>
                            <button onClick={() => setIsSaleModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Você está registrando uma nova venda de créditos para o cliente <strong style={{ color: 'white' }}>{selectedClientForSale?.name}</strong>.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="field-label">Quantidade de Créditos (Hired)</label>
                                <input type="number" className="field-input" value={saleForm.quantity_hired} onChange={e => setSaleForm({...saleForm, quantity_hired: parseInt(e.target.value) || 0})} />
                            </div>
                            <div>
                                <label className="field-label">Preço Unitário (R$)</label>
                                <input className="field-input" value={saleForm.unit_value} onChange={e => setSaleForm({...saleForm, unit_value: parseFloat(e.target.value) || 0})} />
                            </div>
                            <div>
                                <label className="field-label">Vendedor do Lançamento</label>
                                <select 
                                    className="field-input"
                                    value={saleForm.salesperson_id}
                                    onChange={e => setSaleForm({...saleForm, salesperson_id: e.target.value})}
                                    style={{ background: 'var(--card-bg)' }}
                                >
                                    <option value="">Selecione vendedor...</option>
                                    {salespeople.map(sp => (
                                        <option key={sp.id} value={sp.id}>{sp.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Status do Pagamento</label>
                                <select 
                                    className="field-input"
                                    value={saleForm.payment_status}
                                    onChange={e => setSaleForm({...saleForm, payment_status: e.target.value})}
                                    style={{ background: 'var(--card-bg)' }}
                                >
                                    <option value="PENDENTE">PENDENTE</option>
                                    <option value="RECEBIDO">RECEBIDO</option>
                                    <option value="INADIMPLENTE">INADIMPLENTE</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="field-label">Valor Total</label>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-color)', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    R$ {(saleForm.quantity_hired * saleForm.unit_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            
                            <div>
                                <label className="field-label">Método de Créditos Entregues</label>
                                <select 
                                    className="field-input" 
                                    value={deliveryMethod} 
                                    onChange={e => {
                                        setDeliveryMethod(e.target.value as any);
                                        if (e.target.value === 'MANUAL') setTempQuantityDelivered(0);
                                    }}
                                    style={{ background: 'var(--card-bg)' }}
                                >
                                    <option value="MANUAL">Digitar Manualmente</option>
                                    <option value="CARD">Puxar do Card (Campanha)</option>
                                    <option value="REPORT">Enviar Relatório (Upload)</option>
                                </select>
                            </div>

                            {deliveryMethod === 'MANUAL' && (
                                <div>
                                    <label className="field-label">Quantidade de Créditos Entregue</label>
                                    <input type="number" className="field-input" value={tempQuantityDelivered === 0 ? '' : tempQuantityDelivered} onChange={e => setTempQuantityDelivered(parseInt(e.target.value) || 0)} placeholder="Ex: 850" />
                                </div>
                            )}

                            {deliveryMethod === 'CARD' && (
                                <div>
                                    <label className="field-label">Selecionar Card do Cliente</label>
                                    <select 
                                        className="field-input" 
                                        value={selectedCardForDelivery} 
                                        onChange={e => {
                                            setSelectedCardForDelivery(e.target.value);
                                            const card = allSubmissionsList.find(s => String(s.id) === e.target.value);
                                            if (card) {
                                                setTempQuantityDelivered(card.credits_deducted || card.disparo_quantidade || 0);
                                            }
                                        }}
                                        style={{ background: 'var(--card-bg)' }}
                                    >
                                        <option value="">Selecione...</option>
                                        {allSubmissionsList.filter(s => s.user_id === selectedClientForSale?.id).map(s => (
                                            <option key={s.id} value={s.id}>{s.profile_name} ({s.credits_deducted || s.disparo_quantidade || 0} disparos)</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {deliveryMethod === 'REPORT' && (
                                <div>
                                    <label className="field-label">Relatório de Disparos (.csv, .xlsx)</label>
                                    <input 
                                        type="file" 
                                        className="field-input" 
                                        onChange={e => setReportFile(e.target.files?.[0] || null)} 
                                        accept=".csv,.xlsx,.xls"
                                        disabled={uploadingReport}
                                    />
                                </div>
                            )}

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="field-label">Comprovante de Pagamento (Obrigatório)</label>
                                <input 
                                    type="file" 
                                    className="field-input" 
                                    onChange={e => setReceiptFile(e.target.files?.[0] || null)} 
                                    accept="image/*,application/pdf"
                                    disabled={uploadingReceipt}
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="field-label">Observações da Venda</label>
                                <textarea 
                                    className="field-input" 
                                    value={saleNotes} 
                                    onChange={e => setSaleNotes(e.target.value)} 
                                    placeholder="Dados adicionais, anotações de faturamento..."
                                    style={{ height: '60px', padding: '12px', resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button onClick={handleCreateSale} className="action-btn primary-btn" style={{ flex: 1, height: '48px' }} disabled={uploadingReceipt || uploadingReport}>GERAR VENDA</button>
                            <button onClick={() => {
                                setIsSaleModalOpen(false);
                                setReceiptFile(null);
                                setReportFile(null);
                                setSaleNotes('');
                                setTempQuantityDelivered(0);
                            }} className="action-btn ghost-btn" style={{ flex: 1, height: '48px' }} disabled={uploadingReceipt || uploadingReport}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Card Modal */}
            {isCardModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card" style={{ width: '100%', maxWidth: '650px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>Vincular Card / Submissão</h2>
                            <button onClick={() => setIsCardModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '12px' }}>
                            <button 
                                type="button"
                                className={`action-btn ${linkCardMode === 'EXISTING' ? 'primary-btn' : 'ghost-btn'}`}
                                onClick={() => setLinkCardMode('EXISTING')}
                                style={{ flex: 1, height: '40px', fontSize: '0.8rem' }}
                            >
                                Vincular Existente
                            </button>
                            <button 
                                type="button"
                                className={`action-btn ${linkCardMode === 'CREATE' ? 'primary-btn' : 'ghost-btn'}`}
                                onClick={() => setLinkCardMode('CREATE')}
                                style={{ flex: 1, height: '40px', fontSize: '0.8rem' }}
                            >
                                Criar Novo Card
                            </button>
                        </div>

                        {linkCardMode === 'EXISTING' ? (
                            <div>
                                <label className="field-label">Buscar Card / Campanha do Operacional</label>
                                <input 
                                    className="field-input" 
                                    value={subSearchQuery} 
                                    onChange={e => setSubSearchQuery(e.target.value)} 
                                    placeholder="Digite o nome da campanha ou ID..."
                                    style={{ marginBottom: '16px' }}
                                />

                                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                                    {allSubmissionsList.filter(s => 
                                        (s.profile_name || '').toLowerCase().includes(subSearchQuery.toLowerCase()) ||
                                        String(s.id).includes(subSearchQuery)
                                    ).length === 0 ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            Nenhum card operacional disponível encontrado.
                                        </div>
                                    ) : (
                                        allSubmissionsList.filter(s => 
                                            (s.profile_name || '').toLowerCase().includes(subSearchQuery.toLowerCase()) ||
                                            String(s.id).includes(subSearchQuery)
                                        ).map(s => {
                                            const isSelected = selectedSubmissionId === String(s.id);
                                            const alreadyAssigned = s.user_id ? `(Atribuído ID: ${s.user_id})` : '';
                                            return (
                                                <div 
                                                    key={s.id} 
                                                    onClick={() => setSelectedSubmissionId(String(s.id))}
                                                    style={{ 
                                                        padding: '12px 16px', 
                                                        borderBottom: '1px solid rgba(255,255,255,0.03)', 
                                                        cursor: 'pointer',
                                                        background: isSelected ? 'rgba(172,248,0,0.1)' : 'transparent',
                                                        color: isSelected ? '#acf800' : 'white',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    <div>
                                                        <strong>#{s.id} - {s.profile_name}</strong>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '10px' }}>{s.sender_number || 'Sem remetente'}</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: s.user_id ? '#f59e0b' : '#10b981' }}>
                                                        {alreadyAssigned || 'Disponível'}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                    <button onClick={handleLinkExistingCard} className="action-btn primary-btn" style={{ flex: 1, height: '48px' }} disabled={submitting}>VINCULAR CARD SELECIONADO</button>
                                    <button onClick={() => setIsCardModalOpen(false)} className="action-btn ghost-btn" style={{ flex: 1, height: '48px' }} disabled={submitting}>CANCELAR</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                    Cria um card de campanha (submissão) no funil para o cliente <strong style={{ color: 'white' }}>{selectedClientForCard?.name}</strong>.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="field-label">Nome da Campanha / Perfil</label>
                                        <input className="field-input" value={cardForm.profile_name} onChange={e => setCardForm({...cardForm, profile_name: e.target.value})} placeholder="Ex: Campanha WhatsApp" />
                                    </div>
                                    <div>
                                        <label className="field-label">DDD</label>
                                        <input className="field-input" value={cardForm.ddd} onChange={e => setCardForm({...cardForm, ddd: e.target.value})} placeholder="Ex: 11" />
                                    </div>
                                    <div>
                                        <label className="field-label">Tipo de Template</label>
                                        <select 
                                            className="field-input"
                                            value={cardForm.template_type}
                                            onChange={e => setCardForm({...cardForm, template_type: e.target.value})}
                                            style={{ background: 'var(--card-bg)' }}
                                        >
                                            <option value="none">Nenhum</option>
                                            <option value="text">Texto</option>
                                            <option value="image">Imagem</option>
                                            <option value="video">Vídeo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="field-label">URL da Mídia (opcional)</label>
                                        <input className="field-input" value={cardForm.media_url} onChange={e => setCardForm({...cardForm, media_url: e.target.value})} placeholder="https://..." />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label className="field-label">Texto / Cópia do Anúncio</label>
                                        <textarea 
                                            className="field-input" 
                                            value={cardForm.ad_copy} 
                                            onChange={e => setCardForm({...cardForm, ad_copy: e.target.value})} 
                                            placeholder="Mensagem a disparar..."
                                            style={{ height: '80px', padding: '12px', resize: 'vertical' }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label className="field-label">Link do Botão</label>
                                        <input className="field-input" value={cardForm.button_link} onChange={e => setCardForm({...cardForm, button_link: e.target.value})} placeholder="https://wa.me/..." />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                    <button onClick={handleCreateCard} className="action-btn primary-btn" style={{ flex: 1, height: '48px' }} disabled={submitting}>CRIAR E VINCULAR CARD</button>
                                    <button onClick={() => setIsCardModalOpen(false)} className="action-btn ghost-btn" style={{ flex: 1, height: '48px' }} disabled={submitting}>CANCELAR</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* --- CLIENT DASHBOARD OVERLAY --- */}
            {selectedClientForDashboard && (
                <div style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    background: 'rgba(5,8,15,0.95)', 
                    backdropFilter: 'blur(15px)', 
                    zIndex: 9990, 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '40px',
                    overflowY: 'auto'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--surface-border-subtle)', paddingBottom: '20px' }}>
                        <div>
                            <div className="crm-badge-small" style={{ marginBottom: '8px' }}>DASHBOARD DO CLIENTE</div>
                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 950 }}>{selectedClientForDashboard.name}</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {selectedClientForDashboard.email} • {selectedClientForDashboard.whatsapp || selectedClientForDashboard.phone}
                            </p>
                        </div>
                        <button 
                            onClick={() => setSelectedClientForDashboard(null)} 
                            className="action-btn ghost-btn" 
                            style={{ width: '48px', height: '48px', borderRadius: '24px', padding: 0 }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {loadingDashboard ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            Carregando dados da dashboard...
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            {/* Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div className="crm-card" style={{ padding: '24px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>SALDO DE CRÉDITOS</span>
                                    <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: '#acf800' }}>
                                        {(selectedClientForDashboard.disparo_quantidade || 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="crm-card" style={{ padding: '24px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PREÇO POR CRÉDITO</span>
                                    <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950 }}>
                                        R$ {selectedClientForDashboard.preco_vendido || '0.20'}
                                    </h3>
                                </div>
                                <div className="crm-card" style={{ padding: '24px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>TOTAL DE DISPAROS ENVIADOS</span>
                                    <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: '#38bdf8' }}>
                                        {dashboardSubmissions.length} Campanhas
                                    </h3>
                                </div>
                                <div className="crm-card" style={{ padding: '24px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>VALOR TOTAL INVESTIDO</span>
                                    <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: 'var(--primary-color)' }}>
                                        R$ {dashboardSales.reduce((acc, s) => acc + parseFloat(s.total_value || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </h3>
                                </div>
                            </div>

                            {/* Main content grid split */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                                {/* Histórico de Recargas / Vendas */}
                                <div className="crm-card" style={{ padding: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Histórico de Recargas (Financeiro)</h3>
                                        <button 
                                            onClick={() => {
                                                setSelectedClientForSale(selectedClientForDashboard);
                                                setSaleForm(prev => ({ ...prev, unit_value: parseFloat(selectedClientForDashboard.preco_vendido) || 0.20 }));
                                                setIsSaleModalOpen(true);
                                            }} 
                                            className="action-btn primary-btn"
                                            style={{ height: '38px', fontSize: '0.8rem', padding: '0 16px' }}
                                        >
                                            REGISTRAR COMPRA (NOVA VENDA)
                                        </button>
                                    </div>

                                    {dashboardSales.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            Nenhum registro de compra/recarga para este cliente.
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="crm-table" style={{ width: '100%' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>DATA</th>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>QUANTIDADE</th>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>UNITÁRIO</th>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL</th>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>COMPROVANTE</th>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>STATUS PAGAMENTO</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dashboardSales.slice((salesPage - 1) * ITEMS_PER_PAGE, salesPage * ITEMS_PER_PAGE).map(sale => (
                                                        <tr key={sale.id} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                                            <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(sale.sale_date).toLocaleDateString()}</td>
                                                            <td style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold' }}>{sale.quantity_hired.toLocaleString()} créditos</td>
                                                            <td style={{ padding: '12px', fontSize: '13px' }}>R$ {sale.unit_value}</td>
                                                            <td style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-color)' }}>R$ {parseFloat(sale.total_value).toFixed(2)}</td>
                                                            <td style={{ padding: '12px', fontSize: '13px' }}>
                                                                {sale.receipt_url ? (
                                                                    <a 
                                                                        href={sale.receipt_url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        style={{ color: '#acf800', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                                                                    >
                                                                        Ver Comprovante <ExternalLink size={12} />
                                                                    </a>
                                                                ) : (
                                                                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Não enviado</span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '12px', fontSize: '13px' }}>
                                                                <span className="status-badge-premium" style={{
                                                                    '--bg': sale.payment_status === 'RECEBIDO' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                                                    '--color': sale.payment_status === 'RECEBIDO' ? '#4ade80' : '#f59e0b',
                                                                    '--border': sale.payment_status === 'RECEBIDO' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                                                                } as any}>
                                                                    {sale.payment_status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {dashboardSales.length > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                Mostrando {Math.min(dashboardSales.length, (salesPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(dashboardSales.length, salesPage * ITEMS_PER_PAGE)} de {dashboardSales.length}
                                            </span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    disabled={salesPage === 1}
                                                    onClick={() => setSalesPage(p => Math.max(1, p - 1))}
                                                    className="action-btn ghost-btn"
                                                    style={{ height: '32px', padding: '0 12px', fontSize: '11px' }}
                                                >
                                                    Anterior
                                                </button>
                                                <button 
                                                    disabled={salesPage * ITEMS_PER_PAGE >= dashboardSales.length}
                                                    onClick={() => setSalesPage(p => p + 1)}
                                                    className="action-btn ghost-btn"
                                                    style={{ height: '32px', padding: '0 12px', fontSize: '11px' }}
                                                >
                                                    Próxima
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Histórico de Campanhas / Disparos */}
                                <div className="crm-card" style={{ padding: '32px' }}>
                                    <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 900 }}>Histórico de Campanhas (Disparos)</h3>
                                    
                                    {dashboardSubmissions.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            Nenhuma campanha de disparos registrada.
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="crm-table" style={{ width: '100%' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>ID / CAMPANHA</th>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>DATA DE ENVIO</th>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>NÚMERO REMETENTE</th>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>CUSTO (DISPAROS)</th>
                                                        <th style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>STATUS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dashboardSubmissions.slice((subsPage - 1) * ITEMS_PER_PAGE, subsPage * ITEMS_PER_PAGE).map(sub => (
                                                        <tr key={sub.id} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                                            <td style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                                                                #{sub.id} - {sub.profile_name || 'Sem nome'}
                                                            </td>
                                                            <td style={{ padding: '12px', fontSize: '13px' }}>
                                                                {sub.dispatch_date || new Date(sub.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td style={{ padding: '12px', fontSize: '13px' }}>{sub.sender_number || 'Padrão'}</td>
                                                            <td style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                                                                {sub.credits_deducted || sub.disparo_quantidade || 0} disparos
                                                            </td>
                                                            <td style={{ padding: '12px', fontSize: '13px' }}>
                                                                <span className="status-badge-premium" style={{
                                                                    '--bg': sub.status === 'APROVADO' || sub.status === 'GERADO' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                                                    '--color': sub.status === 'APROVADO' || sub.status === 'GERADO' ? '#4ade80' : '#f59e0b',
                                                                    '--border': sub.status === 'APROVADO' || sub.status === 'GERADO' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                                                                } as any}>
                                                                    {sub.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {dashboardSubmissions.length > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                Mostrando {Math.min(dashboardSubmissions.length, (subsPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(dashboardSubmissions.length, subsPage * ITEMS_PER_PAGE)} de {dashboardSubmissions.length}
                                            </span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    disabled={subsPage === 1}
                                                    onClick={() => setSubsPage(p => Math.max(1, p - 1))}
                                                    className="action-btn ghost-btn"
                                                    style={{ height: '32px', padding: '0 12px', fontSize: '11px' }}
                                                >
                                                    Anterior
                                                </button>
                                                <button 
                                                    disabled={subsPage * ITEMS_PER_PAGE >= dashboardSubmissions.length}
                                                    onClick={() => setSubsPage(p => p + 1)}
                                                    className="action-btn ghost-btn"
                                                    style={{ height: '32px', padding: '0 12px', fontSize: '11px' }}
                                                >
                                                    Próxima
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Manual Register Modal */}
            {isManualRegisterOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card" style={{ width: '100%', maxWidth: '650px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>Registrar Cliente Manualmente</h2>
                            <button onClick={() => setIsManualRegisterOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="field-label">Nome Completo (Obrigatório)</label>
                                <input className="field-input" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} placeholder="Nome do cliente" />
                            </div>
                            <div>
                                <label className="field-label">Email (Obrigatório)</label>
                                <input className="field-input" value={manualForm.email} onChange={e => setManualForm({...manualForm, email: e.target.value})} placeholder="email@exemplo.com" />
                            </div>
                            <div>
                                <label className="field-label">Senha (Obrigatório)</label>
                                <input className="field-input" type="password" value={manualForm.password} onChange={e => setManualForm({...manualForm, password: e.target.value})} placeholder="Senha inicial" />
                            </div>
                            <div>
                                <label className="field-label">WhatsApp / Telefone</label>
                                <input className="field-input" value={manualForm.whatsapp} onChange={e => setManualForm({...manualForm, whatsapp: e.target.value})} placeholder="DDD + Número" />
                            </div>
                            <div>
                                <label className="field-label">Documento CPF / CNPJ</label>
                                <input className="field-input" value={manualForm.document_number} onChange={e => setManualForm({...manualForm, document_number: e.target.value})} placeholder="Somente números" />
                            </div>
                            <div>
                                <label className="field-label">Preço Vendido (Crédito)</label>
                                <input className="field-input" value={manualForm.preco_vendido} onChange={e => setManualForm({...manualForm, preco_vendido: e.target.value})} placeholder="Ex: 0.20" />
                            </div>
                            <div>
                                <label className="field-label">Comissão do Vendedor (Unitário)</label>
                                <input className="field-input" value={manualForm.comissao_vendedor} onChange={e => setManualForm({...manualForm, comissao_vendedor: e.target.value})} placeholder="Ex: 0.05" />
                            </div>
                            <div>
                                <label className="field-label">Créditos Iniciais</label>
                                <input type="number" className="field-input" value={manualForm.disparo_quantidade} onChange={e => setManualForm({...manualForm, disparo_quantidade: parseInt(e.target.value) || 0})} />
                            </div>
                            <div>
                                <label className="field-label">Pacote / Plano</label>
                                <input className="field-input" value={manualForm.pacote} onChange={e => setManualForm({...manualForm, pacote: e.target.value})} placeholder="Ex: Premium" />
                            </div>
                            <div>
                                <label className="field-label">Vendedor do Lançamento</label>
                                <select 
                                    className="field-input"
                                    value={manualForm.seller_name}
                                    onChange={e => setManualForm({...manualForm, seller_name: e.target.value})}
                                    style={{ background: 'var(--card-bg)' }}
                                >
                                    <option value="">Nenhum</option>
                                    {salespeople.map(sp => (
                                        <option key={sp.id} value={sp.name}>{sp.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button onClick={handleManualRegister} className="action-btn primary-btn" style={{ flex: 1, height: '48px' }} disabled={submitting}>REGISTRAR E APROVAR</button>
                            <button onClick={() => setIsManualRegisterOpen(false)} className="action-btn ghost-btn" style={{ flex: 1, height: '48px' }} disabled={submitting}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeClients;
