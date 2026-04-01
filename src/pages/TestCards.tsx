import { useState, useEffect, useRef } from 'react';
import { 
    CreditCard, Zap, Shield, Cpu, TrendingUp, Check, 
    Loader, ArrowRight, Sparkles, Building, Rocket, 
    Crown, Star, ShieldCheck, Gem, X, ShoppingCart,
    Trash2, ChevronRight, Package, Plus, Minus, AlertTriangle, Layers, Target, BarChart
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// High-End TIER UI Configuration
const TIER_UI: Record<string, any> = {
    foundation:  { color: '#94a3b8', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.2)', glow: 'rgba(148,163,184,0.15)', icon: Building,    label: 'Foundation' },
    growth:      { color: '#3b82f6', bg: 'rgba(59,130,246,0.05)',  border: 'rgba(59,130,246,0.2)',  glow: 'rgba(59,130,246,0.2)',  icon: TrendingUp,  label: 'Growth' },
    performance: { color: '#acf800', bg: 'rgba(172,248,0,0.05)',   border: 'rgba(172,248,0,0.2)',   glow: 'rgba(172,248,0,0.3)',   icon: Zap,         label: 'Performance' },
    velocity:    { color: '#06b6d4', bg: 'rgba(6,182,212,0.05)',   border: 'rgba(6,182,212,0.2)',   glow: 'rgba(6,182,212,0.2)',   icon: Rocket,      label: 'Velocity' },
    dominance:   { color: '#8b5cf6', bg: 'rgba(139,92,246,0.05)',  border: 'rgba(139,92,246,0.2)',  glow: 'rgba(139,92,246,0.2)',  icon: Crown,       label: 'Dominance' },
    elite:       { color: '#eab308', bg: 'rgba(234,179,8,0.05)',   border: 'rgba(234,179,8,0.2)',   glow: 'rgba(234,179,8,0.2)',   icon: Star,        label: 'Elite' },
    sovereign:   { color: '#f97316', bg: 'rgba(249,115,22,0.05)',  border: 'rgba(249,115,22,0.2)',  glow: 'rgba(249,115,22,0.2)',  icon: ShieldCheck, label: 'Sovereign' },
    apex:        { color: '#ef4444', bg: 'rgba(239,68,68,0.05)',   border: 'rgba(239,68,68,0.2)',   glow: 'rgba(239,68,68,0.3)',   icon: Gem,         label: 'Apex' },
};

const formatVolume = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toString();
};

const formatPrice = (p: string | number) =>
    parseFloat(String(p)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// --- Improved Interactive Card ---
function InteractiveCard({ card, onClick, onAddToCart }: { card: any, onClick: () => void, onAddToCart: (e: any) => void }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const ui = TIER_UI[card.tier?.toLowerCase()] || TIER_UI.foundation;
    const Icon = ui.icon;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !spotlightRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        spotlightRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, ${ui.color}25, transparent 80%)`;
    };

    const handleMouseLeave = () => {
        if (spotlightRef.current) spotlightRef.current.style.background = 'transparent';
    };

    const oldPrice = parseFloat(card.price) * 1.5;

    return (
        <div 
            ref={cardRef}
            className="premium-card-lift"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                background: '#0a0f1a', borderRadius: 44, padding: '44px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', border: `1px solid ${ui.border}`, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '740px'
            }}
        >
            <div ref={spotlightRef} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', transition: 'background 0.1s ease' }} />
            <div className="card-sweep" style={{ background: `linear-gradient(90deg, transparent, ${ui.color}15, transparent)` }} />

            <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                    <div style={{ background: ui.bg, border: `1px solid ${ui.border}`, padding: 14, borderRadius: 20, color: ui.color }}>
                        <Icon size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 950, color: ui.color, textTransform: 'uppercase', letterSpacing: 3 }}>Tier {ui.label}</div>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.7rem', fontWeight: 950, letterSpacing: '-0.8px' }}>{card.name.split(' | ')[0]}</h3>
                    </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: 35, lineHeight: 1.6, fontWeight: 500, opacity: 0.8 }}>
                    {card.copy || "Performance enterprise para operações que demandam estabilidade e alta escala."}
                </p>

                <div style={{ 
                    background: 'rgba(255,255,255,0.03)', borderRadius: 36, padding: '44px 20px', textAlign: 'center', marginBottom: 40, border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ color: ui.color, fontSize: '4.5rem', fontWeight: 950, letterSpacing: '-4px', lineHeight: 0.9, marginBottom: 8 }}>{formatVolume(card.total_volume)}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 28 }}>envios por card</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: '0.85rem', fontWeight: 900, color: 'rgba(255,255,255,0.5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Cpu size={18} color={ui.color} /> {card.max_chips === 999 ? '∞' : card.max_chips} Chips</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Layers size={18} color={ui.color} /> {card.max_campaigns === 999 ? '∞' : card.max_campaigns} Camps</div>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(card.features?.resources || [
                            'Smart Delivery (IA)',
                            'Tracking de Conversão VIP',
                            'Suporte Prioritário 24/7'
                        ]).slice(0, 3).map((feat: any, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'start', gap: 12, fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>
                                <div style={{ minWidth: 20, height: 20, borderRadius: '50%', background: `${ui.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={14} color={ui.color} strokeWidth={4} />
                                </div>
                                <span>{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 40 }}>
                    <div style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.15)', fontSize: '0.9rem', fontWeight: 900, marginBottom: 4 }}>{formatPrice(oldPrice)}</div>
                    <div style={{ color: '#fff', fontSize: '3rem', fontWeight: 950, letterSpacing: '-2px', lineHeight: 1, marginBottom: 28 }}>{formatPrice(card.price)}</div>

                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddToCart(card); }}
                        className="adquirir-btn"
                        style={{
                            width: '100%', background: ui.color, color: '#000', border: 'none', padding: '24px', borderRadius: 24, fontWeight: 950, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, cursor: 'pointer', transition: 'all 0.4s', boxShadow: `0 15px 40px ${ui.glow}`
                        }}
                    >
                        ADQUIRIR AGORA <ChevronRight size={28} strokeWidth={4} />
                    </button>
                </div>
            </div>

            <style>{`
                .premium-card-lift:hover { border-color: ${ui.color}cc !important; transform: translateY(-16px) !important; box-shadow: 0 40px 120px -20px ${ui.color}40, 0 30px 60px -30px rgba(0,0,0,1) !important; }
                .premium-card-lift:hover .card-sweep { left: 200%; }
                .premium-card-lift:hover .adquirir-btn { transform: scale(1.04); filter: brightness(1.1); }
                .card-sweep { position: absolute; top: 0; bottom: 0; left: -150%; width: 100%; z-index: 1; transform: skewX(-25deg); transition: left 1s cubic-bezier(0.19, 1, 0.22, 1); pointer-events: none; }
            `}</style>
        </div>
    );
}

// --- Main Marketplace View ---
export default function TestCards() {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [showCart, setShowCart] = useState(false);

    const fetchCards = async () => {
        setLoading(true);
        const { data } = await supabase.from('plug_cards').select('*').order('price', { ascending: true });
        setCards(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchCards(); }, []);

    const addToCart = (card: any) => {
        setCart(prev => {
            const exists = prev.find(item => item.id === card.id);
            if (exists) return prev.map(item => item.id === card.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { ...card, quantity: 1 }];
        });
        setShowCart(true);
    };

    const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
            <Loader size={48} color="#acf800" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
            
            <nav style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(35px)', padding: '24px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ background: '#acf800', width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(172,248,0,0.25)' }}>
                        <Rocket size={26} color="#000" strokeWidth={3} />
                    </div>
                    <span style={{ fontWeight: 950, fontSize: '1.5rem', letterSpacing: '-1.8px' }}>PLUG <span style={{ color: '#acf800' }}>CARDS</span></span>
                </div>
                
                <button 
                    onClick={() => setShowCart(!showCart)}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 32px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer', transition: 'all 0.3s', color: '#fff' }}
                >
                    <ShoppingCart size={24} color="#acf800" />
                    <span style={{ fontWeight: 900, fontSize: '1rem' }}>{cart.length} itens</span>
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
                    <span style={{ color: '#acf800', fontWeight: 950, fontSize: '1.1rem' }}>{formatPrice(cartTotal)}</span>
                </button>
            </nav>

            <header style={{ paddingTop: 220, paddingBottom: 110, textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -350, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '700px', background: 'radial-gradient(circle, rgba(172,248,0,0.05) 0%, transparent 75%)', filter: 'blur(130px)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '0 24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(172,248,0,0.08)', padding: '14px 36px', borderRadius: 100, border: '1px solid rgba(172,248,0,0.25)', marginBottom: 44 }}>
                        <Sparkles size={20} color="#acf800" />
                        <span style={{ color: '#acf800', fontWeight: 950, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 5 }}>Marketplace de Infraestrutura</span>
                    </div>
                    <h1 style={{ fontSize: '6.5rem', fontWeight: 950, letterSpacing: '-7px', lineHeight: 0.8, margin: '0 0 40px' }}>Potencialize seu <span style={{ color: '#acf800' }}>Ecossistema</span></h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.6rem', maxWidth: 950, margin: '0 auto', lineHeight: 1.6, fontWeight: 500, opacity: 0.9 }}>Alta Escala com Proteção Blindada. Escolha seu Tier, <br /> Ative o Disparo e Domine o Mercado.</p>
                </div>
            </header>

            <main style={{ maxWidth: 1450, margin: '0 auto', padding: '0 44px 200px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 40 }}>
                {cards.map(card => (
                    <InteractiveCard key={card.id} card={card} onClick={() => setSelectedCard(card)} onAddToCart={addToCart} />
                ))}
            </main>

            {/* Shopping Cart Sidebar */}
            {showCart && (
                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '560px', background: '#0a0f1a', borderLeft: '1px solid rgba(255,255,255,0.06)', zIndex: 200, padding: 50, boxShadow: '-50px 0 150px rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 55 }}>
                        <h2 style={{ fontSize: '2.6rem', fontWeight: 950, letterSpacing: '-2px' }}>Check-out</h2>
                        <button onClick={() => setShowCart(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', padding: 16, borderRadius: 20, cursor: 'pointer' }}><X size={36} /></button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 28, paddingRight: 10 }}>
                        {cart.length === 0 ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, opacity: 0.15 }}>
                                <Package size={110} color="#64748b" />
                                <p style={{ fontWeight: 800, fontSize: '1.6rem' }}>Carrinho vazio.</p>
                            </div>
                        ) : cart.map((item, idx) => {
                            const ui = TIER_UI[item.tier?.toLowerCase()] || TIER_UI.foundation;
                            return (
                                <div key={idx} style={{ display: 'flex', gap: 28, background: 'rgba(255,255,255,0.02)', padding: 32, borderRadius: 40, border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ width: 95, height: 95, borderRadius: 24, background: ui.bg, border: `1px solid ${ui.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ui.color }}>
                                        {(() => { const Icon = ui.icon; return <Icon size={38} /> })()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontWeight: 950, fontSize: '1.3rem' }}>{item.name.split(' | ')[0]}</span>
                                            <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={22} /></button>
                                        </div>
                                        <div style={{ fontSize: '0.95rem', color: ui.color, fontWeight: 950, marginBottom: 20 }}>{formatVolume(item.total_volume)} Envios</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#fff', fontWeight: 950, fontSize: '1.5rem' }}>{formatPrice(item.price)}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(0,0,0,0.5)', padding: '12px 24px', borderRadius: 16 }}>
                                                <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Minus size={18} /></button>
                                                <span style={{ fontWeight: 950 }}>{item.quantity}</span>
                                                <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Plus size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: 45, background: 'rgba(172,248,0,0.07)', borderRadius: 50, padding: 50, border: '1px solid rgba(172,248,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                            <div>
                                <span style={{ fontWeight: 800, color: '#475569', fontSize: '1.2rem', display: 'block', marginBottom: 8 }}>Total Consolidado:</span>
                                <span style={{ fontSize: '3.8rem', fontWeight: 950, color: '#fff', letterSpacing: '-3.5px', lineHeight: 1 }}>{formatPrice(cartTotal)}</span>
                            </div>
                        </div>
                        <button disabled={cart.length === 0} style={{ width: '100%', background: '#acf800', color: '#000', border: 'none', padding: '28px', borderRadius: 28, fontWeight: 950, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, transition: 'all 0.4s', opacity: cart.length === 0 ? 0.3 : 1 }}>Ativar Agora <ChevronRight size={40} strokeWidth={5} /></button>
                    </div>
                </div>
            )}

            {/* HIGH-END MODAL RE-DESIGNED */}
            {selectedCard && (
                <div 
                    className="modal-overlay"
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', backdropFilter: 'blur(50px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setSelectedCard(null)}
                >
                    <div 
                        className="modal-container-glow"
                        style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 60, maxWidth: 1150, width: '100%', overflow: 'hidden', position: 'relative', boxShadow: '0 80px 200px rgba(0,0,0,1)', animation: 'modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedCard(null)} 
                            style={{ position: 'absolute', top: 44, right: 44, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', padding: 18, borderRadius: '50%', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s' }}
                        >
                            <X size={34} />
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr' }}>
                            {/* Column 1: Metrics & Visuals */}
                            <div style={{ padding: '80px', background: 'rgba(255,255,255,0.015)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
                                    <div style={{ background: TIER_UI[selectedCard.tier?.toLowerCase()]?.bg, color: TIER_UI[selectedCard.tier?.toLowerCase()]?.color, padding: 24, borderRadius: 32, border: `1px solid ${TIER_UI[selectedCard.tier?.toLowerCase()]?.border}`, boxShadow: `0 0 40px ${TIER_UI[selectedCard.tier?.toLowerCase()]?.glow}` }}>
                                        {(() => { const UIcon = TIER_UI[selectedCard.tier?.toLowerCase()]?.icon || Building; return <UIcon size={56} strokeWidth={2.5} /> })()}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 950, color: TIER_UI[selectedCard.tier?.toLowerCase()]?.color, textTransform: 'uppercase', letterSpacing: 6 }}>{selectedCard.tier} GRADE</div>
                                        <h2 style={{ fontSize: '4.8rem', fontWeight: 950, letterSpacing: '-5px', color: '#fff', margin: 0, lineHeight: 0.9 }}>{selectedCard.name.split(' | ')[0]}</h2>
                                    </div>
                                </div>

                                <p style={{ color: '#94a3b8', fontSize: '1.25rem', marginBottom: 50, lineHeight: 1.6, fontWeight: 500 }}>{selectedCard.copy || "Solução estratégica de alta disponibilidade para escala agressiva de leads ativos."}</p>

                                {/* Metric Pods */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    {[
                                        { label: 'Volume Unitário', value: formatVolume(selectedCard.total_volume), icon: BarChart, color: TIER_UI[selectedCard.tier?.toLowerCase()]?.color },
                                        { label: 'Escalabilidade', value: selectedCard.max_chips + ' Chips', icon: Cpu, color: '#fff' },
                                        { label: 'Prioridade Rede', value: 'High-Level', icon: Target, color: '#fff' },
                                        { label: 'Blindagem', value: selectedCard.anti_ban_level, icon: ShieldCheck, color: '#fff' },
                                    ].map((s, i) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: 32, border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s' }}>
                                            <s.icon size={28} color={s.color} style={{ marginBottom: 18 }} />
                                            <div style={{ fontSize: '0.75rem', fontWeight: 950, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2 }}>{s.label}</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#fff' }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Column 2: Authority & Conversion */}
                            <div style={{ padding: '80px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44, background: 'rgba(172,248,0,0.05)', padding: '14px 28px', borderRadius: 100, width: 'fit-content', border: '1px solid rgba(172,248,0,0.15)' }}>
                                    <Sparkles size={20} color="#acf800" />
                                    <span style={{ fontWeight: 950, color: '#acf800', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 3 }}>Diferencial Competitivo</span>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.015)', borderRadius: 44, padding: '44px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 50, position: 'relative' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1.2fr) 1fr', gap: 35 }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 950, color: '#acf800', textTransform: 'uppercase', marginBottom: 28, letterSpacing: 3 }}>PLUG & SALES</div>
                                            {[ 'Escala sem Limites', 'Proteção Enterprise', 'Entrega Prioritária' ].map((t, i) => (
                                                <div key={i} style={{ display: 'flex', gap: 14, color: '#fff', fontSize: '1.1rem', fontWeight: 900, marginBottom: 20 }}>
                                                    <Check size={22} color="#acf800" strokeWidth={5} /> {t}
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 950, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 28, letterSpacing: 3 }}>MERCADO</div>
                                            {[ 'Delay Massivo', 'Bans Constantes', 'Suporte Lento' ].map((t, i) => (
                                                <div key={i} style={{ display: 'flex', gap: 14, color: 'rgba(255,255,255,0.2)', fontSize: '1.05rem', fontWeight: 700, marginBottom: 20 }}>
                                                    <X size={22} color="rgba(255,255,255,0.1)" strokeWidth={4} /> {t}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: -20, right: 40, width: 60, height: 60, background: '#acf800', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(15deg)', boxShadow: '0 10px 30px rgba(172,248,0,0.3)' }}>
                                        <TrendingUp size={28} color="#000" strokeWidth={3} />
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 35 }}>
                                        <div>
                                            <span style={{ color: '#64748b', fontWeight: 800, fontSize: '1.1rem', display: 'block', marginBottom: 6 }}>Pay-per-scale (Vitalício):</span>
                                            <div style={{ color: '#fff', fontSize: '4.5rem', fontWeight: 950, letterSpacing: '-4px', lineHeight: 1 }}>{formatPrice(selectedCard.price)}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { addToCart(selectedCard); setSelectedCard(null); }}
                                        className="modal-buy-glow"
                                        style={{ width: '100%', background: '#acf800', color: '#000', border: 'none', padding: '30px', borderRadius: 32, fontWeight: 950, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, transition: 'all 0.3s' }}
                                    >
                                        ADICIONAR AO CARRINHO <Plus size={36} strokeWidth={6} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&display=swap');
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes modalIn { from { opacity: 0; transform: scale(0.9) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                body { overflow-x: hidden; background: #020617; }
                ::-webkit-scrollbar { width: 12px; }
                ::-webkit-scrollbar-track { background: #020617; }
                ::-webkit-scrollbar-thumb { background: #1a202c; borderRadius: 6px; border: 3px solid #020617; }
                
                .modal-buy-glow:hover { transform: scale(1.02); filter: brightness(1.1); box-shadow: 0 20px 60px rgba(172,248,0,0.4); }
                .modal-container-glow { box-shadow: 0 0 100px -30px ${selectedCard ? TIER_UI[selectedCard.tier?.toLowerCase()]?.color : ''}33 !important; }
            `}</style>
        </div>
    );
}
