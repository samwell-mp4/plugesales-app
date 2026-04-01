import { useState, useEffect, useRef } from 'react';
import { 
    CreditCard, Zap, Shield, Cpu, TrendingUp, Check, 
    Loader, ArrowRight, Sparkles, Building, Rocket, 
    Crown, Star, ShieldCheck, Gem, X, ShoppingCart,
    Trash2, ChevronRight, Package, Plus, Minus, AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// High-End TIER UI Configuration
const TIER_UI: Record<string, any> = {
    foundation:  { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', glow: 'rgba(148,163,184,0.2)', icon: Building,    label: 'Foundation',  img: '/assets/cards/foundation.png' },
    growth:      { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  glow: 'rgba(59,130,246,0.2)',  icon: TrendingUp,  label: 'Growth',      img: '/assets/cards/growth.png' },
    performance: { color: '#acf800', bg: 'rgba(172,248,0,0.1)',   border: 'rgba(172,248,0,0.3)',   glow: 'rgba(172,248,0,0.2)',   icon: Zap,         label: 'Performance', img: '/assets/cards/performance.png' },
    velocity:    { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.3)',   glow: 'rgba(6,182,212,0.2)',   icon: Rocket,      label: 'Velocity',    img: '/assets/cards/velocity.png' },
    dominance:   { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.3)',  glow: 'rgba(139,92,246,0.2)',  icon: Crown,       label: 'Dominance',   img: '/assets/cards/dominance.png' },
    elite:       { color: '#eab308', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)',   glow: 'rgba(234,179,8,0.2)',   icon: Star,        label: 'Elite',       img: '/assets/cards/elite.png' },
    sovereign:   { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  glow: 'rgba(249,115,22,0.2)',  icon: ShieldCheck, label: 'Sovereign',   img: '/assets/cards/sovereign.png' },
    apex:        { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   glow: 'rgba(239,68,68,0.2)',   icon: Gem,         label: 'Apex',        img: '/assets/cards/apex.png' },
};

const formatVolume = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toString();
};

const formatPrice = (p: string | number) =>
    parseFloat(String(p)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// --- Interactive Card Component with 3D Tilt ---
function InteractiveCard({ card, onClick, onAddToCart }: { card: any, onClick: () => void, onAddToCart: (e: any) => void }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const ui = TIER_UI[card.tier?.toLowerCase()] || TIER_UI.foundation;
    const Icon = ui.icon;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 8;
        const rotateY = (centerX - x) / 8;

        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    return (
        <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                height: '520px',
                background: `#0f172a url(${ui.img}) center/cover no-repeat`,
                borderRadius: 32,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.15s ease-out, box-shadow 0.3s ease',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                border: `1px solid ${ui.border}`,
            }}
        >
            {/* Glass Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(15,23,42,0.1), rgba(15,23,42,0.98))',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                zIndex: 2
            }} />

            {/* Content Layer */}
            <div style={{ position: 'relative', zIndex: 3, padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                    <div style={{ background: ui.bg, backdropFilter: 'blur(10px)', padding: 12, borderRadius: 16, color: ui.color, border: `1px solid ${ui.border}` }}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: ui.color, textTransform: 'uppercase', letterSpacing: 2 }}>Tier {ui.label}</div>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{card.name.split(' | ')[0]}</h3>
                    </div>
                </div>

                <div style={{ color: '#fff', fontSize: '3rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: 5 }}>
                    {formatVolume(card.total_volume)}
                    <span style={{ fontSize: '1.2rem', color: '#acf800', marginLeft: 10, fontWeight: 700 }}>Envios</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px 20px', borderRadius: 20, marginBottom: 30, display: 'flex', gap: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 800 }}>
                        <Cpu size={14} color={ui.color} /> {card.max_chips === 999 ? '∞' : card.max_chips} Chips
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 800 }}>
                        <ShieldCheck size={14} color={ui.color} /> {card.anti_ban_level}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase' }}>Valor único</div>
                        <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.8rem' }}>{formatPrice(card.price)}</div>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddToCart(card); }}
                        style={{
                            background: ui.color,
                            color: '#000',
                            border: 'none',
                            width: '56px',
                            height: '56px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: `0 10px 25px ${ui.glow}`
                        }}
                    >
                        <Plus size={28} strokeWidth={3} />
                    </button>
                </div>
            </div>
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

    useEffect(() => {
        fetchCards();
    }, []);

    const addToCart = (card: any) => {
        setCart(prev => {
            const exists = prev.find(item => item.id === card.id);
            if (exists) {
                return prev.map(item => item.id === card.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
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
            
            {/* Cinematic Navbar */}
            <nav style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(20px)',
                padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: '#acf800', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Rocket size={20} color="#000" />
                    </div>
                    <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-1px' }}>PLUG <span style={{ color: '#acf800' }}>CARDS</span></span>
                </div>
                
                <button 
                    onClick={() => setShowCart(!showCart)}
                    style={{ 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '10px 24px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14,
                        cursor: 'pointer', transition: 'all 0.2s', color: '#fff'
                    }}
                >
                    <ShoppingCart size={20} color="#acf800" />
                    <span style={{ fontWeight: 800 }}>{cart.length} itens</span>
                    <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ color: '#acf800', fontWeight: 900 }}>{formatPrice(cartTotal)}</span>
                </button>
            </nav>

            {/* Hero Section */}
            <header style={{ paddingTop: 160, paddingBottom: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '400px', background: 'radial-gradient(circle, rgba(172,248,0,0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(172,248,0,0.08)', padding: '8px 24px', borderRadius: 100, border: '1px solid rgba(172,248,0,0.2)', marginBottom: 24 }}>
                        <Sparkles size={16} color="#acf800" />
                        <span style={{ color: '#acf800', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 2 }}>Ecossistema de Alta Escala</span>
                    </div>
                    <h1 style={{ fontSize: '5rem', fontWeight: 900, letterSpacing: '-4px', lineHeight: 0.85, margin: '0 0 24px' }}>
                        Inúmeras <span style={{ color: '#acf800' }}>Possibilidades</span><br />
                        Um Único Card.
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.4rem', maxWidth: 800, margin: '0 auto', lineHeight: 1.6 }}>
                        Escolha a infraestrutura ideal para sua operação. <br />
                        Sem assinaturas, sem mensalidades. Pague pelo volume e use como quiser.
                    </p>
                </div>
            </header>

            {/* Marketplace Grid */}
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 120px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 40 }}>
                {cards.map(card => (
                    <InteractiveCard 
                        key={card.id} 
                        card={card} 
                        onClick={() => setSelectedCard(card)}
                        onAddToCart={addToCart}
                    />
                ))}
            </main>

            {/* Shopping Cart Sidebar */}
            {showCart && (
                <div style={{ 
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px',
                    background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.05)',
                    zIndex: 200, padding: 40, boxShadow: '-30px 0 80px rgba(0,0,0,0.6)',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1.5px' }}>Checkout <span style={{ color: '#acf800' }}>Express</span></h2>
                        <button onClick={() => setShowCart(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: 12, borderRadius: 16, cursor: 'pointer' }}>
                            <X size={28} />
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {cart.length === 0 ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: 0.3 }}>
                                <Package size={80} color="#64748b" />
                                <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>O carrinho está aguardando você...</p>
                            </div>
                        ) : cart.map((item, idx) => {
                            const ui = TIER_UI[item.tier?.toLowerCase()] || TIER_UI.foundation;
                            return (
                                <div key={idx} style={{ display: 'flex', gap: 20, background: 'rgba(255,255,255,0.02)', padding: 25, borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ width: 90, height: 90, borderRadius: 20, background: `url(${ui.img}) center/cover` }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{item.name.split(' | ')[0]}</span>
                                            <button 
                                                onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#acf800', fontWeight: 800, marginBottom: 15 }}>{formatVolume(item.total_volume)} Envios</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>{formatPrice(item.price)}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 15, background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: 12 }}>
                                                <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Minus size={14} /></button>
                                                <span style={{ fontWeight: 900 }}>{item.quantity}</span>
                                                <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 40, background: 'rgba(172,248,0,0.03)', borderRadius: 32, padding: 32, border: '1px solid rgba(172,248,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <span style={{ fontWeight: 800, color: '#64748b', fontSize: '0.9rem', display: 'block' }}>Total de Investimento:</span>
                                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{formatPrice(cartTotal)}</span>
                            </div>
                        </div>
                        <button disabled={cart.length === 0} style={{ 
                            width: '100%', background: '#acf800', color: '#000', border: 'none', padding: '24px',
                            borderRadius: 24, fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15,
                            transition: 'all 0.2s', opacity: cart.length === 0 ? 0.3 : 1
                        }}>
                            Ativar Ecossistema Agora <ChevronRight size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            )}

            {/* Enhanced Single Post Modal with Authority Comparison */}
            {selectedCard && (
                <div 
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(35px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setSelectedCard(null)}
                >
                    <div 
                        style={{ 
                            background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, 
                            maxWidth: 1100, width: '100%', overflow: 'hidden', position: 'relative',
                            boxShadow: '0 50px 150px rgba(0,0,0,1)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setSelectedCard(null)} style={{ position: 'absolute', top: 35, right: 35, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: 14, borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>
                            <X size={28} />
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr' }}>
                            {/* Graphic Side */}
                            <div style={{ 
                                position: 'relative', height: '100%', minHeight: 700,
                                background: `url(${TIER_UI[selectedCard.tier?.toLowerCase()]?.img}) center/cover`
                            }}>
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0d1117, transparent)' }} />
                                <div style={{ position: 'absolute', bottom: 60, left: 60, right: 60 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 25 }}>
                                        <div style={{ background: TIER_UI[selectedCard.tier?.toLowerCase()]?.bg, color: TIER_UI[selectedCard.tier?.toLowerCase()]?.color, padding: 18, borderRadius: 24, backdropFilter: 'blur(10px)', border: `1px solid ${TIER_UI[selectedCard.tier?.toLowerCase()]?.border}` }}>
                                            {(() => { const Icon = TIER_UI[selectedCard.tier?.toLowerCase()]?.icon || Building; return <Icon size={36} /> })()}
                                        </div>
                                        <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 4, color: TIER_UI[selectedCard.tier?.toLowerCase()]?.color }}>GRADE {selectedCard.tier}</span>
                                    </div>
                                    <h2 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-3px', lineHeight: 0.9, margin: 0 }}>{selectedCard.name}</h2>
                                    <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 600 }}>{selectedCard.copy || "O auge da performance para quem não aceita limites operativos."}</p>
                                </div>
                            </div>

                            {/* Details Side */}
                            <div style={{ padding: 60, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 35, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <AlertTriangle size={24} color="#acf800" /> Por que escolher o {selectedCard.name.split(' | ')[0]}?
                                </h3>
                                
                                {/* Comparison Section */}
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 32, padding: '30px', marginBottom: 40 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                                        {/* Advantages */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#acf800', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 20, letterSpacing: 1.5 }}>Com Plug & Sales</div>
                                            {[
                                                'Velocidade Turbo Acelerada',
                                                'Blindagem Anti-Ban Enterprise',
                                                `Capacidade para ${selectedCard.max_chips === 999 ? 'Infinitos' : selectedCard.max_chips} Chips`,
                                            ].map((v, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: 10, color: '#fff', fontSize: '0.9rem', marginBottom: 15, fontWeight: 800, lineHeight: 1.3 }}>
                                                    <Check size={16} color="#acf800" strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} /> {v}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Market Cons */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,100,100,0.5)', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 20, letterSpacing: 1.5 }}>Mercado Comum</div>
                                            {[
                                                'Lentidão e Delays de Envios',
                                                'Risco de Banimento Crítico (80%)',
                                                'Limite rígido de 1 Chip por vez',
                                            ].map((v, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: 10, color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', marginBottom: 15, fontWeight: 700, lineHeight: 1.3 }}>
                                                    <X size={16} color="rgba(255,100,100,0.4)" style={{ marginTop: 2, flexShrink: 0 }} /> {v}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Tech Specs Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 25, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Zap size={24} color="#acf800" style={{ marginBottom: 15 }} />
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Volume Total</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{formatVolume(selectedCard.total_volume)} Envios</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 25, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Cpu size={24} color="#acf800" style={{ marginBottom: 15 }} />
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Instâncias</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{selectedCard.max_chips} Chips</div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <div style={{ background: 'rgba(172,248,0,0.1)', padding: '25px 35px', borderRadius: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ color: '#acf800', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 5 }}>Investimento Garantido</div>
                                            <div style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 900 }}>{formatPrice(selectedCard.price)}</div>
                                        </div>
                                        <button 
                                            onClick={() => { addToCart(selectedCard); setSelectedCard(null); }}
                                            style={{ background: '#acf800', color: '#000', border: 'none', padding: '15px 30px', borderRadius: 20, fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                                        >
                                            Adicionar <Plus size={20} strokeWidth={4} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Smooth Styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&display=swap');
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                body { overflow-x: hidden; background: #020617; }
                ::-webkit-scrollbar { width: 10px; }
                ::-webkit-scrollbar-track { background: #020617; }
                ::-webkit-scrollbar-thumb { background: #1e293b; borderRadius: 5px; border: 3px solid #020617; }
                ::-webkit-scrollbar-thumb:hover { background: #334155; }
            `}</style>
        </div>
    );
}
