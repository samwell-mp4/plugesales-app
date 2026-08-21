import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import * as XLSX from 'xlsx';
import { 
    Search, Upload, Edit, Trash2, CheckCircle, 
    XCircle, Clock, FileSpreadsheet, Copy, AlertCircle
} from 'lucide-react';
import '../index.css';

const DispatchReports = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal states
    const [showManualModal, setShowManualModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        dispatch_name: '',
        dispatch_date: new Date().toISOString().slice(0, 16),
        qty_dispatched: 0,
        qty_delivered: 0,
        qty_failed: 0,
    });

    // Preview state
    const [previewData, setPreviewData] = useState<any>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            // Fetch users (clients) to show balance
            const usersData = await dbService.getAllUsers();
            const clientsData = usersData.filter((u: any) => u.role === 'CLIENT' || u.role === 'CLIENTE' || u.role === 'USUARIO');
            setClients(clientsData);

            // Fetch reports
            const reportsData = await dbService.getDeliveryReports();
            setReports(reportsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedClient) return;

        setIsLoading(true);
        try {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rawData = XLSX.utils.sheet_to_json(ws);
            
            const total = rawData.length;
            const delivered = rawData.filter((r: any) => String(r.Status || r.status || '').toLowerCase().includes('delivered')).length;
            const expired = rawData.filter((r: any) => String(r.Status || r.status || '').toLowerCase().includes('expired')).length;
            const others = total - delivered - expired;

            const failed = expired + others;
            
            const newFormData = {
                dispatch_name: `Disparo: ${file.name.replace(/\.[^/.]+$/, "")}`,
                dispatch_date: new Date().toISOString().slice(0, 16),
                qty_dispatched: total,
                qty_delivered: delivered,
                qty_failed: failed
            };
            setFormData(newFormData);

            generatePreview(total, delivered, failed, newFormData.dispatch_name);
        } catch (error) {
            console.error("Excel processing error:", error);
            alert("Erro ao ler arquivo Excel.");
        } finally {
            setIsLoading(false);
        }
    };

    const getCommissionForPrice = (price: number) => {
        if (price <= 0.19) return 0.005;
        if (price >= 0.40) return 0.04;
        if (price >= 0.30) return 0.03;
        if (price >= 0.25) return 0.02;
        if (price >= 0.20) return 0.01;
        return 0.01; // Default
    };

    const generatePreview = async (dispatched: number, delivered: number, failed: number, name: string) => {
        if (!selectedClient) return;
        
        // Find unit value from recent sales for this client
        const allSales = await dbService.getFinanceSales({ client_name: selectedClient.name });
        let unit_value = 0.10; // default fallback
        
        // Try to get latest unit value from last purchase
        if (allSales && allSales.length > 0) {
            const sorted = allSales.sort((a: any, b: any) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());
            if (sorted[0].unit_value > 0) unit_value = sorted[0].unit_value;
        }

        const success_rate = dispatched > 0 ? (delivered / dispatched) * 100 : 0;
        const consumed_value = delivered * unit_value;
        const comm_percent = getCommissionForPrice(unit_value);
        const commission_value = delivered * comm_percent;

        setPreviewData({
            dispatch_name: name,
            client_name: selectedClient.name,
            client_id: selectedClient.id,
            salesperson_id: selectedClient.salesperson_id || user?.id,
            dispatch_date: formData.dispatch_date,
            qty_dispatched: dispatched,
            qty_delivered: delivered,
            qty_failed: failed,
            success_rate: success_rate,
            unit_value: unit_value,
            consumed_value: consumed_value,
            commission_percent: comm_percent,
            commission_value: commission_value,
            client_balance_before: selectedClient.disparo_quantidade || 0,
            client_balance_after: (selectedClient.disparo_quantidade || 0) - delivered
        });
        
        setShowPreviewModal(true);
    };

    const handleConfirmReport = async () => {
        if (!previewData) return;
        setIsLoading(true);
        try {
            // Save report (which also saves commission via backend and deducts balance)
            const payload = {
                ...previewData,
                status: 'PROCESSADO',
                created_by: user?.name
            };

            await dbService.addDeliveryReport(payload);
            
            setShowPreviewModal(false);
            setShowManualModal(false);
            setShowSuccessModal(true);
            
            // Refetch to get updated balances and reports
            await fetchInitialData();
            
            // Try to re-select the client with new balance
            setSelectedClient((prev: any) => {
                if (!prev) return null;
                // It will just maintain the ID reference, but visually won't update until next select or we do a find
                return prev;
            });

        } catch (error) {
            console.error("Error confirming report:", error);
            alert("Erro ao confirmar relatório.");
        } finally {
            setIsLoading(false);
        }
    };

    const generateWhatsAppText = () => {
        if (!previewData) return '';
        const d = new Date(previewData.dispatch_date);
        const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} às ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        
        return `📊 *Relatório do Disparo*

*${previewData.dispatch_name}*
📅 Data e horário: ${formattedDate}
📈 Disparado: ${previewData.qty_dispatched.toLocaleString('pt-BR')}
✅ Entregue: ${previewData.qty_delivered.toLocaleString('pt-BR')}
❌ Não entregue: ${previewData.qty_failed.toLocaleString('pt-BR')}
🚀 Taxa de sucesso: ${previewData.success_rate.toFixed(2).replace('.', ',')}%`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateWhatsAppText());
        alert("Copiado com sucesso!");
    };

    return (
        <div style={{ padding: '32px 24px', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Relatórios de Entrega</h1>
            
            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                <div style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>1. Selecionar Cliente</h2>
                    <select 
                        value={selectedClient?.id || ''} 
                        onChange={(e) => {
                            const client = clients.find(c => String(c.id) === e.target.value);
                            setSelectedClient(client || null);
                        }}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', color: 'white', marginBottom: '16px' }}
                    >
                        <option value="">-- Selecione o Cliente --</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {selectedClient && (
                        <div style={{ padding: '16px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Saldo Atual de Disparos:</p>
                            <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#38bdf8' }}>
                                {(selectedClient.credits || 0).toLocaleString('pt-BR')}
                            </h3>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '24px', opacity: selectedClient ? 1 : 0.5, pointerEvents: selectedClient ? 'auto' : 'none' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>2. Importar Relatório</h2>
                    
                    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', background: 'var(--primary-color)', color: 'black', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            <FileSpreadsheet size={20} />
                            Anexar Excel Automático
                            <input type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleExcelUpload} disabled={isLoading} />
                        </label>
                        
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>OU</div>

                        <button 
                            onClick={() => setShowManualModal(true)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', background: 'transparent', color: 'white', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                        >
                            <Edit size={20} />
                            Lançamento Manual
                        </button>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Histórico de Relatórios</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                            <th style={{ padding: '12px' }}>ID</th>
                            <th style={{ padding: '12px' }}>Cliente</th>
                            <th style={{ padding: '12px' }}>Disparo</th>
                            <th style={{ padding: '12px' }}>Data</th>
                            <th style={{ padding: '12px' }}>Entregues</th>
                            <th style={{ padding: '12px' }}>Taxa de Sucesso</th>
                            <th style={{ padding: '12px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                <td style={{ padding: '12px' }}>#{r.id}</td>
                                <td style={{ padding: '12px' }}>{r.client_name}</td>
                                <td style={{ padding: '12px' }}>{r.dispatch_name}</td>
                                <td style={{ padding: '12px' }}>{new Date(r.dispatch_date).toLocaleDateString()}</td>
                                <td style={{ padding: '12px', color: '#22c55e' }}>{r.qty_delivered.toLocaleString('pt-BR')}</td>
                                <td style={{ padding: '12px' }}>{Number(r.success_rate).toFixed(2)}%</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: r.status === 'PROCESSADO' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: r.status === 'PROCESSADO' ? '#22c55e' : '#ef4444' }}>
                                        {r.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {reports.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum relatório processado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PREVIEW MODAL */}
            {showPreviewModal && previewData && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--surface-border)', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle color="#22c55e" /> Conferência de Processamento
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Disparados</div>
                                <div style={{ fontSize: '20px', fontWeight: 600 }}>{previewData.qty_dispatched.toLocaleString('pt-BR')}</div>
                            </div>
                            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '16px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#22c55e' }}>Entregues (Usados para Débito/Comissão)</div>
                                <div style={{ fontSize: '20px', fontWeight: 600, color: '#22c55e' }}>{previewData.qty_delivered.toLocaleString('pt-BR')}</div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-muted)' }}>Impacto no Saldo do Cliente</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Saldo Atual:</span>
                                <span>{previewData.client_balance_before.toLocaleString('pt-BR')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '8px' }}>
                                <span>Débito:</span>
                                <span>- {previewData.qty_delivered.toLocaleString('pt-BR')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--surface-border)', paddingTop: '8px', fontWeight: 600 }}>
                                <span>Novo Saldo:</span>
                                <span>{previewData.client_balance_after.toLocaleString('pt-BR')}</span>
                            </div>
                            {previewData.client_balance_after < 0 && (
                                <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertCircle size={14} /> Cliente ficará com saldo negativo!
                                </div>
                            )}
                        </div>

                        <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '8px', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-muted)' }}>Geração de Comissão</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Valor Unitário Base:</span>
                                <span>R$ {previewData.unit_value.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Comissão Aplicada:</span>
                                <span>R$ {previewData.commission_percent === 0.005 ? '0.005' : previewData.commission_percent.toFixed(2)} por lead</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--surface-border)', paddingTop: '8px', fontWeight: 600, color: 'var(--primary-color)' }}>
                                <span>Valor a ser Liberado:</span>
                                <span>R$ {previewData.commission_value.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => setShowPreviewModal(false)} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                                Cancelar
                            </button>
                            <button onClick={handleConfirmReport} disabled={isLoading} style={{ flex: 1, padding: '14px', background: 'var(--primary-color)', border: 'none', color: 'black', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                {isLoading ? 'Processando...' : 'Confirmar Processamento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MANUAL MODAL */}
            {showManualModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--surface-border)', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '24px', color: 'white' }}>Lançamento Manual</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Nome/Identificação do Disparo</label>
                                <input type="text" value={formData.dispatch_name} onChange={e => setFormData({...formData, dispatch_name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Data e Horário</label>
                                <input type="datetime-local" value={formData.dispatch_date} onChange={e => setFormData({...formData, dispatch_date: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', color: 'white' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Qtd Disparada</label>
                                    <input type="number" value={formData.qty_dispatched} onChange={e => setFormData({...formData, qty_dispatched: Number(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', color: 'white' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#22c55e', marginBottom: '8px' }}>Qtd Entregue</label>
                                    <input type="number" value={formData.qty_delivered} onChange={e => setFormData({...formData, qty_delivered: Number(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'white' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>Qtd Não Entregue</label>
                                <input type="number" value={formData.qty_failed} onChange={e => setFormData({...formData, qty_failed: Number(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'white' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => setShowManualModal(false)} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={() => {
                                generatePreview(formData.qty_dispatched, formData.qty_delivered, formData.qty_failed, formData.dispatch_name);
                            }} style={{ flex: 1, padding: '14px', background: 'var(--primary-color)', border: 'none', color: 'black', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Gerar Conferência</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS & WHATSAPP MODAL */}
            {showSuccessModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--surface-border)', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                        <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ marginBottom: '8px', color: 'white' }}>Relatório Processado!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
                            Saldo atualizado e comissão liberada com sucesso.
                        </p>
                        
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', textAlign: 'left', marginBottom: '24px', fontSize: '13px', whiteSpace: 'pre-wrap', border: '1px solid var(--surface-border-subtle)' }}>
                            {generateWhatsAppText()}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button onClick={copyToClipboard} style={{ padding: '14px', background: '#25D366', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Copy size={18} /> Copiar mensagem
                            </button>
                            <button onClick={() => setShowSuccessModal(false)} style={{ padding: '14px', background: 'transparent', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DispatchReports;
