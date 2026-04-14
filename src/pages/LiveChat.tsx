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
    Smartphone
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
                .premium-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 20px rgba(172, 248, 0, 0.1);
                }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '14px', background: 'var(--primary-gradient)', borderRadius: '20px', color: 'black', boxShadow: '0 8px 25px rgba(172, 248, 0, 0.2)' }}>
                        <RefreshCcw size={28} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-2px', textTransform: 'uppercase' }}>HISTÓRICO <span style={{ color: 'var(--primary-color)' }}>DE PLANILHA</span></h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '11px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Visualização de disparos e mensagens do Google Sheets
                        </p>
                    </div>
                </div>
            </div>

            {!selectedRecipient ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                    {uniqueRecipients.length === 0 ? (
                        <div className="search-command-center">
                            <div className={`pulse-loader`} style={{ marginBottom: '32px', padding: '24px', borderRadius: '50%', background: 'rgba(172, 248, 0, 0.05)', border: '1px solid rgba(172, 248, 0, 0.1)' }}>
                                <RefreshCcw size={56} color="var(--primary-color)" strokeWidth={1} />
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '12px', letterSpacing: '-1px' }}>
                                Buscar na Planilha
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.6 }}>
                                Visualize o histórico de disparos e respostas.<br/>
                                <span style={{ color: 'var(--primary-color)', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Filtre as mensagens pelo número do remetente</span>
                            </p>

                            <form onSubmit={handleSearch} style={{ width: '100%', position: 'relative', maxWidth: '450px' }}>
                                <input 
                                    className="premium-input"
                                    type="text" 
                                    placeholder="Número do Remetente"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button 
                                    type="submit" 
                                    disabled={isLoading || !phoneNumber}
                                    style={{ 
                                        position: 'absolute', right: '10px', top: '10px', bottom: '10px',
                                        padding: '0 24px', borderRadius: '14px', background: 'var(--primary-color)',
                                        color: 'black', fontWeight: 900, border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem'
                                    }}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Search size={18} /> BUSCAR</>}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--card-bg-subtle)', borderRadius: '24px', border: '1px solid var(--surface-border-subtle)', padding: '32px', width: '100%', maxWidth: '800px', margin: '0 auto', backdropFilter: 'blur(20px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <button onClick={() => { setUniqueRecipients([]); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                                        Destinatários Encontrados
                                    </h2>
                                </div>
                                <span className="waba-badge">PLANILHA: {phoneNumber}</span>
                            </div>

                            {/* Status Filter Tabs */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                                {['Tudo', 'Green List', 'Cold List', 'Black List'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                                            background: filterStatus === status ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                            color: filterStatus === status ? 'black' : 'white',
                                            fontSize: '11px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s',
                                            whiteSpace: 'nowrap'
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
                                    <div 
                                        key={conv.id} 
                                        style={{ 
                                            padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', 
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            display: 'flex', flexDirection: 'column', gap: '16px', transition: 'all 0.3s',
                                            position: 'relative', overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div onClick={() => selectSheetRecipient(conv.id)} style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(172, 248, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(172, 248, 0, 0.1)', cursor: 'pointer' }}>
                                                <User size={28} color="var(--primary-color)" />
                                            </div>
                                            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => selectSheetRecipient(conv.id)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'white' }}>{conv.name}</div>
                                                    <div style={{ padding: '4px 10px', borderRadius: '8px', background: `${getStatusColor(conv.status)}22`, color: getStatusColor(conv.status), fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', border: `1px solid ${getStatusColor(conv.status)}44` }}>
                                                        {conv.status}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                                                    ID: {conv.id} • {formatTime(conv.lastDate)}
                                                </div>
                                            </div>
                                        </div>

                                        <div onClick={() => selectSheetRecipient(conv.id)} style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, cursor: 'pointer', borderLeft: `4px solid ${getStatusColor(conv.status)}` }}>
                                            "{conv.lastMessage?.length > 120 ? conv.lastMessage.slice(0, 120) + '...' : conv.lastMessage}"
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                disabled={isUpdatingStatus === conv.id}
                                                onClick={() => updateContactStatus(conv.id, 'Green List')}
                                                style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22c55e', fontSize: '10px', fontWeight: 900, cursor: 'pointer', opacity: conv.status === 'Green List' ? 0.4 : 1 }}
                                            >
                                                GREEN
                                            </button>
                                            <button 
                                                disabled={isUpdatingStatus === conv.id}
                                                onClick={() => updateContactStatus(conv.id, 'Cold List')}
                                                style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', fontSize: '10px', fontWeight: 900, cursor: 'pointer', opacity: conv.status === 'Cold List' ? 0.4 : 1 }}
                                            >
                                                COLD
                                            </button>
                                            <button 
                                                disabled={isUpdatingStatus === conv.id}
                                                onClick={() => updateContactStatus(conv.id, 'Black List')}
                                                style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '10px', fontWeight: 900, cursor: 'pointer', opacity: conv.status === 'Black List' ? 0.4 : 1 }}
                                            >
                                                BLACK
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(uniqueRecipients.length === 0) && (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        Nenhuma conversa ou destinatário encontrado para este número.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{ marginTop: '24px', padding: '12px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700 }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="chat-container">
                    <div className="chat-header" style={{ backdropFilter: 'blur(30px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <button onClick={() => { setActiveConversation(null); setSelectedRecipient(null); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowLeft size={20} />
                            </button>
                            <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--surface-border-subtle)', position: 'relative' }}>
                                <User color="var(--primary-color)" size={28} />
                                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: '50%', background: '#22c55e', border: '3px solid var(--card-bg-subtle)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                                    {person?.firstName || 'Lead'} {person?.lastName || ''}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                                    HISTÓRICO PLANILHA • {selectedRecipient}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="messages-area">
                        {messages.length === 0 && !isLoading && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                <MessageSquare size={48} className="mb-4" />
                                <p style={{ fontWeight: 800 }}>Inicie a conversa...</p>
                            </div>
                        )}
                        
                        {messages.map((msg: any) => (
                            <div key={msg.id} className={`message-bubble ${msg.direction === 'INBOUND' ? 'message-inbound' : 'message-outbound'}`}>
                                {msg.content?.text || '[Mídia ou Conteúdo não suportado]'}
                                <span className="message-time">{formatTime(msg.createdAt)}</span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="chat-input-area">
                        <div style={{ position: 'relative', display: 'flex', gap: '16px' }}>
                            <textarea 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Pressione Shift+Enter para quebrar linha ou Enter para enviar..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                style={{ 
                                    flex: 1, padding: '20px 24px', borderRadius: '20px', background: 'var(--bg-color)',
                                    border: '1px solid var(--surface-border-subtle)', color: 'white', resize: 'none',
                                    maxHeight: '120px', minHeight: '60px', fontSize: '0.95rem', outline: 'none',
                                    fontWeight: 500, transition: 'border-color 0.3s'
                                }}
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim() || isSending}
                                style={{ 
                                    width: '60px', height: '60px', borderRadius: '20px', 
                                    background: 'var(--primary-color)', color: 'black',
                                    border: 'none', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                                    boxShadow: '0 8px 20px rgba(172, 248, 0, 0.2)'
                                }}
                            >
                                {isSending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LiveChat;
