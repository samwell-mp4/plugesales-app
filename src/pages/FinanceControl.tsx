import React, { useState, useEffect } from 'react';
import { 
    Activity, Filter, Search, Download, 
    CheckCircle2, XCircle, AlertCircle, 
    Calendar, DollarSign, RefreshCw, 
    ChevronLeft, ChevronRight, MoreHorizontal, X, Edit, Users, Briefcase
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

const FinanceControl = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('TODOS');
    const [filterCompetence, setFilterCompetence] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'LANCAMENTOS' | 'CLIENTES'>('LANCAMENTOS');

    // Paginação
    const [salesPage, setSalesPage] = useState(1);
    const [clientsPage, setClientsPage] = useState(1);

    const [editingSale, setEditingSale] = useState<any>(null);
    const [editingClient, setEditingClient] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'LANCAMENTOS') {
                const data = await dbService.getFinanceSales();
                setSales(data);
            } else {
                const data = await dbService.getClients();
                setClients(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updatePaymentStatus = async (id: number, status: string) => {
        try {
            await dbService.saveFinanceSale({ id, payment_status: status });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveSale = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const unitVal = parseFloat(String(editingSale.unit_value || '0').replace(',', '.'));
            const qty = parseFloat(editingSale.quantity_hired || 0);
            const totalValue = qty * unitVal;
            
            await dbService.saveFinanceSale({
                id: editingSale.id,
                unit_value: editingSale.unit_value,
                comissao_vendedor: editingSale.comissao_vendedor,
                total_value: totalValue,
                salesperson_name: editingSale.salesperson_name
            });
            setEditingSale(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveClientCommercial = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(`/api/users/${editingClient.id}/commercial`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pacote: editingClient.pacote,
                    preco_vendido: editingClient.preco_vendido,
                    comissao_vendedor: editingClient.comissao_vendedor,
                    seller_name: editingClient.seller_name
                })
            });
            setEditingClient(null);
            fetchData();
            alert("Configuração comercial do cliente atualizada com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar cliente.");
        }
    };

    const filteredSales = sales.filter(s => {
        const matchesStatus = filterStatus === 'TODOS' || s.payment_status === filterStatus;
        const matchesCompetence = !filterCompetence || s.payment_competence === filterCompetence;
        const matchesSearch = (s.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (s.client_cpf_cnpj || '').includes(searchTerm);
        return matchesStatus && matchesCompetence && matchesSearch;
    });

    const filteredClients = clients.filter(c => 
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || '').includes(searchTerm)
    );

    const salesLimit = 10;
    const totalSalesPages = Math.ceil(filteredSales.length / salesLimit);
    const slicedSales = filteredSales.slice((salesPage - 1) * salesLimit, salesPage * salesLimit);

    const clientsLimit = 10;
    const totalClientsPages = Math.ceil(filteredClients.length / clientsLimit);
    const slicedClients = filteredClients.slice((clientsPage - 1) * clientsLimit, clientsPage * clientsLimit);

    const totalFiltered = filteredSales.reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);
    const totalReceived = filteredSales.filter(s => s.payment_status === 'RECEBIDO').reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);
    const totalPending = filteredSales.filter(s => s.payment_status === 'PENDENTE').reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);
    const totalOverdue = filteredSales.filter(s => s.payment_status === 'INADIMPLENTE').reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);

    return (
        <div className="animate-fade-in finance-page" style={{ padding: '40px', paddingBottom: '80px' }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                
                .stats-grid-control { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 16px; 
                    margin-top: 32px; 
                    margin-bottom: 32px;
                }
                
                .glass-card-control {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 20px;
                    padding: 20px;
                    backdrop-filter: blur(20px);
                }

                .filter-bar-finance {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 12px 24px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                }

                .table-container-finance {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    overflow: hidden;
                    backdrop-filter: blur(20px);
                }
                
                table { width: 100%; border-collapse: collapse; }
                th { 
                    padding: 18px 24px; 
                    background: rgba(255,255,255,0.02); 
                    color: var(--text-muted); 
                    font-size: 0.75rem; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 1px;
                    text-align: left;
                }
                td { padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }

                .premium-input-finance {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    color: white;
                    font-weight: 800;
                    font-size: 0.8rem;
                    padding: 8px 12px;
                    outline: none;
                }

                .supreme-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 15px; }
                .supreme-modal-content { background: #0f172a; border: 1px solid var(--surface-border-subtle); border-radius: 32px; width: 100%; max-width: 500px; padding: 40px; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
                .field-label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 8px; letter-spacing: 1px; }
                .input-field { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid var(--surface-border-subtle); border-radius: 14px; padding: 14px 16px; color: white; font-weight: 700; outline: none; transition: all 0.2s; margin-bottom: 20px; }
                .input-field:focus { border-color: var(--primary-color); background: rgba(172,248,0,0.03); }
                .save-btn { width: 100%; background: var(--primary-color); color: #000; border: none; border-radius: 14px; padding: 16px; font-weight: 900; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
                .save-btn:hover { background: #9be300; transform: translateY(-2px); box-shadow: 0 10px 20px -10px var(--primary-color); }
            `}</style>

            <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h1>Controle Financeiro</h1>
                    <p className="subtitle">Fluxo de caixa, comissões e liquidação de recebíveis</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-14 px-4">
                        <Search size={16} color="var(--primary-color)" />
                        <input 
                            placeholder={activeTab === 'LANCAMENTOS' ? "Buscar lançamento..." : "Buscar cliente..."}
                            className="bg-transparent border-none outline-none py-3 text-white font-bold text-xs w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={fetchData} 
                        disabled={isLoading}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', color: 'white', cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
                <button 
                    onClick={() => setActiveTab('LANCAMENTOS')}
                    style={{ background: activeTab === 'LANCAMENTOS' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'LANCAMENTOS' ? '#000' : 'var(--text-secondary)', padding: '10px 20px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 900, border: activeTab === 'LANCAMENTOS' ? 'none' : '1px solid var(--surface-border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    <Briefcase size={16} /> LANÇAMENTOS
                </button>
                <button 
                    onClick={() => setActiveTab('CLIENTES')}
                    style={{ background: activeTab === 'CLIENTES' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'CLIENTES' ? '#000' : 'var(--text-secondary)', padding: '10px 20px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 900, border: activeTab === 'CLIENTES' ? 'none' : '1px solid var(--surface-border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    <Users size={16} /> CONFIGS DE CLIENTES
                </button>
            </div>

            {activeTab === 'LANCAMENTOS' && (
                <>
                    <div className="stats-grid-control">
                        {[
                            { label: 'FILTRADO', value: totalFiltered, color: 'var(--primary-color)', icon: <DollarSign size={20} /> },
                            { label: 'LIQUIDADO', value: totalReceived, color: '#10b981', icon: <CheckCircle2 size={20} /> },
                            { label: 'PENDENTE', value: totalPending, color: '#facc15', icon: <AlertCircle size={20} /> },
                            { label: 'ATRASADO', value: totalOverdue, color: '#ef4444', icon: <XCircle size={20} /> },
                        ].map((s, i) => (
                            <div key={i} className="glass-card-control" style={{ borderLeft: `4px solid ${s.color}` }}>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px' }}>{s.label}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'white' }}>R$ {s.value.toLocaleString('pt-BR')}</h2>
                                    <div style={{ color: s.color, opacity: 0.3 }}>{s.icon}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="filter-bar-finance">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Filter size={14} color="var(--primary-color)" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filtros</span>
                            </div>
                            <select 
                                className="premium-input-finance" 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ width: '180px' }}
                            >
                                <option value="TODOS" style={{ background: '#0a0f18' }}>Todos os Status</option>
                                <option value="PENDENTE" style={{ background: '#0a0f18' }}>Pendente</option>
                                <option value="RECEBIDO" style={{ background: '#0a0f18' }}>Recebido</option>
                                <option value="INADIMPLENTE" style={{ background: '#0a0f18' }}>Inadimplente</option>
                            </select>
                            <input 
                                type="month"
                                className="premium-input-finance"
                                value={filterCompetence}
                                onChange={(e) => setFilterCompetence(e.target.value)}
                            />
                        </div>
                        <button 
                            className="ml-auto" 
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                            onClick={() => { setFilterStatus('TODOS'); setFilterCompetence(''); setSearchTerm(''); }}
                        >
                            LIMPAR FILTROS
                        </button>
                    </div>

                    <div className="table-container-finance">
                        <table>
                            <thead>
                                <tr>
                                    <th>COMPETÊNCIA</th>
                                    <th>CLIENTE</th>
                                    <th>DETALHES</th>
                                    <th>VALOR</th>
                                    <th>SITUAÇÃO</th>
                                    <th style={{ textAlign: 'right' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px' }}><RefreshCw className="animate-spin mx-auto text-primary-color" /></td></tr>
                                ) : slicedSales.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.8rem' }}>NENHUM LANÇAMENTO</td></tr>
                                ) : slicedSales.map((sale) => {
                                    const comisVendedor = parseFloat(String(sale.comissao_vendedor || '0').replace(',', '.'));
                                    const valComissao = (sale.quantity_hired || 0) * comisVendedor;
                                    return (
                                    <tr key={sale.id}>
                                        <td style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{sale.payment_competence}</td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span style={{ fontWeight: 900, color: 'white', fontSize: '0.9rem' }}>{sale.client_name}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{sale.client_cpf_cnpj || '---'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PACOTE: <span style={{ color: 'white' }}>{sale.package_hired}</span></span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>VENDEDOR: <span style={{ color: 'white' }}>{sale.salesperson_name || '---'}</span></span>
                                                {comisVendedor > 0 && <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800 }}>COMISSÃO: R$ {valComissao.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span style={{ fontWeight: 900, color: 'white' }}>R$ {parseFloat(sale.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 800 }}>{sale.quantity_hired} UN</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sale.payment_status === 'RECEBIDO' ? '#10b981' : sale.payment_status === 'PENDENTE' ? '#facc15' : '#ef4444' }}></div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: sale.payment_status === 'RECEBIDO' ? '#10b981' : sale.payment_status === 'PENDENTE' ? '#facc15' : '#ef4444' }}>{sale.payment_status}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => setEditingSale(sale)}
                                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                                                    title="Editar Valores"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => updatePaymentStatus(sale.id, 'RECEBIDO')}
                                                    style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                                                >
                                                    LIQUIDAR
                                                </button>
                                                <button 
                                                    onClick={() => updatePaymentStatus(sale.id, 'INADIMPLENTE')}
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                                                >
                                                    ATRASO
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'CLIENTES' && (
                <div className="table-container-finance">
                    <table>
                        <thead>
                            <tr>
                                <th>CLIENTE</th>
                                <th>PACOTE</th>
                                <th>PREÇO VENDIDO</th>
                                <th>COMISSÃO</th>
                                <th>VENDEDOR</th>
                                <th style={{ textAlign: 'right' }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px' }}><RefreshCw className="animate-spin mx-auto text-primary-color" /></td></tr>
                            ) : slicedClients.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.8rem' }}>NENHUM CLIENTE ENCONTRADO</td></tr>
                            ) : slicedClients.map((client) => (
                                <tr key={client.id}>
                                    <td>
                                        <div className="flex flex-col">
                                            <span style={{ fontWeight: 900, color: 'white', fontSize: '0.9rem' }}>{client.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{client.phone || client.email}</span>
                                        </div>
                                    </td>
                                    <td><span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{client.pacote || '---'}</span></td>
                                    <td><span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)' }}>{client.preco_vendido || '---'}</span></td>
                                    <td><span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>{client.comissao_vendedor || '---'}</span></td>
                                    <td><span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>{client.seller_name || '---'}</span></td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button 
                                            onClick={() => setEditingClient(client)}
                                            style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <Edit size={14} /> EDITAR
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Edição de Lançamento */}
            {editingSale && (
                <div className="supreme-modal-overlay" onClick={() => setEditingSale(null)}>
                    <div className="supreme-modal-content" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setEditingSale(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                        
                        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>
                            Editar Lançamento
                        </h2>
                        
                        <form onSubmit={handleSaveSale}>
                            <label className="field-label">NOME DO VENDEDOR</label>
                            <input 
                                className="input-field"
                                value={editingSale.salesperson_name || ''}
                                onChange={e => setEditingSale({ ...editingSale, salesperson_name: e.target.value })}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="field-label">PREÇO VENDIDO (R$)</label>
                                    <input 
                                        className="input-field"
                                        value={editingSale.unit_value || ''}
                                        onChange={e => setEditingSale({ ...editingSale, unit_value: e.target.value })}
                                        placeholder="Ex: 0.35"
                                    />
                                </div>
                                <div>
                                    <label className="field-label">COMISSÃO (R$)</label>
                                    <input 
                                        className="input-field"
                                        value={editingSale.comissao_vendedor || ''}
                                        onChange={e => setEditingSale({ ...editingSale, comissao_vendedor: e.target.value })}
                                        placeholder="Ex: 0.04"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="field-label">ENTREGUES (QTD)</label>
                                    <input 
                                        className="input-field"
                                        type="number"
                                        value={editingSale.quantity_hired || ''}
                                        onChange={e => setEditingSale({ ...editingSale, quantity_hired: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="save-btn" style={{ marginTop: '10px' }}>
                                SALVAR LANÇAMENTO
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Edição de Cliente */}
            {editingClient && (
                <div className="supreme-modal-overlay" onClick={() => setEditingClient(null)}>
                    <div className="supreme-modal-content" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setEditingClient(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                        
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>
                            Configuração Comercial
                        </h2>
                        <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{editingClient.name}</p>
                        
                        <form onSubmit={handleSaveClientCommercial}>
                            <label className="field-label">PACOTE</label>
                            <input 
                                className="input-field"
                                value={editingClient.pacote || ''}
                                onChange={e => setEditingClient({ ...editingClient, pacote: e.target.value })}
                                placeholder="Ex: AVULSO"
                            />

                            <label className="field-label">VENDEDOR PADRÃO</label>
                            <input 
                                className="input-field"
                                value={editingClient.seller_name || ''}
                                onChange={e => setEditingClient({ ...editingClient, seller_name: e.target.value })}
                                placeholder="Nome do vendedor"
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="field-label">PREÇO VENDIDO (R$)</label>
                                    <input 
                                        className="input-field"
                                        value={editingClient.preco_vendido || ''}
                                        onChange={e => setEditingClient({ ...editingClient, preco_vendido: e.target.value })}
                                        placeholder="Ex: 0.35"
                                    />
                                </div>
                                <div>
                                    <label className="field-label">COMISSÃO (R$)</label>
                                    <input 
                                        className="input-field"
                                        value={editingClient.comissao_vendedor || ''}
                                        onChange={e => setEditingClient({ ...editingClient, comissao_vendedor: e.target.value })}
                                        placeholder="Ex: 0.04"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="save-btn" style={{ marginTop: '10px' }}>
                                SALVAR CONFIGURAÇÕES
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceControl;
