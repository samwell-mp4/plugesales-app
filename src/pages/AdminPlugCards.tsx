import { useState, useEffect } from 'react';
import { CreditCard, Users, TrendingUp, DollarSign, ToggleLeft, ToggleRight, RefreshCw, Loader, ShoppingCart } from 'lucide-react';

interface AdminCard {
    id: number;
    user_name: string;
    user_email: string;
    user_role: string;
    card_name: string;
    tier: string;
    total_volume: number;
    used_volume: number;
    remaining_volume: number;
    status: string;
    payment_method: string;
    payment_ref: string;
    purchased_price: string;
    catalog_price: string;
    created_at: string;
}

interface CatalogCard {
    id: number;
    name: string;
    tier: string;
    total_volume: number;
    price: string;
    is_active: boolean;
    max_chips: number;
    max_campaigns: number;
}

interface Stats {
    total_cards: string;
    active_cards: string;
    total_revenue: string;
    total_volume_sold: string;
    total_volume_used: string;
}

const TIER_CONFIG: Record<string, { badge: string; label: string; emoji: string }> = {
    foundation: { badge: '#94a3b8', label: 'Foundation', emoji: '🧱' },
    growth:      { badge: '#3b82f6', label: 'Growth',      emoji: '📈' },
    performance: { badge: '#acf800', label: 'Performance', emoji: '⚡' },
    velocity:    { badge: '#06b6d4', label: 'Velocity',    emoji: '🚀' },
    dominance:   { badge: '#8b5cf6', label: 'Dominance',   emoji: '👑' },
    elite:       { badge: '#eab308', label: 'Elite',       emoji: '🌟' },
    sovereign:   { badge: '#f97316', label: 'Sovereign',   emoji: '🔱' },
    apex:        { badge: '#ef4444', label: 'Apex',        emoji: '💎' },
};

const formatVolume = (v: number | string) => {
    const n = Number(v);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
};

const formatPrice = (p: string | number) =>
    parseFloat(String(p) || '0').toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PM_LABELS: Record<string, string> = { credit_card: '💳 Crédito', debit_card: '💳 Débito', pix: '⚡ PIX' };

export default function AdminPlugCards() {
    const [tab, setTab] = useState<'overview' | 'catalog'>('overview');
    const [cards, setCards] = useState<AdminCard[]>([]);
    const [catalog, setCatalog] = useState<CatalogCard[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<number | null>(null);

    const fetchOverview = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/plug-cards/admin');
            const data = await res.json();
            setCards(data.cards || []);
            setStats(data.stats || null);
        } finally { setLoading(false); }
    };

    const fetchCatalog = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/plug-cards');
            const data = await res.json();
            setCatalog(Array.isArray(data) ? data : []);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchOverview(); fetchCatalog(); }, []);

    const toggleCard = async (id: number) => {
        setToggling(id);
        try {
            await fetch(`/api/plug-cards/admin/toggle/${id}`, { method: 'PATCH' });
            fetchCatalog();
        } finally { setToggling(null); }
    };

    return (
        <div style={{ fontFamily: 'var(--font-family)', maxWidth: 1200, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'linear-gradient(135deg,#acf800,#84c000)', padding: 10, borderRadius: 14, display: 'flex' }}>
                        <CreditCard color="#000" size={22} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                            Gerenciar <span style={{ color: 'var(--primary-color)' }}>Plug Cards</span>
                        </h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem' }}>Painel administrativo • Vendas e catálogo</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { fetchOverview(); fetchCatalog(); }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.82rem' }}>
                        <RefreshCw size={13} /> Atualizar
                    </button>
                    <a href="/plug-cards" target="_blank" style={{ background: 'rgba(172,248,0,0.08)', border: '1px solid rgba(172,248,0,0.2)', color: '#acf800', borderRadius: 10, padding: '9px 14px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                        <ShoppingCart size={13} /> Ver Exchange
                    </a>
                </div>
            </div>

            {/* Stats row */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
                    {[
                        { label: 'Cards Vendidos', value: stats.total_cards || '0', icon: <CreditCard size={15} />, color: '#acf800' },
                        { label: 'Cards Ativos', value: stats.active_cards || '0', icon: <Users size={15} />, color: '#06b6d4' },
                        { label: 'Receita Total', value: formatPrice(stats.total_revenue || 0), icon: <DollarSign size={15} />, color: '#eab308' },
                        { label: 'Vol. Vendido', value: formatVolume(stats.total_volume_sold || 0), icon: <TrendingUp size={15} />, color: '#8b5cf6' },
                        { label: 'Vol. Utilizado', value: formatVolume(stats.total_volume_used || 0), icon: <TrendingUp size={15} />, color: '#f97316' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 14, padding: '18px 16px', backdropFilter: 'blur(12px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.color, marginBottom: 8 }}>
                                {s.icon}
                                <span style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</span>
                            </div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 12, padding: 4, width: 'fit-content', marginBottom: 24 }}>
                {[
                    { key: 'overview', label: '📊 Vendas' },
                    { key: 'catalog', label: '🗂️ Catálogo' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key as any)}
                        style={{ background: tab === t.key ? 'rgba(172,248,0,0.1)' : 'transparent', color: tab === t.key ? '#acf800' : '#64748b', border: `1px solid ${tab === t.key ? 'rgba(172,248,0,0.3)' : 'transparent'}`, borderRadius: 9, padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s' }}
                    >{t.label}</button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <Loader size={32} color="#acf800" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            ) : tab === 'overview' ? (
                /* Vendas Table */
                cards.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 18 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🃏</div>
                        <h3 style={{ color: 'var(--text-primary)' }}>Nenhuma venda ainda</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Compartilhe o link do Exchange para começar a vender.</p>
                    </div>
                ) : (
                    <div style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 18, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                        {['Usuário', 'Card', 'Tier', 'Volume', 'Status', 'Pagamento', 'Valor', 'Data'].map(h => (
                                            <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {cards.map((c, i) => {
                                        const t = TIER_CONFIG[c.tier] || TIER_CONFIG.foundation;
                                        const pct = c.total_volume > 0 ? Math.round((c.remaining_volume / c.total_volume) * 100) : 0;
                                        return (
                                            <tr key={c.id} style={{ borderBottom: i < cards.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{c.user_name}</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{c.user_email}</div>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.82rem' }}>{c.card_name.split(' | ')[0]}</div>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ background: `${t.badge}20`, color: t.badge, border: `1px solid ${t.badge}30`, borderRadius: 30, padding: '3px 10px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                                        {t.emoji} {t.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px', minWidth: 140 }}>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: 4 }}>{formatVolume(c.remaining_volume)} / {formatVolume(c.total_volume)}</div>
                                                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 30, height: 5, overflow: 'hidden' }}>
                                                        <div style={{ background: t.badge, width: `${pct}%`, height: '100%', borderRadius: 30 }} />
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ background: c.status === 'active' ? 'rgba(172,248,0,0.08)' : 'rgba(100,116,139,0.08)', color: c.status === 'active' ? '#acf800' : '#64748b', border: `1px solid ${c.status === 'active' ? 'rgba(172,248,0,0.2)' : 'rgba(100,116,139,0.2)'}`, borderRadius: 20, padding: '2px 10px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                                        {c.status === 'active' ? '● Ativo' : '● Concluído'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{PM_LABELS[c.payment_method] || c.payment_method}</td>
                                                <td style={{ padding: '12px 16px', color: '#acf800', fontWeight: 800, fontSize: '0.9rem' }}>{formatPrice(c.purchased_price)}</td>
                                                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                /* Catálogo */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 14 }}>
                    {catalog.map(c => {
                        const t = TIER_CONFIG[c.tier] || TIER_CONFIG.foundation;
                        const isToggling = toggling === c.id;
                        return (
                            <div key={c.id} style={{ background: c.is_active ? 'rgba(15,23,42,0.8)' : 'rgba(15,23,42,0.4)', border: `1px solid ${c.is_active ? t.badge + '30' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: '20px', opacity: c.is_active ? 1 : 0.6, transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                            <span>{t.emoji}</span>
                                            <span style={{ background: `${t.badge}20`, color: t.badge, border: `1px solid ${t.badge}30`, borderRadius: 20, padding: '2px 8px', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8 }}>{t.label}</span>
                                        </div>
                                        <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 900, fontSize: '0.95rem' }}>{c.name.split(' | ')[0]}</h4>
                                        <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.name.split(' | ')[1]}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleCard(c.id)}
                                        disabled={isToggling}
                                        style={{ background: 'transparent', border: 'none', cursor: isToggling ? 'not-allowed' : 'pointer', color: c.is_active ? '#acf800' : '#64748b', padding: 4, borderRadius: 6 }}
                                        title={c.is_active ? 'Desativar card' : 'Ativar card'}
                                    >
                                        {isToggling ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : c.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ color: t.badge, fontWeight: 900, fontSize: '1.2rem' }}>{formatVolume(c.total_volume)}</div>
                                    <div style={{ color: '#acf800', fontWeight: 900, fontSize: '1rem' }}>{formatPrice(c.price)}</div>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 8 }}>
                                    {c.max_chips === 99 ? '∞' : c.max_chips} chips • {c.max_campaigns === 99 ? '∞' : c.max_campaigns} campanhas
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
