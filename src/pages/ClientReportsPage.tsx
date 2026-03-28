import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import * as XLSX from 'xlsx';
import { 
    FileSpreadsheet, 
    Upload, 
    Download, 
    Trash2, 
    BarChart3, 
    CheckCircle, 
    XCircle,
    ChevronDown,
    ChevronUp,
    Inbox,
    RefreshCw
} from 'lucide-react';

const ClientReports = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [expandedCampaigns, setExpandedCampaigns] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (user?.id) fetchReports();
    }, [user]);

    const fetchReports = async () => {
        setIsLoading(true);
        const fetchId = user?.role === 'CLIENT' ? user?.id : undefined;
        try {
            const data = await dbService.getReports(fetchId);
            setReports(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCampaign = (id: number) => {
        const next = new Set(expandedCampaigns);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedCampaigns(next);
    };

    // SECURE DOWNLOAD LOGIC: STRICT COLUMN FILTERING
    const secureDownloadXLS = async (report: any) => {
        try {
            const details = await dbService.getReportDetails(report.id);
            if (!details || !details.data) throw new Error("Erro ao buscar dados.");

            // STRICT FILTERING: Name, Phone, Status, Done At
            const filteredData = details.data.map((r: any) => ({
                "NOME": r.Name || r.name || r.NOME || r.Nome || '',
                "TELEFONE": r.Phone || r.phone || r.TELEFONE || r.Telefone || '',
                "STATUS": r.Status || r.status || r.STATUS || (r.delivered ? 'Entregue' : 'Não Entregue'),
                "DATA DE ENTREGA": r.DoneAt || r['Done At'] || r.done_at || r.timestamp || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(filteredData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório Filtrado");
            XLSX.writeFile(workbook, `${report.filename || 'relatorio_filtrado'}.xlsx`);
        } catch (err) {
            alert("Erro ao baixar relatório: " + err);
        }
    };

    // GROUPING LOGIC
    const groupedCampaigns = useMemo(() => {
        const groups: { [key: number]: any } = {};
        
        reports.forEach(report => {
            const campaignId = report.submission_id || 0;
            if (!groups[campaignId]) {
                groups[campaignId] = {
                    id: campaignId,
                    name: report.submission_name || 'Sem Campanha',
                    reports: [],
                    total: 0,
                    delivered: 0,
                    expired: 0,
                    lastUpdate: report.timestamp
                };
            }
            groups[campaignId].reports.push(report);
            groups[campaignId].total += (report.summary?.total || 0);
            groups[campaignId].delivered += (report.summary?.delivered || 0);
            groups[campaignId].expired += (report.summary?.expired || 0);
            if (new Date(report.timestamp) > new Date(groups[campaignId].lastUpdate)) {
                groups[campaignId].lastUpdate = report.timestamp;
            }
        });

        return Object.values(groups).sort((a: any, b: any) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
    }, [reports]);

    const totalStats = useMemo(() => reports.reduce((acc, curr) => ({
        total: acc.total + (curr.summary?.total || 0),
        delivered: acc.delivered + (curr.summary?.delivered || 0),
        expired: acc.expired + (curr.summary?.expired || 0)
    }), { total: 0, delivered: 0, expired: 0 }), [reports]);

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            <style>{`
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
                .campaign-card { background: var(--card-bg-subtle); border: 1px solid var(--surface-border-subtle); border-radius: 28px; margin-bottom: 16px; overflow: hidden; transition: all 0.2s ease; }
                .campaign-header { padding: 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: rgba(255,255,255,0.01); }
                .campaign-header:hover { background: rgba(255,255,255,0.03); }
                .campaign-body { border-top: 1px solid var(--surface-border-subtle); padding: 16px; background: rgba(0,0,0,0.1); }
                .report-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 16px; margin-bottom: 8px; background: rgba(255,255,255,0.02); }
                .report-row:hover { background: rgba(172,248,0,0.05); }
                .text-primary-color { color: var(--primary-color); }
                .stat-tag { font-size: 10px; font-weight: 900; padding: 4px 10px; borderRadius: 8px; letter-spacing: 0.5px; }
            `}</style>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', margin: 0 }}>Relatórios Clínicos</h1>
                    <p className="subtitle">Visão agregada por conjunto de disparos</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="glass-card p-6 flex items-center gap-6">
                    <div style={{ background: 'rgba(172, 248, 0, 0.1)', padding: '15px', borderRadius: '20px' }}>
                        <BarChart3 color="var(--primary-color)" size={28} />
                    </div>
                    <div>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>TOTAL ACUMULADO</span>
                        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px' }}>{totalStats.total}</h2>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-6">
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '15px', borderRadius: '20px' }}>
                        <CheckCircle color="#22c55e" size={28} />
                    </div>
                    <div>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>ENTREGUES OK</span>
                        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px', color: '#22c55e' }}>{totalStats.delivered}</h2>
                        <span style={{ fontSize: '10px', opacity: 0.5 }}>{totalStats.total > 0 ? ((totalStats.delivered / totalStats.total) * 100).toFixed(1) : 0}% taxa</span>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-6">
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '20px' }}>
                        <XCircle color="#ef4444" size={28} />
                    </div>
                    <div>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>NÃO ENTREGUES/EXP</span>
                        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px', color: '#ef4444' }}>{totalStats.expired}</h2>
                        <span style={{ fontSize: '10px', opacity: 0.5 }}>{totalStats.total > 0 ? ((totalStats.expired / totalStats.total) * 100).toFixed(1) : 0}% perda</span>
                    </div>
                </div>
            </div>

            <div className="flex-col gap-4">
                {isLoading ? (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                         <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                         <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>ORGANIZANDO CAMPANHAS...</p>
                    </div>
                ) : groupedCampaigns.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', background: 'var(--card-bg-subtle)', borderRadius: '32px', border: '1px dashed var(--surface-border-subtle)' }}>
                        <Inbox size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <h3 style={{ opacity: 0.3 }}>Nenhuma campanha disponível.</h3>
                    </div>
                ) : (
                    groupedCampaigns.map((camp: any) => (
                        <div key={camp.id} className="campaign-card">
                            <div className="campaign-header" onClick={() => toggleCampaign(camp.id)}>
                                <div className="flex items-center gap-5">
                                    <div style={{ background: 'var(--primary-color)', padding: '12px', borderRadius: '16px', color: '#000' }}>
                                        <FileSpreadsheet size={24} />
                                    </div>
                                    <div className="flex-col">
                                        <h4 style={{ margin: 0, fontWeight: 900, fontSize: '17px', color: 'var(--text-primary)' }}>{camp.name}</h4>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{camp.reports.length} ARQUIVOS NO CONJUNTO • ÚLTIMO EM {new Date(camp.lastUpdate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="flex gap-6">
                                        <div className="flex-col items-center">
                                            <span style={{ fontSize: '14px', fontWeight: 900, color: '#22c55e' }}>{camp.delivered}</span>
                                            <span style={{ fontSize: '8px', fontWeight: 900, opacity: 0.5 }}>ENTREGUES</span>
                                        </div>
                                        <div className="flex-col items-center">
                                            <span style={{ fontSize: '14px', fontWeight: 900, color: '#ef4444' }}>{camp.expired}</span>
                                            <span style={{ fontSize: '8px', fontWeight: 900, opacity: 0.5 }}>NÃO ENTREGUES</span>
                                        </div>
                                    </div>
                                    <div style={{ opacity: 0.5 }}>
                                        {expandedCampaigns.has(camp.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {expandedCampaigns.has(camp.id) && (
                                <div className="campaign-body">
                                    {camp.reports.map((report: any) => (
                                        <div key={report.id} className="report-row">
                                            <div className="flex items-center gap-4">
                                                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FileSpreadsheet size={16} style={{ opacity: 0.4 }} />
                                                </div>
                                                <div className="flex-col">
                                                    <span style={{ fontSize: '12px', fontWeight: 800 }}>{report.filename}</span>
                                                    <span style={{ fontSize: '9px', opacity: 0.5 }}>{new Date(report.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-3 mr-4">
                                                    <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 900 }}>{report.summary?.delivered || 0} OK</span>
                                                    <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 900 }}>{report.summary?.expired || 0} OFF</span>
                                                </div>
                                                <button 
                                                    onClick={() => secureDownloadXLS(report)}
                                                    className="action-btn"
                                                    style={{ border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'transparent', padding: '6px 12px', fontSize: '10px', fontWeight: 900, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                    <Download size={14} /> BAIXAR FILTRADO
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClientReports;
