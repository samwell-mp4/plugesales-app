import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
    Activity,
    Users,
    TrendingDown,
    TrendingUp,
    Printer,
    Link2,
    BarChart3,
    Mail,
    Building2
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
    const [subClients, setSubClients] = useState<any[]>([]);
    const [isSubClientsLoading, setIsSubClientsLoading] = useState(false);

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
            console.error(err);
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
            await addLog(`Status alterado: ${newStatus}`, 'info');
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
            await addLog(`Responsável alterado: ${employeeName || 'Nenhum'}`, 'info');
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
            console.error(err);
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
            const file = new File([pdfBlob], `relatorio_${sub.id}.pdf`, { type: 'application/pdf' });

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
                mensagem: 'Seu disparo foi concluido com sucesso, veja o relátorio completo em nosso PDF.',
                id: sub.id,
                cnpj: '63140137000161',
                razao_social: 'Plug e Sales Soluções digitais LTDA'
            };

            await fetch('/api/webhook-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUrl: webhookUrl, payload })
            });

            await addLog("Notificação PDF enviada para WhatsApp", 'success');
            alert("Notificação enviada com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao notificar.");
        } finally {
            setIsNotifying(false);
        }
    };

    const handleGenerateShortlink = async () => {
        if (!sub) return;
        setIsGeneratingLink(true);
        try {
            const dashboardUrl = /^https?:\/\//i.test(window.location.origin) ? `${window.location.origin}/client-submissions/${sub.id}` : `https://${window.location.origin}/client-submissions/${sub.id}`;
            const res = await fetch('/api/shortener/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ original_url: dashboardUrl, title: `Relatório - ${sub.profile_name}` })
            });
            const data = await res.json();
            if (data.success && data.shortUrl) {
                navigator.clipboard.writeText(data.shortUrl);
                setCopyFeedback('Link Curto');
                setTimeout(() => setCopyFeedback(''), 2000);
                await addLog("Link curto gerado", 'info');
            }
        } catch (err) {
            console.error(err);
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

    const handleAddAd = async () => {
        if (!sub) return;
        const newAds = [...(sub.ads || []), {
            ad_name: `Novo Anúncio ${(sub.ads?.length || 0) + 1}`,
            template_type: 'TEXT',
            message_mode: 'manual' as const,
            variables: []
        }];
        setSub({ ...sub, ads: newAds });
        setActiveAdIdx(newAds.length - 1);
        try {
            await dbService.updateClientSubmission(Number(id), { ads: newAds });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteAd = async (index: number) => {
        if (!sub || !sub.ads || !window.confirm("Excluir este anúncio?")) return;
        const newAds = sub.ads.filter((_, i) => i !== index);
        setSub({ ...sub, ads: newAds });
        if (activeAdIdx >= newAds.length) setActiveAdIdx(Math.max(0, newAds.length - 1));
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
                const rawData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

                if (rawData.length === 0) {
                    alert("Arquivo vazio.");
                    setIsUploadingReport(false);
                    return;
                }

                const getStatusProp = (row: any) => {
                    const statusVal = String(row.Status || row.status || row.SITUAÇÃO || row.SITUACAO || row.situação || row.situacao || row['Status do Envio'] || '').toLowerCase();
                    if (statusVal.includes('delivered') || statusVal.includes('entregue') || statusVal.includes('sucesso') || statusVal.includes('ok')) return 'delivered';
                    if (statusVal.includes('expired') || statusVal.includes('expirado') || statusVal.includes('falha') || statusVal.includes('erro')) return 'expired';
                    return 'other';
                };

                const summary = {
                    total: rawData.length,
                    delivered: rawData.filter((r: any) => getStatusProp(r) === 'delivered').length,
                    expired: rawData.filter((r: any) => getStatusProp(r) === 'expired').length,
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
                    await addLog(`Relatório anexado: ${file.name}`, 'success');
                    await load();
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsUploadingReport(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDeleteReport = async (reportId: number) => {
        if (!window.confirm("Excluir este relatório?")) return;
        try {
            await dbService.deleteReport(reportId);
            await load();
            await addLog("Relatório removido", 'error');
        } catch (err) {
            console.error(err);
        }
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
                const statusProp = String(row.Status || row.status || row.SITUAÇÃO || row.SITUACAO || row.situação || row.situacao || row['Status do Envio'] || '').toLowerCase();
                return !(statusProp.includes('delivered') || statusProp.includes('entregue') || statusProp.includes('sucesso') || statusProp.includes('ok'));
            });
            if (nonDelivered.length === 0) return alert("Sem leads não entregues.");
            const ws = XLSX.utils.json_to_sheet(nonDelivered);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Nao Entregues");
            XLSX.writeFile(wb, `nao_entregues_${report.filename || 'relatorio'}.xlsx`);
        } catch (err) {
            console.error(err);
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

    const handleFileUpload = async (index: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = response.ok ? await response.json() : null;
            if (data?.success) {
                handleUpdateAd(index, 'media_url', data.url);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopyFeedback(label);
        setTimeout(() => setCopyFeedback(''), 2000);
    };

    const ensureProtocol = (url: string) => {
        if (!url) return '';
        const trimmed = url.trim();
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    };

    if (isLoading) return <div className="loading-screen">Carregando...</div>;
    if (!sub) return <div className="error-screen">Submissão não encontrada.</div>;

    const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG['PENDENTE'];
    const currentAd = (sub.ads || [])[activeAdIdx];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '28px 24px' }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .control-card { 
                    background: var(--card-bg-subtle); 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 24px; 
                    padding: 24px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: fadeInUp 0.4s ease-out backwards;
                }
                .control-card:hover { 
                    background: var(--bg-primary); 
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px -10px rgba(0,0,0,0.1);
                }

                .action-btn { padding: 12px 20px; border-radius: 14px; border: none; cursor: pointer; font-weight: 900; font-size: 11px; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; text-transform: uppercase; }
                .primary-btn { background: var(--primary-gradient); color: #000; box-shadow: 0 8px 20px -6px var(--primary); }
                .ghost-btn { background: var(--card-bg-subtle); color: var(--text-muted); border: 1px solid var(--surface-border-subtle) !important; }
                .ghost-btn:hover { background: var(--bg-primary); color: var(--text-primary); border-color: var(--primary-color) !important; }
                
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
                    background: var(--card-bg-subtle);
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                .status-btn:hover:not(:disabled) { background: var(--bg-primary); transform: translateX(4px); }
                .status-btn.active { background: var(--bg); color: var(--color); border-color: var(--border); }

                .ad-tab { padding: 10px 18px; border-radius: 12px; border: 1px solid var(--surface-border-subtle); background: var(--card-bg-subtle); color: var(--text-muted); cursor: pointer; font-weight: 900; font-size: 10px; letter-spacing: 1px; transition: all 0.2s; text-transform: uppercase; }
                .ad-tab:hover { background: var(--bg-primary); color: var(--text-primary); }
                .ad-tab.active { background: rgba(172,248,0,0.1); border-color: var(--primary-color); color: var(--primary-color); box-shadow: 0 0 15px rgba(172,248,0,0.15); }

                .field-input { width: 100%; background: var(--bg-primary); border: 1px solid var(--surface-border-subtle); border-radius: 16px; padding: 16px; color: var(--text-primary); font-size: 14px; font-weight: 600; outline: none; transition: all 0.2s; box-sizing: border-box; }
                .field-input:focus { border-color: var(--primary-color); background: var(--bg-primary); box-shadow: 0 0 20px rgba(172,248,0,0.1); }
                
                .field-label { font-size: 10px; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
                .info-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
                
                .asset-link {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle);
                    border-radius: 18px;
                    text-decoration: none;
                    transition: all 0.3s;
                }
                .asset-link:hover {
                    background: var(--bg-primary);
                    border-color: var(--primary-color);
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
            `}</style>
            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
                
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate(-1)} className="action-btn ghost-btn" style={{ width: 44, height: 44, padding: 0 }}><ChevronLeft /></button>
                        <div style={{ position: 'relative' }}>
                            {sub.profile_photo ? <img src={sub.profile_photo} style={{ width: 64, height: 64, borderRadius: '20px', objectFit: 'cover' }} alt="" /> : <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'var(--card-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User opacity={0.2} /></div>}
                        </div>
                        <div>
                            {isEditingTitle ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input className="field-input" value={titleVal} onChange={e => setTitleVal(e.target.value)} autoFocus style={{ fontSize: '1.5rem', fontWeight: 900, padding: '4px 12px' }} />
                                    <button onClick={handleSaveSender} className="action-btn primary-btn" style={{ padding: '8px' }}><CheckCircle size={18} /></button>
                                </div>
                            ) : (
                                <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.8rem', cursor: 'pointer' }} onClick={() => setIsEditingTitle(true)}>{sub.profile_name}</h1>
                            )}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <span className="info-chip" style={{ background: 'rgba(172,248,0,0.1)', color: 'var(--primary-color)' }}>{sub.ddd}</span>
                                <span style={{ opacity: 0.5, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(sub.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {(String(sub.user_id) === String(user?.id) || String(sub.parent_id) === String(user?.id)) && (
                            <button onClick={handleDeleteSubmission} className="action-btn ghost-btn" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                        )}
                        {(sub.status === 'CONCLUIDO' || sub.status === 'CONCLUÍDO') && (
                            <button onClick={handleGenerateShortlink} className="action-btn ghost-btn"><Link2 size={16} /> ENCURTAR</button>
                        )}
                        <span className="info-chip" style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>{statusCfg.label}</span>
                    </div>
                </div>

                {/* CONTENT GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    {/* COL 1: FLOW */}
                    <div className="control-card">
                        <label className="field-label"><Zap size={14} /> FLUXO</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                            {STATUS_DISPLAY_KEYS.map(key => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(key)}
                                    className={`status-btn ${sub.status.replace(' ','_') === key ? 'active' : ''}`}
                                    style={sub.status.replace(' ','_') === key ? { background: STATUS_CONFIG[key].bg, color: STATUS_CONFIG[key].color, borderColor: STATUS_CONFIG[key].border } : {}}
                                    disabled={user?.role === 'CLIENT' || updatingStatus}
                                >
                                    {STATUS_CONFIG[key].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* COL 2: PARENT APPROVAL (IF NEEDED) OR CONFIG */}
                    <div className="control-card">
                        {sub.status === 'AGUARDANDO_APROVACAO_PAI' && String(sub.parent_id) === String(user?.id) ? (
                            <>
                                <label className="field-label"><Users size={14} /> APROVAÇÃO PARCEIRO</label>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                    <button onClick={() => handleParentApprove(true)} className="action-btn primary-btn" style={{ flex: 1 }}>APROVAR</button>
                                    <button onClick={() => handleParentApprove(false)} className="action-btn ghost-btn" style={{ flex: 1, color: '#ef4444' }}>REPROVAR</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <label className="field-label"><Smartphone size={14} /> ENTREGA</label>
                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <input className="field-input" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="Sender 55..." readOnly={user?.role === 'CLIENT'} />
                                    <textarea className="field-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas..." readOnly={user?.role === 'CLIENT'} />
                                    {user?.role !== 'CLIENT' && <button onClick={handleSaveSender} className="action-btn primary-btn">SALVAR</button>}
                                </div>
                            </>
                        )}
                    </div>

                    {/* COL 3: ASSETS & REPORTS */}
                    <div className="control-card">
                        <label className="field-label"><BarChart3 size={14} /> RELATÓRIOS & ATIVOS</label>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {sub.spreadsheet_url && (
                                <a href={sub.spreadsheet_url} target="_blank" rel="noreferrer" className="asset-link">
                                    <FileSpreadsheet size={16} /> <span>PLANILHA MASTER</span> <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                                </a>
                            )}
                            
                            {attachedReports.map(rep => (
                                <div key={rep.id} className="asset-link" style={{ cursor: 'default' }}>
                                    <BarChart3 size={16} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '11px', fontWeight: 900 }}>{rep.filename}</p>
                                        <p style={{ margin: 0, fontSize: '9px', color: '#10b981' }}>{rep.summary?.delivered} OK</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleDownloadNonDelivered(rep)} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer' }}><FileSpreadsheet size={14} /></button>
                                        {user?.role !== 'CLIENT' && <button onClick={() => handleDeleteReport(rep.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>}
                                    </div>
                                </div>
                            ))}

                            {(sub.status === 'CONCLUIDO' || sub.status === 'CONCLUÍDO') && user?.role !== 'CLIENT' && (
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', border: '1px dashed var(--primary-color)', borderRadius: '12px', cursor: 'pointer', gap: '8px' }}>
                                    <input type="file" style={{ display: 'none' }} onChange={handleReportUpload} />
                                    <Upload size={14} /> <span style={{ fontSize: '10px', fontWeight: 900 }}>ANEXAR EXCEL</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* AD NAVIGATOR & PERFORMANCE SUMMARY */}
                <div className="control-card" style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {(sub.ads || []).map((_, i) => (
                                <button key={i} className={`ad-tab ${activeAdIdx === i ? 'active' : ''}`} onClick={() => setActiveAdIdx(i)}>AD #{i+1}</button>
                            ))}
                            {user?.role !== 'CLIENT' && <button onClick={handleAddAd} className="ad-tab" style={{ background: 'var(--primary-color)', color: '#000' }}><Plus size={14} /></button>}
                        </div>
                    </div>

                    {currentAd ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* METRICS */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)' }}>
                                    <label className="field-label"><Activity size={14} /> PERFORMANCE AGREGADA</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '9px', opacity: 0.5 }}>ENTREGUES TOTAL</p>
                                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#10b981' }}>{(attachedReports.length > 0 ? aggregatedStats.delivered : (currentAd.delivered_leads || 0)).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '9px', opacity: 0.5 }}>INVESTIMENTO</p>
                                            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--primary-color)' }}>R$ {((attachedReports.length > 0 ? aggregatedStats.delivered : (currentAd.delivered_leads || 0)) * (currentAd.price_per_msg || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--card-bg-subtle)', padding: '20px', borderRadius: '16px' }}>
                                    <label className="field-label">MENSAGEM (TEXTO)</label>
                                    <textarea 
                                        className="field-input" 
                                        rows={8} 
                                        value={currentAd.ad_copy || ''} 
                                        onChange={e => handleUpdateAd(activeAdIdx, 'ad_copy', e.target.value)}
                                        readOnly={user?.role === 'CLIENT'}
                                        style={{ marginTop: '10px' }}
                                    />
                                </div>
                            </div>
                            
                            {/* CONFIG AD */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {user?.role !== 'CLIENT' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                            <span style={{ fontSize: '9px' }}>TOTAL BASE</span>
                                            <input type="number" className="field-input" style={{ padding: '8px', marginTop: '4px' }} value={currentAd.total_leads || ''} onChange={e => handleUpdateAd(activeAdIdx, 'total_leads', Number(e.target.value))} />
                                        </div>
                                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                            <span style={{ fontSize: '9px' }}>PREÇO MSG</span>
                                            <input type="number" step="0.01" className="field-input" style={{ padding: '8px', marginTop: '4px' }} value={currentAd.price_per_msg || ''} onChange={e => handleUpdateAd(activeAdIdx, 'price_per_msg', Number(e.target.value))} />
                                        </div>
                                    </div>
                                )}
                                <div style={{ padding: '16px', background: 'var(--card-bg-subtle)', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)', borderLeft: '4px solid #3b82f6' }}>
                                    <label style={{ fontSize: '9px', fontWeight: 900, color: '#3b82f6', marginBottom: '8px', display: 'block' }}>LINK DO BOTÃO</label>
                                    <input 
                                        className="field-input" 
                                        style={{ marginTop: '6px' }} 
                                        value={currentAd.button_link || ''} 
                                        onChange={e => handleUpdateAd(activeAdIdx, 'button_link', e.target.value)} 
                                        onBlur={e => handleUpdateAd(activeAdIdx, 'button_link', ensureProtocol(e.target.value))}
                                        readOnly={user?.role === 'CLIENT'} 
                                    />
                                </div>

                                <div style={{ padding: '16px', background: 'var(--card-bg-subtle)', borderRadius: '20px', border: '1px solid var(--surface-border-subtle)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <label className="field-label" style={{ marginBottom: 0 }}>Variáveis ({currentAd.variables?.length || 0})</label>
                                        {user?.role !== 'CLIENT' && (
                                            <button
                                                onClick={() => {
                                                    const name = window.prompt("Nome da nova variável (ex: NOME, VALOR):");
                                                    if (name) handleAddVariable(activeAdIdx, name);
                                                }}
                                                className="ad-tab"
                                                style={{ background: 'var(--primary-color)', color: '#000', border: 'none' }}
                                            >
                                                + ADICIONAR
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {currentAd.variables?.map((v, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--surface-border-subtle)' }}>
                                                {user?.role !== 'CLIENT' ? (
                                                    <input 
                                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, width: 'auto', minWidth: '40px', outline: 'none' }}
                                                        value={v}
                                                        onChange={(e) => {
                                                            const newVars = [...(currentAd.variables || [])];
                                                            newVars[i] = e.target.value;
                                                            handleUpdateAd(activeAdIdx, 'variables', newVars);
                                                        }}
                                                    />
                                                ) : <span style={{ fontSize: '11px', fontWeight: 700 }}>{v}</span>}
                                                <button onClick={() => handleRemoveVariable(activeAdIdx, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {currentAd.media_url && (
                                    <a href={currentAd.media_url} target="_blank" rel="noreferrer" className="asset-link">
                                        <ImageIcon size={16} /> <span>VER MÍDIA DO AD</span> <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', opacity: 0.3 }}>Selecione um AD ativo.</p>
                    )}
                </div>

                {/* HIDDEN PRINT REF & QR CODE */}
                <div style={{ position: 'absolute', left: '-9999px' }}>
                    <div ref={reportRef} style={{ width: '800px', padding: '60px', background: '#fff', color: '#000', fontFamily: 'Arial, sans-serif' }}>
                        <div style={{ borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>RELATÓRIO DE DISPARO</h1>
                                <p style={{ margin: '8px 0 0 0', opacity: 0.6 }}>#{sub.id} - {sub.profile_name}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontWeight: 900, color: '#10b981' }}>DISPARO CONCLUÍDO</p>
                                <p style={{ margin: '4px 0 0 0' }}>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
                                <p style={{ fontSize: '10px', color: '#64748b' }}>ENTREGUES TOTAL</p>
                                <p style={{ fontSize: '24px', fontWeight: 900 }}>{aggregatedStats.delivered}</p>
                            </div>
                            <div style={{ padding: '20px', background: 'rgba(172,248,0,0.05)', borderRadius: '15px' }}>
                                <p style={{ fontSize: '10px', color: '#64748b' }}>INVESTIMENTO</p>
                                <p style={{ fontSize: '24px', fontWeight: 900 }}>R$ {(aggregatedStats.delivered * (currentAd?.price_per_msg || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '30px' }}>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/client-submissions/${sub.id}`)}`} alt="QR" />
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>DASHBOARD EM TEMPO REAL</h3>
                                <p style={{ fontSize: '10px', color: '#3b82f6' }}>{window.location.origin}/client-submissions/{sub.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {copyFeedback && (
                    <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: '#000', padding: '12px 24px', borderRadius: '16px', fontWeight: 900, fontSize: '13px', boxShadow: '0 10px 40px rgba(172,248,0,0.3)', zIndex: 9999, animation: 'fadeInUp 0.3s ease-out' }}>
                        ✓ {copyFeedback.toUpperCase()} COPIADO!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientSubmissionDetail;
