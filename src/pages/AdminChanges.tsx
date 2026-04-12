import { useState, useEffect } from 'react';
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    User, 
    Bell, 
    ChevronRight, 
    ArrowRight,
    Search,
    Inbox,
    ShieldAlert
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

const AdminChanges = () => {
    const { user } = useAuth() as any;
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getChangeRequests();
            setRequests(data);
        } catch (err) {
            console.error("Error loading change requests:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        if (!window.confirm(`Deseja realmente ${action === 'approve' ? 'APROVAR' : 'REJEITAR'} esta alteração?`)) return;
        
        try {
            const res = action === 'approve' 
                ? await dbService.approveChangeRequest(id)
                : await dbService.rejectChangeRequest(id);

            if (res.success) {
                alert(`Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`);
                loadRequests();
            } else {
                alert("Erro ao processar ação: " + (res.error || "Erro desconhecido"));
            }
        } catch (err) {
            console.error("Action error:", err);
        }
    };

    const filteredRequests = requests.filter(r => 
        (r.profile_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.requester_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderDiff = (original: any, requested: any) => {
        const fields = Object.keys(requested);
        return (
            <div style={{ display: 'grid', gap: '16px' }}>
                {fields.map(field => {
                    const isChanged = original[field] !== requested[field];
                    return (
                        <div key={field} style={{ 
                            padding: '16px', 
                            background: isChanged ? 'rgba(172,248,0,0.03)' : 'rgba(255,255,255,0.02)', 
                            border: `1px solid ${isChanged ? 'rgba(172,248,0,0.15)' : 'var(--surface-border-subtle)'}`,
                            borderRadius: '16px',
                            animation: isChanged ? 'pulse 2s infinite' : 'none'
                        }}>
                            <div style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                {field.replace('_', ' ')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <div style={{ fontSize: '10px', color: 'rgba(239,68,68,0.6)', fontWeight: 800, marginBottom: '4px' }}>ORIGINAL</div>
                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: isChanged ? 'line-through' : 'none' }}>
                                        {original[field] || '(Vazio)'}
                                    </div>
                                </div>
                                <ArrowRight size={16} style={{ opacity: 0.2, color: 'var(--primary-color)' }} />
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <div style={{ fontSize: '10px', color: isChanged ? 'var(--primary-color)' : 'rgba(255,255,255,0.6)', fontWeight: 800, marginBottom: '4px' }}>SOLICITADO</div>
                                    <div style={{ fontSize: '13px', color: isChanged ? 'white' : 'rgba(255,255,255,0.6)', fontWeight: isChanged ? 700 : 400 }}>
                                        {requested[field] || '(Vazio)'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{ padding: '32px', minHeight: '100vh', background: 'var(--bg-primary)', color: 'white' }}>
            <style>{`
                @keyframes pulse {
                    0% { border-color: rgba(172,248,0,0.1); }
                    50% { border-color: rgba(172,248,0,0.3); }
                    100% { border-color: rgba(172,248,0,0.1); }
                }
                .req-card {
                    background: var(--card-bg-subtle);
                    border: 1px solid var(--surface-border-subtle);
                    border-radius: 24px;
                    padding: 24px;
                    margin-bottom: 24px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .req-card:hover {
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px -10px rgba(0,0,0,0.3);
                }
                .action-btn-admin {
                    padding: 12px 24px;
                    border-radius: 14px;
                    border: none;
                    font-weight: 900;
                    font-size: 11px;
                    letter-spacing: 1px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s;
                    text-transform: uppercase;
                }
                .approve-btn { background: var(--primary-gradient); color: black; box-shadow: 0 10px 20px -5px rgba(172,248,0,0.3); }
                .reject-btn { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2) !important; }
                .reject-btn:hover { background: rgba(239,68,68,0.2); }
            `}</style>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', gap: '24px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '16px', background: 'rgba(172,248,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                <Bell size={24} />
                            </div>
                            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px' }}>Pendências de Alteração</h1>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>Revise e aprove solicitações de mudança nos dados dos clientes.</p>
                    </div>

                    <div style={{ flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '20px', padding: '0 16px' }}>
                        <Search size={18} style={{ color: 'var(--text-muted)' }} />
                        <input 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            placeholder="Buscar por cliente ou solicitante..." 
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', padding: '14px 0', fontSize: '14px', width: '100%' }} 
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '100px', textAlign: 'center' }}>
                        <div style={{ width: 48, height: 48, border: '3px solid var(--surface-border-subtle)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                        <p style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px' }}>CONECTANDO AO BANCO...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div style={{ padding: '100px', textAlign: 'center', background: 'var(--card-bg-subtle)', borderRadius: '32px', border: '1px solid var(--surface-border-subtle)' }}>
                        <Inbox size={64} style={{ margin: '0 auto 24px', opacity: 0.1 }} />
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Tudo em Ordem!</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Não existem solicitações de alteração pendentes no momento.</p>
                    </div>
                ) : (
                    <div>
                        {filteredRequests.map(req => (
                            <div key={req.id} className="req-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid var(--surface-border-subtle)', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: 56, height: 56, borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={28} style={{ opacity: 0.3 }} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>{req.profile_name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                                <span style={{ fontSize: '10px', color: 'var(--primary-color)', fontWeight: 900 }}>SOLICITANTE: {req.requester_name?.toUpperCase()}</span>
                                                <span style={{ color: 'var(--surface-border-subtle)' }}>•</span>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={10} /> {new Date(req.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => handleAction(req.id, 'reject')} className="action-btn-admin reject-btn">
                                            <XCircle size={16} /> Recusar
                                        </button>
                                        <button onClick={() => handleAction(req.id, 'approve')} className="action-btn-admin approve-btn">
                                            <CheckCircle2 size={16} /> Aprovar Alteração
                                        </button>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                        <ShieldAlert size={16} style={{ color: 'var(--primary-color)' }} />
                                        <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>COMPARAÇÃO DE DADOS</span>
                                    </div>
                                    {renderDiff(req.original_data, req.requested_data)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChanges;
