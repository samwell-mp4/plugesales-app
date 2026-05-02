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
    Loader2
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
                alert('Indexação concluída!');
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
            case 'pdf': return <FileText className="text-red-400" />;
            case 'image': return <ImageIcon className="text-blue-400" />;
            case 'video': return <Video className="text-purple-400" />;
            default: return <FolderOpen className="text-yellow-400" />;
        }
    };

    return (
        <div className="crm-container" style={{ padding: '40px' }}>
            <style>{`
                .material-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(172, 248, 0, 0.05);
                    border-radius: 24px;
                    padding: 24px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .material-card:hover {
                    transform: translateY(-8px);
                    border-color: rgba(172, 248, 0, 0.3);
                    background: rgba(255, 255, 255, 0.04);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                }
                .folder-tab {
                    padding: 12px 24px;
                    border-radius: 16px;
                    font-size: 13px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid rgba(255,255,255,0.05);
                    background: rgba(255,255,255,0.02);
                    color: rgba(255,255,255,0.4);
                    white-space: nowrap;
                }
                .folder-tab.active {
                    background: var(--primary-color);
                    color: black;
                    border-color: var(--primary-color);
                    box-shadow: 0 10px 20px rgba(172, 248, 0, 0.2);
                }
                .search-container {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex: 1;
                    transition: all 0.3s;
                }
                .search-container:focus-within {
                    border-color: var(--primary-color);
                    background: rgba(255,255,255,0.05);
                }
                .action-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.05);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn:hover {
                    background: var(--primary-color);
                    color: black;
                }
                .thumbnail-placeholder {
                    width: 100%;
                    aspect-ratio: 16/9;
                    background: rgba(255,255,255,0.02);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    position: relative;
                }
            `}</style>

            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2">CENTRAL DE MATERIAIS</h1>
                    <p className="text-white/40 text-sm font-bold tracking-widest uppercase">Envio rápido de arquivos e apresentações</p>
                </div>
                <button 
                    onClick={handleIndex} 
                    disabled={isIndexing}
                    className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black hover:bg-primary-color hover:text-black transition-all"
                >
                    {isIndexing ? <Loader2 className="animate-spin" /> : <RefreshCcw size={20} />}
                    {isIndexing ? 'SINCRONIZANDO...' : 'SINCRONIZAR DRIVE'}
                </button>
            </div>

            <div className="flex gap-4 mb-10 flex-wrap lg:flex-nowrap">
                <div className="search-container">
                    <Search size={20} className="text-white/20" />
                    <input 
                        type="text" 
                        placeholder="Pesquisar por nome ou contexto..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none py-5 text-white w-full font-semibold"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {folders.map(folder => (
                        <div 
                            key={folder} 
                            className={`folder-tab ${activeFolder === folder ? 'active' : ''}`}
                            onClick={() => setActiveFolder(folder)}
                        >
                            {folder}
                        </div>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] opacity-20">
                    <Loader2 size={64} className="animate-spin mb-4" />
                    <p className="font-black tracking-widest">CARREGANDO ACERVO...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredMaterials.map((file) => (
                        <div key={file.id} className="material-card group">
                            <div className="thumbnail-placeholder">
                                {file.thumbnail_link ? (
                                    <img src={file.thumbnail_link} alt={file.name} className="w-full h-full object-cover rounded-16" />
                                ) : (
                                    <div className="opacity-20">{React.cloneElement(getIcon(file.type), { size: 48 })}</div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button 
                                        onClick={() => toggleFavorite(file.id, file.is_favorite)}
                                        className={`action-btn ${file.is_favorite ? 'bg-primary-color text-black' : ''}`}
                                    >
                                        <Star size={18} fill={file.is_favorite ? 'currentColor' : 'none'} />
                                    </button>
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button onClick={() => window.open(`https://drive.google.com/file/d/${file.drive_id}/view`, '_blank')} className="action-btn"><ExternalLink size={20} /></button>
                                    <button onClick={() => sendWhatsApp(file)} className="action-btn bg-primary-color text-black"><Send size={20} /></button>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="p-3 bg-white/5 rounded-xl self-start">
                                    {getIcon(file.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-sm truncate mb-1">{file.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{file.folder}</span>
                                        <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                        <span className="text-[10px] font-black text-primary-color uppercase tracking-widest">{file.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <button onClick={() => sendWhatsApp(file)} className="flex items-center gap-2 text-primary-color text-xs font-black hover:opacity-70 transition-opacity">
                                    <Share2 size={14} /> ENVIAR VIA WHATSAPP
                                </button>
                                <div className="flex gap-2">
                                    <Download size={14} className="text-white/20 cursor-pointer hover:text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && filteredMaterials.length === 0 && (
                <div className="text-center py-40 opacity-20">
                    <FolderOpen size={80} className="mx-auto mb-6" />
                    <h3 className="text-2xl font-black">NENHUM MATERIAL ENCONTRADO</h3>
                    <p className="font-bold">Tente mudar o filtro ou sincronizar o Drive</p>
                </div>
            )}
        </div>
    );
};

export default MaterialsCenter;
