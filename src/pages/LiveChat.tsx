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
    ArrowLeft
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

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!phoneNumber) return;

        setIsLoading(true);
        setError(null);
        setPerson(null);
        setActiveConversation(null);
        setMessages([]);

        try {
            const cleanNumber = phoneNumber.replace(/\D/g, '');
            const result = await dbService.resolveInfobipNumber(cleanNumber, user.id);
            
            if (result.error) {
                setError(result.error);
                return;
            }

            setPerson(result.person);
            
            // Find active conversation
            const active = result.conversations?.find((c: any) => c.status === 'OPEN' || c.status === 'WAITING');
            if (active) {
                setActiveConversation(active);
                fetchMessages(active.id);
            } else {
                setError('Nenhuma conversa aberta encontrada para este número.');
            }
        } catch (err: any) {
            setError('Falha ao conectar com o servidor.');
        } finally {
            setIsLoading(false);
        }
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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || isSending) return;

        setIsSending(true);
        try {
            const result = await dbService.sendInfobipMessage(activeConversation.id, newMessage, user.id);
            if (result.error) {
                alert("Erro ao enviar: " + result.error);
            } else {
                setNewMessage('');
                fetchMessages(activeConversation.id, false);
            }
        } catch (err) {
            alert("Erro de conexão ao enviar.");
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="container-root" style={{ height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .chat-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle);
                    border-radius: 24px;
                    overflow: hidden;
                    backdrop-filter: blur(12px);
                    max-width: 1000px;
                    margin: 0 auto;
                    width: 100%;
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
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: radial-gradient(circle at top right, rgba(172,248,0,0.03), transparent);
                }

                .message-bubble {
                    max-width: 75%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.5;
                    position: relative;
                }

                .message-inbound {
                    align-self: flex-start;
                    background: var(--bg-primary);
                    border: 1px solid var(--surface-border-subtle);
                    color: var(--text-primary);
                    border-bottom-left-radius: 4px;
                }

                .message-outbound {
                    align-self: flex-end;
                    background: var(--primary-color);
                    color: black;
                    font-weight: 500;
                    border-bottom-right-radius: 4px;
                }

                .message-time {
                    font-size: 10px;
                    opacity: 0.5;
                    margin-top: 4px;
                    display: block;
                    text-align: right;
                }

                .chat-input-area {
                    padding: 20px 24px;
                    border-top: 1px solid var(--surface-border-subtle);
                    background: rgba(255,255,255,0.02);
                }

                .search-hero {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    max-width: 500px;
                    margin: 0 auto;
                    text-align: center;
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
                .messages-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '12px', background: 'var(--primary-gradient)', borderRadius: '16px', color: 'black' }}>
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-1px' }}>LIVE <span className="text-primary-color">CHAT</span></h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>INFOBIP CONVERSATIONS</p>
                </div>
            </div>

            {!activeConversation ? (
                <div className="search-hero">
                    <div className={`mb-8 p-6 rounded-full bg-white/5 border border-white/10 ${isLoading ? 'pulse-loader' : ''}`}>
                        <Search size={48} className="text-primary-color" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px' }}>Puxar Conversa</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
                        Insira o número do WhatsApp (DDI + DDD + Número) para abrir o chat em tempo real.
                    </p>

                    <form onSubmit={handleSearch} style={{ width: '100%', position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Ex: 5511999999999"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={isLoading}
                            style={{ 
                                width: '100%', padding: '18px 24px', borderRadius: '18px', 
                                background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)',
                                color: 'white', fontSize: '16px', fontWeight: 700, outline: 'none'
                            }}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !phoneNumber}
                            style={{ 
                                position: 'absolute', right: '8px', top: '8px', bottom: '8px',
                                padding: '0 20px', borderRadius: '14px', background: 'var(--primary-color)',
                                color: 'black', fontWeight: 900, border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Search size={20} /> BUSCAR</>}
                        </button>
                    </form>

                    {error && (
                        <div style={{ marginTop: '24px', padding: '12px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700 }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="chat-container">
                    <div className="chat-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button onClick={() => setActiveConversation(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <ArrowLeft size={20} />
                            </button>
                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--surface-border-subtle)' }}>
                                <User className="text-primary-color" size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)' }}>
                                    {person?.firstName || 'Lead'} {person?.lastName || ''}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                                    EM ATENDIMENTO • {phoneNumber}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => fetchMessages(activeConversation.id)} className="icon-button" style={{ width: '40px', height: '40px' }}>
                            <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                        </button>
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

                    <form onSubmit={handleSendMessage} className="chat-input-area">
                        <div style={{ position: 'relative', display: 'flex', gap: '12px' }}>
                            <textarea 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                style={{ 
                                    flex: 1, padding: '16px 20px', borderRadius: '16px', background: 'var(--bg-primary)',
                                    border: '1px solid var(--surface-border-subtle)', color: 'white', resize: 'none',
                                    maxHeight: '120px', minHeight: '56px', fontSize: '14px', outline: 'none'
                                }}
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim() || isSending}
                                style={{ 
                                    width: '56px', height: '56px', borderRadius: '16px', 
                                    background: 'var(--primary-color)', color: 'black',
                                    border: 'none', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
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
