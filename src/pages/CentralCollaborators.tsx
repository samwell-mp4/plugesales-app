import React, { useState, useEffect } from 'react';
import { 
    Search, User, DollarSign, CreditCard, Clock, FileCheck, X, 
    Edit2, Save, ArrowLeftRight, Check, AlertTriangle, FileSpreadsheet
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import SupremeLoading from '../components/SupremeLoading';
import * as XLSX from 'xlsx';

const CentralCollaborators = () => {
    const { user } = useAuth();
    
    // States
    const [loading, setLoading] = useState(true);
    const [competence, setCompetence] = useState('');
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, COMPLETED, NO_PIX
    const [selectedCollab, setSelectedCollab] = useState<any | null>(null);
    const [collabRequests, setCollabRequests] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    
    // Hub Tab View
    const [activeHubTab, setActiveHubTab] = useState<'adiantamentos' | 'comissoes'>('adiantamentos');

    // Sales/Commissions data
    const [salesData, setSalesData] = useState<any[]>([]);
    const [commissionSearch, setCommissionSearch] = useState('');
    const [commissionClientFilter, setCommissionClientFilter] = useState('ALL');
    const [commissionStatusFilter, setCommissionStatusFilter] = useState('ALL');
    
    // Edit state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [tempReceivable, setTempReceivable] = useState('');
    const [tempPix, setTempPix] = useState('');

    // Generate Competence string e.g. "Agosto/2026"
    const getCurrentCompetence = () => {
        const date = new Date();
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${months[date.getMonth()]}/${date.getFullYear()}`;
    };

    useEffect(() => {
        setCompetence(getCurrentCompetence());
    }, []);

    useEffect(() => {
        if (competence) {
            loadData();
        }
    }, [competence]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [spreadData, reqData, salesRes] = await Promise.all([
                dbService.getCompetencesSpreadsheet(competence),
                dbService.getPendingRequests(),
                dbService.getFinanceSales({ role: 'ADMIN' })
            ]);
            setCollaborators(spreadData || []);
            setRequests(reqData || []);
            setSalesData(salesRes || []);
        } catch (error) {
            console.error('Error loading central collaborators data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format Currency
    const formatCurrency = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
    };

    // Export to Excel
    const handleExportExcel = () => {
        const data = filteredCollaborators.map(c => ({
            Colaborador: c.name,
            Email: c.email,
            Role: c.role || 'Colaborador',
            'Valor Mensal RH': parseFloat(c.monthly_receivable || 0),
            'Total Adiantado': parseFloat(c.total_advanced || 0),
            'Saldo a Receber': parseFloat(c.remaining_balance || 0),
            'Chave PIX': c.pix_key || '',
            'Status Nota Fiscal': c.nf_url ? 'Enviada' : 'Pendente'
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Financeiro ${competence.replace('/', '-')}`);
        XLSX.writeFile(workbook, `Central_Colaboradores_${competence.replace('/', '_')}.xlsx`);
    };

    // Inline edit triggers
    const startEditing = (collab: any) => {
        setEditingId(collab.user_id);
        setTempReceivable(collab.monthly_receivable.toString());
        setTempPix(collab.pix_key || '');
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveInlineEdit = async (userId: number) => {
        const parsedVal = parseFloat(tempReceivable);
        if (isNaN(parsedVal)) {
            alert('Por favor, informe um valor mensal válido.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await dbService.updateProfileReceivable({
                userId,
                monthlyReceivable: parsedVal,
                pixKey: tempPix
            });
            if (res.error) {
                alert(res.error);
            } else {
                setEditingId(null);
                loadData();
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Open detailed card modal
    const openCollabModal = (collab: any) => {
        setSelectedCollab(collab);
        // Filter requests related to this collaborator
        const filteredReqs = requests.filter(r => r.user_id === collab.user_id);
        setCollabRequests(filteredReqs);
    };

    const handleActionRequest = async (requestId: number, status: 'Aprovado' | 'Rejeitado', justification?: string) => {
        setSubmitting(true);
        try {
            const res = await dbService.respondRequest({
                requestId,
                status,
                justification
            });
            if (res.error) {
                alert(res.error);
            } else {
                alert(`Adiantamento ${status.toLowerCase()} com sucesso!`);
                // Reload data to reflect new balances
                const spreadData = await dbService.getCompetencesSpreadsheet(competence);
                const reqData = await dbService.getPendingRequests();
                setCollaborators(spreadData || []);
                setRequests(reqData || []);
                
                // Update active modal info
                const updatedCollab = spreadData.find((c: any) => c.user_id === selectedCollab.user_id);
                if (updatedCollab) setSelectedCollab(updatedCollab);
                setCollabRequests(reqData.filter((r: any) => r.user_id === selectedCollab.user_id));
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter logic
    const filteredCollaborators = collaborators.filter(c => {
        const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             c.email.toLowerCase().includes(searchQuery.toLowerCase());
                             
        let matchesStatus = true;
        if (statusFilter === 'PENDING') {
            // Has pending requests or pending NF
            const hasPendingReq = requests.some(r => r.user_id === c.user_id && r.status === 'Pendente');
            const hasPendingNf = !c.nf_url;
            matchesStatus = hasPendingReq || hasPendingNf;
        } else if (statusFilter === 'COMPLETED') {
            // All adiantamentos processed and NF uploaded
            const noPendingReq = !requests.some(r => r.user_id === c.user_id && r.status === 'Pendente');
            const nfUploaded = !!c.nf_url;
            matchesStatus = noPendingReq && nfUploaded;
        } else if (statusFilter === 'NO_PIX') {
            matchesStatus = !c.pix_key;
        }

        return matchesQuery && matchesStatus;
    });

    if (loading && collaborators.length === 0) {
        return <SupremeLoading />;
    }

    return (
        <div className="crm-container animate-fade-in" style={{ padding: '40px' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <span style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 'bold', letterSpacing: '1px' }}>FINANCEIRO CONTABILIDADE</span>
                    <h1 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1px' }}>Central de Colaboradores</h1>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {/* Competence Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>COMPETÊNCIA ATIVA</span>
                        <select 
                            value={competence} 
                            onChange={e => setCompetence(e.target.value)}
                            className="field-input"
                            style={{ height: '42px', minWidth: '160px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', fontSize: '13px' }}
                        >
                            {/* Generates past 6 months plus current and next */}
                            {Array.from({ length: 8 }).map((_, i) => {
                                const d = new Date();
                                d.setMonth(d.getMonth() - 5 + i);
                                const months = [
                                    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                                ];
                                const compStr = `${months[d.getMonth()]}/${d.getFullYear()}`;
                                return <option key={compStr} value={compStr}>{compStr}</option>;
                            })}
                        </select>
                    </div>

                    <button 
                        onClick={handleExportExcel}
                        className="action-btn secondary-btn"
                        style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 18px', marginTop: '16px' }}
                    >
                        <FileSpreadsheet size={16} /> Exportar Excel
                    </button>
                </div>
            </div>

            {/* HUB NAVIGATION TOGGLE */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <button 
                    onClick={() => setActiveHubTab('adiantamentos')} 
                    className={`action-btn ${activeHubTab === 'adiantamentos' ? 'primary-btn' : 'ghost-btn'}`}
                    style={{ height: '46px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold' }}
                >
                    Adiantamentos & Saldo
                </button>
                <button 
                    onClick={() => setActiveHubTab('comissoes')} 
                    className={`action-btn ${activeHubTab === 'comissoes' ? 'primary-btn' : 'ghost-btn'}`}
                    style={{ height: '46px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold' }}
                >
                    Comissões de Vendas
                </button>
            </div>

            {/* FILTERS */}
            {activeHubTab === 'adiantamentos' ? (
                <div className="crm-card" style={{ padding: '24px', marginBottom: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                        <div>
                            <label className="field-label" style={{ fontSize: '10px', marginBottom: '6px' }}>BUSCAR COLABORADOR</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                                <input 
                                    type="text"
                                    className="field-input"
                                    placeholder="Nome ou email..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '40px', height: '42px', fontSize: '13px' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="field-label" style={{ fontSize: '10px', marginBottom: '6px' }}>FILTRAR POR STATUS DE PENDÊNCIA</label>
                            <select 
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="field-input"
                                style={{ height: '42px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', fontSize: '13px' }}
                            >
                                <option value="ALL">Mostrar Todos</option>
                                <option value="PENDING">Pendências (Solicitação Pendente ou Sem NF)</option>
                                <option value="COMPLETED">Concluídos (NF ok e Sem Pendências)</option>
                                <option value="NO_PIX">Sem Chave PIX Cadastrada</option>
                            </select>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="crm-card" style={{ padding: '24px', marginBottom: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label className="field-label" style={{ fontSize: '10px', marginBottom: '6px' }}>BUSCAR VENDEDOR / CLIENTE</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                                <input 
                                    type="text"
                                    className="field-input"
                                    placeholder="Buscar..."
                                    value={commissionSearch}
                                    onChange={e => setCommissionSearch(e.target.value)}
                                    style={{ paddingLeft: '40px', height: '42px', fontSize: '13px' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="field-label" style={{ fontSize: '10px', marginBottom: '6px' }}>SELECIONAR CLIENTE</label>
                            <select 
                                value={commissionClientFilter}
                                onChange={e => setCommissionClientFilter(e.target.value)}
                                className="field-input"
                                style={{ height: '42px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', fontSize: '13px' }}
                            >
                                <option value="ALL">Todos os Clientes</option>
                                {Array.from(new Set(salesData.map(s => s.client_name).filter(Boolean))).map(client => (
                                    <option key={client} value={client}>{client}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="field-label" style={{ fontSize: '10px', marginBottom: '6px' }}>STATUS COMISSÃO</label>
                            <select 
                                value={commissionStatusFilter}
                                onChange={e => setCommissionStatusFilter(e.target.value)}
                                className="field-input"
                                style={{ height: '42px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', fontSize: '13px' }}
                            >
                                <option value="ALL">Todos os Status</option>
                                <option value="PREVISTA">PREVISTA</option>
                                <option value="PAGA">PAGA</option>
                                <option value="REJEITADA">REJEITADA</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {activeHubTab === 'adiantamentos' ? (
                /* LIST TABLE */
                <div className="crm-card" style={{ padding: '32px', overflow: 'visible' }}>
                    {filteredCollaborators.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                            Nenhum colaborador encontrado com os filtros aplicados.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                        <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>COLABORADOR</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>MENSAL RH</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>ADIANTADO</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>SALDO RESTANTE</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>CHAVE PIX</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>NF</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCollaborators.map(c => {
                                        const isEditing = editingId === c.user_id;
                                        const userPendingReqs = requests.filter(r => r.user_id === c.user_id && r.status === 'Pendente');
                                        
                                        return (
                                            <tr 
                                                key={c.user_id} 
                                                style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}
                                                className="hover-card"
                                            >
                                                <td style={{ padding: '16px 12px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{c.name}</span>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.email}</span>
                                                    </div>
                                                </td>

                                                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                                    {isEditing ? (
                                                        <input 
                                                            type="number"
                                                            className="field-input"
                                                            value={tempReceivable}
                                                            onChange={e => setTempReceivable(e.target.value)}
                                                            style={{ width: '100px', height: '32px', textAlign: 'right', display: 'inline-block' }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{formatCurrency(c.monthly_receivable)}</span>
                                                    )}
                                                </td>

                                                <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '13px', color: '#f59e0b' }}>
                                                    {formatCurrency(c.total_advanced)}
                                                </td>

                                                <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: '#3b82f6' }}>
                                                    {formatCurrency(c.remaining_balance)}
                                                </td>

                                                <td style={{ padding: '16px 12px', fontSize: '12px' }}>
                                                    {isEditing ? (
                                                        <input 
                                                            type="text"
                                                            className="field-input"
                                                            value={tempPix}
                                                            onChange={e => setTempPix(e.target.value)}
                                                            style={{ width: '150px', height: '32px' }}
                                                        />
                                                    ) : (
                                                        c.pix_key || <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Não cadastrado</span>
                                                    )}
                                                </td>

                                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                                    {c.nf_url ? (
                                                        <a 
                                                            href={c.nf_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            title={`Enviada em ${new Date(c.nf_uploaded_at).toLocaleDateString()}`}
                                                        >
                                                            <FileCheck size={18} color="#4ade80" />
                                                        </a>
                                                    ) : (
                                                        <span title="Nota fiscal pendente"><AlertTriangle size={18} color="#ef4444" /></span>
                                                    )}
                                                </td>

                                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        {isEditing ? (
                                                            <>
                                                                <button 
                                                                    onClick={() => saveInlineEdit(c.user_id)}
                                                                    className="action-btn primary-btn"
                                                                    style={{ padding: '6px 10px', height: '30px' }}
                                                                    disabled={submitting}
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                                <button 
                                                                    onClick={cancelEditing}
                                                                    className="action-btn secondary-btn"
                                                                    style={{ padding: '6px 10px', height: '30px' }}
                                                                    disabled={submitting}
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    onClick={() => startEditing(c)}
                                                                    className="action-btn secondary-btn"
                                                                    style={{ padding: '6px 10px', height: '30px' }}
                                                                    title="Editar dados financeiros"
                                                                >
                                                                    <Edit2 size={13} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => openCollabModal(c)}
                                                                    className="action-btn primary-btn"
                                                                    style={{ padding: '6px 12px', height: '30px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                >
                                                                    GERENCIAR 
                                                                    {userPendingReqs.length > 0 && (
                                                                        <span style={{ background: '#ef4444', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '9px', fontWeight: 'bold' }}>
                                                                            {userPendingReqs.length}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                /* COMISSÕES LIST TABLE */
                <div className="crm-card" style={{ padding: '32px', overflow: 'visible' }}>
                    {salesData.filter(sale => {
                        const nameMatch = (sale.salesperson_name || '').toLowerCase().includes(commissionSearch.toLowerCase()) || 
                                          (sale.client_name || '').toLowerCase().includes(commissionSearch.toLowerCase());
                        const clientMatch = commissionClientFilter === 'ALL' ? true : sale.client_name === commissionClientFilter;
                        const statusMatch = commissionStatusFilter === 'ALL' ? true : sale.commission_status === commissionStatusFilter;
                        return nameMatch && clientMatch && statusMatch;
                    }).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                            Nenhuma venda/comissão encontrada para os filtros aplicados.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                        <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>VENDEDOR / COLABORADOR</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>CLIENTE</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>CONTRATADOS</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>ENTREGUES</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>VALOR UNITÁRIO</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>VALOR TOTAL</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>COMISSÃO A RECEBER</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>STATUS</th>
                                        <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>AÇÃO RÁPIDA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData
                                        .filter(sale => {
                                            const nameMatch = (sale.salesperson_name || '').toLowerCase().includes(commissionSearch.toLowerCase()) || 
                                                              (sale.client_name || '').toLowerCase().includes(commissionSearch.toLowerCase());
                                            const clientMatch = commissionClientFilter === 'ALL' ? true : sale.client_name === commissionClientFilter;
                                            const statusMatch = commissionStatusFilter === 'ALL' ? true : sale.commission_status === commissionStatusFilter;
                                            return nameMatch && clientMatch && statusMatch;
                                        })
                                        .map(sale => (
                                            <tr key={sale.id} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }} className="hover-card">
                                                <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 'bold' }}>
                                                    {sale.salesperson_name || 'Vendedor Desconhecido'}
                                                </td>
                                                <td style={{ padding: '16px 12px', fontSize: '13px' }}>
                                                    {sale.client_name}
                                                </td>
                                                <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '13px' }}>
                                                    {parseInt(sale.quantity_hired).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '13px' }}>
                                                    {parseInt(sale.quantity_delivered || 0).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '13px' }}>
                                                    R$ {parseFloat(sale.unit_value).toFixed(2)}
                                                </td>
                                                <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>
                                                    R$ {parseFloat(sale.total_value).toFixed(2)}
                                                </td>
                                                <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                                    R$ {parseFloat(sale.commission_value || 0).toFixed(2)}
                                                </td>
                                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                                    <span className="status-badge-premium" style={{
                                                        '--bg': sale.commission_status === 'PAGA' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                                        '--color': sale.commission_status === 'PAGA' ? '#4ade80' : '#f59e0b',
                                                        '--border': sale.commission_status === 'PAGA' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                                                    } as any}>
                                                        {sale.commission_status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                                    <button 
                                                        onClick={async () => {
                                                            const newStatus = sale.commission_status === 'PAGA' ? 'PREVISTA' : 'PAGA';
                                                            setSubmitting(true);
                                                            try {
                                                                await dbService.saveFinanceSale({ id: sale.id, commission_status: newStatus });
                                                                loadData();
                                                            } catch (err: any) {
                                                                alert(err.message);
                                                            } finally {
                                                                setSubmitting(false);
                                                            }
                                                        }}
                                                        className="action-btn secondary-btn"
                                                        style={{ padding: '6px 12px', fontSize: '11px', height: 'auto' }}
                                                        disabled={submitting}
                                                    >
                                                        {sale.commission_status === 'PAGA' ? 'MARCAR PREVISTA' : 'MARCAR PAGA'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* COLLABORATOR MANAGEMENT / COMANDA MODAL */}
            {selectedCollab && (
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
                    <div className="crm-card animate-slide-in" style={{ padding: '40px', maxWidth: '680px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>GESTOR FINANCEIRO</span>
                                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.6rem', fontWeight: 950 }}>{selectedCollab.name}</h3>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedCollab.email}</span>
                            </div>
                            <button onClick={() => setSelectedCollab(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Financial Overview Card */}
                        <div style={{ 
                            background: 'rgba(255,255,255,0.01)', 
                            border: '1px solid var(--surface-border-subtle)', 
                            borderRadius: '24px', 
                            padding: '24px', 
                            marginBottom: '28px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '16px'
                        }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Mensal RH</span>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-primary)' }}>{formatCurrency(selectedCollab.monthly_receivable)}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Total Adiantado</span>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#f59e0b' }}>{formatCurrency(selectedCollab.total_advanced)}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Saldo Restante</span>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#3b82f6' }}>{formatCurrency(selectedCollab.remaining_balance)}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Nota Fiscal</span>
                                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                    {selectedCollab.nf_url ? (
                                        <a href={selectedCollab.nf_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Enviada <FileCheck size={14} />
                                        </a>
                                    ) : (
                                        <span style={{ color: '#ef4444' }}>Pendente</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Requests History List */}
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 900 }}>Histórico de Adiantamentos</h4>
                        
                        {collabRequests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                Nenhuma solicitação registrada nesta competência.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                {collabRequests.map(req => (
                                    <div 
                                        key={req.id} 
                                        style={{ 
                                            background: 'rgba(255,255,255,0.01)', 
                                            border: '1px solid var(--surface-border-subtle)', 
                                            borderRadius: '16px', 
                                            padding: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '16px'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--primary-color)' }}>{formatCurrency(req.value)}</span>
                                                <span className="status-badge-premium" style={{
                                                    '--bg': req.status === 'Aprovado' ? 'rgba(74, 222, 128, 0.05)' : req.status === 'Rejeitado' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                                    '--color': req.status === 'Aprovado' ? '#4ade80' : req.status === 'Rejeitado' ? '#ef4444' : '#f59e0b',
                                                    '--border': req.status === 'Aprovado' ? 'rgba(74, 222, 128, 0.2)' : req.status === 'Rejeitado' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                                                } as any}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                PIX: {req.pix_key} • Solicitado em: {new Date(req.created_at).toLocaleDateString()}
                                            </div>
                                            {req.status === 'Rejeitado' && req.justification && (
                                                <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px' }}>
                                                    <strong>Motivo:</strong> {req.justification}
                                                </div>
                                            )}
                                        </div>

                                        {req.status === 'Pendente' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    onClick={() => handleActionRequest(req.id, 'Aprovado')}
                                                    className="action-btn primary-btn"
                                                    style={{ padding: '6px 12px', fontSize: '11px', height: 'auto' }}
                                                    disabled={submitting}
                                                >
                                                    APROVAR
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const just = prompt('Digite a justificativa da rejeição:');
                                                        if (just) handleActionRequest(req.id, 'Rejeitado', just);
                                                    }}
                                                    className="action-btn danger-btn"
                                                    style={{ padding: '6px 12px', fontSize: '11px', height: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                                    disabled={submitting}
                                                >
                                                    REJEITAR
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CentralCollaborators;
