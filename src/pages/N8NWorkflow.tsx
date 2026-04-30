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
    Loader2
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
            // Reutilizando o endpoint de status da planilha já que os dados vêm de lá indiretamente
            const response = await fetch('/api/live-chat/spreadsheet/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: searchNumber.replace(/\D/g, ''),
                    recipientId: recipientId.replace(/\D/g, ''),
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

                <div style={{ display: 'flex', gap: '12px' }}>
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

            {isLoading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                    <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%' }}></div>
                </div>
            ) : (
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
                            {uniqueRecipients
                                .filter(r => filterStatus === 'Tudo' || r.status === filterStatus)
                                .map((conv: any) => (
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
            )}
        </div>
    );
};

export default N8NWorkflow;
