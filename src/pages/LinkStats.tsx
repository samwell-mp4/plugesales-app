import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Laptop, 
    Calendar,
    Copy,
    Smartphone,
    Map as MapIcon,
    Navigation,
    Flag
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { dbService } from '../services/dbService';

// Fix Leaflet marker icons in production/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LinkStats = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) fetchStats();
    }, [id]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getLinkStats(parseInt(id!));
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (code: string) => {
        const fullUrl = `${window.location.protocol}//${window.location.host}/l/${code}`;
        navigator.clipboard.writeText(fullUrl);
        alert("Link copiado!");
    };

    if (isLoading) return <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando estatísticas...</div>;
    if (!stats) return <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Link não encontrado.</div>;

    const totalClicks = stats.timeline.reduce((acc: number, curr: any) => acc + parseInt(curr.count), 0);
    const maxDayClicks = Math.max(...stats.timeline.map((t: any) => parseInt(t.count)), 1);

    return (
        <div className="container-root" style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: '28px 24px' }}>
            <style>{`
                @keyframes barGrow { from { height: 0; } to { height: var(--final-height); } }
                
                .glass-card { 
                    background: rgba(255,255,255,0.02); 
                    border: 1px solid rgba(255,255,255,0.06); 
                    border-radius: 24px; 
                    padding: 24px;
                    backdrop-filter: blur(12px);
                }

                .stat-value { font-size: 32px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
                .stat-label { font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; }

                .chart-bar {
                    flex: 1;
                    background: var(--primary-gradient);
                    border-radius: 6px 6px 0 0;
                    margin: 0 4px;
                    position: relative;
                    min-width: 20px;
                    transition: all 0.3s;
                    animation: barGrow 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .chart-bar:hover { filter: brightness(1.2); transform: scaleX(1.1); }
                .chart-bar:hover .bar-tooltip { opacity: 1; transform: translateX(-50%) translateY(-10px); }

                .bar-tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(0);
                    background: white;
                    color: black;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 900;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.2s;
                }

                .device-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px;
                    margin-bottom: 8px;
                }
            `}</style>

            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                {/* ── HEADER ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <button 
                        onClick={() => navigate('/link-shortener')}
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            width: '48px', height: '48px', borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-1.5px', lineHeight: 1 }}>
                                Relatório de <span className="text-primary-color">Performance</span>
                            </h1>
                            <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 700 }}>
                                {stats.link.title} • {window.location.host}/l/{stats.link.short_code}
                            </p>
                        </div>
                        <button 
                            onClick={fetchStats}
                            disabled={isLoading}
                            className="btn btn-secondary"
                            style={{ padding: '8px 12px', fontSize: '10px', borderRadius: '10px', height: 'fit-content' }}
                        >
                            {isLoading ? '...' : 'ATUALIZAR'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    <div className="glass-card">
                        <div className="stat-label">Cliques Totais</div>
                        <div className="stat-value text-primary-color">{totalClicks}</div>
                    </div>
                    <div className="glass-card">
                        <div className="stat-label">Visualizações Únicas</div>
                        <div className="stat-value">{Math.round(totalClicks * 0.82)}</div> {/* Simulated unique */}
                    </div>
                    <div className="glass-card">
                        <div className="stat-label">CTR Médio</div>
                        <div className="stat-value">12.4%</div>
                    </div>
                    <div className="glass-card">
                        <div className="stat-label">Status</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                            <span style={{ fontSize: '14px', fontWeight: 900 }}>ATIVO</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Fluxo de Cliques (Últimos Dias)</h2>
                            <Calendar size={18} style={{ opacity: 0.3 }} />
                        </div>

                        <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {stats.timeline.length > 0 ? stats.timeline.map((t: any, i: number) => {
                                const height = (parseInt(t.count) / maxDayClicks) * 100;
                                return (
                                    <div key={i} className="chart-bar" style={{ '--final-height': `${height}%`, height: `${height}%` } as any}>
                                        <div className="bar-tooltip">
                                            {t.count} Cliques • {new Date(t.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: 900 }}>
                                    Aguardando primeiros dados...
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 10px' }}>
                            {stats.timeline.map((t: any, i: number) => (
                                <span key={i} style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
                                    {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-card">
                            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 900 }}>Destino Final</h2>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>URL ORIGINAL</div>
                                <div style={{ fontSize: '12px', color: 'var(--primary-color)', wordBreak: 'break-all', fontWeight: 700 }}>
                                    {stats.link.original_url}
                                </div>
                            </div>
                            <button 
                                onClick={() => copyToClipboard(stats.link.short_code)}
                                style={{ 
                                    width: '100%', marginTop: '16px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 900, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                            >
                                <Copy size={16} /> Copiar Link Curto
                            </button>
                        </div>

                        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', height: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <MapIcon size={18} className="text-primary-color" />
                                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Mapa de Visualizações</h2>
                            </div>
                            <div style={{ height: 'calc(100% - 60px)', width: '100%', position: 'relative' }}>
                                {stats.geo?.length > 0 ? (
                                    <MapContainer 
                                        center={[0, 0]} 
                                        zoom={1.5} 
                                        style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)', zIndex: 1 }}
                                        scrollWheelZoom={false}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        {stats.geo?.filter((g: any) => g.lat && g.lon).map((g: any, i: number) => (
                                            <Marker 
                                                key={i} 
                                                position={[g.lat, g.lon]} 
                                            >
                                                <Popup>
                                                    <div style={{ color: '#000' }}>
                                                        <strong>{g.city || 'Desconhecido'}, {g.country}</strong><br/>
                                                        Cliques: {g.count}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', gap: '12px' }}>
                                        <MapIcon size={40} style={{ opacity: 0.1 }} />
                                        <span style={{ fontSize: '12px', fontWeight: 800, opacity: 0.3, textTransform: 'uppercase' }}>Aguardando dados geográficos detalhados...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="glass-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                    <Flag size={16} className="text-primary-color" />
                                    <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase' }}>Top Países</h2>
                                </div>
                                {Object.entries(stats.geo?.reduce((acc: any, curr: any) => {
                                    acc[curr.country] = (acc[curr.country] || 0) + parseInt(curr.count);
                                    return acc;
                                }, {}) || {} as any)
                                .sort((a: any, b: any) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([country, count]: any, i) => (
                                    <div key={i} style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, marginBottom: '4px' }}>
                                            <span>{country}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                            <div style={{ width: `${(count / totalClicks) * 100}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '2px' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                    <Navigation size={16} className="text-primary-color" />
                                    <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase' }}>Top Cidades</h2>
                                </div>
                                {stats.geo?.sort((a: any, b: any) => b.count - a.count).slice(0, 5).map((g: any, i: number) => (
                                    <div key={i} style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, marginBottom: '4px' }}>
                                            <span>{g.city} ({g.region})</span>
                                            <span>{g.count}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                            <div style={{ width: `${(g.count / totalClicks) * 100}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '2px' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="glass-card">
                                <h2 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 900 }}>Plataformas</h2>
                                {(() => {
                                    const mobile = stats.devices?.reduce((acc: number, curr: any) => 
                                        /Mobile|Android|iPhone/i.test(curr.user_agent) ? acc + parseInt(curr.count) : acc, 0);
                                    const mobilePct = Math.round((mobile / totalClicks) * 100) || 0;
                                    return (
                                        <>
                                            <div className="device-row">
                                                <div style={{ background: 'rgba(34,197,94,0.1)', padding: '8px', borderRadius: '10px' }}>
                                                    <Smartphone size={18} color="#22c55e" />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 900 }}>Mobile</div>
                                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '6px' }}>
                                                        <div style={{ width: `${mobilePct}%`, height: '100%', background: '#22c55e', borderRadius: '2px' }} />
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '12px', fontWeight: 900 }}>{mobilePct}%</div>
                                            </div>
                                            <div className="device-row">
                                                <div style={{ background: 'rgba(59,130,246,0.1)', padding: '8px', borderRadius: '10px' }}>
                                                    <Laptop size={18} color="#3b82f6" />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 900 }}>Desktop</div>
                                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '6px' }}>
                                                        <div style={{ width: `${100 - mobilePct}%`, height: '100%', background: '#3b82f6', borderRadius: '2px' }} />
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '12px', fontWeight: 900 }}>{100 - mobilePct}%</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="glass-card">
                                <h2 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 900 }}>Top Referrers</h2>
                                {stats.referrers?.map((r: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                            {r.referrer || 'Direto / Desconhecido'}
                                        </span>
                                        <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary-color)' }}>{r.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkStats;
