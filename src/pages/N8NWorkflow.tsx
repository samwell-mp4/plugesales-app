import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, 
    User, 
    MessageSquare, 
    RefreshCcw,
    ArrowLeft,
    FileSpreadsheet,
    ShieldCheck,
    Activity,
    Database,
    Phone,
    Smartphone,
    Loader2,
    MessageCircle,
    Trash2,
    CheckSquare,
    Square,
    ChevronDown,
    X,
    FileUp,
    Download,
    List,
    Zap,
    Plus,
    Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const N8NWorkflow = () => {
    const { user } = useAuth() as any;
    const [searchNumber, setSearchNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [monitorLeads, setMonitorLeads] = useState<any[]>([]);
    const [campaignLeads, setCampaignLeads] = useState<any[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('Tudo');
    const [error, setError] = useState<string | null>(null);
    const [allData, setAllData] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'chat' | 'list'>('chat');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterResult, setFilterResult] = useState<any>(null);
    const [isFiltering, setIsFiltering] = useState(false);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [isCampaignFilterActive, setIsCampaignFilterActive] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        removeGreen: true,
        removeCold: true,
        removeBlack: true,
        removeAny: false
    });
    const [activeTab, setActiveTab] = useState<'monitor' | 'campaign'>('monitor');
    const uniqueRecipients = activeTab === 'monitor' ? monitorLeads : campaignLeads;
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (searchNumber) handleSearch();
        fetchCampaigns();
    }, [filterStatus]);

    useEffect(() => {
        if (activeTab === 'campaign' && selectedCampaign) {
            fetchCampaignLeads();
        }
    }, [selectedCampaign, activeTab]);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/campaigns');
            const data = await res.json();
            if (Array.isArray(data)) setCampaigns(data);
        } catch (err) {
            console.error("Error fetching campaigns:", err);
        }
    };

    const handleCreateCampaign = async () => {
        const name = prompt("Nome da nova campanha:");
        if (!name) return;

        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description: 'Criada via Monitor' })
            });
            if (res.ok) {
                alert("Campanha criada com sucesso!");
                fetchCampaigns();
                setSelectedCampaign(name);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (selectedRecipient) {
            scrollToBottom();
        }
    }, [selectedRecipient, messages]);

    const handleSearch = async () => {
        if (!searchNumber.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/monitor/logs');
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            const text = await response.text();
            if (!text || text.trim() === '') {
                setMonitorLeads([]);
                return;
            }

            const parsed = JSON.parse(text);
            const rawMsgs = Array.isArray(parsed) ? parsed : (parsed?.dados || []);
            setAllData(rawMsgs);
            processMessages(rawMsgs, searchNumber);
        } catch (err: any) {
            console.error("Monitor Error:", err);
            setError("Falha ao buscar dados. Verifique o número e tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCampaignLeads = async () => {
        if (!selectedCampaign) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/monitor/campaign-leads?campanha=${encodeURIComponent(selectedCampaign)}`);
            if (!response.ok) throw new Error(`Erro: ${response.status}`);
            const data = await response.json();
            setCampaignLeads(data);
            setViewMode('list'); 
        } catch (err: any) {
            console.error("Campaign Fetch Error:", err);
            setError("Falha ao buscar leads da campanha.");
        } finally {
            setIsLoading(false);
        }
    };

    const processMessages = (rawMsgs: any[], searchSource: string) => {
        const cleanSearch = searchSource.replace(/\D/g, '');
        const recipientsMap = new Map();
        
        rawMsgs.forEach(msg => {
            const r = (msg.remetente || '').replace(/\D/g, '');
            const d = (msg.destinatario || '').replace(/\D/g, '');
            
            if (r === cleanSearch || d === cleanSearch) {
                const otherParty = r === cleanSearch ? d : r;
                if (!otherParty) return;

                if (isCampaignFilterActive && selectedCampaign && msg.campanha !== selectedCampaign) {
                    return;
                }

                if (!recipientsMap.has(otherParty)) {
                    recipientsMap.set(otherParty, {
                        id: otherParty,
                        name: msg.nome && msg.nome !== 'Lead Planilha' ? msg.nome : `Contato ${otherParty}`,
                        lastMessage: msg.mensagem,
                        lastDate: msg.data_final,
                        status: msg.status || 'Default',
                        allMsgs: []
                    });
                }
                
                recipientsMap.get(otherParty).allMsgs.push({
                    id: msg.id_final || Math.random(),
                    id_final: msg.id_final,
                    direction: r === cleanSearch ? 'OUTBOUND' : 'INBOUND',
                    content: { text: msg.mensagem },
                    createdAt: msg.data_final || new Date().toISOString()
                });
            }
        });

        const sorted = Array.from(recipientsMap.values()).sort((a: any, b: any) => 
            new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
        );

        setMonitorLeads(sorted);
    };

    const selectRecipient = (recipientId: string) => {
        const recipient = uniqueRecipients.find(r => r.id === recipientId);
        if (recipient) {
            setSelectedRecipient(recipientId);
            const sortedMsgs = [...(recipient.allMsgs || [])].sort((a: any, b: any) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setMessages(sortedMsgs);
        }
    };

    const updateStatus = async (recipientId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/monitor/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: recipientId,
                    status: newStatus,
                    campanha: selectedCampaign
                })
            });

            if (response.ok) {
                const updater = (prev: any[]) => prev.map(r => r.id === recipientId ? { ...r, status: newStatus } : r);
                setMonitorLeads(updater);
                setCampaignLeads(updater);
            }
        } catch (err) {
            console.error("Status Update Error:", err);
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedIds.length === 0) return;

        if (action === 'delete') {
            if (!window.confirm(`Deseja realmente excluir todos os registros de ${selectedIds.length} contatos?`)) return;
            setIsLoading(true);
            try {
                const res = await fetch('/api/monitor/bulk-delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipientIds: selectedIds })
                });
                if (res.ok) {
                    const filterer = (prev: any[]) => prev.filter(r => !selectedIds.includes(r.id));
                    setMonitorLeads(filterer);
                    setCampaignLeads(filterer);
                    setSelectedIds([]);
                }
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
            return;
        }

        setIsLoading(true);
        try {
            const isCampaignAction = action.startsWith('assign_campaign_');
            const targetStatus = isCampaignAction ? null : action;
            const targetCampaign = isCampaignAction ? action.replace('assign_campaign_', '') : selectedCampaign;

            const res = await fetch('/api/monitor/bulk-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    recipientIds: selectedIds, 
                    status: targetStatus,
                    campanha: targetCampaign 
                })
            });
            if (res.ok) {
                const mapper = (prev: any[]) => prev.map(r => 
                    selectedIds.includes(r.id) ? { 
                        ...r, 
                        status: targetStatus || r.status,
                        campanha: targetCampaign || r.campanha 
                    } : r
                );
                setMonitorLeads(mapper);
                setCampaignLeads(mapper);
                setSelectedIds([]);
            }
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const toggleSelectAll = () => {
        const filteredIds = uniqueRecipients
            .filter(r => filterStatus === 'Tudo' || r.status === filterStatus)
            .map(r => r.id);
        
        if (selectedIds.length === filteredIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredIds);
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredRecipients = uniqueRecipients.filter(r => {
        const matchesStatus = filterStatus === 'Tudo' || r.status === filterStatus;
        const matchesSearch = (r.name || '').toLowerCase().includes(localSearchQuery.toLowerCase()) || 
                              (r.id || '').includes(localSearchQuery);
        return matchesStatus && matchesSearch;
    });

    const downloadCSV = (statusOverride?: string) => {
        const targetStatus = statusOverride || filterStatus;
        const filteredData = uniqueRecipients.filter(r => targetStatus === 'Tudo' || r.status === targetStatus);
        
        if (filteredData.length === 0) {
            if (!statusOverride) alert("Nenhum dado para baixar.");
            return;
        }

        const headers = ['ID', 'Nome', 'Status', 'Ultima Mensagem', 'Data'];
        const csvRows = [
            headers.join(','),
            ...filteredData.map(row => [
                `"${row.id}"`,
                `"${row.name}"`,
                `"${row.status}"`,
                `"${(row.lastMessage || '').replace(/"/g, '""')}"`,
                `"${row.lastDate}"`
            ].join(','))
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `monitor_n8n_${targetStatus.toLowerCase().replace(/ /g, '_')}.csv`);
        link.click();
    };

    const downloadIndividualLists = () => {
        const lists = ['Green List', 'Cold List', 'Black List'];
        let hasData = false;
        lists.forEach(l => {
            const data = uniqueRecipients.filter(r => r.status === l);
            if (data.length > 0) {
                downloadCSV(l);
                hasData = true;
            }
        });
        if (!hasData) alert("Nenhuma lista possui contatos para baixar.");
    };

    const handleFilterPro = async (file: File) => {
        setIsFiltering(true);
        try {
            const text = await file.text();
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
            const numbers = lines.map(line => line.split(',')[0].replace(/\D/g, '')).filter(n => n.length > 5);

            const res = await fetch('/api/monitor/filter-pro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phoneNumbers: numbers, 
                    options: filterOptions,
                    campanha: selectedCampaign 
                })
            });

            const data = await res.json();
            if (res.ok) {
                setFilterResult(data);
            } else {
                alert(data.error || "Erro ao processar.");
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao ler arquivo.");
        } finally {
            setIsFiltering(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Green List': return '#22c55e';
            case 'Black List': return '#ef4444';
            case 'Cold List': return '#3b82f6';
            default: return 'var(--text-muted)';
        }
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } catch (e) { return ''; }
    };

    if (monitorLeads.length === 0 && !isLoading && activeTab === 'monitor') {
        return (
            <div className="crm-container" style={{ padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '20px', width: 'fit-content', margin: '0 auto 40px auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={() => setActiveTab('monitor')} style={{ padding: '12px 30px', borderRadius: '16px', background: (activeTab as string) === 'monitor' ? 'var(--primary-color)' : 'transparent', color: (activeTab as string) === 'monitor' ? 'black' : 'rgba(255,255,255,0.4)', border: 'none', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}>MONITOR DE NÚMERO</button>
                    <button onClick={() => setActiveTab('campaign')} style={{ padding: '12px 30px', borderRadius: '16px', background: (activeTab as string) === 'campaign' ? 'var(--primary-color)' : 'transparent', color: (activeTab as string) === 'campaign' ? 'black' : 'rgba(255,255,255,0.4)', border: 'none', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}>GESTÃO DE CAMPANHA</button>
                </div>

                <div className="supreme-card hover-lift" style={{ width: '100%', maxWidth: '600px', padding: '60px', textAlign: 'center' }}>
                    <div style={{ padding: '24px', background: 'var(--primary-gradient)', borderRadius: '25px', color: 'black', display: 'inline-flex', marginBottom: '32px', boxShadow: '0 15px 45px rgba(172, 248, 0, 0.3)' }}>
                        <Database size={48} />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-2px', marginBottom: '12px', background: 'linear-gradient(to right, #fff, var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>MONITOR n8n</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '48px' }}>CONSULTA DE HISTÓRICO POR NÚMERO</p>
                    
                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                        <Phone size={24} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)', opacity: 0.6 }} />
                        <input type="text" className="premium-input" placeholder="Digite o número (ex: 55119...)" value={searchNumber} onChange={(e) => setSearchNumber(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} style={{ paddingLeft: '64px', height: '75px', borderRadius: '24px', width: '100%' }} />
                    </div>
                    
                    <button onClick={handleSearch} className="premium-button" style={{ width: '100%', height: '70px', borderRadius: '22px', fontSize: '1.2rem', fontWeight: 950, letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <Search size={24} /> BUSCAR REGISTROS
                    </button>
                    {error && <p style={{ color: '#ef4444', marginTop: '20px', fontWeight: 700 }}>{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="crm-container" style={{ padding: '40px' }}>
            <style>{`
                .chat-responsive-container { display: grid; grid-template-columns: 400px 1fr; gap: 32px; height: calc(100vh - 180px); min-height: 600px; }
                @media (max-width: 968px) { .chat-responsive-container { display: flex; flex-direction: column; height: auto; } .chat-sidebar-section { width: 100% !important; max-height: 500px; } .messages-area { height: 500px !important; } }
                .supreme-card { background: var(--card-bg-subtle); backdrop-filter: blur(25px); border: 1px solid rgba(172, 248, 0, 0.08); border-radius: 28px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); }
                .supreme-view-btn { padding: 10px 20px; border-radius: 12px; background: transparent; border: none; color: rgba(255,255,255,0.3); cursor: pointer; display: flex; alignItems: center; gap: 8px; font-weight: 800; font-size: 11px; transition: all 0.2s; }
                .supreme-view-btn.active { background: rgba(172, 248, 0, 0.1); color: var(--primary-color); }
                .message-bubble { max-width: 80%; padding: 18px 24px; border-radius: 22px; font-size: 1rem; line-height: 1.6; position: relative; margin-bottom: 8px; }
                .message-outbound { align-self: flex-end; background: var(--primary-color); color: black; border-bottom-right-radius: 4px; font-weight: 600; }
                .message-inbound { align-self: flex-start; background: rgba(255, 255, 255, 0.05); color: white; border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.08); }
                .message-time { display: block; font-size: 10px; margin-top: 8px; opacity: 0.5; }
            `}</style>

            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '20px', width: 'fit-content', margin: '0 auto 40px auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => { setActiveTab('monitor'); }} style={{ padding: '12px 30px', borderRadius: '16px', background: activeTab === 'monitor' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'monitor' ? 'black' : 'rgba(255,255,255,0.4)', border: 'none', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}>MONITOR DE NÚMERO</button>
                <button onClick={() => setActiveTab('campaign')} style={{ padding: '12px 30px', borderRadius: '16px', background: activeTab === 'campaign' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'campaign' ? 'black' : 'rgba(255,255,255,0.4)', border: 'none', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}>GESTÃO DE CAMPANHA</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '300px' }}>
                    {activeTab === 'monitor' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button onClick={() => setMonitorLeads([])} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', color: 'white', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
                            <div>
                                <h1 style={{ margin: 0, fontWeight: 950, fontSize: '2rem', letterSpacing: '-1px', textTransform: 'uppercase', color: 'white' }}>{searchNumber}</h1>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '10px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>Monitor de Histórico</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '0 15px', flex: 1, maxWidth: '400px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 900, opacity: 0.4 }}>CAMPANHA</span>
                            <select value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)} style={{ background: 'none', border: 'none', color: 'white', padding: '12px 5px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', outline: 'none', flex: 1 }}>
                                <option value="">Escolha...</option>
                                {campaigns.map(c => <option key={c.id} value={c.name} style={{ background: '#1a1a1a' }}>{c.name}</option>)}
                            </select>
                            <button onClick={handleCreateCampaign} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}><Plus size={18} /></button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                        <input type="text" placeholder="Pesquisar leads..." value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 45px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', fontSize: '13px', outline: 'none' }} />
                    </div>

                    <div style={{ gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '14px', display: activeTab === 'monitor' ? 'flex' : 'none' }}>
                        <button onClick={() => setViewMode('chat')} className={`supreme-view-btn ${viewMode === 'chat' ? 'active' : ''}`}><MessageCircle size={16} /> CHAT</button>
                        <button onClick={() => setViewMode('list')} className={`supreme-view-btn ${viewMode === 'list' ? 'active' : ''}`}><List size={16} /> LISTA</button>
                    </div>

                    <button onClick={activeTab === 'monitor' ? handleSearch : fetchCampaignLeads} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', fontWeight: 800, cursor: 'pointer' }} className="hover-lift">
                        <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>

                    <button onClick={() => setShowFilterModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'rgba(172, 248, 0, 0.1)', border: '1px solid rgba(172, 248, 0, 0.2)', borderRadius: '16px', color: 'var(--primary-color)', fontWeight: 800, fontSize: '12px' }} className="hover-lift">
                        <Zap size={18} fill="var(--primary-color)" /> FILTRO PRO
                    </button>

                    {uniqueRecipients.length > 0 && activeTab === 'campaign' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => downloadCSV('Green List')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '16px', color: '#22c55e', fontWeight: 800, fontSize: '12px' }} className="hover-lift">
                                <ShieldCheck size={18} /> BAIXAR GREEN
                            </button>
                            <button onClick={() => downloadCSV('Cold List')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', color: '#3b82f6', fontWeight: 800, fontSize: '12px' }} className="hover-lift">
                                <Activity size={18} /> BAIXAR COLD
                            </button>
                            <button onClick={() => downloadCSV('Black List')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', color: '#ef4444', fontWeight: 800, fontSize: '12px' }} className="hover-lift">
                                <Trash2 size={18} /> BAIXAR BLACK
                            </button>
                            <button onClick={downloadIndividualLists} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'rgba(172, 248, 0, 0.1)', border: '1px solid rgba(172, 248, 0, 0.2)', borderRadius: '16px', color: 'var(--primary-color)', fontWeight: 800, fontSize: '12px' }} className="hover-lift">
                                <FileSpreadsheet size={18} /> BAIXAR LISTAS
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', padding: '15px 30px', borderRadius: '25px', border: '1px solid var(--primary-color)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>{selectedIds.length}</div>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>Selecionados</span>
                    </div>
                    <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <select 
                            onChange={(e) => { if (e.target.value) { handleBulkAction(e.target.value); e.target.value = ""; } }} 
                            defaultValue="" 
                            style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'white', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                        >
                            <option value="" disabled>Alterar Status...</option>
                            <option value="Green List">Marcar como GREEN</option>
                            <option value="Cold List">Marcar como COLD</option>
                            <option value="Black List">Marcar como BLACK</option>
                            <option value="delete">Excluir Registros</option>
                        </select>

                        <select 
                            onChange={(e) => { 
                                if (e.target.value) {
                                    handleBulkAction('assign_campaign_' + e.target.value);
                                    e.target.value = "";
                                }
                            }} 
                            defaultValue="" 
                            style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'var(--primary-color)', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                        >
                            <option value="" disabled>Mover para Campanha...</option>
                            {campaigns.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>

                        <button onClick={() => setSelectedIds([])} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>CANCELAR</button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                    <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%' }}></div>
                </div>
            ) : (
                (viewMode === 'chat' && activeTab === 'monitor') ? (
                    <div className="chat-responsive-container">
                        <div className="supreme-card chat-sidebar-section" style={{ display: 'flex', flexDirection: 'column', padding: '24px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                                {['Tudo', 'Green List', 'Cold List', 'Black List'].map(status => (
                                    <button key={status} onClick={() => setFilterStatus(status)} style={{ padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', background: filterStatus === status ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)', color: filterStatus === status ? 'black' : 'white', fontSize: '11px', fontWeight: 950, cursor: 'pointer' }}>{status}</button>
                                ))}
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {filteredRecipients.map((conv: any) => (
                                    <div key={conv.id} style={{ padding: '20px', borderRadius: '22px', background: selectedRecipient === conv.id ? 'rgba(172, 248, 0, 0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: selectedRecipient === conv.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', cursor: 'pointer' }} onClick={() => selectRecipient(conv.id)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(172, 248, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={22} color="var(--primary-color)" /></div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>{conv.name}</div>
                                                <div style={{ fontSize: '10px', color: getStatusColor(conv.status), fontWeight: 900 }}>{conv.status.toUpperCase()}</div>
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.3 }}>{formatTime(conv.lastDate)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="supreme-card messages-area" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {!selectedRecipient ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}><MessageSquare size={64} /></div>
                            ) : (
                                <>
                                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>{selectedRecipient}</h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => updateStatus(selectedRecipient, 'Green List')} style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'none', borderRadius: '10px', fontSize: '10px', fontWeight: 950, cursor: 'pointer' }}>GREEN</button>
                                            <button onClick={() => updateStatus(selectedRecipient, 'Cold List')} style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '10px', fontSize: '10px', fontWeight: 950, cursor: 'pointer' }}>COLD</button>
                                            <button onClick={() => updateStatus(selectedRecipient, 'Black List')} style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '10px', fontSize: '10px', fontWeight: 950, cursor: 'pointer' }}>BLACK</button>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {(messages || []).map((m: any) => (
                                            <div key={m.id} className={`message-bubble message-${m.direction.toLowerCase()}`}>{m.content?.text}<span className="message-time">{formatTime(m.createdAt)}</span></div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="supreme-card" style={{ padding: '32px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>
                                    <th style={{ textAlign: 'left', padding: '0 20px' }}><button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', color: 'var(--primary-color)' }}>{selectedIds.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}</button></th>
                                    <th style={{ textAlign: 'left', padding: '0 20px' }}>Contato</th>
                                    <th style={{ textAlign: 'left', padding: '0 20px' }}>Última Mensagem</th>
                                    <th style={{ textAlign: 'center', padding: '0 20px' }}>Status</th>
                                    <th style={{ textAlign: 'right', padding: '0 20px' }}>Ver</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecipients.map((conv: any) => (
                                    <tr 
                                        key={conv.id} 
                                        onClick={() => toggleSelectOne(conv.id)}
                                        style={{ 
                                            background: selectedIds.includes(conv.id) ? 'rgba(172, 248, 0, 0.05)' : 'rgba(255,255,255,0.02)', 
                                            borderRadius: '18px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-lift"
                                    >
                                        <td style={{ padding: '20px' }} onClick={(e) => e.stopPropagation()}><button onClick={() => toggleSelectOne(conv.id)} style={{ background: 'none', border: 'none', color: selectedIds.includes(conv.id) ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>{selectedIds.includes(conv.id) ? <CheckSquare size={20} /> : <Square size={20} />}</button></td>
                                        <td style={{ padding: '20px' }}>{conv.name}<br/><span style={{ fontSize: '10px', opacity: 0.4 }}>{conv.id}</span></td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.7, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {conv.lastMessage}
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.3, marginTop: '4px' }}>{formatTime(conv.lastDate)}</div>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <button onClick={(e) => { e.stopPropagation(); updateStatus(conv.id, 'Green List'); }} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: conv.status === 'Green List' ? '#22c55e' : 'rgba(34, 197, 94, 0.1)', border: 'none', borderRadius: '8px', color: conv.status === 'Green List' ? 'black' : '#22c55e', cursor: 'pointer', fontWeight: 900 }}>G</button>
                                                <button onClick={(e) => { e.stopPropagation(); updateStatus(conv.id, 'Cold List'); }} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: conv.status === 'Cold List' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: '8px', color: conv.status === 'Cold List' ? 'black' : '#3b82f6', cursor: 'pointer', fontWeight: 900 }}>C</button>
                                                <button onClick={(e) => { e.stopPropagation(); updateStatus(conv.id, 'Black List'); }} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: conv.status === 'Black List' ? '#ef4444' : 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', color: conv.status === 'Black List' ? 'black' : '#ef4444', cursor: 'pointer', fontWeight: 900 }}>B</button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'right' }}>
                                            {activeTab === 'monitor' ? (
                                                <button onClick={() => { selectRecipient(conv.id); setViewMode('chat'); }} style={{ padding: '10px 18px', background: 'rgba(172, 248, 0, 0.1)', border: 'none', borderRadius: '12px', color: 'var(--primary-color)', fontWeight: 800 }}>ABRIR CHAT</button>
                                            ) : (
                                                <div style={{ fontSize: '10px', opacity: 0.4, fontWeight: 800 }}>{selectedCampaign}</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {showFilterModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ width: '100%', maxWidth: '800px', background: 'var(--card-bg-subtle)', borderRadius: '32px', border: '1px solid rgba(172, 248, 0, 0.2)', padding: '40px', position: 'relative' }}>
                        <button onClick={() => { setShowFilterModal(false); setFilterResult(null); }} style={{ position: 'absolute', right: '30px', top: '30px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 950 }}>Filtro PRO</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
                            <div onClick={() => setFilterOptions(o => ({ ...o, removeGreen: !o.removeGreen }))} style={{ padding: '15px', borderRadius: '16px', border: '1px solid', borderColor: filterOptions.removeGreen ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', cursor: 'pointer' }}>Remover Green</div>
                            <div onClick={() => setFilterOptions(o => ({ ...o, removeCold: !o.removeCold }))} style={{ padding: '15px', borderRadius: '16px', border: '1px solid', borderColor: filterOptions.removeCold ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', cursor: 'pointer' }}>Remover Cold</div>
                            <div onClick={() => setFilterOptions(o => ({ ...o, removeBlack: !o.removeBlack }))} style={{ padding: '15px', borderRadius: '16px', border: '1px solid', borderColor: filterOptions.removeBlack ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', cursor: 'pointer' }}>Remover Black</div>
                        </div>
                        {!filterResult ? (
                            <div onClick={() => document.getElementById('modal-file-input')?.click()} style={{ border: '2px dashed rgba(172, 248, 0, 0.2)', borderRadius: '24px', padding: '60px', textAlign: 'center', cursor: 'pointer' }}>
                                <input type="file" id="modal-file-input" hidden accept=".csv,.txt" onChange={(e) => e.target.files?.[0] && handleFilterPro(e.target.files[0])} />
                                <FileUp size={40} style={{ marginBottom: '20px', opacity: 0.3 }} />
                                <h3>{isFiltering ? "Processando..." : "Enviar lista para limpar"}</h3>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
                                    <div style={{ textAlign: 'center' }}>Original: {filterResult.stats.original}</div>
                                    <div style={{ textAlign: 'center', color: '#ef4444' }}>Removidos: -{filterResult.stats.removed}</div>
                                    <div style={{ textAlign: 'center', color: 'var(--primary-color)' }}>Limpos: {filterResult.filteredNumbers.length}</div>
                                </div>
                                <button onClick={() => { const b = new Blob([filterResult.filteredNumbers.join('\n')], { type: 'text/csv' }); const u = URL.createObjectURL(b); const l = document.createElement("a"); l.href = u; l.download = "lista_limpa.csv"; l.click(); }} style={{ width: '100%', padding: '20px', background: 'var(--primary-color)', borderRadius: '20px', color: 'black', fontWeight: 900, cursor: 'pointer' }}><Download size={20} /> BAIXAR LISTA LIMPA</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default N8NWorkflow;
