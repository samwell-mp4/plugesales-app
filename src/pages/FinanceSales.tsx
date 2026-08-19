import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
import { sendAccountingNotification } from '../services/webhookService';

const maskPhone = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 10) {
        return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (v.length > 5) {
        return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (v.length > 2) {
        return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (v.length > 0) {
        return v.replace(/^(\d*)/, '($1');
    }
    return v;
};

const maskCpfCnpj = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length <= 11) {
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        if (v.length > 14) v = v.slice(0, 14);
        v = v.replace(/^(\d{2})(\d)/, '$1.$2');
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return v;
};
const FinanceSales = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [salespeople, setSalespeople] = useState<any[]>([]);
    const [dbClients, setDbClients] = useState<any[]>([]);
    const [isRegisteringClient, setIsRegisteringClient] = useState(false);
    const [newClientData, setNewClientData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        document_type: 'CPF',
        document_number: '',
        password: '123456',
        pacote: 'Avulso',
        preco_vendido: '0.20',
        comissao_vendedor: '0.05',
        disparo_quantidade: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('TODOS');
    const [filterSalesperson, setFilterSalesperson] = useState('TODOS');
    const [filterClient, setFilterClient] = useState('TODOS');
    const [filterMonth, setFilterMonth] = useState('');

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
        commission_value: 0,
        quantity_delivered: 0,
        used_value: 0,
        remaining_balance: 0,
        discount_applied: 0,
        receipt_url: '',
        report_url: ''
    });
    const [clientBalance, setClientBalance] = useState(0);
    const [useClientBalance, setUseClientBalance] = useState(false);

    const [commissionTiers, setCommissionTiers] = useState<any[]>([
        { minPrice: 0, commission: 0.005 },
        { minPrice: 0.20, commission: 0.01 },
        { minPrice: 0.25, commission: 0.02 },
        { minPrice: 0.30, commission: 0.03 },
        { minPrice: 0.40, commission: 0.04 }
    ]);
    
    const getCommissionForPrice = (price: number) => {
        const sortedTiers = [...commissionTiers].sort((a, b) => b.minPrice - a.minPrice);
        const tier = sortedTiers.find(t => price >= t.minPrice);
        return tier ? tier.commission : 0;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [salesData, peopleData, clientsRes, settingsData] = await Promise.all([
                dbService.getFinanceSales({ userId: user?.id, role: user?.role }),
                dbService.getFinanceSalespeople(),
                fetch('/api/clients').then(res => res.json()).catch(() => []),
                dbService.getSettings(user?.role)
            ]);
            setSales(salesData);
            setSalespeople(peopleData);
            setDbClients(clientsRes);
            if (settingsData['commission_tiers']) {
                try {
                    setCommissionTiers(JSON.parse(settingsData['commission_tiers']));
                } catch(e) {}
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = async (e: any) => {
        let { name, value } = e.target;
        if (name === 'client_contact') {
            value = maskPhone(value);
        } else if (name === 'client_cpf_cnpj') {
            value = maskCpfCnpj(value);
        }
        
        if (name === 'client_name' && value && !editingSale) {
            const bal = await dbService.getClientBalance(value);
            setClientBalance(bal);
        }
        
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            if (name === 'client_name') {
                const clientObj = dbClients.find(c => c.name === value);
                if (clientObj) {
                    newData.client_cpf_cnpj = clientObj.document_number || '';
                    newData.client_contact = clientObj.whatsapp || clientObj.phone || '';
                    newData.package_hired = clientObj.pacote || prev.package_hired;
                    let unitVal = parseFloat(String(clientObj.preco_vendido || '0').replace(',', '.')) || 0;
                    if (unitVal > 0) {
                        newData.unit_value = unitVal;
                    }
                    if (clientObj.seller_name) {
                        const sp = salespeople.find(s => s.name === clientObj.seller_name);
                        if (sp) newData.salesperson_id = String(sp.id);
                    }
                }
            }

            if (name === 'unit_value' || name === 'quantity_delivered' || name === 'salesperson_id' || name === 'client_name') {
                const finalUnit = name === 'unit_value' ? parseFloat(value) || 0 : newData.unit_value;
                const finalDelivered = name === 'quantity_delivered' ? parseInt(value) || 0 : newData.quantity_delivered;

                // Faturamento Bruto e Comissão agora sempre refletem a quantidade entregue
                newData.total_value = finalDelivered * finalUnit;
                newData.used_value = finalDelivered * finalUnit;
                newData.remaining_balance = 0;
                
                const commPerUnit = getCommissionForPrice(finalUnit);
                
                if (commPerUnit > 0) {
                    newData.commission_value = finalDelivered * commPerUnit;
                } else {
                    const sp = salespeople.find(s => String(s.id) === String(newData.salesperson_id));
                    if (sp) {
                        newData.commission_value = (newData.total_value * (sp.commission_percentage || 0)) / 100;
                    }
                }
            }
            return newData;
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const clientObj = dbClients.find(c => c.name === formData.client_name);
            const currentCredits = clientObj ? (clientObj.disparo_quantidade || 0) : 0;

            let discount = 0;
            if (useClientBalance && clientBalance > 0 && !editingSale) {
                discount = Math.min(clientBalance, formData.total_value);
                await dbService.rolloverClientBalance(formData.client_name, discount);
            }
            
            const dataToSave = { 
                ...formData, 
                id: editingSale?.id,
                discount_applied: discount
            };
            
            await dbService.saveFinanceSale(dataToSave);
            
            // Sync client credits balance
            if (clientObj) {
                const isPaid = formData.payment_status === 'RECEBIDO' || (useClientBalance && clientBalance > 0);
                const delivered = formData.quantity_delivered || 0;
                
                // Em Venda/Entrega combinada, apenas deduzimos o consumo do saldo existente.
                // Se foi pago a mais, significa que comprou mais do que consumiu. 
                // Mas de acordo com a regra: apenas deduzimos o entregue.
                const newCredits = currentCredits - delivered;
                
                await fetch(`/api/users/${clientObj.id}/commercial`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        pacote: clientObj.pacote || 'Avulso', 
                        preco_vendido: clientObj.preco_vendido || '0.20', 
                        comissao_vendedor: clientObj.comissao_vendedor || '0.05',
                        seller_name: clientObj.seller_name || '',
                        disparo_quantidade: newCredits
                    })
                });
            }

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
            commission_value: sale.commission_value || 0,
            quantity_delivered: sale.quantity_delivered || 0,
            used_value: sale.used_value || 0,
            remaining_balance: sale.remaining_balance !== undefined ? sale.remaining_balance : sale.total_value,
            discount_applied: sale.discount_applied || 0,
            receipt_url: sale.receipt_url || '',
            report_url: sale.report_url || ''
        });
        setClientBalance(0);
        setUseClientBalance(false);
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
            commission_value: 0,
            quantity_delivered: 0,
            used_value: 0,
            remaining_balance: 0,
            discount_applied: 0,
            receipt_url: '',
            report_url: ''
        });
        setClientBalance(0);
        setUseClientBalance(false);
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
            
            // Send webhook notification
            const sale = sales.find(s => s.id === saleIdToUpload);
            if (sale) {
                const dateFormatted = new Date().toLocaleDateString('pt-BR');
                const msg = `O pagamento da venda de ${sale.package_hired} para o cliente ${sale.client_name} (R$ ${sale.total_value}) foi recebido com sucesso na data de hoje (${dateFormatted}).\n\n📄 Comprovante de Pagamento: ${hostedUrl}`;
                sendAccountingNotification(
                    'PAGAMENTO_RECEBIDO_VENDA',
                    `Comprovante de pagamento anexado para a venda de ${sale.client_name}`,
                    msg,
                    { saleId: sale.id, hostedUrl, sale }
                );
            }

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
            (s.salesperson_name || '').toLowerCase().includes(term) ||
            (s.client_contact || '').toLowerCase().includes(term) ||
            (s.client_cpf_cnpj || '').toLowerCase().includes(term);

        const matchesStatus = filterStatus === 'TODOS' || s.payment_status === filterStatus;
        const matchesSalesperson = filterSalesperson === 'TODOS' || String(s.salesperson_id) === filterSalesperson;
        const matchesClient = filterClient === 'TODOS' || s.client_name === filterClient;

        const saleDateObj = s.sale_date ? new Date(s.sale_date) : null;
        let matchesDate = true;
        if (filterMonth && saleDateObj) {
            const saleMonth = `${saleDateObj.getFullYear()}-${String(saleDateObj.getMonth() + 1).padStart(2, '0')}`;
            matchesDate = saleMonth === filterMonth;
        }

        return matchesSearch && matchesStatus && matchesSalesperson && matchesClient && matchesDate;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterSalesperson, filterClient, filterMonth]);

    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <div className="animate-fade-in finance-page p-4 md:p-10 pb-20 md:pb-20">
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

            <header className="flex flex-col mb-4">
                <div>
                    <h1>Cadastro de Vendas</h1>
                    <p className="subtitle">Gestão de faturamento, anexos de pagamentos e relatórios</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px', width: '100%' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', alignItems: 'flex-end' as const }}>
                        <div className="search-bar-finance" style={{ flex: '1 1 200px', minWidth: '180px' }}>
                            <Search size={16} color="var(--primary-color)" style={{ marginRight: '12px' }} />
                            <input
                                placeholder="Buscar cliente, card..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px', flex: '0 1 auto' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' as const, paddingLeft: '4px' }}>Mês da Venda</span>
                            <input
                                type="month"
                                className="filter-select"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' as const, marginLeft: 'auto' as const }}>
                            <button
                                onClick={exportToExcel}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px 16px', color: 'white', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' as const }}
                            >
                                <Download size={16} /> EXPORTAR
                            </button>

                            <button
                                onClick={fetchData}
                                disabled={isLoading}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px 12px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', alignItems: 'flex-end' as const }}>
                        {(user?.role === 'ADMIN' || user?.role === 'CONTABILIDADE') && (
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px', flex: '0 1 180px' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' as const, paddingLeft: '4px' }}>Vendedor</span>
                                <select
                                    className="filter-select"
                                    value={filterSalesperson}
                                    onChange={(e) => setFilterSalesperson(e.target.value)}
                                >
                                    <option value="TODOS" style={{ background: '#0a0f18' }}>Todos Vendedores</option>
                                    {salespeople.map(sp => (
                                        <option key={sp.id} value={String(sp.id)} style={{ background: '#0a0f18' }}>{sp.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px', flex: '1 1 200px', minWidth: '150px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' as const, paddingLeft: '4px' }}>Cliente</span>
                            <select
                                className="filter-select"
                                value={filterClient}
                                onChange={(e) => setFilterClient(e.target.value)}
                            >
                                <option value="TODOS" style={{ background: '#0a0f18' }}>Todos Clientes</option>
                                {uniqueClients.map(client => (
                                    <option key={client} value={client} style={{ background: '#0a0f18' }}>{client}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px', flex: '0 1 160px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' as const, paddingLeft: '4px' }}>Status</span>
                            <select
                                className="filter-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="TODOS" style={{ background: '#0a0f18' }}>Todos Status</option>
                                <option value="PENDENTE" style={{ background: '#0a0f18' }}>Pendentes</option>
                                <option value="RECEBIDO" style={{ background: '#0a0f18' }}>Recebidos</option>
                                <option value="INADIMPLENTE" style={{ background: '#0a0f18' }}>Inadimplentes</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' as const, justifyContent: 'flex-end' as const }}>
                        {user?.role !== 'CLIENT' && (
                            <button
                                onClick={() => { resetForm(); setEditingSale(null); setIsModalOpen(true); }}
                                style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '14px', padding: '12px 24px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
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
            
            <div className="table-container-finance overflow-x-auto custom-scrollbar">
                <table style={{ minWidth: '1000px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>
                                <input type="checkbox" checked={selectedSales.length > 0 && selectedSales.length === filteredSales.length} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                            </th>
                            <th>DATA / COMP.</th>
                            <th>CLIENTE & CAMPANHA (CARD)</th>
                            <th>PACOTE & BASE</th>
                            <th>ENTREGUE / CONSUMIDO</th>
                            <th>SALDO / COMISSÃO</th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'right' }}>AÇÕES RÁPIDAS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px' }}><RefreshCw className="animate-spin mx-auto text-primary-color" /></td></tr>
                        ) : paginatedSales.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.8rem' }}>NENHUM REGISTRO ENCONTRADO</td></tr>
                        ) : paginatedSales.map((sale) => (
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
                                        <span style={{ fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 800, marginTop: '2px' }}>
                                            Vendedor: {sale.salesperson_name || 'Não vinculado'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{sale.package_hired}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 900 }}>{sale.quantity_hired} UNID.</span>
                                        <span style={{ fontWeight: 900, color: 'white', fontSize: '1rem', marginTop: '4px' }}>R$ {parseFloat(sale.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </td>
                                <td>
                                    {parseFloat(sale.quantity_delivered || 0) === 0 ? (
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '8px', color: 'var(--text-muted)' }}>
                                            AGUARDANDO RELATÓRIO
                                        </span>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 900 }}>{sale.quantity_delivered} UNID.</span>
                                            <span style={{ fontWeight: 900, color: 'white', fontSize: '1rem', marginTop: '2px' }}>R$ {parseFloat(sale.used_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: sale.balance_rolled_over ? 'var(--text-muted)' : '#facc15' }}>
                                            Saldo: R$ {parseFloat(sale.remaining_balance || sale.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            {sale.balance_rolled_over && ' (ABATIDO)'}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '4px' }}>
                                            Comissão: R$ {parseFloat(sale.commission_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
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

                {totalPages > 1 && (
                    <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800 }}>Página {currentPage} de {totalPages}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px', color: currentPage === 1 ? 'var(--text-muted)' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px', color: currentPage === totalPages ? 'var(--text-muted)' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && createPortal(
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
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Selecionar Cliente</label>
                                        {!isRegisteringClient ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <select 
                                                    className="input-field" 
                                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} 
                                                    name="client_name" 
                                                    value={formData.client_name} 
                                                    onChange={handleInputChange} 
                                                    required
                                                >
                                                    <option value="" style={{ background: '#0a0f18' }}>Selecione um cliente...</option>
                                                    {dbClients.map(c => (
                                                        <option key={c.id} value={c.name} style={{ background: '#0a0f18' }}>{c.name} ({c.email})</option>
                                                    ))}
                                                </select>
                                                {formData.client_name && (
                                                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                             <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>SALDO DE DISPAROS ATUAL:</span>
                                                             <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 900 }}>
                                                                 {(() => {
                                                                     const c = dbClients.find(cl => cl.name === formData.client_name);
                                                                     return c ? (c.disparo_quantidade || 0).toLocaleString('pt-BR') : '0';
                                                                 })()} disparos
                                                             </span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                             <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>PACOTE CONTRATADO:</span>
                                                             <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 900 }}>
                                                                 {formData.package_hired || 'Avulso'}
                                                             </span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                             <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>SALDO FINANCEIRO DISPONÍVEL:</span>
                                                             <span style={{ fontSize: '0.75rem', color: '#facc15', fontWeight: 900 }}>
                                                                 R$ {clientBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                             </span>
                                                        </div>
                                                        {(() => {
                                                            const c = dbClients.find(cl => cl.name === formData.client_name);
                                                            const currentCredits = c ? c.disparo_quantidade || 0 : 0;
                                                            const delivered = parseInt(String(formData.quantity_delivered)) || 0;
                                                            if (delivered > currentCredits) {
                                                                return (
                                                                    <div style={{ marginTop: '6px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
                                                                        <AlertCircle size={14} />
                                                                        <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>Aviso: Cliente ficará negativado em {Math.abs(currentCredits - delivered).toLocaleString('pt-BR')} disparos!</span>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                )}
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsRegisteringClient(true)}
                                                    style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '12px', padding: '12px 16px', fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                                                >
                                                    + NOVO
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-color)' }}>CADASTRAR NOVO CLIENTE</span>
                                                    <button type="button" onClick={() => setIsRegisteringClient(false)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}>CANCELAR</button>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Nome Completo</label>
                                                    <input className="input-field" style={{ padding: '8px', fontSize: '0.85rem', background: '#0f172a' }} value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} placeholder="Razão Social ou Nome Completo" />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Email</label>
                                                    <input className="input-field" style={{ padding: '8px', fontSize: '0.85rem', background: '#0f172a' }} value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} placeholder="email@dominio.com" />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CPF / CNPJ</label>
                                                        <input className="input-field" style={{ padding: '8px', fontSize: '0.85rem', background: '#0f172a' }} value={newClientData.document_number} onChange={e => setNewClientData({...newClientData, document_number: maskCpfCnpj(e.target.value)})} placeholder="Documento" />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>WhatsApp</label>
                                                        <input className="input-field" style={{ padding: '8px', fontSize: '0.85rem', background: '#0f172a' }} value={newClientData.whatsapp} onChange={e => setNewClientData({...newClientData, whatsapp: maskPhone(e.target.value)})} placeholder="WhatsApp" />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Preço Unitário (R$)</label>
                                                        <input className="input-field" style={{ padding: '8px', fontSize: '0.85rem', background: '#0f172a' }} value={newClientData.preco_vendido} onChange={e => setNewClientData({...newClientData, preco_vendido: e.target.value})} placeholder="Ex: 0.20" />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Comissão (R$)</label>
                                                        <input className="input-field" style={{ padding: '8px', fontSize: '0.85rem', background: '#0f172a' }} value={newClientData.comissao_vendedor} onChange={e => setNewClientData({...newClientData, comissao_vendedor: e.target.value})} placeholder="Ex: 0.05" />
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={async () => {
                                                        if (!newClientData.name || !newClientData.email) {
                                                            alert("Nome e Email são obrigatórios.");
                                                            return;
                                                        }
                                                        const res = await dbService.createClient({
                                                            ...newClientData,
                                                            seller_name: salespeople.find(s => String(s.id) === String(formData.salesperson_id))?.name || user?.name
                                                        });
                                                        if (res.error) {
                                                            alert("Erro ao cadastrar cliente: " + res.error);
                                                        } else {
                                                            alert("Cliente cadastrado com sucesso!");
                                                            const newClient = res.user;
                                                            setDbClients(prev => [...prev, newClient]);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                client_name: newClient.name,
                                                                client_cpf_cnpj: newClient.document_number || '',
                                                                client_contact: newClient.whatsapp || newClient.phone || '',
                                                                package_hired: newClient.pacote || prev.package_hired,
                                                                unit_value: parseFloat(String(newClient.preco_vendido || '0').replace(',', '.')) || 0
                                                            }));
                                                            setIsRegisteringClient(false);
                                                        }
                                                    }}
                                                    style={{ background: 'var(--primary-color)', color: 'black', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem' }}
                                                >
                                                    SALVAR E SELECIONAR CLIENTE
                                                </button>
                                            </div>
                                        )}
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
                                        <Package size={14} /> ACORDO COMERCIAL
                                    </h3>

                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', marginBottom: '20px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <AlertCircle size={14} color="var(--primary-color)"/> Tabela Padrão de Comissões
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {[...commissionTiers].sort((a, b) => a.minPrice - b.minPrice).map((tier, idx, arr) => {
                                                const nextTier = arr[idx + 1];
                                                const label = nextTier 
                                                    ? `Até R$ ${(nextTier.minPrice - 0.01).toFixed(2)}` 
                                                    : `A partir de R$ ${tier.minPrice.toFixed(2)}`;
                                                return (
                                                    <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>{label}:</span> <strong style={{ color: 'var(--primary-color)' }}>R$ {tier.commission === 0.005 ? '0.005' : tier.commission.toFixed(2)}</strong>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Comissão projetada (unitária): <strong style={{ color: 'var(--primary-color)' }}>R$ {getCommissionForPrice(parseFloat(String(formData.unit_value).replace(',', '.')) || 0) === 0.005 ? '0.005' : getCommissionForPrice(parseFloat(String(formData.unit_value).replace(',', '.')) || 0).toFixed(2)}</strong>
                                        </div>
                                    </div>

                                    <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>VALOR UNITÁRIO ACORDADO:</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 900 }}>
                                            R$ {(formData.unit_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
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
                                    
                                    {/* Adição da Quantidade Entregue (para Vendas Manuais ou Edições) */}
                                    {(!editingSale || !editingSale.submission_id) && (
                                        <div className="pt-4 border-t border-white/5 mt-4">
                                            <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <CheckCircle2 size={14} /> RESULTADOS E CONSUMO
                                            </h3>
                                            <div className="flex gap-4 items-end">
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', marginLeft: '4px' }}>Quantidade Entregue (Relatório)</label>
                                                    <input type="number" className="input-field" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%' }} name="quantity_delivered" value={formData.quantity_delivered} onChange={handleInputChange} />
                                                </div>
                                                <input 
                                                    type="file" 
                                                    id="sale-report-upload"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setUploadingReceipt(888888);
                                                        try {
                                                            const buffer = await file.arrayBuffer();
                                                            const wb = XLSX.read(buffer, { type: 'array' });
                                                            const ws = wb.Sheets[wb.SheetNames[0]];
                                                            const rawData = XLSX.utils.sheet_to_json(ws);
                                                            
                                                            const summary = {
                                                                total: rawData.length,
                                                                delivered: rawData.filter((r: any) => {
                                                                    const statusVal = String(r.Status || r.status || r.STATUS || '').toLowerCase();
                                                                    return statusVal.includes('delivered') || statusVal.includes('entregue') || statusVal.includes('sucesso') || statusVal.includes('enviado');
                                                                }).length
                                                            };

                                                            setFormData(prev => ({
                                                                ...prev,
                                                                quantity_delivered: summary.delivered
                                                            }));

                                                            const fileData = new FormData();
                                                            fileData.append('file', file);
                                                            const uploadRes = await fetch('/api/upload', {
                                                                method: 'POST',
                                                                body: fileData
                                                            });
                                                            if (uploadRes.ok) {
                                                                const uploadData = await uploadRes.json();
                                                                setFormData(prev => ({ ...prev, report_url: uploadData.fileUrl }));
                                                                alert(`Relatório anexado! Total de disparos entregues: ${summary.delivered}`);
                                                            } else {
                                                                alert("Falha ao salvar relatório no servidor.");
                                                            }
                                                        } catch (err) {
                                                            console.error("Error parsing/uploading report:", err);
                                                            alert("Erro ao ler/processar arquivo Excel.");
                                                        } finally {
                                                            setUploadingReceipt(null);
                                                        }
                                                    }}
                                                    style={{ display: 'none' }}
                                                />
                                                <label 
                                                    htmlFor="sale-report-upload" 
                                                    style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#38bdf8', borderRadius: '12px', padding: '12px 16px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <Upload size={16} /> {uploadingReceipt === 888888 ? 'PROCESSANDO...' : formData.report_url ? 'RELATÓRIO ANEXADO ✓' : 'ANEXAR RELATÓRIO'}
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Anexar Comprovante na Venda */}
                                    <div className="pt-4 border-t border-white/5 mt-4">
                                        <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Upload size={14} /> COMPROVANTE DE PAGAMENTO
                                        </h3>
                                        <div className="flex gap-4 items-center">
                                            <input 
                                                type="file" 
                                                id="sale-receipt-upload"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setUploadingReceipt(999999);
                                                    try {
                                                        const fileData = new FormData();
                                                        fileData.append('file', file);
                                                        const uploadRes = await fetch('/api/upload', {
                                                            method: 'POST',
                                                            body: fileData
                                                        });
                                                        if (uploadRes.ok) {
                                                            const uploadData = await uploadRes.json();
                                                            setFormData(prev => ({ ...prev, receipt_url: uploadData.fileUrl }));
                                                            alert("Comprovante anexado com sucesso!");
                                                        } else {
                                                            alert("Falha ao enviar comprovante.");
                                                        }
                                                    } catch (err) {
                                                        console.error("Error uploading sale receipt:", err);
                                                    } finally {
                                                        setUploadingReceipt(null);
                                                    }
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                            <label 
                                                htmlFor="sale-receipt-upload" 
                                                style={{ background: 'rgba(172, 248, 0, 0.1)', border: '1px solid rgba(172, 248, 0, 0.2)', color: 'var(--primary-color)', borderRadius: '12px', padding: '12px 16px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}
                                            >
                                                {uploadingReceipt === 999999 ? 'ENVIANDO...' : formData.receipt_url ? 'COMPROVANTE ANEXADO ✓' : 'ANEXAR COMPROVANTE'}
                                            </label>
                                        </div>
                                    </div>

                                    {clientBalance > 0 && !editingSale && (
                                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(250, 204, 21, 0.05)', border: '1px solid rgba(250, 204, 21, 0.2)', borderRadius: '16px' }}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#facc15', fontWeight: 900 }}>SALDO DISPONÍVEL DO CLIENTE</span>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>R$ {clientBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={useClientBalance} onChange={(e) => setUseClientBalance(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#facc15' }} />
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>Abater na Compra</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {formData.client_name && (
                                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Projeção Pós-Venda</span>
                                            <div className="flex justify-between items-center border-t border-white/5 pt-2">
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>Saldo de Disparos Restante:</span>
                                                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 900 }}>
                                                    {(() => {
                                                        const current = dbClients.find(c => c.name === formData.client_name)?.disparo_quantidade || 0;
                                                        const delivered = parseInt(String(formData.quantity_delivered)) || 0;
                                                        return (current - delivered).toLocaleString('pt-BR');
                                                    })()} disparos
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>Saldo Financeiro Restante:</span>
                                                <span style={{ fontSize: '0.85rem', color: '#facc15', fontWeight: 900 }}>
                                                    R$ {(clientBalance - (useClientBalance ? Math.min(clientBalance, formData.total_value) : 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ padding: '24px', background: 'rgba(172, 248, 0, 0.08)', borderRadius: '20px', border: '1px solid rgba(172, 248, 0, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', boxShadow: '0 10px 30px rgba(172, 248, 0, 0.1)' }}>
                                        <div className="flex justify-between items-center">
                                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Faturamento Bruto</span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-secondary)' }}>R$ {formData.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        {useClientBalance && (
                                            <div className="flex justify-between items-center border-t border-white/5 pt-2">
                                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#facc15', textTransform: 'uppercase', letterSpacing: '1px' }}>Desconto Saldo Abatido</span>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#facc15' }}>- R$ {Math.min(clientBalance, formData.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center border-t border-white/5 pt-2">
                                            <div className="flex flex-col">
                                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>Valor a Pagar Agora</span>
                                            </div>
                                            <span style={{ fontSize: '1.8rem', fontWeight: 1000, color: 'var(--primary-color)', letterSpacing: '-1px' }}>R$ {(useClientBalance ? Math.max(0, formData.total_value - clientBalance) : formData.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
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
                </div>,
                document.body
            )}

            {isMassActionModalOpen && createPortal(
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
                </div>,
                document.body
            )}

            {isWhatsAppModalOpen && createPortal(
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
                </div>,
                document.body
            )}
        </div>
    );
};

export default FinanceSales;
