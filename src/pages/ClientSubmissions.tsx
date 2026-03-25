import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Trash2, 
    User, 
    ImageIcon, 
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
    const [activeTab, setActiveTab] = useState<'available' | 'mine' | 'all'>('mine');
    const [employees, setEmployees] = useState<string[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClientFilter, setSelectedClientFilter] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [showUpcoming, setShowUpcoming] = useState(false);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
    const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('');

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getClientSubmissions();
            setSubmissions(Array.isArray(data) ? data : []);
            
            if (['ADMIN', 'EMPLOYEE'].includes(user?.role || '')) {
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
        if (user?.role === 'ADMIN') {
            setActiveTab('available');
        }
        const interval = setInterval(loadSubmissions, 20000);
        return () => clearInterval(interval);
    }, [user?.role]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Deseja realmente excluir este envio?")) return;
        await dbService.deleteClientSubmission(id);
        loadSubmissions();
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

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

        const matchesStatus = !selectedStatusFilter || s.status === selectedStatusFilter;
        const currentType = (s.ads && s.ads.length > 0 ? s.ads[0]?.template_type : s.template_type) || 'TEXT';
        const matchesType = !selectedTypeFilter || currentType === selectedTypeFilter;
        const matchesEmployee = !selectedEmployeeFilter || s.assigned_to === selectedEmployeeFilter;

        return matchesSearch && matchesClient && matchesStart && matchesEnd && matchesUpcoming && matchesStatus && matchesType && matchesEmployee;
    });

    const filteredSubmissions = activeTab === 'available' ? allFiltered.filter(s => !s.assigned_to)
        : activeTab === 'mine' ? allFiltered.filter(s => s.assigned_to === user?.name)
        : allFiltered;

    const paginatedSubmissions = filteredSubmissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const selectAll = () => {
        if (selectedIds.length === filteredSubmissions.length) setSelectedIds([]);
        else setSelectedIds(filteredSubmissions.map(s => s.id));
    };

    const handlePreFillCreator = (sub: ClientSubmission) => {
        const adsToFill = sub.ads && sub.ads.length > 0 ? sub.ads : [{
            ad_name: sub.profile_name,
            template_type: sub.template_type || 'TEXT',
            media_url: sub.media_url,
            ad_copy: sub.ad_copy,
            button_link: sub.button_link,
            variables: []
        }];

        const preFillData = {
            clientId: sub.user_id,
            clientName: sub.client_name,
            templateName: `${sub.profile_name.toLowerCase().replace(/[\s-@]/g, '_')}_${sub.ddd}`,
            templateType: sub.template_type || adsToFill[0].template_type || 'TEXT',
            senderNumber: sub.sender_number || '',
            rows: adsToFill.map((ad, idx) => ({
                id: idx + 1,
                suffix: ad.ad_name ? `_${ad.ad_name.toLowerCase().replace(/[\s-@]/g, '_')}` : `_v${idx + 1}`,
                sender: sub.sender_number || '',
                headerType: ad.template_type || sub.template_type || 'TEXT',
                mediaUrl: ad.media_url || ad.ad_copy_file || '',
                var1: ad.variables?.[0] || 'Leandro',
                var2: ad.variables?.[1] || 'recebemos a confirmação do pagamento referente ao protocolo nº 7164427, realizado em 12/10/2025',
                var3: ad.variables?.[2] || 'O comprovante digital já se encontra disponível para conferência',
                var4: ad.variables?.[3] || 'acessar o comprovante digital #54333 e verificar a entrega',
                buttonUrl: ''
            }))
        };

        navigate('/templates', { state: { preFillData, activeTab: adsToFill.length > 1 ? 'BULK' : 'MODEL' } });
    };

    const handleBulkRedirectToCreator = () => {
        if (selectedIds.length === 0) return;
        
        const selectedSubmissions = submissions.filter(s => selectedIds.includes(s.id));
        
        const campaigns = selectedSubmissions.map((sub) => {
            const adsToFill = sub.ads && sub.ads.length > 0 ? sub.ads : [{
                ad_name: sub.profile_name,
                template_type: sub.template_type || 'TEXT',
                media_url: sub.media_url,
                ad_copy: sub.ad_copy,
                button_link: sub.button_link,
                variables: []
            }];

            return {
                id: `sub_${sub.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                prefix: `${sub.profile_name.toLowerCase().replace(/[\s-@]/g, '_')}_${sub.ddd}_`,
                rows: adsToFill.map((ad, idx) => ({
                    suffix: ad.ad_name ? ad.ad_name.toLowerCase().replace(/[\s-@]/g, '_') : `v${idx + 1}`,
                    sender: sub.sender_number || '',
                    headerType: ad.template_type || sub.template_type || 'TEXT',
                    mediaUrl: ad.media_url || ad.ad_copy_file || '',
                    var1: ad.variables?.[0] || 'Leandro',
                    var2: ad.variables?.[1] || 'recebemos a confirmação do pagamento referente ao protocolo nº 7164427, realizado em 12/10/2025',
                    var3: ad.variables?.[2] || 'O comprovante digital já se encontra disponível para conferência',
                    var4: ad.variables?.[3] || 'acessar o comprovante digital #54333 e verificar a entrega',
                    buttonUrls: [''],
                    buttonTexts: ['Clique Aqui'],
                    hasButtons: !!ad.button_link
                }))
            };
        });

        const preFillData = {
            clientId: selectedSubmissions[0].user_id,
            clientName: selectedSubmissions[0].client_name,
            campaigns: campaigns
        };

        navigate('/templates', { state: { preFillData, activeTab: 'BULK' } });
    };

    const handleAssign = async (id: number, employeeName: string) => {
        try {
            await dbService.updateClientSubmission(id, { assigned_to: employeeName || null });
            loadSubmissions();
        } catch (err) {
            console.error("Error assigning task:", err);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Deseja realmente excluir ${selectedIds.length} envios selecionados?`)) return;
        setIsProcessing(true);
        try {
            for (const id of selectedIds) {
                await dbService.deleteClientSubmission(id);
            }
            alert("Exclusão concluída!");
            setSelectedIds([]);
            loadSubmissions();
        } catch (err) {
            console.error("Bulk delete error:", err);
            alert("Erro ao excluir envios em lote.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkAssign = async () => {
        if (selectedIds.length === 0) return;
        const employee = window.prompt(`Digite o nome do funcionário para atribuir ${selectedIds.length} envios:\nOpções: ${employees.join(', ')}`);
        if (!employee) return;
        
        setIsProcessing(true);
        try {
            for (const id of selectedIds) {
                await dbService.updateClientSubmissionStatus(id, undefined, employee);
            }
            alert("Atribuição concluída!");
            setSelectedIds([]);
            loadSubmissions();
        } catch (err) {
            console.error("Bulk assign error:", err);
            alert("Erro ao atribuir envios em lote.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkStatusChange = async () => {
        if (selectedIds.length === 0) return;
        const newStatus = window.prompt(`Digite o novo status para ${selectedIds.length} envios:\n(PENDENTE, EM ANDAMENTO, GERADO, CONCLUIDO, CANCELADO)`);
        if (!newStatus) return;
        
        const statusUpper = newStatus.toUpperCase();
        setIsProcessing(true);
        try {
            for (const id of selectedIds) {
                await dbService.updateClientSubmissionStatus(id, statusUpper);
            }
            alert("Status atualizado com sucesso!");
            setSelectedIds([]);
            loadSubmissions();
        } catch (err) {
            console.error("Bulk status error:", err);
            alert("Erro ao alterar status em lote.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getTemplateIcon = (type: string) => {
        if (type === 'image') return <ImageIcon size={14} className="text-purple-400" />;
        if (type === 'video') return <Video size={14} className="text-blue-400" />;
        return <FileText size={14} style={{ opacity: 0.3 }} />;
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
                            <button onClick={e => { e.stopPropagation(); handleDelete(s.id); }} style={{ padding: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--surface-border-subtle)', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                        <div style={{ position: 'absolute', top: '18px', left: '18px' }}>
                            <div style={{ width: 20, height: 20, borderRadius: '6px', border: selectedIds.includes(s.id) ? '1.5px solid var(--primary-color)' : '1.5px solid var(--surface-border-subtle)', background: selectedIds.includes(s.id) ? 'var(--primary-color)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
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
                            {s.profile_photo ? <img src={s.profile_photo} alt="" style={{ width: 48, height: 48, borderRadius: '14px', objectFit: 'cover', border: '1.5px solid var(--surface-border-subtle)', flexShrink: 0 }} /> : <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--card-bg-subtle)', border: '1.5px solid var(--surface-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={22} style={{ opacity: 0.2 }} /></div>}
                            <div style={{ overflow: 'hidden' }}><h4 style={{ margin: 0, fontWeight: 900, fontSize: '15px', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.profile_name}</h4>{s.client_name && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>Cliente: {s.client_name}</div>}<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '3px' }}><span style={{ fontSize: '10px', color: 'var(--primary-color)', fontWeight: 900 }}>DDD {s.ddd}</span><span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {formatDate(s.timestamp)}</span></div></div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                            <div style={{ flex: 1, background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {getTemplateIcon((s.template_type || s.ads?.[0]?.template_type || 'none'))}
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    {(s.template_type || s.ads?.[0]?.template_type || 'none').toUpperCase()}
                                </span>
                            </div>
                            {adCount > 0 && (
                                <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Layers size={13} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)' }}>{adCount}</span>
                                </div>
                            )}
                            {s.spreadsheet_url && (
                                <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center' }}>
                                    <FileSpreadsheet size={13} style={{ color: '#22c55e' }} />
                                </div>
                            )}
                        </div>

                        {(s.ad_copy || s.ads?.[0]?.ad_copy) && (
                            <div style={{ background: 'var(--card-bg-subtle)', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', border: '1px solid var(--surface-border-subtle)', overflow: 'hidden', maxHeight: '52px' }}>
                                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, overflow: 'hidden' }}>
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
                        {['ADMIN', 'EMPLOYEE'].includes(user?.role || '') && (
                            <div style={{ marginBottom: '14px' }} onClick={e => e.stopPropagation()}>
                                <select value={s.assigned_to || ''} onChange={e => handleAssign(s.id, e.target.value)} style={{ width: '100%', background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '10px', padding: '10px', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, outline: 'none' }}>
                                    <option value="">Atribuir...</option>
                                    {employees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                                </select>
                            </div>
                        )}
                        {s.status !== 'CONCLUIDO' && (
                            <div className="flex gap-2" style={{ marginBottom: '14px' }}>
                                <button 
                                    className="btn flex-1" 
                                    onClick={e => { e.stopPropagation(); handlePreFillCreator(s); }}
                                    style={{ background: '#f97316', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Layers size={14} /> PREENCHER NO CREATOR
                                </button>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 900, fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{s.profile_name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--primary-color)', opacity: 0.6, fontWeight: 800 }}>{s.id.toString().padStart(6, '0')}...</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>pt_BR</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>RESPONSÁVEL</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: s.assigned_to ? 'rgba(172,248,0,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                                <User size={10} style={{ color: s.assigned_to ? 'var(--primary-color)' : 'var(--text-muted)' }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '11px', color: s.assigned_to ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {s.assigned_to || 'Ninguém'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '120px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>DETALHES</span>
                        <div className="flex-col">
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {s.client_name ? `Cliente: ${s.client_name}` : 'Sem Cliente'}
                            </span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                DDD: {s.ddd || '--'} | Ad: {s.ads && s.ads.length > 0 ? s.ads[0].ad_name : 'Sem Ad'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="list-badge" style={{
                            borderColor: s.status === 'CONCLUIDO' ? 'rgba(16,185,129,0.3)' : s.status === 'GERADO' ? 'rgba(34,197,94,0.3)' : 'rgba(172,248,0,0.3)',
                            color: s.status === 'CONCLUIDO' ? '#10b981' : s.status === 'GERADO' ? '#22c55e' : 'var(--primary-color)',
                            background: s.status === 'CONCLUIDO' ? 'rgba(16,185,129,0.05)' : s.status === 'GERADO' ? 'rgba(34,197,94,0.05)' : 'rgba(172,248,0,0.05)'
                        }}>
                            {s.status === 'CONCLUIDO' ? 'CONCLUÍDO' : s.status}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>
                        <Calendar size={14} opacity={0.5} />
                        {formatDate(s.timestamp)}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {s.status !== 'CONCLUIDO' && (
                            <button 
                                className="list-btn" 
                                onClick={e => { e.stopPropagation(); handlePreFillCreator(s); }}
                                style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}
                                title="Preencher no Creator"
                            >
                                <Layers size={16} />
                            </button>
                        )}
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
            { id: 'CONCLUIDO', title: 'CONCLUIDO', filter: (s: ClientSubmission) => s.status === 'CONCLUIDO' }
        ];
        return (
            <div className="kanban-board">
                {columns.map(col => (
                    <div key={col.id} className="kanban-column">
                        <div className="kanban-header">
                            <span className="kanban-title">{col.title}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 900 }}>{filteredSubmissions.filter(col.filter).length}</span>
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
                                    {s.status !== 'CONCLUIDO' && (
                                        <button 
                                            onClick={e => { e.stopPropagation(); handlePreFillCreator(s); }}
                                            style={{ width: '100%', marginTop: '12px', background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)', padding: '8px', borderRadius: '8px', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                        >
                                            <Layers size={12} /> CREATOR
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', padding: '32px 24px', boxSizing: 'border-box', overflowX: 'hidden' }}>
            <style>{`
                * { box-sizing: border-box; }
                .cs-card {
                    background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle);
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
                    position: fixed; inset: 0; background: var(--overlay-bg); z-index: 9999;
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
                    width: 100%; background: var(--card-bg-subtle); color: var(--text-secondary); font-weight: 900;
                    font-size: 11px; letter-spacing: 1px; padding: 12px; border-radius: 12px; border: 1px solid var(--surface-border-subtle);
                    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .open-btn:hover { background: var(--surface-hover); color: var(--text-primary); border-color: var(--surface-border); }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 24px; }
                .chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; margin-top: 16px; }

                /* List View Styles */
                .list-container { display: flex; flex-direction: column; gap: 8px; width: 100%; }
                .list-row {
                    display: grid;
                    grid-template-columns: 1.8fr 0.4fr 1.2fr 2fr 0.8fr 1fr 150px;
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
                    background: var(--card-bg-subtle); border: 1px solid var(--surface-border-subtle); 
                    color: var(--text-muted); cursor: pointer; transition: all 0.2s;
                }
                .list-btn:hover { background: var(--surface-hover); color: var(--text-primary); border-color: var(--surface-border); }
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
                    padding: 8px 12px; border-radius: 8px; background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle); color: var(--text-muted);
                    cursor: pointer; font-weight: 800; font-size: 12px; transition: all 0.2s;
                    display: flex; align-items: center; gap: 4px;
                }
                .page-btn:hover:not(:disabled) { background: var(--surface-hover); color: var(--text-primary); }
                .page-btn.active { background: var(--primary-color); color: #000; border-color: var(--primary-color); }
                .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
            `}</style>

            <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
                <div style={{ marginBottom: '36px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '3px', color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.8 }}>ÁREA DO CLIENTE</p>
                            <h1 style={{ fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-1.5px', margin: 0, lineHeight: 1 }}>Dashboard de Clientes</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginTop: '6px' }}>
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
                                style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', color: 'var(--text-secondary)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
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
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={handleBulkRedirectToCreator}
                                        disabled={isProcessing}
                                        style={{ background: 'rgba(172,248,0,0.1)', color: 'var(--primary-color)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', border: '1px solid rgba(172,248,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Layers size={15} />
                                        PREENCHER LOTE ({selectedIds.length})
                                    </button>
                                    <button
                                        onClick={handleBulkAssign}
                                        disabled={isProcessing}
                                        style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, fontSize: '10px', border: '1px solid rgba(96,165,240,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <User size={14} /> ATRIBUIR
                                    </button>
                                    <button
                                        onClick={handleBulkStatusChange}
                                        disabled={isProcessing}
                                        style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, fontSize: '10px', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Activity size={14} /> STATUS
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={isProcessing}
                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, fontSize: '10px', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Trash2 size={14} /> EXCLUIR
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="stats-grid">
                        {(['ADMIN', 'EMPLOYEE'].includes(user?.role || '') ? [
                            { label: 'Total', value: allSubmissions.length, color: 'var(--text-secondary)' },
                            { label: 'Em andamento', value: allSubmissions.filter(isAccepted).length, color: '#f59e0b' },
                            { label: 'Total Entregues', value: totalEntregues.toLocaleString('pt-BR'), color: '#22c55e' },
                            { label: 'Investimento Clientes', value: `R$ ${totalFaturado.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: 'var(--primary-color)' },
                        ] : [
                            { label: 'Total', value: allSubmissions.length, color: 'var(--text-secondary)' },
                            { label: 'Disponíveis', value: allFiltered.filter(s => !s.assigned_to).length, color: 'var(--primary-color)' },
                            { label: 'Em andamento', value: allFiltered.filter(isAccepted).length, color: '#f59e0b' },
                            { label: 'Geradas', value: allFiltered.filter(s => s.status === 'GERADO').length, color: '#22c55e' },
                        ]).map(stat => (
                            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', padding: '18px 24px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                <span style={{ fontSize: '28px', fontWeight: 900, color: stat.color, lineHeight: 1, display: 'block', marginBottom: '4px' }}>{stat.value}</span>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {allSubmissions.length > 0 && (() => {
                        const total = allSubmissions.length;
                        const avail = allFiltered.filter(s => !s.assigned_to).length;
                        const inProgress = allSubmissions.filter(isAccepted).length;
                        const done = allSubmissions.filter(s => s.status === 'GERADO').length;
                        const cancelled = allSubmissions.filter(s => s.status === 'CANCELADO').length;

                        const byType: Record<string, number> = {};
                        allSubmissions.forEach(s => {
                            const t = (s.ads && s.ads.length > 0 ? s.ads[0]?.template_type : s.template_type) || 'none';
                            byType[t] = (byType[t] || 0) + 1;
                        });
                        const typeColors: Record<string, string> = { image: '#a855f7', video: '#3b82f6', none: 'var(--text-muted)' };

                        return (
                            <div className="chart-grid">
                                <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '16px', padding: '18px' }}>
                                    <p style={{ margin: '0 0 14px 0', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Distribuição de Status</p>
                                    {[
                                        { label: 'Disponíveis', value: avail, color: 'var(--primary-color)' },
                                        { label: 'Em andamento', value: inProgress, color: '#f59e0b' },
                                        { label: 'Geradas', value: done, color: '#22c55e' },
                                        { label: 'Canceladas', value: cancelled, color: '#ef4444' },
                                    ].map(row => (
                                        <div key={row.label} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{row.label}</span>
                                                <span style={{ fontSize: '11px', fontWeight: 900, color: row.color }}>{row.value}</span>
                                            </div>
                                            <div style={{ height: '5px', background: 'var(--card-bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${total > 0 ? (row.value / total) * 100 : 0}%`, background: row.color, borderRadius: '999px', transition: 'width 0.6s ease', boxShadow: `0 0 8px ${row.color}` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '16px', padding: '18px' }}>
                                    <p style={{ margin: '0 0 14px 0', fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Tipos de Template</p>
                                    {Object.entries(byType).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
                                        <div key={type} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{type}</span>
                                                <span style={{ fontSize: '11px', fontWeight: 900, color: typeColors[type] || 'var(--text-muted)' }}>{count}</span>
                                            </div>
                                            <div style={{ height: '5px', background: 'var(--card-bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${total > 0 ? (count / total) * 100 : 0}%`, background: typeColors[type] || 'rgba(255,255,255,0.3)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '14px', padding: '4px' }}>
                        {tabs.map(tab => (
                            <button key={tab.id} className={`tab-pill ${activeTab === tab.id ? 'active' : 'inactive'}`} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}>
                                {tab.icon} {tab.label} <span className={`count-badge ${activeTab === tab.id ? 'active' : 'inactive'}`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
                        {['ADMIN', 'EMPLOYEE'].includes(user?.role || '') && (
                            <>
                                <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', padding: '0 14px' }}>
                                    <select value={selectedClientFilter} onChange={e => { setSelectedClientFilter(e.target.value); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', outline: 'none', color: selectedClientFilter ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700, padding: '10.5px 0', cursor: 'pointer', appearance: 'none' }}>
                                        <option value="" style={{ background: '#0f172a' }}>CLIENTES</option>
                                        {clients.map(c => <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', padding: '0 14px' }}>
                                    <select value={selectedStatusFilter} onChange={e => { setSelectedStatusFilter(e.target.value); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', outline: 'none', color: selectedStatusFilter ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700, padding: '10.5px 0', cursor: 'pointer', appearance: 'none' }}>
                                        <option value="" style={{ background: '#0f172a' }}>STATUS</option>
                                        <option value="PENDENTE" style={{ background: '#0f172a' }}>PENDENTE</option>
                                        <option value="GERADO" style={{ background: '#0f172a' }}>GERADO</option>
                                        <option value="CONCLUIDO" style={{ background: '#0f172a' }}>CONCLUÍDO</option>
                                        <option value="CANCELADO" style={{ background: '#0f172a' }}>CANCELADO</option>
                                    </select>
                                </div>
                                <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', padding: '0 14px' }}>
                                    <select value={selectedEmployeeFilter} onChange={e => { setSelectedEmployeeFilter(e.target.value); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', outline: 'none', color: selectedEmployeeFilter ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700, padding: '10.5px 0', cursor: 'pointer', appearance: 'none' }}>
                                        <option value="" style={{ background: '#0f172a' }}>FUNCIONÁRIOS</option>
                                        {employees.map(emp => <option key={emp} value={emp} style={{ background: '#0f172a' }}>{emp.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', padding: '0 14px' }}>
                                    <select value={selectedTypeFilter} onChange={e => { setSelectedTypeFilter(e.target.value); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', outline: 'none', color: selectedTypeFilter ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700, padding: '10.5px 0', cursor: 'pointer', appearance: 'none' }}>
                                        <option value="" style={{ background: '#0f172a' }}>TIPO</option>
                                        <option value="image" style={{ background: '#0f172a' }}>IMAGEM</option>
                                        <option value="video" style={{ background: '#0f172a' }}>VÍDEO</option>
                                        <option value="none" style={{ background: '#0f172a' }}>TEXTO / OUTRO</option>
                                    </select>
                                </div>
                                <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)' }}>DE:</span>
                                    <input type="date" value={dateRange.start} onChange={e => { setDateRange(p => ({ ...p, start: e.target.value })); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 700, outline: 'none' }} />
                                </div>
                                <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)' }}>ATÉ:</span>
                                    <input type="date" value={dateRange.end} onChange={e => { setDateRange(p => ({ ...p, end: e.target.value })); setCurrentPage(1); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 700, outline: 'none' }} />
                                </div>
                                <button onClick={() => { setShowUpcoming(!showUpcoming); setCurrentPage(1); }} style={{ background: showUpcoming ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${showUpcoming ? '#3b82f6' : 'var(--surface-border-subtle)'}`, color: showUpcoming ? '#3b82f6' : 'var(--text-muted)', padding: '0 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}>
                                    <Clock size={14} /> PRÓXIMOS
                                </button>
                            </>
                        )}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', padding: '0 14px' }}>
                            <Search size={15} style={{ color: 'var(--text-muted)' }} />
                            <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Buscar..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', padding: '10px 0', width: '100%' }} />
                        </div>
                        <button onClick={selectAll} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>
                            {selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0 ? 'DESSELECIONAR' : 'SEL. TUDO'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', gap: '8px' }}>
                    {[{ id: 'grid', icon: <LayoutGrid size={16} />, label: 'GRADE' }, { id: 'list', icon: <List size={16} />, label: 'LISTA' }, { id: 'kanban', icon: <Trello size={16} />, label: 'KANBAN' }].map(mode => (
                        <button key={mode.id} onClick={() => { setViewMode(mode.id as any); setCurrentPage(1); }} className={`page-btn ${viewMode === mode.id ? 'active' : ''}`}>
                            {mode.icon} {mode.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div style={{ padding: '80px', textAlign: 'center' }}><div style={{ width: 48, height: 48, border: '3px solid var(--surface-border-subtle)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} /> <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '12px', letterSpacing: '2px' }}>CARREGANDO...</span></div>
                ) : filteredSubmissions.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', opacity: 0.3 }}><Inbox size={70} strokeWidth={1} style={{ margin: '0 auto 16px' }} /><p style={{ fontWeight: 900, fontSize: '1.1rem' }}>SEM REGISTROS</p></div>
                ) : (
                    <>
                        {viewMode === 'grid' && renderGridView()}
                        {viewMode === 'list' && renderListView()}
                        {viewMode === 'kanban' && renderKanbanView()}

                        {viewMode !== 'kanban' && filteredSubmissions.length > itemsPerPage && (
                            <div className="pagination-bar">
                                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /> ANTERIOR</button>
                                {Array.from({ length: Math.ceil(filteredSubmissions.length / itemsPerPage) }).map((_, i) => (
                                    <button key={i} className={`page-btn ${currentPage === i+1 ? 'active' : ''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                                ))}
                                <button className="page-btn" disabled={currentPage === Math.ceil(filteredSubmissions.length / itemsPerPage)} onClick={() => setCurrentPage(p => p + 1)}>PRÓXIMO <ChevronRight size={16} /></button>
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
};

export default ClientSubmissions;
