import React, { useState, useEffect } from 'react';
import { 
    Search, 
    FileText, 
    Image as ImageIcon, 
    Video, 
    Share2, 
    ExternalLink, 
    Star, 
    Download, 
    RefreshCcw,
    FolderOpen,
    Send,
    Loader2,
    Zap
} from 'lucide-react';

const MaterialsCenter = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isIndexing, setIsIndexing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFolder, setActiveFolder] = useState('Tudo');

    const folders = ['Tudo', 'Apresentações', 'Propostas', 'Contratos', 'Provas Sociais', 'Scripts'];

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/materials');
            const data = await res.json();
            setMaterials(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIndex = async () => {
        setIsIndexing(true);
        try {
            const res = await fetch('/api/materials/index', { method: 'POST' });
            if (res.ok) {
                fetchMaterials();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsIndexing(false);
        }
    };

    const toggleFavorite = async (id: number, current: boolean) => {
        try {
            await fetch('/api/materials/favorite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_favorite: !current })
            });
            setMaterials(prev => prev.map(m => m.id === id ? { ...m, is_favorite: !current } : m));
        } catch (err) {
            console.error(err);
        }
    };

    const sendWhatsApp = (file: any) => {
        const driveLink = `https://drive.google.com/file/d/${file.drive_id}/view`;
        const text = `Olá! Segue o material que conversamos: ${file.name}\n\nVisualizar: ${driveLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = activeFolder === 'Tudo' || m.folder === activeFolder;
        return matchesSearch && matchesFolder;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText size={24} className="text-red-400" />;
            case 'image': return <ImageIcon size={24} className="text-blue-400" />;
            case 'video': return <Video size={24} className="text-purple-400" />;
            default: return <FolderOpen size={24} className="text-yellow-400" />;
        }
    };

    return (
        <div className="crm-container" style={{ paddingTop: '20px' }}>
            <style>{`
                .materials-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 32px; /* GAP EXPLÍCITO AQUI */
                    margin-top: 40px;
                    width: 100%;
                }
                .materials-header {
                    margin-bottom: 40px;
                }
                .materials-filter-row {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                    margin-bottom: 32px;
                    background: rgba(15, 23, 42, 0.4);
                    padding: 20px;
                    border-radius: 24px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                @media (max-width: 768px) {
                    .materials-filter-row {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .materials-filter-row .flex {
                        overflow-x: auto;
                        padding-bottom: 8px;
                    }
                }
            `}</style>

            <header className="crm-header-premium materials-header">
                <div className="crm-title-group">
                    <span className="crm-badge-small">
                        <Zap size={12} fill="currentColor" className="text-primary-color" /> ACERVO DE ALTA CONVERSÃO
                    </span>
                    <h1 className="crm-main-title">Central de Materiais</h1>
                    <p className="text-white/40 text-[11px] font-bold tracking-[2px] uppercase mt-1">
                        Sincronize seu Google Drive e venda com um clique
                    </p>
                </div>

                <button 
                    onClick={handleIndex} 
                    disabled={isIndexing}
                    className="btn-supreme"
                >
                    {isIndexing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
                    {isIndexing ? 'Sincronizando...' : 'SINCRONIZAR DRIVE'}
                </button>
            </header>

            <div className="materials-filter-row">
                <div className="crm-control-group" style={{ flex: 1 }}>
                    <Search size={18} className="icon" />
                    <input 
                        type="text" 
                        placeholder="O que você está procurando?" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="crm-input-premium"
                    />
                </div>

                <div className="flex gap-2">
                    {folders.map(folder => (
                        <button 
                            key={folder}
                            onClick={() => setActiveFolder(folder)}
                            className={`crm-toggle-btn ${activeFolder === folder ? 'active' : ''}`}
                        >
                            {folder}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] opacity-20">
                    <Loader2 size={64} className="animate-spin mb-4" />
                    <p className="font-black tracking-[5px] uppercase">Acessando Banco de Dados...</p>
                </div>
            ) : (
                <div className="materials-grid">
                    {filteredMaterials.map((file) => (
                        <div key={file.id} className="crm-card group relative flex flex-col p-6 hover:border-primary-color/40" style={{ height: '100%' }}>
                            {/* Favorite */}
                            <button 
                                onClick={() => toggleFavorite(file.id, file.is_favorite)}
                                className={`absolute top-6 right-6 z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                                    file.is_favorite ? 'bg-primary-color text-black shadow-lg shadow-primary-color/20' : 'bg-white/5 text-white/20 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Star size={16} fill={file.is_favorite ? 'currentColor' : 'none'} />
                            </button>

                            {/* Preview Area */}
                            <div className="w-full aspect-[4/3] bg-[#020617] rounded-3xl mb-6 overflow-hidden relative flex items-center justify-center border border-white/5">
                                {file.thumbnail_link ? (
                                    <img src={file.thumbnail_link} alt={file.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-110" />
                                ) : (
                                    <div className="opacity-20 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500">
                                        {getIcon(file.type)}
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                                    <button 
                                        onClick={() => window.open(`https://drive.google.com/file/d/${file.drive_id}/view`, '_blank')} 
                                        className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all"
                                        title="Visualizar Arquivo"
                                    >
                                        <ExternalLink size={24} />
                                    </button>
                                    <button 
                                        onClick={() => sendWhatsApp(file)} 
                                        className="w-14 h-14 rounded-2xl bg-primary-color text-black flex items-center justify-center hover:scale-110 transition-all shadow-xl"
                                        title="Enviar no WhatsApp"
                                    >
                                        <Send size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start mb-6">
                                <div className="w-12 h-12 bg-primary-color/5 rounded-2xl flex items-center justify-center shrink-0 border border-primary-color/10">
                                    {getIcon(file.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-black text-sm truncate leading-tight mb-1">{file.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{file.folder}</span>
                                        <div className="w-1 h-1 rounded-full bg-primary-color/30"></div>
                                        <span className="text-[10px] font-black text-primary-color uppercase tracking-widest">{file.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                <button onClick={() => sendWhatsApp(file)} className="flex items-center gap-2 text-primary-color text-[11px] font-black hover:tracking-widest transition-all uppercase">
                                    <Share2 size={14} /> Enviar agora
                                </button>
                                <div className="flex gap-3">
                                    <Download size={16} className="text-white/20 cursor-pointer hover:text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && filteredMaterials.length === 0 && (
                <div className="text-center py-40 opacity-20">
                    <FolderOpen size={100} className="mx-auto mb-8 text-primary-color" />
                    <h2 className="text-3xl font-black mb-2">NADA POR AQUI</h2>
                    <p className="font-bold tracking-[3px] uppercase"> SINCRONIZE O DRIVE PARA CARREGAR MATERIAIS</p>
                </div>
            )}
        </div>
    );
};

export default MaterialsCenter;
