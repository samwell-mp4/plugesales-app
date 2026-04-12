import { useState, useEffect } from 'react';
import { CreditCard, Zap, Shield, Cpu, TrendingUp, ShoppingCart, RefreshCw, Loader, Check, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

    const fetchCards = async () => {
        if (!user?.id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('user_plug_cards')
            .select(`
                *,
                plug_cards (
                    name,
                    tier,
                    priority_level,
                    speed,
                    anti_ban_level,
                    max_chips,
                    max_campaigns,
                    features,
                    price
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const flat = data.map((row: any) => ({
                ...row,
                card_name: row.plug_cards?.name ?? '',
                tier: row.plug_cards?.tier ?? '',
                priority_level: row.plug_cards?.priority_level ?? '',
                speed: row.plug_cards?.speed ?? '',
                anti_ban_level: row.plug_cards?.anti_ban_level ?? '',
                max_chips: row.plug_cards?.max_chips ?? 0,
                max_campaigns: row.plug_cards?.max_campaigns ?? 0,
                features: row.plug_cards?.features ?? {},
                catalog_price: row.plug_cards?.price ?? 0,
            }));
            setCards(flat);
        }
        setLoading(false);
    };

    useEffect(() => { fetchCards(); }, [user?.id]);

    const totalVolume = cards.reduce((s, c) => s + c.total_volume, 0);
    const usedVolume = cards.reduce((s, c) => s + c.used_volume, 0);
    const totalSpent = cards.reduce((s, c) => s + parseFloat(c.purchased_price || '0'), 0);
    const activeCards = cards.filter(c => c.status === 'active').length;

    return (
        <div className="crm-container">
            {/* Header section */}
            <div className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <CreditCard size={12} /> INVENTORY SYSTEM
                    </div>
                    <h1 className="crm-main-title">Meus Plug Cards</h1>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={fetchCards} className="action-btn ghost-btn" style={{ height: '48px' }}>
                        <RefreshCw size={18} /> ATUALIZAR
                    </button>
                    <a href="/plug-cards" className="action-btn primary-btn" style={{ height: '48px', textDecoration: 'none' }}>
                        <ShoppingCart size={18} /> COMPRAR CARDS
                    </a>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="metrics-grid-row" style={{ marginBottom: '48px' }}>
                {[
                    { label: 'Cards Ativos', value: activeCards, icon: <CreditCard size={18} />, color: '#acf800' },
                    { label: 'Volume Total', value: formatVolume(totalVolume), icon: <Zap size={18} />, color: '#06b6d4' },
                    { label: 'Vol. Utilizado', value: formatVolume(usedVolume), icon: <TrendingUp size={18} />, color: '#8b5cf6' },
                    { label: 'Total Investido', value: formatPrice(totalSpent), icon: <ShoppingCart size={18} />, color: '#eab308' },
                ].map((s, i) => (
                    <div key={i} className="crm-card" style={{ padding: '24px', borderLeft: `4px solid ${s.color}` }}>
                        <div className="field-label" style={{ color: s.color, marginBottom: '12px' }}>
                            {s.icon} {s.label}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 950, letterSpacing: '-1px' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Cards List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <Loader size={48} className="animate-spin text-primary" />
                </div>
            ) : cards.length === 0 ? (
                <div className="crm-card" style={{ textAlign: 'center', padding: '100px 40px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.1 }}>🃏</div>
                    <h3 style={{ opacity: 0.3, fontWeight: 950, fontSize: '1.5rem', marginBottom: '8px' }}>Sua carteira está vazia</h3>
                    <p style={{ opacity: 0.2, fontSize: '14px', fontWeight: 700, marginBottom: '32px' }}>Acesse o Exchange para expandir sua capacidade.</p>
                    <a href="/plug-cards" className="action-btn primary-btn" style={{ height: '54px', textDecoration: 'none', display: 'inline-flex', alignSelf: 'center' }}>
                        <ShoppingCart size={18} /> VER EXCHANGE
                    </a>
                </div>
            ) : (
                <div className="flex-col gap-5">
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
                                className="crm-card"
                                style={{
                                    border: `1px solid ${isHovered ? t.border : 'rgba(255,255,255,0.05)'}`,
                                    padding: '32px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: isHovered ? `0 20px 40px ${t.glow}` : '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                                }}
                            >
                                <div style={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, background: t.glow, filter: 'blur(50px)', opacity: 0.5, pointerEvents: 'none' }} />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
                                    {/* Left Content */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '2rem' }}>{t.emoji}</span>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.5px' }}>
                                                        {card.card_name.split(' | ')[0]}
                                                    </h3>
                                                    <span className="status-badge-premium" style={{ '--bg': `${t.badge}20`, '--color': t.badge, '--border': `${t.badge}30` } as any}>
                                                        {t.label}
                                                    </span>
                                                    <span className="status-badge-premium" style={{ 
                                                        '--bg': card.status === 'active' ? 'rgba(172,248,0,0.1)' : 'rgba(255,255,255,0.05)',
                                                        '--color': card.status === 'active' ? '#acf800' : 'var(--text-muted)',
                                                        '--border': card.status === 'active' ? 'rgba(172,248,0,0.3)' : 'rgba(255,255,255,0.1)'
                                                    } as any}>
                                                        {card.status === 'active' ? '● Ativo' : '● Concluido'}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
                                                    {card.copy || card.card_name.split(' | ')[1]} • Desde {new Date(card.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Section */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="field-label" style={{ margin: 0 }}>Capacidade Disponível</span>
                                                <span style={{ color: t.badge, fontWeight: 950, fontSize: '1rem' }}>
                                                    {formatVolume(card.remaining_volume)} / {formatVolume(card.total_volume)} ({remainPct}%)
                                                </span>
                                            </div>
                                            <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                                                <div style={{ width: `${remainPct}%`, height: '100%', background: t.barColor, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 15px ${t.glow}` }} />
                                            </div>
                                            <div className="flex justify-between mt-3">
                                                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Utilizado: {formatVolume(card.used_volume)}</span>
                                                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>Taxa de Uso: {usedPct}%</span>
                                            </div>
                                        </div>

                                        {/* Specs Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '20px' }}>
                                            {[
                                                { label: 'Chips', value: card.max_chips === 99 ? '∞' : card.max_chips, icon: <Cpu size={14} /> },
                                                { label: 'Campanhas', value: card.max_campaigns === 99 ? '∞' : card.max_campaigns, icon: <Zap size={14} /> },
                                                { label: 'Speed', value: card.speed, icon: <TrendingUp size={14} /> },
                                                { label: 'Segurança', value: card.anti_ban_level, icon: <Shield size={14} /> },
                                            ].map((s, i) => (
                                                <div key={i}>
                                                    <div className="field-label" style={{ fontSize: '9px', marginBottom: '4px' }}>
                                                        {s.icon} {s.label}
                                                    </div>
                                                    <div style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>{s.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Section / Billing */}
                                    <div style={{ borderLeft: '1px solid var(--surface-border-subtle)', paddingLeft: '32px', minWidth: '200px' }}>
                                        <div style={{ marginBottom: '24px' }}>
                                            <div className="field-label">Investimento Total</div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>{formatPrice(card.purchased_price)}</div>
                                        </div>
                                        <div style={{ marginBottom: '24px' }}>
                                            <div className="field-label">Método de Pagamento</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#acf800' }}>{PM_LABELS[card.payment_method] || card.payment_method}</div>
                                        </div>
                                        <div>
                                            <div className="field-label">Referência / TXID</div>
                                            <div style={{ fontSize: '10px', fontWeight: 700, opacity: 0.3, fontFamily: 'monospace', wordBreak: 'break-all' }}>{card.payment_ref}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
