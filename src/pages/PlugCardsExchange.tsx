import { useState, useEffect } from 'react';
import { CreditCard, Zap, Shield, Cpu, TrendingUp, Check, Plus, ShoppingCart, Loader, ArrowRight, ChevronRight, Sparkles, Building, Rocket, Crown, Star, ShieldCheck, Gem, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CatalogCard {
    id: number;
    name: string;
    tier: string;
    total_volume: number;
    max_chips: number;
    max_campaigns: number;
    priority_level: string;
    speed: string;
    anti_ban_level: string;
    features: { resources?: string[] };
    copy: string;
    price: string;
    is_active: boolean;
}

const TIER_UI: Record<string, { 
    id: string;
    color: string; 
    bg: string; 
    border: string; 
    glow: string; 
    emoji: string; 
    icon: any;
    label: string;
    accent: string;
}> = {
    foundation:  { id: 'foundation',  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', glow: 'rgba(148,163,184,0.2)', emoji: '🧱', icon: Building,    label: 'Foundation',  accent: '#64748b' },
    growth:      { id: 'growth',      color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  glow: 'rgba(59,130,246,0.2)',  emoji: '📈', icon: TrendingUp,  label: 'Growth',      accent: '#1d4ed8' },
    performance: { id: 'performance', color: '#acf800', bg: 'rgba(172,248,0,0.1)',   border: 'rgba(172,248,0,0.3)',   glow: 'rgba(172,248,0,0.2)',   emoji: '⚡', icon: Zap,         label: 'Performance', accent: '#84c000' },
    velocity:    { id: 'velocity',    color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.3)',   glow: 'rgba(6,182,212,0.2)',   emoji: '🚀', icon: Rocket,      label: 'Velocity',    accent: '#0891b2' },
    dominance:   { id: 'dominance',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.3)',  glow: 'rgba(139,92,246,0.2)',  emoji: '👑', icon: Crown,       label: 'Dominance',   accent: '#7c3aed' },
    elite:       { id: 'elite',       color: '#eab308', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)',   glow: 'rgba(234,179,8,0.2)',   emoji: '🌟', icon: Star,        label: 'Elite',       accent: '#ca8a04' },
    sovereign:   { id: 'sovereign',   color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  glow: 'rgba(249,115,22,0.2)',  emoji: '🔱', icon: ShieldCheck, label: 'Sovereign',   accent: '#ea580c' },
    apex:        { id: 'apex',        color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   glow: 'rgba(239,68,68,0.2)',   emoji: '💎', icon: Gem,         label: 'Apex',        accent: '#dc2626' },
};

const formatVolume = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toString();
};

const formatPrice = (p: string | number) =>
    parseFloat(String(p)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PlugCardsExchange() {
    const { user } = useAuth();
    const [catalog, setCatalog] = useState<CatalogCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<number | null>(null);
    const [checkoutCard, setCheckoutCard] = useState<CatalogCard | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card' | 'pix'>('pix');

    useEffect(() => {
        setLoading(true);
        supabase
            .from('plug_cards')
            .select('*')
            .neq('is_active', false)
            .order('price', { ascending: true })
            .then(({ data, error }) => {
                if (!error && data) setCatalog(data as CatalogCard[]);
                setLoading(false);
            });
    }, []);

    const handleBuy = async () => {
        if (!user || !checkoutCard) return;
        setBuyingId(checkoutCard.id);
        try {
            // Insert directly into Supabase user_plug_cards
            const { error } = await supabase.from('user_plug_cards').insert({
                user_id: user.id,
                plug_card_id: checkoutCard.id,
                total_volume: checkoutCard.total_volume,
                used_volume: 0,
                remaining_volume: checkoutCard.total_volume,
                status: 'active',
                payment_method: paymentMethod,
                payment_ref: `PCG-${Date.now()}-${Math.random().toString(36).substring(2,8).toUpperCase()}`,
                purchased_price: parseFloat(checkoutCard.price)
            });
            if (!error) {
                alert(`Sucesso! Você adquiriu o card ${checkoutCard.name}. Ele já está disponível na sua wallet.`);
                window.location.href = '/my-cards';
            } else {
                alert('Erro na transação: ' + error.message);
            }
        } finally {
            setBuyingId(null);
        }
    };

    return (
        <div style={{ fontFamily: 'var(--font-family)', maxWidth: 1200, margin: '0 auto', paddingBottom: 100 }}>

            {/* Hero Header */}
            <div style={{ textAlign: 'center', marginBottom: 60, marginTop: 20 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(172,248,0,0.08)', padding: '8px 20px', borderRadius: 100, border: '1px solid rgba(172,248,0,0.2)', marginBottom: 20 }}>
                    <Sparkles size={16} color="#acf800" />
                    <span style={{ color: '#acf800', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Exchange Oficial Plug & Sales</span>
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: '-2px', lineHeight: 0.9 }}>
                    Potencialize seu <span style={{ color: '#acf800' }}>Ecossistema</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                    Adquira capacidade de disparo inteligente com performance acelerada, <br />
                    proteção anti-ban avançada e prioridade máxima na rede.
                </p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                    <Loader size={48} color="#acf800" style={{ animation: 'spin 1.5s linear infinite' }} />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 20 }}>
                    {catalog.filter(c => c.is_active).map(card => {
                        const ui = TIER_UI[card.tier] || TIER_UI.foundation;
                        const Icon = ui.icon;
                        const resources = card.features?.resources || [];

                        return (
                            <div 
                                key={card.id}
                                style={{
                                    background: 'rgba(15,23,42,0.8)',
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${ui.border}`,
                                    borderRadius: 30,
                                    padding: '32px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = `0 20px 60px ${ui.glow}`;
                                    e.currentTarget.style.borderColor = ui.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = ui.border;
                                }}
                            >
                                {/* Glow Corner */}
                                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: ui.glow, filter: 'blur(40px)', pointerEvents: 'none' }} />

                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                        <div style={{ background: ui.bg, border: `1px solid ${ui.border}`, padding: 12, borderRadius: 16, display: 'flex', color: ui.color }}>
                                            <Icon size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: ui.color, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>Tier {ui.label}</div>
                                            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.3px' }}>{card.name.split(' | ')[0]}</h3>
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, minHeight: 40 }}>
                                        {card.copy || "Capacidade estratégica para sua operação."}
                                    </p>
                                </div>

                                {/* Main Specs */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ color: ui.color, fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', marginBottom: 4 }}>
                                        {formatVolume(card.total_volume)}
                                        <span style={{ fontSize: '1rem', marginLeft: 6, fontWeight: 700, color: 'var(--text-muted)' }}>envios</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600 }}>
                                            <Cpu size={12} /> {card.max_chips === 99 ? '∞' : card.max_chips} Chips
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600 }}>
                                            <Zap size={12} /> {card.max_campaigns === 99 ? '∞' : card.max_campaigns} Camps
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600 }}>
                                            <Shield size={12} /> {card.anti_ban_level} Ban
                                        </div>
                                    </div>
                                </div>

                                {/* Features List */}
                                <div style={{ flex: 1, marginBottom: 30 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Recursos Inclusos:</div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {resources.map((res: string, idx: number) => (
                                            <li key={idx} style={{ display: 'flex', alignItems: 'start', gap: 10, color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: 10, lineHeight: 1.3 }}>
                                                <div style={{ background: 'rgba(172,248,0,0.1)', borderRadius: 4, padding: 2, display: 'flex', marginTop: 1 }}>
                                                    <Check size={12} color="#acf800" strokeWidth={3} />
                                                </div>
                                                {res}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Action */}
                                <div style={{ marginTop: 'auto' }}>
                                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'line-through', opacity: 0.5 }}>De {formatPrice(parseFloat(card.price) * 1.5)}</div>
                                        <div style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{formatPrice(card.price)}</div>
                                    </div>
                                    <button 
                                        onClick={() => setCheckoutCard(card)}
                                        style={{
                                            width: '100%',
                                            background: `linear-gradient(135deg, ${ui.color}, ${ui.accent})`,
                                            color: card.tier === 'foundation' || card.tier === 'growth' ? '#fff' : '#000',
                                            border: 'none',
                                            borderRadius: 16,
                                            padding: '16px',
                                            fontWeight: 900,
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                            boxShadow: `0 10px 30px ${ui.glow}`,
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        Adquirir Capacidade <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Checkout Modal */}
            {checkoutCard && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 32, maxWidth: 900, width: '100%', display: 'grid', gridTemplateColumns: '1.2fr 1fr', overflow: 'hidden' }}>
                        
                        {/* Details Side */}
                        <div style={{ padding: 40, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid var(--surface-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                                <div style={{ background: TIER_UI[checkoutCard.tier].bg, color: TIER_UI[checkoutCard.tier].color, padding: 12, borderRadius: 16 }}>
                                    <CreditCard size={28} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 900, fontSize: '1.5rem' }}>Confirme sua Compra</h2>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ativação imediata em sua conta</p>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', borderRadius: 24, padding: 24, marginBottom: 30 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Produto selecionado:</span>
                                    <span style={{ color: TIER_UI[checkoutCard.tier].color, fontWeight: 900 }}>{checkoutCard.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Volume de disparo:</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{formatVolume(checkoutCard.total_volume)} envios</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nível de prioridade:</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 800, textTransform: 'capitalize' }}>{checkoutCard.priority_level}</span>
                                </div>
                                <div style={{ height: 1, background: 'var(--surface-border)', margin: '15px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>Valor Total:</span>
                                    <span style={{ color: '#acf800', fontWeight: 900, fontSize: '1.8rem' }}>{formatPrice(checkoutCard.price)}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <div style={{ background: 'rgba(172,248,0,0.05)', padding: 15, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                    <ShieldCheck size={20} color="#acf800" />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>Ativação garantida e segura via gateway Plug & Sales.</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Side */}
                        <div style={{ padding: 40, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: 20, fontWeight: 800 }}>Método de Pagamento</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
                                {[
                                    { id: 'pix', label: 'PIX (Aprovação Instantânea)', icon: <Zap size={18} /> },
                                    { id: 'credit_card', label: 'Cartão de Crédito', icon: <CreditCard size={18} /> },
                                    { id: 'debit_card', label: 'Cartão de Débito', icon: <Plus size={18} /> },
                                ].map(m => (
                                    <button 
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id as any)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px 20px',
                                            borderRadius: 16,
                                            border: `1px solid ${paymentMethod === m.id ? '#acf800' : 'var(--surface-border)'}`,
                                            background: paymentMethod === m.id ? 'rgba(172,248,0,0.05)' : 'transparent',
                                            color: paymentMethod === m.id ? '#acf800' : 'var(--text-secondary)',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {m.icon}
                                            {m.label}
                                        </div>
                                        {paymentMethod === m.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#acf800' }} />}
                                    </button>
                                ))}
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                <button 
                                    onClick={handleBuy}
                                    disabled={buyingId !== null}
                                    style={{
                                        width: '100%',
                                        background: '#acf800',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: 16,
                                        padding: '18px',
                                        fontWeight: 900,
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 10,
                                        marginBottom: 12
                                    }}
                                >
                                    {buyingId !== null ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Finalizar e Ativar Agora'}
                                    <ChevronRight size={20} />
                                </button>
                                <button onClick={() => setCheckoutCard(null)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', padding: 10 }}>Cancelar Transação</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
