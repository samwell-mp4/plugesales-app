import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
    Upload,
    FileSpreadsheet,
    Users,
    Layers,
    Cpu,
    CheckCircle,
    AlertTriangle,
    Play,
    Pause,
    Trash2,
    Plus,
    RefreshCw,
    Sparkles,
    Copy,
    Smartphone,
    Type,
    Image as ImageIcon,
    Check,
    ArrowRight,
    Sliders,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { dbService } from '../services/dbService';

export interface BMConfig {
    id: string;
    label: string;
    senderNumber: string;
    credentialType: 'sidao' | 'luiz';
    limit: number;
    templateName: string;
    templateLanguage: string;
    templates: any[];
    isLoadingTemplates?: boolean;
    headerType: 'IMAGE' | 'VIDEO' | 'NONE';
    mediaUrl: string;
}

export interface ParsedContact {
    telefone: string;
    nome: string;
    [key: string]: string;
}

export interface PlaceholderMapping {
    id: number;
    type: 'column' | 'fixed';
    columnName: string;
    fixedValue: string;
}

interface MultiBMExcelDispatchProps {
    defaultApiKey: string;
    defaultSender: string;
    userName?: string;
}

const LUIS_KEY = '35a1621fff9a97453d02b0dbe043467e-9501a6c3-3289-4fb9-90b4-d16b18b48d47';
const LUIS_BASE = '4k3e4p.api-us.infobip.com';
const DEFAULT_BASE = '8k6xv1.api-us.infobip.com';

export const MultiBMExcelDispatch: React.FC<MultiBMExcelDispatchProps> = ({
    defaultApiKey,
    defaultSender,
    userName
}) => {
    // --- EXCEL STATE ---
    const [fileName, setFileName] = useState<string>('');
    const [isParsingExcel, setIsParsingExcel] = useState(false);
    const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
    const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
    const [excelStats, setExcelStats] = useState<{ totalRows: number; validCount: number; duplicateCount: number } | null>(null);
    const [excelSample, setExcelSample] = useState<ParsedContact[]>([]);

    // --- VARIABLES MAPPING ---
    const [placeholderMappings, setPlaceholderMappings] = useState<PlaceholderMapping[]>([
        { id: 1, type: 'column', columnName: 'nome', fixedValue: '' },
        { id: 2, type: 'column', columnName: '', fixedValue: '' }
    ]);

    // --- MULTI-BM STATE ---
    const [bms, setBms] = useState<BMConfig[]>([
        {
            id: '1',
            label: 'BM 1',
            senderNumber: defaultSender || '',
            credentialType: 'sidao',
            limit: 250,
            templateName: '',
            templateLanguage: 'pt_BR',
            templates: [],
            headerType: 'NONE',
            mediaUrl: ''
        }
    ]);

    // Modal / Bulk paste senders
    const [showPasteModal, setShowPasteModal] = useState(false);
    const [bulkSendersText, setBulkSendersText] = useState('');

    // --- REDIS QUEUE STATE & MONITORING ---
    const [redisStatus, setRedisStatus] = useState<{ queueLength: number; isRunning: boolean; processed: number; warning?: string }>({
        queueLength: 0,
        isRunning: false,
        processed: 0
    });
    const [isPollingRedis, setIsPollingRedis] = useState(false);
    const [isEnqueuing, setIsEnqueuing] = useState(false);
    const [enqueueProgress, setEnqueueProgress] = useState({ current: 0, total: 0 });
    const [enqueueResult, setEnqueueResult] = useState<{ success: boolean; message: string } | null>(null);
    const [selectedPreviewBMIndex, setSelectedPreviewBMIndex] = useState(0);

    const pollingIntervalRef = useRef<any>(null);

    // Normalize phone numbers
    const normalizePhone = (input: string) => {
        let cleaned = String(input || '').replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
        if (cleaned.length === 10 || cleaned.length === 11) cleaned = '55' + cleaned;
        if (cleaned.length === 12 && cleaned.startsWith('55')) {
            cleaned = cleaned.slice(0, 4) + '9' + cleaned.slice(4);
        }
        return cleaned;
    };

    // Initial load: Fetch Redis status & templates for initial BM
    useEffect(() => {
        fetchRedisStatus();
        if (defaultSender) {
            fetchTemplatesForBM(bms[0].id, defaultSender, 'sidao');
        }
    }, [defaultSender]);

    // Recurring polling for Redis queue when active
    useEffect(() => {
        if (redisStatus.isRunning || redisStatus.queueLength > 0 || isPollingRedis) {
            if (!pollingIntervalRef.current) {
                pollingIntervalRef.current = setInterval(fetchRedisStatus, 2500);
            }
        } else {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [redisStatus.isRunning, redisStatus.queueLength, isPollingRedis]);

    const fetchRedisStatus = async () => {
        try {
            const res = await fetch('/api/dispatch/queue/status');
            if (res.ok) {
                const data = await res.json();
                setRedisStatus(data);
            }
        } catch (e) {
            console.error('Erro ao consultar status da fila Redis:', e);
        }
    };

    const stopRedisQueue = async () => {
        if (!window.confirm('Deseja enviar comando de PARADA para o worker da Fila Redis?')) return;
        try {
            const res = await fetch('/api/dispatch/queue/stop', { method: 'POST' });
            if (res.ok) {
                alert('Comando de parada enviado ao worker!');
                fetchRedisStatus();
            }
        } catch (e: any) {
            alert(`Erro ao parar fila: ${e.message}`);
        }
    };

    const clearRedisQueue = async () => {
        if (!window.confirm('ATENÇÃO: Deseja apagar todas as mensagens da Fila Redis e zerar os contadores?')) return;
        try {
            const res = await fetch('/api/dispatch/queue', { method: 'DELETE' });
            if (res.ok) {
                alert('Fila Redis limpa com sucesso!');
                fetchRedisStatus();
            }
        } catch (e: any) {
            alert(`Erro ao limpar fila: ${e.message}`);
        }
    };

    // Fetch approved templates for a specific sender
    const fetchTemplatesForBM = async (bmId: string, senderNum: string, credType: 'sidao' | 'luiz') => {
        if (!senderNum || senderNum.trim().length < 8) return;
        const key = credType === 'luiz' ? LUIS_KEY : defaultApiKey;
        const base = credType === 'luiz' ? LUIS_BASE : DEFAULT_BASE;
        if (!key) return;

        setBms(prev => prev.map(b => b.id === bmId ? { ...b, isLoadingTemplates: true } : b));

        try {
            const res = await fetch(`https://${base}/whatsapp/2/senders/${senderNum.trim()}/templates`, {
                headers: { 'Authorization': `App ${key}` }
            });
            const data = await res.json();
            const approved = (data.templates || []).filter((t: any) => t.status === 'APPROVED');

            setBms(prev => prev.map(b => {
                if (b.id === bmId) {
                    const currentTplStillValid = approved.some((t: any) => t.name === b.templateName);
                    return {
                        ...b,
                        templates: approved,
                        isLoadingTemplates: false,
                        templateName: currentTplStillValid ? b.templateName : (approved[0]?.name || '')
                    };
                }
                return b;
            }));
        } catch (err) {
            console.error('Erro ao buscar templates para BM:', err);
            setBms(prev => prev.map(b => b.id === bmId ? { ...b, isLoadingTemplates: false } : b));
        }
    };

    // --- EXCEL PARSING ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setIsParsingExcel(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const json: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                if (!json || json.length === 0) {
                    alert('Planilha vazia ou sem linhas identificáveis.');
                    setIsParsingExcel(false);
                    return;
                }

                const startIndex = (json[0] && typeof json[0][0] === 'string' && isNaN(Number(json[0][0]))) ? 1 : 0;
                const rawHeaders = startIndex === 1 && json[0] ? json[0].map((h: any) => String(h || '').trim()) : [];
                const lowerHeaders = rawHeaders.map((h: string) => h.toLowerCase());

                let phoneColIndex = lowerHeaders.findIndex((h: string) =>
                    h.includes('celular') || h.includes('telefone') || h.includes('whatsapp') || h.includes('numero') || h.includes('número') || h.includes('phone')
                );
                let nameColIndex = lowerHeaders.findIndex((h: string) =>
                    h === 'nome' || h === 'name' || h.includes('nome') || h === 'cliente' || h === 'lead'
                );

                if (phoneColIndex === -1 && json.length > startIndex) {
                    const sampleRow = json[startIndex];
                    for (let col = 0; col < Math.min(sampleRow.length, 8); col++) {
                        const sampleNorm = normalizePhone(String(sampleRow[col] || ''));
                        if (sampleNorm.length >= 10 && sampleNorm.length <= 15) {
                            phoneColIndex = col;
                            break;
                        }
                    }
                }
                if (phoneColIndex === -1) phoneColIndex = 0;

                const extracted: ParsedContact[] = [];
                const seen = new Set<string>();
                let duplicates = 0;

                for (let i = startIndex; i < json.length; i++) {
                    const row = json[i];
                    if (!row || row.length === 0) continue;
                    const rawPhone = String(row[phoneColIndex] || '');
                    const phone = normalizePhone(rawPhone);

                    if (phone.length >= 10 && phone.length <= 15) {
                        if (seen.has(phone)) {
                            duplicates++;
                            continue;
                        }
                        seen.add(phone);

                        let name = '';
                        if (nameColIndex !== -1 && row[nameColIndex]) {
                            name = String(row[nameColIndex]).trim();
                        } else if (phoneColIndex !== 0 && row[0]) {
                            name = String(row[0]).trim();
                        }

                        const item: ParsedContact = {
                            telefone: phone,
                            nome: name
                        };

                        rawHeaders.forEach((header, idx) => {
                            if (header && idx !== phoneColIndex) {
                                item[header] = String(row[idx] || '').trim();
                            }
                        });

                        extracted.push(item);
                    }
                }

                setParsedContacts(extracted);
                const otherHeaders = rawHeaders.filter((_, idx) => idx !== phoneColIndex);
                setExcelHeaders(otherHeaders);
                setExcelStats({
                    totalRows: Math.max(0, json.length - startIndex),
                    validCount: extracted.length,
                    duplicateCount: duplicates
                });
                setExcelSample(extracted.slice(0, 5));
                setIsParsingExcel(false);

                // Auto-distribute if only 1 BM exists
                if (extracted.length > 250 && bms.length === 1) {
                    autoPartitionByQuota(250, extracted.length);
                }
            } catch (err: any) {
                console.error('Erro ao ler Excel:', err);
                alert(`Erro ao processar planilha: ${err.message}`);
                setIsParsingExcel(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // --- BM ALLOCATION CALCULATIONS ---
    const getPartitions = () => {
        let currentIdx = 0;
        return bms.map((bm) => {
            const start = currentIdx;
            const count = Math.max(0, Math.min(bm.limit, parsedContacts.length - currentIdx));
            const end = start + count;
            currentIdx = end;
            return {
                bm,
                startIndex: start,
                endIndex: end,
                count,
                contacts: parsedContacts.slice(start, end)
            };
        });
    };

    const partitions = getPartitions();
    const totalAllocated = partitions.reduce((sum, p) => sum + p.count, 0);
    const unallocatedCount = Math.max(0, parsedContacts.length - totalAllocated);

    // Auto Partition by quota (e.g. 250)
    const autoPartitionByQuota = (quota: number = 250, totalLength?: number) => {
        const total = totalLength || parsedContacts.length;
        if (total === 0) return;
        const neededBMs = Math.max(1, Math.ceil(total / quota));

        setBms(prev => {
            const newBms: BMConfig[] = [];
            for (let i = 0; i < neededBMs; i++) {
                const existing = prev[i];
                if (existing) {
                    newBms.push({ ...existing, limit: quota });
                } else {
                    const fallbackSender = prev[0]?.senderNumber || '';
                    newBms.push({
                        id: String(Date.now() + i),
                        label: `BM ${i + 1}`,
                        senderNumber: fallbackSender,
                        credentialType: prev[0]?.credentialType || 'sidao',
                        limit: quota,
                        templateName: prev[0]?.templateName || '',
                        templateLanguage: prev[0]?.templateLanguage || 'pt_BR',
                        templates: prev[0]?.templates || [],
                        headerType: prev[0]?.headerType || 'NONE',
                        mediaUrl: prev[0]?.mediaUrl || ''
                    });
                }
            }
            return newBms;
        });
    };

    // Distribute equally across current BMs
    const distributeEqually = () => {
        if (parsedContacts.length === 0 || bms.length === 0) return;
        const total = parsedContacts.length;
        const base = Math.floor(total / bms.length);
        const remainder = total % bms.length;

        setBms(prev => prev.map((bm, idx) => ({
            ...bm,
            limit: base + (idx < remainder ? 1 : 0)
        })));
    };

    // Bulk paste sender numbers
    const handleApplyBulkSenders = () => {
        const rawNumbers = bulkSendersText
            .split(/[\n,;]+/)
            .map(n => normalizePhone(n))
            .filter(n => n.length >= 10);

        if (rawNumbers.length === 0) {
            alert('Nenhum número válido encontrado no texto colado.');
            return;
        }

        setBms(prev => {
            const newBms: BMConfig[] = [];
            const count = Math.max(prev.length, rawNumbers.length);
            const defaultQuota = prev[0]?.limit || 250;

            for (let i = 0; i < count; i++) {
                const sender = rawNumbers[i] || prev[i]?.senderNumber || '';
                const existing = prev[i];
                if (existing) {
                    newBms.push({ ...existing, senderNumber: sender });
                } else {
                    newBms.push({
                        id: String(Date.now() + i),
                        label: `BM ${i + 1}`,
                        senderNumber: sender,
                        credentialType: prev[0]?.credentialType || 'sidao',
                        limit: defaultQuota,
                        templateName: prev[0]?.templateName || '',
                        templateLanguage: prev[0]?.templateLanguage || 'pt_BR',
                        templates: prev[0]?.templates || [],
                        headerType: 'NONE',
                        mediaUrl: ''
                    });
                }

                // Fetch templates for this new sender
                if (sender) {
                    fetchTemplatesForBM(newBms[i].id, sender, newBms[i].credentialType);
                }
            }
            return newBms;
        });

        setShowPasteModal(false);
        setBulkSendersText('');
    };

    // Replicate BM 1 Template to All
    const replicateTemplateToAll = () => {
        if (bms.length <= 1) return;
        const source = bms[0];
        if (!source.templateName) {
            alert('Selecione um template na BM 1 antes de replicar.');
            return;
        }

        setBms(prev => prev.map((bm, idx) => idx === 0 ? bm : {
            ...bm,
            templateName: source.templateName,
            templateLanguage: source.templateLanguage,
            headerType: source.headerType,
            mediaUrl: source.mediaUrl
        }));

        alert(`Template "${source.templateName}" replicado para todas as BMs!`);
    };

    // Add BM manually
    const addBM = () => {
        const nextNum = bms.length + 1;
        const newBM: BMConfig = {
            id: String(Date.now()),
            label: `BM ${nextNum}`,
            senderNumber: bms[bms.length - 1]?.senderNumber || '',
            credentialType: bms[0]?.credentialType || 'sidao',
            limit: 250,
            templateName: bms[0]?.templateName || '',
            templateLanguage: bms[0]?.templateLanguage || 'pt_BR',
            templates: bms[0]?.templates || [],
            headerType: 'NONE',
            mediaUrl: ''
        };
        setBms(prev => [...prev, newBM]);
    };

    const removeBM = (id: string) => {
        if (bms.length <= 1) {
            alert('Você precisa ter pelo menos 1 BM configurada.');
            return;
        }
        setBms(prev => prev.filter(b => b.id !== id));
    };

    // --- ENQUEUE IN REDIS WORKER ---
    const startMultiBMQueueDispatch = async () => {
        if (parsedContacts.length === 0) {
            alert('Carregue uma planilha com contatos antes de iniciar o disparo.');
            return;
        }

        const activePartitions = partitions.filter(p => p.count > 0);
        if (activePartitions.length === 0) {
            alert('Nenhuma BM possui contatos alocados.');
            return;
        }

        // Validate senders and templates
        for (const p of activePartitions) {
            if (!p.bm.senderNumber || p.bm.senderNumber.length < 8) {
                alert(`A ${p.bm.label} está sem um número remetente oficial válido.`);
                return;
            }
            if (!p.bm.templateName) {
                alert(`Selecione um template aprovado para a ${p.bm.label}.`);
                return;
            }
        }

        const confirmMsg = `Deseja enfileirar ${totalAllocated} mensagens divididas em ${activePartitions.length} BM(s) na Fila Própria do Redis?\n\nO worker enviará número por número de forma contínua e segura (sem broadcast).`;
        if (!window.confirm(confirmMsg)) return;

        setIsEnqueuing(true);
        setEnqueueResult(null);

        // Build all message jobs
        const allMessages: any[] = [];

        activePartitions.forEach(p => {
            const bm = p.bm;
            const bmKey = bm.credentialType === 'luiz' ? LUIS_KEY : defaultApiKey;
            const bmBase = bm.credentialType === 'luiz' ? LUIS_BASE : DEFAULT_BASE;

            p.contacts.forEach(contact => {
                const bodyPlaceholders = placeholderMappings.map(pm => {
                    if (pm.type === 'column') {
                        if (pm.columnName === 'nome') return contact.nome || 'Cliente';
                        if (pm.columnName === 'telefone') return contact.telefone;
                        return contact[pm.columnName] || '';
                    }
                    return pm.fixedValue || '';
                });

                const templateData: any = {};
                if (bodyPlaceholders.length > 0) {
                    templateData.body = { placeholders: bodyPlaceholders };
                }
                if (bm.headerType !== 'NONE' && bm.mediaUrl) {
                    templateData.header = {
                        type: bm.headerType,
                        mediaUrl: bm.mediaUrl
                    };
                }

                allMessages.push({
                    from: bm.senderNumber.trim(),
                    to: contact.telefone.trim(),
                    content: {
                        templateName: bm.templateName,
                        templateData: Object.keys(templateData).length > 0 ? templateData : undefined,
                        language: bm.templateLanguage || 'pt_BR'
                    },
                    _apiKey: bmKey,
                    _baseUrl: bmBase
                });
            });
        });

        // Enqueue in batches of 200 to backend /api/dispatch/queue
        const chunkBatch = 200;
        let sentCount = 0;
        let failError = '';

        setEnqueueProgress({ current: 0, total: allMessages.length });

        for (let i = 0; i < allMessages.length; i += chunkBatch) {
            const chunk = allMessages.slice(i, i + chunkBatch);
            try {
                const res = await fetch('/api/dispatch/queue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: chunk,
                        apiKey: defaultApiKey,
                        baseUrl: DEFAULT_BASE
                    })
                });

                if (res.ok) {
                    sentCount += chunk.length;
                    setEnqueueProgress({ current: sentCount, total: allMessages.length });
                } else {
                    const err = await res.json().catch(() => ({}));
                    failError = err.error || 'Erro ao comunicar com o servidor Redis.';
                    break;
                }
            } catch (netErr: any) {
                failError = `Erro de rede: ${netErr.message}`;
                break;
            }
        }

        setIsEnqueuing(false);

        if (failError) {
            setEnqueueResult({
                success: false,
                message: `Falha parcial ao enfileirar: ${sentCount}/${allMessages.length} enfileirados. ${failError}`
            });
        } else {
            setEnqueueResult({
                success: true,
                message: `🚀 Sucesso! ${sentCount} contatos enfileirados no Redis com sucesso. O worker está disparando número por número!`
            });

            // Log to DB
            dbService.addLog({
                logType: 'DISPATCH',
                author: userName || 'Admin',
                template: 'MULTI_BM_DISPATCH',
                mode: 'MULTI_BM_REDIS',
                total: sentCount,
                success: sentCount
            }).catch(console.error);

            // Enable polling
            setIsPollingRedis(true);
            fetchRedisStatus();
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Top Stats Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(172,248,0,0.06) 0%, rgba(20,20,20,0.6) 100%)',
                border: '1px solid rgba(172,248,0,0.2)',
                borderRadius: '24px',
                padding: '24px 32px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px'
            }}>
                <div className="flex items-center gap-4">
                    <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        background: 'rgba(172,248,0,0.15)',
                        border: '1px solid var(--primary-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-color)'
                    }}>
                        <Cpu size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>Fila Própria Redis · Multi-BM</h2>
                            <span style={{
                                fontSize: '0.65rem',
                                background: 'rgba(172,248,0,0.2)',
                                color: 'var(--primary-color)',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontWeight: 800,
                                textTransform: 'uppercase'
                            }}>
                                Número por Número
                            </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Particione sua planilha de contatos (ex: 2.000 em 8 BMs de 250) e envie sem risco de broadcast.
                        </p>
                    </div>
                </div>

                {/* Live Redis Status Widget */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '12px 20px',
                    borderRadius: '16px',
                    border: '1px solid var(--surface-border-subtle)'
                }}>
                    <div className="flex flex-col">
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Status do Redis</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: redisStatus.isRunning ? '#4ade80' : (redisStatus.queueLength > 0 ? '#eab308' : '#94a3b8'),
                                boxShadow: redisStatus.isRunning ? '0 0 10px #4ade80' : 'none'
                            }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: redisStatus.isRunning ? '#4ade80' : 'var(--text-primary)' }}>
                                {redisStatus.isRunning ? 'Worker Ativo' : (redisStatus.queueLength > 0 ? 'Fila Pendente' : 'Ocioso')}
                            </span>
                        </div>
                    </div>

                    <div style={{ width: '1px', height: '32px', background: 'var(--surface-border-subtle)' }} />

                    <div className="flex flex-col">
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>NA FILA</span>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-color)' }}>{redisStatus.queueLength}</span>
                    </div>

                    <div style={{ width: '1px', height: '32px', background: 'var(--surface-border-subtle)' }} />

                    <div className="flex flex-col">
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>PROCESSADOS</span>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#e2e8f0' }}>{redisStatus.processed}</span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                        <button
                            onClick={fetchRedisStatus}
                            title="Atualizar Status da Fila"
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--surface-border-subtle)',
                                color: 'var(--text-secondary)',
                                padding: '6px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <RefreshCw size={14} />
                        </button>
                        {redisStatus.isRunning && (
                            <button
                                onClick={stopRedisQueue}
                                title="Pausar Worker Redis"
                                style={{
                                    background: 'rgba(239,68,68,0.15)',
                                    border: '1px solid rgba(239,68,68,0.4)',
                                    color: '#f87171',
                                    padding: '6px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <Pause size={14} />
                            </button>
                        )}
                        {(redisStatus.queueLength > 0 || redisStatus.processed > 0) && (
                            <button
                                onClick={clearRedisQueue}
                                title="Limpar Fila Redis"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--surface-border-subtle)',
                                    color: 'var(--text-muted)',
                                    padding: '6px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 1: Spreadsheet Upload */}
            <div className="glass-card p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(172,248,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                            <FileSpreadsheet size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>1. Upload da Planilha de Contatos</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Suporta arquivos .xlsx, .xls ou .csv com qualquer volume (ex: 2.000 contatos)</p>
                        </div>
                    </div>

                    {parsedContacts.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 800 }}>
                                ✓ {parsedContacts.length} contatos prontos
                            </span>
                        </div>
                    )}
                </div>

                <div style={{
                    border: '2px dashed var(--surface-border-subtle)',
                    borderRadius: '16px',
                    padding: '28px',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.01)',
                    position: 'relative'
                }}>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0,
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%'
                        }}
                    />
                    <div className="flex flex-col items-center gap-2">
                        <Upload size={32} color="var(--primary-color)" />
                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                            {fileName ? `Planilha selecionada: ${fileName}` : 'Clique ou arraste a planilha Excel/CSV aqui'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Detecção automática de telefone (com DDD/DDI 55) e colunas de variáveis
                        </span>
                    </div>
                </div>

                {/* Excel Stats Cards */}
                {excelStats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div style={{ background: 'var(--card-bg-subtle)', padding: '16px', borderRadius: '14px', border: '1px solid var(--surface-border-subtle)' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>TOTAL DE LINHAS</span>
                            <h4 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 900 }}>{excelStats.totalRows}</h4>
                        </div>
                        <div style={{ background: 'rgba(74,222,128,0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(74,222,128,0.2)' }}>
                            <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 800 }}>CONTATOS VÁLIDOS ÚNICOS</span>
                            <h4 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 900, color: '#4ade80' }}>{excelStats.validCount}</h4>
                        </div>
                        <div style={{ background: 'var(--card-bg-subtle)', padding: '16px', borderRadius: '14px', border: '1px solid var(--surface-border-subtle)' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>DUPLICADOS IGNORADOS</span>
                            <h4 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-muted)' }}>{excelStats.duplicateCount}</h4>
                        </div>
                    </div>
                )}

                {/* Sample rows preview */}
                {excelSample.length > 0 && (
                    <div style={{
                        background: 'var(--card-bg-subtle)',
                        borderRadius: '14px',
                        padding: '16px',
                        border: '1px solid var(--surface-border-subtle)',
                        overflowX: 'auto'
                    }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                            PRÉ-VISUALIZAÇÃO DOS PRIMEIROS CONTATOS:
                        </span>
                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--surface-border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '6px 12px' }}>#</th>
                                    <th style={{ padding: '6px 12px' }}>Telefone</th>
                                    <th style={{ padding: '6px 12px' }}>Nome</th>
                                    {excelHeaders.slice(0, 3).map(h => (
                                        <th key={h} style={{ padding: '6px 12px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {excelSample.map((c, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                                        <td style={{ padding: '6px 12px', fontWeight: 700, color: 'var(--primary-color)' }}>{c.telefone}</td>
                                        <td style={{ padding: '6px 12px' }}>{c.nome || '-'}</td>
                                        {excelHeaders.slice(0, 3).map(h => (
                                            <td key={h} style={{ padding: '6px 12px', color: 'var(--text-secondary)' }}>{c[h] || '-'}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Step 2: Variables Mapping */}
            <div className="glass-card p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(172,248,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                        <Type size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>2. Mapeamento de Variáveis do Template</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Associe as variáveis como {'{{1}}'}, {'{{2}}'} aos campos da planilha ou a valores fixos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {placeholderMappings.map((pm, idx) => (
                        <div key={pm.id} style={{
                            background: 'var(--card-bg-subtle)',
                            padding: '16px',
                            borderRadius: '14px',
                            border: '1px solid var(--surface-border-subtle)'
                        }} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary-color)' }}>
                                    Variável {'{{'}{pm.id}{'}}'}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const copy = [...placeholderMappings];
                                            copy[idx].type = 'column';
                                            setPlaceholderMappings(copy);
                                        }}
                                        style={{
                                            fontSize: '0.65rem',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: pm.type === 'column' ? 'var(--primary-color)' : 'transparent',
                                            color: pm.type === 'column' ? 'black' : 'var(--text-muted)',
                                            fontWeight: 800,
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Coluna Planilha
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const copy = [...placeholderMappings];
                                            copy[idx].type = 'fixed';
                                            setPlaceholderMappings(copy);
                                        }}
                                        style={{
                                            fontSize: '0.65rem',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: pm.type === 'fixed' ? 'var(--primary-color)' : 'transparent',
                                            color: pm.type === 'fixed' ? 'black' : 'var(--text-muted)',
                                            fontWeight: 800,
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Texto Fixo
                                    </button>
                                </div>
                            </div>

                            {pm.type === 'column' ? (
                                <select
                                    className="input-field"
                                    value={pm.columnName}
                                    onChange={e => {
                                        const copy = [...placeholderMappings];
                                        copy[idx].columnName = e.target.value;
                                        setPlaceholderMappings(copy);
                                    }}
                                    style={{ borderRadius: '10px', height: '40px', fontSize: '0.85rem' }}
                                >
                                    <option value="">Selecione uma coluna...</option>
                                    <option value="nome">Nome do Contato</option>
                                    <option value="telefone">Telefone do Contato</option>
                                    {excelHeaders.map(h => (
                                        <option key={h} value={h}>Coluna: {h}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    className="input-field"
                                    placeholder="Ex: Valor fixo para todos os envios..."
                                    value={pm.fixedValue}
                                    onChange={e => {
                                        const copy = [...placeholderMappings];
                                        copy[idx].fixedValue = e.target.value;
                                        setPlaceholderMappings(copy);
                                    }}
                                    style={{ borderRadius: '10px', height: '40px', fontSize: '0.85rem' }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setPlaceholderMappings(prev => [...prev, { id: prev.length + 1, type: 'column', columnName: '', fixedValue: '' }])}
                        style={{
                            background: 'transparent',
                            border: '1px dashed var(--surface-border-subtle)',
                            color: 'var(--text-secondary)',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        + Adicionar Variável ({'{{'}{placeholderMappings.length + 1}{'}}'})
                    </button>
                    {placeholderMappings.length > 2 && (
                        <button
                            type="button"
                            onClick={() => setPlaceholderMappings(prev => prev.slice(0, -1))}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: '#f87171',
                                borderRadius: '10px',
                                padding: '8px 16px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            Remover Última
                        </button>
                    )}
                </div>
            </div>

            {/* Step 3: Multi-BM Configuration & Partitioning */}
            <div className="glass-card p-6 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(172,248,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>3. Configuração de Múltiplas BMs & Repartição de Cotas</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Defina remetentes, limites (ex: 250 por BM) e o template aprovado específico de cada BM
                            </p>
                        </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => autoPartitionByQuota(250)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', height: '36px', padding: '0 12px' }}
                            title="Divide a lista em blocos de 250 criando as BMs necessárias"
                        >
                            <Sparkles size={14} color="var(--primary-color)" /> Cotas de 250
                        </button>
                        <button
                            type="button"
                            onClick={distributeEqually}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', height: '36px', padding: '0 12px' }}
                            title="Divide a lista igualmente entre as BMs cadastradas"
                        >
                            <Sliders size={14} /> Dividir Igualmente
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPasteModal(true)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', height: '36px', padding: '0 12px' }}
                        >
                            <Copy size={14} /> Colar Remetentes em Massa
                        </button>
                        {bms.length > 1 && (
                            <button
                                type="button"
                                onClick={replicateTemplateToAll}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.75rem', height: '36px', padding: '0 12px', border: '1px solid rgba(172,248,0,0.3)', color: 'var(--primary-color)' }}
                                title="Replicar template selecionado na BM 1 para todas as demais"
                            >
                                Replicar Template 1
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={addBM}
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', height: '36px', padding: '0 14px', color: 'black', fontWeight: 900 }}
                        >
                            <Plus size={14} /> Adicionar BM
                        </button>
                    </div>
                </div>

                {/* Allocation Progress Bar */}
                {parsedContacts.length > 0 && (
                    <div style={{
                        background: 'rgba(0,0,0,0.25)',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: '1px solid var(--surface-border-subtle)'
                    }}>
                        <div className="flex justify-between items-center mb-2">
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                DISTRIBUIÇÃO DA LISTA ({totalAllocated} / {parsedContacts.length} contatos alocados)
                            </span>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 900,
                                color: totalAllocated === parsedContacts.length ? '#4ade80' : (totalAllocated < parsedContacts.length ? '#eab308' : '#f87171')
                            }}>
                                {totalAllocated === parsedContacts.length
                                    ? '100% ALOCADO COM SUCESSO'
                                    : (totalAllocated < parsedContacts.length
                                        ? `RESTAM ${unallocatedCount} CONTATOS SEM BM`
                                        : `EXCESSO DE ${totalAllocated - parsedContacts.length} VAGAS`)}
                            </span>
                        </div>

                        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                            {partitions.map((p, idx) => {
                                const pct = (p.count / parsedContacts.length) * 100;
                                const colors = ['#acf800', '#38bdf8', '#a855f7', '#f43f5e', '#fbbf24', '#34d399', '#f97316', '#06b6d4'];
                                const color = colors[idx % colors.length];
                                return (
                                    <div
                                        key={p.bm.id}
                                        style={{
                                            width: `${pct}%`,
                                            height: '100%',
                                            background: color,
                                            transition: 'width 0.3s'
                                        }}
                                        title={`${p.bm.label}: ${p.count} contatos (${pct.toFixed(1)}%)`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* BM Cards List */}
                <div className="flex flex-col gap-4">
                    {partitions.map((part, index) => {
                        const bm = part.bm;
                        return (
                            <div
                                key={bm.id}
                                style={{
                                    background: 'var(--card-bg-subtle)',
                                    borderRadius: '18px',
                                    border: '1px solid var(--surface-border-subtle)',
                                    padding: '20px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--surface-border-subtle)]">
                                    <div className="flex items-center gap-3">
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 8,
                                            background: 'rgba(172,248,0,0.1)',
                                            color: 'var(--primary-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 900,
                                            fontSize: '0.85rem'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <input
                                            value={bm.label}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setBms(prev => prev.map(b => b.id === bm.id ? { ...b, label: val } : b));
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                fontWeight: 800,
                                                fontSize: '1.05rem',
                                                color: 'var(--text-primary)',
                                                outline: 'none',
                                                width: '180px'
                                            }}
                                        />
                                        <span style={{
                                            fontSize: '0.7rem',
                                            background: part.count > 0 ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                                            color: part.count > 0 ? '#4ade80' : 'var(--text-muted)',
                                            padding: '3px 10px',
                                            borderRadius: '8px',
                                            fontWeight: 800
                                        }}>
                                            {part.count > 0
                                                ? `Contatos #${part.startIndex + 1} a #${part.endIndex} (${part.count} contatos)`
                                                : '0 contatos alocados'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {bms.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeBM(bm.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#f87171',
                                                    cursor: 'pointer',
                                                    padding: '6px',
                                                    borderRadius: '8px'
                                                }}
                                                title="Remover BM"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                    {/* Sender Number */}
                                    <div className="flex flex-col gap-1.5">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                            Remetente Oficial (WABA)
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                className="input-field"
                                                value={bm.senderNumber}
                                                placeholder="Ex: 5511999999999"
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setBms(prev => prev.map(b => b.id === bm.id ? { ...b, senderNumber: val } : b));
                                                }}
                                                onBlur={() => {
                                                    if (bm.senderNumber && bm.senderNumber.length >= 8) {
                                                        fetchTemplatesForBM(bm.id, bm.senderNumber, bm.credentialType);
                                                    }
                                                }}
                                                style={{ borderRadius: '10px', height: '42px', fontSize: '0.85rem', paddingRight: '36px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fetchTemplatesForBM(bm.id, bm.senderNumber, bm.credentialType)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '8px',
                                                    top: '8px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--primary-color)',
                                                    cursor: 'pointer',
                                                    padding: '4px'
                                                }}
                                                title="Recarregar Templates da BM"
                                            >
                                                <RefreshCw size={14} className={bm.isLoadingTemplates ? 'animate-spin' : ''} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Credential Type */}
                                    <div className="flex flex-col gap-1.5">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                            Credencial Infobip
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBms(prev => prev.map(b => b.id === bm.id ? { ...b, credentialType: 'sidao' } : b));
                                                    fetchTemplatesForBM(bm.id, bm.senderNumber, 'sidao');
                                                }}
                                                style={{
                                                    flex: 1,
                                                    height: '42px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    background: bm.credentialType === 'sidao' ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                                                    color: bm.credentialType === 'sidao' ? 'black' : 'white',
                                                    border: '1px solid var(--surface-border-subtle)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Sidão (Padrão)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBms(prev => prev.map(b => b.id === bm.id ? { ...b, credentialType: 'luiz' } : b));
                                                    fetchTemplatesForBM(bm.id, bm.senderNumber, 'luiz');
                                                }}
                                                style={{
                                                    flex: 1,
                                                    height: '42px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    background: bm.credentialType === 'luiz' ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                                                    color: bm.credentialType === 'luiz' ? 'black' : 'white',
                                                    border: '1px solid var(--surface-border-subtle)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Luiz
                                            </button>
                                        </div>
                                    </div>

                                    {/* Approved Template Selection */}
                                    <div className="flex flex-col gap-1.5">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                            Template Aprovado da BM
                                        </label>
                                        <select
                                            className="input-field"
                                            value={bm.templateName}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const found = bm.templates.find(t => t.name === val);
                                                setBms(prev => prev.map(b => b.id === bm.id ? {
                                                    ...b,
                                                    templateName: val,
                                                    templateLanguage: found?.language || 'pt_BR'
                                                } : b));
                                            }}
                                            style={{ borderRadius: '10px', height: '42px', fontSize: '0.85rem' }}
                                        >
                                            {bm.templates.length === 0 ? (
                                                <option value={bm.templateName || ''}>
                                                    {bm.templateName ? bm.templateName : (bm.isLoadingTemplates ? 'Buscando templates...' : 'Nenhum carregado (insira remetente)')}
                                                </option>
                                            ) : (
                                                <>
                                                    <option value="">Selecione o template aprovado...</option>
                                                    {bm.templates.map(t => (
                                                        <option key={t.id || t.name} value={t.name}>
                                                            {t.name} ({t.category || 'MARKETING'})
                                                        </option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    {/* Contact Limit / Quota */}
                                    <div className="flex flex-col gap-1.5">
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                            Cota / Limite de Contatos
                                        </label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={bm.limit}
                                            min={0}
                                            step={50}
                                            onChange={e => {
                                                const val = parseInt(e.target.value) || 0;
                                                setBms(prev => prev.map(b => b.id === bm.id ? { ...b, limit: val } : b));
                                            }}
                                            style={{ borderRadius: '10px', height: '42px', fontSize: '0.9rem', fontWeight: 800 }}
                                        />
                                    </div>
                                </div>

                                {/* Header Media (Optional) */}
                                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)] flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mídia de Cabeçalho:</span>
                                        <select
                                            className="input-field"
                                            value={bm.headerType}
                                            onChange={e => {
                                                const val = e.target.value as any;
                                                setBms(prev => prev.map(b => b.id === bm.id ? { ...b, headerType: val } : b));
                                            }}
                                            style={{ borderRadius: '8px', height: '32px', fontSize: '0.75rem', width: '120px' }}
                                        >
                                            <option value="NONE">Sem Mídia</option>
                                            <option value="IMAGE">Foto (IMAGE)</option>
                                            <option value="VIDEO">Vídeo (VIDEO)</option>
                                        </select>
                                    </div>

                                    {bm.headerType !== 'NONE' && (
                                        <div style={{ flex: 1, minWidth: '220px' }}>
                                            <input
                                                className="input-field"
                                                placeholder="https://sua-vps.com/uploads/foto.jpg"
                                                value={bm.mediaUrl}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setBms(prev => prev.map(b => b.id === bm.id ? { ...b, mediaUrl: val } : b));
                                                }}
                                                style={{ borderRadius: '8px', height: '32px', fontSize: '0.75rem', width: '100%' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step 4: Dispatch Panel & Redis Queue Trigger */}
            <div className="glass-card p-8 flex flex-col gap-6" style={{
                background: 'linear-gradient(180deg, var(--card-bg-subtle) 0%, rgba(20,20,20,0.95) 100%)',
                border: '1px solid rgba(172,248,0,0.3)',
                boxShadow: '0 0 30px rgba(172,248,0,0.05)'
            }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={24} color="var(--primary-color)" />
                            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>
                                Disparo Seguro via Fila Redis
                            </h3>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            O sistema enfileira cada mensagem no Redis e o worker background dispara 1 a 1 com intervalo de 1.5s.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-right">
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>TOTAL A DISPARAR</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                                {totalAllocated} contatos
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress bar during enqueuing */}
                {isEnqueuing && (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span>ENFILEIRANDO MENSAGENS NO REDIS...</span>
                            <span>{enqueueProgress.current} / {enqueueProgress.total}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--surface-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${(enqueueProgress.current / enqueueProgress.total) * 100}%`,
                                height: '100%',
                                background: 'var(--primary-color)',
                                boxShadow: '0 0 10px var(--primary-color)',
                                transition: 'width 0.2s'
                            }} />
                        </div>
                    </div>
                )}

                {/* Feedback result */}
                {enqueueResult && (
                    <div style={{
                        padding: '16px 20px',
                        borderRadius: '14px',
                        background: enqueueResult.success ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${enqueueResult.success ? '#4ade80' : '#f87171'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        {enqueueResult.success ? <CheckCircle size={20} color="#4ade80" /> : <AlertTriangle size={20} color="#f87171" />}
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: enqueueResult.success ? '#4ade80' : '#f87171' }}>
                            {enqueueResult.message}
                        </span>
                    </div>
                )}

                {/* Main Action Button */}
                <button
                    type="button"
                    onClick={startMultiBMQueueDispatch}
                    disabled={isEnqueuing || totalAllocated === 0}
                    className="btn btn-primary"
                    style={{
                        height: '60px',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        opacity: (isEnqueuing || totalAllocated === 0) ? 0.4 : 1,
                        cursor: (isEnqueuing || totalAllocated === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    <Play size={22} fill="black" />
                    {isEnqueuing ? 'ENFILEIRANDO NO REDIS...' : `INICIAR DISPARO NO REDIS (${totalAllocated} CONTATOS)`}
                </button>
            </div>

            {/* Modal: Bulk Paste Senders */}
            {showPasteModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#18181b',
                        border: '1px solid var(--surface-border-subtle)',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '520px',
                        padding: '24px'
                    }} className="flex flex-col gap-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Colar Múltiplos Remetentes</h3>
                            <button
                                type="button"
                                onClick={() => setShowPasteModal(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Cole uma lista de números de WhatsApp (um por linha ou separados por vírgula). O sistema criará ou preencherá as BMs automaticamente.
                        </p>
                        <textarea
                            className="input-field"
                            rows={8}
                            placeholder="5511999999991&#10;5511999999992&#10;5511999999993&#10;5511999999994"
                            value={bulkSendersText}
                            onChange={e => setBulkSendersText(e.target.value)}
                            style={{ fontFamily: 'monospace', fontSize: '0.85rem', padding: '12px', borderRadius: '12px' }}
                        />
                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowPasteModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ color: 'black', fontWeight: 900 }}
                                onClick={handleApplyBulkSenders}
                            >
                                Aplicar Remetentes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
