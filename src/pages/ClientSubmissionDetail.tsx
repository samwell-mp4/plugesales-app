import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
    XCircle,
    Activity,
    Printer,
    Link2,
    BarChart3,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';

interface Ad {
    ad_name?: string;
    template_type?: string;
    media_url?: string;
    ad_copy?: string;
    ad_copy_file?: string;
    message_mode?: 'manual' | 'upload';
    button_link?: string;
    original_button_link?: string;
    variables?: string[];
    spreadsheet_url?: string;
    sender_number?: string;
    dispatch_date?: string;
    total_leads?: number;
    delivered_leads?: number;
    clicks?: number;
    price_per_msg?: number;
    scheduled_at?: string;
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
    client_name?: string;
    user_id?: number | string;
    parent_id?: number | string;
    sender_number?: string;
    ads?: Ad[];
    ad_copy?: string;
    template_type?: string;
    media_url?: string;
    button_link?: string;
    original_button_link?: string;
    spreadsheet_url?: string;
    timestamp: string;
    notes?: string;
    logs?: any[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDENTE: { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    EM_ANDAMENTO: { label: 'Em andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    'EM ANDAMENTO': { label: 'Em andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    GERADO: { label: 'Gerado', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
    CANCELADO: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
    CONCLUIDO: { label: 'Disparo Concluído', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    'CONCLUÍDO': { label: 'Disparo Concluído', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    AGUARDANDO_APROVACAO_PAI: { label: 'Aguardando Aprovação Parceiro', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' }
};

const STATUS_DISPLAY_KEYS = ['PENDENTE', 'EM_ANDAMENTO', 'GERADO', 'CANCELADO', 'CONCLUIDO'];

const ClientSubmissionDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const reportRef = useRef<HTMLDivElement>(null);
    const [sub, setSub] = useState<Submission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [senderNumber, setSenderNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeAdIdx, setActiveAdIdx] = useState(0);
    const [notes, setNotes] = useState('');
    const [isNotifying, setIsNotifying] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [employees, setEmployees] = useState<string[]>([]);
    const [updatingAssign, setUpdatingAssign] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [titleVal, setTitleVal] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isUploadingReport, setIsUploadingReport] = useState(false);
    const [attachedReports, setAttachedReports] = useState<any[]>([]);
    const [reportsPage, setReportsPage] = useState(0);

    const load = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await dbService.getClientSubmissionById(Number(id));
            if (data && !data.error) {
                const isOwner = user?.id ? String(data.user_id) === String(user.id) : false;
                const isParent = user?.id ? String(data.parent_id) === String(user.id) : false;
                
                if (user?.role === 'CLIENT' && !isOwner && !isParent) {
                    navigate('/client-dashboard', { replace: true });
                    return;
                }
                setSub(data);
                setSenderNumber(data.sender_number || '');
                setNotes(data.notes || '');
                setTitleVal(data.profile_name || '');

                if (user?.role === 'ADMIN') {
                    const empData = await dbService.getEmployees();
                    setEmployees(empData);
                }

                const subReports = await dbService.getReports(undefined, Number(id));
                setAttachedReports(subReports || []);
            } else {
                setSub(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [id, user, navigate]);

    useEffect(() => { load(); }, [load]);

    const addLog = async (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        if (!sub) return;
        const newLog = {
            id: Date.now(),
            type,
            message,
            timestamp: new Date().toISOString(),
            author: user?.name || 'Sistema'
        };
        const updatedLogs = [...(sub.logs || []), newLog];
        setSub(prev => prev ? { ...prev, logs: updatedLogs } : null);
        try {
            await dbService.updateClientSubmission(Number(id), { logs: JSON.stringify(updatedLogs) });
        } catch (err) {
            console.error("Error adding log:", err);
        }
    };

    const handleSaveSender = async () => {
        if (!id) return;
        setIsSaving(true);
        try {
            await dbService.updateClientSubmission(Number(id), { 
                sender_number: senderNumber, 
                notes,
                profile_name: titleVal 
            });
            setIsEditingTitle(false);
            await addLog("Informações básicas atualizadas", 'success');
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
            await addLog(`Status alterado para: ${newStatus}`, 'info');
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
            await addLog(`Responsável alterado para: ${employeeName || 'Nenhum'}`, 'info');
            await load();
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingAssign(false);
        }
    };

    const handleParentApprove = async (approve: boolean) => {
        if (!id) return;
        setIsSaving(true);
        try {
            const res = await dbService.parentApproveSubmission(Number(id), approve);
            if (res.success) {
                await addLog(approve ? "Campanha aprovada pelo parceiro" : "Campanha reprovada pelo parceiro", approve ? 'success' : 'error');
                await load();
            }
        } catch (err) {
            console.error("Parent approval error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSubmission = async () => {
        if (!id || !window.confirm("Deseja realmente excluir esta campanha permanentemente?")) return;
        try {
            await dbService.deleteClientSubmission(Number(id));
            navigate('/client-dashboard', { replace: true });
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotifyWebhook = async () => {
        if (!sub || !reportRef.current) return;
        setIsNotifying(true);
        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            const dashboardUrl = `${window.location.origin}/client-submissions/${sub.id}`;
            pdf.link(60, 230, 90, 10, { url: dashboardUrl });

            const pdfBlob = pdf.output('blob');
            const file = new File([pdfBlob], `relatorio_disparo_${sub.id}.pdf`, { type: 'application/pdf' });

            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();
            const hostedUrl = uploadData.url || `${window.location.origin}${uploadData.path}`;

            const notifyTo = user?.notification_number || '';
            const webhookUrl = 'https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/0d60b5ac-b96d-40a8-b101-b7f7fcfc5469';
            const payload = {
                to: notifyTo,
                PDF: hostedUrl,
                mensagem: 'Seu disparo foi concluido com sucesso, veja o relatório completo em nosso PDF.',
                id: sub.id,
                cnpj: '63140137000161',
                razao_social: 'Plug e Sales Soluções digitais LTDA'
            };

            await fetch('/api/webhook-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUrl: webhookUrl, payload })
            });

            await addLog("Notificação de conclusão (PDF) enviada", 'success');
            alert("Notificação enviada com sucesso!");
        } catch (err) {
            console.error("Webhook error:", err);
        } finally {
            setIsNotifying(false);
        }
    };

    const handleGenerateShortlink = async () => {
        if (!sub) return;
        setIsGeneratingLink(true);
        try {
            const dashboardUrl = `${window.location.origin}/client-submissions/${sub.id}`;
            const res = await fetch('/api/shortener/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_url: dashboardUrl,
                    title: `Relatório de Disparo - ${sub.profile_name}`
                })
            });
            const data = await res.json();
            if (data.success && data.shortUrl) {
                copyToClipboard(data.shortUrl, 'Link Encurtador');
                await addLog("Link curto gerado", 'info');
            }
        } catch (err) {
            console.error("Link shortener error:", err);
        } finally {
            setIsGeneratingLink(false);
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
            console.error(err);
        }
    };

    const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !sub) return;
        setIsUploadingReport(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rawData = XLSX.utils.sheet_to_json(ws);
                const summary = {
                    total: rawData.length,
                    delivered: rawData.filter((r: any) => String(r.Status || r.status || '').toLowerCase().includes('delivered')).length,
                    expired: rawData.filter((r: any) => String(r.Status || r.status || '').toLowerCase().includes('expired')).length,
                    others: 0
                };
                summary.others = summary.total - summary.delivered - summary.expired;
                const res = await dbService.addReport({
                    userId: Number(sub.user_id),
                    submissionId: sub.id,
                    reportName: `Relatório: ${file.name}`,
                    filename: file.name,
                    data: rawData,
                    summary: summary
                });
                if (res.id) {
                    await load();
                    await addLog(`Relatório anexado: ${file.name}`, 'success');
                }
            } catch (err) { console.error(err); } finally { setIsUploadingReport(false); }
        };
        reader.readAsBinaryString(file);
    };

    const handleDeleteReport = async (reportId: number) => {
        if (!window.confirm("Deseja realmente excluir este relatório?")) return;
        try {
            await dbService.deleteReport(reportId);
            await load();
            await addLog("Relatório removido", 'error');
        } catch (err) { console.error(err); }
    };

    const aggregatedStats = useMemo(() => {
        return attachedReports.reduce((acc, r) => {
            const s = r.summary || {};
            acc.total += (s.total || 0);
            acc.delivered += (s.delivered || 0);
            acc.expired += (s.expired || 0);
            acc.others += (s.others || 0);
            acc.clicks += (s.clicks || 0);
            return acc;
        }, { total: 0, delivered: 0, expired: 0, others: 0, clicks: 0 });
    }, [attachedReports]);

    const handleDownloadNonDelivered = async (report: any) => {
        if (!report || !report.data) return;
        try {
            const nonDelivered = report.data.filter((row: any) => {
                const statusProp = String(row.Status || row.status || row.SITUAÇÃO || row.SITUACAO || '').toLowerCase();
                return !(statusProp.includes('delivered') || statusProp.includes('entregue') || statusProp.includes('sucesso'));
            });
            const ws = XLSX.utils.json_to_sheet(nonDelivered);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Nao Entregues");
            XLSX.writeFile(wb, `nao_entregues_${report.filename || 'relatorio'}.xlsx`);
        } catch (err) { console.error(err); }
    };

    const handleAddVariable = (index: number, variable: string) => {
        if (!variable.trim() || !sub?.ads) return;
        const currentVars = sub.ads[index].variables || [];
        if (currentVars.includes(variable.trim())) return;
        handleUpdateAd(index, 'variables', [...currentVars, variable.trim()]);
    };

    const handleRemoveVariable = (index: number, varIndex: number) => {
        if (!sub?.ads) return;
        const currentVars = sub.ads[index].variables || [];
        handleUpdateAd(index, 'variables', currentVars.filter((_, i) => i !== varIndex));
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopyFeedback(label);
        setTimeout(() => setCopyFeedback(''), 2000);
    };


    if (isLoading) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div className="animate-spin" style={{ width: 48, height: 48, border: '3px solid rgba(172,248,0,0.15)', borderTopColor: 'var(--primary-color)', borderRadius: '50%' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '2px' }}>CARREGANDO...</span>
        </div>
    );

    if (!sub) return null;

    const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG['PENDENTE'];
    const currentAd = (sub.ads || [])[activeAdIdx];

    return (
        <div className="container-root">
            
            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                {/* HEADER */}
                <div className="detail-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate(-1)} className="action-btn ghost-btn" style={{ width: 44, height: 44, padding: 0 }}><ChevronLeft size={20} /></button>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            {sub.profile_photo ? (
                                <img src={sub.profile_photo} alt="" style={{ width: 64, height: 64, borderRadius: '20px', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'var(--card-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={32} style={{ opacity: 0.2 }} /></div>
                            )}
                            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: '8px', background: statusCfg.color, border: '4px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={12} color="#000" /></div>
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            {isEditingTitle ? (
                                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                    <input className="field-input" value={titleVal} onChange={e => setTitleVal(e.target.value)} style={{ fontSize: '1.5rem', fontWeight: 900, minWidth: 0, flex: 1 }} autoFocus />
                                    <button onClick={handleSaveSender} className="action-btn primary-btn" style={{ padding: '8px', width: 40 }}><CheckCircle size={18} /></button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-1px', wordBreak: 'break-word' }}>{sub.profile_name}</h1>
                                    <button onClick={() => setIsEditingTitle(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></button>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                                <span className="info-chip" style={{ background: 'rgba(172,248,0,0.1)', color: 'var(--primary-color)' }}>REGIONAL {sub.ddd}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {new Date(sub.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {(String(sub.user_id) === String(user?.id) || String(sub.parent_id) === String(user?.id)) && (
                            <button onClick={handleDeleteSubmission} className="action-btn ghost-btn" style={{ color: '#ef4444', width: 44, height: 44, padding: 0 }} title="Excluir"><Trash2 size={18} /></button>
                        )}
                        {(sub.status === 'CONCLUIDO' || sub.status === 'CONCLUÍDO') && (
                            <>
                                <button onClick={handleGenerateShortlink} className="action-btn ghost-btn" style={{ padding: '0 20px', height: 44 }}><Link2 size={16} /> <span className="hide-mobile">LINK CURTO</span></button>
                                <button onClick={() => window.print()} className="action-btn ghost-btn" style={{ padding: '0 20px', height: 44 }}><Printer size={16} /> <span className="hide-mobile">RELATÓRIO PDF</span></button>
                            </>
                        )}
                        <button onClick={load} className="action-btn ghost-btn" style={{ width: 44, height: 44, padding: 0 }}><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                        <div className="info-chip" style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, padding: '10px 20px', minWidth: '140px', justifyContent: 'center' }}>{statusCfg.label.toUpperCase()}</div>
                    </div>
                </div>

                {/* PARENT APPROVAL BANNER */}
                {sub.status === 'AGUARDANDO_APROVACAO_PAI' && (user?.id && String(sub.parent_id) === String(user.id)) && (
                    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        <div style={{ marginBottom: '32px', padding: '32px', background: 'rgba(172,248,0,0.02)', borderRadius: '24px', border: '1px solid rgba(172,248,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: 60, height: 60, borderRadius: '20px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                                    <Zap size={32} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-1px' }}>Aprovação <span style={{ color: '#f59e0b' }}>Pendente</span></h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ESTA CAMPANHA AGUARDA SUA VALIDAÇÃO PARA SER ENVIADA AO ADMIN</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    onClick={() => handleParentApprove(true)} 
                                    className="action-btn ghost-btn" 
                                    style={{ height: 52, padding: '0 32px', borderColor: '#22c55e', color: '#22c55e', background: 'rgba(34,197,94,0.05)', fontSize: '11px' }}
                                    disabled={isSaving}
                                >
                                    <CheckCircle2 size={18} /> APROVAR AGORA
                                </button>
                                <button 
                                    onClick={() => handleParentApprove(false)} 
                                    className="action-btn ghost-btn" 
                                    style={{ height: 52, padding: '0 32px', borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.05)', fontSize: '11px' }}
                                    disabled={isSaving}
                                >
                                    <XCircle size={18} /> REPROVAR
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTROL GRID */}
                <div className="controls-wrapper">
                    
                    {/* STATUS */}
                    <div className="control-card">
                        <label className="field-label"><Zap size={14} /> FLUXO DE TRABALHO</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                            {STATUS_DISPLAY_KEYS.map(key => (
                                <button key={key} className={`status-btn ${sub.status === key ? 'active' : ''}`} style={{ '--bg': STATUS_CONFIG[key].bg, '--color': STATUS_CONFIG[key].color, '--border': STATUS_CONFIG[key].border } as any} onClick={() => handleStatusChange(key)} disabled={user?.role === 'CLIENT'}>
                                    <CheckSquare size={14} /> {STATUS_CONFIG[key].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CONFIG */}
                    <div className="control-card">
                        <label className="field-label"><Smartphone size={14} /> CONFIGURAÇÃO BASE</label>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="field-label" style={{ fontSize: '9px' }}>NÚMERO SENDER (MASTER)</label>
                                <div style={{ position: 'relative' }}>
                                    <input className="field-input" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} readOnly={user?.role === 'CLIENT'} />
                                    <button onClick={() => copyToClipboard(senderNumber, 'Sender')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', opacity: 0.4 }}><Copy size={16} /></button>
                                </div>
                            </div>
                            <div>
                                <label className="field-label" style={{ fontSize: '9px' }}>OBSERVAÇÕES DO TIME</label>
                                <textarea className="field-input" value={notes} onChange={e => setNotes(e.target.value)} rows={2} readOnly={user?.role === 'CLIENT'} />
                            </div>
                            {user?.role !== 'CLIENT' && (
                                <button className="action-btn primary-btn" onClick={handleSaveSender} style={{ width: '100%' }}>{isSaving ? <RefreshCw className="animate-spin" size={16} /> : 'SALVAR ALTERAÇÕES'}</button>
                            )}
                        </div>
                    </div>

                    {/* REPORTS/ASSETS */}
                    <div className="control-card">
                        <label className="field-label"><Shield size={14} /> ATIVOS & RESPONSABILIDADE</label>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '12px 16px', background: 'var(--card-bg-subtle)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: 800 }}>Responsável:</span>
                                {user?.role === 'ADMIN' ? (
                                    <select value={sub.assigned_to || ''} onChange={e => handleAssignChange(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontWeight: 900 }}>
                                        <option value="">Não Atribuído</option>
                                        {employees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                                    </select>
                                ) : <span style={{ color: 'var(--primary-color)', fontWeight: 900 }}>{sub.assigned_to || 'Aguardando'}</span>}
                            </div>

                            {sub.media_url && (
                                <a href={sub.media_url} target="_blank" rel="noreferrer" className="asset-link">
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ImageIcon size={20} color="#a855f7" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '11px', fontWeight: 900 }}>MÍDIA PRINCIPAL</p>
                                        <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>VISUALIZAR HEADER</p>
                                    </div>
                                    <ExternalLink size={14} style={{ opacity: 0.3 }} />
                                </a>
                            )}

                            {sub.spreadsheet_url && (
                                <a href={sub.spreadsheet_url} target="_blank" rel="noreferrer" className="asset-link">
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}><FileSpreadsheet size={20} /></div>
                                    <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: '11px', fontWeight: 900 }}>URL DA PLANILHA</p></div>
                                    <ExternalLink size={14} style={{ opacity: 0.3 }} />
                                </a>
                            )}

                            {attachedReports.slice(reportsPage * 2, (reportsPage + 1) * 2).map(rep => (
                                <div key={rep.id} className="asset-link" style={{ cursor: 'default' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><BarChart3 size={20} /></div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '10px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{rep.filename}</p>
                                        <p style={{ margin: 0, fontSize: '9px', color: '#10b981', fontWeight: 800 }}>{rep.summary?.delivered || 0} ENTREGUES</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleDownloadNonDelivered(rep)} style={{ background: 'none', border: 'none', color: '#f97316' }}><FileSpreadsheet size={16} /></button>
                                        {user?.role !== 'CLIENT' && <button onClick={() => handleDeleteReport(rep.id)} style={{ background: 'none', border: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>}
                                    </div>
                                </div>
                            ))}

                            {attachedReports.length > 2 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                                    <button 
                                        disabled={reportsPage === 0}
                                        onClick={() => setReportsPage(prev => Math.max(0, prev - 1))}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border-subtle)', color: reportsPage === 0 ? 'rgba(255,255,255,0.2)' : 'var(--text-primary)', borderRadius: '8px', padding: '4px 8px', cursor: reportsPage === 0 ? 'default' : 'pointer', fontSize: '10px', fontWeight: 900 }}
                                    >
                                        &lt;
                                    </button>
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)' }}>{reportsPage + 1} / {Math.ceil(attachedReports.length / 2)}</span>
                                    <button 
                                        disabled={(reportsPage + 1) * 2 >= attachedReports.length}
                                        onClick={() => setReportsPage(prev => prev + 1)}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border-subtle)', color: (reportsPage + 1) * 2 >= attachedReports.length ? 'rgba(255,255,255,0.2)' : 'var(--text-primary)', borderRadius: '8px', padding: '4px 8px', cursor: (reportsPage + 1) * 2 >= attachedReports.length ? 'default' : 'pointer', fontSize: '10px', fontWeight: 900 }}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}

                            {user?.role !== 'CLIENT' && (sub.status === 'CONCLUIDO' || sub.status === 'CONCLUÍDO') && (
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', borderRadius: '16px', border: '2px dashed var(--surface-border-subtle)', cursor: 'pointer' }} className="ghost-btn">
                                    <input type="file" style={{ display: 'none' }} onChange={handleReportUpload} accept=".xlsx,.xls,.csv" />
                                    <Upload size={18} /> <span style={{ fontSize: '11px', fontWeight: 900 }}>ANEXAR RELATÓRIO</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* AD ANALYZER */}
                <div className="control-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <label className="field-label" style={{ marginBottom: 0 }}><Layers size={14} /> ANALISADOR DE ADS</label>
                        <div className="ad-tabs-container" style={{ display: 'flex', gap: '8px' }}>
                            {(sub.ads || []).map((_, idx) => (
                                <button key={idx} className={`ad-tab ${activeAdIdx === idx ? 'active' : ''}`} onClick={() => setActiveAdIdx(idx)}>AD {idx + 1}</button>
                            ))}
                        </div>
                    </div>

                    {currentAd ? (
                        <div className="ad-analyzer-grid">
                            {/* COL LEFT */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid var(--surface-border-subtle)' }}>
                                    <label className="field-label"><Activity size={14} /> PERFORMANCE AGREGADA</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div style={{ padding: '20px', background: 'rgba(16,185,129,0.05)', borderRadius: '20px' }}>
                                            <p style={{ margin: 0, fontSize: '10px', color: '#10b981' }}>MENSAGENS ENTREGUES</p>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 900, color: '#10b981' }}>{(attachedReports.length > 0 ? aggregatedStats.delivered : (currentAd.delivered_leads || 0)).toLocaleString()}</p>
                                        </div>
                                        <div style={{ padding: '20px', background: 'rgba(172,248,0,0.05)', borderRadius: '20px' }}>
                                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--primary-color)' }}>VALOR TOTAL FINAL</p>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 900, color: 'var(--primary-color)' }}>R$ {((attachedReports.length > 0 ? aggregatedStats.delivered : (currentAd.delivered_leads || 0)) * (currentAd.price_per_msg || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid var(--surface-border-subtle)', flex: 1 }}>
                                    <label className="field-label"><FileText size={14} /> TEXTO DO ANÚNCIO (COPY)</label>
                                    <div style={{ position: 'relative', marginTop: '16px', minHeight: '300px' }}>
                                        {user?.role !== 'CLIENT' ? (
                                            <textarea className="field-input" style={{ minHeight: '300px', resize: 'vertical' }} value={currentAd.ad_copy || ''} onChange={e => handleUpdateAd(activeAdIdx, 'ad_copy', e.target.value)} />
                                        ) : (
                                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', whiteSpace: 'pre-wrap' }}>{currentAd.ad_copy || 'Nenhum texto definido.'}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* COL RIGHT - RESTORED FIELDS AS REQUESTED */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ padding: '16px', background: 'var(--card-bg-subtle)', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)' }}>
                                        <label className="field-label" style={{ fontSize: '9px' }}>TIPO DE TEMPLATE</label>
                                        {user?.role !== 'CLIENT' ? (
                                            <select className="field-input" style={{ padding: '8px', height: 'auto' }} value={currentAd.template_type || 'TEXT'} onChange={e => handleUpdateAd(activeAdIdx, 'template_type', e.target.value)}>
                                                <option value="TEXT">TEXTO</option>
                                                <option value="IMAGE">IMAGEM</option>
                                                <option value="VIDEO">VÍDEO</option>
                                            </select>
                                        ) : <p style={{ margin: 0, fontWeight: 900 }}>{currentAd.template_type?.toUpperCase()}</p>}
                                    </div>
                                    <div style={{ padding: '16px', background: 'var(--card-bg-subtle)', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)' }}>
                                        <label className="field-label" style={{ fontSize: '9px' }}>MODO DE ENVIO</label>
                                        {user?.role !== 'CLIENT' ? (
                                            <select className="field-input" style={{ padding: '8px', height: 'auto' }} value={currentAd.message_mode || 'manual'} onChange={e => handleUpdateAd(activeAdIdx, 'message_mode', e.target.value)}>
                                                <option value="manual">MANUAL</option>
                                                <option value="upload">ARQUIVO / UPLOAD</option>
                                            </select>
                                        ) : <p style={{ margin: 0, fontWeight: 900 }}>{currentAd.message_mode === 'upload' ? 'ARQUIVO' : 'MANUAL'}</p>}
                                    </div>
                                </div>

                                <div style={{ padding: '16px', background: 'var(--card-bg-subtle)', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)', borderLeft: '4px solid #3b82f6', overflow: 'hidden' }}>
                                    <label className="field-label" style={{ fontSize: '9px', color: '#3b82f6' }}>LINK DO BOTÃO</label>
                                    {user?.role !== 'CLIENT' ? (
                                        <input className="field-input" style={{ borderStyle: 'dashed' }} value={currentAd.button_link || ''} onChange={e => handleUpdateAd(activeAdIdx, 'button_link', e.target.value)} />
                                    ) : <p className="break-word" style={{ margin: 0, fontWeight: 900 }}>{currentAd.button_link || 'Nenhum'}</p>}
                                </div>

                                <div style={{ padding: '16px', background: 'var(--card-bg-subtle)', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)', borderLeft: '4px solid #ffaa00', overflow: 'hidden' }}>
                                    <label className="field-label" style={{ fontSize: '9px', color: '#ffaa00' }}>LINK ORIGINAL (SEM ENCURTAR)</label>
                                    {user?.role !== 'CLIENT' ? (
                                        <input className="field-input" style={{ borderStyle: 'dashed' }} value={currentAd.original_button_link || ''} onChange={e => handleUpdateAd(activeAdIdx, 'original_button_link', e.target.value)} />
                                    ) : <p className="break-word" style={{ margin: 0, fontWeight: 900 }}>{currentAd.original_button_link || 'Nenhum'}</p>}
                                </div>

                                <div style={{ padding: '16px', background: 'var(--card-bg-subtle)', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)', borderLeft: '4px solid var(--primary-color)' }}>
                                    <label className="field-label" style={{ fontSize: '9px', color: 'var(--primary-color)' }}>NÚMERO SENDER (DESTE AD)</label>
                                    <input className="field-input" value={currentAd.sender_number || ''} onChange={e => handleUpdateAd(activeAdIdx, 'sender_number', e.target.value)} readOnly={user?.role === 'CLIENT'} />
                                </div>

                                <div style={{ padding: '16px', background: 'var(--card-bg-subtle)', borderRadius: '24px', border: '1px solid var(--surface-border-subtle)' }}>
                                    <label className="field-label">VARIÁVEIS ({currentAd.variables?.length || 0})</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                        {currentAd.variables?.map((v, i) => {
                                            const isOwner = String(sub.user_id) === String(user?.id);
                                            const isParent = String(sub.parent_id) === String(user?.id);
                                            const canEdit = user?.role !== 'CLIENT' || isParent;

                                            return (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--surface-border-subtle)', minWidth: '60px' }}>
                                                    {canEdit ? (
                                                        <input 
                                                            style={{ 
                                                                background: 'transparent', 
                                                                border: 'none', 
                                                                color: 'var(--text-primary)', 
                                                                fontSize: '11px', 
                                                                fontWeight: 700, 
                                                                width: 'auto',
                                                                maxWidth: '120px',
                                                                outline: 'none',
                                                                padding: 0
                                                            }}
                                                            value={v}
                                                            onChange={(e) => {
                                                                const newVars = [...(currentAd.variables || [])];
                                                                newVars[i] = e.target.value;
                                                                handleUpdateAd(activeAdIdx, 'variables', newVars);
                                                            }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '11px', fontWeight: 700 }}>{v}</span>
                                                    )}
                                                    {canEdit && (
                                                        <button onClick={() => handleRemoveVariable(activeAdIdx, i)} style={{ background: 'none', border: 'none', color: '#ef4444', padding: 0, opacity: 0.6, cursor: 'pointer' }}>
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {(user?.role !== 'CLIENT' || (String(sub.parent_id) === String(user?.id))) && (
                                            <button onClick={() => { const n = window.prompt("Nome da Variável:"); if(n) handleAddVariable(activeAdIdx, n); }} style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--primary-color)', border: 'none', color: '#000', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>+ ADD</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : <div style={{ padding: '60px', textAlign: 'center', opacity: 0.2 }}><AlertCircle size={40} /><p>Selecione um AD</p></div>}
                </div>

                {copyFeedback && (
                    <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: '#000', padding: '12px 24px', borderRadius: '16px', fontWeight: 900, fontSize: '13px', zIndex: 9999 }}>
                        ✓ {copyFeedback.toUpperCase()} COPIADO!
                    </div>
                )}
            </div>

            {/* HIDDEN REPORT FOR PDF */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div ref={reportRef} style={{ width: '800px', padding: '60px', background: '#fff', color: '#000', fontFamily: 'Arial' }}>
                    <div style={{ borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                        <h1>RELATÓRIO DE DISPARO</h1>
                        <p>#{sub.id} - {sub.profile_name}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
                            <p style={{ fontSize: '10px' }}>CAMPANHA</p>
                            <p style={{ fontSize: '16px', fontWeight: 800 }}>{sub.profile_name}</p>
                        </div>
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
                            <p style={{ fontSize: '10px' }}>ENTREGUES</p>
                            <p style={{ fontSize: '24px', fontWeight: 900 }}>{aggregatedStats.delivered}</p>
                        </div>
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
                            <p style={{ fontSize: '10px' }}>TOTAL FINAL</p>
                            <p style={{ fontSize: '24px', fontWeight: 900 }}>R$ {(aggregatedStats.delivered * (currentAd?.price_per_msg || 0)).toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientSubmissionDetail;
