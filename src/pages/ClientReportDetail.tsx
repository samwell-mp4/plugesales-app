import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { 
    ChevronLeft, 
    CheckCircle, 
    XCircle,
    Copy,
    Search
} from 'lucide-react';

const ClientReportDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (id) fetchReportDetail();
    }, [id]);

    const fetchReportDetail = async () => {
        setIsLoading(true);
        try {
            const data = await dbService.getReportById(Number(id));
            setReport(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredData = report?.data?.filter((row: any) => {
        const value = String(row['To'] || row.to || '').toLowerCase();
        return value.includes(searchTerm.toLowerCase());
    }) || [];

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontWeight: 800, color: 'var(--text-muted)', marginTop: '16px' }}>CARREGANDO DADOS DO RELATÓRIO...</p>
            </div>
        );
    }

    if (!report) {
        return (
            <div style={{ padding: '80px', textAlign: 'center' }}>
                <h3 style={{ opacity: 0.3 }}>Relatório não encontrado.</h3>
                <button onClick={() => navigate('/client-reports')} className="btn btn-secondary" style={{ marginTop: '20px' }}>Voltar</button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
            <style>{`
                .detail-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                .detail-table th { text-align: left; padding: 16px; border-bottom: 2px solid var(--surface-border-subtle); color: var(--text-muted); text-transform: uppercase; font-size: 11px; font-weight: 900; }
                .detail-table td { padding: 16px; border-bottom: 1px solid var(--surface-border-subtle); color: var(--text-primary); }
                .stat-box { background: var(--card-bg-subtle); border-radius: 16px; padding: 16px; border: 1px solid var(--surface-border-subtle); min-width: 150px; }
            `}</style>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/client-reports')} 
                        className="action-btn"
                        style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', padding: '10px', borderRadius: '14px' }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-1.5px', margin: 0 }}>
                            {report.submission_name ? `Campanha: ${report.submission_name}` : report.report_name}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                            Relatório #{report.id} • {report.filename} • {new Date(report.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="stat-box flex items-center gap-4">
                        <CheckCircle color="#22c55e" size={20} />
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)' }}>DELIVERED</div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#22c55e' }}>{report.summary?.delivered || 0}</div>
                        </div>
                    </div>
                    <div className="stat-box flex items-center gap-4">
                        <XCircle color="#ef4444" size={20} />
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)' }}>EXPIRED</div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444' }}>{report.summary?.expired || 0}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--surface-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="relative" style={{ width: '100%', maxWidth: '400px' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar por número (Para)..." 
                            className="input-field" 
                            style={{ paddingLeft: '48px', width: '100%', borderRadius: '16px', background: 'var(--card-bg-subtle)' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>
                        Exibindo {filteredData.length} de {report.data?.length || 0} registros
                    </div>
                </div>

                <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                    <table className="detail-table">
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 10 }}>
                            <tr>
                                <th style={{ paddingLeft: '32px' }}>Para (Número)</th>
                                <th>Status</th>
                                <th style={{ paddingRight: '32px' }}>Data Conclusão</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '100px', opacity: 0.3 }}>
                                        Nenhum registro encontrado para sua busca.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row: any, idx: number) => (
                                    <tr key={idx} className="hover-row">
                                        <td style={{ paddingLeft: '32px', fontWeight: 800 }}>
                                            <div className="flex items-center gap-3">
                                                {row['To'] || row.to || '-'}
                                                <button 
                                                    onClick={() => navigator.clipboard.writeText(row['To'] || row.to || '')}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0.2, color: 'inherit' }}
                                                    title="Copiar"
                                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.2')}
                                                >
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ 
                                                color: String(row.Status || row.status || '').toLowerCase().includes('delivered') ? '#22c55e' : (String(row.Status || row.status || '').toLowerCase().includes('expired') ? '#ef4444' : 'inherit'),
                                                fontWeight: 900,
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                background: String(row.Status || row.status || '').toLowerCase().includes('delivered') ? 'rgba(34,197,94,0.1)' : (String(row.Status || row.status || '').toLowerCase().includes('expired') ? 'rgba(239,68,68,0.1)' : 'transparent'),
                                                fontSize: '11px',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {(row.Status || row.status || '-').toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ paddingRight: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                            {row['Done At'] || row.done_at || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientReportDetail;
