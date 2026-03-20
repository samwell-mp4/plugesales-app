import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Trash2, 
    User, 
    Image as ImageIcon, 
    Video, 
    FileText, 
    Link as LinkIcon, 
    CheckCircle, 
    Layers, 
    Search,
    Activity,
    ChevronRight,
    Clock,
    Users,
    Inbox,
    FileSpreadsheet
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

interface Ad {
    ad_name?: string;
    template_type?: string;
    message_mode?: string;
    media_url?: string;
    ad_copy?: string;
    ad_copy_file?: string;
    button_link?: string;
    variables?: string[];
    id?: string;
}

interface ClientSubmission {
    id: number;
    profile_photo: string;
    profile_name: string;
    ddd: string;
    template_type: string;
    media_url: string;
    ad_copy: string;
    button_link: string;
    spreadsheet_url: string;
    status: string;
    accepted_by?: string | null;
    assigned_to?: string | null;
    sender_number?: string;
    submitted_by?: string;
    ads?: Ad[];
    timestamp: string;
}

const ClientSubmissions = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<ClientSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0 });
    const [activeTab, setActiveTab] = useState<'available' | 'mine' | 'all'>(user?.role === 'ADMIN' ? 'available' : 'mine');
    const [employees, setEmployees] = useState<string[]>([]);

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getClientSubmissions();
            setSubmissions(Array.isArray(data) ? data : []);
            
            if (user?.role === 'ADMIN') {
                const empData = await dbService.getEmployees();
                setEmployees(empData);
            }
        } catch (err) {
            console.error("Error loading submissions:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        loadSubmissions(); 
        // Auto-refresh every 20 seconds
        const interval = setInterval(loadSubmissions, 20000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Deseja realmente excluir este envio?")) return;
        await dbService.deleteClientSubmission(id);
        loadSubmissions();
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Fix: treat null, undefined, and empty string as "not accepted"
    const isAccepted = (s: ClientSubmission) => !!(s.accepted_by && s.accepted_by.trim() !== '') || !!(s.assigned_to && s.assigned_to.trim() !== '');

    const allSubmissions = Array.isArray(submissions) ? submissions : [];
    
    const searchFilter = (s: ClientSubmission) =>
        (s.profile_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.ddd || '').includes(searchTerm);

    // Now 'available' means not assigned yet
    const availableSubmissions = allSubmissions.filter(s => !s.assigned_to && searchFilter(s));
    // 'mine' means assigned specifically to the user
    const mySubmissions = allSubmissions.filter(s => s.assigned_to === user?.name && searchFilter(s));
    const allFiltered = allSubmissions.filter(searchFilter);

    const filteredSubmissions = activeTab === 'available' ? availableSubmissions
        : activeTab === 'mine' ? mySubmissions
        : allFiltered;

    const selectAll = () => {
        if (selectedIds.length === filteredSubmissions.length) setSelectedIds([]);
        else setSelectedIds(filteredSubmissions.map(s => s.id));
    };

    const handleAssign = async (id: number, employeeName: string) => {
        try {
            await dbService.updateClientSubmission(id, { assigned_to: employeeName || null });
            loadSubmissions();
        } catch (err) {
            console.error("Error assigning task:", err);
        }
    };

    const callInfobipAPI = async (payload: any) => {
        try {
            const settings = await dbService.getSettings();
            const apiKey = settings['infobip_key'];
            if (!apiKey) throw new Error("API Key não configurada.");
            const res = await fetch('https://qgylyz.api.infobip.com/whatsapp/1/templates', {
                method: 'POST', headers: { 'Authorization': `App ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                return { success: false, error: errorData.errorMessage || `HTTP ${res.status}` };
            }
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    const handleBulkGenerate = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Deseja gerar templates reais na Infobip para ${selectedIds.length} envios selecionados?`)) return;
        setIsProcessing(true);
        setGeneratingProgress({ current: 0, total: selectedIds.length });
        let successCount = 0; let errorCount = 0;
        try {
            for (let i = 0; i < selectedIds.length; i++) {
                const id = selectedIds[i];
                const sub = submissions.find(s => s.id === id);
                if (!sub) continue;
                setGeneratingProgress({ current: i + 1, total: selectedIds.length });
                const techName = `${sub.profile_name.toLowerCase().replace(/\s+/g, '_')}_${sub.ddd}_${sub.template_type}`;
                const payload: any = { name: techName, language: 'pt_BR', category: 'MARKETING', structure: { body: { text: sub.ad_copy } } };
                if (sub.template_type !== 'none') payload.structure.header = { format: sub.template_type.toUpperCase(), example: sub.media_url };
                if (sub.button_link) payload.structure.buttons = [{ type: 'URL', text: 'Acessar Agora', url: sub.button_link }];
                const res = await callInfobipAPI(payload);
                if (res.success) { successCount++; await dbService.updateClientSubmissionStatus(id, 'GERADO'); }
                else { errorCount++; await fetch('/api/logs/template-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: techName, error: res.error, author: 'Client Area' }) }).catch(() => {}); }
                if (i < selectedIds.length - 1) await new Promise(r => setTimeout(r, 2500));
            }
            alert(`Processamento concluído!\nSucesso: ${successCount}\nErros: ${errorCount}`);
            setSelectedIds([]);
            loadSubmissions();
        } catch (err) {
            console.error("Bulk error:", err);
            alert("Erro fatal ao processar envios.");
        } finally {
            setIsProcessing(false);
            setGeneratingProgress({ current: 0, total: 0 });
        }
    };

    const getTemplateIcon = (type: string) => {
        if (type === 'image') return <ImageIcon size={14} className="text-purple-400" />;
        if (type === 'video') return <Video size={14} className="text-blue-400" />;
        return <FileText size={14} className="text-white/30" />;
    };

    const formatDate = (ts: string) => {
        try { return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
        catch { return '-'; }
    };

    const tabs = [
        ...(user?.role === 'ADMIN' ? [{ id: 'available' as const, label: 'PENDENTES', icon: <Inbox size={13} />, count: availableSubmissions.length }] : []),
        { id: 'mine' as const, label: 'MINHAS TAREFAS', icon: <CheckCircle size={13} />, count: mySubmissions.length },
        ...(user?.role === 'ADMIN' ? [{ id: 'all' as const, label: 'TODAS', icon: <Users size={13} />, count: allFiltered.length }] : []),
    ];

    return (
        <div style={{ background: '#020617', minHeight: '100vh', padding: '32px 24px', boxSizing: 'border-box', overflowX: 'hidden' }}>
            <style>{`
                * { box-sizing: border-box; }
                .cs-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
                    position: relative;
                    overflow: hidden;
                }
                .cs-card:hover {
                    border-color: rgba(172,248,0,0.25);
                    background: rgba(172,248,0,0.015);
                    transform: translateY(-3px);
                    box-shadow: 0 20px 50px -15px rgba(0,0,0,0.7);
                }
                .cs-card.selected {
                    border-color: rgba(172,248,0,0.4);
                    background: rgba(172,248,0,0.04);
                }
                .cs-card .card-actions {
                    position: absolute; top: 12px; right: 12px;
                    display: flex; gap: 6px;
                    opacity: 0; transform: translateY(-4px); transition: all 0.2s;
                }
                .cs-card:hover .card-actions { opacity: 1; transform: translateY(0); }
                .cs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 18px; }
                .tab-pill { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 12px; font-weight: 900; font-size: 10px; letter-spacing: 0.5px; transition: all 0.2s; cursor: pointer; border: none; }
                .tab-pill.active { background: var(--primary-color); color: #000; }
                .tab-pill.inactive { background: transparent; color: rgba(255,255,255,0.35); }
                .tab-pill.inactive:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.04); }
                .count-badge.active { background: rgba(0,0,0,0.3); color: #000; }
                .count-badge.inactive { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); }
                .tab-pill { border: 1px solid transparent; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .tab-pill.active { border-color: rgba(172,248,0,0.3); box-shadow: 0 4px 15px rgba(172,248,0,0.2); }
                .progress-overlay {
                    position: fixed; inset: 0; background: rgba(2,6,23,0.96); z-index: 9999;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    backdrop-filter: blur(20px);
                }
                .accept-btn {
                    width: 100%; background: var(--primary-color); color: #000; font-weight: 900;
                    font-size: 11px; letter-spacing: 1px; padding: 12px; border-radius: 12px; border: none;
                    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap-6px;
                }
                .accept-btn:hover { transform: scale(1.02); box-shadow: 0 8px 20px -4px rgba(172,248,0,0.4); }
                .open-btn {
                    width: 100%; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); font-weight: 900;
                    font-size: 11px; letter-spacing: 1px; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
                    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .open-btn:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.15); }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 24px; }
                .chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; margin-top: 16px; }
            `}</style>

            <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
                {/* ── HEADER ── */}
                <div style={{ marginBottom: '36px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '3px', color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.8 }}>ÁREA DO CLIENTE</p>
                            <h1 style={{ fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-1.5px', margin: 0, lineHeight: 1 }}>Dashboard de Clientes</h1>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 600, marginTop: '6px' }}>
                                Gerencie solicitações de templates e acompanhe suas atividades
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                                onClick={() => {
                                    const url = window.location.origin + '/client-form';
                                    navigator.clipboard.writeText(url);
                                    alert("Link copiado: " + url);
                                }}
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                            >
                                <LinkIcon size={15} /> COPIAR LINK
                            </button>
                            <button
                                onClick={() => navigate('/client-submissions/add')}
                                style={{ background: 'var(--primary-color)', color: '#000', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}
                            >
                                <Plus size={16} /> NOVO ENVIO
                            </button>
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkGenerate}
                                    disabled={isProcessing}
                                    style={{ background: 'rgba(172,248,0,0.1)', color: 'var(--primary-color)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', border: '1px solid rgba(172,248,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {isProcessing ? <Activity size={15} className="animate-spin" /> : <Layers size={15} />}
                                    {isProcessing ? 'GERANDO...' : `GERAR (${selectedIds.length})`}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="stats-grid">
                        {[
                            { label: 'Total', value: allSubmissions.length, color: 'rgba(255,255,255,0.6)' },
                            { label: 'Disponíveis', value: availableSubmissions.length, color: 'var(--primary-color)' },
                            { label: 'Em andamento', value: allSubmissions.filter(isAccepted).length, color: '#f59e0b' },
                            { label: 'Geradas', value: allSubmissions.filter(s => s.status === 'GERADO').length, color: '#22c55e' },
                        ].map(stat => (
                            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '18px 24px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                <span style={{ fontSize: '28px', fontWeight: 900, color: stat.color, lineHeight: 1, display: 'block', marginBottom: '4px' }}>{stat.value}</span>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Interactive mini-charts */}
                    {allSubmissions.length > 0 && (() => {
                        const total = allSubmissions.length;
                        const avail = availableSubmissions.length;
                        const inProgress = allSubmissions.filter(isAccepted).length;
                        const done = allSubmissions.filter(s => s.status === 'GERADO').length;
                        const cancelled = allSubmissions.filter(s => s.status === 'CANCELADO').length;

                        // Template type breakdown
                        const byType: Record<string, number> = {};
                        allSubmissions.forEach(s => {
                            const t = (s.ads && s.ads.length > 0 ? s.ads[0]?.template_type : s.template_type) || 'none';
                            byType[t] = (byType[t] || 0) + 1;
                        });
                        const typeColors: Record<string, string> = { image: '#a855f7', video: '#3b82f6', none: 'rgba(255,255,255,0.25)', text: 'rgba(255,255,255,0.25)' };

                        return (
                            <div className="chart-grid">
                                {/* Status distribution */}
                                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '18px' }}>
                                    <p style={{ margin: '0 0 14px 0', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase' }}>Distribuição de Status</p>
                                    {[
                                        { label: 'Disponíveis', value: avail, color: 'var(--primary-color)' },
                                        { label: 'Em andamento', value: inProgress, color: '#f59e0b' },
                                        { label: 'Geradas', value: done, color: '#22c55e' },
                                        { label: 'Canceladas', value: cancelled, color: '#ef4444' },
                                    ].map(row => (
                                        <div key={row.label} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{row.label}</span>
                                                <span style={{ fontSize: '11px', fontWeight: 900, color: row.color }}>{row.value}</span>
                                            </div>
                                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${total > 0 ? (row.value / total) * 100 : 0}%`, background: row.color, borderRadius: '999px', transition: 'width 0.6s ease', boxShadow: `0 0 8px ${row.color}` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Template type */}
                                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '18px' }}>
                                    <p style={{ margin: '0 0 14px 0', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase' }}>Tipos de Template</p>
                                    {Object.entries(byType).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
                                        <div key={type} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{type}</span>
                                                <span style={{ fontSize: '11px', fontWeight: 900, color: typeColors[type] || 'rgba(255,255,255,0.4)' }}>{count}</span>
                                            </div>
                                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${total > 0 ? (count / total) * 100 : 0}%`, background: typeColors[type] || 'rgba(255,255,255,0.3)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* ── TABS + SEARCH ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '4px' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-pill ${activeTab === tab.id ? 'active' : 'inactive'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                {tab.label}
                                <span className={`count-badge ${activeTab === tab.id ? 'active' : 'inactive'}`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '360px' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0 14px' }}>
                            <Search size={15} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Buscar cliente ou DDD..."
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '13px', padding: '10px 0', width: '100%' }}
                            />
                        </div>
                        {filteredSubmissions.length > 0 && (
                            <button
                                onClick={selectAll}
                                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 900, letterSpacing: '1px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                {selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0 ? 'DESSELECIONAR' : 'SEL. TUDO'}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── GRID ── */}
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px' }}>
                        <div style={{ width: 48, height: 48, border: '3px solid rgba(172,248,0,0.2)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '12px', letterSpacing: '2px' }}>CARREGANDO...</span>
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px', opacity: 0.3 }}>
                        <Inbox size={70} strokeWidth={1} />
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 900, fontSize: '1.1rem', margin: 0 }}>
                                {activeTab === 'available' ? 'SEM TAREFAS PENDENTES' :
                                 activeTab === 'mine' ? 'NENHUMA TAREFA ATRIBUÍDA' : 'SEM REGISTROS'}
                            </p>
                            <p style={{ fontSize: '12px', marginTop: '6px', opacity: 0.6 }}>
                                {activeTab === 'available' ? 'Todas as tarefas já foram atribuídas.' : 
                                 activeTab === 'mine' ? 'Aguarde o Admin atribuir tarefas para você.' : 'Sem registros encontrados.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="cs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                        {filteredSubmissions.map(s => {
                            const adCount = s.ads?.length || 0;
                            return (
                                <div
                                    key={s.id}
                                    className={`cs-card ${selectedIds.includes(s.id) ? 'selected' : ''}`}
                                    onClick={() => toggleSelect(s.id)}
                                    style={{ padding: '20px' }}
                                >
                                    {/* Action buttons on hover */}
                                    <div className="card-actions">
                                        <button
                                            onClick={e => { e.stopPropagation(); handleDelete(s.id); }}
                                            style={{ padding: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>

                                    {/* Checkbox */}
                                    <div style={{ position: 'absolute', top: '18px', left: '18px' }}>
                                        <div style={{ width: 20, height: 20, borderRadius: '6px', border: selectedIds.includes(s.id) ? '1.5px solid var(--primary-color)' : '1.5px solid rgba(255,255,255,0.12)', background: selectedIds.includes(s.id) ? 'var(--primary-color)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                            {selectedIds.includes(s.id) && <CheckCircle size={13} style={{ color: '#000' }} />}
                                        </div>
                                    </div>

                                    {/* Status pill */}
                                    <div style={{ position: 'absolute', top: '16px', right: '40px' }}>
                                        <span style={{
                                            fontSize: '9px', fontWeight: 900, padding: '3px 8px', borderRadius: '999px',
                                            letterSpacing: '0.5px', textTransform: 'uppercase',
                                            background: s.assigned_to ? 'rgba(245,158,11,0.12)' : s.status === 'GERADO' ? 'rgba(34,197,94,0.12)' : 'rgba(172,248,0,0.08)',
                                            color: s.assigned_to ? '#f59e0b' : s.status === 'GERADO' ? '#22c55e' : 'var(--primary-color)',
                                            border: `1px solid ${s.assigned_to ? 'rgba(245,158,11,0.2)' : s.status === 'GERADO' ? 'rgba(34,197,94,0.2)' : 'rgba(172,248,0,0.15)'}`
                                        }}>
                                            {s.assigned_to ? `EM MÃOS: ${s.assigned_to.toUpperCase()}` : s.status}
                                        </span>
                                    </div>

                                    {/* Profile */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '30px', marginBottom: '16px' }}>
                                        {s.profile_photo ? (
                                            <img src={s.profile_photo} alt="Perfil" style={{ width: 48, height: 48, borderRadius: '14px', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                                        ) : (
                                            <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <User size={22} style={{ opacity: 0.2 }} />
                                            </div>
                                        )}
                                        <div style={{ overflow: 'hidden' }}>
                                            <h4 style={{ margin: 0, fontWeight: 900, fontSize: '15px', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.profile_name}</h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                                                <span style={{ fontSize: '10px', color: 'var(--primary-color)', fontWeight: 900 }}>DDD {s.ddd}</span>
                                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Clock size={10} /> {formatDate(s.timestamp)}
                                                </span>
                                                {s.submitted_by && (
                                                    <span style={{ fontSize: '10px', color: '#6366f1', fontWeight: 800, background: 'rgba(99,102,241,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                                                        BY: {s.submitted_by}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info row */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {getTemplateIcon(s.template_type || s.ads?.[0]?.template_type || 'none')}
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                                                {(s.template_type || s.ads?.[0]?.template_type || 'none').toUpperCase()}
                                            </span>
                                        </div>
                                        {adCount > 0 && (
                                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Layers size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                                <span style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.5)' }}>{adCount}</span>
                                            </div>
                                        )}
                                        {s.spreadsheet_url && (
                                            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center' }}>
                                                <FileSpreadsheet size={13} style={{ color: '#22c55e' }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Message preview */}
                                    {(s.ad_copy || s.ads?.[0]?.ad_copy) && (
                                        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', maxHeight: '52px' }}>
                                            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, overflow: 'hidden' }}>
                                                {(s.ad_copy || s.ads?.[0]?.ad_copy || '').substring(0, 120)}
                                            </p>
                                        </div>
                                    )}

                                    {/* Assignment Selector (Admin Only) */}
                                    {user?.role === 'ADMIN' && (
                                        <div style={{ marginBottom: '14px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                                            <p style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', marginBottom: '6px', letterSpacing: '1px' }}>ATRIBUIR PARA:</p>
                                            <select
                                                value={s.assigned_to || ''}
                                                onChange={e => handleAssign(s.id, e.target.value)}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px', color: 'white', fontSize: '11px', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                                            >
                                                <option value="" style={{ background: '#0f172a' }}>-- Selecionar Funcionário --</option>
                                                {employees.map(emp => (
                                                    <option key={emp} value={emp} style={{ background: '#0f172a' }}>{emp}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Action button */}
                                    <button className="open-btn" onClick={e => { e.stopPropagation(); navigate(`/client-submissions/${s.id}`); }}>
                                        ABRIR PAINEL <ChevronRight size={15} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Progress Overlay */}
            {generatingProgress.total > 0 && (
                <div className="progress-overlay">
                    <div style={{ width: 80, height: 80, border: '4px solid rgba(172,248,0,0.15)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '32px' }} />
                    <h2 style={{ fontWeight: 900, fontSize: '2rem', margin: 0 }}>Gerando Templates...</h2>
                    <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
                        Processando {generatingProgress.current} de {generatingProgress.total}
                    </p>
                    <div style={{ width: '380px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', marginTop: '32px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--primary-color)', borderRadius: '999px', width: `${(generatingProgress.current / generatingProgress.total) * 100}%`, boxShadow: '0 0 16px var(--primary-color)', transition: 'width 0.5s' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientSubmissions;
