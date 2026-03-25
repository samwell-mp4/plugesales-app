import { useState, useEffect } from 'react';
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
    Info,
    ChevronDown,
    ChevronUp,
    Search
} from 'lucide-react';

const ClientReports = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        if (user?.id) fetchReports();
    }, [user]);

    const fetchReports = async () => {
        setIsLoading(true);
        const fetchId = user?.role === 'CLIENT' ? user?.id : undefined;
        const data = await dbService.getReports(fetchId);
        setReports(data);
        setIsLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const userId = user?.id; // Capture ID
        if (!file || !userId) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData = XLSX.utils.sheet_to_json(ws);

                if (rawData.length === 0) {
                    alert("O arquivo está vazio.");
                    setIsUploading(false);
                    return;
                }

                // Process summary
                const summary = {
                    total: rawData.length,
                    delivered: rawData.filter((r: any) => String(r.Status || r.status || '').toLowerCase().includes('delivered')).length,
                    expired: rawData.filter((r: any) => String(r.Status || r.status || '').toLowerCase().includes('expired')).length,
                    others: 0
                };
                summary.others = summary.total - summary.delivered - summary.expired;

                const reportName = file.name.replace(/\.[^/.]+$/, "");
                
                const res = await dbService.addReport({
                    userId: userId,
                    reportName: reportName,
                    filename: file.name,
                    data: rawData,
                    summary: summary
                });

                if (res.success) {
                    await fetchReports();
                    alert("✅ Relatório processado e salvo com sucesso!");
                } else {
                    alert("❌ Erro ao salvar relatório: " + res.error);
                }
            } catch (err) {
                console.error(err);
                alert("❌ Erro ao ler o arquivo Excel. Verifique o formato.");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Deseja realmente excluir este relatório?")) return;
        const res = await dbService.deleteReport(id);
        if (res.success) fetchReports();
    };

    const toggleExpand = async (reportId: number) => {
        if (expandedReportId === reportId) {
            setExpandedReportId(null);
        } else {
            // Fetch full data for the report
            const fullReport = await dbService.getReportById(reportId);
            setReports(prev => prev.map(r => r.id === reportId ? fullReport : r));
            setExpandedReportId(reportId);
        }
    };

    const downloadXLS = (report: any) => {
        if (!report.data) return alert("Dados do relatório não carregados. Recarregue a página.");
        const ws = XLSX.utils.json_to_sheet(report.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dados");
        XLSX.writeFile(wb, `${report.report_name}_export.xlsx`);
    };

    const totalStats = reports.reduce((acc, curr) => ({
        total: acc.total + (curr.summary?.total || 0),
        delivered: acc.delivered + (curr.summary?.delivered || 0),
        expired: acc.expired + (curr.summary?.expired || 0)
    }), { total: 0, delivered: 0, expired: 0 });

    const filteredReports = reports.filter(r => {
        const matchesSearch = String(r.report_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            String(r.filename || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const reportDate = new Date(r.timestamp);
        const matchesStart = !startDate || reportDate >= new Date(startDate);
        const matchesEnd = !endDate || reportDate <= new Date(endDate + 'T23:59:59');
        
        const matchesStatus = statusFilter === 'ALL' || 
                             (statusFilter === 'DELIVERED' && (r.summary?.delivered || 0) > 0) ||
                             (statusFilter === 'EXPIRED' && (r.summary?.expired || 0) > 0);

        return matchesSearch && matchesStart && matchesEnd && matchesStatus;
    });

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            <style>{`
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
                .report-card { background: var(--card-bg-subtle); border: 1px solid var(--surface-border-subtle); border-radius: 24px; padding: 24px; margin-bottom: 16px; transition: all 0.3s ease; }
                .report-card:hover { border-color: var(--primary-color); transform: translateY(-2px); box-shadow: var(--shadow-md); }
                .report-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .status-badge { padding: 4px 12px; borderRadius: 8px; font-size: 10px; font-weight: 900; letter-spacing: 1px; }
                .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                .data-table th { text-align: left; padding: 12px; border-bottom: 1px solid var(--surface-border-subtle); color: var(--text-muted); text-transform: uppercase; font-size: 10px; }
                .data-table td { padding: 12px; border-bottom: 1px solid var(--surface-border-subtle); color: var(--text-primary); }
                .upload-zone { border: 2px dashed var(--surface-border-subtle); border-radius: 24px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 32px; background: rgba(255,255,255,0.02); }
                .upload-zone:hover { border-color: var(--primary-color); background: rgba(172,248,0,0.05); }
                .text-primary-color { color: var(--primary-color); }
            `}</style>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', margin: 0 }}>Relatórios Clínicos</h1>
                    <p className="subtitle">Gestão e visualização de resultados em massa por Excel</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)' }}>DE:</span>
                        <input type="date" className="input-field" style={{ padding: '8px', borderRadius: '10px', fontSize: '12px' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)' }}>ATÉ:</span>
                        <input type="date" className="input-field" style={{ padding: '8px', borderRadius: '10px', fontSize: '12px' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <select 
                        className="input-field" 
                        style={{ padding: '8px', borderRadius: '10px', fontSize: '12px', width: '150px' }}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">TODOS STATUS</option>
                        <option value="DELIVERED">COM ENTREGA</option>
                        <option value="EXPIRED">COM EXPIRADOS</option>
                    </select>
                    <div className="relative">
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            className="input-field" 
                            style={{ paddingLeft: '40px', width: '180px', borderRadius: '12px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="glass-card p-6 flex items-center gap-6">
                    <div style={{ background: 'rgba(172, 248, 0, 0.1)', padding: '15px', borderRadius: '20px' }}>
                        <BarChart3 color="var(--primary-color)" size={28} />
                    </div>
                    <div>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>TOTAL DE COMUNICAÇÕES</span>
                        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px' }}>{totalStats.total}</h2>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-6">
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '15px', borderRadius: '20px' }}>
                        <CheckCircle color="#22c55e" size={28} />
                    </div>
                    <div>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>ENTREGUES (DELIVERED)</span>
                        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px', color: '#22c55e' }}>{totalStats.delivered}</h2>
                        <span style={{ fontSize: '10px', opacity: 0.5 }}>{totalStats.total > 0 ? ((totalStats.delivered / totalStats.total) * 100).toFixed(1) : 0}% de taxa</span>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-6">
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '20px' }}>
                        <XCircle color="#ef4444" size={28} />
                    </div>
                    <div>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>EXPIRADOS (EXPIRED)</span>
                        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px', color: '#ef4444' }}>{totalStats.expired}</h2>
                        <span style={{ fontSize: '10px', opacity: 0.5 }}>{totalStats.total > 0 ? ((totalStats.expired / totalStats.total) * 100).toFixed(1) : 0}% de perda</span>
                    </div>
                </div>
            </div>

            {user?.role !== 'CLIENT' && (
                <label className="upload-zone flex-col items-center justify-center gap-4">
                    <input type="file" accept=".xlsx, .xls" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                    <div style={{ background: 'var(--primary-gradient)', padding: '16px', borderRadius: '20px', color: 'black' }}>
                        <Upload size={32} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontWeight: 900 }}>{isUploading ? 'PROCESSANDO...' : 'SUBIR NOVO RELATÓRIO EXCEL'}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.5 }}>Suporta colunas: Name, Status, Done At, etc.</p>
                    </div>
                </label>
            )}

            <div className="flex-col gap-4">
                {isLoading ? (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                         <div style={{ width: 40, height: 40, margin: '0 auto 16px', border: '3px solid rgba(172,248,0,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                         <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>BUSCANDO RELATÓRIOS...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', background: 'var(--card-bg-subtle)', borderRadius: '32px', border: '1px dashed var(--surface-border-subtle)' }}>
                        <FileSpreadsheet size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <h3 style={{ opacity: 0.3 }}>Nenhum relatório encontrado.</h3>
                    </div>
                ) : (
                    filteredReports.map((report) => (
                        <div key={report.id} className="report-card">
                            <div className="report-header" onClick={() => toggleExpand(report.id)}>
                                <div className="flex items-center gap-4">
                                    <div style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', padding: '12px', borderRadius: '14px' }}>
                                        <FileSpreadsheet size={20} className="text-primary-color" />
                                    </div>
                                    <div className="flex-col">
                                        <div className="flex items-center gap-2">
                                            <h4 style={{ margin: 0, fontWeight: 900, fontSize: '15px' }}>
                                                {report.submission_name ? `Campanha: ${report.submission_name}` : report.report_name}
                                            </h4>
                                            {report.submission_id && (
                                                <span 
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/client-submissions/${report.submission_id}`); }}
                                                    style={{ cursor: 'pointer', fontSize: '9px', fontWeight: 900, background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(172, 248, 0, 0.2)' }}
                                                >
                                                    SUB #{report.submission_id}
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{new Date(report.timestamp).toLocaleString()} • {report.filename}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex gap-4">
                                        <div className="flex-col items-center">
                                            <span style={{ fontSize: '12px', fontWeight: 900, color: '#22c55e' }}>{report.summary?.delivered || 0}</span>
                                            <span style={{ fontSize: '8px', fontWeight: 800, opacity: 0.5 }}>DELIVERED</span>
                                        </div>
                                        <div className="flex-col items-center">
                                            <span style={{ fontSize: '12px', fontWeight: 900, color: '#ef4444' }}>{report.summary?.expired || 0}</span>
                                            <span style={{ fontSize: '8px', fontWeight: 800, opacity: 0.5 }}>EXPIRED</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); downloadXLS(report); }} 
                                            className="action-btn ghost-btn" 
                                            style={{ height: 36, width: 36, padding: 0 }}
                                            title="Download Excel"
                                        >
                                            <Download size={14} />
                                        </button>
                                        {user?.role !== 'CLIENT' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }} 
                                                className="action-btn ghost-btn" 
                                                style={{ height: 36, width: 36, padding: 0, color: '#ef4444' }}
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        {expandedReportId === report.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {expandedReportId === report.id && report.data && (
                                <div className="animate-fade-in" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed var(--surface-border-subtle)' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h5 style={{ margin: 0, fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>LISTA COMPLETA DE REGISTROS ({report.data.length})</h5>
                                        <div className="flex items-center gap-2" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            <Info size={12} /> Exibindo todos os registros do arquivo original
                                        </div>
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '12px', border: '1px solid var(--surface-border-subtle)' }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Comunicação</th>
                                                    <th>De</th>
                                                    <th>Para</th>
                                                    <th>País</th>
                                                    <th>Status</th>
                                                    <th>Data Conclusão</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report.data.map((row: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td>{row['Communication Name'] || row.communication_name || '-'}</td>
                                                        <td>{row['From'] || row.from || '-'}</td>
                                                        <td>{row['To'] || row.to || '-'}</td>
                                                        <td>{row['Country Name'] || row.country_name || '-'}</td>
                                                        <td>
                                                            <span style={{ 
                                                                color: String(row.Status || row.status || '').toLowerCase().includes('delivered') ? '#22c55e' : (String(row.Status || row.status || '').toLowerCase().includes('expired') ? '#ef4444' : 'inherit'),
                                                                fontWeight: 700 
                                                            }}>
                                                                {row.Status || row.status || '-'}
                                                            </span>
                                                        </td>
                                                        <td>{row['Done At'] || row.done_at || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
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
