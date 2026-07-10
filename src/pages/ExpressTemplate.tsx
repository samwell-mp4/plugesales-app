import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, RefreshCw, Smartphone, Upload, Link as LinkIcon, Send, X, AlertCircle, Search, LayoutGrid, List as ListIcon, User, Clock, FileText, CheckCircle2, Activity } from 'lucide-react';
import * as XLSX from 'xlsx';

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
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterWaba, setFilterWaba] = useState('ALL');
    const [filterHorario, setFilterHorario] = useState('ALL');

    // Form state
    const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);
    const [targetUrl, setTargetUrl] = useState('');
    
    // Spreadsheet Processing State
    const [isProcessingCsv, setIsProcessingCsv] = useState(false);
    const [parsedCsvChunks, setParsedCsvChunks] = useState<any[]>([]);

    
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
            if (i.responsavel_disparo && i.responsavel_disparo.trim()) set.add(i.responsavel_disparo.trim());
        });
        return Array.from(set).sort();
    }, [items]);
    
    const uniqueStatuses = useMemo(() => {
        const set = new Set<string>();
        items.forEach(i => {
            if (i.status && i.status.trim()) set.add(i.status.trim());
        });
        return Array.from(set).sort();
    }, [items]);

    const uniqueWabas = useMemo(() => {
        const set = new Set<string>();
        items.forEach(i => {
            if (i.waba && i.waba.trim()) set.add(i.waba.trim());
        });
        return Array.from(set).sort();
    }, [items]);

    const uniqueHorarios = useMemo(() => {
        const set = new Set<string>();
        items.forEach(i => {
            if (i.horario_disparo && i.horario_disparo.trim()) set.add(i.horario_disparo.trim());
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
                
            const matchesDisparador = filterDisparador === 'ALL' || (item.responsavel_disparo || '').trim() === filterDisparador;
            const matchesStatus = filterStatus === 'ALL' || (item.status || '').trim() === filterStatus;
            const matchesWaba = filterWaba === 'ALL' || (item.waba || '').trim() === filterWaba;
            const matchesHorario = filterHorario === 'ALL' || (item.horario_disparo || '').trim() === filterHorario;
            
            return matchesSearch && matchesDisparador && matchesStatus && matchesWaba && matchesHorario;
        });
    }, [items, searchQuery, filterDisparador, filterStatus, filterWaba, filterHorario]);

    const handleCardClick = (item: WebhookItem) => {
        setSelectedItem(item);
        setSpreadsheetFile(null);
        setTargetUrl('');
        setParsedCsvChunks([]);
        setShowModal(true);
    };

    const isReportLate = (item: WebhookItem) => {
        const s = (item.status || '').trim().toUpperCase();
        if (s !== 'ENVIAR RELATÓRIO' && s !== 'ENVIAR RELATORIO') return false;
        
        if (!item.data_disparo || !item.horario_disparo) return false;
        
        // data_disparo is usually "DD/MM/YYYY" or "DD/MM", horario_disparo "HH:MM"
        const dateParts = item.data_disparo.split('/');
        const timeParts = item.horario_disparo.split(':');
        
        if (dateParts.length < 2 || timeParts.length < 2) return false;
        
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        let year = dateParts.length === 3 ? parseInt(dateParts[2], 10) : new Date().getFullYear();
        if (year < 100) year += 2000;
        
        const hour = parseInt(timeParts[0], 10);
        const minute = parseInt(timeParts[1], 10);
        
        if (isNaN(day) || isNaN(month) || isNaN(hour) || isNaN(minute)) return false;
        
        const disparoDate = new Date(year, month - 1, day, hour, minute);
        const oneHourLater = new Date(disparoDate.getTime() + 60 * 60 * 1000);
        const now = new Date();
        
        return now > oneHourLater;
    };

    const getStatusStyle = (item: WebhookItem) => {
        const status = item.status;
        if (!status) return { text: 'PENDENTE', color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' };
        const s = status.trim().toUpperCase();
        if (s === 'RELATÓRIO ENVIADO' || s === 'RELATORIO ENVIADO') {
            return { text: status.toUpperCase(), color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)' };
        }
        if (s === 'CANCELADO') {
            return { text: status.toUpperCase(), color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' };
        }
        if (s === 'AGENDADO') {
            return { text: status.toUpperCase(), color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' };
        }
        if (s === 'ENVIAR RELATÓRIO' || s === 'ENVIAR RELATORIO') {
            if (isReportLate(item)) {
                return { text: 'RELATÓRIO ATRASADO', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }; // Red for late
            }
            return { text: status.toUpperCase(), color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' };
        }
        return { text: status.toUpperCase(), color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' };
    };

    // Appends processSpreadsheet logic
    const normalizePhone = (input: string) => {
        let cleaned = input.replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
        if (cleaned.length === 10 || cleaned.length === 11) cleaned = '55' + cleaned;
        if (cleaned.length === 12 && cleaned.startsWith('55')) {
            cleaned = cleaned.slice(0, 4) + '9' + cleaned.slice(4);
        }
        return cleaned;
    };

    const processSpreadsheet = async (file: File) => {
        setIsProcessingCsv(true);
        setParsedCsvChunks([]);
        
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const json: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                const startIndex = (json[0] && typeof json[0][0] === 'string' && isNaN(Number(json[0][0]))) ? 1 : 0;
                
                const headers = startIndex === 1 && json[0] ? json[0].map((h: any) => String(h || '').trim()) : null;
                const lowerHeaders = headers ? headers.map((h: string) => h.toLowerCase()) : [];

                let phoneColIndex = lowerHeaders.findIndex((h: string) => h.includes('celular') || h.includes('telefone') || h.includes('whatsapp') || h.includes('numero') || h.includes('número'));
                let nameColIndex = lowerHeaders.findIndex((h: string) => h === 'nome' || h === 'name' || h.includes('nome') || h === 'info_2');

                if (phoneColIndex === -1) {
                    if (json.length > startIndex) {
                        const firstDataRow = json[startIndex];
                        for (let col = 0; col < Math.min(firstDataRow.length, 6); col++) {
                            const raw = String(firstDataRow[col] || '');
                            if (normalizePhone(raw).length === 13) {
                                phoneColIndex = col;
                                break;
                            }
                        }
                    }
                }
                if (phoneColIndex === -1) phoneColIndex = 0;

                const extracted = [];
                for (let i = startIndex; i < json.length; i++) {
                    const row = json[i];
                    if (row && row.length > 0) {
                        const rawCell = String(row[phoneColIndex] || '');
                        const phone = normalizePhone(rawCell);
                        if (phone.length >= 10 && phone.length <= 15) {
                            let contactName = '';
                            if (nameColIndex !== -1) {
                                contactName = String(row[nameColIndex] || '').trim();
                            } else {
                                contactName = String(row[phoneColIndex === 0 ? 1 : 0] || '').trim();
                            }

                            const contact: any = {
                                telefone: phone,
                                nome: contactName,
                            };
                            
                            let extraCount = 4;
                            if (headers) {
                                headers.forEach((_: any, cIdx: number) => {
                                    if (cIdx !== phoneColIndex && cIdx !== nameColIndex) {
                                        contact[`info_${extraCount}`] = String(row[cIdx] || '');
                                        extraCount++;
                                    }
                                });
                            }
                            
                            extracted.push(contact);
                        }
                    }
                }

                const seen = new Set();
                const filtered = extracted.filter(item => {
                    const duplicate = seen.has(item.telefone);
                    seen.add(item.telefone);
                    return !duplicate;
                });

                if (filtered.length === 0) {
                    alert("Nenhum número válido encontrado na planilha.");
                    setIsProcessingCsv(false);
                    return;
                }

                const BATCH_SIZE = 10000;
                const chunks = [];
                for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
                    const chunkData = filtered.slice(i, i + BATCH_SIZE).map((c) => {
                        const res: any = { Número: c.telefone, info_2: c.nome };
                        Object.keys(c).forEach(k => {
                            if (k !== 'telefone' && k !== 'nome') res[k] = c[k];
                        });
                        return res;
                    });
                    
                    const worksheet = XLSX.utils.json_to_sheet(chunkData);
                    const newWorkbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(newWorkbook, worksheet, "Contatos");
                    const csvOutput = XLSX.write(newWorkbook, { bookType: 'csv', type: 'array' });
                    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
                    const blobUrl = URL.createObjectURL(blob);
                    chunks.push(blobUrl);
                }
                
                setParsedCsvChunks(chunks);
                setIsProcessingCsv(false);
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            alert("Erro ao processar planilha.");
            setIsProcessingCsv(false);
        }
    };

    const handleProcess = () => {
        if (!selectedItem) return;
        
        if (!spreadsheetFile) {
            const proceed = window.confirm("Você tem certeza que quer continuar sem planilha anexada?");
            if (!proceed) return;
        }

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

        const rawNumero = selectedItem.numero_disparo || '';
        let cleanNumero = rawNumero.replace(/[^0-9]/g, '');
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
                sender: cleanNumero,
                csvUrl: null
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
                        background: 'var(--primary-color)', 
                        color: 'black',
                        border: 'none',
                        opacity: isLoading ? 0.5 : 1,
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 14px 0 rgba(172, 248, 0, 0.2)'
                    }}
                    onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.transform = 'translateY(0)' }}
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    ATUALIZAR DADOS
                </button>
            </div>

            {/* Toolbar: Filters and View Toggle */}
            <div className="flex flex-col gap-4 mb-8" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 w-full" style={{ background: 'rgba(0,0,0,0.5)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Search size={18} className="opacity-50" />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente, waba ou número..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full">
                    <select 
                        value={filterDisparador}
                        onChange={(e) => setFilterDisparador(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.5)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', fontSize: '0.9rem', flex: '1 1 150px' }}
                    >
                        <option value="ALL">Resp. (Todos)</option>
                        {uniqueResponsaveis.map(resp => <option key={resp} value={resp}>{resp}</option>)}
                    </select>

                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.5)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', fontSize: '0.9rem', flex: '1 1 150px' }}
                    >
                        <option value="ALL">Status (Todos)</option>
                        {uniqueStatuses.map(val => <option key={val} value={val}>{val}</option>)}
                    </select>

                    <select 
                        value={filterWaba}
                        onChange={(e) => setFilterWaba(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.5)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', fontSize: '0.9rem', flex: '1 1 150px' }}
                    >
                        <option value="ALL">Waba (Todos)</option>
                        {uniqueWabas.map(val => <option key={val} value={val}>{val}</option>)}
                    </select>

                    <select 
                        value={filterHorario}
                        onChange={(e) => setFilterHorario(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.5)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', fontSize: '0.9rem', flex: '1 1 150px' }}
                    >
                        <option value="ALL">Horário (Todos)</option>
                        {uniqueHorarios.map(val => <option key={val} value={val}>{val}</option>)}
                    </select>

                    <div className="flex items-center gap-1 ml-auto" style={{ background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
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
                                    
                                    {(() => {
                                        const st = getStatusStyle(item);
                                        return (
                                            <span style={{ 
                                                fontSize: '9px', 
                                                fontWeight: 900, 
                                                padding: '4px 8px', 
                                                borderRadius: '8px', 
                                                background: st.bg, 
                                                color: st.color, 
                                                border: `1px solid ${st.color.replace(')', ', 0.2)').replace('rgb', 'rgba')}`,
                                                letterSpacing: '0.5px'
                                            }}>
                                                {st.text}
                                            </span>
                                        );
                                    })()}
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
                                    {item.entregue && (
                                        <div className="flex justify-between items-center">
                                            <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.5 }}>ENTREGUES</span>
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-color)' }}>{Number(item.entregue).toLocaleString('pt-BR')}</span>
                                        </div>
                                    )}
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
                            className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-3 cursor-pointer border-b"
                            style={{
                                borderColor: 'rgba(255,255,255,0.05)',
                                background: 'transparent',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(172, 248, 0, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <div className="col-span-3 flex items-center gap-3">
                                <span style={{ fontWeight: 900, color: 'var(--primary-color)' }}>{item.cliente || 'Desconhecido'}</span>
                                {(() => {
                                    const st = getStatusStyle(item);
                                    return (
                                        <span style={{ 
                                            fontSize: '8px', 
                                            fontWeight: 900, 
                                            padding: '2px 6px', 
                                            borderRadius: '6px', 
                                            background: st.bg, 
                                            color: st.color, 
                                            border: `1px solid ${st.color.replace(')', ', 0.2)').replace('rgb', 'rgba')}`,
                                            letterSpacing: '0.5px',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {st.text}
                                        </span>
                                    );
                                })()}
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
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.quantidade_lead ? Number(item.quantidade_lead).toLocaleString('pt-BR') : '0'} Leads</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 700 }}>{item.waba?.toLowerCase().includes('luis') ? 'Luis' : 'Sidão'}</span>
                                {item.entregue && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', marginTop: '2px' }}>Entregues: {Number(item.entregue).toLocaleString('pt-BR')}</span>
                                )}
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
                                            const selectedFile = e.target.files[0];
                                            setSpreadsheetFile(selectedFile);
                                            processSpreadsheet(selectedFile);
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
                                        <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Planilha Selecionada: {spreadsheetFile.name} {isProcessingCsv && '(Limpando...)'}</span>
                                    ) : (
                                        <span>Clique aqui para selecionar uma planilha CSV/XLSX</span>
                                    )}
                                </label>
                                {parsedCsvChunks.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {parsedCsvChunks.map((chunkUrl, i) => (
                                            <a 
                                                key={i}
                                                href={chunkUrl} 
                                                download={`PLANILHA_${selectedItem?.cliente}_PARTE_${i + 1}.csv`}
                                                style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textDecoration: 'none' }}
                                            >
                                                Baixar Parte {i + 1}
                                            </a>
                                        ))}
                                    </div>
                                )}
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
                                disabled={isProcessingCsv}
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
                                    transition: 'all 0.2s ease',
                                    opacity: isProcessingCsv ? 0.5 : 1,
                                    cursor: isProcessingCsv ? 'not-allowed' : 'pointer'
                                }}
                                className={isProcessingCsv ? '' : 'hover:scale-[1.02]'}
                            >
                                {isProcessingCsv ? (
                                    <>
                                        <Activity size={18} className="animate-spin" />
                                        PROCESSANDO PLANILHA...
                                    </>
                                ) : (
                                    <>
                                        IR PARA CRIAÇÃO EM MASSA
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpressTemplate;
