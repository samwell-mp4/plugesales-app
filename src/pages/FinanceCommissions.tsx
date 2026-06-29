import React, { useState, useEffect, useRef } from 'react';
import { 
    Users, Percent, DollarSign, 
    Save, RefreshCw, User, 
    CheckCircle2, Clock, AlertCircle,
    ChevronDown, Edit3, TrendingUp, Upload, ExternalLink, X
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

const FinanceCommissions = () => {
    const { user } = useAuth();
    const [salespeople, setSalespeople] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCommission, setEditingCommission] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Upload de comprovante
    const [saleToPay, setSaleToPay] = useState<any>(null);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [peopleData, salesData] = await Promise.all([
                dbService.getFinanceSalespeople(),
                dbService.getFinanceSales({ userId: user?.id, role: user?.role })
            ]);
            setSalespeople(peopleData);
            setSales(salesData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateCommissionStats = (salespersonId: number) => {
        const personSales = sales.filter(s => s.salesperson_id === salespersonId);
        const totalCommission = personSales.reduce((acc, curr) => acc + parseFloat(curr.commission_value || 0), 0);
        const paidCommission = personSales.filter(s => s.commission_status === 'PAGA').reduce((acc, curr) => acc + parseFloat(curr.commission_value || 0), 0);
        const pendingCommission = totalCommission - paidCommission;
        return { totalCommission, paidCommission, pendingCommission, count: personSales.length };
    };

    const updateCommissionStatus = async (saleId: number, status: string, receiptUrl?: string) => {
        try {
            const updateData: any = { id: saleId, commission_status: status };
            if (receiptUrl) {
                updateData.commission_receipt_url = receiptUrl;
            }
            await dbService.saveFinanceSale(updateData);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUploadReceiptAndPay = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !saleToPay) return;
        
        setUploadingReceipt(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();
            const hostedUrl = uploadData.url || `${window.location.origin}${uploadData.path}`;
            
            await updateCommissionStatus(saleToPay.id, 'PAGA', hostedUrl);
            setSaleToPay(null);
        } catch (err) {
            console.error(err);
            alert("Erro ao fazer upload do comprovante.");
        } finally {
            setUploadingReceipt(false);
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="animate-fade-in finance-page p-4 md:p-10 pb-20 md:pb-20">
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                
                .commission-card-finance {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    padding: 24px;
                    backdrop-filter: blur(20px);
                }

                .table-container-finance {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    overflow: hidden;
                    margin-top: 24px;
                }
                
                table { width: 100%; border-collapse: collapse; }
                th { 
                    padding: 16px 24px; 
                    background: rgba(255,255,255,0.02); 
                    color: var(--text-muted); 
                    font-size: 0.7rem; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 1px;
                }
                td { padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }

                .supreme-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 15px; }
                .supreme-modal-content { background: #0f172a; border: 1px solid var(--surface-border-subtle); border-radius: 32px; width: 90%; max-width: 500px; padding: 40px; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center; box-sizing: border-box; }

                @media (max-width: 768px) {
                    .supreme-modal-content { padding: 24px; border-radius: 24px; }
                }
            `}</style>

            <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h1>Comissões & Pagamentos</h1>
                    <p className="subtitle">Gestão de repasses e liquidação de comissões para a equipe comercial</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchData} 
                        disabled={isLoading}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', color: 'white', cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="flex flex-col gap-12">
                {salespeople.map((person) => {
                    const stats = calculateCommissionStats(person.id);
                    if (stats.count === 0 && !isAdmin) return null;

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
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>LIQUIDADO</span>
                                        <h4 style={{ margin: 0, fontWeight: 950, color: '#10b981' }}>R$ {stats.paidCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase' }}>A REPASSAR</span>
                                        <h4 style={{ margin: 0, fontWeight: 950, color: '#facc15' }}>R$ {stats.pendingCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h4>
                                    </div>
                                </div>
                            </div>

                            <div className="table-container-finance overflow-x-auto custom-scrollbar">
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>COMPETÊNCIA</th>
                                            <th style={{ textAlign: 'left' }}>CLIENTE & PACOTE</th>
                                            <th style={{ textAlign: 'right' }}>BASE (R$)</th>
                                            <th style={{ textAlign: 'right' }}>COMISSÃO (R$)</th>
                                            <th style={{ textAlign: 'center' }}>SITUAÇÃO</th>
                                            <th style={{ textAlign: 'right' }}>AÇÕES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.filter(s => s.salesperson_id === person.id).map((sale) => (
                                            <tr key={sale.id}>
                                                <td style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{sale.payment_competence || new Date(sale.sale_date).toLocaleDateString('pt-BR')}</td>
                                                <td>
                                                    <div className="flex flex-col">
                                                        <span style={{ fontWeight: 900, color: 'white', fontSize: '0.9rem' }}>{sale.client_name}</span>
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{sale.package_hired}</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>R$ {parseFloat(sale.total_value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                                <td style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 950, color: 'var(--primary-color)' }}>R$ {parseFloat(sale.commission_value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ 
                                                        fontSize: '0.65rem', 
                                                        fontWeight: 900, 
                                                        padding: '4px 8px', 
                                                        borderRadius: '6px', 
                                                        background: sale.commission_status === 'PAGA' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                                        color: sale.commission_status === 'PAGA' ? '#10b981' : '#facc15',
                                                        border: `1px solid ${sale.commission_status === 'PAGA' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(250, 204, 21, 0.2)'}`
                                                    }}>
                                                        {sale.commission_status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="flex justify-end gap-2">
                                                        {sale.commission_receipt_url && (
                                                            <button 
                                                                onClick={() => window.open(sale.commission_receipt_url, '_blank')}
                                                                style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                            >
                                                                <ExternalLink size={14} /> COMPROVANTE
                                                            </button>
                                                        )}
                                                        {isAdmin && sale.commission_status !== 'PAGA' && (
                                                            <button 
                                                                onClick={() => setSaleToPay(sale)}
                                                                style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                            >
                                                                <CheckCircle2 size={14} /> LIQUIDAR
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {sales.filter(s => s.salesperson_id === person.id).length === 0 && (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.8rem' }}>NENHUMA COMISSÃO REGISTRADA</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Pagamento de Comissão */}
            {saleToPay && (
                <div className="supreme-modal-overlay" onClick={() => !uploadingReceipt && setSaleToPay(null)}>
                    <div className="supreme-modal-content" onClick={e => e.stopPropagation()}>
                        <button onClick={() => !uploadingReceipt && setSaleToPay(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                        
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                            <DollarSign size={32} />
                        </div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>
                            Liquidar Comissão
                        </h2>
                        <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Você está prestes a registrar o repasse de comissão referente à campanha do cliente <strong style={{ color: 'white' }}>{saleToPay.client_name}</strong> no valor de <strong style={{ color: 'var(--primary-color)' }}>R$ {parseFloat(saleToPay.commission_value).toLocaleString('pt-BR')}</strong>.
                        </p>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleUploadReceiptAndPay}
                            accept="image/*,.pdf"
                        />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingReceipt}
                                style={{ width: '100%', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '14px', padding: '16px', fontWeight: 900, fontSize: '0.9rem', cursor: uploadingReceipt ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {uploadingReceipt ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
                                {uploadingReceipt ? 'ENVIANDO...' : 'ANEXAR COMPROVANTE E LIQUIDAR'}
                            </button>
                            
                            <button 
                                onClick={() => {
                                    updateCommissionStatus(saleToPay.id, 'PAGA');
                                    setSaleToPay(null);
                                }}
                                disabled={uploadingReceipt}
                                style={{ width: '100%', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px', fontWeight: 900, fontSize: '0.8rem', cursor: uploadingReceipt ? 'not-allowed' : 'pointer' }}
                            >
                                LIQUIDAR SEM COMPROVANTE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceCommissions;
