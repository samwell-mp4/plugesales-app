import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, RefreshCw, Smartphone, Upload, Link as LinkIcon, Send, X, AlertCircle } from 'lucide-react';

interface WebhookItem {
    cliente?: string;
    horario_disparo?: string;
    numero_disparo?: string;
    waba?: string;
    data_disparo?: string;
    responsavel_disparo?: string;
    quantidade_lead?: string | number;
    entregue?: string | number;
    status?: string;
    [key: string]: any;
}

const ExpressTemplate = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState<WebhookItem[]>([]);
    const [error, setError] = useState('');

    const [selectedItem, setSelectedItem] = useState<WebhookItem | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);
    const [targetUrl, setTargetUrl] = useState('');
    
    const WEBHOOK_URL = 'https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/a2d2ee02-2bdf-4f5c-a1b6-a0cd43b128ed';

    const fetchWebhookData = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Note: Since this is an n8n webhook, we use GET or POST depending on configuration.
            // Using POST as mentioned by user (but GET is also fine if configured).
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST', // Changed from GET based on user feedback
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'fetch_express_templates' })
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            
            // Handle n8n response format (often an array of items)
            if (Array.isArray(data)) {
                setItems(data);
            } else if (data && typeof data === 'object') {
                // If it returns an object, maybe it's wrapped
                setItems([data]);
            } else {
                setItems([]);
            }
        } catch (err: any) {
            console.error('Error fetching webhook:', err);
            setError(err.message || 'Falha ao buscar dados do webhook');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWebhookData();
    }, []);

    const handleCardClick = (item: WebhookItem) => {
        setSelectedItem(item);
        setSpreadsheetFile(null);
        setTargetUrl('');
        setShowModal(true);
    };

    const handleProcess = () => {
        if (!selectedItem) return;
        
        // 1. Compute Base Campaign Name
        // Example: c6bank_0907_0646
        const rawCliente = selectedItem.cliente || 'cliente';
        const cleanCliente = rawCliente.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        
        const rawData = selectedItem.data_disparo || '';
        let dateSuffix = '';
        if (rawData) {
            // from "10/07/2026" to "1007"
            const parts = rawData.split('/');
            if (parts.length >= 2) {
                dateSuffix = `${parts[0]}${parts[1]}`;
            }
        }
        if (!dateSuffix) {
            const today = new Date();
            dateSuffix = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}`;
        }

        const rawNumero = selectedItem.numero_disparo || '';
        const cleanNumero = rawNumero.replace(/[^0-9]/g, '');
        const finalNumero = cleanNumero.length >= 4 ? cleanNumero.slice(-4) : cleanNumero;

        const basePrefix = `${cleanCliente}_${dateSuffix}_${finalNumero}`;

        // 2. Compute rows based on quantidade_lead
        let leads = parseInt(String(selectedItem.quantidade_lead || '0'), 10);
        if (isNaN(leads)) leads = 0;
        
        const BATCH_SIZE = 10000;
        const totalBatches = Math.ceil(leads / BATCH_SIZE) || 1; // Default to at least 1 row
        
        const rows = [];
        for (let i = 0; i < totalBatches; i++) {
            const prefix = totalBatches > 1 ? `${basePrefix}_parte${i + 1}_` : `${basePrefix}_`;
            rows.push({
                prefix: prefix,
                headerType: 'TEXT',
                buttonUrls: targetUrl ? [targetUrl] : [],
                buttonTexts: ['Clique Aqui'],
                variables: ['', '', '', '', '']
            });
        }

        // 3. Evaluate WABA (Luis vs Sidão)
        const wabaInfo = (selectedItem.waba || '').toLowerCase();
        const isLuis = wabaInfo.includes('luis');

        // 4. Construct PreFillData
        const preFillData = {
            activeTab: 'BULK',
            senderNumber: rawNumero,
            useLuis: isLuis,
            campaignPrefix: basePrefix + '_',
            rows: rows
            // Spreadsheet isn't directly passed to TemplateCreator since TemplateCreator
            // doesn't upload the list itself. We might just upload it here to MediaHosting?
            // Actually, "você ja vai tratar ela como trata no nosso Planilhas" 
            // In Planilhas, they upload the list for splitting. But here, they just need to generate the template.
            // If they need to upload the spreadsheet, we can upload it here or just pass the file reference 
            // if we need to store it somewhere. But usually TemplateCreator doesn't need the file to generate templates.
            // Let's assume TemplateCreator will just receive the targetUrl and create the templates.
        };

        setShowModal(false);
        navigate('/templates', { state: { preFillData, activeTab: 'BULK', useLuis: isLuis } });
    };

    return (
        <div className="p-4 md:p-8 min-h-screen" style={{ color: 'white' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div className="flex flex-col">
                    <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.4rem, 6vw, 2.4rem)', letterSpacing: '-1.5px', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--primary-color)', color: 'black', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                            <Zap size={24} />
                        </div>
                        Express Template
                    </h1>
                    <p style={{ fontSize: 'clamp(0.75rem, 3.5vw, 1rem)', opacity: 0.6, marginTop: '8px' }}>
                        Geração rápida de campanhas em lote baseada na triagem do n8n
                    </p>
                </div>
                
                <button 
                    onClick={fetchWebhookData}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
                    style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        opacity: isLoading ? 0.5 : 1
                    }}
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    ATUALIZAR DADOS
                </button>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
                    <AlertCircle size={20} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.length === 0 && !isLoading && !error && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
                        <Zap size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                        <h3 className="text-xl font-bold">Nenhum disparo pendente</h3>
                        <p className="text-sm mt-2">Clique em Atualizar para buscar novos dados do Webhook.</p>
                    </div>
                )}

                {items.map((item, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleCardClick(item)}
                        className="group relative cursor-pointer"
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '20px',
                            padding: '20px',
                            transition: 'all 0.3s ease',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = 'rgba(172, 248, 0, 0.3)';
                            e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(172, 248, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-color)', lineHeight: 1.2 }}>
                                {item.cliente || 'Cliente Desconhecido'}
                            </h3>
                            <div style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
                                {item.horario_disparo || '--:--'}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Smartphone size={14} className="opacity-50" />
                                </div>
                                <div className="flex flex-col">
                                    <span style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Remetente</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.numero_disparo || 'N/A'}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={14} className="opacity-50" />
                                </div>
                                <div className="flex flex-col">
                                    <span style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Leads Previstos</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                        {item.quantidade_lead ? Number(item.quantidade_lead).toLocaleString('pt-BR') : '0'} leads
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertCircle size={14} className="opacity-50" />
                                </div>
                                <div className="flex flex-col">
                                    <span style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>WABA</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                        {item.waba?.toLowerCase().includes('luis') ? 'Luis (Alternativo)' : 'Sidão (Padrão)'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                            <span style={{ background: 'var(--primary-color)', color: 'black', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800 }}>
                                INICIAR PREPARO
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Wizard Modal */}
            {showModal && selectedItem && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
                    <div style={{ width: '100%', maxWidth: '600px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', position: 'relative' }}>
                        <button 
                            onClick={() => setShowModal(false)}
                            style={{ position: 'absolute', top: '24px', right: '24px', color: 'rgba(255,255,255,0.5)' }}
                            className="hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div style={{ background: 'rgba(172, 248, 0, 0.1)', padding: '12px', borderRadius: '16px' }}>
                                <Zap size={24} color="var(--primary-color)" />
                            </div>
                            <div className="flex flex-col">
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>Express Config</h2>
                                <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{selectedItem.cliente}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Passo 1: Planilha */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="flex items-center gap-3">
                                    <Upload size={18} color="var(--primary-color)" />
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Passo 1: Planilha de Leads (Opcional)</span>
                                </div>
                                <input
                                    type="file"
                                    id="express-upload"
                                    style={{ display: 'none' }}
                                    accept=".csv,.xlsx,.xls"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSpreadsheetFile(e.target.files[0]);
                                        }
                                    }}
                                />
                                <label 
                                    htmlFor="express-upload"
                                    className="cursor-pointer"
                                    style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', opacity: 0.8 }}
                                >
                                    {spreadsheetFile ? (
                                        <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Planilha Selecionada: {spreadsheetFile.name}</span>
                                    ) : (
                                        <span>Clique aqui para selecionar uma planilha CSV/XLSX</span>
                                    )}
                                </label>
                            </div>

                            {/* Passo 2: URL */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="flex items-center gap-3">
                                    <LinkIcon size={18} color="var(--primary-color)" />
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Passo 2: URL de Destino (Link do Botão)</span>
                                </div>
                                <input 
                                    type="text" 
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    placeholder="https://exemplo.com/..."
                                    style={{ 
                                        width: '100%', 
                                        background: 'rgba(0,0,0,0.5)', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '12px', 
                                        padding: '12px 16px', 
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleProcess}
                                style={{
                                    background: 'var(--primary-color)',
                                    color: 'black',
                                    fontWeight: 900,
                                    fontSize: '1rem',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    marginTop: '8px'
                                }}
                            >
                                IR PARA CRIAÇÃO EM MASSA
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpressTemplate;
