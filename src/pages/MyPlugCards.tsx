import { useState, useEffect } from 'react';
import { CreditCard, Zap, Shield, Cpu, TrendingUp, ShoppingCart, RefreshCw, Loader, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserCard {
    id: number;
    plug_card_id: number;
    total_volume: number;
    used_volume: number;
    remaining_volume: number;
    active_campaigns: number;
    status: string;
    payment_method: string;
    payment_ref: string;
    purchased_price: string;
    created_at: string;
    card_name: string;
    tier: string;
    priority_level: string;
    speed: string;
    anti_ban_level: string;
    max_chips: number;
    max_campaigns: number;
    features: { resources?: string[] };
    copy: string;
    catalog_price: string;
}

const TIER_CONFIG: Record<string, { glow: string; border: string; badge: string; label: string; emoji: string; barColor: string }> = {
    foundation: { glow: 'rgba(148,163,184,0.2)', border: 'rgba(148,163,184,0.3)', badge: '#94a3b8', label: 'Foundation', emoji: '🧱', barColor: '#94a3b8' },
    growth:      { glow: 'rgba(59,130,246,0.2)',  border: 'rgba(59,130,246,0.4)',  badge: '#3b82f6', label: 'Growth',      emoji: '📈', barColor: '#3b82f6' },
    performance: { glow: 'rgba(172,248,0,0.2)',   border: 'rgba(172,248,0,0.4)',   badge: '#acf800', label: 'Performance', emoji: '⚡', barColor: '#acf800' },
    velocity:    { glow: 'rgba(6,182,212,0.2)',   border: 'rgba(6,182,212,0.4)',   badge: '#06b6d4', label: 'Velocity',    emoji: '🚀', barColor: '#06b6d4' },
    dominance:   { glow: 'rgba(139,92,246,0.2)',  border: 'rgba(139,92,246,0.4)',  badge: '#8b5cf6', label: 'Dominance',   emoji: '👑', barColor: '#8b5cf6' },
    elite:       { glow: 'rgba(234,179,8,0.25)',  border: 'rgba(234,179,8,0.5)',   badge: '#eab308', label: 'Elite',       emoji: '🌟', barColor: '#eab308' },
    sovereign:   { glow: 'rgba(249,115,22,0.25)', border: 'rgba(249,115,22,0.5)',  badge: '#f97316', label: 'Sovereign',   emoji: '🔱', barColor: '#f97316' },
    apex:        { glow: 'rgba(239,68,68,0.3)',   border: 'rgba(239,68,68,0.6)',   badge: '#ef4444', label: 'Apex',        emoji: '💎', barColor: '#ef4444' },
};

const formatVolume = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toString();
};

const formatPrice = (p: string | number) =>
    parseFloat(String(p)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PM_LABELS: Record<string, string> = {
    credit_card: '💳 Crédito',
    debit_card: '💳 Débito',
    pix: '⚡ PIX',
};

export default function MyPlugCards() {
    const { user } = useAuth();
    const [cards, setCards] = useState<UserCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    const fetchCards = () => {
        if (!user?.id) return;
        setLoading(true);
        fetch(`/api/plug-cards/wallet/${user.id}`)
            .then(r => r.json())
            .then(data => { setCards(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchCards(); }, [user?.id]);

    const totalVolume = cards.reduce((s, c) => s + c.total_volume, 0);
    const usedVolume = cards.reduce((s, c) => s + c.used_volume, 0);
    const totalSpent = cards.reduce((s, c) => s + parseFloat(c.purchased_price || '0'), 0);
    const activeCards = cards.filter(c => c.status === 'active').length;

    return (
        <div style={{ fontFamily: 'var(--font-family)', maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>

            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ background: 'linear-gradient(135deg,#acf800,#84c000)', padding: 10, borderRadius: 14, display: 'flex', boxShadow: '0 0 20px rgba(172,248,0,0.3)' }}>
                            <CreditCard color="#000" size={22} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.6rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                                Meus <span style={{ color: 'var(--primary-color)' }}>Plug Cards</span>
                            </h1>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sua wallet de capacidade de disparo</p>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={fetchCards} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.85rem' }}>
                        <RefreshCw size={14} /> Atualizar
                    </button>
                    <a href="/plug-cards" style={{ background: 'linear-gradient(135deg,#acf800,#84c000)', color: '#000', borderRadius: 10, padding: '10px 18px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                        <ShoppingCart size={14} /> Comprar Cards
                    </a>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Cards Ativos', value: activeCards, icon: <CreditCard size={16} />, color: '#acf800' },
                    { label: 'Volume Total', value: formatVolume(totalVolume), icon: <Zap size={16} />, color: '#06b6d4' },
                    { label: 'Vol. Utilizado', value: formatVolume(usedVolume), icon: <TrendingUp size={16} />, color: '#8b5cf6' },
                    { label: 'Total Investido', value: formatPrice(totalSpent), icon: <ShoppingCart size={16} />, color: '#eab308' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 16, padding: '20px', backdropFilter: 'blur(12px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: s.color }}>
                            {s.icon}
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</span>
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Cards list */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                    <Loader size={36} color="#acf800" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            ) : cards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 20, backdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🃏</div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Nenhum card adquirido</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>Acesse o Exchange para comprar seu primeiro Plug Card.</p>
                    <a href="/plug-cards" style={{ background: 'linear-gradient(135deg,#acf800,#84c000)', color: '#000', borderRadius: 12, padding: '14px 28px', fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <ShoppingCart size={16} /> Ver Exchange
                    </a>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {cards.map(card => {
                        const t = TIER_CONFIG[card.tier] || TIER_CONFIG.foundation;
                        const usedPct = card.total_volume > 0 ? Math.round((card.used_volume / card.total_volume) * 100) : 0;
                        const remainPct = 100 - usedPct;
                        const isHovered = hoveredId === card.id;

                        return (
                            <div
                                key={card.id}
                                onMouseEnter={() => setHoveredId(card.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    background: 'rgba(15,23,42,0.7)',
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${isHovered ? t.border : 'var(--surface-border)'}`,
                                    borderRadius: 18,
                                    padding: '24px 28px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isHovered ? `0 8px 40px ${t.glow}` : 'none',
                                    position: 'relative', overflow: 'hidden'
                                }}
                            >
                                {/* Glow bg */}
                                <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: t.glow, filter: 'blur(40px)', pointerEvents: 'none' }} />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                                    {/* Left info */}
                                    <div>
                                        {/* Title row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '1.4rem' }}>{t.emoji}</span>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.2px' }}>
                                                        {card.card_name.split(' | ')[0]}
                                                    </h3>
                                                    <span style={{ background: `${t.badge}20`, color: t.badge, border: `1px solid ${t.badge}30`, borderRadius: 30, padding: '2px 10px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                                                        {t.label}
                                                    </span>
                                                    <span style={{ background: card.status === 'active' ? 'rgba(172,248,0,0.1)' : 'rgba(100,116,139,0.1)', color: card.status === 'active' ? '#acf800' : '#64748b', border: `1px solid ${card.status === 'active' ? 'rgba(172,248,0,0.3)' : 'rgba(100,116,139,0.3)'}`, borderRadius: 30, padding: '2px 10px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                                                        {card.status === 'active' ? '● Ativo' : '● Concluído'}
                                                    </span>
                                                </div>
                                                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                    {card.copy || card.card_name.split(' | ')[1]} • Adquirido em {new Date(card.created_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Volume bar */}
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Volume Restante</span>
                                                <span style={{ color: t.badge, fontSize: '0.8rem', fontWeight: 800 }}>
                                                    {formatVolume(card.remaining_volume)} / {formatVolume(card.total_volume)} ({remainPct}%)
                                                </span>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 30, height: 8, overflow: 'hidden' }}>
                                                <div style={{ background: t.barColor, width: `${remainPct}%`, height: '100%', borderRadius: 30, transition: 'width 0.8s ease', boxShadow: `0 0 8px ${t.glow}` }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Utilizado: {formatVolume(card.used_volume)}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{usedPct}% usado</span>
                                            </div>
                                        </div>

                                        {/* Resources */}
                                        {card.features?.resources && (
                                            <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {card.features.resources.map((res, idx) => (
                                                    <span key={idx} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 6 }}>
                                                        <Check size={10} color="#acf800" /> {res}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Specs grid */}
                                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                            {[
                                                { label: 'Chips', value: card.max_chips === 99 ? '∞' : card.max_chips, icon: <Cpu size={12} /> },
                                                { label: 'Campanhas', value: card.max_campaigns === 99 ? '∞' : card.max_campaigns, icon: <Zap size={12} /> },
                                                { label: 'Prioridade', value: card.priority_level, icon: <TrendingUp size={12} /> },
                                                { label: 'Anti-Ban', value: card.anti_ban_level, icon: <Shield size={12} /> },
                                                { label: 'Pagamento', value: PM_LABELS[card.payment_method] || card.payment_method, icon: <CreditCard size={12} /> },
                                            ].map(s => (
                                                <div key={s.label}>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                                                        {s.icon} {s.label}
                                                    </div>
                                                    <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'capitalize' }}>{s.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right — price & tx */}
                                    <div style={{ textAlign: 'right', minWidth: 130 }}>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.5px', marginBottom: 4 }}>
                                            {formatPrice(card.purchased_price)}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'monospace', marginBottom: 8, wordBreak: 'break-all' }}>
                                            {card.payment_ref}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
