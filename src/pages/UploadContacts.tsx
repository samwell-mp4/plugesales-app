import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileSpreadsheet,
    Trash2,
    Search,
    Activity,
    Database,
    Download,
    Settings2,
    CheckCircle,
    UploadCloud,
    Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { dbService } from '../services/dbService';

const UploadContacts = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [baseTag, setBaseTag] = useState('');
    const [batchSize, setBatchSize] = useState(5000);
    const [isProcessing, setIsProcessing] = useState(false);

    // Advanced Filters
    const [removeDuplicates, setRemoveDuplicates] = useState(true);
    const [discardNoName, setDiscardNoName] = useState(false);
    const [mapExtraInfo, setMapExtraInfo] = useState(false);
    const [smartSplit, setSmartSplit] = useState(true);

    const [results, setResults] = useState<{ tag: string, count: number }[]>([]);
    const [processedData, setProcessedData] = useState<any[]>([]);
    const [totalContacts, setTotalContacts] = useState(0);
    const [validatorNumber, setValidatorNumber] = useState('');
    const [uploadHistory, setUploadHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // History Filters & Pagination
    const [filterTag, setFilterTag] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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

        // Try delimiters: ;, |, Tab, and finally Comma
        // We avoid splitting by comma immediately if it's potentially part of a name, 
        // unless it's clearly a CSV-style line.
        const delimiters = [';', '|', '\t'];
        let parts: string[] = [input];

        let foundDelimiter = false;
        for (const d of delimiters) {
            if (input.includes(d)) {
                parts = input.split(d).map(p => p.trim()).filter(p => p.length > 0);
                foundDelimiter = true;
                break;
            }
        }

        // If no primary delimiter, try comma but only if it results in something that looks like 
        // multiple fields (at least one part being numeric or email)
        if (!foundDelimiter && input.includes(',')) {
            const commaParts = input.split(',').map(p => p.trim());
            if (commaParts.length > 1) {
                parts = commaParts;
            }
        }

        let phone = '';
        let name = '';
        let cpf = '';
        let email = '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cpfRegex = /(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/;
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
            // Pick longest remaining part as name
            name = remainingParts.sort((a, b) => b.length - a.length)[0];
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
                }
                else {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    await new Promise(resolve => setTimeout(resolve, 50));
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    const startIndex = (json[0] && typeof json[0][0] === 'string' && isNaN(Number(json[0][0]))) ? 1 : 0;

                    console.log('Excel/XLSX Rows:', json.length, 'startIndex:', startIndex);

                    // Auto-detect phone column (0 to 3)
                    let phoneColIndex = 0;
                    if (json.length > startIndex) {
                        const firstDataRow = json[startIndex];
                        for (let col = 0; col < Math.min(firstDataRow.length, 5); col++) {
                            const val = normalizePhone(String(firstDataRow[col] || ''));
                            if (val.length === 13) {
                                phoneColIndex = col;
                                console.log('Auto-detected phone column:', col, 'Value:', val);
                                break;
                            }
                        }
                    }

                    for (let i = startIndex; i < json.length; i++) {
                        const row = json[i];
                        if (row && row.length > 0) {
                            const rawPhone = String(row[phoneColIndex] || '');
                            const phone = normalizePhone(rawPhone);

                            if (i < startIndex + 5) {
                                console.log(`Excel Row ${i}: col${phoneColIndex}="${rawPhone}" normalized="${phone}" len=${phone.length}`);
                            }

                            if (phone.length === 13) {
                                let contact: any = {
                                    telefone: phone,
                                    nome: String(row[phoneColIndex === 0 ? 1 : 0] || '').trim()
                                };

                                // If smartSplit is on and only one real column has data, try splitting it
                                if (smartSplit && row.filter((c:any) => String(c||'').trim()).length === 1) {
                                    const parsed = smartParseRow(String(row[phoneColIndex] || ''));
                                    if (parsed) contact = parsed;
                                } else if (mapExtraInfo) {
                                    contact.cpf = String(row[2] || '');
                                    contact.email = String(row[3] || '');
                                }

                                extractedContacts.push(contact);
                            }
                        }
                    }
                }

                let filtered = [...extractedContacts];
                if (removeDuplicates) {
                    const seen = new Set();
                    filtered = filtered.filter(item => {
                        const duplicate = seen.has(item.telefone);
                        seen.add(item.telefone);
                        return !duplicate;
                    });
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
                        Nome: item.nome || '',
                        Telefone: item.telefone,
                        Etiqueta: `${baseTag}_${batchNumber}`,
                        CPF: item.cpf || '',
                        Email: item.email || ''
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

                const finalResult = [{ tag: `${baseTag}_CONSOLIDADO`, count: total }];
                setTimeout(() => {
                    setResults(finalResult);
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
            Nome: c.nome || '',
            Telefone: c.telefone,
            Etiqueta: `${tag}_CONSOLIDADO`,
            CPF: c.cpf || '',
            Email: c.email || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Contatos_Export");
        XLSX.writeFile(workbook, `${tag}_reexport.csv`, { bookType: 'csv' });
    };

    const filteredHistory = uploadHistory.filter(item => {
        const matchesTag = (item.tag || '').toLowerCase().includes((filterTag || '').toLowerCase());
        const matchesDate = (item.date || '').includes(filterDate || '');
        return matchesTag && matchesDate;
    });

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
            `}</style>

            <div className="flex flex-col mb-2">
                <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', letterSpacing: '-1px' }}>Check-in de Listas</h1>
                <p className="subtitle">Mantenha sua audiência unificada e formatada para disparos inteligentes</p>
            </div>

            {/* History Table */}
            <div className="history-container shadow-glass animate-fade-in">
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

                        <div className="flex-col gap-5 checkbox-group" style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '32px' }}>
                            <label className="flex items-center gap-4 cursor-pointer group hover-opacity" style={{ transition: 'opacity 0.2s' }}>
                                <div className="flex items-center justify-center" onClick={() => setRemoveDuplicates(!removeDuplicates)} style={{ width: 22, height: 22, borderRadius: 8, border: '2px solid var(--primary-color)', background: removeDuplicates ? 'var(--primary-color)' : 'transparent', transition: 'all 0.2s' }}>
                                    {removeDuplicates && <Check size={14} color="black" strokeWidth={4} />}
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Remover duplicatas</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer group hover-opacity" style={{ transition: 'opacity 0.2s' }}>
                                <div className="flex items-center justify-center" onClick={() => setDiscardNoName(!discardNoName)} style={{ width: 22, height: 22, borderRadius: 8, border: '2px solid rgba(255,255,255,0.1)', background: discardNoName ? 'var(--primary-color)' : 'transparent', transition: 'all 0.2s' }}>
                                    {discardNoName && <Check size={14} color="black" strokeWidth={4} />}
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Exigir nome do lead</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer group hover-opacity" style={{ transition: 'opacity 0.2s' }}>
                                <div className="flex items-center justify-center" onClick={() => setMapExtraInfo(!mapExtraInfo)} style={{ width: 22, height: 22, borderRadius: 8, border: '2px solid rgba(255,255,255,0.1)', background: mapExtraInfo ? 'var(--primary-color)' : 'transparent', transition: 'all 0.2s' }}>
                                    {mapExtraInfo && <Check size={14} color="black" strokeWidth={4} />}
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Capturar CPF/Email</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer group hover-opacity" style={{ transition: 'opacity 0.2s' }}>
                                <div className="flex items-center justify-center" onClick={() => setSmartSplit(!smartSplit)} style={{ width: 22, height: 22, borderRadius: 8, border: '2px solid rgba(172, 248, 0, 0.4)', background: smartSplit ? 'var(--primary-color)' : 'transparent', transition: 'all 0.2s' }}>
                                    {smartSplit && <Check size={14} color="black" strokeWidth={4} />}
                                </div>
                                <div className="flex flex-col">
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Smart Split (Separar Colunas)</span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Detecta Nome, CPF e Email na mesma linha</span>
                                </div>
                            </label>
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
                                    <span style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{totalContacts.toLocaleString()}</span>
                                </div>

                                {results.map((r, i) => (
                                    <div key={i} className="flex justify-between items-center p-4" style={{ background: 'rgba(172, 248, 0, 0.03)', border: '1px solid rgba(172, 248, 0, 0.1)', borderRadius: '14px' }}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>{r.tag}</span>
                                        <span className="badge-premium" style={{ background: 'var(--primary-color)', color: 'black' }}>{r.count}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 mt-8">
                                <button className="btn btn-primary w-full btn-sm-custom" style={{ fontWeight: 800 }} onClick={() => navigate('/campaigns')}>PLANEJAR DISPARO</button>
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
        </div>
    );
};

export default UploadContacts;
