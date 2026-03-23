import { useState, useEffect } from 'react';
import { 
    Upload, 
    Link, 
    ImageIcon, 
    Copy, 
    Trash2, 
    Search, 
    Zap, 
    Check, 
    Plus, 
    Activity,
    X,
    Folder,
    Maximize2,
    Clock
} from 'lucide-react';
import { dbService } from '../services/dbService';

interface HostedMedia {
    id: string;
    name: string;
    type: 'image' | 'video';
    size: string;
    shortUrl: string;
    originalName: string;
    uploadedAt: string;
}

const MediaHosting = () => {
    const [hostedFiles, setHostedFiles] = useState<HostedMedia[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [previewFile, setPreviewFile] = useState<HostedMedia | null>(null);

    const load = () => {
        dbService.getMedia().then(media => {
            setHostedFiles(media.map((m: any) => ({
                id: String(m.id),
                name: m.name,
                type: m.type as 'image' | 'video',
                size: '--',
                shortUrl: m.short_url,
                originalName: m.name,
                uploadedAt: new Date(m.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short' })
            })));
        });
    };

    useEffect(() => { load(); }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        setUploadProgress({ current: 0, total: fileArray.length });
        setIsUploading(true);

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            setUploadProgress(prev => ({ ...prev, current: i + 1 }));

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error(`Falha no upload de ${file.name}`);
                load(); // Reload complete list after each successful upload
            } catch (error: any) {
                console.error('Upload Error:', error);
            }
        }

        setIsUploading(false);
        setUploadProgress({ current: 0, total: 0 });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Excluir este arquivo permanentemente?')) return;
        setHostedFiles(prev => prev.filter(f => String(f.id) !== id));
        await dbService.deleteMedia(Number(id));
    };

    const copyToClipboard = (text: string, id: string) => {
        const fullUrl = text.startsWith('http') ? text : window.location.origin + (text.startsWith('/') ? '' : '/') + text;
        navigator.clipboard.writeText(fullUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredFiles = hostedFiles.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="container-root" style={{ minHeight: '100vh', padding: '28px 24px' }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                
                .control-card { 
                    background: var(--card-bg-subtle); 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 24px; 
                    padding: 24px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: fadeInUp 0.4s ease-out backwards;
                }
                .control-card:hover { 
                    background: var(--card-bg-subtle); 
                    border-color: var(--surface-border);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px -10px rgba(0,0,0,0.5);
                }

                .action-btn { padding: 12px 20px; border-radius: 14px; border: none; cursor: pointer; font-weight: 900; font-size: 11px; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; text-transform: uppercase; }
                .primary-btn { background: var(--primary-gradient); color: #000; box-shadow: 0 8px 20px -6px var(--primary); }
                .ghost-btn { background: var(--card-bg-subtle); color: var(--text-muted); border: 1px solid var(--surface-border-subtle) !important; }
                .ghost-btn:hover { background: var(--card-bg-subtle); color: var(--text-primary); border-color: var(--surface-border) !important; }

                .upload-zone { 
                    border: 2px dashed var(--surface-border-subtle); 
                    background: var(--card-bg-subtle); 
                    border-radius: 32px; 
                    padding: 40px; 
                    text-align: center;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .upload-zone:hover { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.05); }

                .media-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }

                .media-item {
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .media-preview-box {
                    height: 180px;
                    border-radius: 16px;
                    background: var(--card-bg-subtle);
                    margin-bottom: 16px;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid var(--surface-border-subtle);
                }
                .media-preview-box img, .media-preview-box video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .media-item:hover .media-preview-box img { transform: scale(1.1); }
                
                .overlay-actions {
                    position: absolute;
                    inset: 0;
                    background: var(--overlay-bg);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    opacity: 0;
                    transition: all 0.3s;
                }
                .media-preview-box:hover .overlay-actions { opacity: 1; }

                .field-input { width: 100%; background: var(--card-bg-subtle); border: 1px solid var(--surface-border-subtle); border-radius: 16px; padding: 16px; color: var(--text-primary); font-size: 14px; font-weight: 600; outline: none; transition: all 0.2s; box-sizing: border-box; }
                .field-input:focus { border-color: var(--primary-color); background: var(--card-bg-subtle); box-shadow: 0 0 20px rgba(172,248,0,0.1); }
                
                .info-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
            `}</style>

            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                {/* ── HEADER ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '24px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '2.8rem', letterSpacing: '-2px', lineHeight: 1 }}>
                            Media <span className="text-primary-color">Hosting</span>
                        </h1>
                        <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Gerenciamento de ativos para campanhas
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div className="control-card" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(172,248,0,0.1)', border: '1px solid rgba(172,248,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                <Folder size={20} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>{hostedFiles.length}</p>
                                <p style={{ margin: 0, fontSize: '8px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>ARQUIVOS TOTAIS</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MAIN CONTENT ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '32px', alignItems: 'start' }} className="responsive-grid">
                    
                    {/* LEFT AREA: GRID */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* SEARCH & FILTERS */}
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input 
                                className="field-input" 
                                style={{ paddingLeft: '52px', height: '60px' }} 
                                placeholder="BUSCAR ARQUIVOS NA BIBLIOTECA..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* ACTUAL GRID */}
                        <div className="media-grid">
                            {filteredFiles.map((file, idx) => (
                                <div key={file.id} className="control-card media-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                                    <div className="media-preview-box">
                                        {file.type === 'video' ? (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg-subtle)' }}>
                                                <video src={file.shortUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 8px', background: 'var(--overlay-bg)', borderRadius: '6px', fontSize: '9px', fontWeight: 900 }}>MP4</div>
                                            </div>
                                        ) : (
                                            <img src={file.shortUrl} alt="" />
                                        )}
                                        
                                        <div className="overlay-actions">
                                            <button 
                                                onClick={() => setPreviewFile(file)}
                                                className="action-btn ghost-btn" 
                                                style={{ width: 44, height: 44, padding: 0, borderRadius: '50%' }}
                                            >
                                                <Maximize2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => copyToClipboard(file.shortUrl, file.id)}
                                                className="action-btn primary-btn" 
                                                style={{ width: 44, height: 44, padding: 0, borderRadius: '50%' }}
                                            >
                                                {copiedId === file.id ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {file.name.toUpperCase()}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid var(--surface-border-subtle)', paddingTop: '12px' }}>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} /> {file.uploadedAt}
                                                </span>
                                            </div>
                                            <button onClick={() => handleDelete(file.id)} style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer', padding: '4px' }} className="hover:opacity-100 transition-opacity">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredFiles.length === 0 && (
                            <div className="control-card" style={{ padding: '80px', textAlign: 'center', opacity: 0.2 }}>
                                <ImageIcon size={64} style={{ marginBottom: '20px' }} />
                                <h3 style={{ fontWeight: 900 }}>BIBLIOTECA VAZIA</h3>
                                <p style={{ fontSize: '12px' }}>Nenhum arquivo encontrado conforme sua busca.</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT AREA: UPLOAD & INFO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        <label className="upload-zone">
                            <input type="file" style={{ display: 'none' }} onChange={handleUpload} accept="image/*,video/*" multiple />
                            <div style={{ 
                                width: 72, height: 72, borderRadius: '24px', 
                                background: 'rgba(172,248,0,0.1)', border: '1px solid rgba(172,248,0,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'
                            }}>
                                {isUploading ? <Activity className="animate-spin" size={32} /> : <Upload size={32} />}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '16px' }}>
                                    {isUploading ? `UPDATING...` : 'NOVO UPLOAD'}
                                </h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800 }}>DRAG & DROP DISPONÍVEL</p>
                            </div>
                            {isUploading && (
                                <div style={{ width: '100%', marginTop: '16px' }}>
                                    <div style={{ height: '4px', background: 'var(--card-bg-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', background: 'var(--primary-color)', 
                                            width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <p style={{ fontSize: '9px', fontWeight: 900, marginTop: '8px', color: 'var(--primary-color)' }}>
                                        {uploadProgress.current} DE {uploadProgress.total} ARQUIVOS
                                    </p>
                                </div>
                            )}
                            <button className="action-btn primary-btn" style={{ width: '100%', marginTop: '8px' }} disabled={isUploading}>
                                <Plus size={18} /> SELECIONAR ARQUIVOS
                            </button>
                        </label>

                        <div className="control-card" style={{ background: 'var(--card-bg-subtle)', borderColor: 'var(--surface-border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <Zap size={20} className="text-primary-color" />
                                <h3 style={{ margin: 0, fontWeight: 900, fontSize: '14px' }}>TECNOLOGIA FLOW</h3>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--surface-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Zap size={18} style={{ opacity: 0.3 }} />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 900 }}>CDN OTIMIZADA</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>Carregamento ultra-rápido global.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--surface-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Link size={18} style={{ opacity: 0.3 }} />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 900 }}>LINKS CURTOS</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>URL amigável para disparos.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── LIGHTBOX PREVIEW ── */}
                {previewFile && (
                    <div 
                        style={{ 
                            position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--overlay-bg)', 
                            backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '40px', animation: 'fadeIn 0.3s ease'
                        }}
                        onClick={() => setPreviewFile(null)}
                    >
                        <button 
                            style={{ position: 'absolute', top: 32, right: 32, background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10 }}
                            onClick={() => setPreviewFile(null)}
                        >
                            <X size={32} />
                        </button>
                        
                        <div 
                            style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', animation: 'scaleIn 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {previewFile.type === 'video' ? (
                                <video src={previewFile.shortUrl} controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }} />
                            ) : (
                                <img src={previewFile.shortUrl} alt="" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }} />
                            )}
                            
                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontWeight: 900, fontSize: '20px' }}>{previewFile.name.toUpperCase()}</h2>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>ID: {previewFile.id}</p>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(previewFile.shortUrl, previewFile.id)}
                                    className="action-btn primary-btn" 
                                    style={{ height: 48, padding: '0 24px' }}
                                >
                                    {copiedId === previewFile.id ? <Check size={18} /> : <Copy size={18} />}
                                    COPIAR URL
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── FOOTER LOGO ── */}
                <div style={{ marginTop: '60px', textAlign: 'center', opacity: 0.1 }}>
                    <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '4px' }}>PLUG & SALES • MEDIA</h2>
                </div>
            </div>
        </div>
    );
};

export default MediaHosting;
