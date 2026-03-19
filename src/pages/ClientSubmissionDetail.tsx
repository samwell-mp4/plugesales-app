import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    User,
    FileText,
    Link as LinkIcon,
    CheckCircle,
    Smartphone,
    Download,
    ExternalLink,
    Clock,
    Shield,
    Zap,
    AlertCircle,
    RefreshCw,
    MessageSquare,
    Layers,
    CheckSquare,
    XCircle,
    Image as ImageIcon,
    Video,
    FileSpreadsheet,
    Copy
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

interface Ad {
    ad_name?: string;
    template_type?: string;
    media_url?: string;
    ad_copy?: string;
    ad_copy_file?: string;
    message_mode?: 'manual' | 'upload';
    button_link?: string;
    variables?: string[];
    spreadsheet_url?: string;
    id?: string;
}

interface Submission {
    id: number;
    profile_photo?: string;
    profile_name: string;
    ddd: string;
    status: string;
    accepted_by?: string;
    sender_number?: string;
    ads?: Ad[];
    ad_copy?: string;
    template_type?: string;
    media_url?: string;
    button_link?: string;
    spreadsheet_url?: string;
    timestamp: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDENTE:    { label: 'Pendente',     color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
    EM_ANDAMENTO:{ label: 'Em andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    GERADO:      { label: 'Gerado',       color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)' },
    CANCELADO:   { label: 'Cancelado',    color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)' },
};

const ClientSubmissionDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sub, setSub] = useState<Submission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [senderNumber, setSenderNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeAdIdx, setActiveAdIdx] = useState(0);
    const [notes, setNotes] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState('');

    const load = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await dbService.getClientSubmissionById(Number(id));
            if (data) {
                setSub(data);
                setSenderNumber(data.sender_number || '');
                setNotes(data.notes || '');
            } else {
                setSub(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleSaveSender = async () => {
        if (!id) return;
        setIsSaving(true);
        try {
            await dbService.updateClientSubmission(Number(id), { sender_number: senderNumber, notes });
            await load();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!id) return;
        setUpdatingStatus(true);
        try {
            await dbService.updateClientSubmission(Number(id), { status: newStatus });
            await load();
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopyFeedback(label);
        setTimeout(() => setCopyFeedback(''), 2000);
    };

    if (isLoading) return (
        <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(172,248,0,0.15)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 700, letterSpacing: '2px' }}>CARREGANDO...</span>
        </div>
    );

    if (!sub) return (
        <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <AlertCircle size={60} style={{ color: 'rgba(255,255,255,0.15)' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>Submissão não encontrada</p>
            <button onClick={() => navigate('/client-submissions')} style={{ background: 'var(--primary-color)', color: '#000', padding: '10px 24px', borderRadius: '12px', border: 'none', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}>
                VOLTAR
            </button>
        </div>
    );

    const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG['PENDENTE'];
    const ads = sub.ads && sub.ads.length > 0 ? sub.ads : [];
    const currentAd = ads[activeAdIdx];
    const isMyTask = sub.accepted_by === user?.name;
    const isAdmin = user?.role === 'ADMIN';

    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: '28px 24px' }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .detail-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; }
                .detail-card-hover:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.025); }
                .action-btn { padding: 11px 20px; border-radius: 12px; border: none; cursor: pointer; font-weight: 900; font-size: 11px; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
                .action-btn:hover { transform: translateY(-1px); }
                .action-btn:active { transform: scale(0.97); }
                .primary-btn { background: var(--primary-color); color: #000; }
                .primary-btn:hover { box-shadow: 0 8px 20px -4px rgba(172,248,0,0.35); }
                .ghost-btn { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.08) !important; }
                .ghost-btn:hover { background: rgba(255,255,255,0.09); color: #fff; }
                .danger-btn { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2) !important; }
                .danger-btn:hover { background: rgba(239,68,68,0.18); }
                .success-btn { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2) !important; }
                .success-btn:hover { background: rgba(34,197,94,0.18); }
                .status-btn { padding: 8px 14px; border-radius: 10px; border: 1px solid; cursor: pointer; font-weight: 800; font-size: 10px; letter-spacing: 0.5px; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
                .ad-tab { padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: transparent; color: rgba(255,255,255,0.35); cursor: pointer; font-weight: 800; font-size: 10px; letter-spacing: 0.5px; transition: all 0.15s; }
                .ad-tab.active { background: rgba(172,248,0,0.08); border-color: rgba(172,248,0,0.2); color: var(--primary-color); }
                .field-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 16px; color: white; font-size: 14px; font-weight: 600; outline: none; transition: all 0.2s; box-sizing: border-box; }
                .field-input:focus { border-color: rgba(172,248,0,0.4); background: rgba(255,255,255,0.06); }
                .field-label { font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                .data-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
                .data-row:last-child { border-bottom: none; }
                .info-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 10px; font-weight: 900; letter-spacing: 0.5px; }
            `}</style>

            <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
                {/* ── TOP BAR ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => navigate('/client-submissions')} className="action-btn ghost-btn" style={{ padding: '10px 14px' }}>
                            <ChevronLeft size={18} />
                        </button>
                        {sub.profile_photo ? (
                            <img src={sub.profile_photo} alt="Perfil" style={{ width: 52, height: 52, borderRadius: '14px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                        ) : (
                            <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <User size={24} style={{ opacity: 0.2 }} />
                            </div>
                        )}
                        <div>
                            <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>{sub.profile_name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                <span className="info-chip" style={{ background: 'rgba(172,248,0,0.08)', color: 'var(--primary-color)', border: '1px solid rgba(172,248,0,0.15)' }}>
                                    DDD {sub.ddd}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} /> {new Date(sub.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={load} className="action-btn ghost-btn" style={{ padding: '10px 14px' }} title="Recarregar">
                            <RefreshCw size={15} />
                        </button>

                        {/* Status badge */}
                        <span className="info-chip" style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                            {statusCfg.label.toUpperCase()}
                        </span>

                        {sub.accepted_by && (
                            <span className="info-chip" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <User size={12} /> {sub.accepted_by}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>
                    {/* ── LEFT PANEL ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Sender Config */}
                        <div className="detail-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(172,248,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Smartphone size={16} style={{ color: 'var(--primary-color)' }} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 900, fontSize: '13px' }}>Configuração de Sender</p>
                                    <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Número da BM para envio</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label className="field-label">Número da BM (Sender)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="field-input"
                                        placeholder="Ex: 5511999999999"
                                        value={senderNumber}
                                        onChange={e => setSenderNumber(e.target.value)}
                                    />
                                    {senderNumber && (
                                        <button
                                            onClick={() => copyToClipboard(senderNumber, 'Sender')}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}
                                        >
                                            <Copy size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label className="field-label">Observações Internas</label>
                                <textarea
                                    className="field-input"
                                    placeholder="Anotações sobre a campanha..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={3}
                                    style={{ resize: 'vertical', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '13px', fontWeight: 600, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                />
                            </div>

                            <button
                                onClick={handleSaveSender}
                                disabled={isSaving}
                                className="action-btn primary-btn"
                                style={{ width: '100%' }}
                            >
                                {isSaving ? <RefreshCw size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={15} />}
                                {isSaving ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÃO'}
                            </button>

                            {copyFeedback && (
                                <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--primary-color)', marginTop: '8px', fontWeight: 700 }}>
                                    ✓ {copyFeedback} copiado!
                                </p>
                            )}
                        </div>

                        {/* Status Actions */}
                        {(isMyTask || isAdmin) && (
                            <div className="detail-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Zap size={16} style={{ color: '#3b82f6' }} />
                                    </div>
                                    <p style={{ margin: 0, fontWeight: 900, fontSize: '13px' }}>Atualizar Status</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { status: 'PENDENTE',     label: 'PENDENTE',     icon: <AlertCircle size={13} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
                                        { status: 'EM_ANDAMENTO', label: 'EM ANDAMENTO', icon: <RefreshCw size={13} />,   color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)' },
                                        { status: 'GERADO',       label: 'GERADO',       icon: <CheckSquare size={13} />, color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)' },
                                        { status: 'CANCELADO',    label: 'CANCELADO',    icon: <XCircle size={13} />,     color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)' },
                                    ].map(opt => (
                                        <button
                                            key={opt.status}
                                            className="status-btn"
                                            onClick={() => handleStatusChange(opt.status)}
                                            disabled={updatingStatus || sub.status === opt.status}
                                            style={{
                                                background: sub.status === opt.status ? opt.bg : 'transparent',
                                                borderColor: sub.status === opt.status ? opt.border : 'rgba(255,255,255,0.06)',
                                                color: sub.status === opt.status ? opt.color : 'rgba(255,255,255,0.4)',
                                                opacity: updatingStatus ? 0.5 : 1
                                            }}
                                        >
                                            {opt.icon} {opt.label}
                                            {sub.status === opt.status && <CheckCircle size={11} style={{ marginLeft: 'auto' }} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Files */}
                        <div className="detail-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FileText size={16} style={{ opacity: 0.5 }} />
                                </div>
                                <p style={{ margin: 0, fontWeight: 900, fontSize: '13px' }}>Arquivos da Demanda</p>
                            </div>
                            {sub.spreadsheet_url ? (
                                <a
                                    href={sub.spreadsheet_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s' }}
                                >
                                    <FileSpreadsheet size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                                    <div style={{ overflow: 'hidden' }}>
                                        <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>Planilha de Contatos</span>
                                        <span style={{ fontSize: '10px', color: 'rgba(34,197,94,0.6)' }}>Clique para abrir</span>
                                    </div>
                                    <ExternalLink size={14} style={{ color: '#22c55e', marginLeft: 'auto', flexShrink: 0 }} />
                                </a>
                            ) : (
                                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>Nenhuma planilha enviada</p>
                                </div>
                            )}
                            {sub.media_url && (
                                <a
                                    href={sub.media_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)', borderRadius: '12px', textDecoration: 'none', marginTop: '8px' }}
                                >
                                    <ImageIcon size={18} style={{ color: '#a855f7', flexShrink: 0 }} />
                                    <div>
                                        <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#a855f7' }}>Mídia / Header</span>
                                        <span style={{ fontSize: '10px', color: 'rgba(168,85,247,0.6)' }}>Visualizar mídia</span>
                                    </div>
                                    <ExternalLink size={14} style={{ color: '#a855f7', marginLeft: 'auto' }} />
                                </a>
                            )}
                        </div>

                        {/* Quick info */}
                        <div className="detail-card" style={{ padding: '0', overflow: 'hidden' }}>
                            {[
                                { label: 'Responsável', value: sub.accepted_by || '—', icon: <Shield size={13} /> },
                                { label: 'Sender (BM)', value: sub.sender_number || '—', icon: <Smartphone size={13} /> },
                                { label: 'Anúncios', value: String(ads.length), icon: <Layers size={13} /> },
                            ].map(row => (
                                <div key={row.label} className="data-row">
                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>{row.icon} {row.label}</span>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT PANEL: Ads ── */}
                    <div>
                        {ads.length === 0 ? (
                            /* Legacy single-ad submission */
                            <div className="detail-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(172,248,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MessageSquare size={16} style={{ color: 'var(--primary-color)' }} />
                                    </div>
                                    <p style={{ margin: 0, fontWeight: 900, fontSize: '14px' }}>Conteúdo da Campanha</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {sub.ad_copy && (
                                        <div style={{ gridColumn: '1/-1', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <label className="field-label" style={{ marginBottom: '10px' }}>Mensagem</label>
                                            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{sub.ad_copy}</p>
                                        </div>
                                    )}
                                    {sub.button_link && (
                                        <div style={{ gridColumn: '1/-1', background: 'rgba(59,130,246,0.05)', borderRadius: '14px', padding: '14px 16px', border: '1px solid rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                                <LinkIcon size={15} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                                <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.button_link}</span>
                                            </div>
                                            <button onClick={() => copyToClipboard(sub.button_link!, 'Link')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', flexShrink: 0 }}>
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Multi-ad submission */
                            <div>
                                {/* Ad tabs */}
                                {ads.length > 1 && (
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                        {ads.map((ad, idx) => (
                                            <button
                                                key={idx}
                                                className={`ad-tab ${activeAdIdx === idx ? 'active' : ''}`}
                                                onClick={() => setActiveAdIdx(idx)}
                                            >
                                                #{idx + 1} {ad.ad_name || `Anúncio ${idx + 1}`}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Current Ad Detail */}
                                {currentAd && (
                                    <div className="detail-card" style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: 'rgba(255,255,255,0.2)' }}>
                                                    #{activeAdIdx + 1}
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: '15px' }}>{currentAd.ad_name || `Anúncio ${activeAdIdx + 1}`}</h3>
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                        <span className="info-chip" style={{ background: 'rgba(172,248,0,0.07)', color: 'var(--primary-color)', border: '1px solid rgba(172,248,0,0.12)', padding: '3px 10px', fontSize: '9px' }}>
                                                            {(currentAd.template_type || 'TEXT').toUpperCase()}
                                                        </span>
                                                        <span className="info-chip" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)', padding: '3px 10px', fontSize: '9px' }}>
                                                            {currentAd.message_mode === 'upload' ? 'ARQUIVO' : 'MANUAL'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {currentAd.media_url && (
                                                <a href={currentAd.media_url} target="_blank" rel="noopener noreferrer" className="action-btn ghost-btn" style={{ textDecoration: 'none' }}>
                                                    <Video size={14} /> VER MÍDIA
                                                </a>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                            {/* Message content */}
                                            <div style={{ gridColumn: '1/-1', background: 'rgba(0,0,0,0.25)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                    <label className="field-label" style={{ marginBottom: 0 }}>Conteúdo da Mensagem</label>
                                                    {currentAd.ad_copy && (
                                                        <button onClick={() => copyToClipboard(currentAd.ad_copy!, 'Mensagem')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: '4px' }}>
                                                            <Copy size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                                {currentAd.message_mode === 'upload' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <FileText size={15} style={{ color: 'var(--primary-color)' }} />
                                                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Arquivo de mensagem</span>
                                                        </div>
                                                        {currentAd.ad_copy_file && (
                                                            <a href={currentAd.ad_copy_file} target="_blank" rel="noopener noreferrer" className="action-btn ghost-btn" style={{ padding: '7px 12px', textDecoration: 'none', fontSize: '10px' }}>
                                                                <Download size={13} /> Baixar
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                                        {currentAd.ad_copy || '—'}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Variables */}
                                            {currentAd.variables && currentAd.variables.length > 0 && (
                                                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <label className="field-label">Variáveis do Template</label>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                        {currentAd.variables.map((v, i) => (
                                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.15)', width: '32px', flexShrink: 0 }}>VAR {i + 1}</span>
                                                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '—'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Button link */}
                                            {currentAd.button_link && (
                                                <div style={{ background: 'rgba(59,130,246,0.05)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(59,130,246,0.1)' }}>
                                                    <label className="field-label">Link do Botão</label>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <LinkIcon size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                                        <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{currentAd.button_link}</span>
                                                        <button onClick={() => copyToClipboard(currentAd.button_link!, 'Link')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
                                                            <Copy size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* All ads summary */}
                                {ads.length > 1 && (
                                    <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                                        {ads.map((ad, idx) => (
                                            <div
                                                key={idx}
                                                className="detail-card detail-card-hover"
                                                style={{ padding: '12px 14px', cursor: 'pointer', borderColor: activeAdIdx === idx ? 'rgba(172,248,0,0.2)' : undefined, background: activeAdIdx === idx ? 'rgba(172,248,0,0.03)' : undefined }}
                                                onClick={() => setActiveAdIdx(idx)}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)' }}>#{idx + 1}</span>
                                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.ad_name || `Anúncio ${idx + 1}`}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                                                    <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>{ad.template_type || 'text'}</span>
                                                    {ad.media_url && <ImageIcon size={10} style={{ color: '#a855f7' }} />}
                                                    {ad.spreadsheet_url && <FileSpreadsheet size={10} style={{ color: '#22c55e' }} />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientSubmissionDetail;
