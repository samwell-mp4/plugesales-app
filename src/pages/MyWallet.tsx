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
        <div className="flex items-center justify-center" style={{ height: '70vh' }}>
            <Loader size={40} className="animate-spin text-primary" />
        </div>
    );

    const { wallet, ledger, purchases, gifts } = data;

    return (
        <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
            
            {/* Header section */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div style={{ background: 'var(--primary-gradient)', padding: 12, borderRadius: 16, cursor: 'default', color: '#000', boxShadow: 'var(--shadow-glow)' }}>
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-gradient" style={{ margin: 0, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Minha Wallet</h1>
                        <p className="subtitle" style={{ margin: 0, fontSize: '0.9rem' }}>Gestão inteligente de créditos Plug Cards</p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button onClick={() => setShowRedeemModal(true)} className="btn btn-secondary">
                        <ArrowDownLeft size={18} className="text-primary" /> Resgatar Gift
                    </button>
                    <button onClick={() => setShowGiftModal(true)} className="btn btn-primary">
                        <Gift size={18} /> Criar Gift Card
                    </button>
                </div>
            </div>

            {/* Main Balance Card */}
            <div className="glass-panel" style={{ 
                borderRadius: 'var(--radius-lg)',
                padding: '40px',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px',
                alignItems: 'center'
            }}>
                <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'var(--primary-glow)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.5 }} />
                
                <div>
                    <div className="flex items-center gap-2 mb-2" style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-muted)' }}>
                        <ShieldCheck size={14} style={{ color: 'var(--primary-color)' }} /> SALDO CONSOLIDADO
                    </div>
                    <div className="flex items-baseline gap-3 mb-2">
                        <span style={{ fontSize: '4rem', fontWeight: 950, letterSpacing: '-2px', lineHeight: 1 }}>{formatVolume(wallet?.total_credits_available || 0)}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>CRÉDITOS</span>
                    </div>
                    <p className="subtitle" style={{ margin: 0 }}>Equivalente aproximado a <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{formatPrice((wallet?.total_credits_available || 0) * 0.01)}</span> em infraestrutura ativa.</p>
                </div>

                <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', border: '1px solid var(--surface-border-subtle)' }}>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                <Clock size={16} /> Reservado
                            </div>
                            <span style={{ fontWeight: 800, color: 'var(--warning-color)' }}>{formatVolume(wallet?.total_credits_reserved || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                <ArrowUpRight size={16} /> Utilizado
                            </div>
                            <span style={{ fontWeight: 800, color: '#f97316' }}>{formatVolume(wallet?.total_credits_used || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                <Gift size={16} /> Gifted Out
                            </div>
                            <span style={{ fontWeight: 800, color: '#8b5cf6' }}>{formatVolume(wallet?.total_credits_gifted_out || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-6 p-1 glass-card" style={{ width: 'fit-content', borderRadius: 'var(--radius-md)', padding: '6px' }}>
                {[
                    { id: 'overview', name: 'Geral', icon: <LayoutDashboard size={16} /> },
                    { id: 'purchases', name: 'Lotes', icon: <CreditCard size={16} /> },
                    { id: 'ledger', name: 'Extrato', icon: <History size={16} /> },
                    { id: 'gifts', name: 'Gifts', icon: <Gift size={16} /> },
                ].map(t => (
                    <button 
                        key={t.id} 
                        onClick={() => setActiveTab(t.id as any)}
                        className={`btn ${activeTab === t.id ? 'btn-primary' : ''}`}
                        style={{ 
                            padding: '10px 20px', 
                            borderRadius: 'var(--radius-sm)',
                            background: activeTab === t.id ? '' : 'transparent',
                            color: activeTab === t.id ? '' : 'var(--text-secondary)',
                            minWidth: '110px'
                        }}
                    >
                        {t.icon} {t.name}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                    {/* Active Batches Summary */}
                    <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: 30 }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 style={{ margin: 0, fontWeight: 900 }}>Lotes Ativos</h3>
                            <button onClick={() => setActiveTab('purchases')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)' }}>VER TODOS</button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {(purchases || []).slice(0, 3).map(p => (
                                <div key={p.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ background: 'var(--success-bg)', padding: 10, borderRadius: 12, color: 'var(--primary-color)' }}><Zap size={18} /></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{p.card_name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatVolume(p.credits_available)} restantes</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>{Math.round((p.credits_available / p.credits_origin_total) * 100)}%</div>
                                </div>
                            ))}
                            {(purchases || []).length === 0 && <p className="text-muted text-center py-4">Nenhum lote ativo.</p>}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: 30 }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 style={{ margin: 0, fontWeight: 900 }}>Atividade Recente</h3>
                            <button onClick={() => setActiveTab('ledger')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)' }}>VER TUDO</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {(ledger || []).slice(0, 5).map(l => (
                                <div key={l.id} className="flex items-center gap-4">
                                    <div style={{ 
                                        width: 32, height: 32, borderRadius: '50%', 
                                        background: l.direction === 'in' ? 'var(--success-bg)' : 'rgba(239,68,68,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: l.direction === 'in' ? 'var(--success-color)' : 'var(--danger-color)'
                                    }}>
                                        {l.direction === 'in' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{
                                            l.entry_type === 'purchase_credit' ? 'Compra de Card' :
                                            l.entry_type === 'gift_redeem' ? 'Resgate de Gift' :
                                            l.entry_type === 'gift_issue' ? 'Emissão de Gift' :
                                            l.entry_type === 'reserve_credit' ? 'Reserva (Campanha)' : l.entry_type
                                        }</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(l.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: l.direction === 'in' ? 'var(--success-color)' : 'var(--text-primary)' }}>
                                        {l.direction === 'in' ? '+' : '-'}{formatVolume(l.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'purchases' && (
                <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    {['Card / ID', 'Original', 'Disponível', 'Status', 'Termo', 'Ação'].map(h => (
                                        <th key={h} style={{ padding: '20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(purchases || []).map(p => (
                                    <tr key={p.id} style={{ borderTop: '1px solid var(--surface-border-subtle)' }}>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.card_name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.purchase_reference}</div>
                                        </td>
                                        <td style={{ padding: '20px', fontWeight: 700 }}>{formatVolume(p.credits_origin_total)}</td>
                                        <td style={{ padding: '20px' }}>
                                            <div className="flex items-center gap-3">
                                                <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>{formatVolume(p.credits_available)}</span>
                                                <div style={{ width: 60, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                                    <div style={{ width: `${(p.credits_available / p.credits_origin_total) * 100}%`, height: '100%', background: 'var(--primary-color)' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <span className={`badge ${p.purchase_status === 'activated' ? 'badge-success' : ''}`} style={{ fontSize: '0.6rem' }}>
                                                {p.purchase_status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {p.refund_deadline_at ? new Date(p.refund_deadline_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            {p.credits_available > 0 && p.purchase_status === 'activated' && (
                                                <button 
                                                    onClick={() => { setSelectedPurchase(p); setShowRefundModal(true); }}
                                                    className="btn"
                                                    style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger-color)', padding: '6px 12px', fontSize: '0.7rem', border: 'none' }}
                                                >Reembolso</button>
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
                <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    {['Data', 'Tipo', 'Variação', 'Antes', 'Depois'].map(h => (
                                        <th key={h} style={{ padding: '20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(ledger || []).map(l => (
                                    <tr key={l.id} style={{ borderTop: '1px solid var(--surface-border-subtle)' }}>
                                        <td style={{ padding: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(l.created_at).toLocaleString()}</td>
                                        <td style={{ padding: '20px' }}>
                                            <div className="flex items-center gap-2">
                                                <div style={{ 
                                                    width: 8, height: 8, borderRadius: '50%', 
                                                    background: l.direction === 'in' ? 'var(--success-color)' : l.direction === 'hold' ? 'var(--warning-color)' : 'var(--danger-color)' 
                                                }} />
                                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{
                                                    l.entry_type === 'purchase_credit' ? 'Compra' :
                                                    l.entry_type === 'gift_redeem' ? 'Resgate' :
                                                    l.entry_type === 'gift_issue' ? 'Envio Gift' :
                                                    l.entry_type === 'reserve_credit' ? 'Reserva' : l.entry_type
                                                }</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', fontWeight: 900, color: l.direction === 'in' ? 'var(--success-color)' : l.direction === 'hold' ? 'var(--warning-color)' : 'var(--text-primary)' }}>
                                            {l.direction === 'in' ? '+' : '-'}{formatVolume(l.amount)}
                                        </td>
                                        <td style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatVolume(l.balance_before)}</td>
                                        <td style={{ padding: '20px', fontWeight: 800, fontSize: '0.85rem' }}>{formatVolume(l.balance_after)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'gifts' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
                    <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: 30 }}>
                        <h3 className="mb-6" style={{ margin: 0, fontWeight: 900 }}>Gifts Enviados</h3>
                        <div className="flex flex-col gap-3">
                            {(gifts || []).filter(g => g.creator_user_id == user?.id).map(g => (
                                <div key={g.id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary-color)' }}>{g.code}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{g.recipient_email || 'Link público'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800 }}>{formatVolume(g.amount)}</div>
                                        <span className={`badge ${g.gift_status === 'redeemed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.55rem' }}>{g.gift_status}</span>
                                    </div>
                                </div>
                            ))}
                            {(gifts || []).filter(g => g.creator_user_id == user?.id).length === 0 && <p className="text-muted text-center py-4">Nenhum gift enviado.</p>}
                        </div>
                    </div>
                    <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: 30 }}>
                        <h3 className="mb-6" style={{ margin: 0, fontWeight: 900 }}>Gifts Recebidos</h3>
                        <div className="flex flex-col gap-3">
                            {(gifts || []).filter(g => g.recipient_user_id == user?.id).map(g => (
                                <div key={g.id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>{g.code}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recebido em {new Date(g.redeemed_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ fontWeight: 900, color: 'var(--primary-color)' }}>+{formatVolume(g.amount)}</div>
                                </div>
                            ))}
                            {(gifts || []).filter(g => g.recipient_user_id == user?.id).length === 0 && <p className="text-muted text-center py-4">Nenhum gift recebido.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {(showGiftModal || showRedeemModal || showRefundModal) && (
                <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay-bg)', backdropFilter: 'blur(12px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="glass-panel animate-fade-in" style={{ borderRadius: 'var(--radius-lg)', padding: 40, maxWidth: 500, width: '100%', position: 'relative' }}>
                        <button onClick={() => { setShowGiftModal(false); setShowRedeemModal(false); setShowRefundModal(false); }} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={24} /></button>
                        
                        {showGiftModal && (
                            <>
                                <h2 className="text-gradient" style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Criar Gift Card</h2>
                                <p className="subtitle">Transfira créditos instantaneamente para outro parceiro.</p>
                                <form onSubmit={handleCreateGift}>
                                    <div className="input-group">
                                        <label>MONTANTE EM CRÉDITOS</label>
                                        <input type="number" required value={giftAmount} onChange={e => setGiftAmount(e.target.value)} className="input-field" placeholder="Ex: 50000" />
                                    </div>
                                    <div className="input-group">
                                        <label>EMAIL DO DESTINATÁRIO (OPCIONAL)</label>
                                        <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} className="input-field" placeholder="parceiro@exemplo.com" />
                                    </div>
                                    <button disabled={isProcessing} className="btn btn-primary w-full mt-4" style={{ padding: '16px' }}>
                                        {isProcessing ? <Loader className="animate-spin" size={20} /> : 'GERAR CÓDIGO DE ATIVAÇÃO'}
                                    </button>
                                </form>
                            </>
                        )}

                        {showRedeemModal && (
                            <>
                                <h2 className="text-gradient" style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Resgatar Gift Card</h2>
                                <p className="subtitle">Insira o código para carregar seu saldo.</p>
                                <form onSubmit={handleRedeemGift}>
                                    <div className="input-group">
                                        <label>CÓDIGO GIFT</label>
                                        <input type="text" required value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())} className="input-field text-center" style={{ letterSpacing: 4, fontWeight: 900, fontSize: '1.2rem' }} placeholder="GIFT-XXXXX" />
                                    </div>
                                    <button disabled={isProcessing} className="btn btn-primary w-full mt-4" style={{ padding: '16px' }}>
                                        {isProcessing ? <Loader className="animate-spin" size={20} /> : 'ATIVAR CRÉDITOS NA CONTA'}
                                    </button>
                                </form>
                            </>
                        )}

                        {showRefundModal && (
                            <>
                                <h2 style={{ color: 'var(--danger-color)' }}>Solicitar Reembolso</h2>
                                <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
                                    <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--danger-color)', fontWeight: 800, fontSize: '0.85rem' }}>
                                        <AlertCircle size={16} /> ATENÇÃO AOS REQUISITOS
                                    </div>
                                    <ul className="text-muted" style={{ margin: 0, paddingLeft: 20, fontSize: '0.75rem', lineHeight: 1.6 }}>
                                        <li>Prazo: Até 7 dias (168h) após a compra.</li>
                                        <li>Uso: O lote deve conter pelo menos 90% dos créditos.</li>
                                        <li>Taxa: 10% de processamento.</li>
                                    </ul>
                                </div>
                                <div className="mb-4">
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ESTIMATIVA DE RECOUP</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 950 }}>{formatPrice((selectedPurchase?.credits_available / selectedPurchase?.credits_origin_total) * selectedPurchase?.price_paid * 0.9)}</div>
                                </div>
                                <form onSubmit={handleRequestRefund}>
                                    <div className="input-group">
                                        <label>MOTIVO DO CANCELAMENTO</label>
                                        <textarea required value={refundReason} onChange={e => setRefundReason(e.target.value)} className="input-field" style={{ height: 100, resize: 'none' }} placeholder="Explique brevemente..." />
                                    </div>
                                    <button disabled={isProcessing} className="btn w-full mt-4" style={{ background: 'var(--danger-color)', color: '#fff', padding: '16px', border: 'none' }}>
                                        {isProcessing ? <Loader className="animate-spin" size={20} /> : 'CONFIRMAR SOLICITAÇÃO'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
