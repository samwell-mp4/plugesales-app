import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    User,
    CheckCircle,
    Smartphone,
    ExternalLink,
    Clock,
    Shield,
    Zap,
    AlertCircle,
    RefreshCw,
    CheckSquare,
    Image as ImageIcon,
    FileSpreadsheet,
    Copy,
    Layers,
    Plus,
    Trash2,
    Upload,
    X,
    Activity,
    Users,
    TrendingDown,
    TrendingUp,
    Printer
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
    sender_number?: string;
    dispatch_date?: string;
    total_leads?: number;
    delivered_leads?: number;
    price_per_msg?: number;
    id?: string;
}

interface Submission {
    id: number;
    profile_photo?: string;
    profile_name: string;
    ddd: string;
    status: string;
    accepted_by?: string;
    assigned_to?: string;
    sender_number?: string;
    ads?: Ad[];
    ad_copy?: string;
    template_type?: string;
    media_url?: string;
    button_link?: string;
    spreadsheet_url?: string;
    timestamp: string;
    notes?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDENTE:    { label: 'Pendente',     color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
    EM_ANDAMENTO:{ label: 'Em andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    GERADO:      { label: 'Gerado',       color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)' },
    CANCELADO:   { label: 'Cancelado',    color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)' },
    CONCLUIDO:   { label: 'Disparo Concluído', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
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
    const [employees, setEmployees] = useState<string[]>([]);
    const [updatingAssign, setUpdatingAssign] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState('');

    const load = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await dbService.getClientSubmissionById(Number(id));
            if (data) {
                // Security Check: Clients can only see their own submissions
                if (user?.role === 'CLIENT' && data.user_id !== user.id) {
                    navigate('/client-dashboard', { replace: true });
                    return;
                }
                setSub(data);
                setSenderNumber(data.sender_number || '');
                setNotes(data.notes || '');
                
                if (user?.role === 'ADMIN') {
                    const empData = await dbService.getEmployees();
                    setEmployees(empData);
                }
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

    const handleAssignChange = async (employeeName: string) => {
        if (!id) return;
        setUpdatingAssign(true);
        try {
            await dbService.updateClientSubmission(Number(id), { assigned_to: employeeName || null });
            await load();
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingAssign(false);
        }
    };

    const handleUpdateAd = async (index: number, field: keyof Ad, val: any) => {
        if (!sub || !sub.ads) return;
        const newAds = [...sub.ads];
        newAds[index] = { ...newAds[index], [field]: val };
        
        setSub({ ...sub, ads: newAds });

        try {
            await dbService.updateClientSubmission(Number(id), { ads: newAds });
        } catch (err) {
            console.error("Error updating ad:", err);
            load();
        }
    };

    const handleAddAd = async () => {
        if (!sub) return;
        const newAds = [...(sub.ads || []), {
            ad_name: `Novo Anúncio ${ (sub.ads?.length || 0) + 1 }`,
            template_type: 'TEXT',
            message_mode: 'manual' as const,
            variables: []
        }];
        
        setSub({ ...sub, ads: newAds });
        setActiveAdIdx(newAds.length - 1);

        try {
            await dbService.updateClientSubmission(Number(id), { ads: newAds });
        } catch (err) {
            console.error("Error adding ad:", err);
            load();
        }
    };

    const handleDeleteAd = async (index: number) => {
        if (!sub || !sub.ads) return;
        if (!window.confirm("Deseja realmente excluir este anúncio?")) return;

        const newAds = sub.ads.filter((_, i) => i !== index);
        setSub({ ...sub, ads: newAds });
        if (activeAdIdx >= newAds.length) {
            setActiveAdIdx(Math.max(0, newAds.length - 1));
        }

        try {
            await dbService.updateClientSubmission(Number(id), { ads: newAds });
        } catch (err) {
            console.error("Error deleting ad:", err);
            load();
        }
    };

    const handleFileUpload = async (index: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                handleUpdateAd(index, 'media_url', data.url);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Erro ao fazer upload do arquivo.");
        }
    };

    const handleAddVariable = (index: number, variable: string) => {
        if (!variable.trim() || !sub || !sub.ads) return;
        const currentVars = sub.ads[index].variables || [];
        if (currentVars.includes(variable.trim())) return;
        handleUpdateAd(index, 'variables', [...currentVars, variable.trim()]);
    };

    const handleRemoveVariable = (index: number, varIndex: number) => {
        if (!sub || !sub.ads) return;
        const currentVars = sub.ads[index].variables || [];
        const newVars = currentVars.filter((_, i) => i !== varIndex);
        handleUpdateAd(index, 'variables', newVars);
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
            <button onClick={() => navigate(user?.role === 'CLIENT' ? '/client-dashboard' : '/client-submissions')} style={{ background: 'var(--primary-color)', color: '#000', padding: '10px 24px', borderRadius: '12px', border: 'none', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}>
                VOLTAR
            </button>
        </div>
    );

    const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG['PENDENTE'];
    const ads = sub.ads || [];
    const currentAd = ads[activeAdIdx];

    return (
        <div className="container-root" style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: '28px 24px' }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .control-card { 
                    background: rgba(255,255,255,0.02); 
                    border: 1px solid rgba(255,255,255,0.06); 
                    border-radius: 24px; 
                    padding: 24px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: fadeInUp 0.4s ease-out backwards;
                }
                .control-card:hover { 
                    background: rgba(255,255,255,0.03); 
                    border-color: rgba(255,255,255,0.1);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px -10px rgba(0,0,0,0.5);
                }

                .action-btn { padding: 12px 20px; border-radius: 14px; border: none; cursor: pointer; font-weight: 900; font-size: 11px; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; text-transform: uppercase; }
                .primary-btn { background: var(--primary-gradient); color: #000; box-shadow: 0 8px 20px -6px var(--primary); }
                .ghost-btn { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.08) !important; }
                .ghost-btn:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.2) !important; }
                
                .status-btn { 
                    width: 100%;
                    padding: 12px 16px; 
                    border-radius: 14px; 
                    border: 1px solid transparent; 
                    cursor: pointer; 
                    font-weight: 800; 
                    font-size: 10px; 
                    letter-spacing: 1px; 
                    transition: all 0.2s; 
                    display: flex; 
                    align-items: center; 
                    gap: 10px;
                    background: rgba(255,255,255,0.03);
                    color: rgba(255,255,255,0.4);
                    text-transform: uppercase;
                }
                .status-btn:hover:not(:disabled) { background: rgba(255,255,255,0.06); transform: translateX(4px); }
                .status-btn.active { background: var(--bg); color: var(--color); border-color: var(--border); }

                .ad-tab { padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.3); cursor: pointer; font-weight: 900; font-size: 10px; letter-spacing: 1px; transition: all 0.2s; text-transform: uppercase; }
                .ad-tab:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
                .ad-tab.active { background: rgba(172,248,0,0.1); border-color: var(--primary-color); color: var(--primary-color); box-shadow: 0 0 15px rgba(172,248,0,0.15); }

                .field-input { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; color: white; font-size: 14px; font-weight: 600; outline: none; transition: all 0.2s; box-sizing: border-box; }
                .field-input:focus { border-color: var(--primary-color); background: rgba(0,0,0,0.3); box-shadow: 0 0 20px rgba(172,248,0,0.1); }
                
                .field-label { font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
                .info-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
                
                .asset-link {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 18px;
                    text-decoration: none;
                    transition: all 0.3s;
                }
                .asset-link:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.12);
                    transform: scale(1.02);
                }

                @media (max-width: 1024px) {
                    .controls-wrapper { grid-template-columns: 1fr !important; }
                    .ad-analyzer-grid { grid-template-columns: 1fr !important; }
                    .header-content { flex-direction: column; align-items: flex-start !important; gap: 20px !important; }
                    .header-actions { width: 100%; justify-content: space-between; }
                }

                @media (max-width: 640px) {
                    .container-root { padding: 16px !important; }
                    .control-card { padding: 16px !important; }
                    .ad-tabs-container { flex-wrap: wrap; }
                    .header-profile-info { flex-direction: column; align-items: flex-start !important; }
                }

                @media print {
                    body { background: white !important; color: black !important; margin: 0; padding: 0; }
                    .container-root { padding: 0 !important; background: white !important; }
                    .header-actions, .controls-wrapper, button, .ad-tabs-container, input[type="date"]::-webkit-calendar-picker-indicator, nav, footer, .mobile-nav, [role="navigation"], .no-print { display: none !important; }
                    .ad-analyzer-grid { display: block !important; }
                    * { color: black !important; border-color: #eee !important; box-shadow: none !important; }
                    .field-input { background: white !important; color: black !important; border: none; padding: 0; }
                    .info-chip { border: 1px solid #ccc !important; }
                    .print-only { display: block !important; }
                }
                @media screen {
                    .print-only { display: none !important; }
                }
            `}</style>            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                {/* ── HEADER ── */}
                <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', gap: '24px' }}>
                    <div className="header-profile-info" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate(user?.role === 'CLIENT' ? '/client-dashboard' : '/client-submissions')} className="action-btn ghost-btn" style={{ width: 44, height: 44, padding: 0, flexShrink: 0 }}>
                            <ChevronLeft size={20} />
                        </button>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            {sub.profile_photo ? (
                                <img src={sub.profile_photo} alt="" style={{ width: 64, height: 64, borderRadius: '20px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                            ) : (
                                <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={32} style={{ opacity: 0.2 }} />
                                </div>
                            )}
                            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: '8px', background: statusCfg.color, border: '4px solid #020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle size={12} color="#000" />
                            </div>
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-1px' }}>{sub.profile_name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                                <span className="info-chip" style={{ background: 'rgba(172,248,0,0.1)', color: 'var(--primary-color)', border: '1px solid rgba(172,248,0,0.2)' }}>
                                    REGIONAL {sub.ddd}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} /> {new Date(sub.timestamp).toLocaleString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {sub.status === 'CONCLUIDO' && (
                            <button onClick={() => window.print()} className="action-btn ghost-btn" style={{ padding: '0 20px', height: 44, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Printer size={16} /> <span className="hide-mobile">RELATÓRIO PDF</span>
                            </button>
                        )}
                        <button onClick={load} className="action-btn ghost-btn" style={{ width: 44, height: 44, padding: 0 }}>
                            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <div className="info-chip" style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, padding: '10px 20px', fontSize: '12px' }}>
                            {statusCfg.label.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* ── CONTROL GRID ── */}
                <div className="controls-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                    
                    {/* CARD 1: STATUS & ACTIONS */}
                    <div className="control-card" style={{ animationDelay: '0.1s' }}>
                        <label className="field-label"><Zap size={14} /> Fluxo de Trabalho</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    className={`status-btn ${sub.status === key ? 'active' : ''}`}
                                    style={{ '--bg': cfg.bg, '--color': cfg.color, '--border': cfg.border } as any}
                                    onClick={() => handleStatusChange(key)}
                                    disabled={updatingStatus || sub.status === key}
                                >
                                    <CheckSquare size={14} /> {cfg.label}
                                    {sub.status === key && <CheckCircle size={14} style={{ marginLeft: 'auto' }} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CARD 2: CONFIGURAÇÃO DE TIME */}
                    <div className="control-card" style={{ animationDelay: '0.2s' }}>
                        <label className="field-label"><Smartphone size={14} /> Configuração de Entrega</label>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', marginBottom: '8px', display: 'block' }}>NÚMERO SENDER (BM)</label>
                                <div style={{ position: 'relative' }}>
                                    <input className="field-input" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="55..." />
                                    <button onClick={() => copyToClipboard(senderNumber, 'Sender')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', marginBottom: '8px', display: 'block' }}>NOTAS DO TIME</label>
                                <textarea className="field-input" value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ resize: 'none' }} placeholder="Anotações internas..." />
                            </div>
                            <button className="action-btn primary-btn" onClick={handleSaveSender} disabled={isSaving} style={{ width: '100%' }}>
                                {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                            </button>
                        </div>
                    </div>

                    {/* CARD 3: ATIVOS MASTER & RESPONSÁVEL */}
                    <div className="control-card" style={{ animationDelay: '0.3s' }}>
                        <label className="field-label"><Shield size={14} /> Ativos & Responsabilidade</label>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <User size={16} style={{ opacity: 0.3 }} />
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>Responsável:</span>
                                </div>
                                {user?.role === 'ADMIN' ? (
                                    <select
                                        value={sub.assigned_to || ''}
                                        onChange={e => handleAssignChange(e.target.value)}
                                        disabled={updatingAssign}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontSize: '12px', fontWeight: 900, outline: 'none', cursor: 'pointer', textAlign: 'right' }}
                                    >
                                        <option value="" style={{ background: '#0f172a', color: 'rgba(255,255,255,0.4)' }}>Não Atribuído</option>
                                        {employees.map(emp => (
                                            <option key={emp} value={emp} style={{ background: '#0f172a', color: 'white' }}>{emp}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary-color)' }}>{sub.assigned_to || sub.accepted_by || 'Aguardando'}</span>
                                )}
                            </div>

                            {sub.spreadsheet_url && (
                                <a href={sub.spreadsheet_url} target="_blank" rel="noreferrer" className="asset-link">
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileSpreadsheet size={20} color="#22c55e" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 900 }}>PLANILHA DE CONTATOS</p>
                                        <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>VER MASTER LIST</p>
                                    </div>
                                    <ExternalLink size={14} style={{ opacity: 0.3 }} />
                                </a>
                            )}

                            {sub.media_url && (
                                <a href={sub.media_url} target="_blank" rel="noreferrer" className="asset-link">
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ImageIcon size={20} color="#a855f7" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 900 }}>MÍDIA PRINCIPAL</p>
                                        <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>VISUALIZAR HEADER</p>
                                    </div>
                                    <ExternalLink size={14} style={{ opacity: 0.3 }} />
                                </a>
                            )}
                        </div>
                    </div>

                </div>

                {/* ── ADS ANALYZER ── */}
                <div className="control-card" style={{ animationDelay: '0.4s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                        <label className="field-label" style={{ marginBottom: 0 }}><Layers size={14} /> Navegador de Anúncios ({ads.length})</label>
                        <div className="ad-tabs-container" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {ads.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`ad-tab ${activeAdIdx === idx ? 'active' : ''}`}
                                    onClick={() => setActiveAdIdx(idx)}
                                >
                                    AD #{idx + 1}
                                </button>
                            ))}
                            {user?.role !== 'CLIENT' && (
                                <button onClick={handleAddAd} className="ad-tab" style={{ background: 'var(--primary-color)', color: '#000', padding: '10px' }}>
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {currentAd ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* MÉTRICAS E FATURAMENTO DO AD (Topo - Apenas Se Concluído) */}
                            {sub.status === 'CONCLUIDO' && (
                                <div style={{ background: 'rgba(255,255,255,0.015)', padding: '24px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <label className="field-label" style={{ marginBottom: 0 }}><Activity size={14} /> Desempenho e Faturamento da Campanha</label>
                                    </div>
                                    
                                    {user?.role === 'ADMIN' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Data do Disparo</p>
                                                <input type="date" className="field-input" style={{ padding: '10px', fontSize: '13px' }} value={currentAd.dispatch_date || ''} onChange={e => handleUpdateAd(activeAdIdx, 'dispatch_date', e.target.value)} />
                                            </div>
                                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Total de Leads Subidos</p>
                                                <input type="number" className="field-input" style={{ padding: '10px', fontSize: '13px' }} value={currentAd.total_leads || ''} onChange={e => handleUpdateAd(activeAdIdx, 'total_leads', Number(e.target.value))} />
                                            </div>
                                            <div style={{ padding: '16px', background: 'rgba(172,248,0,0.03)', borderRadius: '16px', border: '1px solid rgba(172,248,0,0.1)' }}>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '9px', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase' }}>Leads Entregues (Sucesso)</p>
                                                <input type="number" className="field-input" style={{ padding: '10px', fontSize: '13px' }} value={currentAd.delivered_leads || ''} onChange={e => handleUpdateAd(activeAdIdx, 'delivered_leads', Number(e.target.value))} />
                                            </div>
                                            <div style={{ padding: '16px', background: 'rgba(59,130,246,0.05)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.1)' }}>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '9px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase' }}>Cobrado por Msg (R$)</p>
                                                <input type="number" step="0.01" className="field-input" style={{ padding: '10px', fontSize: '13px' }} value={currentAd.price_per_msg || ''} onChange={e => handleUpdateAd(activeAdIdx, 'price_per_msg', Number(e.target.value))} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Relatório Final Visível para Admin + Client */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Clock size={20} color="rgba(255,255,255,0.4)" />
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>DISPARO</span>
                                            <span style={{ fontSize: '18px', fontWeight: 900, color: currentAd.dispatch_date ? '#fff' : 'rgba(255,255,255,0.3)' }}>{currentAd.dispatch_date ? new Date(currentAd.dispatch_date + 'T00:00:00').toLocaleDateString('pt-BR') : 'Aguardando'}</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Users size={20} color="rgba(255,255,255,0.4)" />
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>BASE QUANTIDADE</span>
                                            <span style={{ fontSize: '18px', fontWeight: 900 }}>{currentAd.total_leads ? currentAd.total_leads.toLocaleString('pt-BR') : 0} LEADS</span>
                                        </div>
                                        <div style={{ background: 'rgba(34,197,94,0.08)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                                            <CheckCircle size={20} color="#22c55e" />
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#22c55e', letterSpacing: '1px' }}>MENSAGENS ENTREGUES</span>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                                                <span style={{ fontSize: '24px', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>{currentAd.delivered_leads ? currentAd.delivered_leads.toLocaleString('pt-BR') : 0}</span>
                                                {currentAd.total_leads && currentAd.delivered_leads && (
                                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#22c55e', opacity: 0.8, marginBottom: '2px' }}>
                                                        ({((currentAd.delivered_leads / currentAd.total_leads) * 100).toFixed(1)}%)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {user?.role === 'ADMIN' && (
                                            <div className="no-print" style={{ background: 'rgba(239,68,68,0.08)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                <TrendingDown size={20} color="#ef4444" />
                                                <span style={{ fontSize: '10px', fontWeight: 900, color: '#ef4444', letterSpacing: '1px' }}>CUSTO AGÊNCIA (0,04/msg)</span>
                                                <span style={{ fontSize: '24px', fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>
                                                    <span style={{ fontSize: '14px' }}>R$</span> {((currentAd.delivered_leads || 0) * 0.04).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}

                                        <div style={{ background: 'rgba(172,248,0,0.1)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(172,248,0,0.3)', boxShadow: '0 8px 30px rgba(172,248,0,0.1)' }}>
                                            <TrendingUp size={20} color="var(--primary-color)" />
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '1px' }}>{user?.role === 'ADMIN' ? 'CUSTO DO CLIENTE' : 'INVESTIMENTO DA CAMPANHA'}</span>
                                            <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '-1px', lineHeight: 1 }}>
                                                <span style={{ fontSize: '16px' }}>R$</span> {((currentAd.delivered_leads || 0) * (currentAd.price_per_msg || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* NAVEGADOR E ANALYZER */}
                            <div className="ad-analyzer-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span className="no-print" style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '2px' }}>CONTEÚDO DA MENSAGEM</span>
                                        <span className="print-only" style={{ fontSize: '14px', fontWeight: 900, color: '#000', letterSpacing: '1px', textTransform: 'uppercase' }}>DADOS DA EMPRESA</span>
                                        <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => copyToClipboard(currentAd.ad_copy || '', 'Mensagem')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                                                <Copy size={16} />
                                            </button>
                                            {user?.role !== 'CLIENT' && (
                                                <button onClick={() => handleDeleteAd(activeAdIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Exibição Normal (Tela) */}
                                    <div className="no-print">
                                        {user?.role !== 'CLIENT' ? (
                                            <textarea 
                                                className="field-input"
                                                style={{ minHeight: '200px', fontSize: '14px', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', width: '100%' }}
                                                value={currentAd.ad_copy || ''}
                                                onChange={e => handleUpdateAd(activeAdIdx, 'ad_copy', e.target.value)}
                                                placeholder="Digite o texto do anúncio aqui..."
                                            />
                                        ) : (
                                            <div style={{ 
                                                padding: '16px', 
                                                borderRadius: '12px', 
                                                background: 'rgba(255,255,255,0.02)', 
                                                fontSize: '14px', 
                                                lineHeight: '1.8', 
                                                color: 'rgba(255,255,255,0.8)', 
                                                whiteSpace: 'pre-wrap',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                scrollbarWidth: 'thin'
                                            }}>
                                                {currentAd.ad_copy || 'Nenhum texto definido.'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Exibição na Impressão (PDF) */}
                                    <div className="print-only" style={{ fontSize: '16px', lineHeight: '1.8', color: '#000', fontWeight: 800, padding: '16px', border: '2px dashed #ccc', borderRadius: '12px', marginTop: '10px' }}>
                                        63140137000161 pix cnpj<br/>
                                        Plug e Sales Soluções digitais LTDA
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, opacity: 0.3, marginBottom: '6px' }}>TIPO DE TEMPLATE</p>
                                        {user?.role !== 'CLIENT' ? (
                                            <select 
                                                className="field-input"
                                                style={{ padding: '8px', fontSize: '12px', height: 'auto' }}
                                                value={currentAd.template_type || 'TEXT'}
                                                onChange={e => handleUpdateAd(activeAdIdx, 'template_type', e.target.value)}
                                            >
                                                <option value="TEXT">TEXTO</option>
                                                <option value="IMAGE">IMAGEM</option>
                                                <option value="VIDEO">VÍDEO</option>
                                                <option value="DOCUMENT">DOCUMENTO</option>
                                                <option value="LOCATION">LOCALIZAÇÃO</option>
                                            </select>
                                        ) : (
                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: 'var(--primary-color)' }}>{currentAd.template_type?.toUpperCase()}</p>
                                        )}
                                    </div>
                                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, opacity: 0.3, marginBottom: '6px' }}>MODO DE ENVIO</p>
                                        {user?.role !== 'CLIENT' ? (
                                            <select 
                                                className="field-input"
                                                style={{ padding: '8px', fontSize: '12px', height: 'auto' }}
                                                value={currentAd.message_mode || 'manual'}
                                                onChange={e => handleUpdateAd(activeAdIdx, 'message_mode', e.target.value)}
                                            >
                                                <option value="manual">MANUAL</option>
                                                <option value="upload">ARQUIVO / UPLOAD</option>
                                            </select>
                                        ) : (
                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 900 }}>{currentAd.message_mode === 'upload' ? 'ARQUIVO' : 'MANUAL'}</p>
                                        )}
                                    </div>
                                </div>

                                {user?.role !== 'CLIENT' && (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(currentAd.template_type || '')) && (
                                    <div style={{ padding: '16px', background: 'rgba(255,170,0,0.05)', borderRadius: '16px', border: '1px solid rgba(255,170,0,0.1)' }}>
                                        <label style={{ fontSize: '9px', fontWeight: 900, color: '#ffaa00', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Upload size={12} /> UPLOAD DE MÍDIA ({currentAd.template_type})
                                        </label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input 
                                                type="file" 
                                                id={`ad-file-${activeAdIdx}`}
                                                style={{ display: 'none' }} 
                                                onChange={e => e.target.files?.[0] && handleFileUpload(activeAdIdx, e.target.files[0])}
                                            />
                                            <button 
                                                onClick={() => document.getElementById(`ad-file-${activeAdIdx}`)?.click()}
                                                style={{ padding: '10px 16px', borderRadius: '10px', background: '#ffaa00', color: '#000', border: 'none', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <Upload size={14} /> SELECIONAR ARQUIVO
                                            </button>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <p style={{ margin: 0, fontSize: '11px', opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {currentAd.media_url || 'Nenhum arquivo enviado'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ padding: '16px', background: 'rgba(50,150,250,0.05)', borderRadius: '16px', border: '1px solid rgba(50,150,250,0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '9px', fontWeight: 900, color: '#3b82f6', opacity: 0.6 }}>LINK DO BOTÃO</label>
                                        {currentAd.button_link && (
                                            <button onClick={() => copyToClipboard(currentAd.button_link || '', 'Link')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                                                <Copy size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {user?.role !== 'CLIENT' ? (
                                        <input 
                                            className="field-input"
                                            style={{ padding: '10px', fontSize: '13px', borderStyle: 'dashed' }}
                                            value={currentAd.button_link || ''}
                                            onChange={e => handleUpdateAd(activeAdIdx, 'button_link', e.target.value)}
                                            placeholder="https://..."
                                        />
                                    ) : (
                                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentAd.button_link || 'Nenhum link'}</p>
                                    )}
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(172,248,0,0.03)', borderRadius: '16px', border: '1px solid rgba(172,248,0,0.1)' }}>
                                    <label style={{ fontSize: '9px', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                        <Smartphone size={12} /> NÚMERO SENDER (Deste Anúncio)
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            className="field-input" 
                                            style={{ padding: '12px 14px', fontSize: '13px' }}
                                            value={currentAd.sender_number || ''} 
                                            onChange={e => handleUpdateAd(activeAdIdx, 'sender_number', e.target.value)} 
                                            placeholder="Ex: 55..." 
                                            readOnly={user?.role === 'CLIENT'}
                                        />
                                        <button onClick={() => copyToClipboard(currentAd.sender_number || '', 'Sender Ad')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', display: 'block' }}>URL DA PLANILHA (OPCIONAL)</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {user?.role !== 'CLIENT' ? (
                                            <input 
                                                className="field-input"
                                                style={{ padding: '10px', fontSize: '13px', flex: 1 }}
                                                value={currentAd.spreadsheet_url || ''}
                                                onChange={e => handleUpdateAd(activeAdIdx, 'spreadsheet_url', e.target.value)}
                                                placeholder="Google Sheets URL..."
                                            />
                                        ) : (
                                            <p style={{ margin: 0, fontSize: '13px', opacity: 0.6, flex: 1 }}>{currentAd.spreadsheet_url || 'Nenhuma planilha'}</p>
                                        )}
                                        {currentAd.spreadsheet_url && (
                                            <a href={currentAd.spreadsheet_url} target="_blank" rel="noreferrer" style={{ color: '#22c55e', padding: '10px', background: 'rgba(34,197,94,0.1)', borderRadius: '10px' }} title="Abrir Planilha">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <label className="field-label" style={{ marginBottom: 0 }}>Variáveis ({currentAd.variables?.length || 0})</label>
                                        {user?.role !== 'CLIENT' && (
                                            <button 
                                                onClick={() => {
                                                    const name = window.prompt("Nome da nova variável (ex: NOME, VALOR):");
                                                    if (name) handleAddVariable(activeAdIdx, name);
                                                }}
                                                style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--primary-color)', border: 'none', color: '#000', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}
                                            >
                                                + ADICIONAR
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {currentAd.variables?.map((v, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                                                    {v}
                                                </span>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button 
                                                        onClick={() => copyToClipboard(v, `Variável ${v}`)}
                                                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', padding: 0 }}
                                                        title="Copiar"
                                                    >
                                                        <Copy size={12} />
                                                    </button>
                                                    {user?.role !== 'CLIENT' && (
                                                        <button 
                                                            onClick={() => handleRemoveVariable(activeAdIdx, i)}
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer', display: 'flex', padding: 0 }}
                                                            title="Remover"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {(!currentAd.variables || currentAd.variables.length === 0) && (
                                            <p style={{ margin: 0, fontSize: '11px', opacity: 0.3, padding: '10px' }}>Nenhuma variável definida para este AD.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ) : (
                        <div style={{ padding: '60px', textAlign: 'center', opacity: 0.2 }}>
                            <AlertCircle size={40} style={{ marginBottom: '12px' }} />
                            <p style={{ fontWeight: 800 }}>Selecione um anúncio para visualizar</p>
                        </div>
                    )}
                </div>

                {copyFeedback && (
                    <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: '#000', padding: '12px 24px', borderRadius: '16px', fontWeight: 900, fontSize: '13px', boxShadow: '0 10px 40px rgba(172,248,0,0.3)', zIndex: 9999, animation: 'fadeInUp 0.3s ease-out' }}>
                        ✓ {copyFeedback.toUpperCase()} COPIADO COM SUCESSO!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientSubmissionDetail;
