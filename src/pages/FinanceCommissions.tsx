import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { User, CheckCircle2, ExternalLink, X, Upload, Save, Edit3, Settings } from 'lucide-react';
import '../index.css';

const defaultTiers = [
    { minPrice: 0.10, commission: 0.005 },
    { minPrice: 0.20, commission: 0.010 },
    { minPrice: 0.25, commission: 0.020 },
    { minPrice: 0.30, commission: 0.030 },
    { minPrice: 0.40, commission: 0.040 },
];

const FinanceCommissions = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'CONTABILIDADE';
    
    const [salespeople, setSalespeople] = useState<any[]>([]);
    const [commissions, setCommissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PENDENTE' | 'PAGA' | 'LIBERADA'>('TODOS');
    const [commissionPages, setCommissionPages] = useState<Record<number, number>>({});
    
    // Modal de Pagamento
    const [commissionToPay, setCommissionToPay] = useState<any>(null);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Regras de Comissão (para leitura)
    const [commissionTiers, setCommissionTiers] = useState<any[]>(defaultTiers);
    const [isEditingTiers, setIsEditingTiers] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [peopleData, commData, settingsData] = await Promise.all([
                dbService.getFinanceSalespeople(),
                dbService.getFinanceCommissions(isAdmin ? {} : { salesperson_id: user?.id }),
                dbService.getSettings(user?.role)
            ]);
            setSalespeople(peopleData);
            setCommissions(commData);
            
            if (settingsData['commission_tiers']) {
                try {
                    setCommissionTiers(JSON.parse(settingsData['commission_tiers']));
                } catch(e) {
                    setCommissionTiers(defaultTiers);
                }
            } else {
                setCommissionTiers(defaultTiers);
            }
        } catch (err) {
            console.error("Erro ao buscar dados:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateCommissionStats = (personId: number) => {
        const personCommissions = commissions.filter(c => c.salesperson_id === personId);
        const total = personCommissions.reduce((acc, curr) => acc + parseFloat(curr.commission_value || 0), 0);
        const paid = personCommissions.filter(c => c.status === 'PAGA').reduce((acc, curr) => acc + parseFloat(curr.commission_value || 0), 0);
        const pending = personCommissions.filter(c => c.status !== 'PAGA' && c.status !== 'CANCELADA').reduce((acc, curr) => acc + parseFloat(curr.commission_value || 0), 0);
        return { totalCommission: total, paidCommission: paid, pendingCommission: pending, count: personCommissions.length };
    };

    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !commissionToPay) return;

        setUploadingReceipt(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', user?.id?.toString() || '');
            
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error("Erro no upload");
            
            const { url } = await uploadRes.json();
            
            // Update commission via API
            await dbService.updateFinanceCommission(commissionToPay.id, {
                status: 'PAGA',
                receipt_url: url
            });
            
            fetchData();
            setCommissionToPay(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar comprovante.");
        } finally {
            setUploadingReceipt(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(172, 248, 0, 0.2)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 24px', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', fontWeight: 900 }}>Comissões e Relatórios</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Gerenciamento de comissões por disparos.</p>
                </div>
            </div>

            {isAdmin && (
                <div style={{ background: 'var(--card-bg-subtle)', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid var(--surface-border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                                <Settings size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>Regras de Comissão Operacional</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Defina as faixas de preço para comissionamento por lead entregue.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        {commissionTiers.map((tier, idx) => (
                            <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 800 }}>Preço Unitário Mín. (R$)</label>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>R$ {tier.minPrice.toFixed(2)}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 800 }}>Comissão por Lead (R$)</label>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-color)' }}>R$ {tier.commission.toFixed(3)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2 mb-6">
                {(['TODOS', 'PENDENTE', 'PAGA', 'LIBERADA'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => {
                            setStatusFilter(f);
                            setCommissionPages({});
                        }}
                        style={{
                            background: statusFilter === f ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                            border: '1px solid ' + (statusFilter === f ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)'),
                            color: statusFilter === f ? '#000' : '#fff',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f === 'TODOS' ? 'TODAS' : f}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-12">
                {salespeople.map((person) => {
                    const stats = calculateCommissionStats(person.id);
                    if (stats.count === 0 && !isAdmin) return null;

                    const personComms = commissions.filter(c => c.salesperson_id === person.id && (statusFilter === 'TODOS' || c.status === statusFilter));
                    if (personComms.length === 0 && !isAdmin) return null;

                    const itemsPerPage = 5;
                    const currentPage = commissionPages[person.id] || 1;
                    const totalPages = Math.ceil(personComms.length / itemsPerPage) || 1;
                    const slicedComms = personComms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                    return (
                        <div key={person.id} className="bg-white/[0.01] p-6 rounded-[24px] border border-white/5">
                            <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
                                <div className="flex items-center gap-4">
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(172, 248, 0, 0.1)', border: '1px solid rgba(172, 248, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                        <User size={18} />
                                    </div>
                                    <h3 style={{ margin: 0, fontWeight: 900, color: 'white', fontSize: '1.4rem' }}>{person.name}</h3>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACUMULADO TOTAL</span>
                                        <h4 style={{ margin: 0, fontWeight: 950, color: 'white' }}>R$ {stats.totalCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>PAGO</span>
                                        <h4 style={{ margin: 0, fontWeight: 950, color: '#10b981' }}>R$ {stats.paidCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase' }}>PENDENTE/LIBERADA</span>
                                        <h4 style={{ margin: 0, fontWeight: 950, color: '#facc15' }}>R$ {stats.pendingCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h4>
                                    </div>
                                </div>
                            </div>

                            <div className="table-container-finance overflow-x-auto custom-scrollbar">
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                            <th style={{ padding: '12px' }}>DISPARO (RELATÓRIO)</th>
                                            <th style={{ padding: '12px' }}>DATA</th>
                                            <th style={{ padding: '12px' }}>ENTREGUES</th>
                                            <th style={{ padding: '12px' }}>UNIT. (R$)</th>
                                            <th style={{ padding: '12px' }}>VALOR CONSUMIDO</th>
                                            <th style={{ padding: '12px', textAlign: 'right' }}>COMISSÃO (R$)</th>
                                            <th style={{ padding: '12px', textAlign: 'center' }}>STATUS</th>
                                            <th style={{ padding: '12px', textAlign: 'right' }}>AÇÕES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {slicedComms.map((c) => (
                                            <tr key={c.id} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div className="flex flex-col">
                                                        <span style={{ fontWeight: 900, color: 'white', fontSize: '0.9rem' }}>{c.dispatch_name}</span>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.client_name} - Rel #{c.report_id}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '0.85rem' }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                                                <td style={{ padding: '12px', color: '#22c55e', fontWeight: 700 }}>{Number(c.qty_delivered).toLocaleString('pt-BR')}</td>
                                                <td style={{ padding: '12px' }}>R$ {Number(c.unit_value).toFixed(2)}</td>
                                                <td style={{ padding: '12px', fontWeight: 600 }}>R$ {Number(c.consumed_value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, color: 'var(--primary-color)' }}>
                                                    R$ {Number(c.commission_value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>({Number(c.commission_percent).toFixed(3)}/lead)</div>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <span style={{ 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: 900, 
                                                        padding: '4px 8px', 
                                                        borderRadius: '6px', 
                                                        background: c.status === 'PAGA' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                                        color: c.status === 'PAGA' ? '#10b981' : '#facc15',
                                                        border: `1px solid ${c.status === 'PAGA' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(250, 204, 21, 0.2)'}`
                                                    }}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                    <div className="flex justify-end gap-2">
                                                        {c.receipt_url && (
                                                            <button 
                                                                onClick={() => window.open(c.receipt_url, '_blank')}
                                                                style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                                                            >
                                                                <ExternalLink size={14} /> RECIBO
                                                            </button>
                                                        )}
                                                        {isAdmin && c.status !== 'PAGA' && (
                                                            <button 
                                                                onClick={() => setCommissionToPay(c)}
                                                                style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                                                            >
                                                                <CheckCircle2 size={14} /> LIQUIDAR
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {slicedComms.length === 0 && (
                                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontWeight: 800 }}>NENHUMA COMISSÃO ENCONTRADA</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '8px', marginTop: '16px' }}>
                                    <button disabled={currentPage === 1} onClick={() => setCommissionPages(prev => ({ ...prev, [person.id]: currentPage - 1 }))} style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--surface-border)' }}>Anterior</button>
                                    <span style={{ padding: '6px 12px' }}>{currentPage} de {totalPages}</span>
                                    <button disabled={currentPage === totalPages} onClick={() => setCommissionPages(prev => ({ ...prev, [person.id]: currentPage + 1 }))} style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--surface-border)' }}>Próxima</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal de Pagamento de Comissão */}
            {commissionToPay && (
                <div className="supreme-modal-overlay" onClick={() => !uploadingReceipt && setCommissionToPay(null)}>
                    <div className="supreme-modal-content" onClick={e => e.stopPropagation()} style={{ background: 'var(--card-bg)', border: '1px solid var(--surface-border)', padding: '32px', borderRadius: '16px', maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
                        <button onClick={() => !uploadingReceipt && setCommissionToPay(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: '0 0 8px 0' }}>Liquidar Comissão</h2>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                                Anexe o comprovante de pagamento para liquidar esta comissão.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Vendedor</span>
                                <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>{salespeople.find(p => p.id === commissionToPay.salesperson_id)?.name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Disparo</span>
                                <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>{commissionToPay.dispatch_name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Valor a Pagar</span>
                                <span style={{ color: 'var(--primary-color)', fontWeight: 900, fontSize: '1.2rem' }}>
                                    R$ {parseFloat(commissionToPay.commission_value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </span>
                            </div>
                        </div>

                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }}
                            accept="image/*,application/pdf"
                            onChange={handleReceiptUpload}
                        />

                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingReceipt}
                            style={{ 
                                width: '100%', 
                                padding: '16px', 
                                background: 'var(--primary-color)', 
                                color: 'black', 
                                border: 'none', 
                                borderRadius: '12px', 
                                fontWeight: 900, 
                                fontSize: '1rem',
                                cursor: uploadingReceipt ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                opacity: uploadingReceipt ? 0.7 : 1
                            }}
                        >
                            {uploadingReceipt ? (
                                <>Enviando...</>
                            ) : (
                                <><Upload size={18} /> ANEXAR COMPROVANTE</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceCommissions;
