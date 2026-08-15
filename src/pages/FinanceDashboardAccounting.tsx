import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    Clock, CheckCircle2, AlertCircle, FileText, 
    Upload, X, Search, Filter, Calendar, DollarSign, CloudUpload
} from 'lucide-react';
import SupremeLoading from '../components/SupremeLoading';
import { sendAccountingNotification, exportFinanceDataToN8n } from '../services/webhookService';

export const FinanceDashboardAccounting = ({ user: _user }: { user: any }) => {
    const [payables, setPayables] = useState<any[]>([]);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [payablesPage, setPayablesPage] = useState(1);
    const [refundsPage, setRefundsPage] = useState(1);

    const [filterStatus, setFilterStatus] = useState('Pendente');
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterType, setFilterType] = useState('Todos');

    const [isFinishing, setIsFinishing] = useState<number | null>(null);
    const [finishFileUrl, setFinishFileUrl] = useState('');
    const [finishUploading, setFinishUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterMonth, filterYear, filterType]);

    const fetchData = async () => {
        setLoading(true);
        
        // Month range
        const start = new Date(filterYear, filterMonth, 1);
        const end = new Date(filterYear, filterMonth + 1, 0);
        
        const startDateStr = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2, '0')}-01`;
        const endDateStr = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

        let pQuery = supabase.from('finance_payables').select(`*, finance_suppliers(name)`).order('due_date', { ascending: true });
        let rQuery = supabase.from('finance_refunds').select('*').order('request_date', { ascending: false });
        let reqQuery = supabase.from('finance_requests').select('*').eq('type', 'Reembolso').order('created_at', { ascending: false });

        if (filterStatus === 'Pendente') {
            pQuery = pQuery.in('status', ['Pendente', 'Aprovada']);
            rQuery = rQuery.in('status', ['Solicitado', 'Aprovado']);
            reqQuery = reqQuery.in('status', ['Pendente', 'Aprovado']);
        } else if (filterStatus === 'Pago') {
            pQuery = pQuery.eq('status', 'Paga').gte('due_date', startDateStr).lte('due_date', endDateStr);
            rQuery = rQuery.eq('status', 'Pago').gte('request_date', startDateStr).lte('request_date', endDateStr);
            reqQuery = reqQuery.in('status', ['Finalizada', 'Pago']).gte('created_at', startDateStr).lte('created_at', endDateStr);
        } else {
            pQuery = pQuery.gte('due_date', startDateStr).lte('due_date', endDateStr);
            rQuery = rQuery.gte('request_date', startDateStr).lte('request_date', endDateStr);
            reqQuery = reqQuery.gte('created_at', startDateStr).lte('created_at', endDateStr);
        }

        if (filterType !== 'Todos') {
            pQuery = pQuery.eq('type', filterType);
        }

        const [pRes, rRes, reqRes] = await Promise.all([pQuery, rQuery, reqQuery]);
        
        if (pRes.data) setPayables(pRes.data);
        
        let allRefunds: any[] = [];
        if (rRes.data) {
            allRefunds = [...rRes.data];
        }
        if (reqRes.data) {
            const mappedReqs = reqRes.data.map(req => ({
                id: `req_${req.id}`,
                requester: req.requester,
                request_date: req.created_at,
                value: req.value || 0,
                description: req.notes,
                attachment_url: req.attachment_url,
                status: req.status === 'Finalizada' ? 'Pago' : req.status === 'Pendente' ? 'Solicitado' : req.status,
                isRequest: true
            }));
            allRefunds = [...allRefunds, ...mappedReqs];
        }

        allRefunds.sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime());
        setRefunds(allRefunds);

        setLoading(false);
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

    const confirmFinishPayable = async () => {
        if (!isFinishing || !finishFileUrl) return;
        
        await supabase.from('finance_payables').update({ status: 'Paga', attachment_url: finishFileUrl }).eq('id', isFinishing);
        
        const payable = payables.find(p => p.id === isFinishing);
        if (payable) {
            const now = new Date();
            const dateFormatted = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
            
            let msg = `A conta de ${payable.type} (Fornecedor: ${payable.finance_suppliers?.name || 'Sem Fornecedor'}) foi paga com sucesso na data de hoje (${dateFormatted}).\n\n📄 Anexo da Conta: ${finishFileUrl}`;
            
            const payloadPayable = { ...payable, status: 'Paga', attachment_url: finishFileUrl };

            sendAccountingNotification(
                'ALTERACAO_STATUS_CONTA',
                `Status da conta alterado para Paga`,
                msg,
                { payable: payloadPayable }
            );
        }

        setIsFinishing(null);
        setFinishFileUrl('');
        fetchData();
    };

    const totalPayables = payables.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
    const totalRefunds = refunds.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
    
    // Calculate Overdue
    const today = new Date();
    today.setHours(0,0,0,0);
    const overduePayables = payables.filter(p => new Date(p.due_date) < today && p.status !== 'Paga');
    const totalOverdue = overduePayables.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const [isExporting, setIsExporting] = useState(false);
    const handleExportToN8n = async () => {
        setIsExporting(true);
        const payload = {
            contas: payables,
            reembolsos: refunds,
            resumo: {
                total_contas: totalPayables,
                total_reembolsos: totalRefunds,
                total_atrasadas: totalOverdue
            },
            data_exportacao: new Date().toISOString()
        };
        const success = await exportFinanceDataToN8n(payload);
        setIsExporting(false);
        if (success) {
            alert('Dados exportados com sucesso para o n8n!');
        } else {
            alert('Erro ao exportar dados. Verifique a configuração do webhook.');
        }
    };

    const getDaysLeft = (dateString: string) => {
        const due = new Date(dateString);
        due.setHours(0,0,0,0);
        const diff = due.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    return (
        <div className="animate-fade-in finance-page p-4 md:p-10 pb-20 md:pb-20">
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                .glass-card-acc {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    padding: 24px;
                    backdrop-filter: blur(20px);
                }
                .input-acc {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 10px 16px;
                    color: white;
                    outline: none;
                    font-size: 0.875rem;
                }
                .btn-acc {
                    background: var(--primary-color);
                    color: black;
                    border: none;
                    border-radius: 12px;
                    padding: 8px 16px;
                    font-weight: 800;
                    font-size: 0.75rem;
                    cursor: pointer;
                }
                .grid-row {
                    display: grid;
                    grid-template-columns: 2fr 1.5fr 1fr 1fr;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    transition: background 0.2s;
                }
                .grid-row:hover {
                    background: rgba(255,255,255,0.02);
                }
                @media (max-width: 768px) {
                    .grid-row {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    .grid-row > div {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                }
            `}</style>

            <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h1>Painel Contábil</h1>
                    <p className="subtitle">Gestão de contas, reembolsos e vencimentos</p>
                </div>
                <button 
                    onClick={handleExportToN8n}
                    disabled={isExporting}
                    style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '14px', padding: '12px 24px', fontWeight: 900, cursor: isExporting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {isExporting ? <Clock size={18} className="animate-spin" /> : <CloudUpload size={18} />}
                    {isExporting ? 'EXPORTANDO...' : 'EXPORTAR DADOS (n8n)'}
                </button>
            </header>

            <div className="flex flex-wrap gap-4 mb-8">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Status</span>
                    <select className="input-acc" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="Pendente" className="bg-[#111]">Pendentes (A Pagar)</option>
                        <option value="Pago" className="bg-[#111]">Liquidados (Pagos)</option>
                        <option value="Todos" className="bg-[#111]">Todos</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Mês</span>
                    <select className="input-acc" value={filterMonth} onChange={e => setFilterMonth(parseInt(e.target.value))}>
                        {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => (
                            <option key={i} value={i} className="bg-[#111]">{m}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Ano</span>
                    <select className="input-acc" value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))}>
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y} className="bg-[#111]">{y}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Tipo de Conta</span>
                    <select className="input-acc" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="Todos" className="bg-[#111]">Todos</option>
                        {['Aluguel', 'Telefone', 'Internet', 'Energia', 'Água', 'Impostos', 'Marketing', 'Uso e Consumo', 'Despesa Operacional', 'Outros'].map(t => (
                            <option key={t} value={t} className="bg-[#111]">{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="glass-card-acc" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderLeft: '4px solid #facc15', borderRadius: '20px', padding: '20px' }}>
                    <div className="flex justify-between items-start mb-2">
                        <div style={{ color: '#facc15', background: '#facc1515', padding: '10px', borderRadius: '12px' }}>
                            <FileText size={24} />
                        </div>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>CONTAS (FILTRO)</p>
                    <h2 style={{ margin: '4px 0', fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{formatCurrency(totalPayables)}</h2>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{payables.length} itens encontrados</span>
                </div>

                <div className="glass-card-acc" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderLeft: '4px solid #38bdf8', borderRadius: '20px', padding: '20px' }}>
                    <div className="flex justify-between items-start mb-2">
                        <div style={{ color: '#38bdf8', background: '#38bdf815', padding: '10px', borderRadius: '12px' }}>
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>REEMBOLSOS (FILTRO)</p>
                    <h2 style={{ margin: '4px 0', fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{formatCurrency(totalRefunds)}</h2>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{refunds.length} solicitações encontradas</span>
                </div>

                <div className="glass-card-acc" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderLeft: '4px solid #ef4444', borderRadius: '20px', padding: '20px' }}>
                    <div className="flex justify-between items-start mb-2">
                        <div style={{ color: '#ef4444', background: '#ef444415', padding: '10px', borderRadius: '12px' }}>
                            <AlertCircle size={24} />
                        </div>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>CONTAS ATRASADAS</p>
                    <h2 style={{ margin: '4px 0', fontSize: '1.4rem', fontWeight: 900, color: '#ef4444' }}>{formatCurrency(totalOverdue)}</h2>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Requer atenção imediata</span>
                </div>
            </div>

            {loading && <SupremeLoading />}

            {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Contas a Pagar List */}
                    <div className="glass-card-acc" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: 'white' }}>Contas a Pagar</h2>
                        </div>
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {payables.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Nenhuma conta encontrada.</div>}
                            {payables.slice((payablesPage - 1) * 5, payablesPage * 5).map(p => {
                                const daysLeft = getDaysLeft(p.due_date);
                                const isOverdue = daysLeft < 0 && p.status !== 'Paga';
                                return (
                                    <div key={p.id} className="grid-row">
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h4 style={{ margin: 0, fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>{p.finance_suppliers?.name || 'Sem Fornecedor'}</h4>
                                                {isOverdue && <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>ATRASADA</span>}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{p.type}</p>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Clock size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: 'white' }}>{new Date(p.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                                                    {p.status !== 'Paga' && `(${daysLeft === 0 ? 'Hoje' : daysLeft > 0 ? `em ${daysLeft} dias` : `há ${Math.abs(daysLeft)} dias`})`}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-color)' }}>{formatCurrency(p.value)}</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: p.status === 'Paga' ? '#4ade80' : p.status === 'Aprovada' ? '#60a5fa' : '#facc15' }}>
                                                {p.status}
                                            </span>
                                            {p.status !== 'Paga' && (
                                                <button onClick={() => setIsFinishing(p.id)} className="btn-acc hover:opacity-80 transition-opacity">
                                                    Pagar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Reembolsos List */}
                    <div className="glass-card-acc" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: 'white' }}>Reembolsos</h2>
                        </div>
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {refunds.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Nenhum reembolso encontrado.</div>}
                            {refunds.slice((refundsPage - 1) * 5, refundsPage * 5).map(r => (
                                <div key={r.id} className="grid-row">
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>{r.requester}</h4>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {r.isRequest ? 'Via Solicitação' : 'Direto'}
                                        </p>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                        <div style={{ fontSize: '0.8rem', color: 'white' }}>
                                            {new Date(r.request_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </div>
                                    </div>

                                    <div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-color)' }}>{formatCurrency(r.value)}</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: r.status === 'Pago' ? '#4ade80' : r.status === 'Aprovado' ? '#60a5fa' : r.status === 'Rejeitado' ? '#ef4444' : '#facc15' }}>
                                            {r.status}
                                        </span>
                                        {r.attachment_url && (
                                            <a href={r.attachment_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FileText size={12} /> Anexo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Anexo para Pagar Conta */}
            {isFinishing && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'grid', placeItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
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
