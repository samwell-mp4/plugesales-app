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
    List,
    MessageCircle,
    Trash2,
    CheckSquare,
    Square,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const N8NWorkflow = () => {
    const { user } = useAuth() as any;
    const [searchNumber, setSearchNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [uniqueRecipients, setUniqueRecipients] = useState<any[]>([]); 
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('Tudo');
    const [error, setError] = useState<string | null>(null);
    const [allData, setAllData] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'chat' | 'list'>('chat');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
                setUniqueRecipients([]);
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

    const processMessages = (rawMsgs: any[], searchSource: string) => {
        const cleanSearch = searchSource.replace(/\D/g, '');
        const recipientsMap = new Map();
        
        rawMsgs.forEach(msg => {
            const r = (msg.remetente || '').replace(/\D/g, '');
            const d = (msg.destinatario || '').replace(/\D/g, '');
            
            if (r === cleanSearch || d === cleanSearch) {
                const otherParty = r === cleanSearch ? d : r;
                if (!otherParty) return;

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

        // Sort contacts by latest message
        const sorted = Array.from(recipientsMap.values()).sort((a: any, b: any) => 
            new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
        );

        setUniqueRecipients(sorted);
    };

    const selectRecipient = (recipientId: string) => {
        const recipient = uniqueRecipients.find(r => r.id === recipientId);
        if (recipient) {
            setSelectedRecipient(recipientId);
            // Sort messages by date
            const sortedMsgs = [...recipient.allMsgs].sort((a: any, b: any) => 
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
                    status: newStatus
                })
            });

            if (response.ok) {
                // Update local state
                setUniqueRecipients(prev => prev.map(r => 
                    r.id === recipientId ? { ...r, status: newStatus } : r
                ));
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
                    setUniqueRecipients(prev => prev.filter(r => !selectedIds.includes(r.id)));
                    setSelectedIds([]);
                }
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
            return;
        }

        // Status actions
        setIsLoading(true);
        try {
            const res = await fetch('/api/monitor/bulk-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientIds: selectedIds, status: action })
            });
            if (res.ok) {
                setUniqueRecipients(prev => prev.map(r => 
                    selectedIds.includes(r.id) ? { ...r, status: action } : r
                ));
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

    const downloadCSV = () => {
        const filteredData = uniqueRecipients.filter(r => filterStatus === 'Tudo' || r.status === filterStatus);
        if (filteredData.length === 0) return alert("Nenhum dado para baixar.");

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
        link.setAttribute("download", `monitor_n8n_${filterStatus.toLowerCase().replace(' ', '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    if (uniqueRecipients.length === 0 && !isLoading) {
        return (
            <div className="crm-container" style={{ padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="supreme-card hover-lift" style={{ width: '100%', maxWidth: '600px', padding: '60px', textAlign: 'center' }}>
                    <div style={{ padding: '24px', background: 'var(--primary-gradient)', borderRadius: '25px', color: 'black', display: 'inline-flex', marginBottom: '32px', boxShadow: '0 15px 45px rgba(172, 248, 0, 0.3)' }}>
                        <Database size={48} />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-2px', marginBottom: '12px', background: 'linear-gradient(to right, #fff, var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>
                        MONITOR n8n
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '48px' }}>
                        CONSULTA DE HISTÓRICO POR NÚMERO
                    </p>
                    
                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                        <Phone size={24} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)', opacity: 0.6 }} />
                        <input 
                            type="text" 
                            className="premium-input"
                            placeholder="Digite o número (ex: 55119...)"
                            value={searchNumber}
                            onChange={(e) => setSearchNumber(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{ paddingLeft: '64px', height: '75px', borderRadius: '24px' }}
                        />
                    </div>
                    
                    <button 
                        onClick={handleSearch}
                        className="premium-button"
                        style={{ width: '100%', height: '70px', borderRadius: '22px', fontSize: '1.2rem', fontWeight: 950, letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}
                    >
                        <Search size={24} />
                        BUSCAR REGISTROS
                    </button>
                    {error && <p style={{ color: '#ef4444', marginTop: '20px', fontWeight: 700 }}>{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="crm-container" style={{ padding: '40px' }}>
            <style>{`
                .chat-responsive-container {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 32px;
                    height: calc(100vh - 180px);
                    min-height: 600px;
                }
                @media (max-width: 968px) {
                    .chat-responsive-container {
                        display: flex;
                        flex-direction: column;
                        height: auto;
                    }
                    .chat-sidebar-section { width: 100% !important; max-height: 500px; }
                    .messages-area { height: 500px !important; }
                }
                .supreme-card {
                    background: var(--card-bg-subtle);
                    backdrop-filter: blur(25px);
                    border: 1px solid rgba(172, 248, 0, 0.08);
                    border-radius: 28px;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
                .message-bubble {
                    max-width: 80%;
                    padding: 18px 24px;
                    border-radius: 22px;
                    font-size: 1rem;
                    line-height: 1.6;
                    position: relative;
                    margin-bottom: 8px;
                }
                .message-outbound {
                    align-self: flex-end;
                    background: var(--primary-color);
                    color: black;
                    border-bottom-right-radius: 4px;
                    font-weight: 600;
                }
                .message-inbound {
                    align-self: flex-start;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    border-bottom-left-radius: 4px;
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .message-time {
                    display: block;
                    font-size: 10px;
                    margin-top: 8px;
                    opacity: 0.5;
                }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button 
                        onClick={() => setUniqueRecipients([])}
                        style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', color: 'white', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 950, fontSize: '2.5rem', letterSpacing: '-2px', textTransform: 'uppercase', background: 'linear-gradient(to right, #fff, var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {searchNumber}
                        </h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '11px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Monitor de Histórico n8n
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                        <input 
                            type="text" 
                            placeholder="Filtrar por nome ou número..." 
                            value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 45px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', fontSize: '13px', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button 
                            onClick={() => setViewMode('chat')} 
                            style={{ padding: '8px 16px', background: viewMode === 'chat' ? 'var(--primary-color)' : 'transparent', border: 'none', borderRadius: '10px', color: viewMode === 'chat' ? 'black' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '12px' }}
                        >
                            <MessageCircle size={16} /> CHAT
                        </button>
                        <button 
                            onClick={() => setViewMode('list')} 
                            style={{ padding: '8px 16px', background: viewMode === 'list' ? 'var(--primary-color)' : 'transparent', border: 'none', borderRadius: '10px', color: viewMode === 'list' ? 'black' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '12px' }}
                        >
                            <List size={16} /> LISTA
                        </button>
                    </div>
                    <button onClick={handleSearch} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', fontWeight: 800, cursor: 'pointer' }} className="hover-lift">
                        <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    {uniqueRecipients.length > 0 && (
                        <button onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', fontWeight: 800, fontSize: '12px' }} className="hover-lift">
                            <FileSpreadsheet size={18} color="var(--primary-color)" />
                            BAIXAR (CSV)
                        </button>
                    )}
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', padding: '15px 30px', borderRadius: '25px', border: '1px solid var(--primary-color)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>
                            {selectedIds.length}
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>Selecionados</span>
                    </div>

                    <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <select 
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleBulkAction(e.target.value);
                                        e.target.value = "";
                                    }
                                }}
                                defaultValue=""
                                style={{ padding: '10px 40px 10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'white', fontWeight: 800, fontSize: '13px', cursor: 'pointer', appearance: 'none', outline: 'none' }}
                            >
                                <option value="" disabled>Ações em Massa...</option>
                                <option value="Green List">Marcar como GREEN</option>
                                <option value="Cold List">Marcar como COLD</option>
                                <option value="Black List">Marcar como BLACK</option>
                                <option value="delete">Excluir Registros</option>
                            </select>
                            <ChevronDown size={16} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                        </div>

                        <button 
                            onClick={() => setSelectedIds([])}
                            style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                        >
                            CANCELAR
                        </button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                    <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%' }}></div>
                </div>
            ) : (
                viewMode === 'chat' ? (
                    <div className="chat-responsive-container">
                        <div className="supreme-card chat-sidebar-section" style={{ display: 'flex', flexDirection: 'column', padding: '24px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                                {['Tudo', 'Green List', 'Cold List', 'Black List'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        style={{
                                            padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)',
                                            background: filterStatus === status ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                                            color: filterStatus === status ? 'black' : 'white',
                                            fontSize: '11px', fontWeight: 950, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase'
                                        }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {filteredRecipients.map((conv: any) => (
                                    <div key={conv.id} className="hover-lift" style={{ padding: '20px', borderRadius: '22px', background: selectedRecipient === conv.id ? 'rgba(172, 248, 0, 0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: selectedRecipient === conv.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', cursor: 'pointer' }} onClick={() => selectRecipient(conv.id)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(172, 248, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={22} color="var(--primary-color)" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>{conv.name}</div>
                                                <div style={{ fontSize: '10px', color: getStatusColor(conv.status), fontWeight: 900 }}>{conv.status.toUpperCase()}</div>
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.3 }}>{formatTime(conv.lastDate)}</div>
                                        </div>
                                        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {conv.lastMessage?.slice(0, 45)}...
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="supreme-card messages-area" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {!selectedRecipient ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                                    <div>
                                        <MessageSquare size={64} style={{ margin: '0 auto 20px' }} />
                                        <h3 style={{ fontWeight: 900 }}>Selecione um contato</h3>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>{selectedRecipient}</h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => updateStatus(selectedRecipient, 'Green List')} style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22c55e', borderRadius: '10px', fontSize: '10px', fontWeight: 950, cursor: 'pointer' }}>GREEN</button>
                                            <button onClick={() => updateStatus(selectedRecipient, 'Cold List')} style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '10px', fontSize: '10px', fontWeight: 950, cursor: 'pointer' }}>COLD</button>
                                            <button onClick={() => updateStatus(selectedRecipient, 'Black List')} style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '10px', fontSize: '10px', fontWeight: 950, cursor: 'pointer' }}>BLACK</button>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {messages.map((msg: any) => (
                                            <div key={msg.id} className={`message-bubble message-${msg.direction.toLowerCase()}`}>
                                                {msg.content?.text}
                                                <span className="message-time">{formatTime(msg.createdAt)}</span>
                                            </div>
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
                                <tr style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
                                    <th style={{ textAlign: 'left', padding: '0 20px', width: '50px' }}>
                                        <button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                                            {selectedIds.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '0 20px' }}>Contato</th>
                                    <th style={{ textAlign: 'left', padding: '0 20px' }}>Última Mensagem</th>
                                    <th style={{ textAlign: 'center', padding: '0 20px' }}>Status</th>
                                    <th style={{ textAlign: 'center', padding: '0 20px' }}>Ações Rápidas</th>
                                    <th style={{ textAlign: 'right', padding: '0 20px' }}>Ver</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecipients.map((conv: any) => (
                                    <tr key={conv.id} style={{ background: selectedIds.includes(conv.id) ? 'rgba(172, 248, 0, 0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '18px' }} className="hover-lift">
                                        <td style={{ padding: '20px', borderRadius: '18px 0 0 18px' }}>
                                            <button onClick={() => toggleSelectOne(conv.id)} style={{ background: 'none', border: 'none', color: selectedIds.includes(conv.id) ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                                                {selectedIds.includes(conv.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                            </button>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(172, 248, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={20} color="var(--primary-color)" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{conv.name}</div>
                                                    <div style={{ fontSize: '11px', opacity: 0.4 }}>{conv.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.7, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {conv.lastMessage}
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.3, marginTop: '4px' }}>{formatTime(conv.lastDate)}</div>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'center' }}>
                                            <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 900, background: 'rgba(0,0,0,0.2)', color: getStatusColor(conv.status), border: `1px solid ${getStatusColor(conv.status)}22` }}>
                                                {conv.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <button onClick={() => updateStatus(conv.id, 'Green List')} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: conv.status === 'Green List' ? '#22c55e' : 'rgba(34, 197, 94, 0.1)', border: 'none', borderRadius: '8px', color: conv.status === 'Green List' ? 'black' : '#22c55e', cursor: 'pointer', fontWeight: 900 }}>G</button>
                                                <button onClick={() => updateStatus(conv.id, 'Cold List')} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: conv.status === 'Cold List' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: '8px', color: conv.status === 'Cold List' ? 'black' : '#3b82f6', cursor: 'pointer', fontWeight: 900 }}>C</button>
                                                <button onClick={() => updateStatus(conv.id, 'Black List')} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: conv.status === 'Black List' ? '#ef4444' : 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', color: conv.status === 'Black List' ? 'black' : '#ef4444', cursor: 'pointer', fontWeight: 900 }}>B</button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'right', borderRadius: '0 18px 18px 0' }}>
                                            <button 
                                                onClick={() => { selectRecipient(conv.id); setViewMode('chat'); }}
                                                style={{ padding: '10px 18px', background: 'rgba(172, 248, 0, 0.1)', border: 'none', borderRadius: '12px', color: 'var(--primary-color)', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}
                                            >
                                                ABRIR CHAT
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

export default N8NWorkflow;
