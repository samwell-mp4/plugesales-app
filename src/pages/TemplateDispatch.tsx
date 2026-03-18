import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import {
    Send,
    Smartphone,
    Type,
    Link,
    Image as ImageIcon,
    CheckCircle,
    AlertTriangle,
    Layers,
    Activity,
    Check,
    User,
    Library,
    Upload,
    Video
} from 'lucide-react';

interface PlaceholderField {
    id: number;
    value: string;
}

interface InfobipTemplate {
    id: string;
    name: string;
    category: string;
    language: string;
    status: string;
    components?: any[];
    structure?: any;
}

const TemplateDispatch = () => {
    const location = useLocation();
    const { user } = useAuth();
    const passedTemplate = location.state?.template as InfobipTemplate;

    // Multi-Template Support (Selector)
    const [allTemplates, setAllTemplates] = useState<InfobipTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<InfobipTemplate | null>(passedTemplate || null);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [selectedTag, setSelectedTag] = useState('');

    // Message Params
    const [toNumber, setToNumber] = useState('5511999999999');
    const [templateName, setTemplateName] = useState('');
    const [language, setLanguage] = useState('pt_BR');

    // Queue & Bulk logic
    const [queueProgress, setQueueProgress] = useState({ current: 0, total: 0 });
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkContacts, setBulkContacts] = useState<any[]>([]);

    // Content Params
    const [headerType, setHeaderType] = useState<'IMAGE' | 'VIDEO' | 'NONE'>('NONE');
    const [mediaUrl, setMediaUrl] = useState('');

    // Body Placeholders
    const [placeholders, setPlaceholders] = useState<PlaceholderField[]>([]);

    // Button Params
    const [includeButton, setIncludeButton] = useState(false);
    const [buttonType, setButtonType] = useState<'QUICK_REPLY' | 'URL' | null>(null);
    const [buttonPayload, setButtonPayload] = useState('PAYLOAD_USER_123');

    // UI Status
    const [step, setStep] = useState(1);
    const [isSending, setIsSending] = useState(false);
    const [sendStats, setSendStats] = useState<{ success: boolean; message: string } | null>(null);

    // Dynamic Config Sync - loaded from DB on mount
    const [apiKey, setApiKey] = useState(() => location.state?.key || '5b90ba4e71d2c00cdb1784f476b59c1e-a0338025-abdc-46e6-8b90-0b2b2d62d5c8');
    const [fromNumber, setFromNumber] = useState(() => location.state?.sender || '5511997625247');

    // Media Library Integration
    const [hostedFiles, setHostedFiles] = useState<any[]>([]);
    const [showLibrary, setShowLibrary] = useState(false);
    const [isUploadingHeader, setIsUploadingHeader] = useState(false);

    useEffect(() => {
        if (location.state?.key) setApiKey(location.state.key);
        if (location.state?.sender) setFromNumber(location.state.sender);
        
        // Load settings from DB
        dbService.getSettings().then(settings => {
            if (!location.state?.key && settings['infobip_key']) setApiKey(settings['infobip_key']);
            if (!location.state?.sender && settings['infobip_sender']) setFromNumber(settings['infobip_sender']);
        });

        // Load hosted media from DB
        dbService.getMedia().then(media => {
            setHostedFiles(media.map((m: any) => ({
                id: m.id,
                name: m.name,
                type: m.type,
                shortUrl: m.short_url,
                originalName: m.name,
            })));
        });
    }, [location.state]);

    useEffect(() => {
        // Fetch all templates if none passed
        const fetchTemplates = async () => {
            try {
                const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/2/senders/${fromNumber}/templates`, {
                    headers: { 'Authorization': `App ${apiKey}` }
                });
                const data = await response.json();
                let fetchedTemplates = data.templates || [];
                
                // Filtrar apenas os aprovados e ordenar (criados primeiro = cronológico)
                const approvedTemplates = fetchedTemplates
                    .filter((t: any) => t.status === 'APPROVED')
                    .sort((a: any, b: any) => a.id.localeCompare(b.id));

                setAllTemplates(approvedTemplates);
            } catch (error) {
                console.error('Error fetching templates:', error);
            }
        };

        const loadTags = async () => {
            const contacts = await dbService.getContacts();
            const tags = contacts.map((c: any) => c.tag);
            setAvailableTags([...new Set(tags)] as string[]);
        };

        fetchTemplates();
        loadTags();

        if (passedTemplate) {
            autoConfigureTemplate(passedTemplate);
        }
    }, [passedTemplate]);

    const autoConfigureTemplate = (template: InfobipTemplate) => {
        setTemplateName(template.name);
        setLanguage(template.language);

        // Standardize components access
        let bodyText = '';
        let headerFormat = 'NONE';
        let bodyExamples: string[] = [];

        if (template.structure) {
            bodyText = template.structure.body?.text || '';
            headerFormat = template.structure.header?.format || 'NONE';
            bodyExamples = template.structure.body?.example?.text || template.structure.body?.examples || [];
        } else if (template.components) {
            const bodyComp = template.components.find((c: any) => c.type === 'BODY');
            const headerComp = template.components.find((c: any) => c.type === 'HEADER');

            bodyText = bodyComp?.text || '';
            headerFormat = headerComp?.format || 'NONE';
            bodyExamples = bodyComp?.example?.text || bodyComp?.examples || [];
        }

        // Detect Placeholders
        if (bodyText) {
            const matches = bodyText.match(/\{\{\d+\}\}/g);
            if (matches) {
                const uniqueIds = Array.from(new Set(matches.map(m => parseInt(m.match(/\d+/)![0]))));
                setPlaceholders(uniqueIds.sort((a, b) => a - b).map((id, idx) => ({
                    id: id,
                    value: bodyExamples[idx] || `Valor ${id}`
                })));
            } else {
                setPlaceholders([]);
            }
        } else {
            setPlaceholders([]);
        }

        // Detect Header Example URL (Supports string or {url: string})
        const headerExampleData = template.structure?.header?.example ||
            template.components?.find((c: any) => c.type === 'HEADER')?.example;

        const headerExample = typeof headerExampleData === 'string'
            ? headerExampleData
            : (headerExampleData?.url || '');

        setMediaUrl(headerExample);

        // Detect Buttons
        const comps = template.components || template.structure?.components || [];
        const buttonComp = comps.find((c: any) => c.components?.some((sc: any) => sc.type === 'BUTTONS')) || comps.find((c: any) => c.type === 'BUTTONS');
        const urlButton = buttonComp?.buttons?.find((b: any) => b.type === 'URL') ||
            template.structure?.buttons?.find((b: any) => b.type === 'URL');
        const quickReplyButtons = (buttonComp?.buttons || template.structure?.buttons || []).filter((b: any) => b.type === 'QUICK_REPLY');

        if (urlButton) {
            setButtonType('URL');
            setIncludeButton(false);
            const isDynamicUrl = urlButton.url?.includes('{{');
            setButtonPayload(isDynamicUrl ? (urlButton.example || 'https://google.com') : (urlButton.url || 'https://google.com'));
        } else if (quickReplyButtons.length > 0) {
            setButtonType('QUICK_REPLY');
            setIncludeButton(false);
            setButtonPayload('YES_INTERESTED');
        } else {
            setButtonType(null);
            setIncludeButton(false);
        }

        setHeaderType(headerFormat as any);
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const t = allTemplates.find(tpl => tpl.name === e.target.value);
        if (t) {
            setSelectedTemplate(t);
            autoConfigureTemplate(t);
        }
    };

    const sendToWebhook = async (payload: any) => {
        console.log('Enviando para Controle de Disparo:', payload);
        try {
            const response = await fetch("https://db-n8n.msely6.easypanel.host/webhook-test/dispacht-control", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log('Resposta Webhook Controle:', response.status);
        } catch (err) {
            console.error('Erro de Rede no Webhook Controle:', err);
        }
    };

    const handleTagChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tag = e.target.value;
        setSelectedTag(tag);
        if (tag) {
            const contacts = await dbService.getContactsByTag(tag);
            if (contacts) {
                setBulkContacts(contacts);
                setIsBulkMode(true);
                setToNumber(`${contacts.length} contatos da etiqueta ${tag}`);
            }
        } else {
            setIsBulkMode(false);
            setBulkContacts([]);
            setToNumber('');
        }
    };

    const generatePayload = (targetTo: string | string[]) => {
        const targets = Array.isArray(targetTo) ? targetTo : [targetTo];

        const payload: any = {
            messages: targets.map(target => {
                const msg: any = {
                    from: fromNumber,
                    to: target.trim(),
                    content: {
                        templateName: templateName,
                        templateData: {
                            body: {
                                placeholders: placeholders.map(p => p.value)
                            }
                        },
                        language: language
                    }
                };

                if (headerType !== 'NONE' && mediaUrl) {
                    msg.content.templateData.header = {
                        type: headerType,
                        mediaUrl: mediaUrl
                    };
                }

                if (includeButton) {


                    if (includeButton && buttonType) {
                        msg.content.templateData.buttons = [
                            {
                                type: buttonType,
                                ...(buttonType === 'QUICK_REPLY' ? { payload: buttonPayload } : { parameter: buttonPayload })
                            }
                        ];
                    }
                }

                return msg;
            })
        };

        return payload;
    };

    const sendMessage = async () => {
        setIsSending(true);
        setSendStats(null);

        const targets = isBulkMode
            ? bulkContacts.map(c => c.telefone)
            : toNumber.split(',').map(n => n.trim()).filter(n => n.length > 5);

        const batchSize = 100;
        const total = targets.length;
        setQueueProgress({ current: 0, total });

        let successCount = 0;
        let lastError = '';

        for (let i = 0; i < total; i += batchSize) {
            const batch = targets.slice(i, i + batchSize);
            const payload = generatePayload(batch);

            // CONFIGURAÇÃO TEMPORÁRIA: Mude para 'true' para voltar a enviar direto pela Infobip
            const USE_INFOBIP_DIRECT = true;

            try {
                if (USE_INFOBIP_DIRECT) {
                    const response = await fetch('https://8k6xv1.api-us.infobip.com/whatsapp/1/message/template', {
                        method: 'POST',
                        headers: {
                            'Authorization': `App ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        successCount += batch.length;
                        await sendToWebhook(payload);
                    } else {
                        const err = await response.json();
                        console.error('Infobip Dispatch Error:', err);
                        lastError = err.requestError?.serviceException?.text ||
                            err.errorMessage ||
                            JSON.stringify(err);
                    }
                } else {
                    // MODO WEBHOOK APENAS: Envia apenas para o n8n
                    await sendToWebhook(payload);
                    successCount += batch.length; // Simula sucesso para o progresso da UI
                }
            } catch (error: any) {
                console.error('Critical Dispatch Error:', error);
                lastError = `Erro crítico: ${error.message}`;
            }

            const currentProgress = Math.min(i + batch.length, total);
            setQueueProgress({ current: currentProgress, total });

            // Delay between batches: 10-15 seconds
            if (i + batchSize < total) {
                const delay = Math.floor(Math.random() * 5000) + 10000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        if (successCount === total) {
            setSendStats({ success: true, message: `${successCount} mensagem(ns) disparada(s) com sucesso!` });

            // Track in DB
            await dbService.addLog({
                logType: 'DISPATCH',
                author: user?.name,
                template: templateName,
                mode: isBulkMode ? 'BULK' : 'SINGLE',
                total: total,
                success: successCount,
            });
        } else {
            setSendStats({ success: false, message: `Sucesso em ${successCount}/${total}. Último erro: ${lastError}` });
        }

        setIsSending(false);
    };

    const addToPlanner = async () => {
        const stepData = {
            wabaId: fromNumber,
            listTag: selectedTag || 'Manual/Individual',
            templateName: templateName,
            templateInstance: templateName,
            delay: 5,
            language: language,
            headerType: headerType,
            mediaUrl: mediaUrl,
            placeholders: placeholders,
            includeButton: includeButton,
            buttonType: buttonType,
            buttonPayload: buttonPayload
        };

        await dbService.addPlannerDraft(stepData);

        // Send to Webhook
        sendToWebhook({ type: 'PLANNER_SAVE', ...stepData });

        setSendStats({ success: true, message: 'Configuração enviada para o Planner com sucesso!' });
    };

    const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingHeader(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Falha no upload para VPS.');

            const result = await response.json();
            let finalUrl = result.url;
            if (finalUrl && !finalUrl.startsWith('http')) {
                finalUrl = window.location.origin + (finalUrl.startsWith('/') ? '' : '/') + finalUrl;
            }

            if (finalUrl) {
                setMediaUrl(finalUrl);
                // The media is already saved to DB by the upload endpoint
                // Refresh local media list
                dbService.getMedia().then(media => {
                    setHostedFiles(media.map((m: any) => ({
                        id: m.id,
                        name: m.name,
                        type: m.type,
                        shortUrl: m.short_url,
                        originalName: m.name,
                    })));
                });
            }
        } catch (error: any) {
            console.error('Header Upload Error:', error);
            alert('Erro ao subir arquivo para VPS');
        } finally {
            setIsUploadingHeader(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            <style>{`
                .dispatch-container { display: grid; grid-template-columns: 1fr 420px; gap: 32px; align-items: start; }
                .preview-whatsapp { background: #0b141a; border-radius: 24px; padding: 24px; position: sticky; top: 20px; box-shadow: 0 20px 50px -15px rgba(0,0,0,0.5); border: 1px solid #222d34; }
                .chat-bubble { background: #202c33; color: #e9edef; padding: 12px; border-radius: 0 12px 12px 12px; max-width: 90%; font-size: 0.9rem; position: relative; margin-top: 8px; }
                .chat-header { font-size: 0.75rem; color: #8696a0; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
                .json-preview { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; font-family: monospace; font-size: 0.7rem; color: #4ade80; border: 1px solid rgba(172, 248, 0, 0.1); margin-top: 16px; overflow-x: auto; }
                
                .step-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--surface-border); transition: all 0.3s; }
                .step-dot.active { background: var(--primary-color); box-shadow: 0 0 10px var(--primary-color); }

                @media (max-width: 1000px) {
                    .dispatch-container { grid-template-columns: 1fr; }
                    .preview-whatsapp { position: static; }
                    .header-flex { flex-direction: column; align-items: flex-start !important; }
                }
            `}</style>

            <div className="flex items-center justify-between mb-8 header-flex">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-1.5px', margin: 0 }}>Template Dispatch</h1>
                    <p className="subtitle">Simulador e disparador de alta precisão para Templates Aprovados</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <Smartphone size={16} color="var(--primary-color)" />
                            <input 
                                style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 800, fontSize: '0.9rem', outline: 'none', textAlign: 'right', width: '130px' }}
                                value={fromNumber}
                                onChange={e => setFromNumber(e.target.value)}
                            />
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.5px' }}>SENDER ATIVO</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}></div>
                        ))}
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, marginLeft: '10px' }}>PASSO {step} DE 3</span>
                    </div>
                </div>
            </div>

            <div className="dispatch-container">
                {/* Configuration side */}
                <div className="flex-col gap-6">
                    {/* Step 1: Template Selection */}
                    {step === 1 && (
                        <div className="glass-card flex-col gap-6 p-8 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <Layers size={24} color="var(--primary-color)" />
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Seleção de Modelo</h3>
                            </div>

                            <div className="input-group">
                                <label>Escolha um Template</label>
                                <select className="input-field" style={{ padding: '14px', borderRadius: '12px' }} value={templateName} onChange={handleTemplateChange}>
                                    <option value="">Selecione na sua biblioteca Infobip...</option>
                                    {allTemplates.map(t => (
                                        <option key={t.id} value={t.name}>{t.name} ({t.category})</option>
                                    ))}
                                </select>
                            </div>

                            {selectedTemplate && (
                                <div className="p-5" style={{
                                    background: selectedTemplate.status === 'APPROVED' ? 'rgba(172, 248, 0, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                    borderRadius: '16px',
                                    border: `1px solid ${selectedTemplate.status === 'APPROVED' ? 'rgba(172, 248, 0, 0.1)' : 'rgba(239, 68, 68, 0.2)'}`
                                }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {selectedTemplate.status === 'APPROVED' ? <Check size={14} color="var(--primary-color)" /> : <AlertTriangle size={14} color="#f87171" />}
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            color: selectedTemplate.status === 'APPROVED' ? 'var(--primary-color)' : '#f87171'
                                        }}>
                                            Status: {selectedTemplate.status}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                        {selectedTemplate.status === 'APPROVED'
                                            ? `O modelo "${selectedTemplate.name}" está pronto para disparo.`
                                            : `Atenção: Este modelo está ${selectedTemplate.status} e não poderá ser enviado até ser aprovado pela Meta.`}
                                    </p>
                                </div>
                            )}

                            <button
                                className="btn btn-primary mt-4"
                                style={{ color: 'black', fontWeight: 800 }}
                                onClick={() => templateName && setStep(2)}
                                disabled={!selectedTemplate || selectedTemplate.status !== 'APPROVED'}
                            >
                                {selectedTemplate?.status === 'APPROVED' ? 'PROSSEGUIR CONFIGURAÇÃO' : 'TEMPLATE NÃO DISPONÍVEL'}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Target & Variable Mapping */}
                    {step === 2 && (
                        <div className="glass-card flex-col gap-6 p-8 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <Smartphone size={24} color="var(--primary-color)" />
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Destinatário & Variáveis</h3>
                            </div>

                            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="input-group">
                                    <label>Telefone(s) Mobiles (Separe por vírgula)</label>
                                    <input
                                        className="input-field"
                                        style={{ borderRadius: '12px', background: isBulkMode ? 'rgba(0,0,0,0.1)' : 'transparent' }}
                                        value={toNumber}
                                        onChange={e => setToNumber(e.target.value)}
                                        placeholder="Ex: 5511..., 5511..."
                                        readOnly={isBulkMode}
                                    />
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {isBulkMode ? `${bulkContacts.length} números carregados do lote` : `${toNumber.split(',').filter(n => n.trim()).length} número(s) detectado(s)`}
                                    </p>
                                </div>
                                <div className="input-group">
                                    <label>Ou escolha um Lote</label>
                                    <select className="input-field" style={{ borderRadius: '12px' }} value={selectedTag} onChange={handleTagChange}>
                                        <option value="">Nenhum (Envio Individual)</option>
                                        {availableTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                                    </select>
                                </div>
                            </div>

                            {placeholders.length > 0 ? (
                                <div className="flex-col gap-4 mt-4">
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mapeamento de Variáveis Body</h4>
                                    <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                        {placeholders.map((p, idx) => (
                                            <div key={p.id} className="input-group">
                                                <label className="flex items-center gap-2"><Type size={12} /> Variável {'{{'}{p.id}{'}}'}</label>
                                                <input className="input-field" style={{ borderRadius: '12px' }} value={p.value} onChange={e => {
                                                    const newP = [...placeholders];
                                                    newP[idx].value = e.target.value;
                                                    setPlaceholders(newP);
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : selectedTemplate && (
                                <div className="p-8 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--surface-border)' }}>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Este template não possui variáveis variáveis no corpo da mensagem.</p>
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                <button className="btn btn-secondary flex-1" onClick={() => setStep(1)}>VOLTAR</button>
                                <button className="btn btn-primary flex-1" style={{ color: 'black', fontWeight: 800 }} onClick={() => setStep(3)}>REVISAR DISPARO</button>
                            </div>
                        </div>
                    )}

                     {/* Step 3: Media & Sending */}
                    {step === 3 && (
                        <div className="glass-card flex-col gap-6 p-8 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <Send size={24} color="var(--primary-color)" />
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Revisão & Mídia</h3>
                            </div>

                             {headerType !== 'NONE' && (
                                <div className="input-group">
                                    <div className="flex items-center justify-between mb-2">
                                        <label style={{ margin: 0 }}>URL do Cabeçalho ({headerType})</label>
                                        <div className="flex gap-2">
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ padding: '4px 10px', fontSize: '0.65rem', height: '28px', border: '1px solid rgba(172, 248, 0, 0.3)' }}
                                                onClick={() => setShowLibrary(!showLibrary)}
                                            >
                                                <Library size={12} /> {showLibrary ? 'FECHAR BIBLIOTECA' : 'MINHA BIBLIOTECA'}
                                            </button>
                                            <label 
                                                className="btn btn-secondary" 
                                                style={{ padding: '4px 10px', fontSize: '0.65rem', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                <input type="file" style={{ display: 'none' }} onChange={handleHeaderUpload} accept={headerType === 'VIDEO' ? 'video/*' : 'image/*'} />
                                                {isUploadingHeader ? <Activity size={12} className="animate-spin" /> : <Upload size={12} />} UPLOAD VPS
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {showLibrary && (
                                        <div className="library-picker animate-fade-in p-4 mb-4" style={{ 
                                            background: 'rgba(0,0,0,0.2)', 
                                            borderRadius: '12px', 
                                            maxHeight: '200px', 
                                            overflowY: 'auto',
                                            border: '1px solid var(--surface-border)'
                                        }}>
                                            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                                                {hostedFiles.filter(f => headerType === 'VIDEO' ? f.type === 'video' : f.type === 'image').map(file => (
                                                    <div 
                                                        key={file.id} 
                                                        onClick={() => { setMediaUrl(file.shortUrl); setShowLibrary(false); }}
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            borderRadius: '8px', 
                                                            overflow: 'hidden', 
                                                            border: mediaUrl === file.shortUrl ? '2px solid var(--primary-color)' : '1px solid transparent',
                                                            aspectRatio: '1',
                                                            background: '#000',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        {file.type === 'video' ? (
                                                            <div className="flex items-center justify-center h-full"><Video size={20} /></div>
                                                        ) : (
                                                            <img src={file.shortUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={file.name} />
                                                        )}
                                                    </div>
                                                ))}
                                                {hostedFiles.length === 0 && <p style={{ gridColumn: '1/-1', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Nenhuma mídia encontrada na biblioteca.</p>}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ position: 'relative' }}>
                                        <ImageIcon size={18} style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.5 }} />
                                        <input
                                            className="input-field"
                                            style={{ paddingLeft: '44px', borderRadius: '12px' }}
                                            placeholder="https://sua-vps.com/uploads/foto.jpg"
                                            value={mediaUrl}
                                            onChange={e => setMediaUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Payload Button Hidden due to bugs (User request) */}
                            {false && (
                                <div className="input-group">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="flex items-center justify-center" onClick={() => setIncludeButton(!includeButton)} style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid var(--primary-color)', background: includeButton ? 'var(--primary-color)' : 'transparent', transition: 'all 0.2s' }}>
                                            {includeButton && <Check size={14} color="black" strokeWidth={4} />}
                                        </div>
                                        <span style={{ fontWeight: 700 }}>Incluir Payload de Botão</span>
                                    </label>
                                    {includeButton && (
                                        <div className="flex gap-2 items-center mt-2">
                                            <select
                                                className="input-field"
                                                style={{ borderRadius: '12px', background: 'rgba(0,0,0,0.1)', fontSize: '0.8rem', flex: 1, height: '42px' }}
                                                value={buttonType || 'QUICK_REPLY'}
                                                onChange={e => setButtonType(e.target.value as any)}
                                            >
                                                <option value="QUICK_REPLY">Tipo: Resposta</option>
                                                <option value="URL">Tipo: Link (URL)</option>
                                            </select>
                                            <input className="input-field" style={{ borderRadius: '12px', flex: 2, height: '42px' }} value={buttonPayload} onChange={e => setButtonPayload(e.target.value)} placeholder={buttonType === 'URL' ? 'https://link-final.com' : 'Sua resposta aqui...'} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {isSending && queueProgress.total > 0 && (
                                <div className="flex-col gap-2 mt-4">
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span>PROGRESSO DO DISPARO EM MASSA</span>
                                        <span>{queueProgress.current} / {queueProgress.total}</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${(queueProgress.current / queueProgress.total) * 100}%`,
                                            height: '100%',
                                            background: 'var(--primary-color)',
                                            boxShadow: '0 0 10px var(--primary-color)',
                                            transition: 'width 0.5s ease'
                                        }}></div>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {queueProgress.current < queueProgress.total ? 'Aguardando intervalo seguro para próximo lote (10-15s)...' : 'Finalizando processamento...'}
                                    </p>
                                </div>
                            )}

                            {sendStats && (
                                <div className={`p-5 animate-fade-in`} style={{
                                    background: sendStats.success ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: '16px', border: `1px solid ${sendStats.success ? '#4ade80' : '#f87171'}`
                                }}>
                                    <div className="flex items-center gap-3">
                                        {sendStats.success ? <CheckCircle size={20} color="#4ade80" /> : <AlertTriangle size={20} color="#f87171" />}
                                        <span style={{ color: sendStats.success ? '#4ade80' : '#f87171', fontWeight: 800 }}>{sendStats.message}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                <button className="btn btn-secondary flex-1" onClick={() => setStep(2)}>VOLTAR</button>
                                <button className="btn btn-secondary flex-1" style={{ border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }} onClick={addToPlanner}>SALVAR NO PLANNER</button>
                                <button
                                    className="btn btn-primary flex-2"
                                    style={{ color: 'black', fontWeight: 900, fontSize: '1.2rem' }}
                                    onClick={sendMessage}
                                    disabled={isSending}
                                >
                                    {isSending ? <Activity className="animate-spin" /> : 'CONVOCAR DISPARO'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Side */}
                <div className="preview-whatsapp animate-fade-in">
                    <div className="flex items-center gap-3 mb-6" style={{ borderBottom: '1px solid #222d34', paddingBottom: '16px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#acf800', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                            <User size={24} />
                        </div>
                        <div className="flex-col">
                            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Plug & Sales Agent</span>
                            <span style={{ color: '#8696a0', fontSize: '0.7rem' }}>disparando como {fromNumber}</span>
                        </div>
                    </div>

                    <div className="chat-header">
                        <Smartphone size={12} /> Pré-visualização Mobile (Simulada)
                    </div>

                    <div className="chat-bubble flex-col">
                        {headerType !== 'NONE' && mediaUrl && (
                            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' }}>
                                <img src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Header Preview" />
                            </div>
                        )}
                        <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {(() => {
                                const comps = selectedTemplate?.components || selectedTemplate?.structure?.components || [];
                                const structBody = selectedTemplate?.structure?.body?.text;
                                const compBody = comps.find((c: any) => c.type === 'BODY')?.text;
                                const text = structBody || compBody || 'Conteúdo do template não disponível';

                                return text.replace(/\{\{(\d+)\}\}/g, (match: string, p1: string) => {
                                    const placeholder = placeholders.find(p => p.id === parseInt(p1));
                                    return placeholder ? placeholder.value : match;
                                });
                            })()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8696a0', marginTop: '6px', textAlign: 'right' }}>
                            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    {includeButton && (
                        <div className="flex flex-col gap-2 mt-2 w-full">
                            <div style={{ background: '#202c33', color: '#00a884', padding: '10px', borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #222d34' }}>
                                {(() => {
                                    const comps = selectedTemplate?.components || selectedTemplate?.structure?.components || [];
                                    const btnComp = comps.find((c: any) => c.type === 'BUTTONS')?.buttons?.[0]?.text;
                                    const btnStruct = selectedTemplate?.structure?.buttons?.[0]?.text;
                                    return btnComp || btnStruct || 'Ação do Usuário';
                                })()}
                            </div>
                        </div>
                    )}

                    <div className="json-preview">
                        <div className="flex items-center gap-2 mb-2" style={{ borderBottom: '1px solid rgba(172, 248, 0, 0.2)', paddingBottom: '4px' }}>
                            <Link size={12} />
                            <span>API_PAYLOAD_DEBUG</span>
                        </div>
                        <pre style={{ margin: 0 }}>
                            {JSON.stringify(generatePayload(toNumber.split(',')[0]), null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateDispatch;
