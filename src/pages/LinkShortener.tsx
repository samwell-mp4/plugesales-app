import React, { useState, useEffect } from 'react';
import { 
    Link, 
    Copy, 
    Trash2, 
    BarChart3, 
    Plus, 
    Globe, 
    Search,
    ChevronRight,
    Zap,
    Users,
    Trash
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom';

const LinkShortener = () => {
    const { user } = useAuth() as any;
    const navigate = useNavigate();
    const [originalUrl, setOriginalUrl] = useState('');
    const [title, setTitle] = useState('');
    const [links, setLinks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Phase 2 States
    const [isBulk, setIsBulk] = useState(false);
    const [bulkLinks, setBulkLinks] = useState([{ title: '', url: '' }]);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');

    useEffect(() => {
        fetchLinks();
        fetchClients();
    }, [user]);

    const fetchClients = async () => {
        try {
            const data = await dbService.getClientSubmissions();
            setClients(data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const fetchLinks = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getShortLinks(user?.role !== 'ADMIN' ? user?.id : undefined);
            setLinks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching links:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsCreating(true);
        try {
            const payload: any = {
                user_id: user?.id,
                client_id: selectedClientId ? parseInt(selectedClientId) : undefined
            };

            if (isBulk) {
                payload.links = bulkLinks
                    .filter(l => l.url)
                    .map(l => ({ title: l.title, original_url: l.url }));
                if (payload.links.length === 0) {
                    alert("Adicione pelo menos uma URL válida.");
                    return;
                }
            } else {
                if (!originalUrl) return;
                payload.original_url = originalUrl;
                payload.title = title || undefined;
            }

            const result = await dbService.createShortLink(payload);

            if (result && (result.id || Array.isArray(result))) {
                setOriginalUrl('');
                setTitle('');
                setBulkLinks([{ title: '', url: '' }]);
                setIsBulk(false);
                setSelectedClientId('');
                fetchLinks();
            }
        } catch (error) {
            console.error("Error creating link:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteLink = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este link?")) return;
        try {
            await dbService.deleteShortLink(id);
            fetchLinks();
        } catch (error) {
            console.error("Error deleting link:", error);
        }
    };

    const copyToClipboard = (code: string) => {
        const fullUrl = `${window.location.protocol}//${window.location.host}/l/${code}`;
        navigator.clipboard.writeText(fullUrl);
        alert("Link copiado para o clipboard!");
    };

    const filteredLinks = links.filter(l => 
        l.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.original_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.short_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-root" style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: '28px 24px' }}>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .glass-card { 
                    background: rgba(255,255,255,0.02); 
                    border: 1px solid rgba(255,255,255,0.06); 
                    border-radius: 24px; 
                    padding: 24px;
                    backdrop-filter: blur(12px);
                    animation: fadeInUp 0.4s ease-out backwards;
                }
                .glass-card:hover { 
                    background: rgba(255,255,255,0.03); 
                    border-color: rgba(255,255,255,0.1);
                }

                .action-btn { 
                    padding: 12px 24px; 
                    border-radius: 14px; 
                    border: none; 
                    cursor: pointer; 
                    font-weight: 900; 
                    font-size: 11px; 
                    letter-spacing: 1px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 10px; 
                    transition: all 0.2s; 
                    text-transform: uppercase; 
                }
                .primary-btn { background: var(--primary-gradient); color: #000; box-shadow: 0 8px 20px -6px var(--primary); }
                .primary-btn:hover { transform: scale(1.02); box-shadow: 0 10px 25px -5px var(--primary); }
                .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .input-field { 
                    width: 100%; 
                    background: rgba(255,255,255,0.02); 
                    border: 1px solid rgba(255,255,255,0.08); 
                    border-radius: 16px; 
                    padding: 16px; 
                    color: white; 
                    font-size: 14px; 
                    font-weight: 600; 
                    outline: none; 
                    transition: all 0.2s; 
                    box-sizing: border-box; 
                }
                .input-field:focus { 
                    border-color: var(--primary-color); 
                    background: rgba(255,255,255,0.04); 
                    box-shadow: 0 0 20px rgba(172,248,0,0.1); 
                }

                .link-item {
                    display: grid;
                    grid-template-columns: 1fr auto auto auto;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    transition: all 0.3s;
                    margin-bottom: 12px;
                }
                .link-item:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.12);
                    transform: translateX(4px);
                }

                .click-count {
                    font-size: 24px;
                    font-weight: 900;
                    color: var(--primary-color);
                    line-height: 1;
                }

                .icon-button {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: rgba(255,255,255,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .icon-button:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-color: rgba(255,255,255,0.2);
                    transform: translateY(-2px);
                }
                .icon-button.delete:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.2);
                }

                @media (max-width: 768px) {
                    .link-item { grid-template-columns: 1fr; gap: 12px; }
                }
            `}</style>

            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                {/* ── HEADER ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ background: 'rgba(172,248,0,0.1)', padding: '8px', borderRadius: '12px' }}>
                                <Link size={24} color="var(--primary-color)" />
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                Advanced Tools
                            </span>
                        </div>
                        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '3rem', letterSpacing: '-2px', lineHeight: 1 }}>
                            Encurtador de <span className="text-primary-color">Links</span>
                        </h1>
                        <p style={{ margin: '12px 0 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 500 }}>
                            Crie, gerencie e acompanhe a performance dos seus links em tempo real.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '30px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '24px', fontWeight: 900 }}>{links.length}</div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Links Ativos</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary-color)' }}>
                                {links.reduce((acc, curr) => acc + parseInt(curr.clicks || 0), 0)}
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Cliques Totais</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                    {/* ── CREATE SECTION ── */}
                    <div className="glass-card" style={{ height: 'fit-content', position: 'sticky', top: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <Plus size={20} className="text-primary-color" />
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Criar Novo Link</h2>
                        </div>

                        <form onSubmit={handleCreateLink} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* --- CLIENT SELECTOR --- */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    <Users size={12} /> Vincular a Cliente (Opcional)
                                </label>
                                <select 
                                    className="input-field"
                                    style={{ appearance: 'none', cursor: 'pointer' }}
                                    value={selectedClientId}
                                    onChange={e => setSelectedClientId(e.target.value)}
                                >
                                    <option value="">Nenhum cliente selecionado</option>
                                    {Array.isArray(clients) && clients.map(c => (
                                        <option key={c.id} value={c.id.toString()} style={{ color: '#000' }}>
                                            {c.profile_name} {c.ddd && `(${c.ddd})`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '12px', fontWeight: 900 }}>Gerar em massa?</span>
                                <div 
                                    onClick={() => setIsBulk(!isBulk)}
                                    style={{ 
                                        width: '44px', height: '24px', background: isBulk ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', 
                                        borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' 
                                    }}
                                >
                                    <div style={{ 
                                        width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', 
                                        top: '3px', left: isBulk ? '23px' : '3px', transition: 'all 0.3s' 
                                    }} />
                                </div>
                            </div>

                            {!isBulk ? (
                                <>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            Título do Link (Opcional)
                                        </label>
                                        <input 
                                            className="input-field"
                                            placeholder="Ex: Campanha de Outono"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            URL Original
                                        </label>
                                        <input 
                                            className="input-field"
                                            placeholder="https://seu-link-longo.com/qualquer-coisa"
                                            required={!isBulk}
                                            value={originalUrl}
                                            onChange={e => setOriginalUrl(e.target.value)}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                                        Lista de Links
                                    </label>
                                    {bulkLinks.map((link, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <input 
                                                    className="input-field"
                                                    style={{ padding: '8px 12px', fontSize: '12px' }}
                                                    placeholder="Título"
                                                    value={link.title}
                                                    onChange={e => {
                                                        const newLinks = [...bulkLinks];
                                                        newLinks[idx].title = e.target.value;
                                                        setBulkLinks(newLinks);
                                                    }}
                                                />
                                                <input 
                                                    className="input-field"
                                                    style={{ padding: '8px 12px', fontSize: '12px' }}
                                                    placeholder="https://URL-Original..."
                                                    value={link.url}
                                                    onChange={e => {
                                                        const newLinks = [...bulkLinks];
                                                        newLinks[idx].url = e.target.value;
                                                        setBulkLinks(newLinks);
                                                    }}
                                                />
                                            </div>
                                            {bulkLinks.length > 1 && (
                                                <button 
                                                    type="button"
                                                    className="icon-button delete"
                                                    style={{ marginTop: '8px' }}
                                                    onClick={() => setBulkLinks(bulkLinks.filter((_, i) => i !== idx))}
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button 
                                        type="button"
                                        onClick={() => setBulkLinks([...bulkLinks, { title: '', url: '' }])}
                                        style={{ 
                                            padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', 
                                            border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
                                            fontSize: '11px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <Plus size={14} /> Adicionar outro link
                                    </button>
                                </div>
                            )}

                            <button type="submit" disabled={isCreating} className="action-btn primary-btn" style={{ marginTop: '10px', width: '100%' }}>
                                <Zap size={16} />
                                {isCreating ? 'Encurtando...' : isBulk ? `Gerar ${bulkLinks.length} Links` : 'Encurtar Link'}
                            </button>
                        </form>
                    </div>

                    {/* ── LIST SECTION ── */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Seus Links</h2>
                            
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                <input 
                                    placeholder="Buscar links..."
                                    style={{ 
                                        background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '12px',
                                        padding: '10px 16px 10px 44px',
                                        fontSize: '13px',
                                        color: 'white',
                                        outline: 'none',
                                        width: '240px'
                                    }}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                                Carregando links...
                            </div>
                        ) : filteredLinks.length === 0 ? (
                            <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center' }}>
                                <Globe size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
                                <h3 style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>Nenhum link encontrado</h3>
                                <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>
                                    Comece criando seu primeiro link encurtado ao lado.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {filteredLinks.map((l) => (
                                    <div key={l.id} className="link-item">
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 900 }}>{l.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)' }}>
                                                    {window.location.host}/l/{l.short_code}
                                                </span>
                                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>•</span>
                                                <div style={{ 
                                                    maxWidth: '200px', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis', 
                                                    whiteSpace: 'nowrap',
                                                    fontSize: '11px',
                                                    color: 'rgba(255,255,255,0.3)'
                                                }}>
                                                    {l.original_url}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'center', padding: '0 20px' }}>
                                            <div className="click-count">{l.clicks || 0}</div>
                                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: '4px' }}>Cliques</div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="icon-button" 
                                                title="Copiar Link"
                                                onClick={() => copyToClipboard(l.short_code)}
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button 
                                                className="icon-button" 
                                                title="Ver Estatísticas"
                                                onClick={() => navigate(`/link-stats/${l.id}`)}
                                            >
                                                <BarChart3 size={18} />
                                            </button>
                                            <button 
                                                className="icon-button delete" 
                                                title="Excluir Link"
                                                onClick={() => handleDeleteLink(l.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div style={{ paddingLeft: '10px' }}>
                                            <ChevronRight size={20} style={{ opacity: 0.2 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkShortener;
