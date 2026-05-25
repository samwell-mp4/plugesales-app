import React, { useState, useEffect, useRef } from 'react';
import {
    Zap, Search, Plus, Edit2, Trash2,
    Download, Filter, ChevronLeft, ChevronRight,
    User, Smartphone, Package, DollarSign,
    Calendar as CalendarIcon, CheckCircle2, TrendingUp,
    AlertCircle, RefreshCw, X, ArrowUpRight, Upload, ExternalLink,
    CheckSquare, MessageCircle
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';

const FinanceSales = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [salespeople, setSalespeople] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('TODOS');
    const [filterSalesperson, setFilterSalesperson] = useState('TODOS');
    const [filterClient, setFilterClient] = useState('TODOS');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const [selectedSales, setSelectedSales] = useState<number[]>([]);
    const [isMassActionModalOpen, setIsMassActionModalOpen] = useState(false);
    const [massActionType, setMassActionType] = useState('');
    const [massActionValue, setMassActionValue] = useState('');

    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [whatsAppSaleContext, setWhatsAppSaleContext] = useState<any>(null);
    const [whatsAppMessage, setWhatsAppMessage] = useState('');
    const [whatsAppTemplateType, setWhatsAppTemplateType] = useState('manual');

    const [editingSale, setEditingSale] = useState<any>(null);
    const [uploadingReceipt, setUploadingReceipt] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [saleIdToUpload, setSaleIdToUpload] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        client_name: '',
        client_cpf_cnpj: '',
        client_contact: '',
        package_hired: '',
        quantity_hired: 0,
        unit_value: 0,
        total_value: 0,
        sale_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        salesperson_id: user?.id || '',
        payment_status: 'PENDENTE',
        payment_competence: new Date().toISOString().slice(0, 7),
        commission_status: 'PREVISTA',
        commission_value: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [salesData, peopleData] = await Promise.all([
                dbService.getFinanceSales({ userId: user?.id, role: user?.role }),
                dbService.getFinanceSalespeople()
            ]);
            setSales(salesData);
            setSalespeople(peopleData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'quantity_hired' || name === 'unit_value') {
                const qty = name === 'quantity_hired' ? parseInt(value) || 0 : prev.quantity_hired;
                const unit = name === 'unit_value' ? parseFloat(value) || 0 : prev.unit_value;
                newData.total_value = qty * unit;
                const sp = salespeople.find(s => String(s.id) === String(newData.salesperson_id));
                if (sp) newData.commission_value = (newData.total_value * (sp.commission_percentage || 0)) / 100;
            }
            if (name === 'salesperson_id') {
                const sp = salespeople.find(s => String(s.id) === String(value));
                if (sp) newData.commission_value = (newData.total_value * (sp.commission_percentage || 0)) / 100;
            }
            return newData;
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await dbService.saveFinanceSale({ ...formData, id: editingSale?.id });
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (sale: any) => {
        setEditingSale(sale);
        setFormData({
            client_name: sale.client_name,
            client_cpf_cnpj: sale.client_cpf_cnpj || '',
            client_contact: sale.client_contact || '',
            package_hired: sale.package_hired || '',
            quantity_hired: sale.quantity_hired || 0,
            unit_value: sale.unit_value || 0,
            total_value: sale.total_value || 0,
            sale_date: sale.sale_date ? sale.sale_date.slice(0, 16) : '',
            salesperson_id: sale.salesperson_id || '',
            payment_status: sale.payment_status || 'PENDENTE',
            payment_competence: sale.payment_competence || '',
            commission_status: sale.commission_status || 'PREVISTA',
            commission_value: sale.commission_value || 0
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Deseja realmente excluir esta venda?")) return;
        try {
            await dbService.deleteFinanceSale(id);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            client_name: '',
            client_cpf_cnpj: '',
            client_contact: '',
            package_hired: '',
            quantity_hired: 0,
            unit_value: 0,
            total_value: 0,
            sale_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
            salesperson_id: user?.id || '',
            payment_status: 'PENDENTE',
            payment_competence: new Date().toISOString().slice(0, 7),
            commission_status: 'PREVISTA',
            commission_value: 0
        });
    };

    const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !saleIdToUpload) return;

        setUploadingReceipt(saleIdToUpload);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();
            const hostedUrl = uploadData.url || `${window.location.origin}${uploadData.path}`;

            await dbService.saveFinanceSale({ id: saleIdToUpload, payment_receipt_url: hostedUrl, payment_status: 'RECEBIDO' });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Erro ao fazer upload do comprovante.");
        } finally {
            setUploadingReceipt(null);
            setSaleIdToUpload(null);
        }
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredSales);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Lançamentos");
        XLSX.writeFile(wb, `vendas_plug_sales_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredSales = sales.filter(s => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            (s.client_name || '').toLowerCase().includes(term) ||
            (s.campaign_name || '').toLowerCase().includes(term) ||
            (s.salesperson_name || '').toLowerCase().includes(term);

        const matchesStatus = filterStatus === 'TODOS' || s.payment_status === filterStatus;
        const matchesSalesperson = filterSalesperson === 'TODOS' || String(s.salesperson_id) === filterSalesperson;
        const matchesClient = filterClient === 'TODOS' || s.client_name === filterClient;

        const saleDateObj = s.sale_date ? new Date(s.sale_date) : null;
        let matchesDate = true;
        if (saleDateObj) {
            if (filterStartDate) {
                matchesDate = matchesDate && saleDateObj >= new Date(filterStartDate);
            }
            if (filterEndDate) {
                matchesDate = matchesDate && saleDateObj <= new Date(filterEndDate);
            }
        }

        return matchesSearch && matchesStatus && matchesSalesperson && matchesClient && matchesDate;
    });

    // Extract unique clients for filter dropdown
    const uniqueClients = Array.from(new Set(sales.map(s => s.client_name).filter(Boolean))).sort();

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedSales(filteredSales.map(s => s.id));
        } else {
            setSelectedSales([]);
        }
    };

    const handleSelectSale = (id: number) => {
        setSelectedSales(prev => 
            prev.includes(id) ? prev.filter(saleId => saleId !== id) : [...prev, id]
        );
    };

    const executeMassAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSales.length === 0) return;
        
        setIsSaving(true);
        try {
            if (massActionType === 'delete') {
                if (window.confirm(`Deseja realmente excluir ${selectedSales.length} registros?`)) {
                    for (const id of selectedSales) {
                        await dbService.deleteFinanceSale(id);
                    }
                }
            } else {
                for (const id of selectedSales) {
                    const sale = sales.find(s => s.id === id);
                    if (!sale) continue;
                    
                    const updateData: any = { id };
                    
                    if (massActionType === 'salesperson') {
                        updateData.salesperson_id = massActionValue;
                        const sp = salespeople.find(s => String(s.id) === String(massActionValue));
                        if (sp) updateData.commission_value = ((sale.total_value || 0) * (sp.commission_percentage || 0)) / 100;
                    } else if (massActionType === 'unit_value') {
                        updateData.unit_value = parseFloat(massActionValue);
                        updateData.total_value = updateData.unit_value * (sale.quantity_hired || 0);
                        const sp = salespeople.find(s => String(s.id) === String(sale.salesperson_id));
                        if (sp) updateData.commission_value = (updateData.total_value * (sp.commission_percentage || 0)) / 100;
                    } else if (massActionType === 'payment_status') {
                        updateData.payment_status = massActionValue;
                    } else if (massActionType === 'client_name') {
                        updateData.client_name = massActionValue;
                    }

                    await dbService.saveFinanceSale(updateData);
                }
            }
            setSelectedSales([]);
            setIsMassActionModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const openWhatsAppModal = (sale: any) => {
        setWhatsAppSaleContext(sale);
        setWhatsAppTemplateType('manual');
        setWhatsAppMessage('');
        setIsWhatsAppModalOpen(true);
    };

    const handleWhatsAppTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        setWhatsAppTemplateType(type);
        if (!whatsAppSaleContext) return;
        
        const client = whatsAppSaleContext.client_name || 'Cliente';
        const package_name = whatsAppSaleContext.package_hired || 'plano';
        const value = parseFloat(whatsAppSaleContext.total_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        
        if (type === 'pendente') {
            setWhatsAppMessage(`Olá ${client}, sua comanda do pacote ${package_name} no valor de R$ ${value} está com pagamento pendente. Podemos te ajudar com algo?`);
        } else if (type === 'recebido') {
            setWhatsAppMessage(`Olá ${client}, confirmamos o recebimento do pagamento da comanda do pacote ${package_name} (R$ ${value}). Muito obrigado!`);
        } else {
            setWhatsAppMessage('');
        }
    };

    const sendWhatsApp = () => {
        if (!whatsAppSaleContext || !whatsAppSaleContext.client_contact) {
            alert('Cliente não possui contato/WhatsApp cadastrado nesta venda.');
            return;
        }
        
        let phone = whatsAppSaleContext.client_contact.replace(/\D/g, '');
        if (phone.length === 10 || phone.length === 11) {
            phone = '55' + phone; 
        }
        
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsAppMessage)}`;
        window.open(url, '_blank');
        setIsWhatsAppModalOpen(false);
    };

    // Cálculos Financeiros (baseados na lista filtrada)
    const totalRevenue = filteredSales.reduce((acc, curr) => acc + parseFloat(curr.total_value || 0), 0);
    const totalReceived = filteredSales.filter(s => s.payment_status === 'RECEBIDO').reduce((acc, curr) => acc + parseFloat(curr.total_value || 0), 0);
    const totalOverdue = filteredSales.filter(s => s.payment_status === 'INADIMPLENTE').reduce((acc, curr) => acc + parseFloat(curr.total_value || 0), 0);

    const totalCommission = filteredSales.reduce((acc, curr) => acc + parseFloat(curr.commission_value || 0), 0);
    const netProfit = totalRevenue - totalCommission;
    const efficiency = totalRevenue > 0 ? (totalReceived / totalRevenue) * 100 : 0;

    const metrics = [
        {
            label: 'Faturamento Total',
            value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            subtitle: 'Receita bruta gerada',
            icon: <DollarSign size={24} />,
            color: 'var(--primary-color)'
        },
        {
            label: 'Lucro Líquido',
            value: `R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            subtitle: 'Faturamento - Comissões',
            icon: <TrendingUp size={24} />,
            color: '#10b981'
        },
        {
            label: 'Liquidez (Recebido)',
            value: `R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            subtitle: `${efficiency.toFixed(1)}% de eficiência`,
            icon: <CheckCircle2 size={24} />,
            color: '#38bdf8'
        },
        {
            label: 'Inadimplência',
            value: `R$ ${totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            subtitle: 'Atrasos no pagamento',
            icon: <AlertCircle size={24} />,
            color: '#ef4444'
        },
    ].filter(m => user?.role !== 'CLIENT' || m.label !== 'Lucro Líquido');

    return (
        <div className="animate-fade-in finance-page" style={{ padding: '40px', paddingBottom: '80px' }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                
                .table-container-finance {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    overflow: hidden;
                    margin-top: 32px;
                    backdrop-filter: blur(20px);
                }
                
                table { width: 100%; border-collapse: collapse; }
                th { 
                    padding: 20px 24px; 
                    background: rgba(255,255,255,0.02); 
                    color: var(--text-muted); 
                    font-size: 0.75rem; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 1px;
                    text-align: left;
                }
                td { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }

                .search-bar-finance {
                    position: relative;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                    width: 250px;
                }
                .search-bar-finance input {
                    background: transparent;
                    border: none;
                    color: white;
                    font-weight: 800;
                    font-size: 0.85rem;
                    padding: 12px 0;
                    outline: none;
                    width: 100%;
                }

                .filter-select {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    color: white;
                    font-weight: 800;
                    font-size: 0.85rem;
                    padding: 12px 16px;
                    outline: none;
                    cursor: pointer;
                }

                .badge-finance {
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .modal-premium {
                    background: #0a0f18;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 32px;
                    width: 100%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
            `}</style>

            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h1>Cadastro de Vendas</h1>
                    <p className="subtitle">Gestão de faturamento, anexos de pagamentos e relatórios</p>
                </div>

                <div className="flex flex-wrap items-end gap-3" style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <div className="search-bar-finance" style={{ height: '42px', padding: '0 16px' }}>
                        <Search size={16} color="var(--primary-color)" style={{ marginRight: '12px' }} />
                        <input
                            placeholder="Buscar cliente, card..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ height: '100%', padding: '0' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Inicial</span>
                        <input
                            type="datetime-local"
                            className="filter-select"
                            style={{ height: '42px', padding: '0 12px' }}
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Final</span>
                        <input
                            type="datetime-local"
                            className="filter-select"
                            style={{ height: '42px', padding: '0 12px' }}
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                    </div>

                    {user?.role !== 'CLIENT' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vendedor</span>
                            <select
                                className="filter-select"
                                style={{ height: '42px', padding: '0 12px' }}
                                value={filterSalesperson}
                                onChange={(e) => setFilterSalesperson(e.target.value)}
                            >
                                <option value="TODOS" style={{ background: '#0a0f18' }}>Todos</option>
                                {salespeople.map(sp => (
                                    <option key={sp.id} value={String(sp.id)} style={{ background: '#0a0f18' }}>{sp.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {user?.role !== 'CLIENT' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliente</span>
                            <select
                                className="filter-select"
                                value={filterClient}
                                onChange={(e) => setFilterClient(e.target.value)}
                                style={{ height: '42px', padding: '0 12px', maxWidth: '180px' }}
                            >
                                <option value="TODOS" style={{ background: '#0a0f18' }}>Todos</option>
                                {uniqueClients.map(client => (
                                    <option key={client} value={client} style={{ background: '#0a0f18' }}>{client}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
                        <select
                            className="filter-select"
                            style={{ height: '42px', padding: '0 12px' }}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="TODOS" style={{ background: '#0a0f18' }}>Todos</option>
                            <option value="PENDENTE" style={{ background: '#0a0f18' }}>Pendentes</option>
                            <option value="RECEBIDO" style={{ background: '#0a0f18' }}>Recebidos</option>
                            <option value="INADIMPLENTE" style={{ background: '#0a0f18' }}>Inadimplentes</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <button
                            onClick={exportToExcel}
                            style={{ height: '42px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '0 16px', color: 'white', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Download size={16} /> EXPORTAR
                        </button>

                        <button
                            onClick={fetchData}
                            disabled={isLoading}
                            style={{ height: '42px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '0 14px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        </button>

                        {user?.role !== 'CLIENT' && (
                            <button
                                onClick={() => { resetForm(); setEditingSale(null); setIsModalOpen(true); }}
                                style={{ height: '42px', background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '14px', padding: '0 20px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Plus size={18} /> NOVA VENDA
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="stats-grid-finance" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {metrics.map((m, i) => (
                    <div key={i} className="glass-card-finance" style={{ background: 'rgba(255, 255, 255, 0.03)', border: `1px solid rgba(255, 255, 255, 0.08)`, borderLeft: `4px solid ${m.color}`, borderRadius: '20px', padding: '20px' }}>
                        <div className="flex justify-between items-start mb-2">
                            <div style={{ color: m.color, background: `${m.color}15`, padding: '10px', borderRadius: '12px' }}>
                                {m.icon}
                            </div>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{m.label}</p>
                        <h2 style={{ margin: '4px 0', fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{m.value}</h2>
                    </div>
                ))}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleUploadReceipt}
                accept="image/*,.pdf"
            />

            {selectedSales.length > 0 && user?.role !== 'CLIENT' && (
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '16px', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckSquare color="#38bdf8" />
                        <span style={{ color: 'white', fontWeight: 900, fontSize: '1rem' }}>{selectedSales.length} registros selecionados</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select className="filter-select" style={{ background: '#0a0f18', borderColor: 'rgba(56, 189, 248, 0.3)' }} onChange={(e) => {
                            if (e.target.value) {
                                setMassActionType(e.target.value);
                                setMassActionValue('');
                                if (e.target.value === 'delete') {
                                    executeMassAction({ preventDefault: () => {} } as any);
                                } else {
                                    setIsMassActionModalOpen(true);
                                }
                                e.target.value = '';
                            }
                        }}>
                            <option value="">AÇÕES EM MASSA...</option>
                            <option value="salesperson">Alterar Vendedor</option>
                            <option value="unit_value">Modificar Valor Unitário</option>
                            <option value="payment_status">Alterar Status Pagamento</option>
                            <option value="client_name">Alterar Cliente</option>
                            <option value="delete">Apagar Selecionados</option>
                        </select>
                    </div>
                </div>
            )}
            
            <div className="table-container-finance">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>
                                <input type="checkbox" checked={selectedSales.length > 0 && selectedSales.length === filteredSales.length} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                            </th>
                            <th>DATA / COMP.</th>
                            <th>CLIENTE & CAMPANHA (CARD)</th>
                            <th>PACOTE</th>
                            <th>VALOR BRUTO</th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'right' }}>AÇÕES RÁPIDAS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px' }}><RefreshCw className="animate-spin mx-auto text-primary-color" /></td></tr>
                        ) : filteredSales.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.8rem' }}>NENHUM REGISTRO ENCONTRADO</td></tr>
                        ) : filteredSales.map((sale) => (
                            <tr key={sale.id} style={{ transition: 'all 0.2s', background: selectedSales.includes(sale.id) ? 'rgba(56, 189, 248, 0.05)' : 'transparent' }}>
                                <td style={{ textAlign: 'center' }}>
                                    <input type="checkbox" checked={selectedSales.includes(sale.id)} onChange={() => handleSelectSale(sale.id)} style={{ cursor: 'pointer' }} />
                                </td>
                                <td style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                    <span style={{ display: 'block', color: 'white', fontWeight: 800 }}>{sale.payment_competence}</span>
                                    {sale.sale_date ? new Date(sale.sale_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Sem data'}
                                </td>
                                <td>
                                    <div className="flex flex-col gap-1">
                                        <span style={{ fontWeight: 900, color: 'white', fontSize: '0.95rem' }}>{sale.client_name}</span>
                                        {sale.submission_id ? (
                                            <a
                                                href={`/client-submissions/${sale.submission_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                CARD: {sale.campaign_name || `Campanha #${sale.submission_id}`} <ArrowUpRight size={12} />
                                            </a>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>VENDA MANUAL</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{sale.package_hired}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 900 }}>{sale.quantity_hired} UNID.</span>
                                    </div>
                                </td>
                                <td>
                                    {parseFloat(sale.quantity_hired) === 0 ? (
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '8px', color: 'var(--text-muted)' }}>
                                            AGUARDANDO RELATÓRIO
                                        </span>
                                    ) : (
                                        <span style={{ fontWeight: 900, color: 'white', fontSize: '1rem' }}>R$ {parseFloat(sale.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    )}
                                </td>
                                <td>
                                    <span className="badge-finance" style={{
                                        background: sale.payment_status === 'RECEBIDO' ? 'rgba(16, 185, 129, 0.1)' : sale.payment_status === 'PENDENTE' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: sale.payment_status === 'RECEBIDO' ? '#10b981' : sale.payment_status === 'PENDENTE' ? '#facc15' : '#ef4444',
                                        border: `1px solid ${sale.payment_status === 'RECEBIDO' ? 'rgba(16, 185, 129, 0.2)' : sale.payment_status === 'PENDENTE' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                    }}>
                                        {sale.payment_status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="flex justify-end items-center gap-2">
                                        {sale.payment_receipt_url ? (
                                            <button
                                                onClick={() => window.open(sale.payment_receipt_url, '_blank')}
                                                style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                title="Visualizar Comprovante do Cliente"
                                            >
                                                <ExternalLink size={14} /> RECIBO
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { setSaleIdToUpload(sale.id); setTimeout(() => fileInputRef.current?.click(), 100); }}
                                                disabled={uploadingReceipt === sale.id}
                                                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                title="Anexar Comprovante do Cliente"
                                            >
                                                {uploadingReceipt === sale.id ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                                                {uploadingReceipt === sale.id ? '...' : 'ANEXAR PAG.'}
                                            </button>
                                        )}
                                        {user?.role === 'CLIENT' && sale.submission_id && (
                                            <button
                                                className="btn-icon-only"
                                                title="Baixar Relatórios Filtrados"
                                                onClick={() => window.open(`/client-submissions/${sale.submission_id}`, '_blank')}
                                                style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '8px', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 900 }}
                                            >
                                                <Download size={14} /> RELATÓRIOS
                                            </button>
                                        )}
                                        {user?.role !== 'CLIENT' && (
                                            <>
                                                <button className="btn-icon-only" style={{ background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.2)', padding: '6px', borderRadius: '8px', color: '#25D366', cursor: 'pointer' }} onClick={() => openWhatsAppModal(sale)} title="Enviar Mensagem via WhatsApp"><MessageCircle size={14} /></button>
                                                <button className="btn-icon-only" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '8px', color: 'white', cursor: 'pointer' }} onClick={() => handleEdit(sale)}><Edit2 size={14} /></button>
                                                <button className="btn-icon-only" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(sale.id)}><Trash2 size={14} /></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '40px' }}>
                    <div className="modal-premium" style={{ margin: 'auto' }}>
                        <header style={{ padding: '32px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontWeight: 950, color: 'white', fontSize: '1.8rem', letterSpacing: '-1px' }}>{editingSale ? 'Editar Negociação' : 'Nova Venda'}</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>Registro completo de transação comercial</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}><X size={20} /></button>
                        </header>

                        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Coluna Esquerda: Cliente */}
                                <div className="space-y-6">
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <User size={14} /> IDENTIFICAÇÃO DO CLIENTE
                                    </h3>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Nome Completo / Razão Social</label>
                                        <input className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="client_name" value={formData.client_name} onChange={handleInputChange} required placeholder="Ex: João da Silva ou Empresa LTDA" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>CPF / CNPJ</label>
                                            <input className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="client_cpf_cnpj" value={formData.client_cpf_cnpj} onChange={handleInputChange} placeholder="000.000.000-00" />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>WhatsApp / Contato</label>
                                            <input className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="client_contact" value={formData.client_contact} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <CalendarIcon size={14} /> DATAS E RESPONSABILIDADE
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Data da Venda</label>
                                                <input type="datetime-local" className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="sale_date" value={formData.sale_date} onChange={handleInputChange} required />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Vendedor</label>
                                                <select className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="salesperson_id" value={formData.salesperson_id} onChange={handleInputChange} required>
                                                    <option value="" style={{ background: '#0a0f18' }}>Selecione...</option>
                                                    {salespeople.map(sp => (
                                                        <option key={sp.id} value={sp.id} style={{ background: '#0a0f18' }}>{sp.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Coluna Direita: Produto e Financeiro */}
                                <div className="space-y-6">
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Package size={14} /> DETALHES DO PACOTE
                                    </h3>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Pacote Contratado</label>
                                        <select className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="package_hired" value={formData.package_hired} onChange={handleInputChange} required>
                                            <option value="" style={{ background: '#0a0f18' }}>Selecione o plano...</option>
                                            <option value="Starter" style={{ background: '#0a0f18' }}>Starter (10k disparos)</option>
                                            <option value="Growth" style={{ background: '#0a0f18' }}>Growth (50k disparos)</option>
                                            <option value="Enterprise" style={{ background: '#0a0f18' }}>Enterprise (250k disparos)</option>
                                            <option value="Custom" style={{ background: '#0a0f18' }}>Personalizado / Consultoria</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Quantidade</label>
                                            <input type="number" className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="quantity_hired" value={formData.quantity_hired} onChange={handleInputChange} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Valor Unitário (R$)</label>
                                            <input type="number" step="0.01" className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="unit_value" value={formData.unit_value} onChange={handleInputChange} required />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <DollarSign size={14} /> STATUS FINANCEIRO
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Status do Pagamento</label>
                                                <select className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="payment_status" value={formData.payment_status} onChange={handleInputChange} required>
                                                    <option value="PENDENTE" style={{ background: '#0a0f18' }}>Pendente</option>
                                                    <option value="RECEBIDO" style={{ background: '#0a0f18' }}>Recebido</option>
                                                    <option value="INADIMPLENTE" style={{ background: '#0a0f18' }}>Inadimplente</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Competência</label>
                                                <input type="month" className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="payment_competence" value={formData.payment_competence} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '24px', background: 'rgba(172, 248, 0, 0.08)', borderRadius: '20px', border: '1px solid rgba(172, 248, 0, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', boxShadow: '0 10px 30px rgba(172, 248, 0, 0.1)' }}>
                                        <div className="flex flex-col">
                                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Faturamento Bruto</span>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary-color)', opacity: 0.6 }}>Cálculo automático: Qtd x Unit.</span>
                                        </div>
                                        <span style={{ fontSize: '1.8rem', fontWeight: 1000, color: 'var(--primary-color)', letterSpacing: '-1px' }}>R$ {formData.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/5 flex justify-end items-center gap-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', padding: '12px 24px', letterSpacing: '1px' }}>DESCARTAR</button>
                                <button type="submit" disabled={isSaving} style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '16px', padding: '16px 48px', fontWeight: 1000, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(172, 248, 0, 0.3)', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                    {isSaving ? <RefreshCw className="animate-spin" size={24} /> : (editingSale ? 'ATUALIZAR REGISTRO' : 'CONFIRMAR VENDA')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isMassActionModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '40px' }}>
                    <div className="modal-premium" style={{ margin: 'auto', maxWidth: '500px' }}>
                        <header style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontWeight: 950, color: 'white', fontSize: '1.4rem' }}>Ação em Massa</h2>
                            <button onClick={() => setIsMassActionModalOpen(false)} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </header>
                        <form onSubmit={executeMassAction} style={{ padding: '32px' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                                    {massActionType === 'salesperson' && 'Novo Vendedor'}
                                    {massActionType === 'unit_value' && 'Novo Valor Unitário (R$)'}
                                    {massActionType === 'payment_status' && 'Novo Status'}
                                    {massActionType === 'client_name' && 'Novo Cliente'}
                                </label>
                                
                                {massActionType === 'salesperson' && (
                                    <select className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', padding: '12px', width: '100%' }} value={massActionValue} onChange={(e) => setMassActionValue(e.target.value)} required>
                                        <option value="" style={{ background: '#0a0f18' }}>Selecione...</option>
                                        {salespeople.map(sp => <option key={sp.id} value={sp.id} style={{ background: '#0a0f18' }}>{sp.name}</option>)}
                                    </select>
                                )}
                                
                                {massActionType === 'unit_value' && (
                                    <input type="number" step="0.01" className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', padding: '12px', width: '100%' }} value={massActionValue} onChange={(e) => setMassActionValue(e.target.value)} required />
                                )}
                                
                                {massActionType === 'payment_status' && (
                                    <select className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', padding: '12px', width: '100%' }} value={massActionValue} onChange={(e) => setMassActionValue(e.target.value)} required>
                                        <option value="" style={{ background: '#0a0f18' }}>Selecione...</option>
                                        <option value="PENDENTE" style={{ background: '#0a0f18' }}>Pendente</option>
                                        <option value="RECEBIDO" style={{ background: '#0a0f18' }}>Recebido</option>
                                        <option value="INADIMPLENTE" style={{ background: '#0a0f18' }}>Inadimplente</option>
                                    </select>
                                )}

                                {massActionType === 'client_name' && (
                                    <input type="text" className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', padding: '12px', width: '100%' }} value={massActionValue} onChange={(e) => setMassActionValue(e.target.value)} required />
                                )}
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isSaving} style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 900, cursor: 'pointer' }}>
                                    {isSaving ? 'PROCESSANDO...' : 'APLICAR A TODOS'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isWhatsAppModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '40px' }}>
                    <div className="modal-premium" style={{ margin: 'auto', maxWidth: '500px' }}>
                        <header style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontWeight: 950, color: 'white', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageCircle color="#25D366" /> Enviar Mensagem</h2>
                            <button onClick={() => setIsWhatsAppModalOpen(false)} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </header>
                        <div style={{ padding: '32px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Template Automático</label>
                                <select className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', padding: '12px', width: '100%' }} value={whatsAppTemplateType} onChange={handleWhatsAppTemplateChange}>
                                    <option value="manual" style={{ background: '#0a0f18' }}>Digitar Manualmente</option>
                                    <option value="pendente" style={{ background: '#0a0f18' }}>Lembrete: Pagamento Pendente</option>
                                    <option value="recebido" style={{ background: '#0a0f18' }}>Agradecimento: Pagamento Recebido</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Mensagem</label>
                                <textarea className="input-field" rows={5} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', padding: '12px', width: '100%', resize: 'none' }} value={whatsAppMessage} onChange={(e) => setWhatsAppMessage(e.target.value)} placeholder="Digite sua mensagem aqui..."></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={sendWhatsApp} style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 900, cursor: 'pointer' }}>
                                    ABRIR WHATSAPP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceSales;
