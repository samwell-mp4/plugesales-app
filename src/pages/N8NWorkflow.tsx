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
    Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const N8NWorkflow = () => {
    const { user } = useAuth() as any;
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [uniqueRecipients, setUniqueRecipients] = useState<any[]>([]); 
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('Tudo');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedRecipient) {
            scrollToBottom();
        }
    }, [selectedRecipient, messages]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/check-database');
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            const text = await response.text();
            if (!text || text.trim() === '') {
                setUniqueRecipients([]);
                return;
            }

            try {
                const data = JSON.parse(text);
                processMessages(data);
            } catch (jsonErr) {
                console.error("JSON Parse Error:", jsonErr, "Raw text:", text);
                throw new Error('O servidor retornou um formato inválido (não JSON).');
            }
        } catch (err: any) {
            console.error("Monitor Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const processMessages = (response: any) => {
        const allMsgs = Array.isArray(response) ? response : (response?.dados || []);
        
        if (!Array.isArray(allMsgs)) {
            console.error("Dados inválidos recebidos:", response);
            return;
        }
        
        const recipientsMap = new Map();
        
        allMsgs.forEach(msg => {
            const r = (msg.remetente || '').replace(/\D/g, '');
            const d = (msg.destinatario || '').replace(/\D/g, '');
            
            // Simples lógica para agrupar (como no LiveChat)
            // Aqui podemos simplesmente usar o destinatário como chave se for um monitor de saída
            const otherParty = d; 

            if (!recipientsMap.has(otherParty)) {
                recipientsMap.set(otherParty, {
                    id: otherParty,
                    name: msg.nome || 'Lead Monitor n8n',
                    lastMessage: msg.mensagem,
                    lastDate: msg.data,
                    status: msg.status || 'Default',
                    allMsgs: []
                });
            }
            recipientsMap.get(otherParty).allMsgs.push({
                id: Math.random(),
                direction: 'OUTBOUND',
                content: { text: msg.mensagem },
                createdAt: msg.data
            });
        });

        setUniqueRecipients(Array.from(recipientsMap.values()));
    };

    const selectRecipient = (recipientId: string) => {
        const recipient = uniqueRecipients.find(r => r.id === recipientId);
        if (recipient) {
            setSelectedRecipient(recipientId);
            setMessages(recipient.allMsgs);
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
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '14px', background: 'var(--primary-gradient)', borderRadius: '20px', color: 'black', boxShadow: '0 8px 25px rgba(172, 248, 0, 0.2)' }}>
                        <Database size={28} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 950, fontSize: '2.5rem', letterSpacing: '-2px', textTransform: 'uppercase', background: 'linear-gradient(to right, #fff, var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            MONITOR <span style={{ opacity: 0.7 }}>DE BANCO n8n</span>
                        </h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '11px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Integrado via Webhook Independente
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={fetchData} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', fontWeight: 800, cursor: 'pointer' }} className="hover-lift">
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

            {isLoading && uniqueRecipients.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                    <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%' }}></div>
                </div>
            ) : uniqueRecipients.length === 0 ? (
                <div className="supreme-card" style={{ padding: '60px', textAlign: 'center', margin: '0 auto', maxWidth: '600px' }}>
                    <Activity size={48} color="var(--primary-color)" style={{ margin: '0 auto 20px' }} />
                    <h2 style={{ color: 'white', fontWeight: 900 }}>Nenhum dado encontrado</h2>
                    <p style={{ color: 'var(--text-muted)' }}>O monitor n8n não retornou registros no momento.</p>
                    <button onClick={fetchData} className="premium-button" style={{ marginTop: '20px', padding: '12px 30px', background: 'var(--primary-color)', borderRadius: '12px', fontWeight: 900 }}>RECARREGAR</button>
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
                                        padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)',
                                        background: filterStatus === status ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                                        color: filterStatus === status ? 'black' : 'white',
                                        fontSize: '10px', fontWeight: 900, cursor: 'pointer'
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
                                <div key={conv.id} className="hover-lift" style={{ padding: '20px', borderRadius: '22px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} onClick={() => selectRecipient(conv.id)}>
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
                                    <h3 style={{ fontWeight: 900 }}>Selecione um registro</h3>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>{selectedRecipient}</h3>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {messages.map((msg: any) => (
                                        <div key={msg.id} className={`message-bubble message-outbound`}>
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
