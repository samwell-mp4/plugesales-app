import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Clock, CheckCircle2, ShieldCheck, Edit, Trash2, Key, Search, DollarSign, Plus, Coins, Zap, User, Link as LinkIcon, RefreshCw, X } from 'lucide-react';
import { dbService } from '../services/dbService';

const EmployeeClients = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED'>('PENDING');
    const [pendingClients, setPendingClients] = useState<any[]>([]);
    const [approvedClients, setApprovedClients] = useState<any[]>([]);
    const [salespeople, setSalespeople] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeller, setFilterSeller] = useState('TODOS');

    const [editingClient, setEditingClient] = useState<any>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editMode, setEditMode] = useState<'COMMERCIAL' | 'BASIC' | 'PASSWORD'>('COMMERCIAL');

    const [editForm, setEditForm] = useState({
        pacote: '', preco_vendido: '', comissao_vendedor: '',
        name: '', email: '', phone: '', document_number: '', whatsapp: '',
        password: '', disparo_quantidade: 0, seller_name: ''
    });

    // Modal to create sale directly
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [selectedClientForSale, setSelectedClientForSale] = useState<any>(null);
    const [saleForm, setSaleForm] = useState({
        package_hired: 'Disparos',
        quantity_hired: 1000,
        unit_value: 0.20,
        salesperson_id: '',
        payment_status: 'PENDENTE'
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

    const loadClients = async () => {
        setIsLoading(true);
        try {
            const sellerFilter = user?.role === 'ADMIN' ? '' : `seller_name=${encodeURIComponent(user?.name || '')}`;
            const [pendingRes, approvedRes, peopleData] = await Promise.all([
                fetch(`/api/users/pending?${sellerFilter}`),
                fetch(`/api/admin/users?${sellerFilter}`),
                dbService.getFinanceSalespeople()
            ]);
            
            const pendingData = await pendingRes.json();
            const approvedData = await approvedRes.json();
            
            setPendingClients(pendingData);
            setApprovedClients(approvedData);
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

    const handleCreateSale = async () => {
        try {
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
                commission_value: saleForm.quantity_hired * (parseFloat(String(selectedClientForSale.comissao_vendedor || '0').replace(',', '.')) || 0)
            };

            const res = await dbService.saveFinanceSale(saleData);
            if (!res.error) {
                alert("Venda criada com sucesso!");
                setIsSaleModalOpen(false);
                loadClients();
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
        return matchesSearch && matchesSeller;
    });

    const uniqueSellers = Array.from(new Set([...pendingClients, ...approvedClients].map(c => c.seller_name).filter(Boolean))).sort();

    return (
        <div className="crm-container" style={{ minHeight: '100vh', padding: '32px' }}>
            <div className="crm-header-premium mb-8">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <Users size={12} /> CONFIGURAÇÃO DE CLIENTES E CRÉDITOS
                    </div>
                    <h1 className="crm-main-title">Gerenciamento de Clientes</h1>
                </div>
            </div>

            <div className="crm-card" style={{ padding: '8px', marginBottom: '32px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setActiveTab('PENDING')} 
                    className={`action-btn ${activeTab === 'PENDING' ? 'primary-btn' : 'ghost-btn'}`}
                    style={{ flex: 1, height: '54px' }}
                >
                    <Clock size={20} /> AGUARDANDO APROVAÇÃO ({pendingClients.length})
                </button>
                <button 
                    onClick={() => setActiveTab('APPROVED')} 
                    className={`action-btn ${activeTab === 'APPROVED' ? 'primary-btn' : 'ghost-btn'}`}
                    style={{ flex: 1, height: '54px' }}
                >
                    <CheckCircle2 size={20} /> CLIENTES ATIVOS ({approvedClients.length})
                </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={22} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                    <input 
                        className="field-input" 
                        placeholder="Buscar por nome, email ou telefone..." 
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
            </div>

            {isLoading ? (
                <div style={{ color: 'var(--text-muted)' }}>Carregando clientes...</div>
            ) : filteredList.length === 0 ? (
                <div className="crm-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                    Nenhum cliente encontrado.
                </div>
            ) : (
                <div className="card-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {filteredList.map(client => (
                        <div key={client.id} className="crm-card" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--surface-border-subtle)', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '340px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 950, color: 'white' }}>{client.name}</div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                    {client.email} <br />
                                    {client.whatsapp || client.phone || 'Sem telefone'}
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Créditos Disponíveis</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#acf800', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                            <Coins size={16} /> {client.disparo_quantidade || 0}
                                        </span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Preço Unitário</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', display: 'block', marginTop: '4px' }}>
                                            R$ {client.preco_vendido || '0.00'}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                    <span style={{ display: 'block' }}>Vendedor: <strong style={{ color: 'white' }}>{client.seller_name || 'Nenhum'}</strong></span>
                                    <span style={{ display: 'block' }}>Comissão: <strong style={{ color: 'white' }}>R$ {client.comissao_vendedor || '0.00'} / unidade</strong></span>
                                    <span style={{ display: 'block' }}>Plano: <strong style={{ color: 'white' }}>{client.pacote || 'Avulso'}</strong></span>
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    <button className="action-btn ghost-btn" onClick={() => openEditModal(client, 'COMMERCIAL')} style={{ padding: '8px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px', height: 'auto' }} title="Valores e Créditos">
                                        <Coins size={16} color="#acf800" /> Crédito
                                    </button>
                                    <button className="action-btn ghost-btn" onClick={() => openEditModal(client, 'BASIC')} style={{ padding: '8px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px', height: 'auto' }} title="Dados">
                                        <Edit size={16} color="#38bdf8" /> Dados
                                    </button>
                                    <button className="action-btn ghost-btn" onClick={() => openEditModal(client, 'PASSWORD')} style={{ padding: '8px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px', height: 'auto' }} title="Senha">
                                        <Key size={16} color="#f59e0b" /> Senha
                                    </button>
                                </div>

                                {activeTab === 'PENDING' ? (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button onClick={() => handleApprove(client)} className="action-btn primary-btn" style={{ flex: 1, fontSize: '11px', height: '40px' }}>
                                            APROVAR ACESSO
                                        </button>
                                        <button onClick={() => handleReject(client.id)} className="action-btn ghost-btn" style={{ width: '40px', padding: 0, color: '#ef4444', borderColor: '#ef4444' }} title="Rejeitar">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button 
                                            onClick={() => {
                                                setSelectedClientForSale(client);
                                                setSaleForm(prev => ({ ...prev, unit_value: parseFloat(client.preco_vendido) || 0.20 }));
                                                setIsSaleModalOpen(true);
                                            }} 
                                            className="action-btn ghost-btn" 
                                            style={{ flex: 1, fontSize: '11px', height: '40px', borderColor: '#acf800', color: '#acf800' }}
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
                                            style={{ flex: 1, fontSize: '11px', height: '40px', borderColor: '#38bdf8', color: '#38bdf8' }}
                                        >
                                            <LinkIcon size={14} /> VINCULAR CARD
                                        </button>
                                        <button onClick={() => handleReject(client.id)} className="action-btn ghost-btn" style={{ width: '40px', padding: 0, color: '#ef4444', borderColor: '#ef4444' }} title="Deletar permanentemente">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit / Configuration Modal */}
            {editModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '24px' }}>
                            {editMode === 'COMMERCIAL' ? 'Configuração Comercial (Venda/Créditos)' : editMode === 'BASIC' ? 'Dados Básicos' : 'Alterar Senha'}
                        </h2>
                        
                        <div className="flex-col gap-4">
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
                                    <div>
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
                                    <div>
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
                    <div className="crm-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 950 }}>Nova Venda Direta</h2>
                            <button onClick={() => setIsSaleModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Você está registrando uma nova venda de créditos para o cliente <strong style={{ color: 'white' }}>{selectedClientForSale?.name}</strong>.
                        </p>

                        <div className="flex-col gap-4">
                            <div>
                                <label className="field-label">Quantidade de Créditos (Hired)</label>
                                <input type="number" className="field-input" value={saleForm.quantity_hired} onChange={e => setSaleForm({...saleForm, quantity_hired: parseInt(e.target.value) || 0})} />
                            </div>
                            <div>
                                <label className="field-label">Preço Unitário (R$)</label>
                                <input className="field-input" value={saleForm.unit_value} onChange={e => setSaleForm({...saleForm, unit_value: parseFloat(e.target.value) || 0})} />
                            </div>
                            <div>
                                <label className="field-label">Valor Total</label>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-color)', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    R$ {(saleForm.quantity_hired * saleForm.unit_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
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
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button onClick={handleCreateSale} className="action-btn primary-btn" style={{ flex: 1, height: '48px' }}>GERAR VENDA</button>
                            <button onClick={() => setIsSaleModalOpen(false)} className="action-btn ghost-btn" style={{ flex: 1, height: '48px' }}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Card Modal */}
            {isCardModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 950 }}>Vincular Novo Card / Submissão</h2>
                            <button onClick={() => setIsCardModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Cria um card de campanha (submissão) no funil para o cliente <strong style={{ color: 'white' }}>{selectedClientForCard?.name}</strong>.
                        </p>

                        <div className="flex-col gap-4">
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
                            <div>
                                <label className="field-label">Texto / Cópia do Anúncio</label>
                                <textarea 
                                    className="field-input" 
                                    value={cardForm.ad_copy} 
                                    onChange={e => setCardForm({...cardForm, ad_copy: e.target.value})} 
                                    placeholder="Mensagem a disparar..."
                                    style={{ height: '80px', padding: '12px', resize: 'vertical' }}
                                />
                            </div>
                            <div>
                                <label className="field-label">Link do Botão</label>
                                <input className="field-input" value={cardForm.button_link} onChange={e => setCardForm({...cardForm, button_link: e.target.value})} placeholder="https://wa.me/..." />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button onClick={handleCreateCard} className="action-btn primary-btn" style={{ flex: 1, height: '48px' }}>CRIAR E VINCULAR CARD</button>
                            <button onClick={() => setIsCardModalOpen(false)} className="action-btn ghost-btn" style={{ flex: 1, height: '48px' }}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeClients;
