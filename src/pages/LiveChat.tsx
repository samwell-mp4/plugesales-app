import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, 
    Send, 
    User, 
    Phone, 
    MessageSquare, 
    Loader2, 
    RefreshCcw,
    AlertCircle,
    ArrowLeft,
    Smartphone,
    FileSpreadsheet,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';

const LiveChat = () => {
    const { user } = useAuth() as any;
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [person, setPerson] = useState<any>(null);
    const [activeConversation, setActiveConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    
    // --- Google Sheets Chat States ---
    const [chatSource, setChatSource] = useState<'api' | 'sheets'>('sheets');
    const [sheetMessages, setSheetMessages] = useState<any[]>([]); 
    const [uniqueRecipients, setUniqueRecipients] = useState<any[]>([]); 
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('Tudo');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollInterval = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for new messages
    useEffect(() => {
        if (activeConversation?.id) {
            pollInterval.current = setInterval(() => {
                fetchMessages(activeConversation.id, false);
            }, 5000);
        } else {
            if (pollInterval.current) clearInterval(pollInterval.current);
        }
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [activeConversation?.id]);

    // const [isWaba, setIsWaba] = useState(false);
    // const [wabaConversations, setWabaConversations] = useState<any[]>([]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!phoneNumber) return;

        setIsLoading(true);
        setError(null);
        setPerson(null);
        setActiveConversation(null);
        setMessages([]);
        setSelectedRecipient(null);
        setSheetMessages([]);
        setUniqueRecipients([]);

        // Safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            if (isLoading) {
                setIsLoading(false);
                setError('A requisição demorou muito para responder. Tente novamente.');
            }
        }, 20000);

        try {
            const cleanNumber = phoneNumber.replace(/\D/g, '');
            if (!user?.id) {
                setError('Usuário não autenticado corretamente.');
                setIsLoading(false);
                clearTimeout(safetyTimeout);
                return;
            }
            
            if (chatSource === 'api') {
                const result = await Promise.race([
                    dbService.resolveInfobipNumber(cleanNumber, user.id),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout na API')), 15000))
                ]) as any;
                
                if (!result || result.error) {
                    setError(result.error || 'Erro ao buscar número. Verifique se o número está correto.');
                    setIsLoading(false);
                    clearTimeout(safetyTimeout);
                    return;
                }

                // ... (API logic assumed disabled or handled elsewhere)
            } else {
                // SPREADSHEET MODE
                const data = await dbService.fetchSpreadsheetMessages(cleanNumber);
                if (!data || data.length === 0) {
                    setError('Nenhum dado encontrado para este remetente na planilha.');
                    return;
                }

                setSheetMessages(data);
                
                // Group by the "other party" (the one who's NOT the searched number)
                const recipientsMap = new Map();
                data.forEach((msg: any) => {
                    const r = (msg.remetente || '').replace(/\D/g, '');
                    const d = (msg.destinatario || '').replace(/\D/g, '');
                    
                    // Identifica o número oposto ao pesquisado
                    const otherParty = (r === cleanNumber) ? d : r;
                    
                    if (otherParty && !recipientsMap.has(otherParty)) {
                        recipientsMap.set(otherParty, {
                            id: otherParty,
                            name: msg.nome && msg.nome !== 'Lead Planilha' ? msg.nome : 'Lead Interessado',
                            lastMessage: msg.mensagem,
                            lastDate: msg.data,
                            status: msg.status || 'Default'
                        });
                    }
                });

                setUniqueRecipients(Array.from(recipientsMap.values()));
            }
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.message === 'Timeout na API' ? 'O servidor demorou a responder. Verifique sua conexão.' : 'Falha ao conectar com o servidor.');
        } finally {
            setIsLoading(false);
            clearTimeout(safetyTimeout);
        }
    };

    const selectConversation = (conv: any) => {
        setPerson(conv.person);
        setActiveConversation(conv);
        fetchMessages(conv.id);
    };

    const fetchMessages = async (id: string, showLoading = true) => {
        if (showLoading && messages.length === 0) setIsLoading(true);
        try {
            const data = await dbService.fetchInfobipMessages(id, user.id);
            if (!data.error) {
                // Infobip returns messages in a specific structure, assuming it's an array for now based on research
                // Actually it might be { messages: [] } or just []
                const newMessages = Array.isArray(data) ? data : (data.messages || []);
                setMessages(prev => {
                    // Simple deduplication by ID if necessary
                    return JSON.stringify(prev) === JSON.stringify(newMessages) ? prev : newMessages;
                });
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    const selectSheetRecipient = (recipientId: string) => {
        setSelectedRecipient(recipientId);
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        
        // Filter messages between the searched number and the selected recipient
        const filtered = sheetMessages.filter(m => {
            const r = (m.remetente || '').replace(/\D/g, '');
            const d = (m.destinatario || '').replace(/\D/g, '');
            return (r === cleanNumber && d === recipientId) || (d === cleanNumber && r === recipientId);
        });

        // Map to standard message format
        setMessages(filtered.map((m, idx) => ({
            id: `sheet-${idx}`,
            direction: (m.remetente || '').replace(/\D/g, '') === cleanNumber ? 'OUTBOUND' : 'INBOUND',
            content: { text: m.mensagem },
            createdAt: m.data
        })));
        
        const firstWithName = filtered.find(f => f.nome && f.nome !== 'Lead Planilha');
        setPerson({ firstName: firstWithName?.nome || 'Lead Interessado', lastName: '' });
    };

    const handleSendMessage = async () => {
        // ... (existing logic)
    };

    const updateContactStatus = async (recipientId: string, newStatus: string) => {
        setIsUpdatingStatus(recipientId);
        try {
            const cleanNumber = phoneNumber.replace(/\D/g, '');
            const response = await fetch('/api/live-chat/spreadsheet/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    remetente: cleanNumber,
                    destinatario: recipientId,
                    status: newStatus
                })
            });

            if (response.ok) {
                // Update local state without re-searching
                setUniqueRecipients(prev => prev.map(r => 
                    r.id === recipientId ? { ...r, status: newStatus } : r
                ));
            } else {
                alert("Erro ao atualizar status na planilha.");
            }
        } catch (err) {
            console.error("Error updating status:", err);
        } finally {
            setIsUpdatingStatus(null);
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
        link.setAttribute("download", `lista_${filterStatus.toLowerCase().replace(' ', '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="container-root" style={{ height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .chat-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(172, 248, 0, 0.2);
                    border-radius: 32px;
                    overflow: hidden;
                    backdrop-filter: blur(40px);
                    max-width: 1100px;
                    margin: 0 auto;
                    width: 100%;
                    box-shadow: 0 50px 100px rgba(0,0,0,0.5);
                    height: calc(100vh - 180px);
                }

                .chat-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--surface-border-subtle);
                    background: rgba(255,255,255,0.02);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .messages-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: radial-gradient(circle at bottom left, rgba(172,248,0,0.03), transparent);
                    scrollbar-width: thin;
                    scrollbar-color: var(--primary-color) transparent;
                }

                .messages-area::-webkit-scrollbar {
                    width: 6px;
                }

                .messages-area::-webkit-scrollbar-thumb {
                    background: rgba(172, 248, 0, 0.3);
                    border-radius: 10px;
                }

                .message-bubble {
                    max-width: 80%;
                    padding: 16px 20px;
                    border-radius: 24px;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    font-weight: 500;
                    position: relative;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    word-wrap: break-word;
                }

                .message-inbound {
                    align-self: flex-start;
                    background: rgba(30, 41, 59, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: white;
                    border-bottom-left-radius: 4px;
                }

                .message-outbound {
                    align-self: flex-end;
                    background: var(--primary-gradient);
                    color: black;
                    font-weight: 900;
                    border-bottom-right-radius: 4px;
                    box-shadow: 0 8px 25px rgba(172, 248, 0, 0.2);
                }

                .message-time {
                    font-size: 9px;
                    opacity: 0.6;
                    margin-top: 8px;
                    display: block;
                    text-align: right;
                    font-weight: 900;
                    text-transform: uppercase;
                }

                .chat-input-area {
                    padding: 32px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    background: rgba(15, 23, 42, 0.4);
                }

                .search-command-center {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    max-width: 650px;
                    margin: 20px auto;
                    text-align: center;
                    background: rgba(15, 23, 42, 0.4);
                    padding: 60px;
                    border-radius: 40px;
                    border: 1px solid rgba(172, 248, 0, 0.2);
                    backdrop-filter: blur(20px);
                    box-shadow: var(--shadow-md);
                }

                .pulse-loader {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }

                .messages-area::-webkit-scrollbar { width: 6px; }
                .messages-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                
                .waba-badge {
                    font-size: 10px;
                    padding: 6px 14px;
                    background: rgba(172, 248, 0, 0.1);
                    color: var(--primary-color);
                    border: 1px solid rgba(172, 248, 0, 0.2);
                    border-radius: 12px;
                    font-weight: 900;
                    letter-spacing: 1px;
                }

                .premium-input {
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid var(--surface-border);
                    color: white;
                    border-radius: 18px;
                    padding: 18px 24px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    transition: all 0.3s;
                    width: 100%;
                }
                .chat-responsive-container {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 32px;
                    height: calc(100vh - 180px); /* Ajuste dinâmico */
                    min-height: 600px;
                }

                @media (max-width: 1200px) {
                    .chat-responsive-container {
                        grid-template-columns: 350px 1fr;
                        gap: 20px;
                    }
                }

                @media (max-width: 968px) {
                    .chat-responsive-container {
                        display: flex;
                        flex-direction: column;
                        height: auto;
                        gap: 24px;
                    }
                    
                    .chat-sidebar-section {
                        width: 100% !important;
                        height: auto !important;
                        max-height: 500px;
                    }

                    .messages-area {
                        height: 500px !important;
                    }
                }

                .supreme-card {
                    background: var(--card-bg-subtle);
                    backdrop-filter: blur(25px);
                    border: 1px solid rgba(172, 248, 0, 0.08);
                    border-radius: 28px;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .supreme-card:hover {
                    border-color: rgba(172, 248, 0, 0.2);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .pulse-loading {
                    animation: pulse-border 2s infinite;
                }

                @keyframes pulse-border {
                    0% { box-shadow: 0 0 0 0 rgba(172, 248, 0, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(172, 248, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(172, 248, 0, 0); }
                }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '14px', background: 'var(--primary-gradient)', borderRadius: '20px', color: 'black', boxShadow: '0 8px 25px rgba(172, 248, 0, 0.2)' }}>
                        <FileSpreadsheet size={28} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 950, fontSize: '2.5rem', letterSpacing: '-2px', textTransform: 'uppercase', background: 'linear-gradient(to right, #fff, var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            HISTÓRICO <span style={{ opacity: 0.7 }}>DE PLANILHA</span>
                        </h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '11px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Visualização de disparos e mensagens do Google Sheets
                        </p>
                    </div>
                </div>

                {uniqueRecipients.length > 0 && (
                    <button 
                        onClick={downloadCSV}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', 
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px', color: 'white', fontWeight: 800, fontSize: '12px',
                            cursor: 'pointer', transition: 'all 0.3s'
                        }}
                        className="hover-lift"
                    >
                        <FileSpreadsheet size={18} color="var(--primary-color)" />
                        BAIXAR {filterStatus.toUpperCase()} (CSV)
                    </button>
                )}
            </div>

            {!selectedRecipient ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    {uniqueRecipients.length === 0 ? (
                        <div className="supreme-card" style={{ padding: '60px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                            <div className={`pulse-loading`} style={{ margin: '0 auto 32px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(172, 248, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(172, 248, 0, 0.1)' }}>
                                <Search size={40} color="var(--primary-color)" />
                            </div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 950, marginBottom: '12px', letterSpacing: '-1.5px', color: 'white' }}>
                                Buscar na Planilha
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.6 }}>
                                Visualize o histórico de disparos e respostas filtrando pelo número do remetente.
                            </p>

                            <form onSubmit={handleSearch} style={{ width: '100%', position: 'relative' }}>
                                <input 
                                    className="premium-input"
                                    type="text" 
                                    placeholder="Número do Remetente"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={isLoading}
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(172, 248, 0, 0.1)', borderRadius: '20px', padding: '18px 24px', color: 'white', fontWeight: 600, fontSize: '1.1rem' }}
                                />
                                <button 
                                    className="premium-button"
                                    type="submit" 
                                    disabled={isLoading}
                                    style={{ position: 'absolute', right: '8px', top: '8px', padding: '10px 24px', borderRadius: '14px', background: 'var(--primary-color)', color: 'black', fontWeight: 900, border: 'none', cursor: 'pointer' }}
                                >
                                    {isLoading ? <RefreshCcw size={18} className="animate-spin" /> : 'BUSCAR'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="chat-responsive-container" style={{ width: '100%' }}>
                             {/* Sidebar de Resultados */}
                             <div className="supreme-card chat-sidebar-section" style={{ display: 'flex', flexDirection: 'column', padding: '24px', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px', color: 'white' }}>
                                        CONTATOS
                                    </h3>
                                    <button onClick={() => setUniqueRecipients([])} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}>
                                        <ArrowLeft size={16} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                                    {['Tudo', 'Green List', 'Cold List', 'Black List'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            style={{
                                                padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)',
                                                background: filterStatus === status ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                                                color: filterStatus === status ? 'black' : 'white',
                                                fontSize: '10px', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                                    {uniqueRecipients
                                        .filter(r => filterStatus === 'Tudo' || r.status === filterStatus)
                                        .map((conv: any) => (
                                        <div 
                                            key={conv.id} 
                                            className="hover-lift"
                                            style={{ 
                                                padding: '20px', borderRadius: '22px', background: 'rgba(255,255,255,0.02)', 
                                                border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                            onClick={() => selectSheetRecipient(conv.id)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(172, 248, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(172, 248, 0, 0.1)' }}>
                                                    <User size={22} color="var(--primary-color)" />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>{conv.name}</div>
                                                    <div style={{ fontSize: '10px', color: getStatusColor(conv.status), fontWeight: 900 }}>
                                                        {conv.status.toUpperCase()}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '10px', opacity: 0.3, fontWeight: 700 }}>{formatTime(conv.lastDate)}</div>
                                            </div>
                                            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                                {conv.lastMessage?.length > 45 ? conv.lastMessage.slice(0, 45) + '...' : conv.lastMessage}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>

                             {/* Visualização de Seleção */}
                             <div className="supreme-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                                <div>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <MessageSquare size={32} color="white" style={{ opacity: 0.2 }} />
                                    </div>
                                    <h4 style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>Selecione um contato</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px' }}>
                                        Clique em um dos destinatários ao lado para visualizar o chat completo.
                                    </p>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="chat-responsive-container">
                    <div className="supreme-card chat-sidebar-section" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <button onClick={() => setSelectedRecipient(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'white' }}>DETALHES</h3>
                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>Histórico Completo</p>
                            </div>
                        </div>

                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                                    <User size={32} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0 }}>{person?.firstName || 'Lead'}</h2>
                                    <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '1px' }}>{selectedRecipient}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {['Green List', 'Cold List', 'Black List'].map(status => {
                                    const isActive = uniqueRecipients.find(r => r.id === selectedRecipient)?.status === status;
                                    const color = getStatusColor(status);
                                    return (
                                        <button 
                                            key={status}
                                            onClick={() => updateContactStatus(selectedRecipient, status)}
                                            style={{ 
                                                width: '100%', padding: '14px', borderRadius: '16px', 
                                                background: isActive ? `${color}22` : 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.05)'}`,
                                                color: isActive ? color : 'white',
                                                fontSize: '11px', fontWeight: 900, textAlign: 'left',
                                                cursor: 'pointer', transition: 'all 0.3s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                            }}
                                        >
                                            {status.toUpperCase()}
                                            {isActive && <ShieldCheck size={14} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                             <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                                Atividade Recente
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {uniqueRecipients
                                    .filter(r => r.id !== selectedRecipient)
                                    .slice(0, 5)
                                    .map(r => (
                                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '14px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(r.status) }}></div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', flex: 1 }}>{r.name}</div>
                                            <div style={{ fontSize: '9px', opacity: 0.3 }}>{formatTime(r.lastDate)}</div>
                                        </div>
                                    ))}
                             </div>
                        </div>
                    </div>

                    <div className="supreme-card messages-area" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>CONVERSA ATIVA</h3>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0,0,0,0.1)' }}>
                            {messages.map((msg: any) => (
                                <div key={msg.id} className={`message-bubble ${msg.direction === 'INBOUND' ? 'message-inbound' : 'message-outbound'}`}>
                                    {msg.content?.text || '[Mídia ou Conteúdo não suportado]'}
                                    <span className="message-time">{formatTime(msg.createdAt)}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-area" style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ textAlign: 'center', padding: '12px', borderRadius: '16px', background: 'rgba(172, 248, 0, 0.05)', border: '1px solid rgba(172, 248, 0, 0.1)' }}>
                                <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    MOSTRANDO APENAS HISTÓRICO DA PLANILHA
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveChat;
