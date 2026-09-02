import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, List, Upload, FileText, CheckCircle2, Clock, CreditCard, X, Edit2, Trash2, Calendar, Filter, RotateCcw, ChevronLeft, ChevronRight, DollarSign, Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import SupremeLoading from '../components/SupremeLoading';
import { useAuth } from '../contexts/AuthContext';
import { sendAccountingNotification } from '../services/webhookService';

interface Supplier {
    id: number;
    name: string;
}

interface Payable {
    id: number;
    supplier_id: number;
    launch_date: string;
    due_date: string;
    type: string;
    value: number;
    description: string;
    attachment_url: string;
    responsible: string;
    status: string;
    finance_suppliers?: Supplier;
}

const ACCOUNT_TYPES = ['Aluguel', 'Telefone', 'Internet', 'Energia', 'Água', 'Impostos', 'Marketing', 'Uso e Consumo', 'Despesa Operacional', 'Outros'];
const STATUS_OPTIONS = ['Pendente', 'Aprovada', 'Paga'];

const labelBase: React.CSSProperties = { fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' as const, paddingLeft: '4px' };
const inputBase: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%', outline: 'none' };
const selectBase: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', color: 'white', fontWeight: 800, fontSize: '0.85rem', padding: '12px 16px', outline: 'none', cursor: 'pointer' };
const tabBase = (active: boolean): React.CSSProperties => ({
    background: active ? 'var(--primary-color)' : 'transparent',
    color: active ? 'black' : 'rgba(255,255,255,0.6)',
    borderRadius: '12px',
    padding: '10px 24px',
    fontWeight: 800,
    fontSize: '0.85rem',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
});

const getPresetDates = (preset: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (preset === 'hoje') {
        return { start: today, end: today };
    }
    if (preset === 'esta_semana') {
        const firstDay = new Date(now);
        const dayOfWeek = now.getDay() || 7;
        firstDay.setDate(now.getDate() - dayOfWeek + 1);
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        return {
            start: firstDay.toISOString().split('T')[0],
            end: lastDay.toISOString().split('T')[0]
        };
    }
    if (preset === 'este_mes') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
            start: firstDay.toISOString().split('T')[0],
            end: lastDay.toISOString().split('T')[0]
        };
    }
    if (preset === 'mes_passado') {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
            start: firstDay.toISOString().split('T')[0],
            end: lastDay.toISOString().split('T')[0]
        };
    }
    if (preset === 'este_ano') {
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), 11, 31);
        return {
            start: firstDay.toISOString().split('T')[0],
            end: lastDay.toISOString().split('T')[0]
        };
    }
    return { start: '', end: '' };
};

const FinancePayables = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'nova' | 'consulta'>('consulta');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [payables, setPayables] = useState<Payable[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Search and Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSupplier, setFilterSupplier] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDueStatus, setFilterDueStatus] = useState('');
    
    // Date Filters
    const [dateField, setDateField] = useState<'due_date' | 'launch_date'>('due_date');
    const [datePreset, setDatePreset] = useState('todos');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Form data for creating new payable
    const [formData, setFormData] = useState<Partial<Payable>>({
        type: 'Outros',
        status: 'Pendente',
        launch_date: new Date().toISOString().split('T')[0],
        responsible: user?.name || ''
    });
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDay, setRecurringDay] = useState('');
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [fileUrl, setFileUrl] = useState('');

    // Editing modal state
    const [editingPayable, setEditingPayable] = useState<Payable | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Payable>>({});
    const [editUploading, setEditUploading] = useState(false);
    const [editSaving, setEditSaving] = useState(false);

    // Finishing payable state
    const [isFinishing, setIsFinishing] = useState<number | null>(null);
    const [finishFileUrl, setFinishFileUrl] = useState('');
    const [finishUploading, setFinishUploading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const { data: sData } = await supabase.from('finance_suppliers').select('id, name');
        if (sData) setSuppliers(sData as Supplier[]);

        let query = supabase.from('finance_payables').select(`
            *,
            finance_suppliers ( id, name )
        `).order('due_date', { ascending: true });

        if (filterStatus) query = query.eq('status', filterStatus);
        if (filterSupplier) query = query.eq('supplier_id', filterSupplier);
        if (filterType) query = query.eq('type', filterType);
        
        if (startDate) {
            query = query.gte(dateField, startDate);
        }
        if (endDate) {
            query = query.lte(dateField, endDate);
        }

        const { data: pData } = await query;
        if (pData) setPayables(pData as any);
        
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        setPage(1);
    }, [filterStatus, filterSupplier, filterType, dateField, startDate, endDate]);

    const handlePresetChange = (preset: string) => {
        setDatePreset(preset);
        if (preset === 'custom') return;
        const { start, end } = getPresetDates(preset);
        setStartDate(start);
        setEndDate(end);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('');
        setFilterSupplier('');
        setFilterType('');
        setFilterDueStatus('');
        setDateField('due_date');
        setDatePreset('todos');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    const handleExportExcel = () => {
        if (filteredPayables.length === 0) {
            alert('Nenhuma conta a pagar para exportar.');
            return;
        }

        const exportData = filteredPayables.map(p => ({
            'ID': p.id,
            'Fornecedor': p.finance_suppliers?.name || 'Sem Fornecedor',
            'Tipo de Conta': p.type || '',
            'Data de Lançamento': p.launch_date ? new Date(p.launch_date + 'T00:00:00').toLocaleDateString('pt-BR') : '',
            'Data de Vencimento': p.due_date ? new Date(p.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '',
            'Valor (R$)': p.value || 0,
            'Status': p.status || '',
            'Responsável': p.responsible || '',
            'Descrição': p.description || '',
            'Link do Anexo': p.attachment_url || ''
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contas a Pagar");
        
        const fileName = `contas_a_pagar_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            });
            
            if (!uploadRes.ok) throw new Error("Upload failed");
            
            const uploadData = await uploadRes.json();
            const hostedUrl = uploadData.url || `${window.location.origin}${uploadData.path}`;
            
            setFileUrl(hostedUrl);
            setFormData({ ...formData, attachment_url: hostedUrl });
        } catch (err) {
            console.error(err);
            alert("Erro no upload do anexo.");
        } finally {
            setUploading(false);
        }
    };

    const handleFinishFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setFinishUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            });
            
            if (!uploadRes.ok) throw new Error("Upload failed");
            
            const uploadData = await uploadRes.json();
            const hostedUrl = uploadData.url || `${window.location.origin}${uploadData.path}`;
            
            setFinishFileUrl(hostedUrl);
        } catch (err) {
            console.error(err);
            alert("Erro no upload do comprovante.");
        } finally {
            setFinishUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.status === 'Paga' && !formData.attachment_url) {
            alert('Por favor, anexe o comprovante de pagamento ao marcar a conta como Paga.');
            return;
        }

        setLoading(true);
        let inserts = [];
        if (isRecurring && recurringDay) {
            const day = parseInt(recurringDay);
            const currentDate = new Date();
            let startMonth = currentDate.getMonth();
            let startYear = currentDate.getFullYear();
            
            for (let i = 0; i < 12; i++) {
                let m = startMonth + i;
                let y = startYear;
                if (m > 11) {
                    y += Math.floor(m / 12);
                    m = m % 12;
                }
                
                let lastDay = new Date(y, m + 1, 0).getDate();
                let actualDay = Math.min(day, lastDay);
                let dueDateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;
                
                inserts.push({
                    ...formData,
                    due_date: dueDateStr
                });
            }
        } else {
            inserts.push(formData);
        }

        const { error, data: insertedData } = await supabase.from('finance_payables').insert(inserts).select();
        setLoading(false);
        if (!error && insertedData && insertedData.length > 0) {
            alert(isRecurring ? 'Contas recorrentes adicionadas com sucesso!' : 'Conta adicionada com sucesso!');
            
            const firstInsert = insertedData[0];
            const dateObj = new Date(firstInsert.launch_date || '');
            const dateFormatted = `${String(dateObj.getUTCDate()).padStart(2, '0')}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${dateObj.getUTCFullYear()}`;
            
            let msgText = `Nova conta${isRecurring ? ' recorrente' : ''} de ${firstInsert.type} no valor de R$ ${firstInsert.value} adicionada para o fornecedor. Data: ${dateFormatted}.`;
            if (firstInsert.attachment_url) {
                msgText += `\n\n📄 Anexo/Comprovante: ${firstInsert.attachment_url}`;
            }
            sendAccountingNotification(
                'NOVA_CONTA_PAGAR',
                `Nova conta adicionada: ${firstInsert.description || firstInsert.type}`,
                msgText,
                { payable: firstInsert }
            );

            setFormData({ type: 'Outros', status: 'Pendente', launch_date: new Date().toISOString().split('T')[0], responsible: user?.name || '' });
            setIsRecurring(false);
            setRecurringDay('');
            setFileUrl('');
            setActiveTab('consulta');
            fetchData();
        } else {
            alert('Erro: ' + (error?.message || 'Desconhecido'));
        }
    };

    // --- Editar Conta ---
    const handleOpenEdit = (payable: Payable) => {
        setEditingPayable(payable);
        setEditFormData({
            supplier_id: payable.supplier_id,
            type: payable.type,
            launch_date: payable.launch_date,
            due_date: payable.due_date,
            value: payable.value,
            description: payable.description || '',
            attachment_url: payable.attachment_url || '',
            responsible: payable.responsible || '',
            status: payable.status
        });
    };

    const handleEditFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setEditUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            });
            
            if (!uploadRes.ok) throw new Error("Upload failed");
            
            const uploadData = await uploadRes.json();
            const hostedUrl = uploadData.url || `${window.location.origin}${uploadData.path}`;
            
            setEditFormData(prev => ({ ...prev, attachment_url: hostedUrl }));
        } catch (err) {
            console.error(err);
            alert("Erro no upload do anexo.");
        } finally {
            setEditUploading(false);
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPayable) return;

        if (editFormData.status === 'Paga' && !editFormData.attachment_url) {
            alert('Por favor, anexe o comprovante de pagamento ao marcar a conta como Paga.');
            return;
        }

        setEditSaving(true);
        const { error } = await supabase
            .from('finance_payables')
            .update({
                supplier_id: editFormData.supplier_id,
                type: editFormData.type,
                launch_date: editFormData.launch_date,
                due_date: editFormData.due_date,
                value: editFormData.value,
                description: editFormData.description,
                attachment_url: editFormData.attachment_url,
                status: editFormData.status
            })
            .eq('id', editingPayable.id);

        setEditSaving(false);
        if (!error) {
            alert('Conta atualizada com sucesso!');
            setEditingPayable(null);
            fetchData();
        } else {
            alert('Erro ao atualizar conta: ' + error.message);
        }
    };

    // --- Excluir Conta ---
    const handleDeletePayable = async (id: number, desc?: string) => {
        const confirmMsg = desc 
            ? `Tem certeza que deseja excluir a conta "${desc}"?` 
            : 'Tem certeza que deseja excluir esta conta a pagar?';
        
        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        const { error } = await supabase.from('finance_payables').delete().eq('id', id);
        setLoading(false);

        if (!error) {
            alert('Conta excluída com sucesso!');
            fetchData();
        } else {
            alert('Erro ao excluir conta: ' + error.message);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        if (newStatus === 'Paga') {
            const payable = payables.find(p => p.id === id);
            if (!payable?.attachment_url) {
                setIsFinishing(id);
                return;
            }
        }
        await processStatusUpdate(id, newStatus, null);
    };

    const confirmFinishPayable = async () => {
        if (!isFinishing || !finishFileUrl) return;
        await processStatusUpdate(isFinishing, 'Paga', finishFileUrl);
        setIsFinishing(null);
        setFinishFileUrl('');
    };

    const processStatusUpdate = async (id: number, newStatus: string, attachmentUrl: string | null) => {
        const updateData: any = { status: newStatus };
        if (attachmentUrl) updateData.attachment_url = attachmentUrl;
        
        await supabase.from('finance_payables').update(updateData).eq('id', id);
        
        const payable = payables.find(p => p.id === id);
        if (payable) {
            const now = new Date();
            const dateFormatted = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
            
            let msg = `O status da conta foi alterado para ${newStatus}.`;
            if (newStatus === 'Paga') {
                msg = `A conta de ${payable.type} (Fornecedor: ${payable.finance_suppliers?.name || 'Sem Fornecedor'}) foi paga com sucesso na data de hoje (${dateFormatted}).`;
            } else if (newStatus === 'Aprovada') {
                msg = `A conta de ${payable.type} (Fornecedor: ${payable.finance_suppliers?.name || 'Sem Fornecedor'}) foi aprovada em ${dateFormatted}.`;
            }
            
            const finalAttachment = attachmentUrl || payable.attachment_url;
            if (finalAttachment) {
                msg += `\n\n📄 Anexo da Conta: ${finalAttachment}`;
            }

            const payloadPayable = { ...payable, ...updateData };

            sendAccountingNotification(
                'ALTERACAO_STATUS_CONTA',
                `Status da conta alterado para ${newStatus}`,
                msg,
                { payable: payloadPayable }
            );
        }

        fetchData();
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    };

    const getStatusIcon = (status: string) => {
        if (status === 'Paga') return <CheckCircle2 size={16} style={{ color: 'var(--primary-color)' }} />;
        if (status === 'Aprovada') return <CheckCircle2 size={16} style={{ color: '#60a5fa' }} />;
        return <Clock size={16} style={{ color: '#facc15' }} />;
    };

    // Filtered payables with search & due status filter
    const filteredPayables = payables.filter(p => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const supplierName = p.finance_suppliers?.name?.toLowerCase() || '';
            const desc = p.description?.toLowerCase() || '';
            const type = p.type?.toLowerCase() || '';
            const resp = p.responsible?.toLowerCase() || '';
            if (!supplierName.includes(term) && !desc.includes(term) && !type.includes(term) && !resp.includes(term)) {
                return false;
            }
        }

        if (filterDueStatus) {
            const todayStr = new Date().toISOString().split('T')[0];
            const dueDateStr = p.due_date;
            if (!dueDateStr) return false;

            if (filterDueStatus === 'overdue') {
                if (p.status === 'Paga' || dueDateStr >= todayStr) return false;
            } else if (filterDueStatus === 'today') {
                if (dueDateStr !== todayStr) return false;
            } else if (filterDueStatus === 'next_7') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const in7Days = new Date(today);
                in7Days.setDate(today.getDate() + 7);
                const due = new Date(dueDateStr + 'T00:00:00');
                if (due < today || due > in7Days) return false;
            } else if (filterDueStatus === 'this_month') {
                const today = new Date();
                const due = new Date(dueDateStr + 'T00:00:00');
                if (due.getMonth() !== today.getMonth() || due.getFullYear() !== today.getFullYear()) return false;
            }
        }

        return true;
    });

    // KPI Totals
    const totalCount = filteredPayables.length;
    const totalValue = filteredPayables.reduce((acc, p) => acc + (p.value || 0), 0);
    const totalPendente = filteredPayables.filter(p => p.status === 'Pendente').reduce((acc, p) => acc + (p.value || 0), 0);
    const totalAprovada = filteredPayables.filter(p => p.status === 'Aprovada').reduce((acc, p) => acc + (p.value || 0), 0);
    const totalPaga = filteredPayables.filter(p => p.status === 'Paga').reduce((acc, p) => acc + (p.value || 0), 0);

    const totalPages = Math.ceil(filteredPayables.length / itemsPerPage) || 1;
    const paginatedPayables = filteredPayables.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const rowBgHover = (e: React.MouseEvent<HTMLTableRowElement>, enter: boolean) => {
        e.currentTarget.style.background = enter ? 'rgba(255,255,255,0.05)' : 'transparent';
    };

    const cellPad = { padding: '16px 20px' };

    return (
        <div className="finance-page animate-fade-in p-4 md:p-10 pb-20 md:pb-20">
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1>Contas a Pagar</h1>
                        <p className="subtitle">Gestão completa de pagamentos, aprovações e fornecedores</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignSelf: 'flex-start' as const }}>
                        <button 
                            onClick={handleExportExcel} 
                            style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '12px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                            title="Baixar Relatório Excel"
                        >
                            <Download size={16} /> Exportar Excel
                        </button>
                        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <button onClick={() => setActiveTab('consulta')} style={tabBase(activeTab === 'consulta')}>
                                <List size={16}/> Consultar Contas
                            </button>
                            <button onClick={() => setActiveTab('nova')} style={tabBase(activeTab === 'nova')}>
                                <Plus size={16}/> Nova Conta
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                {activeTab === 'consulta' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(20px)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Total Filtrado</span>
                                <DollarSign size={18} style={{ color: 'var(--primary-color)' }} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', margin: 0 }}>{formatCurrency(totalValue)}</h3>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{totalCount} conta(s) registrada(s)</span>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(20px)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase' }}>Pendentes</span>
                                <Clock size={18} style={{ color: '#facc15' }} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#facc15', margin: 0 }}>{formatCurrency(totalPendente)}</h3>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Aguardando pagamento</span>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(20px)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase' }}>Aprovadas</span>
                                <CheckCircle2 size={18} style={{ color: '#60a5fa' }} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#60a5fa', margin: 0 }}>{formatCurrency(totalAprovada)}</h3>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Aprovadas p/ liquidação</span>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', backdropFilter: 'blur(20px)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase' }}>Pagas</span>
                                <CheckCircle2 size={18} style={{ color: 'var(--primary-color)' }} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-color)', margin: 0 }}>{formatCurrency(totalPaga)}</h3>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Pagamentos finalizados</span>
                        </div>
                    </div>
                )}
            </div>

            {loading && <SupremeLoading />}

            {!loading && activeTab === 'consulta' && (
                <div style={{ marginTop: '16px' }}>
                    {/* Filters Container */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>
                                <Filter size={18} style={{ color: 'var(--primary-color)' }} />
                                Filtros de Pesquisa e Vencimento
                            </div>
                            <button 
                                onClick={handleExportExcel} 
                                style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Download size={14} /> Download Planilha Excel
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
                            {/* Search Term */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2 / span 2' }}>
                                <span style={labelBase}>Buscar por descrição, fornecedor ou responsável</span>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Digite para pesquisar..." 
                                        style={{ ...inputBase, paddingLeft: '40px' }} 
                                        value={searchTerm} 
                                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }} 
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={labelBase}>Status</span>
                                <select style={selectBase} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                    <option value="" style={{ background: '#000' }}>Todos os Status</option>
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#000' }}>{s}</option>)}
                                </select>
                            </div>

                            {/* Situação do Vencimento */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={labelBase}>Situação de Vencimento</span>
                                <select style={selectBase} value={filterDueStatus} onChange={e => setFilterDueStatus(e.target.value)}>
                                    <option value="" style={{ background: '#000' }}>Todos os Vencimentos</option>
                                    <option value="overdue" style={{ background: '#000' }}>🚨 Vencidas (Atrasadas)</option>
                                    <option value="today" style={{ background: '#000' }}>📅 Vencem Hoje</option>
                                    <option value="next_7" style={{ background: '#000' }}>⏳ Vencem nos próximos 7 dias</option>
                                    <option value="this_month" style={{ background: '#000' }}>🗓️ Vencem este mês</option>
                                </select>
                            </div>

                            {/* Fornecedor */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={labelBase}>Fornecedor</span>
                                <select style={selectBase} value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}>
                                    <option value="" style={{ background: '#000' }}>Todos os Fornecedores</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id} style={{ background: '#000' }}>{s.name}</option>)}
                                </select>
                            </div>

                            {/* Tipo */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={labelBase}>Tipo de Conta</span>
                                <select style={selectBase} value={filterType} onChange={e => setFilterType(e.target.value)}>
                                    <option value="" style={{ background: '#000' }}>Todos os Tipos</option>
                                    {ACCOUNT_TYPES.map(t => <option key={t} value={t} style={{ background: '#000' }}>{t}</option>)}
                                </select>
                            </div>

                            {/* Campo de Data */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={labelBase}>Filtrar Data por</span>
                                <select style={selectBase} value={dateField} onChange={e => setDateField(e.target.value as any)}>
                                    <option value="due_date" style={{ background: '#000' }}>Data de Vencimento</option>
                                    <option value="launch_date" style={{ background: '#000' }}>Data de Lançamento</option>
                                </select>
                            </div>

                            {/* Preset de Data */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={labelBase}>Atalho de Período</span>
                                <select style={selectBase} value={datePreset} onChange={e => handlePresetChange(e.target.value)}>
                                    <option value="todos" style={{ background: '#000' }}>Todas as Datas</option>
                                    <option value="hoje" style={{ background: '#000' }}>Hoje</option>
                                    <option value="esta_semana" style={{ background: '#000' }}>Esta Semana</option>
                                    <option value="este_mes" style={{ background: '#000' }}>Este Mês</option>
                                    <option value="mes_passado" style={{ background: '#000' }}>Mês Passado</option>
                                    <option value="este_ano" style={{ background: '#000' }}>Este Ano</option>
                                    <option value="custom" style={{ background: '#000' }}>Personalizado</option>
                                </select>
                            </div>

                            {/* Data Inicial */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={labelBase}>Data Inicial</span>
                                <input 
                                    type="date" 
                                    style={inputBase} 
                                    value={startDate} 
                                    onChange={e => { setStartDate(e.target.value); setDatePreset('custom'); }} 
                                />
                            </div>

                            {/* Data Final */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={labelBase}>Data Final</span>
                                <input 
                                    type="date" 
                                    style={inputBase} 
                                    value={endDate} 
                                    onChange={e => { setEndDate(e.target.value); setDatePreset('custom'); }} 
                                />
                            </div>

                            {/* Clear Filters Button */}
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button 
                                    type="button" 
                                    onClick={handleClearFilters}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', padding: '12px 16px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}
                                >
                                    <RotateCcw size={14} /> Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)", overflowX: 'auto' as const }}>
                        <table style={{ width: '100%', textAlign: 'left' as const, fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', borderCollapse: 'collapse' as const }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase' as const, fontSize: '10px', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '16px 20px', fontWeight: 500 }}>Conta / Fornecedor</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 500 }}>Tipo</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 500 }}>Lançamento</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 500 }}>Vencimento</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 500 }}>Valor</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 500 }}>Status</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 500, textAlign: 'right' as const }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPayables.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                        onMouseEnter={e => rowBgHover(e, true)}
                                        onMouseLeave={e => rowBgHover(e, false)}>
                                        <td style={cellPad}>
                                            <div>
                                                <span style={{ fontWeight: 700, color: 'white' }}>{p.finance_suppliers?.name || 'Sem Fornecedor'}</span>
                                                <br />
                                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', maxWidth: '220px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                                                    {p.description || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={cellPad}>
                                            <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                {p.type}
                                            </span>
                                        </td>
                                        <td style={cellPad}>
                                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                                                {p.launch_date ? new Date(p.launch_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                                            </span>
                                        </td>
                                        <td style={cellPad}>
                                            <span style={{ fontWeight: 700, color: new Date(p.due_date) < new Date() && p.status !== 'Paga' ? '#f87171' : 'white' }}>
                                                {p.due_date ? new Date(p.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                                            </span>
                                        </td>
                                        <td style={{ ...cellPad, fontWeight: 700, fontSize: '15px', color: 'white' }}>
                                            {formatCurrency(p.value)}
                                        </td>
                                        <td style={cellPad}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {getStatusIcon(p.status)}
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                                                    color: p.status === 'Paga' ? 'var(--primary-color)' : p.status === 'Aprovada' ? '#60a5fa' : '#facc15' }}>{p.status}</span>
                                            </div>
                                        </td>
                                        <td style={{ ...cellPad, textAlign: 'right' as const }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                {p.attachment_url && (
                                                    <a href={p.attachment_url} target="_blank" rel="noreferrer" style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'all 0.2s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                                        title="Ver Anexo">
                                                        <FileText size={16} />
                                                    </a>
                                                )}
                                                
                                                {/* Editar */}
                                                <button 
                                                    onClick={() => handleOpenEdit(p)}
                                                    style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#60a5fa', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    title="Editar Conta"
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                {/* Excluir */}
                                                <button 
                                                    onClick={() => handleDeletePayable(p.id, p.description || p.finance_suppliers?.name)}
                                                    style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    title="Excluir Conta"
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                {/* Status Selector */}
                                                <select 
                                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 8px', fontSize: '0.75rem', outline: 'none', color: 'white', cursor: 'pointer' }}
                                                    value={p.status}
                                                    onChange={e => updateStatus(p.id, e.target.value)}
                                                >
                                                    {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#000' }}>{s}</option>)}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPayables.length === 0 && (
                                    <tr><td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center' as const, color: 'rgba(255,255,255,0.4)' }}>Nenhuma conta encontrada com os filtros selecionados.</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Bar */}
                        {filteredPayables.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Página {page} de {totalPages} ({filteredPayables.length} itens)</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                                        disabled={page === 1}
                                        style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <ChevronLeft size={16} /> Anterior
                                    </button>
                                    <button 
                                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
                                        disabled={page >= totalPages}
                                        style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        Próximo <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!loading && activeTab === 'nova' && (
                <div style={{ marginTop: '32px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto', padding: '32px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px' }}>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>Lançar Nova Conta</h2>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Preencha os dados do pagamento</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                <label style={labelBase}>Fornecedor / Prestador *</label>
                                <select required style={inputBase} value={formData.supplier_id || ''} onChange={e => setFormData({...formData, supplier_id: parseInt(e.target.value)})}>
                                    <option value="" style={{ background: '#000' }}>Selecione...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id} style={{ background: '#000' }}>{s.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                <label style={labelBase}>Tipo de Conta *</label>
                                <select required style={inputBase} value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    {ACCOUNT_TYPES.map(t => <option key={t} value={t} style={{ background: '#000' }}>{t}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', ...labelBase, fontSize: '0.8rem', color: 'white', textTransform: 'none' }}>
                                    <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }} />
                                    Conta Recorrente (Mensal)
                                </label>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                <label style={labelBase}>Data de Lançamento *</label>
                                <input required type="date" style={inputBase} value={formData.launch_date || ''} onChange={e => setFormData({...formData, launch_date: e.target.value})} />
                            </div>
                            {isRecurring ? (
                                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                    <label style={labelBase}>Dia de Vencimento *</label>
                                    <input required type="number" min="1" max="31" style={inputBase} placeholder="Ex: 15" value={recurringDay} onChange={e => setRecurringDay(e.target.value)} />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                    <label style={labelBase}>Data de Vencimento *</label>
                                    <input required type="date" style={inputBase} value={formData.due_date || ''} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                <label style={labelBase}>Valor (R$) *</label>
                                <input required type="number" step="0.01" style={inputBase} placeholder="0.00" value={formData.value || ''} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                <label style={labelBase}>Responsável</label>
                                <input type="text" style={{ ...inputBase, opacity: 0.6 }} value={formData.responsible || ''} disabled />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', marginTop: '24px' }}>
                            <label style={labelBase}>Descrição</label>
                            <textarea required style={{ ...inputBase, minHeight: '80px', resize: 'vertical' as const }} rows={3} placeholder="Descreva o motivo do pagamento..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', marginTop: '24px' }}>
                            <label style={labelBase}>Anexo (Boleto, Nota Fiscal, etc)</label>
                            <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, position: 'relative' as const, transition: 'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                                <input type="file" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} onChange={handleFileUpload} disabled={uploading} />
                                <Upload size={24} style={{ color: 'var(--primary-color)', marginBottom: '8px' }} />
                                {uploading ? (
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-color)' }}>Enviando...</span>
                                ) : fileUrl ? (
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4ade80' }}>Arquivo anexado com sucesso!</span>
                                ) : (
                                    <>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>Clique ou arraste um arquivo aqui</span>
                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>PDF, JPG, PNG (Máx 5MB)</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', marginTop: '24px' }}>
                            <button type="submit" style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '14px', padding: '16px 48px', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: uploading ? 0.5 : 1, transition: 'opacity 0.2s' }} disabled={uploading}>
                                Salvar Conta a Pagar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal de Edição de Conta */}
            {editingPayable && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Edit2 size={18} style={{ color: 'var(--primary-color)' }} />
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>Editar Conta a Pagar #{editingPayable.id}</h2>
                            </div>
                            <button onClick={() => setEditingPayable(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={labelBase}>Fornecedor *</label>
                                    <select required style={inputBase} value={editFormData.supplier_id || ''} onChange={e => setEditFormData({ ...editFormData, supplier_id: parseInt(e.target.value) })}>
                                        <option value="" style={{ background: '#000' }}>Selecione...</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id} style={{ background: '#000' }}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={labelBase}>Tipo de Conta *</label>
                                    <select required style={inputBase} value={editFormData.type || ''} onChange={e => setEditFormData({ ...editFormData, type: e.target.value })}>
                                        {ACCOUNT_TYPES.map(t => <option key={t} value={t} style={{ background: '#000' }}>{t}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={labelBase}>Data de Lançamento *</label>
                                    <input required type="date" style={inputBase} value={editFormData.launch_date || ''} onChange={e => setEditFormData({ ...editFormData, launch_date: e.target.value })} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={labelBase}>Data de Vencimento *</label>
                                    <input required type="date" style={inputBase} value={editFormData.due_date || ''} onChange={e => setEditFormData({ ...editFormData, due_date: e.target.value })} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={labelBase}>Valor (R$) *</label>
                                    <input required type="number" step="0.01" style={inputBase} value={editFormData.value || ''} onChange={e => setEditFormData({ ...editFormData, value: parseFloat(e.target.value) })} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={labelBase}>Status *</label>
                                    <select required style={inputBase} value={editFormData.status || 'Pendente'} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#000' }}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={labelBase}>Descrição</label>
                                <textarea style={{ ...inputBase, minHeight: '70px', resize: 'vertical' as const }} rows={3} value={editFormData.description || ''} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={labelBase}>Anexo / Comprovante</label>
                                {editFormData.attachment_url && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#60a5fa', marginBottom: '4px' }}>
                                        <FileText size={14} />
                                        <a href={editFormData.attachment_url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Anexo atual</a>
                                    </div>
                                )}
                                <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <input type="file" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} onChange={handleEditFileUpload} disabled={editUploading} />
                                    {editUploading ? (
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>Enviando novo anexo...</span>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                                            <Upload size={16} />
                                            <span>Clique para alterar anexo</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                                <button type="button" onClick={() => setEditingPayable(null)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={editSaving || editUploading} style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '12px', padding: '10px 24px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', opacity: (editSaving || editUploading) ? 0.5 : 1 }}>
                                    {editSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Finalizar Pagamento (Anexar Comprovante) */}
            {isFinishing && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Anexar Comprovante</h2>
                            <button onClick={() => { setIsFinishing(null); setFinishFileUrl(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Para marcar esta conta como Paga, por favor, anexe o comprovante de pagamento.</p>
                            <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
                                <input type="file" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} onChange={handleFinishFileUpload} disabled={finishUploading} />
                                {finishUploading ? (
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-color)' }}>Enviando...</span>
                                ) : finishFileUrl ? (
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4ade80' }}>Arquivo anexado!</span>
                                ) : (
                                    <>
                                        <Upload size={24} style={{ color: 'var(--primary-color)', marginBottom: '8px' }} />
                                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>Clique para enviar</span>
                                    </>
                                )}
                            </div>
                            <button onClick={confirmFinishPayable} disabled={!finishFileUrl || finishUploading} style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 900, fontSize: '0.875rem', cursor: 'pointer', opacity: (!finishFileUrl || finishUploading) ? 0.5 : 1, transition: 'opacity 0.2s', marginTop: '8px' }}>
                                Confirmar Pagamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePayables;
FinancePayables;
