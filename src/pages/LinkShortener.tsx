import React, { useState, useEffect } from 'react';
import { 
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

    const ensureProtocol = (url: string) => {
        if (!url) return '';
        const trimmed = url.trim();
        if (!/^https?:\/\//i.test(trimmed)) {
            return `https://${trimmed}`;
        }
        return trimmed;
    };

    const fetchClients = async () => {
        try {
            const data = await dbService.getAllUsers();
            // Filter only for users with role CLIENT
            const clientUsers = Array.isArray(data) ? data.filter((u: any) => u.role === 'CLIENT') : [];
            setClients(clientUsers);
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const fetchLinks = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getShortLinks(user?.role, user?.role !== 'ADMIN' ? user?.id : undefined);
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
                target_user_id: selectedClientId ? parseInt(selectedClientId) : undefined
            };

            if (isBulk) {
                payload.links = bulkLinks
                    .filter(l => l.url)
                    .map(l => ({ title: l.title, original_url: ensureProtocol(l.url) }));
                if (payload.links.length === 0) {
                    alert("Adicione pelo menos uma URL válida.");
                    return;
                }
            } else {
                if (!originalUrl) return;
                payload.original_url = ensureProtocol(originalUrl);
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
        <div className="container-root" style={{ minHeight: '100vh', padding: '28px 24px', overflowX: 'hidden' }}>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .glass-card { 
                    background: var(--card-bg-subtle); 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 24px; 
                    padding: 24px;
                    backdrop-filter: blur(12px);
                    animation: fadeInUp 0.4s ease-out backwards;
                }
                .glass-card:hover { 
                    background: var(--card-bg-subtle); 
                    border-color: var(--surface-border);
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
                    background: var(--card-bg-subtle); 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 16px; 
                    padding: 16px; 
                    color: var(--text-primary); 
                    font-size: 14px; 
                    font-weight: 600; 
                    outline: none; 
                    transition: all 0.2s; 
                    box-sizing: border-box; 
                }
                .input-field:focus { 
                    border-color: var(--primary-color); 
                    background: var(--card-bg-subtle); 
                    box-shadow: 0 0 20px rgba(172,248,0,0.1); 
                }

                .link-item {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    padding: 24px;
                    background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle);
                    border-radius: 24px;
                    transition: all 0.3s;
                    margin-bottom: 20px;
                }
                .link-item:hover {
                    background: var(--card-bg-subtle);
                    border-color: var(--surface-border);
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
                    background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle);
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .icon-button:hover {
                    background: var(--card-bg-subtle);
                    color: var(--text-primary);
                    border-color: var(--surface-border);
                    transform: translateY(-2px);
                }
                .icon-button.delete:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .main-grid {
                    display: grid;
                    grid-template-columns: ${user?.role === 'CLIENT' ? '1fr' : '360px 1fr'};
                    gap: 32px;
                }

                select, option {
                    background-color: #000 !important;
                    color: #fff !important;
                }

                @media (max-width: 1200px) {
                    .main-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 992px) {
                    .link-item { flex-direction: column; align-items: stretch; gap: 16px; }
                }
            `}</style>

            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                 <div className="main-grid">
                     {/* ── CREATE SECTION ── */}
                     {user?.role !== 'CLIENT' && (
                        <div className="glass-card" style={{ height: 'fit-content', position: 'sticky', top: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <Plus size={20} className="text-primary-color" />
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Criar Novo Link</h2>
                            </div>
 
                            <form onSubmit={handleCreateLink} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* --- CLIENT SELECTOR --- */}
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                        <Users size={12} /> Vincular a Cliente (Opcional)
                                    </label>
                                    <select 
                                        className="input-field"
                                        style={{ appearance: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                                        value={selectedClientId}
                                        onChange={e => setSelectedClientId(e.target.value)}
                                    >
                                        <option value="">Nenhum cliente selecionado</option>
                                        {Array.isArray(clients) && clients.map(u => (
                                            <option key={u.id} value={u.id.toString()} style={{ color: 'var(--text-primary)', background: 'var(--card-bg-subtle)' }}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
 
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--card-bg-subtle)', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 900 }}>Gerar em massa?</span>
                                    <div 
                                        onClick={() => setIsBulk(!isBulk)}
                                        style={{ 
                                            width: '44px', height: '24px', background: isBulk ? 'var(--primary-color)' : 'var(--surface-border-subtle)', 
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
                                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
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
                                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
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
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
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
                                                padding: '10px', borderRadius: '12px', background: 'var(--card-bg-subtle)', 
                                                border: '1px dashed var(--surface-border-subtle)', color: 'var(--text-muted)',
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
                     )}

                    {/* ── LIST SECTION ── */}
                    <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Seus Links</h2>
                            
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                <input 
                                    placeholder="Buscar links..."
                                    style={{ 
                                        background: 'var(--card-bg-subtle)', 
                                        border: '1px solid var(--surface-border-subtle)',
                                        borderRadius: '12px',
                                        padding: '10px 16px 10px 44px',
                                        fontSize: '13px',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        width: '240px'
                                    }}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Carregando links...
                            </div>
                        ) : filteredLinks.length === 0 ? (
                            <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center' }}>
                                <Globe size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
                                <h3 style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 900 }}>Nenhum link encontrado</h3>
                                <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', opacity: 0.5, fontSize: '14px' }}>
                                    Comece criando seu primeiro link encurtado.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {filteredLinks.map((l) => (
                                    <div key={l.id} className="link-item">
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>
                                                    {window.location.host}/l/{l.short_code}
                                                </span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.5 }}>•</span>
                                                <div style={{ 
                                                     maxWidth: '100%', 
                                                     overflow: 'hidden', 
                                                     textOverflow: 'ellipsis', 
                                                     whiteSpace: 'nowrap',
                                                     fontSize: '11px',
                                                     color: 'var(--text-muted)'
                                                 }}>
                                                     {l.original_url}
                                                 </div>
                                            </div>
                                            
                                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                                {l.client_name && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Users size={12} className="text-primary-color" />
                                                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                            Vínculo: <span className="text-primary-color">{l.client_name}</span>
                                                        </span>
                                                    </div>
                                                 )}
                                                 
                                                 {user?.role !== 'CLIENT' && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <select 
                                                            value={l.target_user_id || ''} 
                                                            onChange={async (e) => {
                                                                const val = e.target.value;
                                                                await dbService.updateShortLink(l.id, { target_user_id: val ? parseInt(val) : null });
                                                                fetchLinks();
                                                            }}
                                                            style={{ 
                                                                fontSize: '10px', 
                                                                background: 'var(--card-bg-subtle)', 
                                                                border: '1px solid var(--surface-border-subtle)', 
                                                                color: 'var(--text-primary)',
                                                                borderRadius: '6px',
                                                                padding: '4px 8px',
                                                                cursor: 'pointer',
                                                                outline: 'none',
                                                                fontWeight: 700
                                                            }}
                                                        >
                                                            <option value="" style={{ background: 'var(--card-bg-subtle)' }}>{l.target_user_id ? 'Alterar Vínculo' : 'Vincular a Cliente'}</option>
                                                            {clients.map(u => (
                                                                <option key={u.id} value={u.id} style={{ background: 'var(--card-bg-subtle)', color: 'var(--text-primary)' }}>
                                                                    {u.name}
                                                                 </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                 )}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'center', padding: '0 20px', minWidth: '80px' }}>
                                            <div className="click-count">{l.clicks || 0}</div>
                                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Cliques</div>
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
                                            {user?.role !== 'CLIENT' && (
                                                <button 
                                                    className="icon-button delete" 
                                                    title="Excluir Link"
                                                    onClick={() => handleDeleteLink(l.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
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
