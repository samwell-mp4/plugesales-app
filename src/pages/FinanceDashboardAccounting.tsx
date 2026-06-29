import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    Clock, CheckCircle2, AlertCircle, FileText, 
    Upload, X, Search, Filter, Calendar
} from 'lucide-react';
import SupremeLoading from '../components/SupremeLoading';
import { sendAccountingNotification } from '../services/webhookService';

export const FinanceDashboardAccounting = ({ user }: { user: any }) => {
    const [payables, setPayables] = useState<any[]>([]);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterStatus, setFilterStatus] = useState('Pendente');
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const [isFinishing, setIsFinishing] = useState<number | null>(null);
    const [finishFileUrl, setFinishFileUrl] = useState('');
    const [finishUploading, setFinishUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterMonth, filterYear]);

    const fetchData = async () => {
        setLoading(true);
        
        // Month range
        const start = new Date(filterYear, filterMonth, 1);
        const end = new Date(filterYear, filterMonth + 1, 0);
        
        const startDateStr = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2, '0')}-01`;
        const endDateStr = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

        let pQuery = supabase.from('finance_payables').select(`*, finance_suppliers(name)`).gte('due_date', startDateStr).lte('due_date', endDateStr).order('due_date', { ascending: true });
        let rQuery = supabase.from('finance_refunds').select('*').gte('request_date', startDateStr).lte('request_date', endDateStr).order('request_date', { ascending: false });

        if (filterStatus === 'Pendente') {
            pQuery = pQuery.in('status', ['Pendente', 'Aprovada']);
            rQuery = rQuery.in('status', ['Solicitado', 'Aprovado']);
        } else if (filterStatus === 'Pago') {
            pQuery = pQuery.eq('status', 'Paga');
            rQuery = rQuery.eq('status', 'Pago');
        }

        const [pRes, rRes] = await Promise.all([pQuery, rQuery]);
        
        if (pRes.data) setPayables(pRes.data);
        if (rRes.data) setRefunds(rRes.data);

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

    const getDaysLeft = (dateString: string) => {
        const due = new Date(dateString);
        due.setHours(0,0,0,0);
        const diff = due.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    return (
        <div className="animate-fade-in finance-page" style={{ padding: '40px', paddingBottom: '80px' }}>
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
            `}</style>

            <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h1>Painel Contábil</h1>
                    <p className="subtitle">Gestão de contas, reembolsos e vencimentos</p>
                </div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card-acc" style={{ borderLeft: '4px solid #facc15' }}>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 800 }}>CONTAS (FILTRO)</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', margin: '8px 0' }}>{formatCurrency(totalPayables)}</p>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{payables.length} itens encontrados</span>
                </div>
                <div className="glass-card-acc" style={{ borderLeft: '4px solid #38bdf8' }}>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 800 }}>REEMBOLSOS (FILTRO)</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', margin: '8px 0' }}>{formatCurrency(totalRefunds)}</p>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{refunds.length} solicitações encontradas</span>
                </div>
                <div className="glass-card-acc" style={{ borderLeft: '4px solid #ef4444' }}>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 800 }}>CONTAS ATRASADAS</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444', margin: '8px 0' }}>{formatCurrency(totalOverdue)}</p>
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
                            {payables.map(p => {
                                const daysLeft = getDaysLeft(p.due_date);
                                const isOverdue = daysLeft < 0 && p.status !== 'Paga';
                                return (
                                    <div key={p.id} style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h4 style={{ margin: 0, fontWeight: 800, color: 'white' }}>{p.finance_suppliers?.name || 'Sem Fornecedor'}</h4>
                                                {isOverdue && <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>ATRASADA</span>}
                                            </div>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{p.type} • {p.description || 'Sem descrição'}</p>
                                            
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--primary-color)' }}>{formatCurrency(p.value)}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} /> Venc: {new Date(p.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} 
                                                    {p.status !== 'Paga' && ` (${daysLeft === 0 ? 'Hoje' : daysLeft > 0 ? `em ${daysLeft} dias` : `há ${Math.abs(daysLeft)} dias`})`}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: p.status === 'Paga' ? '#4ade80' : p.status === 'Aprovada' ? '#60a5fa' : '#facc15' }}>
                                                {p.status}
                                            </span>
                                            {p.status !== 'Paga' && (
                                                <button onClick={() => setIsFinishing(p.id)} className="btn-acc hover:opacity-80 transition-opacity">
                                                    Pagar Conta
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
                            {refunds.map(r => (
                                <div key={r.id} style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontWeight: 800, color: 'white' }}>{r.requester}</h4>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{r.description || 'Sem descrição'}</p>
                                        
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--primary-color)' }}>{formatCurrency(r.value)}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} /> Data: {new Date(r.request_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: r.status === 'Pago' ? '#4ade80' : r.status === 'Aprovado' ? '#60a5fa' : r.status === 'Rejeitado' ? '#ef4444' : '#facc15' }}>
                                            {r.status}
                                        </span>
                                        {r.attachment_url && (
                                            <a href={r.attachment_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FileText size={12} /> Ver Anexo
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
