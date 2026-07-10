import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, RefreshCw, Smartphone, Upload, Link as LinkIcon, Send, X, AlertCircle, Search, LayoutGrid, List as ListIcon, User, Clock, FileText, CheckCircle2 } from 'lucide-react';

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
    
    // View State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDisparador, setFilterDisparador] = useState('ALL');

    // Form state
    const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);
    const [targetUrl, setTargetUrl] = useState('');
    
    const WEBHOOK_URL = 'https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/a2d2ee02-2bdf-4f5c-a1b6-a0cd43b128ed';

    const fetchWebhookData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
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
            
            if (Array.isArray(data)) {
                setItems(data);
            } else if (data && typeof data === 'object') {
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

    // Extract unique responsáveis for the filter dropdown
    const uniqueResponsaveis = useMemo(() => {
        const set = new Set<string>();
        items.forEach(i => {
            if (i.responsavel_disparo && i.responsavel_disparo.trim()) {
                set.add(i.responsavel_disparo.trim());
            }
        });
        return Array.from(set).sort();
    }, [items]);

    // Apply filters
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Search query matches client or waba
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q || 
                (item.cliente || '').toLowerCase().includes(q) || 
                (item.numero_disparo || '').toLowerCase().includes(q) ||
                (item.waba || '').toLowerCase().includes(q);
                
            // Disparador filter
            const matchesDisparador = filterDisparador === 'ALL' || (item.responsavel_disparo || '').trim() === filterDisparador;
            
            return matchesSearch && matchesDisparador;
        });
    }, [items, searchQuery, filterDisparador]);

    const handleCardClick = (item: WebhookItem) => {
        setSelectedItem(item);
        setSpreadsheetFile(null);
        setTargetUrl('');
        setShowModal(true);
    };

    const handleProcess = () => {
        if (!selectedItem) return;
        
        const rawCliente = selectedItem.cliente || 'cliente';
        const cleanCliente = rawCliente.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        
        const rawData = selectedItem.data_disparo || '';
        let dateSuffix = '';
        if (rawData) {
            const parts = rawData.split('/');
            if (parts.length >= 2) {
                dateSuffix = `${parts[0]}${parts[1]}`;
            }
        }
        if (!dateSuffix) {
            const today = new Date();
            dateSuffix = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}`;
        }

        // Format sender to 55+number
        const rawNumero = selectedItem.numero_disparo || '';
        let cleanNumero = rawNumero.replace(/[^0-9]/g, '');
        // If it's 10 or 11 digits (e.g., 3195732044), add 55
        if (cleanNumero.length === 10 || cleanNumero.length === 11) {
            cleanNumero = '55' + cleanNumero;
        }
        
        const finalNumero = cleanNumero.length >= 4 ? cleanNumero.slice(-4) : cleanNumero;

        const basePrefix = `${cleanCliente}_${dateSuffix}_${finalNumero}`;

        let leads = parseInt(String(selectedItem.quantidade_lead || '0'), 10);
        if (isNaN(leads)) leads = 0;
        
        const BATCH_SIZE = 10000;
        const totalBatches = Math.ceil(leads / BATCH_SIZE) || 1; 
        
        const rows = [];
        for (let i = 0; i < totalBatches; i++) {
            const suffix = totalBatches > 1 ? `parte${i + 1}_` : ``;
            rows.push({
                suffix: suffix,
                headerType: 'TEXT',
                buttonUrls: targetUrl ? [targetUrl] : [],
                buttonTexts: ['Clique Aqui'],
                variables: ['', '', '', '', ''],
                sender: cleanNumero // Enviar o número já formatado certinho
            });
        }

        const wabaInfo = (selectedItem.waba || '').toLowerCase();
        const isLuis = wabaInfo.includes('luis');

        const preFillData = {
            activeTab: 'BULK',
            senderNumber: cleanNumero,
            useLuis: isLuis,
            campaignPrefix: basePrefix + '_',
            rows: rows
        };

        setShowModal(false);
        navigate('/templates', { state: { preFillData, activeTab: 'BULK', useLuis: isLuis } });
    };

    return (
        <div className="p-4 md:p-8 min-h-screen" style={{ color: 'white' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
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

            {/* Toolbar: Filters and View Toggle */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 flex-1 w-full" style={{ background: 'rgba(0,0,0,0.5)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Search size={18} className="opacity-50" />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente, waba ou número..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                    />
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                    <select 
                        value={filterDisparador}
                        onChange={(e) => setFilterDisparador(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.5)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', fontSize: '0.9rem', minWidth: '200px' }}
                    >
                        <option value="ALL">Todos os Disparadores</option>
                        {uniqueResponsaveis.map(resp => (
                            <option key={resp} value={resp}>{resp}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button 
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '8px', borderRadius: '8px', background: viewMode === 'grid' ? 'var(--primary-color)' : 'transparent', color: viewMode === 'grid' ? 'black' : 'white', opacity: viewMode === 'grid' ? 1 : 0.5, transition: 'all 0.2s' }}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            style={{ padding: '8px', borderRadius: '8px', background: viewMode === 'list' ? 'var(--primary-color)' : 'transparent', color: viewMode === 'list' ? 'black' : 'white', opacity: viewMode === 'list' ? 1 : 0.5, transition: 'all 0.2s' }}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
                    <AlertCircle size={20} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{error}</span>
                </div>
            )}

            {filteredItems.length === 0 && !isLoading && !error && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                    <Zap size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <h3 className="text-xl font-bold">Nenhum disparo pendente</h3>
                    <p className="text-sm mt-2">Clique em Atualizar ou mude seus filtros.</p>
                </div>
            )}

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item, index) => (
                        <div 
                            key={index} 
                            onClick={() => handleCardClick(item)}
                            className="group relative cursor-pointer flex flex-col"
                            style={{
                                background: '#131417',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '24px',
                                transition: 'all 0.3s ease',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.borderColor = 'rgba(172, 248, 0, 0.3)';
                                e.currentTarget.style.boxShadow = '0 10px 40px -10px rgba(172, 248, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={20} style={{ opacity: 0.3 }} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                                                {item.cliente || 'Desconhecido'}
                                            </h3>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                Responsável: {item.responsavel_disparo || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <span style={{ 
                                        fontSize: '9px', 
                                        fontWeight: 900, 
                                        padding: '4px 8px', 
                                        borderRadius: '8px', 
                                        background: 'rgba(234, 179, 8, 0.1)', 
                                        color: '#eab308', 
                                        border: '1px solid rgba(234, 179, 8, 0.2)',
                                        letterSpacing: '0.5px'
                                    }}>
                                        PENDENTE
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} className="text-primary-color" />
                                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-color)' }}>
                                            {item.quantidade_lead ? Number(item.quantidade_lead).toLocaleString('pt-BR') : '0'} LEADS
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} style={{ opacity: 0.5 }} />
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                            {item.horario_disparo || '--:--'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 mt-auto p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div className="flex justify-between items-center">
                                        <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.5 }}>REMETENTE</span>
                                        <span style={{ fontSize: '11px', fontWeight: 800 }}>{item.numero_disparo || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.5 }}>WABA</span>
                                        <span style={{ fontSize: '11px', fontWeight: 800 }}>{item.waba?.toLowerCase().includes('luis') ? 'Luis (Alt)' : 'Sidão (Pad)'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-6 pb-6 pt-0">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCardClick(item);
                                    }}
                                    style={{
                                        width: '100%',
                                        background: '#f97316', // Orange button like in the print
                                        color: 'white',
                                        fontWeight: 900,
                                        fontSize: '12px',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    className="hover:brightness-110 transition-all"
                                >
                                    <FileText size={16} />
                                    PREENCHER NO CREATOR
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {/* List Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white/50 border-b border-white/5">
                        <div className="col-span-3">Cliente</div>
                        <div className="col-span-2">Responsável</div>
                        <div className="col-span-2">Data / Horário</div>
                        <div className="col-span-2">Remetente</div>
                        <div className="col-span-2">Leads / Waba</div>
                        <div className="col-span-1 text-right">Ação</div>
                    </div>

                    {filteredItems.map((item, index) => (
                        <div 
                            key={index}
                            onClick={() => handleCardClick(item)}
                            className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 cursor-pointer"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(172, 248, 0, 0.3)';
                                e.currentTarget.style.background = 'rgba(172, 248, 0, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            }}
                        >
                            <div className="col-span-3">
                                <span style={{ fontWeight: 900, color: 'var(--primary-color)' }}>{item.cliente || 'Desconhecido'}</span>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <User size={14} className="opacity-50" />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.responsavel_disparo || 'N/A'}</span>
                            </div>
                            <div className="col-span-2 flex flex-col">
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.data_disparo || '--'}</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 700 }}>{item.horario_disparo || '--:--'}</span>
                            </div>
                            <div className="col-span-2 flex flex-col">
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.numero_disparo || 'N/A'}</span>
                            </div>
                            <div className="col-span-2 flex flex-col">
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.quantidade_lead ? Number(item.quantidade_lead).toLocaleString('pt-BR') : '0'}</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 700 }}>{item.waba?.toLowerCase().includes('luis') ? 'Luis' : 'Sidão'}</span>
                            </div>
                            <div className="col-span-1 text-right">
                                <button style={{ background: 'var(--primary-color)', color: 'black', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                                    CRIAR
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                                <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{selectedItem.cliente} - Reponsável: {selectedItem.responsavel_disparo}</span>
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
                                    className="cursor-pointer transition-colors"
                                    style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', opacity: 0.8 }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
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
                                    marginTop: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                                className="hover:scale-[1.02]"
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
