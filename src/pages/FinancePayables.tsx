import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, List, Upload, FileText, CheckCircle2, Clock, CreditCard } from 'lucide-react';
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

const ACCOUNT_TYPES = ['Aluguel', 'Telefone', 'Internet', 'Energia', 'Água', 'Impostos', 'Marketing', 'Outros'];
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

const FinancePayables = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'nova' | 'consulta'>('consulta');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [payables, setPayables] = useState<Payable[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSupplier, setFilterSupplier] = useState('');
    const [filterType, setFilterType] = useState('');

    const [formData, setFormData] = useState<Partial<Payable>>({
        type: 'Outros',
        status: 'Pendente',
        launch_date: new Date().toISOString().split('T')[0],
        responsible: user?.name || ''
    });
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState('');

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

        const { data: pData } = await query;
        if (pData) setPayables(pData as any);
        
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterSupplier, filterType]);

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

    const [isFinishing, setIsFinishing] = useState<number | null>(null);
    const [finishFileUrl, setFinishFileUrl] = useState('');
    const [finishUploading, setFinishUploading] = useState(false);

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
        const { error, data: insertedData } = await supabase.from('finance_payables').insert([formData]).select().single();
        setLoading(false);
        if (!error && insertedData) {
            alert('Conta adicionada com sucesso!');
            
            // Send webhook notification
            const dateObj = new Date(formData.launch_date || '');
            const dateFormatted = `${String(dateObj.getUTCDate()).padStart(2, '0')}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${dateObj.getUTCFullYear()}`;
            
            let msgText = `Nova conta de ${formData.type} no valor de R$ ${formData.value} adicionada para o fornecedor. Data: ${dateFormatted}.`;
            if (formData.attachment_url) {
                msgText += `\n\n📄 Anexo/Comprovante: ${formData.attachment_url}`;
            }
            sendAccountingNotification(
                'NOVA_CONTA_PAGAR',
                `Nova conta adicionada: ${formData.description || formData.type}`,
                msgText,
                { payable: insertedData }
            );

            setFormData({ type: 'Outros', status: 'Pendente', launch_date: new Date().toISOString().split('T')[0], responsible: user?.name || '' });
            setFileUrl('');
            setActiveTab('consulta');
            fetchData();
        } else {
            alert('Erro: ' + (error?.message || 'Desconhecido'));
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
        
        // Find payable to send in webhook
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
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const getStatusIcon = (status: string) => {
        if (status === 'Paga') return <CheckCircle2 size={16} style={{ color: 'var(--primary-color)' }} />;
        if (status === 'Aprovada') return <CheckCircle2 size={16} style={{ color: '#60a5fa' }} />;
        return <Clock size={16} style={{ color: '#facc15' }} />;
    };

    const rowBgHover = (e: React.MouseEvent<HTMLTableRowElement>, enter: boolean) => {
        e.currentTarget.style.background = enter ? 'rgba(255,255,255,0.05)' : 'transparent';
    };

    const cellPad = { padding: '16px 24px' };

    return (
        <div className="finance-page animate-fade-in" style={{ padding: "40px", paddingBottom: "80px" }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '24px', marginBottom: '32px' }}>
                <div>
                    <h1>Contas a Pagar</h1>
                    <p className="subtitle">Gestão de pagamentos e aprovações</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', alignSelf: 'flex-start' as const }}>
                    <button onClick={() => setActiveTab('consulta')} style={tabBase(activeTab === 'consulta')}>
                        <List size={16}/> Consultar Contas
                    </button>
                    <button onClick={() => setActiveTab('nova')} style={tabBase(activeTab === 'nova')}>
                        <Plus size={16}/> Nova Conta
                    </button>
                </div>
            </div>

            {loading && <SupremeLoading />}

            {!loading && activeTab === 'consulta' && (
                <div style={{ marginTop: '32px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'flex-end' as const, gap: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
                            <span style={labelBase}>Status</span>
                            <select style={selectBase} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="" style={{ background: '#000' }}>Todos</option>
                                {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#000' }}>{s}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
                            <span style={labelBase}>Fornecedor</span>
                            <select style={selectBase} value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}>
                                <option value="" style={{ background: '#000' }}>Todos</option>
                                {suppliers.map(s => <option key={s.id} value={s.id} style={{ background: '#000' }}>{s.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
                            <span style={labelBase}>Tipo</span>
                            <select style={selectBase} value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option value="" style={{ background: '#000' }}>Todos</option>
                                {ACCOUNT_TYPES.map(t => <option key={t} value={t} style={{ background: '#000' }}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)", overflowX: 'auto' as const }}>
                        <table style={{ width: '100%', textAlign: 'left' as const, fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', borderCollapse: 'collapse' as const }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase' as const, fontSize: '10px', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '16px 24px', fontWeight: 500 }}>Conta / Fornecedor</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 500 }}>Tipo</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 500 }}>Vencimento</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 500 }}>Valor</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 500 }}>Status</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 500, textAlign: 'right' as const }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payables.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                        onMouseEnter={e => rowBgHover(e, true)}
                                        onMouseLeave={e => rowBgHover(e, false)}>
                                        <td style={cellPad}>
                                            <div>
                                                <span style={{ fontWeight: 700, color: 'white' }}>{p.finance_suppliers?.name || 'Sem Fornecedor'}</span>
                                                <br />
                                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.description || '-'}</span>
                                            </div>
                                        </td>
                                        <td style={cellPad}><span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>{p.type}</span></td>
                                        <td style={cellPad}>
                                            <span style={{ fontWeight: 700, color: new Date(p.due_date) < new Date() && p.status !== 'Paga' ? '#f87171' : 'white' }}>
                                                {new Date(p.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </span>
                                        </td>
                                        <td style={{ ...cellPad, fontWeight: 700, fontSize: '15px' }}>{formatCurrency(p.value)}</td>
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
                                {payables.length === 0 && (
                                    <tr><td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center' as const, color: 'rgba(255,255,255,0.4)' }}>Nenhuma conta encontrada.</td></tr>
                                )}
                            </tbody>
                        </table>
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
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                <label style={labelBase}>Data de Lançamento *</label>
                                <input required type="date" style={inputBase} value={formData.launch_date || ''} onChange={e => setFormData({...formData, launch_date: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                <label style={labelBase}>Data de Vencimento *</label>
                                <input required type="date" style={inputBase} value={formData.due_date || ''} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                            </div>
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
