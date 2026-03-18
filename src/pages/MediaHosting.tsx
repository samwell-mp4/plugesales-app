import { useState } from 'react';
import { Upload, Link, FileVideo, ImageIcon, Copy, ExternalLink, Trash2, Search, Zap, Check, Plus, Activity } from 'lucide-react';

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
    const [hostedFiles, setHostedFiles] = useState<HostedMedia[]>([
        {
            id: 'med_9281',
            name: 'promo_video_março.mp4',
            type: 'video',
            size: '4.2 MB',
            shortUrl: 'https://tiny.flow/v/mar-24',
            originalName: 'promo_video_vfinal.mp4',
            uploadedAt: '16 Mar, 10:20'
        },
        {
            id: 'med_1028',
            name: 'banner_oferta.png',
            type: 'image',
            size: '840 KB',
            shortUrl: 'https://tiny.flow/i/extra-10',
            originalName: 'banner_oferta_10_extra.png',
            uploadedAt: '16 Mar, 14:45'
        },
    ]);

    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setTimeout(() => {
            const newFile: HostedMedia = {
                id: 'med_' + Math.floor(Math.random() * 10000),
                name: file.name,
                type: file.type.startsWith('video') ? 'video' : 'image',
                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                shortUrl: `https://tiny.flow/${file.type.startsWith('video') ? 'v' : 'i'}/${file.name.split('.')[0].substring(0, 5)}`,
                originalName: file.name,
                uploadedAt: new Date().toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
            };
            setHostedFiles([newFile, ...hostedFiles]);
            setIsUploading(false);
        }, 1500);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="animate-fade-in media-page" style={{ paddingBottom: '80px' }}>
            <style>{`
                .media-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
                .upload-zone { 
                    border: 2px dashed rgba(172, 248, 0, 0.2); 
                    background: rgba(172, 248, 0, 0.02); 
                    border-radius: 24px; 
                    padding: 60px 40px; 
                    text-align: center;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .upload-zone:hover { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.05); }
                .media-card { background: rgba(30, 41, 59, 0.4); border: 1px solid var(--surface-border); border-radius: 20px; padding: 20px; }
                .short-link-badge { 
                    background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); 
                    border-radius: 8px; padding: 6px 12px; font-family: monospace; font-size: 0.8rem; 
                    color: var(--primary-color); display: flex; align-items: center; gap: 8px;
                }
                
                @media (max-width: 1024px) {
                    .media-layout { grid-template-columns: 1fr; }
                    .search-container { width: 100% !important; margin-top: 16px; }
                }

                @media (max-width: 768px) {
                    .table-wrapper { overflow-x: auto; margin: 0 -20px; padding: 0 20px; }
                    .media-header { flex-direction: column; align-items: flex-start !important; }
                }
            `}</style>

            <div className="flex items-center justify-between mb-2 media-header">
                <div className="flex flex-col">
                    <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', letterSpacing: '-1px' }}>Media Hosting</h1>
                    <p className="subtitle">Hospedagem ultra-rápida e encurtador para campanhas</p>
                </div>
            </div>

            <div className="media-layout mt-8">
                {/* Upload Section */}
                <div className="flex flex-col gap-6">
                    <label className="upload-zone flex flex-col items-center gap-6">
                        <input type="file" style={{ display: 'none' }} onChange={handleUpload} accept="image/*,video/*" />
                        <div style={{
                            width: 80, height: 80, borderRadius: '24px', background: 'var(--primary-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black',
                            boxShadow: '0 0 30px rgba(172, 248, 0, 0.3)'
                        }}>
                            {isUploading ? <Activity className="animate-spin" size={32} /> : <Upload size={32} strokeWidth={3} />}
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 style={{ margin: 0, fontWeight: 900 }}>{isUploading ? 'PROCESSANDO...' : 'SOLTE SEU ARQUIVO AQUI'}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Suporta PNG, JPG, MP4. Limite de 50MB por arquivo.</p>
                        </div>
                        {!isUploading && (
                            <div className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: '14px', color: 'black', fontWeight: 800 }}>
                                <Plus size={18} /> SELECIONAR NO DISCO
                            </div>
                        )}
                    </label>

                    <div className="flex items-center justify-between mt-4">
                        <h3 style={{ margin: 0, fontWeight: 800 }}>Sua Biblioteca</h3>
                        <div className="search-container" style={{ position: 'relative', width: '300px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '44px', borderRadius: '14px', height: '44px', background: 'rgba(0,0,0,0.2)' }}
                                placeholder="Filtrar arquivos..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <div className="glass-card p-0" style={{ overflow: 'hidden', borderRadius: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--surface-border)' }}>
                                        <th style={{ padding: '16px 24px', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>Arquivo</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>Tamanho</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>URL Encurtada</th>
                                        <th style={{ padding: '16px 24px', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hostedFiles.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((file) => (
                                        <tr key={file.id} style={{ borderBottom: '1px solid var(--surface-border)' }} className="hover:bg-white/5 transition-colors">
                                            <td style={{ padding: '16px 24px' }}>
                                                <div className="flex items-center gap-3">
                                                    <div style={{
                                                        width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)',
                                                        border: '1px solid var(--surface-border)'
                                                    }}>
                                                        {file.type === 'video' ? <FileVideo size={20} /> : <ImageIcon size={20} />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{file.name}</span>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{file.uploadedAt}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{file.size}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div className="short-link-badge">
                                                    {file.shortUrl}
                                                    <button onClick={() => copyToClipboard(file.shortUrl, file.id)} style={{ background: 'transparent', border: 'none', color: copiedId === file.id ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer' }}>
                                                        {copiedId === file.id ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="btn btn-secondary" style={{ padding: '8px', borderRadius: '8px' }} title="Visualizar">
                                                        <ExternalLink size={16} />
                                                    </button>
                                                    <button className="btn btn-secondary" style={{ padding: '8px', borderRadius: '8px', color: '#ff4d4d' }} onClick={() => setHostedFiles(hostedFiles.filter(f => f.id !== file.id))}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="flex flex-col gap-6">
                    <div className="media-card flex flex-col gap-6" style={{ background: 'rgba(172, 248, 0, 0.03)', border: '1px solid rgba(172, 248, 0, 0.1)' }}>
                        <div className="flex items-center gap-3">
                            <Zap size={24} color="var(--primary-color)" />
                            <h3 style={{ margin: 0, fontWeight: 900 }}>Tecnologia Flow</h3>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className="flex gap-4">
                                <div style={{ minWidth: 40, height: 40, borderRadius: '10px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                    <Cloud size={18} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>CDN Otimizada</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Seus vídeos e imagens carregam instantaneamente no celular do lead.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div style={{ minWidth: 40, height: 40, borderRadius: '10px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                    <Link size={18} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Rastreio de Cliques</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>Saiba exatamente quem clicou em sua mídia através dos links curtos.</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '10px', padding: '16px', borderRadius: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)' }}>
                            <div className="flex justify-between items-center mb-2">
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Espaço Utilizado</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>12%</span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                                <div style={{ width: '12%', height: '100%', background: 'var(--primary-color)', boxShadow: '0 0 10px var(--primary-color)' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaHosting;

// Local components used above
const Cloud = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2-1.5-3.5-3.5-4 0-4-3-7-7-7-3 0-6 2.5-6.5 5.5-2.5.5-4.5 2.5-4.5 5 0 2.5 2 4.5 4.5 4.5h12.5z"></path>
    </svg>
);
