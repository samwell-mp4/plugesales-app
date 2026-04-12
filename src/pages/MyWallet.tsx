import { useState, useEffect } from 'react';
import { 
    Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, 
    Gift, RefreshCw, Loader, History, CreditCard, 
    ShieldCheck, AlertCircle, ChevronRight, Search, 
    DollarSign, Zap, Clock, X, Info, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface WalletData {
    wallet: any;
    ledger: any[];
    purchases: any[];
    gifts: any[];
    refunds: any[];
}

const formatPrice = (p: string | number) =>
    parseFloat(String(p)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatVolume = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toString();
};

export default function MyWallet() {
    const { user } = useAuth();
    const [data, setData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'purchases' | 'gifts'>('overview');
    
    // Modal states
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
    
    // Form states
    const [giftAmount, setGiftAmount] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [redeemCode, setRedeemCode] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchWalletData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/v2/wallet?userId=${user.id}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error('Error fetching wallet:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWalletData(); }, [user?.id]);

    const handleCreateGift = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const res = await fetch('/api/v2/gifts/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user?.id, 
                    amount: giftAmount, 
                    recipientEmail 
                })
            });
            const result = await res.json();
            if (result.success) {
                alert(`Gift Card criado com sucesso! Código: ${result.gift.code}`);
                setShowGiftModal(false);
                setGiftAmount('');
                setRecipientEmail('');
                fetchWalletData();
            } else {
                alert(result.error || 'Erro ao criar Gift Card');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRedeemGift = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const res = await fetch('/api/v2/gifts/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id, code: redeemCode })
            });
            const result = await res.json();
            if (result.success) {
                alert(`Sucesso! ${result.gift.amount} créditos adicionados.`);
                setShowRedeemModal(false);
                setRedeemCode('');
                fetchWalletData();
            } else {
                alert(result.error || 'Código inválido ou expirado');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRequestRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const res = await fetch('/api/v2/refund/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user?.id, 
                    purchaseId: selectedPurchase.id, 
                    reason: refundReason 
                })
            });
            const result = await res.json();
            if (result.success) {
                alert('Solicitação de reembolso enviada para análise.');
                setShowRefundModal(false);
                setRefundReason('');
                fetchWalletData();
            } else {
                alert(result.error || 'Erro ao processar reembolso');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading || !data) return (
        <div className="crm-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
            <Loader size={48} className="animate-spin text-primary" />
        </div>
    );

    const { wallet, ledger, purchases, gifts } = data;

    return (
        <div className="crm-container">
            {/* Header section */}
            <div className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <Wallet size={12} /> FINANCIAL WELLNESS
                    </div>
                    <h1 className="crm-main-title">Minha Wallet</h1>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowRedeemModal(true)} className="action-btn ghost-btn" style={{ height: '48px' }}>
                        <ArrowDownLeft size={18} /> RESGATAR
                    </button>
                    <button onClick={() => setShowGiftModal(true)} className="action-btn primary-btn" style={{ height: '48px' }}>
                        <Gift size={18} /> CRIAR GIFT
                    </button>
                </div>
            </div>

            {/* Main Balance Card */}
            <div className="crm-card" style={{ 
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '40px',
                alignItems: 'center',
                padding: '48px'
            }}>
                <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'var(--primary-glow)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.1, pointerEvents: 'none' }} />
                
                <div>
                    <div className="field-label" style={{ marginBottom: '12px' }}>
                        <ShieldCheck size={14} style={{ color: 'var(--primary-color)' }} /> SALDO CONSOLIDADO
                    </div>
                    <div className="flex items-baseline gap-4 mb-4">
                        <h2 style={{ fontSize: '4.5rem', fontWeight: 950, letterSpacing: '-3px', lineHeight: 1, margin: 0 }}>{formatVolume(wallet?.total_credits_available || 0)}</h2>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)' }}>CRÉDITOS</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        Capacidade ativa: <span style={{ color: 'var(--primary-color)' }}>{formatPrice((wallet?.total_credits_available || 0) * 0.01)}</span>
                    </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid var(--surface-border-subtle)' }}>
                    <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-center">
                            <span className="field-label" style={{ margin: 0 }}>Reservado</span>
                            <span style={{ fontWeight: 900, color: 'var(--warning-color)', fontSize: '1.1rem' }}>{formatVolume(wallet?.total_credits_reserved || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="field-label" style={{ margin: 0 }}>Utilizado</span>
                            <span style={{ fontWeight: 900, color: '#f97316', fontSize: '1.1rem' }}>{formatVolume(wallet?.total_credits_used || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="field-label" style={{ margin: 0 }}>Enviado (Gift)</span>
                            <span style={{ fontWeight: 900, color: '#8b5cf6', fontSize: '1.1rem' }}>{formatVolume(wallet?.total_credits_gifted_out || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="crm-card" style={{ padding: '8px', marginBottom: '32px', display: 'inline-flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                    { id: 'overview', name: 'Geral', icon: <LayoutDashboard size={18} /> },
                    { id: 'purchases', name: 'Lotes Ativos', icon: <CreditCard size={18} /> },
                    { id: 'ledger', name: 'Extrato Global', icon: <History size={18} /> },
                    { id: 'gifts', name: 'Gift Cards', icon: <Gift size={18} /> },
                ].map(t => (
                    <button 
                        key={t.id} 
                        onClick={() => setActiveTab(t.id as any)}
                        className={`action-btn ${activeTab === t.id ? 'primary-btn' : 'ghost-btn'}`}
                        style={{ height: '44px', minWidth: '130px' }}
                    >
                        {t.icon} {t.name}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
                <div className="card-grid-responsive">
                    {/* Active Batches Summary */}
                    <div className="crm-card">
                        <div className="flex justify-between items-center mb-8">
                            <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.25rem' }}>Lotes de Capacidade</h3>
                            <button onClick={() => setActiveTab('purchases')} className="action-btn ghost-btn" style={{ height: '32px', fontSize: '10px' }}>VER TODOS</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {(purchases || []).slice(0, 3).map(p => (
                                <div key={p.id} style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '20px', border: '1px solid var(--surface-border-subtle)', display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ background: 'rgba(172, 248, 0, 0.05)', padding: 12, borderRadius: 14, color: 'var(--primary-color)' }}><Zap size={20} /></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>{p.card_name}</div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{formatVolume(p.credits_available)} restantes</div>
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--primary-color)' }}>{Math.round((p.credits_available / p.credits_origin_total) * 100)}%</div>
                                </div>
                            ))}
                            {(purchases || []).length === 0 && <p style={{ textAlign: 'center', opacity: 0.3, padding: '20px' }}>Nenhum lote ativo.</p>}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="crm-card">
                        <div className="flex justify-between items-center mb-8">
                            <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.25rem' }}>Atividade Recente</h3>
                            <button onClick={() => setActiveTab('ledger')} className="action-btn ghost-btn" style={{ height: '32px', fontSize: '10px' }}>VER TUDO</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {(ledger || []).slice(0, 5).map((l, i) => (
                                <div key={i} className="flex items-center gap-5">
                                    <div style={{ 
                                        width: 44, height: 44, borderRadius: '16px', 
                                        background: l.direction === 'in' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: l.direction === 'in' ? '#4ade80' : '#ef4444'
                                    }}>
                                        {l.direction === 'in' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>{
                                            l.entry_type === 'purchase_credit' ? 'Compra de Card' :
                                            l.entry_type === 'gift_redeem' ? 'Resgate de Gift' :
                                            l.entry_type === 'gift_issue' ? 'Emissão de Gift' :
                                            l.entry_type === 'reserve_credit' ? 'Reserva (Campanha)' : l.entry_type
                                        }</div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{new Date(l.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 950, color: l.direction === 'in' ? '#4ade80' : 'var(--text-primary)' }}>
                                        {l.direction === 'in' ? '+' : '-'}{formatVolume(l.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'purchases' && (
                <div className="crm-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="responsive-table-container" style={{ margin: 0, borderRadius: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    {['Card / ID', 'Volume Original', 'Disponível', 'Status', 'Expira em', 'Ações'].map(h => (
                                        <th key={h} className="field-label" style={{ padding: '24px', textAlign: 'left', borderBottom: '1px solid var(--surface-border-subtle)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(purchases || []).map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                        <td style={{ padding: '24px' }}>
                                            <div style={{ fontWeight: 950, fontSize: '1rem' }}>{p.card_name}</div>
                                            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>{p.purchase_reference}</div>
                                        </td>
                                        <td style={{ padding: '24px', fontWeight: 800 }}>{formatVolume(p.credits_origin_total)}</td>
                                        <td style={{ padding: '24px' }}>
                                            <div className="flex items-center gap-4">
                                                <span style={{ fontWeight: 950, color: 'var(--primary-color)' }}>{formatVolume(p.credits_available)}</span>
                                                <div style={{ width: 80, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                                    <div style={{ width: `${(p.credits_available / p.credits_origin_total) * 100}%`, height: '100%', background: 'var(--primary-gradient)' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            <span className="status-badge-premium" style={{ 
                                                '--bg': p.purchase_status === 'activated' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                                                '--color': p.purchase_status === 'activated' ? '#4ade80' : 'var(--text-muted)',
                                                '--border': p.purchase_status === 'activated' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.1)'
                                            } as any}>
                                                {p.purchase_status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '24px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                            {p.refund_deadline_at ? new Date(p.refund_deadline_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            {p.credits_available > 0 && p.purchase_status === 'activated' && (
                                                <button 
                                                    onClick={() => { setSelectedPurchase(p); setShowRefundModal(true); }}
                                                    className="action-btn"
                                                    style={{ height: '32px', fontSize: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                                                >REEMBOLSO</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'ledger' && (
                <div className="crm-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="responsive-table-container" style={{ margin: 0, borderRadius: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    {['Data da Transação', 'Tipo de Operação', 'Variação', 'Saldo Anterior', 'Novo Saldo'].map(h => (
                                        <th key={h} className="field-label" style={{ padding: '24px', textAlign: 'left', borderBottom: '1px solid var(--surface-border-subtle)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(ledger || []).map((l, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                        <td style={{ padding: '24px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>{new Date(l.created_at).toLocaleString()}</td>
                                        <td style={{ padding: '24px' }}>
                                            <div className="flex items-center gap-3">
                                                <div style={{ 
                                                    width: 10, height: 10, borderRadius: '50%', 
                                                    background: l.direction === 'in' ? '#4ade80' : l.direction === 'hold' ? 'var(--warning-color)' : '#ef4444' 
                                                }} />
                                                <span style={{ fontWeight: 900 }}>{
                                                    l.entry_type === 'purchase_credit' ? 'Compra' :
                                                    l.entry_type === 'gift_redeem' ? 'Resgate' :
                                                    l.entry_type === 'gift_issue' ? 'Envio Gift' :
                                                    l.entry_type === 'reserve_credit' ? 'Reserva' : l.entry_type
                                                }</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px', fontWeight: 950, color: l.direction === 'in' ? '#4ade80' : l.direction === 'hold' ? 'var(--warning-color)' : 'var(--text-primary)' }}>
                                            {l.direction === 'in' ? '+' : '-'}{formatVolume(l.amount)}
                                        </td>
                                        <td style={{ padding: '24px', color: 'var(--text-muted)', fontWeight: 700 }}>{formatVolume(l.balance_before)}</td>
                                        <td style={{ padding: '24px', fontWeight: 950, fontSize: '1rem' }}>{formatVolume(l.balance_after)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'gifts' && (
                <div className="card-grid-responsive">
                    <div className="crm-card">
                        <h3 className="mb-8" style={{ margin: 0, fontWeight: 950, fontSize: '1.25rem' }}>Gifts Emitidos</h3>
                        <div className="flex flex-col gap-4">
                            {(gifts || []).filter(g => g.creator_user_id == user?.id).map((g, i) => (
                                <div key={i} style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '20px', border: '1px solid var(--surface-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--primary-color)', letterSpacing: '1px' }}>{g.code}</div>
                                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>{g.recipient_email || 'Carga Direta'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>{formatVolume(g.amount)}</div>
                                        <span className="status-badge-premium" style={{ fontSize: '8px', padding: '2px 8px' }}>{g.gift_status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="crm-card">
                        <h3 className="mb-8" style={{ margin: 0, fontWeight: 950, fontSize: '1.25rem' }}>Gifts Recebidos</h3>
                        <div className="flex flex-col gap-4">
                            {(gifts || []).filter(g => g.recipient_user_id == user?.id).map((g, i) => (
                                <div key={i} style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '20px', border: '1px solid var(--surface-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 950 }}>{g.code}</div>
                                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Recebido em {new Date(g.redeemed_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ fontWeight: 950, color: 'var(--primary-color)', fontSize: '1.1rem' }}>+{formatVolume(g.amount)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Standard Modal Implementation */}
            {(showGiftModal || showRedeemModal || showRefundModal) && (
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
                        <button className="close-modal" onClick={() => { setShowGiftModal(false); setShowRedeemModal(false); setShowRefundModal(false); }}>
                            <X size={24} />
                        </button>
                        
                        {showGiftModal && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 950, margin: '0 0 8px 0', letterSpacing: '-1px' }}>Criar Gift Card</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Transfira créditos instantaneamente.</p>
                                </div>
                                <form onSubmit={handleCreateGift} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label className="field-label">Montante em Créditos</label>
                                        <input type="number" required value={giftAmount} onChange={e => setGiftAmount(e.target.value)} className="field-input" placeholder="Ex: 50000" />
                                    </div>
                                    <div>
                                        <label className="field-label">E-mail do Receptor (Opcional)</label>
                                        <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} className="field-input" placeholder="contato@plugsales.com" />
                                    </div>
                                    <button disabled={isProcessing} className="action-btn primary-btn w-full" style={{ height: '56px' }}>
                                        {isProcessing ? <Loader className="animate-spin" size={20} /> : 'GERAR CÓDIGO DE ATIVAÇÃO'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {showRedeemModal && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 950, margin: '0 0 8px 0', letterSpacing: '-1px' }}>Resgatar Créditos</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Carga instantânea no seu saldo.</p>
                                </div>
                                <form onSubmit={handleRedeemGift} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label className="field-label">Código Gift</label>
                                        <input type="text" required value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())} className="field-input" style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.25rem', fontWeight: 950 }} placeholder="GIFT-XXXXX" />
                                    </div>
                                    <button disabled={isProcessing} className="action-btn primary-btn w-full" style={{ height: '56px' }}>
                                        {isProcessing ? <Loader className="animate-spin" size={20} /> : 'ATIVAR CRÉDITOS AGORA'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {showRefundModal && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 950, margin: '0 0 8px 0', letterSpacing: '-1px', color: '#ef4444' }}>Solicitar Reembolso</h2>
                                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '24px', padding: '20px', marginTop: '16px' }}>
                                        <div className="flex items-center gap-2 mb-3" style={{ color: '#ef4444', fontWeight: 900, fontSize: '12px' }}>
                                            <AlertCircle size={16} /> REGRAS DE CANCELAMENTO
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                                            <li>Prazo máximo de 7 dias após a compra.</li>
                                            <li>Lote deve estar com mais de 90% disponível.</li>
                                            <li>Taxa fixa de 10% para processamento financeiro.</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '24px', borderRadius: '24px', border: '1px solid var(--surface-border-subtle)' }}>
                                    <div className="field-label" style={{ marginBottom: '8px' }}>Retorno Estimado</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>{formatPrice((selectedPurchase?.credits_available / selectedPurchase?.credits_origin_total) * selectedPurchase?.price_paid * 0.9)}</div>
                                </div>

                                <form onSubmit={handleRequestRefund} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label className="field-label">Motivo (Breve Relato)</label>
                                        <textarea required value={refundReason} onChange={e => setRefundReason(e.target.value)} className="field-input" style={{ height: '100px', padding: '16px', resize: 'none' }} placeholder="..." />
                                    </div>
                                    <button disabled={isProcessing} className="action-btn w-full" style={{ height: '56px', background: '#ef4444', color: 'white' }}>
                                        {isProcessing ? <Loader className="animate-spin" size={20} /> : 'CONFIRMAR SOLICITAÇÃO'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
