import { useState, useEffect } from 'react';
import { 
    Users, 
    TrendingUp, 
    MessageCircle, 
    Search,
    Zap,
    Clock,
    UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { useNavigate } from 'react-router-dom';

const LeadCRM = () => {
    const navigate = useNavigate();
    const { user } = useAuth() as any;
    const [leads, setLeads] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        if (user?.id) {
            fetchLeads();
            fetchTeam();
        }
    }, [user]);

    const fetchLeads = async () => {
        setIsLoading(true);
        console.log("Fetching leads for user:", user?.id, "Role:", user?.role);
        try {
            const data = await dbService.getLeads(user.id, user.role);
            console.log("Leads received from server:", data);
            setLeads(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching leads:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeam = async () => {
        try {
            const teamData = await dbService.getTeam();
            setTeam(teamData);
        } catch (err) {
            console.error("Error fetching team:", err);
        }
    };

    const updateLeadField = async (id: number, field: string, value: any) => {
        try {
            await dbService.updateLead(id, { [field]: value });
            // Local update for snappiness
            setLeads(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
            // Re-fetch to get names (e.g. assigned_user_name)
            if (field === 'assigned_to') {
                setTimeout(fetchLeads, 500);
            }
        } catch (err) {
            console.error(`Error updating lead ${field}:`, err);
        }
    };

    const filteredLeads = leads.filter(l => {
        const matchesSearch = (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (l.phone || '').includes(searchTerm);
        if (filterStatus === 'ALL') return matchesSearch;
        return matchesSearch && l.status === filterStatus;
    });

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'NOVO').length,
        inProgress: leads.filter(l => l.status === 'CONTATADO').length,
        converted: leads.filter(l => l.status === 'CONVERTIDO').length
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'NOVO': return { bg: 'rgba(172, 248, 0, 0.1)', color: '#acf800' };
            case 'CONTATADO': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
            case 'CONVERTIDO': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
            case 'PERDIDO': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
            default: return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' };
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', margin: 0 }}>Lead Management CRM</h1>
                    <p className="subtitle">Centralize sua operação, gerencie leads e escale seu atendimento</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={() => fetchLeads()} style={{ borderRadius: '16px', padding: '12px 24px', opacity: 0.8 }}>
                        ATUALIZAR
                    </button>
                </div>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="glass-card" style={{ borderLeft: '4px solid #acf800' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>LEADS TOTAIS</span>
                        <Users size={20} color="#acf800" opacity={0.5} />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{stats.total}</div>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>EM ATENDIMENTO</span>
                        <Clock size={20} color="#3b82f6" opacity={0.5} />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{stats.inProgress}</div>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid #22c55e' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>CONVERSÕES</span>
                        <TrendingUp size={20} color="#22c55e" opacity={0.5} />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{stats.converted}</div>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>RETENÇÃO</span>
                        <Zap size={20} color="var(--primary-color)" opacity={0.5} />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : 0}%</div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                    <div className="flex items-center gap-4">
                        <h3 style={{ margin: 0, fontWeight: 800 }}>Pipeline de Leads</h3>
                        <div style={{ background: 'var(--card-bg-subtle)', borderRadius: '10px', padding: '4px', display: 'flex', gap: '4px' }}>
                            {['ALL', 'NOVO', 'CONTATADO', 'CONVERTIDO', 'PERDIDO'].map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => setFilterStatus(s)}
                                    style={{ 
                                        padding: '6px 14px', 
                                        border: 'none', 
                                        background: filterStatus === s ? 'var(--primary-color)' : 'transparent',
                                        color: filterStatus === s ? 'black' : 'var(--text-secondary)',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {s === 'ALL' ? 'TODOS' : s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input 
                                placeholder="Buscar lead..." 
                                className="input-field" 
                                style={{ paddingLeft: '44px', background: 'var(--card-bg-subtle)', borderRadius: '14px' }}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', opacity: 0.5 }}>IDENTIFICAÇÃO</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', opacity: 0.5 }}>STATUS</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', opacity: 0.5 }}>RESPONSÁVEL</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', opacity: 0.5 }}>ORIGEM</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', opacity: 0.5, textAlign: 'right' }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '100px', opacity: 0.5 }}>Carregando CRM...</td></tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '100px', opacity: 0.5 }}>Nenhum lead no pipeline.</td></tr>
                            ) : (
                                filteredLeads.map(lead => {
                                    const statusStyle = getStatusStyle(lead.status);
                                    return (
                                        <tr key={lead.id} style={{ borderTop: '1px solid var(--surface-border)' }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div className="flex items-center gap-3">
                                                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 900 }}>
                                                        {lead.name[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800 }}>{lead.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#acf800' }}>{lead.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <select 
                                                    value={lead.status} 
                                                    onChange={(e) => updateLeadField(lead.id, 'status', e.target.value)}
                                                    style={{ 
                                                        background: statusStyle.bg, 
                                                        color: statusStyle.color, 
                                                        border: 'none', 
                                                        padding: '6px 12px', 
                                                        borderRadius: '8px', 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: 800,
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="NOVO">🚀 NOVO</option>
                                                    <option value="CONTATADO">💬 ATENDIMENTO</option>
                                                    <option value="CONVERTIDO">✅ CONVERTIDO</option>
                                                    <option value="PERDIDO">❌ PERDIDO</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div className="flex items-center gap-2">
                                                    <UserCheck size={14} opacity={0.5} />
                                                    <select 
                                                        value={lead.assigned_to || ''} 
                                                        onChange={(e) => updateLeadField(lead.id, 'assigned_to', e.target.value ? parseInt(e.target.value) : null)}
                                                        style={{ 
                                                            background: 'transparent', 
                                                            color: lead.assigned_to ? 'white' : 'var(--text-secondary)', 
                                                            border: 'none', 
                                                            fontSize: '0.8rem', 
                                                            fontWeight: 600,
                                                            outline: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="">Não atribuído</option>
                                                        {team.map(member => (
                                                            <option key={member.id} value={member.id}>{member.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                                                    {lead.affiliate_id ? `Afiliado #${lead.affiliate_id}` : 'Direto'}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{new Date(lead.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        className="btn" 
                                                        style={{ background: '#22c55e', color: 'white', borderRadius: '10px', padding: '8px' }}
                                                        onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Olá ${lead.name}, vi que você testou nosso simulador da Plug %26 Sales!`, '_blank')}
                                                        title="WhatsApp"
                                                    >
                                                        <MessageCircle size={18} />
                                                    </button>
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        style={{ borderRadius: '10px', padding: '8px' }}
                                                        onClick={() => navigate('/dispatch', { state: { lead } })}
                                                        title="Disparar Template"
                                                    >
                                                        <Zap size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeadCRM;
