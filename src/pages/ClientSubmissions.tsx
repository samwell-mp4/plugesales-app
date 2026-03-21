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
    Clock,
    Users,
    Inbox,
    FileSpreadsheet,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    Trello,
    Eye,
    Send,
    Calendar
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
    delivered_leads?: number;
    price_per_msg?: number;
    scheduled_at?: string;
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
    user_id?: number | string;
    client_name?: string;
    timestamp: string;
}

const ClientSubmissions = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<ClientSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0 });
    const [activeTab, setActiveTab] = useState<'available' | 'mine' | 'all'>('all');
    const [employees, setEmployees] = useState<string[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClientFilter, setSelectedClientFilter] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [showUpcoming, setShowUpcoming] = useState(false);

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getClientSubmissions();
            setSubmissions(Array.isArray(data) ? data : []);
            
            if (user?.role === 'ADMIN') {
                const empData = await dbService.getEmployees();
                setEmployees(empData);
                const clientsData = await dbService.getClients();
                setClients(clientsData);
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
    
    const allFiltered = allSubmissions.filter(s => {
        const matchesSearch = (s.profile_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.ddd || '').includes(searchTerm);
        
        const matchesClient = !selectedClientFilter || String(s.user_id) === String(selectedClientFilter);

        const dateObj = new Date(s.timestamp);
        const matchesStart = !dateRange.start || dateObj >= new Date(dateRange.start + 'T00:00:00');
        const matchesEnd = !dateRange.end || dateObj <= new Date(dateRange.end + 'T23:59:59');

        const hasUpcomingAd = s.ads?.some(ad => ad.scheduled_at && new Date(ad.scheduled_at) > new Date()) || false;
        const matchesUpcoming = !showUpcoming || hasUpcomingAd;

        return matchesSearch && matchesClient && matchesStart && matchesEnd && matchesUpcoming;
    });

    const filteredSubmissions = activeTab === 'available' ? allFiltered.filter(s => !s.assigned_to)
        : activeTab === 'mine' ? allFiltered.filter(s => s.assigned_to === user?.name)
        : allFiltered;

    const paginatedSubmissions = filteredSubmissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        ...(user?.role === 'ADMIN' ? [{ id: 'available' as const, label: 'PENDENTES', icon: <Inbox size={13} />, count: allFiltered.filter(s => !s.assigned_to).length }] : []),
        { id: 'mine' as const, label: 'MINHAS TAREFAS', icon: <CheckCircle size={13} />, count: allFiltered.filter(s => s.assigned_to === user?.name).length },
        ...(user?.role === 'ADMIN' ? [{ id: 'all' as const, label: 'TODAS', icon: <Users size={13} />, count: allFiltered.length }] : []),
    ];

    const totalEntregues = allFiltered.reduce((sum, sub) => {
        const adsEntregues = sub.ads?.reduce((s, ad) => s + (ad.delivered_leads || 0), 0) || 0;
        return sum + adsEntregues;
    }, 0);

    const totalFaturado = allFiltered.reduce((sum, sub) => {
        const adsFaturado = sub.ads?.reduce((s, ad) => s + ((ad.delivered_leads || 0) * (ad.price_per_msg || 0)), 0) || 0;
        return sum + adsFaturado;
    }, 0);

    const renderGridView = () => (
        <div className="cs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {paginatedSubmissions.map(s => {
                const adCount = s.ads?.length || 0;
                const subTotalEntregues = s.ads?.reduce((sum, ad) => sum + (ad.delivered_leads || 0), 0) || 0;
                const subTotalFaturado = s.ads?.reduce((sum, ad) => sum + ((ad.delivered_leads || 0) * (ad.price_per_msg || 0)), 0) || 0;
                return (
                    <div key={s.id} className={`cs-card ${selectedIds.includes(s.id) ? 'selected' : ''}`} onClick={() => toggleSelect(s.id)} style={{ padding: '20px' }}>
                        <div className="card-actions">
                            <button onClick={e => { e.stopPropagation(); handleDelete(s.id); }} style={{ padding: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                        <div style={{ position: 'absolute', top: '18px', left: '18px' }}>
                            <div style={{ width: 20, height: 20, borderRadius: '6px', border: selectedIds.includes(s.id) ? '1.5px solid var(--primary-color)' : '1.5px solid rgba(255,255,255,0.12)', background: selectedIds.includes(s.id) ? 'var(--primary-color)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                {selectedIds.includes(s.id) && <CheckCircle size={13} style={{ color: '#000' }} />}
                            </div>
                        </div>
                        {s.status === 'GERADO' && s.ads?.some(ad => ad.scheduled_at) && (
                            <div style={{ position: 'absolute', top: '16px', right: '140px' }}>
                                <div style={{ fontSize: '9px', fontWeight: 900, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', padding: '3px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Clock size={10} /> AGENDADO
                                </div>
                            </div>
                        )}
                        <div style={{ position: 'absolute', top: '16px', right: '40px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 900, padding: '3px 8px', borderRadius: '999px', letterSpacing: '0.5px', textTransform: 'uppercase', background: s.assigned_to ? 'rgba(245,158,11,0.12)' : s.status === 'GERADO' ? 'rgba(34,197,94,0.12)' : s.status === 'CONCLUIDO' ? 'rgba(16,185,129,0.1)' : 'rgba(172,248,0,0.08)', color: s.assigned_to ? '#f59e0b' : s.status === 'GERADO' ? '#22c55e' : s.status === 'CONCLUIDO' ? '#10b981' : 'var(--primary-color)', border: `1px solid ${s.assigned_to ? 'rgba(245,158,11,0.2)' : s.status === 'GERADO' ? 'rgba(34,197,94,0.2)' : s.status === 'CONCLUIDO' ? 'rgba(16,185,129,0.3)' : 'rgba(172,248,0,0.15)'}` }}>
                                {s.assigned_to ? `EM MÃOS: ${s.assigned_to.toUpperCase()}` : s.status === 'CONCLUIDO' ? 'DISPARO CONCLUÍDO' : s.status}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '30px', marginBottom: '16px' }}>
                            {s.profile_photo ? <img src={s.profile_photo} alt="" style={{ width: 48, height: 48, borderRadius: '14px', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.1)', flexShrink: 0 }} /> : <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={22} style={{ opacity: 0.2 }} /></div>}
                            <div style={{ overflow: 'hidden' }}><h4 style={{ margin: 0, fontWeight: 900, fontSize: '15px', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.profile_name}</h4>{s.client_name && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', fontWeight: 600 }}>Cliente: {s.client_name}</div>}<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '3px' }}><span style={{ fontSize: '10px', color: 'var(--primary-color)', fontWeight: 900 }}>DDD {s.ddd}</span><span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {formatDate(s.timestamp)}</span></div></div>
                        </div>

                        {/* Additional detail rows from original card */}
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

                        {(s.ad_copy || s.ads?.[0]?.ad_copy) && (
                            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', maxHeight: '52px' }}>
                                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, overflow: 'hidden' }}>
                                    {(s.ad_copy || s.ads?.[0]?.ad_copy || '').substring(0, 120)}
                                </p>
                            </div>
                        )}

                        {s.status === 'GERADO' && s.ads?.[0]?.scheduled_at && (
                            <div style={{ background: 'rgba(59,130,246,0.12)', borderRadius: '12px', padding: '14px', marginBottom: '14px', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(59,130,246,0.1)' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 10px rgba(59,130,246,0.4)' }}>
                                    <Clock size={18} color="#fff" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>PRÓXIMO DISPARO</p>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 900, color: '#fff' }}>{new Date(s.ads[0].scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                                    {s.sender_number && (
                                        <p style={{ margin: '2px 0 0 0', fontSize: '9px', fontWeight: 800, color: 'rgba(59,130,246,0.7)' }}>BM SENDER: {s.sender_number}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {s.status === 'CONCLUIDO' && subTotalEntregues > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                                <div style={{ background: 'rgba(34,197,94,0.08)', borderRadius: '10px', padding: '10px', border: '1px solid rgba(34,197,94,0.15)' }}>
                                    <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: '#22c55e', letterSpacing: '0.5px' }}>TOTAL ENTREGUE</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 900, color: '#22c55e' }}>{subTotalEntregues.toLocaleString('pt-BR')}</p>
                                </div>
                                <div style={{ background: 'rgba(172,248,0,0.1)', borderRadius: '10px', padding: '10px', border: '1px solid rgba(172,248,0,0.2)' }}>
                                    <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '0.5px' }}>CUSTO DO CLIENTE</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 900, color: 'var(--primary-color)' }}>R$ {subTotalFaturado.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>
                                </div>
                            </div>
                        )}
                        {user?.role === 'ADMIN' && (
                            <div style={{ marginBottom: '14px' }} onClick={e => e.stopPropagation()}>
                                <select value={s.assigned_to || ''} onChange={e => handleAssign(s.id, e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px', color: 'white', fontSize: '11px', fontWeight: 700, outline: 'none' }}>
                                    <option value="">Atribuir...</option>
                                    {employees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                                </select>
                            </div>
                        )}
                        <button className="open-btn" onClick={e => { e.stopPropagation(); navigate(`/client-submissions/${s.id}`); }}>ABRIR PAINEL <ChevronRight size={15} /></button>
                    </div>
                );
            })}
        </div>
    );

    const renderListView = () => (
        <div className="list-container">
            {paginatedSubmissions.map(s => (
                <div key={s.id} className={`list-row ${selectedIds.includes(s.id) ? 'selected' : ''}`} onClick={() => toggleSelect(s.id)}>
                    {/* COL 1: NAME & SUBTITLE */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 900, fontSize: '14px', color: '#fff', letterSpacing: '-0.2px' }}>{s.profile_name}</span>
                        <span style={{ fontSize: '10px', color: 'rgba(172,248,0,0.6)', fontWeight: 800 }}>{s.id.toString().padStart(6, '0')}...</span>
                    </div>

                    {/* COL 2: TYPE & LOCALE */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 900, fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                            {s.template_type || 'TEMPLATE'}
                        </span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>pt_BR</span>
                    </div>

                    {/* COL 3: STATUS BADGE */}
                    <div>
                        <span className="list-badge" style={{
                            borderColor: s.status === 'CONCLUIDO' ? 'rgba(16,185,129,0.3)' : s.status === 'GERADO' ? 'rgba(34,197,94,0.3)' : 'rgba(172,248,0,0.3)',
                            color: s.status === 'CONCLUIDO' ? '#10b981' : s.status === 'GERADO' ? '#22c55e' : 'var(--primary-color)',
                            background: s.status === 'CONCLUIDO' ? 'rgba(16,185,129,0.05)' : s.status === 'GERADO' ? 'rgba(34,197,94,0.05)' : 'rgba(172,248,0,0.05)'
                        }}>
                            {s.status === 'CONCLUIDO' ? 'CONCLUÍDO' : s.status}
                        </span>
                    </div>

                    {/* COL 4: DATE */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 700 }}>
                        <Calendar size={14} opacity={0.5} />
                        {formatDate(s.timestamp)}
                    </div>

                    {/* COL 5: ACTIONS */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                            className="list-btn" 
                            onClick={e => { e.stopPropagation(); navigate(`/client-submissions/${s.id}`); }}
                            title="Visualizar"
                        >
                            <Eye size={16} />
                        </button>
                        <button 
                            className="list-btn primary" 
                            onClick={e => { e.stopPropagation(); navigate(`/client-submissions/${s.id}`); }}
                            title="Abrir Painel"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderKanbanView = () => {
        const columns = [
            { id: 'PENDENTE', title: 'PENDENTES', filter: (s: ClientSubmission) => !s.assigned_to && s.status !== 'GERADO' && s.status !== 'CONCLUIDO' },
            { id: 'ANDAMENTO', title: 'EM MÃOS', filter: (s: ClientSubmission) => !!s.assigned_to && s.status !== 'GERADO' && s.status !== 'CONCLUIDO' },
            { id: 'GERADO', title: 'GERADOS', filter: (s: ClientSubmission) => s.status === 'GERADO' },
            { id: 'CONCLUIDO', title: 'CONCLUÍDO', filter: (s: ClientSubmission) => s.status === 'CONCLUIDO' }
        ];
        return (
            <div className="kanban-board">
                {columns.map(col => (
                    <div key={col.id} className="kanban-column">
                        <div className="kanban-header">
                            <span className="kanban-title">{col.title}</span>
                            <span style={{ fontSize: '10px', opacity: 0.3, fontWeight: 900 }}>{filteredSubmissions.filter(col.filter).length}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                            {filteredSubmissions.filter(col.filter).map(s => (
                                <div key={s.id} className="kanban-card" onClick={() => navigate(`/client-submissions/${s.id}`)}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                                        {s.profile_photo ? <img src={s.profile_photo} alt="" style={{ width: 32, height: 32, borderRadius: '8px' }} /> : <User size={16} opacity={0.2} />}
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.profile_name}</p>
                                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--primary-color)', fontWeight: 800 }}>DDD {s.ddd}</p>
                                        </div>
                                    </div>
                                    {s.assigned_to && <p style={{ margin: 0, fontSize: '9px', color: '#f59e0b', fontWeight: 800 }}>👤 {s.assigned_to}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

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

                /* List View Styles */
                .list-container { display: flex; flex-direction: column; gap: 8px; width: 100%; }
                .list-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1.5fr 120px;
                    align-items: center;
                    padding: 16px 24px;
                    background: rgba(255,255,255,0.015);
                    border: 1px solid rgba(255,255,255,0.04);
                    border-radius: 14px;
                    gap: 20px;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .list-row:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1); }
                .list-row.selected { background: rgba(172,248,0,0.03); border-color: rgba(172,248,0,0.2); }

                .list-btn {
                    width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); 
                    color: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s;
                }
                .list-btn:hover { background: rgba(255,255,255,0.08); color: white; border-color: rgba(255,255,255,0.15); }
                .list-btn.primary { background: var(--primary-color); border-color: var(--primary-color); color: #000; box-shadow: 0 0 12px rgba(172,248,0,0.2); }
                .list-btn.primary:hover { background: #bdfa00; transform: scale(1.05); }

                .list-badge {
                    font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 6px;
                    border: 1px solid rgba(172,248,0,0.3); color: var(--primary-color);
                    background: rgba(172,248,0,0.05); text-transform: uppercase; letter-spacing: 0.5px;
                }

                /* Kanban Styles */
                .kanban-board { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px; min-height: 600px; -webkit-overflow-scrolling: touch; }
                .kanban-column {
                    flex: 1; min-width: 320px; max-width: 400px;
                    background: rgba(255,255,255,0.01);
                    border: 1px solid rgba(255,255,255,0.04);
                    border-radius: 20px;
                    padding: 16px;
                    display: flex; flex-direction: column; gap: 12px;
                }
                .kanban-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 8px; padding: 0 4px;
                }
                .kanban-title { font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
                .kanban-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .kanban-card:hover { border-color: var(--primary-color); background: rgba(255,255,255,0.04); }

                /* Pagination */
                .pagination-bar {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    margin-top: 40px; padding: 20px;
                }
                .page-btn {
                    padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5);
                    cursor: pointer; font-weight: 800; font-size: 12px; transition: all 0.2s;
                    display: flex; align-items: center; gap: 4px;
                }
                .page-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: white; }
                .page-btn.active { background: var(--primary-color); color: #000; border-color: var(--primary-color); }
                .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
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
                        {(['ADMIN', 'EMPLOYEE'].includes(user?.role || '') ? [
                            { label: 'Total', value: allSubmissions.length, color: 'rgba(255,255,255,0.6)' },
                            { label: 'Em andamento', value: allSubmissions.filter(isAccepted).length, color: '#f59e0b' },
                            { label: 'Total Entregues', value: totalEntregues.toLocaleString('pt-BR'), color: '#22c55e' },
                            { label: 'Investimento Clientes', value: `R$ ${totalFaturado.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: 'var(--primary-color)' },
                        ] : [
                            { label: 'Total', value: allSubmissions.length, color: 'rgba(255,255,255,0.6)' },
                            { label: 'Disponíveis', value: allFiltered.filter(s => !s.assigned_to).length, color: 'var(--primary-color)' },
                            { label: 'Em andamento', value: allFiltered.filter(isAccepted).length, color: '#f59e0b' },
                            { label: 'Geradas', value: allFiltered.filter(s => s.status === 'GERADO').length, color: '#22c55e' },
                        ]).map(stat => (
                            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '18px 24px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                <span style={{ fontSize: '28px', fontWeight: 900, color: stat.color, lineHeight: 1, display: 'block', marginBottom: '4px' }}>{stat.value}</span>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Interactive mini-charts */}
                    {allSubmissions.length > 0 && (() => {
                        const total = allSubmissions.length;
                        const avail = allFiltered.filter(s => !s.assigned_to).length;
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        {user?.role === 'ADMIN' && (
                            <>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0 14px' }}>
                                    <select 
                                        value={selectedClientFilter} 
                                        onChange={e => setSelectedClientFilter(e.target.value)}
                                        style={{ background: 'transparent', border: 'none', outline: 'none', color: selectedClientFilter ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '10.5px 0', cursor: 'pointer', appearance: 'none' }}
                                    >
                                        <option value="" style={{ background: '#0f172a' }}>Todos os Clientes</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>DE:</span>
                                    <input type="date" value={dateRange.start} onChange={e => { setDateRange(p => ({ ...p, start: e.target.value })); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', color: dateRange.start ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '10.5px 0', outline: 'none' }} />
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>ATÉ:</span>
                                    <input type="date" value={dateRange.end} onChange={e => { setDateRange(p => ({ ...p, end: e.target.value })); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', color: dateRange.end ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '10.5px 0', outline: 'none' }} />
                                </div>
                                <button
                                    onClick={() => { setShowUpcoming(!showUpcoming); setCurrentPage(1); }}
                                    style={{ 
                                        background: showUpcoming ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', 
                                        border: `1px solid ${showUpcoming ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`, 
                                        color: showUpcoming ? '#3b82f6' : 'rgba(255,255,255,0.4)', 
                                        padding: '0 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', height: '38px' 
                                    }}
                                >
                                    <Clock size={14} /> PRÓXIMOS
                                </button>
                            </>
                        )}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0 14px' }}>
                            <Search size={15} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Buscar..."
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '13px', padding: '10px 0', width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
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
                </div>

                {/* ── VIEW MODE TOGGLE ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'grid', icon: <LayoutGrid size={16} />, label: 'GRADE' },
                        { id: 'list', icon: <List size={16} />, label: 'LISTA' },
                        { id: 'kanban', icon: <Trello size={16} />, label: 'KANBAN' }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => { setViewMode(mode.id as any); setCurrentPage(1); }}
                            className={`page-btn ${viewMode === mode.id ? 'active' : ''}`}
                            style={{ padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '1px' }}
                        >
                            {mode.icon} {mode.label}
                        </button>
                    ))}
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
                    <>
                        {viewMode === 'grid' && renderGridView()}
                        {viewMode === 'list' && renderListView()}
                        {viewMode === 'kanban' && renderKanbanView()}

                        {/* ── PAGINATION ── */}
                        {viewMode !== 'kanban' && filteredSubmissions.length > itemsPerPage && (
                            <div className="pagination-bar">
                                <button 
                                    className="page-btn" 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    <ChevronLeft size={16} /> ANTERIOR
                                </button>
                                
                                {Array.from({ length: Math.ceil(filteredSubmissions.length / itemsPerPage) }).map((_, i) => {
                                    const pageNum = i + 1;
                                    // Show first, last, and pages around current
                                    if (pageNum === 1 || pageNum === Math.ceil(filteredSubmissions.length / itemsPerPage) || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                        return (
                                            <button 
                                                key={i} 
                                                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) return <span key={i} style={{ color: 'rgba(255,255,255,0.2)' }}>...</span>;
                                    return null;
                                })}

                                <button 
                                    className="page-btn" 
                                    disabled={currentPage === Math.ceil(filteredSubmissions.length / itemsPerPage)} 
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    PRÓXIMO <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
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
