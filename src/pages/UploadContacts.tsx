import React, { useState, useEffect } from 'react';
import {
    FileSpreadsheet,
    Trash2,
    Search,
    Activity,
    Database,
    Download,
    Settings2,
    CheckCircle,
    UploadCloud
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { dbService } from '../services/dbService';

const UploadContacts = () => {
    const [file, setFile] = useState<File | null>(null);
    const [baseTag, setBaseTag] = useState('');
    const [batchSize, setBatchSize] = useState(5000);
    const [isProcessing, setIsProcessing] = useState(false);

    // Advanced Filters
    const [removeDuplicates] = useState(true);
    const [discardNoName] = useState(false);
    const [mapExtraInfo] = useState(false);
    const [smartSplit] = useState(false);

    const [results, setResults] = useState<{ tag: string, count: number }[]>([]);
    const [processedData, setProcessedData] = useState<any[]>([]);
    const [totalContacts, setTotalContacts] = useState(0);
    const [duplicateCount, setDuplicateCount] = useState(0);
    const [invalidCount, setInvalidCount] = useState(0);
    const [validatorNumber, setValidatorNumber] = useState('');
    const [uploadHistory, setUploadHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Results Pagination
    const [currentResultsPage, setCurrentResultsPage] = useState(1);
    const resultsPerPage = 5;

    // History Filters & Pagination
    const [filterTag, setFilterTag] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        dbService.getUploadHistory().then(history => {
            setUploadHistory(history);
            setIsLoadingHistory(false);
        });
    }, []);

    const normalizePhone = (input: string) => {
        // 1. Remove non-digits
        let cleaned = input.replace(/\D/g, '');

        // 1b. Remove leading zero if present (common in manually typed DDDs)
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        // 2. Add 55 if missing (assuming Brazil if 10 or 11 digits)
        if (cleaned.length === 10 || cleaned.length === 11) {
            cleaned = '55' + cleaned;
        }

        // 3. Handle missing 9th digit for 12-digit numbers starting with 55 (55 + 2 DD + 8 digits)
        if (cleaned.length === 12 && cleaned.startsWith('55')) {
            cleaned = cleaned.slice(0, 4) + '9' + cleaned.slice(4);
        }

        return cleaned;
    };

    const smartParseRow = (input: string) => {
        if (!input || !input.trim()) return null;

        // Split by all common delimiters at once
        const parts = input.split(/[;,|\t]/).map(p => p.trim()).filter(p => p.length > 0);

        let phone = '';
        let name = '';
        let cpf = '';
        let email = '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cpfRegex = /([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})/;
        const remainingParts: string[] = [];

        parts.forEach(part => {
            const cleanPart = part.trim();
            if (!cleanPart) return;

            // 1. Check for Email
            if (emailRegex.test(cleanPart)) {
                email = cleanPart;
                return;
            }

            // 2. Check for CPF
            const cpfMatch = cleanPart.match(cpfRegex);
            if (cleanPart.toUpperCase().includes('CPF:') || (cpfMatch && !normalizePhone(cleanPart).startsWith('55') && cleanPart.length <= 15)) {
                cpf = cleanPart.replace(/CPF:/i, '').replace(/[^\d.-]/g, '').trim();
                return;
            }

            // 3. Check for Phone
            const normalized = normalizePhone(cleanPart);
            if (normalized.length === 13 && !phone) {
                phone = normalized;
                return;
            }

            remainingParts.push(cleanPart);
        });

        if (remainingParts.length > 0) {
            // Heuristic scoring to select the best "Name" candidate
            const scoredParts = remainingParts.map(part => {
                let score = 0;
                // Clean quotes and trim
                const clean = part.replace(/^["']|["']$/g, '').trim();
                
                if (!clean) return { part: '', score: -1000 };

                // 1. Heavy penalties for obviously non-name characters
                if (clean.includes(':')) score -= 60; // Labels, timestamps or status
                if (clean.includes('/')) score -= 50; // Dates
                if (/\d{4,}/.test(clean)) score -= 40; // Long number sequences (like IDs or CPFs)
                if (/\d/.test(clean)) score -= 15; // Any digit is slightly suspicious for a real name

                // 2. Penalty for all-caps (often system messages, statuses or technical IDs)
                if (clean.length > 8 && clean === clean.toUpperCase()) score -= 20;

                // 3. Penalty for very short or very long strings
                if (clean.length < 3) score -= 30;
                if (clean.length > 50) score -= 25;

                // 4. Bonus for Proper Case (Typical for names like "Joaquim Silva")
                const words = clean.split(/\s+/).filter(w => w.length > 0);
                const isProperCase = words.length > 0 && words.every(w => {
                    if (w.length <= 2) return true; // Ignore small particles like "da", "dos", "de"
                    const firstChar = w[0];
                    const isCapitalized = firstChar === firstChar.toUpperCase();
                    const isRestLower = w.slice(1) === w.slice(1).toLowerCase();
                    return isCapitalized && isRestLower;
                });
                if (isProperCase) score += 45;

                // 5. Bonus for typical number of words in a name (2 to 4)
                if (words.length >= 2 && words.length <= 4) score += 30;

                // 6. Tie-breaker: slight bonus for length if it's otherwise a good candidate
                score += (clean.length * 0.1);

                return { part: clean, score };
            });

            // Pick the best score
            const best = scoredParts.sort((a, b) => b.score - a.score)[0];
            name = best ? best.part : '';
        }

        return { telefone: phone, nome: name, cpf, email };
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const processFile = async () => {
        if (!file) {
            alert("Por favor, insira a sua planilha ou arquivo TXT primeiro!");
            return;
        }
        if (!baseTag) {
            alert("Por favor, digite uma 'Etiqueta Base' para identificar o lote!");
            return;
        }

        setIsProcessing(true);
        setDuplicateCount(0);
        setInvalidCount(0);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                let extractedContacts: any[] = [];
                const fileName = file.name.toLowerCase();

                if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
                    const textData = new TextDecoder("utf-8").decode(e.target?.result as ArrayBuffer);
                    const lines = textData.split(/\r?\n/).filter(line => line.trim().length > 0);

                    console.log('Processing TXT/CSV, total lines:', lines.length);

                    extractedContacts = lines.map((line) => {
                        if (smartSplit) {
                            const parsed = smartParseRow(line);
                            return parsed;
                        } else {
                            const separator = line.includes(';') ? ';' : ',';
                            const parts = line.split(separator);
                            return { 
                                telefone: normalizePhone(parts[0] || ''), 
                                nome: (parts[1] || '').trim() 
                            };
                        }
                    }).filter(c => c && c.telefone && c.telefone.length === 13);
                    
                    setInvalidCount(lines.length - extractedContacts.length);
                }
                else {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    await new Promise(resolve => setTimeout(resolve, 50));
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    const startIndex = (json[0] && typeof json[0][0] === 'string' && isNaN(Number(json[0][0]))) ? 1 : 0;

                    console.log('Excel/XLSX Rows:', json.length, 'startIndex:', startIndex);

                    // Auto-detect phone column (0 to 5)
                    let phoneColIndex = 0;
                    if (json.length > startIndex) {
                        const firstDataRow = json[startIndex];
                        for (let col = 0; col < Math.min(firstDataRow.length, 6); col++) {
                            const raw = String(firstDataRow[col] || '');
                            if (normalizePhone(raw).length === 13) {
                                phoneColIndex = col;
                                break;
                            }
                            if (smartSplit) {
                                const parsed = smartParseRow(raw);
                                if (parsed && parsed.telefone?.length === 13) {
                                    phoneColIndex = col;
                                    break;
                                }
                            }
                        }
                    }

                    for (let i = startIndex; i < json.length; i++) {
                        const row = json[i];
                        if (row && row.length > 0) {
                            const rawCell = String(row[phoneColIndex] || '');
                            let contact: any = null;

                            if (smartSplit) {
                                const parsed = smartParseRow(rawCell);
                                if (parsed && parsed.telefone?.length === 13) {
                                    contact = parsed;
                                }
                            }

                            if (!contact) {
                                const phone = normalizePhone(rawCell);
                                if (phone.length === 13) {
                                    contact = {
                                        telefone: phone,
                                        nome: String(row[phoneColIndex === 0 ? 1 : 0] || '').trim()
                                    };
                                    if (mapExtraInfo) {
                                        contact.cpf = String(row[2] || '');
                                        contact.email = String(row[3] || '');
                                    }
                                }
                            }

                            if (contact) {
                                extractedContacts.push(contact);
                            }
                        }
                    }
                    
                    setInvalidCount((json.length - startIndex) - extractedContacts.length);
                }

                let filtered = [...extractedContacts];
                if (removeDuplicates) {
                    const seen = new Set();
                    const beforeDedup = filtered.length;
                    filtered = filtered.filter(item => {
                        const duplicate = seen.has(item.telefone);
                        seen.add(item.telefone);
                        return !duplicate;
                    });
                    setDuplicateCount(beforeDedup - filtered.length);
                }
                if (discardNoName) {
                    filtered = filtered.filter(item => item.nome.length > 0);
                }

                const total = filtered.length;
                if (total === 0) {
                    alert("Nenhum número válido encontrado.");
                    setIsProcessing(false);
                    return;
                }

                setTotalContacts(total);

                const formattedList = filtered.map((item, index) => {
                    const batchNumber = Math.floor(index / batchSize) + 1;
                    return {
                        info_2: item.nome || '',
                        Número: item.telefone,
                        Etiquetas: `${baseTag}_${batchNumber}`,
                        info_3: item.cpf || '',
                        'E-mail': item.email || ''
                    };
                });

                setProcessedData(formattedList);

                // Save contacts data to DB
                await dbService.saveContacts(baseTag, filtered, total, validatorNumber || 'N/A', 'Admin');

                // Save upload history entry to DB
                const newHistoryItem = await dbService.addUploadHistory({
                    tag: baseTag,
                    count: total,
                    validator: validatorNumber || 'N/A',
                    creator: 'Admin',
                    status: 'CONCLUÍDO'
                });
                if (newHistoryItem) {
                    setUploadHistory(prev => [newHistoryItem, ...prev]);
                }

                const batchCount = Math.ceil(total / batchSize);
                const resultsList: { tag: string, count: number }[] = [];
                for (let i = 0; i < batchCount; i++) {
                    const count = (i === batchCount - 1) ? total % batchSize || batchSize : batchSize;
                    resultsList.push({ tag: `${baseTag}_${i + 1}`, count });
                }

                setTimeout(() => {
                    setResults(resultsList);
                    setCurrentResultsPage(1); // Reset to first page
                    setIsProcessing(false);
                }, 400);

            } catch (error) {
                console.error(error);
                alert("Erro ao processar o arquivo.");
                setIsProcessing(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const exportCSVs = () => {
        if (processedData.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Contatos");
        XLSX.writeFile(workbook, `${baseTag}_unificado.csv`, { bookType: 'csv' });
    };

    const handleDeleteHistory = async (id: number, tag: string) => {
        if (!window.confirm("Deseja realmente excluir este registro de histórico?")) return;

        setUploadHistory(prev => prev.filter(h => h.id !== id));
        await dbService.deleteUploadHistory(id);
        await dbService.deleteContacts(tag);
    };

    const handleDownloadHistory = async (tag: string) => {
        const contacts = await dbService.getContactsByTag(tag);
        if (!contacts) return alert("Dados da lista não encontrados para download.");

        const exportData = contacts.map((c: any) => ({
            info_2: c.nome || '',
            Número: c.telefone,
            Etiquetas: `${tag}_CONSOLIDADO`,
            info_3: c.cpf || '',
            'E-mail': c.email || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Contatos_Export");
        XLSX.writeFile(workbook, `${tag}_reexport.csv`, { bookType: 'csv' });
    };

    const filteredHistory = Array.isArray(uploadHistory) ? uploadHistory.filter(item => {
        const matchesTag = (item.tag || '').toLowerCase().includes((filterTag || '').toLowerCase());
        const matchesDate = (item.date || '').includes(filterDate || '');
        return matchesTag && matchesDate;
    }) : [];

    const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    return (
        <div className="animate-fade-in upload-page" style={{ paddingBottom: '80px' }}>
            <style>{`
                .upload-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; align-items: start; }
                .history-container { 
                    border-radius: 20px; 
                    background: rgba(15, 23, 42, 0.4); 
                    border: 1px solid rgba(255,255,255,0.05);
                    overflow: hidden;
                    margin-top: 24px;
                    margin-bottom: 32px;
                }
                .history-table { width: 100%; border-collapse: collapse; }
                .history-table th { padding: 20px; background: rgba(0,0,0,0.2); color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; text-align: left; }
                .history-table td { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem; }
                
                .upload-zone {
                    border: 1px dashed rgba(255,255,255,0.1);
                    border-radius: 18px;
                    padding: 20px;
                    text-align: center;
                    background: rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    max-width: 320px;
                }
                .upload-zone:hover { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.04); }
                
                .upload-action-row {
                    display: flex;
                    align-items: flex-end;
                    gap: 20px;
                    margin-top: 10px;
                }
                
                .input-field {
                    border-radius: 16px !important;
                    background: rgba(0, 0, 0, 0.3) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    transition: all 0.2s ease;
                }
                .input-field:focus {
                    border-color: var(--primary-color) !important;
                    box-shadow: 0 0 0 4px rgba(172, 248, 0, 0.1) !important;
                    background: rgba(0, 0, 0, 0.4) !important;
                }
                
                .btn-sm-custom {
                    padding: 10px 20px !important;
                    font-size: 0.85rem !important;
                    border-radius: 14px !important;
                }

                @media (max-width: 1100px) {
                    .upload-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .history-header { flex-direction: column; align-items: flex-start !important; gap: 16px; }
                    .history-filters { width: 100%; flex-direction: column; }
                    .history-filters input { width: 100% !important; }
                    .config-row { flex-direction: column; }
                    .checkbox-group { border-left: none !important; padding-left: 0 !important; margin-top: 16px; border-top: 1px solid var(--surface-border); padding-top: 16px; }
                    .upload-action-row { flex-direction: column; }
                    .upload-action-row button { width: 100%; }
                }


                .badge-premium { padding: 4px 10px; font-size: 0.65rem; font-weight: 800; border-radius: 8px; }
                .btn-p-control {
                    background: transparent;
                    border: none;
                    color: var(--primary-color);
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    transition: all 0.2s;
                }
                .btn-p-control:hover:not(:disabled) {
                    opacity: 0.7;
                    transform: translateX(2px);
                }
            `}</style>

            <div className="flex flex-col mb-2">
                <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', letterSpacing: '-1px' }}>Check-in de Listas</h1>
                <p className="subtitle">Mantenha sua audiência unificada e formatada para disparos inteligentes</p>
            </div>

            <div className="upload-grid mt-8">
                {/* Main Config & Dropzone */}
                <div className="glass-card flex-col gap-8" style={{ padding: '32px', borderRadius: '24px' }}>
                    <div className="flex items-center gap-3">
                        <Settings2 size={24} color="var(--primary-color)" />
                        <h3 style={{ margin: 0, fontWeight: 800 }}>Mapeamento & Filtros</h3>
                    </div>

                    <div className="flex gap-10 config-row" style={{ marginBottom: '10px' }}>
                        <div className="flex-col gap-4" style={{ flex: 1 }}>
                            <div className="input-group">
                                <label style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Etiqueta Principal *</label>
                                <input
                                    className="input-field"
                                    style={{ borderRadius: '12px', padding: '14px' }}
                                    placeholder="Ex: clientes_marco"
                                    value={baseTag}
                                    onChange={e => setBaseTag(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7 }}>Batch Size</label>
                                    <input type="number" className="input-field" style={{ padding: '12px' }} value={batchSize} onChange={e => setBatchSize(Number(e.target.value))} />
                                </div>
                                <div className="input-group" style={{ flex: 2 }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7 }}>Número de Teste</label>
                                    <input className="input-field" style={{ padding: '12px' }} placeholder="5511..." value={validatorNumber} onChange={e => setValidatorNumber(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-col gap-5 checkbox-group" style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '32px', display: 'none' }}>
                        </div>
                    </div>

                    <div className="upload-action-row">
                        <div
                            className={`upload-zone ${file ? 'active' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('fileUpload')?.click()}
                        >
                            <input type="file" id="fileUpload" style={{ display: 'none' }} accept=".xlsx,.xls,.csv,.txt" onChange={handleFileSelect} />
                            <div className="flex items-center gap-3">
                                <div style={{ background: file ? 'rgba(172, 248, 0, 0.1)' : 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '12px' }}>
                                    <FileSpreadsheet size={20} color={file ? 'var(--primary-color)' : 'var(--text-muted)'} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{file ? file.name : 'Selecione a Lista'}</h4>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Excel, CSV ou TXT</p>
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-sm-custom"
                            style={{ height: '56px', flex: 1, fontWeight: 900, color: 'black' }}
                            onClick={processFile}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Activity className="animate-spin" /> : 'PROCESSAR AGORA'}
                        </button>
                    </div>
                </div>

                {/* Status Column */}
                <div className="flex-col gap-6">
                    {results.length > 0 ? (
                        <div className="glass-card animate-fade-in" style={{ padding: '32px', borderRadius: '24px', borderLeft: '6px solid var(--primary-color)' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <CheckCircle size={32} color="var(--primary-color)" />
                                <h3 style={{ margin: 0, fontWeight: 900 }}>Pronto!</h3>
                            </div>

                                <div className="flex flex-col gap-4">
                                    <div className="p-5" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Contatos Processados</span>
                                        <div className="flex items-baseline gap-4">
                                            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{totalContacts.toLocaleString()}</span>
                                            <div className="flex flex-col">
                                                {duplicateCount > 0 && <span style={{ fontSize: '0.65rem', color: '#fca5a5' }}>-{duplicateCount} Duplicados</span>}
                                                {invalidCount > 0 && <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>-{invalidCount} Inválidos</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {results.slice((currentResultsPage - 1) * resultsPerPage, currentResultsPage * resultsPerPage).map((r, i) => (
                                        <div key={i} className="flex justify-between items-center p-4" style={{ background: 'rgba(172, 248, 0, 0.03)', border: '1px solid rgba(172, 248, 0, 0.1)', borderRadius: '14px' }}>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>{r.tag}</span>
                                            <span className="badge-premium" style={{ background: 'var(--primary-color)', color: 'black' }}>{r.count}</span>
                                        </div>
                                    ))}

                                    {results.length > resultsPerPage && (
                                        <div className="flex items-center justify-between mt-2 px-2">
                                            <button 
                                                className="btn-p-control" 
                                                disabled={currentResultsPage === 1} 
                                                onClick={() => setCurrentResultsPage(v => v - 1)}
                                                style={{ opacity: currentResultsPage === 1 ? 0.3 : 1, cursor: currentResultsPage === 1 ? 'default' : 'pointer', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.7rem' }}
                                            >
                                                ← Anterior
                                            </button>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                                {currentResultsPage} / {Math.ceil(results.length / resultsPerPage)}
                                            </span>
                                            <button 
                                                className="btn-p-control" 
                                                disabled={currentResultsPage === Math.ceil(results.length / resultsPerPage)} 
                                                onClick={() => setCurrentResultsPage(v => v + 1)}
                                                style={{ opacity: currentResultsPage === Math.ceil(results.length / resultsPerPage) ? 0.3 : 1, cursor: currentResultsPage === Math.ceil(results.length / resultsPerPage) ? 'default' : 'pointer', color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.7rem' }}
                                            >
                                                Próxima →
                                            </button>
                                        </div>
                                    )}
                                </div>

                            <div className="flex flex-col gap-3 mt-8">
                                <button className="btn btn-secondary w-full btn-sm-custom" onClick={exportCSVs}>EXPORTAR CSV</button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card flex-col items-center justify-center p-10" style={{ minHeight: '340px', borderRadius: '24px', border: '1px dashed var(--surface-border)', background: 'transparent' }}>
                            <UploadCloud size={64} color="var(--surface-border)" opacity={0.3} style={{ marginBottom: '20px' }} />
                            <h3 style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Sem arquivo</h3>
                            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Carregue uma lista para ver as estatísticas de processamento</p>
                        </div>
                    )}
                </div>
            </div>

            {/* History Table */}
            <div className="history-container shadow-glass animate-fade-in mt-12">
                <div className="flex items-center justify-between p-5 history-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3">
                        <Database size={24} color="var(--primary-color)" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Histórico de Uploads</h3>
                    </div>
                    <div className="flex gap-4 history-filters">
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input
                                className="input-field"
                                style={{ width: '220px', padding: '10px 12px 10px 36px', fontSize: '0.85rem', borderRadius: '12px' }}
                                placeholder="Filtrar etiqueta..."
                                value={filterTag}
                                onChange={e => { setFilterTag(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <input
                            type="date"
                            className="input-field"
                            style={{ width: '160px', padding: '10px 12px', fontSize: '0.85rem', borderRadius: '12px' }}
                            value={filterDate}
                            onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Etiqueta Base</th>
                                <th>Volume</th>
                                <th>Validador</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingHistory ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Carregando histórico...</td></tr>
                            ) : paginatedHistory.length > 0 ? paginatedHistory.map(item => (
                                <tr key={item.id} className="hover-row">
                                    <td style={{ color: 'var(--text-secondary)' }}>{item.created_at ? new Date(item.created_at).toLocaleString('pt-BR') : item.date}</td>
                                    <td style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{item.tag}</td>
                                    <td style={{ fontWeight: 700 }}>{item.count} Lds</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.validator}</td>
                                    <td>
                                        <span className="badge-premium" style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(172, 248, 0, 0.2)' }}>{item.status}</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '6px', minWidth: '34px', borderRadius: '8px' }}
                                                onClick={() => handleDownloadHistory(item.tag)}
                                                title="Baixar Lista"
                                            >
                                                <Download size={14} />
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '6px', minWidth: '34px', borderRadius: '8px', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }}
                                                onClick={() => handleDeleteHistory(item.id, item.tag)}
                                                title="Excluir Registro"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                        Nenhuma lista processada encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-6 p-6" style={{ background: 'rgba(0,0,0,0.1)' }}>
                        <button className="btn btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)} style={{ padding: '8px 20px', borderRadius: '10px' }}>Anterior</button>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{currentPage} / {totalPages}</span>
                        <button className="btn btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(v => v + 1)} style={{ padding: '8px 20px', borderRadius: '10px' }}>Próxima</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadContacts;
