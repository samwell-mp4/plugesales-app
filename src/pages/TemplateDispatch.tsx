import { useState, useEffect, useRef } from 'react';
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
    Plus,
    User,
    Library,
    Upload,
    Video,
    FileEdit,
    Trash2,
    BookMarked,
    PlayCircle,
    Settings2
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
    const [selectedSenders, setSelectedSenders] = useState<string[]>([]);
    const [availableSenders, setAvailableSenders] = useState<any[]>([]);
    const [isLoadingSenders, setIsLoadingSenders] = useState(false);
    
    // Legacy support for single sender if needed by other components
    const fromNumber = selectedSenders[0] || '';

    // Media Library Integration
    const [hostedFiles, setHostedFiles] = useState<any[]>([]);
    const [showLibrary, setShowLibrary] = useState(false);
    const [isUploadingHeader, setIsUploadingHeader] = useState(false);

    // --- DRAFT SYSTEM ---
    interface Draft {
        id: string;
        label: string;
        templateName: string;
        language: string;
        tag: string;
        toNumber: string;
        contactCount?: number;
        placeholders: PlaceholderField[];
        headerType: 'IMAGE' | 'VIDEO' | 'NONE';
        mediaUrl: string;
        includeButton: boolean;
        buttonType: 'QUICK_REPLY' | 'URL' | null;
        buttonPayload: string;
        savedAt: string;
        editedOnce: boolean;
    }
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
    const [draftEditedOnce, setDraftEditedOnce] = useState(false);
    const autoDispatchTriggered = useRef(false);

    useEffect(() => {
        if (location.state?.key) setApiKey(location.state.key);
        if (location.state?.sender) setSelectedSenders([location.state.sender]);

        // Load settings from DB
        dbService.getSettings().then(settings => {
            if (!location.state?.key && settings['infobip_key']) setApiKey(settings['infobip_key']);
            if (!location.state?.sender && settings['infobip_sender']) {
                setSelectedSenders([settings['infobip_sender']]);
            } else if (location.state?.sender) {
                setSelectedSenders([location.state.sender]);
            }
        });

        // Fetch official senders
        fetchSenders();

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

        // Load saved drafts from DB
        dbService.getPlannerDrafts().then((dbDrafts: any[]) => {
            const mapped = dbDrafts.filter((d: any) => d._draft === true).map((d: any) => ({
                id: d.id || d._db_id || String(Date.now()),
                label: d.label || d.templateName || 'Rascunho',
                templateName: d.templateName || '',
                language: d.language || 'pt_BR',
                tag: d.tag || '',
                toNumber: d.toNumber || '',
                contactCount: d.contactCount || 0,
                placeholders: d.placeholders || [],
                headerType: d.headerType || 'NONE',
                mediaUrl: d.mediaUrl || '',
                includeButton: d.includeButton || false,
                buttonType: d.buttonType || null,
                buttonPayload: d.buttonPayload || '',
                savedAt: d.savedAt || new Date().toISOString(),
                editedOnce: d.editedOnce || false,
            }));
            setDrafts(mapped);
        });
    }, [location.state]);

    const fetchSenders = async () => {
        setIsLoadingSenders(true);
        try {
            const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/1/senders`, {
                headers: { 'Authorization': `App ${apiKey}`, 'Accept': 'application/json' }
            });
            const data = await response.json();
            if (data.senders) {
                setAvailableSenders(data.senders);
                // If no sender selected, pick the first one
                if (selectedSenders.length === 0 && data.senders.length > 0) {
                    setSelectedSenders([data.senders[0].sender]);
                }
            }
        } catch (err) {
            console.error('Error fetching senders:', err);
        } finally {
            setIsLoadingSenders(false);
        }
    };

    useEffect(() => {
        if (location.state?.draft && allTemplates.length > 0 && !autoDispatchTriggered.current) {
            const draft = location.state.draft;
            loadDraft(draft);

            if (location.state.autoSend) {
                autoDispatchTriggered.current = true;
                // Small delay to ensure state and templates are applied
                setTimeout(() => {
                    console.log('🚀 Triggering AUTO-DISPATCH');
                    sendMessage();
                }, 1200);
            }

            // Clear navigation state to prevent re-load on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, allTemplates]);

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

    const generatePayload = (targets: { to: string, from: string }[]) => {

        const payload: any = {
            messages: targets.map(target => {
                const templateData: any = {};

                // Only include body if there are placeholders
                if (placeholders.length > 0) {
                    templateData.body = {
                        placeholders: placeholders.map(p => p.value)
                    };
                }

                // Only include header if needed and media is provided
                if (headerType !== 'NONE' && mediaUrl) {
                    templateData.header = {
                        type: headerType,
                        mediaUrl: mediaUrl
                    };
                }

                // Only include buttons if enabled and type is set
                if (includeButton && buttonType) {
                    templateData.buttons = [
                        {
                            type: buttonType,
                            ...(buttonType === 'QUICK_REPLY' ? { payload: buttonPayload } : { parameter: buttonPayload })
                        }
                    ];
                }

                const msg: any = {
                    from: target.from || fromNumber,
                    to: target.to.trim(),
                    content: {
                        templateName: templateName,
                        templateData: Object.keys(templateData).length > 0 ? templateData : undefined,
                        language: language
                    }
                };

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
            : toNumber.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 5);

        if (targets.length === 0) {
            setSendStats({ success: false, message: 'Nenhum destinatário válido encontrado.' });
            setIsSending(false);
            return;
        }

        if (selectedSenders.length === 0) {
            setSendStats({ success: false, message: 'Nenhum remetente oficial selecionado na Estrutura Básica.' });
            setIsSending(false);
            return;
        }

        const batchSize = 100;
        const total = targets.length;
        setQueueProgress({ current: 0, total });

        let successCount = 0;
        let lastError = '';

        for (let i = 0; i < total; i += batchSize) {
            const batchNumbers = targets.slice(i, i + batchSize);
            
            // Map numbers to senders (Rotation)
            const batchWithSenders = batchNumbers.map((num, idx) => {
                const senderIndex = (i + idx) % selectedSenders.length;
                return { to: num, from: selectedSenders[senderIndex] };
            });

            const payload = generatePayload(batchWithSenders);

            try {
                // ENVIAR PARA FILA REDIS (BACKEND)
                console.log('📤 Queueing batch for backend dispatch...');
                const response = await fetch('/api/dispatch/queue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: payload.messages,
                        apiKey: apiKey
                    })
                });

                if (response.ok) {
                    successCount += batchNumbers.length;
                } else {
                    const err = await response.json();
                    lastError = err.error || 'Erro ao enfileirar no backend.';
                    console.error('❌ Queue Error:', lastError);
                }
            } catch (error: any) {
                console.error('Critical Queueing Error:', error);
                lastError = `Erro crítico de conexão: ${error.message}`;
            }

            const currentProgress = Math.min(i + batchNumbers.length, total);
            setQueueProgress({ current: currentProgress, total });

            // No need for long delays here as the worker handles rate limiting
            if (i + batchSize < total) {
                await new Promise(resolve => setTimeout(resolve, 500));
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


    // --- DRAFT FUNCTIONS ---
    const saveDraft = async (customLabel?: string) => {
        const cCount = isBulkMode ? bulkContacts.length : toNumber.split(',').filter(n => n.trim()).length;
        const label = customLabel || `${templateName} – ${selectedTag || (isBulkMode ? 'Lista' : toNumber.slice(0, 15))}`;
        const draftPayload = {
            _draft: true,
            label,
            templateName,
            language,
            tag: selectedTag,
            toNumber,
            contactCount: cCount,
            placeholders,
            headerType,
            mediaUrl,
            includeButton,
            buttonType,
            buttonPayload,
            savedAt: new Date().toISOString(),
            editedOnce: false,
            author: user?.name || 'Admin',
        };
        await dbService.addPlannerDraft(draftPayload);

        // Optimistically add to local state
        const newDraft: Draft = {
            id: String(Date.now()),
            label,
            templateName,
            language,
            tag: selectedTag,
            toNumber,
            contactCount: cCount,
            placeholders,
            headerType,
            mediaUrl,
            includeButton,
            buttonType,
            buttonPayload,
            savedAt: new Date().toISOString(),
            editedOnce: false,
        };
        setDrafts(prev => [newDraft, ...prev]);
        setSendStats({ success: true, message: `Rascunho "${label}" salvo com sucesso!` });
    };

    const loadDraft = (draft: Draft) => {
        setActiveDraftId(draft.id);
        setTemplateName(draft.templateName);
        setLanguage(draft.language);
        setSelectedTag(draft.tag);
        setToNumber(draft.toNumber);
        setPlaceholders(draft.placeholders);
        setHeaderType(draft.headerType);
        setMediaUrl(draft.mediaUrl);
        setIncludeButton(draft.includeButton);
        setButtonType(draft.buttonType);
        setButtonPayload(draft.buttonPayload);

        // Mark as edited once (enables action buttons)
        const updated = drafts.map(d =>
            d.id === draft.id ? { ...d, editedOnce: true } : d
        );
        setDrafts(updated);
        setDraftEditedOnce(true);

        // Re-select the matching template
        const matchingTemplate = allTemplates.find(t => t.name === draft.templateName);
        if (matchingTemplate) setSelectedTemplate(matchingTemplate);

        // Navigate to step 3 so user can see/edit
        setStep(3);
        setSendStats(null);

        // Load contacts if tag exists
        if (draft.tag) {
            dbService.getContactsByTag(draft.tag).then(contacts => {
                if (contacts) {
                    setBulkContacts(contacts);
                    setIsBulkMode(true);
                    setToNumber(`${contacts.length} contatos da etiqueta ${draft.tag}`);
                }
            });
        }
    };

    const sendDraft = async (draft: Draft) => {
        // Load draft into state first
        loadDraft(draft);
        // Then trigger send after state is applied
        setTimeout(() => sendMessage(), 300);
    };

    const deleteDraft = (draftId: string) => {
        setDrafts(prev => prev.filter(d => d.id !== draftId));
        if (activeDraftId === draftId) {
            setActiveDraftId(null);
            setDraftEditedOnce(false);
        }
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

                .draft-card { background: rgba(255,255,255,0.02); border: 1px solid var(--surface-border); border-radius: 14px; padding: 14px 16px; transition: all 0.2s; cursor: default; }
                .draft-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(172,248,0,0.2); }
                .draft-card.active-draft { border-color: var(--primary-color); background: rgba(172,248,0,0.04); }
                .draft-action-btn { background: transparent; border: none; cursor: pointer; padding: 6px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
                .draft-action-btn:hover { background: rgba(255,255,255,0.05); }

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
                    {/* Step 1: Basic Structure & Template Selection */}
                    {step === 1 && (
                        <div className="glass-card flex-col gap-6 p-8 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <Settings2 size={24} color="var(--primary-color)" />
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Estrutura Básica</h3>
                            </div>

                            <div className="input-group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex flex-col">
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Remetentes Oficiais (Selecione 1 ou mais)</span>
                                        <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>O sistema rotacionará entre os números selecionados</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); fetchSenders(); }}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 800 }}
                                    >
                                        {isLoadingSenders ? <Activity size={12} className="animate-spin" /> : <Plus size={12} />} 
                                        RECARREGAR CANAIS
                                    </button>
                                </div>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                                    gap: '10px',
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(172, 248, 0, 0.1)',
                                    minHeight: '60px'
                                }}>
                                    {availableSenders.length > 0 ? availableSenders.map(s => (
                                        <div 
                                            key={s.sender} 
                                            onClick={() => {
                                                if (selectedSenders.includes(s.sender)) {
                                                    setSelectedSenders(selectedSenders.filter(num => num !== s.sender));
                                                } else {
                                                    setSelectedSenders([...selectedSenders, s.sender]);
                                                }
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '10px',
                                                fontSize: '0.8rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                background: selectedSenders.includes(s.sender) ? 'rgba(172, 248, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${selectedSenders.includes(s.sender) ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}`,
                                                color: selectedSenders.includes(s.sender) ? 'var(--primary-color)' : 'white',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <div style={{
                                                width: '14px', height: '14px',
                                                borderRadius: '4px', border: '1px solid currentColor',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: selectedSenders.includes(s.sender) ? 'currentColor' : 'transparent'
                                            }}>
                                                {selectedSenders.includes(s.sender) && <Check size={10} color="black" strokeWidth={4} />}
                                            </div>
                                            {s.senderName || s.sender}
                                        </div>
                                    )) : !isLoadingSenders ? (
                                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10px', opacity: 0.5, fontSize: '0.75rem' }}>
                                            Nenhum canal encontrado. Verifique sua chave API oficial.
                                        </div>
                                    ) : (
                                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10px', opacity: 0.5, fontSize: '0.75rem' }}>
                                            Buscando canais na Infobip...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Escolha o Template</label>
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
                                    <label>Telefones Destinatários (1 por linha ou separado por vírgula)</label>
                                    <textarea
                                        className="input-field"
                                        style={{ 
                                            borderRadius: '12px', 
                                            background: isBulkMode ? 'rgba(0,0,0,0.1)' : 'transparent',
                                            minHeight: '100px',
                                            padding: '12px',
                                            resize: 'vertical'
                                        }}
                                        value={toNumber}
                                        onChange={e => setToNumber(e.target.value)}
                                        placeholder="Ex:&#10;5511999999999&#10;5511888888888"
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

                            {/* Dispatch Summary - Premium UI */}
                            <div className="mb-8" style={{
                                background: 'linear-gradient(145deg, rgba(172, 248, 0, 0.05) 0%, rgba(0,0,0,0.2) 100%)',
                                borderRadius: '32px',
                                border: '1px solid rgba(172, 248, 0, 0.15)',
                                boxShadow: '0 20px 50px -15px rgba(0,0,0,0.7)',
                                padding: '25px'
                            }}>
                                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2" style={{ color: 'var(--primary-color)', opacity: 0.8 }}>
                                            <User size={14} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>RESPONSÁVEL</span>
                                        </div>
                                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{user?.name || 'Sistema (Admin)'}</span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2" style={{ color: 'var(--primary-color)', opacity: 0.8 }}>
                                            <Smartphone size={14} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>SENDER ATIVO</span>
                                        </div>
                                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{fromNumber}</span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2" style={{ color: 'var(--primary-color)', opacity: 0.8 }}>
                                            <Layers size={14} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>DESTINATÁRIOS</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                                                {isBulkMode ? `${bulkContacts.length} contatos` : `${toNumber.split(',').filter(n => n.trim()).length} número(s)`}
                                            </span>
                                            {selectedTag && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>🏷️ Etiqueta: {selectedTag}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(172, 248, 0, 0.1)' }}>
                                    <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--primary-color)', opacity: 0.8 }}>
                                        <Type size={14} />
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>MAPEAMENTO DE VARIÁVEIS</span>
                                    </div>
                                    <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                                        {placeholders.length > 0 ? placeholders.map(p => (
                                            <div key={p.id} style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '14px 22px',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px'
                                            }}>
                                                <div style={{
                                                    background: 'rgba(172, 248, 0, 0.1)',
                                                    color: 'var(--primary-color)',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 900,
                                                    padding: '2px 6px',
                                                    borderRadius: '6px'
                                                }}>
                                                    {'{'}{p.id}{'}'}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {p.value}
                                                </span>
                                            </div>
                                        )) : (
                                            <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                                Template estático sem variáveis dinâmicas.
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                <button
                                    className="btn btn-secondary flex-1"
                                    style={{ border: '1px solid rgba(172,248,0,0.4)', color: 'var(--primary-color)' }}
                                    onClick={() => saveDraft()}
                                >
                                    <BookMarked size={16} /> SALVAR RASCUNHO
                                </button>
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
                            {JSON.stringify(generatePayload([{ to: toNumber.split(',')[0] || '5511999999999', from: selectedSenders[0] || 'SENDER_ID' }]), null, 2)}
                        </pre>
                    </div>

                    {/* Draft Panel */}
                    {drafts.length > 0 && (
                        <div className="animate-fade-in" style={{ marginTop: '24px', borderTop: '1px solid #222d34', paddingTop: '20px' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <BookMarked size={16} color="var(--primary-color)" />
                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'white' }}>Rascunhos Salvos</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(172,248,0,0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>{drafts.length} rascunho(s)</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                {drafts.map(draft => {
                                    const isActive = activeDraftId === draft.id;
                                    const canSendEdit = isActive && draftEditedOnce;
                                    return (
                                        <div key={draft.id} className={`draft-card ${isActive ? 'active-draft' : ''}`}>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{draft.label}</span>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                        {new Date(draft.savedAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        {draft.tag && <> · <span style={{ color: 'var(--primary-color)' }}>{draft.tag}</span></>}
                                                        {draft.contactCount ? <> · <span style={{ fontWeight: 800 }}>({draft.contactCount} contatos)</span></> : ''}
                                                    </span>
                                                    {draft.placeholders && draft.placeholders.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {draft.placeholders.map(p => (
                                                                <span key={p.id} style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '2px 5px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                    {'{'}{p.id}{'}'}: {p.value.length > 15 ? p.value.slice(0, 12) + '...' : p.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button className="draft-action-btn" style={{ color: '#f87171' }} onClick={() => deleteDraft(draft.id)} title="Excluir rascunho">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>

                                            {/* Action buttons - always Edit, Send only after edited once */}
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    className="draft-action-btn"
                                                    style={{ color: 'var(--primary-color)', border: '1px solid rgba(172,248,0,0.25)', borderRadius: '8px', flex: 1, justifyContent: 'center' }}
                                                    onClick={() => loadDraft(draft)}
                                                >
                                                    <FileEdit size={13} /> Editar Rascunho
                                                </button>

                                                {canSendEdit && (
                                                    <button
                                                        className="draft-action-btn"
                                                        style={{ color: 'black', background: 'var(--primary-color)', borderRadius: '8px', flex: 1, justifyContent: 'center', fontWeight: 900 }}
                                                        onClick={() => sendDraft(draft)}
                                                    >
                                                        <PlayCircle size={13} /> Enviar Rascunho
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateDispatch;
