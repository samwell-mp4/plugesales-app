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
                fetchWalletData();
            } else {
                alert(result.error || 'Erro ao processar reembolso');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading || !data) return (
        <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader size={40} color="#acf800" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
    );

    const { wallet, ledger, purchases, gifts, refunds } = data;

    return (
        <div style={{ fontFamily: 'var(--font-family)', maxWidth: 1200, margin: '0 auto', paddingBottom: 60, color: 'var(--text-primary)' }}>
            
            {/* Header section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ background: 'linear-gradient(135deg,#acf800,#84c000)', padding: 14, borderRadius: 18, display: 'flex', boxShadow: '0 10px 25px rgba(172,248,0,0.2)' }}>
                        <Wallet color="#000" size={28} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 950, fontSize: '1.8rem', letterSpacing: '-0.8px' }}>
                            Minha <span style={{ color: 'var(--primary-color)' }}>Wallet</span>
                        </h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gestão inteligente de créditos Plug Cards</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setShowRedeemModal(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: '#fff', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
                        <ArrowDownLeft size={18} color="#acf800" /> Resgatar Gift
                    </button>
                    <button onClick={() => setShowGiftModal(true)} style={{ background: 'var(--primary-color)', border: 'none', color: '#000', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800 }}>
                        <Gift size={18} /> Criar Gift Card
                    </button>
                </div>
            </div>

            {/* Main Balance Card */}
            <div style={{ 
                background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(2,6,23,0.95))',
                border: '1px solid var(--surface-border)',
                borderRadius: 32,
                padding: '40px',
                marginBottom: 40,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                gap: 40
            }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, background: 'rgba(172,248,0,0.05)', filter: 'blur(80px)', borderRadius: '50%' }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldCheck size={14} color="#acf800" /> SALDO CONSOLIDADO
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: '4.5rem', fontWeight: 950, letterSpacing: '-3px', lineHeight: 1 }}>{formatVolume(wallet.total_credits_available)}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-muted)' }}>CRÉDITOS</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Equivalente aproximado a <span style={{ color: '#fff', fontWeight: 700 }}>{formatPrice(wallet.total_credits_available * 0.01)}</span> em infraestrutura ativa.</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: '30px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                <Clock size={16} /> Reservado (Campanhas)
                            </div>
                            <span style={{ fontWeight: 800, color: '#eab308' }}>{formatVolume(wallet.total_credits_reserved)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                <ArrowUpRight size={16} /> Total Utilizado
                            </div>
                            <span style={{ fontWeight: 800, color: '#f97316' }}>{formatVolume(wallet.total_credits_used)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                <Gift size={16} /> Gift Cards (Out)
                            </div>
                            <span style={{ fontWeight: 800, color: '#8b5cf6' }}>{formatVolume(wallet.total_credits_gifted_out)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 30, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 16, width: 'fit-content' }}>
                {[
                    { id: 'overview', name: 'Geral', icon: <LayoutDashboard size={16} /> },
                    { id: 'purchases', name: 'Lotes Adquiridos', icon: <CreditCard size={16} /> },
                    { id: 'ledger', name: 'Extrato Detalhado', icon: <History size={16} /> },
                    { id: 'gifts', name: 'Gift Cards', icon: <Gift size={16} /> },
                ].map(t => (
                    <button 
                        key={t.id} 
                        onClick={() => setActiveTab(t.id as any)}
                        style={{ 
                            background: activeTab === t.id ? 'rgba(172,248,0,0.1)' : 'transparent', 
                            color: activeTab === t.id ? '#acf800' : 'var(--text-muted)',
                            border: '1px solid ' + (activeTab === t.id ? 'rgba(172,248,0,0.2)' : 'transparent'),
                            padding: '10px 24px', 
                            borderRadius: '12px', 
                            cursor: 'pointer', 
                            fontWeight: 800, 
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            transition: 'all 0.2s'
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
                    <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 24, padding: 30 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem' }}>Lotes Ativos</h3>
                            <button onClick={() => setActiveTab('purchases')} style={{ background: 'none', border: 'none', color: '#acf800', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800 }}>VER TODOS</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {purchases.slice(0, 3).map(p => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ background: 'rgba(172,248,0,0.1)', padding: 10, borderRadius: 12, color: '#acf800' }}><Zap size={18} /></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{p.card_name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatVolume(p.credits_available)} restantes</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>{Math.round((p.credits_available / p.credits_origin_total) * 100)}%</div>
                                </div>
                            ))}
                            {purchases.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>Nenhum lote ativo.</p>}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 24, padding: 30 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem' }}>Atividade Recente</h3>
                            <button onClick={() => setActiveTab('ledger')} style={{ background: 'none', border: 'none', color: '#acf800', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800 }}>VER TUDO</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {ledger.slice(0, 5).map(l => (
                                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ 
                                        width: 32, height: 32, borderRadius: '50%', 
                                        background: l.direction === 'in' ? 'rgba(172,248,0,0.1)' : 'rgba(239,68,68,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: l.direction === 'in' ? '#acf800' : '#ef4444'
                                    }}>
                                        {l.direction === 'in' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{
                                            l.entry_type === 'purchase_credit' ? 'Compra de Card' :
                                            l.entry_type === 'gift_redeem' ? 'Resgate de Gift' :
                                            l.entry_type === 'gift_issue' ? 'Emissão de Gift' :
                                            l.entry_type === 'reserve_credit' ? 'Reserva (Campanha)' : l.entry_type
                                        }</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(l.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: l.direction === 'in' ? '#acf800' : '#fff' }}>
                                        {l.direction === 'in' ? '+' : '-'}{formatVolume(l.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'purchases' && (
                <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 24, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.02)' }}>
                                {['Card / ID', 'Volume Original', 'Disponível', 'Status', 'Expira em', 'Ação'].map(h => (
                                    <th key={h} style={{ padding: '20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.card_name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.purchase_reference}</div>
                                    </td>
                                    <td style={{ padding: '20px', fontWeight: 700 }}>{formatVolume(p.credits_origin_total)}</td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontWeight: 900 }}>{formatVolume(p.credits_available)}</span>
                                            <div style={{ width: 60, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                                <div style={{ width: `${(p.credits_available / p.credits_origin_total) * 100}%`, height: '100%', background: '#acf800' }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{ 
                                            background: p.purchase_status === 'activated' ? 'rgba(172,248,0,0.1)' : 'rgba(255,255,255,0.05)', 
                                            color: p.purchase_status === 'activated' ? '#acf800' : '#64748b', 
                                            padding: '4px 12px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' 
                                        }}>{p.purchase_status}</span>
                                    </td>
                                    <td style={{ padding: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {p.refund_deadline_at ? new Date(p.refund_deadline_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        {p.credits_available > 0 && p.purchase_status === 'activated' && (
                                            <button 
                                                onClick={() => { setSelectedPurchase(p); setShowRefundModal(true); }}
                                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '6px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                            >Reembolso</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'ledger' && (
                <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 24, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.02)' }}>
                                {['Data / Hora', 'Tipo de Operação', 'Variação', 'Saldo Anterior', 'Novo Saldo'].map(h => (
                                    <th key={h} style={{ padding: '20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ledger.map(l => (
                                <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(l.created_at).toLocaleString()}</td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ 
                                                width: 8, height: 8, borderRadius: '50%', 
                                                background: l.direction === 'in' ? '#acf800' : l.direction === 'hold' ? '#eab308' : '#ef4444' 
                                            }} />
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{
                                                l.entry_type === 'purchase_credit' ? 'Compra de Card' :
                                                l.entry_type === 'gift_redeem' ? 'Resgate de Gift' :
                                                l.entry_type === 'gift_issue' ? 'Emissão de Gift' :
                                                l.entry_type === 'reserve_credit' ? 'Reserva (Campanha)' : l.entry_type
                                            }</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', fontWeight: 900, color: l.direction === 'in' ? '#acf800' : l.direction === 'hold' ? '#eab308' : '#fff' }}>
                                        {l.direction === 'in' ? '+' : '-'}{formatVolume(l.amount)}
                                    </td>
                                    <td style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatVolume(l.balance_before)}</td>
                                    <td style={{ padding: '20px', fontWeight: 800, fontSize: '0.85rem' }}>{formatVolume(l.balance_after)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'gifts' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                    <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 24, padding: 30 }}>
                        <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', marginBottom: 24 }}>Meus Gifts Enviados</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {gifts.filter(g => g.creator_user_id == user?.id).map(g => (
                                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#acf800' }}>{g.code}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{g.recipient_email || 'Link público'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800 }}>{formatVolume(g.amount)}</div>
                                        <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: g.gift_status === 'redeemed' ? '#acf800' : '#eab308' }}>{g.gift_status}</div>
                                    </div>
                                </div>
                            ))}
                            {gifts.filter(g => g.creator_user_id == user?.id).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Nenhum gift enviado.</p>}
                        </div>
                    </div>
                    <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 24, padding: 30 }}>
                        <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', marginBottom: 24 }}>Recortes Recebidos</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {gifts.filter(g => g.recipient_user_id == user?.id).map(g => (
                                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 900 }}>{g.code}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recebido em {new Date(g.redeemed_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ fontWeight: 900, color: '#acf800' }}>+{formatVolume(g.amount)}</div>
                                </div>
                            ))}
                            {gifts.filter(g => g.recipient_user_id == user?.id).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Nenhum gift recebido.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showGiftModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#0a0f1a', border: '1px solid var(--surface-border)', borderRadius: 24, padding: 40, maxWidth: 500, width: '100%', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
                        <button onClick={() => setShowGiftModal(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                        <h2 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: 12 }}>Criar <span style={{ color: '#acf800' }}>Gift Card</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 30 }}>Transfira créditos instantaneamente para outro parceiro ou afiliado.</p>
                        
                        <form onSubmit={handleCreateGift}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>MONTANTE EM CRÉDITOS</label>
                                <input type="number" required value={giftAmount} onChange={e => setGiftAmount(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', padding: 18, borderRadius: 12, color: '#fff', fontSize: '1.1rem', fontWeight: 700, outline: 'none' }} placeholder="Ex: 50000" />
                            </div>
                            <div style={{ marginBottom: 30 }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>EMAIL DO DESTINATÁRIO (OPCIONAL)</label>
                                <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', padding: 18, borderRadius: 12, color: '#fff', fontSize: '1rem', outline: 'none' }} placeholder="parceiro@exemplo.com" />
                            </div>

                            <button disabled={isProcessing} style={{ width: '100%', background: '#acf800', color: '#000', border: 'none', padding: 20, borderRadius: 14, fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}>
                                {isProcessing ? 'Gerando...' : 'GERAR CÓDIGO DE ATIVAÇÃO'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showRedeemModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#0a0f1a', border: '1px solid var(--surface-border)', borderRadius: 24, padding: 40, maxWidth: 500, width: '100%', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
                        <button onClick={() => setShowRedeemModal(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                        <h2 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: 12 }}>Resgatar <span style={{ color: '#acf800' }}>Gift Card</span></h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 30 }}>Insira o código alfanumérico para carregar seu saldo instantaneamente.</p>
                        
                        <form onSubmit={handleRedeemGift}>
                            <div style={{ marginBottom: 30 }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>CÓDIGO GIFT</label>
                                <input type="text" required value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', padding: 18, borderRadius: 12, color: '#fff', fontSize: '1.2rem', fontWeight: 900, textAlign: 'center', letterSpacing: 4, outline: 'none' }} placeholder="GIFT-XXXXX" />
                            </div>

                            <button disabled={isProcessing} style={{ width: '100%', background: '#acf800', color: '#000', border: 'none', padding: 20, borderRadius: 14, fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}>
                                {isProcessing ? 'Validando...' : 'ATIVAR CRÉDITOS NA CONTA'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showRefundModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#0a0f1a', border: '1px solid var(--surface-border)', borderRadius: 24, padding: 40, maxWidth: 520, width: '100%', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
                        <button onClick={() => setShowRefundModal(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 950, marginBottom: 12 }}>Solicitar <span style={{ color: '#ef4444' }}>Reembolso</span></h2>
                        
                        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', marginBottom: 10 }}>
                                <AlertCircle size={16} /> ATENÇÃO AOS REQUISITOS
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.6 }}>
                                <li>Prazo: Até 7 dias (168h) após a compra.</li>
                                <li>Uso: O lote deve conter pelo menos 90% dos créditos originais.</li>
                                <li>Taxa: 10% de processamento sobre o valor recuperado.</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>ESTIMATIVA DE RECOUP</div>
                            <div style={{ fontSize: '2rem', fontWeight: 950 }}>{formatPrice((selectedPurchase?.credits_available / selectedPurchase?.credits_origin_total) * selectedPurchase?.price_paid * 0.9)}</div>
                        </div>
                        
                        <form onSubmit={handleRequestRefund}>
                            <div style={{ marginBottom: 30 }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>MOTIVO DO CANCELAMENTO</label>
                                <textarea required value={refundReason} onChange={e => setRefundReason(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', padding: 18, borderRadius: 12, color: '#fff', fontSize: '0.9rem', outline: 'none', height: 100, resize: 'none' }} placeholder="Explique brevemente o motivo..." />
                            </div>

                            <button disabled={isProcessing} style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: 20, borderRadius: 14, fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}>
                                {isProcessing ? 'Processando...' : 'CONFIRMAR SOLICITAÇÃO'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
