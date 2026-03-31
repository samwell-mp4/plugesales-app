import { useState, useEffect } from 'react';
import { ShoppingCart, Zap, Shield, Cpu, ChevronRight, X, CreditCard, Check, Lock, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PlugCard {
    id: number;
    name: string;
    tier: string;
    total_volume: number;
    max_chips: number;
    max_campaigns: number;
    priority_level: string;
    speed: string;
    anti_ban_level: string;
    features: { support?: string; manager?: boolean; api?: boolean; custom?: boolean };
    price: string;
    is_active: boolean;
}

interface CheckoutData {
    paymentMethod: 'credit_card' | 'debit_card' | 'pix';
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
}

const TIER_CONFIG: Record<string, { glow: string; border: string; badge: string; label: string; emoji: string }> = {
    foundation: { glow: 'rgba(148,163,184,0.25)', border: 'rgba(148,163,184,0.4)', badge: '#94a3b8', label: 'Foundation', emoji: '🧱' },
    growth:      { glow: 'rgba(59,130,246,0.25)',  border: 'rgba(59,130,246,0.5)',  badge: '#3b82f6', label: 'Growth',      emoji: '📈' },
    performance: { glow: 'rgba(172,248,0,0.25)',   border: 'rgba(172,248,0,0.5)',   badge: '#acf800', label: 'Performance', emoji: '⚡' },
    velocity:    { glow: 'rgba(6,182,212,0.25)',   border: 'rgba(6,182,212,0.5)',   badge: '#06b6d4', label: 'Velocity',    emoji: '🚀' },
    dominance:   { glow: 'rgba(139,92,246,0.25)',  border: 'rgba(139,92,246,0.5)',  badge: '#8b5cf6', label: 'Dominance',   emoji: '👑' },
    elite:       { glow: 'rgba(234,179,8,0.3)',    border: 'rgba(234,179,8,0.6)',   badge: '#eab308', label: 'Elite',       emoji: '🌟' },
    sovereign:   { glow: 'rgba(249,115,22,0.3)',   border: 'rgba(249,115,22,0.6)',  badge: '#f97316', label: 'Sovereign',   emoji: '🔱' },
    apex:        { glow: 'rgba(239,68,68,0.35)',   border: 'rgba(239,68,68,0.7)',   badge: '#ef4444', label: 'Apex',        emoji: '💎' },
};

const formatVolume = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toString();
};

const formatPrice = (p: string) =>
    parseFloat(p).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const SPEED_LABEL: Record<string, string> = { normal: 'Normal', fast: 'Rápido', accelerated: 'Acelerado' };
const PRIORITY_LABEL: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta', max: 'Máxima' };
const ANTIBAN_LABEL: Record<string, string> = { basic: 'Básico', medium: 'Médio', advanced: 'Avançado' };

export default function PlugCardsExchange() {
    const { user } = useAuth();
    const [cards, setCards] = useState<PlugCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<PlugCard | null>(null);
    const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'processing' | 'success' | 'error'>('details');
    const [checkoutData, setCheckoutData] = useState<CheckoutData>({
        paymentMethod: 'credit_card', cardNumber: '', cardHolder: '', expiryDate: '', cvv: ''
    });
    const [txResult, setTxResult] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/plug-cards')
            .then(r => r.json())
            .then(data => { setCards(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const openCheckout = (card: PlugCard) => {
        setSelectedCard(card);
        setCheckoutStep('details');
        setCheckoutData({ paymentMethod: 'credit_card', cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
        setTxResult(null);
        setErrorMsg('');
    };

    const closeCheckout = () => setSelectedCard(null);

    const formatCardNumber = (v: string) => v.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
    const formatExpiry = (v: string) => v.replace(/\D/g, '').substring(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');

    const handleBuy = async () => {
        if (!user) {
            setErrorMsg('Você precisa estar logado para comprar. Acesse /login.');
            setCheckoutStep('error');
            return;
        }

        setCheckoutStep('processing');
        try {
            const res = await fetch('/api/plug-cards/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    plugCardId: selectedCard?.id,
                    paymentMethod: checkoutData.paymentMethod,
                    cardNumber: checkoutData.cardNumber,
                    cardHolder: checkoutData.cardHolder,
                    expiryDate: checkoutData.expiryDate,
                    cvv: checkoutData.cvv,
                })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setErrorMsg(data.details || data.error || 'Erro no processamento.');
                setCheckoutStep('error');
                return;
            }
            setTxResult(data);
            setCheckoutStep('success');
        } catch (e) {
            setErrorMsg('Erro de conexão. Tente novamente.');
            setCheckoutStep('error');
        }
    };

    const tier = selectedCard ? TIER_CONFIG[selectedCard.tier] || TIER_CONFIG.foundation : null;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', fontFamily: 'var(--font-family)', padding: '0' }}>

            {/* Header */}
            <header style={{
                background: 'rgba(5, 7, 10, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(172,248,0,0.1)',
                padding: '20px 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'linear-gradient(135deg,#acf800,#84c000)', padding: 10, borderRadius: 14, display: 'flex', boxShadow: '0 0 20px rgba(172,248,0,0.3)' }}>
                        <CreditCard color="#000" size={24} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.5px' }}>
                            Plug <span style={{ color: '#acf800' }}>Cards</span>
                        </h1>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Exchange — Unidades de capacidade de disparo</p>
                    </div>
                </div>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Olá, <strong style={{ color: '#f8fafc' }}>{user.name}</strong></span>
                        <a href="/my-cards" style={{ background: 'rgba(172,248,0,0.1)', border: '1px solid rgba(172,248,0,0.3)', color: '#acf800', padding: '8px 16px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ShoppingCart size={14} /> Meus Cards
                        </a>
                    </div>
                ) : (
                    <a href="/login" style={{ background: 'var(--primary-gradient)', color: '#000', padding: '10px 20px', borderRadius: 10, fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none' }}>
                        Entrar / Cadastrar
                    </a>
                )}
            </header>

            {/* Hero */}
            <section style={{ textAlign: 'center', padding: '64px 40px 48px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(172,248,0,0.08)', border: '1px solid rgba(172,248,0,0.2)', borderRadius: 40, padding: '6px 16px', marginBottom: 24 }}>
                    <Zap size={14} color="#acf800" />
                    <span style={{ color: '#acf800', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1 }}>PLUG CARDS EXCHANGE</span>
                </div>
                <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#f8fafc', margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-1px' }}>
                    Capacidade de Disparo<br />
                    <span style={{ background: 'linear-gradient(135deg,#acf800,#84c000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sob Demanda</span>
                </h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
                    Escolha o card ideal para sua operação. Volume garantido, prioridade no envio e proteção anti-ban calibrada para cada escala.
                </p>
            </section>

            {/* Cards Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                    <Loader size={40} color="#acf800" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            ) : (
                <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                    {cards.map(card => {
                        const t = TIER_CONFIG[card.tier] || TIER_CONFIG.foundation;
                        const isHovered = hoveredId === card.id;
                        return (
                            <div
                                key={card.id}
                                onMouseEnter={() => setHoveredId(card.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    background: 'rgba(15,23,42,0.8)',
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${isHovered ? t.border : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: 20,
                                    padding: '28px 24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                                    boxShadow: isHovered ? `0 20px 60px ${t.glow}, 0 0 0 1px ${t.border}` : '0 4px 24px rgba(0,0,0,0.4)',
                                    display: 'flex', flexDirection: 'column', gap: 20,
                                    position: 'relative', overflow: 'hidden'
                                }}
                            >
                                {/* Glow bg */}
                                <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: t.glow, filter: 'blur(40px)', pointerEvents: 'none' }} />

                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <span style={{ fontSize: '1.2rem' }}>{t.emoji}</span>
                                            <span style={{ background: `${t.badge}20`, color: t.badge, border: `1px solid ${t.badge}40`, borderRadius: 30, padding: '3px 10px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                                                {t.label}
                                            </span>
                                        </div>
                                        <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
                                            {card.name.split(' | ')[0]}
                                        </h3>
                                        <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                                            {card.name.split(' | ')[1]}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#acf800', fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.5px' }}>
                                            {formatPrice(card.price)}
                                        </div>
                                        <div style={{ color: '#475569', fontSize: '0.7rem' }}>à vista</div>
                                    </div>
                                </div>

                                {/* Volume destaque */}
                                <div style={{ background: `${t.badge}10`, border: `1px solid ${t.badge}20`, borderRadius: 12, padding: '14px 18px', textAlign: 'center' }}>
                                    <div style={{ color: t.badge, fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px', lineHeight: 1 }}>
                                        {formatVolume(card.total_volume)}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 4, fontWeight: 600 }}>disparos incluídos</div>
                                </div>

                                {/* Specs */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {[
                                        { label: 'Chips', value: card.max_chips === 99 ? 'Ilimitado' : card.max_chips, icon: <Cpu size={13} /> },
                                        { label: 'Campanhas', value: card.max_campaigns === 99 ? 'Ilimitadas' : card.max_campaigns, icon: <Zap size={13} /> },
                                        { label: 'Velocidade', value: SPEED_LABEL[card.speed] || card.speed, icon: <Zap size={13} /> },
                                        { label: 'Anti-Ban', value: ANTIBAN_LABEL[card.anti_ban_level] || card.anti_ban_level, icon: <Shield size={13} /> },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 12px' }}>
                                            <div style={{ color: '#475569', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                                                {s.icon} {s.label}
                                            </div>
                                            <div style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.85rem' }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Prioridade */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>Prioridade de Envio</span>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {['low', 'medium', 'high', 'max'].map((p, i) => {
                                            const levels = ['low', 'medium', 'high', 'max'];
                                            const active = levels.indexOf(card.priority_level) >= i;
                                            return <div key={p} style={{ width: 20, height: 6, borderRadius: 3, background: active ? t.badge : 'rgba(255,255,255,0.08)', transition: 'background 0.2s' }} />;
                                        })}
                                    </div>
                                </div>

                                {/* Features */}
                                {card.features?.manager && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {card.features.manager && <span style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: '0.65rem', fontWeight: 700 }}>👤 Gestor Dedicado</span>}
                                        {card.features.api && <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: '0.65rem', fontWeight: 700 }}>🔌 API Access</span>}
                                        {card.features.custom && <span style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: '0.65rem', fontWeight: 700 }}>⚙️ Custom</span>}
                                    </div>
                                )}

                                {/* CTA */}
                                <button
                                    id={`buy-btn-${card.id}`}
                                    onClick={() => openCheckout(card)}
                                    style={{
                                        background: isHovered ? t.badge : 'rgba(255,255,255,0.05)',
                                        color: isHovered ? '#000' : '#94a3b8',
                                        border: `1px solid ${isHovered ? t.badge : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: 12, padding: '14px', width: '100%',
                                        fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                                        transition: 'all 0.25s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                    }}
                                >
                                    <ShoppingCart size={16} /> Adquirir Card <ChevronRight size={16} />
                                </button>
                            </div>
                        );
                    })}
                </section>
            )}

            {/* Checkout Modal */}
            {selectedCard && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={(e) => { if (e.target === e.currentTarget && checkoutStep !== 'processing') closeCheckout(); }}>
                    <div style={{ background: '#0a0f1e', border: `1px solid ${tier?.border || 'rgba(255,255,255,0.1)'}`, borderRadius: 24, maxWidth: 480, width: '100%', padding: 32, boxShadow: `0 0 60px ${tier?.glow}`, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>

                        {checkoutStep !== 'processing' && checkoutStep !== 'success' && (
                            <button onClick={closeCheckout} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748b', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                        )}

                        {/* Card Summary */}
                        {(checkoutStep === 'details' || checkoutStep === 'payment') && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                    <span style={{ fontSize: '2rem' }}>{tier?.emoji}</span>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#f8fafc', fontWeight: 900, fontSize: '1.1rem' }}>{selectedCard.name.split(' | ')[0]}</h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{selectedCard.name.split(' | ')[1]}</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                        <div style={{ color: '#acf800', fontWeight: 900, fontSize: '1.4rem' }}>{formatPrice(selectedCard.price)}</div>
                                        <div style={{ color: '#475569', fontSize: '0.7rem' }}>{formatVolume(selectedCard.total_volume)} disparos</div>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, marginBottom: 24 }}>
                                    <h4 style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Método de Pagamento</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                                        {(['credit_card', 'debit_card', 'pix'] as const).map(m => {
                                            const labels = { credit_card: '💳 Crédito', debit_card: '💳 Débito', pix: '⚡ PIX' };
                                            return (
                                                <button
                                                    key={m}
                                                    onClick={() => setCheckoutData(d => ({ ...d, paymentMethod: m }))}
                                                    style={{ background: checkoutData.paymentMethod === m ? 'rgba(172,248,0,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${checkoutData.paymentMethod === m ? 'rgba(172,248,0,0.5)' : 'rgba(255,255,255,0.08)'}`, color: checkoutData.paymentMethod === m ? '#acf800' : '#64748b', borderRadius: 10, padding: '10px 8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.2s' }}
                                                >{labels[m]}</button>
                                            );
                                        })}
                                    </div>

                                    {(checkoutData.paymentMethod === 'credit_card' || checkoutData.paymentMethod === 'debit_card') && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            <div>
                                                <label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>Número do Cartão</label>
                                                <input
                                                    id="card-number-input"
                                                    placeholder="0000 0000 0000 0000"
                                                    value={checkoutData.cardNumber}
                                                    onChange={e => setCheckoutData(d => ({ ...d, cardNumber: formatCardNumber(e.target.value) }))}
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f8fafc', fontSize: '1rem', fontFamily: 'monospace', letterSpacing: 2, outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>Nome no Cartão</label>
                                                <input
                                                    id="card-holder-input"
                                                    placeholder="NOME COMPLETO"
                                                    value={checkoutData.cardHolder}
                                                    onChange={e => setCheckoutData(d => ({ ...d, cardHolder: e.target.value.toUpperCase() }))}
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f8fafc', fontSize: '0.9rem', outline: 'none' }}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                                <div>
                                                    <label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>Validade</label>
                                                    <input
                                                        id="expiry-input"
                                                        placeholder="MM/AA"
                                                        value={checkoutData.expiryDate}
                                                        onChange={e => setCheckoutData(d => ({ ...d, expiryDate: formatExpiry(e.target.value) }))}
                                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f8fafc', fontSize: '0.9rem', outline: 'none' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>CVV</label>
                                                    <input
                                                        id="cvv-input"
                                                        placeholder="000"
                                                        maxLength={4}
                                                        value={checkoutData.cvv}
                                                        onChange={e => setCheckoutData(d => ({ ...d, cvv: e.target.value.replace(/\D/g, '') }))}
                                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#f8fafc', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {checkoutData.paymentMethod === 'pix' && (
                                        <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(172,248,0,0.05)', border: '1px solid rgba(172,248,0,0.15)', borderRadius: 14 }}>
                                            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>⚡</div>
                                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Após confirmação, um QR Code PIX será gerado para pagamento instantâneo.</p>
                                        </div>
                                    )}
                                </div>

                                {!user && (
                                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
                                        <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                                        <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.8rem' }}>
                                            Você precisa estar <strong>logado</strong> para concluir a compra. <a href="/login" style={{ color: '#acf800' }}>Entrar aqui →</a>
                                        </p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                                    <Lock size={12} color="#475569" />
                                    <span style={{ color: '#475569', fontSize: '0.72rem' }}>Pagamento seguro • Dados criptografados</span>
                                </div>

                                <button
                                    id="confirm-purchase-btn"
                                    onClick={handleBuy}
                                    style={{ width: '100%', background: 'linear-gradient(135deg,#acf800,#84c000)', color: '#000', border: 'none', borderRadius: 14, padding: '16px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    <Lock size={18} /> Confirmar Compra — {formatPrice(selectedCard.price)}
                                </button>
                            </>
                        )}

                        {/* Processing */}
                        {checkoutStep === 'processing' && (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <div style={{ width: 64, height: 64, border: '4px solid rgba(172,248,0,0.2)', borderTop: '4px solid #acf800', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
                                <h3 style={{ color: '#f8fafc', marginBottom: 8 }}>Processando Pagamento...</h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Aguarde enquanto verificamos sua transação.</p>
                            </div>
                        )}

                        {/* Success */}
                        {checkoutStep === 'success' && txResult && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ width: 72, height: 72, background: 'rgba(172,248,0,0.1)', border: '2px solid #acf800', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <Check size={36} color="#acf800" />
                                </div>
                                <h3 style={{ color: '#f8fafc', marginBottom: 8, fontWeight: 900 }}>Compra Realizada! 🎉</h3>
                                <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.9rem' }}>{txResult.message}</p>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', textAlign: 'left', marginBottom: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Transação ID</span>
                                        <span style={{ color: '#acf800', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700 }}>{txResult.transaction.id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Valor</span>
                                        <span style={{ color: '#f8fafc', fontWeight: 700 }}>{formatPrice(String(txResult.transaction.amount))}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Status</span>
                                        <span style={{ color: '#acf800', fontWeight: 700, fontSize: '0.8rem' }}>✅ Aprovado</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={closeCheckout} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 12, padding: '12px', fontWeight: 700, cursor: 'pointer' }}>Fechar</button>
                                    <a href="/my-cards" style={{ flex: 1, background: 'linear-gradient(135deg,#acf800,#84c000)', color: '#000', borderRadius: 12, padding: '12px', fontWeight: 900, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.9rem' }}>
                                        Ver Meus Cards →
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {checkoutStep === 'error' && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ width: 72, height: 72, background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <X size={36} color="#ef4444" />
                                </div>
                                <h3 style={{ color: '#f8fafc', marginBottom: 8 }}>Pagamento Recusado</h3>
                                <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: '0.9rem' }}>{errorMsg}</p>
                                <button onClick={() => setCheckoutStep('details')} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 12, padding: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                    Tentar Novamente
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
