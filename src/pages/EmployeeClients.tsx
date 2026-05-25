import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Clock, CheckCircle2, ShieldCheck, Edit, Trash2, Key, Search, DollarSign } from 'lucide-react';
import { dbService } from '../services/dbService';

const EmployeeClients = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED'>('PENDING');
    const [pendingClients, setPendingClients] = useState<any[]>([]);
    const [approvedClients, setApprovedClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [editingClient, setEditingClient] = useState<any>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editMode, setEditMode] = useState<'COMMERCIAL' | 'BASIC' | 'PASSWORD'>('COMMERCIAL');

    const [editForm, setEditForm] = useState({
        pacote: '', preco_vendido: '', comissao_vendedor: '',
        name: '', email: '', phone: '', document_number: '', whatsapp: '',
        password: ''
    });

    const loadClients = async () => {
        setIsLoading(true);
        try {
            const [pendingRes, approvedRes] = await Promise.all([
                fetch(`/api/users/pending?seller_name=${encodeURIComponent(user?.name || '')}`),
                fetch(`/api/admin/users?seller_name=${encodeURIComponent(user?.name || '')}`)
            ]);
            
            const pendingData = await pendingRes.json();
            const approvedData = await approvedRes.json();
            
            setPendingClients(pendingData);
            setApprovedClients(approvedData);
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
                    seller_name: user?.name || '',
                    pacote: client.pacote || 'Avulso',
                    preco_vendido: client.preco_vendido || '0',
                    comissao_vendedor: client.comissao_vendedor || '0'
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
        if(!window.confirm("Deseja realmente rejeitar e excluir este cliente?")) return;
        try {
            const res = await fetch(`/api/users/${id}/reject`, { method: 'POST' });
            if (res.ok) {
                alert("Cliente rejeitado/excluído.");
                loadClients();
            }
        } catch (err) { alert("Erro ao rejeitar."); }
    };

    const handleDeleteUser = async (id: number) => {
        if(!window.confirm("Deseja excluir permanentemente este cliente ativo?")) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' }); // Using generic delete
            // Fallback to rejection endpoint if generic doesn't exist? Wait, we need to create it in server.js or it exists.
            if(res.ok) {
                alert("Cliente excluído com sucesso.");
                loadClients();
            } else {
                alert("Erro ao excluir cliente ativo. Pode ser necessário privilégio de Admin.");
            }
        } catch(err) {
            alert("Erro de conexão.");
        }
    }

    const openEditModal = (client: any, mode: 'COMMERCIAL' | 'BASIC' | 'PASSWORD') => {
        setEditingClient(client);
        setEditMode(mode);
        setEditForm({
            pacote: client.pacote || '',
            preco_vendido: client.preco_vendido || '',
            comissao_vendedor: client.comissao_vendedor || '',
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            document_number: client.document_number || '',
            whatsapp: client.whatsapp || '',
            password: ''
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
                        seller_name: user?.name
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

    const currentList = activeTab === 'PENDING' ? pendingClients : approvedClients;
    const filteredList = currentList.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="crm-container" style={{ minHeight: '100vh', padding: '32px' }}>
            <div className="crm-header-premium mb-8">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <Users size={12} /> MEUS CLIENTES
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

            <div style={{ position: 'relative', marginBottom: '32px' }}>
                <Search size={22} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                <input 
                    className="field-input" 
                    placeholder="Buscar cliente por nome ou email..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ height: '70px', paddingLeft: '70px', fontSize: '1.1rem' }}
                />
            </div>

            {isLoading ? (
                <div style={{ color: 'var(--text-muted)' }}>Carregando clientes...</div>
            ) : filteredList.length === 0 ? (
                <div className="crm-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                    Nenhum cliente encontrado.
                </div>
            ) : (
                <div className="card-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {filteredList.map(client => (
                        <div key={client.id} className="crm-card" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--surface-border-subtle)', padding: '24px', position: 'relative' }}>
                            <div className="flex-col gap-2 mb-4">
                                <div style={{ fontSize: '1.25rem', fontWeight: 950, color: 'white' }}>{client.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{client.email} | {client.whatsapp || client.phone}</div>
                                {activeTab === 'APPROVED' && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                        <span className="status-badge-premium" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontSize: '10px', padding: '4px 10px' }}>
                                            {client.pacote || 'Avulso'}
                                        </span>
                                        <span className="status-badge-premium" style={{ background: 'rgba(172, 248, 0, 0.1)', color: '#acf800', fontSize: '10px', padding: '4px 10px' }}>
                                            R$ {client.preco_vendido || '0'} / Und
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: activeTab === 'PENDING' ? '16px' : '0' }}>
                                <button className="action-btn ghost-btn" onClick={() => openEditModal(client, 'COMMERCIAL')} style={{ padding: '8px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px', height: 'auto' }} title="Valores">
                                    <DollarSign size={16} color="#acf800" /> Venda
                                </button>
                                <button className="action-btn ghost-btn" onClick={() => openEditModal(client, 'BASIC')} style={{ padding: '8px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px', height: 'auto' }} title="Dados">
                                    <Edit size={16} color="#38bdf8" /> Dados
                                </button>
                                <button className="action-btn ghost-btn" onClick={() => openEditModal(client, 'PASSWORD')} style={{ padding: '8px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px', height: 'auto' }} title="Senha">
                                    <Key size={16} color="#f59e0b" /> Senha
                                </button>
                            </div>

                            {activeTab === 'PENDING' && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                    <button onClick={() => handleApprove(client)} className="action-btn primary-btn" style={{ flex: 1, fontSize: '11px', height: '40px' }}>
                                        APROVAR ACESSO
                                    </button>
                                    <button onClick={() => handleReject(client.id)} className="action-btn ghost-btn" style={{ width: '40px', padding: 0, color: '#ef4444', borderColor: '#ef4444' }} title="Rejeitar">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                            
                            {activeTab === 'APPROVED' && (
                                <button onClick={() => handleReject(client.id)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.5 }}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {editModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '24px' }}>
                            {editMode === 'COMMERCIAL' ? 'Dados Comerciais (Venda)' : editMode === 'BASIC' ? 'Dados Básicos' : 'Alterar Senha'}
                        </h2>
                        
                        <div className="flex-col gap-4">
                            {editMode === 'COMMERCIAL' && (
                                <>
                                    <div>
                                        <label className="field-label">Pacote / Plano</label>
                                        <input className="field-input" value={editForm.pacote} onChange={e => setEditForm({...editForm, pacote: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="field-label">Preço Vendido (Unitário)</label>
                                        <input className="field-input" value={editForm.preco_vendido} onChange={e => setEditForm({...editForm, preco_vendido: e.target.value})} placeholder="Ex: 0.15" />
                                    </div>
                                    <div>
                                        <label className="field-label">Comissão do Vendedor</label>
                                        <input className="field-input" value={editForm.comissao_vendedor} onChange={e => setEditForm({...editForm, comissao_vendedor: e.target.value})} placeholder="Ex: 0.05" />
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
        </div>
    );
};

export default EmployeeClients;
